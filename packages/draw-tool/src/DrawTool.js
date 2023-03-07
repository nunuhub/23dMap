import Draw from 'shinegis-client-23d/src/map-core/Editor/src/control/draw';
import EditorControl from 'shinegis-client-23d/src/map-core/Editor/src/editor';
import CAD from 'shinegis-client-23d/src/map-core/Editor/src/control/cad';
import Clear from 'shinegis-client-23d/src/map-core/Editor/src/control/clear';
import Rotate from 'shinegis-client-23d/src/map-core/Editor/src/control/rotate';
import Modify from 'shinegis-client-23d/src/map-core/Editor/src/control/modify';
import Buffer from 'shinegis-client-23d/src/map-core/Editor/src/control/buffer';
import Union from 'shinegis-client-23d/src/map-core/Editor/src/control/union';
import Intersection from 'shinegis-client-23d/src/map-core/Editor/src/control/intersection';
import Difference from 'shinegis-client-23d/src/map-core/Editor/src/control/difference';
import LocalStorage from 'shinegis-client-23d/src/map-core/Editor/src/service/local-storage';
import * as DrawTypes from 'shinegis-client-23d/src/map-core/Editor/src/helper/drawTypes';
import Observable from 'ol/Observable';
import Event from 'ol/events/Event.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { Vector as VectorSource } from 'ol/source.js';
import { v4 as uuidv4 } from 'uuid';
import GeoJSON from 'ol/format/GeoJSON';
import { extend } from 'ol/extent';
import { getStyleFormGeneralStyle } from 'shinegis-client-23d/src/utils/olUtil';

const DrawToolEventType = {
  /**
   * 功能打开关闭时触发
   */
  CHANGEACTIVE: 'change:active',
  /**
   * 绘制完成后触发
   */
  DRAWEND: 'drawend'
};

export class DrawToolActiveEvent extends Event {
  constructor(type, tool, active) {
    super(type);
    this.tool = tool;
    this.active = active;
  }
}

export class DrawToolEvent extends Event {
  constructor(type, feature) {
    super(type);
    this.feature = feature;
  }
}

class DrawTool extends Observable {
  constructor(map, options) {
    super();
    this.name = 'DrawTool';
    this.active = false;
    this.map = map;
    this.options = options;
    this.editorControl = new EditorControl(map, options);
  }
  init() {
    if (!this.map.getLayerById('drawLayer')) {
      console.error('未发现绘制图层');
      return;
    }
    let drawSource = this.map.getLayerById('drawLayer').getSource();
    this.drawSource = drawSource;

    let controls = [];
    if (this.options[DrawTypes.CAD]) {
      this.cad = new CAD({
        source: drawSource,
        width: this.options.contentWidth,
        height: this.options.contentHeight,
        background: this.options.btbackground,
        color: this.options.labelColor
        // label:"捕捉"
      });
      this.cad.on('change:active', (e) => {
        this.dispatchEvent(
          new DrawToolActiveEvent(
            DrawToolEventType.CHANGEACTIVE,
            'cad',
            e.detail.control.active
          )
        );
      });
      controls.push(this.cad);
    }
    if (this.options[DrawTypes.DRAWPOINT]) {
      this.drawPoint = new Draw({
        source: drawSource,
        // type: 'Polygon',
        map: this.map,
        width: this.options.contentWidth,
        height: this.options.contentHeight,
        background: this.options.btbackground,
        color: this.options.labelColor
        // label:"绘制"
      });
      this.drawPoint.on('change:active', (e) => {
        this.dispatchEvent(
          new DrawToolActiveEvent(
            DrawToolEventType.CHANGEACTIVE,
            'drawPoint',
            e.detail.control.active
          )
        );
      });
      this.drawPoint.drawInteraction.on('drawend', (e) => {
        this.dispatchEvent(
          new DrawToolEvent(DrawToolEventType.DRAWEND, e.feature)
        );
      });
      controls.push(this.drawPoint);
    }
    if (this.options[DrawTypes.DRAWLINE]) {
      this.drawLine = new Draw({
        type: 'LineString',
        source: drawSource,
        map: this.map,
        height: this.options.contentHeight,
        width: this.options.contentWidth,
        background: this.options.btbackground,
        color: this.options.labelColor
        // label:"绘制"
      });
      this.drawLine.on('change:active', (e) => {
        this.dispatchEvent(
          new DrawToolActiveEvent(
            DrawToolEventType.CHANGEACTIVE,
            'drawLine',
            e.detail.control.active
          )
        );
      });
      this.drawLine.drawInteraction.on('drawend', (e) => {
        this.dispatchEvent(
          new DrawToolEvent(DrawToolEventType.DRAWEND, e.feature)
        );
      });
      controls.push(this.drawLine);
    }
    if (this.options[DrawTypes.DRAWPOLYGON]) {
      this.drawPoly = new Draw({
        type: 'Polygon',
        source: drawSource,
        map: this.map,
        height: this.options.contentHeight,
        width: this.options.contentWidth,
        background: this.options.btbackground,
        color: this.options.labelColor,
        activeImg: this.options.drawPolygonActvieImg,
        deactiveImg: this.options.drawPolygonImg,
        boxshadow: false
        // label:"绘制"
      });
      this.drawPoly.on('change:active', (e) => {
        this.dispatchEvent(
          new DrawToolActiveEvent(
            DrawToolEventType.CHANGEACTIVE,
            'drawPolygon',
            e.detail.control.active
          )
        );
      });
      this.drawPoly.drawInteraction.on('drawend', (e) => {
        this.dispatchEvent(
          new DrawToolEvent(DrawToolEventType.DRAWEND, e.feature)
        );
      });
      controls.push(this.drawPoly);
    }
    if (this.options.clear) {
      this.clear = new Clear({
        source: drawSource,
        map: this.map,
        width: this.options.contentWidth,
        height: this.options.contentHeight,
        background: this.options.btbackground,
        color: this.options.labelColor
        // label:"清除"
      });
      controls.push(this.clear);
    }
    if (this.options[DrawTypes.MODIFY]) {
      this.modify = new Modify({
        source: drawSource,
        width: this.options.contentWidth,
        height: this.options.contentHeight,
        background: this.options.btbackground,
        color: this.options.labelColor
        // label:"编辑"
      });
      this.modify.on('change:active', (e) => {
        this.dispatchEvent(
          new DrawToolActiveEvent(
            DrawToolEventType.CHANGEACTIVE,
            'modify',
            e.detail.control.active
          )
        );
      });
      controls.push(this.modify);
    }
    if (this.options[DrawTypes.ROTATE]) {
      this.rotate = new Rotate({
        source: drawSource,
        height: this.options.contentHeight,
        width: this.options.contentWidth,
        background: this.options.btbackground,
        color: this.options.labelColor
        // label:"旋转"
      });
      this.rotate.on('change:active', (e) => {
        this.dispatchEvent(
          new DrawToolActiveEvent(
            DrawToolEventType.CHANGEACTIVE,
            'rotate',
            e.detail.control.active
          )
        );
      });
      controls.push(this.rotate);
    }
    if (this.options[DrawTypes.BUFFER]) {
      this.buffer = new Buffer({
        source: drawSource,
        width: this.options.contentWidth,
        height: this.options.contentHeight,
        background: this.options.btbackground,
        color: this.options.labelColor
        // label:"缓冲"
      });
      this.buffer.on('change:active', (e) => {
        this.dispatchEvent(
          new DrawToolActiveEvent(
            DrawToolEventType.CHANGEACTIVE,
            'buffer',
            e.detail.control.active
          )
        );
      });
      controls.push(this.buffer);
    }
    if (this.options[[DrawTypes.UNION]]) {
      this.union = new Union({
        source: drawSource,
        width: this.options.contentWidth,
        height: this.options.contentHeight,
        background: this.options.btbackground,
        color: this.options.labelColor
        // label:"合并"
      });
      this.union.on('change:active', (e) => {
        this.dispatchEvent(
          new DrawToolActiveEvent(
            DrawToolEventType.CHANGEACTIVE,
            'union',
            e.detail.control.active
          )
        );
      });
      controls.push(this.union);
    }
    if (this.options[DrawTypes.INTERSECTION]) {
      this.intersection = new Intersection({
        source: drawSource,
        width: this.options.contentWidth,
        height: this.options.contentHeight,
        background: this.options.btbackground,
        color: this.options.labelColor
        // label:"叠加"
      });
      this.intersection.on('change:active', (e) => {
        this.dispatchEvent(
          new DrawToolActiveEvent(
            DrawToolEventType.CHANGEACTIVE,
            'intersection',
            e.detail.control.active
          )
        );
      });
      controls.push(this.intersection);
    }
    if (this.options[DrawTypes.DIFFERENCE]) {
      this.difference = new Difference({
        source: drawSource,
        width: this.options.contentWidth,
        height: this.options.contentHeight,
        background: this.options.btbackground,
        color: this.options.labelColor
        // label:"差集"
      });
      this.difference.on('change:active', (e) => {
        this.dispatchEvent(
          new DrawToolActiveEvent(
            DrawToolEventType.CHANGEACTIVE,
            'difference',
            e.detail.control.active
          )
        );
      });
      controls.push(this.difference);
    }
    this.editorControl.addControls(controls);

    if (this.options.isRememberState) {
      let ls = new LocalStorage();
      this.editorControl.addService(ls);
    }
  }

  destory() {
    this.editorControl.destory();
  }

  setActive(flag) {
    if (flag) {
      this.init();
    } else {
      if (this.active) {
        this.cancelMapDraw();
      }
    }
  }

  getControlByName(name) {
    let control;
    switch (name) {
      case DrawTypes.CAD:
        control = this.cad;
        break;
      case DrawTypes.DRAWPOINT:
        control = this.drawPoint;
        break;
      case DrawTypes.DRAWLINE:
        control = this.drawLine;
        break;
      case DrawTypes.DRAWPOLYGON:
        control = this.drawPoly;
        break;
      case DrawTypes.MODIFY:
        control = this.modify;
        break;
      case DrawTypes.ROTATE:
        control = this.rotate;
        break;
      case DrawTypes.BUFFER:
        control = this.buffer;
        break;
      case DrawTypes.UNION:
        control = this.union;
        break;
      case DrawTypes.INTERSECTION:
        control = this.intersection;
        break;
      case DrawTypes.DIFFERENCE:
        control = this.difference;
        break;
    }

    return control;
  }

  activate(type) {
    let control = this.getControlByName(type);
    if (control) {
      control.activate();
      this.editorControl.activeStateChange(control);
    }
  }

  deactivate(type) {
    if (type) {
      let control = this.getControlByName(type);
      control.deactivate();
    } else {
      let activeControls = this.editorControl.getActiveControls();
      for (let control of activeControls.getArray()) {
        control.deactivate();
      }
    }
  }
  cancelMapDraw() {
    this.active = false;
  }
  removeSelect() {
    let editFeature = this.editorControl.getEditFeature();
    if (editFeature) {
      this.drawSource.removeFeature(editFeature);
    }
  }
  removeTarget() {
    this.map.un('click', this.clearSingle);
    this.map.on('click', this.clearSingle);
  }
  removeAll(id) {
    this.map.un('click', this.clearSingle);
    if (id) {
      const targetLayer = this.map.getLayerById(id);
      targetLayer && targetLayer.getSource().clear();
    } else {
      this.drawSource.clear();
    }
  }
  clearSingle(event) {
    let pixel = this.getEventPixel(event.originalEvent);
    this.forEachFeatureAtPixel(pixel, function (feature, layer) {
      if (layer.get('id') === 'drawLayer') {
        if (feature != null) {
          this.getLayerById('drawLayer').getSource().removeFeature(feature);
        }
      }
    });
  }
  clearFinish() {
    this.map.un('click', this.clearSingle);
  }

  createDrawLayer(option = {}) {
    const {
      id = uuidv4(),
      name = 'drawLayer',
      layerTag,
      mapIndex = 99999
    } = option;
    let drawLayer;
    if (this.map.getLayerById(id)) {
      drawLayer = this.map.getLayerById(id);
    } else {
      drawLayer = new VectorLayer({
        id,
        layerTag,
        name,
        zIndex: mapIndex,
        source: new VectorSource()
      });
      this.map.addLayer(drawLayer);
    }
    return drawLayer;
  }

  loadGeoJson(geojson, option = {}) {
    const {
      isClear = false,
      isFly = false,
      layerId = 'drawLayer',
      style
    } = option;
    const geojsonFormat = new GeoJSON();
    const features = geojsonFormat.readFeatures(geojson);
    const targetLayer = this.map.getLayerById(layerId);
    if (!targetLayer) {
      console.error(`地图中不存在id为${layerId}的图层，请先创建`);
      return;
    }
    if (isClear) {
      targetLayer.getSource().clear();
    }
    if (style) {
      const olStyle = getStyleFormGeneralStyle(style);
      features.forEach((feature) => {
        feature.targetLayerId = layerId;
        feature.setStyle(olStyle);
      });
    }
    targetLayer.getSource().addFeatures(features);
    if (isFly) {
      const extent = features[0].getGeometry().getExtent();
      for (let i = 1; i < features.length; i++) {
        extend(extent, features[i].getGeometry().getExtent());
      }
      this.map.getView().fit(extent, {
        size: this.map.getSize(),
        padding: [100, 100, 100, 100],
        duration: 700
      });
    }
    return features;
  }

  removeFeatures(features) {
    features.forEach((feature) => {
      this.removeFeature(feature);
    });
  }

  removeFeature(feature) {
    const targetLayer = this.map.getLayerById(feature.targetLayerId);
    targetLayer.getSource().removeFeature(feature);
  }

  setFeatureStyle(feature, style) {
    const olStyle = getStyleFormGeneralStyle(style);
    feature.setStyle(olStyle);
  }
}

export default DrawTool;
