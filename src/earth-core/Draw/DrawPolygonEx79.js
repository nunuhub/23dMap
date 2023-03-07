/**
 * @Author han
 * @Date 2020/11/10 16:20
 */

import * as Cesium from 'cesium_shinegis_earth';
import { DrawPolygon } from './DrawPolygon43';

/**
 * 绘制面ex类
 * @extends DrawBase.DrawPolygon
 * @memberOf DrawBase.DrawPolygon
 */
class DrawPolygonEx extends DrawPolygon {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this._positions_show = null;
  }

  /**
   * 获取绘制坐标数组
   * @returns {[position]}
   */
  getDrawPosition() {
    return this._positions_show;
  }

  /**
   * 编辑样式更新
   */
  updateAttrForDrawing() {
    if (
      this._positions_draw == null ||
      this._positions_draw.length < this._minPointNum
    ) {
      this._positions_show = this._positions_draw;
      return;
    }

    this._positions_show = this.getShowPositions(
      this._positions_draw,
      this.entity.attribute
    );
  }

  /**
   * 子类中重写 ，根据标绘绘制的点，生成显示的边界点
   * @param positions
   * @param attribute
   * @returns {position}
   */
  getShowPositions(positions) {
    return positions;
  }

  /**
   * 图形绘制结束后调用
   */
  finish() {
    let entity = this.entity;

    entity.editing = this.getEditClass(entity); //绑定编辑对象

    //抛弃多余的无效绘制点
    if (this._positions_draw.length > this._maxPointNum)
      this._positions_draw.splice(
        this._maxPointNum,
        this._positions_draw.length - this._maxPointNum
      );

    this.entity._positions_draw = this._positions_draw;
    this.entity._positions_show = this._positions_show;

    entity.polygon.hierarchy = new Cesium.CallbackProperty(function () {
      let positions = entity._positions_show;
      return new Cesium.PolygonHierarchy(positions);
    }, false);

    this._positions_draw = null;
    this._positions_show = null;
  }

  /**
   * entity转换为给JSON
   * @param entity
   * @returns {{geometry: {coordinates: [*], type: string}, type: string, properties}}
   */
  toGeoJSON(entity) {
    return this.attrClass.toGeoJSON(entity, true); //不用闭合最后一个点
  }
}

export { DrawPolygonEx };
