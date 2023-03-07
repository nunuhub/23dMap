import * as Cesium from 'cesium_shinegis_earth';
import { Evented } from '../Tool/Event62';
import { message, Tooltip } from '../Tool/ToolTip4';
import * as util from '../Tool/Util1';
import * as DrawUtil from '../Tool/Util3';
import * as EventType from './EventType7';

import { DrawBase } from './DrawBase22';
import { DrawPoint } from './DrawPoint23';
import { DrawBillboard } from './DrawBillboard66';
import { DrawCloud } from './DrawCloud';
import { DrawLabel } from './DrawLabel67';
import { DrawModel } from './DrawModel68';
import { DrawPolyline } from './DrawPolyline8';
import { DrawCurve } from './DrawCurve69';
import { DrawPolylineVolume } from './DrawPolylineVolume70';
import { DrawCorridor } from './DrawCorridor71';
import { DrawPolygon } from './DrawPolygon43';
import { DrawRectangle } from './DrawRectangle72';
import { DrawCircle } from './DrawCircle73';
import { DrawCylinder } from './DrawCylinder74';
import { DrawEllipsoid } from './DrawEllipsoid76';
import { DrawWall } from './DrawWall77';
import { DrawPModel } from './DrawPModel78';
import { DrawPolygonEx } from './DrawPolygonEx79';
import { DrawPlotting } from './DrawPlotting32';
import {
  getFeaturesFromGeoJson,
  getGeoJsonFromFeatures
} from '../../utils/format';
import { defaultStyle } from '../Draw/EntityAttr/AttrAll53.js';
//类库外部扩展的类
const exDraw = {};

const register = (type, layerClass) => {
  exDraw[type] = layerClass;
};

/*尝试 */
class Debouncer {
  //函数防抖器。
  constructor(step = 200) {
    this.step = step;
    this.timer = null;
    this.callback = () => {
      console.warn('请设置防抖的回调函数');
    };
  }

  active(callback) {
    clearTimeout(this.timer);
    this.callback = callback || this.callback;
    this.timer = setTimeout(() => {
      this.callback();
    }, this.step);
  }
}
let debouncer = new Debouncer();

/**
 * 绘制方法整合
 * @class Draw
 * @extends Evented
 * @memberOf Evented
 * @param viewer {Cesium.Viewer} Cesium.Viewer的一个实例
 * @param options {options} 配置
 * @param {Cesium.CustomDataSource} options.dataSource 自定义数据源，用于存放绘制的数据，如果没有传，那么自动初始化一个
 * @param {Cesium.PrimitiveCollection} options.primitives primitives，如果没有传，那么自动初始化一个
 *
 * @param {object} drawCtrl 绘制控件实例集合
 * @param {DrawPoint} drawCtrl.point 点绘制实例
 * @param {DrawBillboard} drawCtrl.billboard 广告牌绘制实例
 * @param {DrawCloud} drawCtrl.cloud 云朵绘制实例
 * @param {DrawLabel} drawCtrl.model 模型绘制实例
 * @param {DrawPolyline} drawCtrl.polyline 线绘制实例
 * @param {DrawCurve} drawCtrl.curve 曲线绘制实例
 * @param {DrawPolylineVolume} drawCtrl.polylineVolume 线体绘制实例
 * @param {DrawCorridor} drawCtrl.corridor 走廊绘制实例
 * @param {DrawPolygon} drawCtrl.polygon 面绘制实例
 * @param {DrawRectangle} drawCtrl.rectangle 矩形绘制实例
 * @param {DrawCircle} drawCtrl.ellipse 椭圆绘制实例
 * @param {DrawCircle} drawCtrl.circle 环绘制实例
 * @param {DrawCylinder} drawCtrl.cylinder 锥绘制实例
 * @param {DrawEllipsoid} drawCtrl.ellipsoid 椭球绘制实例
 * @param {DrawWall} drawCtrl.wall 墙绘制实例
 * @param {DrawPModel} drawCtrl.model-p 模型点绘制实例
 */
const Draw = Evented.extend({
  dataSource: null,
  primitives: null,
  drawCtrl: null,
  //初始化
  /**
   * 初始化绘制，会自动调用，不需要手动调用
   * @func Draw.initialize
   * @param viewer
   * @param options
   */
  initialize: function initialize(viewer, options) {
    this.viewer = viewer;
    this.id = Cesium.createGuid();
    this.options = options || {};

    this.dataSource = new Cesium.CustomDataSource(
      this.options.name || 'temporaryDrawLayer'
    ); //用于entity
    this.defaulDataSource = this.dataSource;
    this.viewer.dataSources.add(this.dataSource);
    this.primitives = new Cesium.PrimitiveCollection(); //用于primitive
    this.viewer.scene.primitives.add(this.primitives);
    this.groundPrimitives = new Cesium.PrimitiveCollection(); //用于groundPrimitives
    this.viewer.scene.groundPrimitives.add(this.groundPrimitives);

    if (Cesium.defaultValue(this.options.removeScreenSpaceEvent, true)) {
      this.viewer.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK
      );
      this.viewer.screenSpaceEventHandler.removeInputAction(
        Cesium.ScreenSpaceEventType.LEFT_CLICK
      );
    }

    this.tooltip = new Tooltip(this.viewer.container); //鼠标提示信息

    this.hasEdit(Cesium.defaultValue(this.options.hasEdit, false)); //是否可编辑

    //编辑工具初始化
    let _opts = {
      viewer: this.viewer,
      dataSource: this.dataSource,
      primitives: this.primitives,
      groundPrimitives: this.groundPrimitives,
      tooltip: this.tooltip,
      mode: options?.mode || 'entity',
      drawTool: this
    };

    //entity
    this.drawCtrl = {};
    this.drawCtrl['point'] = new DrawPoint(_opts);
    this.drawCtrl['billboard'] = new DrawBillboard(_opts);
    this.drawCtrl['label'] = new DrawLabel(_opts);
    this.drawCtrl['model'] = new DrawModel(_opts);
    //
    this.drawCtrl['polyline'] = new DrawPolyline(_opts);
    this.drawCtrl['curve'] = new DrawCurve(_opts);
    this.drawCtrl['polylineVolume'] = new DrawPolylineVolume(_opts);
    this.drawCtrl['corridor'] = new DrawCorridor(_opts);
    //
    this.drawCtrl['polygon'] = new DrawPolygon(_opts);
    this.drawCtrl['rectangle'] = new DrawRectangle(_opts);
    this.drawCtrl['ellipse'] = new DrawCircle(_opts);
    this.drawCtrl['circle'] = this.drawCtrl['ellipse']; //圆
    this.drawCtrl['cylinder'] = new DrawCylinder(_opts);
    this.drawCtrl['ellipsoid'] = new DrawEllipsoid(_opts);
    this.drawCtrl['wall'] = new DrawWall(_opts);
    this.drawCtrl['plotting'] = new DrawPlotting(_opts); //态势标绘

    //primitive
    this.drawCtrl['model-p'] = new DrawPModel(_opts);
    this.drawCtrl['cloud'] = new DrawCloud(_opts);

    //外部图层
    for (let key in exDraw) {
      this.drawCtrl[key] = new exDraw[key](_opts);
    }

    //绑定事件抛出方法
    let that = this;
    for (let type in this.drawCtrl) {
      if (Object.prototype.hasOwnProperty.call(this.drawCtrl, type)) {
        this.drawCtrl[type]._fire = function (type, data, propagate) {
          that.fire(type, data, propagate);
        };
      }
    }

    //创建完成后激活编辑
    this.on(
      EventType.DrawCreated,
      function (e) {
        this.startEditing(e.entity);
        this.fire('change:active', { active: false });
      },
      this
    );
  },
  /**
   * 创建集合
   * @param layerId 集合的id
   * @returns
   */
  getOrCreateCollection(layerId) {
    let exist = this.getCollection(layerId);
    if (exist) return exist;
    let collection = {};
    collection._isCollection = true;
    Object.defineProperty(collection, 'features', {
      get: function () {
        return this.dataSource?.entities.values || [];
      }
    });
    collection.id = layerId || Cesium.createGuid();

    collection.dataSource = new Cesium.CustomDataSource(collection.id);
    collection.dataSource.id = collection.id;
    this.viewer.dataSources.add(collection.dataSource); //添加前未判断是否已存在
    this.collections = this.getCollections();
    this.collections.push(collection);
    return collection;
  },
  /**
   * 获取集合
   * @param {*} id
   * @returns
   */
  getCollection(id) {
    let collections = this.getCollections();
    let collection = collections.find((e) => {
      return e.id === id;
    });
    return collection;
  },
  /**
   *
   * @returns 获取集合数组
   */
  getCollections() {
    this.collections = this.collections || [];
    return this.collections;
  },
  customRemove(array, val) {
    for (let i = 0; i < array.length; i++) {
      if (array[i] == val) {
        array.splice(i, 1);
        break;
      }
    }
    return array;
  },
  /**
   * 移除集合
   * @param {*} collection 支持传对象或者id
   */
  removeCollection(collection) {
    collection = this.getCollection(collection) || collection;
    if (!collection?._isCollection) {
      console.warn('该drawLayer不存在');
      return;
    }
    this.viewer.dataSources.remove(collection.dataSource);
    this.customRemove(this.collections, collection);
  },
  /**
   * 激活某集合，即后续进行的增删操作都在该集合里。
   * 将drawTool的dataSource设定为某集合的dataSource;
   */
  _activateCollection(collection) {
    this.dataSource = collection.dataSource;
    for (let type in this.drawCtrl) {
      if (Object.prototype.hasOwnProperty.call(this.drawCtrl, type)) {
        this.drawCtrl[type].dataSource = this.dataSource;
      }
    }
  },
  /**
   * 将Collection的激活取消
   */
  _resetCollection() {
    this.dataSource = this.defaulDataSource;
    for (let type in this.drawCtrl) {
      if (Object.prototype.hasOwnProperty.call(this.drawCtrl, type)) {
        this.drawCtrl[type].dataSource = this.dataSource;
      }
    }
  },
  createDrawLayer({ id, name, layerTag } = {}) {
    let collection = this.getOrCreateCollection(id);
    //避免name和tag为空时对已有layer的name和tag的覆盖。
    collection.name = name || collection.name;
    collection.layerTag = layerTag || collection.layerTag;
    return collection;
  },
  /**
   * 和laodjson区别:主要目的是兼容二维的样式结构和名称。
   */
  loadGeoJson(GeoJSON, { isClear, isFly, isFlash, layerId, style, type } = {}) {
    try {
      if (typeof GeoJSON === 'string' && GeoJSON.constructor === String)
        GeoJSON = JSON.parse(GeoJSON);
    } catch (e) {
      console.error(e.name + ': ' + e.message + ' \n请确认json文件格式正确!!!');
      return;
    }

    // 总的totalStyle对象
    const totalStyle = {
      ...defaultStyle,
      ...style,
      icon: {
        ...defaultStyle.icon,
        ...style?.icon
      },
      text: { ...defaultStyle.text, ...style?.text },
      circle: { ...defaultStyle.circle, ...style?.circle }
    };

    // 三维内部使用的style对象
    const threeStyle = {};

    // 将totalStyle转换为三维内部使用的style对象
    threeStyle.color = totalStyle.fillColor;
    threeStyle.outlineColor = totalStyle.strokeColor;
    threeStyle.outlineWidth = totalStyle.strokeWidth;
    switch (type) {
      case 'point': {
        threeStyle.color = totalStyle.circle.fillColor;
        threeStyle.pixelSize = totalStyle.circle.radius;
        threeStyle.outlineColor = totalStyle.circle.strokeColor;
        threeStyle.outlineWidth = totalStyle.circle.strokeWidth;
        break;
      }
      case 'text': {
        threeStyle.color = totalStyle.text?.fillColor;
        threeStyle.border_color = totalStyle.text?.strokeColor;
        threeStyle.border_width = totalStyle.text?.strokeWidth;
        threeStyle.text = totalStyle.text.text;
        threeStyle.font = totalStyle.text?.font;
        break;
      }
      case 'icon': {
        threeStyle.src = totalStyle.icon.src;
        threeStyle.pixelOffset = totalStyle.icon?.anchor;
        break;
      }
      case 'model': {
        threeStyle.modelUrl = totalStyle.model.url;
        threeStyle.heading = totalStyle.model.heading;
        threeStyle.opacity = totalStyle.model.opacity;
      }
    }
    //仍旧支持featureCollection和feature
    if (Array.isArray(GeoJSON.features)) {
      GeoJSON.features.forEach((feature) => {
        feature.properties = {
          type,
          style: threeStyle,
          attr: feature.properties
        };
      });
    } else {
      GeoJSON.properties = {
        type,
        style: threeStyle,
        attr: GeoJSON.properties
      };
    }

    return this.loadJson(GeoJSON, {
      isClear,
      isFly,
      isFlash,
      layerId,
      style
    });
  },
  /**
   *
   * @param {*} json
   * @param {*} param1 包含清除、定位、图层id、图层样式
   * @returns
   */
  loadJson(json, { isClear, isFly, isFlash, layerId, style } = {}) {
    try {
      if (util.isString(json)) json = JSON.parse(json);
    } catch (e) {
      util.alert(e.name + ': ' + e.message + ' \n请确认json文件格式正确!!!');
      return;
    }
    if (style) {
      if (Array.isArray(json.features)) {
        json.features.forEach((feature) => {
          feature.properties.style = Object.assign(
            {},
            style,
            feature.properties.style
          );
        });
      } else {
        json.properties.style = Object.assign({}, style, json.properties.style);
      }
    }
    isClear && this.clearDraw();
    let collection;
    if (layerId) {
      collection = this.getOrCreateCollection(layerId);
      this._activateCollection(collection);
    }
    let results = this._loadJson(json, isClear, isFly);
    layerId && this._resetCollection();
    if (isFlash) {
      if (this.viewer._zoomPromise) {
        this.viewer._zoomPromise.then(() => {
          this.flashing(collection);
        });
      } else this.flashing(collection);
    }
    return results;
  },
  /**
   * 改变模式entity、primitive
   * @func Draw.changeMode
   * @param mode {options} 模式 entity/primitive/null当为null时，相当于切换模式。
   * @return {entity}
   */
  changeMode(mode) {
    if (mode == null) {
      mode = Object.values(this.drawCtrl)[0].mode;
      mode = mode === 'entity' ? 'primitive' : 'entity';
    }
    mode = mode === 'entity' ? 'entity' : 'primitive';
    for (const key in this.drawCtrl) {
      if (Object.prototype.hasOwnProperty.call(this.drawCtrl, key)) {
        const element = this.drawCtrl[key];
        element.mode = mode;
      }
    }
    return mode;
  },
  /**
   * 开始绘制
   * @func Draw.startDraw
   * @param attribute {options} 绘制参数
   * @param attribute.type 绘制的类型
   * @param attribute.success {function=} 回调函数
   * @return {entity}
   */
  //==========绘制相关==========
  startDraw: function startDraw(attribute) {
    //参数是字符串id或uri时
    if (typeof attribute === 'string') {
      attribute = {
        type: attribute
      };
    } else {
      if (attribute == null || attribute.type == null) {
        console.error('需要传入指定绘制的type类型！');
        return;
      }
    }

    let type = attribute.type;
    if (this.drawCtrl[type] == null) {
      console.error('不能进行type为【' + type + '】的绘制，无该类型！');
      return;
    }

    let drawOkCalback;
    if (attribute.success) {
      drawOkCalback = attribute.success;
      delete attribute.success;
    }

    //赋默认值
    attribute = DrawUtil.addGeoJsonDefVal(attribute);

    this.stopDraw();

    let entity = this.drawCtrl[type].activate(attribute, drawOkCalback);

    this.bindDeleteContextmenu(entity);
    this.fire('change:active', { active: true, drawtype: attribute.edittype });
    return entity;
  },

  /**
   * 外部控制，完成绘制，比如手机端无法双击结束
   * @func Draw.endDraw
   * @return {this}
   */
  //外部控制，完成绘制，比如手机端无法双击结束
  endDraw: function endDraw() {
    for (let type in this.drawCtrl) {
      if (Object.prototype.hasOwnProperty.call(this.drawCtrl, type)) {
        if (this.drawCtrl[type].endDraw) this.drawCtrl[type].endDraw();
      }
    }
    return this;
  },

  /**
   * 停止绘制
   * @func Draw.stopDraw
   * @return {this}
   */
  stopDraw: function stopDraw() {
    this.stopEditing();
    for (let type in this.drawCtrl) {
      if (Object.prototype.hasOwnProperty.call(this.drawCtrl, type)) {
        this.drawCtrl[type].disable(true);
      }
    }
    this.fire('change:active', { active: false });
    return this;
  },

  /**
   * 清除绘制的要素，包括dataSource.entities和primitives
   * @func Draw.clearDraw
   * @return {this}
   */
  clearDraw: function clearDraw() {
    let collections = this.getCollections();
    for (let index = 0; index < collections.length; index++) {
      //应该将collection也移除，但是运行逻辑有问题，后续优化
      const element = collections[index];
      element.dataSource.entities.removeAll();
    }
    //删除所有
    this.stopDraw();
    this.dataSource.entities.removeAll();
    this.primitives.removeAll();
    this.groundPrimitives.removeAll();
    return this;
  },
  //==========编辑相关==========
  currEditFeature: null, //当前编辑的要素

  /**
   * 获取当前正在编辑的要素currEditFeature
   * @func Draw.getCurrentEntity
   * @return {entity}
   */
  getCurrentEntity: function getCurrentEntity() {
    return this.currEditFeature;
  },
  _hasEdit: null,

  /**
   * @func Draw.hasEdit
   */
  hasEdit: function hasEdit(val) {
    if (this._hasEdit !== null && this._hasEdit === val) return;

    this._hasEdit = val;
    if (val) {
      this.bindSelectEvent();
    } else {
      if (
        //当正在编辑时
        this.currEditFeature?.editing?.disable
      ) {
        this.stopEditing();
      }
      this.destroySelectEvent();
    }
  },

  /**
   * 绑定鼠标选中事件
   * @func Draw.bindSelectEvent
   */
  //绑定鼠标选中事件
  bindSelectEvent: function bindSelectEvent() {
    let _this = this;

    //选取对象 陈利军，修改了拾取方式，避免多层数据干扰判断
    let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction(function (event) {
      //let pickedObject = _this.viewer.scene.pick(event.position, 5, 5)
      let pickedObject;
      let pickedObjects = _this.viewer.scene.drillPick(event.position);
      if (pickedObjects.length) {
        for (let i = 0; i < pickedObjects.length; i++) {
          pickedObject = pickedObjects[i];
          if (Cesium.defined(pickedObject)) {
            let entity =
              pickedObject.id ||
              pickedObject.primitive.id ||
              pickedObject.primitive;
            if (entity && _this.isMyEntity(entity)) {
              if (_this.currEditFeature && _this.currEditFeature === entity)
                return; //重复单击了跳出
              if (!Cesium.defaultValue(entity.inProgress, false)) {
                //纪舒敏 增加kzedit来开启控制编辑
                if (entity && entity.attribute && entity.attribute.kzedit) {
                  _this.stopEditing();
                } else {
                  _this.startEditing(entity);
                  setTimeout(function () {
                    //edit中的MOUSE_MOVE会关闭提示，延迟执行。
                    _this.tooltip.showAt(event.endPosition, message.edit.start);
                  }, 100);
                }
                //end
                return;
              }
            }
          }
        }
      }
      _this.stopEditing();
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    //编辑提示事件
    handler.setInputAction(function (event) {
      if (!_this._hasEdit) return;
      //未绘制时，保证性能。
      if (
        _this.dataSource.entities.values.length === 0 &&
        _this.primitives._primitives.length === 0
      )
        return;
      if (_this.tooltip._div.style.display !== 'none')
        _this.tooltip.setVisible(false); //减少DOM操作

      debouncer.active(() => {
        let pickedObject;
        let pickedObjects = _this.viewer.scene.drillPick(event.endPosition); //拾取对象判断
        if (pickedObjects.length) {
          for (let i = 0; i < pickedObjects.length; i++) {
            pickedObject = pickedObjects[i];
            if (Cesium.defined(pickedObject)) {
              let entity =
                pickedObject.id ||
                pickedObject.primitive.id ||
                pickedObject.primitive;
              if (entity && _this.isMyEntity(entity)) {
                if (_this.currEditFeature && _this.currEditFeature === entity)
                  return; //重复单击了跳出
                if (!Cesium.defaultValue(entity.inProgress, false)) {
                  let tooltip = _this.tooltip;
                  let draw_tooltip = message.edit.start;
                  if (entity._isDragger) draw_tooltip = entity.draw_tooltip;
                  //纪舒敏 三角测量，方位测量提示右击删除
                  if (entity && entity.attribute && entity.attribute.kzedit) {
                    draw_tooltip = message.del.end;
                  }
                  setTimeout(function () {
                    //edit中的MOUSE_MOVE会关闭提示，延迟执行。
                    tooltip.showAt(event.endPosition, draw_tooltip);
                  }, 100);
                }
                //end
                return;
              }
            }
          }
        }
      });

      /*
        let pickedObject = _this.viewer.scene.pick(event.endPosition, 5, 5)

        if (Cesium.defined(pickedObject)) {
            let entity = pickedObject.id || pickedObject.primitive.id || pickedObject.primitive
            if (entity && entity.editing && !Cesium.defaultValue(entity.inProgress, false) && _this.isMyEntity(entity)) {
                let tooltip = _this.tooltip
                let draw_tooltip = message.edit.start
                //纪舒敏 三角测量，方位测量提示右击删除
                if (entity.attribute.kzedit)
                    draw_tooltip = message.del.end
                setTimeout(function() {
                    //edit中的MOUSE_MOVE会关闭提示，延迟执行。
                    tooltip.showAt(event.endPosition, draw_tooltip)

                }, 100)
            }
        }
        */
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    handler.setInputAction(function (event) {
      if (!_this._hasEdit) return;

      _this.tooltip.setVisible(false);
      let pickedObject;
      let pickedObjects = _this.viewer.scene.drillPick(event.position); //拾取对象判断

      if (pickedObjects.length) {
        for (let i = 0; i < pickedObjects.length; i++) {
          pickedObject = pickedObjects[i];
          if (Cesium.defined(pickedObject)) {
            let entity =
              pickedObject.id ||
              pickedObject.primitive.id ||
              pickedObject.primitive;
            if (entity && _this.isMyEntity(entity)) {
              if (_this.currEditFeature && _this.currEditFeature === entity)
                return; //重复单击了跳出
              if (!Cesium.defaultValue(entity.inProgress, false)) {
                //删除坐标点
                if (
                  entity &&
                  entity.editing &&
                  entity._isDragger &&
                  entity.movepoint
                ) {
                  _this.deleteEntity(entity);
                  _this.viewer.shine.popup.close();
                }
                //删除线和面
                if (
                  entity &&
                  entity.editing &&
                  !Cesium.defaultValue(entity.inProgress, false) &&
                  _this.isMyEntity(entity)
                ) {
                  setTimeout(function () {
                    //edit中的MOUSE_MOVE会关闭提示，延迟执行。
                    _this.deleteEntity(entity);
                    if (_this.options.calbackdel)
                      _this.options.calbackdel(entity);
                    if (entity._exline) {
                      _this.dataSource.entities.remove(entity._exline);
                    }
                    if (entity._arrLables) {
                      for (let i = 0; i < entity._arrLables.length; i++)
                        entity._arrLables[i].show = false;
                    }
                    if (entity._totalLable) entity._totalLable.show = false;
                  }, 100);
                }
              }
              return;
            }
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    // //纪舒敏 右键删除该对象
    // handler.setInputAction(function(event) {
    //     if (!_this._hasEdit) return

    //     _this.tooltip.setVisible(false)

    //     let pickedObject = _this.viewer.scene.pick(event.position, 5, 5)

    //     if (Cesium.defined(pickedObject)) {
    //         let entity = pickedObject.id || pickedObject.primitive.id || pickedObject.primitive
    //         //删除坐标点
    //         if (entity && entity.editing && entity._isDragger && entity.movepoint) {
    //             _this.dataSource.entities.remove(entity)
    //             viewer.shine.popup.close()
    //         }
    //         //删除线和面
    //         if (entity && entity.editing && !Cesium.defaultValue(entity.inProgress, false) && _this.isMyEntity(entity)) {
    //             setTimeout(function() {
    //                 //edit中的MOUSE_MOVE会关闭提示，延迟执行。
    //                 _this.dataSource.entities.remove(entity)
    //                 if (_this.options.calbackdel) _this.options.calbackdel(entity)
    //                 if (entity._exline) {
    //                     _this.dataSource.entities.remove(entity._exline)
    //                 }
    //                 if (entity._arrLables) {
    //                     for (let i = 0; i < entity._arrLables.length; i++)
    //                         entity._arrLables[i].show = false
    //                 }
    //                 if (entity._totalLable)
    //                     entity._totalLable.show = false

    //             }, 100)
    //         }
    //     }
    // }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
    // //end

    this.selectHandler = handler;
  },

  /**
   * 销毁选中事件
   * @func Draw.destroySelectEvent
   */
  destroySelectEvent: function destroySelectEvent() {
    this.selectHandler && this.selectHandler.destroy();
    this.selectHandler = undefined;
  },

  /**
   * 开始编辑
   * @func Draw.startEditing
   * @param {enttity} entity
   */
  startEditing: function startEditing(entity) {
    this.stopEditing();
    if (entity == null || !this._hasEdit) return;

    if (entity.editing && entity.editing.activate) {
      entity.editing.activate();
    }
    this.currEditFeature = entity;
  },

  /**
   * 停止编辑
   * @func Draw.stopEditing
   */
  stopEditing: function stopEditing() {
    if (this.currEditFeature?.editing?.disable) {
      this.currEditFeature.editing.disable();
    }
    this.currEditFeature = null;
  },

  /**
   * 修改属性
   * @func Draw.updateAttribute
   * @param attribute 属性
   * @param entity 需要修改的entity
   * @returns {entity}
   */
  //修改了属性
  updateAttribute: function updateAttribute(attribute, entity) {
    if (entity == null) entity = this.currEditFeature;
    if (entity == null || attribute == null) return;

    attribute.style = attribute.style || {};
    attribute.attr = attribute.attr || {};

    //更新属性
    let type = entity.attribute.type;
    this.drawCtrl[type].style2Entity(attribute.style, entity);
    entity.attribute = attribute;

    //如果在编辑状态，更新绑定的拖拽点
    if (entity.editing) {
      if (entity.editing.updateAttrForEditing)
        entity.editing.updateAttrForEditing();

      if (entity.editing.updateDraggers) entity.editing.updateDraggers();
    }

    //名称 绑定到tooltip
    if (this.options.nameTooltip) {
      let that = this;
      if (entity.attribute.attr && entity.attribute.attr.name) {
        entity.tooltip = {
          html: entity.attribute.attr.name,
          check: function check() {
            return !that._hasEdit;
          }
        };
      } else {
        entity.tooltip = null;
      }
    }
    return entity;
  },

  /**
   * 修改坐标、高程
   * @func Draw.setPositions
   * @param positions 坐标
   * @param entity 需要修改的entity
   * @returns {entity}
   */
  //修改坐标、高程
  setPositions: function setPositions(positions, entity) {
    if (entity == null) entity = this.currEditFeature;
    if (entity == null || positions == null) return;

    //如果在编辑状态，更新绑定的拖拽点
    if (entity.editing) {
      entity.editing.setPositions(positions);
      entity.editing.updateDraggers();
    }
    return entity;
  },
  //==========删除相关==========
  //右键菜单
  bindDeleteContextmenu: function bindDeleteContextmenu(entity) {
    let that = this;
    entity.contextmenuItems = entity.contextmenuItems || [];
    entity.contextmenuItems.push({
      text: '删除对象',
      iconCls: 'fa fa-trash-o',
      visible: function () {
        return that._hasEdit;
      },
      calback: function (e) {
        let entity = e.target;

        if (entity.editing && entity.editing.disable) {
          entity.editing.disable();
        }
        that.deleteEntity(entity);
      }
    });
  },

  /**
   * 删除单个entity
   * @func Draw.deleteEntity
   * @param entity 要删除的entity
   */
  //删除单个
  deleteEntity: function deleteEntity(entity) {
    entity = entity || this.currEditFeature;
    if (entity == null) return;
    this.fire('delete-feature', entity);

    let id = entity.entityCollection?.owner.id;
    let collection = this.getCollection(id);
    collection && this._activateCollection(collection);
    if (entity.editing) {
      entity.editing.disable();
    }
    let Primitives = this.primitives._primitives;
    if (entity instanceof Cesium.Entity)
      this.dataSource.entities.remove(entity);
    else if (this.primitives.contains(entity)) this.primitives.remove(entity);
    else if (entity instanceof Cesium.PointPrimitive) {
      let points = Primitives.find((e) => {
        return e instanceof Cesium.PointPrimitiveCollection;
      });
      points.remove(entity);
    } else if (entity instanceof Cesium.Label) {
      let labels = Primitives.find((e) => {
        return e instanceof Cesium.LabelCollection;
      });
      labels.remove(entity);
    } else if (entity instanceof Cesium.Billboard) {
      let billboards = Primitives.find((e) => {
        return e instanceof Cesium.BillboardCollection;
      });
      billboards.remove(entity);
    } else if (entity instanceof Cesium.Polyline) {
      let polylines = Primitives.find((e) => {
        return e instanceof Cesium.PolylineCollection;
      });
      polylines.remove(entity);
    }
    this._resetCollection();
  },

  /**
   * 是否为当前编辑器编辑的标号
   * @func Draw.isMyEntity
   * @param entity 要判断的entity
   */
  //是否为当前编辑器编辑的标号
  isMyEntity: function isMyEntity(entity) {
    //会有传入entity为字符的错误情况。 直接return false
    if (typeof entity === 'string') return false;

    if (
      entity instanceof Cesium.Entity &&
      this.dataSource.entities.contains(entity)
    )
      return true;
    let collections = this.getCollections();
    for (let index = 0; index < collections.length; index++) {
      if (collections[index].dataSource.entities.contains(entity)) return true;
    }
    if (this.primitives.contains(entity)) return true;
    let Primitives = this.primitives._primitives;
    if (entity instanceof Cesium.PointPrimitive) {
      let points = Primitives.find((e) => {
        return e instanceof Cesium.PointPrimitiveCollection;
      });
      return points?.contains(entity);
    } else if (entity instanceof Cesium.Label) {
      let labels = Primitives.find((e) => {
        return e instanceof Cesium.LabelCollection;
      });
      return labels?.contains(entity);
    } else if (entity instanceof Cesium.Billboard) {
      let billboards = Primitives.find((e) => {
        return e instanceof Cesium.BillboardCollection;
      });
      return billboards?.contains(entity);
    } else if (entity instanceof Cesium.Polyline) {
      let polylines = Primitives.find((e) => {
        return e instanceof Cesium.PolylineCollection;
      });
      return polylines?.contains(entity);
    } else if (entity instanceof Cesium.CumulusCloud) {
      let clouds = Primitives.find((e) => {
        return e instanceof Cesium.CloudCollection;
      });
      return clouds?.contains(entity);
    }
    return false;
  },

  /**
   * 删除所有entity
   * @func Draw.deleteAll
   */
  //删除所有 除了绘制的图形，还删除所有的collection
  deleteAll: function deleteAll() {
    this.clearDraw();
    let collections = this.getCollections();
    for (let index = 0; index < collections.length; index++) {
      this.removeCollection(collections[index]);
    }
  },

  /**
   * 转换当前所有为geojson
   * @func Draw.toGeoJSON
   * @param entity 要导出的的entity
   */
  //==========转换GeoJSON==========
  //转换当前所有为geojson
  toGeoJSON: function toGeoJSON(entity) {
    this.stopDraw();

    if (entity == null) {
      //全部数据
      let arrEntity = this.getEntitys();
      if (arrEntity.length === 0) return null;

      let features = [];
      for (let i = 0, len = arrEntity.length; i < len; i++) {
        let entity = arrEntity[i];
        if (entity.attribute == null || entity.attribute.type == null) continue;
        //取出layerId添加到attr中
        if (this.getCollection(entity.entityCollection.owner.id))
          entity.attribute.attr.layerId = entity.entityCollection.owner.id;
        let type = entity.attribute.type;
        let geojson = this.drawCtrl[type].toGeoJSON(entity);
        if (geojson == null) continue;
        geojson = DrawUtil.removeGeoJsonDefVal(geojson);

        features.push(geojson);
      }
      if (features.length > 0)
        return {
          type: 'FeatureCollection',
          features: features
        };
      else return null;
    } else {
      let type = entity.attribute.type;
      let geojson = this.drawCtrl[type].toGeoJSON(entity);
      geojson = DrawUtil.removeGeoJsonDefVal(geojson);
      return geojson;
    }
  },

  /**
   * 加载goejson数据
   * @func Draw.jsonToEntity
   * @param json
   * @param isClear
   * @param isFly
   * @return {entity}
   */
  //加载goejson数据
  jsonToEntity: function jsonToEntity(json, isClear, isFly) {
    //兼容旧版本方法名

    return this.loadJson(json, isClear, isFly);
  },

  _loadJson: function loadJson(json, isClear, isFly) {
    let jsonObjs = json;
    if (isClear) {
      this.clearDraw();
    }
    let arrthis = [];
    //let jsonFeatures = jsonObjs.features ? jsonObjs.features : [jsonObjs];
    let properties;
    if (jsonObjs.type !== 'FeatureCollection') {
      properties = jsonObjs.properties;
    }
    let jsonFeatures = getFeaturesFromGeoJson(jsonObjs, {
      featureProjection: 'EPSG:4326'
    });
    if (properties) {
      jsonFeatures[0].setProperties(properties);
    }
    //超过5000个，即以primitive加载。
    let rawMode = Object.values(this.drawCtrl)[0].mode;
    if (jsonFeatures.length > 5000) {
      this.changeMode('primitive');
    }
    let that = this;
    let isCtg;
    (function foo(jsonFeatures) {
      for (let i = 0, len = jsonFeatures.length; i < len; i++) {
        let feature = jsonFeatures[i];

        if (!feature.getProperties().type) {
          //非本身保存的外部其他geojson数据
          let polygons,
            newFeatures = [];
          switch (feature.getGeometry().getType()) {
            case 'MultiPolygon':
              polygons = feature.getGeometry().getPolygons();
              for (let index = 0; index < polygons.length; index++) {
                const polygon = polygons[index];
                let featureClone = feature.clone();
                featureClone.setGeometry(polygon);
                newFeatures.push(featureClone);
              }
              foo(newFeatures);
              return; //return即代表目前只支持单个的multiPolygon要素,length>1后面被遗漏
            case 'Polygon':
              feature.set('type', 'polygon');
              break;
            case 'MultiLineString':
            case 'LineString':
              feature.set('type', 'polyline');
              break;
            case 'MultiPoint':
            case 'Point':
              feature.set('type', 'point');
              break;
          }
        }

        let type = feature.getProperties().type;
        if (that.drawCtrl[type] == null) {
          console.error('数据无法识别或者数据的[' + type + ']类型参数有误');
          continue;
        }
        feature.set(
          'style',
          Cesium.defaultValue(feature.getProperties().style, {})
        );

        //赋默认值
        feature.setProperties(
          DrawUtil.addGeoJsonDefVal(feature.getProperties())
        );
        let layerId = feature.getProperties().attr?.layerId;
        let collection;
        if (layerId) {
          //支持feature属性的layerId
          collection = that.getOrCreateCollection(layerId);
          that._activateCollection(collection);
        }
        //插入拦截，如果是primitive则直接跳走。
        if (
          Object.values(that.drawCtrl)[0].mode === 'primitive' &&
          that.drawCtrl[type].loadJson
        ) {
          let _jsonFeatures = getGeoJsonFromFeatures(jsonFeatures);
          _jsonFeatures = JSON.parse(_jsonFeatures).features;
          let primitive = that.drawCtrl[type].loadJson(_jsonFeatures);
          if (isFly)
            primitive.readyPromise.then((primitive) => {
              primitive._boundingSpheres[0] &&
                that.viewer.scene.camera.flyToBoundingSphere(
                  primitive._boundingSpheres[0]
                );
            });
          return primitive;
        }
        let feature_xx = getGeoJsonFromFeatures([feature]);
        isCtg = feature.getProperties().style.clampToGround;
        feature_xx = JSON.parse(feature_xx).features[0];
        let entity = that.drawCtrl[type].jsonToEntity(feature_xx);
        layerId && that._resetCollection();
        that.bindDeleteContextmenu(entity);

        //名称 绑定到tooltip
        if (that.options.nameTooltip) {
          if (entity.attribute.attr && entity.attribute.attr.name) {
            let that = that;
            entity.tooltip = {
              html: entity.attribute.attr.name,
              check: function check() {
                return !that._hasEdit;
              }
            };
          } else {
            entity.tooltip = null;
          }
        }

        arrthis.push(entity);
      }
    })(jsonFeatures);

    if (jsonFeatures.length > 5000) this.changeMode(rawMode);
    if (isFly) {
      //小范围且贴地的，易发生定位不准，所以pitch:-90
      if (isCtg) {
        this.viewer.flyTo(arrthis, {
          offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90), 0)
        });
      } else this.viewer.flyTo(arrthis);
    }
    return arrthis;
  },

  /**
   * 属性转entity
   * @func Draw.attributeToEntity
   * @param attribute 需要修改的entity
   * @param positions 坐标
   * @returns {entity}
   */
  //属性转entity
  attributeToEntity: function attributeToEntity(attribute, positions) {
    return this.drawCtrl[attribute.type].attributeToEntity(
      attribute,
      positions
    );
  },

  /**
   * 绑定外部entity到标绘
   * @func Draw.bindExtraEntity
   * @param entity 需要绑定的entity
   * @param attribute 属性
   * @returns {entity}
   */
  //绑定外部entity到标绘
  bindExtraEntity: function bindExtraEntity(entity, attribute) {
    entity = this.drawCtrl[attribute.type].attributeToEntity(entity, attribute);
    this.dataSource.entities.add(entity);
  },
  //==========对外接口==========
  _visible: true,

  /**
   * 设置显隐
   * @func Draw.setVisible
   * @param visible {boolean} 显隐
   */
  setVisible: function setVisible(visible) {
    this._visible = visible;
    if (!visible) {
      this.stopDraw();
    }

    this.dataSource.show = visible;
    this.primitives.show = visible;
  },
  /**
   * 使图形闪烁
   * @param {*} collection 当传入colleciton时闪烁colleciton，否则闪烁整个Draw里的图形。
   */
  flashing(collection) {
    let i = 0,
      self = this;
    let previousVisible = this._visible;
    if (collection) {
      collection = this.getCollection(collection) || collection;
      if (!(collection instanceof Object)) return; //collection为非法参数时
      this._activateCollection(collection);
    } else {
      //对Draw里的所有图形进行闪烁
      // eslint-disable-next-line no-func-assign
      sV = (v) => {
        this.setVisible(v);
        let collections = this.getCollections();
        for (let index = 0; index < collections.length; index++) {
          const element = collections[index];
          element.dataSource.show = v;
        }
      };
    }

    hide();
    function hide() {
      sV(false);
      setTimeout_cus(show, 100);
    }
    function show() {
      sV(true);
      i++;
      if (i < 4) {
        setTimeout_cus(hide, 200);
      } else {
        sV(previousVisible);
        collection && self._resetCollection();
      }
    }
    function sV(v) {
      self.setVisible(v);
    }

    function setTimeout_cus(fun, ms) {
      //不考虑隔天的情况。
      const initialTime = self.viewer.myClock.currentTime.secondsOfDay;
      let listener = (t) => {
        let difference = t.currentTime.secondsOfDay - initialTime;
        if (difference >= ms * 0.001) {
          self.viewer.myClock.onTick.removeEventListener(listener);
          fun();
        }
      };
      self.viewer.myClock.onTick.addEventListener(listener);
    }
  },

  /**
   * 是否存在绘制
   * @func Draw.hasDraw
   * @return {boolean} 是否显隐
   */
  //是否存在绘制
  hasDraw: function hasDraw() {
    return this.getEntitys().length > 0;
  },

  /**
   * 获取所有绘制的实体对象列表
   * @func Draw.getEntitys
   * @returns {[entity|primitives]} entity和primitive的数组
   */
  //获取所有绘制的实体对象列表
  getEntitys: function getEntitys() {
    this.stopDraw();
    let arr = this.dataSource.entities.values;

    let collections = this.getCollections();
    for (let index = 0; index < collections.length; index++) {
      const element = collections[index];
      arr = arr.concat(element.dataSource.entities.values);
    }

    for (let index = 0; index < this.primitives._primitives.length; index++) {
      const primitive = this.primitives._primitives[index];
      if (primitive instanceof Cesium.PointPrimitiveCollection)
        arr = arr.concat(primitive._pointPrimitives);
      else if (primitive instanceof Cesium.LabelCollection) {
        arr = arr.concat(primitive._labels);
      } else if (primitive instanceof Cesium.BillboardCollection) {
        arr = arr.concat(primitive._billboards);
      } else {
        arr.push(primitive);
      }
    }
    //arr = arr.concat(this.primitives._primitives);
    return arr;
  },

  /**
   * 获取数据源
   * @func Draw.getDataSource
   * @returns {Cesium.Datasource}
   */
  getDataSource: function getDataSource() {
    return this.dataSource;
  },

  /**
   * 使用id来获取entity
   * @func Draw.getEntityById
   * @param id 实体的id
   * @returns {entity|Draw.primitives|null}
   */
  getEntityById: function getEntityById(id) {
    let arrEntity = this.getEntitys();
    for (let i = 0, len = arrEntity.length; i < len; i++) {
      let entity = arrEntity[i];
      if (id === entity.attribute?.attr?.id) {
        return entity;
      }
    }
    return null;
  },

  /**
   * 获取实体的经纬度值 坐标数组
   * @func Draw.getCoordinates
   * @param entity 实体
   * @returns {*} 坐标
   */
  //获取实体的经纬度值 坐标数组
  getCoordinates: function getCoordinates(entity) {
    let type = entity?.attribute?.type;
    return this.drawCtrl[type]?.getCoordinates(entity);
  },

  /**
   * 获取实体的坐标数组
   * @func Draw.getPositions
   * @param entity 实体
   * @returns {*} 坐标数组
   */
  //获取实体的坐标数组
  getPositions: function getPositions(entity) {
    let type = entity?.attribute?.type;
    return this.drawCtrl[type]?.getPositions(entity);
  },

  /**
   * 销毁
   * @func Draw.destroy
   */
  destroy: function destroy() {
    this.stopDraw();
    this.hasEdit(false);
    this.clearDraw();
    if (this.viewer.dataSources.contains(this.dataSource))
      this.viewer.dataSources.remove(this.dataSource, true);

    if (this.viewer.scene.primitives.contains(this.primitives))
      this.viewer.scene.primitives.remove(this.primitives);
    if (this.viewer.scene.groundPrimitives.contains(this.groundPrimitives))
      this.viewer.scene.groundPrimitives.remove(this.groundPrimitives);
  }
});

//绑定到draw，方便外部使用
Draw.Base = DrawBase;
Draw.Billboard = DrawBillboard;
Draw.Circle = DrawCircle;
Draw.Cloud = DrawCloud;
Draw.Cylinder = DrawCylinder;
Draw.Corridor = DrawCorridor;
Draw.Curve = DrawCurve;
Draw.Ellipsoid = DrawEllipsoid;
Draw.Label = DrawLabel;
Draw.Model = DrawModel;
Draw.Point = DrawPoint;
Draw.Polygon = DrawPolygon;
Draw.Polyline = DrawPolyline;
Draw.PolylineVolume = DrawPolylineVolume;
Draw.Rectangle = DrawRectangle;
Draw.Wall = DrawWall;
//
Draw.PModel = DrawPModel;
//
Draw.PolygonEx = DrawPolygonEx;

export { Draw, register };
