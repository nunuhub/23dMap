import axios from '../../../utils/request';
import { registerProj } from '../../CustomProjection';
import { transformExtent } from 'ol/proj';
import VectorTileSource from 'ol/source/VectorTile';
import { queryFeatureByPbf } from '../../../utils/plug/esri-pbf/QueryFeature';
import StyleManager from '../../StyleManager';
import LayerGroup from 'ol/layer/Group';
import { GeoJSON } from 'ol/format';
import { addParamToUrl } from '../../../utils/uitls';
import ShineVectorTileLayer from '../ol/ShineVectorTileLayer';

let featureId = 0;

class PbfFeatureLayer {
  constructor(map) {
    this.map = map;
    this.styleManager = new StyleManager(this.map);
    this.proxy = '/gisqBI/api/gis/proxy?';
  }

  generate(data) {
    if (data.isProxy) {
      this.proxy = data.proxyPath ? data.proxyPath : '/gisqBI/api/gis/proxy?';
    } else {
      this.proxy = '';
    }
    return new Promise((resolve, reject) => {
      let requestUrl = this.proxy + data.url;
      requestUrl = addParamToUrl(requestUrl, 'f', 'json');
      if (data.authkey) {
        requestUrl = requestUrl + '&authkey=' + data.authkey;
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
            registerProj(json.fullExtent.spatialReference.wkt, [
              json.fullExtent.xmin,
              json.fullExtent.ymin,
              json.fullExtent.xmax,
              json.fullExtent.ymax
            ]);
            projCode = json.fullExtent.spatialReference.wkt;
          } else {
            projCode = 'EPSG:' + json.fullExtent.spatialReference.wkid;
            registerProj(projCode);
          }
          if (json.initialExtent.xmin !== 'NaN') {
            initExtent.push(
              json.initialExtent.xmin,
              json.initialExtent.ymin,
              json.initialExtent.xmax,
              json.initialExtent.ymax
            );
          } else {
            initExtent.push(
              json.fullExtent.xmin,
              json.fullExtent.ymin,
              json.fullExtent.xmax,
              json.fullExtent.ymax
            );
          }
          const options = {
            projCode: projCode,
            initExtent: transformExtent(initExtent, projCode, 'EPSG:4326')
          };
          // 由于featureLayer多个图层样式均不相同，则每个图层分别setStyle,最后再用layerGroup组合
          if (data.visibleLayers && data.visibleLayers.length > 0) {
            let layers = [];
            for (let visibleLayer of data.visibleLayers) {
              let layer = this.createPbfFeatureLayer(
                data,
                visibleLayer,
                options
              );
              layers.push(layer);
            }
            let layerGroup = new LayerGroup({
              id: data.id,
              info: data,
              layerTag: data.layerTag,
              opacity: data.opacity,
              zIndex: data.mapIndex,
              initExtent: options.initExtent,
              isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
              layers: layers
            });
            resolve(layerGroup);
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
   * 创建WMTS服务图层
   * @param {*} data
   * @param {*} json
   */
  createPbfFeatureLayer(data, visibleLayer, options) {
    let extent = options.initExtent;

    // maxResolution优先级比maxScale高
    let maxResolution = this.map.getView().getMaxResolution();
    if (data.maxResolution) {
      maxResolution = data.maxResolution;
    } else if (data.maxScale) {
      maxResolution = this.map.getResolutionFromScale(data.maxScale);
    }
    let vectorTileSource = new VectorTileSource({
      projection: this.map.getView().getProjection(),
      tileSize: [256, 256],
      crossOrigin: 'anonymous',
      wrapX: true,
      url: data.url + '{x}{y}{z}',
      maxResolution: maxResolution,
      tileLoadFunction: function (tile) {
        let where = vectorTileSource.where ? vectorTileSource.where : '1=1';
        data.where = where;
        tile.setLoader(function (extent, resolution, projection) {
          queryFeatureByPbf({
            data,
            visibleLayer,
            f: data.supportedQueryFormat ? data.supportedQueryFormat : 'json',
            extent,
            geometry: extent,
            resolution,
            projection,
            returnExceededLimitFeatures: false
          }).then((result) => {
            let trueWhere = vectorTileSource.where
              ? vectorTileSource.where
              : '1=1';
            //请求where与实际where不同说明是过滤前的数据,不进行解析
            if (where !== trueWhere) {
              tile.setFeatures([]);
              return;
            }
            let features = [];
            if (result instanceof Array) {
              for (let geojson of result) {
                var item = new GeoJSON().readFeatures(geojson);
                features = features.concat(item);
              }
            } else {
              features = new GeoJSON().readFeatures(result);
            }
            if (features && features.length > 0) {
              if (!layer.get('attrKeys')) {
                let keys = Object.keys(features[0].getProperties());
                keys = keys.filter((key) => {
                  return !(
                    key === 'geometry' ||
                    key === 'shape' ||
                    key === 'shape_leng' ||
                    key === 'SHAPE__Length' ||
                    key === 'SHAPE__Area'
                  );
                });
                layer.set('attrKeys', keys);
              }
              tile.setFeatures(
                features.map((feature) => {
                  feature.setId(`${visibleLayer}.${featureId++}`);
                  return feature;
                })
              );
            } else {
              tile.setFeatures([]);
            }
          });
        });
      }
    });
    vectorTileSource.updateParams = function (params) {
      let layerDefs = params.layerDefs;
      let layerDefsObj = JSON.parse(layerDefs);
      this.where = layerDefsObj[visibleLayer];
      this.refresh();
    };
    let layer = new ShineVectorTileLayer({
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      zIndex: data.mapIndex,
      initExtent: extent,
      minZoom: data.minZoom,
      maxZoom: data.maxZoom,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      declutter: true,
      updateWhileInteracting: true,
      source: vectorTileSource
    });

    //图层绑定样式getLayerStyle setLayerStyle方法
    this.styleManager.bindLayer(layer);

    // 初始样式
    if (data.symbol) {
      layer.setLayerStyle(data.symbol);
    }

    // 初始范围
    layer.set('initExtent', extent);
    return layer;
  }
}

export default PbfFeatureLayer;
