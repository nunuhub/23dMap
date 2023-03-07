import { Vector as VectorLayer } from 'ol/layer';
import axios from '../../../utils/request';
import { registerProj } from '../../CustomProjection';
import { transformExtent } from 'ol/proj';
import { Vector as VectorSource } from 'ol/source';
import LayerGroup from 'ol/layer/Group';
import EsriJSON from 'ol/format/EsriJSON';
import $ from 'jquery';
import { tile as tileStrategy } from 'ol/loadingstrategy';
import { createXYZ } from 'ol/tilegrid';
import StyleManager from '../../StyleManager';
import { addParamToUrl } from '../../../utils/uitls';
import union from '@turf/union';
import { polygon as turfPolygon } from '@turf/helpers';
import intersect from '@turf/intersect';
import area from '@turf/area';

let featureId = 0;

class FeatureLayer {
  constructor(map) {
    this.map = map;
    this.styleManager = new StyleManager(this.map);
    this.proxy = '/gisqBI/api/gis/proxy?';
  }

  generate(data) {
    // if (data.isProxy && process.env.NODE_ENV === 'development') {
    if (data.isProxy) {
      this.proxy = data.proxyPath ? data.proxyPath : '/gisqBI/api/gis/proxy?';
    } else {
      this.proxy = '';
    }
    return new Promise((resolve, reject) => {
      let requestUrl = this.proxy + data.url;
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
          let initExtent = [];
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

          let options = {
            projCode: projCode,
            maxRecordCount: json.maxRecordCount,
            initExtent: transformExtent(initExtent, projCode, 'EPSG:4326')
          };
          // 由于featureLayer多个图层样式均不相同，则每个图层分别setStyle,最后再用layerGroup组合
          if (data.visibleLayers && data.visibleLayers.length > 0) {
            let layers = [];
            for (let visibleLayer of data.visibleLayers) {
              let layer = this.createArcGISFeatureLayer(
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
              minResolution: data.minResolution,
              maxResolution: data.maxResolution,
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
   * 创建ArcGIS的featureServer服务图层
   * @param {*} data
   * @param {*} options
   */
  createArcGISFeatureLayer(data, visibleLayer, options) {
    let self = this;
    var esrijsonFormat = new EsriJSON();
    let mapProjCode = this.map.getView().getProjection().getCode();
    let wkid = mapProjCode.split(':')[1];

    let notLoadedBounds = []; //未加载范围
    let nowLoadExtent; //已经完全渲染的区域（每次完全渲染都堆改区域进行union）
    //放大缩小时，根据notLoadedBounds,未加载边界进行部分刷新，达到增量更新的效果
    this.map.on('moveend', () => {
      if (notLoadedBounds.length > 0) {
        for (let i = notLoadedBounds.length - 1; i >= 0; i--) {
          let item = notLoadedBounds[i];
          if (this.map.getView().getResolution() >= item.resolution) {
            return;
          }
          //执行刷新操作，从数组中移除对应数据
          notLoadedBounds.splice(i, 1);
          //判断extent是否在nowLoadExtent已加载范围内，如果在的话，不进行刷新，用相交面积代替包含算法，因为turf的包含不能对MultiPolygon生效
          if (nowLoadExtent) {
            let extentPolygon = this.createTurfPolygonFromExtent(item.extent);
            let intersectPolygon = intersect(nowLoadExtent, extentPolygon);
            if (intersectPolygon) {
              if (area(intersectPolygon) === area(intersectPolygon)) {
                continue;
              }
            }
          }

          //移除extent中未加载完整的feature，防止重复加载
          for (let feature of item.features) {
            vectorSource.removeFeature(feature);
          }
          //移除已加载范围中extent范围，达到部分刷新的目的
          vectorSource.removeLoadedExtent(item.extent);
        }
      }
    });

    let maxResolution = this.map.getView().getMaxResolution();
    let vectorSource = new VectorSource({
      loader: function (extent, resolution, projection, success, failure) {
        let where = this.where ? this.where : '1=1';
        var url =
          self.proxy +
          data.url +
          '/' +
          visibleLayer +
          '/query/?f=json&' +
          'where=' +
          encodeURIComponent(where) +
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
              wkid +
              '}}'
          ) +
          '&geometryType=esriGeometryEnvelope&inSR=' +
          wkid +
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
            let trueWhere = vectorSource.where ? vectorSource.where : '1=1';
            //请求where与实际where不同说明是过滤前的数据,不进行解析
            if (where !== trueWhere) {
              return;
            }
            if (response.error) {
              success([]);
              console.error(
                response.error.message +
                  '\n' +
                  response.error.details.join('\n')
              );
            } else {
              // dataProjection will be read from document
              var features = esrijsonFormat.readFeatures(response, {
                featureProjection: projection
              });
              success();
              if (features.length > 0) {
                vectorSource.addFeatures(
                  features.map((feature) => {
                    feature.setId(`${visibleLayer}.${featureId++}`);
                    return feature;
                  })
                );
                //返回的数据为esri的返回上限，代表地块尚未加载完毕
                if (features.length === options.maxRecordCount) {
                  notLoadedBounds.push({ extent, resolution, features });
                  return;
                }
              }
              //完整加载,对nowLoadExtent合并
              nowLoadExtent = self.unionFeature(nowLoadExtent, extent);
            }
          },
          error: function () {
            vectorSource.removeLoadedExtent(extent);
            failure();
          }
        });
      },
      strategy: tileStrategy(
        createXYZ({
          maxResolution: maxResolution,
          tileSize: 512
        })
      )
    });
    vectorSource.updateParams = function (params) {
      let layerDefs = params.layerDefs;
      let layerDefsObj = JSON.parse(layerDefs);
      this.where = layerDefsObj[visibleLayer];
      this.refresh();
    };
    let layer = new VectorLayer({
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      zIndex: data.mapIndex,
      initExtent: options.initExtent,
      minZoom: data.minZoom,
      maxZoom: data.maxZoom,
      minResolution: data.minResolution,
      maxResolution: data.maxResolution,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      source: vectorSource
    });

    //图层绑定样式getLayerStyle setLayerStyle方法
    this.styleManager.bindLayer(layer);

    // 初始样式
    if (data.symbol) {
      layer.setLayerStyle(data.symbol);
    }
    return layer;
  }

  /**
   * 合并extent获取已加载的区域
   * @param nowLoad
   * @param extent
   * @returns {Feature<Polygon | MultiPolygon, Properties>|esriPBuffer.FeatureCollectionPBuffer.Feature<Polygon, Properties>}
   */
  unionFeature(nowLoad, extent) {
    // nowLoad不存在直接返回extent, 存在开始合并
    if (!nowLoad) {
      return this.createTurfPolygonFromExtent(extent);
    } else {
      return union(nowLoad, this.createTurfPolygonFromExtent(extent));
    }
  }

  /**
   * 根据extent创建turf的面对象
   * @param extent
   * @returns {Feature<Polygon, Properties>}
   */
  createTurfPolygonFromExtent(extent) {
    let coords = [];
    coords.push([extent[0], extent[1]]);
    coords.push([extent[0], extent[3]]);
    coords.push([extent[2], extent[3]]);
    coords.push([extent[2], extent[1]]);
    coords.push([extent[0], extent[1]]);
    return turfPolygon([coords]);
  }
}

export default FeatureLayer;
