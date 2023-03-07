/*
 * @Author: lizhi
 * @Date: 2021/8/27 9:38
 * @Description: tool for WMTS capabilities
 */

import { xmlToJson } from '../../utils/common';
import $ from 'jquery';
import * as Cesium from 'cesium_shinegis_earth';
import { Message } from 'element-ui';

/*
 * request the url provided by user,usually a xml format file,resolving the response data,using xmlTojson funtion to transform it
 * and parting of the properties from the resolved data, push it into the params to use
 *
 */
function getWMTSCapabilities(url, layerName, type, matrixlabel, myMatrixSet) {
  if (!url || url === '') {
    console.error('The url was not provided or it is invalid!');
    return;
  }
  var params = {
    RestfulUrl: '',
    KvpUrl: '',
    layer: '',
    style: '',
    format: '',
    tileMatrixSetID: '',
    maximumLevel: null,
    tileMatrixLabels: [],
    tilingScheme: null,
    position: '',
    ServiceType: ''
  };
  $.ajax({
    url: url,
    type: 'GET',
    async: false,
    timeout: 3000,
    success: function (data) {
      let jsonObj = xmlToJson(data);
      if (type === 'geoserver') {
        params.ServiceType = 'geoserver';
      } else {
        params.ServiceType = 'arcgisserver';
      }
      if (params.ServiceType === 'geoserver' && !layerName) {
        console.error('params error! layer name from Geoserver is required !');
        /* if the service url is from geoserver or proxy,use a special rule to resolve */
        /* add proxy seting */
        //暂时以shinegis作为代理判断依据
      } else if (params.ServiceType === 'geoserver' && layerName) {
        if (
          Array.isArray(
            jsonObj.Capabilities['ows:OperationsMetadata']['ows:Operation'][1][
              'ows:DCP'
            ]['ows:HTTP']['ows:Get']
          )
        ) {
          params.KvpUrl =
            jsonObj.Capabilities['ows:OperationsMetadata']['ows:Operation'][1][
              'ows:DCP'
            ]['ows:HTTP']['ows:Get'][1]['@attributes']['xlink:href'];
        } else {
          params.KvpUrl =
            jsonObj.Capabilities['ows:OperationsMetadata']['ows:Operation'][1][
              'ows:DCP'
            ]['ows:HTTP']['ows:Get']['@attributes']['xlink:href'];
        }
        if (jsonObj.Capabilities.Contents.Layer instanceof Array) {
          jsonObj.Capabilities.Contents.Layer.forEach((item) => {
            if (item['ows:Identifier']['#text'] === layerName) {
              params.tilingScheme = new Cesium.GeographicTilingScheme();
              params.format = 'image/png';
              params.RestfulUrl = item.ResourceURL[0]['@attributes'].template;
              if (item['ows:WGS84BoundingBox']) {
                params.position =
                  item['ows:WGS84BoundingBox']['ows:LowerCorner']['#text'] +
                  ' ' +
                  item['ows:WGS84BoundingBox']['ows:UpperCorner']['#text'];
              }
              params.layer = layerName;
              if (item.Style['ows:Identifier'] == {}) {
                params.style = '';
              } else {
                params.style = item.Style['ows:Identifier']['#text'] || '';
              }
              if (Array.isArray(item.TileMatrixSetLink) === true) {
                params.maximumLevel =
                  item.TileMatrixSetLink[0].TileMatrixSetLimits.TileMatrixLimits.length;
                params.tileMatrixSetID =
                  item.TileMatrixSetLink[1].TileMatrixSet['#text'];
                item.TileMatrixSetLink[1].TileMatrixSetLimits.TileMatrixLimits.forEach(
                  (arr) => {
                    var arrayElement1 = arr.TileMatrix['#text'];
                    return params.tileMatrixLabels.push(arrayElement1);
                  }
                );
              } else {
                params.maximumLevel =
                  item.TileMatrixSetLink.TileMatrixSetLimits.TileMatrixLimits.length;
                params.tileMatrixSetID =
                  item.TileMatrixSetLink.TileMatrixSet['#text'];
                item.TileMatrixSetLink.TileMatrixSetLimits.TileMatrixLimits.forEach(
                  (item) => {
                    var arrayElement = item.TileMatrix['#text'];
                    return params.tileMatrixLabels.push(arrayElement);
                  }
                );
              }
              if (params.RestfulUrl === '') {
                console.error('layer name may incorrect,please check it!');
              }
            }
          });
        } else {
          let item = jsonObj.Capabilities.Contents.Layer;
          if (item['ows:Identifier']['#text'] === layerName) {
            params.tilingScheme = new Cesium.GeographicTilingScheme();
            params.format = 'image/png';
            params.RestfulUrl = item.ResourceURL[0]['@attributes'].template;
            if (item['ows:WGS84BoundingBox']) {
              params.position =
                item['ows:WGS84BoundingBox']['ows:LowerCorner']['#text'] +
                ' ' +
                item['ows:WGS84BoundingBox']['ows:UpperCorner']['#text'];
            }
            params.layer = layerName;
            if (item.Style['ows:Identifier'] == {}) {
              params.style = '';
            } else {
              params.style = item.Style['ows:Identifier']['#text'] || '';
            }
            if (Array.isArray(item.TileMatrixSetLink) === true) {
              let maximumLevel =
                item.TileMatrixSetLink[0]?.TileMatrixSetLimits?.TileMatrixLimits
                  ?.length;
              maximumLevel
                ? (params.maximumLevel = maximumLevel)
                : (params.maximumLevel = 18);
              myMatrixSet
                ? (params.tileMatrixSetID = myMatrixSet)
                : (params.tileMatrixSetID =
                    item.TileMatrixSetLink[1].TileMatrixSet['#text']);
              item.TileMatrixSetLink[1].TileMatrixSetLimits.TileMatrixLimits.forEach(
                (arr) => {
                  var arrayElement1 = arr.TileMatrix['#text'];
                  return params.tileMatrixLabels.push(arrayElement1);
                }
              );
            } else {
              params.maximumLevel =
                item.TileMatrixSetLink.TileMatrixSetLimits.TileMatrixLimits.length;
              params.tileMatrixSetID =
                item.TileMatrixSetLink.TileMatrixSet['#text'];
              item.TileMatrixSetLink.TileMatrixSetLimits.TileMatrixLimits.forEach(
                (item) => {
                  var arrayElement = item.TileMatrix['#text'];
                  return params.tileMatrixLabels.push(arrayElement);
                }
              );
            }
            if (params.RestfulUrl === '') {
              console.error('layer name may incorrect,please check it!');
            }
          }
        }
      } else {
        /* resolve the json object,find the  key fields */
        if (jsonObj.Capabilities.Contents.Layer.ResourceURL) {
          params.RestfulUrl =
            jsonObj.Capabilities.Contents.Layer.ResourceURL[
              '@attributes'
            ].template;
        }
        params.KvpUrl =
          jsonObj.Capabilities['ows:OperationsMetadata']['ows:Operation'][1][
            'ows:DCP'
          ]['ows:HTTP']['ows:Get'][1]['@attributes']['xlink:href'];
        params.layer =
          jsonObj.Capabilities['ows:ServiceIdentification']['ows:Title'][
            '#text'
          ];
        params.format = 'image/png';
        params.style =
          jsonObj.Capabilities.Contents.Layer.Style['ows:Identifier']['#text'];
        params.TileMatrixSet = jsonObj.Capabilities.Contents.TileMatrixSet;
        if (jsonObj.Capabilities.Contents.Layer['ows:BoundingBox']) {
          params.position =
            jsonObj.Capabilities.Contents.Layer['ows:BoundingBox'][
              'ows:LowerCorner'
            ]['#text'] +
            ' ' +
            jsonObj.Capabilities.Contents.Layer['ows:BoundingBox'][
              'ows:UpperCorner'
            ]['#text'];
          var dataProj =
            jsonObj.Capabilities.Contents.Layer['ows:BoundingBox'][
              '@attributes'
            ].crs.toString();
          var reg = new RegExp('urn:ogc:def:crs:EPSG::', 'g');
          dataProj = dataProj.replace(reg, '');
        }

        /* this array used to save some EPSG code from projected coordinate system,if not include your projection,you can expand the capacity */
        var projSet = ['4490', '4610', '4214', '4510', '4511', '4512', '4528'];

        /* some TileMatrixSet is array ,so use the different style to resolve it */
        if (Array.isArray(jsonObj.Capabilities.Contents.TileMatrixSet)) {
          params.TileMatrix =
            jsonObj.Capabilities.Contents.TileMatrixSet[0].TileMatrix;
          params.tileMatrixSetID =
            jsonObj.Capabilities.Contents.Layer.TileMatrixSetLink[0].TileMatrixSet[
              '#text'
            ];
          params.maximumLevel =
            jsonObj.Capabilities.Contents.TileMatrixSet[0].TileMatrix.length -
            1;
          //if geogrophy coordinate
          if (projSet.indexOf(dataProj) !== -1) {
            params.tilingScheme = new Cesium.GeographicTilingScheme();

            var martrix =
              jsonObj.Capabilities.Contents.TileMatrixSet[0].TileMatrix;
            for (let i = 0; i < martrix.length; i++) {
              if (
                martrix[i].MatrixHeight['#text'] == '1' &&
                martrix[i].MatrixWidth['#text'] == '2'
              ) {
                for (let j = i; j < martrix.length; j++) {
                  params.tileMatrixLabels.push(
                    martrix[j]['ows:Identifier']['#text']
                  );
                }
              }
            }
          }
          // proj coordinate
          else {
            params.tilingScheme = null;
            jsonObj.Capabilities.Contents.TileMatrixSet[0].TileMatrix.forEach(
              (item) => {
                return params.tileMatrixLabels.push(
                  item['ows:Identifier']['#text']
                );
              }
            );
          }
        } else {
          params.TileMatrix =
            jsonObj.Capabilities.Contents.TileMatrixSet.TileMatrix;
          params.tileMatrixSetID =
            jsonObj.Capabilities.Contents.Layer.TileMatrixSetLink.TileMatrixSet[
              '#text'
            ];
          params.maximumLevel =
            jsonObj.Capabilities.Contents.TileMatrixSet.TileMatrix.length - 1;
          //if geogrophy coordinate
          if (projSet.indexOf(dataProj) !== -1) {
            params.tilingScheme = new Cesium.GeographicTilingScheme();
            var martrixTdt =
              jsonObj.Capabilities.Contents.TileMatrixSet.TileMatrix;
            for (let i = 0; i < martrixTdt.length; i++) {
              if (
                martrixTdt[i].MatrixHeight['#text'] == '1' &&
                martrixTdt[i].MatrixWidth['#text'] == '2'
              ) {
                for (let j = i; j < martrixTdt.length; j++) {
                  params.tileMatrixLabels.push(
                    martrixTdt[j]['ows:Identifier']['#text']
                  );
                }
              } else if (
                martrixTdt[i].MatrixHeight['#text'] == '2' &&
                martrixTdt[i].MatrixWidth['#text'] == '2'
              ) {
                for (let j = i; j < martrixTdt.length; j++) {
                  params.tileMatrixLabels.push(
                    martrixTdt[j]['ows:Identifier']['#text']
                  );
                }
              }
            }
          }
          // proj coordinate
          else {
            params.tilingScheme = null;
            jsonObj.Capabilities.Contents.TileMatrixSet.TileMatrix.forEach(
              (item) => {
                return params.tileMatrixLabels.push(
                  item['ows:Identifier']['#text']
                );
              }
            );
          }
        }
      }
      if (matrixlabel && Array.isArray(matrixlabel) && matrixlabel.length > 0) {
        params.tileMatrixLabels = [];
        params.tileMatrixLabels = matrixlabel;
      }
    },
    error: function () {
      console.error('faild to request WMTS Capabilities xml !');
    },
    complete: function (XMLHttpRequest, textStatus) {
      if (textStatus === 'timeout') {
        Message('request WMTS Capabilities time out!');
      }
    }
  });
  return params;
}

/*
 * if an url provided by geoserver,users have to provide a layer name also
 *  @example
 *  getWMTSCapabilities(url,'wzmap');
 *
 *
 *  if your url is not from geoserver, just need a url,or with a null
 *  @example
 *  getWMTSCapabilities(url);
 *  getWMTSCapabilities(url,null);
 */

/*
 *from geoserver,open the annotation to try it out
 */

//getWMTSCapabilities('http://192.168.11.72:8000/geoserver/gwc/service/wmts?SERVICE=WMTS&request=getCapabilities&version=1.0.0','zsy:st_xsq');

/*
 * from arcgis server,just need an url
 * the others url are:
 *@exampleUrl  https://basemap.nationalmap.gov/arcgis/rest/services/USGSHydroCached/MapServer/WMTS/1.0.0/WMTSCapabilities.xml
 *@exampleUrl  https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/WMTS/1.0.0/WMTSCapabilities.xml
 *@exampleUrl  http://192.168.11.149:6080/arcgis/rest/services/TXGHJG/TDLYXZ_2019/MapServer/WMTS
 *@exampleUrl  http://61.175.211.102/arcgis/rest/services/wzmap/map/MapServer/WMTS
 */
export { getWMTSCapabilities };
