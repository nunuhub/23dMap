/*
 * @Author: liujh
 * @Date: 2020/8/24 13:17
 * @Description:
 */
/* 55 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import { ringIsClockwise } from '../Tool/Util1';

//获取模型的中心点信息
function getCenter(tileset, transform) {
  let result = {};

  //记录模型原始的中心点
  let boundingSphere = tileset.boundingSphere;
  let position = boundingSphere.center;
  let catographic = Cesium.Cartographic.fromCartesian(position);

  let height = Number(catographic.height.toFixed(2));
  let longitude = Number(
    Cesium.Math.toDegrees(catographic.longitude).toFixed(6)
  );
  let latitude = Number(Cesium.Math.toDegrees(catographic.latitude).toFixed(6));
  result = {
    x: longitude,
    y: latitude,
    z: height
  };

  // console.log("模型内部原始位置:" + JSON.stringify(result))

  //如果tileset自带世界矩阵矩阵，那么计算放置的经纬度和heading
  if (transform) {
    let matrix = Cesium.Matrix4.fromArray(tileset._root.transform);
    let pos = Cesium.Matrix4.getTranslation(matrix, new Cesium.Cartesian3());
    let wpos = Cesium.Cartographic.fromCartesian(pos);
    if (Cesium.defined(wpos)) {
      result.x = Number(Cesium.Math.toDegrees(wpos.longitude).toFixed(6));
      result.y = Number(Cesium.Math.toDegrees(wpos.latitude).toFixed(6));
      result.z = Number(wpos.height.toFixed(2));

      //取旋转矩阵
      let rotmat = Cesium.Matrix4.getMatrix3(matrix, new Cesium.Matrix3());
      //默认的旋转矩阵
      let defrotmat = Cesium.Matrix4.getMatrix3(
        Cesium.Transforms.eastNorthUpToFixedFrame(pos),
        new Cesium.Matrix3()
      );

      //计算rotmat 的x轴，在defrotmat 上 旋转
      let xaxis = Cesium.Matrix3.getColumn(
        defrotmat,
        0,
        new Cesium.Cartesian3()
      );
      let yaxis = Cesium.Matrix3.getColumn(
        defrotmat,
        1,
        new Cesium.Cartesian3()
      );
      let zaxis = Cesium.Matrix3.getColumn(
        defrotmat,
        2,
        new Cesium.Cartesian3()
      );

      let dir = Cesium.Matrix3.getColumn(rotmat, 0, new Cesium.Cartesian3());

      dir = Cesium.Cartesian3.cross(dir, zaxis, dir);
      dir = Cesium.Cartesian3.cross(zaxis, dir, dir);
      dir = Cesium.Cartesian3.normalize(dir, dir);

      let heading = Cesium.Cartesian3.angleBetween(xaxis, dir);

      let ay = Cesium.Cartesian3.angleBetween(yaxis, dir);

      if (ay > Math.PI * 0.5) {
        heading = 2 * Math.PI - heading;
      }
      result.heading = Number(Cesium.Math.toDegrees(heading).toFixed(1));

      // console.log("模型内部世界矩阵:" + JSON.stringify(result))
    }
  }

  return result;
}

//变换轴，兼容旧版本数据z轴方向不对的情况
//如果可以修改模型json源文件，可以在json文件里面加了一行来修正："gltfUpAxis" : "Z",
//3dtiles相关计算常用方法
function updateAxis(matrix, axis) {
  if (axis == null) return matrix;

  let rightaxis;
  switch (axis.toUpperCase()) {
    case 'Y_UP_TO_Z_UP':
      rightaxis = Cesium.Axis.Y_UP_TO_Z_UP;
      break;
    case 'Z_UP_TO_Y_UP':
      rightaxis = Cesium.Axis.Z_UP_TO_Y_UP;
      break;
    case 'X_UP_TO_Z_UP':
      rightaxis = Cesium.Axis.X_UP_TO_Z_UP;
      break;
    case 'Z_UP_TO_X_UP':
      rightaxis = Cesium.Axis.Z_UP_TO_X_UP;
      break;
    case 'X_UP_TO_Y_UP':
      rightaxis = Cesium.Axis.X_UP_TO_Y_UP;
      break;
    case 'Y_UP_TO_X_UP':
      rightaxis = Cesium.Axis.Y_UP_TO_X_UP;
      break;
  }
  if (rightaxis == null) return matrix;

  return Cesium.Matrix4.multiplyTransformation(matrix, rightaxis, matrix);
}

//变换模型位置等
function updateMatrix(tileset, opts) {
  let matrix;

  //有自带世界矩阵矩阵
  if (
    Cesium.defined(tileset._root) &&
    Cesium.defined(tileset._root.transform) &&
    opts.transform
  ) {
    // let mat = Cesium.Matrix4.fromArray(tileset_root.transform)
    // let pos = Cesium.Matrix4.getTranslation(mat, new Cesium.Cartesian3())
    // let wpos = Cesium.Cartographic.fromCartesian(pos)
    // if (wpos) {
    // }

    let position = Cesium.Cartesian3.fromDegrees(opts.x, opts.y, opts.z);
    matrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    let rotationX = Cesium.Matrix4.fromRotationTranslation(
      Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(opts.heading || 0))
    );
    Cesium.Matrix4.multiply(matrix, rotationX, matrix);

    if (opts.scale > 0 && opts.scale !== 1)
      //缩放比例
      Cesium.Matrix4.multiplyByUniformScale(matrix, opts.scale, matrix);

    if (opts.axis)
      //变换轴
      matrix = updateAxis(matrix, opts.axis);

    tileset._root.transform = matrix;
  } else {
    //普通,此种方式[x，y不能多次更改]
    let boundingSphere = tileset.boundingSphere;
    let catographic = Cesium.Cartographic.fromCartesian(boundingSphere.center);
    let surface = Cesium.Cartesian3.fromRadians(
      catographic.longitude,
      catographic.latitude,
      0.0
    );
    let offset = Cesium.Cartesian3.fromDegrees(opts.x, opts.y, opts.z);

    let translation = Cesium.Cartesian3.subtract(
      offset,
      surface,
      new Cesium.Cartesian3()
    );
    matrix = Cesium.Matrix4.fromTranslation(translation);

    tileset.modelMatrix = matrix;
  }
  return matrix;
}

//添加裁切面（cesium原生），仅支持单例及凸多边形 cesium 1.80.1及以上定制版
/*
 * points 支持弧度坐标、笛卡尔坐标及经纬度坐标数组*/
function addClippingPolygon(tileset, points) {
  if (points.length > 2) {
    let polygonClockWise;
    let cartesian3Points = [];
    let cartographicPointsArray;
    switch (true) {
      case points[0] instanceof Cesium.Cartesian3:
        cartesian3Points = points;
        polygonClockWise = ringIsClockwise(cartesian3Points);
        break;
      case points[0] instanceof Cesium.Cartographic:
        cartographicPointsArray = [];
        for (let index = 0; index < points.length; index++) {
          const degree = points[index];
          cartesian3Points.push(
            Cesium.Cartesian3.fromDegrees(
              degree.longitude,
              degree.latitude,
              degree.height
            )
          );
          let point = [2];
          point[0] = degree.longitude;
          point[1] = degree.latitude;
          cartographicPointsArray.push(point);
        }
        polygonClockWise = ringIsClockwise(cartographicPointsArray);
        break;
      default:
        for (let index = 0; index < points.length; index++) {
          const degree = points[index];
          cartesian3Points.push(
            Cesium.Cartesian3.fromDegrees(degree[0], degree[1], degree[2])
          );
        }
        polygonClockWise = ringIsClockwise(points);
    }

    let clippingPlanes = [];
    let pointsLength = cartesian3Points.length;

    let inverseTransform = getInverseTransform(tileset);

    var direction = polygonClockWise;

    for (let i = 0; i < pointsLength; ++i) {
      let nextIndex = (i + 1) % pointsLength;

      let up = new Cesium.Cartesian3(0, 0, 10);
      // let up = _unionClippingRegions ? new Cesium.Cartesian3(0, 0, -10) : new Cesium.Cartesian3(0, 0, 10);
      let right;
      if (direction) {
        //顺时针
        right = Cesium.Cartesian3.subtract(
          getOriginCoordinateSystemPoint(cartesian3Points[i], inverseTransform),
          getOriginCoordinateSystemPoint(
            cartesian3Points[nextIndex],
            inverseTransform
          ),
          new Cesium.Cartesian3()
        );
      } else {
        right = Cesium.Cartesian3.subtract(
          getOriginCoordinateSystemPoint(
            cartesian3Points[nextIndex],
            inverseTransform
          ),
          getOriginCoordinateSystemPoint(cartesian3Points[i], inverseTransform),
          new Cesium.Cartesian3()
        );
      }
      right = Cesium.Cartesian3.normalize(right, right);

      let normal = Cesium.Cartesian3.cross(right, up, new Cesium.Cartesian3());
      normal = Cesium.Cartesian3.normalize(normal, normal);

      // Compute distance by pretending the plane is at the origin
      clippingPlanes.push(
        new Cesium.ClippingPlane.fromPlane(
          Cesium.Plane.fromPointNormal(
            getOriginCoordinateSystemPoint(
              cartesian3Points[i],
              inverseTransform
            ),
            normal
          )
        )
      );
    }
    tileset.clippingPlanes = new Cesium.ClippingPlaneCollection({
      planes: clippingPlanes,
      edgeWidth: 0.0,
      edgeColor: Cesium.Color.RED,
      enabled: true,
      unionClippingRegions: false
    });
  }
}

//计算原点矩阵

function getInverseTransform(tileset) {
  let transform;
  // let tileset = this.model
  // let tmp = tileset.root.transform
  // if ((tmp && tmp.equals(Cesium.Matrix4.IDENTITY)) || !tmp) {
  //     // 如果root.transform不存在，则3DTiles的原点变成了boundingSphere.center
  //     transform = Cesium.Transforms.eastNorthUpToFixedFrame(tileset.boundingSphere.center)
  // } else {
  //     transform = tileset.root.computedTransform
  // }
  // return Cesium.Matrix4.inverseTransformation(transform, new Cesium.Matrix4())
  // let tmp;
  if (tileset.root) {
    let tmp = tileset.root.transform;
    if ((tmp && tmp.equals(Cesium.Matrix4.IDENTITY)) || !tmp) {
      // 如果root.transform不存在，则3DTiles的原点变成了boundingSphere.center
      transform = Cesium.Transforms.eastNorthUpToFixedFrame(
        tileset.boundingSphere.center
      );
    } else {
      transform = tileset.root.computedTransform;
    }
  } else if (tileset.modelMatrix) {
    transform = tileset.modelMatrix;
  } else {
    transform = tileset.computeModelMatrix(Cesium.JulianDate.now());
  }
  return Cesium.Matrix4.inverseTransformation(transform, new Cesium.Matrix4());
}

function getOriginCoordinateSystemPoint(point, inverseTransform) {
  // let val = Cesium.Cartesian3.fromDegrees(point.lng, point.lat)
  return Cesium.Matrix4.multiplyByPoint(
    inverseTransform,
    point,
    new Cesium.Cartesian3(0, 0, 0)
  );
}

export {
  getCenter,
  updateMatrix,
  addClippingPolygon,
  getInverseTransform,
  getOriginCoordinateSystemPoint
};
