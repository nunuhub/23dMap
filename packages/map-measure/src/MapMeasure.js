import $ from 'jquery';
import { LineString, Polygon, Point } from 'ol/geom.js';
import { getLength, getArea } from 'ol/sphere';
import Overlay from 'ol/Overlay';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { Vector as VectorSource } from 'ol/source.js';
import { unByKey } from 'ol/Observable';
import Draw from 'ol/interaction/Draw.js';
import { projectGeography } from 'shinegis-client-23d/src/utils/olUtil';
import { newGuid } from 'shinegis-client-23d/src/utils/common';
import { getuuid } from 'shinegis-client-23d/src/map-core/olPlot/Utils/utils';

import Observable from 'ol/Observable';
import Event from 'ol/events/Event.js';

const MapMeasureEventType = {
  /**
   * 功能打开关闭时触发
   */
  CHANGEACTIVE: 'change:active'
};

export class MapMeasureActiveEvent extends Event {
  constructor(type, active) {
    super(type);
    this.active = active;
  }
}

class MapMeasure extends Observable {
  constructor(map) {
    super();
    this.name = 'mapMesure';
    this.map = map;
    this.active = false;
    // 量算featureID,结果删除按钮ID
    this.feaId = 0;
    this.delId = 0;
    this.result = 0;
    this.featureMap = {};
    // 鼠标右键是否取消绘制
    this.cancelMouseRight = false;
    this.source = new VectorSource();
    this.vector = new VectorLayer({
      source: this.source,
      zIndex: 999999,
      id: 'measureLayer',
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33'
          })
        })
      })
    });
    // 绘制矢量图层
    this.map.addLayer(this.vector);
    /**
     * 当前绘制的要素（Currently drawn feature.）
     * @type {ol.Feature}
     */
    this.sketch = undefined;
    /**
     * 帮助提示框对象（The help tooltip element.）
     * @type {Element}
     */
    this.helpTooltipElement = undefined;
    /**
     *帮助提示框显示的信息（Overlay to show the help messages.）
     * @type {ol.Overlay}
     */
    this.helpTooltip = undefined;
    /**
     * 测量工具提示框对象（The measure tooltip element. ）
     * @type {Element}
     */
    this.measureTooltipElement = undefined;
    /**
     *测量工具中显示的测量值（Overlay to show the measurement.）
     * @type {ol.Overlay}
     */
    this.measureTooltip = undefined;
    /**
     *  当用户正在绘制多边形时的提示信息文本
     * @type {string}
     */
    this.continuePolygonMsg = '点击继续量算面积';
    /**
     * 当用户正在绘制线时的提示信息文本
     * @type {string}
     */
    this.continueLineMsg = '点击继续量算距离';
    /**
     * 当用户正在绘制点时的提示信息文本
     * @type {string}
     */
    this.continueLineMsg = '点击继续量算距离';
    /**
     * 是否使用测地学方法测量
     * @type {Boolean}
     */
    this.geodesic = true;
    this.draw = null;
    this.pointerMoveHandler = this.pointerMoveHandler.bind(this);
    this.mouseoutHandler = this.mouseoutHandler.bind(this);
  }
  /**
   *
   * @param {*} type
   */
  activate(options) {
    if (this.active) {
      this.removeInteraction();
    }
    this.addInteraction(options);
    this.map.on('pointermove', this.pointerMoveHandler);
    $(this.map.getViewport()).on('mouseout', this.mouseoutHandler);
    this.active = true;
    this.dispatchEvent(
      new MapMeasureActiveEvent(MapMeasureEventType.CHANGEACTIVE, this.active)
    );
  }

  mouseoutHandler() {
    $(this.helpTooltipElement).css('display', 'none');
  }

  removeById(id) {
    if (this.featureMap && this.featureMap[id]) {
      this.source.removeFeature(this.featureMap[id].feature);
      this.map.removeOverlay(this.featureMap[id].tooltip);
      this.featureMap[id] = null;
    }
  }
  /**
   * 鼠标移动事件处理函数
   * @param {ol.MapBrowserEvent} evt
   */
  pointerMoveHandler(evt) {
    if (evt.dragging) {
      return;
    }
    /** @type {string} */
    var helpMsg = '单击鼠标开始绘制';

    if (this.sketch) {
      var geom = this.sketch.getGeometry();
      if (geom instanceof Polygon) {
        helpMsg = this.continuePolygonMsg;
      } else if (geom instanceof LineString) {
        helpMsg = this.continueLineMsg;
      }
    }

    this.helpTooltipElement.innerHTML = helpMsg;
    this.helpTooltip.setPosition(evt.coordinate);
    this.helpTooltipElement.classList.remove('hidden');
  }
  /**
   * 加载交互绘制控件函数
   */
  addInteraction(options) {
    let type = options.type;
    this.draw = new Draw({
      source: this.source,
      type: type,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2
        }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)'
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          })
        })
      })
    });
    this.map.addInteraction(this.draw);
    this.createMeasureTooltip(); // 创建测量工具提示框
    this.createHelpTooltip(); // 创建帮助提示框

    var listener;
    let self = this;
    // 绑定交互绘制工具开始绘制的事件
    this.draw.on('drawstart', function (evt) {
      // set sketch
      self.sketch = evt.feature; // 绘制的要素
      // featcher ID
      self.sketch.setId(newGuid());
      /** @type {ol.Coordinate|undefined} */
      var tooltipCoord = evt.coordinate; // 绘制的坐标
      // 绑定change事件，根据绘制几何类型得到测量长度值或面积值，并将其设置到测量工具提示框中显示
      listener = self.sketch.getGeometry().on('change', function (evt) {
        var geom = evt.target; // 绘制几何要素
        var output;
        if (geom instanceof Polygon) {
          output = self.formatArea(geom, options); // 面积值
          tooltipCoord = geom.getInteriorPoint().getCoordinates(); // 坐标
          self.onChangeListener && self.onChangeListener('change', output);
        } else if (geom instanceof LineString) {
          output = self.formatLength(geom, options); // 长度值
          tooltipCoord = geom.getLastCoordinate(); // 坐标
          self.onChangeListener && self.onChangeListener('change', output);
        }
        /* if (geom instanceof LineString){
          self.measureTooltipElement.innerHTML = output// 将测量值设置到测量工具提示框中显示
        } else {
          self.measureTooltipElement.innerHTML = output+" "+options.unit // 将测量值设置到测量工具提示框中显示
        }*/
        self.measureTooltipElement.innerHTML = output + ' ' + options.unit; // 将测量值设置到测量工具提示框中显示
        self.measureTooltip.setPosition(tooltipCoord); // 设置测量工具提示框的显示位置
      });
      let drawGeo = self.sketch.getGeometry();
      if (drawGeo instanceof Point) {
        let grapGeo = projectGeography(
          drawGeo,
          self.map.getView().getProjection().getCode()
        );
        if (grapGeo) {
          self.onChangeListener &&
            self.onChangeListener(
              'change',
              self.formatDegree(grapGeo.getCoordinates()[0]) +
                ',' +
                self.formatDegree(grapGeo.getCoordinates()[1])
            );
        }
      }
    });
    // 绑定交互绘制工具结束绘制的事件
    this.draw.on('drawend', function (evt) {
      self.measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
      self.measureTooltip.setOffset([0, -7]);
      self.sketch = null; // 置空当前绘制的要素对象
      // unset tooltip so that a new one can be created
      self.lastMeasureTooltipElement = self.measureTooltipElement;
      // 新增记录
      let id = getuuid();
      self.featureMap[id] = {
        feature: evt.feature,
        tooltip: self.measureTooltip
      };
      self.onChangeListener && self.onChangeListener('drawend', id);
      self.measureTooltipElement = null;
      self.createMeasureTooltip();

      unByKey(listener);
    });
  }

  formatDegree(value) {
    // /<summary>将度转换成为度分秒</summary>

    value = Math.abs(value);
    var v1 = Math.floor(value); // 度
    var v2 = Math.floor((value - v1) * 60); // 分
    var v3 = Math.round(((value - v1) * 3600) % 60); // 秒
    return v1 + '°' + v2 + "'" + v3 + '"';
  }
  /**
   *创建一个新的帮助提示框（tooltip）
   */
  createHelpTooltip() {
    if (this.helpTooltipElement) {
      this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
    }
    this.helpTooltipElement = document.createElement('div');
    this.helpTooltipElement.className = 'ol-tooltip hidden';
    this.helpTooltip = new Overlay({
      element: this.helpTooltipElement,
      offset: [15, 0],
      id: 'ol-tooltip',
      positioning: 'center-left'
    });
    this.map.addOverlay(this.helpTooltip);
  }
  /**
   *创建一个新的测量工具提示框（tooltip）
   */
  createMeasureTooltip() {
    if (this.measureTooltipElement) {
      this.measureTooltipElement.parentNode.removeChild(
        this.measureTooltipElement
      );
      // this.lastMeasureTooltipElement = this.measureTooltipElement;
    }
    this.measureTooltipElement = document.createElement('div');
    this.measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    this.measureTooltip = new Overlay({
      element: this.measureTooltipElement,
      offset: [0, -15],
      id: 'ol-tooltip-measure',
      positioning: 'bottom-center'
    });
    this.map.addOverlay(this.measureTooltip);
  }

  changeMeasureTooltip(innerHTML) {
    if (this.lastMeasureTooltipElement) {
      this.lastMeasureTooltipElement.innerHTML = innerHTML;
    }
  }
  /**
   * 测量长度输出
   * @param {LineString} line
   * @return {string}
   */
  formatLength(line, options) {
    var length;
    if (this.geodesic) {
      // 若使用测地学方法测量
      length = getLength(line, {
        // 6378137为WGS84椭球的长半轴，默认为WGS84椭球的平均半轴6371008.8
        radius: 6378137,
        // 当前坐标系
        projection: this.map.getView().getProjection().getCode()
      });
    } else {
      length = Math.round(line.getLength() * 100) / 100; // 直接得到线的长度
    }
    // console.log(options);
    var output;
    if (options.unit === '千米') {
      this.result = Math.round((length / 1000) * 100) / 100;
      output = Math.round((length / 1000) * 100) / 100; // 换算成KM单位
    } else {
      this.result = Math.round(length * 100) / 100;
      output = Math.round(length * 100) / 100; // m为单位
    }
    return output; // 返回线的长度
  }
  /**
   * 测量面积输出
   * @param {Polygon} polygon
   * @return {string}
   */
  formatArea(polygon, options) {
    var area;
    if (this.geodesic) {
      area = getArea(polygon, {
        // 6378137为WGS84椭球的长半轴，默认为WGS84椭球的平均半轴6371008.8
        radius: 6378137,
        // 当前坐标系
        projection: this.map.getView().getProjection().getCode()
      });
    } else {
      area = polygon.getArea(); // 直接获取多边形的面积
    }
    var output;
    if (options.unit === '平方米') {
      this.result = Math.round(area * 100) / 100;
      output = Math.round(area * 100) / 100; // m为单位
    } else if (options.unit === '平方千米') {
      this.result = Math.round((area / 1000000) * 100) / 100;
      output = Math.round((area / 1000000) * 100) / 100;
    } else if (options.unit === '公顷') {
      this.result = Math.round((area / 10000) * 100) / 100;
      output = Math.round((area / 10000) * 100) / 100;
    } else if (options.unit === '亩') {
      this.result = Math.round((area / 10000) * 100 * 15) / 100;
      output = Math.round((area / 10000) * 100 * 15) / 100;
    }
    return output; // 返回多边形的面积
  }

  convertResult(unit1, unit2, area) {
    if (unit1 === '平方米') {
      if (unit2 === '平方千米') {
        area = (area * 0.000001).toFixed(6);
      } else if (unit2 === '公顷') {
        area = (area * 0.0001).toFixed(4);
      } else if (unit2 === '亩') {
        area = (area * 0.0015).toFixed(4);
      }
    } else if (unit1 === '平方千米') {
      if (unit2 === '平方米') {
        area = (area * 1000000).toFixed(2);
      } else if (unit2 === '公顷') {
        area = (area * 100).toFixed(4);
      } else if (unit2 === '亩') {
        area = (area * 1500).toFixed(4);
      }
    } else if (unit1 === '公顷') {
      if (unit2 === '平方千米') {
        area = (area * 0.01).toFixed(4);
      } else if (unit2 === '亩') {
        area = (area * 15).toFixed(4);
      } else if (unit2 === '平方米') {
        area = (area * 10000).toFixed(2);
      }
    } else if (unit1 === '亩') {
      if (unit2 === '平方千米') {
        area = (area * 0.0006667).toFixed(6);
      } else if (unit2 === '公顷') {
        area = (area * 0.0666667).toFixed(6);
      } else if (unit2 === '平方米') {
        area = Math.round(area * 666.6666667).toFixed(2);
      }
    } else if (unit1 === '米') {
      if (unit2 === '千米') {
        area = area * 0.001;
      }
    } else if (unit1 === '千米') {
      if (unit2 === '米') {
        area = area * 1000;
      }
    }
    return area;
  }

  getMeasureDelSpan() {
    var delspan = document.createElement('span');
    delspan.className = 'delspan';
    delspan.innerText = 'X';
    let that = this;
    delspan.onclick = function () {
      // 删除测量结果
      this.parentNode.parentNode.removeChild(this.parentNode);
      // 删除测量feature
      that.source.removeFeature(
        that.source.getFeatureById(this.parentNode.getAttribute('id'))
      );
    };
    return delspan;
  }

  removeInteraction() {
    $(this.helpTooltipElement).css('display', 'none');
    $('.tooltip-measure').css('display', 'none');
    $(this.map.getViewport()).off('mouseout', this.mouseoutHandler);
    this.map.un('pointermove', this.pointerMoveHandler);
    this.map.removeInteraction(this.draw);
  }

  clearOverlay() {
    this.source.clear();
    let overLays = this.map.getOverlays().getArray();
    for (let i = overLays.length - 1; i >= 0; i--) {
      if (
        overLays[i].getId() === 'ol-tooltip' ||
        overLays[i].getId() === 'ol-tooltip-measure'
      ) {
        this.map.removeOverlay(overLays[i]);
      }
    }
    this.featureMap = {};
  }

  // 取消量算
  deactivate(clear = true) {
    this.removeInteraction();
    // 清除所有量测信息
    if (clear) {
      this.clearOverlay();
    }
    this.active = false;
    this.dispatchEvent(
      new MapMeasureActiveEvent(MapMeasureEventType.CHANGEACTIVE, this.active)
    );
  }
  setActive(flag, options) {
    if (flag) {
      this.activate(options);
    } else {
      if (this.active) {
        this.deactivate();
      }
    }
  }

  setOnChangeLisnter(onChangeListener) {
    this.onChangeListener = onChangeListener;
  }
}

export default MapMeasure;
