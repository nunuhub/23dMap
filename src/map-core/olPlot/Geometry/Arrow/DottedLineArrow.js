import { Map } from 'ol';
import { LineString } from 'ol/geom';

import { DOTTED_ARROW } from '../../Utils/PlotTypes';
import { Stroke, Style } from 'ol/style';
import { DEF_STYEL } from '../../Constants';
import { pushArrowToLine } from '../../../olPlot/Utils/arrowUtils';
class Polyline extends LineString {
  constructor(coordinates, points, params) {
    super([]);
    this.type = DOTTED_ARROW;
    this.freehand = false;
    this.style = DEF_STYEL;
    this.set('params', params);
    if (points && points.length > 0) {
      this.setPoints(points);
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

  /**
   * 执行动作
   */
  generate() {
    this.setCoordinates(this.points);
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
   * @returns {ol.Map|*}
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
    /* return new Style({
      stroke: new Stroke({
        color: this.style.dashStroke,
        width: this.style.dashWidth,
        lineDash: [this.style.dashHeight, this.style.dashDivide],
        lineDashOffset: this.style.dashDivide
      })
    }) */
    var styleFunction = feature => {
      var geometry = feature.getGeometry();
      var styles = [
        // linestring
        new Style({
          zIndex: this.style.zIndex,
          stroke: new Stroke({
            color: this.style.dashStroke,
            width: this.style.dottedArrowWidth,
            lineCap: 'butt',
            lineDash: [this.style.dottedArrowHeight, this.style.dashDivide],
            lineDashOffset: this.style.dashDivide
          })
        })
      ];
      this.style.stroke = this.style.dashStroke;
      this.style.arrow.triangleArrowSize = this.style.dottedArrowWidth;
      this.style.arrow.showArrow = this.style.arrow.arrowShowArrow;
      pushArrowToLine(styles, geometry, this.style, this.map);
      return styles;
    };
    return styleFunction;
  }
}

export default Polyline;
