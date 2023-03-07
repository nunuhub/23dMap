/**
 * @Author han
 * @Date 2020/11/9 16:29
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as CircleAttr from './EntityAttr/CircleAttr30';
import { DrawPolyline } from './DrawPolyline8';
import { EditCircle } from '../Edit/EditCircle46';

/**
 * 绘制圆环类
 * @extends DrawBase.DrawPolyline
 * @memberOf DrawBase.DrawPolyline
 */
class DrawCircle extends DrawPolyline {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'ellipse';
    this._minPointNum = 2;
    this._maxPointNum = 2;
    this.editClass = EditCircle;
    this.attrClass = CircleAttr;
  }

  /**
   * 获取绘制的坐标数组
   * @param time
   * @returns {[position]}
   */
  getShowPosition() {
    if (this._positions_draw && this._positions_draw.length > 1)
      return this._positions_draw[0];
    return null;
  }

  /**
   * 根据attribute参数创建Entity
   * @param attribute
   * @returns {entity}
   */
  createFeature(attribute) {
    this._positions_draw = [];

    if (attribute.type === 'ellipse')
      //椭圆
      this._maxPointNum = 3;
    //圆
    else this._maxPointNum = 2;

    let that = this;
    let addattr = {
      position: new Cesium.CallbackProperty(function (time) {
        return that.getShowPosition(time);
      }, false),
      ellipse: CircleAttr.style2Entity(attribute.style),
      attribute: attribute
    };

    addattr.polyline = {
      clampToGround: attribute.style.clampToGround,
      show: false
    };
    this.entity = this.dataSource.entities.add(addattr); //创建要素对象
    this.entity.mark311 = this.drawTool.id;
    this.bindOutline(this.entity); //边线
    return this.entity;
  }
  /**
   * 绑定outline
   * @param entity
   */
  bindOutline(entity) {
    //是否显示：边线宽度大于1时
    entity.polyline.show = new Cesium.CallbackProperty(function (time) {
      return (
        entity.ellipse.outline &&
        entity.ellipse.outline.getValue(time) &&
        entity.ellipse.outlineWidth &&
        entity.ellipse.outlineWidth.getValue(time) > 1
      );
    }, false);
    entity.polyline.width = new Cesium.CallbackProperty(function (time) {
      return (
        entity.ellipse.outlineWidth &&
        entity.ellipse.outlineWidth.getValue(time)
      );
    }, false);
    //同步其贴地状态。
    entity.polyline.clampToGround = new Cesium.CallbackProperty(function () {
      return entity.attribute.style.clampToGround;
    }, false);
    entity.polyline.zIndex = new Cesium.CallbackProperty(function () {
      return entity.ellipse.zIndex && entity.ellipse.zIndex.getValue();
    }, false);
    entity.polyline.material = new Cesium.ColorMaterialProperty(
      new Cesium.CallbackProperty(function (time) {
        return entity.ellipse.outlineColor.getValue(time) || Cesium.Color.WHITE;
      }, false)
    );
    entity.polyline.positions = new Cesium.CallbackProperty(function () {
      let center, xSemiAxis, ySemiAxis, height, rotation;
      center = entity.position.getValue();
      xSemiAxis = entity.ellipse.semiMajorAxis;
      ySemiAxis = entity.ellipse.semiMinorAxis;
      height = entity.ellipse.height && entity.ellipse.height.getValue();
      rotation = entity.ellipse.rotation && entity.ellipse.rotation.getValue();
      if (!center || !xSemiAxis || !ySemiAxis) return;
      var ellipse = new Cesium.EllipseOutlineGeometry({
        center,
        semiMajorAxis: xSemiAxis,
        semiMinorAxis: ySemiAxis,
        height,
        rotation
      });
      var geometry = Cesium.EllipseOutlineGeometry.createGeometry(ellipse);
      let points = [];
      let pointNumber = geometry.indices.length / 2;
      let vs = geometry.attributes.position.values;
      for (let i = 0; i < pointNumber; i++) {
        let p = { x: vs[3 * i], y: vs[3 * i + 1], z: vs[3 * i + 2] };
        points[i] = p;
      }
      points.push(points[0]);
      return points;
    }, false);
  }
  /**
   * 属性转entity
   * @param style
   * @param entity
   * @returns {entity}
   */
  style2Entity(style, entity) {
    return CircleAttr.style2Entity(style, entity.ellipse);
  }

  /**
   * 编辑样式更新
   */
  updateAttrForDrawing(isLoad) {
    if (!this._positions_draw) return;

    if (isLoad) {
      this.addPositionsForRadius(this._positions_draw);
      return;
    }

    if (this._positions_draw.length < 2) return;

    let style = this.entity.attribute.style;

    //高度处理
    if (!style.clampToGround) {
      let height = this.formatNum(
        Cesium.Cartographic.fromCartesian(this._positions_draw[0]).height,
        2
      );
      this.entity.ellipse.height = height;
      style.height = height;

      if (style.extrudedHeight) {
        this.entity.ellipse.extrudedHeight =
          height + Number(style.extrudedHeight);
      }
    }

    //半径处理
    let radius = this.formatNum(
      Cesium.Cartesian3.distance(
        this._positions_draw[0],
        this._positions_draw[1]
      ),
      2
    );
    this.entity.ellipse.semiMinorAxis = radius; //短半轴

    if (this._maxPointNum === 3) {
      //长半轴
      let semiMajorAxis;
      if (this._positions_draw.length === 3) {
        semiMajorAxis = this.formatNum(
          Cesium.Cartesian3.distance(
            this._positions_draw[0],
            this._positions_draw[2]
          ),
          2
        );
      } else {
        semiMajorAxis = radius;
      }
      this.entity.ellipse.semiMajorAxis = Math.max(radius, semiMajorAxis);

      // style.semiMinorAxis = radius
      // style.semiMajorAxis = semiMajorAxis
      // todo 待测试，长半轴【必须大于或者等于】短半轴
      style.semiMajorAxis = Math.max(radius, semiMajorAxis);
      style.semiMinorAxis = Math.min(radius, semiMajorAxis);
    } else {
      this.entity.ellipse.semiMajorAxis = radius;

      style.radius = radius;
    }
  }

  /**
   * 增加坐标
   * @param position
   */
  addPositionsForRadius(position) {
    this._positions_draw = [position];

    let style = this.entity.attribute.style;

    //获取椭圆上的坐标点数组
    let cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions(
      {
        center: position,
        semiMajorAxis: this.entity.ellipse.semiMajorAxis.getValue(
          this.viewer.clock.currentTime
        ), //长半轴
        semiMinorAxis: this.entity.ellipse.semiMinorAxis.getValue(
          this.viewer.clock.currentTime
        ), //短半轴
        rotation: Cesium.Math.toRadians(Number(style.rotation || 0)),
        granularity: 2.0
      },
      true,
      false
    );

    //长半轴上的坐标点
    let majorPos = new Cesium.Cartesian3(
      cep.positions[0],
      cep.positions[1],
      cep.positions[2]
    );
    this._positions_draw.push(majorPos);

    if (this._maxPointNum === 3) {
      //椭圆
      //短半轴上的坐标点
      let minorPos = new Cesium.Cartesian3(
        cep.positions[3],
        cep.positions[4],
        cep.positions[5]
      );
      this._positions_draw.push(minorPos);
    }
  }

  /**
   * 图形绘制结束后调用
   */
  finish() {
    let entity = this.entity;

    entity.editing = this.getEditClass(entity); //绑定编辑对象

    entity._positions_draw = this._positions_draw;
    //this.entity.position = this.getShowPosition()
    entity.position = new Cesium.CallbackProperty(function () {
      if (entity._positions_draw && entity._positions_draw.length > 0)
        return entity._positions_draw[0];
      return null;
    }, false);
  }
}

export { DrawCircle };
