/**
 * Created by FDD on 2017/5/22.
 * @desc 标绘画弓形算法，继承线要素相关方法和属性
 */
import { Map } from 'ol';
import { LineString } from 'ol/geom';
import { ARC } from '../../Utils/PlotTypes';
import * as PlotUtils from '../../Utils/utils';
import { DEF_STYEL } from '../../Constants';
import { Stroke, Style } from 'ol/style';
import { pushArrowToLine } from '../../../olPlot/Utils/arrowUtils';
class Arc extends LineString {
  constructor(coordinates, points, params) {
    super([]);
    this.type = ARC;
    this.fixPointCount = 3;
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
    const count = this.getPointCount();
    if (count < 2) return;
    if (count === 2) {
      this.setCoordinates(this.points);
    } else {
      let [pnt1, pnt2, pnt3, startAngle, endAngle] = [
        this.points[0],
        this.points[1],
        this.points[2],
        null,
        null
      ];
      const center = PlotUtils.getCircleCenterOfThreePoints(pnt1, pnt2, pnt3);
      const radius = PlotUtils.MathDistance(pnt1, center);
      const angle1 = PlotUtils.getAzimuth(pnt1, center);
      const angle2 = PlotUtils.getAzimuth(pnt2, center);
      if (PlotUtils.isClockWise(pnt1, pnt2, pnt3)) {
        startAngle = angle2;
        endAngle = angle1;
      } else {
        startAngle = angle1;
        endAngle = angle2;
      }
      this.setCoordinates(
        PlotUtils.getArcPoints(center, radius, startAngle, endAngle)
      );
    }
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
    var styleFunction = feature => {
      var geometry = feature.getGeometry();
      var styles = [];
      let arrowSize = 0;
      if (this.style.type === 'polyline') {
        styles.push(
          new Style({
            zIndex: this.style.zIndex,
            stroke: new Stroke({
              color: this.style.stroke,
              width: this.style.width
            })
          })
        );
        arrowSize = this.style.width;
      } else {
        styles.push(
          new Style({
            zIndex: this.style.zIndex,
            stroke: new Stroke({
              color: this.style.stroke,
              width: this.style.width,
              lineCap: 'butt',
              lineDash: [this.style.dashHeight, this.style.dashDivide],
              lineDashOffset: this.style.dashDivide
            })
          })
        );
        arrowSize = this.style.width;
      }
      this.style.arrow.triangleArrowSize = arrowSize;
      pushArrowToLine(styles, geometry, this.style, this.map);
      return styles;
    };
    return styleFunction;
  }
}

export default Arc;
