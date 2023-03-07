/*
     * @Author: liujh
     * @Date: 2022/8/4 9:38
     * @Description:
     */
import * as Cesium from 'cesium_shinegis_earth';
import * as Shaders from './CustomShaders';

let defaultColor = Cesium.Color.TRANSPARENT;
let defaultImg = 'Assets3D/Textures/meteor_01.png';
let defaultMaterialType = 'dynamicGradualWall'

class WallLinkCustomMaterialProperty {
  constructor(options) {
    options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = Cesium.defaultValue(
      options.materialColor,
      defaultColor
    )
    this.imgUrl = Cesium.defaultValue(options.image, defaultImg); //背景图片颜色
    this.duration = options.duration || 3000;
    this.freely = options.freely || 'vertical';
    this.count = options.count || 3;
    this._time =  new Date().getTime();
    this.MaterialType = Cesium.defaultValue(
      options.MaterialType,
      defaultMaterialType
    )
    Cesium.Material._materialCache.addMaterial(Cesium.Material.WallLinkCustomType,
      {
        fabric: {
          type: Cesium.Material.WallLinkCustomType,
          uniforms: {
            color: new Cesium.Color(255, 255, 0.0, 0.5),
            image: defaultImg,
            time: 0
          },
          source: Shaders._getDirectionWallShader({
            get: true,
            count: this.count,
            freely: this.freely,
            direction: '+'
          })
        },
        translucent: function (material) {
          return true;
        }
      }
    )
  }

  get definitionChanged() {
    return this._definitionChanged;
  }
  get isvarant() {
    return false;
  }
  getType(time) {
   // Cesium.Material.WallLinkCustomType = this.MaterialType
    return Cesium.Material.WallLinkCustomType;
  }
  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(
      this._color,
      time,
      Cesium.Color.WHITE,
      result.color
    );
    result.image = this.imgUrl;
    result.time =
      ((new Date().getTime() - this._time) % this.duration) / this.duration;
    return result;
  }
  equals(other) {
    return this === other || //
      (other instanceof WallLinkCustomMaterialProperty &&
        Cesium.Property.equals(this._color, other._color));
  }

}

Object.defineProperties(WallLinkCustomMaterialProperty.prototype, {
  /**
   * Gets or sets the  Cesium.Property specifying the {@link Cesium.Color} of the line.
   * @memberof WallLinkCustomMaterialProperty.prototype
   * @type { Cesium.Property}
   */
  color: Cesium.createPropertyDescriptor('color')
});

Cesium.Material.WallLinkCustomType = 'dynamicGradualWall';
//动态墙
Cesium.Material._materialCache.addMaterial(Cesium.Material.WallLinkCustomType,
  {
    fabric: {
      type: Cesium.Material.WallLinkCustomType,
      uniforms: {
        color: new Cesium.Color(255, 255, 0.0, 0.5),
        image: defaultImg,
         time: 0
      },
      source: Shaders._getDirectionWallShader({
        get: true,
        count: 2,
        freely: 'vertical',
        direction: '+'
      })
    },
    translucent: function (material) {
      return true;
    }
  }
)
export { WallLinkCustomMaterialProperty };
