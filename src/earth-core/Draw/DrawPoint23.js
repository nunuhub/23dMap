/*
 * @Author: liujh
 * @Date: 2020/8/21 17:14
 * @Description:
 */
/* 23 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import * as EventType from './EventType7';
import * as pointAttr from './EntityAttr/PointAttr29';
import * as labelAttr from './EntityAttr/LabelAttr9';
import { DrawBase } from './DrawBase22';
import { getCurrentMousePosition } from '../Tool/Point2';
import { message } from '../Tool/ToolTip4';
import { EditPoint } from '../Edit/EditPoint37';

/**
 * 对feature里的属性按照entity的方式编辑时，同时使primitive的属性也进行修改。
 * 比如entity.color =x;自动修改primitive里的color;
 */
function defineReactive(data, key, val, primitive) {
  Object.defineProperty(data, key, {
    enumerable: true,
    configurable: true,
    get: function defineGet() {
      return val;
    },
    set: function defineSet(newVal) {
      if (!(key in primitive)) return;
      primitive[key] = newVal;
      val = newVal;
    }
  });
}
/**
 * 点绘制类
 * @extends DrawBase
 * @memberOf DrawBase
 */
class DrawPoint extends DrawBase {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'point';
    this.editClass = EditPoint;
    this.attrClass = pointAttr;
  }

  /**
   * 根据attribute参数创建Entity
   * @param attribute
   * @returns {entity}
   */
  createFeature(attribute) {
    if (this.mode === 'primitive') {
      let Primitives = this.primitives._primitives;
      let points = Primitives.find((e) => {
        return e instanceof Cesium.PointPrimitiveCollection;
      });
      points = points
        ? points
        : this.primitives.add(new Cesium.PointPrimitiveCollection());
      let primitive = points.add(pointAttr.style2Entity(attribute.style));
      primitive.attribute = attribute;
      primitive.point = pointAttr.style2Entity(attribute.style); //模仿entity里的color、outline等样式存储。
      primitive.point.outline = undefined;

      Object.keys(primitive.point).forEach((key) => {
        if (Object.hasOwnProperty.call(primitive.point, key)) {
          defineReactive(primitive.point, key, primitive.point[key], primitive);
        }
      });
      this.entity = primitive;
      return primitive;
    } else {
      this._positions_draw = null;

      let that = this;
      let addattr = {
        show: false,
        position: new Cesium.CallbackProperty(function () {
          return that.getDrawPosition();
        }, false),
        point: pointAttr.style2Entity(attribute.style),
        attribute: attribute
      };

      if (attribute.style && attribute.style.label) {
        //同时加文字
        addattr.label = labelAttr.style2Entity(attribute.style.label);
      }

      this.entity = this.dataSource.entities.add(addattr); //创建要素对象
      this.entity.mark311 = this.drawTool.id;
      return this.entity;
    }
  }

  /**
   * 属性转entity
   * @param style
   * @param entity
   * @returns {entity}
   */
  style2Entity(style, entity) {
    if (style && style.label) {
      //同时加文字
      labelAttr.style2Entity(style.label, entity.label);
    }
    return pointAttr.style2Entity(style, entity.point);
  }

  /**
   * 绑定鼠标事件
   */
  bindEvent() {
    let _this = this;

    this.getHandler().setInputAction(function (event) {
      let point = getCurrentMousePosition(
        _this.viewer.scene,
        event.endPosition,
        _this.entity
      );
      if (point) {
        if (_this.mode === 'primitive') {
          _this.entity.position = point;
        } else {
          _this._positions_draw = point;
        }
      }
      _this.tooltip.showAt(event.endPosition, message.draw.point.start);

      _this.fire(EventType.DrawMouseMove, {
        drawtype: _this.type,
        entity: _this.entity,
        position: point
      });
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.getHandler().setInputAction(function (event) {
      let point = getCurrentMousePosition(
        _this.viewer.scene,
        event.position,
        _this.entity
      );
      if (!point) return;
      if (_this.mode === 'primitive') {
        _this.entity.position = point;
        _this._positions_draw = point; //兼顾到primitive状态下label等的绘制过程正常。
        _this.disable();
      } else {
        _this._positions_draw = point;
        _this.disable();
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  /**
   * 图形绘制结束,更新属性
   */
  finish() {
    this.entity.show = true;

    this.entity.editing = this.getEditClass(this.entity); //绑定编辑对象
    this.entity.position = this.getDrawPosition();
  }
}

export { DrawPoint, defineReactive };
