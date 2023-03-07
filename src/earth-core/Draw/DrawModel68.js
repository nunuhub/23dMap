/**
 * @Author han
 * @Date 2020/11/10 9:23
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as LabelAttr from './EntityAttr/LabelAttr9';
import * as ModelAttr from './EntityAttr/ModelAttr24';
import { DrawPoint } from './DrawPoint23';
import {
  transformCartesianArrayToWGS84Array,
  transformCartesianToWGS84,
  transformWGS84ArrayToCartesianArray,
  transformWGS84ToCartesian
} from '../Scene/Base';

/**
 * 绘制模型类
 * @extends DrawBase.DrawPoint
 * @memberOf DrawBase.DrawPoint
 */
class DrawModel extends DrawPoint {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'model';
    this.attrClass = ModelAttr;
  }

  /**
   * 根据attribute参数创建Entity
   * @param attribute
   * @returns {entity}
   */
  createFeature(attribute) {
    this._positions_draw = null;

    let that = this;
    let addattr = {
      position: new Cesium.CallbackProperty(function () {
        return that.getDrawPosition();
      }, false),
      model: ModelAttr.style2Entity(attribute.style),
      attribute: attribute
    };

    if (attribute.style && attribute.style.label) {
      //同时加文字
      addattr.label = LabelAttr.style2Entity(attribute.style.label);
    }

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
    this.updateOrientation(style, entity);
    if (style && style.label) {
      //同时加文字
      LabelAttr.style2Entity(style.label, entity.label);
    }
    return ModelAttr.style2Entity(style, entity.model);
  }

  /**
   * 编辑样式更新
   */
  updateAttrForDrawing() {
    this.updateOrientation(this.entity.attribute.style, this.entity);
  }

  /**
   * 角度更新
   * @param style
   * @param entity
   */
  updateOrientation(style, entity) {
    let position = entity.position.getValue(this.viewer.clock.currentTime);
    if (position == null) return;

    let heading = Cesium.Math.toRadians(Number(style.heading || 0.0));
    let pitch = Cesium.Math.toRadians(Number(style.pitch || 0.0));
    let roll = Cesium.Math.toRadians(Number(style.roll || 0.0));

    let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    entity.orientation = Cesium.Transforms.headingPitchRollQuaternion(
      position,
      hpr
    );
  }

  //图形旋转
  setGraphicsRotate(style, model) {
    if (style && model) {
      let entity = model,
        rotateAmount = style.rotateAmount;
      //_position =entity.position;

      let rotatePosition = transformCartesianToWGS84(
        entity.position.getValue(this.viewer.clock.currentTime)
      );

      (rotatePosition.heading = 0),
        (rotatePosition.pitch = 0),
        (rotatePosition.roll = 0);
      entity.position = new Cesium.CallbackProperty(function () {
        return transformWGS84ToCartesian(rotatePosition);
      }, false);

      entity.orientation = new Cesium.CallbackProperty(function () {
        if (rotateAmount > 0) {
          rotatePosition.heading += rotateAmount;
          if (rotatePosition.heading === 360) {
            rotatePosition.heading = 0;
          }
        }
        return Cesium.Transforms.headingPitchRollQuaternion(
          transformWGS84ToCartesian(rotatePosition),
          new Cesium.HeadingPitchRoll(
            Cesium.Math.toRadians(rotatePosition.heading),
            Cesium.Math.toRadians(rotatePosition.pitch),
            Cesium.Math.toRadians(rotatePosition.roll)
          )
        );
      }, false);
    }
  }
  // 图形浮动
  setGraphicsFloat(style, model) {
    if (style && model) {
      let entity = model,
        minHeiht = style.minHeiht || 5,
        maxHeiht = style.maxHeiht || 100,
        speed = style.speed || 0.06,
        bg_minHeiht = minHeiht,
        flag = false;
      let floatPosition = entity.position.getValue(
        this.viewer.clock.currentTime
      );
      if (floatPosition.length) {
        entity.positions = new Cesium.CallbackProperty(function () {
          let positions = transformCartesianArrayToWGS84Array(floatPosition);
          for (let i in positions) {
            let position = positions[i];
            if (minHeiht >= maxHeiht || minHeiht <= bg_minHeiht) {
              flag = !flag;
            }
            flag ? (minHeiht += speed) : (minHeiht -= speed);
            position.alt = minHeiht;
          }
          return transformWGS84ArrayToCartesianArray(positions);
        }, false);
      } else {
        entity.position = new Cesium.CallbackProperty(function () {
          let position = transformCartesianToWGS84(floatPosition);
          if (minHeiht >= maxHeiht || minHeiht <= bg_minHeiht) {
            flag = !flag;
          }
          flag ? (minHeiht += speed) : (minHeiht -= speed);
          position.alt = minHeiht;

          return transformWGS84ToCartesian(position);
        }, false);
      }
    }
  }
}

export { DrawModel };
