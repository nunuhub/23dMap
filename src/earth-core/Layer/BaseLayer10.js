/* eslint-disable no-prototype-builtins */
/*
 * @Author: liujh
 * @Date: 2020/8/24 9:33
 * @Description:
 */
/* 10 */
/***/

import { Class } from '../Tool/Class13';
import * as util from '../Tool/Util1';

const BaseLayer = Class.extend({
  config: {}, //配置的config信息
  viewer: null,
  initialize: function initialize(cfg, viewer) {
    this.viewer = viewer;
    this.config = cfg;

    this.name = cfg.name;
    if (this.config.hasOwnProperty('alpha')) {
      this._opacity = Number(this.config.alpha);
    } else if (this.config.hasOwnProperty('opacity') && this.config.opacity) {
      //兼容opacity参数来配置
      this._opacity = Number(this.config.opacity);
    }

    if (this.config.hasOwnProperty('hasOpacity'))
      this.hasOpacity = this.config.hasOpacity;

    this.create();
    if (cfg.visible) {
      this.setVisible(true);
    } else {
      this._visible = false;
    }

    if (cfg.visible && cfg.flyTo) {
      this.centerAt(0);
    }
  },
  create: function create() {},
  showError: function showError(title, error) {
    if (!error) error = '未知错误';

    if (this.viewer)
      this.viewer.cesiumWidget.showErrorPanel(title, undefined, error);

    console.error('layer错误:' + title + error);
  },
  //显示隐藏控制
  _visible: null,
  getVisible: function getVisible() {
    return this._visible;
  },
  setVisible: function setVisible(val) {
    if (this._visible != null && this._visible === val) return;
    this._visible = val;

    if (val) {
      if (this.config.msg) (0, util.msg)(this.config.msg);

      this.add();
    } else {
      this.remove();
    }
  },
  //添加
  add: function add() {
    this._visible = true;

    if (this.config.onAdd) {
      this.config.onAdd();
    }
  },
  //移除
  remove: function remove() {
    this._visible = false;

    if (this.config.onRemove) {
      this.config.onRemove();
    }
  },
  //定位至数据区域
  centerAt: function centerAt(duration) {
    if (this.config.extent || this.config.center) {
      this.viewer.shine.centerAt(this.config.extent || this.config.center, {
        duration: duration,
        isWgs84: true
      });
    } else if (this.config.onCenterAt) {
      this.config.onCenterAt(duration);
    }
  },
  hasOpacity: false,
  _opacity: 1,
  //设置透明度
  setOpacity: function setOpacity(value) {
    if (this.config.onSetOpacity) {
      this.config.onSetOpacity(value);
    }
  },
  hasZIndex: false,
  //设置叠加顺序
  setZIndex: function setZIndex(value) {
    if (this.config.onSetZIndex) {
      this.config.onSetZIndex(value);
    }
  },
  destroy: function destroy() {
    this.setVisible(false);
  }
});

export { BaseLayer };
