import axios from 'axios';
import $ from 'jquery';
import { Message } from 'element-ui';
import xzq from '../../../src/utils/transXZQ.json';
import { writeFilter } from 'ol/format/WFS';
import {
  and as andFilter,
  intersects as intersectsFilter,
  like as likeFilter
} from 'ol/format/filter';
import Feature from 'ol/Feature';
import qs from 'qs';
import Polygon from 'ol/geom/Polygon';
import {
  postFromAdmin,
  parseResult
} from 'shinegis-client-23d/src/utils/httprequest';
import { datum } from 'projzh';
import { getEsriSpatialReference } from 'shinegis-client-23d/src/utils/olUtil';
class SearchEngine {
  constructor() {}
  /*
    get POI data from AMap ,necessary params is keywords and maxcount,
    and user key ,For details, please refer to the official website of AMap */
  static getGaodeData(options, keywords) {
    var params = {
      keywords: keywords,
      offset: options.maxcount,
      key: options.key
    };
    if (options.xzqdm !== '') {
      params.region = options.xzqdm;
      params.city_limit = true;
    }
    return new Promise((resolve) => {
      axios({
        method: 'GET',
        url: options.url,
        params: params
      })
        .then((res) => {
          let result = res.data.pois;
          result.forEach((element) => {
            let input = element.location.split(',');
            let wgs84Lonlat = [];
            datum.gcj02.toWGS84(input, wgs84Lonlat, 0);
            delete element['biz_ext'];
            delete element['biz_type'];
            delete element.childtype;
            delete element.importance;
            delete element.parent;
            delete element.tel;
            delete element.shopid;
            element.lonlat = wgs84Lonlat;
            delete element.adname;
            element.from = '高德地图';
            element.color = '#007AFF';
            element.address =
              element.pname + element.cityname + element.address;
          });
          resolve(result);
        })
        .catch((error) => {
          if (error) {
            this.requestError('高德地图');
            resolve([]);
          }
        });
    });
  }
  //get POI from baidu map
  static getBaiduData(options, keywords) {
    var params = {
      query: keywords,
      page_size: options.maxcount,
      ak: options.ak,
      scope: 2,
      output: 'json'
    };
    if (options.xzqdm !== '') {
      for (let code in xzq) {
        if (code === options.xzqdm) {
          params.region = xzq[code];
        }
      }
    }
    return new Promise((resolve) => {
      $.ajax({
        type: 'GET',
        url: options.url,
        dataType: 'jsonp',
        data: params,
        success: (data) => {
          data.results.forEach((poi) => {
            poi.from = '百度地图';
            if (poi.province) {
              if (poi.city) {
                poi.area
                  ? (poi.address = poi.province + poi.city + poi.area)
                  : (poi.address = poi.province + poi.city);
              } else {
                poi.address = poi.province;
              }
            } else {
              poi.address = poi.name;
            }
            poi.color = '#426FE2';
            if (poi.location) {
              let input = Object.values(poi.location);
              let wgs84Lonlat = [];
              datum.bd09.toWGS84(input, wgs84Lonlat, 0);
              poi.lonlat = wgs84Lonlat;
            }
          });
          resolve(data.results);
        },
        error: (error) => {
          if (error) {
            this.requestError('百度地图');
            resolve([]);
          }
        }
      });
    });
  }
  //get TDT map data
  static getTDTData(options, keywords) {
    var params = {
      postStr: {
        keyWord: keywords,
        level: 12,
        mapBound:
          '73.50114210000005, 6.323420775000072,135.08851148000016, 53.56090105000009',
        queryType: 1,
        start: 0,
        count: options.maxcount,
        show: 2
      },
      tk: options.key
    };
    if (options.xzqdm !== '') {
      params.postStr.specify = '156' + options.xzqdm;
    }
    return new Promise((resolve) => {
      axios({
        method: 'GET',
        url: options.url,
        params: params
      })
        .then((res) => {
          if (res.data) {
            if (res.data.pois) {
              res.data.pois.forEach((poi) => {
                delete poi.cityCode;
                delete poi.countyCode;
                delete poi.hotPointID;
                delete poi.poiType;
                delete poi.typeName;
                delete poi.typeCode;
                poi.lonlat = poi.lonlat.split(',');
                poi.color = '#F3803B';
                poi.from = '天地图';
              });
              resolve(res.data.pois);
            } else if (res.data.area) {
              res.data.area.from = '天地图';
              res.data.area.color = '#F3803B';
              res.data.area.lonlat = res.data.area.lonlat.split(',');
              res.data.area.address = res.data.area.name;
              resolve([res.data.area]);
            } else {
              resolve([]);
            }
          }
        })
        .catch((error) => {
          if (error) {
            this.requestError('天地图');
            resolve([]);
          }
        });
    });
  }
  //get Tencent Map API
  static getTencentData() {}

  //获取POI服务数据
  static getPOIData() {
    return new Promise();
  }
  //geoserver 的WFS服务
  static getGeoserverData(options, keywords) {
    // var placename = encodeURIComponent('%' + keywords + '%');
    return new Promise((resolve) => {
      if (
        !options.fieldArray ||
        (options.fieldArray && options.fieldArray.length < 1)
      ) {
        Message({
          showClose: true,
          message: '必须提供结果展示字段配置-fieldArray',
          type: 'error'
        });
        resolve([]);
      }
      if (options.extent) {
        var feature = new Feature({
          geometry: new Polygon([
            [
              [options.extent[0], options.extent[1]],
              [options.extent[2], options.extent[1]],
              [options.extent[2], options.extent[3]],
              [options.extent[0], options.extent[3]],
              [options.extent[0], options.extent[1]]
            ]
          ]),
          name: 'extentFeature'
        });
        let geomField = options.geom ? options.geom : 'the_geom';
        var geometryfilter = intersectsFilter(
          geomField,
          feature.getGeometry(),
          options.map.getView().getProjection().getCode()
        );
      }

      let propertyFilter = likeFilter(options.fieldName, '*' + keywords + '*');
      let and = andFilter(geometryfilter, propertyFilter);
      let queryParam = {
        service: 'WFS',
        version: '1.1.0',
        request: 'GetFeature',
        typeName: options.layerName,
        maxFeatures: options.maxcount,
        outputFormat: 'application/json',
        FILTER: options.extent
          ? new XMLSerializer().serializeToString(writeFilter(and))
          : new XMLSerializer().serializeToString(writeFilter(propertyFilter))
      };
      axios({
        method: 'POST',
        url: options.url + '/ows?',
        data: qs.stringify(queryParam),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000
      })
        .then((res) => {
          var geoResult = [];
          if (res.data.features && res.data.features.length > 0) {
            res.data.features.forEach((feature) => {
              feature.fieldArray = options.fieldArray;
              feature.geometryType = feature.geometry.type;
              feature.fieldOnMap = feature.properties[options.fieldOnMap] || '';
              feature.name = feature.properties[options.fieldName] || '';
              feature.from = 'GeoServer';
              feature.color = '#26972d';
              delete feature.id;
              delete feature.index;
              delete feature.geometry_name;
              if (feature.crs) {
                feature.dataProjection =
                  'EPSG:' +
                  feature.crs.properties.name.replace(
                    'urn:ogc:def:crs:EPSG::',
                    ''
                  );
              } else if (res.data.crs) {
                feature.dataProjection =
                  'EPSG:' +
                  res.data.crs.properties.name.replace(
                    'urn:ogc:def:crs:EPSG::',
                    ''
                  );
              } else {
                feature.dataProjection = 'EPSG:4490';
              }
              geoResult.push(feature);
            });
            resolve(geoResult);
          } else {
            resolve([]);
          }
        })
        .catch((e) => {
          if (e) {
            resolve([]);
            this.requestError('geoserver服务');
          }
        });
    });
  }
  //arcgisserver的矢量服务
  static getArcgisServerData(options, keywords) {
    return new Promise((resolve) => {
      if (
        !options.fieldArray ||
        (options.fieldArray && options.fieldArray.length < 1)
      ) {
        Message({
          showClose: true,
          message: '必须提供结果展示字段配置-fieldArray',
          type: 'error'
        });
        resolve([]);
      }
      let queryParam = {
        f: 'json',
        outFields: '*',
        where: `${options.fieldName.toUpperCase()} like '%${keywords}%'`
      };
      if (options.extent) {
        queryParam.geometryType = 'esriGeometryEnvelope';
        queryParam.geometry = {
          xmin: options.extent[0],
          ymin: options.extent[1],
          xmax: options.extent[2],
          ymax: options.extent[3]
        };
        queryParam.inSR = getEsriSpatialReference(
          options.map.getView().getProjection().getCode()
        );
      }
      axios({
        method: 'GET',
        url: options.url + '/query',
        timeout: 10000,
        params: queryParam
      })
        .then((res) => {
          if (res.data.features && res.data.features.length > 0) {
            res.data.features = res.data.features.splice(0, options.maxcount);
            res.data.features.forEach((feature) => {
              if (
                res.data.geometryType &&
                res.data.geometryType === 'esriGeometryPoint'
              ) {
                feature.geometryType = 'Point';
              }
              feature.fieldArray = options.fieldArray;
              res.data.spatialReference
                ? (feature.dataProjection =
                    'EPSG:' + res.data.spatialReference.wkid)
                : (feature.dataProjection = 'EPSG:4490');
              feature.fieldOnMap =
                feature.attributes[
                  options.fieldOnMap ? options.fieldOnMap : options.fieldName
                ] || '';
              feature.name = feature.attributes[options.fieldName] || '';
              feature.color = '#6D29CC';
              feature.from = 'ArcGISServer';
            });
            resolve(res.data.features);
          } else {
            resolve([]);
          }
        })
        .catch((error) => {
          if (error) {
            this.requestError('arcgisServer');
            resolve([]);
          }
        });
    });
  }
  //获取行政区数据
  static getXzqData(options, keywords) {
    var rules = '';
    options.queryField === 'xzqdm'
      ? (rules = { xzqdm: keywords, size: options.maxcount })
      : (rules = { xzqmc: keywords, size: options.maxcount });
    return new Promise((resolve) => {
      postFromAdmin(options.url + '/xzqSearch/' + options.layerName, rules, {
        headers: {
          'Content-Type': 'application/json',
          token: options.token,
          applicationId: options.applicationId
        },
        timeout: 10000
      }).then((res) => {
        let result = parseResult(res);
        if (result.success) {
          let xzqresult = result.data;
          if (xzqresult.length > options.maxcount) {
            xzqresult.splice(0, options.maxcount);
          }

          //构造结果对象集

          let newResult = [];
          xzqresult.forEach((xzqlist) => {
            var addresslink = '';
            xzqlist.forEach((xzqobj) => {
              addresslink += xzqobj.xzqmc;
              //去除直辖市重名
            });
            let obj = {
              name: xzqlist[xzqlist.length - 1].xzqmc,
              address: addresslink,
              from: 'ShineGIS',
              url: options.url,
              layerName: options.layerName,
              color: '#3F91DC',
              xzqdm: xzqlist[xzqlist.length - 1].xzqdm
            };

            newResult.push(obj);
          });
          resolve(newResult);
        } else {
          console.warn('一键搜索获取行政区数据失败', result.message);
          resolve([]);
        }
      });
    });
  }
  static requestError(params) {
    console.error(params + '数据请求失败');
  }
}
export default SearchEngine;
