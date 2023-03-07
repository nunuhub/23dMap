import { Vector as VectorLayer } from 'ol/layer';
import axios from '../../../../utils/request';
import { registerProj } from '../../../CustomProjection';
import { transformExtent } from 'ol/proj';
import LayerGroup from 'ol/layer/Group';
import EsriJSON from 'ol/format/EsriJSON';
import { Vector as VectorSource } from 'ol/source';
import $ from 'jquery';
import { getLabelStyle } from './labelStyleUtils';
import LayerManager from '../../../LayerManager';
import DynamicLayer from '../DynamicLayer';
import { addParamToUrl } from '../../../../utils/uitls';

class LabelLayer {
  constructor(map) {
    this.map = map;
    this.proxy = '/gisqBI/api/gis/proxy?';
  }

  generate(data) {
    const self = this;
    if (data.isProxy) {
      this.proxy = data.proxyPath ? data.proxyPath : '/gisqBI/api/gis/proxy?';
    } else {
      this.proxy = '';
    }
    return new Promise((resolve, reject) => {
      let requestUrl =
        (process.env.NODE_ENV === 'development' ? '' : this.proxy) + data.url;
      requestUrl = addParamToUrl(requestUrl, 'f', 'json');
      if (data.authkey) {
        requestUrl += '&authkey=' + data.authkey;
      }
      axios
        .get(requestUrl)
        .then((response) => {
          response = response.headers ? response.data : response;
          let json = '';
          if ((typeof response).toLowerCase() === 'string') {
            try {
              json = JSON.parse(response);
            } catch (e) {
              reject(new Error('当前用户没权限,请联系管理员'));
              return;
            }
          } else {
            json = response;
          }
          const initExtent = [];
          let projCode = '';
          if (json.fullExtent.spatialReference.wkt) {
            projCode = json.fullExtent.spatialReference.wkt;
            registerProj(projCode, [
              json.fullExtent.xmin,
              json.fullExtent.ymin,
              json.fullExtent.xmax,
              json.fullExtent.ymax
            ]);
          } else {
            projCode = 'EPSG:' + json.fullExtent.spatialReference.wkid;
            registerProj(projCode);
          }
          if (json.fullExtent.xmin !== 'NaN') {
            initExtent.push(
              json.fullExtent.xmin,
              json.fullExtent.ymin,
              json.fullExtent.xmax,
              json.fullExtent.ymax
            );
          } else {
            initExtent.push(
              json.initialExtent.xmin,
              json.initialExtent.ymin,
              json.initialExtent.xmax,
              json.initialExtent.ymax
            );
          }
          const options = {
            projCode: projCode,
            initExtent: transformExtent(initExtent, projCode, 'EPSG:4326')
          };
          if (data.visibleLayers && data.visibleLayers.length > 0) {
            let layers = [];
            const promises = [];

            // 自定义注记图层promise
            for (const visibleLayer of data.visibleLayers) {
              const promise = this.createArcGISFeatureLayer(
                data,
                visibleLayer,
                options
              );
              promises.push(promise);
            }

            // dynamic的红点
            const newData = JSON.parse(JSON.stringify(data));
            newData.mapIndex = newData.mapIndex - 0.1;
            const promise = new DynamicLayer(this.map).generate(newData);
            promises.push(promise);

            Promise.all(promises)
              .then((result) => {
                if (result && result.length > 0) {
                  result.forEach((layerRs) => {
                    layers = layers.concat(layerRs);
                  });
                  const isFit = data.isZoomToLayer ? data.isZoomToLayer : false;
                  const layerGroup = new LayerGroup({
                    id: data.id,
                    info: data,
                    layerTag: data.layerTag,
                    opacity: data.opacity,
                    zIndex: data.mapIndex,
                    initExtent: options.initExtent,
                    minResolution: data.minResolution,
                    maxResolution: data.maxResolution,
                    isFit: isFit,
                    layers: layers,
                    updateParams: (where, layerDefs) => {
                      // console.log('updateParams',where,layers)
                      // where = "xzqdm like '3301%'"
                      self.updateParams(data, where, layerDefs);
                    }
                  });
                  /* let tra = new Translate({
                                    layers: layers
                                })
                                this.map.addInteraction(tra) */
                  resolve(layerGroup);
                }
              })
              .catch((error) => {
                console.error(error);
              });
          }
        })
        .catch((error) => {
          console.error(error);
          reject(
            new Error(
              '"' + data.label + '"' + '图层无法正常加载，请检查运维端配置项!'
            )
          );
        });
    });
  }

  /**
   * 创建ArcGIS的featureServer服务图层
   * Label定制版
   * @param {*} data
   * @param {*} options
   */
  createArcGISFeatureLayer(data, visibleLayer, options) {
    return new Promise((resolve) => {
      const self = this;
      const layers = [];
      const layerMap = new Map();
      var esrijsonFormat = new EsriJSON();
      const mapProjCode = this.map.getView().getProjection().getCode();
      const wkid = mapProjCode.split(':')[1];
      const extent = options.initExtent;
      const filter = data.zjFilter ? data.zjFilter : '1=1';
      const isFit = typeof data.isFit === 'boolean' ? data.isFit : false;

      var url =
        data.url +
        '/' +
        visibleLayer +
        '/query/?f=json&' +
        'where=' +
        encodeURIComponent(filter) +
        '&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
        encodeURIComponent(
          '{"xmin":' +
            extent[0] +
            ',"ymin":' +
            extent[1] +
            ',"xmax":' +
            extent[2] +
            ',"ymax":' +
            extent[3] +
            ',"spatialReference":{"wkid":' +
            4326 +
            '}}'
        ) +
        '&geometryType=esriGeometryEnvelope&inSR=' +
        4326 +
        '&outFields=*' +
        '&outSR=' +
        wkid;
      if (data.authkey) {
        url += '&authkey=' + data.authkey;
      }
      $.ajax({
        url: url,
        dataType: 'jsonp',
        success: function (response) {
          if (response.error) {
            console.error(
              response.error.message + '\n' + response.error.details.join('\n')
            );
          } else {
            // dataProjection will be read from document
            var features = esrijsonFormat.readFeatures(response, {
              featureProjection: mapProjCode
            });
            if (features.length > 0) {
              // console.log(features)
              // 按fscale分为不同图层，分别添加feature
              features.forEach((feature) => {
                // let position = feature.getGeometry().getCoordinates()

                const properties = feature.getProperties();
                const fscale = properties.fscale
                  ? properties.fscale
                  : properties.FSCALE;
                let xzqmc = properties.xzqmc
                  ? properties.xzqmc
                  : properties.XZQMC;
                const name = properties.name
                  ? properties.name
                  : properties.NAME;
                xzqmc = xzqmc || name;
                if (!layerMap.get(fscale)) {
                  const vectorSource = new VectorSource();
                  const layer = new VectorLayer({
                    id: data.id,
                    layerTag: data.layerTag,
                    opacity: data.opacity,
                    zIndex: data.mapIndex,
                    info: data,
                    initExtent: options.initExtent,
                    minResolution: data.minResolution,
                    maxResolution: data.maxResolution,
                    isFit: isFit,
                    source: vectorSource
                  });
                  layers.push(layer);
                  layerMap.set(fscale, layer);
                }
                /* if (!data.zjOptions){
                                    data.zjOptions = {
                                        fontSize : data.fontSize,
                                        fontColor : data.fontColor,
                                        strokeColor : data.strokeColor
                                    }
                                } */
                const style = getLabelStyle(data.zjOptions, xzqmc);
                feature.setStyle(style);
                // 通过translate信息平移
                if (data.translate && data.translate[xzqmc]) {
                  feature.getGeometry().setCoordinates(data.translate[xzqmc]);
                }
                layerMap.get(fscale).getSource().addFeature(feature);
              });
              self.changeVisible(layerMap);
              self.map.on('moveend', function () {
                self.changeVisible(layerMap);
              });
            }
          }
          resolve(layers);
        },
        error: function () {
          resolve(layers);
        }
      });
    });
  }

  changeVisible(layerMap) {
    var zoom = this.map.getView().getZoom(); // 获取当前地图的缩放级别
    layerMap.forEach(function (layer, scale) {
      if (!scale) {
        layer.setVisible(true);
      } else {
        if (zoom >= scale) {
          layer.setVisible(true);
        } else {
          layer.setVisible(false);
        }
      }
    });
  }

  updateParams(data, filter, layerDefs) {
    data.zjFilter = filter;
    data.filter = layerDefs;
    const layerManger = LayerManager.getInstance(this.map);
    layerManger.removeLayer(data);
    layerManger.addLayer(data);
  }
}

export default LabelLayer;
