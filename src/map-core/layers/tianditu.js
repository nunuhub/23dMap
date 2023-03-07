/**
 * @fileOverview 天地图WMTS服务API
 * @author zjzs_xuexl
 * @version 1.0
 */
import { getWidth, getTopLeft, applyTransform } from 'ol/extent';
import WMTS from 'ol/tilegrid/WMTS';
import { WMTS as WMTSSource } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import { get as getProjection, getTransform } from 'ol/proj';

/**
 * @description 获得一个OpenLayers框架下的ol/layer/Tile类型天地图图层
 * @param {options} Object 初始化参数
 * @param {options.type} String 与官方名称相同的图层类型
 * @param {options.proj} String 与官方名称相同的投影类型
 * @param {options.key} String 开发者秘钥
 */
export function Tianditu(options) {
  // let layers = {
  //         '全球境界': 'ibo',
  //         '地形注记': 'cta',
  //         '地形晕渲': 'ter',
  //         '影像注记': 'cia',
  //         '影像底图': 'img',
  //         '矢量注记': 'cva',
  //         '矢量底图': 'vec'
  // }
  // let projs = {
  //         '经纬度投影': 'EPSG:4490',
  //         '球面墨卡托投影': 'EPSG:900913'
  // }
  // let matrixSets = {
  //         '经纬度投影': 'c',
  //         '球面墨卡托投影': 'w'
  // }
  const projection = getProjection('EPSG:4490');
  const projectionExtent = projection.getExtent();
  const origin = projectionExtent ? getTopLeft(projectionExtent) : [-180, 90];
  const fromLonLat = getTransform('EPSG:4326', projection);
  const width = projectionExtent
    ? getWidth(projectionExtent)
    : getWidth(applyTransform([-180.0, -90.0, 180.0, 90.0], fromLonLat));
  const resolutions = [];
  const matrixIds = [];
  for (let z = 1; z < 19; z++) {
    resolutions[z] = width / (256 * Math.pow(2, z));
    matrixIds[z] = z;
  }
  const wmtsTileGrid = new WMTS({
    origin: origin,
    resolutions: resolutions,
    matrixIds: matrixIds
  });
  const wmtsSource = new WMTSSource({
    url: options.url,
    layer: options.name,
    version: '1.0.0',
    matrixSet: 'c',
    format: 'tiles',
    projection: projection,
    requestEncoding: 'KVP',
    style: 'default',
    tileGrid: wmtsTileGrid
  });
  const wmtsLayer = new TileLayer({
    source: wmtsSource
  });
  return wmtsLayer;
}
