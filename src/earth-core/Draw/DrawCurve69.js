/**
 * @Author han
 * @Date 2020/11/10 11:09
 */

import * as Cesium from 'cesium_shinegis_earth';
import { DrawPolyline } from './DrawPolyline8';
import { line2curve } from './EntityAttr/PolylineAttr15';
import { EditCurve } from '../Edit/EditCurve';

/**
 * 绘制曲线类
 * @extends DrawBase.DrawPolyline
 * @memberOf DrawBase.DrawPolyline
 */
class DrawCurve extends DrawPolyline {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'curve';
    this.editClass = EditCurve;
    this._positions_show = null;
  }

  /**
   * 获取绘制的坐标数组
   * @returns {[position]}
   */
  getDrawPosition() {
    return this._positions_show;
  }

  /**
   * 编辑样式更新
   */
  updateAttrForDrawing() {
    if (this._positions_draw == null || this._positions_draw.length < 3) {
      this._positions_show = this._positions_draw;
      return;
    }

    this._positions_show = line2curve(
      this._positions_draw,
      this.entity.attribute.style.closure
    );
  }

  /**
   * 图形绘制结束后调用
   */
  finish() {
    let entity = this.entity;

    entity.editing = this.getEditClass(entity); //绑定编辑对象

    this.entity._positions_draw = this._positions_draw;
    this.entity._positions_show = this._positions_show;

    entity.polyline.positions = new Cesium.CallbackProperty(function () {
      return entity._positions_show;
    }, false);

    this._positions_show = null;
  }
}

export { DrawCurve };
