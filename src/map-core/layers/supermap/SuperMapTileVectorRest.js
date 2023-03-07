import $ from 'jquery';
import { VectorTileSuperMapRest } from '@supermap/iclient-ol';
import MVT from 'ol/format/MVT';
import Feature from 'ol/Feature';
import VectorTileLayer from 'ol/layer/VectorTile';

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
          let layer = _this.createSupermapVectorTileRest(
            data,
            ajaxResult,
            _this.map
          );
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

  createSupermapVectorTileRest(data) {
    var format = new MVT({
      featureClass: Feature
    });
    // let extraUrl='?prjCoordSys=%7B"epsgCode"%3A3857%7D';
    // let options = TileSuperMapRest.optionsFromMapJSON(data.url, ajaxResult);
    // let tileGrid = TileSuperMapRest.optionsFromMapJSON(data.url, ajaxResult).tileGrid;
    let vectortilesource = new VectorTileSuperMapRest({
      url: data.url,
      format: format
    });

    // style.on('styleloaded', function () {
    return new VectorTileLayer({
      declutter: true,
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      opacity: data.opacity,
      zIndex: data.mapIndex,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      source: vectortilesource
    });
  }
}

export default SuperMapTileRest;
