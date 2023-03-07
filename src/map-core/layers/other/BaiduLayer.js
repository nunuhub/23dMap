import { Tile as TileLayer } from 'ol/layer';
import { TileImage } from 'ol/source';
import { addCoordinateTransforms, addProjection, Projection } from 'ol/proj';
import { ll2bmerc, bmerc2ll, smerc2bmerc, bmerc2smerc } from 'projzh';
import { applyTransform } from 'ol/extent';
import TileGrid from 'ol/tilegrid/TileGrid';

class BaiduLayer {
  constructor(map) {
    this.map = map;
  }

  generate(data) {
    return new Promise((resolve) => {
      let extent = [72.004, 0.8293, 137.8347, 55.8271];
      extent = applyTransform(extent, ll2bmerc);
      let baiduMercatorProj = new Projection({
        code: 'baidu',
        extent: extent,
        units: 'm'
      });
      addProjection(baiduMercatorProj);
      addCoordinateTransforms(
        'EPSG:4490',
        baiduMercatorProj,
        ll2bmerc,
        bmerc2ll
      );
      addCoordinateTransforms(
        'EPSG:3857',
        baiduMercatorProj,
        smerc2bmerc,
        bmerc2smerc
      );

      /*定义百度地图分辨率与瓦片网格*/
      var resolutions = [];
      for (var i = 0; i <= 18; i++) {
        resolutions[i] = Math.pow(2, 18 - i);
      }

      var tilegrid = new TileGrid({
        origin: [0, 0],
        resolutions: resolutions
      });

      /*加载百度地图离线瓦片不能用ol.source.XYZ，ol.source.XYZ针对谷歌地图（注意：是谷歌地图）而设计，
      而百度地图与谷歌地图使用了不同的投影、分辨率和瓦片网格。因此这里使用ol.source.TileImage来自行指定
      投影、分辨率、瓦片网格。*/
      var source = new TileImage({
        projection: baiduMercatorProj,
        tileGrid: tilegrid,
        tileUrlFunction: function (tileCoord) {
          let s = Math.floor(Math.random() * 4);
          let z = tileCoord[0];
          let x = tileCoord[1];
          let y = -tileCoord[2] - 1;
          if (x < 0) x = 'M' + -x;
          if (y < 0) y = 'M' + -y;
          let url = data.url
            .replace('{s}', s)
            .replace('{x}', x)
            .replace('{y}', y)
            .replace('{z}', z);
          return url;
        }
      });

      let layer = new TileLayer({
        id: data.id,
        info: data,
        layerTag: data.layerTag,
        initExtent: extent,
        opacity: data.opacity,
        zIndex: data.mapIndex,
        isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
        source: source
      });
      layer.set('initExtent', extent);
      resolve(layer);
    });
  }
}

export default BaiduLayer;
