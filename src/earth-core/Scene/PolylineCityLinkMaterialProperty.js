/*
     * @Author: liujh
     * @Date: 2022/8/4 9:38
     * @Description:
     */
import * as Cesium from 'cesium_shinegis_earth';
import * as Shaders from './CustomShaders';

let defaultColor = Cesium.Color.WHITE;
let defaultImg = 'Assets3D/Textures/meteor_01.png';

class PolylineCityLinkMaterialProperty {
  constructor(options) {
    options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = Cesium.defaultValue(
      options.materialColor,
      defaultColor
    )
    this.imgUrl = Cesium.defaultValue(options.materialImgUrl, defaultImg); //背景图片颜色
    this.duration = options.duration || 1000;
    this._time = undefined;

  }

  get definitionChanged() {
    return this._definitionChanged;
  }
  get isvarant() {
    return false;
  }
  getType(time) {
    return Cesium.Material.PolylineCityLinkType;
  }
  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, defaultColor, result.color);
    result.image = this.imgUrl;
    if (this._time === undefined) {
      this._time = time.secondsOfDay;
    }
    result.time = (time.secondsOfDay - this._time) * 1000 / this.duration;
    return result;
  }
  equals(other) {
    return this === other || //
      (other instanceof PolylineCityLinkMaterialProperty &&
        Cesium.Property.equals(this._color, other._color));
  }
}
Object.defineProperties(PolylineCityLinkMaterialProperty.prototype, {
  /**
   * Gets or sets the  Cesium.Property specifying the {@link Cesium.Color} of the line.
   * @memberof PolylineGlowMaterialProperty.prototype
   * @type { Cesium.Property}
   */
  color: Cesium.createPropertyDescriptor('color')
});
Cesium.Material.PolylineCityLinkType = 'PolylineCityLink';
Cesium.Material.PolylineCityLinkImage = 'Assets3D/Textures/meteor_01.png';

//静态方法，处理材质
Cesium.Material._materialCache.addMaterial(
  Cesium.Material.PolylineCityLinkType,
  {
    fabric: {
      type: Cesium.Material.PolylineCityLinkType,
      uniforms: {
        //color: new Color(1, 0, 0, 1.0),
        color: Cesium.Color.DARKBLUE,
        image: Cesium.Material.PolylineCityLinkImage,
        time: 0,
      },
      source: Shaders._getDynamicLightLineShader({ get: true })
    },
    translucent: function (material) {
      return true
    }
  }
);
export { PolylineCityLinkMaterialProperty };
