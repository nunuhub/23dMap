/**
 * @Author han
 * @Date 2020/11/9 15:07
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as LabelAttr from './EntityAttr/LabelAttr9';
import { DrawPoint } from './DrawPoint23';

/**
 * 绘制标签类
 * @extends DrawBase.DrawPoint
 * @memberOf DrawBase.DrawPoint
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
class DrawLabel extends DrawPoint {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'label';
    this.attrClass = LabelAttr;
  }

  /**
   * 根据attribute参数创建Entity
   * @param attribute
   * @returns {entity}
   */
  createFeature(attribute) {
    if (this.mode === 'primitive') {
      let Primitives = this.primitives._primitives;
      let labels = Primitives.find((e) => {
        return e instanceof Cesium.LabelCollection;
      });
      labels = labels
        ? labels
        : this.primitives.add(new Cesium.LabelCollection());
      let primitive = labels.add(LabelAttr.style2Entity(attribute.style));
      primitive.attribute = attribute;
      primitive.label = LabelAttr.style2Entity(attribute.style); //模仿entity里的color、outline等样式存储。

      Object.keys(primitive.label).forEach((key) => {
        if (Object.hasOwnProperty.call(primitive.label, key)) {
          defineReactive(primitive.label, key, primitive.label[key], primitive);
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
        label: LabelAttr.style2Entity(attribute.style),
        attribute: attribute
      };
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
    return LabelAttr.style2Entity(style, entity.label);
  }
}

export { DrawLabel };
