import axios from '../../../utils/request';
import { registerProj } from '../../CustomProjection';

import { addParamToUrl } from '../../../utils/uitls';
import TileGrid from 'ol/tilegrid/TileGrid';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import { transformExtent } from 'ol/proj';
import StyleManager from '../../StyleManager';

class VectorTiledLayer {
  constructor(map) {
    this.map = map;
    this.styleManager = new StyleManager(this.map);
    this.proxy = '/gisqBI/api/gis/proxy?';
  }

  generate(data) {
    return new Promise((resolve, reject) => {
      let _this = this;
      if (data.isProxy) {
        this.proxy = data.proxyPath ? data.proxyPath : '/gisqBI/api/gis/proxy?';
      } else {
        this.proxy = '';
      }
      let requestUrl = this.proxy + data.url;
      requestUrl = addParamToUrl(requestUrl, 'f', 'json');
      if (data.authkey) {
        requestUrl = addParamToUrl(requestUrl, 'authkey', data.authkey);
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
            extUrl:
              json.tiles && json.tiles.length === 1
                ? json.tiles[0]
                : '/tile/{z}/{y}/{x}.pbf',
            defaultStyles: json.defaultStyles
          };

          let layer = _this.createArcGISVectorTiledLayer(data, options);
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
   * 创建WMTS服务图层
   * @param {*} data
   * @param {*} options
   */
  createArcGISVectorTiledLayer(data, options) {
    let url = this.proxy + data.url + '/' + options.extUrl;
    if (data.authkey) {
      url = addParamToUrl(url, 'authkey', data.authkey);
    }
    let layer = new VectorTileLayer({
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
      source: new VectorTileSource({
        projection: options.projCode,
        format: new MVT(),
        crossOrigin: 'anonymous',
        tileGrid: new TileGrid({
          extent: options.extent,
          origin: options.origin,
          resolutions: options.resolutions,
          tileSize: options.tileSize
        }),
        url: url
      })
    });

    //图层绑定样式getLayerStyle setLayerStyle方法
    this.styleManager.bindLayer(layer);

    // 初始样式
    if (data.symbol) {
      layer.setLayerStyle(data.symbol);
    }

    return layer;
  }
}

export default VectorTiledLayer;
