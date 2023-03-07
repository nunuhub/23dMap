/**
 * @Author han
 * @Date 2020/11/10 13:57
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as CylinderAttr from './EntityAttr/CylinderAttr47';

import { DrawPolyline } from './DrawPolyline8';
import { addPositionsHeight } from '../Tool/Point2';
import { EditCylinder } from '../Edit/EditCylinder75';

/**
 * 绘制圆锥体类
 * @extends DrawBase.DrawPolyline
 * @memberOf DrawBase.DrawPolyline
 */
class DrawCylinder extends DrawPolyline {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'cylinder';
    this._minPointNum = 2;
    this._maxPointNum = 2;
    this.editClass = EditCylinder;
    this.attrClass = CylinderAttr;
  }

  /**
   * 获取绘制的坐标数组
   * @param time
   * @returns {[position]}
   */
  getShowPosition(time) {
    if (this._positions_draw && this._positions_draw.length > 1)
      return addPositionsHeight(
        this._positions_draw[0],
        this.entity.cylinder.length.getValue(time) / 2
      );
    return null;
  }

  /**
   * 根据attribute参数创建Entity
   * @param attribute
   * @returns {entity}
   */
  createFeature(attribute) {
    this._positions_draw = [];

    let that = this;
    let addattr = {
      position: new Cesium.CallbackProperty(function (time) {
        return that.getShowPosition(time);
      }, false),
      cylinder: CylinderAttr.style2Entity(attribute.style),
      attribute: attribute
    };

    this.entity = this.dataSource.entities.add(addattr); //创建要素对象
    this.entity.mark311 = this.drawTool.id;
    return this.entity;
  }

  /**
   * 属性转entity
   * @param style
   * @param entity
   * @returns {entity}
   */
  style2Entity(style, entity) {
    return CylinderAttr.style2Entity(style, entity.cylinder);
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

    // let style = this.entity.attribute.style;

    //半径处理
    this.entity.cylinder.bottomRadius = this.formatNum(
      Cesium.Cartesian3.distance(
        this._positions_draw[0],
        this._positions_draw[1]
      ),
      2
    );
  }

  /**
   * 增加坐标
   * @param position
   */
  addPositionsForRadius(position) {
    this._positions_draw = [position];

    // let style = this.entity.attribute.style

    //获取椭圆上的坐标点数组
    let bottomRadius = this.entity.cylinder.bottomRadius.getValue(
      this.viewer.clock.currentTime
    );
    let cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions(
      {
        center: position,
        semiMajorAxis: bottomRadius, //长半轴
        semiMinorAxis: bottomRadius, //短半轴
        rotation: 0,
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
  }

  /**
   * 图形绘制结束后调用
   */
  finish() {
    let entity = this.entity;

    entity.editing = this.getEditClass(entity); //绑定编辑对象

    entity._positions_draw = this._positions_draw;
    //this.entity.position = this.getShowPosition()
    entity.position = new Cesium.CallbackProperty(function (time) {
      if (entity._positions_draw && entity._positions_draw.length > 0)
        return addPositionsHeight(
          entity._positions_draw[0],
          entity.cylinder.length.getValue(time) / 2
        );
      return null;
    }, false);
  }
}

export { DrawCylinder };
