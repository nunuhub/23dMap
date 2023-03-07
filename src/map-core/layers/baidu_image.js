import Tile from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import TileGrid from 'ol/tilegrid/TileGrid';
import { Projection, addProjection, addCoordinateTransforms } from 'ol/proj';
import projzh from 'projzh';

export function BaiduImage() {
  var bd09Extent = [-20037726.37, -12474104.17, 20037726.37, 12474104.17];
  var baiduMercator = new Projection({
    code: 'baidu',
    extent: bd09Extent,
    units: 'm'
  });
  addProjection(baiduMercator);
  addCoordinateTransforms(
    'EPSG:4326',
    baiduMercator,
    projzh.ll2bmerc,
    projzh.bmerc2ll
  );
  addCoordinateTransforms(
    'EPSG:3857',
    baiduMercator,
    projzh.smerc2bmerc,
    projzh.bmerc2smerc
  );

  var bmercResolutions = new Array(19);
  for (var i = 0; i < 19; ++i) {
    bmercResolutions[i] = Math.pow(2, 18 - i);
  }

  // var urls = [0, 1, 2, 3].map(function (sub) {
  //   return (
  //     'http://maponline' +
  //     sub +
  //     '.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=1&udt=20191119'
  //   )
  // })
  var baidu = new Tile({
    source: new XYZ({
      projection: 'baidu',
      maxZoom: 18,
      wrapX: true,
      tileUrlFunction: function (tileCoord) {
        var x = tileCoord[1];
        var y = -tileCoord[2] - 1;
        var z = tileCoord[0];
        // var hash = (x << z) + y
        // var index = hash % urls.length
        // index = index < 0 ? index + urls.length : index
        if (x < 0) {
          x = 'M' + -x;
        }
        if (y < 0) {
          y = 'M' + -y;
        }
        return (
          'http://shangetu' +
          // eslint-disable-next-line radix
          parseInt(Math.random() * 10) +
          '.map.bdimg.com/it/u=x=' +
          x +
          ';y=' +
          y +
          ';z=' +
          z +
          ';v=009;type=sate&fm=46&udt=20170606'
        );
      },
      tileGrid: new TileGrid({
        resolutions: bmercResolutions,
        origin: [0, 0]
      })
    })
  });

  return baidu;
}
