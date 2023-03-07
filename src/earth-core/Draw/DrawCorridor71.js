/**
 * @Author han
 * @Date 2020/11/10 13:36
 */

import * as Cesium from 'cesium_shinegis_earth';
import { DrawPolyline } from './DrawPolyline8';
import { getMaxHeight } from '../Tool/Point2';
import * as CorridorAttr from './EntityAttr/CorridorAttr41';
import { EditCorridor } from '../Edit/EditCorridor42';

/**
 * 绘制走廊类
 * @extends DrawBase.DrawPolyline
 * @memberOf DrawBase.DrawPolyline
 */
class DrawCorridor extends DrawPolyline {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'corridor';
    this._minPointNum = 2;
    this._maxPointNum = 9999;
    this.editClass = EditCorridor;
    this.attrClass = CorridorAttr;
  }

  /**
   * 根据attribute参数创建Entity
   * @param attribute
   * @returns {entity}
   */
  createFeature(attribute) {
    this._positions_draw = [];

    if (!this._minPointNum_def) this._minPointNum_def = this._minPointNum;
    if (!this._maxPointNum_def) this._maxPointNum_def = this._maxPointNum;

    if (attribute.config) {
      //允许外部传入
      this._minPointNum = attribute.config.minPointNum || this._minPointNum_def;
      this._maxPointNum = attribute.config.maxPointNum || this._maxPointNum_def;
    } else {
      this._minPointNum = this._minPointNum_def;
      this._maxPointNum = this._maxPointNum_def;
    }

    let that = this;
    let addattr = {
      corridor: CorridorAttr.style2Entity(attribute.style),
      attribute: attribute
    };
    addattr.corridor.positions = new Cesium.CallbackProperty(function () {
      return that.getDrawPosition();
    }, false);

    this.entity = this.dataSource.entities.add(addattr); //创建要素对象
    this.entity.mark311 = this.drawTool.id;
    this.entity._positions_draw = this._positions_draw;

    return this.entity;
  }

  /**
   * 属性转entity
   * @param style
   * @param entity
   * @returns {entity}
   */
  style2Entity(style, entity) {
    return CorridorAttr.style2Entity(style, entity.corridor);
  }

  /**
   * 编辑样式更新
   */
  updateAttrForDrawing() {
    let style = this.entity.attribute.style;
    if (!style.clampToGround) {
      let maxHight = getMaxHeight(this.getDrawPosition());
      if (maxHight !== 0) {
        this.entity.corridor.height = maxHight;
        style.height = maxHight;

        if (style.extrudedHeight)
          this.entity.corridor.extrudedHeight =
            maxHight + Number(style.extrudedHeight);
      }
    }
  }

  /**
   * 图形绘制结束后调用
   */
  finish() {
    let entity = this.entity;

    entity.editing = this.getEditClass(entity); //绑定编辑对象

    entity._positions_draw = this.getDrawPosition();
    entity.corridor.positions = new Cesium.CallbackProperty(function () {
      return entity._positions_draw;
    }, false);
  }
}

export { DrawCorridor };
