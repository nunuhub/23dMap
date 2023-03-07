/*
     * @Author: liujh
     * @Date: 2022/8/4 9:38
     * @Description:
     */
import * as Cesium from 'cesium_shinegis_earth';
import * as Shaders from './CustomShaders';

let defaultColor = Cesium.Color.CYAN;

class CircleWaveMaterialProperty {
  constructor(options) {
    options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);
    this._definitionChanged = new Cesium.Event()
    this._color = undefined
    this._colorSubscription = undefined
    this._duration = undefined
    this._durationSubscription = undefined
    this.color = Cesium.defaultValue(
      options.materialColor,
      defaultColor
    )
    this.duration = Cesium.defaultValue(options.duration, 45)
    this.count = Math.max(Cesium.defaultValue(options.count, 2), 1)
    this.gradient = Cesium.defaultValue(options.gradient, 0.1)
    if (this.gradient < 0) {
      this.gradient = 0
    } else if (this.gradient > 1) {
      this.gradient = 1
    }

  }

  get definitionChanged() {
    return this._definitionChanged;
  }
  get isConstant() {
    return false;
  }

  getType(time) {
    return Cesium.Material.CircleWaveType;
  }
  getValue(time, result) {
    if (!result) {
      result = {}
    }
    result.color = Cesium.Property.getValueOrUndefined(this._color, time)
    result.duration = this._duration
    result.count = this.count
    result.gradient = this.gradient
    return result
  }
  equals(other) {
    return (
      this === other ||
      (other instanceof CircleWaveMaterialProperty &&
        Cesium.Property.equals(this._color, other._color))
    )
  }
}

//圆形 单个扩散效果 材质

Object.defineProperties(CircleWaveMaterialProperty.prototype, {
  /**
   * Gets or sets the  Cesium.Property specifying the {@link Cesium.Color} of the line.
   * @memberof PolylineGlowMaterialProperty.prototype
   * @type { Cesium.Property}
   */
  color: Cesium.createPropertyDescriptor('color'),
  duration: Cesium.createPropertyDescriptor('duration')
});

//静态方法，处理材质
Cesium.Material.CircleWaveType = 'CircleWave';
Cesium.Material._materialCache.addMaterial(
  Cesium.Material.CircleWaveType,
  {
    fabric: {
      type: Cesium.Material.CircleWaveType,
      uniforms: {
        //color: new Cesium.Color(1.0, 0.0, 0.0, 0.7),
        color: Cesium.Color.VIOLET.withAlpha(0.8),
        //color: Cesium.Color.TRANSPARENT,
        duration: 45,
        count: 2,
        gradient: 0.5
      },
      source: Shaders._getDynamicCircleShader({ get: true })
    },
    translucent: function (material) {
      return true
    }
  }
);
export { CircleWaveMaterialProperty };
