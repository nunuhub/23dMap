import axios from '../../../utils/request';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import { createXYZ } from 'ol/tilegrid.js';
import MVT from 'ol/format/MVT';
import { Fill, Stroke, Style } from 'ol/style';

class PbfVectorTiledLayer {
  constructor(map) {
    this.map = map;
  }

  generate(data) {
    return new Promise((resolve, reject) => {
      let _this = this;
      let requestUrl =
        data.url + '?SERVICE=WMTS&request=getCapabilities&version=1.0.0';
      if (data.authkey) {
        requestUrl = requestUrl + '&authkey=' + data.authkey;
      }
      axios
        .get(requestUrl)
        .then((response) => {
          let json = response.headers ? response.data : response;
          let layer = _this.createPbfVectorTiledLayer(data, json, reject);
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
  createPbfVectorTiledLayer(data, json) {
    let extent = [];
    extent = json.bounds;
    let url = 'http://10.88.47.243:8000/mapdb/maps/zhenshan/{z}/{x}/{y}.pbf?';
    /* let params = {
            'REQUEST': 'GetTile',
            'SERVICE': 'WMTS',
            'VERSION': '1.0.0',
            'LAYER': data.visibleLayers[0],
            'STYLE': style,
            'TILEMATRIX': gridsetName + ':{z}',
            'TILEMATRIXSET': gridsetName,
            'FORMAT': 'application/vnd.mapbox-vector-tile',
            'TILECOL': '{x}',
            'TILEROW': '{y}'
        }
        if (data.authkey){
            params.authkey =  data.authkey
        }
        var url = data.url +'?'
        for (var param in params) {
            url = url + param + '=' + params[param] + '&';
        }
        url = url.slice(0, -1);*/

    let layerStyle = this._getLayerStyle(data.style);
    let layer = new VectorTileLayer({
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      opacity: data.opacity,
      zIndex: data.mapIndex,
      initExtent: extent,
      minZoom: data.minZoom,
      maxZoom: data.maxZoom,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      style: layerStyle,
      source: new VectorTileSource({
        projection: this.map.getView().getProjection().getCode(),
        crossOrigin: 'anonymous',
        format: new MVT(),
        wrapX: true,
        extent: extent,
        tileGrid: createXYZ({
          extent: extent,
          maxZoom: 22
        }),
        url: url
      })
    });
    layer._getLayerStyle = this._getLayerStyle;
    layer._getStyle = this._getStyle;
    // 绑定刷新样式的方法
    layer.setLayerStyle = function (style) {
      this.setStyle(this._getLayerStyle(style));
    };
    // 初始范围

    layer.set('initExtent', extent);
    return layer;
  }
  _getLayerStyle(style) {
    let self = this;
    if (style) {
      if (style.default || style.data) {
        return function (feature) {
          if (style.data) {
            for (let item of style.data) {
              if (feature.properties_[item.key] === item.value) {
                return self._getStyle(item);
              }
            }
          }
          if (style.default) {
            return self._getStyle(style.default);
          }
        };
      } else {
        return style;
      }
    } else {
      return self._getStyle({
        strokeColor: 'rgba(1, 191, 255, 2)',
        strokeWidth: 2,
        fill: 'rgba(255, 255, 255, 0.2)'
      });
    }
  }

  _getStyle(style) {
    return new Style({
      fill: new Fill({
        color: style.fill
      }),
      stroke: new Stroke({
        color: style.strokeColor,
        width: style.strokeWidth
      })
    });
  }
}

export default PbfVectorTiledLayer;
