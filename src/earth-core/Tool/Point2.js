/*
 * @Author: liujh
 * @Date: 2020/8/24 9:05
 * @Description:
 */
/* 2 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import * as turf from '@turf/turf';
import * as Util from './Util3';
import { hasTerrain } from './Util1';
import * as polygonAttr from '../Draw/EntityAttr/PolygonAttr14';
import getInnerPoint from '../../utils/geom/InnerPoint';

//绕点 环绕飞行
export const windingPoint = {
  isStart: false,
  viewer: null,
  start: function start(viewer, point) {
    this.viewer = viewer;
    if (point && point instanceof Cesium.Cartesian3) {
      this.position = point;
    } else {
      if (!point) point = getCenter(viewer);
      this.position = Cesium.Cartesian3.fromDegrees(point.x, point.y, point.z);
    }

    this.distance =
      point.distance ||
      Cesium.Cartesian3.distance(this.position, viewer.camera.positionWC); // 给定相机距离点多少距离飞行
    this.angle = 360 / (point.time || 60); //time：给定飞行一周所需时间(单位 秒)

    this.time = viewer.clock.currentTime.clone();
    this.heading = viewer.camera.heading; // 相机的当前heading
    this.pitch = viewer.camera.pitch;

    this.viewer.clock.onTick.addEventListener(this.clock_onTickHandler, this);
    this.isStart = true;
  },
  clock_onTickHandler: function clock_onTickHandler() {
    let delTime = Cesium.JulianDate.secondsDifference(
      this.viewer.clock.currentTime,
      this.time
    ); // 当前已经过去的时间，单位 秒
    let heading = Cesium.Math.toRadians(delTime * this.angle) + this.heading;

    this.viewer.scene.camera.setView({
      destination: this.position, // 点的坐标
      orientation: {
        heading: heading,
        pitch: this.pitch
      }
    });
    this.viewer.scene.camera.moveBackward(this.distance);
  },
  stop: function stop() {
    if (!this.isStart) return;

    if (this.viewer)
      this.viewer.clock.onTick.removeEventListener(
        this.clock_onTickHandler,
        this
      );
    this.isStart = false;
  }
};

//固定点 向四周旋转
export const aroundPoint = {
  isStart: false,
  viewer: null,
  start: function start(viewer, point) {
    this.viewer = viewer;
    if (point && point instanceof Cesium.Cartesian3) {
      this.position = point;
    } else {
      if (!point) point = getCenter(viewer);
      this.position = Cesium.Cartesian3.fromDegrees(point.x, point.y, point.z);
    }

    this.angle = 360 / (point.time || 60); //time：给定飞行一周所需时间(单位 秒)

    this.time = viewer.clock.currentTime.clone();
    this.heading = viewer.camera.heading; // 相机的当前heading
    this.pitch = viewer.camera.pitch;

    this.viewer.clock.onTick.addEventListener(this.clock_onTickHandler, this);
    this.isStart = true;
  },
  clock_onTickHandler: function clock_onTickHandler() {
    // 当前已经过去的时间，单位s
    let delTime = Cesium.JulianDate.secondsDifference(
      this.viewer.clock.currentTime,
      this.time
    );
    let heading = Cesium.Math.toRadians(delTime * this.angle) + this.heading;
    this.viewer.scene.camera.setView({
      orientation: {
        heading: heading,
        pitch: this.pitch
      }
    });
  },
  stop: function stop() {
    if (!this.isStart) return;

    if (this.viewer)
      this.viewer.clock.onTick.removeEventListener(
        this.clock_onTickHandler,
        this
      );
    this.isStart = false;
  }
};

//格式化 数字 小数位数
export const formatNum = (num, digits) => {
  //let pow = Math.pow(10, (digits === undefined ? 6 : digits))
  //return Math.round(num * pow) / pow
  return Number(num.toFixed(digits || 0));
};

//格式化坐标点为可显示的可理解格式（如：经度x:123.345345、纬度y:31.324324、高度z:123.1）。
export const formatPosition = (position) => {
  let carto = Cesium.Cartographic.fromCartesian(position);
  let result = {};
  result.y = formatNum(Cesium.Math.toDegrees(carto.latitude), 6);
  result.x = formatNum(Cesium.Math.toDegrees(carto.longitude), 6);
  result.z = formatNum(carto.height, 2);
  return result;
};

export const formatPositon = formatPosition; //兼容历史错误命名

//格式化Rectangle
export const formatRectangle = (rectangle) => {
  let west = formatNum(Cesium.Math.toDegrees(rectangle.west), 6);
  let east = formatNum(Cesium.Math.toDegrees(rectangle.east), 6);
  let north = formatNum(Cesium.Math.toDegrees(rectangle.north), 6);
  let south = formatNum(Cesium.Math.toDegrees(rectangle.south), 6);

  return {
    xmin: west,
    xmax: east,
    ymin: south,
    ymax: north
  };
};

/**
 * 获取坐标数组中最高高程值
 * @param {Array} positions Array<Cartesian3> 笛卡尔坐标数组
 * @param {Number} defaultVal 默认高程值
 */
export const getMaxHeight = (positions, defaultVal) => {
  if (defaultVal == null) defaultVal = 0;

  let maxHeight = defaultVal;
  if (positions == null || positions.length === 0) return maxHeight;

  for (let i = 0; i < positions.length; i++) {
    let tempCarto = Cesium.Cartographic.fromCartesian(positions[i]);
    if (tempCarto.height > maxHeight) {
      maxHeight = tempCarto.height;
    }
  }
  return formatNum(maxHeight, 2);
};

//插值数组
export const splitPositions = (positions, splitCount) => {
  let arrNew = [];
  for (let i = 0, len = positions.length; i < len - 1; ++i) {
    let midpoint = Cesium.Cartesian3.midpoint(
      positions[i],
      positions[i + 1],
      new Cesium.Cartesian3()
    );
    arrNew.push(positions[i]);
    arrNew.push(midpoint);
  }
  arrNew.push(positions[positions.length - 1]);

  if (splitCount > 1) {
    splitCount--;
    return splitPositions(arrNew, splitCount);
  }
  return arrNew;
};

//计算面内最大、最小高度值
export const computePolygonHeightRange = (pos, scene) => {
  let positions = [];
  for (let i = 0; i < pos.length; i++) {
    positions.push(pos[i].clone());
  }

  let maxHeight = 0;
  let minHeight = 9999;

  let granularity = Math.PI / Math.pow(2, 11) / 64;
  let polygonGeometry = new Cesium.PolygonGeometry.fromPositions({
    positions: positions,
    vertexFormat: Cesium.PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
    granularity: granularity
  });
  let geom = new Cesium.PolygonGeometry.createGeometry(polygonGeometry);

  let i0, i1, i2;
  let height1, height2, height3;
  let cartesian;

  for (let i = 0; i < geom.indices.length; i += 3) {
    i0 = geom.indices[i];
    i1 = geom.indices[i + 1];
    i2 = geom.indices[i + 2];

    cartesian = new Cesium.Cartesian3(
      geom.attributes.position.values[i0 * 3],
      geom.attributes.position.values[i0 * 3 + 1],
      geom.attributes.position.values[i0 * 3 + 2]
    );
    height1 = scene.globe.getHeight(
      Cesium.Cartographic.fromCartesian(cartesian)
    );

    if (minHeight > height1) minHeight = height1;
    if (maxHeight < height1) maxHeight = height1;

    cartesian = new Cesium.Cartesian3(
      geom.attributes.position.values[i1 * 3],
      geom.attributes.position.values[i1 * 3 + 1],
      geom.attributes.position.values[i1 * 3 + 2]
    );
    height2 = scene.globe.getHeight(
      Cesium.Cartographic.fromCartesian(cartesian)
    );

    if (minHeight > height2) minHeight = height2;
    if (maxHeight < height2) maxHeight = height2;

    cartesian = new Cesium.Cartesian3(
      geom.attributes.position.values[i2 * 3],
      geom.attributes.position.values[i2 * 3 + 1],
      geom.attributes.position.values[i2 * 3 + 2]
    );
    height3 = scene.globe.getHeight(
      Cesium.Cartographic.fromCartesian(cartesian)
    );

    if (minHeight > height3) minHeight = height3;
    if (maxHeight < height3) maxHeight = height3;
  }

  return {
    maxHeight: maxHeight,
    minHeight: minHeight
  };
};

/**
 * 在坐标基础海拔上增加指定的海拔高度值
 * @param {Array} positions Cartesian3类型的数组
 * @param addHeight
 * @return {Array} Cartesian3类型的数组
 */
export const addPositionsHeight = (positions, addHeight) => {
  addHeight = Number(addHeight) || 0;

  if (isNaN(addHeight) || addHeight === 0) return positions;

  if (positions instanceof Array) {
    let arr = [];
    for (let i = 0, len = positions.length; i < len; i++) {
      let car = Cesium.Cartographic.fromCartesian(positions[i]);
      let point = Cesium.Cartesian3.fromRadians(
        car.longitude,
        car.latitude,
        car.height + addHeight
      );
      arr.push(point);
    }
    return arr;
  } else {
    let car = Cesium.Cartographic.fromCartesian(positions);
    return Cesium.Cartesian3.fromRadians(
      car.longitude,
      car.latitude,
      car.height + addHeight
    );
  }
};

/**
 * 设置坐标中海拔高度为指定的高度值
 * @param {Array} positions Cartesian3类型的数组
 * @param {Number} height 高度值
 * @return {Array} Cartesian3类型的数组
 */
export const setPositionsHeight = (positions, height) => {
  height = Number(height) || 0;

  if (positions instanceof Array) {
    let arr = [];
    for (let i = 0, len = positions.length; i < len; i++) {
      let car = Cesium.Cartographic.fromCartesian(positions[i]);
      let point = Cesium.Cartesian3.fromRadians(
        car.longitude,
        car.latitude,
        height
      );
      arr.push(point);
    }
    return arr;
  } else {
    let car = Cesium.Cartographic.fromCartesian(positions);
    return Cesium.Cartesian3.fromRadians(car.longitude, car.latitude, height);
  }
};

//点是否在3dtiles模型上，用于计算贴地时进行判断 yangw-优化，原始代码在下
export const hasPicked3DTileset = function (viewer, positions) {
  if (positions instanceof Cesium.Cartesian3) positions = [positions];
  const Ct3 = Cesium.Cartesian3;
  for (let i = 0, len = positions.length; i < len; i++) {
    let position = positions[i];
    const ellipsoid = viewer.scene.globe.ellipsoid;
    let normal = ellipsoid.geodeticSurfaceNormal(position, new Ct3());
    let reverseNormal = Ct3.subtract(new Ct3(), normal, new Ct3());
    let ray = new Cesium.Ray(position, reverseNormal);
    let newp = Cesium.Ray.getPoint(ray, -450, new Ct3());
    ray.origin = newp;
    let excludes = [];
    for (let j = 0, leng = 4; j < leng; j++) {
      //进行三次pick，以充分地排除可能pick到的除地形外的primitive。
      let e = viewer.scene.pickFromRay(ray, excludes, 0.3);
      if (!e || !e.object) return false;
      if (
        e.object &&
        e.object.primitive &&
        e.object.primitive instanceof Cesium.Cesium3DTileset
      ) {
        return true;
      } else {
        e.object && e.object.primitive && excludes.push(e.object.primitive);
      }
    }
  }

  return false;
};

export const hasPicked3DTileset_origin = (viewer, positions) => {
  if (positions instanceof Cesium.Cartesian3) positions = [positions];

  for (let i = 0, len = positions.length; i < len; ++i) {
    let position = positions[i];

    let coorPX = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      viewer.scene,
      position
    );

    if (!Cesium.defined(coorPX)) continue;

    let pickedObject = viewer.scene.pick(coorPX, 10, 10);
    if (
      Cesium.defined(pickedObject) &&
      Cesium.defined(pickedObject.primitive) &&
      pickedObject.primitive instanceof Cesium.Cesium3DTileset
    ) {
      return true;
    }
  }

  return false;
};

/**
 * 设置坐标中海拔高度为贴地或贴模型的高度（sampleHeight需要数据在视域内）
 */
export const updateHeightForClampToGround = (
  viewer,
  position,
  relativeHeight
) => {
  let carto = Cesium.Cartographic.fromCartesian(position);

  //取贴模型高度
  if (hasPicked3DTileset(viewer, position)) {
    let heightTiles = viewer.scene.sampleHeight(carto);
    if (Cesium.defined(heightTiles) && heightTiles > -1000) {
      if (relativeHeight) heightTiles += carto.height; //Cesium.HeightReference.RELATIVE_TO_GROUND时
      return Cesium.Cartesian3.fromRadians(
        carto.longitude,
        carto.latitude,
        heightTiles
      );
    }
  }

  //取贴地形高度
  let heightTerrain = viewer.scene.globe.getHeight(carto);
  if (Cesium.defined(heightTerrain) && heightTerrain > -1000) {
    if (relativeHeight) heightTerrain += carto.height; //Cesium.HeightReference.RELATIVE_TO_GROUND时
    return Cesium.Cartesian3.fromRadians(
      carto.longitude,
      carto.latitude,
      heightTerrain
    );
  }

  return position;
};

export const getMostDetailHeight = (viewer, positions) => {
  let terrainProvider = viewer.terrainProvider;
  positions = Array.isArray(positions) ? positions : [positions];
  positions = positions.map((element) => {
    if (element instanceof Cesium.Cartesian3)
      return Cesium.Cartographic.fromCartesian(element);
    else if (element instanceof Cesium.Cartographic) {
      return element;
    }
  });
  let promise = Cesium.sampleTerrainMostDetailed(terrainProvider, positions);

  return promise;
};

//计算贴地路线（异步）
let clampToGroundLine = {
  start: function start(params) {
    this.params = params;
    this.viewer = params.viewer;

    let positions = params.positions;
    if (positions == null || positions.length === 0) {
      //无数据
      this.end(positions);
      return;
    }

    let _has3dtiles = hasPicked3DTileset(this.viewer, positions); //是否在3ditiles上面
    let _hasTerrain = hasTerrain(this.viewer); //是否有地形

    if (!_hasTerrain && !_has3dtiles) {
      //无地形和无模型时，直接返回
      this.end(positions);
      return;
    }

    //线中间插值
    if (_has3dtiles) {
      params.splitNum = Cesium.defaultValue(params.splitNum, 5);
    }
    positions = splitPositions(positions, params.splitNum);

    //开始分析
    this._has3dtiles = _has3dtiles;
    if (_hasTerrain) {
      this.clampToTerrain(positions);
    } else {
      this.clampTo3DTileset(positions);
    }
  },
  clampToTerrain: function clampToTerrain(positions) {
    let ellipsoid = this.viewer.scene.globe.ellipsoid;

    let cartographicArray;
    if (Cesium.defaultValue(this.params.generateArc, true)) {
      //generateArc插值路线
      let flatPositions = Cesium.PolylinePipeline.generateArc({
        positions: positions,
        granularity: this.params.granularity || 0.00001
      });

      cartographicArray = [];
      for (let i = 0; i < flatPositions.length; i += 3) {
        let cartesian = Cesium.Cartesian3.unpack(flatPositions, i);
        cartographicArray.push(ellipsoid.cartesianToCartographic(cartesian));
      }
    } else {
      cartographicArray =
        ellipsoid.cartesianArrayToCartographicArray(positions);
    }

    //用于缺少地形数据时，赋值的高度
    let tempHeight = Cesium.Cartographic.fromCartesian(positions[0]).height;
    let that = this;

    const promise = Cesium.sampleTerrainMostDetailed(
      this.viewer.terrainProvider,
      cartographicArray
    );
    Promise.resolve(promise).then(function (samples) {
      let noHeight = false;
      let offset = that.params.offset || 2; //增高高度，便于可视

      for (let i = 0; i < samples.length; ++i) {
        if (samples[i].height == null) {
          noHeight = true;
          samples[i].height = tempHeight;
        } else {
          samples[i].height =
            offset +
            samples[i].height * (that.viewer.scene._terrainExaggeration || 1);
        }

        //取贴模型高度
        // let heightTiles = that.viewer.scene.sampleHeight(samples[i])
        // if (Cesium.defined(heightTiles) && heightTiles > samples[i].height) {
        //     samples[i].height = heightTiles
        // }
      }

      let raisedPositions =
        ellipsoid.cartographicArrayToCartesianArray(samples);

      if (that._has3dtiles) {
        that.clampTo3DTileset(raisedPositions);
      } else {
        that.end(raisedPositions, noHeight);
      }
    });
  },
  clampTo3DTileset: function clampTo3DTileset(positions) {
    let that = this;
    this.viewer.scene
      .clampToHeightMostDetailed(positions)
      .then(function (clampedCartesians) {
        that.end(clampedCartesians);
      });
  },
  end: function end(raisedPositions, noHeight) {
    if (this.params.calback) this.params.calback(raisedPositions, noHeight);
    else if (this.positions && this.positions.setValue)
      this.positions.setValue(raisedPositions);
  }
};

export const terrainPolyline = (params) => {
  clampToGroundLine.start(params);
};

function hasPickedModel(pickedObject, noPickEntity) {
  if (Cesium.defined(pickedObject.id)) {
    //entity
    let entity = pickedObject.id;
    if (entity._noMousePosition) return false; //排除标识不拾取的对象
    if (noPickEntity && entity === noPickEntity) return false;
  }

  if (Cesium.defined(pickedObject.primitive)) {
    //primitive
    let primitive = pickedObject.primitive;
    if (primitive._noMousePosition) return false; //排除标识不拾取的对象
    if (noPickEntity && primitive === noPickEntity) return false;
  }

  return true;
}

/**
 * 获取鼠标当前的屏幕坐标位置的三维Cesium坐标
 * @param {Cesium.Scene} scene
 * @param {Cesium.Cartesian2} position 二维屏幕坐标位置
 * @param {Cesium.Entity} noPickEntity 排除的对象（主要用于绘制中，排除对自己本身的拾取）
 */
export const getCurrentMousePosition = (scene, position, noPickEntity) => {
  let cartesian;

  //在模型上提取坐标
  let pickedObject;
  try {
    pickedObject = scene.pick(position, 5, 5);
    // eslint-disable-next-line no-empty
  } catch (e) {}

  if (
    scene.pickPositionSupported &&
    Cesium.defined(pickedObject) &&
    hasPickedModel(pickedObject, noPickEntity)
  ) {
    //pickPositionSupported :判断是否支持深度拾取,不支持时无法进行鼠标交互绘制

    let cartesian = scene.pickPosition(position);
    if (Cesium.defined(cartesian)) {
      let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
      if (cartographic.height >= 0) return cartesian;

      //不是entity时，支持3dtiles地下
      if (!Cesium.defined(pickedObject.id) && cartographic.height >= -500)
        return cartesian;
    }
  }

  /*
  //超图s3m数据拾取
  if (Cesium.defined(Cesium.S3MTilesLayer)) {
    let cartesian = scene.pickPosition(position);
    if (Cesium.defined(cartesian)) {
      return cartesian;
    }
  }
*/

  //测试scene.pickPosition和globe.pick的适用场景 https://zhuanlan.zhihu.com/p/44767866
  //1. globe.pick的结果相对稳定准确，不论地形深度检测开启与否，不论加载的是默认地形还是别的地形数据；
  //2. scene.pickPosition只有在开启地形深度检测，且不使用默认地形时是准确的。
  //注意点： 1. globe.pick只能求交地形； 2. scene.pickPosition不仅可以求交地形，还可以求交除地形以外其他所有写深度的物体。

  //提取鼠标点的地理坐标
  if (scene.mode === Cesium.SceneMode.SCENE3D) {
    //三维模式下
    // let pickRay = scene.camera.getPickRay(position)
    // cartesian = scene.globe.pick(pickRay, scene)
    if (typeof noPickEntity !== 'undefined') {
      //modelGraphic的隐藏按noPickEntity.show = false无效
      let flag;
      if (
        pickedObject?.primitive?.show &&
        noPickEntity?.attribute?.type === 'model'
      ) {
        pickedObject.primitive.show = false;
        flag = true;
      } else noPickEntity.show = false;
      scene.render();
      cartesian = scene.pickPosition(position); //测试拾取准确性，陈利军20200218  测量模式下，必须采用该模式，倾斜摄影数据上异常

      if (flag) pickedObject.primitive.show = true;
      else noPickEntity.show = true;
    } else {
      cartesian = scene.pickPosition(position);
    }
    //let cartographic = Cesium.Cartographic.fromCartesian(cartesian)
    //console.log("拾取高程"+ + JSON.stringify(cartographic.height))
  } else {
    //二维模式下
    cartesian = scene.camera.pickEllipsoid(position, scene.globe.ellipsoid);
  }

  if (
    Cesium.defined(cartesian) &&
    scene.camera.positionCartographic.height < 10000
  ) {
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    // console.log(cartographic.height)
    if (cartographic.height < -5000) return null; //屏蔽无效值
  } else {
    if (pickedObject) {
      cartesian = pickedObject.id?.position?._value || cartesian;
    }
  }

  return cartesian;
};

//提取屏幕中心点坐标
export const getCenter = (viewer, isToWgs) => {
  let bestTarget = pickCenterPoint(viewer.scene);
  if (!Cesium.defined(bestTarget)) {
    bestTarget = updateHeightForClampToGround(
      viewer,
      viewer.scene.camera.positionWC
    );
  }

  let result = formatPosition(bestTarget);
  if (isToWgs) result = viewer.shine.point2wgs(result); //坐标转换为wgs

  // 获取地球中心点世界位置  与  摄像机的世界位置  之间的距离
  // let distance = Cesium.Cartesian3.distance(bestTarget, viewer.scene.camera.positionWC)
  // result.cameraZ = distance

  return result;
};

//取屏幕中心点坐标
export const pickCenterPoint = (scene) => {
  let canvas = scene.canvas;
  let center = new Cesium.Cartesian2(
    canvas.clientWidth / 2,
    canvas.clientHeight / 2
  );

  let ray = scene.camera.getPickRay(center);
  let target = scene.globe.pick(ray, scene);
  if (!target) target = scene.camera.pickEllipsoid(center);
  return target;
};

//export function getLevel(viewer) {
//    let _layers = viewer.imageryLayers._layers
//    if (_layers.length == 0) return -1

//    let _imageryCache = _layers[0]._imageryCache
//    let maxLevel = 0
//    for (let i in _imageryCache) {
//        let imagery = _imageryCache[i]
//        if (imagery.level > maxLevel)
//            maxLevel = imagery.level
//    }
//    return maxLevel
//}

//提取地球视域边界
export const getExtent = (viewer, isToWgs) => {
  // let rectangle = viewer.camera.computeViewRectangle() //不支持二维模式
  // if (rectangle == null) return null
  // let extent = formatRectangle(rectangle)  // 范围对象

  // 范围对象
  let extent = {
    xmin: 70,
    xmax: 140,
    ymin: 0,
    ymax: 55
  }; //默认值：中国区域

  // 得到当前三维场景
  let scene = viewer.scene;

  // 得到当前三维场景的椭球体
  let ellipsoid = scene.globe.ellipsoid;
  let canvas = scene.canvas;

  // canvas左上角
  let car3_lt = viewer.camera.pickEllipsoid(
    new Cesium.Cartesian2(0, 0),
    ellipsoid
  );
  if (car3_lt) {
    // 在椭球体上
    let carto_lt = ellipsoid.cartesianToCartographic(car3_lt);
    extent.xmin = Cesium.Math.toDegrees(carto_lt.longitude);
    extent.ymax = Cesium.Math.toDegrees(carto_lt.latitude);
  } else {
    // 不在椭球体上
    let xMax = canvas.width / 2;
    let yMax = canvas.height / 2;

    let car3_lt2;
    // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
    for (let yIdx = 0; yIdx <= yMax; yIdx += 10) {
      let xIdx = yIdx <= xMax ? yIdx : xMax;
      car3_lt2 = viewer.camera.pickEllipsoid(
        new Cesium.Cartesian2(xIdx, yIdx),
        ellipsoid
      );
      if (car3_lt2) break;
    }
    if (car3_lt2) {
      let carto_lt = ellipsoid.cartesianToCartographic(car3_lt2);
      extent.xmin = Cesium.Math.toDegrees(carto_lt.longitude);
      extent.ymax = Cesium.Math.toDegrees(carto_lt.latitude);
    }
  }

  // canvas右下角
  let car3_rb = viewer.camera.pickEllipsoid(
    new Cesium.Cartesian2(canvas.width, canvas.height),
    ellipsoid
  );
  if (car3_rb) {
    // 在椭球体上
    let carto_rb = ellipsoid.cartesianToCartographic(car3_rb);
    extent.xmax = Cesium.Math.toDegrees(carto_rb.longitude);
    extent.ymin = Cesium.Math.toDegrees(carto_rb.latitude);
  } else {
    // 不在椭球体上
    let xMax = canvas.width / 2;
    let yMax = canvas.height / 2;

    let car3_rb2;
    // 这里每次10像素递减，一是10像素相差不大，二是为了提高程序运行效率
    for (let yIdx = canvas.height; yIdx >= yMax; yIdx -= 10) {
      let xIdx = yIdx >= xMax ? yIdx : xMax;
      car3_rb2 = viewer.camera.pickEllipsoid(
        new Cesium.Cartesian2(xIdx, yIdx),
        ellipsoid
      );
      if (car3_rb2) break;
    }
    if (car3_rb2) {
      let carto_rb = ellipsoid.cartesianToCartographic(car3_rb2);
      extent.xmax = Cesium.Math.toDegrees(carto_rb.longitude);
      extent.ymin = Cesium.Math.toDegrees(carto_rb.latitude);
    }
  }

  if (isToWgs) {
    //坐标转换为wgs
    let pt1 = viewer.shine.point2wgs({
      x: extent.xmin,
      y: extent.ymin
    });
    extent.xmin = pt1.x;
    extent.ymin = pt1.y;

    let pt2 = viewer.shine.point2wgs({
      x: extent.xmax,
      y: extent.ymax
    });
    extent.xmax = pt2.x;
    extent.ymax = pt2.y;
  }
  //交换
  if (extent.xmax < extent.xmin) {
    let temp = extent.xmax;
    extent.xmax = extent.xmin;
    extent.xmin = temp;
  }
  if (extent.ymax < extent.ymin) {
    let temp = extent.ymax;
    extent.ymax = extent.ymin;
    extent.ymin = temp;
  }

  return extent;
};

//提取相机视角范围参数
export const getCameraView = (viewer, isToWgs) => {
  let camera = viewer.camera;
  let position = camera.positionCartographic;

  let bookmark = {};
  bookmark.y = formatNum(Cesium.Math.toDegrees(position.latitude), 6);
  bookmark.x = formatNum(Cesium.Math.toDegrees(position.longitude), 6);
  bookmark.z = formatNum(position.height, 2);
  bookmark.heading = formatNum(Cesium.Math.toDegrees(camera.heading || -90), 1);
  bookmark.pitch = formatNum(Cesium.Math.toDegrees(camera.pitch || 0), 1);
  bookmark.roll = formatNum(Cesium.Math.toDegrees(camera.roll || 0), 1);

  if (isToWgs) bookmark = viewer.shine.point2wgs(bookmark); //坐标转换为wgs

  return bookmark;
};

//Turf求面的中心点
export const centerOfMass = (positions, height) => {
  try {
    if (height == null) {
      height = getMaxHeight(positions);
    }

    let coordinates = Util.cartesians2lonlats(positions);

    let center = turf.centroid(turf.lineString(coordinates));
    return Cesium.Cartesian3.fromDegrees(
      center.geometry.coordinates[0],
      center.geometry.coordinates[1],
      height
    );
  } catch (e) {
    return positions[Math.floor(positions.length / 2)];
  }
};

export const pointOnPolygon = (positions, height) => {
  try {
    if (height == null) {
      height = getMaxHeight(positions);
    }

    let coordinates = Util.cartesians2lonlats(positions);

    //let center = turf.centroid(turf.lineString(coordinates));
    let center = getInnerPoint(coordinates, 3);
    return Cesium.Cartesian3.fromDegrees(center[0], center[1], height);
  } catch (e) {
    return positions[Math.floor(positions.length / 2)];
  }
};

//点 是否在 entity（面、圆、多边形）内
export const isInPoly = (position, entity) => {
  if (!entity || !position) return false;

  if (!entity.rectangle) {
    if (entity.ellipse) {
      let center = entity.position.getValue();
      center = setPositionsHeight(center, 0);
      let radiu = entity.ellipse.semiMajorAxis.getValue();

      let len = Cesium.Cartesian3.distance(center, position);
      return len <= radiu; //小于半径的说明在圆内
    } else if (entity.polygon) {
      let point = formatPosition(position);
      let pt = turf.point([point.x, point.y, point.z]);

      let poly = polygonAttr.toGeoJSON(entity);
      //turf插件计算的
      return turf.booleanPointInPolygon(pt, poly);
    }
  } else {
    let rectangle = entity.rectangle.coordinates.getValue();

    return Cesium.Rectangle.contains(
      rectangle,
      Cesium.Cartographic.fromCartesian(position)
    );
  }
  return false;
};
