import { Tile as TileLayer } from 'ol/layer';
import axios from '../../../utils/request';
import { WMTS as WMTSSource } from 'ol/source';

import { find } from 'ol/array';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import { getCapabilitiesUrl } from '../../../utils/uitls';
import { optionsFromCapabilities } from 'ol/source/WMTS';
import { Message } from 'element-ui';
import { getWidth } from 'ol/extent';

class SdTDTLayer {
  constructor(map) {
    this.map = map;
  }

  generate(data) {
    return new Promise((resolve, reject) => {
      let _this = this;
      let requestUrl = getCapabilitiesUrl(data);
      axios
        .get(requestUrl, {
          headers: {
            'content-type': 'application/xml'
          }
        })
        .then((response) => {
          let options = {
            CapabilitiesXml: response.headers ? response.data : response
          };
          let layer = _this.createTDTLayer(data, options, reject);
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
   * 创建天地图图层
   * @param {*} data
   * @param {*} options
   */
  createTDTLayer(data, options, reject) {
    let extent = [];
    let parser = new WMTSCapabilities();
    let result = parser.read(options.CapabilitiesXml);
    let layers = result['Contents']['Layer'];
    let targetLayer = find(layers, function (elt) {
      if (data.visibleLayers && data.visibleLayers.length > 0) {
        return elt['Identifier'] === data.visibleLayers[0]
          ? data.visibleLayers[0]
          : data.name;
      } else {
        return data.name;
      }
    });
    extent = targetLayer.WGS84BoundingBox;
    /*let projCode = result.Contents.TileMatrixSet[0].SupportedCRS.replace(
          'urn:ogc:def:crs:',
          ''
        ).replace('::', ':');
        registerProj(projCode);*/
    let WMTSSourceOptions;

    try {
      let module = require('!raw-loader!../../../assets/tdt/' + 'vec_c.xml');
      let xml = parser.read(module.default);
      WMTSSourceOptions = optionsFromCapabilities(xml, {
        layer: 'vec',
        matrixSet: data.matrixSet,
        requestEncoding: 'KVP'
      });
    } catch (e) {
      Message({
        type: 'error',
        message: '图层' + data.label + '切片方案有误'
      });
      console.error(e);
      reject('图层' + data.label + '切片方案有误');
    }
    WMTSSourceOptions.crossOrigin = 'anonymous';
    // 天地图Capabilities.xml中TopLeftCorner坐标规范为[y,x],在这里需转换为[x,y]
    for (let i = 0; i < WMTSSourceOptions.tileGrid.origins_.length; i++) {
      WMTSSourceOptions.tileGrid.origins_[i].reverse();
    }
    // WMTSSourceOptions.crossOrigin = 'anonymous';

    WMTSSourceOptions.urls[0] = data.url;
    let resolutions = [];
    let matrixIds = [];
    let maxZoom = 18;
    for (let z = 0; z <= maxZoom; ++z) {
      resolutions[z] =
        getWidth([-180.0, -90.0, 180.0, 90.0]) / 256 / Math.pow(2, z);
      matrixIds[z] = z;
      WMTSSourceOptions.tileGrid.origins_[z] =
        WMTSSourceOptions.tileGrid.origins_[0];
      WMTSSourceOptions.tileGrid.tileSizes_[z] = [256, 256];
    }

    WMTSSourceOptions.tileGrid.extent_ = extent;
    WMTSSourceOptions.tileGrid.resolutions_ = resolutions;
    WMTSSourceOptions.tileGrid.matrixIds_ = matrixIds;
    WMTSSourceOptions.layer = data.visibleLayers[0];
    WMTSSourceOptions.matrixSet =
      result['Contents']['TileMatrixSet'][0].Identifier;
    if (data.authkey) {
      if (WMTSSourceOptions.urls[0].indexOf('?') !== -1) {
        WMTSSourceOptions.urls[0] =
          WMTSSourceOptions.urls[0] + '&authkey=' + data.authkey;
      } else {
        WMTSSourceOptions.urls[0] =
          WMTSSourceOptions.urls[0] + '?authkey=' + data.authkey;
      }
    }

    var layerZIndex = data.mapIndex ? data.mapIndex : -1;
    if (layerZIndex < 0) {
      layerZIndex = data.zIndex ? data.zIndex : -1;
    }
    if (data.isOverLimt) {
      WMTSSourceOptions.tileGrid.fullTileRanges_ = []; //突破tileRange限制，部分切片MatrixWidth错误,弊端是会有范围外的无效请求,临时解决方案
    }
    let layer = new TileLayer({
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      opacity: 1,
      initExtent: extent,
      minResolution: data.minResolution,
      maxResolution: data.maxResolution,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      source: new WMTSSource(WMTSSourceOptions)
    });
    if (layerZIndex > -1) {
      layer.setZIndex(layerZIndex);
    }
    return layer;
  }
}

export default SdTDTLayer;
