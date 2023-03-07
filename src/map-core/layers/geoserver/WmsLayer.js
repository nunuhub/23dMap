import { Image as ImageLayer } from 'ol/layer';
import axios from '../../../utils/request';
import { ImageWMS as ImageWMSSouece } from 'ol/source';

import WMSCapabilities from 'ol/format/WMSCapabilities';
import { find } from 'ol/array';
import { LoadXmlText } from '../../../utils/common';

class WmsLayer {
  constructor(map) {
    this.map = map;
  }

  generate(data) {
    return new Promise((resolve, reject) => {
      var requestUrl = '';
      let _this = this;
      if (data.url.indexOf('?') > -1) {
        requestUrl = data.url + '&service=WMS&request=getCapabilities';
      } else if (data.type.indexOf('geoserver') > -1) {
        var lastSeparator = data.url.lastIndexOf('/');
        requestUrl = data.url.substring(0, lastSeparator);
        var workspace = data.url
          .substring(lastSeparator + 1, data.url.length)
          .split(':')[0];
        requestUrl =
          requestUrl +
          '/' +
          workspace +
          '/wms?service=WMS&request=getCapabilities';
      } else {
        requestUrl = data.url + '?service=WMS&request=getCapabilities';
      }
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
          let parser = new WMSCapabilities();
          let result;
          try {
            result = parser.read(response.headers ? response.data : response);
          } catch (e) {
            reject(new Error('当前用户没权限,请联系管理员'));
            return;
          }

          let layers = result['Capability']['Layer']['Layer'];
          let targetLayer = null;
          if (data.visibleLayers.length > 0) {
            let lyrName = data.visibleLayers[0];
            if (Array.isArray(lyrName) === true) {
              lyrName = lyrName[0];
            }
            if (lyrName.split(':').length > 1) {
              lyrName = data.visibleLayers[0].split(':')[1];
            }
            // arcgis
            if (data.type.indexOf('geoserver') === -1) {
              targetLayer = layers[0];
            } else if (data.geoGroup) {
              let groupLayer = find(layers, function (elt) {
                return elt['Name'] === data.geoGroup;
              });
              targetLayer = find(groupLayer.Layer, function (elt) {
                return (
                  elt['Name'] === lyrName ||
                  elt['Name'] === data.visibleLayers[0]
                );
              });
            } else {
              targetLayer = find(layers, function (elt) {
                return (
                  elt['Name'] === lyrName ||
                  elt['Name'] === data.visibleLayers[0]
                );
              });
              if (targetLayer.Layer) {
                console.warn('targetLayer.Layer存在', data);
              }
            }
          }
          if (targetLayer) {
            let groupinfo = targetLayer.Layer;
            let initExtent = targetLayer['BoundingBox'][0].extent;
            let options = {
              initExtent: initExtent
            };
            let layer = _this.createImageWMSLayer(data, options, groupinfo);
            resolve(layer);
          } else {
            reject(
              new Error(
                '不存在图层的visibleLayers' +
                  '"' +
                  data.visibleLayers[0] +
                  '"' +
                  '!'
              )
            );
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
   * 创建ArcGIS和GeoServer的WMS服务图层
   * @param {*} data
   * @param {*} options
   */
  createImageWMSLayer(data, options, groupinfo) {
    var wmsurl;
    if (data.url.indexOf('?') > -1) {
      wmsurl = data.url;
    } else {
      var lastSeparator = data.url.lastIndexOf('/');
      wmsurl = data.url.substring(0, lastSeparator);
      var workspace = data.url
        .substring(lastSeparator + 1, data.url.length)
        .split(':')[0];
      // var layerName = data.url.substring(lastSeparator + 1, data.url.length).split(':')[1];
      wmsurl = wmsurl + '/' + workspace + '/wms';
    }

    let params = {
      LAYERS: data.visibleLayers,
      VERSION: '1.1.0'
    };
    if (data.filter) {
      params.CQL_FILTER = data.filter;
    }
    if (data.authkey) {
      params.authkey = data.authkey;
    }
    let layer = new ImageLayer({
      id: data.id,
      info: data,
      groupinfo: groupinfo,
      layerTag: data.layerTag,
      opacity: data.opacity,
      zIndex: data.mapIndex,
      initExtent: options.initExtent,
      minZoom: data.minZoom,
      maxZoom: data.maxZoom,
      minResolution: data.minResolution,
      maxResolution: data.maxResolution,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      source: new ImageWMSSouece({
        crossOrigin: 'anonymous',
        url: wmsurl,
        params: params
      })
    });
    if (!data.geoStr) {
      let param = {
        typeName: data.selectLayer ? data.selectLayer : data.visibleLayers[0],
        service: 'wfs',
        Request: 'DescribeFeatureType',
        authkey: data.authkey
      };
      axios
        .get(data.url, {
          params: param,
          timeout: 5000,
          headers: {
            'content-type': 'application/xml'
          }
        })
        .then((response) => {
          let xml;
          try {
            xml = LoadXmlText(response.headers ? response.data : response);
          } catch (e) {
            return;
          }
          let elementList =
            xml.getElementsByTagName('xsd:sequence')[0].children;
          for (let element of elementList) {
            if (element.getAttribute('type')?.indexOf('gml') > -1) {
              data.geoStr = element.getAttribute('name');
            }
          }
        });
    }
    return layer;
  }
}

export default WmsLayer;
