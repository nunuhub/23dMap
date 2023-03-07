/**
 * 图形数据格式转换工具集
 */

import { transform, transformExtent as olTransformExtent } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import { registerProj } from '../map-core/CustomProjection.js';

/**
 * GeoJSON数据转feature对象
 * @param {*} geojson GeoJSON数据
 * @param {*} options { dataProjection:数据的投影 , featureProjection: 转换后的投影}
 * @returns
 */
export function getFeaturesFromGeoJson(geojson, options = {}) {
  const { dataProjection, featureProjection } = options;
  if (!geojson.type) {
    geojson = JSON.parse(geojson);
  }
  const geoJsonCrs = geojson.crs;
  let inCrs = geoJsonCrs ? geoJsonCrs.properties.name : '';
  inCrs = inCrs.replace('urn:ogc:def:crs:', '').replace('::', ':');
  // 坐标系不存在则注册
  inCrs && registerProj(inCrs);
  dataProjection && registerProj(dataProjection);
  featureProjection && registerProj(featureProjection);
  const params = {
    dataProjection: inCrs || dataProjection,
    featureProjection
  };
  const features = new GeoJSON().readFeatures(geojson, params);
  return features;
}

/**
 * feature对象转GeoJSON数据
 * @param {*} features feature对象数组
 * @param {*} options { dataProjection:数据的投影 , featureProjection: 转换后的投影}
 */
export function getGeoJsonFromFeatures(features, options = {}) {
  const { dataProjection, featureProjection } = options;
  // 坐标系不存在则注册
  dataProjection && registerProj(dataProjection);
  featureProjection && registerProj(featureProjection);
  const params = {
    dataProjection,
    featureProjection
  };
  const geojson = new GeoJSON().writeFeatures(features, params);
  return geojson;
}

/**
 * 将坐标从源投影转换为目标投影
 * @param {Array} coordinate 坐标点
 * @param {*} source 原始坐标系
 * @param {*} destination 目标坐标系
 * @returns Array
 */
export function transformCoordinate(coordinate, source, destination) {
  registerProj(source);
  registerProj(destination);
  return transform(coordinate, source, destination);
}

/**
 * 将地图范围坐标从源投影转换为目标投影
 * @param {*} extent 地图范围
 * @param {*} source 原始坐标系
 * @param {*} destination 目标坐标系
 * @returns 转换后的地图范围
 */
export function transformExtent(extent, source, destination) {
  registerProj(source);
  registerProj(destination);
  return olTransformExtent(extent, source, destination);
}

export function transformGeojson() {}
