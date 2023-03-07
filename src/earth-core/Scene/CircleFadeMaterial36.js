import * as Cesium from 'cesium_shinegis_earth';
import { CircleFade65 } from './CircleFade65';

let defaultColor = new Cesium.Color(0, 0, 0, 0);

class CircleFadeMaterial {
  constructor(options) {
    options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;

    this.color = Cesium.defaultValue(options.color, defaultColor); //颜色
    this._duration = options.duration || 1000; //时长

    this._time = undefined;
  }

  get definitionChanged() {
    return this._definitionChanged;
  }
  get isConstant() {
    return false;
  }

  getType(time) {
    return Cesium.Material.CircleFadeMaterialType;
  }
  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(
      this._color,
      time,
      defaultColor,
      result.color
    );

    if (this._time === undefined) {
      this._time = new Date().getTime();
    }
    result.time = (new Date().getTime() - this._time) / this._duration;
    return result;
  }
  equals(other) {
    return (
      this === other || //
      (other instanceof CircleFadeMaterial &&
        Cesium.Property.equals(this._color, other._color))
    );
  }
}

//圆形 单个扩散效果 材质

Object.defineProperties(CircleFadeMaterial.prototype, {
  /**
   * Gets or sets the  Cesium.Property specifying the {@link Cesium.Color} of the line.
   * @memberof PolylineGlowMaterialProperty.prototype
   * @type { Cesium.Property}
   */
  color: Cesium.createPropertyDescriptor('color')
});

//静态方法，处理材质
Cesium.Material.CircleFadeMaterialType = 'CircleFadeMaterial';
Cesium.Material._materialCache.addMaterial(
  Cesium.Material.CircleFadeMaterialType,
  {
    fabric: {
      type: Cesium.Material.CircleFadeMaterialType,
      uniforms: {
        color: new Cesium.Color(1, 0, 0, 1.0),
        time: 1
      },
      source: CircleFade65
    },
    translucent: function translucent() {
      return true;
    }
  }
);
export { CircleFadeMaterial };
