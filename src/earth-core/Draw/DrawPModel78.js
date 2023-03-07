/**
 * @Author han
 * @Date 2020/11/10 16:06
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as ModelAttr from './EntityAttr/ModelAttr24';
import { DrawBase } from './DrawBase22';
import { getCurrentMousePosition } from '../Tool/Point2';
import { message } from '../Tool/ToolTip4';
import { EditPModel } from '../Edit/EditPModel52';

/**
 * 绘制模型P类
 * @extends DrawBase
 * @memberOf DrawBase
 */
class DrawPModel extends DrawBase {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'point';
    this.editClass = EditPModel;
    this.attrClass = ModelAttr;
  }

  /**
   * 根据attribute参数创建Entity
   * @param attribute
   * @returns {entity}
   */
  createFeature(attribute) {
    let _this = this;

    this._positions_draw = Cesium.Cartesian3.ZERO;

    let style = attribute.style;

    let modelPrimitive = this.primitives.add(
      Cesium.Model.fromGltf({
        url: style.modelUrl,
        modelMatrix: this.getModelMatrix(style),
        minimumPixelSize: Cesium.defaultValue(style.minimumPixelSize, 0.0),
        scale: Cesium.defaultValue(style.scale, 1.0)
      })
    );
    modelPrimitive.readyPromise.then(function (/* model */) {
      _this.style2Entity(style, _this.entity);
    });
    modelPrimitive.attribute = attribute;
    this.entity = modelPrimitive;

    return this.entity;
  }

  /**
   * 获取模型的矩阵matrix
   * @param cfg
   * @param position
   * @returns {Cesium.Transforms.headingPitchRollToFixedFrame}
   */
  getModelMatrix(cfg, position) {
    let hpRoll = new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(cfg.heading || 0),
      Cesium.Math.toRadians(cfg.pitch || 0),
      Cesium.Math.toRadians(cfg.roll || 0)
    );
    let fixedFrameTransform = Cesium.Transforms.eastNorthUpToFixedFrame;

    let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
      position || this._positions_draw,
      hpRoll,
      this.viewer.scene.globe.ellipsoid,
      fixedFrameTransform
    );
    // Cesium.Matrix4.multiplyByUniformScale(modelMatrix, Cesium.defaultValue(cfg.scale, 1), modelMatrix)
    return modelMatrix;
  }

  /**
   * 属性转entity
   * @param style
   * @param entity
   * @returns {entity}
   */
  style2Entity(style, entity) {
    entity.modelMatrix = this.getModelMatrix(style, entity.position);
    return ModelAttr.style2Entity(style, entity);
  }

  /**
   * 绑定鼠标事件
   */
  bindEvent() {
    let _this2 = this;

    this.getHandler().setInputAction(function (event) {
      let point = getCurrentMousePosition(
        _this2.viewer.scene,
        event.endPosition,
        _this2.entity
      );
      if (point) {
        _this2._positions_draw = point;
        _this2.entity.modelMatrix = _this2.getModelMatrix(
          _this2.entity.attribute.style
        );
      }
      _this2.tooltip.showAt(event.endPosition, message.draw.point.start);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.getHandler().setInputAction(function (event) {
      let point = getCurrentMousePosition(
        _this2.viewer.scene,
        event.position,
        _this2.entity
      );
      if (point) {
        _this2._positions_draw = point;
        _this2.disable();
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  /**
   * 图形绘制结束,更新属性
   */
  finish() {
    this.entity.modelMatrix = this.getModelMatrix(this.entity.attribute.style);

    this.entity.editing = this.getEditClass(this.entity); //绑定编辑对象
    this.entity.position = this.getDrawPosition();
  }
}

export { DrawPModel };
