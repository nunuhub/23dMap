/* eslint-disable */
import * as Cesium from 'cesium_shinegis_earth';
import {
  DrawAddPoint,
  EditStart,
  EditMovePoint,
  EditStop
} from '../../Draw/EventType7';
import { toGeoJSON } from '../../Draw/EntityAttr/PolygonAttr14';
import { getMaxHeight } from '../../Tool/Point2';

import PNG from 'cesium_shinegis_earth/Build/Cesium/Assets/Textures/waterNormals.jpg';
import * as turf from '@turf/turf';
import { Measure, Draw } from '../../Entry57';
import * as echarts from 'echarts';
import { message } from '../../Tool/ToolTip4';
import { Message } from 'element-ui';
import { getCurrentMousePosition } from '../../Tool/Point2';
import {
  point as t_point,
  polygon as t_polygon,
  bbox,
  booleanContains,
  buffer
} from '@turf/turf';
import { PointPopup } from '../../Measure/PointPopup';

let Ct3 = Cesium.Cartesian3;
const Utils = {
  JulianDate: Cesium.JulianDate,
  /**
   * 空间笛卡尔坐标转经纬度(角度制)
   * @param cartesian
   * @returns Array [经度，纬度，高度]
   */
  cartesianToLonLatHeight(cartesian) {
    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
    let lon = Cesium.Math.toDegrees(cartographic.longitude);
    let lat = Cesium.Math.toDegrees(cartographic.latitude);
    return [lon, lat, cartographic.height];
  },
  /**
   * 获取坐标点的高程
   * @param viewer
   * @param cartesian3
   * @returns Cartographic
   */
  getCartographicWithCartesian3(viewer, cartesian3) {
    return viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian3);
  },
  /**
   * 抬高一个cartesian3的海拔
   * @param viewer
   * @param cartesian3
   * @param height
   * @returns {Cartesian3}
   */
  upPosition(viewer, cartesian3, height) {
    const d = this.getCartographicWithCartesian3(viewer, cartesian3);
    d.height += height;
    return Cesium.Cartographic.toCartesian(d);
  },
  /**
   * 设定一个cartesian3的海拔
   * @param viewer
   * @param cartesian3
   * @param height
   * @returns {Cartesian3}
   */
  setPositionHeight(viewer, cartesian3, height) {
    const d = this.getCartographicWithCartesian3(viewer, cartesian3);
    d.height = height;
    return Cesium.Cartographic.toCartesian(d);
  },
  /**
   * 获取p1与p2的距离
   * @param p1 {Cartesian3}
   * @param p2 {Cartesian3}
   * @returns {number}
   */
  distance(p1, p2) {
    const geodesic = new Cesium.EllipsoidGeodesic();
    geodesic.setEndPoints(
      Cesium.Cartographic.fromCartesian(p1),
      Cesium.Cartographic.fromCartesian(p2)
    );
    return geodesic.surfaceDistance;
  },
  /**
   * 获取cesium的内置颜色
   * @param colorString
   * @example {string} getColor('BLUE')
   * @returns {Cesium.Color}
   */
  getColor(colorString) {
    return Cesium.Color[colorString];
  },
  //验证是否是Cesium里属性类的实例
  isCesiumProperty(property, propertyName) {
    return property instanceof Cesium[propertyName];
  }
};
/**
 * 空间分析基类
 * @param prop {options} 空间分析的配置 参数
 * @param {Cesium.Viewer} prop.viewer 实例化完成的viewer
 * @param {string} prop.type 空间分析类型，已经内置，不用传参
 * @param {Cesium.DataSource} prop.dataSource 实例化完成的DataSource，如果不传入，那么将默认生成一个CustomDataSource
 * @param {Object} prop.drawConfig 绘制插件的配置
 * @example
 *     import { VisibleAnalysis } from "../../spatialAnalysis"

 this.insView = new VisibleAnalysis({ viewer: viewer })

 // 开始绘制，回调得到了绘制的图形对象
 this.insView.drawLine((e) => {
        this.insView.clear()

        const up = 1.7
        const positions = e.polyline.positions.getValue() // 图形的坐标，为长度为2的数组

        const viewEnd = positions[1] // 第一个坐标为开始点，第二个坐标为结束点

        // 抬高观察起始点
        const viewStart = [ Utils.upPosition(this.viewer, positions[0], up) ] // 把观察点海拔抬高了1.7米

        // this.insView.setViewStart(viewStart)
        // this.insView.setViewEnd(viewEnd)
        // this.insView.start()
        // 设置观察点的起始和结束，然后开始分析，等同于↓
        this.insView.start(viewStart, viewEnd) // 开始分析
    })
 */
class SpatialAnalysis {
  constructor(prop) {
    this.prop = prop || {};
    const { viewer, dataSource, type, drawConfig,name} = this.prop;

    if (!Cesium.defined(viewer)) {
      console.warn('初始化失败，请设置【viewer】');
      return;
    }
    if (!Cesium.defined(type)) {
      console.warn('初始化失败，请设置【type】');
      return;
    }
    let defaultName = `${type}AnalysisLayer`;
    // 初始化绘制组件
    if (drawConfig) {
      if(  drawConfig.type === 'measure'){
        this.drawControl = new Measure(Object.assign({ viewer, name:name ||defaultName }, drawConfig))
        this.prop.dataSource =this.drawControl.draw().dataSource
      }else{
        this.drawControl =  new Draw(viewer, Object.assign({ hasEdit: false,name:name ||defaultName }, drawConfig));
        this.prop.dataSource =this.drawControl.dataSource;
      }
    }else{
      // 初始化数据源
      this.prop.dataSource =
      dataSource || new Cesium.CustomDataSource(name ||defaultName);
      viewer.dataSources.add(this.prop.dataSource);
    }

   this.init?.();
  }

  /** 初始化参数，自动调用，不需要手动调用 */
  init() {}

  /**
   * 清除绘制的要素
   */
  clearDraw() {
    const { drawConfig } = this.prop;
    if (this.drawControl) {
      if (drawConfig.type === 'measure') {
        this.drawControl.clearMeasure();
      } else {
        this.drawControl.clearDraw();
      }
    }
  }

  /** 开始分析 */
  start() {
    // console.log(this)
  }

  /** 销毁实例 */
  destroy() {}

  /** 停止分析，清除结果 */
  clear() {}
}

/**
 * 通视分析
 * @extends SpatialAnalysis
 * @memberOf SpatialAnalysis
 */
class VisibleAnalysis extends SpatialAnalysis {
  constructor(prop) {
    prop = prop || {};
    prop.type = 'visible';
    prop.drawConfig = true;
    super(prop);
  }

  init() {
    const { depthFailMaterial } = this.prop;
    this.depthFailMaterial = depthFailMaterial;
    this.obHeight = 1.7; // 观察者增加的高度

    this.viewStart = []; // 观察起始点数组 [cartesian3] 可以一个或者多个
    this.viewEnd = null; // 观察终点 cartesian3 只能有一个
  }

  _checkStart(arr) {
    // 允许为数组形式且数组的每一个元素为cartesian3
    if (arr instanceof Array) {
      let flag = true;
      arr &&
        arr.forEach((a) => {
          if (!this._isCartesian3(a)) {
            // 如果有一个坐标点不是cartesian3，那么就不符合
            flag = false;
          }
        });
      return flag || 'not all array element are Cartesian3, please check';
    } else {
      return 'not a Array';
    }
  }

  _checkEnd(point) {
    // 允许为cartesian3
    if (point === undefined || point instanceof Cesium.Cartesian3) {
      return true;
    } else {
      return 'not Cartesian3,please check';
    }
  }

  _isCartesian3(point) {
    return !!(Cesium.defined(point) && point instanceof Cesium.Cartesian3);
  }

  _checkStartAndEnd() {
    return (
      this._checkStart(this.viewStart) === true &&
      this._checkEnd(this.viewEnd) === true
    );
  }

  /**
   * 设置观察起始点数组
   * @param viewStart {[position] || null } 允许传空值，传空值时重置viewStart为空数组；允许为Array且每个元素都为cartesian3
   */
  setViewStart(viewStart) {
    const result = this._checkStart(viewStart);
    if (typeof result === 'string') {
      // 如果不规范的话，输出错误信息
      console.warn(result);
    } else {
      // 允许传空值，自动转为空数组
      viewStart = viewStart || [];
      this.viewStart = viewStart;
    }
  }

  /**
   * 设置观察终点
   * @param viewEnd {position || null} 允许传空值，允许为cartesian3
   */
  setViewEnd(viewEnd) {
    const result = this._checkEnd(viewEnd);
    if (viewEnd === undefined || typeof result !== 'string') {
      this.viewEnd = viewEnd;
    } else {
      console.warn(result);
    }
  }

  drawPoint(callback) {
    this.drawControl.startDraw({ type: 'point', success: (e) => callback(e) });
  }

  /**
   * 启动通视分析。
   * 相当于其它类的start()。
   */
  drawLine() {
    this.clear();
    this.drawControl.startDraw({
      type: 'polyline',
      config: { maxPointNum: 2 },
      success: (e) => {
        const positions = e.polyline.positions.getValue();
        const start = [positions[0]];
        const end = positions[1];
        this.start(start, end);
      }
    });
  }

  /**
   * 刷新
   */
  refresh() {
    this.start();
  }

  /**
   * 开始分析
   * @param viewStart {Array(Cesium.cartesian3) } 起始点数组
   * @param viewEnd {Cesium.cartesian3} 终止点
   */
  start(viewStart, viewEnd) {
    if (viewStart) {
      this.setViewStart(viewStart);
    }
    if (viewEnd) {
      this.setViewEnd(viewEnd);
    }
    if (this._checkStartAndEnd()) {
      this.liveModeStart(this.viewStart, this.viewEnd);
      //在这里将观察点(设定是viewStart数组里的最后点)海拔计算出，塞入类属性中。
      let a = this.viewStart[this.viewStart.length - 1];
      let h = Cesium.Cartographic.fromCartesian(a).height;
      // console.log('h', h)
      this.obAltitude = h;
      this.callback && this.callback();
    } else {
      console.warn(
        'one of [viewStart] and [viewEnd] is not available,please check'
      );
    }
  }

  clear() {
    const { dataSource } = this.prop;

    // 清除绘制的对象
    this.clearDraw();

    // 清除数据源中的对象
    dataSource.entities.removeAll();
  }

  destroy() {
    const { viewer, dataSource } = this.prop;
    viewer.dataSources.contains(dataSource) &&
      viewer.dataSources.remove(dataSource);
  }

  /**
   * 开始分析，延迟模式
   * @param viewStart 视点，可以一个或者多个视点
   * @param viewEnd 终点
   */
  liveModeStart(viewStart, viewEnd) {
    this.clear();
    this.timeout && clearTimeout(this.timeout);
    //观察点数组，加上‘视点高’去分析。 同时画一条竖直虚线。 从观察点向上延伸视点高的距离。
    // console.log('在处理')
    viewStart = viewStart.map((e) => {
      let laterP = Utils.upPosition(
        this.prop.viewer,
        e.clone(),
        this.obHeight || 0
      );
      this._dL(e, laterP, Cesium.Color.YELLOW, true);
      return laterP;
    });

    this.timeout = setTimeout(
      () => viewStart.forEach((start) => this.sight(start, viewEnd)),
      0
    );
  }

  sight(startPoint, endPoint) {
    const { viewer } = this.prop;

    const startLLH = Utils.cartesianToLonLatHeight(startPoint);
    const endLLH = Utils.cartesianToLonLatHeight(endPoint);

    const carS = Cesium.Cartesian3.fromDegrees(
      startLLH[0],
      startLLH[1],
      startLLH[2]
    );
    const carE = Cesium.Cartesian3.fromDegrees(endLLH[0], endLLH[1], endLLH[2]);

    const direction = Cesium.Cartesian3.normalize(
      Cesium.Cartesian3.subtract(carE, carS, new Cesium.Cartesian3()),
      new Cesium.Cartesian3()
    );
    const ray = new Cesium.Ray(carS, direction);
    const result = viewer.scene.pickFromRay(ray);
    // console.log(result)
    if (Cesium.defined(result)) {
      if (Cesium.defined(result.position)) {
        this._dP(result.position, Cesium.Color.YELLOW);
      }
      this._dpOb(carS);
      this._dL(carS, result.position, Cesium.Color.GREEN);
      this._dL(result.position, carE, Cesium.Color.RED);
    }
  }

  _dpOb(position) {
    // console.log('add observe point label')
    const { dataSource, viewer } = this.prop;
    // console.log(position)
    const point = new Cesium.Entity({
      position,
      label: {
        text: '观察点',
        font: '30px sans-serif',
        scale: 0.5,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(5, 10000),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: { x: 0, y: -3 }
      }
    });
    dataSource.entities.add(point);
  }
  _dP(position, color) {
    // console.log('add point')
    const { dataSource, viewer } = this.prop;
    // console.log(position)
    const point = new Cesium.Entity({
      position,
      point: { color, pixelSize: 10 }
    });
    dataSource.entities.add(point);
    // this.viewer.entities.add(point)
  }

  _dL(leftPoint, secPoint, color, dash = false) {
    const { dataSource } = this.prop;

    if (Cesium.defined(leftPoint) && Cesium.defined(secPoint)) {
      //除了绘制可视分析的绿与红线条。 还加进来绘制箭头线的代码。（用于绘制标示视点相对高的线条。 ）
      /*  let check = vis.prop.dataSource.entities.getById('arrowLine')
             if (check) {
                 check.polyline.positions = [leftPoint, secPoint];
                 return
             } */
      dataSource.entities.add({
        // id: dash ? 'dashLine' : null,
        polyline: {
          depthFailMaterial: this.depthFailMaterial,
          positions: [leftPoint, secPoint],
          width: 4,
          material: dash
            ? new Cesium.PolylineDashMaterialProperty({ color })
            : color
        }
      });
    }
  }
}

/**
 * 视域分析
 * @extends SpatialAnalysis
 * @memberOf SpatialAnalysis
 */
class ViewShedAnalysis extends SpatialAnalysis {
  constructor(prop) {
    prop = prop || {};
    prop.type = 'viewShed';
    prop.drawConfig = true; // 配置初始化绘制组件
    super(prop);
  }

  __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) {
      Object.defineProperty(cooked, 'raw', { value: raw });
    } else {
      cooked.raw = raw;
    }
    return cooked;
  }

  glsl(x) {
    return x.toString();
  }

  init() {
    const { viewer } = this.prop;

    this.enabled = true;
    this.softShadows = false;
    this.direction = 0;
    this.pitch = 0;
    this.horizontalViewAngle = 90; // 水平角 [0,179]
    this.verticalViewAngle = 30; // 垂直角 [0,90]
    this.visibleAreaColor = Cesium.Color.GREEN; // 可见区域的颜色，默认绿色
    this.invisibleAreaColor = Cesium.Color.RED; //.withAlpha(0) // 不可见区域的颜色，默认红色
    this.cueLineColor = Cesium.Color.DODGERBLUE; //提示线颜色。 默认道奇蓝
    this.visualRange = 1000;
    this.size = 2048;
    this.originShadowMap = viewer.scene.shadowMap;
  }

  _isCartesian3(point) {
    // 允许为cartesian3
    return !!(Cesium.defined(point) && point instanceof Cesium.Cartesian3);
  }

  /**
   * 开始分析
   * @param start {Cesium.Cartesian3} 起始点数组
   * @param end {Cesium.Cartesian3} 种植点
   */
  start(start, end) {
    // 允许start和end为cartesian3
    if (this._isCartesian3(start) && this._isCartesian3(end)) {
      const param = this.setParamWithStartAndEnd(start, end);
      this.setParam(param);
    } else {
      console.warn('param not available');
    }
  }

  clear() {
    const { viewer } = this.prop;
    if (this.pyramid) {
      viewer.entities.removeById(this.pyramid.id);
      this.pyramid = null;
    }
    if (this.postStage) {
      viewer.scene.postProcessStages.remove(this.postStage);
      this.postStage = null;
    }
    if (this.frustumOutline) {
      viewer.scene.primitives.remove(this.frustumOutline);
    }
    viewer.scene.shadowMap = this.originShadowMap;
  }

  destroy() {
    this.clear();
    this.clearDraw();
  }

  /**
   * 计算偏航角；逆时针
   * @param p1 点1，开始点
   * @param p2 点2，结束点
   * @returns {number}
   */
  computeCorseAngle(p1, p2) {
    const localToWorld_Matrix = Cesium.Transforms.eastNorthUpToFixedFrame(p1);
    const worldToLocal_Matrix = Cesium.Matrix4.inverse(
      localToWorld_Matrix,
      new Cesium.Matrix4()
    );
    const localPosition_A = Cesium.Matrix4.multiplyByPoint(
      worldToLocal_Matrix,
      p1,
      new Cesium.Cartesian3()
    );
    const localPosition_B = Cesium.Matrix4.multiplyByPoint(
      worldToLocal_Matrix,
      p2,
      new Cesium.Cartesian3()
    );
    const angle = Math.atan2(
      localPosition_B.y - localPosition_A.y,
      localPosition_B.x - localPosition_A.x
    );
    let theta = angle * (180 / Math.PI);
    theta = 90 - theta;
    theta < 0 && (theta = theta + 360);
    return theta;
  }

  /**
   * 计算俯仰角；逆时针
   * @param p1 点1，开始点
   * @param p2 点2，结束点
   * @returns {number}
   */
  computePitchAngle(p1, p2) {
    const localToWorld_Matrix = Cesium.Transforms.eastNorthUpToFixedFrame(p1);
    const worldToLocal_Matrix = Cesium.Matrix4.inverse(
      localToWorld_Matrix,
      new Cesium.Matrix4()
    );
    const localPosition_A = Cesium.Matrix4.multiplyByPoint(
      worldToLocal_Matrix,
      p1,
      new Cesium.Cartesian3()
    );
    const localPosition_B = Cesium.Matrix4.multiplyByPoint(
      worldToLocal_Matrix,
      p2,
      new Cesium.Cartesian3()
    );
    const distance = Math.sqrt(
      Math.pow(localPosition_B.x - localPosition_A.x, 2) +
        Math.pow(localPosition_B.y - localPosition_A.y, 2)
    );
    const dz =
      Utils.cartesianToLonLatHeight(p1)[2] -
      Utils.cartesianToLonLatHeight(p2)[2];
    let angle = 0;
    distance !== 0 && (angle = Math.tanh(dz / distance));
    const theta = angle * (180 / Math.PI);
    return Math.abs(theta);
  }

  /**
   * 内置的绘线方法
   * @param callback {function =} 回调函数
   */
  drawLine(callback) {
    //"style":{"width":0}实时绘制pyramid后，就不需要显示线条了。
    this.drawControl.startDraw({
      type: 'polyline',
      config: { maxPointNum: 2 },
      style: { width: 0 },
      success: (e) => callback(e)
    });
    let _this = this.drawControl.drawCtrl['polyline'];
    let handler = _this.getHandler();
    let self = this;
    let lastPointTemporary = false;
    handler.setInputAction(function (event) {
      //单击添加点
      let point = getCurrentMousePosition(
        _this.viewer.scene,
        event.position,
        _this.entity
      );
      if (point) {
        if (lastPointTemporary) {
          _this._positions_draw.pop();
        }
        lastPointTemporary = false;

        //在绘制点基础自动增加高度
        if (
          _this.entity.attribute &&
          _this.entity.attribute.config &&
          _this.entity.attribute.config.addHeight
        )
          point = addPositionsHeight(
            point,
            _this.entity.attribute.config.addHeight
          );

        _this._positions_draw.push(point);
        if (_this._positions_draw.length >= _this._maxPointNum) {
          //点数满足最大数量，自动结束
          _this.disable();
        }
      }
    }, 2);
    handler.removeInputAction(7); //remove event of mouse_right click;
    handler.setInputAction(function (event) {
      //鼠标移动
      if (_this._positions_draw.length <= 1)
        _this.tooltip.showAt(event.endPosition, message.draw.polyline.start);
      else if (_this._positions_draw.length < _this._minPointNum)
        //点数不满足最少数量
        _this.tooltip.showAt(event.endPosition, message.draw.polyline.cont);
      else if (_this._positions_draw.length >= _this._maxPointNum)
        //点数满足最大数量
        _this.tooltip.showAt(event.endPosition, message.draw.polyline.end2);
      else _this.tooltip.showAt(event.endPosition, message.draw.polyline.end);

      let point = getCurrentMousePosition(
        _this.viewer.scene,
        event.endPosition,
        _this.entity
      );

      if (point) {
        if (lastPointTemporary) {
          _this._positions_draw.pop();
        }
        lastPointTemporary = true;

        _this._positions_draw.push(point);
        if (_this._positions_draw.length == 2) {
          //绘制视域分析的锥体
          //    self.clearDraw();
          const start = _this._positions_draw[0];
          const end = _this._positions_draw[1];
          // self.start(start, end);
          let param = self.setParamWithStartAndEnd(start, end);

          //先移除。
          let viewer = self.prop.viewer;
          let judge = self.pyramid && viewer.entities.contains(self.pyramid);
          //// console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~', self.visualRange)
          //if (self.visualRange <= 1) return
          if (judge) {
            const {
              direction = self.direction,
              pitch = self.pitch,
              visualRange = self.visualRange,
              viewPosition,
              horizontalViewAngle = self.horizontalViewAngle,
              verticalViewAngle = self.verticalViewAngle,
              invisibleAreaColor = self.invisibleAreaColor,
              visibleAreaColor = self.visibleAreaColor
            } = param || {};
            self.viewPosition = viewPosition;
            self.direction = direction % 360;
            self.pitch = pitch;
            self.visualRange = visualRange;
            self.horizontalViewAngle = horizontalViewAngle;
            self.verticalViewAngle = verticalViewAngle;
            self.invisibleAreaColor = invisibleAreaColor;
            self.visibleAreaColor = visibleAreaColor;

            /* self.pyramid.ellipsoid = */
            /* if (!self.pyramid) {
                            self._setVisualPyramid()
                        } */
            self._getVisualPyramidEllipsoid();
          } else {
            param.onlyDrawPyramid = true;
            self.setParam(param);
          }
        }
      }
    }, 15);
  }
  /* drawLine(callback) {
        //"style":{"width":0}实时绘制pyramid后，就不需要显示线条了。
        this.drawControl.startDraw({ type: 'polyline', config: { maxPointNum: 2 }, "style": { "width": 4 }, success: (e) => callback(e) })
    } */

  /**
   * 设置开始和结束，外部调用的比较少，一般使用start(start,end)
   * @param start {Cesium.Cartesian3}
   * @param end {Cesium.Cartesian3}
   * @returns {{visualRange: number, horizontalViewAngle: number, viewPosition, direction: number, verticalViewAngle: number}} 返回的param
   */
  setParamWithStartAndEnd(start, end) {
    const direction = this.computeCorseAngle(start, end).toFixed(0);
    const verticalAngle = this.computePitchAngle(start, end).toFixed(2) * 2;

    const param = {
      direction: Number(direction),
      horizontalViewAngle: 90,
      verticalViewAngle: Number(verticalAngle),
      visualRange: Number(Utils.distance(start, end).toFixed(0)),
      viewPosition: start
    };
    return param;
  }

  /**
   * 设置param，并更新分析结果
   * @param param
   */
  setParam(param) {
    const {
      direction = this.direction,
      pitch = this.pitch,
      visualRange = this.visualRange,
      viewPosition,
      horizontalViewAngle = this.horizontalViewAngle,
      verticalViewAngle = this.verticalViewAngle,
      invisibleAreaColor = this.invisibleAreaColor,
      visibleAreaColor = this.visibleAreaColor
    } = param || {};
    if (!viewPosition) return;

    this.viewPosition = viewPosition;
    this.direction = direction % 360;
    this.pitch = pitch;
    this.visualRange = visualRange;
    this.horizontalViewAngle = horizontalViewAngle;
    this.verticalViewAngle = verticalViewAngle;
    this.invisibleAreaColor = invisibleAreaColor;
    this.visibleAreaColor = visibleAreaColor;

    if (!this.pyramid) {
      this._setVisualPyramid();
    }
    //一个bug，当 this.visualRange<1时，frustum.near>frustum.far而报错。 frustum.near（难道固定为1）
    //所以暂先退出1m内的过程。
    // if (this.visualRange <= 1) return
    if (param.onlyDrawPyramid) {
      //新增加上的一个功能，即鼠标移动实时显示视域（仅金字塔）。 当仅绘制金字塔时，下文的灯光等操作不进行。
      return;
    }
    if (!this.lightCamera) {
      this._setLightCamera();
    }

    this.pyramid.ellipsoid = this._getVisualPyramidEllipsoid();
    this._setCameraParams();

    this._updateViewShed();
  }

  _getVisualPyramidEllipsoid() {
    /*   if (this.visualRange <= 0){
              debugger
              return
          }  */
    //this.visualRange = this.visualRange ? this.visualRange : 1;//这里是为了解决bug而加。
    let ColorFromCss = Cesium.Color.fromCssColorString;

    this.innerRange = this.visualRange * 0.001;
    this.halfClock = this.horizontalViewAngle / 2;
    this.halfCone = this.verticalViewAngle / 2;
    this.ellipsoid =
      this.ellipsoid ||
      new Cesium.EllipsoidGraphics({
        innerRadii: new Cesium.CallbackProperty(() => {
          let i = this.visualRange * 0.001 || 0.001;
          return new Cesium.Cartesian3(i, i, i);
        }, false),
        radii: new Cesium.CallbackProperty(() => {
          let i = this.visualRange || 0.1;
          return new Cesium.Cartesian3(i, i, i);
        }, false),
        minimumClock: new Cesium.CallbackProperty(() => {
          return Cesium.Math.toRadians(90 - this.direction - this.halfClock);
        }, false),
        maximumClock: new Cesium.CallbackProperty(() => {
          return Cesium.Math.toRadians(90 - this.direction + this.halfClock);
        }, false),
        minimumCone: new Cesium.CallbackProperty(() => {
          return Cesium.Math.toRadians(90 - this.pitch - this.halfCone);
        }, false),
        maximumCone: new Cesium.CallbackProperty(() => {
          return Cesium.Math.toRadians(90 - this.pitch + this.halfCone);
        }, false),
        fill: false,
        outline: true,
        outlineColor: new Cesium.CallbackProperty(() => {
          let c = this.cueLineColor;
          if (typeof c === 'string') c = ColorFromCss(c);
          else if (!c instanceof Cesium.Color) c = Cesium.Color.BLUE;
          return c;
        }, false),
        subdivisions: 256,
        stackPartitions: 64,
        slicePartitions: 64
      });
    return this.ellipsoid;
  }

  _setVisualPyramid() {
    const { viewer } = this.prop;
    const pyramidEntity = new Cesium.Entity({
      position: this.viewPosition,
      ellipsoid: this._getVisualPyramidEllipsoid(),
      label: {
        text: '观察点',
        font: '120px sans-serif',
        scale: 0.125,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(5, 10000),
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: { x: 0, y: -3 }
      }
    });
    this.pyramid = viewer.entities.add(pyramidEntity);
  }

  _setLightCamera() {
    const { viewer } = this.prop;
    this.lightCamera = new Cesium.Camera(viewer.scene);
    this.lightCamera.position = this.viewPosition;
  }

  _setShadowMap() {
    const { viewer } = this.prop;

    this.shadowMap = new Cesium.ShadowMap({
      context: viewer.scene.context,
      lightCamera: this.lightCamera,
      enabled: this.enabled,
      isPointLight: true,
      pointLightRadius: this.visualRange,
      cascadesEnabled: false,
      size: this.size,
      softShadows: this.softShadows,
      normalOffset: false,
      fromLightSource: false
    });
    this.shadowMap._pointBias.depthBias = 0.005;
    viewer.scene.shadowMap = this.shadowMap;
  }

  _updateViewShed() {
    this.clear();
    this._setVisualPyramid();
    this._setLightCamera();
    this._setCameraParams();
    this._setShadowMap();
    /**yangw 增加一个设置可见（/不可见）区域颜色 */
    this._setVisibleAreaColor();
    /** */
    this._setPostStage();
    // this.drawViewCentrum()
  }

  _setCameraParams() {
    if (this.visualRange <= 0) this.visualRange = 1;
    this.lightCamera.frustum.near = 0.001 * this.visualRange;
    this.lightCamera.frustum.far = this.visualRange;
    const hr = Cesium.Math.toRadians(this.horizontalViewAngle);
    const vr = Cesium.Math.toRadians(this.verticalViewAngle);
    const aspectRatio =
      (this.visualRange * Math.tan(hr / 2) * 2) /
      (this.visualRange * Math.tan(vr / 2) * 2);
    this.lightCamera.frustum.aspectRatio = aspectRatio;
    if (hr > vr) {
      this.lightCamera.frustum.fov = hr;
    } else {
      this.lightCamera.frustum.fov = vr;
    }
    this.lightCamera.setView({
      destination: this.viewPosition,
      orientation: {
        heading: Cesium.Math.toRadians(this.direction || 0),
        pitch: Cesium.Math.toRadians(this.pitch || 0),
        roll: 0
      }
    });
  }

  _setPostStage() {
    const { viewer } = this.prop;

    const _this = this;
    // console.log('temp3211111')
    const fs_previous = this.glsl(
      this.__makeTemplateObject(
        [
          '\n    #define USE_CUBE_MAP_SHADOW true\nuniform sampler2D colorTexture;\n// \u6DF1\u5EA6\u7EB9\u7406\nuniform sampler2D depthTexture;\n// \u7EB9\u7406\u5750\u6807\nvarying vec2 v_textureCoordinates;\n\nuniform mat4 camera_projection_matrix;\n\nuniform mat4 camera_view_matrix;\n// \u89C2\u6D4B\u8DDD\u79BB\nuniform float far;\n//\u9634\u5F71\nuniform samplerCube shadowMap_textureCube;\n\nuniform mat4 shadowMap_matrix;\nuniform vec4 shadowMap_lightPositionEC;\nuniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;\nuniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;\n\nstruct zx_shadowParameters\n{\n    vec3 texCoords;\n    float depthBias;\n    float depth;\n    float nDotL;\n    vec2 texelStepSize;\n    float normalShadingSmooth;\n    float darkness;\n};\n\nfloat czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters)\n{\n    float depthBias = shadowParameters.depthBias;\n    float depth = shadowParameters.depth;\n    float nDotL = shadowParameters.nDotL;\n    float normalShadingSmooth = shadowParameters.normalShadingSmooth;\n    float darkness = shadowParameters.darkness;\n    vec3 uvw = shadowParameters.texCoords;\n\n    depth -= depthBias;\n    float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);\n    return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);\n}\n\nvec4 getPositionEC(){\n  return czm_windowToEyeCoordinates(gl_FragCoord);\n}\n\nvec3 getNormalEC(){\n    return vec3(1.);\n  }\n\n  vec4 toEye(in vec2 uv,in float depth){\n    vec2 xy=vec2((uv.x*2.-1.),(uv.y*2.-1.));\n    vec4 posInCamera=czm_inverseProjection*vec4(xy,depth,1.);\n    posInCamera=posInCamera/posInCamera.w;\n    return posInCamera;\n  }\n\n  vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point){\n    vec3 v01=point-planeOrigin;\n    float d=dot(planeNormal,v01);\n    return(point-planeNormal*d);\n  }\n\n  float getDepth(in vec4 depth){\n    float z_window=czm_unpackDepth(depth);\n    z_window=czm_reverseLogDepth(z_window);\n    float n_range=czm_depthRange.near;\n    float f_range=czm_depthRange.far;\n    return(2.*z_window-n_range-f_range)/(f_range-n_range);\n  }\n\n  float shadow( in vec4 positionEC ){\n    vec3 normalEC=getNormalEC();\n    zx_shadowParameters shadowParameters;\n    shadowParameters.texelStepSize=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;\n    shadowParameters.depthBias=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;\n    shadowParameters.normalShadingSmooth=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;\n    shadowParameters.darkness=shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;\n    vec3 directionEC=positionEC.xyz-shadowMap_lightPositionEC.xyz;\n    float distance=length(directionEC);\n    directionEC=normalize(directionEC);\n    float radius=shadowMap_lightPositionEC.w;\n    if(distance>radius)\n    {\n      return 2.0;\n    }\n    vec3 directionWC=czm_inverseViewRotation*directionEC;\n\n    shadowParameters.depth=distance/radius-0.0003;\n    shadowParameters.nDotL=clamp(dot(normalEC,-directionEC),0.,1.);\n\n    shadowParameters.texCoords=directionWC;\n    float visibility=czm_shadowVisibility(shadowMap_textureCube,shadowParameters);\n    return visibility;\n  }\n\n  bool visible(in vec4 result)\n  {\n    result.x/=result.w;\n    result.y/=result.w;\n    result.z/=result.w;\n    return result.x>=-1.&&result.x<=1.&&result.y>=-1.&&result.y<=1.&&result.z>=-1.&&result.z<=1.;\n  }\n\n  void main(){\n    // \u5F97\u5230\u91C9\u8272 = \u7ED3\u6784\u4E8C\u7EF4(\u5F69\u8272\u7EB9\u7406,\u7EB9\u7406\u5750\u6807)\n    gl_FragColor=texture2D(colorTexture,v_textureCoordinates);\n    // \u6DF1\u5EA6 = (\u91C9\u8272 = \u7ED3\u6784\u4E8C\u7EF4(\u6DF1\u5EA6\u7EB9\u7406,\u7EB9\u7406\u5750\u6807))\n    float depth=getDepth(texture2D(depthTexture,v_textureCoordinates));\n    // \u89C6\u89D2 = (\u7EB9\u7406\u5750\u6807,\u6DF1\u5EA6)\n    vec4 viewPos=toEye(v_textureCoordinates,depth);\n    //\u4E16\u754C\u5750\u6807\n    vec4 wordPos=czm_inverseView*viewPos;\n    // \u865A\u62DF\u76F8\u673A\u4E2D\u5750\u6807\n    vec4 vcPos=camera_view_matrix*wordPos;\n    float near=.001*far;\n    float dis=length(vcPos.xyz);\n    if(dis>near&&dis<far){\n      //\u900F\u89C6\u6295\u5F71\n      vec4 posInEye=camera_projection_matrix*vcPos;\n      // \u53EF\u89C6\u533A\u989C\u8272\n      vec4 v_color=vec4(0.,1.,0.,.5);\n      vec4 inv_color=vec4(1.,0.,0.,.5);\n      if(visible(posInEye)){\n        float vis=shadow(viewPos);\n        if(vis>0.3){\n          gl_FragColor=mix(gl_FragColor,v_color,.5);\n        } else{\n          gl_FragColor=mix(gl_FragColor,inv_color,.5);\n        }\n      }\n    }\n  }\n'
        ],
        [
          '\n    #define USE_CUBE_MAP_SHADOW true\nuniform sampler2D colorTexture;\n// \u6DF1\u5EA6\u7EB9\u7406\nuniform sampler2D depthTexture;\n// \u7EB9\u7406\u5750\u6807\nvarying vec2 v_textureCoordinates;\n\nuniform mat4 camera_projection_matrix;\n\nuniform mat4 camera_view_matrix;\n// \u89C2\u6D4B\u8DDD\u79BB\nuniform float far;\n//\u9634\u5F71\nuniform samplerCube shadowMap_textureCube;\n\nuniform mat4 shadowMap_matrix;\nuniform vec4 shadowMap_lightPositionEC;\nuniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;\nuniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;\n\nstruct zx_shadowParameters\n{\n    vec3 texCoords;\n    float depthBias;\n    float depth;\n    float nDotL;\n    vec2 texelStepSize;\n    float normalShadingSmooth;\n    float darkness;\n};\n\nfloat czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters)\n{\n    float depthBias = shadowParameters.depthBias;\n    float depth = shadowParameters.depth;\n    float nDotL = shadowParameters.nDotL;\n    float normalShadingSmooth = shadowParameters.normalShadingSmooth;\n    float darkness = shadowParameters.darkness;\n    vec3 uvw = shadowParameters.texCoords;\n\n    depth -= depthBias;\n    float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);\n    return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);\n}\n\nvec4 getPositionEC(){\n  return czm_windowToEyeCoordinates(gl_FragCoord);\n}\n\nvec3 getNormalEC(){\n    return vec3(1.);\n  }\n\n  vec4 toEye(in vec2 uv,in float depth){\n    vec2 xy=vec2((uv.x*2.-1.),(uv.y*2.-1.));\n    vec4 posInCamera=czm_inverseProjection*vec4(xy,depth,1.);\n    posInCamera=posInCamera/posInCamera.w;\n    return posInCamera;\n  }\n\n  vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point){\n    vec3 v01=point-planeOrigin;\n    float d=dot(planeNormal,v01);\n    return(point-planeNormal*d);\n  }\n\n  float getDepth(in vec4 depth){\n    float z_window=czm_unpackDepth(depth);\n    z_window=czm_reverseLogDepth(z_window);\n    float n_range=czm_depthRange.near;\n    float f_range=czm_depthRange.far;\n    return(2.*z_window-n_range-f_range)/(f_range-n_range);\n  }\n\n  float shadow( in vec4 positionEC ){\n    vec3 normalEC=getNormalEC();\n    zx_shadowParameters shadowParameters;\n    shadowParameters.texelStepSize=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;\n    shadowParameters.depthBias=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;\n    shadowParameters.normalShadingSmooth=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;\n    shadowParameters.darkness=shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;\n    vec3 directionEC=positionEC.xyz-shadowMap_lightPositionEC.xyz;\n    float distance=length(directionEC);\n    directionEC=normalize(directionEC);\n    float radius=shadowMap_lightPositionEC.w;\n    if(distance>radius)\n    {\n      return 2.0;\n    }\n    vec3 directionWC=czm_inverseViewRotation*directionEC;\n\n    shadowParameters.depth=distance/radius-0.0003;\n    shadowParameters.nDotL=clamp(dot(normalEC,-directionEC),0.,1.);\n\n    shadowParameters.texCoords=directionWC;\n    float visibility=czm_shadowVisibility(shadowMap_textureCube,shadowParameters);\n    return visibility;\n  }\n\n  bool visible(in vec4 result)\n  {\n    result.x/=result.w;\n    result.y/=result.w;\n    result.z/=result.w;\n    return result.x>=-1.&&result.x<=1.&&result.y>=-1.&&result.y<=1.&&result.z>=-1.&&result.z<=1.;\n  }\n\n  void main(){\n    // \u5F97\u5230\u91C9\u8272 = \u7ED3\u6784\u4E8C\u7EF4(\u5F69\u8272\u7EB9\u7406,\u7EB9\u7406\u5750\u6807)\n    gl_FragColor=texture2D(colorTexture,v_textureCoordinates);\n    // \u6DF1\u5EA6 = (\u91C9\u8272 = \u7ED3\u6784\u4E8C\u7EF4(\u6DF1\u5EA6\u7EB9\u7406,\u7EB9\u7406\u5750\u6807))\n    float depth=getDepth(texture2D(depthTexture,v_textureCoordinates));\n    // \u89C6\u89D2 = (\u7EB9\u7406\u5750\u6807,\u6DF1\u5EA6)\n    vec4 viewPos=toEye(v_textureCoordinates,depth);\n    //\u4E16\u754C\u5750\u6807\n    vec4 wordPos=czm_inverseView*viewPos;\n    // \u865A\u62DF\u76F8\u673A\u4E2D\u5750\u6807\n    vec4 vcPos=camera_view_matrix*wordPos;\n    float near=.001*far;\n    float dis=length(vcPos.xyz);\n    if(dis>near&&dis<far){\n      //\u900F\u89C6\u6295\u5F71\n      vec4 posInEye=camera_projection_matrix*vcPos;\n      // \u53EF\u89C6\u533A\u989C\u8272\n      vec4 v_color=vec4(0.,1.,0.,.5);\n      vec4 inv_color=vec4(1.,0.,0.,.5);\n      if(visible(posInEye)){\n        float vis=shadow(viewPos);\n        if(vis>0.3){\n          gl_FragColor=mix(gl_FragColor,v_color,.5);\n        } else{\n          gl_FragColor=mix(gl_FragColor,inv_color,.5);\n        }\n      }\n    }\n  }\n'
        ]
      )
    );
    /* let inv_color = '(1.,0.,0.,.5)';//这里使用模板字符串传值。 来改变可见与不可见区域的颜色。
        let v_color = '(0.,1.,0.,.5)'; */
    let v_color = this.v_color || '(0.,1.,0.,.5)';
    let inv_color = this.inv_color || '(1., 0., 0., .5)';
    let fs = `\n    #define USE_CUBE_MAP_SHADOW true\nuniform sampler2D colorTexture;\n// \u6DF1\u5EA6\u7EB9\u7406\nuniform sampler2D depthTexture;\n// \u7EB9\u7406\u5750\u6807\nvarying vec2 v_textureCoordinates;\n\nuniform mat4 camera_projection_matrix;\n\nuniform mat4 camera_view_matrix;\n// \u89C2\u6D4B\u8DDD\u79BB\nuniform float far;\n//\u9634\u5F71\nuniform samplerCube shadowMap_textureCube;\n\nuniform mat4 shadowMap_matrix;\nuniform vec4 shadowMap_lightPositionEC;\nuniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;\nuniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;\n\nstruct zx_shadowParameters\n{\n    vec3 texCoords;\n    float depthBias;\n    float depth;\n    float nDotL;\n    vec2 texelStepSize;\n    float normalShadingSmooth;\n    float darkness;\n};\n\nfloat czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters)\n{\n    float depthBias = shadowParameters.depthBias;\n    float depth = shadowParameters.depth;\n    float nDotL = shadowParameters.nDotL;\n    float normalShadingSmooth = shadowParameters.normalShadingSmooth;\n    float darkness = shadowParameters.darkness;\n    vec3 uvw = shadowParameters.texCoords;\n\n    depth -= depthBias;\n    float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);\n    return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);\n}\n\nvec4 getPositionEC(){\n  return czm_windowToEyeCoordinates(gl_FragCoord);\n}\n\nvec3 getNormalEC(){\n    return vec3(1.);\n  }\n\n  vec4 toEye(in vec2 uv,in float depth){\n    vec2 xy=vec2((uv.x*2.-1.),(uv.y*2.-1.));\n    vec4 posInCamera=czm_inverseProjection*vec4(xy,depth,1.);\n    posInCamera=posInCamera/posInCamera.w;\n    return posInCamera;\n  }\n\n  vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point){\n    vec3 v01=point-planeOrigin;\n    float d=dot(planeNormal,v01);\n    return(point-planeNormal*d);\n  }\n\n  float getDepth(in vec4 depth){\n    float z_window=czm_unpackDepth(depth);\n    z_window=czm_reverseLogDepth(z_window);\n    float n_range=czm_depthRange.near;\n    float f_range=czm_depthRange.far;\n    return(2.*z_window-n_range-f_range)/(f_range-n_range);\n  }\n\n  float shadow( in vec4 positionEC ){\n    vec3 normalEC=getNormalEC();\n    zx_shadowParameters shadowParameters;\n    shadowParameters.texelStepSize=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;\n    shadowParameters.depthBias=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;\n    shadowParameters.normalShadingSmooth=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;\n    shadowParameters.darkness=shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;\n    vec3 directionEC=positionEC.xyz-shadowMap_lightPositionEC.xyz;\n    float distance=length(directionEC);\n    directionEC=normalize(directionEC);\n    float radius=shadowMap_lightPositionEC.w;\n    if(distance>radius)\n    {\n      return 2.0;\n    }\n    vec3 directionWC=czm_inverseViewRotation*directionEC;\n\n    shadowParameters.depth=distance/radius-0.0003;\n    shadowParameters.nDotL=clamp(dot(normalEC,-directionEC),0.,1.);\n\n    shadowParameters.texCoords=directionWC;\n    float visibility=czm_shadowVisibility(shadowMap_textureCube,shadowParameters);\n    return visibility;\n  }\n\n  bool visible(in vec4 result)\n  {\n    result.x/=result.w;\n    result.y/=result.w;\n    result.z/=result.w;\n    return result.x>=-1.&&result.x<=1.&&result.y>=-1.&&result.y<=1.&&result.z>=-1.&&result.z<=1.;\n  }\n\n  void main(){\n    // \u5F97\u5230\u91C9\u8272 = \u7ED3\u6784\u4E8C\u7EF4(\u5F69\u8272\u7EB9\u7406,\u7EB9\u7406\u5750\u6807)\n    gl_FragColor=texture2D(colorTexture,v_textureCoordinates);\n    // \u6DF1\u5EA6 = (\u91C9\u8272 = \u7ED3\u6784\u4E8C\u7EF4(\u6DF1\u5EA6\u7EB9\u7406,\u7EB9\u7406\u5750\u6807))\n    float depth=getDepth(texture2D(depthTexture,v_textureCoordinates));\n    // \u89C6\u89D2 = (\u7EB9\u7406\u5750\u6807,\u6DF1\u5EA6)\n    vec4 viewPos=toEye(v_textureCoordinates,depth);\n    //\u4E16\u754C\u5750\u6807\n    vec4 wordPos=czm_inverseView*viewPos;\n    // \u865A\u62DF\u76F8\u673A\u4E2D\u5750\u6807\n    vec4 vcPos=camera_view_matrix*wordPos;\n    float near=.001*far;\n    float dis=length(vcPos.xyz);\n    if(dis>near&&dis<far){\n      //\u900F\u89C6\u6295\u5F71\n      vec4 posInEye=camera_projection_matrix*vcPos;\n      // \u53EF\u89C6\u533A\u989C\u8272\n      vec4 v_color=vec4${v_color};\n      vec4 inv_color=vec4${inv_color};\n      if(visible(posInEye)){\n        float vis=shadow(viewPos);\n        if(vis>0.3){\n          gl_FragColor=mix(gl_FragColor,v_color,v_color.w);\n        } else{\n          gl_FragColor=mix(gl_FragColor,inv_color,inv_color.w);\n        }\n      }\n    }\n  }\n`;
    // let fs = `\n    #define USE_CUBE_MAP_SHADOW true\nuniform sampler2D colorTexture;\n// \u6DF1\u5EA6\u7EB9\u7406\nuniform sampler2D depthTexture;\n// \u7EB9\u7406\u5750\u6807\nvarying vec2 v_textureCoordinates;\n\nuniform mat4 camera_projection_matrix;\n\nuniform mat4 camera_view_matrix;\n// \u89C2\u6D4B\u8DDD\u79BB\nuniform float far;\n//\u9634\u5F71\nuniform samplerCube shadowMap_textureCube;\n\nuniform mat4 shadowMap_matrix;\nuniform vec4 shadowMap_lightPositionEC;\nuniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;\nuniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;\n\nstruct zx_shadowParameters\n{\n    vec3 texCoords;\n    float depthBias;\n    float depth;\n    float nDotL;\n    vec2 texelStepSize;\n    float normalShadingSmooth;\n    float darkness;\n};\n\nfloat czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters)\n{\n    float depthBias = shadowParameters.depthBias;\n    float depth = shadowParameters.depth;\n    float nDotL = shadowParameters.nDotL;\n    float normalShadingSmooth = shadowParameters.normalShadingSmooth;\n    float darkness = shadowParameters.darkness;\n    vec3 uvw = shadowParameters.texCoords;\n\n    depth -= depthBias;\n    float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);\n    return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);\n}\n\nvec4 getPositionEC(){\n  return czm_windowToEyeCoordinates(gl_FragCoord);\n}\n\nvec3 getNormalEC(){\n    return vec3(1.);\n  }\n\n  vec4 toEye(in vec2 uv,in float depth){\n    vec2 xy=vec2((uv.x*2.-1.),(uv.y*2.-1.));\n    vec4 posInCamera=czm_inverseProjection*vec4(xy,depth,1.);\n    posInCamera=posInCamera/posInCamera.w;\n    return posInCamera;\n  }\n\n  vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point){\n    vec3 v01=point-planeOrigin;\n    float d=dot(planeNormal,v01);\n    return(point-planeNormal*d);\n  }\n\n  float getDepth(in vec4 depth){\n    float z_window=czm_unpackDepth(depth);\n    z_window=czm_reverseLogDepth(z_window);\n    float n_range=czm_depthRange.near;\n    float f_range=czm_depthRange.far;\n    return(2.*z_window-n_range-f_range)/(f_range-n_range);\n  }\n\n  float shadow( in vec4 positionEC ){\n    vec3 normalEC=getNormalEC();\n    zx_shadowParameters shadowParameters;\n    shadowParameters.texelStepSize=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;\n    shadowParameters.depthBias=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;\n    shadowParameters.normalShadingSmooth=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;\n    shadowParameters.darkness=shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;\n    vec3 directionEC=positionEC.xyz-shadowMap_lightPositionEC.xyz;\n    float distance=length(directionEC);\n    directionEC=normalize(directionEC);\n    float radius=shadowMap_lightPositionEC.w;\n    if(distance>radius)\n    {\n      return 2.0;\n    }\n    vec3 directionWC=czm_inverseViewRotation*directionEC;\n\n    shadowParameters.depth=distance/radius-0.0003;\n    shadowParameters.nDotL=clamp(dot(normalEC,-directionEC),0.,1.);\n\n    shadowParameters.texCoords=directionWC;\n    float visibility=czm_shadowVisibility(shadowMap_textureCube,shadowParameters);\n    return visibility;\n  }\n\n  bool visible(in vec4 result)\n  {\n    result.x/=result.w;\n    result.y/=result.w;\n    result.z/=result.w;\n    return result.x>=-1.&&result.x<=1.&&result.y>=-1.&&result.y<=1.&&result.z>=-1.&&result.z<=1.;\n  }\n\n  void main(){\n    // \u5F97\u5230\u91C9\u8272 = \u7ED3\u6784\u4E8C\u7EF4(\u5F69\u8272\u7EB9\u7406,\u7EB9\u7406\u5750\u6807)\n    gl_FragColor=texture2D(colorTexture,v_textureCoordinates);\n    // \u6DF1\u5EA6 = (\u91C9\u8272 = \u7ED3\u6784\u4E8C\u7EF4(\u6DF1\u5EA6\u7EB9\u7406,\u7EB9\u7406\u5750\u6807))\n    float depth=getDepth(texture2D(depthTexture,v_textureCoordinates));\n    // \u89C6\u89D2 = (\u7EB9\u7406\u5750\u6807,\u6DF1\u5EA6)\n    vec4 viewPos=toEye(v_textureCoordinates,depth);\n    //\u4E16\u754C\u5750\u6807\n    vec4 wordPos=czm_inverseView*viewPos;\n    // \u865A\u62DF\u76F8\u673A\u4E2D\u5750\u6807\n    vec4 vcPos=camera_view_matrix*wordPos;\n    float near=.001*far;\n    float dis=length(vcPos.xyz);\n    if(dis>near&&dis<far){\n      //\u900F\u89C6\u6295\u5F71\n      vec4 posInEye=camera_projection_matrix*vcPos;\n      // \u53EF\u89C6\u533A\u989C\u8272\n      vec4 v_color=vec4${v_color};\n      vec4 inv_color=vec4${inv_color};\n      if(visible(posInEye)){\n        float vis=shadow(viewPos);\n        if(vis>0.3){\n          gl_FragColor=mix(gl_FragColor,v_color,.5);\n        } else{\n          gl_FragColor=mix(gl_FragColor,inv_color,.5);\n        }\n      }\n    }\n  }\n`

    const postStage = new Cesium.PostProcessStage({
      fragmentShader: fs,
      uniforms: {
        camera_projection_matrix: this.lightCamera.frustum.projectionMatrix,
        camera_view_matrix: this.lightCamera.viewMatrix,
        far: function () {
          return _this.visualRange;
        },
        shadowMap_textureCube: function () {
          _this.shadowMap.update(Reflect.get(viewer.scene, '_frameState'));
          return Reflect.get(_this.shadowMap, '_shadowMapTexture');
        },
        shadowMap_matrix: function () {
          _this.shadowMap.update(Reflect.get(viewer.scene, '_frameState'));
          return Reflect.get(_this.shadowMap, '_shadowMapMatrix');
        },
        shadowMap_lightPositionEC: function () {
          _this.shadowMap.update(Reflect.get(viewer.scene, '_frameState'));
          return Reflect.get(_this.shadowMap, '_lightPositionEC');
        },
        shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: function () {
          _this.shadowMap.update(Reflect.get(viewer.scene, '_frameState'));
          var bias = _this.shadowMap._pointBias;
          return Cesium.Cartesian4.fromElements(
            bias.normalOffsetScale,
            _this.shadowMap._distance,
            _this.shadowMap.maximumDistance,
            0.0,
            new Cesium.Cartesian4()
          );
        },
        shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: function () {
          _this.shadowMap.update(Reflect.get(viewer.scene, '_frameState'));
          var bias = _this.shadowMap._pointBias;
          var scratchTexelStepSize = new Cesium.Cartesian2();
          var texelStepSize = scratchTexelStepSize;
          texelStepSize.x = 1.0 / _this.shadowMap._textureSize.x;
          texelStepSize.y = 1.0 / _this.shadowMap._textureSize.y;
          return Cesium.Cartesian4.fromElements(
            texelStepSize.x,
            texelStepSize.y,
            bias.depthBias,
            bias.normalShadingSmooth,
            new Cesium.Cartesian4()
          );
        }
      }
    });
    this.postStage = viewer.scene.postProcessStages.add(postStage);
  }

  // no use
  drawViewCentrum() {
    const { viewer } = this.prop;

    const scratchRight = new Cesium.Cartesian3();
    const scratchRotation = new Cesium.Matrix3();
    const scratchOrientation = new Cesium.Quaternion();
    const position = this.lightCamera.positionWC;
    const direction = this.lightCamera.directionWC;
    const up = this.lightCamera.upWC;
    let right = this.lightCamera.rightWC;
    right = Cesium.Cartesian3.negate(right, scratchRight);
    let rotation = scratchRotation;
    Cesium.Matrix3.setColumn(rotation, 0, right, rotation);
    Cesium.Matrix3.setColumn(rotation, 1, up, rotation);
    Cesium.Matrix3.setColumn(rotation, 2, direction, rotation);
    let orientation = Cesium.Quaternion.fromRotationMatrix(
      rotation,
      scratchOrientation
    );

    let instance = new Cesium.GeometryInstance({
      geometry: new Cesium.FrustumOutlineGeometry({
        frustum: this.lightCamera.frustum,
        origin: this.viewPosition,
        orientation: orientation
      }),
      id: Math.random().toString(36).substr(2),
      attributes: {
        color: Cesium.ColorGeometryInstanceAttribute.fromColor(
          Cesium.Color.RED
        ),
        show: new Cesium.ShowGeometryInstanceAttribute(true)
      }
    });

    this.frustumOutline = viewer.scene.primitives.add(
      new Cesium.Primitive({
        geometryInstances: [instance],
        appearance: new Cesium.PerInstanceColorAppearance({
          flat: true,
          translucent: false
        })
      })
    );
  }

  //yangw 更改提示线/pyramid颜色
  /* changePyrdColor(color = '#ff00ff') { 放到CallbackProperty里更改，2022/3/3修改，一两周后删除该代码。
        let ColorFromCss = Cesium.Color.fromCssColorString;
        let c = ColorFromCss(color)
        let previousColor = this.pyramid && this.pyramid.ellipsoid.outlineColor.getValue() || Cesium.Color.DODGERBLUE.clone();
        previousColor.red = c.red; previousColor.green = c.green; previousColor.blue = c.blue;
        this.cueLineColor = previousColor;
        if (this.pyramid)
            this.pyramid.ellipsoid.outlineColor.setValue(previousColor);
    } */
  //设置可见区域颜色
  _setVisibleAreaColor() {
    //v_color  (0.96,1.,0.,.5)   inv_color  (0.96,1.,0.,.5)
    let v_color, inv_color;
    let visibleAreaColor = this.visibleAreaColor || Cesium.Color.GREEN;
    let invisibleAreaColor = this.invisibleAreaColor || Cesium.Color.RED;
    let [r1, g1, b1, a1] = [
      visibleAreaColor.red,
      visibleAreaColor.green,
      visibleAreaColor.blue,
      visibleAreaColor.alpha
    ];
    let [r2, g2, b2, a2] = [
      invisibleAreaColor.red,
      invisibleAreaColor.green,
      invisibleAreaColor.blue,
      invisibleAreaColor.alpha
    ];
    a1 = a1 == 0 ? 0 : 0.5;
    a2 = a2 == 0 ? 0 : 0.5;
    v_color = `(${r1.toFixed(2)},${g1.toFixed(2)},${b1.toFixed(2)},${a1.toFixed(
      1
    )})`;
    inv_color = `(${r2.toFixed(2)},${g2.toFixed(2)},${b2.toFixed(
      2
    )},${a2.toFixed(1)})`;
    this.v_color = v_color;
    this.inv_color = inv_color;
    //该方法里设定好 this.v_color和this.inv_color，在_setPostStage方法里会取颜色使用。
  }
  //更改可见/不可见区域颜色
  /*   changeVisibleAreaColor() {
          this.visibleAreaColor = Cesium.Color.YELLOW;
          this.invisibleAreaColor = Cesium.Color.WHITE;
          this._updateViewShed()
      } */
}

/**
 * 日照分析
 * @extends SpatialAnalysis
 * @memberOf SpatialAnalysis
 */
class SunAnalysis extends SpatialAnalysis {
  constructor(prop) {
    prop = prop || {};
    prop.type = 'sun';
    super(prop);
  }

  init() {
    // 时间
    // this.sunTime = { startTime: undefined, endTime: undefined }
    this.sunTime = { startTime: '2020-12-31', endTime: '2021-01-01' };

    const { viewer } = this.prop;

    let _this = this;
    this._sun = function () {
      let gregorianDate = Cesium.JulianDate.addHours(
        viewer.clock.currentTime,
        8,
        new Cesium.JulianDate()
      );
      gregorianDate = Cesium.JulianDate.toGregorianDate(gregorianDate);
      let ctime =
        twoDigits(gregorianDate.hour) + ':' + twoDigits(gregorianDate.minute);
      //// console.log('currentTime',ctime)
      _this.ctime = ctime;

      _this.isoTime = Cesium.JulianDate.toDate(
        viewer.clock.currentTime.clone()
      );
      if (_this.foo && viewer.clock.shouldAnimate) _this.foo();

      function twoDigits(num) {
        return num < 10 ? '0' + num.toString() : num.toString();
      }
    };
  }

  sunStop() {
    const { viewer } = this.prop;
    viewer.clock.shouldAnimate = false;
    viewer.clock.onTick.removeEventListener(this._sun);
  }

  /**
   * 开始分析
   * @param flag {boolean} 开始/清除
   */
  start(flag) {
    const { viewer } = this.prop;

    if (flag) {
      let a = Cesium.JulianDate.fromDate(new Date(this.sunTime.startTime));
      let b = Cesium.JulianDate.fromDate(new Date(this.sunTime.endTime));
      //加上判断，起点需在终点前。
      let check;
      check = Cesium.JulianDate.compare(b, a);
      if (check <= 0) {
        console.error('时间设置失败，起点需在终点前');
        return;
      }

      viewer.clock.startTime = a;
      viewer.clock.currentTime = a;
      viewer.clock.stopTime = b;
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
      viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER;
      this.sunStop();
      viewer.clock.shouldAnimate = true;
      viewer.clock.onTick.addEventListener(this._sun);
    } else {
      this.clear();
    }
  }

  clear() {
    this.sunStop();
  }

  destroy() {}

  /**
   * 设置时间
   * @param timeObject {object} 时间参数
   * @param timeObject.start {datetime} 开始时间
   * @param timeObject.end {datetime} 结束时间
   */
  setTime(timeObject) {
    const { start, end } = timeObject || {};
    start && (this.sunTime.startTime = start);
    end && (this.sunTime.endTime = end);
    // console.log('time set ok ')
  }

  /**
   * 设置地形阴影
   * @param flag {boolean} 打开/关闭
   */
  setTerrainShade(flag) {
    const { viewer } = this.prop;

    viewer.scene.globe.shadows = flag
      ? Cesium.ShadowMode.ENABLED
      : Cesium.ShadowMode.DISABLED;
  }

  /**
   * 设置阴影模式
   * @param flag {boolean} 打开/关闭
   */
  setShadowMode(flag) {
    const { viewer } = this.prop;

    viewer.shadows = !!flag;
    viewer.scene.globe.enableLighting = !!flag;
  }

  /**
   * 设置时间乘数（流逝速度）
   * @param multiplier 时间乘数
   * @param flag true时，=+multiplier；false时，=multiplier
   * @returns {number}
   */
  setTimeMultiplier(multiplier, flag) {
    const { viewer } = this.prop;

    if (flag) {
      viewer.clock.multiplier += multiplier;
    } else {
      viewer.clock.multiplier = multiplier;
    }
    //展示数据【时间速率】
    // // console.log(viewer.clock.multiplier)

    return viewer.clock.multiplier;
  }
}

/**
 * 控高分析
 * @extends SpatialAnalysis
 * @memberOf SpatialAnalysis
 */
class ControlHeightAnalysis extends SpatialAnalysis {
  constructor(prop) {
    prop = prop || {};
    prop.type = 'height';
    prop.drawConfig = { hasEdit: false }; //.config.isSameHeight
    super(prop);
  }

  init() {
    this.entityLabel = null;
    this.curEnt = null;
    this.warningShow = true;
    this.drawControl.on(EditStart, (e) => {
      this.curEnt = e.entity;
    });
    this.drawControl.on(EditMovePoint, (e) => {
      const extrudedHeight =
        e.entity.polygon.extrudedHeight &&
        e.entity.polygon.extrudedHeight.getValue();
      this.addLabel(e.entity, extrudedHeight);
      this.addWarningVolumn(e.entity);
    });
    this.drawControl.on(EditStop, (e) => {
      this.curEnt = e.entity;
    });
    // 右键移除主体要素时，同时清除相关要素。
    this.drawControl.on('delete-feature', (entity) => {
      if (entity._name === 'controlMajor') {
        this.clear();
      }
    });
  }

  addLabel(entity, pol_height) {
    //其实各个高度在entity里都有了，所以不必传。
    // console.log('add label')
    entity = entity || this.curEnt;
    const { dataSource } = this.prop;

    let pos = entity.polygon.hierarchy.getValue().positions;
    //立方体顶面海拔高度为立方体选点中的的最低(后来改成了最高)海拔高度 加 立方体高度
    // let label_height = getMaxHeight(pos) + parseFloat(pol_height) 原先顶面高度这样求。 但是，当编辑底面节点（拉高）后，求值就出错。
    let label_height =
      entity.polygon.extrudedHeight && entity.polygon.extrudedHeight.getValue();
    let height1 = label_height.toFixed(2);
    /* let height2 = (label_height - pol_height).toFixed(2) */
    let height2 = getMaxHeight(pos);
    let text = '海拔高度：' + height1 + '米\n' + '地坪高度：' + height2 + '米';
    this.height1 = height1;
    this.height2 = height2;
    //求中心点
    let polygon = toGeoJSON(entity);
    let center = turf.centerOfMass(polygon);

    if (
      center == null ||
      center.geometry == null ||
      center.geometry.coordinates == null ||
      center.geometry.coordinates.length < 2
    )
      return;

    let ptcenter = Cesium.Cartesian3.fromDegrees(
      center.geometry.coordinates[0],
      center.geometry.coordinates[1],
      label_height + 20
    );

    this._removeLabel();
    this.entityLabel = dataSource.entities.add({
      position: ptcenter,
      label: {
        text: text,
        scale: 0.6,
        font: '30px 楷体',
        showBackground: true,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND, //CLAMP_TO_GROUND RELATIVE_TO_GROUND,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0.0,
          5000
        ),
        disableDepthTestDistance: 5000
      }
    });
  }
  /**添加在控高区域上方的红色警示体 */
  addWarningVolumn(entity) {
    const { viewer } = this.prop;
    viewer.scene.primitives.remove(this.primitive);
    this.primitive = null;
    const extrudedHeight = entity._attribute.style.extrudedHeight;
    //extrudedHeight2不同于1，是因为extrudedReference是none。即大地椭球面。
    const extrudedHeight2 =
      entity.polygon.extrudedHeight && entity.polygon.extrudedHeight.getValue();
    let positions = entity.polygon.hierarchy.getValue().positions;
    let p_copy = [];
    positions.forEach((value, index) => {
      p_copy[index] = value.clone();
    });

    //let bottomHeight = getMaxHeight(p_copy)

    let polygon = new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(positions),
      extrudedHeight: 400,
      height: extrudedHeight2 //bottomHeight + extrudedHeight
    });
    //就下面这句。 导致要素贴地。
    let geometry = Cesium.PolygonGeometry.createGeometry(polygon);

    p_copy.forEach((value, index) => {
      entity._positions_draw[index] = value.clone();
      entity.editing._positions_draw[index] = value.clone();
    });
    this.primitive = viewer.scene.primitives.add(
      new Cesium.ClassificationPrimitive({
        show: this.warningShow,
        geometryInstances: new Cesium.GeometryInstance({
          geometry: geometry,
          attributes: {
            color: Cesium.ColorGeometryInstanceAttribute.fromColor(
              Cesium.Color.fromCssColorString('#f00f').withAlpha(0.5)
            ),
            show: new Cesium.ShowGeometryInstanceAttribute(true)
          }
        }),
        asynchronous: false,
        classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
      })
    );
  }
  /**控制警示体的显隐 */
  setWarningShow(v = true) {
    this.warningShow = v;
    if (this.primitive) {
      this.primitive.show = v;
    }
  }
  /**
   * 开始分析
   * @param flag 开始/清除
   */
  start(flag) {
    const { viewer } = this.prop;
    const extrudedHeight = this.extrudedHeight || 30;
    if (flag) {
      this.drawControl.hasEdit(true);
      this.drawControl.startDraw({
        type: 'polygon',
        name: 'pol',
        style: { color: '#0047ab', opacity: 0.6, extrudedHeight },
        //config: { isSameHeight: true },
        success: (entity) => {
          entity.name = 'controlMajor';
          this.addLabel(entity, extrudedHeight);
          this.addWarningVolumn(entity);
        }
      });
    } else {
      this.clear();
    }
  }

  _removeLabel() {
    const { dataSource } = this.prop;
    this.entityLabel && dataSource.entities.remove(this.entityLabel);
  }

  clear() {
    const { viewer } = this.prop;
    this.drawControl.hasEdit(false); //关闭该类的鼠标监听，性能回收。
    this._removeLabel();
    this.clearDraw();
    this.curEnt = null;
    viewer.scene.primitives.remove(this.primitive);
    this.primitive = null;
  }

  destroy() {
    this.clear();
  }

  /**
   * 获取当前高度
   * @return {number}
   */
  getHeight() {
    if (this.curEnt) {
      return this.curEnt.polygon.extrudedHeight;
    } else {
      // console.log('please start first')
    }
  }

  /**
   * 设置高度
   * @param height {number} 高度
   */
  setHeight(height) {
    // console.log(height)
    if (this.curEnt) {
      if (Cesium.defined(height) && typeof height === 'number') {
        // this.curEnt.polygon.extrudedHeight = height//这一句有问题。。。。。。。。。。。。。。。。。。。。。
        let dif = height - this.curEnt._attribute.style.extrudedHeight;
        this.curEnt._attribute.style.extrudedHeight = height; //改成这样。
        this.curEnt.polygon.extrudedHeight =
          this.curEnt.polygon.extrudedHeight + dif;
        this.addLabel(null, height);
        this.addWarningVolumn(this.curEnt);
      } else {
        console.warn('param [height] should be [number]');
      }
    }
  }
}

/**
 * 地形分析
 * @extends SpatialAnalysis
 * @memberOf SpatialAnalysis
 */
class TerrainAnalysis extends SpatialAnalysis {
  constructor(prop) {
    prop = prop || {};
    prop.type = 'terrain';
    prop.drawConfig = { hasEdit: false };
    super(prop);
  }

  init() {
    let positions = Cesium.Cartesian3.fromDegreesArray([
      120, 30, 120.001, 30, 120.001, 30.001, 120, 30.001
    ]);
    this._smallRegion = new Cesium.PolygonHierarchy(positions);

    this.drawControl.on(DrawAddPoint, (e) => {
      //当绘制时，删除上一图形。

      if (e.positions.length == 1) {
        //该处即绘制第一点之时。（例外：删除点，至点数为1.）
        let arr = this.drawControl.dataSource.entities.values;
        let entities = this.drawControl.dataSource.entities;
        let id = e.entity.id;
        arr.forEach((e) => {
          if (e.id != id) entities.remove(e);
        });
      }
    });
    /*  this.drawControl.on(DrawAddPoint, (e) => {//当绘制时，删除上一图形。
             return
             if (e.positions.length == 1) {
                 //该处即绘制第一点之时。（例外：删除点，至点数为1.）
                 let arr = this.drawControl.dataSource.entities.values;
                 let entities = this.drawControl.dataSource.entities
                 let id = e.entity.id;
                 arr.forEach((e) => {
                     if (e.id != id) entities.remove(e)
                 })
             }

         }) */

    /* this.drawControl.on(DrawCreated, (e) => {
            let en = e.entity;
            let color = en.polygon.material.color.getValue();
            color.alpha = 0;
            en.polygon.material.color.setValue(color);

            // console.log('draw-created', en)
            let globe = this.prop.viewer.scene.globe;
            let hierarchy = en.polygon.hierarchy.getValue();
            // console.log('hierarchy',hierarchy)
            if (Cesium.defined(globe.material)) {
                globe.material.regionPolygons = new Cesium.RegionPolygonCollection({
                    polygons: [hierarchy],
                    enabled: true,
                });
            }
        }) */
    /* this.drawControl.on(DrawCreated, (e) => {
            setTimeout(() => {
                this.drawPolygon();
            }, 200);
        }) */

    this.contourWidth = 2; // 等高线宽度(px) 值 > 0；参考区间 (0, 10]
    this.contourSpacing = 50; // 等高线间距 > 值 > 0；参考区间 (0, 300]
    this._terrainLegend = {
      elevation: undefined,
      slope: undefined,
      aspect: undefined
    }; // 图例

    this._terrainLegendSample = {
      slope: {
        stop: [0, 2, 6, 15, 25],
        color: ['#55e700', '#fffb00', '#ffd992', '#ffb600', '#ff2500'],
        unit: '(单位：度)'
      },
      aspect: {
        stop: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1.0],
        color: [
          '#34AF00',
          '#AAFF14',
          '#AEE900',
          '#E9E932',
          '#E9E990',
          '#FFAA00',
          '#FF780A',
          '#FF320A',
          '#f00'
        ],
        unit: '',
        direction: [
          '北',
          '西北',
          '西',
          '西南',
          '南',
          '东南',
          '东',
          '东北',
          '北'
        ]
      },
      elevation: {
        stop: [0.0, 0.045, 0.1, 0.15, 0.37, 0.54, 1.0],
        color: [
          '#000000',
          '#2747E0',
          '#D33B7D',
          '#D33038',
          '#FF9742',
          '#ffd700',
          '#ffffff'
        ],
        unit: '(单位：米)'
      }
    };

    this._material = {
      getElevationContourMaterial: () =>
        new Cesium.Material({
          fabric: {
            type: 'ElevationColorContour',
            materials: {
              contourMaterial: { type: 'ElevationContour' },
              elevationRampMaterial: { type: 'ElevationRamp' }
            },
            components: {
              diffuse:
                'contourMaterial.alpha == 0.0 ? elevationRampMaterial.diffuse : contourMaterial.diffuse',
              alpha: 'max(contourMaterial.alpha, elevationRampMaterial.alpha)'
            }
          },
          translucent: false
        }),
      getSlopeContourMaterial: () =>
        new Cesium.Material({
          fabric: {
            type: 'SlopeColorContour',
            materials: {
              contourMaterial: { type: 'ElevationContour' },
              slopeRampMaterial: { type: 'SlopeRamp' }
            },
            components: {
              diffuse:
                'contourMaterial.alpha == 0.0 ? slopeRampMaterial.diffuse : contourMaterial.diffuse',
              alpha: 'max(contourMaterial.alpha, slopeRampMaterial.alpha)'
            }
          },
          translucent: false
        }),
      getAspectContourMaterial: () =>
        new Cesium.Material({
          fabric: {
            type: 'AspectColorContour',
            materials: {
              contourMaterial: { type: 'ElevationContour' },
              aspectRampMaterial: { type: 'AspectRamp' }
            },
            components: {
              diffuse:
                'contourMaterial.alpha == 0.0 ? aspectRampMaterial.diffuse : contourMaterial.diffuse',
              alpha: 'max(contourMaterial.alpha, aspectRampMaterial.alpha)'
            }
          },
          translucent: false
        })
    };
  }

  /**
   * 开始分析
   * @param terrainOption { object} 地形选项，参考=>{@link https://sandcastle.cesium.com/?src=Globe%20Materials.html}
   */
  start(terrainOption) {
    this.updateMaterial(terrainOption);
  }

  /**
   * 设置地图图例
   * @param type {string} enum(['elevation','slope','aspect'])
   * @param legend {object} 图例配置文件
   */
  setLegend(type, legend) {
    let clone = JSON.parse(JSON.stringify(legend));
    this._terrainLegend[type] = clone;
  }

  drawPolygon() {
    //注意绘制行为的取消。
    // console.log('drawPolygon()');
    let self = this;
    const style = {
      fill: true,
      fillType: 'color',
      color: '#ffff00',
      opacity: 0.6,
      /*  outline: true, */ outlineWidth: 3,
      outlineColor: '#0dd624',
      outlineOpacity: 0.6,
      clampToGround: true
    };
    //this.drawControl.hasEdit(true)
    const calbackdel = function (entity) {
      let id = entity.id;
      let globe = self.prop.viewer.scene.globe;
      if (Cesium.defined(globe.material)) {
        let hierarchys = globe.material.regionPolygons._polygons.map((e) => {
          if (e._polygonHierarchy.id !== id) return e._polygonHierarchy;
        });
        globe.material.regionPolygons = new Cesium.RegionPolygonCollection({
          polygons: hierarchys,
          enabled: true
        });
        self.hierarchys = hierarchys;
      }
    };
    this.drawControl.startDraw({
      type: 'polygon',
      style,
      success: (e) => {
        let en = e;
        let color = en.polygon.material.color.getValue();
        color.alpha = 0;
        en.polygon.material.color.setValue(color);
        let globe = this.prop.viewer.scene.globe;
        let hierarchy = en.polygon.hierarchy.getValue();
        if (Cesium.defined(globe.material)) {
          let hierarchys = globe.material.regionPolygons._polygons.map(
            (e) => e._polygonHierarchy
          );
          hierarchy.id = en.id;
          hierarchys.push(hierarchy);
          globe.material.regionPolygons = new Cesium.RegionPolygonCollection({
            polygons: hierarchys,
            enabled: true
          });
          this.hierarchys = hierarchys;
        }
      }
    });
  }
  /**
   * 可手动调用，刷新地形材质
   * @param obj {object} 地形配置
   */
  updateMaterial(obj) {
    // console.log('updateMaterial()')
    const { viewer } = this.prop;

    let {
      shadingUniforms = {},
      hasContour = false,
      selectedShading,
      minHeight = -414,
      maxHeight = 8777,
      contourWidth = 2,
      contourSpacing = 50,
      contourColor = Cesium.Color.RED.clone()
    } = obj || {};
    let globe = viewer.scene.globe,
      material,
      contourUniforms;
    if (hasContour) {
      if (selectedShading === 'elevation') {
        material = this._material.getElevationContourMaterial();
        shadingUniforms = material.materials.elevationRampMaterial.uniforms;
        shadingUniforms.minimumHeight = minHeight;
        shadingUniforms.maximumHeight = maxHeight;
        contourUniforms = material.materials.contourMaterial.uniforms;
      } else if (selectedShading === 'slope') {
        material = this._material.getSlopeContourMaterial();
        shadingUniforms = material.materials.slopeRampMaterial.uniforms;
        contourUniforms = material.materials.contourMaterial.uniforms;
      } else if (selectedShading === 'aspect') {
        material = this._material.getAspectContourMaterial();
        shadingUniforms = material.materials.aspectRampMaterial.uniforms;
        contourUniforms = material.materials.contourMaterial.uniforms;
      } else {
        material = Cesium.Material.fromType('ElevationContour');
        contourUniforms = material.uniforms;
      }
      contourUniforms.width = contourWidth;
      contourUniforms.spacing = contourSpacing;
      contourUniforms.color = contourColor;
    } else if (selectedShading === 'elevation') {
      material = Cesium.Material.fromType('ElevationRamp');
      shadingUniforms = material.uniforms;
      shadingUniforms.minimumHeight = minHeight;
      shadingUniforms.maximumHeight = maxHeight;
    } else if (selectedShading === 'slope') {
      material = Cesium.Material.fromType('SlopeRamp');
      shadingUniforms = material.uniforms;
    } else if (selectedShading === 'aspect') {
      material = Cesium.Material.fromType('AspectRamp');
      shadingUniforms = material.uniforms;
    }
    if (selectedShading && selectedShading !== 'none') {
      shadingUniforms.image = this._getImage(selectedShading);
    }
    globe.material = material;

    if (Cesium.defined(globe.material) && selectedShading != 'none') {
      globe.material.regionPolygons = new Cesium.RegionPolygonCollection({
        polygons: this.hierarchys, //new Cesium.PolygonHierarchy(positions0)
        enabled: this.regionPolygonsEnabled
      });
    }
  }

  clear() {
    this.updateMaterial({ hasContour: false, selectedShading: 'none' });
    this._terrainLight(false);
    this.drawControl.clearDraw();
    this.drawControl.hasEdit(false);
  }

  destroy() {}

  _customColorRamp(legendCfg) {
    if (legendCfg.unit == '(单位：度)' || legendCfg.unit == '(单位：米)') {
      //更改了坡度的色带stop设置。
      let ddd = this._customColorRamp2(legendCfg);
      return ddd;
    }
    let ramp = document.createElement('canvas');
    ramp.width = 100;
    ramp.height = 1;
    let ctx = ramp.getContext('2d');
    let grd = ctx.createLinearGradient(0, 0, 100, 0);
    let { stop, color } = legendCfg;
    const max = stop[stop.length - 1];
    let alpha = legendCfg.opacity === undefined ? 0.6 : legendCfg.opacity;
    // if(alpha)
    let ColorFromCss = Cesium.Color.fromCssColorString;
    for (let i in color) {
      if (color.hasOwnProperty(i)) {
        let co = ColorFromCss(color[i]);
        let opacity = co.alpha;
        if (opacity !== 0) co = co.withAlpha(alpha);
        color[i] = co.toCssHexString();
      }
    }
    color[8] = color[0]; //坡向的特异在于0和360相等，其形成环。
    for (let i in stop) {
      if (stop.hasOwnProperty(i)) {
        let value = stop[i] / max;
        //原先当作0为北。后来发现0是东。所以+0.25来修改。
        let v = value + 0.25;
        v = v > 1 ? v - 1 : v;
        grd.addColorStop(v, color[i]);
      }
    }
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 100, 1);
    return ramp;
  }
  _customColorRamp2(legendCfg) {
    let ColorFromCss = Cesium.Color.fromCssColorString;
    //legendCfg.stop ==[33, 43.5, 54, 64.5, 75],即表示坡度从33°起，至75°终。 之外的不显示（透明显示）。
    // let num = legendCfg.unit == '(单位：度)' ? 1 / 90 : 1 / 8777;
    let ramp = document.createElement('canvas');
    ramp.width = 100;
    ramp.height = 1;
    let ctx = ramp.getContext('2d');
    let grd = ctx.createLinearGradient(0, 0, 100, 0);
    let { stop, color } = legendCfg; //[33, 43.5, 54, 64.5, 75]
    stop = JSON.parse(JSON.stringify(stop));
    color = JSON.parse(JSON.stringify(color));
    let alpha = legendCfg.opacity || 0.6;
    for (let i in color) {
      if (color.hasOwnProperty(i)) {
        let c = ColorFromCss(color[i]).withAlpha(alpha);
        color[i] = c.toCssHexString();
      }
    }
    if (legendCfg.unit == '(单位：度)') {
      stop = stop.map((e) => e / 90); //[0.36666666666666664, 0.48333333333333334, 0.6, 0.7166666666666667, 0.8333333333333334]
    } else {
      stop = stop.map((e) => (e + 395) / 8777); //高度的函数关系仍需寻找。
    }

    // const max = 100//stop[stop.length - 1]
    grd.addColorStop(0, '#0000');
    grd.addColorStop(1, '#0000');
    stop.unshift(stop[0]);
    stop.push(stop[stop.length - 1]);

    color.unshift(ColorFromCss(color[0]).withAlpha(0).toCssHexString());
    color.push(
      ColorFromCss(color[color.length - 1])
        .withAlpha(0)
        .toCssHexString()
    );
    //要保持范围外可见（完全透明），就应该color数组两端透明度为0

    for (let i in stop) {
      if (stop.hasOwnProperty(i)) {
        let value = stop[i];
        // console.log(value, color[i])
        grd.addColorStop(value, color[i]);
      }
    }
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, 100, 1);
    return ramp;
  }

  _getImage(selectedShading) {
    const LEGEND_CFG = {
      elevation: [0.0, 0.045, 0.1, 0.15, 0.37, 0.54, 1.0],
      slope: [0.0, 0.29, 0.5, Math.sqrt(2) / 2, 0.87, 0.91, 1.0],
      aspect: [0.0, 0.2, 0.4, 0.6, 0.8, 0.9, 1.0]
    };

    function getColorRamp(selectedShading) {
      const ramp = document.createElement('canvas');
      ramp.width = 100;
      ramp.height = 1;
      const ctx = ramp.getContext('2d');
      const grd = ctx.createLinearGradient(0, 0, 100, 0);
      const values = LEGEND_CFG[selectedShading];
      grd.addColorStop(values[0], '#000000'); //black
      grd.addColorStop(values[1], '#2747E0'); //blue
      grd.addColorStop(values[2], '#D33B7D'); //pink
      grd.addColorStop(values[3], '#D33038'); //red
      grd.addColorStop(values[4], '#FF9742'); //orange
      grd.addColorStop(values[5], '#ffd700'); //yellow
      grd.addColorStop(values[6], '#ffffff'); //white
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 100, 1);
      return ramp;
    }

    return this._terrainLegend[selectedShading]
      ? this._customColorRamp(this._terrainLegend[selectedShading])
      : getColorRamp(selectedShading);
  }

  /** 打开地形阴影，光照渲染 */
  _terrainLight(flag) {
    const { viewer } = this.prop;

    viewer.scene.globe.enableLighting = !!flag;
    if (flag) {
      viewer.scene.light = new Cesium.DirectionalLight({
        direction: viewer.scene.camera.directionWC
      });
      viewer.scene.globe.dynamicAtmosphereLighting = false;
    } else {
      viewer.scene.light = new Cesium.SunLight();
      viewer.scene.globe.dynamicAtmosphereLighting = true;
      viewer.scene.globe.dynamicAtmosphereLightingFromSun = false;
    }
  }
}

class WaterObj {
  constructor(prop) {
    prop = prop || {};
    this.entities = []; //用于存放popup的entity。
    this.water = prop.water;
    this.waters = prop.waters;
    this.positions = prop.positions;
    this.waterObjs = prop.waterObjs;
    this.dataSource = prop.dataSource;
    this.floodInstance = prop.floodInstance; //把淹没分析的实例传过来，以供调用测水深的方法。
  }
  changeFlood({ height, color }) {
    //修改洪水的高度、颜色。
    if (this.positions && this.waters && this.water) {
      this.clearpropup();
      let id = this.water.id;
      let guid = this.water.geometryInstances.id;
      let polygonPrimitive;
      if (!Cesium.defined(height)) {
        polygonPrimitive = this.water.geometryInstances;
      } else {
        let polygonWithHole = new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(this.positions),
          extrudedHeight: height
        });
        polygonPrimitive = new Cesium.GeometryInstance({
          geometry: polygonWithHole,
          id: guid, //chinaocean
          attributes: {
            color: new Cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.5)
          }
        });
      }
      let appearance;
      if (!color) {
        appearance = this.water.appearance;
      } else {
        console.log('target');
        color = color === '' ? '#5e7666' : color;
        let color_mid = Cesium.Color.fromCssColorString(color);
        if (color_mid.alpha === 1) color_mid = color_mid.withAlpha(0.8);
        this.baseWaterColor = color_mid;
        let watermaterial = new Cesium.Material({
          fabric: {
            type: 'Water',
            uniforms: {
              baseWaterColor: color_mid,
              blendColor: Cesium.Color.SKYBLUE,
              normalMap: PNG,
              frequency: 2000,
              animationSpeed: 0.01,
              amplitude: 10.0,
              specularIntensity: 2,
              fadeFactor: 2.0
            }
          }
        });
        appearance = new Cesium.EllipsoidSurfaceAppearance({
          material: watermaterial
        });
      }
      this.waters.remove(this.water);
      this.water = this.waters.add(
        new Cesium.Primitive({
          geometryInstances: polygonPrimitive,
          appearance: appearance,
          releaseGeometryInstances: false
        })
      );
      this.water.id = id;
    }
  }
  //可以完全被上面的方法取代。
  setHeight(height) {
    if (this.positions && this.waters && this.water) {
      this.clearpropup();
      let id = this.water.id;
      let guid = this.water.geometryInstances.id;
      let polygonWithHole = new Cesium.PolygonGeometry({
        polygonHierarchy: new Cesium.PolygonHierarchy(this.positions),
        extrudedHeight: height
      });
      let polygonPrimitive = new Cesium.GeometryInstance({
        geometry: polygonWithHole,
        id: guid, //"chinaocean",
        attributes: {
          color: new Cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.5)
        }
      });

      let appearance = this.water.appearance;
      this.waters.remove(this.water);
      this.water = this.waters.add(
        new Cesium.Primitive({
          geometryInstances: polygonPrimitive,
          appearance: appearance,
          releaseGeometryInstances: false
        })
      );
      this.water.id = id;
    }
  }
  _clearWater() {
    this.waters.remove(this.water);
    let arr = this.waterObjs;
    let guid = this.water.geometryInstances.id;
    //同时水体objs里移除该obj
    let index = arr.findIndex((e) => {
      return e.water.geometryInstances.id == guid;
    });
    arr.splice(index, 1);
    this.water = null;
  }
  clearpropup() {
    const dataSource = this.dataSource;
    let arr = this.entities;
    arr.forEach((e) => {
      dataSource.entities.remove(e);
    });
    this.entities = [];
  }
  clearAll() {
    this._clearWater();
    this.clearpropup();
    this.water = null;
    this.waters = null;
    this.positions = null;
    this.waterObjs = null;
  }
}
/**
 * 淹没分析
 * @extends SpatialAnalysis
 * @memberOf SpatialAnalysis
 */
class FloodAnalysis extends SpatialAnalysis {
  constructor(prop) {
    prop = prop || {};
    prop.type = 'flood';
    prop.drawConfig = true;
    super(prop);
  }
  init() {
    // console.log('flood init')
    this.oceanPrimitive = null;
    this.positions = null;
    this.height = 50;
    this.color = '#5e7666'; //  bf9345
    this.prop.ellipsoid = this.prop.viewer.scene.globe.ellipsoid;
    this.prop.waters = new Cesium.PrimitiveCollection(); //存储水域的primitive
    this.prop.waterObjs = []; //存储水域的对象。
    this.prop.viewer.scene.primitives.add(this.prop.waters);
    const popup = new PointPopup(this.prop.viewer);
    popup._isOnly = false;
    this.prop.popup = popup;
  }

  _getWindowPosition(position) {
    const { viewer } = this.prop;
    const windowCoordinates =
      viewer.scene.cartesianToCanvasCoordinates(position);
    return viewer.scene.globe.pick(
      viewer.camera.getPickRay(windowCoordinates),
      viewer.scene
    );
  }
  /** 设置水面材质:颜色 高度 */
  setWaterProp({ height, color }) {
    const { waterObjs } = this.prop;
    if (Cesium.defined(height)) {
      this.height = height;
    }
    if (Cesium.defined(color)) {
      this.color = color;
    }
    waterObjs.forEach((e) => {
      e.changeFlood({ height, color });
    });
  }
  /**
   * 设置水面高度
   * @param height {number} 高度
   */
  setHeight(height) {
    const { waterObjs } = this.prop;
    if (Cesium.defined(height) && typeof height === 'number') {
      this.height = height;
      // console.log('set height ok')
      waterObjs.forEach((e) => {
        e.setHeight({ height });
      });
    } else {
      console.warn('param [height] should be [number]');
    }

    /*  // todo positions是否规范
         if (this.positions) {
             this._addFlood()
         } */
  }

  floodDraw(option) {
    let { ellipsoid } = this.prop;
    //  this.clear()
    option = option || {};
    const {
      style = {
        color: '#0047ab',
        opacity: 0.6,
        extrudedHeight: this.height
      }
    } = option || {};
    this.drawControl.startDraw({
      type: 'polygon',
      style,
      success: (e) => {
        let positions = e.polygon.hierarchy.getValue().positions;
        /**begin设定法线方向。*/
        let polygon = toGeoJSON(e);
        let center = turf.centerOfMass(polygon);
        let co = center.geometry.coordinates;
        let p = Cesium.Cartesian3.fromDegrees(co[0], co[1]);
        let normal = ellipsoid.geodeticSurfaceNormal(p, new Ct3());
        this.prop.normal = normal;
        let h = getMaxHeight(e._positions_draw);
        this.height = h + 50;
        /**end设定法线方向。*/
        this.clearDraw();
        this._addFlood({ positions });
      }
    });
  }
  /**
   * 直接传入水域范围生成洪水
   *  * @param  positions  位置 接受四种形式。 [120,30] || [120.0, 30.0, 120.1, 30.0, 120.1, 30.1] || 笛卡尔数组 || 单点笛卡尔
   *  * @param  height = 50||[500,600,1000,700] 洪水高度 多个多边形即传数组
   *  * @param  radius = 100 洪水半径（当传入单点时生效）
   */

  generateFlood(
    positions = [120.0, 30.0, 120.1, 30.0, 120.1, 30.1, 120.0, 30.1],
    height = 50,
    radius = 100,
    name = '水面-1'
  ) {
    this.height = height;
    let { ellipsoid } = this.prop;
    let isArr = positions instanceof Array;
    let result;
    if (isArr) {
      if (positions[0] instanceof Cesium.Cartesian3) {
        result = positions;
      } else if (positions[0] instanceof Array) {
        return;
      } else if (typeof positions[0] == 'number' && !isNaN(positions[0])) {
        let length = positions.length / 2;
        if (length >= 2) {
          let ps = Cesium.Cartesian3.fromDegreesArray(positions);
          result = ps;
        } else {
          var point = t_point(positions);
          var buffered = buffer(point, radius, { units: 'meters' });
          if (!buffered) return; //当半径为0，直接返回，即不创建水域 。
          let coords = buffered.geometry.coordinates[0];
          coords.pop();
          // console.log('观察根据点和半径生成的圆', coords)
          let ps = coords.map((e) => {
            return Cesium.Cartesian3.fromDegrees.apply(null, e);
          });
          result = ps;
        }
      }
    } else if (positions instanceof Cesium.Cartesian3) {
      let lonlat = Utils.cartesianToLonLatHeight(positions);
      lonlat.length = 2;
      var point = t_point(lonlat);
      var buffered = buffer(point, radius, { units: 'meters' });
      if (!buffered) return;
      let coords = buffered.geometry.coordinates[0];
      coords.pop();
      let ps = coords.map((e) => {
        return Cesium.Cartesian3.fromDegrees.apply(null, e);
      });
      result = ps;
    }

    let p = result[0];
    let normal = ellipsoid.geodeticSurfaceNormal(p, new Ct3());
    this.prop.normal = normal;

    let waterObj = this._addFlood({ positions: result, name: name });
    return waterObj;
  }
  generateFlood_copy(
    positions = [120.8788, 29.999],
    height = 50,
    radius = 100
  ) {
    this.height = height;
    let { ellipsoid } = this.prop;
    let isArr = positions instanceof Array;
    let result;
    if (isArr) {
      if (positions[0] instanceof Cesium.Cartesian3) {
        result = positions;
      } else if (positions[0] instanceof Array) {
        let ps = positions.map((e) => {
          return Cesium.Cartesian3.fromDegrees.apply(null, e);
        });
        result = ps;
      } else if (!isNaN(positions[0])) {
        var point = t_point(positions);
        var buffered = buffer(point, radius, { units: 'meters' });
        if (!buffered) return; //当半径为0，直接返回，即不创建水域 。
        let coords = buffered.geometry.coordinates[0];
        coords.pop();
        let ps = coords.map((e) => {
          return Cesium.Cartesian3.fromDegrees.apply(null, e);
        });
        result = ps;
      }
    } else if (positions instanceof Cesium.Cartesian3) {
      let lonlat = Utils.cartesianToLonLatHeight(positions);
      lonlat.length = 2;
      var point = t_point(lonlat);
      var buffered = buffer(point, radius, { units: 'meters' });
      if (!buffered) return;
      let coords = buffered.geometry.coordinates[0];
      coords.pop();
      let ps = coords.map((e) => {
        return Cesium.Cartesian3.fromDegrees.apply(null, e);
      });
      result = ps;
    }

    let p = result[0];
    let normal = ellipsoid.geodeticSurfaceNormal(p, new Ct3());
    this.prop.normal = normal;

    let waterObj = this._addFlood({ positions: result });
    return waterObj;
  }

  /**
   * 开始分析
   * @param flag {boolean} 开始/关闭
   */
  start(flag) {
    if (flag) {
      this.floodDraw();
    } else {
      this.clear();
    }
  }

  _addFlood(option) {
    const { waters, waterObjs, dataSource } = this.prop;

    const { positions, height = this.height, name } = option || {};
    let { color = this.color } = option || {};
    color = color === '' ? '#5e7666' : color;
    let polygonWithHole = new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy(positions),
      extrudedHeight: height
      //height: height
    });
    // let chinaocean = Cesium.PolygonGeometry.createGeometry(polygonWithHole);
    let color_mid = Cesium.Color.fromCssColorString(color);
    if (color_mid.alpha == 1) color_mid = color_mid.withAlpha(0.8);

    let watermaterial = new Cesium.Material({
      fabric: {
        type: 'Water',
        uniforms: {
          baseWaterColor: color_mid,
          blendColor: Cesium.Color.SKYBLUE,
          normalMap: PNG,
          frequency: 2000,
          animationSpeed: 0.01,
          amplitude: 10.0,
          specularIntensity: 2,
          fadeFactor: 2.0
        }
      }
    });
    let polygonPrimitive = new Cesium.GeometryInstance({
      geometry: polygonWithHole,
      id: Cesium.createGuid(), //chinaocean
      attributes: {
        color: new Cesium.ColorGeometryInstanceAttribute(0.0, 1.0, 1.0, 0.5)
      }
    });

    //  viewer.scene.primitives.remove(this.oceanPrimitive)
    let id = Cesium.createGuid();
    let water = waters.add(
      new Cesium.Primitive({
        geometryInstances: polygonPrimitive,
        appearance: new Cesium.EllipsoidSurfaceAppearance({
          material: watermaterial
        }),
        releaseGeometryInstances: false
      })
    );
    water.id = name;
    let waterObj = new WaterObj({
      water,
      waters,
      waterObjs,
      positions,
      dataSource,
      floodInstance: this
    });
    waterObjs.push(waterObj);
    return waterObj;
  }
  /**
   * 移除所有特定水体。
   */
  clearWater(water) {
    //fuck, 移除该片水域后，如果该水域上有popup，一并移除。
    const { waters, areas } = this.prop;
    let id = water.id;
    if (areas[id]) delete areas[id];
    waters.remove(water);
  }
  /**
   * 移除所有特定水体。根据水面id删除水面。
   */
  removeWaterById(id) {
    let { waterObjs } = this.prop;
    //每次的e.clearAll()会更改waterObjs，所以搞个克隆数组。
    let clone = [...waterObjs];
    clone.forEach((e) => {
      if (e.water.id == id) {
        e.clearAll();
      }
    });
  }
  clear() {
    this.clearDraw();
    let { dataSource, waters, waterObjs } = this.prop;

    dataSource.entities.removeAll();
    waters.removeAll();
    waterObjs.length = 0;
    this.pickWaterDepth(false); //关闭拾取水深
  }

  destroy() {}

  /**
   * 移除所有信息框。
   */
  removeAllPopup() {
    const { dataSource, popup } = this.prop;
    popup && popup.close();
    dataSource.entities.removeAll();
  }
  /** 拾取水深，鼠标事件的开关 */
  pickWaterDepth(open = true) {
    let handler = this.drawControl.drawCtrl['billboard'].getHandler(); //不放polygon里，因为绘制过程中polygon的另有用处，会被他自己覆盖掉。
    if (!open) {
      handler.removeInputAction(2);
      return;
    }
    const { viewer, normal = new Ct3(), waters, waterObjs } = this.prop;
    let _this = this;
    handler.setInputAction(function (event) {
      //如果未点击到水面区域。
      // console.log('pickWaterDepth')
      let positions = _this.positions;
      if (!waters.length) return;
      let point = getCurrentMousePosition(viewer.scene, event.position);
      if (!point) return; //没点到地球
      let cartographic = Cesium.Cartographic.fromCartesian(point);
      let p_degrees = [
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude)
      ];
      let point_turf = t_point(p_degrees);
      for (let [id, positions] of Object.entries(waterObjs)) {
        positions = positions.positions;
        let lonLats = [];
        for (let p of positions) {
          let a = Utils.cartesianToLonLatHeight(p);
          lonLats.push([a[0], a[1]]);
        }
        let lastP = Utils.cartesianToLonLatHeight(positions[0]);
        lonLats.push([lastP[0], lastP[1]]);
        let polygon_turf = t_polygon([lonLats]);
        let check = booleanContains(polygon_turf, point_turf);
        if (check) {
          _this._sampleWaterDepth(point, id);
          return;
        }
      }
      Message({
        message: '请点击水域范围内',
        type: 'warning'
      });
    }, 2);
  }
  _dP(position) {
    const { dataSource } = this.prop;
    const point = new Cesium.Entity({
      position,
      point: {
        pixelSize: 6
      } /* heightReference: Cesium.HeightReference.CLAMP_TO_GROUND */
    });
    dataSource.entities.add(point);
    return point;
  }
  /** 拾取水深，拾取的具体函数
   * @param point {cartesian3}  取水位点的位置。
   * @param id {boolean} id，决定生成的entity和popup存储在哪一块水域对象里。
   */
  async _sampleWaterDepth(point, id) {
    const { viewer, waters, waterObjs, popup } = this.prop;
    const ellipsoid = viewer.scene.globe.ellipsoid;
    let cartographic = Cesium.Cartographic.fromCartesian(point);

    let normal = ellipsoid.geodeticSurfaceNormal(point, new Ct3());
    let reverseNormal = Ct3.subtract(new Ct3(), normal, new Ct3());
    //射线起点就在模型上，求交结果里还能取到该模型吗？答：取不到
    const ray = new Cesium.Ray(point, reverseNormal);
    let newp = Cesium.Ray.getPoint(ray, -1000, new Ct3());
    ray.origin = newp;

    //ray.getpoint
    let results = await viewer.scene.drillPickFromRayMostDetailed(ray);
    if (results.length) {
      point = results[0].position;
    }
    let tilesets = [],
      ids = [];
    results.forEach((e) => {
      if (
        e.object &&
        e.object.primitive &&
        e.object.primitive instanceof Cesium.Cesium3DTileset
      ) {
        //e包含tileset
        if (!ids.includes(e.object.primitive)) {
          ids.push(e.object.primitive);
          tilesets.push(e.object.primitive);
        }
      }
    });
    /* let copy = viewer.scene.terrainProvider; //基于模型的水深
        viewer.scene.terrainProvider = new Cesium.EllipsoidTerrainProvider({}); */
    //水面高度如果直接去取primitive的gometry里属性，不准确。 涉及到地球曲面。
    let height_water = await viewer.scene.sampleHeightMostDetailed(
      [cartographic],
      tilesets
    );
    height_water = height_water[0].height;

    /*  height_water = height_water<_this.height?
         // console.log('判断水面高度是否就是海拔',height_water,_this.height) */

    let excludes = waters._primitives;
    if (this.pick_method == 'ground') excludes = excludes.concat(tilesets);
    else if (this.pick_method == 'model') {
      /* 剔去方法仍待找寻 */
    } //剔去地形。
    let height_bottom = await viewer.scene.sampleHeightMostDetailed(
      [cartographic],
      excludes
    );
    height_bottom = height_bottom[0].height || 0; //既没交到模型，又没交到地形，就会是undefined
    //当水面高度小于等于地面高度时
    // height_water = height_water - height_bottom < 0.001 ? _this.height : height_water;
    if (height_water - height_bottom < 0.01) {
      //难搞，问题在这。
      height_water = waterObjs[id].water.geometryInstances.geometry._height;
      point = Utils.setPositionHeight(viewer, point, height_water);
    }
    let x = (height_water - height_bottom).toFixed(4);

    // viewer.scene.terrainProvider=copy;

    let entity = this._dP(point);
    waterObjs[id] && waterObjs[id].entities.push(entity);
    entity.popup = popup;
    let text = x >= 0.01 ? x + '米' : '无积水';
    let p_degrees = [
      Cesium.Math.toDegrees(cartographic.longitude),
      Cesium.Math.toDegrees(cartographic.latitude)
    ];
    const html = `<div class="mars-popup-titile"></div>
                  <div class="mars-popup-content">
                      <div><label>\u7ECF\u5EA6</label>${p_degrees[0].toFixed(
                        6
                      )}</div>
                      <div><label>\u7EAC\u5EA6</label>${p_degrees[1].toFixed(
                        6
                      )}</div>
                      <div><label>\u79ef\u6c34\u6df1\u5ea6</label>${text}</div>
                  </div>`;
    entity.popup = {
      html: html,
      anchor: [0, -15]
    };
    popup.show(entity, point);
    // console.log(x)
  }
}

/**
 * 剖面分析
 * @extends SpatialAnalysis
 * @memberOf SpatialAnalysis
 */
class ClipAnalysis extends SpatialAnalysis {
  constructor(prop) {
    prop = prop || {};
    prop.type = 'clip';
    prop.drawConfig = { type: 'measure' };
    super(prop);
  }

  init() {
    let dt = this.drawControl.draw();
    dt.hasEdit(false);
  }

  start(flag) {}

  /**
   * 内置的绘线方法
   * @param callback {function =} 回调函数
   */
  drawLine(callback, calbackresult) {
    let dt = this.drawControl.draw();
    dt.hasEdit(true);
    this.drawControl.measureSection({
      calback: callback,
      calbackresult: calbackresult
    });
  }

  /**
   * 获取图表
   * @param charsData {echarts option} echart图表option
   * @return {{yAxis: [{axisLabel: {formatter: string, rotate: number}, type: string}], xAxis: [{axisLabel: {show: boolean}, data: [], axisLine: {show: boolean}, name: string, type: string, boundaryGap: boolean}], grid: {left: number, bottom: number, right: number, containLabel: boolean}, series: [{symbol: string, areaStyle: {normal: {color: echarts.graphic.LinearGradient}}, data: [], sampling: string, name: string, itemStyle: {normal: {color: string}}, type: string, smooth: boolean}], dataZoom: [{throttle: number, type: string}], tooltip: {formatter: ((function(*): (string))|*), trigger: string}}}
   */
  getEChart(charsData) {
    if (!charsData) return;

    function formatLength(strlen) {
      let numlen = Number(strlen);
      if (numlen < 1000) return numlen.toFixed(2) + '米';
      else return (numlen / 1000).toFixed(2) + '千米';
    }

    var arrPoint = charsData.arrPoint;

    let option = {
      grid: {
        left: 10,
        right: 10,
        bottom: 10,
        containLabel: true
      },
      dataZoom: [
        {
          type: 'inside',
          throttle: 50
        }
      ],
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          let inHtml = '';
          if (params.length === 0) return inHtml;

          let hbgd = params[0].value; // 海拔高度
          let point = arrPoint[params[0].dataIndex]; // 所在经纬度
          inHtml +=
            '所在位置&nbsp;' +
            point.x +
            ',' +
            point.y +
            '<br />' +
            '距起点&nbsp;<label>' +
            formatLength(params[0].axisValue) +
            '</label><br />' +
            params[0].seriesName +
            "&nbsp;<label style='color:" +
            params[0].color +
            ";'>" +
            formatLength(params[0].value) +
            '</label><br />';

          return inHtml;
        }
      },
      xAxis: [
        {
          name: '行程',
          type: 'category',
          boundaryGap: false,
          axisLine: {
            show: false
          },
          axisLabel: {
            show: false
          },
          data: charsData.arrLen
        }
      ],
      yAxis: [
        {
          //name: '高度',
          type: 'value',
          axisLabel: {
            rotate: 60,
            formatter: '{value} 米'
          }
        }
      ],
      series: [
        {
          name: '高程值',
          type: 'line',
          smooth: true,
          symbol: 'none',
          sampling: 'average',
          itemStyle: {
            normal: {
              color: 'rgb(255, 70, 131)'
            }
          },
          areaStyle: {
            normal: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgb(255, 158, 68)'
                },
                {
                  offset: 1,
                  color: 'rgb(255, 70, 131)'
                }
              ])
            }
          },
          data: charsData.arrHB
        }
      ]
    };
    return option;
  }

  clear() {
    let dt = this.drawControl.draw();
    dt.hasEdit(false);
    this.clearDraw();
  }

  destroy() {}

  /** 打开图表 */
  openChart() {}
}

/**
 * 天际线
 * @extends SpatialAnalysis
 * @memberOf SpatialAnalysis
 */
class SkyLineAnalysis extends SpatialAnalysis {
  constructor(prop) {
    prop = prop || {};
    prop.type = 'skyline';
    super(prop);
  }

  init() {
    // console.log('skyline init')
    this.cfg = {
      pg: {
        name: 'czm_skylinetemp',
        fragmentShader:
          'uniform sampler2D colorTexture;' +
          'uniform sampler2D depthTexture;' +
          'varying vec2 v_textureCoordinates;' +
          'void main(void)' +
          '{' +
          'float depth = czm_readDepth(depthTexture, v_textureCoordinates);' +
          'vec4 color = texture2D(colorTexture, v_textureCoordinates);' +
          'if(depth<1.0 - 0.000001){' +
          'gl_FragColor = color;' +
          '}' +
          'else{' +
          'gl_FragColor = vec4(1.0,0.0,0.0,1.0);' +
          '}' +
          '}'
      },
      pg1: {
        name: 'czm_skylinetemp1',
        fragmentShader:
          'uniform sampler2D colorTexture;' +
          'uniform sampler2D redTexture;' +
          'uniform sampler2D silhouetteTexture;' +
          'varying vec2 v_textureCoordinates;' +
          'void main(void)' +
          '{' +
          'vec4 redcolor=texture2D(redTexture, v_textureCoordinates);' +
          'vec4 silhouetteColor = texture2D(silhouetteTexture, v_textureCoordinates);' +
          'vec4 color = texture2D(colorTexture, v_textureCoordinates);' +
          'if(redcolor.r == 1.0){' +
          'gl_FragColor = mix(color, vec4(1.0,0.0,0.0,1.0), silhouetteColor.a);' +
          '}' +
          'else{' +
          'gl_FragColor = color;' +
          '}' +
          '}'
      }
    };
  }

  /**
   * 开始分析
   * @param flag {boolean} 开始/关闭
   */
  start(flag) {
    const { viewer } = this.prop;

    const cfg = this.cfg;

    if (flag) {
      let collection = viewer.scene.postProcessStages;
      let edgeDetection =
        Cesium.PostProcessStageLibrary.createEdgeDetectionStage();
      let pps = new Cesium.PostProcessStage(cfg.pg);
      let pps2 = new Cesium.PostProcessStage(
        Object.assign(cfg.pg1, {
          uniforms: {
            redTexture: pps.name,
            silhouetteTexture: edgeDetection.name
          }
        })
      );
      !this.skyLinePPS &&
        (this.skyLinePPS = collection.add(
          new Cesium.PostProcessStageComposite({
            name: 'czm_skyline',
            inputPreviousStageTexture: false,
            stages: [edgeDetection, pps, pps2],
            uniforms: edgeDetection.uniforms
          })
        ));
      this.skyLinePPS.enabled = true;
    } else {
      this.skyLinePPS && (this.skyLinePPS.enabled = false);
    }
  }

  clear() {
    this.start(false);
  }

  destroy() {}
}

/**
 * 阴影率
 * @extends ShadowRatioAnalysis
 * @memberOf ShadowRatioAnalysis
 */

const colorRamp = [
  Cesium.Color.BLUE,
  Cesium.Color.CYAN,
  Cesium.Color.GREEN,
  Cesium.Color.YELLOW,
  Cesium.Color.RED
];
function getColor(num) {
  let index = parseInt(num / 0.2);
  index = index == 5 ? 4 : index;
  let color = colorRamp[index];
  //color  = Cesium.Color.lerp(Cesium.Color.BLACK, Cesium.Color.YELLOW, num, new Cesium.Color())
  return color;
}
class ShadowRatioAnalysis extends SpatialAnalysis {
  constructor(prop) {
    prop = prop || {};
    prop.type = 'shadowRatio';
    prop.drawConfig = { hasEdit: false };
    super(prop);
    this.primitives = [];
    for (let i = 0; i < 5; i++) {
      let primitive = new Cesium.PointPrimitiveCollection({
        blendOption: Cesium.BlendOption.OPAQUE
      });
      this.primitives.push(primitive);
      this.prop.viewer.scene.primitives.add(primitive);
    }
  }

  init() {
    // console.log('ShadowRatio init')
    this.period = [
      Cesium.JulianDate.fromIso8601('2021-08-09T09:00:00+08:00'),
      Cesium.JulianDate.fromIso8601('2021-08-09T15:00:00+08:00')
    ];
    this.timeInterval = 90; //minute
    this.spacing = 15; //m
  }

  /**
   * 开始分析
   * @param flag {boolean} 开始/关闭
   */
  start(flag) {
    const { viewer } = this.prop;

    const cfg = this.cfg;

    if (flag) {
    } else {
    }
  }
  drawPolygon(_this) {
    //这个_this传vue实例。
    this.clear();
    let { viewer } = this.prop;
    this.drawControl.startDraw({
      type: 'polygon',
      style: {
        extrudedHeight: 50,
        fill: false,
        outline: true
      },
      success: async (e) => {
        console.time('新算法总运算');
        window.score = 0;
        window.time = 0;
        let arr = e.polygon.hierarchy.getValue().positions;
        let bottomHeight;
        //计算该区域法线方向。
        var pt = Utils.upPosition(viewer, arr[0], 100);
        this.normal = Cesium.Cartesian3.normalize(
          Cesium.Cartesian3.subtract(pt, arr[0], new Cesium.Cartesian3()),
          new Cesium.Cartesian3()
        );
        arr.map((a) => {
          let b = Utils.cartesianToLonLatHeight(a)[2];
          bottomHeight = b > bottomHeight ? bottomHeight : b;
        });
        let topHeight = e.polygon.extrudedHeight.getValue(); // + bottomHeight;
        (this.bottomHeight = bottomHeight), (this.topHeight = topHeight);
        let positions = e.polygon.hierarchy.getValue().positions;
        console.time('构造点阵花费时间');
        let points = this.constructPoints(positions);
        console.timeEnd('构造点阵花费时间');
        this.points = points;

        //bottomHeight = bottomHeight, topHeight = 130.41;
        /*先计算出范围内的街区高度，而后该高度以上的光照率全部为1。  */
        console.time('blockHeight');
        let blockHeight = 0;
        let heights = [];
        for (let index = 0, len = points.length; index <= len - 1; index++) {
          let p_cartographic = Cesium.Cartographic.fromCartesian(points[index]);
          // console.time('0.1')
          let height = viewer.scene.sampleHeight(p_cartographic);
          //console.timeEnd('0.1')
          /*   console.time('30')
                      let height2 = viewer.scene.sampleHeight(p_cartographic, null, 30);
                      console.timeEnd('30')
                      // console.log('0.1, 30', height, height2) */
          heights[index] = height;
          blockHeight = height > blockHeight ? height : blockHeight;
          //if (blockHeight > topHeight) break
        }
        this.blockHeight = blockHeight;
        this.heights = heights;
        console.timeEnd('blockHeight');
        //新方法，时间为关键。
        this._pointShow(false);
        this.computeShadowRatio();
        //this.computeShadowRatio_Octree();
        this._pointShow(true);

        this.activatedPick(_this);
      }
    });
  }
  drawPolygon_rawAlgorithm() {
    let { viewer } = this.prop;
    this.drawControl.startDraw({
      type: 'polygon',
      style: {
        extrudedHeight: 30,
        fill: false,
        outline: true
      },
      success: (e) => {
        console.time('老算法总运算');
        window.score = 0;
        let arr = e.polygon.hierarchy.getValue().positions;
        let bottomHeight;
        //计算该区域法线方向。
        var pt = Utils.upPosition(viewer, arr[0], 100);
        this.normal = Cesium.Cartesian3.normalize(
          Cesium.Cartesian3.subtract(pt, arr[0], new Cesium.Cartesian3()),
          new Cesium.Cartesian3()
        );
        for (let a of arr) {
          let b = Utils.cartesianToLonLatHeight(a)[2];
          bottomHeight = b > bottomHeight ? bottomHeight : b;
        }
        // let bottomHeight = Utils.cartesianToLonLatHeight(temp)[2];
        let topHeight = e.polygon.extrudedHeight.getValue();
        let positions = e.polygon.hierarchy.getValue().positions;
        let points = this.constructPoints(positions);
        //bottomHeight = bottomHeight, topHeight = 130.41;
        /*先计算出范围内的街区高度，而后该高度以上的光照率全部为1。  */
        console.time('blockHeight');
        let blockHeight = 0;
        let heights = [];
        for (let [index, p] of points.entries()) {
          let p_cartographic = Cesium.Cartographic.fromCartesian(p);
          let height = viewer.scene.sampleHeight(p_cartographic);
          heights[index] = height;
          blockHeight = height > blockHeight ? height : blockHeight;
          if (blockHeight > topHeight) break;
        }
        console.timeEnd('blockHeight');
        let points_score = [];
        for (let h = bottomHeight; h <= topHeight; h += this.spacing) {
          for (let [index, p] of points.entries()) {
            p = Utils.setPositionHeight(viewer, p, h);
            if (h < heights[index]) {
              this._dP(p, 0);
              // console.log('该点被删除', index, h, heights[index])
              continue;
            }
            // console.log('未被删除', index, h, heights[index])
            if (points_score[index] == 1 || h >= blockHeight) {
              this._dP(p, 1);
              continue;
            }
            let ratio = this.foo(p);
            points_score[index] = ratio;
            this._dP(p, ratio);
          }
        }
        console.timeEnd('老算法总运算');
        this.activatedPick();
      }
    });
  }
  activatedPick(_this = {}) {
    let { viewer } = this.prop;
    let self = this;
    const handler = this.drawControl.drawCtrl['billboard'].getHandler();
    handler.setInputAction(function (event) {
      console.time('单点测日照率');
      if (self.lastSelectPoint) {
        self.lastSelectPoint.pixelSize = 10;
        self.lastSelectPoint.outlineWidth = 0;
      }
      let pick = viewer.scene.pick(event.position) || {};
      if (pick.primitive instanceof Cesium.PointPrimitive) {
        let index = pick.primitive.id.indexOf('**:') + 3;
        let ratio = pick.primitive.id.slice(index);
        // // console.log('sunshineRatio', ratio)
        let ssr = parseFloat(ratio).toFixed(2);
        if (_this._isVue) {
          let p = Utils.cartesianToLonLatHeight(pick.primitive.position);
          _this.formInfo.data.height_sr = p[2].toFixed(2);
          _this.formInfo.data.position_sr =
            p[0].toFixed(5) + ', ' + p[1].toFixed(5);
          _this.formInfo.data.sunshineRatio = ssr;
        }
        self._pointShow(false);
        pick.collection && pick.collection.remove(pick.primitive); //清除点迹，然后下句方法里重绘准确的颜色。
        self.detectShadowPeriod(
          pick.primitive.position,
          _this.formInfo.data,
          ssr
        );
        self._pointShow(true);
      } else {
        _this.formInfo.data.height_sr = null;
        _this.formInfo.data.position_sr = null;
        _this.formInfo.data.sunshineRatio = null;
        _this.formInfo.data.sunshinePeriod = null;
      }
      console.timeEnd('单点测日照率');
    }, 2);
  }
  drawPoint() {
    this.drawControl.startDraw({
      type: 'point',
      success: (e) => {
        this.foo(e);
      }
    });
  }
  constructPoints(positions = []) {
    //construct points by polygon
    /*  positions = [
             {
                 "x": -2830602.9775367156,
                 "y": 4743413.013636357,
                 "z": 3178109.838292868
             },
             {
                 "x": -2830583.832117481,
                 "y": 4743466.040538806,
                 "z": 3178048.2618990294
             },
             {
                 "x": -2830618.160569659,
                 "y": 4743534.069851082,
                 "z": 3177917.5205962122
             },
             {
                 "x": -2830691.1737347418,
                 "y": 4743513.761260194,
                 "z": 3177883.1046531787
             },
             {
                 "x": -2830731.640580742,
                 "y": 4743377.853035916,
                 "z": 3178048.570685718
             },
             {
                 "x": -2830716.833060188,
                 "y": 4743366.730613368,
                 "z": 3178078.062117811
             }
         ]; */
    let lonLats = [];
    let points = [];
    for (let p of positions) {
      let a = Utils.cartesianToLonLatHeight(p);
      lonLats.push([a[0], a[1]]);
    }
    let lastP = Utils.cartesianToLonLatHeight(positions[0]);
    lonLats.push([lastP[0], lastP[1]]);

    let polygon_turf = t_polygon([lonLats]);
    this.polygon_turf = polygon_turf;
    let bbox_turf = bbox(polygon_turf);
    let projection = new Cesium.WebMercatorProjection(); //这里，墨卡托，10米实际8.6米。 要提高精度可换成其它平面投影系。
    // let bboxPolygon_turf = bboxPolygon(bbox_turf);

    let cartographicWS = Cesium.Cartographic.fromDegrees(
      bbox_turf[0],
      bbox_turf[1]
    );
    let cartographicEN = Cesium.Cartographic.fromDegrees(
      bbox_turf[2],
      bbox_turf[3]
    );
    let WS_meters = projection.project(cartographicWS);
    let EN_meters = projection.project(cartographicEN);
    //中心点。 算出中心点的cartesian坐标和bbox的横纵长度。
    let mid_root = {
      coor: [(WS_meters.x + EN_meters.x) / 2, (WS_meters.y + EN_meters.y) / 2],
      childNode: {}
    };
    mid_root.extends = {
      x: EN_meters.x - WS_meters.x,
      y: EN_meters.y - WS_meters.y
    };
    let u = projection.unproject({ x: mid_root.coor[0], y: mid_root.coor[1] });
    let c = Cesium.Cartographic.toCartesian(u);
    mid_root.coor = c;
    this.mid_root = mid_root;
    //let bbox_meters = [WS_meters.x, WS_meters.y, EN_meters.x, EN_meters.y];
    for (let i = WS_meters.x; i <= EN_meters.x; i += this.spacing) {
      for (let j = WS_meters.y; j <= EN_meters.y; j += this.spacing) {
        let p_cartographic = projection.unproject({ x: i, y: j });
        let p_degrees = [
          Cesium.Math.toDegrees(p_cartographic.longitude),
          Cesium.Math.toDegrees(p_cartographic.latitude)
        ];
        let point = t_point(p_degrees);
        let check = booleanContains(polygon_turf, point);
        check && points.push(Cesium.Cartographic.toCartesian(p_cartographic));
      }
    }
    return points;
  }
  foo(p) {
    //single point's condition of sunshine.
    const { viewer } = this.prop;
    this.timeArr = this.timeArr || [];
    this.planetaryDirections = this.planetaryDirections || [];
    if (this.timeArr.length == 0) {
      for (
        let i = this.period[0].clone();
        Cesium.JulianDate.lessThanOrEquals(i, this.period[1]);

      ) {
        this.timeArr.push(i.clone());
        Cesium.JulianDate.addMinutes(i, this.timeInterval, i);
      }
    }
    let sunshineNumber = 0;
    for (let [index, time] of this.timeArr.entries()) {
      //这里的时间，或许可以跳着来。 即间隔一时间后值不变，则中间时间也不变。若变，则再算中间。
      window.score++;
      let sunDirection = this.planetaryDirections[index];
      if (!sunDirection) {
        let sun_p =
          Cesium.Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(
            time
          );
        let icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
        Cesium.Matrix3.multiplyByVector(icrfToFixed, sun_p, sun_p);
        sunDirection = Cesium.Cartesian3.normalize(
          sun_p,
          new Cesium.Cartesian3()
        );
        this.planetaryDirections[index] = sunDirection;
      }
      //这里可以加上一个情况。 太阳高度角<15°，则无需Ray(),直接跳过。
      //2、当该处上方无遮挡，且太阳高度角>85°，则视为照射到阳光。 （还没加上该条）
      let check = Cesium.Cartesian3.dot(sunDirection, this.normal);
      if (check <= 0.25881904510252074) {
        // console.log('此次太阳高度角小于15')
        continue;
      }

      const ray = new Cesium.Ray(p, sunDirection);
      const result = viewer.scene.pickFromRay(ray);
      result && result.position && sunshineNumber++;
      //this._dL(p, result.position, Cesium.Color.YELLOW)
    }
    let sunshineRatio = 1 - sunshineNumber / this.timeArr.length;
    return sunshineRatio;
  }
  /* 检测日照区间。
   ** p是需要检测的点 ，cartesian3
   ** data是vue里的对象。 用于页面展示。
   ** ssr 是原先点集计算的日照率。 同事反馈颜色不要更改。 所以取这个旧值赋色。 (或许可以在信息栏里加一栏“准确率”？)
   */
  detectShadowPeriod(p, data, ssr) {
    //从起点起，
    const { viewer } = this.prop;
    const ellipsoid = viewer.scene.globe.ellipsoid;
    let normal = ellipsoid.geodeticSurfaceNormal(p, new Cesium.Cartesian3());

    let shadowCondition = [];

    let dayDiff = Cesium.JulianDate.daysDifference(
      this.period[1],
      this.period[0]
    );
    let foo = 7.5;
    if (dayDiff > 3) {
      foo = (dayDiff / 14) * 24 * 60;
    }

    for (
      let i = this.period[0].clone(), j = 0;
      Cesium.JulianDate.lessThanOrEquals(i, this.period[1]);
      j++
    ) {
      shadowCondition[j] = {};
      shadowCondition[j].time = i.clone();
      shadowCondition[j].shadow = step(p, i);
      Cesium.JulianDate.addMinutes(i, foo, i);
    }
    let shadowPeriods = [];
    let _active = false;
    let period = [];
    let shadowRatio_numerator = 0;
    for (let i = 0, len = shadowCondition.length, ele; i < len; i++) {
      ele = shadowCondition[i];
      ele.shadow && shadowRatio_numerator++;
      if (ele.shadow && _active) {
        shadowPeriods.push(period);
        period = [];
        _active = false;
        continue;
      }
      if (!ele.shadow) {
        _active = true;
        period.push(ele);
      } else {
        _active = false;
        period = [];
      }
    }
    let shadowRatio = shadowRatio_numerator / shadowCondition.length;
    data.sunshineRatio = (1 - shadowRatio).toFixed(2);
    this._dP(p, ssr /* data.sunshineRatio */, true);

    if (period.length >= 2) shadowPeriods.push(period);
    // // console.log('shadowPeriods', shadowPeriods);
    let text = '';
    const nf = numberFormat;
    shadowPeriods = shadowPeriods.filter((e) => {
      //取一个小时以上的时段。
      let f =
        e.length &&
        Cesium.JulianDate.compare(e[e.length - 1].time, e[0].time) >= 3600;
      if (f) {
        let s = Cesium.JulianDate.toGregorianDate(e[0].time),
          end = Cesium.JulianDate.toGregorianDate(e[e.length - 1].time);
        text +=
          nf(s.month) +
          '月' +
          nf(s.day) +
          '日 ' +
          nf(s.hour + 8) +
          ':' +
          nf(s.minute);
        text +=
          '到' +
          nf(end.month) +
          '月' +
          nf(end.day) +
          '日 ' +
          nf(end.hour + 8) +
          ':' +
          nf(end.minute) +
          '\n';
        return true;
      }
    });
    data.sunshinePeriod = text;
    function step(p, time) {
      //单步(测单点的阴影) 返回ture即该点该时下为荫蔽。
      let sun_p =
        Cesium.Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(
          time
        );
      let icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
      Cesium.Matrix3.multiplyByVector(icrfToFixed, sun_p, sun_p);
      let sunDirection = Cesium.Cartesian3.normalize(
        sun_p,
        new Cesium.Cartesian3()
      );
      let sitar = Cesium.Cartesian3.angleBetween(sunDirection, normal);
      if (sitar >= Math.PI / 2) {
        // console.log('此次太阳高度角小于15')
        return true;
      }
      const ray = new Cesium.Ray(p, sunDirection);
      const result = viewer.scene.pickFromRay(ray);
      if (result && result.position) {
        return true;
      } else {
        return false;
      }
    }
    function numberFormat(n) {
      return n > 9 ? n : '0' + n;
    }
  }
  computeShadowRatio() {
    const { viewer } = this.prop;
    let m = Math.min(5000, this.spacing / 2);
    //时间的判断还不够完全。
    let v =
      Cesium.JulianDate.secondsDifference(
        viewer.clock.stopTime,
        viewer.clock.startTime
      ) == 86400; //初始为86400
    if (!v) {
      this.period = [viewer.clock.startTime, viewer.clock.stopTime];
    }
    this.timeArr = [];
    let i;
    //万一此处的时间跨度特别巨大。 则时间间隔仅取“使之划分为十一份的间隔”
    let dayDiff = Cesium.JulianDate.daysDifference(
      this.period[1],
      this.period[0]
    );
    if (dayDiff > 3) {
      for (
        i = this.period[0].clone();
        Cesium.JulianDate.lessThanOrEquals(i, this.period[1]);

      ) {
        this.timeArr.push(i.clone());
        Cesium.JulianDate.addDays(i, dayDiff / 10, i);
      }
    } else {
      for (
        i = this.period[0].clone();
        Cesium.JulianDate.lessThanOrEquals(i, this.period[1]);

      ) {
        this.timeArr.push(i.clone());
        Cesium.JulianDate.addMinutes(i, this.timeInterval, i);
      }
    }
    //构造三维的点阵    (层的排列由上至下)
    let points_3d = [];
    let h;
    for (h = this.bottomHeight; h <= this.topHeight; h += this.spacing) {
      let arr = [];
      let judge = h >= this.blockHeight;

      this.points.map((p, i) => {
        let judge2 = h <= this.heights[i];
        p = Utils.setPositionHeight(viewer, p, h);
        p.index = i;
        p.level = (h - this.bottomHeight) / this.spacing + 1;
        p.SScondition = [];
        if (judge2) {
          // this._dP(p, 0) //建筑或地下的直接画蓝点。
          p.underBuilding = true;
        }
        if (judge) {
          judge && this._dP(p, 1); //街区高度之上的直接画红点。
        } else {
          arr.push(p);
        }
      });

      !judge && points_3d.push(arr);
    }
    points_3d.reverse();
    window.points_3d = points_3d;
    //this.timeArr.length = 1]]]]]]]]]]]]]]]]]]
    this.timeArr.map((time, index) => {
      console.time('点的运算');
      let timeOrder = index;
      let sunshinePointHeights = [],
        shadowPointHeights = [];
      let sunDirection;

      let sun_p =
        Cesium.Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(
          time
        );
      let icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
      Cesium.Matrix3.multiplyByVector(icrfToFixed, sun_p, sun_p);
      sunDirection = Cesium.Cartesian3.normalize(
        sun_p,
        new Cesium.Cartesian3()
      );

      let reverseSunDirection = Cesium.Cartesian3.subtract(
        new Cesium.Cartesian3(),
        sunDirection,
        new Cesium.Cartesian3()
      );

      let sitar = Cesium.Cartesian3.angleBetween(this.normal, sunDirection);
      let sitar_degree = Cesium.Math.toDegrees(sitar);
      // console.log(`${index}时刻下，太阳高度角${90 - sitar_degree}`)
      let length = Math.abs(this.spacing / Math.cos(sitar));

      if (sitar >= Math.PI / 2) {
        // console.log('太阳位于地下')
        return;
      }

      let lines = [];
      for (
        let index = 0, points, len = points_3d.length;
        index < len;
        index++
      ) {
        points = points_3d[index];
        if (index == points_3d.length - 1) {
          //最后一层无穿透
          for (let i = 0, p, len = points.length; i < len; i++) {
            p = points[i];
            if (p.id) continue;
            lines.push([p]);
          }
          break;
        }
        for (let i = 0, p, len = points.length; i < len; i++) {
          p = points[i];
          if (p.id) continue;
          let drawPs = [];
          drawPs.push(p);
          p.id = Cesium.createGuid();
          const ray = new Cesium.Ray(p, reverseSunDirection);
          let ps = [];
          /*射线串联的法1 */
          for (let i = 1; i <= points_3d.length - index - 1; i++) {
            //这里可以增加，如果点落在范围外，则break(当然，这里不考虑复杂形状)
            let n = Cesium.Ray.getPoint(
              ray,
              length * i,
              new Cesium.Cartesian3()
            );
            let p_degrees = Utils.cartesianToLonLatHeight(n);
            p_degrees.length = 2;
            let point = t_point(p_degrees);
            let check = booleanContains(this.polygon_turf, point); //可以加个this.spacing/2的缓冲区
            if (check) {
              ps.push(n);
            } else {
              break;
            }
          }
          ps.map((o, n) => {
            //在这里会引入多余的点。 留着，当采用另一种射线串联时可能会顺势解决掉。
            for (let i = 0, p0, len = points.length; i < len; i++) {
              p0 = points[i];
              let p3 = Utils.upPosition(viewer, p0, -this.spacing * (n + 1));
              let dis = Cesium.Cartesian3.distance(p3, o);
              if (dis > this.spacing / 2) {
                continue;
              } else if (dis < m) {
                let t = points_3d[index + 1 + n][i];
                if (t && t.id) continue;
                drawPs.push(t);
                t.id = p.id;
                break;
              }
            }
          });
          /*射线串联的法2 */
          /*  for (let i = 1; i <= points_3d.length - index - 1; i++) {//这里可以增加，如果点落在范围外，则break
                       let n = Cesium.Ray.getPoint(ray, length * i, new Cesium.Cartesian3())

                       for (let [i, p0] of points_3d[index+1].entries()) {
                           p0 = Utils.upPosition(viewer, p0, -this.spacing )
                           let dis = Cesium.Cartesian3.distance(p0, n);
                           if (dis > this.spacing / 2) {
                               continue
                           } else if (dis <= m) {
                               drawPs.push(p0)
                               points_3d[index + 1 + n][i].id = p.id
                               break
                           }
                       }
                   } */
          //绘制
          lines.push(drawPs);
          //this._dL(drawPs, Math.random())
        }
      }
      points_3d.map((i) => {
        //id清除，为下一个时间做准备。
        i.map((p) => {
          p.id && delete p.id;
        });
      });
      let number = 0;
      lines.forEach((e) => {
        e.forEach((a) => {
          ++number;
        });
      });
      // console.log('contrast of two type pass', number, points_3d.length * points_3d[0].length)

      let singlePs = lines.filter((e) => {
        return e.length == 1;
      });
      let singlePArr = [];
      singlePs.forEach((e) => {
        singlePArr.push(e[0]);
      });
      lines = lines.filter((e) => {
        return e.length > 1;
      });

      //对这些太阳光线串起的点进行日照分析
      lines.map((l) => {
        /*先挑出两种意外情况，减少运算 */
        if (l[0].underBuilding) {
          //线段第一点在建筑内/下
          l.map((p) => {
            p.shadow = p.shadow ? ++p.shadow : 1;
            p.SScondition[timeOrder] = 0; //1632
          });
          return;
        } else {
          //线段最后一个点受到光照。
          let lastP = l[l.length - 1];
          if (lastP.level > sunshinePointHeights[lastP.index]) {
            l.map((p) => {
              p.sunshine = p.sunshine ? ++p.sunshine : 1;
              p.SScondition[timeOrder] = 1; //1632
            });
            return;
          } else if (l[0].level < shadowPointHeights[l[0].index]) {
            //线段第一个点受遮挡。
            l.map((p) => {
              p.shadow = p.shadow ? ++p.shadow : 1;
              p.SScondition[timeOrder] = 0; //1632
            });
            return;
          }
        }

        const ray = new Cesium.Ray(l[0], sunDirection);
        ray.skip = true;
        let p = Cesium.Ray.getPoint(ray, 150, new Cesium.Cartesian3());
        const sunRay = new Cesium.Ray(p, reverseSunDirection);
        let s_t = new Date().getTime();
        const result = viewer.scene.pickFromRay(sunRay, null, 1); //初步测试，width好像没有效果。 难道是像素单位？
        //const result2 = viewer.scene.pickFromRay(sunRay, null, 1);
        let e_t = new Date().getTime();
        window.time += e_t - s_t;
        // // console.log('result', result, result2)
        window.score++;
        // this._dL([p, result.position])
        if (result && result.position) {
          let h = Utils.cartesianToLonLatHeight(result.position)[2];
          l.map((p) => {
            let b = Utils.cartesianToLonLatHeight(p)[2];
            let index = p.index,
              level = p.level;
            if (b < h) {
              p.shadow = p.shadow ? ++p.shadow : 1;
              p.SScondition[timeOrder] = 0; //1632
              shadowPointHeights[index] = Math.max(
                level,
                shadowPointHeights[index] || 1
              );
            } else {
              p.sunshine = p.sunshine ? ++p.sunshine : 1;
              p.SScondition[timeOrder] = 1; //1632
              sunshinePointHeights[index] = Math.min(
                level,
                sunshinePointHeights[index] || 100
              );
            }
          });
        }
      });
      //对未串连余留的点进行日照分析
      singlePArr.map((p) => {
        if (p.underBuilding) {
          p.shadow = p.shadow ? ++p.shadow : 1;
          p.SScondition[timeOrder] = 0; //1632
          return;
        } else if (p.level > sunshinePointHeights[p.index]) {
          p.sunshine = p.sunshine ? ++p.sunshine : 1;
          p.SScondition[timeOrder] = 1; //1632
          return;
        } else if (p.level < shadowPointHeights[p.index]) {
          // // console.log('执行一次')
          p.shadow = p.shadow ? ++p.shadow : 1;
          p.SScondition[timeOrder] = 0; //1632
          return;
        }
        const ray = new Cesium.Ray(p, sunDirection);
        ray.skip = true;
        let s_t = new Date().getTime();
        const result = viewer.scene.pickFromRay(ray, null, 1);
        let e_t = new Date().getTime();
        window.time += e_t - s_t;
        window.score++;
        let index = p.index,
          level = p.level;
        if (result && result.position) {
          p.shadow = p.shadow ? ++p.shadow : 1;
          p.SScondition[timeOrder] = 0; //1632
          shadowPointHeights[index] = Math.max(
            level,
            shadowPointHeights[index] || 0
          );
        } else {
          p.sunshine = p.sunshine ? ++p.sunshine : 1;
          p.SScondition[timeOrder] = 1; //1632
          sunshinePointHeights[index] = Math.min(
            level,
            sunshinePointHeights[index] || 100
          );
        }
      });
      console.timeEnd('点的运算');
    });

    points_3d.map((i) => {
      //画上所有的点。
      i.map((p) => {
        let sunshineRatio = (parseInt(p.sunshine) || 0) / this.timeArr.length;
        // // console.log('sunshineRatio', sunshineRatio)
        this._dP(p, sunshineRatio);
      });
    });
    console.timeEnd('新算法总运算');
  }
  computeShadowRatio_solarAltitude() {
    //1 计算得到区域内共有多少长方体。
    //1.1 对点进行四叉树建索引
    let mr = this.mid_root;
    this.points_enu = this.points.map((e) => {
      return Cesium.Cartesian3.subtract(e, mr.coor, new Cesium.Cartesian3());
    });

    let tree = {
      root: {
        coord: { x: 0, y: 0 },
        extends: { x: mr.extends.x, y: mr.extends.y },
        level: 0,
        content: this.points_enu
      }
    };
    let obj = {
      //四叉树
      creatChileNode(node) {
        let coord_f = node.coord;
        let { x: ex_x, y: ex_y } = node.extends;
        let childNodes = new Array(4);
        for (let [index, i] of childNodes.entries()) {
          childNodes[index] = {};
          childNodes[index].level = node.level + 1;
          childNodes[index].extends = { x: ex_x / 2, y: ex_y / 2 };
          childNodes[index].content = [];
        }
        childNodes[0].coord = {
          x: coord_f.x + ex_x / 4,
          y: coord_f.y + ex_y / 4
        }; //第1象限
        childNodes[1].coord = {
          x: coord_f.x - ex_x / 4,
          y: coord_f.y + ex_y / 4
        }; //2
        childNodes[2].coord = {
          x: coord_f.x - ex_x / 4,
          y: coord_f.y - ex_y / 4
        }; //3
        childNodes[3].coord = {
          x: coord_f.x + ex_x / 4,
          y: coord_f.y - ex_y / 4
        }; //4
        for (let [index, i] of this.points_enu.entries()) {
          //将点装入子节点
          let x, y;
          (x = i.x - ex_x), (y = i.y - ex_y);
          if (x > 0 && y > 0) {
            childNodes[0].content.push(i);
          } else if (x < 0 && y > 0) {
            childNodes[0].content.push(i);
          } else if (x < 0 && y < 0) {
            childNodes[0].content.push(i);
          } else if (x > 0 && y < 0) {
            childNodes[0].content.push(i);
          }
        }

        /* for (let node of childNodes) {
                    let point = Cesium.Matrix4.multiplyByPoint(transform, node.coord, new Cesium.Cartesian3())
                } */
        node.childNodes = childNodes;
        for (let node of childNodes) {
          if (node.level >= 4) return;
          obj.creatChileNode(node);
        }
      }
    };
    obj.creatChileNode(tree.root);
  }
  computeShadowRatio_Octree() {
    //1 对点进行八叉树建索引
    const { viewer } = this.prop;
    let _this = this;
    //时间的判断还不够完全。
    let v =
      Cesium.JulianDate.secondsDifference(
        viewer.clock.stopTime,
        viewer.clock.startTime
      ) == 86400; //初始为86400
    if (!v) {
      this.period = [viewer.clock.startTime, viewer.clock.stopTime];
    }
    this.timeArr = [];
    let i;
    for (
      i = this.period[0].clone();
      Cesium.JulianDate.lessThanOrEquals(i, this.period[1]);

    ) {
      this.timeArr.push(i.clone());
      Cesium.JulianDate.addMinutes(i, this.timeInterval, i);
    }

    let mr = this.mid_root;
    let extrudedHeight = this.topHeight - this.bottomHeight;
    mr.coor = Utils.upPosition(viewer, mr.coor, extrudedHeight / 2); //三维点集的中点。
    mr.extends.z = extrudedHeight;
    let temp = Math.max(mr.extends.x, mr.extends.y); //变成正方体
    mr.extends.x = mr.extends.y = temp;
    //构造三维的点阵    (层的排列由上至下)
    let points_3d = [];
    let h;
    for (h = this.bottomHeight; h <= this.topHeight; h += this.spacing) {
      let arr = [];
      let judge = h >= this.blockHeight;
      this.points.map((p, i) => {
        p = Utils.setPositionHeight(viewer, p, h);
        p.index = i;
        p.level = (h - this.bottomHeight) / this.spacing + 1;
        p.SScondition = [];
        if (judge) {
          judge && this._dP(p, 1); //街区高度之上的直接画红点。
        } else {
          arr.push(p);
        }
      });
      !judge && points_3d.push(arr);
    }
    points_3d.reverse();

    let transform = Cesium.Transforms.eastNorthUpToFixedFrame(mr.coor);
    let transform_inverse = Cesium.Matrix4.inverse(
      transform,
      new Cesium.Matrix4()
    );
    let totalContent = [];
    let coordCollectionByLevel = []; //八叉树第*支的节点集合。
    let points_3d_raw = points_3d;
    let points_3d_enu = points_3d.map((e) => {
      return e.map((a) => {
        let r = Cesium.Matrix4.multiplyByPoint(
          transform_inverse,
          a,
          new Cesium.Cartesian3()
        );
        totalContent.push(r);
        return r;
      });
    });

    let tree = {
      root: {
        coord: { x: 0, y: 0, z: 0 },
        extends: { x: mr.extends.x, y: mr.extends.y, z: mr.extends.z },
        level: 0,
        content: totalContent
      }
    };
    tree.points_3d_enu = points_3d_enu;
    tree.points_3d_raw = points_3d_raw;
    // tree.root.coord.z = (this.topHeight + this.bottomHeight) / 2;//将根节点高度换成真实高度。
    tree.coordCollectionByLevel = coordCollectionByLevel;
    let obj = {
      //OCtree
      creatChileNode(node) {
        let coord_f = node.coord;
        let { x: ex_x, y: ex_y, z: ex_z } = node.extends;
        let childNodes = new Array(8);
        for (let [index, i] of childNodes.entries()) {
          childNodes[index] = {};
          childNodes[index].level = node.level + 1;
          childNodes[index].extends = { x: ex_x / 2, y: ex_y / 2, z: ex_z / 2 };
          childNodes[index].content = [];
          childNodes[index].parent = node;
        }
        coordCollectionByLevel[node.level + 1] =
          coordCollectionByLevel[node.level + 1] || [];

        childNodes[0].coord = {
          x: coord_f.x + ex_x / 4,
          y: coord_f.y + ex_y / 4,
          z: coord_f.z + ex_z / 4
        }; //第1象限 上方
        childNodes[1].coord = {
          x: coord_f.x - ex_x / 4,
          y: coord_f.y + ex_y / 4,
          z: coord_f.z + ex_z / 4
        }; //2
        childNodes[2].coord = {
          x: coord_f.x - ex_x / 4,
          y: coord_f.y - ex_y / 4,
          z: coord_f.z + ex_z / 4
        }; //3
        childNodes[3].coord = {
          x: coord_f.x + ex_x / 4,
          y: coord_f.y - ex_y / 4,
          z: coord_f.z + ex_z / 4
        }; //4
        childNodes[4].coord = {
          x: coord_f.x + ex_x / 4,
          y: coord_f.y + ex_y / 4,
          z: coord_f.z - ex_z / 4
        }; //第1(/5)象限 下方
        childNodes[5].coord = {
          x: coord_f.x - ex_x / 4,
          y: coord_f.y + ex_y / 4,
          z: coord_f.z - ex_z / 4
        }; //2
        childNodes[6].coord = {
          x: coord_f.x - ex_x / 4,
          y: coord_f.y - ex_y / 4,
          z: coord_f.z - ex_z / 4
        }; //3
        childNodes[7].coord = {
          x: coord_f.x + ex_x / 4,
          y: coord_f.y - ex_y / 4,
          z: coord_f.z - ex_z / 4
        }; //4
        node.content.map((i) => {
          let x, y, z;
          (x = i.x - coord_f.x), (y = i.y - coord_f.y), (z = i.z - coord_f.z);
          if (z > 0) {
            if (x > 0 && y > 0) {
              childNodes[0].content.push(i);
            } else if (x < 0 && y > 0) {
              childNodes[1].content.push(i);
            } else if (x < 0 && y < 0) {
              childNodes[2].content.push(i);
            } else if (x > 0 && y < 0) {
              childNodes[3].content.push(i);
            }
          } else {
            if (x > 0 && y > 0) {
              childNodes[4].content.push(i);
            } else if (x < 0 && y > 0) {
              childNodes[5].content.push(i);
            } else if (x < 0 && y < 0) {
              childNodes[6].content.push(i);
            } else if (x > 0 && y < 0) {
              childNodes[7].content.push(i);
            }
          }
        });
        for (let node of childNodes) {
          //辅助线，画出子节点范围
          let point = Cesium.Matrix4.multiplyByPoint(
            transform,
            node.coord,
            new Cesium.Cartesian3()
          );
          let dimensions = {
            x: node.extends.x,
            y: node.extends.y,
            z: node.extends.z
          };
          // _this._dB(point, dimensions, node.level)
          //_this._dP(point)
        }
        node.childNodes = childNodes;
        for (let node of childNodes) {
          node.content.length && coordCollectionByLevel[node.level].push(node);
          if (node.content.length <= 1) continue;
          obj.creatChileNode(node);
        }
      }
    };
    obj.creatChileNode(tree.root);
    this.tree = tree;

    /* points_3d.map(i => {//画上所有的点。
            i.map(p => {
                this._dP(p)
            })
        }) */

    //this.timeArr.length = 1
    //this.timeArr = [this.timeArr[4]]

    this.timeArr.map((time, index) => {
      console.time('点的运算');
      let sunDirection;
      let sun_p =
        Cesium.Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(
          time
        );
      let icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
      Cesium.Matrix3.multiplyByVector(icrfToFixed, sun_p, sun_p);
      sunDirection = Cesium.Cartesian3.normalize(
        sun_p,
        new Cesium.Cartesian3()
      );
      let reverseSunDirection = Cesium.Cartesian3.subtract(
        new Cesium.Cartesian3(),
        sunDirection,
        new Cesium.Cartesian3()
      );

      let sunP_enu = Cesium.Matrix4.multiplyByPoint(
        transform_inverse,
        sunDirection,
        new Cesium.Cartesian3()
      );
      let origin_enu = Cesium.Matrix4.multiplyByPoint(
        transform_inverse,
        new Cesium.Cartesian3(),
        new Cesium.Cartesian3()
      );
      let sunDirection_enu = Cesium.Cartesian3.subtract(
        sunP_enu,
        origin_enu,
        new Cesium.Cartesian3()
      );
      sunDirection_enu = Cesium.Cartesian3.normalize(
        sunDirection_enu,
        new Cesium.Cartesian3()
      );
      let reverseSunDirection_enu = Cesium.Cartesian3.subtract(
        new Cesium.Cartesian3(),
        sunDirection_enu,
        new Cesium.Cartesian3()
      );
      let sitar = Cesium.Cartesian3.angleBetween(this.normal, sunDirection);
      let sitar_degree = Cesium.Math.toDegrees(sitar);
      // console.log(`${index}时刻下，太阳高度角${90 - sitar_degree}`)

      if (sitar >= Math.PI / 2) {
        // console.log('太阳位于地下')
        return;
      }
      let points_3d = tree.coordCollectionByLevel[4];

      /* let projectPoints =[]    //展示垂直于太阳光线的面。
            let plane = Cesium.Plane.fromPointNormal(points_3d[0][0], sunDirection);
            sra.prop.viewer.entities.add({
                position: points_3d[0][0],
                plane: { plane: new Cesium.Plane(sunDirection_enu, 0), dimensions: { x: 500, y: 500 } }
            })
            points_3d.forEach(a => {
                a.forEach(b => {
                    let c = Cesium.Plane.projectPointOntoPlane(plane, b)
                    this._dP(c, 0.5)
                    projectPoints.push(c)

                })
            })
            // console.log('projectPoints',projectPoints) */

      console.time('整颗树的运算');
      sunshineForSingleNodes.bind(this)(points_3d);
      console.timeEnd('整颗树的运算');

      function sunshineForSingleNodes(points_3d) {
        //// console.log('points_3dpoints_3d', points_3d)
        if (points_3d[0].extends.x <= 5) {
          let p;
          for (let i = 0, len = points_3d.length; i < len; i++) {
            p = points_3d[i];
            p.content.forEach((e) => {
              e.shadow = e.shadow ? ++e.shadow : 1;
            });
          }
          return;
          /*   for (let p of points_3d) {//画出所有的点。
                          let p_transform = Cesium.Matrix4.multiplyByPoint(transform, p.coord, new Cesium.Cartesian3())
                          this._dP(p_transform, 1)
                      } return */
        }
        this.clear();
        let points_2dimention = [];
        let m = points_3d[0].extends.x / 2;
        let zArr = [];
        //得到分层的点集。
        for (
          let index = 0, point, len = points_3d.length;
          index < len;
          index++
        ) {
          point = points_3d[index];
          let i = zArr.findIndex((e) => e == point.coord.z);
          if (i == -1) {
            zArr.push(point.coord.z);
            points_2dimention.push([point]);
          } else {
            points_2dimention[i].push(point);
          }
        }
        //子节点的二维数组并非按高度排序，使之有序。
        zArr.sort(function (a, b) {
          return b - a;
        });
        points_2dimention.sort((a, b) => {
          return b[0].coord.z - a[0].coord.z;
        });
        //e.g. zArr=[16.7825, 7.1925, -2.3975, -11.9875]
        /****各层间距不一定相等。 所以层间射线长度，设为数组。*/
        let lengthsWithRay = [];
        for (let i = 0, l = zArr.length; i < l - 1; i++) {
          let delta = zArr[i] - zArr[i + 1];
          let size = Math.abs(delta / Math.cos(sitar));
          lengthsWithRay.push(size);
        }

        let lines = [];
        for (
          let index = 0, points, len = points_2dimention.length;
          index < len;
          index++
        ) {
          points = points_2dimention[index];
          if (index == points_2dimention.length - 1) {
            //最后一层直接跳过
            for (let i = 0, p, len = points.length; i < len; i++) {
              p = points[i];
              if (p.id) continue;
              lines.push([p]);
            }
            break;
          }
          for (let i = 0, p, len = points.length; i < len; i++) {
            p = points[i];
            if (p.id) continue;
            let drawPs = [];
            drawPs.push(p);
            p.id = Cesium.createGuid();
            const ray = new Cesium.Ray(p.coord, reverseSunDirection_enu);
            let ps = [];
            /*射线串联的法1 */
            for (let i = 0; i < points_2dimention.length - index - 1; i++) {
              let n = Cesium.Ray.getPoint(
                ray,
                lengthsWithRay[i + index],
                new Cesium.Cartesian3()
              );
              ray.origin = n;
              let n_cartesian = Cesium.Matrix4.multiplyByPoint(
                transform,
                n,
                new Cesium.Cartesian3()
              );
              let p_degrees = Utils.cartesianToLonLatHeight(n_cartesian);
              p_degrees.length = 2;
              let point = t_point(p_degrees);
              let check = booleanContains(this.polygon_turf, point);
              if (check) {
                ps.push(n);
              } else {
                break;
              }
            }
            ps.map((o, n) => {
              let level = zArr.findIndex((e) => {
                return Cesium.Math.equalsEpsilon(e, o.z, Cesium.Math.EPSILON1);
              });
              let arr = points_2dimention[level];
              console.assert(
                arr instanceof Array,
                '此时arr不是数组。',
                points_2dimention,
                zArr,
                o.z
              );
              for (let i = 0, p0, len = arr.length; i < len; i++) {
                p0 = arr[i];
                let dis = Cesium.Cartesian3.distance(p0.coord, o);
                if (dis >= m) {
                  continue;
                } else if (dis < m) {
                  if (p0.id) continue;
                  drawPs.push(p0);
                  p0.id = p.id;
                  break;
                }
              }
            });

            lines.push(drawPs);
          }
        }

        points_3d.map((p) => {
          //id清除，为下一个时间做准备。
          p.id && delete p.id;
        });
        let number = 0; //划拨到lines里的点。
        lines.forEach((e) => {
          e.forEach((a) => {
            ++number;
          });
        });
        console.assert(
          number == points_3d.length,
          '并未将所有点按太阳光线串联起'
        );

        let singlePs = lines.filter((e) => {
          return e.length == 1;
        });
        let singlePArr = [];
        singlePs.forEach((e) => {
          singlePArr.push(e[0]);
        });
        lines = lines.filter((e) => {
          return e.length > 1;
        });
        lines.forEach((e) => {
          //绘制串联点的线。
          let a = e.map((b) =>
            Cesium.Matrix4.multiplyByPoint(
              transform,
              b.coord,
              new Cesium.Cartesian3()
            )
          );
          // this._dL(a)
        });

        //对这些太阳光线串起的点进行日照分析
        lines.map((l) => {
          let u = Cesium.Matrix4.multiplyByPoint(
            transform,
            l[0].coord,
            new Cesium.Cartesian3()
          );
          const ray = new Cesium.Ray(u, sunDirection);
          let p = Cesium.Ray.getPoint(ray, 150, new Cesium.Cartesian3());
          const sunRay = new Cesium.Ray(p, reverseSunDirection);
          let s_t = new Date().getTime();
          const result = viewer.scene.pickFromRay(sunRay, null, 1);
          let e_t = new Date().getTime();
          window.time += e_t - s_t;
          window.score++;
          if (result && result.position) {
            let h = Utils.cartesianToLonLatHeight(result.position)[2];
            l.map((p) => {
              let r = Cesium.Matrix4.multiplyByPoint(
                transform,
                p.coord,
                new Cesium.Cartesian3()
              );
              let b = Utils.cartesianToLonLatHeight(r)[2];
              if (b < h) {
                p.shadow = p.shadow ? ++p.shadow : 1;
              } else {
                p.sunshine = p.sunshine ? ++p.sunshine : 1;
              }
            });
          }
        });
        //对未串连余留的点进行日照分析
        singlePArr.map((p) => {
          let u = Cesium.Matrix4.multiplyByPoint(
            transform,
            p.coord,
            new Cesium.Cartesian3()
          );
          const ray = new Cesium.Ray(u, sunDirection);
          let s_t = new Date().getTime();
          const result = viewer.scene.pickFromRay(ray, null, 1);
          let e_t = new Date().getTime();
          window.time += e_t - s_t;
          window.score++;
          if (result && result.position) {
            p.shadow = p.shadow ? ++p.shadow : 1;
          } else {
            p.sunshine = p.sunshine ? ++p.sunshine : 1;
          }
        });
        // perform next process
        let shadowNode = []; //阴影节点。
        /* points_3d.forEach(e => {
                    let p = Cesium.Matrix4.multiplyByPoint(transform, e.coord, new Cesium.Cartesian3());
                    if (e.shadow) {
                        shadowNode.push(e);
                     //   this._dP(p, 0);
                    }
                    if (e.sunshine) {
                        this._dP(p, 1);
                     //   e.content.forEach(a => a.excluded = true)
                    }
                }) */

        let next_points_3d = []; //隐蔽的父节点下的所有子节点。
        shadowNode.forEach((e) => {
          if (e.childNodes && e.childNodes.length) {
            next_points_3d = next_points_3d.concat(e.childNodes);
          }
          if (!e.childNodes && e.content.length >= 1) {
            console.assert(e.content.length == 1, '节点还可分，content不为1');
            e.content.forEach((p) => {
              p.shadow = p.shadow ? ++p.shadow : 1;
            });
          }
        });
        /* let u, v, p3e = tree.points_3d_enu, p3r = tree.points_3d_raw;
                let points_3d_dealed = [];
                for (let i = 0, len = p3e.length; i < len; i++) {
                    u = p3e[i];
                    points_3d_dealed[i] = [];
                    for (let j = 0, len2 = u.length; j < len2; j++) {
                        v = u[j]
                        if (!v) debugger
                        if (!v.excluded) {
                            points_3d_dealed[i].push(p3r[i][j])
                        }
                    }
                }//得到每层数量不等的点层，还能否直接进行串联。  */

        // return points_3d_dealed ///这里应该有除外的。 然后去在第一种方法里执行。

        if (next_points_3d.length)
          sunshineForSingleNodes.bind(this)(next_points_3d);
        else {
          //整树运算终结。
          //做到这里，去做淹没分析。 接下来要做的是处理content。
          /*  let shadowPoints = [];//整颗树的阴影点。
                     shadowNode.forEach(e => {
                         if (e.content.length) {
                             console.assert(e.content.length == 1, '节点还可分，content不为1')
                             e.content.forEach(p => {
                                 //最后一层存在重复增加。
                                 p.shadow = p.shadow ? ++p.shadow : 1;
                                 shadowPoints.push(p);
                             })
                         }
                     })
                     // console.log('shadowNode', shadowNode);
                     return shadowPoints */
        }
      }

      //留待思考， 父节点做的日照，在子节点中能否利用不浪费。
      console.timeEnd('点的运算');
    });
    this.clear();
    for (let p of tree.root.content) {
      //画出所有的点。
      let p_transform = Cesium.Matrix4.multiplyByPoint(
        transform,
        p,
        new Cesium.Cartesian3()
      );
      if (p.shadow) {
        this._dP(p_transform, p.shadow / this.timeArr.length);
      } else {
        this._dP(p_transform, 1);
      }
    }
    console.timeEnd('新算法总运算');
  }
  //时间简略前备份
  computeShadowRatio_copy() {
    const { viewer } = this.prop;
    let m = Math.min(5000, this.spacing / 2);
    this.timeArr = this.timeArr || [];
    this.planetaryDirections = this.planetaryDirections || [];
    if (this.timeArr.length == 0) {
      for (
        let i = this.period[0].clone();
        Cesium.JulianDate.lessThanOrEquals(i, this.period[1]);

      ) {
        this.timeArr.push(i.clone());
        Cesium.JulianDate.addMinutes(i, this.timeInterval, i);
      }
    }

    //构造三维的点阵    (层的排列由上至下)
    let points_3d = [];
    for (let h = this.bottomHeight; h <= this.topHeight; h += this.spacing) {
      let arr = [];
      let judge = h >= this.blockHeight;

      this.points.map((p, i) => {
        let judge2 = h <= this.heights[i];
        p = Utils.setPositionHeight(viewer, p, h);
        p.SScondition = [];
        if (judge2) {
          // this._dP(p, 0) //建筑或地下的直接画蓝点。
          p.underBuilding = true;
        }
        if (judge) {
          judge && this._dP(p, 1); //街区高度之上的直接画红点。
        } else {
          arr.push(p);
        }
      });
      !judge && points_3d.push(arr);
    }
    points_3d.reverse();
    window.points_3d = points_3d;
    this.timeArr.map((time, index) => {
      let timeOrder = index;
      let sunDirection = this.planetaryDirections[index];
      if (!sunDirection) {
        let sun_p =
          Cesium.Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(
            time
          );
        let icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
        Cesium.Matrix3.multiplyByVector(icrfToFixed, sun_p, sun_p);
        sunDirection = Cesium.Cartesian3.normalize(
          sun_p,
          new Cesium.Cartesian3()
        );
        this.planetaryDirections[index] = sunDirection;
      }
      let reverseSunDirection = Cesium.Cartesian3.subtract(
        new Cesium.Cartesian3(),
        sunDirection,
        new Cesium.Cartesian3()
      );

      let sitar = Cesium.Cartesian3.angleBetween(this.normal, sunDirection);
      let sitar_degree = Cesium.Math.toDegrees(sitar);
      // console.log(`${index}时刻下，太阳高度角${90 - sitar_degree}`)
      let length = Math.abs(this.spacing / Math.cos(sitar));

      if (sitar >= Math.PI) {
        // console.log('太阳位于地下。')
        return;
      }

      console.time('点的运算');
      let lines = [];
      for (
        let index = 0, points, len = points_3d.length;
        index < len;
        index++
      ) {
        points = points_3d[index];
        if (index == points_3d.length - 1) {
          //最后一层无穿透
          for (let i = 0, p, len = points.length; i < len; i++) {
            p = points[i];
            if (p.id) continue;
            lines.push([p]);
          }
          break;
        }
        for (let i = 0, p, len = points.length; i < len; i++) {
          p = points[i];
          if (p.id) continue;
          let drawPs = [];
          drawPs.push(p);
          p.id = Cesium.createGuid();
          const ray = new Cesium.Ray(p, reverseSunDirection);
          let ps = [];
          /*射线串联的法1 */
          for (let i = 1; i <= points_3d.length - index - 1; i++) {
            //这里可以增加，如果点落在范围外，则break(当然，这里不考虑复杂形状)
            let n = Cesium.Ray.getPoint(
              ray,
              length * i,
              new Cesium.Cartesian3()
            );
            let p_degrees = Utils.cartesianToLonLatHeight(n);
            p_degrees.length = 2;
            let point = t_point(p_degrees);
            let check = booleanContains(this.polygon_turf, point); //可以加个this.spacing/2的缓冲区
            if (check) {
              ps.push(n);
            } else {
              break;
            }
          }
          ps.map((o, n) => {
            //在这里会引入多余的点。 留着，当采用另一种射线串联时可能会顺势解决掉。
            for (let i = 0, p0, len = points.length; i < len; i++) {
              p0 = points[i];
              let p3 = Utils.upPosition(viewer, p0, -this.spacing * (n + 1));
              let dis = Cesium.Cartesian3.distance(p3, o);
              if (dis > this.spacing / 2) {
                continue;
              } else if (dis < m) {
                let t = points_3d[index + 1 + n][i];
                if (t && t.id) continue;
                drawPs.push(t);
                t.id = p.id;
                break;
              }
            }
          });
          /*  for (let [n, o] of ps.entries()) {//在这里会引入多余的点。 留着，当采用另一种射线串联时可能会顺势解决掉。
                         for (let [i, p0] of points.entries()) {
                             let p3 = Utils.upPosition(viewer, p0, -this.spacing * (n + 1))
                             let dis = Cesium.Cartesian3.distance(p3, o);
                             if (dis > this.spacing / 2) {
                                 continue
                             } else if (dis < m) {
                                 //p3.order = points_3d[index + 1 + n][i].order;
                                 let t = points_3d[index + 1 + n][i]
                                 drawPs.push(t)
                                 t.id = p.id
                                 break
                             }
                         }
                     } */
          /*射线串联的法2 */
          /*  for (let i = 1; i <= points_3d.length - index - 1; i++) {//这里可以增加，如果点落在范围外，则break
                       let n = Cesium.Ray.getPoint(ray, length * i, new Cesium.Cartesian3())

                       for (let [i, p0] of points_3d[index+1].entries()) {
                           p0 = Utils.upPosition(viewer, p0, -this.spacing )
                           let dis = Cesium.Cartesian3.distance(p0, n);
                           if (dis > this.spacing / 2) {
                               continue
                           } else if (dis <= m) {
                               drawPs.push(p0)
                               points_3d[index + 1 + n][i].id = p.id
                               break
                           }
                       }
                   } */
          //绘制
          lines.push(drawPs);
          //this._dL(drawPs, Math.random())
        }
      }
      points_3d.map((i) => {
        //id清除，为下一个时间做准备。
        i.map((p) => {
          p.id && delete p.id;
        });
      });
      let number = 0;
      lines.forEach((e) => {
        e.forEach((a) => {
          ++number;
        });
      });
      // console.log('contrast of two type pass', number, points_3d.length * points_3d[0].length)

      let singlePs = lines.filter((e) => {
        return e.length == 1;
      });
      let singlePArr = [];
      singlePs.forEach((e) => {
        singlePArr.push(e[0]);
      });
      lines = lines.filter((e) => {
        return e.length > 1;
      });

      /* //尝试找出重复的点与线。
            let arr1702 = []
            lines.forEach(e=>{
               e.forEach(a=>{

                arr1702.push(a.order)
               })
            }) */

      //对这些太阳光线串起的点进行日照分析
      lines.map((l) => {
        if (l[0].underBuilding) {
          //线段第一点在建筑内/下
          l.map((p) => {
            p.shadow = p.shadow ? ++p.shadow : 1;
            p.SScondition[timeOrder] = 0; //1632
          });
          return;
        }
        const ray = new Cesium.Ray(l[0], sunDirection);
        let p = Cesium.Ray.getPoint(ray, 150, new Cesium.Cartesian3());
        const sunRay = new Cesium.Ray(p, reverseSunDirection);
        const result = viewer.scene.pickFromRay(sunRay);
        window.score++;
        if (result && result.position) {
          let h = Utils.cartesianToLonLatHeight(result.position)[2];
          l.map((p) => {
            let b = Utils.cartesianToLonLatHeight(p)[2];
            if (b < h) {
              p.shadow = p.shadow ? ++p.shadow : 1;
              p.SScondition[timeOrder] = 0; //1632
            } else {
              p.sunshine = p.sunshine ? ++p.sunshine : 1;
              p.SScondition[timeOrder] = 1; //1632
            }
          });
        }
      });
      //对未串连余留的点进行日照分析
      singlePArr.map((p) => {
        if (p.underBuilding) {
          p.shadow = p.shadow ? ++p.shadow : 1;
          p.SScondition[timeOrder] = 0; //1632
          return;
        }
        const ray = new Cesium.Ray(p, sunDirection);
        const result = viewer.scene.pickFromRay(ray);
        window.score++;

        if (result && result.position) {
          p.shadow = p.shadow ? ++p.shadow : 1;
          p.SScondition[timeOrder] = 0; //1632
        } else {
          p.sunshine = p.sunshine ? ++p.sunshine : 1;
          p.SScondition[timeOrder] = 1; //1632
        }
      });
      console.timeEnd('点的运算');
    });
    ter.clear();
    points_3d.map((i) => {
      //画上所有的点。
      i.map((p) => {
        let sunshineRatio = (parseInt(p.sunshine) || 0) / this.timeArr.length;
        // // console.log('sunshineRatio', sunshineRatio)
        this._dP(p, sunshineRatio);
      });
    });
    console.timeEnd('新算法总运算');
  }

  _dL(points, ratio = 1, dash = false) {
    let index = parseInt(ratio / 0.2);
    index = index == 5 ? 4 : index;
    let color = getColor(index / 4); //colorRamp[index]
    const { dataSource } = this.prop;
    dataSource.entities.add({
      polyline: {
        positions: points,
        width: 3,
        material: color
      }
    });
  }
  _dP(p, ratio = 1, selected = false) {
    console.assert(ratio >= 0 && ratio <= 1, `光照率在区间外，${ratio}`);
    let color = getColor(ratio); //colorRamp[index]
    let index = parseInt(ratio / 0.2); //[0,0.2),[0.2,0.4)……[0.8,1]如此五档。

    index = index == 5 ? 4 : index;
    let points = this.primitives[index]; // this.prop.primitives//this.primitives[index];
    // let color = getColor(index/4)//colorRamp[index]

    let lastSelectPoint =
      points &&
      points.add({
        position: p,
        color: color,
        pixelSize: selected ? 20 : null,
        outlineWidth: selected ? 2 : null,
        id: Cesium.createGuid() + '**:' + ratio
      });
    if (selected) this.lastSelectPoint = lastSelectPoint;
  }
  _dB(p, { x, y, z }, n = 1) {
    const { dataSource } = this.prop;
    let dimentions = new Cesium.Cartesian3(x, y, z);
    dataSource.entities.add({
      position: p,
      box: {
        dimensions: dimentions,
        fill: false,
        outline: true,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: n
      }
    });
  }
  _pointShow(show) {
    this.primitives.map((pri) => {
      pri.show = show;
    });
  }

  setPeriod(start, end) {
    //accept two type of time,Date and JulianDate.
    let s, e;
    if (start instanceof Date && end instanceof Date) {
      let a = Cesium.JulianDate.fromDate;
      (s = a(start, s)), (e = a(end, e));
    } else if (
      start instanceof Cesium.JulianDate &&
      end instanceof Cesium.JulianDate
    ) {
      [s, e] = [start, end];
    } else {
      console.error('encounter error in settimeInterval');
      return;
    }
    let check = Cesium.JulianDate.greaterThan(e, s);
    check
      ? (this.period = [s, e])
      : console.error('start should great than end in time');
  }
  clear() {
    let { dataSource } = this.prop;
    let primitives = this.primitives;
    this.drawControl.clearDraw();
    dataSource.entities.removeAll();
    for (let i of primitives) {
      i.removeAll();
    }
    let handler = this.drawControl.drawCtrl['billboard'].getHandler();
    handler.removeInputAction(2);
  }

  destroy() {}
}

/**
 * 天气控制。该类有别于上，暂放于此。
 */
/**demo  let wea = new Weather(viewer); wea.showRain();wea.showSnow();wea.removeStage(); wea.rainfall(num)分别：雨、雪、关闭。调节雨量
 *  */
class Weather {
  constructor(viewer) {
    // console.log('weather init')
    this.viewer = viewer;
    this.lastStage = null;
    this.speed_r = 2;
    this.speed_s = 2;
    this.size = 0.0;
    this.depth = 0.9;
    this.density = 7;
    this.brightness_r = 0.35;
    this.brightness_s = 0.35;
    this.hidden = false;
  }
  showSnow() {
    if (this.snowStage) return;
    var snow = new Cesium.PostProcessStage({
      name: 'czm_snow',
      uniforms: {
        speed: () => {
          return this.speed_s;
        },
        size: () => {
          return this.size; //0.02 0.03
        },
        depth: () => {
          return this.depth; //0.9||0
        },
        brightness: () => {
          return this.brightness_s; //0~1   越大越暗。
        },
        hidden: () => {
          return this.hidden ? 0 : 1; //ture是隐藏，false是显示。
        }
      },
      fragmentShader: this.getSnowShader()
    });
    this.viewer.scene.postProcessStages.add(snow);
    this.snowStage = snow;
    this.addHeightDetect();
  }
  showRain() {
    // this.removeStage();
    if (this.rainStage) return;
    var rain = new Cesium.PostProcessStage({
      name: 'czm_rain',
      uniforms: {
        speed: () => {
          return this.speed_r; //1,2,3,4
        },
        density: () => {
          return this.density; //2~10   2 4.5 7 10
        },
        brightness: () => {
          return this.brightness_r; //0~1   越大越暗。
        },
        hidden: () => {
          return this.hidden ? 0 : 1; //ture是隐藏，false是显示。
        }
      },
      fragmentShader: this.getRainShader()
    });
    this.viewer.scene.postProcessStages.add(rain);
    this.rainStage = rain;
    this.addHeightDetect();
  }
  addHeightDetect() {
    //高于50000米，则阴藏雨雪
    //对camara['_positionCartographic']的height属性setter进行拦截
    let locationData = this.viewer.scene.camera.positionCartographic;
    let v = locationData.height;
    if (v > 50000 || !v) {
      this.hidden = true;
    } else {
      this.hidden = false;
    }
    let _this = this;
    Object.defineProperty(this.viewer.scene.camera, '_positionCartographic', {
      get: function () {
        return this.__positionCartographic;
      },
      set: function (val) {
        this.__positionCartographic = val;
        if (val?.height < 50000) {
          _this.hidden = false;
        } else {
          _this.hidden = true;
        }
      }
    });
    this.viewer.scene.camera['_positionCartographic'] = locationData;
  }
  removeHeightDetect() {
    Object.defineProperty(this.viewer.scene.camera, '_positionCartographic', {
      get: function () {
        return this.__positionCartographic;
      },
      set: function (val) {
        this.__positionCartographic = val;
      }
    });
  }
  rainfall(num) {
    //1、2、3、4，雨量越大
    this.showRain();
    if (num == 1) {
      this.speed_r = 0.5;
      this.density = 20;
    } else if (num == 2) {
      this.speed_r = 2;
      this.density = 7;
    } else if (num == 3) {
      this.speed_r = 3;
      this.density = 4.5;
    } else {
      this.speed_r = 4;
      this.density = 2;
    }
  }
  snowfall(num) {
    //1、2、3、4，雪量越大
    this.showSnow();
    if (num == 1) {
      this.speed_s = 1;
      this.size = 0.0;
      this.depth = 0.0;
      this.brightness_s = 0.35;
    } else if (num == 2) {
      this.speed_s = 2;
      this.size = 0.0;
      this.depth = 0.0;
      this.brightness_s = 0.45;
    } else if (num == 3) {
      this.speed_s = 3;
      this.size = 0.02;
      this.depth = 0.8;
      this.brightness_s = 0.5;
    } else {
      this.speed_s = 4;
      this.size = 0.03;
      this.depth = 0.9;
      this.brightness_s = 0.5;
    }
  }
  removeRainStage() {
    this.viewer.scene.postProcessStages.remove(this.rainStage);
    this.rainStage = null;
    if (!this.rainStage && !this.snowStage) this.removeHeightDetect();
  }
  removeSnowStage() {
    this.viewer.scene.postProcessStages.remove(this.snowStage);
    this.snowStage = null;
    if (!this.rainStage && !this.snowStage) this.removeHeightDetect();
  }
  removeStage() {
    this.removeRainStage();
    this.removeSnowStage();
  }
  getSnowShader() {
    return 'uniform sampler2D colorTexture;\n\
                          varying vec2 v_textureCoordinates;\n\
                          uniform float speed;\n\
                          uniform float size;\n\
                          uniform float depth;\n\
                          uniform float brightness;\n\
                          uniform float hidden;\n\
                      \n\
                          float snow(vec2 uv,float scale)\n\
                          {\n\
                              float time = czm_frameNumber / 160.0 *speed;\n\
                              float w=smoothstep(1.,0.,-uv.y*(scale/10.));if(w<.1)return 0.;\n\
                              uv+=time/scale;uv.y+=time*2./scale;uv.x+=sin(uv.y+time*.5)/scale;\n\
                              uv*=scale;vec2 s=floor(uv),f=fract(uv),p;float k=3.,d;\n\
                              p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;d=length(p);k=min(d,k);\n\
                              k=smoothstep(size,k,sin(f.x+f.y)*0.01);\n\
                              return k*w;\n\
                          }\n\
                      \n\
                          void main(void){\n\
                              vec2 resolution = czm_viewport.zw;\n\
                              vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
                              vec3 finalColor=vec3(0);\n\
                              float c = 0.0;\n\
                              c+=snow(uv,30.)*.0;\n\
                              c+=snow(uv,20.)*depth*0.5;\n\
                              c+=snow(uv,15.)*depth;\n\
                              c+=snow(uv,10.);\n\
                              c+=snow(uv,8.);\n\
                          c+=snow(uv,6.);\n\
                              c+=snow(uv,5.);\n\
                              finalColor=(vec3(c)); \n\
                              gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), brightness*hidden); \n\
                      \n\
                          }\n\
                      ';
  }
  getRainShader() {
    return `uniform sampler2D colorTexture;\n\
                   varying vec2 v_textureCoordinates;\n\
                   uniform float speed;\n\
                   uniform float density;\n\
                   uniform float brightness;\n\
                   uniform float hidden;\n\
               \n\
                   float hash(float x){\n\
                       return fract(sin(x*133.3)*13.13);\n\
               }\n\
               \n\
               void main(void){\n\
               \n\
                   float time = czm_frameNumber /160.0 * speed;\n\
               vec2 resolution = czm_viewport.zw;\n\
               \n\
               vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
               vec3 c=vec3(.6,.7,.8);\n\
               \n\
               float a=-.4;\n\
               float si=sin(a),co=cos(a);\n\
               uv*=mat2(co,-si,si,co);\n\
               uv*=length(uv+vec2(0,4.9))*.3+1.;\n\
               \n\
               float v=1.-clamp(sin(hash(floor(uv.x*100.))*2.) * density,-1.,1.);\n\
               float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.98,0.,1.)*50.;\n\
               c*=v*b; \n\
               \n\
               gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c,1), brightness*hidden);  \n\
               }\n\
               `;
  }
}

export {
  VisibleAnalysis,
  ViewShedAnalysis,
  SunAnalysis,
  ControlHeightAnalysis,
  SkyLineAnalysis,
  TerrainAnalysis,
  FloodAnalysis,
  ClipAnalysis,
  ShadowRatioAnalysis,
  Weather,
  Utils
};
