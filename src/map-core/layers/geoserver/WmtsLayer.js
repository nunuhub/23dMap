import { Tile as TileLayer } from 'ol/layer';
import axios from '../../../utils/request';
import { WMTS as WMTSSource } from 'ol/source';

import { find } from 'ol/array';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import $ from 'jquery';
import { registerProj } from '../../CustomProjection';
import ownOptionsFromCapabilities from '../optionsFromCapabilities';
import {
  addParamToUrl,
  getBoolean,
  getCapabilitiesUrl,
  getUrlParams
} from '../../../utils/uitls';
import { transformExtent } from 'ol/proj';

class WmtsLayer {
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

          let layer = _this.createWMTSLayer(data, options, reject);
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
  createWMTSLayer(data, options, reject) {
    let extent = [];
    var parser = new WMTSCapabilities();
    var result;
    try {
      result = parser.read(options.CapabilitiesXml);
    } catch (e) {
      reject(new Error('当前用户没权限,请联系管理员'));
      return;
    }
    let layers = result.Contents.Layer;
    let tileMatrixSet = result.Contents.TileMatrixSet;
    let targetTileMatrixSet;
    let WGS84BoundingBox;
    let targetSRS;
    $.each(layers, function (index, value) {
      if (value.Identifier === data.visibleLayers[0]) {
        targetTileMatrixSet = value.TileMatrixSetLink[0].TileMatrixSet;
        WGS84BoundingBox = value.WGS84BoundingBox;
        return false;
      }
    });
    $.each(tileMatrixSet, function (index, value) {
      if (value.Identifier === targetTileMatrixSet) {
        targetSRS = value.SupportedCRS.replace('urn:ogc:def:crs:', '').replace(
          '::',
          ':'
        );
        return false;
      }
    });
    registerProj(targetSRS);
    var WMTSSourceOptions = ownOptionsFromCapabilities(this.map, result, {
      layer: data.visibleLayers[0],
      otherPixel: data.sourceType === 'arcgis',
      pixelSize: data.pixelSize,
      targetSRS: targetSRS,
      matrixSet: data.matrixSet,
      requestEncoding: 'KVP'
    });
    // WMTSSourceOptions.format="image/png"
    if (getBoolean(data.wmtsUrl)) {
      WMTSSourceOptions.urls[0] = data.url;
    } else {
      let params = getUrlParams(data.url);
      if (params?.length > 0) {
        for (let param of params) {
          WMTSSourceOptions.urls[0] = addParamToUrl(
            WMTSSourceOptions.urls[0],
            param.name,
            param.value
          );
        }
      }
    }

    if (data.authkey) {
      if (WMTSSourceOptions.urls[0].indexOf('?') !== -1) {
        WMTSSourceOptions.urls[0] =
          WMTSSourceOptions.urls[0] + '&authkey=' + data.authkey;
      } else {
        WMTSSourceOptions.urls[0] =
          WMTSSourceOptions.urls[0] + '?authkey=' + data.authkey;
      }
    }
    // WMTSSourceOptions.tileGrid.resolutions_ = [0.7031250000000002,0.3515625000000001,0.1757812500000001,0.087890625,0.0439453125,0.02197265625,0.010986328125,0.0054931640625,0.00274658203125,0.001373291015625,0.0006866455078125,0.0003433227539063,0.0001716613769531,0.0000858306884766,0.0000429153442383,0.0000214576721191,0.0000107288360596,0.0000053644180298,0.0000026822090149,0.0000013411045074]
    let orginIndex = 0;
    if (data.switchOriginXY) {
      WMTSSourceOptions.tileGrid.origins_.forEach((origin) => {
        origin = [origin[1], origin[0]];
        WMTSSourceOptions.tileGrid.origins_[orginIndex] = origin;
        orginIndex = orginIndex + 1;
      });
    } else {
      WMTSSourceOptions.tileGrid.origins_.forEach((origin) => {
        if (origin[0] === 90 && origin[1] === -180) {
          origin = [origin[1], origin[0]];
          WMTSSourceOptions.tileGrid.origins_[orginIndex] = origin;
          orginIndex = orginIndex + 1;
        }
      });
    }

    WMTSSourceOptions.crossOrigin = 'anonymous';
    if (data.isOverLimt) {
      WMTSSourceOptions.tileGrid.fullTileRanges_ = []; //突破tileRange限制，部分切片MatrixWidth错误,弊端是会有范围外的无效请求,临时解决方案
    }
    var layer = new TileLayer({
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      opacity: data.opacity,
      zIndex: data.mapIndex,
      minZoom: data.minZoom,
      maxZoom: data.maxZoom,
      minResolution: data.minResolution,
      maxResolution: data.maxResolution,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      // maxResolution: WMTSSourceOptions.tileGrid.resolutions_ [0] * 2,
      source: new WMTSSource(
        /** @type {!module:ol/source/WMTS~Options} */ (WMTSSourceOptions)
      )
    });
    // 初始范围
    if (WGS84BoundingBox) {
      extent = transformExtent(WGS84BoundingBox, 'EPSG:4326', targetSRS);
    } else if (layer.getSource().getTileGrid().extent_) {
      extent = layer.getSource().getTileGrid().extent_;
    } else {
      let xmlObj = new DOMParser().parseFromString(
        options.CapabilitiesXml,
        'text/xml'
      );
      let layerObj = $(xmlObj).find('Layer');
      let targetTileMatrixName;
      for (let i = 0; i < layerObj.length; i++) {
        if (
          $(layerObj[i])
            .children('ows\\:Identifier')[0]
            .innerHTML.toString() === data.visibleLayers[0].toString()
        ) {
          targetTileMatrixName = $(layerObj[i])
            .children('TileMatrixSetLink')
            .children('TileMatrixSet')[0].innerHTML;
        }
        if (targetTileMatrixName) {
          break;
        }
      }
      let topLeftPoint = layer.getSource().getTileGrid().origins_[0];
      let resolution = layer.getSource().getTileGrid().resolutions_[0];
      let tileMatrixSets = result['Contents']['TileMatrixSet'];
      let tileMatrixSet = find(tileMatrixSets, function (elt) {
        return elt['Identifier'] === targetTileMatrixName;
        // let crs_ = elt['SupportedCRS'].split(":");
        // return (crs_[crs_.length - 3] + ":" + crs_[crs_.length -1]) === WMTSSourceOptions.projection.getCode();
      });
      let MatrixHeight = tileMatrixSet['TileMatrix'][0]['MatrixHeight'];
      let MatrixWidth = tileMatrixSet['TileMatrix'][0]['MatrixWidth'];
      let TileWidth = tileMatrixSet['TileMatrix'][0]['TileWidth'];
      let TileHeight = tileMatrixSet['TileMatrix'][0]['TileHeight'];
      extent = [
        topLeftPoint[0],
        topLeftPoint[1] - resolution * MatrixHeight * TileHeight,
        topLeftPoint[0] + resolution * MatrixWidth * TileWidth,
        topLeftPoint[1]
      ];
    }
    if (layer.getSource().urls.length > 0) {
      if (
        layer.getSource().urls[0].indexOf('apikey') !== -1 ||
        layer.getSource().urls[0].indexOf('newmap') !== -1
      ) {
        extent = [117.6, 35.54, 120.87, 37.48];
      }
    }

    layer.set('initExtent', transformExtent(extent, targetSRS, 'EPSG:4326'));
    return layer;
  }
}

export default WmtsLayer;
