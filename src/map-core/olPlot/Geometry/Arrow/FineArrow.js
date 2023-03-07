/**
 * Created by FDD on 2017/5/24.
 * @desc 粗单尖头箭头
 * @Inherits ol.geom.Polygon
 */
import { Map } from 'ol';
import { Polygon } from 'ol/geom';
import { FINE_ARROW } from '../../Utils/PlotTypes';
import * as PlotUtils from '../../Utils/utils';
import * as Constants from '../../Constants';
import { DEF_STYEL } from '../../Constants';
import * as ArrowTypes from '../Arrow/ArrowTypes';
import { getArrowStyle } from '../../../olPlot/Geometry/Arrow/arrowStyleUtils';
class FineArrow extends Polygon {
  constructor(coordinates, points, params) {
    super([]);
    this.type = FINE_ARROW;
    this.tailWidthFactor = 0.1;
    this.neckWidthFactor = 0.2;
    this.headWidthFactor = 0.25;
    this.headAngle = Math.PI / 8.5;
    this.neckAngle = Math.PI / 13;
    this.fixPointCount = 2;
    this.style = DEF_STYEL;
    this.arrowType = ArrowTypes.RIGHT;
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
    try {
      const cont = this.getPointCount();
      if (cont < 2) {
        return false;
      } else {
        const pnts = this.getPoints();
        const [pnt1, pnt2] = [pnts[0], pnts[1]];
        const len = PlotUtils.getBaseLength(pnts);
        const tailWidth = len * this.tailWidthFactor;
        const neckWidth = len * this.neckWidthFactor;
        const headWidth = len * this.headWidthFactor;
        if (Math.abs(pnt1[0] - pnt2[0]) < Math.abs(pnt1[1] - pnt2[1])) {
          if (pnt2[1] - pnt1[1] > 0) {
            this.arrowType = ArrowTypes.TOP;
          } else {
            this.arrowType = ArrowTypes.BOTTOM;
          }
        } else {
          if (pnt2[0] - pnt1[0] > 0) {
            this.arrowType = ArrowTypes.RIGHT;
          } else {
            this.arrowType = ArrowTypes.LEFT;
          }
        }
        const tailLeft = PlotUtils.getThirdPoint(
          pnt2,
          pnt1,
          Constants.HALF_PI,
          tailWidth,
          true
        );
        const tailRight = PlotUtils.getThirdPoint(
          pnt2,
          pnt1,
          Constants.HALF_PI,
          tailWidth,
          false
        );
        const headLeft = PlotUtils.getThirdPoint(
          pnt1,
          pnt2,
          this.headAngle,
          headWidth,
          false
        );
        const headRight = PlotUtils.getThirdPoint(
          pnt1,
          pnt2,
          this.headAngle,
          headWidth,
          true
        );
        const neckLeft = PlotUtils.getThirdPoint(
          pnt1,
          pnt2,
          this.neckAngle,
          neckWidth,
          false
        );
        const neckRight = PlotUtils.getThirdPoint(
          pnt1,
          pnt2,
          this.neckAngle,
          neckWidth,
          true
        );
        const pList = [
          tailLeft,
          neckLeft,
          headLeft,
          pnt2,
          headRight,
          neckRight,
          tailRight
        ];
        this.setCoordinates([pList]);
      }
    } catch (e) {
      console.log(e);
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
   * @returns {Map|*}
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
    return getArrowStyle(this.style, this.map, this.arrowType);
  }
}

export default FineArrow;
