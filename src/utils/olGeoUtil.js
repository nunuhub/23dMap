/**
 * 处理图形数据的工具栏
 */

import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON';
import { addCrsToGeojson } from './olUtil';
import { MultiPolygon } from 'ol/geom';
import {
  multiPolygon as turfMultiPolygon,
  polygon as turfPolygon
} from '@turf/helpers';
import union from '@turf/union';
import { registerProj } from '../core/CustomProjection';

export function getDrawLayerFeatures() {
  return this.getLayerById('drawLayer').getSource().getFeatures();
}

export function getSelectFeatures() {
  var selectArray = [];
  var graphicArray;
  const layers = this.getLayers().getArray();
  layers.forEach((layer) => {
    // 目前地图选中的要素在临时层上
    if (layer.get('id') === 'drawLayer') {
      graphicArray = layer.getSource().getFeatures();
      graphicArray.forEach((item) => {
        if (item.get('tempSelected') || item.get('isSelected')) {
          selectArray.push(item);
        }
      });
    }
  });
  return selectArray;
}

export function getSelectGeoJson(isTransform, outCrs) {
  var selectArray = this.getSelectFeatures();
  let options = {};
  if (isTransform) {
    // 若outCrs作为参数传入时，有坐标系为注册的可能
    if (outCrs) {
      // 坐标系不存在则注册,存在不操作
      registerProj(outCrs);
    }
    const inCrs = this.getView().getProjection().getCode();
    outCrs = outCrs || this.transformProjection;

    options = {
      dataProjection: outCrs,
      featureProjection: inCrs
    };
  }
  // 加上坐标系
  outCrs = outCrs || this.getView().getProjection().getCode();
  // console.log(addCrsToGeojson(new GeoJSON(options).writeFeatures(selectArray), outCrs))
  return addCrsToGeojson(
    new GeoJSON(options).writeFeatures(selectArray),
    outCrs
  );
}

export function getSelectWkt(isTransform, outCrs) {
  var selectArray = this.getSelectFeatures();
  let options = {};
  if (isTransform) {
    // 若outCrs作为参数传入时，有坐标系为注册的可能
    if (outCrs) {
      // 坐标系不存在则注册,存在不操作
      registerProj(outCrs);
    }
    const inCrs = this.getView().getProjection().getCode();
    outCrs = outCrs || this.transformProjection;

    options = {
      dataProjection: outCrs,
      featureProjection: inCrs
    };
  }
  let result = '';
  for (const selectFeature of selectArray) {
    result += new WKT(options).writeFeatures([selectFeature], options) + ';';
  }
  return result.substring(0, result.length - 1);
  // return new WKT(options).writeFeatures(selectArray, options)
}

export function parseWktArray(wktArray, inCrs) {
  const wktFormat = new WKT();
  const features = [];
  for (const wkt of wktArray) {
    const feature = wktFormat.readFeature(wkt);
    features.push(feature);
  }
  let geojson = new GeoJSON().writeFeatures(features);
  if (inCrs) {
    geojson = addCrsToGeojson(geojson, inCrs);
  }
  return geojson;
}

export function unionFeature(features) {
  let result;
  features.forEach((element) => {
    const geo = element.getGeometry();
    const coord = geo.getCoordinates();
    let py = null;
    if (geo instanceof MultiPolygon) {
      py = turfMultiPolygon(coord);
    } else {
      py = turfPolygon(coord);
    }
    if (result == null) {
      result = py;
    } else {
      result = union(result, py);
    }
  });
  return new GeoJSON().readFeature(result.geometry);
}

export function getFeatureByWkt(wkt, inCrs) {
  const wktFormat = new WKT();
  let options;
  if (inCrs) {
    registerProj(inCrs);
    options = {
      dataProjection: inCrs,
      featureProjection: this.getView().getProjection().getCode()
    };
  }
  return wktFormat.readFeature(wkt, options);
}

export function unionFeatureFromWktArray(wktArray, inCrs) {
  if (wktArray && wktArray.length > 0) {
    const features = [];
    for (const wkt of wktArray) {
      features.push(this.getFeatureByWkt(wkt, inCrs));
    }
    return this.unionFeature(features);
  }
}

export function parseWkt(wkt, inCrs) {
  const wktFormat = new WKT();
  const feature = wktFormat.readFeature(wkt);
  let geojson = new GeoJSON().writeFeature(feature);
  if (inCrs) {
    geojson = addCrsToGeojson(geojson, inCrs);
  }
  return geojson;
  // return WktParser.parse(wkt)
}

export function convertWkt(geojson) {
  if (!geojson.type) {
    geojson = JSON.parse(geojson);
  }
  const features = new GeoJSON().readFeatures(geojson);
  const wktFormat = new WKT();
  const wktArray = [];
  for (const feature of features) {
    const wkt = wktFormat.writeFeature(feature);
    wktArray.push(wkt);
  }

  const geoJsonCrs = geojson.crs;
  let inCrs;
  if (geoJsonCrs) {
    inCrs = geoJsonCrs.properties.name
      .replace('urn:ogc:def:crs:', '')
      .replace('::', ':');
  }
  return {
    wkt: wktArray,
    inCrs: inCrs
  };
}

export function writeFeatureToWkt(feature, outCrs) {
  let options = {};
  if (outCrs) {
    // 坐标系不存在则注册,存在不操作
    registerProj(outCrs);
    const inCrs = this.getView().getProjection().getCode();
    options = {
      dataProjection: outCrs,
      featureProjection: inCrs
    };
  }
  if (feature instanceof Array) {
    return new WKT(options).writeFeatures(feature, options);
  } else {
    return new WKT(options).writeFeature(feature, options);
  }
}

export function writeFeatureToGeojson() {}

export function clearTempFeature() {
  const drawLayer = this.getLayerById('drawLayer');
  if (drawLayer) {
    drawLayer.getSource().clear();
  }
  const popTempLayer = this.getLayerById('popTempLayer');
  if (popTempLayer) {
    popTempLayer.getSource().clear();
  }
}
