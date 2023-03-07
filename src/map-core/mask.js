import esriQuery from './EsriTasks/Query';
import {
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon
} from 'ol/geom';
import {
  multiPolygon as turfMultiPolygon,
  polygon as turfPolygon
} from '@turf/helpers';
import union from '@turf/union';
import QueryParameters from './GeoServerTasks/QueryParameters';
import QueryTask from './GeoServerTasks/QueryTask';
import XZQ from './xzqService';

/**
 * 获取掩膜geojson
 * @param outCode 输出坐标系
 * @param options {layer:图层信息,where:查询条件} 不传取运维端数据
 * @returns {Promise}
 */
export default function getMaskGeoJson(outCode, options) {
  return new Promise((resolve, reject) => {
    if (!options) {
      return;
    }
    const maskLayer = options.layer;
    const where = options && options.where ? options.where : '1=1';
    const projCode = outCode || 'EPSG:4490';
    let mutilMask = null;
    let url = '';
    if (maskLayer.type === 'dynamic') {
      url = maskLayer.url + '/' + maskLayer.visibleLayers[0];
      // eslint-disable-next-line new-cap
      const query = new esriQuery(url, {
        outSR: projCode,
        where: where
      });
      query.run(function (_, response) {
        // console.log(response);
        response = response.headers ? response.data : response;
        response.features.forEach((element) => {
          const geo = element.getGeometry();
          const coord = geo.getCoordinates();
          let py = null;
          if (geo instanceof MultiPolygon) {
            py = turfMultiPolygon(coord);
          } else {
            py = turfPolygon(coord);
          }
          if (mutilMask == null) {
            mutilMask = py;
          } else {
            mutilMask = union(mutilMask, py);
          }
        });
        // 返回geojson
        resolve(mutilMask.geometry);
      }, this);
    } else if (maskLayer.type === 'wfs') {
      // geoserver查询
      const geoparames = new QueryParameters();
      geoparames.where = where;
      geoparames.srsName = projCode;
      const query = new QueryTask(maskLayer);
      query.execute(geoparames).then(function (response) {
        response = response.headers ? response.data : response;
        if (response && response.features && response.features.length > 0) {
          response.features.forEach((element) => {
            const geotype = element.geometry.type;
            let newPolygon = null;
            // 创建当前地图需要渲染的geometry
            if (geotype === 'MultiPolygon') {
              newPolygon = new MultiPolygon(element.geometry.coordinates);
            } else if (geotype === 'Polygon') {
              newPolygon = new Polygon(element.geometry.coordinates);
            } else if (geotype === 'LineString') {
              newPolygon = new LineString(element.geometry.coordinates);
            } else if (geotype === 'MultiLineString') {
              newPolygon = new MultiLineString(element.geometry.coordinates);
            } else if (geotype === 'Point') {
              newPolygon = new Point(element.geometry.coordinates);
            } else if (geotype === 'MultiPoint') {
              newPolygon = new MultiPoint(element.geometry.coordinates);
            }
            const geo = newPolygon;
            const coord = geo.getCoordinates();
            let py = null;
            if (geo instanceof MultiPolygon) {
              py = turfMultiPolygon(coord);
            } else {
              py = turfPolygon(coord);
            }
            if (mutilMask == null) {
              mutilMask = py;
            } else {
              mutilMask = union(mutilMask, py);
            }
          });
          // 返回geojson
          resolve(mutilMask.geometry);
        } else {
          console.warn('未查询到掩膜数据');
          reject(new Error('未查询到掩膜数据'));
        }
      });
    } else {
      let xzqInstance = new XZQ(
        options.layer.url,
        options.layer.visibleLayers,
        options.token
      );
      xzqInstance.getGeometry(options.xzqdm).then((xzqFeature) => {
        if (xzqFeature) {
          const geotype = xzqFeature.geometry.type;
          let newPolygon = null;
          // 创建当前地图需要渲染的geometry
          if (geotype === 'MultiPolygon') {
            newPolygon = new MultiPolygon(xzqFeature.geometry.coordinates);
          } else if (geotype === 'Polygon') {
            newPolygon = new Polygon(xzqFeature.geometry.coordinates);
          } else if (geotype === 'LineString') {
            newPolygon = new LineString(xzqFeature.geometry.coordinates);
          } else if (geotype === 'MultiLineString') {
            newPolygon = new MultiLineString(xzqFeature.geometry.coordinates);
          } else if (geotype === 'Point') {
            newPolygon = new Point(xzqFeature.geometry.coordinates);
          } else if (geotype === 'MultiPoint') {
            newPolygon = new MultiPoint(xzqFeature.geometry.coordinates);
          }
          const geo = newPolygon;
          const coord = geo.getCoordinates();
          let py = null;
          if (geo instanceof MultiPolygon) {
            py = turfMultiPolygon(coord);
          } else {
            py = turfPolygon(coord);
          }
          if (mutilMask == null) {
            mutilMask = py;
          } else {
            mutilMask = union(mutilMask, py);
          }
          // 返回geojson
          resolve(mutilMask.geometry);
        } else {
          console.warn('未查询到掩膜数据');
          reject(new Error('未查询到掩膜数据'));
        }
      });
    }
  });
}
