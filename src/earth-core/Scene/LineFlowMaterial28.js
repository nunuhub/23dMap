import * as Cesium from 'cesium_shinegis_earth';
import { LineFlow63 } from './LineFlow63';
import { LineFlow64 } from './LineFlow64';

let defaultColor = new Cesium.Color(0, 0, 0, 0);
let defaultBgColor = new Cesium.Color(1, 1, 1);

//静态方法，处理材质
let cacheIdx = 0;
let nameEx = 'AnimationLine';

function getImageMaterial(imgurl, bgUrl, repeat, axisY, bgColor) {
  cacheIdx++;
  var typeName = nameEx + cacheIdx + 'Type';
  var imageName = nameEx + cacheIdx + 'Image';

  Cesium.Material[typeName] = typeName;
  Cesium.Material[imageName] = imgurl;

  if (bgUrl) {
    //存在2张url的，用叠加融合的效果
    Cesium.Material._materialCache.addMaterial(Cesium.Material[typeName], {
      fabric: {
        type: Cesium.Material.PolylineArrowLinkType,
        uniforms: {
          color: new Cesium.Color(1, 0, 0, 1.0),
          image: Cesium.Material[imageName],
          time: 0,
          repeat: repeat || new Cesium.Cartesian2(1.0, 1.0),
          axisY: axisY,
          image2: bgUrl,
          bgColor: bgColor
        },
        source: LineFlow64
      },
      translucent: function translucent() {
        return true;
      }
    });
  } else {
    Cesium.Material._materialCache.addMaterial(Cesium.Material[typeName], {
      fabric: {
        type: typeName,
        uniforms: {
          color: new Cesium.Color(1, 0, 0, 1.0),
          image: Cesium.Material[imageName],
          time: 0,
          repeat: repeat || new Cesium.Cartesian2(1.0, 1.0),
          axisY: axisY
        },
        source: LineFlow63
      },
      translucent: function translucent() {
        return true;
      }
    });
  }

  return {
    type: Cesium.Material[typeName],
    image: Cesium.Material[imageName]
  };
}

//线状 流动效果 材质
class LineFlowMaterial {
  constructor(options) {
    options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);

    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;

    this.color = Cesium.defaultValue(options.color, defaultColor); //颜色
    this.url = Cesium.defaultValue(options.url, undefined); //背景图片颜色
    if (!this.url) return;

    this.axisY = Boolean(options.axisY);
    this.bgUrl = Cesium.defaultValue(options.bgUrl, undefined); //背景图片颜色
    this.bgColor = Cesium.defaultValue(options.bgColor, defaultBgColor); //背景图片颜色
    this._duration = options.duration || 1000; //时长

    var _material = getImageMaterial(
      this.url,
      this.bgUrl,
      options.repeat,
      Boolean(options.axisY),
      this.bgColor
    );

    this._materialType = _material.type; //材质类型
    this._materialImage = _material.image; //材质图片
    this._time = undefined;
  }

  get definitionChanged() {
    return this._definitionChanged;
  }
  get isConstant() {
    return false;
  }

  getType() {
    return this._materialType;
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
    result.image = this._materialImage;
    if (this._time === undefined) {
      this._time = new Date().getTime();
    }
    result.time = (new Date().getTime() - this._time) / this._duration;
    return result;
  }
  equals(other) {
    return (
      this === other || //
      (other instanceof LineFlowMaterial &&
        Cesium.Property.equals(this._color, other._color))
    );
  }
}
Object.defineProperties(LineFlowMaterial.prototype, {
  /**
   * Gets or sets the Cesium.Property specifying the {@link Cesium.Color} of the line.
   * @memberof PolylineGlowMaterialProperty.prototype
   * @type {Cesium.Property}
   */
  color: Cesium.createPropertyDescriptor('color')
});
export { LineFlowMaterial };
