import { polygon, center } from '@turf/turf';
import {
  deflateCoordinatesArray,
  getInteriorPointOfArray
} from './interiorpoint';

/**
 * 获取多边形面上一点，先去中心，中心在面内就返回中心，不在面内则返回水平线上面内的点
 * @param coordnates [[x,y],……]
 * @param stride XY:2, XYZ:3, XYZM:4
 * @returns {Position|Array<number>}
 */
function getInnerPoint(coordnates, stride = 2) {
  let geom = polygon([coordnates]);
  // 跟二维一致取中心
  var cent = center(geom);

  let centerPoint = cent.geometry.coordinates;
  let flatCoordnates = [];
  let ends = [];
  //获取扁平的点数组,以及圈数
  deflateCoordinatesArray(flatCoordnates, 0, [coordnates], stride, ends);

  /* 好像没用
  let orientedFlatCoordinates = getOrientedFlatCoordinates(
    flatCoordnates,
    stride,
    ends
  );*/
  return getInteriorPointOfArray(
    flatCoordnates,
    0,
    ends,
    stride,
    centerPoint,
    0
  );
}

export default getInnerPoint;
