import { defaultStyle } from '../earth-core/Draw/EntityAttr/AttrAll53.js';
import { Draw } from '../earth-core/Draw/DrawAll21';
import { Color } from 'cesium_shinegis_earth';
import DRAWCONFIG from '../earth-core/Draw/DrawConfig';
import * as Cesium from 'cesium_shinegis_earth';
import { Utils } from '../earth-core/Widget/SpatialAnalysis/index';
let fccs = Color.fromCssColorString;

function _handleStyle(style, type) {
  // 总的totalStyle对象
  const totalStyle = {
    ...defaultStyle,
    ...style,
    icon: {
      ...defaultStyle.icon,
      ...style?.icon
    },
    text: { ...defaultStyle.text, ...style?.text },
    circle: { ...defaultStyle.circle, ...style?.circle },
    model: { ...defaultStyle.model, ...style?.model }
  };

  // 三维内部使用的style对象
  const threeStyle = { ...style };

  // 将totalStyle转换为三维内部使用的style对象
  threeStyle.color = totalStyle.fillColor;
  threeStyle.outlineColor = totalStyle.strokeColor;
  threeStyle.outlineWidth = totalStyle.strokeWidth;
  threeStyle.opacity = fccs(totalStyle.fillColor)?.alpha ?? 1;
  threeStyle.outlineOpacity = fccs(totalStyle.strokeColor)?.alpha ?? 1;
  switch (type) {
    default:
      break;
    case 'point': {
      threeStyle.color = totalStyle.circle.fillColor;
      threeStyle.pixelSize = totalStyle.circle.radius;
      threeStyle.outlineColor = totalStyle.circle.strokeColor;
      threeStyle.outlineWidth = totalStyle.circle.strokeWidth;
      break;
    }
    case 'text': {
      threeStyle.color = totalStyle.text?.fillColor;
      threeStyle.border_color = totalStyle.text?.strokeColor;
      threeStyle.border_width = totalStyle.text?.strokeWidth;
      threeStyle.text = totalStyle.text.text;
      threeStyle.font = totalStyle.text?.font;
      break;
    }
    case 'icon': {
      threeStyle.src = totalStyle.icon.src;
      threeStyle.pixelOffset = totalStyle.icon?.anchor;
      break;
    }
    case 'model': {
      threeStyle.modelUrl = totalStyle.model.url;
      for (const key in totalStyle.model) {
        if (Object.hasOwnProperty.call(totalStyle.model, key)) {
          threeStyle[key] = totalStyle.model[key];
        }
      }
    }
  }
  return threeStyle;
}
export default class DrawTool {
  constructor(viewer, options) {
    this._drawTool = new Draw(viewer, options);
    viewer.shine.setDraw(this._drawTool);
  }
  createDrawLayer({ id, name, layerTag } = {}) {
    let collection = this._drawTool.getOrCreateCollection(id);
    //避免name和tag为空时对已有layer的name和tag的覆盖。
    collection.name = name || collection.name;
    collection.layerTag = layerTag || collection.layerTag;
    return collection;
  }
  activate(drawType) {
    let drawCfg = DRAWCONFIG[drawType];
    if (!drawCfg) return;
    drawCfg = JSON.parse(JSON.stringify(drawCfg));
    let feature = this._drawTool.startDraw({
      type: drawCfg.drawtype,
      style: drawCfg.style,
      edittype: drawCfg.edittype,
      attr: drawCfg.attr
    });
    return feature;
  }
  deactivate() {
    this._drawTool.stopDraw();
  }
  loadGeoJson(GeoJSON, { isClear, isFly, isFlash, layerId, style, type } = {}) {
    try {
      if (typeof GeoJSON === 'string' && GeoJSON.constructor === String)
        GeoJSON = JSON.parse(GeoJSON);
    } catch (e) {
      console.error(e.name + ': ' + e.message + ' \n请确认json文件格式正确!!!');
      return;
    }
    let threeStyle = _handleStyle(style, type);
    //仍旧支持featureCollection和feature
    if (Array.isArray(GeoJSON.features)) {
      GeoJSON.features.forEach((feature) => {
        feature.properties = {
          type,
          style: threeStyle,
          attr: feature.properties
        };
      });
    } else {
      GeoJSON.properties = {
        type,
        style: threeStyle,
        attr: GeoJSON.properties
      };
    }

    return this._drawTool.loadJson(GeoJSON, {
      isClear,
      isFly,
      isFlash,
      layerId,
      style
    });
  }
  removeAll() {
    this._drawTool.deleteAll();
  }
  removeFeatures(features) {
    if (Array.isArray(features)) {
      features.forEach((f) => {
        this.removeFeature(f);
      });
    }
  }
  removeFeature(feature) {
    this._drawTool.deleteEntity(feature);
  }
  setFeatureStyle(feature, style) {
    style = _handleStyle(style, feature.attribute.type);
    style = { ...feature.attribute.style, ...style };
    this._drawTool.updateAttribute({ style }, feature);
    return feature;
  }
  flyTo(feature) {
    if (Array.isArray(feature)) this.flyTo(feature[0]);
    else if (feature instanceof Cesium.CumulusCloud) {
      let p = Utils.upPosition(this._drawTool.viewer, feature.position, 200);
      this._drawTool.viewer.scene.camera.flyTo({
        destination: p,
        orientation: {
          heading: 0,
          pitch: Cesium.Math.toRadians(-90),
          roll: 0.0
        }
      });
    } else this._drawTool.viewer.flyTo(feature);
  }
}
