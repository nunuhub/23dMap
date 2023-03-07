import axios from '../utils/request';
import { get as getProjection } from 'ol/proj';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { Vector as VectorSource, XYZ, WMTS as WMTSSource } from 'ol/source.js';
import { optionsFromCapabilities } from 'ol/source/WMTS.js';
import {
  addParamByData,
  addParamToUrl,
  appendPath,
  getUrlParams
} from '../utils/uitls';
import WMTSCapabilities from 'ol/format/WMTSCapabilities.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import VectorTileSource from 'ol/source/VectorTile.js';
import TileGrid from 'ol/tilegrid/TileGrid';
import WmtsTileGrid from 'ol/tilegrid/WMTS';
import { BaiduVector } from './layers/baidu_vector';
import { BaiduImage } from './layers/baidu_image';
import { BaiduRoad } from './layers/baidu_road';
import MVT from 'ol/format/MVT.js';
import { LoadXmlText, xmlToJson } from '../utils/common';
import { getWidth } from 'ol/extent';
import GML3 from 'ol/format/GML3';
import { registerProj } from './CustomProjection';
import { bbox as bboxStrategy } from 'ol/loadingstrategy.js';
import { find } from 'ol/array.js';
import TileImage from 'ol/source/TileImage';
import DynamicLayer from './layers/arcgis/DynamicLayer';
import WmsLayer from './layers/geoserver/WmsLayer';
import LabelLayer from './layers/arcgis/label/LabelLayer';
import GeoLabelLayer from './layers/geoserver/label/GeoLabelLayer';
import WmtsLayer from './layers/geoserver/WmtsLayer';
import VectorTiledLayer from './layers/geoserver/VectorTiledLayer';
import PbfVectorTiledLayer from './layers/geoserver/PbfVectorTiledLayer';
import {
  getGeoLayerName,
  getTdtTileGride,
  replaceWktProj
} from '../utils/olUtil';
import CkyTdtLayer from './layers/CkyTdtLayer';
import OfflineTileLayer from './layers/offline/OfflineTileLayer';
import { Message } from 'element-ui';
import GDWMTSLayer from './layers/arcgis/GDWMTSLayer';
import PbfFeatureLayer from './layers/arcgis/PbfFeatureLayer';
import ArcGISVectorTiledLayer from './layers/arcgis/VectorTiledLayer';
import FeatureLayer from './layers/arcgis/FeatureLayer';
import { transformExtent } from 'ol/proj.js';
import WfsLayer from './layers/geoserver/WfsLayer';
import SdTDTLayer from './layers/other/SdTDTLayer';
import Filters from '../utils/plug/Filters';
import GeoJsonLayer from './layers/other/GeoJsonLayer';
import GaodeLayer from './layers/other/GaodeLayer';
import BaiduLayer from './layers/other/BaiduLayer';
import StyleManager from '../map-core/StyleManager';
import ArcGISTiledLayer from '../map-core/layers/arcgis/ArcGISTiledLayer';

class LayerGenerater {
  constructor(map) {
    // 代理请求，这里的代理地址，需要做成可配置的
    this.proxy = '/gisqBI/api/gis/proxy?';
    this.map = map;
  }

  generate(data) {
    // if (data.isProxy && process.env.NODE_ENV === 'development') {
    if (data.isProxy) {
      this.proxy = data.proxyPath ? data.proxyPath : '/gisqBI/api/gis/proxy?';
    } else {
      this.proxy = '';
    }
    if (data.type === 'tiled') {
      return new ArcGISTiledLayer(this.map).generate(data);
    } else if (data.type === 'geoserver-pbf-vectorTiled') {
      return new PbfVectorTiledLayer(this.map).generate(data);
    } else if (data.type === 'geoserver-vectorTiled') {
      return new VectorTiledLayer(this.map).generate(data);
    } else if (data.type === 'geoway_vector_tile') {
      return new Promise((resolve) => {
        let requestUrl =
          data.url +
          '/getMAP?x={x}&y={y}&l={z}&styleId=tdt_biaozhunyangshi_2017';
        if (data.authkey) {
          requestUrl = requestUrl + '&authkey=' + data.authkey;
        }

        let geoWayLayer = new TileLayer({
          zIndex: 2550,

          source: new XYZ({
            crossOrigin: 'anonymous',
            declutter: true,
            url: requestUrl,
            projection: 'EPSG:4490'
          })
        });

        resolve(geoWayLayer);
        // resolve(geoWayMarkLayer);
      }).catch((error) => {
        console.error(error);
      });
    } else if (data.type === 'tms') {
      return new Promise((resolve, reject) => {
        let _this = this;
        let requestUrl = data.url + '/tilemapresource.xml';
        if (data.authkey) {
          requestUrl = requestUrl + '&authkey=' + data.authkey;
        }
        axios
          .get(requestUrl, null, {
            headers: {
              'content-type': 'application/xml'
            }
          })
          .then((response) => {
            let extent = [];
            let resolutions = [];
            let tileSize = [];
            let extUrl = '';
            let projCode;
            let parser = new DOMParser();
            let xml;
            try {
              xml = parser.parseFromString(response.data, 'text/xml');
            } catch (e) {
              reject(new Error('当前用户没权限,请联系管理员'));
              return;
            }
            let jsonObj = xmlToJson(xml);
            projCode = jsonObj.tilemap.srs['#text'];
            if (projCode.indexOf('OSGEO') > -1) {
              projCode = 'EPSG:3857';
            }

            registerProj(projCode);
            let minx = jsonObj.tilemap.boundingbox['@attributes'].minx;
            let miny = jsonObj.tilemap.boundingbox['@attributes'].miny;
            let maxx = jsonObj.tilemap.boundingbox['@attributes'].maxx;
            let maxy = jsonObj.tilemap.boundingbox['@attributes'].maxy;

            extent = [maxx, maxy, minx, miny];
            jsonObj.tilemap.tilesets.tileset.forEach((element) => {
              return resolutions.push(
                element['@attributes']['units-per-pixel']
              );
            });
            let tileFormat =
              jsonObj.tilemap.tileformat['@attributes']['mime-type'];
            if (data.isGoogle === true) {
              extUrl =
                '/{z}/{x}/{-y}.' +
                jsonObj.tilemap.tileformat['@attributes'].extension;
            } else {
              extUrl =
                '/{z}/{x}/{y}.' +
                jsonObj.tilemap.tileformat['@attributes'].extension;
            }

            let options = {
              projCode: projCode,
              initExtent: transformExtent(extent, projCode, 'EPSG:4326'),
              extent: extent,
              resolutions: resolutions,
              tileSize: tileSize,
              extUrl: extUrl,
              format: tileFormat
            };

            let layer = _this.createGeoServerTMSLayer(data, options);
            resolve(layer);
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
    } else if (data.type === 'wms') {
      return new WmsLayer(this.map).generate(data);
    } else if (data.type === 'geoserver-wms') {
      return new WmsLayer(this.map).generate(data);
    } else if (data.type === 'tdt') {
      return new Promise((resolve, reject) => {
        var xmlName;
        if (data.url.indexOf('vec_c') !== -1) {
          xmlName = 'vec_c.xml';
        } else if (data.url.indexOf('cia_c') !== -1) {
          xmlName = 'cia_c.xml';
        } else if (data.url.indexOf('img_c') !== -1) {
          xmlName = 'img_c.xml';
        } else if (data.url.indexOf('cva_c') !== -1) {
          xmlName = 'cva_c.xml';
        } else if (data.url.indexOf('ter_c') !== -1) {
          xmlName = 'ter_c.xml';
        } else if (data.url.indexOf('cta_c') !== -1) {
          xmlName = 'cta_c.xml';
        } else if (data.url.indexOf('tbo_c') !== -1) {
          xmlName = 'tbo_c.xml';
        } else if (data.url.indexOf('vec_w') !== -1) {
          xmlName = 'vec_w.xml';
        } else if (data.url.indexOf('cva_w') !== -1) {
          xmlName = 'cva_w.xml';
        } else if (data.url.indexOf('img_w') !== -1) {
          xmlName = 'img_w.xml';
        } else if (data.url.indexOf('cia_w') !== -1) {
          xmlName = 'cia_w.xml';
        } else if (data.url.indexOf('ibo_w') !== -1) {
          xmlName = 'ibo_w.xml';
          data.visibleLayers[0] = 'ibo';
        }
        try {
          if (xmlName) {
            let module = require('!raw-loader!../assets/tdt/' + xmlName);
            let options = {
              CapabilitiesXml: module.default
            };
            let layer = this.createTDTLayer(data, options, reject);
            resolve(layer);
          } else {
            let tureUrl = data.url.substring(
              data.url.toLowerCase().indexOf('http'),
              data.url.length
            );
            let connector = tureUrl.indexOf('?') > -1 ? '&' : '?';
            let requestUrl =
              data.url + connector + 'SERVICE=WMTS&request=getCapabilities';
            if (data.authkey) {
              requestUrl = requestUrl + '&authkey=' + data.authkey;
            }
            axios
              .get(requestUrl, {
                headers: {
                  'content-type': 'application/xml'
                }
              })
              .then((response) => {
                let options = {
                  CapabilitiesXml: response.headers ? response.data : response
                };
                let layer = this.createTDTLayer(data, options);
                resolve(layer);
              })
              .catch((error) => {
                console.error(error);
                reject(
                  new Error(
                    '"' +
                      data.label +
                      '"' +
                      '图层无法正常加载，请检查运维端配置项!'
                  )
                );
              });
          }
        } catch (error) {
          console.error(error);
          reject(
            new Error(
              '"' + data.label + '"' + '图层无法正常加载，请检查运维端配置项!'
            )
          );
        }
      });
    } else if (data.type === 'ckytdt') {
      return new CkyTdtLayer().generate(data);
    } else if (data.type === 'tdt-sd') {
      return new SdTDTLayer().generate(data);
    } else if (data.type === 'dynamic') {
      return new DynamicLayer(this.map).generate(data);
    } else if (data.type === 'feature') {
      return new FeatureLayer(this.map).generate(data);
    } else if (data.type === 'feature-zj') {
      return new LabelLayer(this.map).generate(data);
    } else if (data.type === 'geoserver-zj') {
      return new GeoLabelLayer(this.map).generate(data);
    } else if (data.type === 'geoserver-wfs') {
      return new WfsLayer(this.map).generate(data);
    } else if (data.type === 'geoserver-wmts') {
      return new WmtsLayer(this.map).generate(data);
    } else if (data.type === 'wmts' || data.type === 'arcgis-wmts') {
      return new Promise((resolve, reject) => {
        let _this = this;
        let url = this.proxy + data.url;
        if (!url?.toUpperCase()?.match(/WMTS\/?$/)) {
          url = appendPath(this.proxy + data.url, 'WMTS');
        }
        if (data.authkey) {
          url = addParamToUrl(url, 'authkey', data.authkey);
        }
        axios
          .get(url, {
            headers: {
              'content-type': 'application/xml'
            }
          })
          .then((response) => {
            let options = {
              CapabilitiesXml: response.headers ? response.data : response
            };
            let layer = _this.createArcGISWMTSLayer(data, options);
            resolve(layer);
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
    } else if (data.type === 'vectorTiled') {
      return new ArcGISVectorTiledLayer(this.map).generate(data);
    } else if (data.type === 'feature-pbf') {
      return new PbfFeatureLayer(this.map).generate(data);
    } else if (data.type === 'arcgis-wfs' || data.type === 'wfs') {
      return new Promise((resolve, reject) => {
        let _this = this;
        axios
          .get(this.proxy + data.url + '?service=WFS&request=getCapabilities', {
            headers: {
              'content-type': 'application/xml'
            }
          })
          .then((response) => {
            let xml = LoadXmlText(response.headers ? response.data : response);
            let layers = xml.getElementsByTagName('wfs:FeatureTypeList')[0]
              .children;
            let targetLayer;
            for (let i = 0, l = layers.length; i < l; i++) {
              for (let j = 0, ll = layers[i].children.length; j < ll; j++) {
                let layerName = getGeoLayerName(
                  layers[i].children[j].innerHTML
                );
                if (
                  layers[i].children[j].nodeName === 'wfs:Name' &&
                  (layers[i].children[j].innerHTML === data.visibleLayers[0] ||
                    layerName === data.visibleLayers[0])
                ) {
                  targetLayer = layers[i];
                  break;
                }
              }
              if (targetLayer) {
                break;
              }
            }
            let initExtent = [];
            for (let i = 0, l = targetLayer.children.length; i < l; i++) {
              if (targetLayer.children[i].nodeName === 'ows:WGS84BoundingBox') {
                let lowercorner =
                  targetLayer.children[i].children[0].innerHTML.split(' ');
                let uppercorner =
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
            let options = {
              initExtent: initExtent
            };
            let layer = _this.createArcGISWFSLayer(data, options);
            resolve(layer);
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
    } else if (data.type === 'gaode') {
      return new GaodeLayer(this.map).generate(data);
    } else if (data.type === 'baidu') {
      return new BaiduLayer(this.map).generate(data);
    } else if (data.type === 'baidu_vector') {
      return new Promise((resolve) => {
        let layer = this.createBaiDuVectorLayer(data);
        resolve(layer);
      });
    } else if (data.type === 'baidu_image') {
      return new Promise((resolve) => {
        let layer = this.createBaiDuImageLayer(data);
        resolve(layer);
      });
    } else if (data.type === 'baidu_road') {
      return new Promise((resolve) => {
        let layer = this.createBaiDuRoadLayer(data);
        resolve(layer);
      });
    } else if (data.type === 'supermap_rest_tile') {
      return new Promise((resolve, reject) => {
        import('./layers/supermap/SuperMapTileRest').then(
          ({ default: SuperMapTileRest }) => {
            new SuperMapTileRest(this.map)
              .generate(data)
              .then((layer) => {
                resolve(layer);
              })
              .catch((error) => {
                reject(error);
              });
          }
        );
      });
    } else if (data.type === 'supermap_rest_vector_tile') {
      // 加载超图矢量切片
      return new Promise((resolve, reject) => {
        import('./layers/supermap/SuperMapTileVectorRest').then(
          ({ default: SuperMapTileVectorRest }) => {
            new SuperMapTileVectorRest(this.map)
              .generate(data)
              .then((layer) => {
                resolve(layer);
              })
              .catch((error) => {
                reject(error);
              });
          }
        );
      });
    } else if (data.type === 'offline') {
      return new OfflineTileLayer(this.map).generate(data);
    } else if (data.type?.toLowerCase() === 'geojson') {
      return new GeoJsonLayer(this.map).generate(data);
    } else if (data.type === 'arcgis-wmts-gd') {
      return new GDWMTSLayer(this.map).generate(data);
    } else if (data.type === 'xyz') {
      return new Promise((resolve) => {
        let requestUrl = addParamByData(data.url, data);
        let layer = new TileLayer({
          id: data.id,
          info: data,
          layerTag: data.layerTag,
          opacity: data.opacity,
          zIndex: data.mapIndex,
          isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
          source: new XYZ({
            zDirection: data.zDirection,
            crossOrigin: 'anonymous',
            url: requestUrl
          })
        });
        resolve(layer);
        // resolve(geoWayMarkLayer);
      }).catch((error) => {
        console.error(error);
      });
    } else {
      return new Promise((resolve, reject) => {
        reject(
          new Error(
            '图层' + '"' + data.label + '"' + '加载失败,没有匹配的类型!'
          )
        );
      });
    }
  }

  /**
   * 创建GeoServer的TMS服务图层
   * @param {*} data
   * @param {*} options
   */
  createGeoServerTMSLayer(data, options) {
    let requestUrl = data.url + options.extUrl;
    if (data.authkey) {
      // requestUrl = requestUrl + '&authkey=' + data.authkey
      requestUrl = addParamToUrl(requestUrl, 'authkey', data.authkey);
    }
    let layer = new TileLayer({
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      opacity: data.opacity,
      zIndex: data.mapIndex,
      initExtent: options.initExtent,
      minResolution: data.minResolution,
      maxResolution: data.maxResolution
        ? data.maxResolution
        : options.resolutions[0] * 2,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      source: new XYZ({
        // projection: options.projCode,
        crossOrigin: 'anonymous',
        declutter: true,
        // tileGrid: new TileGrid({
        //     extent: options.extent,
        //     resolutions: options.resolutions,
        //     tileSize: options.tileSize
        // }),
        url: requestUrl
      })
    });
    return layer;
  }

  /**
   * 创建GeoServer矢量切片图层
   * @param {*} data
   * @param {*} options
   */
  createGeoServerVectorTileLayer(data, options) {
    this.idProp = data.idProp;
    registerProj(options.projCode);
    let requestUrl = data.url + options.extUrl;
    if (data.authkey) {
      // requestUrl = requestUrl + '&authkey=' + data.authkey
      requestUrl = addParamToUrl(requestUrl, 'authkey', data.authkey);
    }
    let layer = new VectorTileLayer({
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      opacity: data.opacity,
      zIndex: data.mapIndex,
      initExtent: options.initExtent,
      minResolution: data.minResolution,
      maxResolution: data.maxResolution
        ? data.maxResolution
        : options.resolutions[0] * 2,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      declutter: true,
      source: new VectorTileSource({
        projection: options.projCode,
        crossOrigin: 'anonymous',
        format: new MVT(),
        tileGrid: new TileGrid({
          extent: options.extent,
          // ！！！openlayers默认为左上角原点，geoserver提供的为左下角原点
          origin: options.origin,
          resolutions: options.resolutions,
          tileSize: options.tileSize
        }),
        url: requestUrl
      })
    });
    return layer;
  }

  /**
   * 创建天地图图层
   * @param {*} data
   * @param {*} options
   */
  createTDTLayer(data, options, reject) {
    let xml = replaceWktProj(options.CapabilitiesXml);
    let extent = [];
    let parser = new WMTSCapabilities();
    let result = parser.read(xml);
    let layers = result['Contents']['Layer'];
    let targetLayer = find(layers, function (elt) {
      if (data.visibleLayers && data.visibleLayers.length > 0) {
        return elt['Identifier'] === data.visibleLayers[0]
          ? data.visibleLayers[0]
          : data.name;
      } else {
        return data.name;
      }
    });
    extent = targetLayer.WGS84BoundingBox;
    var layerName = targetLayer.Identifier;
    let projCode = result.Contents.TileMatrixSet[0].SupportedCRS.replace(
      'urn:ogc:def:crs:',
      ''
    ).replace('::', ':');
    registerProj(projCode);
    let WMTSSourceOptions;

    try {
      WMTSSourceOptions = optionsFromCapabilities(result, {
        layer: layerName,
        matrixSet: data.matrixSet,
        requestEncoding: 'KVP'
      });
    } catch (e) {
      try {
        let matrixSet = result['Contents']['TileMatrixSet'][0].Identifier;
        WMTSSourceOptions = optionsFromCapabilities(result, {
          layer: layerName,
          matrixSet: matrixSet,
          requestEncoding: 'KVP'
        });
      } catch (e) {
        Message({
          type: 'error',
          message: '图层' + data.label + '切片方案有误'
        });
        console.error(e);
        reject('图层' + data.label + '切片方案有误');
      }
    }
    WMTSSourceOptions.crossOrigin = 'anonymous';
    WMTSSourceOptions.wrapX = true;
    // 天地图Capabilities.xml中TopLeftCorner坐标规范为[y,x],在这里需转换为[x,y]
    for (let i = 0; i < WMTSSourceOptions.tileGrid.origins_.length; i++) {
      WMTSSourceOptions.tileGrid.origins_[i].reverse();
    }
    // WMTSSourceOptions.crossOrigin = 'anonymous';

    WMTSSourceOptions.urls[0] = data.url;
    if (data.isUseTdt) {
      let resolutions = [];
      let matrixIds = [];
      let maxZoom = 18;
      for (let z = 0; z <= maxZoom; ++z) {
        resolutions[z] =
          getWidth([-180.0, -90.0, 180.0, 90.0]) / 256 / Math.pow(2, z);
        matrixIds[z] = z;
        WMTSSourceOptions.tileGrid.origins_[z] = [-180, 90];
        WMTSSourceOptions.tileGrid.tileSizes_[z] = [256, 256];
      }

      WMTSSourceOptions.tileGrid.extent_ = extent;
      WMTSSourceOptions.tileGrid.resolutions_ = resolutions;
      WMTSSourceOptions.tileGrid.matrixIds_ = matrixIds;
      WMTSSourceOptions.tileGrid.fullTileRanges_ = [];
    }
    // 全国天地图处理
    else if (data.url.indexOf('?tk=') > -1) {
      let seed = Math.floor(Math.random() * 4);
      data.url = data.url.replace(/t[0-9]./, 't' + seed + '.');
      let resolutions = [];
      let matrixIds = [];
      let maxZoom = 18;
      for (let z = 0; z <= maxZoom; ++z) {
        resolutions[z] =
          getWidth(extent) /
          WMTSSourceOptions.tileGrid.tileSizes_[0] /
          Math.pow(2, z);
        matrixIds[z] = z;
        WMTSSourceOptions.tileGrid.origins_[z] =
          WMTSSourceOptions.tileGrid.origins_[0];
        WMTSSourceOptions.tileGrid.tileSizes_[z] =
          WMTSSourceOptions.tileGrid.tileSizes_[0];
      }

      WMTSSourceOptions.tileGrid.extent_ = extent;
      WMTSSourceOptions.tileGrid.resolutions_ = resolutions;
      WMTSSourceOptions.tileGrid.matrixIds_ = matrixIds;
      WMTSSourceOptions.tileGrid.maxZoom = maxZoom;
      WMTSSourceOptions.urls[0] = data.url;
    } else {
      let tileGrid = getTdtTileGride(WMTSSourceOptions.projection.code_);
      WMTSSourceOptions.tileGrid = tileGrid;
    }
    if (data.authkey) {
      if (WMTSSourceOptions.urls[0].indexOf('?') !== -1) {
        WMTSSourceOptions.urls[0] =
          WMTSSourceOptions.urls[0] + '&authkey=' + data.authkey;
      } else {
        WMTSSourceOptions.urls[0] =
          WMTSSourceOptions.urls[0] + '?authkey=' + data.authkey;
      }
    }

    var layerZIndex = data.mapIndex ? data.mapIndex : -1;
    if (layerZIndex < 0) {
      layerZIndex = data.zIndex ? data.zIndex : -1;
    }
    if (data.isOverLimt) {
      WMTSSourceOptions.tileGrid.fullTileRanges_ = []; //突破tileRange限制，部分切片MatrixWidth错误,弊端是会有范围外的无效请求,临时解决方案
    }
    const filters = new Filters();
    if (data.theme === 'dark' || data.theme === 'blue') {
      WMTSSourceOptions.tileLoadFunction = (imageTile, src) => {
        const filterClass = Filters[data.theme];
        const temImg = new Image();
        temImg.crossOrigin = 'anonymous';
        temImg.src = src;
        temImg.width = 256;
        temImg.height = 256;
        temImg.onload = () => {
          const element = filters.filterImage(filterClass, temImg);
          imageTile.setImage(element);
        };
      };
    }

    let layer = new TileLayer({
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      opacity: 1,
      initExtent: extent,
      minResolution: data.minResolution,
      maxResolution: data.maxResolution,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      source: new WMTSSource(WMTSSourceOptions)
    });
    if (layerZIndex > -1) {
      layer.setZIndex(layerZIndex);
    }
    return layer;
  }

  /**
   * 创建ArcGIS WMTS服务图层
   * @param {*} data
   * @param {*} options
   */
  // createArcGISWMTSLayer(data, options) {
  //   let parser = new WMTSCapabilities()
  //   let result = parser.read(options.CapabilitiesXml)
  //   let WMTSSourceOptions = optionsFromCapabilities(result, {
  //     layer: data.visibleLayers
  //   })
  //   let extent = data.extent ? data.extent : WMTSSourceOptions.tileGrid.extent_
  //   let wmtsSource = new WMTSSource({
  //     url: data.url,
  //     layer: data.visibleLayers ? data.visibleLayers : WMTSSourceOptions.layer,
  //     matrixSet: WMTSSourceOptions.matrixSet,
  //     format: WMTSSourceOptions.format,
  //     projection: WMTSSourceOptions.projection.code_,
  //     tileGrid: new WmtsTileGrid({
  //       origin: data.origin ? data.origin : [WMTSSourceOptions.tileGrid.origins_[0][1], WMTSSourceOptions.tileGrid.origins_[0][0]],
  //       resolutions: data.resolutions ? data.resolutions : WMTSSourceOptions.tileGrid.resolutions_,
  //       matrixIds: data.matrixIds ? data.matrixIds : WMTSSourceOptions.tileGrid.matrixIds_,
  //       extent: extent,
  //     }),
  //     style: WMTSSourceOptions.style,
  //     wrapX: true,
  //     tileLoadFunction: function (imageTile, src) {
  //       if (src.indexOf("wmts/&") !== -1) {
  //         src = src.replace("wmts/&", "wmts?")
  //       } else if (src.indexOf("wmts&") !== -1) {
  //         src = src.replace("wmts&", "wmts?")
  //       }
  //       src += "&ServiceMode=KVP";
  //       imageTile.getImage().src = src;
  //     }
  //   });
  //   //
  //   let layer = new TileLayer({
  //     id: data.id,
  //     layerTag: data.layerTag,
  //     opacity: data.opacity,
  //     zIndex: data.mapIndex,
  //     source: wmtsSource,
  //     isFit: typeof data.isFit == "boolean" ? data.isFit : true,
  //     extent: extent,
  //     initExtent: extent
  //   })
  //   return layer
  // }
  createArcGISWMTSLayer(data, options) {
    var parser = new WMTSCapabilities();
    var result = parser.read(options.CapabilitiesXml);
    let tileMatrixSet = result.Contents.TileMatrixSet[0];
    let targetSRS = tileMatrixSet.SupportedCRS.replace(
      'urn:ogc:def:crs:',
      ''
    ).replace('::', ':');
    registerProj(targetSRS);
    var WMTSSourceOptions = optionsFromCapabilities(result, {
      layer: data.visibleLayers[0]
    });
    let targetProject = getProjection(WMTSSourceOptions.projection.code_);
    let _extent = [];
    // 用于获取 xml有问题的wmts服务的 extent
    try {
      let layers = result.Contents.Layer;
      let targetLayer = find(layers, function (elt) {
        if (data.visibleLayers && data.visibleLayers.length > 0) {
          return elt['Identifier'] === data.visibleLayers[0]
            ? data.visibleLayers[0]
            : data.name;
        } else {
          return data.name;
        }
      });
      _extent = transformExtent(
        targetLayer.WGS84BoundingBox,
        'EPSG:4326',
        WMTSSourceOptions.projection.code_
      );
    } catch (e) {
      _extent = WMTSSourceOptions.tileGrid.extent_;
    }
    //targetProject.setExtent(_extent);
    let wmtsSource = new WMTSSource({
      urls: WMTSSourceOptions.urls,
      requestEncoding: WMTSSourceOptions.requestEncoding,
      // url:(process.env.NODE_ENV === 'development' ? '' : "") + data.url,
      layer: WMTSSourceOptions.layer,
      tileLoadFunction: function (imageTile, src) {
        //拼接丢失的参数
        let params = getUrlParams(data.url);
        if (params?.length > 0) {
          for (let param of params) {
            src = addParamToUrl(src, param.name, param.value);
          }
        }
        //兼容代理地址
        let proxyIndex = src.indexOf('jsp?');
        if (proxyIndex !== -1) {
          // 存在代理
          if (src.indexOf('token') === -1 && src.indexOf('tk') === -1) {
            // 且没有token
            imageTile.getImage().src = src.replace('&', '?');
          } else {
            imageTile.getImage().src = src;
          }
        } else {
          imageTile.getImage().src = src;
        }
      },
      matrixSet: WMTSSourceOptions.matrixSet,
      format: WMTSSourceOptions.format,
      projection: targetProject,
      tileGrid: new WmtsTileGrid({
        // origin:[WMTSSourceOptions.tileGrid.origins_[0][1],WMTSSourceOptions.tileGrid.origins_[0][0]],
        // resolutions:WMTSSourceOptions.tileGrid.resolutions_,
        // matrixIds:WMTSSourceOptions.tileGrid.matrixIds_,
        origin: data.origin
          ? data.origin
          : WMTSSourceOptions.tileGrid.origins_[0],
        resolutions: data.resolutions
          ? data.resolutions
          : WMTSSourceOptions.tileGrid.resolutions_,
        matrixIds: data.matrixIds
          ? data.matrixIds
          : WMTSSourceOptions.tileGrid.matrixIds_,
        //  extent:WMTSSourceOptions.tileGrid.extent_,
        extent: _extent
      }),
      style: WMTSSourceOptions.style,
      wrapX: true
    });
    var layer = new TileLayer({
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      opacity: data.opacity,
      zIndex: data.mapIndex,
      source: wmtsSource,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      // initExtent:WMTSSourceOptions.tileGrid.extent_
      initExtent: transformExtent(_extent, targetProject, 'EPSG:4326')
    });
    layer.projection = targetSRS;
    return layer;
  }

  /**
   * 创建ArcGIS服务的WFS图层
   * @param {*} data
   * @param {*} options
   */
  createArcGISWFSLayer(data, options) {
    var layer = new VectorLayer({
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      opacity: data.opacity,
      zIndex: data.mapIndex,
      initExtent: options.initExtent,
      minResolution: data.minResolution,
      maxResolution: data.maxResolution,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      source: new VectorSource({
        format: new GML3(),
        url: (extent) => {
          return (
            this.proxy +
            data.url +
            '?service=WFS&' +
            'version=1.1.0&request=GetFeature&typename=' +
            data.visibleLayers +
            '&' +
            'outputFormat=gml3&srsname=' +
            this.map.getView().getProjection().getCode() +
            '&' +
            'bbox=' +
            extent.join(',')
          );
        },
        strategy: bboxStrategy
      })
    });
    //图层绑定样式getLayerStyle setLayerStyle方法
    this.styleManager = new StyleManager(this.map);
    this.styleManager.bindLayer(layer);
    return layer;
  }

  createBaiDuLayer() {
    // 自定义分辨率和瓦片坐标系
    var resolutions = [];
    var maxZoom = 18;
    // 计算百度使用的分辨率
    for (var i = 0; i <= maxZoom + 1; i++) {
      resolutions[i] = Math.pow(2, maxZoom - i);
    }
    var tilegrid = new TileGrid({
      origin: [0, 0], // 设置原点坐标
      resolutions: resolutions // 设置分辨率
    });
    // 创建百度行政区划
    var baiduSource = new TileImage({
      tileGrid: tilegrid,
      tileUrlFunction: function (tileCoord) {
        var z = tileCoord[0];
        var x = tileCoord[1];
        var y = tileCoord[2];
        // 百度瓦片服务url将负数使用M前缀来标识
        if (x < 0) {
          x = 'M' + -x;
        }
        if (y < 0) {
          y = 'M' + -y;
        }
        // street
        return (
          'http://online' +
          Number(Math.random() * 10) +
          '.map.bdimg.com/onlinelabel/?qt=tile&x=' +
          x +
          '&y=' +
          y +
          '&z=' +
          z +
          '&styles=pl&udt=20170620&scaler=1&p=1'
        );
      }
    });
    // 百度行政区划
    var baiduMapLayer = new TileLayer({
      source: baiduSource
    });
    return baiduMapLayer;
  }

  /**
   * 科学计数法转正常
   * @param {要转换的科学技术参数} param
   */
  scientificNotationToString(param) {
    let strParam = String(param);
    let flag = /e/.test(strParam);
    if (!flag) return param;

    // 指数符号 true: 正，false: 负
    let sysbol = true;
    if (/e-/.test(strParam)) {
      sysbol = false;
    }
    // 指数
    let index = Number(strParam.match(/\d+$/)[0]);
    // 基数
    let basis = strParam.match(/^[\d.]+/)[0].replace(/\./, '');

    if (sysbol) {
      return basis.padEnd(index + 1, 0);
    } else {
      return basis.padStart(index + basis.length, 0).replace(/^0/, '0.');
    }
  }

  /**
   * 创建百度矢量地图
   * @param {data}} data
   */
  createBaiDuVectorLayer() {
    var baidu_vector = BaiduVector({});
    return baidu_vector;
  }

  /**
   * 创建百度影像地图
   * @param {data}} data
   */
  createBaiDuImageLayer() {
    var baidu_image = BaiduImage({});
    return baidu_image;
  }

  /**
   * 创建百度路网地图
   * @param {data}} data
   */
  createBaiDuRoadLayer() {
    var baidu_road = BaiduRoad({});
    return baidu_road;
  }
}

export default LayerGenerater;
