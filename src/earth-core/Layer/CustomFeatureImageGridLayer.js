/*
 * @Author: liujh
 * @Date: 2020/8/24 9:37
 * @Description:
 */
/* 31 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import * as util from '../Tool/Util1';
import { FeatureGridLayer } from './FeatureGridLayer87';

//分块加载矢量数据公共类
const CustomFeatureImageGridLayer = FeatureGridLayer.extend({
  _cacheGrid: {}, //网格缓存,存放矢量对象id集合
  _cacheFeature: {}, //矢量对象缓存,存放矢量对象和其所对应的网格集合

  _addImageryCache: function _addImageryCache(opts) {
    this._cacheGrid[opts.key] = {
      opts: opts,
      isLoading: true
    };

    let that = this;
    if (opts.level < that.config.minimumLevel) return;

    if (that._visible)
      //this.getDataForGrid(opts, function (arrdata) {
      that._showData(opts, null);
    // });
  },
  getDataForGrid: function getDataForGrid(opts, calback) {
    //子类可继承, calback为回调方法,calback参数传数据数组

    //直接使用本类,传参方式
    if (this.config.getDataForGrid) {
      this.config.getDataForGrid(opts, calback);
    }
  },
  checkHasBreak: function checkHasBreak(cacheKey) {
    if (!this._visible || !this._cacheGrid[cacheKey]) {
      return true;
    }
    return false;
  },
  _showData: function _showData(opts, arrdata) {
    let cacheKey = opts.key;
    if (this.checkHasBreak[cacheKey]) {
      return; //异步请求结束时,如果已经卸载了网格就直接跳出。
    }

    let that = this;

    let arrIds = [];
    // for (let i = 0, len = arrdata.length; i < len; i++) {
    //   let attributes = arrdata[i];
    //   let id =
    //     attributes.properties[
    //       this.config.IdName ? this.config.IdName : this.config.keyfield
    //     ] || attributes.id;
    let id = opts.key;

    let layer = this._cacheFeature[id];
    if (layer) {
      //已存在
      layer.grid.push(cacheKey);
      /* if (opts.imagery.referenceCount < 5)
        this._cacheGrid[parentGrid].opts.entity.show = true; */
      //this.updateEntity(layer.entity, attributes);
    } else {
      /* let entity =  */ this.createPrimitive(
        opts,
        arrdata,
        function (entity) {
          //let entity = this.createEntity(opts, arrdata, function (entity) {
          if (that.config.debuggerTileInfo) {
            //测试用
            //entity._temp_id = id;
            entity.popup = function (entity) {
              return JSON.stringify(that._cacheFeature[entity._temp_id].grid);
            };
          }

          if (opts.imagery.referenceCount > 1) {
            entity.show = false;
          }
          that._cacheFeature[id] = {
            grid: [cacheKey],
            entity: entity
          };
          if (entity == null) {
            if (that.config.debuggerTileInfo) {
              //测试用
              entity._temp_id = id;
              entity.popup = function (entity) {
                return JSON.stringify(that._cacheFeature[entity._temp_id].grid);
              };
            }
            that._cacheFeature[id] = {
              grid: [cacheKey],
              entity: entity
            };
          }
        }
      );
    }
    arrIds.push(id);

    that._cacheGrid[cacheKey] = that._cacheGrid[cacheKey] || {};
    that._cacheGrid[cacheKey].ids = arrIds;
    that._cacheGrid[cacheKey].isLoading = false;
    let parentimagery = opts.imagery.parent;
    let parentGrid =
      parentimagery.level + '_x' + parentimagery.x + '_y' + parentimagery.y;
    if (parentimagery.referenceCount > 1 && that._cacheFeature[parentGrid]) {
      //this._removeImageryCache(this._cacheGrid[parentGrid].opts);
      that._cacheFeature[parentGrid].entity.show = false;
    }
  },

  createEntity: function createEntity(opts, attributes, calback) {
    //子类可以继承,根据数据创造entity

    //直接使用本类,传参方式
    if (this.config.createEntity) {
      return this.config.createEntity(opts, attributes, calback);
    }
    return null;
  },
  updateEntity: function updateEntity(entity, attributes) {
    //子类可以继承,更新entity（动态数据时有用）

    //直接使用本类,传参方式
    if (this.config.updateEntity) {
      this.config.updateEntity(entity, attributes);
    }
  },
  removeEntity: function removeEntity(entity) {
    //子类可以继承,移除entity
    //直接使用本类,传参方式
    if (this.config.removeEntity) {
      this.config.removeEntity(entity);
    } else {
      this.dataSource.entities.remove(entity);
      // console.log("a entity has been removed from this datasource")
    }
  },
  removePrimitive: function removePrimitive(primitive) {
    //子类可以继承,移除primitive
    //直接使用本类,传参方式
    if (this.config.removePrimitive) {
      this.config.removePrimitive(primitive);
    } else {
      this.primitives.remove(primitive);
      // console.log("a primitive has been removed from this datasource")
    }
  },
  _removeImageryCache: function _removeImageryCache(opts) {
    let cacheKey = opts.key;
    let layers = this._cacheGrid[cacheKey];
    if (layers) {
      if (layers.ids) {
        for (let i = 0; i < layers.ids.length; i++) {
          let id = layers.ids[i];
          let layer = this._cacheFeature[id];
          if (layer) {
            this.customRemove(layer.grid, cacheKey);
            //layer.grid.remove(cacheKey);
            if (layer.grid.length === 0) {
              delete this._cacheFeature[id];
              this.removeEntity(layer.entity);
              this.removePrimitive(layer.entity);
              let parentimagery = opts.imagery.parent;
              let parentGrid =
                parentimagery.level +
                '_x' +
                parentimagery.x +
                '_y' +
                parentimagery.y;
              if (
                parentimagery.referenceCount < 5 &&
                this._cacheFeature[parentGrid]
              ) {
                this._cacheFeature[parentGrid].entity.show = true;
              }
            }
          }
        }
      }
      delete this._cacheGrid[cacheKey];
    }
  },
  _removeAllImageryCache: function _removeAllImageryCache() {
    if (this.config.removeAllEntity) {
      this.config.removeAllEntity();
    } else {
      this.dataSource.entities.removeAll();
      // console.log("_removeAllImageryCache all entities have been removed from this datasource")
      this.primitives.removeAll();
    }

    this._cacheFeature = {};
    this._cacheGrid = {};
  },
  //移除
  removeEx: function removeEx() {
    if (this.config.removeAllEntity) {
      this.config.removeAllEntity();
    } else {
      this.dataSource.entities.removeAll();
      // console.log("removeEx all entities have been removed from this datasource")
      this.primitives.removeAll();
    }

    // this._cacheFeature = {};
    // this._cacheGrid = {};

    //this.viewer.dataSources.remove(this.dataSource)
    // console.log("removeEx this datasource has been removed from dataSources")
    //this.viewer.scene.primitives.remove(this.primitives)
  },
  //重新加载数据
  reload: function reload() {
    let that = this;
    for (let i in this._cacheGrid) {
      let item = this._cacheGrid[i];
      if (item == null || item.opts == null || item.isLoading) continue;

      let opts = item.opts;
      this.getDataForGrid(opts, function (arrdata) {
        that._showData(opts, arrdata);
      });
    }
  },

  //设置透明度
  hasOpacity: true,
  _opacity: 1,
  setOpacity: function setOpacity(value) {
    this._opacity = value;

    for (let i in this._cacheFeature) {
      let entity = this._cacheFeature[i].entity;

      if (
        entity.rectangle &&
        entity.rectangle.material &&
        entity.rectangle.material.color
      ) {
        this._updateEntityAlpha(entity.rectangle.material.color, this._opacity);
      }
      if (entity._primitive) {
        this._updatePrimitiveAlpha(
          entity._primitive.appearance.material.uniforms.color,
          this._opacity
        );
      }
    }
  },
  _updateEntityAlpha: function _updatEntityAlpha(color, opacity) {
    if (!color) return;
    let newclr = color.getValue(this.viewer.clock.currentTime);
    if (!newclr || !newclr.withAlpha) return color;

    newclr = newclr.withAlpha(opacity);
    color.setValue(newclr);
  },

  _updatePrimitiveAlpha: function _updatePrimitiveAlpha(color, opacity) {
    /* if (!color) return;
    let newclr = color.value(this.viewer.clock.currentTime);
    if (!newclr || !newclr.withAlpha) return color;

    newclr = newclr.withAlpha(opacity);
    color.setValue(newclr); */
    color.alpha = opacity;
  },

  //鼠标事件，popup tooltip
  bindMourseEvnet: function bindMourseEvnet(entity) {
    let that = this;

    //popup弹窗

    if (
      this.config.columns ||
      this.config.popup ||
      this.config.identifyField[0]?.popup3d
    ) {
      entity.popup = {
        html: function html(entity) {
          let attr = that.getEntityAttr(entity);
          if (util.isString(attr)) return attr;
          else return util.getPopupForConfig(that.config, attr);
        },
        anchor: this.config.popupAnchor || [0, -15]
      };
    }
    if (this.config.tooltip) {
      entity.tooltip = {
        html: function html(entity) {
          let attr = that.getEntityAttr(entity);
          if (util.isString(attr)) return attr;
          else
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
  },

  //获取属性
  getEntityAttr: function getEntityAttr(entity) {
    return util.getAttrVal(entity.properties);
  },
  //默认symbol
  colorHash: {},
  setDefSymbol: function setDefSymbol(entity) {
    let attr = this.getEntityAttr(entity) || {};
    if (entity.polygon) {
      let name = attr.id || attr.OBJECTID || 0;
      let color = this.colorHash[name];
      if (!color) {
        color = Cesium.Color.fromRandom({
          minimumGreen: 0.75,
          maximumBlue: 0.75,
          alpha: this._opacity
        });
        this.colorHash[name] = color;
      }
      entity.polygon.material = color;
      entity.polygon.outline = true;
      entity.polygon.outlineColor = Cesium.Color.WHITE;
    } else if (entity.polyline) {
      let name = attr.id || attr.OBJECTID || 0;
      let color = this.colorHash[name];
      if (!color) {
        color = Cesium.Color.fromRandom({
          minimumGreen: 0.75,
          maximumBlue: 0.75,
          alpha: this._opacity
        });
        this.colorHash[name] = color;
      }
      entity.polyline.material = color;
      entity.polyline.width = 2;
    } else if (entity.billboard) {
      entity.billboard.scale = 0.5;
      entity.billboard.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
      entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
    }
  },

  //替代原来layer.js里面的删除方法
  arrayRemove: function arrayRemove(arr, val) {
    for (var i = 0; i < arr.length; i++) {
      if (this[i] == val) {
        this.splice(i, 1);
        break;
      }
    }
  },
  getIndexByValue(styleFieldOptions, minValue, value) {
    for (let index in styleFieldOptions) {
      let maxValue = styleFieldOptions[index].value;
      if (value >= minValue && value <= maxValue) {
        return index;
      }
      //下一次循环的minValue为上一次的maxValue
      minValue = maxValue;
    }
  },
  customRemove(array, val) {
    for (let i = 0; i < array.length; i++) {
      if (array[i] == val) {
        array.splice(i, 1);
        break;
      }
    }
    return array;
  }
});
export { CustomFeatureImageGridLayer };
