/* eslint-disable no-prototype-builtins */
/*
 * @Author: liujh
 * @Date: 2020/8/24 9:09
 * @Description:
 */
/* 26 */
/***/

import * as Cesium from 'cesium_shinegis_earth';

import * as Util from './Tool/Util1';
import { BaseLayer } from './Layer/BaseLayer10';
import { GroupLayer } from './Layer/GroupLayer85';
import { TileLayer } from './Layer/TileLayer54';
import { GraticuleLayer } from './Layer/GraticuleLayer86';
import { CustomFeatureGridLayer } from './Layer/CustomFeatureGridLayer31';
import { CustomFeatureImageGridLayer } from './Layer/CustomFeatureImageGridLayer';
import { GeoServerWFSLayer } from './Layer/GeoServerWFSLayer';
import { POILayer } from './Layer/POILayer88';
import { GeoJsonLayer } from './Layer/GeoJsonLayer27';
import { GltfLayer } from './Layer/GltfLayer89';
import { Tiles3dLayer } from './Layer/Tiles3dLayer90';
import { S3MLayer } from './Layer/S3MLayer';
import { I3SLayer } from './Layer/I3SLayer';
import { KmlLayer } from './Layer/KmlLayer91';
import { CzmlLayer } from './Layer/CzmlLayer92';
import { TerrainLayer } from './Layer/TerrainLayer93';
import { DrawLayer } from './Layer/DrawLayer94';
//import {BaiduImageryProvider} from './Layer/BaiduImageryProvider95';
import { FeatureGridImageryProvider } from './Layer/FeatureGridImageryProvider96';
import { AmapImageryProvider } from './Layer/CustomProvider/AmapImageryProvider';
import { BaiduImageryProvider } from './Layer/CustomProvider/BaiduImageryProvider';
import { OSMBuildLayer } from './Layer/OSMBuildLayer';
import { getWMTSCapabilities } from './Tool/WMTSCapabilities';
import { ArcFeatureLayer } from './Layer/ArcFeatureLayer106';
import { ArcFeatureGridLayer } from './Layer/ArcFeatureGridLayer107';
import { ArcFeatureImageGridLayer } from './Layer/ArcFeatureImageGridLayer';
import { addParamToUrl, appendPath, getUrlParams } from '../utils/uitls';

//类库外部的类
let exLayer = {};

function getOneKey(arr) {
  let n = Math.floor(Math.random() * arr.length + 1) - 1;
  return arr[n];
}

let regLayerForConfig = function (type, layerClass) {
  exLayer[type] = layerClass;
};

//创建图层

let createLayer = function (item, viewer, serverURL, defaultKey) {
  let layer;
  if (item.url) {
    if (serverURL) {
      item.url = item.url.replace('$serverURL$', serverURL);
    }
    item.url = item.url
      .replace('$hostname$', location.hostname)
      .replace('$host$', location.host);
  }
  if (item.key === null || item.key === undefined || item.key.length === 0) {
    item.key = defaultKey;
  }

  switch (item.type) {
    //===============地图数组====================
    case 'group':
      //示例：{ "name": "电子地图", "type": "group","layers": [    ]}
      if (item.layers && item.layers.length > 0) {
        let arrVec = [];
        for (let index = 0; index < item.layers.length; index++) {
          let temp = createLayer(item.layers[index], viewer, serverURL);
          if (temp == null) continue;
          arrVec.push(temp);
        }
        item._layers = arrVec;
        layer = new GroupLayer(item, viewer);
      }
      break;
    case 'www_bing': //bing地图
    case 'www_osm': //OSM开源地图
    case 'www_google': //谷歌国内
    case 'www_gaode': //高德
    case 'gaode': //高德
    case 'www_baidu': //百度
    case 'baidu': //百度
    case 'www_tdt': //天地图
    case 'mapbox':
    case 'www_mapbox':
    case 'arcgis_cache':
    case 'arcgis':
    case 'tiled':
    case 'arcgis_tile':
    case 'sm_img': //超图底图支持
    case 'supermap_img':
    case 'wmts':
    case 'wmts_tdt':
    case 'tms':
    case 'wms':
    case 'xyz':
    case 'tile':
    case 'single':
    case 'image':
    case 'gee':
    case 'custom_tilecoord': //瓦片信息
    case 'custom_grid': //网格线
    case 'tdt': //Bi中使用，就是tdt类型
    case 'geoserver-wms':
    case 'geoserver-wmts':
    case 'tdt-sd':
      layer = new TileLayer(item, viewer);
      layer.isTile = true;
      break;
    case 'arcgis_dynamic':
    case 'dynamic': // 即arcgis_dynamic，bi中叫这个
      if (item.dynamic_img == true) {
        if (item.layerDefs) item.where = item.layerDefs;
        layer = new ArcFeatureImageGridLayer(item, viewer);
      } else {
        layer = new TileLayer(item, viewer);
        layer.isTile = true;
      }
      break;
    case 'feature':
    case 'feature-pbf':
      //过滤，兼容layerDefs属性名
      if (item.layerDefs) item.where = item.layerDefs;
      layer = new ArcFeatureGridLayer(item, viewer);
      break;
    case 'feature-pbf_old': //临时替换方案
      //瓦片图层
      if (item.originId) {
        let originLayer = viewer.shine.getLayer(item.originId, 'id');
        if (originLayer) {
          originLayer.layer.show = false;
        }
      }
      if (item.styletest) {
        item.symbol = {};
        item.symbol.styleOptions = item.styletest;
        layer = new ArcFeatureGridLayer(item, viewer);
      } else {
        viewer.shine.removeLayer(item, 'id');
        layer = new TileLayer(item, viewer);
        layer.isTile = true;
      }
      break;
    case 'www_poi':
      //在线poi数据
      layer = new POILayer(item, viewer);
      break;
    case 'custom_featuregrid':
      layer = new CustomFeatureGridLayer(item, viewer);
      break;
    case 'geoserver-wfs':
      //自定义矢量网格图层
      if (item.filter) item.where = item.filter;
      layer = new GeoServerWFSLayer(item, viewer);
      break;
    case 'custom_graticule':
      layer = new GraticuleLayer(item, viewer);
      break;

    case '3dtiles':
    case '3DTile':
      if (item.maximumScreenSpaceError == null) {
        item.maximumScreenSpaceError = 16;
      }
      if (item.skipLevelOfDetail == null) {
        item.skipLevelOfDetail = true;
      }

      layer = new Tiles3dLayer(item, viewer);
      break;
    case 'S3M':
      //item.url='http://192.168.20.171/provider/static/3d/default/S3M_CBD/cbd.scp'
      // item.url='http://192.168.20.171/provider/static/3d/default/S3M/Building@CBD_20210628_D/Building@CBD_20210628_D.scp'
      //item.url = 'http://192.168.20.171/provider/static/3d/default/S3M/Building@CBD_20210628_M/Building@CBD_20210628_M.scp'
      layer = new S3MLayer(item, viewer);
      break;
    case 'I3S':
      layer = new I3SLayer(item, viewer);
      break;
    case 'osmbuild':
      layer = new OSMBuildLayer(item, viewer);
      break;
    case 'gltf':
      /*            let opt = {
                      id:item.id,
                      visible:true,
                      name: item.name,
                      url: item.url,
                      position:{
                          x: parseInt(item.x),
                          y: parseInt(item.y),
                          z: parseInt(item.z),
                      },
                      scale: parseInt(item.scale),
                      minimumPixelSize: 30,
                      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                  };*/
      item.position = {
        x: item.x,
        y: item.y,
        z: item.z,
        heading: item.heading,
        pitch: item.pitch,
        roll: item.roll
      };
      layer = new GltfLayer(item, viewer);
      break;
    case 'geojson':
    case 'geoJson':
      /*     item.symbol = {
             "styleOptions":{
               "clampToGround": true,
               "scaleByDistance_farValue":0.5,
               "image":"http://localhost:8085/Assets/Images/ion-credit.png",
               "scaleByDistance_near":1000,
               "scale":1,
               "?fill": true,
               "opacity": 1,
               "?color": "#2E54FF",
               "?outlineColor": "#FED976",
               "?outlineWidth": 3,
               "?outlineOpacity": 1,
               "label":{
                 "field":"gnq_name",
                 "scaleByDistance_farValue":0.5,
                 "border":true,
                 "distanceDisplayCondition":true,
                 "color":"#ffffff",
                 "distanceDisplayCondition_near":0,
                 "font_size":25,
                 "distanceDisplayCondition_far":80000,
                 "border_color":"#000000",
                 "pixelOffset":[
                   0,
                   -25
                 ],
                 "scaleByDistance_nearValue":1,
                 "scaleByDistance":true,
                 "scaleByDistance_near":1000,
                 "scaleByDistance_far":80000
               },
               "scaleByDistance_nearValue":1,
               "scaleByDistance":true,
               "scaleByDistance_far":20000,
               "extrudedHeight": -250
             }
          }*/
      /*item.symbol = {
        "styleOptions":{
          "heightReference": "NONE",
          "scaleByDistance_farValue":0.5,
          "image":"Assets3D/img/mark1.png",
          "scaleByDistance_near":1000,
          "scale":1,
          "opacity": 1,
          "label":{
            "heightReference": "NONE",
            "field":"sbmc",
            "scaleByDistance_farValue":0.5,
            "border":true,
            "distanceDisplayCondition":true,
            "color":"#ffffff",
            "distanceDisplayCondition_near":0,
            "font_size":25,
            "distanceDisplayCondition_far":80000,
            "border_color":"#000000",
            "pixelOffset":[
              0,
              -40
            ],
            "scaleByDistance_nearValue":1,
            "scaleByDistance":true,
            "scaleByDistance_near":1000,
            "scaleByDistance_far":80000
          },
          "scaleByDistance_nearValue":1,
          "scaleByDistance":true,
          "scaleByDistance_far":20000,
        }
      }*/
      /*      item.symbol= {
            "type": "point",
              "styleOptions": {
              "image": "Assets3D/img/mark1.png",
                "scale": 1,
                "color": "#FFFFFF",
                "opacity": 1,
                "pixelSize": 1,
                "outlineColor": "#FED976",
                "outlineWidth": 1,
                "缩放配置说明": "配置缩放的最大距离到最小距离的参数，value配置缩放大小，默认1",
                "scaleByDistance": true,
                "scaleByDistance_far": 5000,
                "scaleByDistance_farValue": 1,
                "scaleByDistance_near": 0,
                "scaleByDistance_nearValue": 1,
                "距离显隐配置说明": "p配置最大距离显示范围及最小距离显示范围",
                "distanceDisplayCondition": true,
                "distanceDisplayCondition_far": 5000,
                "distanceDisplayCondition_near": 0,
                "heightReference": "NONE",
                "label": {
                "field": "sbmc",
                  "font_size": 25,
                  "color": "#FFFFFF",
                  "border": true,
                  "border_color": "#000000",
                  "pixelOffset": [
                  0,
                  -50
                ],
                  "background": true,
                  "background_color": "#fa8bfa",
                  "background_opacity": 1,
                  "缩放配置说明": "配置缩放的最大距离到最小距离的参数，value配置缩放大小，默认1",
                  "scaleByDistance": true,
                  "scaleByDistance_far": 5000,
                  "scaleByDistance_farValue": 1,
                  "scaleByDistance_near": -500,
                  "scaleByDistance_nearValue": 1,
                  "距离显隐配置说明": "p配置最大距离显示范围及最小距离显示范围",
                  "distanceDisplayCondition": true,
                  "distanceDisplayCondition_far": 3000,
                  "distanceDisplayCondition_near": -3000,
                  "heightReference": "NONE",
                  "opacity": 1
              }}}*/

      layer = new GeoJsonLayer(item, viewer);
      break;
    case 'geojson-draw':
      //基于框架内部draw绘制保存的geojson数据的加载
      layer = new DrawLayer(item, viewer);
      break;
    case 'kml':
      layer = new KmlLayer(item, viewer);
      break;
    case 'czml':
      layer = new CzmlLayer(item, viewer);
      break;
    case 'terrain':
      layer = new TerrainLayer(item, viewer);
      break;
    default:
      if (exLayer[item.type]) {
        layer = new exLayer[item.type](item, viewer);
      }
      if (layer == null) {
        console.error('配置中的图层未处理：' + JSON.stringify(item));
      }
      break;
  }

  /*    if (layer !== null) {
          //这句话，vue或部分架构中要注释，会造成内存溢出。(不能绑定到data)
          item._layer = layer
      }*/

  return layer;
};

//创建影像图层
let createImageryProvider = function (item, serverURL) {
  if (item.url) {
    if (serverURL) {
      item.url = item.url.replace('$serverURL$', serverURL);
    }
    item.url = item.url
      .replace('$hostname$', location.hostname)
      .replace('$host$', location.host);
  }

  let opts = {};
  for (let key in item) {
    if (item.hasOwnProperty(key)) {
      let value = item[key];
      if (value == null) continue;
      switch (key) {
        default:
          //直接赋值
          opts[key] = value;
          break;
        case 'crs':
          if (
            value == '4326' ||
            value.toUpperCase() == 'EPSG4326' ||
            value.toUpperCase() == 'EPSG:4326'
          ) {
            opts.tilingScheme = new Cesium.GeographicTilingScheme({
              numberOfLevelZeroTilesX: item.numberOfLevelZeroTilesX || 2,
              numberOfLevelZeroTilesY: item.numberOfLevelZeroTilesY || 1
            });
          } else {
            opts.tilingScheme = new Cesium.WebMercatorTilingScheme({
              numberOfLevelZeroTilesX: item.numberOfLevelZeroTilesX || 1,
              numberOfLevelZeroTilesY: item.numberOfLevelZeroTilesY || 1
            });
          }
          break;
        case 'rectangle':
          opts.rectangle = Cesium.Rectangle.fromDegrees(
            value.xmin,
            value.ymin,
            value.xmax,
            value.ymax
          );
          break;
      }
    }
  }

  if (opts.url && opts.proxy) {
    opts = Util.getProxyUrl(opts);
  }

  let layer;
  //let showGLayers, params, geo_params, showLayers;
  switch (opts.type_new || opts.type) {
    //===============地图底图====================
    case 'single':
    case 'image':
      layer = new Cesium.SingleTileImageryProvider(opts);
      break;
    case 'xyz':
      opts.customTags = opts.customTags || {};
      opts.customTags['z&1'] = function (imageryProvider, x, y, level) {
        return level + 1;
      };

      layer = new Cesium.UrlTemplateImageryProvider(opts);
      break;
    case 'tile':
    case 'tiled':
    case 'arcgis_tile':
      {
        opts = {
          ...item,
          url: appendPath(item.url, '/tile/{myZ}/{y}/{x}')
        };
        opts.customTags = opts.customTags || {};
        if (opts.crs === '4326') {
          opts.customTags['myZ'] = function (imageryProvider, x, y, level) {
            return level + 1;
          };
          opts.tilingScheme = new Cesium.GeographicTilingScheme({
            ellipsoid: Cesium.Ellipsoid.WGS84
          });
        } else {
          opts.customTags['myZ'] = function (imageryProvider, x, y, level) {
            return level;
          };
        }
        layer = new Cesium.UrlTemplateImageryProvider(opts);
      }
      break;
    case 'wms':
    case 'geoserver-wms':
      {
        opts.parameters = {
          format: 'image/png',
          transparent: 'true'
        };
        let showGLayers = opts.visibleLayers.join();
        opts.layers = showGLayers;
        layer = new Cesium.WebMapServiceImageryProvider(opts);
      }
      break;
    case 'tms':
      if (!opts.url)
        opts.url = Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII');
      layer = new Cesium.TileMapServiceImageryProvider(opts);
      break;
    case 'wmts':
      {
        if (!opts.url.includes('WMTS') && opts.url.includes('arcgis')) {
          opts.url += '/WMTS';
        }
        if (opts.authkey) {
          opts.url.includes('?')
            ? (opts.url += '&authkey=' + opts.authkey)
            : (opts.url += '?authkey=' + opts.authkey);
        }
        let params = getWMTSCapabilities(
          opts.url,
          opts.name,
          'arcgis',
          opts.tileMatrixLabels
        );
        params.url = params.RestfulUrl || params.KvpUrl;
        item.WMTSparams = params;
        //params.opts = opts;
        if (!params.url) {
          layer = undefined;
        } else {
          layer = new Cesium.WebMapTileServiceImageryProvider(params);
          if (opts.special_wmts) {
            layer.special_wmts = true;
          }
        }
      }
      break;
    case 'geoserver-wmts_old':
      {
        if (opts.authkey) {
          opts.url.includes('?')
            ? (opts.url +=
                '&SERVICE=WMTS&request=getCapabilities&authkey=' + opts.authkey)
            : (opts.url +=
                '?SERVICE=WMTS&request=getCapabilities&authkey=' +
                opts.authkey);
        } else {
          opts.url.includes('?')
            ? (opts.url += '&SERVICE=WMTS&request=getCapabilities')
            : (opts.url += '?SERVICE=WMTS&request=getCapabilities');
        }
        //let testUrl = "http://localhost:8085/Assets/1.xml"
        //let testName = "C_YGYX_530000_2021"
        //let geo_params = getWMTSCapabilities(testUrl, testName,'geoserver',opts.tileMatrixLabels);
        let geo_params = getWMTSCapabilities(
          opts.url,
          opts.visibleLayers[0],
          'geoserver',
          opts.tileMatrixLabels
        );
        if (geo_params.KvpUrl || geo_params.RestfulUrl) {
          geo_params.url = geo_params.KvpUrl || geo_params.RestfulUrl;
          //geo_params.opts = opts;
          item.WMTSparams = geo_params;
          layer = new Cesium.WebMapTileServiceImageryProvider(geo_params);
        } else {
          console.error('缺少WMTS瓦片请求地址');
        }
      }
      break;
    case 'geoserver-wmts':
      {
        let urlParams = getUrlParams(opts.url);
        if (urlParams?.length > 0) {
          for (let param of urlParams) {
            opts.url = addParamToUrl(opts.url, param.name, param.value);
          }
        }
        if (opts.authkey) {
          opts.url.includes('?')
            ? (opts.url +=
                '&SERVICE=WMTS&request=getCapabilities&authkey=' + opts.authkey)
            : (opts.url +=
                '?SERVICE=WMTS&request=getCapabilities&authkey=' +
                opts.authkey);
        } else {
          opts.url.includes('?')
            ? (opts.url += '&SERVICE=WMTS&request=getCapabilities')
            : (opts.url += '?SERVICE=WMTS&request=getCapabilities');
        }
        //let geo_params = getWMTSCapabilities(testUrl, testName,'geoserver',opts.tileMatrixLabels,"ChinaPublicServicesCGCS2000_C_YGYX_530000_2021");
        let geo_params = getWMTSCapabilities(
          opts.url,
          opts.visibleLayers[0],
          'geoserver',
          opts.tileMatrixLabels,
          opts.matrixSet
        );
        if (geo_params.KvpUrl || geo_params.RestfulUrl) {
          geo_params.url = geo_params.KvpUrl || geo_params.RestfulUrl;
          //geo_params.opts = opts;
          item.WMTSparams = geo_params;
          layer = new Cesium.WebMapTileServiceImageryProvider(geo_params);
        } else {
          console.error('缺少WMTS瓦片请求地址');
        }
      }
      break;
    case 'mapbox': //mapbox
    case 'www_mapbox':
      layer = new Cesium.MapboxImageryProvider(opts);
      break;
    case 'arcgis':
    case 'arcgis_dynamic':
    case 'dynamic': // 即arcgis_dynamic，bi中叫这个
      {
        if (item.dynamic_img == true) {
          layer = new FeatureGridImageryProvider(opts);
          break;
        }
        let showLayers = opts.visibleLayers.join();
        opts.layers = showLayers;
        if ((opts.type_new || opts.type) === 'dynamic' && opts.layerDefs) {
          let layerDefs = {};
          let layersString = opts.visibleLayers;
          layersString.forEach((e) => {
            layerDefs[e] = opts.layerDefs;
          });
          layerDefs = JSON.stringify(layerDefs);
          opts.layerDefs = layerDefs;
        }
        layer = new Cesium.ArcGisMapServerImageryProvider(opts);
        if (opts.special_arcgis) {
          layer.special_arcgis = true;
        }
      }
      break;
    case 'feature-pbf_old': //临时替换方案
      if (opts.styletest) {
        layer = new FeatureGridImageryProvider(opts);
      } else {
        let mapServerUrl = opts.mapServerUrl;
        if (mapServerUrl) {
          let tempOpts = Object.assign({}, opts);
          tempOpts.url = mapServerUrl;
          layer = new Cesium.ArcGisMapServerImageryProvider(tempOpts);
        } else {
          return;
        }
      }
      break;
    /*    case 'sm_img': //超图底图支持
    case 'supermap_img':
      layer = new Cesium.SuperMapImageryProvider(opts);
      break;*/
    case 'arcgis_cache':
      // 示例 /google/_alllayers/L{arc_z}/R{arc_y}/C{arc_x}.jpg
      if (!Cesium.UrlTemplateImageryProvider.prototype.padLeft0) {
        Cesium.UrlTemplateImageryProvider.prototype.padLeft0 = function (
          numStr,
          n
        ) {
          numStr = String(numStr);
          let len = numStr.length;
          while (len < n) {
            numStr = '0' + numStr;
            len++;
          }
          return numStr;
        };
      }
      opts.customTags = {
        //小写
        arc_x: function arc_x(imageryProvider, x) {
          return imageryProvider.padLeft0(x.toString(16), 8);
        },
        arc_y: function arc_y(imageryProvider, x, y) {
          return imageryProvider.padLeft0(y.toString(16), 8);
        },
        arc_z: function arc_z(imageryProvider, x, y, level) {
          return imageryProvider.padLeft0(level.toString(), 2);
        },
        //大写
        arc_X: function arc_X(imageryProvider, x) {
          return imageryProvider.padLeft0(x.toString(16), 8).toUpperCase();
        },
        arc_Y: function arc_Y(imageryProvider, x, y) {
          return imageryProvider.padLeft0(y.toString(16), 8).toUpperCase();
        },
        arc_Z: function arc_Z(imageryProvider, x, y, level) {
          return imageryProvider.padLeft0(level.toString(), 2).toUpperCase();
        }
      };
      layer = new Cesium.UrlTemplateImageryProvider(opts);
      break;
    /*case "wmts_tdt": {
        let maxLevel = 15
        if (item.crs === '4490') {
            //cgcs2000
            let matrixIds = new Array(maxLevel)
            for (let z = 0; z <= maxLevel; z++) {
                matrixIds[z] = (z + 1).toString()
            }

            //wmts:       "url": "http://192.168.11.149:6080/arcgis/rest/services/TXGHJG/GHYJJBNT_GHTZHYJJBNTFW/MapServer/WMTS/tile/1.0.0/TXGHJG_GHYJJBNT_GHTZHYJJBNTFW/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}",
            //http://61.175.211.102/arcgis/rest/services/wzmap/map/MapServer/WMTS/tile/1.0.0/wzmap_map/default/default028mm/6/26/52.png
            //wmts_tdt:   "url": "http://61.175.211.102/arcgis/rest/services/wzmap/map/MapServer/WMTS/tile/1.0.0/wzmap_map/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png",
            //http://61.175.211.102/arcgis/rest/services/wzmap/map/MapServer/WMTS/tile/1.0.0/wzmap_map/default/default028mm/11/353/1711.png
            layer = new Cesium.WebMapTileServiceImageryProvider({
                url: item.url,
                layer: item.layer,
                style: item.style,
                format: item.format,
                tileMatrixSetID: item.tileMatrixSetID,
                tileMatrixLabels: matrixIds,
                tilingScheme: new Cesium.GeographicTilingScheme(), //WebMercatorTilingScheme、GeographicTilingScheme
                // maximumLevel: 14
            })
            //this.viewer.imageryLayers.add(this.layer)

            //viewer.imageryLayers.add(new Cesium.ImageryLayer(layer, { minimumTerrainLevel: 10}))
        } else {
            //墨卡托
            let matrixIds = new Array(maxLevel)
            for (let z = 0; z <= maxLevel; z++) {
                matrixIds[z] = z.toString()
            }
            let _url = '//t{s}.tianditu.gov.cn/' + _layer + '_w/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=' + _layer + '&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles&tk=' + _key

            if (opts.proxy) //存在代理时
                _url = Util.getProxyUrl({
                    url: _url.replace('{s}', '0'),
                    proxy: opts.proxy
                }).url

            layer = new Cesium.WebMapTileServiceImageryProvider({
                url: _url,
                layer: _layer,
                style: 'default',
                format: 'tiles',
                tileMatrixSetID: 'w',
                subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
                tileMatrixLabels: matrixIds,
                tilingScheme: new Cesium.WebMercatorTilingScheme(),
                maximumLevel: maxLevel
            })
        }
    }

        break;*/

    //===============互联网常用地图====================

    case 'www_tdt':
    case 'tdt': //Bi中使用，就是tdt类型
    case 'tdt-sd': //兼容了山东类型的天地图
      //天地图
      {
        let _layer;
        let maxLevel;
        let tileMatrixSetID;
        let customStyle;
        let customFormat;

        let defaultMaxLevel = 18;
        if (opts.maxLevel) {
          maxLevel = opts.maxLevel;
        } else {
          maxLevel = defaultMaxLevel;
        }
        if (opts.visibleLayers[0]) {
          _layer = opts.visibleLayers[0];
        } else if (opts.layerIdentifier) {
          _layer = opts.layerIdentifier;
        } else if (opts.url.indexOf('vec_c') != -1) {
          _layer = 'vec';
        } else if (opts.url.indexOf('vec_z') != -1) {
          _layer = 'cva';
        } else if (opts.url.indexOf('cva_c') != -1) {
          _layer = 'cva';
        } else if (opts.url.indexOf('vec_w') != -1) {
          _layer = 'vec';
        } else if (opts.url.indexOf('img_c') != -1) {
          _layer = 'img';
        } else if (opts.url.indexOf('img_w') != -1) {
          _layer = 'img';
        } else if (opts.url.indexOf('img_z') != -1) {
          _layer = 'cia';
        } else if (
          opts.url.indexOf('cia_w') != -1 ||
          opts.url.indexOf('cia_c') != -1
        ) {
          _layer = 'cia';
        } else if (opts.url.indexOf('ter_d') != -1) {
          _layer = 'ter';
        } else if (
          opts.url.indexOf('ibo_w') != -1 ||
          opts.url.indexOf('ibo_c') != -1
        ) {
          _layer = 'ibo';
        } else if (opts.url.indexOf('ter_z') != -1) {
          _layer = 'cta';
        }

        if (opts.tileMatrixSetName) {
          tileMatrixSetID = opts.tileMatrixSetName;
        } else if (opts.tileMatrixSetIdentifier) {
          tileMatrixSetID = opts.tileMatrixSetIdentifier;
        }
        if (opts.layerStyle) {
          customStyle = opts.layerStyle;
        }
        if (opts.layerFormat) {
          customFormat = opts.layerFormat;
        }

        /* let _key;
        if (Array.isArray(opts.key)) {
          _key = getOneKey(opts.key); //默认
        } else {
          _key = '73858d998645bac1848d7d94ceb1e87c';
        } */
        //let _url = opts.url + '&service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=' + _layer + '&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles';
        let _url =
          opts.url +
          '&service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=' +
          _layer +
          '&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}';
        //let _url = '//t{s}.tianditu.gov.cn/' + _layer + '_w/wmts?service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=' + _layer + '&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles&tk=' + _key;
        if (opts.proxy) {
          //存在代理时
          _url = Util.getProxyUrl({
            url: _url.replace('{s}', '0'),
            proxy: opts.proxy
          }).url;
        }

        let matrixIds = new Array(maxLevel);
        for (let z = 0; z <= maxLevel; z++) {
          matrixIds[z] = (z + 1).toString();
        }

        /*      layer = new Cesium.WebMapTileServiceImageryProvider({
              url: _url,
              layer: "zjvmap",
              style: "tdt_qingxinyangshi_2017",
              format: 'image/png',
              tileMatrixSetID: "default028mm",
              subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
              tileMatrixLabels: matrixIds,
              tilingScheme: new Cesium.GeographicTilingScheme(), //WebMercatorTilingScheme、GeographicTilingScheme
              maximumLevel: maxLevel,
            });*/

        if (item.crs === '4326') {
          //wgs84
          let matrixIds = new Array(maxLevel);
          for (let z = 0; z <= maxLevel; z++) {
            matrixIds[z] = (z + 1).toString();
          }
          layer = new Cesium.WebMapTileServiceImageryProvider({
            url: _url,
            layer: _layer,
            style: customStyle ? customStyle : 'default',
            format: customFormat ? customFormat : 'tiles',
            tileMatrixSetID: tileMatrixSetID ? tileMatrixSetID : 'c',
            subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
            tileMatrixLabels: matrixIds,
            tilingScheme: new Cesium.GeographicTilingScheme(), //WebMercatorTilingScheme、GeographicTilingScheme
            maximumLevel: maxLevel
          });
          //layer.defaultSaturation = 0.2
          //layer.hue = 3
          //layer.contrast = -1.2
        } else {
          //墨卡托a
          let matrixIds = new Array(maxLevel);
          for (let z = 0; z <= maxLevel; z++) {
            matrixIds[z] = z.toString();
          }
          layer = new Cesium.WebMapTileServiceImageryProvider({
            url: _url,
            layer: _layer,
            style: customStyle ? customStyle : 'default',
            format: customFormat ? customFormat : 'tiles',
            tileMatrixSetID: tileMatrixSetID ? tileMatrixSetID : 'w',
            subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
            tileMatrixLabels: matrixIds,
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: maxLevel
          });
        }
      }
      break;
    /*    case 'tdt-sd':{
          // let paramsCapabilities=getWMTSCapabilities(opts.url,opts.name);
          let _layer;
          let maxLevel;
          let defaultMaxLevel = 18;
          if (opts.maxLevel) {
            maxLevel = opts.maxLevel;
          } else {
            maxLevel = defaultMaxLevel;
          }
          if (opts.layerIdentifier) {
            _layer = opts.layerIdentifier;
          } else {
            _layer = opts.visibleLayers[0];
          }
          if (item.crs === '4326') {
            //wgs84
            let matrixIds = new Array(18);
            for (let z = 0; z <= 18; z++) {
              matrixIds[z] = (z + 1).toString();
            }
            let _url = opts.url + '&service=WMTS&version=1.0.0&request=GetTile&tilematrix={TileMatrix}&layer=' + _layer + '&style={style}&tilerow={TileRow}&tilecol={TileCol}&tilematrixset={TileMatrixSet}&format=tiles';

            if (opts.proxy) //存在代理时
            {
              _url = Util.getProxyUrl({
                url: _url.replace('{s}', '0'),
                proxy: opts.proxy
              }).url;
            }

            layer = new Cesium.WebMapTileServiceImageryProvider({
              url: _url,
              layer: _layer,
              style: 'default',
              format: 'tiles',
              tileMatrixSetID: 'c',
              subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
              tileMatrixLabels: matrixIds,
              tilingScheme: new Cesium.GeographicTilingScheme(), //WebMercatorTilingScheme、GeographicTilingScheme
              maximumLevel: maxLevel
            });
          }
        }
          break;*/
    case 'www_gaode':
    case 'gaode':
      {
        let tempOptsG = Object.assign({}, opts);
        let urlParams = Util.expandUrl(tempOptsG.url);
        if (urlParams.subdomainsArray) {
          tempOptsG.subdomains = urlParams.subdomainsArray;
          tempOptsG.url = urlParams.url;
        } else {
          tempOptsG.url = urlParams.url;
        }
        layer = new AmapImageryProvider(tempOptsG);
      }
      break;
    /*    case 'gaode': {
          //高德
          let _url;
          let layerType = opts.visibleLayers[0]
          if(layerType){
            switch (layerType) {
              case 'vec':
              default:
                //style=7是立体的，style=8是灰色平面的
                _url = '//' +'wprd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}';
                //_url = '//' + (opts.bigfont ? 'wprd' : 'webrd') + '0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=7&x={x}&y={y}&z={z}';
                break;
              case 'img_d':
                _url = '//webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}';
                break;
              case 'img_z':
                _url = '//webst0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8';
                break;
              case 'time': {
                let time = new Date().getTime();
                _url = '//tm.amap.com/trafficengine/mapabc/traffictile?v=1.0&;t=1&x={x}&y={y}&z={z}&&t=' + time;
                break;
              }
            }
          }else{
            _url = opts.url
          }


          if (opts.proxy) //存在代理时
          {
            _url = Util.getProxyUrl({
              url: _url.replace('{s}', '1'),
              proxy: opts.proxy
            }).url;
          }

          layer = new Cesium.UrlTemplateImageryProvider({
            url: _url,
            subdomains: ['1', '2', '3', '4'],
            maximumLevel: 18
          });
        }
          break;*/

    case 'www_baidu':
    case 'baidu':
      //百度
      layer = new BaiduImageryProvider(opts);
      break;
    case 'www_google':
      {
        //谷歌国内
        let _url;

        if (item.crs === '4326' || item.crs === 'wgs84') {
          //wgs84   无偏移
          switch (opts.layer) {
            default:
            case 'img_d':
              _url = '//www.google.cn/maps/vt?lyrs=s&x={x}&y={y}&z={z}';
              break;
          }
        } else {
          //有偏移
          switch (opts.layer) {
            case 'vec':
            default:
              _url =
                '//mt{s}.google.cn/vt/lyrs=m@207000000&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=Galile';
              break;
            case 'img_d':
              _url =
                '//mt{s}.google.cn/vt/lyrs=s&hl=zh-CN&gl=CN&x={x}&y={y}&z={z}&s=Gali';
              break;
            case 'img_z':
              _url =
                '//mt{s}.google.cn/vt/imgtp=png32&lyrs=h@207000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galil';
              break;
            case 'ter':
              _url =
                '//mt{s}.google.cn/vt/lyrs=t@131,r@227000000&hl=zh-CN&gl=cn&x={x}&y={y}&z={z}&s=Galile';
              break;
          }
        }

        if (opts.proxy) {
          //存在代理时
          _url = Util.getProxyUrl({
            url: _url.replace('{s}', '1'),
            proxy: opts.proxy
          }).url;
        }

        layer = new Cesium.UrlTemplateImageryProvider({
          url: _url,
          subdomains: ['1', '2', '3'],
          maximumLevel: 20
        });
      }
      break;
    case 'www_osm':
      {
        //OSM开源地图
        let _url = '//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        if (opts.proxy) {
          //存在代理时
          _url = Util.getProxyUrl({
            url: _url.replace('{s}', 'a'),
            proxy: opts.proxy
          }).url;
        }

        layer = new Cesium.UrlTemplateImageryProvider({
          url: _url,
          subdomains: 'abc',
          maximumLevel: 18
        });
      }
      break;
    case 'www_bing':
      {
        //bing地图
        let _key;
        if (Array.isArray(opts.key)) {
          _key = getOneKey(opts.key); //默认
        } else {
          _key = opts.key.www_bing;
        }
        let _url = 'https://dev.virtualearth.net';
        if (opts.proxy) {
          //存在代理时
          _url = Util.getProxyUrl({
            url: _url,
            proxy: opts.proxy
          }).url;
        }

        //无标记影像 Aerial,
        //有英文标记影像   AerialWithLabels,
        //矢量道路  Road
        //OrdnanceSurvey,
        //CollinsBart
        let style = opts.layer || Cesium.BingMapsStyle.Aerial;
        layer = new Cesium.BingMapsImageryProvider({
          url: _url,
          //key: opts.key ||opts.defaultKey.www_bing,
          key: _key,
          mapStyle: style
        });
      }
      break;

    //===============内部定义的图层====================
    case 'custom_grid':
      //网格线
      opts.cells = opts.cells || 2;
      opts.color = Cesium.Color.fromCssColorString(
        opts.color || 'rgba(255,255,255,0.5)'
      );
      opts.glowWidth = opts.glowWidth || 3;
      opts.glowColor = Cesium.Color.fromCssColorString(
        opts.glowColor || 'rgba(255,255,255,0.1)'
      );
      opts.backgroundColor = Cesium.Color.fromCssColorString(
        opts.backgroundColor || 'rgba(0,0,0,0)'
      );

      layer = new Cesium.GridImageryProvider(opts);
      break;
    case 'custom_tilecoord':
      //瓦片信息
      layer = new Cesium.TileCoordinatesImageryProvider(opts);
      break;
    case 'custom_featuregrid':
    case 'feature':
    case 'geoserver-wfs':
    case 'feature-pbf':
      //自定义矢量网格图层
      //opts.minimumLevel = 13
      layer = new FeatureGridImageryProvider(opts);
      break;
    case 's3m':
      //  layer = new S3MTilesLayerProvider(opts) //临时
      break;
    default: //1519 1520 1521
      console.error('config配置图层未处理:' + item);
      break;
  }
  if (layer) layer.config = opts;
  return layer;
};

let layer = {
  BaseLayer,
  GroupLayer,
  TileLayer,
  GraticuleLayer,
  ArcFeatureLayer,
  ArcFeatureGridLayer,
  ArcFeatureImageGridLayer,
  CustomFeatureGridLayer,
  CustomFeatureImageGridLayer,
  GeoServerWFSLayer,
  POILayer,
  GeoJsonLayer,
  GltfLayer,
  Tiles3dLayer,
  S3MLayer,
  KmlLayer,
  CzmlLayer,
  TerrainLayer,
  DrawLayer,
  BaiduImageryProvider,
  AmapImageryProvider,
  FeatureGridImageryProvider,
  regLayerForConfig,
  createLayer,
  createImageryProvider
};
//export { regLayerForConfig,createLayer,createImageryProvider as Layer }
export { layer as Layer };
