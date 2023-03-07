/*
 * @Author: liujh
 * @Date: 2020/8/21 17:14
 * @Description:
 */

/* 22 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import { Class } from '../Tool/Class13';
import * as Util from '../Tool/Util3';
import * as EventType from './EventType7';
import { Tooltip } from '../Tool/ToolTip4';

/**
 * 绘制基础类
 * @class
 * @extends Class
 */
const DrawBase = Class.extend({
  type: null,
  dataSource: null,
  /**
   * 初始化
   * @func DrawBase.initialize
   * @param opts 绘制基类的配置项
   * @param opts.viewer {Cesium.Viewer} Cesium.Viewer的一个实例
   * @param {Cesium.CustomDataSource} opts.dataSource 自定义数据源，用于存放绘制的数据，如果没有传，那么自动初始化一个
   * @param {Cesium.PrimitiveCollection} opts.primitives 如果没有传，那么自动初始化一个
   * @param {Tooltip} opts.tooltip 弹窗，如果没有传，那么自动初始化一个
   */
  initialize: function initialize(opts) {
    this.drawTool = opts.drawTool;
    this.viewer = opts.viewer;
    this.dataSource = opts.dataSource || new Cesium.CustomDataSource();
    this.primitives = opts.primitives;
    this.groundPrimitives = opts.groundPrimitives;
    this.mode = opts.mode === 'entity' ? 'entity' : 'primitive';

    if (!this.dataSource) {
      //没有单独指定Cesium.CustomDataSource时
      this.viewer.dataSources.add(this.dataSource);
    }
    this.tooltip = opts.tooltip || new Tooltip(this.viewer.container);
  },
  /**
   * 触发事件
   * @func DrawBase.fire
   * @see #Draw.initialize
   * @param type
   * @param data
   * @param propagate
   */
  fire: function fire(type, data, propagate) {
    if (this._fire) this._fire(type, data, propagate);
  },

  /**
   * 返回Util.formatNum(num,digits)
   * @func DrawBase.formatNum
   * @param num
   * @param digits
   * @returns {number}
   */
  formatNum: function formatNum(num, digits) {
    return Util.formatNum(num, digits);
  },

  /**
   * 激活绘制
   * @func DrawBase.activate
   * @param attribute 属性信息
   * @param drawOkCalback {function =} 回调函数
   * @returns {entity}
   */
  //激活绘制
  activate: function activate(attribute, drawOkCalback) {
    //原先用于两个Draw绘制动作的互斥。
    /* this.viewer.currentDrawTool && this.viewer.currentDrawTool.stopDraw();
    this.viewer.currentDrawTool = this.drawTool; */
    if (this._enabled) {
      return this;
    }
    this._enabled = true;
    this.drawOkCalback = drawOkCalback;

    this.createFeature(attribute);
    this.entity.inProgress = true;

    this.setCursor(true);
    this.bindEvent();

    this.fire(EventType.DrawStart, {
      drawtype: this.type,
      entity: this.entity
    });

    return this.entity;
  },
  /**
   * 释放绘制
   * @func
   * @name DrawBase.disable
   * @param hasWB
   * @returns {this}
   */
  //释放绘制
  disable: function disable(hasWB) {
    if (!this._enabled) {
      return this;
    }
    this._enabled = false;

    this.setCursor(false);

    if (hasWB && this.entity.inProgress) {
      //外部释放时，尚未结束的标绘移除。
      if (this.dataSource && this.dataSource.entities.contains(this.entity))
        this.dataSource.entities.remove(this.entity);

      if (this.primitives && this.primitives.contains(this.entity))
        this.primitives.remove(this.entity);
    } else {
      this.entity.inProgress = false;
      this.finish();
      if (this.drawOkCalback) {
        this.drawOkCalback(this.entity);
        delete this.drawOkCalback;
      }

      this.fire(EventType.DrawCreated, {
        drawtype: this.type,
        entity: this.entity
      });
    }

    this.destroyHandler();
    this._positions_draw = null;
    this.entity = null;
    this.tooltip.setVisible(false);

    return this;
  },

  /**
   * 创建要素
   * @func DrawBase.createFeature
   * @param attribute
   */
  createFeature: function createFeature() {},

  /**
   * 获取事件处理
   * @func DrawBase.getHandler
   * @returns {Cesium.ScreenSpaceEventHandler}
   */
  //============= 事件相关 =============
  getHandler: function getHandler() {
    if (!this.handler || this.handler.isDestroyed()) {
      this.handler = new Cesium.ScreenSpaceEventHandler(
        this.viewer.scene.canvas
      );
    }
    return this.handler;
  },

  /**
   * 销毁事件处理
   * @func DrawBase.destroyHandler
   */
  destroyHandler: function destroyHandler() {
    this.handler && this.handler.destroy();
    this.handler = undefined;
  },

  /**
   * 设置鼠标cursor
   * @func DrawBase.setCursor
   * @param val
   */
  setCursor: function setCursor(val) {
    this.viewer._container.style.cursor = val ? 'crosshair' : '';
  },

  /**
   * 绑定鼠标事件
   * @func DrawBase.bindEvent
   */
  //绑定鼠标事件
  bindEvent: function bindEvent() {},
  //=============  =============
  //坐标位置相关
  _positions_draw: null,

  /**
   * 获取绘制位置
   * @func DrawBase.getDrawPosition
   * @returns {position} 位置
   */
  getDrawPosition: function getDrawPosition() {
    return this._positions_draw;
  },
  //获取编辑对象
  editClass: null,

  /**
   * 获取编辑对象
   * @func DrawBase.getEditClass
   * @param entity
   * @returns {editClass}
   */
  getEditClass: function getEditClass(entity) {
    if (this.editClass == null) return null;

    // Class.prototype.initialize.apply(this,[]) 使用origin class时，启用这一个
    // let _edit = new this.editClass(entity, this.viewer, this.dataSource)

    let _edit = new this.editClass([entity, this.viewer, this.dataSource]);
    if (this._minPointNum != null) _edit._minPointNum = this._minPointNum;
    if (this._maxPointNum != null) _edit._maxPointNum = this._maxPointNum;

    _edit._fire = this._fire;
    _edit.tooltip = this.tooltip;

    return _edit;
  },
  /**
   * 更新坐标后调用下，更新相关属性，子类使用
   * @func DrawBase.updateAttrForDrawing
   * @param isLoad
   */
  //更新坐标后调用下，更新相关属性，子类使用
  updateAttrForDrawing: function updateAttrForDrawing() {},

  /**
   * 图形绘制结束后调用
   * @func DrawBase.finish
   */
  //图形绘制结束后调用
  finish: function finish() {},

  //对应的属性控制静态类
  attrClass: null,
  //通用方法

  /**
   * 获取坐标 coordinate形式
   * @func DrawBase.getCoordinates
   * @param {entity} entity 实体
   * @return {[coordinate]} 坐标数组
   */
  getCoordinates: function getCoordinates(entity) {
    return this.attrClass.getCoordinates(entity);
  },

  /**
   * 获取坐标 position形式
   * @func DrawBase.getPositions
   * @param {entity} entity 实体
   * @returns {[position]} 坐标数组
   */
  getPositions: function getPositions(entity) {
    return this.attrClass.getPositions(entity);
  },

  /**
   * 转换为JSON
   * @func DrawBase.toGeoJSON
   * @param entity
   * @returns {*}
   */
  toGeoJSON: function toGeoJSON(entity) {
    return this.attrClass.toGeoJSON(entity);
  },

  /**
   * 属性转entity
   * @func DrawBase.attributeToEntity
   * @param attribute
   * @param positions
   * @returns {entity} 实体
   */
  //属性转entity
  attributeToEntity: function attributeToEntity(attribute, positions) {
    let entity = this.createFeature(attribute);
    this._positions_draw = positions;
    this.updateAttrForDrawing(true);
    this.finish();
    return entity;
  },

  /**
   * geojson转entity
   * @func DrawBase.jsonToEntity
   * @param geojson 要转换的geojson
   * @returns {entity} 实体
   */
  //geojson转entity
  jsonToEntity: function jsonToEntity(geojson) {
    let attribute = geojson.properties;
    let positions = Util.getPositionByGeoJSON(geojson);
    return this.attributeToEntity(attribute, positions);
  },

  /**
   *绑定外部entity到标绘
   * @func DrawBase.bindExtraEntity
   * @param entity 要绑定的entity
   * @param attribute 属性
   * @returns {entity} entity实体
   */
  //绑定外部entity到标绘
  bindExtraEntity: function bindExtraEntity(entity, attribute) {
    if (attribute && attribute.style)
      this.style2Entity(attribute.style, entity);

    this._positions_draw = this.getPositions(entity);
    this.updateAttrForDrawing(true);
    this.finish();
    return entity;
  }
});
export { DrawBase };
