import { Tile as TileLayer } from 'ol/layer';
import axios from '../../../utils/request';
import { registerProj } from '../../CustomProjection';
import { transformExtent } from 'ol/proj';

import { XYZ } from 'ol/source';
import { addParamToUrl, appendPath } from '../../../utils/uitls';
import TileGrid from 'ol/tilegrid/TileGrid';

class ArcGISTiledLayer {
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
      if (data.authkey) {
        requestUrl += '&authkey=' + data.authkey;
      }
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
          let initExtent = [];
          let extent = [];
          let origin = [];
          let resolutions = [];
          let tileSize = [];
          let projCode =
            'EPSG:' +
            (json.fullExtent.spatialReference.wkid === 102100
              ? 3857
              : json.fullExtent.spatialReference.wkid);
          registerProj(projCode);
          origin.push(json.tileInfo.origin.x, json.tileInfo.origin.y);
          extent.push(
            json.fullExtent.xmin,
            json.fullExtent.ymin,
            json.fullExtent.xmax,
            json.fullExtent.ymax
          );
          initExtent.push(
            json.initialExtent.xmin,
            json.initialExtent.ymin,
            json.initialExtent.xmax,
            json.initialExtent.ymax
          );
          tileSize.push(json.tileInfo.rows, json.tileInfo.cols);
          for (let i = 0, l = json.tileInfo.lods.length; i < l; i++) {
            resolutions.push(json.tileInfo.lods[i].resolution);
          }
          let options = {
            projCode: projCode,
            origin: origin,
            initExtent: transformExtent(initExtent, projCode, 'EPSG:4326'),
            extent: extent,
            resolutions: resolutions,
            tileSize: tileSize,
            extUrl: '/tile/{z}/{y}/{x}'
          };
          let layer = this.createArcGISTileLayer(data, options);
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
   * 创建ArcGIS的REST服务的切片服务图层
   * @param {*} data
   * @param {*} options
   */
  createArcGISTileLayer(data, options) {
    let url = appendPath(this.proxy + data.url, options.extUrl);
    if (data.authkey) {
      url = addParamToUrl(url, 'authkey', data.authkey);
    }
    let layer = new TileLayer({
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      opacity: data.opacity,
      zIndex: data.mapIndex,
      initExtent: options.initExtent,
      minZoom: data.minZoom,
      maxZoom: data.maxZoom,
      minResolution: data.minResolution,
      maxResolution: data.maxResolution
        ? data.maxResolution
        : options.resolutions[0] * 2,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      source: new XYZ({
        projection: options.projCode,
        crossOrigin: 'anonymous',
        declutter: true,
        tileGrid: new TileGrid({
          extent: options.extent,
          origin: options.origin,
          resolutions: options.resolutions,
          tileSize: options.tileSize
        }),
        url: url
        // url: (process.env.NODE_ENV === 'development' ? '' : '') + data.url + options.extUrl
      })
    });
    return layer;
  }
}

export default ArcGISTiledLayer;
