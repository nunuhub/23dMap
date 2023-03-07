/**
 * Created by FDD on 2017/5/22.
 * @desc 标绘画圆算法，继承面要素相关方法和属性
 */
import { Map } from 'ol';
import { Polygon } from 'ol/geom';
import { CIRCLE } from '../../Utils/PlotTypes';
import * as PlotUtils from '../../Utils/utils';
import { DEF_STYEL } from '../../Constants';
import { Style } from 'ol/style';
class Circle extends Polygon {
  constructor(coordinates, points, params) {
    super([]);
    this.type = CIRCLE;
    this.fixPointCount = 2;
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

  generate() {
    let count = this.getPointCount();
    if (count < 2) {
      return false;
    } else {
      let center = this.points[0];
      let radius = PlotUtils.MathDistance(center, this.points[1]);
      this.setCoordinates([this.generatePoints(center, radius)]);
    }
  }

  /**
   * 对圆边线进行插值
   * @param center
   * @param radius
   * @returns {null}
   */
  generatePoints(center, radius) {
    let [x, y, angle, points] = [null, null, null, []];
    for (let i = 0; i <= 100; i++) {
      angle = (Math.PI * 2 * i) / 100;
      x = center[0] + radius * Math.cos(angle);
      y = center[1] + radius * Math.sin(angle);
      points.push([x, y]);
    }
    return points;
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
    let style = new Style({
      zIndex: this.style.zIndex,
      renderer: (_coords, state) => {
        try {
          const ctx = state.context;
          var geom = state.geometry;
          // 计算渐变分辨率
          let extent = geom.getExtent();
          let pixel1 = this.map.getPixelFromCoordinate([extent[0], extent[1]]);
          let pixel2 = this.map.getPixelFromCoordinate([extent[2], extent[3]]);
          let center = [
            (pixel2[0] + pixel1[0]) / 2,
            (pixel2[1] + pixel1[1]) / 2
          ];
          let radius = (pixel2[0] - pixel1[0]) / 2;
          if (this.style.isGradient) {
            // 生成渐变配置
            var grad = ctx.createRadialGradient(
              center[0] * state.pixelRatio,
              center[1] * state.pixelRatio,
              0,
              center[0] * state.pixelRatio,
              center[1] * state.pixelRatio,
              radius * state.pixelRatio * 1.5
            );
            for (let gradient of this.style.gradients) {
              grad.addColorStop(1 - gradient.offset, gradient.color);
            }
            ctx.fillStyle = grad;
          } else {
            ctx.fillStyle = this.style.fill;
          }
          if (this.style.type === 'polyline') {
            ctx.lineDashOffset = 0;
            ctx.setLineDash([]);
          } else {
            ctx.lineDashOffset = this.style.dashDivide;
            ctx.setLineDash([this.style.dashHeight, this.style.dashDivide]);
          }

          ctx.strokeStyle = this.style.polyStroke;
          ctx.lineWidth = this.style.strokeWidth;
          // console.log('circle', style)
          // 阴影
          if (this.style.shadow && this.style.shadow.isShow) {
            ctx.shadowBlur = this.style.shadow.blur;
            ctx.shadowColor = this.style.shadow.color;
          } else {
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'rbga(0, 0, 0, 0)';
          }
          // 绘制
          let coordinates = _coords[0];
          let startPoint = coordinates[0];
          ctx.beginPath();
          ctx.moveTo(startPoint[0], startPoint[1]);

          for (var i = 1; i < coordinates.length; i++) {
            let coordinate = coordinates[i];
            ctx.lineTo(coordinate[0], coordinate[1]);
            // console.log(coordinate[0], coordinate[1]);
          }

          ctx.fill();
          ctx.stroke();

          // 还原canvas
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'rbga(0, 0, 0, 0)';
        } catch (e) {}
      }
    });
    return style;
  }
}

export default Circle;
