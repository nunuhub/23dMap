import * as Cesium from 'cesium_shinegis_earth';
import * as EventType from '../Draw/EventType7';
import * as DrawUtil from '../Tool/Util3';
import * as draggerCtl from './Dragger6';
import { Class } from '../Tool/Class13';
import { message } from '../Tool/ToolTip4';

import { getCurrentMousePosition, getCameraView } from '../Tool/Point2';
const darkOrange = Cesium.Color.DARKORANGE.clone();
const deepBlue = Cesium.Color.DEEPSKYBLUE.clone();
const selectedColor = Cesium.Color.RED.clone();
/*尝试 */
class Debouncer {
  //函数防抖器。
  constructor(step = 50) {
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
 * 编辑基础类
 * @class
 * @extends Class
 */
const EditBase = Class.extend({
  _dataSource: null,
  _minPointNum: 1, //至少需要点的个数 (值是draw中传入)
  _maxPointNum: 9999, //最多允许点的个数 (值是draw中传入)

  /**
   * 初始化
   * @func EditBase.initialize
   * @param opts 编辑基类的配置项[entity,viewer,dataSource]
   * @param {Cesium.Entity} opts.entity 编辑的实体
   * @param opts.viewer {Cesium.Viewer} Cesium.Viewer的一个实例
   * @param {Cesium.CustomDataSource} opts.dataSource 自定义数据源，用于存放绘制的数据，如果没有传，那么自动初始化一个
   */
  initialize: function initialize([entity, viewer, dataSource]) {
    this.entity = entity;
    this.viewer = viewer;
    this.dataSource = dataSource;
    this._positions_draw = entity._positions_draw;
    this.draggers = [];
  },

  /**
   * 触发事件
   * @func EditBase.fire
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
   * @func EditBase.formatNum
   * @param num
   * @param digits
   * @returns {number}
   */
  formatNum: function formatNum(num, digits) {
    return DrawUtil.formatNum(num, digits);
  },

  /**
   * 设置鼠标cursor
   * @func EditBase.setCursor
   * @param val
   */
  setCursor: function setCursor(val) {
    this.viewer._container.style.cursor = val ? 'crosshair' : '';
  },

  /**
   * 激活编辑
   * @func EditBase.activate
   * @returns {this}
   */
  activate: function activate() {
    if (this._enabled) {
      //_enabled表示可编辑的，即当前在编辑状态下。
      return this;
    }
    this._enabled = true;

    this.entity.inProgress = true;
    this.getPositionsFromEntity();
    this.changePositionsToCallback();
    this.bindDraggers();
    this.bindEvent();

    this.fire(EventType.EditStart, {
      edittype: this.entity.attribute?.type,
      entity: this.entity
    });

    return this;
  },
  /**
   * 将位置坐标从entity中取出赋值给this
   */
  getPositionsFromEntity() {
    this._positions_draw = this.entity._positions_draw;
  },
  /**
   * 释放编辑
   * @func EditBase.disable
   * @returns {this}
   */
  disable: function disable() {
    if (!this._enabled) {
      return this;
    }
    this._enabled = false;

    this.destroyEvent();
    this.destroyDraggers();
    this.finish();

    this.entity.inProgress = false;
    this.fire(EventType.EditStop, {
      edittype: this.entity.attribute?.type,
      entity: this.entity
    });
    this.tooltip.setVisible(false);

    return this;
  },

  /**
   * 钩子：改变坐标回调
   * @func EditBase.changePositionsToCallback
   */
  changePositionsToCallback: function changePositionsToCallback() {},

  /**
   * 图形编辑结束后调用
   * @func EditBase.finish
   */
  finish: function finish() {},

  /**
   * 拖拽点 事件
   * @func EditBase.bindEvent
   */
  bindEvent: function bindEvent() {
    let _this = this;

    let scratchBoundingSphere = new Cesium.BoundingSphere();
    let zOffset = new Cesium.Cartesian3();

    let draggerHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    draggerHandler.dragger = null;

    //选中后拖动
    let lastEntity,
      freeze = false;
    draggerHandler.setInputAction(function (event) {
      // debugger
      let pickedObject = _this.viewer.scene.pick(event.position);
      if (Cesium.defined(pickedObject)) {
        let entity =
          pickedObject.id ||
          pickedObject.primitive.id ||
          pickedObject.primitive;
        if (entity && Cesium.defaultValue(entity._isDragger, false)) {
          _this.viewer.scene.screenSpaceCameraController.enableRotate = false;
          _this.viewer.scene.screenSpaceCameraController.enableTilt = false;
          _this.viewer.scene.screenSpaceCameraController.enableTranslate = false;
          _this.viewer.scene.screenSpaceCameraController.enableInputs = false;

          if (_this.viewer.mars) _this.viewer.mars.popup.close(entity);

          freeze = true;
          draggerHandler.dragger = entity;

          if (draggerHandler.dragger.point || draggerHandler.dragger.ellipsoid)
            draggerHandler.dragger.show = false;
          _this.setCursor(true);
          // if (draggerHandler.dragger.ellipsoid) draggerHandler.dragger.show = true
          // _this.setCursor(true)

          if (draggerHandler.dragger.onDragStart) {
            console.warn('points have been added');
            let position = draggerHandler.dragger.position;
            if (position && position.getValue) {
              position = position.getValue(_this.viewer.clock.currentTime);
            } else {
              position = getCurrentMousePosition(
                _this.viewer.scene,
                event.position
              );
            }

            draggerHandler.dragger.onDragStart(
              draggerHandler.dragger,
              position
            );
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    draggerHandler.setInputAction(function (event) {
      let pickedObject = _this.viewer.scene.pick(event.position);
      if (Cesium.defined(pickedObject)) {
        let entity =
          pickedObject.id ||
          pickedObject.primitive.id ||
          pickedObject.primitive;
        if (entity?._isDragger) {
          _this.viewer.scene.screenSpaceCameraController.enableRotate = false;
          _this.viewer.scene.screenSpaceCameraController.enableTilt = false;
          _this.viewer.scene.screenSpaceCameraController.enableTranslate = false;
          _this.viewer.scene.screenSpaceCameraController.enableInputs = false;

          if (_this.viewer.mars) _this.viewer.mars.popup.close(entity);

          draggerHandler.dragger = entity;

          if (draggerHandler.dragger.point || draggerHandler.dragger.ellipsoid)
            draggerHandler.dragger.show = false;
          _this.setCursor(true);

          if (draggerHandler.dragger.onRightDown) {
            let position = draggerHandler.dragger.position;
            if (position && position.getValue)
              position = position.getValue(_this.viewer.clock.currentTime);
            draggerHandler.dragger.onRightDown(
              draggerHandler.dragger,
              position
            );
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_DOWN);

    draggerHandler.setInputAction(function (event) {
      //新增:掠过dragger时候样式变化。
      //上一个entity样式重置。
      if (lastEntity && !freeze) {
        switch (lastEntity.draggerName) {
          case 'arrow_horizontal':
          case 'arrow_vertical': {
            lastEntity.appearance.material.uniforms.color = deepBlue;
            lastEntity = undefined;
            break;
          }
          case 'circle': {
            lastEntity.appearance.material.uniforms.color = darkOrange;
            lastEntity = undefined;
            break;
          }
          case 'plane': {
            lastEntity.appearance.material.uniforms.color = darkOrange;
            lastEntity = undefined;
            break;
          }
          default: {
            lastEntity = undefined;
          }
        }
      }
      let pickedObj = _this.viewer.scene.pick(event.endPosition);
      if (Cesium.defined(pickedObj)) {
        let entity =
          pickedObj.id || pickedObj.primitive.id || pickedObj.primitive;
        if (entity?._isDragger && !freeze) {
          //在这里更改entity的样式。
          switch (entity.draggerName) {
            case 'arrow_horizontal':
            case 'arrow_vertical': {
              entity.appearance.material.uniforms.color = selectedColor;
              lastEntity = entity;
              break;
            }
            case 'circle': {
              entity.appearance.material.uniforms.color = selectedColor;
              lastEntity = entity;
              break;
            }
            case 'plane': {
              entity.appearance.material.uniforms.color = selectedColor;
              lastEntity = entity;
              break;
            }
            default: {
              lastEntity = undefined;
            }
          }
        }
      }

      let dragger = draggerHandler.dragger;

      if (dragger) {
        switch (dragger._pointType) {
          case draggerCtl.PointType.MoveHeight: {
            //改变高度垂直拖动
            let dy = event.endPosition.y - event.startPosition.y;

            let position = dragger.position;
            if (position && position.getValue)
              position = position.getValue(_this.viewer.clock.currentTime);

            let tangentPlane = new Cesium.EllipsoidTangentPlane(position);

            scratchBoundingSphere.center = position;
            scratchBoundingSphere.radius = 1;

            let metersPerPixel =
              _this.viewer.scene.frameState.camera.getPixelSize(
                scratchBoundingSphere,
                _this.viewer.scene.frameState.context.drawingBufferWidth,
                _this.viewer.scene.frameState.context.drawingBufferHeight
              ) * 1.5;

            Cesium.Cartesian3.multiplyByScalar(
              tangentPlane.zAxis,
              -dy * metersPerPixel,
              zOffset
            );
            let newPosition = Cesium.Cartesian3.clone(position);
            Cesium.Cartesian3.add(position, zOffset, newPosition);

            dragger.position = newPosition;
            if (dragger.onDrag) {
              dragger.onDrag(dragger, newPosition, position);
            }
            _this.updateAttrForEditing();
            break;
          }
          case draggerCtl.PointType.MoveAbout: {
            // 改变左右x位置
            let differx = event.endPosition.x - event.startPosition.x;
            let differy = event.endPosition.y - event.startPosition.y;
            let oldPositionabout = dragger.position;
            if (oldPositionabout && oldPositionabout.getValue)
              oldPositionabout = oldPositionabout.getValue(
                _this.viewer.clock.currentTime
              );
            let _tangentPlane = new Cesium.EllipsoidTangentPlane(
              oldPositionabout
            );
            scratchBoundingSphere.center = oldPositionabout;
            scratchBoundingSphere.radius = 1;
            let _metersPerPixel =
              _this.viewer.scene.frameState.camera.getPixelSize(
                scratchBoundingSphere,
                _this.viewer.scene.frameState.context.drawingBufferWidth,
                _this.viewer.scene.frameState.context.drawingBufferHeight
              ) * 1;
            let heading = getCameraView(_this.viewer).heading;
            if (heading > 45 && heading <= 135) {
              Cesium.Cartesian3.multiplyByScalar(
                _tangentPlane.xAxis,
                -differy * _metersPerPixel,
                zOffset
              );
            } else if (heading > 135 && heading <= 225) {
              Cesium.Cartesian3.multiplyByScalar(
                _tangentPlane.xAxis,
                -differx * _metersPerPixel,
                zOffset
              );
            } else if (heading > 225 && heading <= 315) {
              Cesium.Cartesian3.multiplyByScalar(
                _tangentPlane.xAxis,
                differy * _metersPerPixel,
                zOffset
              );
            } else {
              Cesium.Cartesian3.multiplyByScalar(
                _tangentPlane.xAxis,
                differx * _metersPerPixel,
                zOffset
              );
            }
            let newPositionabout = Cesium.Cartesian3.clone(oldPositionabout);
            Cesium.Cartesian3.add(oldPositionabout, zOffset, newPositionabout);
            dragger.position = newPositionabout;
            if (dragger.onDrag) {
              dragger.onDrag(dragger, newPositionabout, oldPositionabout);
            }
            _this.updateAttrForEditing();
            break;
          }
          case draggerCtl.PointType.MoveAround: {
            // 改变前后y位置
            let _differx = event.endPosition.x - event.startPosition.x;
            let _differy = event.endPosition.y - event.startPosition.y;
            let oldPositionaround = dragger.position;
            if (oldPositionaround && oldPositionaround.getValue)
              oldPositionaround = oldPositionaround.getValue(
                _this.viewer.clock.currentTime
              );
            let _tangentPlaney = new Cesium.EllipsoidTangentPlane(
              oldPositionaround
            );
            scratchBoundingSphere.center = oldPositionaround;
            scratchBoundingSphere.radius = 1;
            let _metersPerPixely =
              _this.viewer.scene.frameState.camera.getPixelSize(
                scratchBoundingSphere,
                _this.viewer.scene.frameState.context.drawingBufferWidth,
                _this.viewer.scene.frameState.context.drawingBufferHeight
              ) * 1;
            let heading = getCameraView(_this.viewer).heading;
            if (heading > 45 && heading <= 135) {
              Cesium.Cartesian3.multiplyByScalar(
                _tangentPlaney.yAxis,
                -_differx * _metersPerPixely,
                zOffset
              );
            } else if (heading > 135 && heading <= 225) {
              Cesium.Cartesian3.multiplyByScalar(
                _tangentPlaney.yAxis,
                _differy * _metersPerPixely,
                zOffset
              );
            } else if (heading > 225 && heading <= 315) {
              Cesium.Cartesian3.multiplyByScalar(
                _tangentPlaney.yAxis,
                _differx * _metersPerPixely,
                zOffset
              );
            } else {
              Cesium.Cartesian3.multiplyByScalar(
                _tangentPlaney.yAxis,
                -_differy * _metersPerPixely,
                zOffset
              );
            }
            let newPositionaround = Cesium.Cartesian3.clone(oldPositionaround);
            Cesium.Cartesian3.add(
              oldPositionaround,
              zOffset,
              newPositionaround
            );
            dragger.position = newPositionaround;
            if (dragger.onDrag) {
              dragger.onDrag(dragger, newPositionaround, oldPositionaround);
            }
            _this.updateAttrForEditing();
            break;
          }
          case draggerCtl.PointType.MoveLevel: {
            _this.tooltip.showAt(event.endPosition, message.edit.end);

            let point = getCurrentMousePosition(
              _this.viewer.scene,
              event.endPosition,
              _this.entity
            );

            let ray = _this.viewer.camera.getPickRay(event.endPosition);
            point = _this.viewer.scene.globe.pick(
              ray,
              _this.viewer.scene,
              new Cesium.Cartesian3()
            );
            // point = _this.viewer.scene.pickPosition(event.endPosition, new Cesium.Cartesian3());

            if (point) {
              dragger.position = point;
              if (dragger.onDrag) {
                dragger.onDrag(dragger, point);
              }
              _this.updateAttrForEditing();
            }
            break;
          }

          default: {
            //默认修改位置

            _this.tooltip.showAt(event.endPosition, message.edit.end);
            let point = getCurrentMousePosition(
              _this.viewer.scene,
              event.endPosition,
              _this.entity
            );
            // let ray = _this.viewer.camera.getPickRay(event.endPosition);
            // point = _this.viewer.scene.globe.pick(ray, _this.viewer.scene, new Cesium.Cartesian3())

            if (point) {
              dragger.position = point;
              if (dragger.onDrag) {
                dragger.onDrag(dragger, point);
              }
              _this.updateAttrForEditing();
            }
            break;
          }
        }
      } else {
        if (_this.entity.attribute.attr.isClip) {
          return;
        }

        debouncer.active(() => {
          _this.tooltip.setVisible(false);
          /*  _this.viewer.scene.primitives._primitives.map(p => {//状态不对。 
                         let check = p instanceof Cesium.Cesium3DTileset
                         p.shoow = false
                     }) */
          let pickedObject = _this.viewer.scene.pick(event.endPosition);
          /*  _this.viewer.scene.primitives._primitives.map(p => {
                         let check = p instanceof Cesium.Cesium3DTileset
                         p.shoow = true
                     }) */

          if (Cesium.defined(pickedObject)) {
            let entity = pickedObject.id;
            if (
              entity &&
              Cesium.defaultValue(entity._isDragger, false) &&
              entity.draw_tooltip
            ) {
              // let draw_tooltip = entity.draw_tooltip
              //纪舒敏 坐标点提示右击删除
              if (entity.movepoint)
                if (
                  draggerCtl.PointType.Control === entity._pointType &&
                  _this._positions_draw &&
                  _this._positions_draw.length &&
                  _this._positions_draw.length > _this._minPointNum
                )
                  // draw_tooltip += message.del.def
                  //可删除时，提示右击删除
                  // draw_tooltip += message.del.def

                  _this.tooltip.showAt(event.endPosition /* draw_tooltip */);
            }
          }
        });
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    draggerHandler.setInputAction(function () {
      let dragger = draggerHandler.dragger;
      if (dragger) {
        _this.setCursor(false);
        dragger.show = true;

        let position = dragger.position;
        if (position && position.getValue)
          position = position.getValue(_this.viewer.clock.currentTime);

        if (dragger.onDragEnd) {
          dragger.onDragEnd(dragger, position);
        }
        /**1720yangw 优化：点拖拽时，currentFeature指向错误的情况。 */
        let targetEntity = _this.entity;
        if (_this.entity.attribute.type === 'point') {
          targetEntity = dragger;
        }
        /**1720 */
        _this.fire(EventType.EditMovePoint, {
          edittype: _this.entity.attribute.type,
          entity: targetEntity,
          position: position
        });

        draggerHandler.dragger = null;

        _this.viewer.scene.screenSpaceCameraController.enableRotate = true;
        _this.viewer.scene.screenSpaceCameraController.enableTilt = true;
        _this.viewer.scene.screenSpaceCameraController.enableTranslate = true;
        _this.viewer.scene.screenSpaceCameraController.enableInputs = true;
      }
      freeze = false;
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
    draggerHandler.setInputAction(function () {
      let dragger = draggerHandler.dragger;
      if (dragger) {
        _this.setCursor(false);
        dragger.show = true;
        let position = dragger.position;
        if (position && position.getValue)
          position = position.getValue(_this.viewer.clock.currentTime);
        if (dragger.onRightUp) {
          dragger.onRightUp(draggerHandler.dragger, position);
        }
        _this.entity.attribute.attr.onDragEndCallback &&
          _this.entity.attribute.attr.onDragEndCallback(_this.entity);
        let targetEntity = _this.entity;
        if (_this.entity.attribute.type === 'point') {
          targetEntity = dragger;
        }
        _this.fire(EventType.EditMovePoint, {
          edittype: _this.entity.attribute.type,
          entity: targetEntity,
          position: position
        });

        draggerHandler.dragger = null;

        _this.viewer.scene.screenSpaceCameraController.enableRotate = true;
        _this.viewer.scene.screenSpaceCameraController.enableTilt = true;
        _this.viewer.scene.screenSpaceCameraController.enableTranslate = true;
        _this.viewer.scene.screenSpaceCameraController.enableInputs = true;
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_UP);
    //右击删除一个点
    draggerHandler.setInputAction(function (event) {
      //右击删除上一个点
      let pickedObject = _this.viewer.scene.pick(event.position);
      if (Cesium.defined(pickedObject)) {
        let entity = pickedObject.id;
        if (
          entity &&
          Cesium.defaultValue(entity._isDragger, false) &&
          draggerCtl.PointType.Control === entity._pointType
        ) {
          let isDelOk = _this.deletePointForDragger(entity, event.position);

          if (isDelOk)
            _this.fire(EventType.EditRemovePoint, {
              edittype: _this.entity.attribute.type,
              entity: _this.entity
            });
        }
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    this.draggerHandler = draggerHandler;
  },

  /**
   * 销毁事件
   * @func EditBase.destroyEvent
   */
  destroyEvent: function destroyEvent() {
    this.viewer.scene.screenSpaceCameraController.enableRotate = true;
    this.viewer.scene.screenSpaceCameraController.enableTilt = true;
    this.viewer.scene.screenSpaceCameraController.enableTranslate = true;
    this.viewer.scene.screenSpaceCameraController.enableInputs = true;

    this.setCursor(false);

    if (this.draggerHandler) {
      if (this.draggerHandler.dragger) this.draggerHandler.dragger.show = true;

      this.draggerHandler.destroy();
      this.draggerHandler = null;
    }
  },

  /**
   * 绑定拖动把手
   * @func EditBase.bindDraggers
   */
  bindDraggers: function bindDraggers() {},

  /**
   * 更新拖动把手
   * @func EditBase.updateDraggers
   */
  updateDraggers: function updateDraggers() {
    if (!this._enabled) {
      return this;
    }

    this.destroyDraggers();
    this.bindDraggers();
  },

  /**
   * 销毁拖动把手
   * @func EditBase.destroyDraggers
   */
  destroyDraggers: function destroyDraggers() {
    for (let i = 0, len = this.draggers.length; i < len; i++) {
      this.dataSource.entities.remove(this.draggers[i]);
    }
    this.viewer.scene.primitives.remove(this.draggers_pri);
    this.draggers_pri = null;
    this.draggers = [];
  },

  /**
   * 删除点
   * @func EditBase.deletePointForDragger
   * @param dragger 把手
   * @param position {position} 位置
   */
  deletePointForDragger: function deletePointForDragger(dragger, position) {
    if (!this._positions_draw) return;
    if (this._positions_draw.length - 1 < this._minPointNum) {
      this.tooltip.showAt(position, message.del.min + this._minPointNum);
      return false;
    }

    let index = dragger.index;
    if (index >= 0 && index < this._positions_draw.length) {
      this._positions_draw.splice(index, 1);
      this.updateDraggers();
      this.updateAttrForEditing();
      return true;
    } else {
      return false;
    }
  },

  /**
   * 钩子：编辑时更新属性事件
   * @func EditBase.updateAttrForEditing
   */
  updateAttrForEditing: function updateAttrForEditing() {}
});
export { EditBase };
