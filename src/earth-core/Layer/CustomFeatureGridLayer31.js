/*
 * @Author: liujh
 * @Date: 2020/8/24 9:37
 * @Description:
 */
/* 31 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import Jquery from 'jquery';
import * as util from '../Tool/Util1';
import { FeatureGridLayer } from './FeatureGridLayer87';
import * as BillBoard from '../Draw/EntityAttr/BillboardAttr19';
import * as Label from '../Draw/EntityAttr/LabelAttr9';
import * as PolyLine from '../Draw/EntityAttr/PolylineAttr15';
import * as PolyGon from '../Draw/EntityAttr/PolygonAttr14';
import * as Model from '../Draw/EntityAttr/ModelAttr24';
import { pointOnPolygon } from '../Tool/Point2';

//分块加载矢量数据公共类
const CustomFeatureGridLayer = FeatureGridLayer.extend({
  _cacheGrid: {}, //网格缓存,存放矢量对象id集合
  _cacheFeature: {}, //矢量对象缓存,存放矢量对象和其所对应的网格集合

  _addImageryCache: function _addImageryCache(opts) {
    this._cacheGrid[opts.key] = {
      opts: opts,
      isLoading: true
    };

    let that = this;

    this.getDataForGrid(opts, function (arrdata) {
      if (that._visible) that._showData(opts, arrdata);
    });
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
    for (let i = 0, len = arrdata.length; i < len; i++) {
      let attributes = arrdata[i];
      let id =
        attributes.properties[
          this.config.IdName ? this.config.IdName : this.config.keyfield
        ] || attributes.id;

      let layer = this._cacheFeature[id];
      if (layer) {
        //已存在
        layer.grid.push(cacheKey);
        this.updateEntity(layer.entity, attributes);
      } else {
        let entity = this.createEntity(opts, attributes, function (entity) {
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
        });
        if (entity != null) {
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
      arrIds.push(id);
    }

    this._cacheGrid[cacheKey] = this._cacheGrid[cacheKey] || {};
    this._cacheGrid[cacheKey].ids = arrIds;
    this._cacheGrid[cacheKey].isLoading = false;
  },

  createEntity: function createEntity(opts, attributes, calback) {
    //子类可以继承,根据数据创造entity

    //直接使用本类,传参方式
    if (this.config.createEntity) {
      return this.config.createEntity(opts, attributes, calback);
    }
    return null;
  },
  updateEntity: function updateEntity(enetity, attributes) {
    //子类可以继承,更新entity（动态数据时有用）

    //直接使用本类,传参方式
    if (this.config.updateEntity) {
      this.config.updateEntity(enetity, attributes);
    }
  },
  removeEntity: function removeEntity(enetity) {
    //子类可以继承,移除entity
    //直接使用本类,传参方式
    if (this.config.removeEntity) {
      this.config.removeEntity(enetity);
    } else {
      this.dataSource.entities.remove(enetity);
      // console.log("a entity has been removed from this datasource")
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

    //this._cacheFeature = {};
    //this._cacheGrid = {};

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
        entity.polygon &&
        entity.polygon.material &&
        entity.polygon.material.color
      ) {
        this._updatEntityAlpha(entity.polygon.material.color, this._opacity);
        if (entity.polygon.outlineColor) {
          this._updatEntityAlpha(entity.polygon.outlineColor, this._opacity);
        }
      }

      if (
        entity.polyline &&
        entity.polyline.material &&
        entity.polyline.material.color
      ) {
        this._updatEntityAlpha(entity.polyline.material.color, this._opacity);
      }

      if (entity.billboard) {
        entity.billboard.color = new Cesium.Color.fromCssColorString(
          '#FFFFFF'
        ).withAlpha(this._opacity);
      }

      if (entity.model) {
        entity.model.color = new Cesium.Color.fromCssColorString(
          '#FFFFFF'
        ).withAlpha(this._opacity);
      }

      if (entity.label) {
        let _opacity = this._opacity;
        if (
          entity.attribute &&
          entity.attribute.label &&
          entity.attribute.label.opacity
        )
          _opacity = entity.attribute.label.opacity;

        if (entity.label.fillColor)
          this._updatEntityAlpha(entity.label.fillColor, _opacity);
        if (entity.label.outlineColor)
          this._updatEntityAlpha(entity.label.outlineColor, _opacity);
        if (entity.label.backgroundColor)
          this._updatEntityAlpha(entity.label.backgroundColor, _opacity);
      }
    }
  },
  _updatEntityAlpha: function _updatEntityAlpha(color, opacity) {
    if (!color) return;
    let newclr = color.getValue(this.viewer.clock.currentTime);
    if (!newclr || !newclr.withAlpha) return color;

    newclr = newclr.withAlpha(opacity);
    color.setValue(newclr);
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
  //外部配置的symbol
  setConfigSymbol: function setConfigSymbol(entity, symbol) {
    let attr = this.getEntityAttr(entity) || {};
    let styleOpt = symbol.styleOptions;
    if (styleOpt.opacity) {
      styleOpt.opacity = this._opacity;
    }

    if (symbol.styleField) {
      if (symbol.styleFieldOptions) {
        let styleFieldVal = attr[symbol.styleField];
        let styleOptField = symbol.styleFieldOptions[styleFieldVal];
        if (styleOptField != null) {
          styleOptField.opacity = this._opacity;
          styleOptField.outlineOpacity = this._opacity;
          styleOpt = util.clone(styleOpt);
          styleOpt = Jquery.extend(styleOpt, styleOptField);
        }
      } else if (symbol.styleStepOptions) {
        let minValue = symbol.minValue;
        if (minValue === null) {
          minValue = Number.MIN_VALUE;
        }
        let styleFieldVal = attr[symbol.styleField];
        let filedIndex = this.getIndexByValue(
          symbol.styleStepOptions,
          minValue,
          styleFieldVal
        );
        if (filedIndex != null) {
          let styleOptStep = symbol.styleStepOptions[filedIndex].style;
          styleOptStep.opacity = this._opacity;
          styleOptStep.outlineOpacity = this._opacity;
          styleOpt = util.clone(styleOpt);
          styleOpt = Jquery.extend(styleOpt, styleOptStep);
        }
      }
      //存在多个symbol，按styleField进行分类
    }

    //外部使用代码示例
    // let layerWork = viewer.shine.getLayer(301087, "id")
    // layerWork.config.symbol.calback = function (attr, entity) {
    //     let val = Number(attr["floor"]._value)
    //     if (val < 10)
    //         return { color: "#ff0000" }
    //     else
    //         return { color: "#0000ff" }
    // }
    if (typeof symbol.calback === 'function') {
      //回调方法
      let styleOptField = symbol.calback(attr, entity, symbol);
      if (!styleOptField) return;

      styleOpt = util.clone(styleOpt);
      styleOpt = Jquery.extend(styleOpt, styleOptField);
    }

    styleOpt = styleOpt || {};

    // this._opacity = styleOpt.opacity || 1 //透明度

    if (entity.polyline) {
      PolyLine.style2Entity(styleOpt, entity.polyline);

      //线时，加上文字标签
      if (styleOpt.label && styleOpt.label.field) {
        styleOpt.label.heightReference = Cesium.defaultValue(
          styleOpt.label.heightReference,
          Cesium.HeightReference.CLAMP_TO_GROUND
        );

        let labelattr = Label.style2Entity(styleOpt.label);
        labelattr.text = attr[styleOpt.label.field] || labelattr.text || '';

        let pots = PolyLine.getPositions(entity);
        let position = pots[Math.floor(pots.length / 2)];
        if (styleOpt.label.position) {
          if (styleOpt.label.position === 'center') {
            position = pointOnPolygon(pots);
          } else if (util.isNumber(styleOpt.label.position)) {
            position = pots[styleOpt.label.position];
          }
        }

        //修改初始化入口，无需单独加载entity，可以在现有entity中扩展
        entity.position = position;
        entity.label = labelattr;

        /*  let lblEx = this.dataSource.entities.add({
          position: position,
          label: labelattr,
          properties: attr
        });
        this.bindMourseEvnet(lblEx); */
      }
    }
    if (entity.polygon) {
      if (!styleOpt.classificationType) {
        styleOpt.classificationType = Cesium.ClassificationType.BOTH;
      }
      PolyGon.style2Entity(styleOpt, entity.polygon);
      //加上线宽
      if (styleOpt.outlineWidth && styleOpt.outlineWidth < 1)
        styleOpt.outlineWidth = 1;
      if (
        (styleOpt.outlineWidth && styleOpt.outlineWidth > 1) ||
        styleOpt.classificationType != Cesium.ClassificationType.NONE
      ) {
        if (symbol.volumeStyle && !symbol.volumeStyle.render2d) {
          styleOpt.outlineWidth = 1;
        } else {
          entity.polygon.outline = false;

          let newopt = {
            color: styleOpt.outlineColor,
            width: styleOpt.outlineWidth,
            opacity: styleOpt.outlineOpacity,
            lineType: 'solid',
            clampToGround: true,
            classificationType: styleOpt.classificationType,
            outline: false
          };
          let polyline = PolyLine.style2Entity(newopt);
          polyline.positions = PolyGon.getPositions(entity);
          //修改初始化入口，无需单独加载entity，可以在现有entity中扩展
          entity.polyline = polyline;

          /* let lineEx = this.dataSource.entities.add({
          polyline: polyline,
          properties: attr
        });
        this.bindMourseEvnet(lineEx); */
        }
      }

      //面时，加上文字标签
      if (styleOpt.label && styleOpt.label.field) {
        styleOpt.label.heightReference = Cesium.defaultValue(
          styleOpt.label.heightReference,
          Cesium.HeightReference.CLAMP_TO_GROUND
        );

        let labelattr = Label.style2Entity(styleOpt.label);
        labelattr.text = attr[styleOpt.label.field] || labelattr.text || '';
        //修改初始化入口，无需单独加载entity，可以在现有entity中扩展
        entity.position = pointOnPolygon(PolyGon.getPositions(entity));
        entity.label = labelattr;

        /* let lblEx = this.dataSource.entities.add({
          position: centerOfMass(PolyGon.getPositions(entity)),
          label: labelattr,
          properties: attr
        });
        this.bindMourseEvnet(lblEx); */
      }

      //是建筑物（体块）时
      if (symbol.volumeStyle) {
        let floor = Number(attr[symbol.volumeStyle.cloumn] || 1); //层数
        let storeyheight = symbol.volumeStyle.storeyheight || 3.5; //层高
        if (util.isString(storeyheight)) {
          storeyheight = attr[storeyheight] || 3.5;
        }

        if (symbol.volumeStyle.Updownheight) {
          let downHeight = symbol.volumeStyle.Updownheight.down;
          let upHeight = symbol.volumeStyle.Updownheight.up;
          if (util.isNumber(downHeight)) {
            entity.polygon.height = downHeight;
          } else if (util.isString(downHeight)) {
            entity.polygon.height = attr[downHeight] || 0;
          }
          if (util.isNumber(upHeight)) {
            entity.polygon.extrudedHeight = upHeight;
          } else if (util.isString(upHeight)) {
            entity.polygon.extrudedHeight =
              attr[upHeight] ||
              entity.polygon.height + (storeyheight ? storeyheight : 3.5);
          } else if (upHeight == undefined) {
            entity.polygon.extrudedHeight =
              entity.polygon.height + (storeyheight ? storeyheight : 3.5);
          }
        } else {
          /* let heightCfg = symbol.volumeStyle.height;
          if (util.isNumber(heightCfg)) {
            storeyheight = heightCfg;
          } else if (util.isString(heightCfg)) {
            storeyheight = attr[heightCfg] || storeyheight;
          } */

          entity.polygon.extrudedHeight = floor * storeyheight;
        }

        if (
          symbol.volumeStyle.outlineWidth !== undefined &&
          symbol.volumeStyle.outlineWidth == false
        ) {
          entity.polygon.outline = false;
        }

        if (symbol.volumeStyle.clampToGround) {
          entity.polygon.heightReference =
            Cesium.HeightReference.CLAMP_TO_GROUND;
        }
      }
      /*       //纪舒敏begin 地形打开时建筑贴地 ,jzheight建筑高度字段
      if (styleOpt.jzheight) {
        let jzheight = Number(attr[styleOpt.jzheight]); //建筑高
        if (jzheight) {
          if (jzheight._value !== 0) {
            entity.polygon.extrudedHeight = jzheight;
            entity.polygon.heightReference =
              Cesium.HeightReference.CLAMP_TO_GROUND;
          }
        }
      } */
      //end
    }

    //entity本身存在文字标签
    if (entity.label) {
      styleOpt.label = styleOpt.label || styleOpt || {};
      styleOpt.label.heightReference = Cesium.defaultValue(
        styleOpt.label.heightReference,
        Cesium.HeightReference.CLAMP_TO_GROUND
      );

      Label.style2Entity(styleOpt.label, entity.label);
      if (styleOpt.label.field)
        entity.label.text =
          attr[styleOpt.label.field] || entity.label.text || '';
    }

    if (entity.billboard) {
      styleOpt.heightReference = Cesium.defaultValue(
        styleOpt.heightReference,
        Cesium.HeightReference.CLAMP_TO_GROUND
      );
      BillBoard.style2Entity(styleOpt, entity.billboard);

      //图标时，加上文字标签 (entity本身不存在label时)
      if (styleOpt.label && styleOpt.label.field && !entity.label) {
        styleOpt.label.heightReference = Cesium.defaultValue(
          styleOpt.label.heightReference,
          Cesium.HeightReference.CLAMP_TO_GROUND
        );

        let labelattr = Label.style2Entity(styleOpt.label);
        labelattr.text = attr[styleOpt.label.field] || labelattr.text || '';
        //修改初始化入口，无需单独加载entity，可以在现有entity中扩展
        entity.label = labelattr;

        /* let lblEx = this.dataSource.entities.add({
          position: entity.position,
          label: labelattr,
          properties: attr
        });
        this.bindMourseEvnet(lblEx); */
      }

      //支持小模型
      if (styleOpt.model) {
        styleOpt.model.heightReference = Cesium.defaultValue(
          styleOpt.model.heightReference,
          Cesium.HeightReference.CLAMP_TO_GROUND
        );
        let modelattr = Model.style2Entity(styleOpt.model);
        //修改初始化入口，无需单独加载entity，可以在现有entity中扩展
        entity.model = modelattr;

        /* let lblEx = this.dataSource.entities.add({
          position: entity.position,
          model: modelattr,
          properties: attr
        });
        this.bindMourseEvnet(lblEx); */
      }
    }

    entity.attribute = styleOpt;
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
export { CustomFeatureGridLayer };
