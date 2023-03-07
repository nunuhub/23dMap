import axios from '../../../utils/request';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import $ from 'jquery';
import { registerProj } from '../../CustomProjection';
import ownOptionsFromCapabilities from '../optionsFromCapabilities';
import VectorTileLayer from 'ol/layer/VectorTile';
import VectorTileSource from 'ol/source/VectorTile';
import MVT from 'ol/format/MVT';
import TileGrid from 'ol/tilegrid/TileGrid';
import StyleManager from '../../StyleManager';

class VectorTiledLayer {
  constructor(map) {
    this.map = map;
    this.styleManager = new StyleManager(this.map);
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
        .get(requestUrl, {
          headers: {
            'content-type': 'application/xml'
          }
        })
        .then((response) => {
          let options = {
            CapabilitiesXml: response.headers ? response.data : response
          };
          let layer = _this.createVectorTiledLayer(data, options, reject);
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
  createVectorTiledLayer(data, options, reject) {
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
    let targetSRS;
    $.each(layers, function (index, value) {
      if (value.Identifier === data.visibleLayers[0]) {
        targetTileMatrixSet = value.TileMatrixSetLink[0].TileMatrixSet;
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
      targetSRS: targetSRS
    });

    // WMTSSourceOptions.tileGrid.resolutions_ = [0.7031250000000002,0.3515625000000001,0.1757812500000001,0.087890625,0.0439453125,0.02197265625,0.010986328125,0.0054931640625,0.00274658203125,0.001373291015625,0.0006866455078125,0.0003433227539063,0.0001716613769531,0.0000858306884766,0.0000429153442383,0.0000214576721191,0.0000107288360596,0.0000053644180298,0.0000026822090149,0.0000013411045074]
    let orginIndex = 0;
    WMTSSourceOptions.tileGrid.origins_.forEach((origin) => {
      if (origin[0] === 90 && origin[1] === -180) {
        origin = [origin[1], origin[0]];
        WMTSSourceOptions.tileGrid.origins_[orginIndex] = origin;
        orginIndex = orginIndex + 1;
      }
    });

    var gridsetName = WMTSSourceOptions.matrixSet;
    var style = WMTSSourceOptions.style;
    let params = {
      REQUEST: 'GetTile',
      SERVICE: 'WMTS',
      VERSION: '1.0.0',
      LAYER: data.visibleLayers[0],
      STYLE: style,
      TILEMATRIX: gridsetName + ':{z}',
      TILEMATRIXSET: gridsetName,
      FORMAT: 'application/vnd.mapbox-vector-tile',
      TILECOL: '{x}',
      TILEROW: '{y}'
    };
    if (data.authkey) {
      params.authkey = data.authkey;
    }
    var url = data.url + '?';
    for (var param in params) {
      url = url + param + '=' + params[param] + '&';
    }
    url = url.slice(0, -1);

    let layer = new VectorTileLayer({
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      opacity: data.opacity,
      zIndex: data.mapIndex,
      minZoom: data.minZoom,
      maxZoom: data.maxZoom,
      initExtent: options.initExtent,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      source: new VectorTileSource({
        projection: this.map.getView().getProjection().getCode(),
        crossOrigin: 'anonymous',
        format: new MVT(),
        wrapX: true,
        extent: WMTSSourceOptions.tileGrid.extent_,
        tileGrid: new TileGrid({
          // ！！！openlayers默认为左上角原点，geoserver提供的为左下角原点
          tileSize: WMTSSourceOptions.tileGrid.tileSizes_[0],
          origin: WMTSSourceOptions.tileGrid.origins_[0],
          resolutions: WMTSSourceOptions.tileGrid.resolutions_,
          matrixIds: WMTSSourceOptions.tileGrid.matrixIds_
        }),
        url: url
      })
    });

    // 初始范围
    if (data.initExtent) {
      extent = data.initExtent.split(',');
    } else if (WMTSSourceOptions.tileGrid.extent_) {
      extent = WMTSSourceOptions.tileGrid.extent_;
    } /* else {
            let xmlObj = new DOMParser().parseFromString(options.CapabilitiesXml, 'text/xml')
            let layerObj = $(xmlObj).find('Layer')
            let targetTileMatrixName
            for (let i = 0; i < layerObj.length; i++) {
                if ($(layerObj[i]).children('ows\\:Identifier')[0].innerHTML === data.visibleLayers[0]) {
                    targetTileMatrixName = $(layerObj[i]).children('TileMatrixSetLink').children('TileMatrixSet')[0].innerHTML
                }
                if (targetTileMatrixName) {
                    break
                }
            }
            let topLeftPoint = layer.getSource().getTileGrid().origins_[0]
            let resolution = layer.getSource().getTileGrid().resolutions_[0]
            let tileMatrixSets = result['Contents']['TileMatrixSet']
            let tileMatrixSet = find(tileMatrixSets, function (elt) {
                return elt['Identifier'] === targetTileMatrixName
                // let crs_ = elt['SupportedCRS'].split(":");
                // return (crs_[crs_.length - 3] + ":" + crs_[crs_.length -1]) === WMTSSourceOptions.projection.getCode();
            })
            let MatrixHeight = tileMatrixSet['TileMatrix'][0]['MatrixHeight']
            let MatrixWidth = tileMatrixSet['TileMatrix'][0]['MatrixWidth']
            let TileWidth = tileMatrixSet['TileMatrix'][0]['TileWidth']
            let TileHeight = tileMatrixSet['TileMatrix'][0]['TileHeight']
            extent = [topLeftPoint[0], topLeftPoint[1] - resolution * MatrixHeight * TileHeight,
                topLeftPoint[0] + resolution * MatrixWidth * TileWidth, topLeftPoint[1]
            ]
        }*/

    //图层绑定样式getLayerStyle setLayerStyle方法
    this.styleManager.bindLayer(layer);

    // 初始样式
    if (data.symbol) {
      layer.setLayerStyle(data.symbol);
    } else {
      //图层样式
    }
    layer.set('initExtent', extent);
    return layer;
  }
}

export default VectorTiledLayer;
