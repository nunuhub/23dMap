/**
 * @Author han
 * @Date 2020/11/16 10:56
 */

import * as Cesium from 'cesium_shinegis_earth';

let matrix3Scratch = new Cesium.Matrix3(); //一些涉及矩阵计算的方法

let matrix4Scratch = new Cesium.Matrix4();

// 根据模型的orientation求方位角
export function getHeadingPitchRollByOrientation(
  position,
  orientation,
  ellipsoid,
  fixedFrameTransform
) {
  if (!Cesium.defined(orientation) || !Cesium.defined(position))
    return new Cesium.HeadingPitchRoll();

  let matrix = Cesium.Matrix4.fromRotationTranslation(
    Cesium.Matrix3.fromQuaternion(orientation, matrix3Scratch),
    position,
    matrix4Scratch
  );
  return getHeadingPitchRollByMatrix(matrix, ellipsoid, fixedFrameTransform);
}

// 根据模型的matrix矩阵求方位角
export function getHeadingPitchRollByMatrix(
  matrix,
  ellipsoid,
  fixedFrameTransform,
  result
) {
  return Cesium.Transforms.fixedFrameToHeadingPitchRoll(
    matrix,
    ellipsoid,
    fixedFrameTransform,
    result
  );
}

// 根据模型的matrix矩阵求方位角
export function getHeadingPitchRollByMatrixOld(
  position,
  matrix,
  ellipsoid,
  fixedFrameTransform
) {
  fixedFrameTransform =
    fixedFrameTransform || Cesium.Transforms.eastNorthUpToFixedFrame;

  // 计算当前模型中心处的变换矩阵
  let m1 = fixedFrameTransform(position, ellipsoid, new Cesium.Matrix4());
  // 矩阵相除
  let m3 = Cesium.Matrix4.multiply(
    Cesium.Matrix4.inverse(m1, new Cesium.Matrix4()),
    matrix,
    new Cesium.Matrix4()
  );
  // 得到旋转矩阵
  let mat3 = Cesium.Matrix4.getMatrix3(m3, new Cesium.Matrix3());
  // 计算四元数
  let q = Cesium.Quaternion.fromRotationMatrix(mat3);
  // 计算旋转角(弧度)
  return Cesium.HeadingPitchRoll.fromQuaternion(q);
}

let cartesian3 = new Cesium.Cartesian3();
matrix4Scratch = new Cesium.Matrix4();
let rotationScratch = new Cesium.Matrix3();

//求localStart点到localEnd点的方向
export function getHeadingPitchRollForLine(
  localStart,
  localEnd,
  ellipsoid,
  fixedFrameTransform
) {
  ellipsoid = ellipsoid || Cesium.Ellipsoid.WGS84;

  let velocity = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.subtract(localEnd, localStart, cartesian3),
    cartesian3
  );
  Cesium.Transforms.rotationMatrixFromPositionVelocity(
    localStart,
    velocity,
    ellipsoid,
    rotationScratch
  );
  let modelMatrix = Cesium.Matrix4.fromRotationTranslation(
    rotationScratch,
    localStart,
    matrix4Scratch
  );

  Cesium.Matrix4.multiplyTransformation(
    modelMatrix,
    Cesium.Axis.Z_UP_TO_X_UP,
    modelMatrix
  );

  return getHeadingPitchRollByMatrix(
    modelMatrix,
    ellipsoid,
    fixedFrameTransform
  );
}

//获取点point1绕点center的地面法向量旋转顺时针angle角度后新坐标
export function getRotateCenterPoint(center, point1, angle) {
  // 计算center的地面法向量
  let chicB = Cesium.Cartographic.fromCartesian(center);
  chicB.height = -100000;
  let dB = Cesium.Cartographic.toCartesian(chicB);
  let normaB = Cesium.Cartesian3.normalize(
    Cesium.Cartesian3.subtract(dB, center, new Cesium.Cartesian3()),
    new Cesium.Cartesian3()
  );

  // 构造基于center的法向量旋转90度的矩阵
  let Q = Cesium.Quaternion.fromAxisAngle(normaB, Cesium.Math.toRadians(angle));
  let m3 = Cesium.Matrix3.fromQuaternion(Q);
  let m4 = Cesium.Matrix4.fromRotationTranslation(m3);

  // 计算point1点相对center点的坐标A1
  let A1 = Cesium.Cartesian3.subtract(point1, center, new Cesium.Cartesian3());

  //对A1应用旋转矩阵
  let p = Cesium.Matrix4.multiplyByPoint(m4, A1, new Cesium.Cartesian3());
  // 新点的坐标
  return Cesium.Cartesian3.add(p, center, new Cesium.Cartesian3());
}

// export function getRotateCenterPoint2(center, point, angle) {
//     //以O点为原点建立局部坐标系，得到一个局部坐标到世界坐标转换的变换矩阵
//    let localToWorld_Matrix = Cesium.Transforms.eastNorthUpToFixedFrame(center)
//    //求世界坐标到局部坐标的变换矩阵
//    let worldToLocal_Matrix = Cesium.Matrix4.inverse(localToWorld_Matrix, new Cesium.Matrix4())
//       //A点在以O点为原点的局部的坐标位置
//    let localPosition_A = Cesium.Matrix4.multiplyByPoint(worldToLocal_Matrix, point, new Cesium.Cartesian3())
//    //A点逆时针旋转90度后在局部坐标系中的x,y,z位置
//    let new_x = localPosition_A.x * Math.cos(Cesium.Math.toRadians(angle)) + localPosition_A.y * Math.sin(Cesium.Math.toRadians(angle))
//    let new_y = localPosition_A.y * Math.cos(Cesium.Math.toRadians(angle)) - localPosition_A.x * Math.sin(Cesium.Math.toRadians(angle))
//    let new_z = localPosition_A.z
//    //最后应用局部坐标到世界坐标的转换矩阵求得旋转后的A点世界坐标
//    let newP = Cesium.Matrix4.multiplyByPoint(localToWorld_Matrix, new Cesium.Cartesian3(new_x, new_y, new_z), new Cesium.Cartesian3())
//    return newP
// }

//获取点的offest平移矩阵后点
export function getPositionTranslation(
  position,
  offest,
  degree,
  type,
  fixedFrameTransform
) {
  degree = degree || 0;
  type = type || 'z';
  fixedFrameTransform =
    fixedFrameTransform || Cesium.Transforms.eastNorthUpToFixedFrame;

  let rotate = Cesium.Math.toRadians(-degree); //转成弧度
  type = 'UNIT_' + type.toUpperCase();
  let quaternion = Cesium.Quaternion.fromAxisAngle(
    Cesium.Cartesian3[type],
    rotate
  ); //quaternion为围绕这个z轴旋转d度的四元数
  let rotateMatrix3 = Cesium.Matrix3.fromQuaternion(quaternion); //rotateMatrix3为根据四元数求得的旋转矩阵
  let pointCartesian3 = new Cesium.Cartesian3(offest.x, offest.y, offest.z); //point的局部坐标
  let rotateTranslationMatrix4 = Cesium.Matrix4.fromRotationTranslation(
    rotateMatrix3,
    Cesium.Cartesian3.ZERO
  ); //rotateTranslationMatrix4为旋转加平移的4x4变换矩阵，这里平移为(0,0,0)，故填个Cesium.Cartesian3.ZERO
  Cesium.Matrix4.multiplyByTranslation(
    rotateTranslationMatrix4,
    pointCartesian3,
    rotateTranslationMatrix4
  ); //rotateTranslationMatrix4 = rotateTranslationMatrix4  X  pointCartesian3
  let originPositionCartesian3 = Cesium.Ellipsoid.WGS84.cartographicToCartesian(
    Cesium.Cartographic.fromCartesian(position)
  ); //得到局部坐标原点的全局坐标
  let originPositionTransform = fixedFrameTransform(originPositionCartesian3); //m1为局部坐标的z轴垂直于地表，局部坐标的y轴指向正北的4x4变换矩阵
  Cesium.Matrix4.multiplyTransformation(
    originPositionTransform,
    rotateTranslationMatrix4,
    rotateTranslationMatrix4
  ); //rotateTranslationMatrix4 = rotateTranslationMatrix4 X originPositionTransform
  let pointCartesian = new Cesium.Cartesian3();
  Cesium.Matrix4.getTranslation(rotateTranslationMatrix4, pointCartesian); //根据最终变换矩阵m得到p2
  return pointCartesian;
}

//计算平行线，offset正负决定方向（单位米）
export function getOffsetLine(positions, offset) {
  let arrNew = [];
  for (let i = 1; i < positions.length; i++) {
    let point1 = positions[i - 1];
    let point2 = positions[i];

    let dir12 = Cesium.Cartesian3.subtract(
      point1,
      point2,
      new Cesium.Cartesian3()
    );
    let dir21left = Cesium.Cartesian3.cross(
      point1,
      dir12,
      new Cesium.Cartesian3()
    );

    let p1offset = computedOffsetData(point1, dir21left, offset * 1000);
    let p2offset = computedOffsetData(point2, dir21left, offset * 1000);

    if (i === 1) {
      arrNew.push(p1offset);
    }
    arrNew.push(p2offset);
  }
  return arrNew;
}

export function computedOffsetData(ori, dir, wid) {
  let currRay = new Cesium.Ray(ori, dir);
  return Cesium.Ray.getPoint(currRay, wid, new Cesium.Cartesian3());
}
