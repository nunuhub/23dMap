/**
 * Created by FDD on 2017/5/15.
 * @desc PlotDraw
 */
import { Map } from 'ol';
import { Draw as $DrawInteraction, DoubleClickZoom } from 'ol/interaction';
import { Style as $Style, Stroke as $Stroke, Fill as $Fill } from 'ol/style';
import Feature from 'ol/Feature';
import Observable from 'observable-emit';
import { getuuid, MathDistance, bindAll } from '../Utils/utils';
import { BASE_LAYERNAME } from '../Constants';
import { createVectorLayer } from '../Utils/layerUtils';
import PlotTextBox from '../Geometry/Text/PlotTextBox';
import * as Plots from '../Geometry';
import * as PlotTypes from '../Utils/PlotTypes';
import {
  LineString,
  MultiLineString,
  MultiPoint,
  MultiPolygon,
  Point,
  Polygon
} from 'ol/geom';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import CircleStyle from 'ol/style/Circle';
import CursorManager from '../../CursorManager';
import { rotateGeo } from '../Utils/rotateGeoUtils';

class PlotDraw extends Observable {
  constructor(map, params) {
    super();
    if (map && map instanceof Map) {
      this.map = map;
    } else {
      throw new Error('传入的不是地图对象！');
    }
    this.options = params || {};

    this.flashMode = 0; // 绘制结束是否闪烁；0表示不闪烁；1表示闪3次；2表示一直闪烁
    /**
     * 交互点
     * @type {null}
     */
    this.points = null;
    /**
     * 当前标绘工具
     * @type {null}
     */
    this.plot = null;
    /**
     * 当前标绘工具
     * @type {null}
     */
    this.textPlot = null;
    /**
     * 当前要素
     * @type {null}
     */
    this.feature = null;
    /**
     * 标绘类型
     * @type {null}
     */
    this.plotType = null;
    /**
     * 当前标绘参数
     * @type {null}
     */
    this.plotParams = null;
    this.isStayDraw = false;
    /**
     * 当前标绘样式
     * @type {null}
     */
    this.plotStyle = null;
    /**
     * 当前标绘样式
     * @type {null}
     */
    this.textStyle = null;
    this.textOriginStyle = null;
    /**
     * 当前地图视图
     * @type {Element}
     */
    this.mapViewport = this.map.getViewport();
    /**
     * 地图双击交互
     * @type {null}
     */
    this.dblClickZoomInteraction = null;

    /**
     * draw交互工具
     * @type {null}
     * @private
     */
    this.drawInteraction_ = null;

    /**
     * 创建图层名称
     * @type {string}
     */
    this.layerName =
      this.options && this.options.layerName
        ? this.options.layerName
        : BASE_LAYERNAME;

    bindAll(
      [
        'textAreaDrawEnd',
        'mapFirstClickHandler',
        'mapNextClickHandler',
        'mapDoubleClickHandler',
        'mapMouseMoveHandler'
      ],
      this
    );

    /**
     * 当前矢量图层
     * @type {*}
     */
    this.drawLayer = createVectorLayer(this.map, this.layerName, {
      create: true
    });
    this.drawLayer.setZIndex(this.options.zIndex || 1000);

    this.flashSource = this.map.getLayerById('drawLayer').getSource();
  }

  /**
   * 创建Plot
   * @param type
   * @param points
   * @param _params
   * @returns {*}
   */
  createPlot(type, points, _params) {
    // console.log(document.getElementsByClassName('ol-unselectable'))
    const params = _params || {};
    let plot = null;
    let tips = '单击选择下个节点，双击结束绘制';
    switch (type) {
      case PlotTypes.TEXTAREA:
        plot = 'TextArea';
        CursorManager.getInstance(this.map).cancel();
        break;
      case PlotTypes.POINT:
        plot = new Plots.Point([], points, params);
        CursorManager.getInstance(this.map).cancel();
        break;
      case PlotTypes.PENNANT:
        plot = new Plots.Pennant([], points, params);
        break;
      case PlotTypes.POLYLINE:
        plot = new Plots.Polyline([], points, params);
        break;
      case PlotTypes.DASHLINE:
        plot = new Plots.Dashline([], points, params);
        break;
      case PlotTypes.RAILLOADLINE:
        plot = new Plots.RailLoadLine([], points, params);
        break;
      case PlotTypes.RAILLOADCURVE:
        plot = new Plots.RailLoadCurve([], points, params);
        break;
      case PlotTypes.ARC:
        plot = new Plots.Arc([], points, params);
        break;
      case PlotTypes.CIRCLE:
        tips = '单击确定半径';
        plot = new Plots.Circle([], points, params);
        break;
      case PlotTypes.CURVE:
        plot = new Plots.Curve([], points, params);
        break;
      case PlotTypes.DASHCURVE:
        plot = new Plots.DashCurve([], points, params);
        break;
      case PlotTypes.MULTIPLECURVE:
        plot = new Plots.MultipleCurve([], points, params);
        break;
      case PlotTypes.FREEHANDLINE:
        plot = new Plots.FreeHandLine([], points, params);
        break;
      case PlotTypes.RECTANGLE:
        tips = '单击结束绘制';
        plot = new Plots.RectAngle([], points, params);
        break;
      case PlotTypes.ELLIPSE:
        tips = '单击结束绘制';
        plot = new Plots.Ellipse([], points, params);
        break;
      case PlotTypes.LUNE:
        plot = new Plots.Lune([], points, params);
        break;
      case PlotTypes.SECTOR:
        plot = new Plots.Sector([], points, params);
        break;
      case PlotTypes.CLOSED_CURVE:
        plot = new Plots.ClosedCurve([], points, params);
        break;
      case PlotTypes.POLYGON:
        plot = new Plots.Polygon([], points, params);
        break;
      case PlotTypes.ATTACK_ARROW:
        tips = '单击确定起始点2';
        plot = new Plots.AttackArrow([], points, params);
        break;
      case PlotTypes.FREE_POLYGON:
        tips = '单击结束绘制';
        plot = new Plots.FreePolygon([], points, params);
        break;
      case PlotTypes.DOUBLE_ARROW:
        tips = '单击确定起始点2';
        plot = new Plots.DoubleArrow([], points, params);
        break;
      case PlotTypes.STRAIGHT_ARROW:
        plot = new Plots.StraightArrow([], points, params);
        break;
      case PlotTypes.FINE_ARROW:
        tips = '单击结束绘制';
        plot = new Plots.FineArrow([], points, params);
        break;
      case PlotTypes.DOTTED_ARROW:
        plot = new Plots.DottedArrow([], points, params);
        break;
      case PlotTypes.ASSAULT_DIRECTION:
        plot = new Plots.AssaultDirection([], points, params);
        break;
      case PlotTypes.TAILED_ATTACK_ARROW:
        plot = new Plots.TailedAttackArrow([], points, params);
        break;
      case PlotTypes.SQUAD_COMBAT:
        plot = new Plots.SquadCombat([], points, params);
        break;
      case PlotTypes.TAILED_SQUAD_COMBAT:
        plot = new Plots.TailedSquadCombat([], points, params);
        break;
      case PlotTypes.GATHERING_PLACE:
        plot = new Plots.GatheringPlace([], points, params);
        break;
      case PlotTypes.RECTFLAG:
        plot = new Plots.RectFlag([], points, params);
        break;
      case PlotTypes.TRIANGLEFLAG:
        plot = new Plots.TriangleFlag([], points, params);
        break;
      case PlotTypes.CURVEFLAG:
        plot = new Plots.CurveFlag([], points, params);
        break;
    }
    CursorManager.getInstance(this.map).setTip(tips);
    return plot;
  }

  setIsStayDraw(isStayDraw) {
    this.isStayDraw = isStayDraw;
  }

  setFlashMode(flashMode) {
    this.flashMode = flashMode;
  }

  /**
   * 激活工具
   * @param type
   * @param params
   */
  active(type, style, params = {}) {
    this.disActive();
    const cursorUrl = params.cursor
      ? params.cursor
      : require('../../../assets/img/plot-tool/cursor_draw.svg');
    CursorManager.getInstance(this.map).setTipByPlotType(type);
    CursorManager.getInstance(this.map).start(cursorUrl);

    this.deactiveMapTools();
    this.plotType = type;
    this.plotStyle = style;
    if (this.plotStyle) {
      this.plotStyle.zIndex =
        this.drawLayer.getSource().getFeatures().length + 1;
    }
    this.plotParams = params;
    if (type === PlotTypes.TEXTAREA) {
      this.textPlot = null;
      this.activeInteraction();
    } else if (Object.keys(PlotTypes).some((key) => PlotTypes[key] === type)) {
      this.map.on('click', this.mapFirstClickHandler);
    } else {
      console.warn('不存在的标绘类型！');
    }
  }

  /**
   * 取消激活状态
   */
  disActive(isRemoveFeature) {
    CursorManager.getInstance(this.map).cancel();
    if (isRemoveFeature && this.feature) {
      this.drawLayer.getSource().removeFeature(this.feature);
    }
    this.removeEventHandlers();
    if (this.drawInteraction_) {
      this.map.removeInteraction(this.drawInteraction_);
      this.drawInteraction_ = null;
    }
    this.points = [];
    this.plot = null;
    this.feature = null;
    this.plotType = null;
    this.plotParams = null;
    this.activateMapTools();
  }

  /**
   * 激活交互工具
   */
  activeInteraction() {
    this.drawInteraction_ = new $DrawInteraction({
      style: new $Style({
        fill: new $Fill({
          color: 'rgba(255, 255, 255, 0.7)'
        }),
        stroke: new $Stroke({
          color: 'rgba(0, 0, 0, 0.15)',
          width: 2
        })
        /* image: new $Icon({
                  anchor: [1, 1],
                  anchorXUnits: 'fraction',
                  anchorYUnits: 'fraction',
                  opacity: 0.75,
                  src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAABgklEQVQ4T41T0W3CQAy1lfwRqR0h/CE5UhkBJmiZADpB0wlKJwA2aDegE5QR+Igl/noj9OPuLydXPuXQEYUKS5FyPvvd87ONRDRFxEdr7c4Y8ws3WFmW90VRvIjIF1ZVtQaANxH59N6v8zwvRaQEgCMATDu88I+Ipm1bk2XZHhEfAOAdFW00Gh2YOQafOeidHoaYEdGHc65GDZhMJuXpdDJ99hqkPmZe9e9iTgCoqmrWNM0hDerq/FGftXbcZxFzAgARrZg5vBaNiGpE3OhZRF6Zedu7DzkRYMrMKlQKYBBRQVVgw8zj3n3IGWSg9ESkds6tiqJQbe4AYJ6WGVkPAqh4+romdP9LbXMqZh/gXIKqm+d5EK9vbduOY7d0AAdL6AYLmqbRAQtGRMc4ONF/wSC2RF/PsuwbABapqLEjKqb3fq4sLtoYh6Lbiydr7TbtuwYDgH5qB9XmPEjdKG+Y+Xmo7ms+Lcs5N0uX6ei9X9y4TGtEXIZlukb7PzbdmNcisv8DtQILak2vZsYAAAAASUVORK5CYII='
                }) */
      }),
      type: 'Point'
    });
    this.map.addInteraction(this.drawInteraction_);
    this.drawInteraction_.on('drawend', this.textAreaDrawEnd);
  }

  /**
   * 绘制结束
   * @param event
   */
  textAreaDrawEnd(event) {
    if (event && event.feature) {
      CursorManager.getInstance(this.map).cancel();
      this.map.removeInteraction(this.drawInteraction_);
      const extent = event.feature.getGeometry().getExtent();
      const [_width, _height] = [100, 28];
      const _topleft = [
        (extent[0] + extent[2]) / 2,
        (extent[1] + extent[3]) / 2
      ];
      const _topleftPixel = this.map.getPixelFromCoordinate(_topleft);
      const _center = this.map.getCoordinateFromPixel([
        _topleftPixel[0] + _width / 2,
        _topleftPixel[1] + _height / 2
      ]);

      this.createtextArea(_center, _width, _height);
      this.textPlot.setText('新建标注');
      this.textPlot.updateSize();
      this.dispatchSync('drawEnd', {
        type: 'drawEnd',
        originalEvent: event,
        feature: this.textPlot
      });
    } else {
      console.info('未获取到要素！');
    }
  }

  createtextArea(_center, _width, _height) {
    const _textPlot = new PlotTextBox({
      id: getuuid(),
      position: _center,
      value: '',
      width: _width,
      height: _height,
      style: {
        width: _width + 'px',
        height: _height + 'px'
      }
    });
    _textPlot.setSelectListener((textPlot) => {
      this.textPlot = textPlot;
      this.dispatchSync('textPlotSelected', this.textPlot);
      //Bus.$emit('textPlotSelected', this.textPlot);
      this.dispatchSync('changePlotStyle', {
        type: PlotTypes.TEXTAREA,
        style: textPlot.getOriginStyle()
      });
    });
    if (this.map && this.map instanceof Map && _textPlot) {
      this.map.addOverlay(_textPlot);
    } else {
      console.warn('未传入地图对象或者plotText创建失败！');
    }
    if (this.textStyle) {
      _textPlot.setStyle(this.textStyle);
      _textPlot.setOriginStyle(this.textOriginStyle);
    }
    this.textPlot = _textPlot;
  }

  addTextArea(options) {
    const style = options.style;
    const position = options.position;
    const width = options.width;
    const height = options.height;
    const text = options.text;

    this.createtextArea(position, width, height);
    this.textPlot.setText(text);
    this.setTextStyle(style);
  }

  getTextAreas() {
    const overlays = this.map.getOverlays().getArray();
    const textArray = [];
    if (overlays && overlays.length > 0) {
      for (const overlay of overlays) {
        if (overlay instanceof PlotTextBox) {
          const textJson = {
            type: PlotTypes.TEXTAREA,
            position: overlay.getPosition(),
            width: overlay.element.clientWidth,
            height: overlay.element.clientHeight,
            text: overlay.getText(),
            style: overlay.getOriginStyle()
          };
          textArray.push(textJson);
        }
      }
    }
    return textArray;
  }

  addPlotFeature(plotType, points, plotParams) {
    this.plot = this.createPlot(plotType, points, plotParams);
    this.plot.setMap(this.map);
    this.feature = new Feature(this.plot);
    this.feature.set('isPlot', true);
    if (this.plot.setStyle && this.plotStyle) {
      this.plot.setStyle(this.plotStyle);
    }
    if (this.plot.getStyle && this.plot.getStyle()) {
      this.feature.setStyle(this.plot.getStyle());
    }
    this.drawLayer.getSource().addFeature(this.feature);
    this.dispatchSync('RefreshPlotLegend', this.getAllPlot());
    return this.feature;
  }

  getPlotFeatures() {
    const features = this.drawLayer.getSource().getFeatures();
    const featureArray = [];
    if (features && features.length > 0) {
      for (const feature of features) {
        const geometry = feature.getGeometry();
        try {
          const type = geometry.getPlotType();
          if (type) {
            const geoJson = {
              type: type,
              points: geometry.getPoints(),
              style: geometry.style
            };
            featureArray.push(geoJson);
          }
        } catch (e) {
          console.warn(e);
        }
      }
    }
    return featureArray;
  }

  setPlot(data) {
    this.drawLayer.getSource().clear();
    this.removeAllTextPlot();
    if (data && data.length > 0) {
      for (const plotJson of data) {
        this.addPlot(plotJson);
      }
    }
  }

  addPlot(plotJson) {
    if (plotJson.type === PlotTypes.TEXTAREA) {
      // console.log(plotJson)
      this.addTextArea(plotJson);
      this.textPlot = null;
    } else {
      this.plotStyle = JSON.parse(JSON.stringify(plotJson.style));
      this.addPlotFeature(plotJson.type, plotJson.points);
      this.plot.lastAngle = this.plotStyle.rotation;
      rotateGeo(this.plot, this.plotStyle.rotation);
      this.feature = null;
    }
  }

  getAllPlot() {
    let result = [];
    const plotFeatures = this.getPlotFeatures();
    const textAreas = this.getTextAreas();
    if (plotFeatures && plotFeatures.length > 0) {
      result = result.concat(plotFeatures);
    }
    if (textAreas && textAreas.length > 0) {
      result = result.concat(textAreas);
    }
    return result;
  }

  removeFeature(feature) {
    this.drawLayer.getSource().removeFeature(feature);
  }

  removeAllTextPlot() {
    const overlays = this.map.getOverlays().getArray();
    if (overlays && overlays.length > 0) {
      for (const overlay of overlays) {
        if (overlay instanceof PlotTextBox) {
          this.map.removeOverlay(overlay);
        }
      }
    }
  }

  /**
   * PLOT是否处于激活状态
   * @returns {boolean}
   */
  isDrawing() {
    return !!this.plotType && this.plotType !== PlotTypes.TEXTAREA;
  }

  uuid() {
    var s = [];
    var hexDigits = '0123456789abcdef';
    for (var i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = '-';

    var uuid = s.join('');
    return uuid;
  }

  /**
   * 地图事件处理
   * 激活工具后第一次点击事件
   * @param event
   */
  mapFirstClickHandler(event) {
    this.map.un('click', this.mapFirstClickHandler);
    this.points.push(event.coordinate);
    this.addPlotFeature(this.plotType, this.points, this.plotParams);

    if (
      this.plotType === PlotTypes.POINT ||
      this.plotType === PlotTypes.PENNANT
    ) {
      this.plot.finishDrawing();
      this.drawEnd(event);
    } else {
      this.map.on('click', this.mapNextClickHandler);
      if (!this.plot.freehand) {
        this.map.on('dblclick', this.mapDoubleClickHandler);
      }
      this.map.un('pointermove', this.mapMouseMoveHandler);
      this.map.on('pointermove', this.mapMouseMoveHandler);
    }
    if (this.plotType && this.feature) {
      this.plotParams.plotType = this.plotType;
      this.feature.setProperties(this.plotParams);
    }
  }

  /**
   * 地图点击事件处理
   * @param event
   * @returns {boolean}
   */
  mapNextClickHandler(event) {
    if (!this.plot.freehand) {
      if (
        MathDistance(event.coordinate, this.points[this.points.length - 1]) <
        0.0001
      ) {
        return false;
      }
    }
    this.points.push(event.coordinate);
    this.plot.setPoints(this.points);
    if (this.plot.fixPointCount === this.plot.getPointCount()) {
      this.mapDoubleClickHandler(event);
    }
    if (this.plot && this.plot.freehand) {
      this.mapDoubleClickHandler(event);
    }
  }

  /**
   * 地图双击事件处理
   * @param event
   */
  mapDoubleClickHandler(event) {
    event.preventDefault();
    this.plot.finishDrawing();
    this.drawEnd(event);
  }

  /**
   * 地图事件处理
   * 鼠标移动事件
   * @param event
   * @returns {boolean}
   */
  mapMouseMoveHandler(event) {
    const coordinate = event.coordinate;
    if (
      MathDistance(coordinate, this.points[this.points.length - 1]) < 0.0001
    ) {
      return false;
    }
    if (!this.plot.freehand) {
      const pnts = this.points.concat([coordinate]);
      this.plot.setPoints(pnts);
    } else {
      this.points.push(coordinate);
      this.plot.setPoints(this.points);
    }
  }

  /**
   * 移除事件监听
   */
  removeEventHandlers() {
    this.map.un('click', this.mapFirstClickHandler);
    this.map.un('click', this.mapNextClickHandler);
    this.map.un('pointermove', this.mapMouseMoveHandler);
    this.map.un('dblclick', this.mapDoubleClickHandler);
  }

  /**
   * 绘制结束
   */
  drawEnd(event) {
    if (this.flashMode !== 0) {
      this.flashGeometry(this.feature.getGeometry());
    }
    this.dispatchSync('drawEnd', {
      type: 'drawEnd',
      originalEvent: event,
      feature: this.feature
    });
    if (this.feature && this.options.isClear) {
      this.drawLayer.getSource().removeFeature(this.feature);
    }

    const plotType = this.plotType;
    const plotStyle = this.plotStyle;
    const plotParams = this.plotParams;
    this.disActive();
    if (this.isStayDraw) {
      this.active(plotType, plotStyle, plotParams);
    }
  }

  setTextStyle(style) {
    const stroke = style.textStroke;

    const width = style.textWidth;
    // console.log(width)
    // const textShadow = this.format(
    //   '{1} {2}px 0px 0px, {1} 0px {2}px 0px, {1} -{2}px 0px 0px, {1} 0px -{2}px 0px',
    //   stroke,
    //   width
    // )
    const webkitTextStroke = this.format('{2}px {1}', stroke, width / 2);
    let rotation = style.rotation ? style.rotation : 0;
    rotation = (rotation / 180) * Math.PI;
    this.textOriginStyle = style;
    this.textStyle = {
      color: style.textColor,
      fontSize: style.textSize + 'px',
      fontFamily: style.fontFamily,
      fontWeight: style.fontWeight,
      transform: 'rotate(' + rotation + 'rad)', // textShadow: textShadow,
      WebkitTextStroke: webkitTextStroke
    };
    if (this.textPlot) {
      this.textPlot.setStyle(this.textStyle);
      this.textPlot.setOriginStyle(this.textOriginStyle);
    }
  }

  format() {
    if (arguments.length === 0) {
      return this;
    }
    for (var s = arguments[0], i = 1; i < arguments.length; i++) {
      s = s.replace(new RegExp('\\{' + i + '\\}', 'g'), arguments[i]);
    }
    return s;
  }

  /**
   * 设置绘制样式
   * @param style
   */
  setStyle(style) {
    this.plotStyle = JSON.parse(JSON.stringify(style));
    // 刷新正在绘制中的图形
    if (this.plot) {
      if (this.plot.getStyle && this.plot.setStyle) {
        this.plot.setStyle(this.plotStyle);
        this.feature.setStyle(this.plot.getStyle());
      }
    }
  }

  /**
   * 取消激活地图交互工具
   */
  deactiveMapTools() {
    const interactions = this.map.getInteractions().getArray();
    interactions.every((item) => {
      if (item instanceof DoubleClickZoom) {
        this.dblClickZoomInteraction = item;
        this.map.removeInteraction(item);
        return false;
      } else {
        return true;
      }
    });
  }

  /**
   * 激活已取消的地图工具
   * 还原之前状态
   */
  activateMapTools() {
    if (
      this.dblClickZoomInteraction &&
      this.dblClickZoomInteraction instanceof DoubleClickZoom
    ) {
      this.map.addInteraction(this.dblClickZoomInteraction);
      this.dblClickZoomInteraction = null;
    }
  }

  deleteFlashFeature() {
    if (this.flashFeature) {
      this.flashSource.removeFeature(this.flashFeature);
      this.flashFeature = null;
    }
  }

  flashGeometry(currentGeometry) {
    this.deleteFlashFeature();

    const self = this;
    const curFeature = new Feature({
      geometry: currentGeometry
    });
    // 是否禁止闪烁高亮
    if (self.isStopFlashHlight) {
      // curFeature.setStyle(self._getStyle());
    } else if (
      currentGeometry instanceof LineString ||
      currentGeometry instanceof MultiLineString
    ) {
      // 设置默认渲染样式
      curFeature.setStyle(self._getStyle(null, '#00FFFF'));
      self.featureFlash(curFeature, null, '#00FFFF');
    } else if (
      currentGeometry instanceof Point ||
      currentGeometry instanceof MultiPoint
    ) {
      self.featureFlash(curFeature, '', '#00FFFF'); // 定位后闪烁
    } else if (
      currentGeometry instanceof Polygon ||
      currentGeometry instanceof MultiPolygon
    ) {
      // 设置默认渲染样式
      curFeature.setStyle(self._getStyle(null, '#00FFFF'));
      self.featureFlash(curFeature, null, '#00FFFF');
    } else {
      // 设置默认渲染样式
      curFeature.setStyle(self._getStyle());
    }

    this.flashFeature = curFeature;
    this.flashSource.addFeature(curFeature);
  }

  /**
   * 自定义渲染样式
   */
  _getStyle(fcolor, scolor) {
    let fillColor = [255, 0, 0, 0.0];
    let strokeColor = [255, 0, 0, 0.3];
    const radius = 5;
    if (fcolor) {
      fillColor = fcolor;
    }
    if (scolor) {
      strokeColor = scolor;
    }
    const fill = new Fill({
      color: fillColor
    });
    const stroke = new Stroke({
      color: strokeColor,
      width: 2
    });
    const queryStyle = new Style({
      image: new CircleStyle({
        fill: fill,
        stroke: stroke,
        radius: radius
      }),
      fill: fill,
      stroke: stroke
    });
    return queryStyle;
  }

  // 定位闪烁
  featureFlash(curFeature, fillColor, strokeColor) {
    const self = this;
    let i = 0;
    const queryStyle = new Style({
      fill: new Fill({
        color: 'rgba(0,0,0,0)'
      }),
      stroke: ''
    });
    const Hide = function () {
      if (!curFeature) {
        return;
      }
      curFeature.setStyle(queryStyle);
      setTimeout(Show, 300);
    };
    const Show = function () {
      if (!curFeature) {
        return;
      }
      const type = curFeature.getGeometry();
      if (type instanceof Point) {
        curFeature.setStyle(self._getStyle(fillColor, strokeColor));
      } else {
        curFeature.setStyle(self._getStyle(fillColor, strokeColor));
      }
      i++;
      if (self.flashMode === 2 || i < 4) {
        setTimeout(Hide, 200);
      } else {
        curFeature.setStyle(queryStyle);
      }
    };
    Hide();
  }
}

export default PlotDraw;
