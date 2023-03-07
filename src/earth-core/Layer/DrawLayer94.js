/*
 * @Author: liujh
 * @Date: 2020/8/24 9:49
 * @Description:
 */
/* 94 */
/***/

import Jquery from 'jquery';
import { BaseLayer } from './BaseLayer10';
import { Draw } from '../Draw/DrawAll21';
import * as util from '../Tool/Util1';

/*class DrawLayer_es6 extends BaseLayer {
    constructor(item, viewer) {
        super(item, viewer)

        this.hasOpacity = false
    }

    create() {
        this.drawControl = new Draw.Draw(this.viewer, {
            hasEdit: false,
            nameTooltip: false,
            removeScreenSpaceEvent: false
        })
    }

    //添加
    add() {
        if (this._isload) this.drawControl.setVisible(true)
        else this._loadData()
    }

    //移除
    remove() {
        this.drawControl.setVisible(false)
    }

    //定位至数据区域
    centerAt(duration) {
        let arr = this.drawControl.getEntitys()
        this.viewer.flyTo(arr, {
            duration: duration
        })
    }

    //设置透明度

    setOpacity(value) {
    }

    _loadData() {
        let that = this
        Jquery.default.ajax({
            type: "get",
            dataType: "json",
            url: this.config.url,
            timeout: 10000,
            success: function success(data) {
                that._isload = true
                let arr = that.drawControl.jsonToEntity(data, true, that.config.flyTo)
                that._bindEntityConfig(arr)
            },
            error: function error(XMLHttpRequest, textStatus, errorThrown) {
                console.log("Json文件" + that.config.url + "加载失败！")
            }
        })
    }

    _bindEntityConfig(arrEntity) {
        let that = this

        for (let i = 0, len = arrEntity.length; i < len; i++) {
            let entity = arrEntity[i]

            //popup弹窗
            if (this.config.columns || this.config.popup) {
                entity.popup = {
                    html: function html(entity) {
                        let attr = entity.attribute.attr
                        attr.layer_name = that.config.name
                        attr.draw_type = entity.attribute.type
                        attr.draw_typename = entity.attribute.name
                        return util.getPopupForConfig(that.config, attr)
                    },
                    anchor: this.config.popupAnchor || [ 0, -15 ]
                }
            }
            if (this.config.tooltip) {
                entity.tooltip = {
                    html: function html(entity) {
                        let attr = entity.attribute.attr
                        attr.layer_name = that.config.name
                        attr.draw_type = entity.attribute.type
                        attr.draw_typename = entity.attribute.name
                        return util.getPopupForConfig({
                            popup: that.config.tooltip
                        }, attr)
                    },
                    anchor: this.config.tooltipAnchor || [ 0, -15 ]
                }
            }
            if (this.config.click) {
                entity.click = this.config.click
            }
            if (this.config.mouseover) {
                entity.mouseover = this.config.mouseover
            }
            if (this.config.mouseout) {
                entity.mouseout = this.config.mouseout
            }
        }
    }
}*/

const DrawLayer = BaseLayer.extend({
  create: function create() {
    this.drawControl =
      this.viewer.shine.draw ||
      new Draw(this.viewer, {
        hasEdit: false,
        nameTooltip: false,
        removeScreenSpaceEvent: false
      });
  },
  //添加
  add: function add() {
    if (this._isload) this.drawControl.setVisible(true);
    else this._loadData();
  },
  //移除
  remove: function remove() {
    this.drawControl.setVisible(false);
  },
  //定位至数据区域
  centerAt: function centerAt(duration) {
    let arr = this.drawControl.getEntitys();
    this.viewer.flyTo(arr, {
      duration: duration
    });
  },
  hasOpacity: false,
  //设置透明度
  setOpacity: function setOpacity(/* value */) {},
  _loadData: function _loadData() {
    let that = this;
    Jquery.default.ajax({
      type: 'get',
      dataType: 'json',
      url: this.config.url,
      timeout: 10000,
      success: function success(data) {
        that._isload = true;
        let arr = that.drawControl.jsonToEntity(data, true, that.config.flyTo);
        that._bindEntityConfig(arr);
      },
      error: function error(/* XMLHttpRequest, textStatus, errorThrown */) {
        console.error('Json文件' + that.config.url + '加载失败！');
      }
    });
  },
  _bindEntityConfig: function _bindEntityConfig(arrEntity) {
    let that = this;

    for (let i = 0, len = arrEntity.length; i < len; i++) {
      let entity = arrEntity[i];

      //popup弹窗
      if (this.config.columns || this.config.popup) {
        entity.popup = {
          html: function html(entity) {
            let attr = entity.attribute.attr;
            attr.layer_name = that.config.name;
            attr.draw_type = entity.attribute.type;
            attr.draw_typename = entity.attribute.name;
            return util.getPopupForConfig(that.config, attr);
          },
          anchor: this.config.popupAnchor || [0, -15]
        };
      }
      if (this.config.tooltip) {
        entity.tooltip = {
          html: function html(entity) {
            let attr = entity.attribute.attr;
            attr.layer_name = that.config.name;
            attr.draw_type = entity.attribute.type;
            attr.draw_typename = entity.attribute.name;
            return util.getPopupForConfig(
              {
                popup: that.config.tooltip
              },
              attr
            );
          },
          anchor: this.config.tooltipAnchor || [0, -15]
        };
      }
      if (this.config.click) {
        entity.click = this.config.click;
      }
      if (this.config.mouseover) {
        entity.mouseover = this.config.mouseover;
      }
      if (this.config.mouseout) {
        entity.mouseout = this.config.mouseout;
      }
    }
  }
});
export { DrawLayer };
