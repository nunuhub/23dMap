/*
 * @Author: liujh
 * @Date: 2020/8/24 9:34
 * @Description:
 */
/* 85 */
/***/

import { BaseLayer } from './BaseLayer10';

/*class GroupLayer_es6 extends BaseLayer {
    constructor(item, viewer) {
        super(item, viewer)
    }

    create() {
        let arr = this.config._layers
        this._layers = arr

        for (let i = 0, len = arr.length; i < len; i++) {
            this.hasOpacity = arr[i].hasOpacity
            this.hasZIndex = arr[i].hasZIndex
        }
    }

    setVisible(val) {
        this._visible = val

        let arr = this.config._layers
        for (let i = 0, len = arr.length; i < len; i++) {
            arr[i].setVisible(val)
        }
    }

    //添加
    add() {
        this._visible = true

        let arr = this.config._layers
        for (let i = 0, len = arr.length; i < len; i++) {
            arr[i].setVisible(true)
        }
    }

    //移除
    remove() {
        this._visible = false

        let arr = this.config._layers
        for (let i = 0, len = arr.length; i < len; i++) {
            arr[i].setVisible(false)
        }
    }

    //定位至数据区域
    centerAt(duration) {
        let arr = this.config._layers
        for (let i = 0, len = arr.length; i < len; i++) {
            arr[i].centerAt(duration)
        }
    }

    //设置透明度
    setOpacity(value) {
        let arr = this.config._layers
        for (let i = 0, len = arr.length; i < len; i++) {
            if (!arr[i].hasOpacity) continue
            arr[i].setOpacity(value)
        }
    }
}*/

const GroupLayer = BaseLayer.extend({
  create: function create() {
    let arr = this.config._layers;
    this._layers = arr;

    for (let i = 0, len = arr.length; i < len; i++) {
      this.hasOpacity = arr[i].hasOpacity;
      this.hasZIndex = arr[i].hasZIndex;
    }
  },
  setVisible: function setVisible(val) {
    this._visible = val;

    let arr = this.config._layers;
    for (let i = 0, len = arr.length; i < len; i++) {
      arr[i].setVisible(val);
    }
  },
  //添加
  add: function add() {
    this._visible = true;

    let arr = this.config._layers;
    for (let i = 0, len = arr.length; i < len; i++) {
      arr[i].setVisible(true);
    }
  },
  //移除
  remove: function remove() {
    this._visible = false;

    let arr = this.config._layers;
    for (let i = 0, len = arr.length; i < len; i++) {
      arr[i].setVisible(false);
    }
  },
  //定位至数据区域
  centerAt: function centerAt(duration) {
    let arr = this.config._layers;
    for (let i = 0, len = arr.length; i < len; i++) {
      arr[i].centerAt(duration);
    }
  },
  //设置透明度
  setOpacity: function setOpacity(value) {
    let arr = this.config._layers;
    for (let i = 0, len = arr.length; i < len; i++) {
      if (!arr[i].hasOpacity) continue;
      arr[i].setOpacity(value);
    }
  }

  //设置叠加顺序
  //setZIndex: function (value) {
  //    let arr = this.config._layers
  //    for (let i = 0 ;i < arr.length ;i++) {
  //        arr[i].setZIndex(value)
  //    }
  //},
});
export { GroupLayer };
