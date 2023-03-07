/**
 * @Author han
 * @Date 2020/11/10 15:53
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as WallAttr from './EntityAttr/WallAttr50';
import { DrawPolyline } from './DrawPolyline8';
import { EditWall } from '../Edit/EditWall51';

/**
 * 墙壁绘制类
 * @extends DrawBase.DrawPolyline
 * @memberOf DrawBase.DrawPolyline
 */
class DrawWall extends DrawPolyline {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'wall';
    this._minPointNum = 2;
    this._maxPointNum = 9999;
    this.editClass = EditWall;
    this.attrClass = WallAttr;
    this.maximumHeights = null;
    this.minimumHeights = null;
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

    this.maximumHeights = [];
    this.minimumHeights = [];

    let that = this;
    let addattr = {
      wall: WallAttr.style2Entity(attribute.style),
      attribute: attribute
    };
    addattr.wall.positions = new Cesium.CallbackProperty(function () {
      return that.getDrawPosition();
    }, false);
    addattr.wall.minimumHeights = new Cesium.CallbackProperty(function () {
      return that.getMinimumHeights();
    }, false);
    addattr.wall.maximumHeights = new Cesium.CallbackProperty(function () {
      return that.getMaximumHeights();
    }, false);

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
    return WallAttr.style2Entity(style, entity.wall);
  }

  /**
   * 获取entity的最大高度
   * @param entity
   * @returns {[number]}
   */
  getMaximumHeights() {
    return this.maximumHeights;
  }

  /**
   * 获取entity的最小高度
   * @param entity
   * @returns {[number]}
   */
  getMinimumHeights() {
    return this.minimumHeights;
  }

  /**
   * 编辑样式更新
   */
  updateAttrForDrawing() {
    let style = this.entity.attribute.style;
    let position = this.getDrawPosition();
    let len = position.length;

    this.maximumHeights = new Array(len);
    this.minimumHeights = new Array(len);

    for (let i = 0; i < len; i++) {
      let height = Cesium.Cartographic.fromCartesian(position[i]).height;
      this.minimumHeights[i] = height;
      this.maximumHeights[i] = height + Number(style.extrudedHeight);
    }
  }

  /**
   * 图形绘制结束后调用
   */
  finish() {
    let entity = this.entity;

    entity.editing = this.getEditClass(entity); //绑定编辑对象
    window.editing = entity.editing;
    // this.entity.wall.positions = this.getDrawPosition()
    // this.entity.wall.minimumHeights = this.getMinimumHeights()
    // this.entity.wall.maximumHeights = this.getMaximumHeights()

    entity._positions_draw = this.getDrawPosition();
    entity.wall.positions = new Cesium.CallbackProperty(function () {
      return entity._positions_draw;
    }, false);

    entity._minimumHeights = this.getMinimumHeights();
    entity.wall.minimumHeights = new Cesium.CallbackProperty(function () {
      return entity._minimumHeights;
    }, false);

    entity._maximumHeights = this.getMaximumHeights();
    entity.wall.maximumHeights = new Cesium.CallbackProperty(function () {
      return entity._maximumHeights;
    }, false);
  }
}

export { DrawWall };
