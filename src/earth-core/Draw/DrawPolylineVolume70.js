/**
 * @Author han
 * @Date 2020/11/10 13:21
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as PolyLineVolumeAttr from './EntityAttr/PolyLineVolumeAttr39';
import { DrawPolyline } from './DrawPolyline8';
import { EditPolylineVolume } from '../Edit/EditPolylineVolume40';

/**
 * 绘制多边形体类
 * @extends DrawBase.DrawPolyline
 * @memberOf DrawBase.DrawPolyline
 */
class DrawPolylineVolume extends DrawPolyline {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'polylineVolume';
    this._minPointNum = 2;
    this._maxPointNum = 9999;
    this.editClass = EditPolylineVolume;
    this.attrClass = PolyLineVolumeAttr;
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
      polylineVolume: PolyLineVolumeAttr.style2Entity(attribute.style),
      attribute: attribute
    };
    addattr.polylineVolume.positions = new Cesium.CallbackProperty(function () {
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
    return PolyLineVolumeAttr.style2Entity(style, entity.polylineVolume);
  }

  /**
   * 编辑样式更新
   */
  updateAttrForDrawing() {}

  /**
   * 图形绘制结束后调用
   */
  finish() {
    let entity = this.entity;

    entity.editing = this.getEditClass(entity); //绑定编辑对象

    entity._positions_draw = this.getDrawPosition();
    entity.polylineVolume.positions = new Cesium.CallbackProperty(function () {
      return entity._positions_draw;
    }, false);
  }
}

export { DrawPolylineVolume };
