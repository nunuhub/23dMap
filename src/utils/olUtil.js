/* eslint-disable radix */
/**
 * 此JS文件存放与openLayers相关的公共方法或信息
 */

import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style,
  Icon,
  Text
} from 'ol/style.js';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import WKT from 'ol/format/WKT';
import { getCenter, extend } from 'ol/extent.js';
import { registerProj } from '../map-core/CustomProjection.js';
import GeoJSON from 'ol/format/GeoJSON';
import { transform } from 'ol/proj';
import Geometry from 'ol/geom/Geometry';
import { Vector as VectorLayer } from 'ol/layer.js';
import { Vector as VectorSource } from 'ol/source.js';
import Overlay from 'ol/Overlay';
import $ from 'jquery';
import { newGuid } from './common.js';
import { Message } from 'element-ui';
import { getuuid } from '../map-core/olPlot/Utils/utils';
import centerOfMass from '@turf/center-of-mass';
import { getGeom } from '@turf/invariant';
import { WMTSCapabilities } from 'ol/format';
import { optionsFromCapabilities } from 'ol/source/WMTS.js';
import { getWidth } from 'ol/extent';
import { MultiPolygon } from 'ol/geom';
import { nearestPointOnLine, lineString as turfLineString } from '@turf/turf';
import { LineString } from 'ol/geom.js';
import LayerGroup from 'ol/layer/Group';

/**
 * 选择样式
 */
export let selectStyles = function (feature) {
  let styles = [];
  styles.push(
    new Style({
      fill: new Fill({
        color: 'rgba(255,0,0, 0.3)'
      }),
      stroke: new Stroke({
        color: '#FF0000',
        width: 4
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#FF0000'
        })
      })
    })
  );
  //中心点样式 暂时注释
  if (feature.getGeometry().getType() === 'LineString') {
    /*styles.push(
      new Style({
        geometry: new Point(feature.getGeometry().getCoordinateAt(0.5)),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#FF0000'
          })
        })
      })
    );*/
  } else if (
    feature.getGeometry().getType() === 'Polygon' ||
    feature.getGeometry().getType() === 'MultiPolygon'
  ) {
    /*styles.push(
      new Style({
        geometry: new Point(getCenter(feature.getGeometry().getExtent())),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#FF0000'
          })
        })
      })
    );*/
  }
  return styles;
};

/**
 * 默认样式
 */
export let defaultStyles = function (feature) {
  let styles = [];
  styles.push(
    new Style({
      fill: new Fill({
        color: 'rgba(255,255,0, 0.2)'
      }),
      stroke: new Stroke({
        color: '#FF0000',
        width: 3
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#FF0000'
        })
      })
    })
  );
  if (feature.getGeometry().getType() === 'LineString') {
    styles.push(
      new Style({
        geometry: new Point(feature.getGeometry().getCoordinateAt(0.5)),
        image: new Icon({
          anchor: [0.5, 0.9],
          src: 'static/img/location.png' // 图片路径
        })
      })
    );
  } else if (
    feature.getGeometry().getType() === 'Polygon' ||
    feature.getGeometry().getType() === 'MultiPolygon'
  ) {
    styles.push(
      new Style({
        geometry: new Point(getCenter(feature.getGeometry().getExtent())),
        image: new Icon({
          anchor: [0.5, 1],
          src: 'static/img/location.png' // 图片路径
        })
      })
    );
  }
  return styles;
};

/**
 * 查询功能中，查询到的geometry的展示样式
 */
let queryFill = new Fill({
  color: [255, 0, 0, 0.3]
});
let queryStroke = new Stroke({
  color: [255, 0, 0],
  width: 3
});
export let queryStyle = new Style({
  fill: queryFill,
  stroke: queryStroke,
  image: new CircleStyle({
    fill: new Fill({
      color: [255, 0, 0]
    }),
    radius: 7
  })
});

let CSCS2000ProjCodes = [
  4490, 4543, 4544, 4545, 4546, 4547, 4548, 4549, 4550, 4551, 4552, 4553, 4554,
  4534, 4535, 4536, 4537, 4538, 4539, 4540, 4541, 4542, 4513, 4514, 4515, 4516,
  4517, 4518, 4519, 4520, 4521, 4522, 4523, 4524, 4525, 4526, 4527, 4528, 4529,
  4530, 4531, 4532, 4533, 4507, 4508, 4509, 4510, 4511, 4512, 4502, 4503, 4504,
  4505, 4506, 4491, 4492, 4493, 4494, 4495, 4496, 4497, 4498, 4499, 4500, 4501
];
let XiAn80ProjCodes = [
  4610, 2379, 2380, 2381, 2382, 2383, 2384, 2385, 2386, 2387, 2388, 2389, 2390,
  2370, 2371, 2372, 2373, 2374, 2375, 2376, 2377, 2378, 2349, 2350, 2351, 2352,
  2353, 2354, 2355, 2356, 2357, 2358, 2359, 2360, 2361, 2362, 2363, 2364, 2365,
  2366, 2367, 2368, 2369, 2343, 2344, 2345, 2346, 2347, 2348, 2338, 2339, 2340,
  2341, 2342, 2327, 2328, 2329, 2330, 2331, 2332, 2333, 2334, 2335, 2336, 2337
];

/**
 * 根据作坐标系wkid获取名称
 * @param {*} wkid EPSG
 */
export function getProjectionName(wkid) {
  if (
    wkid === 4326 ||
    wkid === 3857 ||
    wkid === 102100 ||
    wkid === 102113 ||
    wkid === 900913
  ) {
    return 'WGS84';
  } else if (CSCS2000ProjCodes.indexOf(Number(wkid)) > -1) {
    return 'CGCS2000';
  } else if (XiAn80ProjCodes.indexOf(Number(wkid)) > -1) {
    return 'xian80';
  } else {
    return 'other';
  }
}

/**
 * 根据坐标系代码获取esri坐标系，
 * @param {*} projCode 如EPSG:4490
 */
export function getEsriSpatialReference(projCode) {
  let sSpatialReference;
  if (projCode) {
    let upCode = projCode.toUpperCase();
    if (upCode.indexOf('EPSG:') === 0) {
      sSpatialReference = projCode.replace('EPSG:', '');
    } else {
      sSpatialReference = projCode;
    }
  }
  return sSpatialReference;
}

/**
 * 定位图形
 * @param {} map
 * @param {*} geometrys
 */
export function locationGeometry(map, geometrys) {
  if (geometrys && geometrys.length > 0 && map) {
    let ext = null;
    for (let index = 0; index < geometrys.length; index++) {
      const geo = geometrys[index];
      if (!geo) {
        continue;
      }
      if (ext === null) {
        ext = geo.getExtent();
      } else {
        ext = extend(ext, geo.getExtent());
      }
    }

    if (ext !== null) {
      let resolution = map.getView().getResolutionForExtent(ext) * 2;
      let minResolution = map
        .getView()
        .getResolutionForZoom(map.getView().getMaxZoom());
      resolution = resolution > minResolution ? resolution : minResolution;
      if (resolution === Infinity) resolution = minResolution;
      map.getView().animate({
        center: getCenter(ext),
        resolution: resolution
      });
      // let res = map.getView().getResolutionForExtent(ext, map.getSize());
    }
  }
}

/**
 * 把geometry转成地理坐标系的geometry
 * @param {*} geometry
 * @param {*} sourceProject geometry的当前坐标系
 */
export function projectGeography(geometry, sourceProject) {
  let targetGeo = null;
  if (geometry && sourceProject) {
    let wkid = '';
    if (sourceProject.indexOf('EPSG:') === 0) {
      wkid = sourceProject.replace('EPSG:', '');
      let tagProjCode;
      // 如果图形源坐标系是地理坐标系，直接返回geometry
      if (
        (sourceProject && sourceProject.indexOf('4214') > -1) ||
        sourceProject.indexOf('4326') > -1 ||
        sourceProject.indexOf('4490') > -1 ||
        sourceProject.indexOf('4555') > -1 ||
        sourceProject.indexOf('4610') > -1
      ) {
        targetGeo = geometry.clone();
      } else if (CSCS2000ProjCodes.indexOf(Number(wkid)) > -1) {
        // 如果是国家2000投影坐标系，直接转国家2000地理坐标系
        tagProjCode = 'EPSG:4490';
      } else if (XiAn80ProjCodes.indexOf(Number(wkid)) > -1) {
        tagProjCode = 'EPSG:4610';
      } else if (
        wkid === '3857' ||
        wkid === '102100' ||
        wkid === '102113' ||
        wkid === '900913'
      ) {
        tagProjCode = 'EPSG:4326';
      }
      if (tagProjCode) {
        registerProj(tagProjCode);
        targetGeo = geometry.clone().transform(sourceProject, tagProjCode);
      }
    } else {
      targetGeo = geometry.clone();
    }
  }
  return targetGeo;
}

export function readFeatureFromGeoJson(map, geoJson) {
  if (!geoJson.type) {
    geoJson = JSON.parse(geoJson);
  }
  let geoJsonCrs = geoJson.crs;
  let inCrs = geoJsonCrs ? geoJsonCrs.properties.name : '';
  inCrs = inCrs.replace('urn:ogc:def:crs:', '').replace('::', ':');
  if (inCrs) {
    // 坐标系不存在则注册,存在不操作
    registerProj(inCrs);
  }
  let outCrs = map.getView().getProjection().getCode();
  let options = {
    dataProjection: inCrs,
    featureProjection: outCrs
  };
  let features = new GeoJSON(options).readFeatures(geoJson);
  return features;
}

// 根据geojson添加临时层的数据
export function locateGeoJson(map, geoJson, defaultInCrs) {
  let features = addGeoJson(map, geoJson, defaultInCrs);
  if (features && features.length > 0) {
    // 获取包含所有图形的范围边界
    let extent = [Infinity, Infinity, -Infinity, -Infinity]; // [minX,minY,maxX,maxY]
    features.forEach((feature) => {
      feature.setStyle(defaultStyles(feature));
      let ex = feature.getGeometry().getExtent();
      if (ex[0] < extent[0]) {
        extent[0] = ex[0];
      }
      if (ex[1] < extent[1]) {
        extent[1] = ex[1];
      }
      if (ex[2] > extent[2]) {
        extent[2] = ex[2];
      }
      if (ex[3] > extent[3]) {
        extent[3] = ex[3];
      }
    });
    if (extent[0] === extent[2] && extent[1] === extent[3]) {
      map.getView().setCenter([extent[0], extent[1]]);
    } else {
      let size = [map.getSize()[0] * 0.7, map.getSize()[1] * 0.7];
      map.getView().fit(extent, {
        size: size
      });
    }
  }
  return features;
}

export function addGeoJson(map, geoJson, defaultInCrs) {
  if (geoJson && map) {
    if (!geoJson.type) {
      geoJson = JSON.parse(geoJson);
    }
    let geoJsonCrs = geoJson.crs;
    let inCrs = geoJsonCrs ? geoJsonCrs.properties.name : defaultInCrs;
    inCrs = inCrs.replace('urn:ogc:def:crs:', '').replace('::', ':');
    if (inCrs) {
      // 坐标系不存在则注册,存在不操作
      registerProj(inCrs);
    }
    let outCrs = map.getView().getProjection().getCode();
    let options = {
      dataProjection: inCrs,
      featureProjection: outCrs
    };
    let features = new GeoJSON(options).readFeatures(geoJson);
    let source = map.getLayerById('drawLayer').getSource();
    /*let tempFeatrues = source.getFeatures();
    if (tempFeatrues && tempFeatrues.length > 0) {
      // 清除可能已经存在的临时层图形
      tempFeatrues.forEach((f) => {
        source.removeFeature(f);
      });
    }*/
    source.addFeatures(features);
    return features;
  } else {
    console.error('参数缺失');
  }
}

export function flashFeatures(map, features, options) {
  let source = map.getLayerById('drawLayer').getSource();
  let hideStyle = getStyleFormGeneralStyle({
    fillColor: 'rgba(0,0,0,0)',
    strokeColor: 'rgba(0,0,0,0)'
  });
  let defaultStyle = getStyleFormGeneralStyle({
    fillColor: 'rgba(0,0,0,0)',
    strokeColor: '#00FFFF',
    strokeWidth: 2
  });
  let showStyle =
    options && options.style
      ? getStyleFormGeneralStyle(options.style)
      : defaultStyle;
  let flashStyle =
    options && options.flashStyle
      ? getStyleFormGeneralStyle(options.flashStyle)
      : showStyle;
  let i = 0;
  let operateFeature = function (features, operate) {
    if (features instanceof Array) {
      for (let feature of features) {
        operate(feature);
      }
    } else {
      operate(features);
    }
  };
  let Hide = function () {
    operateFeature(features, (feature) => {
      feature.setStyle(hideStyle);
    });
    setTimeout(Show, 300);
  };
  let Show = function () {
    operateFeature(features, (feature) => {
      feature.setStyle(flashStyle);
    });
    i++;
    if (i < 4) {
      setTimeout(Hide, 200);
    } else if (options && options.isHideAfterFlash) {
      operateFeature(features, (feature) => {
        feature.setStyle(hideStyle);
        source.removeFeature(feature);
      });
    } else {
      operateFeature(features, (feature) => {
        feature.setStyle(showStyle);
      });
    }
  };
  Hide();
}

// 定位到单个临时图形
export function locateTempGraphic(map, obj) {
  if (!obj || !map) {
    console.error('参数缺失');
    return;
  }
  let keys = Object.keys(obj);
  let layers = map.getLayers().getArray();
  let source;
  layers.forEach((lyr) => {
    if (lyr.values_.id === 'drawLayer') {
      source = lyr.getSource();
    }
  });
  let features = source.getFeatures();
  features.forEach((f) => {
    keys.forEach((key) => {
      let val = f.values_[key];
      if (val === obj[key]) {
        let ex = f.getGeometry().getExtent();
        map.getView().fit(ex, {
          size: map.getSize()
        });
      }
    });
  });
}

export function removeTempGraphic(map, obj) {
  if (!obj || !map) {
    console.error('参数缺失');
    return;
  }
  let keys = Object.keys(obj);
  let layers = map.getLayers().getArray();
  let source;
  layers.forEach((lyr) => {
    if (lyr.values_.id === 'drawLayer') {
      source = lyr.getSource();
    }
  });
  let features = source.getFeatures();
  features.forEach((f) => {
    keys.forEach((key) => {
      let val = f.values_[key];
      if (val === obj[key]) {
        source.removeFeature(f);
      }
    });
  });
}

/*
 * 获取当前地图的比例尺（公开）
 * map:当前地图对象（必须）
 * resolution：当前的地图的比例尺（非必须）
 * dpi：当前的屏幕的dpi（非必须）
 */
export function getMapScale(map, resolution, dpi) {
  let scale = _getScale(map, resolution, dpi);
  return scale;
}

/*
 * 根据比例尺获取对应的分辨率（公开）
 * map:当前地图对象（必须）
 * scale:当前需要转换的比例尺（必须）
 * resolution：当前的地图的比例尺（非必须）
 * dpi：当前的屏幕的dpi（非必须）
 */
let thisResolution = null; // 全局变量
export function getResolutionFromScale(map, scale) {
  // let mpu =map.getView().getProjection().getMetersPerUnit()
  // let mpuLen = (mpu+"").split(".")[0]
  // if(mpuLen>3){
  //     res= 0.00028*scale
  // }else{
  //     res=0.00028*scale/(6378137.0 * 2.0 * 3.141592653589793 / 360.0)
  // }
  let mpu = map.getView().getProjection().getMetersPerUnit();
  let res = 0.00028 * (scale / mpu);
  return res;
}

// 获取当前提供的分辨率获取地图的比例尺（私有）
function _getScale(map, resolution) {
  let mapView = map.getView();
  if (!mapView) {
    return null;
  }
  resolution = resolution ? resolution : mapView.getResolution();
  let mpu = map.getView().getProjection().getMetersPerUnit();
  const DEFAULT_DPI = 25.4 / 0.28;
  const inchesPerMeter = 1000 / 25.4;
  let mapScale = parseFloat(resolution) * mpu * inchesPerMeter * DEFAULT_DPI;
  return mapScale;
}

// 根据比例尺计算分辨率（私有）
// eslint-disable-next-line no-unused-vars
const _calRes = (map, scale, dpi, mark) => {
  if (!thisResolution) {
    thisResolution = map.getView().getResolution();
  }
  let calcScale = _getScale(map, thisResolution, dpi);
  let abs = Math.abs(calcScale - scale); // 绝对值
  if (calcScale > scale && (!mark || mark === 'lessthen')) {
    mark = 'lessthen';
    thisResolution -= mapresVal(abs);
    _calRes(map, scale, mark);
  } else if (scale > calcScale && (!mark || mark === 'morethen')) {
    mark = 'morethen';
    thisResolution += mapresVal(abs);
    _calRes(map, scale, mark);
  } else {
    return;
  }
};

// 获取分辨率阈值（私有）
const mapresVal = (abs) => {
  let val = 0.0005;
  if (abs <= 50) {
    val = 0.0000001;
  } else if (abs > 50 && abs <= 100) {
    val = 0.0000003;
  } else if (abs > 100 && abs <= 200) {
    val = 0.0000005;
  } else if (abs > 200 && abs <= 500) {
    val = 0.000001;
  } else if (abs > 500 && abs <= 1000) {
    val = 0.000003;
  } else if (abs > 1000 && abs <= 2000) {
    val = 0.000005;
  } else if (abs > 2000 && abs <= 5000) {
    val = 0.00001;
  } else if (abs > 5000 && abs <= 10000) {
    val = 0.00005;
  } else if (abs > 10000 && abs <= 50000) {
    val = 0.0001;
  } else if (abs > 50000 && abs <= 100000) {
    val = 0.0005;
  } else if (abs > 100000 && abs <= 200000) {
    val = 0.001;
  } else if (abs > 200000 && abs <= 500000) {
    val = 0.005;
  } else if (abs > 500000 && abs <= 1000000) {
    val = 0.01;
  } else if (abs > 1000000 && abs <= 5000000) {
    val = 0.05;
  } else if (abs > 5000000 && abs <= 10000000) {
    val = 0.5;
  } else {
    val = 1;
  }
  return val;
};
// 获取当前屏幕的dpi（私有）
export function getDpi() {
  let DPI = 96;
  if (window.screen.deviceXDPI !== undefined) {
    DPI = window.screen.deviceXDPI;
  } else {
    let tmpNode = document.createElement('DIV');
    tmpNode.style.cssText =
      'width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden';
    document.body.appendChild(tmpNode);
    DPI = parseInt(tmpNode.offsetWidth);
    tmpNode.parentNode.removeChild(tmpNode);
  }
  return DPI;
}

// 获取当前屏幕的dpi（私有）
export function getCentimeter() {
  let DPI = 96;
  if (window.screen.deviceXDPI !== undefined) {
    DPI = window.screen.deviceXDPI;
  } else {
    let tmpNode = document.createElement('DIV');
    tmpNode.style.cssText =
      'width:1cm;height:1cm;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden';
    document.body.appendChild(tmpNode);
    DPI = parseInt(tmpNode.offsetWidth);
    tmpNode.parentNode.removeChild(tmpNode);
  }
  return DPI;
}

// 绘制图形，支持单个图形和多个图形的绘制
export function drawGraphic(map, options) {
  let wktCRS = options.wktCRS;
  let code = map.getView().getProjection().getCode();
  let currentCRS = code ? code : 'EPSG:4490';
  wktCRS = wktCRS ? wktCRS : 'EPSG:4528';
  registerProj(wktCRS);
  let features = [];
  let geometrys = [];
  let tempLayer;
  if (options.layerId && options.layerId !== 'drawLayer') {
    let layer = map.getLayerById(options.layerId);
    if (!layer) {
      tempLayer = new VectorLayer({
        id: options.layerId,
        zIndex: 999999,
        source: new VectorSource(),
        style: new Style({
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          }),
          stroke: new Stroke({
            color: 'rgba(0, 191, 255, 2)',
            width: 2
          }),
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: '#ffcc33'
            })
          })
        })
      });
      map.addLayer(tempLayer);
    } else {
      tempLayer = layer;
    }
  } else {
    // 添加所有feature到临时图层
    tempLayer = map.getLayerById('drawLayer');
  }
  if (options.type && options.type === 'multi') {
    // 处理多个图形的绘制
    let data = options.params;
    let wktFormat = new WKT();
    let sameStyles, styles;
    if (options.sameStyle && options.sameStyle === 'true') {
      sameStyles = new Style({
        fill: new Fill({
          color: options.fillColor ? options.fillColor : 'rgba(255,255,0, 0.2)'
        }),
        stroke: new Stroke({
          color: options.borderColor ? options.borderColor : '#FF0000',
          width: options.borderWidth ? options.borderWidth : 1.25
        }),
        image: new Icon({
          src: options.locateImage
            ? options.locateImage
            : 'static/img/location.png'
        })
      });
    }
    data.forEach((item) => {
      let geo = wktFormat.readGeometry(item.wkt);
      geo.transform(wktCRS, currentCRS);
      geometrys.push(geo);
      let feature = new Feature({
        geometry: geo
      });
      // 非公共样式下采用自身公共样式
      if (!sameStyles) {
        styles = new Style({
          fill: new Fill({
            color: item.fillColor ? item.fillColor : 'rgba(255,255,0, 0.2)'
          }),
          stroke: new Stroke({
            color: item.borderColor ? item.borderColor : '#FF0000',
            width: item.borderWidth ? item.borderWidth : 1.25
          }),
          image: new Icon({
            src: item.locateImage ? item.locateImage : 'static/img/location.png'
          })
        });
      }
      let itemStyle = styles ? styles : sameStyles;
      // lcoateTag默认为tru
      if (!item.locateTag) {
        item.locateTag = 'true';
      }
      let tempFeaturesArray = handleFeature(feature, item, itemStyle, map);
      tempFeaturesArray.forEach((item) => {
        features.push(item);
      });
    });
    tempLayer.getSource().addFeatures(features);
    // 绘制图形定位
    locationGeometry(map, geometrys);
  } else {
    let wkt = options.wkt;
    // 通过传递样式定制绘制的图形样式
    let style = new Style({
      fill: new Fill({
        color: options.fillColor ? options.fillColor : 'rgba(255,255,0, 0.2)'
      }),
      stroke: new Stroke({
        color: options.borderColor ? options.borderColor : '#FF0000',
        width: options.borderWidth ? options.borderWidth : 1.25
      }),
      image: new Icon({
        src: options.locateImage
          ? options.locateImage
          : 'static/img/location.png'
      })
    });
    let wktObj = new WKT();
    let drawGeometry = wktObj.readGeometry(wkt);
    drawGeometry.transform(wktCRS, currentCRS);
    let obj = {
      //  id: "tempWktGraphic",
      geometry: drawGeometry
    };
    geometrys.push(drawGeometry);
    // 先清除已有的图形
    /* let features = tempLayer.getSource().getFeatures()
    /*  features.forEach(f => {
          let id = f.values_.id
          if (id === "tempWktGraphic") {
              tempLayer.getSource().removeFeature(f)
          }
      })*/
    let feature = new Feature(obj);
    if (!options.locateTag) {
      options.locateTag = 'true';
    }
    let tempFeaturesArray = handleFeature(feature, options, style, map);
    tempFeaturesArray.forEach((item) => {
      features.push(item);
    });
    tempLayer.getSource().addFeatures(features);
    // 绘制图形定位
    locationGeometry(map, geometrys);
  }
}

export function handleFeature(feature, options, itemStyle, map) {
  // 根据绘制类型判断，决定是否取中心点
  let features = [];
  let type = feature.getGeometry().getType();
  let featureCenter, markOverlay;
  if (
    type !== 'Point' &&
    options.locateTag === 'true' &&
    !options.customLabel
  ) {
    let geometryCenter = getCenter(feature.getGeometry().getExtent());
    featureCenter = new Feature({ geometry: new Point(geometryCenter) });
    featureCenter.setStyle(itemStyle);
    features.push(featureCenter);
  }
  // 若传递customLabel，则直接绘制自定义代码
  if (options.customLabel && options.locateTag === 'true') {
    let mapId = map.getTarget();
    let markerDiv = options.customLabel;
    //  let pixelPoint = map.getPixelFromCoordinate(getCenter(feature.getGeometry().getExtent()))
    let markerId = newGuid();
    let imgHtml = '<div id="markId_' + markerId + '">' + markerDiv + '</div>';
    $('#' + mapId)
      .find('.ol-overlaycontainer')
      .append(imgHtml);
    markOverlay = new Overlay({
      position: getCenter(feature.getGeometry().getExtent()),
      positioning: 'center-center',
      stopEvent: true,
      element: document.getElementById('markId_' + markerId)
    });
    map.addOverlay(markOverlay);
  }
  if (options.attribute) {
    let drawAttribute = JSON.parse(options.attribute.toUpperCase());
    for (let key in drawAttribute) {
      feature.set(key, drawAttribute[key]);
      if (featureCenter) {
        featureCenter.set(key, drawAttribute[key]);
      }
      if (markOverlay) {
        markOverlay.set(key, drawAttribute[key]);
      }
    }
  }

  feature.setStyle(itemStyle);
  if (!(type === 'Point' && options.customLabel)) {
    features.push(feature);
  }

  return features;
}

/* 删除临时绘制图形接口*/
export function deleteGraphic(map, options) {
  let whereTag;
  let splitArray = [];
  let tempLayer;
  if (options.layerId && options.layerId !== 'drawLayer') {
    tempLayer = map.getLayerById(options.layerId);
  } else {
    tempLayer = map.getLayerById('drawLayer');
  }
  if (options.where) {
    let where = options.where.toUpperCase().replace(/(^\s*)|(\s*$)/g, '');
    if (where.indexOf('=') > -1) {
      whereTag = '=';
    }
    if (where.indexOf('>') > -1) {
      whereTag = '>';
    }
    if (where.indexOf('<') > -1) {
      whereTag = '<';
    }
    splitArray = where.split(whereTag);
  } else {
    whereTag = null;
  }
  // 获取临时层上绘制的所有图形
  let features = tempLayer.getSource().getFeatures();
  let selectedFeatures = [];
  if (whereTag === null) {
    selectedFeatures = features;
  } else {
    for (let i = 0, ii = features.length; i < ii; i++) {
      if (
        whereTag === '=' &&
        features[i].getProperties()[splitArray[0]] === splitArray[1]
      ) {
        selectedFeatures.push(features[i]);
      } else if (
        whereTag === '>' &&
        features[i].getProperties()[splitArray[0]] > splitArray[1]
      ) {
        selectedFeatures.push(features[i]);
      } else if (
        whereTag === '<' &&
        features[i].getProperties()[splitArray[0]] < splitArray[1]
      ) {
        selectedFeatures.push(features[i]);
      }
    }
  }

  selectedFeatures.forEach((item) => {
    tempLayer.getSource().removeFeature(item);
  });

  // 删除部分overlay图层
  let olLyrs = map.getOverlays().getArray();
  let olLyrsLength = map.getOverlays().getArray().length;

  for (let i = olLyrsLength - 1; i >= 0; i--) {
    let item = olLyrs[i];
    if (
      whereTag === '=' &&
      item.getProperties()[splitArray[0]] === splitArray[1]
    ) {
      map.removeOverlay(item);
      olLyrs.splice(i, 1);
    } else if (
      whereTag === '>' &&
      item.getProperties()[splitArray[0]] > splitArray[1]
    ) {
      map.removeOverlay(item);
      olLyrs.splice(i, 1);
    } else if (
      whereTag === '<' &&
      item.getProperties()[splitArray[0]] < splitArray[1]
    ) {
      map.removeOverlay(item);
      olLyrs.splice(i, 1);
    }
  }
}

/* 定位临时图形*/
export function locateGraphic(map, options) {
  let whereTag;
  let splitArray = [];
  let tempLayer;
  if (options.layerId && options.layerId !== 'drawLayer') {
    tempLayer = map.getLayerById(options.layerId);
  } else {
    tempLayer = map.getLayerById('drawLayer');
  }
  if (options.where) {
    let where = options.where.toUpperCase().replace(/(^\s*)|(\s*$)/g, '');
    if (where.indexOf('=') > -1) {
      whereTag = '=';
    }
    if (where.indexOf('>') > -1) {
      whereTag = '>';
    }
    if (where.indexOf('<') > -1) {
      whereTag = '<';
    }
    splitArray = where.split(whereTag);
  } else {
    whereTag = null;
  }
  // 获取临时层上绘制的所有图形
  let features = tempLayer.getSource().getFeatures();
  let selectedFeatures = [];
  let geometrys = [];

  for (let i = 0, ii = features.length; i < ii; i++) {
    if (
      whereTag === '=' &&
      features[i].getProperties()[splitArray[0]] === splitArray[1]
    ) {
      selectedFeatures.push(features[i]);
      geometrys.push(features[i].getGeometry());
    } else if (
      whereTag === '>' &&
      features[i].getProperties()[splitArray[0]] > splitArray[1]
    ) {
      selectedFeatures.push(features[i]);
      geometrys.push(features[i].getGeometry());
    } else if (
      whereTag === '<' &&
      features[i].getProperties()[splitArray[0]] < splitArray[1]
    ) {
      selectedFeatures.push(features[i]);
      geometrys.push(features[i].getGeometry());
    }
  }
  // 绘制图形定位
  locationGeometry(map, geometrys);
}

/* 将地图缩放到XY坐标处，并设置缩放级别*/
export function zoomTo(map, projection, xy, zoom) {
  if (xy && zoom) {
    map.getView().setZoom(parseInt(zoom));
    setCenter(map, projection, xy);
  } else {
    if (xy) {
      setCenter(map, projection, xy);
    }
    if (zoom) {
      map.getView().setZoom(zoom);
    }
  }
}

export function animate(map, option) {
  let xy = option.center;
  let projection = option.inCrs;
  let zoom = option.zoom;
  let isArray = Array.isArray(xy);
  let center;
  if (isArray) {
    center = transform(xy, projection, map.getView().getProjection().getCode());
  } else {
    let centerX = parseFloat(xy.split(',')[0]);
    let centerY = parseFloat(xy.split(',')[1]);
    center = transform(
      [centerX, centerY],
      projection,
      map.getView().getProjection().getCode()
    );
  }
  map.getView().animate({ center: center, zoom: zoom });
}

function setCenter(map, projection, xy) {
  let isArray = Array.isArray(xy);
  let center;
  if (isArray) {
    center = transform(xy, projection, map.getView().getProjection().getCode());
  } else {
    let centerX = parseFloat(xy.split(',')[0]);
    let centerY = parseFloat(xy.split(',')[1]);
    center = transform(
      [centerX, centerY],
      projection,
      map.getView().getProjection().getCode()
    );
  }
  map.getView().setCenter(center);
}

export function transformPoint(map, point, inCrs, outCrs) {
  let result;
  let isArray = Array.isArray(point);
  if (isArray) {
    result = transform(point, inCrs, outCrs);
  } else {
    let centerX = parseFloat(point.split(',')[0]);
    let centerY = parseFloat(point.split(',')[1]);
    result = transform([centerX, centerY], inCrs, outCrs);
  }
  return result;
}

export function transformGeo(map, geo, inCrs, outCrs) {
  let result;
  // 若为feature数组
  if (geo instanceof Array) {
    result = new GeoJSON({
      dataProjection: outCrs,
      featureProjection: inCrs
    }).writeFeatures(geo);
  } else if (geo instanceof Feature) {
    // 若geo为feature
    result = new GeoJSON({
      dataProjection: outCrs,
      featureProjection: inCrs
    }).writeFeature(geo);
  } else if (geo instanceof Geometry) {
    // geo为Geometry
    result = new GeoJSON({
      dataProjection: outCrs,
      featureProjection: inCrs
    }).writeGeometry(geo);
    // geo为数组或者字符串
  }
  if (result) {
    result = addCrsToGeojson(result, outCrs);
  }
  return result;
}

export function transformGeoJson(geoJson, outCrs) {
  if (!geoJson.type) {
    geoJson = JSON.parse(geoJson);
  }
  let geoJsonCrs = geoJson.crs;
  let inCrs = geoJsonCrs ? geoJsonCrs.properties.name : '';
  inCrs = inCrs.replace('urn:ogc:def:crs:', '').replace('::', ':');
  if (inCrs) {
    // 坐标系不存在则注册,存在不操作
    registerProj(inCrs);
  }
  if (outCrs) {
    // 坐标系不存在则注册,存在不操作
    registerProj(outCrs);
  }
  let options = {
    dataProjection: inCrs,
    featureProjection: outCrs
  };
  let features = new GeoJSON(options).readFeatures(geoJson);
  return transformGeo(null, features, outCrs, outCrs);
}

export function getMarkerById(map, id) {
  let layer = map.getLayerById('locateLayer').getSource();
  let feature = layer.getFeatureById(id);
  return feature;
}
export function addMarker(map, options) {
  let markerFeature;

  let point = options.point;
  let src = options.src;
  let id = options.id ? options.id : getuuid();
  let size = options.size ? options.size : [36, 36];
  let anchor = options.anchor ? options.anchor : [0.5, 0.5];
  let fontOptions = options.font;
  let rotation = options.rotation ? options.rotation : 0;
  let layer = map.getLayerById('locateLayer').getSource();
  markerFeature = options.id ? layer.getFeatureById(options.id) : null;
  if (markerFeature) {
    markerFeature.setGeometry(new Point(point));
  } else {
    markerFeature = new Feature({
      geometry: new Point(point)
    });
    markerFeature.setId(id);
    layer.addFeature(markerFeature);
  }
  markerFeature.setProperties(options, options);
  let textStyle;
  if (fontOptions) {
    if (fontOptions.fill) {
      fontOptions.fill = new Fill({
        color: fontOptions.fill
      });
    }
    if (fontOptions.backgroundFill) {
      fontOptions.backgroundFill = new Fill({
        color: fontOptions.backgroundFill
      });
    }
    if (fontOptions.stroke) {
      fontOptions.stroke = new Stroke(fontOptions.stroke);
    }
    if (fontOptions.backgroundStroke) {
      fontOptions.backgroundStroke = new Stroke(fontOptions.backgroundStroke);
    }
    textStyle = new Text(fontOptions);
  }
  var iconStyle = new Style({
    image: new Icon({
      size: size,
      src: src,
      anchor: anchor,
      rotation: rotation
    }),
    text: textStyle
  });

  markerFeature.setStyle(iconStyle);
}

export function getCenterOfMass(geometry) {
  if (geometry instanceof Feature) {
    geometry = geometry.getGeometry();
  }
  let geojson = JSON.parse(new GeoJSON().writeGeometry(geometry));
  let geom = getGeom(geojson);
  let point = centerOfMass(geom);
  return point.geometry.coordinates;
}

export function addCrsToGeojson(geojsonStr, outCrs) {
  let geojson = JSON.parse(geojsonStr);
  if (outCrs.indexOf('EPSG') > -1) {
    outCrs = outCrs.replace(':', '::');
    outCrs = 'urn:ogc:def:crs:' + outCrs;
  }
  geojson.crs = {
    type: 'name',
    properties: {
      name: outCrs
    }
  };
  return JSON.stringify(geojson);
}

export function setScale(map, scaleStr) {
  if (!scaleStr) {
    Message.warning('请输入比例尺参数');
    return;
  }
  if (!scaleStr.includes(':')) {
    Message.warning('请输入正确比例格式');
    return;
  } else {
    let scaleArr = scaleStr.split(':');
    let scale = parseFloat(scaleArr[1]) / parseFloat(scaleArr[0]);
    let resolution = getResolutionFromScale(map, scale);
    let view = map.getView();
    // let proj = view.getProjection();
    // let center = view.getCenter();
    // let px = map.getPixelFromCoordinate(center);
    // px[1] += 1;
    // let coord = map.getCoordinateFromPixel(px);
    // let code = view.getProjection().getCode()
    // let currentCRS = code ? code : "EPSG:4490"
    // let d = ol_sphere_getDistance(
    //     transform(center, proj, currentCRS),
    //     transform(coord, proj, currentCRS));
    // d *= _getDpi()/0.0254
    // view.setResolution(view.getResolution()*scale/d);
    // let resolution = getResolutionFromScale(map,scale)
    //
    view.setResolution(resolution);
  }
}

/**
 * 多个子图层场景不适用
 * @param map
 * @param id
 * @param where
 */
export function filterLayer(map, id, where) {
  let item = map.getLayerById(id);
  if (item?.values_?.info?.type) {
    let type = item.values_.info.type;
    if (
      type.indexOf('geoserver') > -1 &&
      (type.indexOf('wms') > -1 || type.indexOf('wfs') > -1)
    ) {
      item.getSource().updateParams({
        CQL_FILTER: where
      });
    } else {
      if (
        type === 'dynamic' ||
        type === 'feature-zj' ||
        type.indexOf('feature') > -1 ||
        type.indexOf('wfs') > -1
      ) {
        let visibleLayers = item.values_.info.visibleLayers;
        if (visibleLayers) {
          let params = {};
          visibleLayers.forEach((lyr) => {
            params[lyr] = where;
          });
          let defs = JSON.stringify(params);
          if (item.getSource) {
            item.getSource().updateParams({
              layerDefs: defs
            });
          } else if (item instanceof LayerGroup) {
            let childLayers = item.getLayers()?.getArray();
            if (childLayers && childLayers.length > 0) {
              for (let childLayer of childLayers) {
                childLayer.getSource().updateParams({
                  layerDefs: defs
                });
              }
            }
          }
        }
      }
    }
  }
}

export function filterArcgisLayer(map, id, layerDefs) {
  let layer = map.getLayerById(id);
  let type = layer?.values_?.info?.type;
  if (type) {
    if (type === 'dynamic') {
      if (layer.getSource) {
        layer.getSource().updateParams({
          layerDefs: layerDefs
        });
      }
    }
  }
}

export function getFeatureById(map, id) {
  let features = map.getLayerById('drawLayer').getSource().getFeatures();
  for (let feature of features) {
    let featureId = feature.get('id')
      ? feature.get('id')
      : feature.getProperties().id;
    if (id === featureId) {
      return feature;
    }
  }
}

export function updateFeatureById(map, options) {
  let feature = getFeatureById(map, options.id);
  let code = map.getView().getProjection().getCode();
  let currentCRS = code ? code : 'EPSG:4490';
  let geometry;
  if (feature) {
    if (options.type === 'geojson') {
      let features = readFeatureFromGeoJson(map, options.geojson);
      if (features && features.length > 0) {
        geometry = features[0].getGeometry();
      }
    } else if (options.type === 'wkt') {
      let wktFormat = new WKT();
      geometry = wktFormat.readGeometry(options.wkt);
      geometry.transform(options.wktCRS, currentCRS);
    }
    if (geometry) {
      feature.setGeometry(geometry);
    }
  }
}

export const getTdtTileGride = (proj) => {
  var xmlName =
    proj === 'EPSG:4490' || proj === 'EPSG:4326' ? 'vec_c.xml' : 'vec_w.xml';
  const module = require('!raw-loader!../assets/tdt/' + xmlName);
  let xml = module.default;
  let extent = [];
  let parser = new WMTSCapabilities();
  let result = parser.read(xml);
  let layers = result['Contents']['Layer'];
  let targetLayer = layers[0];
  extent = targetLayer.WGS84BoundingBox;
  var layerName = targetLayer.Identifier;
  let WMTSSourceOptions = optionsFromCapabilities(result, {
    layer: layerName
  });
  for (let i = 0; i < WMTSSourceOptions.tileGrid.origins_.length; i++) {
    WMTSSourceOptions.tileGrid.origins_[i].reverse();
  }
  let resolutions = [];
  let matrixIds = [];
  for (let z = 1; z < 19; ++z) {
    resolutions[z] =
      getWidth(extent) /
      WMTSSourceOptions.tileGrid.tileSizes_[z - 1] /
      Math.pow(2, z);
    matrixIds[z] = z;
  }

  WMTSSourceOptions.tileGrid.extent_ = extent;
  WMTSSourceOptions.tileGrid.resolutions_ = resolutions;
  WMTSSourceOptions.tileGrid.matrixIds_ = matrixIds;
  return WMTSSourceOptions.tileGrid;
};

export function getGeoLayerName(value) {
  if (value) {
    let nameArr = value.split(':');
    if (nameArr.length > 1) {
      return nameArr[1];
    } else {
      return nameArr[0];
    }
  }
  return '';
}

export function replaceWktProj(xml) {
  let map = {
    'GEOGCS["WGS_1984",DATUM["WGS_1984",SPHEROID["WGS_1984",6378137,298.257223563]],PRIMEM["Greenwich",0],UNIT["degree",0.0174532925199433]]':
      'EPSG:4326'
  };
  for (let wkt in map) {
    if (xml.indexOf(wkt) > -1) {
      xml = xml.replaceAll(wkt, map[wkt]);
      break;
    }
  }
  return xml;
}

export function addTrail(map, options) {
  let pointArray = options.pointArray;
  if (pointArray) {
    // locate.png
    let startSrc = options.startSrc
      ? options.startSrc
      : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADN0lEQVRYR8WWTWwNURTH/+e+Sr15lIXGR1g3VERY0BmiFV+JBfHxpm0aIWzsfFYiEWUh8dGKnY02mkbfPBEWFlgg6ZuhGxJRiVhYEITYtH0zqt4cmeervDsz9z2L3uX7n/M/v3vOvfcNYZIXTXJ9lAWwMpNflhAJHfCbAKqD7y8obkCINwC/BMSDgl9wHjennqhuTBnAsLwzAB8CUB1jPgZQl20mj6tAKAEYlvsUwFIVw98xhOt2WkvH5cQCGFb+I0C1cUZSXQEiEsDIulkwdlZU/FdSDEQogGG5BwF0/VfxP8mHbFO7KPOSAqzo45rEFG+IgPmhAET3wP7Lok6iDswbwmIZeFsYT9YPttHwvzFSgAZrdKOAuBNq6PMppyXVMVHXLe8kgf/6baLuw9/0yJx2VwlA7893kKCTUgBGu92snZdpRsY9CsI5mcYS6GLzpEZZrwfMu2WaoET9QLr6hUxbnR1b5HNhSA7OV+zm1D6lDhhZ9wEYjSVGREN2Ork46mAaWe85mOtLC9HdnJncpASgW+41AlokhbyRseHaZ7vm5GUQS3o/pKZX13wCkJQUyuRMrcRTOgLdci8QcFg6S+CYY2rSOeuW207A2ZC8TsfUjih1oMHKbxWgm2GtFlXJeQPb6f1EffUNnut/896F5RBhWy6tlXhKO7Chl1P5au8tgJlRV1EIKr4Dvs91obcmOOkMJ9esGTKvqJcweLkORB04dY1222byalkAK/o+11RNSd4HsFy9UGkkg7sdM7U3dDRR5nr2y2Zi/3alAEx4VfiKtYNtWjBO6Yr9O15luWcZaK8EgoDWnKn1R+XGAjT2vJ46rs0ORtFQHgRfts3U/ricWIDAwMh+WQ/278WZ/daZh4TQmgbSFDxKkUsJoAhx3TsNn0/EGQY6AzscU7uhEqsMgI4OoS9sv0/AmihjJlxy0pry9VUHCLqQcVcy8R0CzQg50oMYya+399aOqOw+iCkLIEjQM6N7iES3pECB/MK6XMv0h6rFKwIIkmRXk4AjOVPrLKd4xQA/boZ7C4wtPw9dv2NqreUW/y+AxmvDs8YTVT++G0fzTeXMfSJo2Wegkl1G5Uw6wHeXphEwQy3ECAAAAABJRU5ErkJggg==';
    // 默认在点上面
    let startAnchor = options.startAnchor ? options.startAnchor : [0.5, 1];
    // locate.png
    let endSrc = options.endSrc
      ? options.endSrc
      : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADN0lEQVRYR8WWTWwNURTH/+e+Sr15lIXGR1g3VERY0BmiFV+JBfHxpm0aIWzsfFYiEWUh8dGKnY02mkbfPBEWFlgg6ZuhGxJRiVhYEITYtH0zqt4cmeervDsz9z2L3uX7n/M/v3vOvfcNYZIXTXJ9lAWwMpNflhAJHfCbAKqD7y8obkCINwC/BMSDgl9wHjennqhuTBnAsLwzAB8CUB1jPgZQl20mj6tAKAEYlvsUwFIVw98xhOt2WkvH5cQCGFb+I0C1cUZSXQEiEsDIulkwdlZU/FdSDEQogGG5BwF0/VfxP8mHbFO7KPOSAqzo45rEFG+IgPmhAET3wP7Lok6iDswbwmIZeFsYT9YPttHwvzFSgAZrdKOAuBNq6PMppyXVMVHXLe8kgf/6baLuw9/0yJx2VwlA7893kKCTUgBGu92snZdpRsY9CsI5mcYS6GLzpEZZrwfMu2WaoET9QLr6hUxbnR1b5HNhSA7OV+zm1D6lDhhZ9wEYjSVGREN2Ork46mAaWe85mOtLC9HdnJncpASgW+41AlokhbyRseHaZ7vm5GUQS3o/pKZX13wCkJQUyuRMrcRTOgLdci8QcFg6S+CYY2rSOeuW207A2ZC8TsfUjih1oMHKbxWgm2GtFlXJeQPb6f1EffUNnut/896F5RBhWy6tlXhKO7Chl1P5au8tgJlRV1EIKr4Dvs91obcmOOkMJ9esGTKvqJcweLkORB04dY1222byalkAK/o+11RNSd4HsFy9UGkkg7sdM7U3dDRR5nr2y2Zi/3alAEx4VfiKtYNtWjBO6Yr9O15luWcZaK8EgoDWnKn1R+XGAjT2vJ46rs0ORtFQHgRfts3U/ricWIDAwMh+WQ/278WZ/daZh4TQmgbSFDxKkUsJoAhx3TsNn0/EGQY6AzscU7uhEqsMgI4OoS9sv0/AmihjJlxy0pry9VUHCLqQcVcy8R0CzQg50oMYya+399aOqOw+iCkLIEjQM6N7iES3pECB/MK6XMv0h6rFKwIIkmRXk4AjOVPrLKd4xQA/boZ7C4wtPw9dv2NqreUW/y+AxmvDs8YTVT++G0fzTeXMfSJo2Wegkl1G5Uw6wHeXphEwQy3ECAAAAABJRU5ErkJggg==';
    // 默认在点上面
    let endAnchor = options.endAnchor ? options.endAnchor : [0.5, 1];
    // circlePoint.png
    let nodeSrc = options.nodeSrc
      ? options.nodeSrc
      : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAKhJREFUOE9jZKAQMFKon2G4GnBDnkOR8f+/SQwMDM7QMNr7n5EpT+Phj/voYYY1DG7Ism1jYGTwRFH8n2G7xuNfXsQZIMf2h4GBgRlN8V+NR79YiDXgP7bo1Xj0C8PFWL1wXY51NyMDowuyIf8Z/u/RfPTblSgXXJVj02Jm+D+FgYHREaLh//6/DIw52o9+XSPKAJii/8YMrCA241mG37hS7HBNiaTkUADbhSsRApl6nAAAAABJRU5ErkJggg==';
    // 默认在点中心
    let nodeAnchor = options.nodeAnchor ? options.nodeAnchor : [0.5, 0.5];
    let strokeColor = options.strokeColor ? options.strokeColor : '#ff0000';
    let strokeWidth = options.strokeWidth ? options.strokeWidth : 2;

    let trailStyle = new Style({
      stroke: new Stroke({
        color: strokeColor,
        width: strokeWidth
      }),
      image: new Icon({
        // size: [36, 36],
        src: nodeSrc,
        anchor: nodeAnchor
      })
    });
    var trailLayer = new VectorLayer({
      id: 'trailLayer',
      zIndex: 999999,
      source: new VectorSource(),
      style: trailStyle
    });
    map.addLayer(trailLayer);
    let line = new LineString(pointArray);
    let lineFeature = new Feature(line);
    trailLayer.getSource().addFeature(lineFeature);

    for (let i in pointArray) {
      let point = pointArray[i];
      let geo = new Point(point);
      let feature = new Feature(geo);
      if (i === 0) {
        feature.setStyle(
          new Style({
            image: new Icon({
              // size: [36, 36],
              src: startSrc,
              anchor: startAnchor
            })
          })
        );
      }
      if (i === pointArray.length - 1) {
        feature.setStyle(
          new Style({
            image: new Icon({
              // size: [36, 36],
              src: endSrc,
              anchor: endAnchor
            })
          })
        );
      }
      trailLayer.getSource().addFeature(feature);
    }

    if (options.isLocate) {
      locationGeometry(map, [line]);
    }
  }
}

export function nearestPointOnGeometry(point, geometry) {
  if (geometry instanceof Feature) {
    geometry = geometry.getGeometry();
  }
  let linearRings = [];
  if (geometry instanceof MultiPolygon) {
    for (let polygon of geometry.getPolygons()) {
      linearRings = linearRings.concat(polygon.getLinearRings());
    }
  } else {
    linearRings = geometry.getLinearRings();
  }
  let minDist = Number.MAX_VALUE;
  let minDistResult;
  for (let linearRing of linearRings) {
    let line = turfLineString(linearRing.getCoordinates());
    let result = nearestPointOnLine(line, point, { units: 'miles' });
    if (minDist > result.properties.dist) {
      minDistResult = result;
      minDist = result.properties.dist;
    }
  }
  return minDistResult;
}

/**
 * generalStyle转ol的style对象
 * @param {*} generalStyle
 *
 *  {
      fillColor: 'rgba(0, 79, 249, 0.5)',
      strokeColor: '#FFFFFF',
      strokeWidth: 1.25,
      circle: {
        fillColor: 'rgba(0, 79, 249, 0.5)',
        strokeColor: '#FFFFFF',
        strokeWidth: 1.25,
        radius: 5
      },
      icon: {
        src: '',
        anchor: [0.5, 0.5]
      },
      text: {
        font: '13px Calibri,sans-serif',
        fillColor: '#FFF',
        strokeColor: '#004ff9',
        strokeWidth: 1.25,
        offset: [1, 2],
        text: '123'
      }
    }
 */
export function getStyleFormGeneralStyle(generalStyle) {
  const style = new Style();
  if (generalStyle.fillColor) {
    const fill = new Fill({
      color: generalStyle.fillColor
    });
    style.setFill(fill);
  }

  if (generalStyle.strokeColor || generalStyle.strokeWidth) {
    const stroke = new Stroke({
      color: generalStyle.strokeColor,
      width: generalStyle.strokeWidth
    });
    style.setStroke(stroke);
  }

  if (generalStyle.circle) {
    const fill = new Fill({
      color: generalStyle.circle.fillColor
    });
    const stroke = new Stroke({
      color: generalStyle.circle.strokeColor,
      width: generalStyle.circle.strokeWidth
    });
    const circle = new CircleStyle({
      fill,
      stroke,
      radius: generalStyle.circle.radius
    });
    style.setImage(circle);
  }

  if (generalStyle.icon) {
    const {
      src,
      anchor,
      anchorOrigin,
      anchorXUnits,
      anchorYUnits,
      color,
      crossOrigin,
      img,
      offset,
      displacement,
      offsetOrigin,
      opacity,
      scale,
      rotateWithView,
      rotation,
      size,
      imgSize,
      declutterMode
    } = generalStyle.icon;
    const icon = new Icon({
      src,
      anchor,
      anchorOrigin,
      anchorXUnits,
      anchorYUnits,
      color,
      crossOrigin,
      img,
      offset,
      displacement,
      offsetOrigin,
      opacity,
      scale,
      rotateWithView,
      rotation,
      size,
      imgSize,
      declutterMode
    });
    style.setImage(icon);
  }

  if (generalStyle.text) {
    const fill = new Fill({
      color: generalStyle.text.fillColor
    });
    const stroke = new Stroke({
      color: generalStyle.text.strokeColor,
      width: generalStyle.text.strokeWidth
    });
    const {
      font,
      maxAngle,
      offsetX,
      offsetY,
      overflow,
      placement,
      scale,
      rotateWithView,
      rotation,
      text,
      textAlign,
      justify,
      textBaseline,
      padding
    } = generalStyle.text;
    const test = new Text({
      font,
      maxAngle,
      offsetX,
      offsetY,
      overflow,
      placement,
      scale,
      rotateWithView,
      rotation,
      text,
      textAlign,
      justify,
      textBaseline,
      fill,
      stroke,
      padding
    });
    style.setText(test);
  }

  return style;
}
