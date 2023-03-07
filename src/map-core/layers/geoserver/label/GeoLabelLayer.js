import { Vector as VectorLayer } from 'ol/layer';
import axios from '../../../../utils/request';
import LayerGroup from 'ol/layer/Group';
import { Vector as VectorSource } from 'ol/source';
import { getLabelStyle } from '../../arcgis/label/labelStyleUtils';
import LayerManager from '../../../LayerManager';
import WmsLayer from '../WmsLayer';
import { addParamToUrl } from '../../../../utils/uitls';
import { LoadXmlText } from '../../../../utils/common';
import WFS from 'ol/format/WFS';
import GeoJSON from 'ol/format/GeoJSON';
import * as Filter from 'ol/format/filter';

class GeoLabelLayer {
  constructor(map) {
    this.map = map;
  }

  generate(data) {
    const self = this;
    return new Promise((resolve, reject) => {
      let requestUrl = data.url + '?request=getCapabilities';
      if (data.authkey) {
        // requestUrl = requestUrl + '&authkey=' + data.authkey
        requestUrl = addParamToUrl(requestUrl, 'authkey', data.authkey);
      }
      axios
        .get(requestUrl, {
          headers: {
            'content-type': 'application/xml'
          }
        })
        .then((response) => {
          const xml = LoadXmlText(response.headers ? response.data : response);
          const layers =
            xml.getElementsByTagName('FeatureTypeList')[0].children;
          let targetLayer;
          for (let i = 0, l = layers.length; i < l; i++) {
            for (let j = 0, ll = layers[i].children.length; j < ll; j++) {
              if (layers[i].children[j].nodeName === 'Name') {
                if (layers[i].children[j].innerHTML === data.visibleLayers[0]) {
                  targetLayer = layers[i];
                  break;
                }
              }
            }
            if (targetLayer) {
              break;
            }
          }
          let initExtent = [];
          for (let i = 0, l = targetLayer.children.length; i < l; i++) {
            if (targetLayer.children[i].nodeName === 'ows:WGS84BoundingBox') {
              const lowercorner =
                targetLayer.children[i].children[0].innerHTML.split(' ');
              const uppercorner =
                targetLayer.children[i].children[1].innerHTML.split(' ');
              initExtent = [
                Number(lowercorner[0]),
                Number(lowercorner[1]),
                Number(uppercorner[0]),
                Number(uppercorner[1])
              ];
              break;
            }
          }
          const options = {
            initExtent: initExtent
          };

          let layerArray = [];
          const promises = [];

          // 自定义注记图层promise
          for (const visibleLayer of data.visibleLayers) {
            const promise = this.createLabelWfsLayer(
              data,
              visibleLayer,
              options
            );
            promises.push(promise);
          }

          // wms的红点
          const newData = JSON.parse(JSON.stringify(data));
          newData.mapIndex = newData.mapIndex - 0.1;
          const promise = new WmsLayer(this.map).generate(newData);
          promises.push(promise);

          Promise.all(promises).then((result) => {
            if (result && result.length > 0) {
              result.forEach((layerRs) => {
                layerArray = layerArray.concat(layerRs);
              });
              const isFit =
                typeof data.isFit === 'boolean' ? data.isFit : false;
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
                layers: layerArray,
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
          });
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
  createLabelWfsLayer(data, visibleLayer, options) {
    return new Promise((resolve) => {
      const self = this;
      const layers = [];
      const layerMap = new Map();
      const isFit = data.isZoomToLayer ? data.isZoomToLayer : false;
      const writeOptions = {
        srsName: this.map.getView().getProjection().getCode(),
        // featureNS: data.url,    //命名空间
        // featurePrefix: 'zbtr',               //工作区域
        featureTypes: data.visibleLayers, // 图层名
        outputFormat: 'application/json'
      };
      // let filter = "{\"type\":\"and\",\"param\":[{\"type\":\"=\",\"param\":[\"dlmc\",\"防护绿地\"]},{\"type\":\">\",\"param\":[\"shape_area\",\"5000\"]}]}"
      if (data.filter) {
        const filterObj = JSON.parse(data.filter);
        const filterR = this.parseFilter(filterObj);
        writeOptions.filter = filterR;
      }

      var featureRequest = new WFS().writeGetFeature(writeOptions);

      let requestUrl = data.url;
      if (data.authkey) {
        requestUrl = requestUrl + '?authkey=' + data.authkey;
      }
      // axios.post(data.url,new XMLSerializer().serializeToString(featureRequest))
      // then post the request and add the received features to a layer
      fetch(requestUrl, {
        method: 'POST',
        body: new XMLSerializer().serializeToString(featureRequest)
      })
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          var features = new GeoJSON().readFeatures(json);
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
              const name = properties.name ? properties.name : properties.NAME;
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
          resolve(layers);
        })
        .catch(() => {
          resolve(layers);
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

  parseFilter(filter) {
    if (!filter.type) {
      console.warn('type字段不存在');
      return;
    }
    if (!filter.param) {
      console.warn('param字段不存在');
      return;
    }
    const filterConditions = [];
    switch (filter.type.toLowerCase()) {
      case 'and':
        for (const i in filter.param) {
          const filterChild = this.parseFilter(filter.param[i]);
          filterConditions.push(filterChild);
        }
        return Filter.and.apply(null, filterConditions);
      case 'or':
        for (const i in filter.param) {
          const filterChild = this.parseFilter(filter.param[i]);
          filterConditions.push(filterChild);
        }
        return Filter.or.apply(null, filterConditions);
      case 'not':
        for (const i in filter.param) {
          const filterChild = this.parseFilter(filter.param[i]);
          filterConditions.push(filterChild);
        }
        return Filter.not.apply(null, filterConditions);
      case '=':
        return Filter.equalTo(filter.param[0], filter.param[1]);
      case '!=':
        return Filter.notEqualTo(filter.param[0], filter.param[1]);
      case '>':
        return Filter.greaterThan(filter.param[0], filter.param[1]);
      case '<':
        return Filter.lessThan(filter.param[0], filter.param[1]);
      case '>=':
        return Filter.greaterThanOrEqualTo(filter.param[0], filter.param[1]);
      case '<=':
        return Filter.lessThanOrEqualTo(filter.param[0], filter.param[1]);
      case 'between':
        return Filter.between(
          filter.param[0],
          filter.param[1],
          filter.param[2]
        );
    }
  }

  updateParams(data, filter, layerDefs) {
    data.zjFilter = filter;
    data.filter = layerDefs;
    const layerManger = LayerManager.getInstance(this.map);
    layerManger.removeLayer(data);
    layerManger.addLayer(data);
  }
}

export default GeoLabelLayer;
