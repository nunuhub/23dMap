/**
 * @Author han
 * @Date 2020/11/9 15:55
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as BillBoardAttr from './EntityAttr/BillboardAttr19';
import * as LabelAttr from './EntityAttr/LabelAttr9';
import { DrawPoint } from './DrawPoint23';

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
 * 绘制广告牌类
 * @extends DrawBase.DrawPoint
 * @memberOf DrawBase.DrawPoint
 */
class DrawBillboard extends DrawPoint {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'billboard';
    this.attrClass = BillBoardAttr;
  }

  /**
   * 根据attribute参数创建Entity
   * @param attribute
   * @returns {entity}
   */
  createFeature(attribute) {
    if (this.mode === 'primitive') {
      let Primitives = this.primitives._primitives;
      let billboards = Primitives.find((e) => {
        return e instanceof Cesium.BillboardCollection;
      });
      billboards =
        billboards || this.primitives.add(new Cesium.BillboardCollection());
      let primitive = billboards.add(
        BillBoardAttr.style2Entity(attribute.style)
      );
      primitive.attribute = attribute;
      primitive.billboard = BillBoardAttr.style2Entity(attribute.style); //模仿entity里的color、outline等样式存储。

      Object.keys(primitive.billboard).forEach((key) => {
        if (Object.hasOwnProperty.call(primitive.billboard, key)) {
          defineReactive(
            primitive.billboard,
            key,
            primitive.billboard[key],
            primitive
          );
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
        billboard: BillBoardAttr.style2Entity(attribute.style),
        attribute: attribute
      };

      if (attribute.style && attribute.style.label) {
        //同时加文字
        addattr.label = LabelAttr.style2Entity(attribute.style.label);
      }

      this.entity = this.dataSource.entities.add(addattr); //创建要素对象
      this.updateAttrForDrawing();
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
    this.updateImg(style, entity);
    if (style && style.label) {
      //同时加文字
      LabelAttr.style2Entity(style.label, entity.label);
    }
    return BillBoardAttr.style2Entity(style, entity.billboard);
  }

  /**
   * 编辑样式更新
   */
  updateAttrForDrawing() {
    this.updateImg(this.entity.attribute.style, this.entity);
  }

  /**
   * 更新图标，子类用
   * @param style
   * @param entity
   */
  updateImg() {}
}
export { DrawBillboard };
