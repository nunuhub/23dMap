import { Image as ImageLayer } from 'ol/layer';
import axios from '../../../utils/request';
import { registerProj } from '../../CustomProjection';
import { transformExtent } from 'ol/proj';
import { ImageArcGISRest } from 'ol/source';
import {
  addParamByData,
  addParamToUrl,
  appendPath
} from '../../../utils/uitls';
import { appendParams } from 'ol/uri';

class DynamicLayer {
  constructor(map) {
    this.map = map;
    this.proxy = '/gisqBI/api/gis/proxy?';
  }

  generate(data) {
    // if (data.isProxy && process.env.NODE_ENV === 'development') {
    if (data.isProxy) {
      this.proxy = data.proxyPath ? data.proxyPath : '/gisqBI/api/gis/proxy?';
    } else {
      this.proxy = '';
    }
    return new Promise((resolve, reject) => {
      let requestUrl = this.proxy + data.url;
      requestUrl = addParamToUrl(requestUrl, 'f', 'json');
      requestUrl = addParamByData(requestUrl, data);
      axios
        .get(requestUrl)
        // axios.get((process.env.NODE_ENV === 'development' ? '' : '') + data.url + '?f=json')
        .then((response) => {
          response = response.headers ? response.data : response;
          let json = '';
          if ((typeof response).toLowerCase() === 'string') {
            try {
              json = JSON.parse(response);
            } catch (e) {
              reject(new Error('当前用户没权限,请联系管理员'));
              return;
            }
          } else {
            json = response;
          }
          const initExtent = [];
          let projCode = '';
          if (json.fullExtent.spatialReference.wkt) {
            registerProj(json.fullExtent.spatialReference.wkt, [
              json.fullExtent.xmin,
              json.fullExtent.ymin,
              json.fullExtent.xmax,
              json.fullExtent.ymax
            ]);
            projCode = json.fullExtent.spatialReference.wkt;
          } else {
            projCode = 'EPSG:' + json.fullExtent.spatialReference.wkid;
            registerProj(projCode);
          }
          if (json.fullExtent.xmin !== 'NaN') {
            initExtent.push(
              json.fullExtent.xmin,
              json.fullExtent.ymin,
              json.fullExtent.xmax,
              json.fullExtent.ymax
            );
          } else {
            initExtent.push(
              json.initialExtent.xmin,
              json.initialExtent.ymin,
              json.initialExtent.xmax,
              json.initialExtent.ymax
            );
          }

          const options = {
            projCode: projCode,
            initExtent: transformExtent(initExtent, projCode, 'EPSG:4326')
          };
          const layer = this.createArcGISDynamicLayer(data, options);
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
  }

  /**
   * 创建ArcGIS动态服务图层
   * @param {*} data
   * @param {*} options
   */
  createArcGISDynamicLayer(data, options) {
    const params = {
      LAYERS: 'show:' + data.visibleLayers.join(',')
    };
    if (data.layerDefs) {
      params.layerDefs = data.layerDefs;
    }
    if (data.authkey) {
      params.authkey = data.authkey;
    }
    const isFit = typeof data.isFit === 'boolean' ? data.isFit : false;
    ImageArcGISRest.prototype.getRequestUrl_ = function (
      extent,
      size,
      pixelRatio,
      projection,
      params
    ) {
      var srid = projection
        .getCode()
        .split(/:(?=\d+$)/)
        .pop();
      params['SIZE'] = size[0] + ',' + size[1];
      params['BBOX'] = extent.join(',');
      params['BBOXSR'] = srid;
      params['IMAGESR'] = srid;
      params['DPI'] = Math.round(90 * pixelRatio);
      var url = this.url_;
      let exportPath =
        url.indexOf('ImageServer') > -1 ? 'exportImage' : 'export';
      let modifiedUrl = appendPath(url, exportPath);
      return appendParams(modifiedUrl, params);
    };
    const layer = new ImageLayer({
      id: data.id,
      layerTag: data.layerTag,
      opacity: data.opacity,
      zIndex: data.mapIndex,
      info: data,
      initExtent: options.initExtent,
      minZoom: data.minZoom,
      maxZoom: data.maxZoom,
      minResolution: data.minResolution,
      maxResolution: data.maxResolution,
      isFit: isFit,
      source: new ImageArcGISRest({
        crossOrigin: 'anonymous',
        ratio: 1,
        imageLoadFunction: function (image, src) {
          if (src.indexOf('jsp?') !== -1) {
            image.getImage().src = src.replace('&', '?');
          } else {
            image.getImage().src = src;
          }
          /* if (src.indexOf('jsp?') !== -1) {
                        src = src.replace('&', '?')
                    }
                    let paramName = 'IMAGESR'
                    var re=eval('/('+ paramName +'=)([^&]*)/gi');
                    var nSrc = src.replace(re,paramName+'='+'')
                    image.getImage().src = nSrc */
        },
        url: this.proxy + data.url,
        params: params
      })
    });
    return layer;
  }
}

export default DynamicLayer;
