/**
 * @Author han
 * @Date 2020/11/9 15:55
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as CloudAttr from './EntityAttr/CloudAttr';
import { DrawPoint } from './DrawPoint23';

/**
 * 绘制广告牌类
 * @extends DrawBase.DrawPoint
 * @memberOf DrawBase.DrawPoint
 */
class DrawCloud extends DrawPoint {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'cloud';
    this.attrClass = CloudAttr;
  }

  /**
   * 根据attribute参数创建Entity
   * @param attribute
   * @returns {entity}
   */

  createFeature(attribute) {
    let Primitives = this.primitives._primitives;
    let clouds = Primitives.find((e) => {
      return e instanceof Cesium.CloudCollection;
    });
    clouds = clouds || this.primitives.add(new Cesium.CloudCollection());
    let primitive = clouds.add(CloudAttr.style2Entity(attribute.style));
    primitive.attribute = attribute;
    primitive.cloud = CloudAttr.style2Entity(attribute.style); //模仿entity里的color、outline等样式存储。

    this.entity = primitive;
    return primitive;
  }

  /**
   * 属性转entity
   * @param style
   * @param entity
   * @returns {entity}
   */
  style2Entity(style, primitive) {
    return CloudAttr.style2Entity(style, primitive);
  }
}
export { DrawCloud };
