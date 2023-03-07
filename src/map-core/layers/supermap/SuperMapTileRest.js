import { Tile as TileLayer } from 'ol/layer';
import $ from 'jquery';
import { TileSuperMapRest } from '@supermap/iclient-ol';

class SuperMapTileRest {
  constructor(map) {
    this.map = map;
    this.proxy = '/gisqBI/api/gis/proxy?';
  }

  generate(data) {
    let _this = this;
    return new Promise((resolve, reject) => {
      $.ajax({
        url: data.url + '.json',
        type: 'get',
        contentType: 'application/json',
        dataType: 'json',
        success: function (ajaxResult) {
          let layer = _this.createSupermapTileRest(data, ajaxResult);
          resolve(layer);
        },
        error: function (XMLHttpRequest) {
          console.error(XMLHttpRequest);
          reject(
            new Error(
              '"' + data.label + '"' + '图层无法正常加载，请检查运维端配置项!'
            )
          );
        }
      });
    });
  }

  createSupermapTileRest(data, ajaxResult) {
    let tileGrid = TileSuperMapRest.optionsFromMapJSON(
      data.url,
      ajaxResult
    ).tileGrid;
    var layer = new TileLayer({
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      opacity: data.opacity,
      zIndex: data.mapIndex,
      initExtent: [
        ajaxResult.bounds.left,
        ajaxResult.bounds.bottom,
        ajaxResult.bounds.right,
        ajaxResult.bounds.top
      ],
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      source: new TileSuperMapRest({
        url: data.url,
        wrapX: true,
        tileGrid: tileGrid,
        // tileGrid: new TileGrid({
        //     extent: [ajaxResult.bounds.left, ajaxResult.bounds.bottom, ajaxResult.bounds.right, ajaxResult.bounds.top],
        //     origin: [ajaxResult.bounds.left, ajaxResult.bounds.top],
        //     resolutions: [1.40625, 0.703125, 0.3515625, 0.17578125, 0.087890625, 0.0439453125, 0.02197265625, 0.010986328125, 0.0054931640625, 0.00274658203125, 0.001373291015625, 0.0006866455078125, 0.00034332275390625]
        // }),
        projection: 'EPSG:' + ajaxResult.prjCoordSys.epsgCode
      })
    });
    return layer;
  }
}

export default SuperMapTileRest;
