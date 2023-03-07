/**
 * Created by FDD on 2017/5/15.
 * @desc 点要素
 */
import { Map } from 'ol';
import { Point as $Point } from 'ol/geom';
import { POINT } from '../../Utils/PlotTypes';
import { Fill, Stroke, Style, Circle, Icon } from 'ol/style';
import { DEF_STYEL } from '../../Constants';
import * as PointTypes from './PointTypes.js';

class Point extends $Point {
  constructor(coordinates, point, params) {
    super([]);
    this.type = POINT;
    this.options = params || {};
    this.style = DEF_STYEL;
    this.set('params', this.options);
    this.fixPointCount = 1;
    this.img = new Image();
    if (point && point.length > 0) {
      this.setPoints(point);
    } else if (coordinates && coordinates.length > 0) {
      this.setCoordinates(coordinates);
    }
  }

  /**
   * 获取标绘类型
   * @returns {*}
   */
  getPlotType() {
    return this.type;
  }

  generate() {
    let pnt = this.points[0];
    this.setCoordinates(pnt);
  }

  /**
   * 设置地图对象
   * @param map
   */
  setMap(map) {
    if (map && map instanceof Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
  }

  /**
   * 获取当前地图对象
   * @returns {{}|*}
   */
  getMap() {
    return this.map;
  }

  /**
   * 判断是否是Plot
   * @returns {boolean}
   */
  isPlot() {
    return true;
  }

  /**
   * 设置坐标点
   * @param value
   */
  setPoints(value) {
    this.points = !value ? [] : value;
    if (this.points.length >= 1) {
      this.generate();
    }
  }

  /**
   * 获取坐标点
   * @returns {Array.<T>}
   */
  getPoints() {
    return this.points.slice(0);
  }

  /**
   * 获取点数量
   * @returns {Number}
   */
  getPointCount() {
    return this.points.length;
  }

  /**
   * 更新当前坐标
   * @param point
   * @param index
   */
  updatePoint(point, index) {
    if (index >= 0 && index < this.points.length) {
      this.points[index] = point;
      this.generate();
    }
  }

  /**
   * 更新最后一个坐标
   * @param point
   */
  updateLastPoint(point) {
    this.updatePoint(point, this.points.length - 1);
  }

  /**
   * 结束绘制
   */
  finishDrawing() {}

  setStyle(style) {
    this.style = JSON.parse(JSON.stringify(style));
  }

  getStyle() {
    switch (this.style.point.type) {
      case PointTypes.CIRCLE:
        return new Style({
          zIndex: this.style.zIndex,
          image: new Circle({
            fill: new Fill({
              color: this.style.fill
            }),
            stroke: new Stroke({
              color: this.style.polyStroke,
              width: this.style.strokeWidth
            }),
            radius: this.style.radius
          })
        });
      case PointTypes.IMAGE:
        var src = this.style.point.src;
        var originSize = this.style.point.originSize;
        var targeSize = this.style.point.size;
        var scale = targeSize / originSize;
        var rotation = ((2 * Math.PI) / 360) * this.style.point.rotation;
        return new Style({
          zIndex: this.style.zIndex,
          image: new Icon({
            color: this.style.point.color,
            opacity: this.style.point.opacity ? this.style.point.opacity : 1,
            scale: scale,
            src: src,
            rotation: rotation
          })
        });
    }
  }
}

export default Point;
