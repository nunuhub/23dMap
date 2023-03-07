import GeoJSON from 'ol/format/GeoJSON';
import centerOfMass from '@turf/center-of-mass';
import { getGeom } from '@turf/invariant';
import { LineString } from 'ol/geom';

const rotateGeo = (geometry, angle) => {
  try {
    _startRotate(geometry, angle);
  } catch (e) {
    console.warn('rotate failed', e);
  }
};
function _startRotate(geometry, angle) {
  if (geometry.lastAngle) {
    _setRotate(geometry, geometry.lastAngle * -1);
  }
  // 矩形和椭圆特殊处理
  /* if (geometry.type == 'RectAngle' || geometry.type == 'Ellipse') {
        _setRectAngleRotate(geometry, angle)
    } else {
        _setRotate(geometry, angle)
    } */
  _setRotate(geometry, angle);

  geometry.lastAngle = angle;
}

function _setRotate(geometry, angle) {
  const a = (angle / 180) * Math.PI * -1;
  const center = _getCenter(geometry);
  // 标绘图形则对节点进行旋转 否则标绘的Point不会改变
  // 其他图形不变对齐本身进行旋转
  let nodeLine;
  if (geometry.getPoints) {
    nodeLine = new LineString(geometry.getPoints());
  } else {
    nodeLine = geometry;
  }
  nodeLine.rotate(a, center);
  if (geometry.setPoints) {
    geometry.setPoints(nodeLine.getCoordinates());
  }
}

// function _setRectAngleRotate (geometry, angle) {
//   const a = (angle / 180) * Math.PI * -1
//   const center = _getCenter(geometry)
//   geometry.rotate(a, center)
//   // geometry.setPoints(_getRectAnglePoint(geometry))
//   geometry.setPoints(geometry.getCoordinates())
// }

function _getCenter(geometry) {
  const geojson = JSON.parse(new GeoJSON().writeGeometry(geometry));
  const geom = getGeom(geojson);
  const point = centerOfMass(geom);
  return point.geometry.coordinates;
}
// function _getRectAnglePoint (geometry) {
//   var flatCoordinates = geometry.getFlatCoordinates()
//   let minX = 65565
//   let minY = 65565
//   let maxX = 0
//   let maxY = 0
//   if (flatCoordinates && flatCoordinates.length > 0) {
//     for (const i in flatCoordinates) {
//       if (i % 2 == 0) {
//         minX = Math.min(minX, flatCoordinates[i])
//         maxX = Math.max(maxX, flatCoordinates[i])
//       } else {
//         minY = Math.min(minY, flatCoordinates[i])
//         maxY = Math.max(maxY, flatCoordinates[i])
//       }
//     }
//   }
//   console.log([
//     [minX, minY],
//     [maxX, maxY]
//   ])
//   return [
//     [minX, minY],
//     [maxX, maxY]
//   ]
// }

export { rotateGeo };
