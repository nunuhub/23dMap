import $ from 'jquery';
import GeoJSON from 'ol/format/GeoJSON';
import EsriJSON from 'ol/format/EsriJSON';
import { getTransform } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import MultiPolygon from 'ol/geom/MultiPolygon';
import Util from './js/util';
import { unByKey } from 'ol/Observable';
import { getArea } from 'ol/extent.js';

import Charts from './js/Charts';
import axios from '../../../src/utils/request';
import WMSCapabilities from 'ol/format/WMSCapabilities';
import { find } from 'ol/array';

export default class MapCharts {
  constructor(map, callback) {
    this.name = 'MapCharts';
    this.map = map;
    this.callback = callback;
    this.geoJSON = new GeoJSON();
    this.esrijsonFormat = new EsriJSON();
    this.currentWkid = this.map.getView().getProjection().getCode();
    this.util = new Util(this.map);
    this._Ajax = this.util._Ajax;
    this.mapId = this.map.getTarget().id; // 地图dom节点的id
  }

  // 初始化专题图
  initMapCharts(options) {
    this.options = options;
    this.xzqOption = this.options.xzqOption; // 行政区配置
    this.rampOption = this.xzqOption.rampOption; // 渐变色配置
    this.selectOption = this.options.selectOption; // 选择配置
    this.chartOption = this.options.chartOption; // 数据配置

    this.xzqdm_field = this.xzqOption.xzqdm_field;
    this.xzqmc_field = this.xzqOption.xzqmc_field;
    this.xzqFill = this.rampOption.fillColor
      ? this.rampOption.fillColor
      : 'rgba(5, 121, 138, 0.4)';
    this.xzqBorder = this.rampOption.borderColor
      ? this.rampOption.borderColor
      : 'rgba(5, 121, 138, 0.8)';

    // 渐变色计算,同时返回图例颜色对象,执行后可根据数值获取颜色  this.util.getColor()
    this.legendColorObj = this.util.valueRangeColor(
      this.rampOption.valueRange,
      this.rampOption.rampColor,
      this.rampOption.isRampFill
    );
    // 设置初始行政区代码
    this.setCurrentXZQ();
    this.clear();
    // 加载行政区
    this.loadXZQ();
  }

  // 设置当前行政区代码
  setCurrentXZQ() {
    this.current_xzqdm = this.xzqOption.initXZQ + '';
    this.xzq_length = this.current_xzqdm.length;
    if (this.xzq_length >= 6) {
      this.xzq_length += 3;
    } else if (this.xzq_length > 1) {
      this.xzq_length += 2;
    } else {
      this.xzq_length += 1;
    }
  }

  // 加载行政区
  loadXZQ() {
    let layerType = this.xzqOption.layerType;
    if (this.options.xzqOption.isGeoJson) {
      this.createFeature(this.options.xzqOption.geojson);
    } else if (layerType === 'geo-wfs' || layerType === 'geoserver-wfs') {
      axios
        .get(this.xzqOption.layerUrl + '/wms?request=getCapabilities', {
          headers: {
            'content-type': 'application/xml'
          }
        })
        .then((response) => {
          // console.log(response)
          let parser = new WMSCapabilities();
          let result = parser.read(response.headers ? response.data : response);
          let layers = result['Capability']['Layer']['Layer'];
          let targetLayer = null;
          let lyrName = this.xzqOption.layerName;
          if (lyrName.split(':').length > 1) {
            lyrName = this.xzqOption.layerName.split(':')[1];
          }
          targetLayer = find(layers, (elt) => {
            return (
              elt['Name'] === lyrName ||
              elt['Name'] === this.xzqOption.layerName
            );
          });
          if (targetLayer.Layer) {
            for (let childLayer of targetLayer.Layer) {
              this.loadGeoserverWFS(childLayer.Name);
            }
          } else {
            this.loadGeoserverWFS(this.xzqOption.layerName);
          }
          // console.log(targetLayer)
        });
    } else if (layerType === 'arc-vector') {
      this._Ajax(this.xzqOption.layerUrl, { f: 'json' }, (response) => {
        let layers = response.layers;
        for (let i = 0; i < layers.length; i++) {
          const initLayer = layers[i].id;
          this.loadArcgisVector(initLayer);
        }
      });
    }
  }

  // 结合提供的geojson数据创建行政区的feature
  createFeature(geojson) {
    if (!geojson) {
      // geojson = require('./data/geojsonData')
    }
    let features = [];
    let featuresData = geojson.features;
    let dataWkid = geojson.wkid + '';
    if (dataWkid.indexOf('EPSG:') === -1) {
      dataWkid = 'EPSG:' + dataWkid;
    }
    for (let i = 0; i < featuresData.length; i++) {
      const geometry = featuresData[i].geometry;
      const properties = featuresData[i].properties;
      let type = geometry.type;
      let polygon;
      if (type.toLowerCase() === 'polygon') {
        polygon = new Polygon(geometry.coordinates);
      } else if (type.toLowerCase() === 'multipolygon') {
        polygon = new MultiPolygon(geometry.coordinates);
      } else {
        console.error('不支持polygon/multiPolygon以外的数据');
        return;
      }
      polygon.applyTransform(getTransform(dataWkid, this.currentWkid));
      let obj = { geometry: polygon };
      for (const key in properties) {
        obj[key] = properties[key];
      }
      let feature = new Feature(obj);
      features.push(feature);
    }
    this._GeoJson(features, 'geojson');
  }

  // 加载geoserver-wfs图层
  loadGeoserverWFS(name) {
    let urlString = this.xzqOption.layerUrl + '/wfs';
    let param = {
      service: 'WFS',
      version: '1.1.0',
      request: 'GetFeature',
      typeName: name,
      outputFormat: 'application/json',
      maxFeatures: 3200,
      srsName: this.currentWkid,
      CQL_FILTER: this.getFilter('geoserver')
    };
    this._Ajax(urlString, param, (response) => {
      this._GeoJson(response, 'geo-wfs');
    });
  }

  // 加载arcgis-vector图层
  loadArcgisVector(initLayer) {
    let code = this.currentWkid.split(':')[1];
    let urlString = this.xzqOption.layerUrl + '/' + initLayer + '/query';
    let param = {
      f: 'json',
      outFields: '*',
      outSR: code,
      where: this.getFilter('arcgis')
    };
    this._Ajax(urlString, param, (response) => {
      if (response && response.features.length > 0) {
        this._GeoJson(response, 'arc-vector');
      }
    });
  }

  getFilter(type) {
    let where = this.xzqdm_field + " like '" + this.current_xzqdm + "%'";
    if (this.xzqOption.initLevel && this.xzqOption.level_field) {
      where += `and ${this.xzqOption.level_field}=${
        this.xzqOption.initLevel + 1
      }`;
    } else {
      let lengthMethod = type === 'arcgis' ? 'char_length' : 'length';
      where += `and ${lengthMethod}(${this.xzqdm_field})=${this.xzq_length}`;
    }
    return where;
  }

  // geojson数据加载
  _GeoJson(jsonData, type) {
    // 获取wfs服务数据,转换成geojson
    let features;
    if (type === 'geo-wfs') {
      features = this.geoJSON.readFeatures(jsonData);
    } else if (type === 'arc-vector') {
      features = this.esrijsonFormat.readFeatures(jsonData);
    } else if (type === 'geojson') {
      features = jsonData;
    }
    if (features.length) {
      if (this.selectOption.isShowXzq) {
        // 是否显示行政区
        this._addLayer(features); // 添加图层
      }
      this.loadChart(features); // 获取到行政区信息后,加载对应的专题图
    }
  }

  // 加载bar,pie,ring图
  loadChart(features) {
    if (this.selectOption.isShowCharts) {
      let type = this.selectOption.chartType;
      this.chart = new Charts(this.map);
      this.chart.init(
        this.chartOption,
        features,
        this.options.legendConfig,
        this.xzqdm_field,
        type
      );
    }
  }

  // 添加图层
  _addLayer(features) {
    // 初始化图层资源
    let vectorSource = (this.xzqSource = new VectorSource());
    vectorSource.addFeatures(features);
    // 设置加载图层
    let vectorLayer = (this.xzqLayer = new VectorLayer({
      id: 'mapCharts_xzq_' + this.mapId,
      source: vectorSource,
      zIndex: this.options.zIndex ? this.options.zIndex : 100,
      style: (feature) => {
        return this.setXzqColor(feature);
      }
    }));
    // 添加到地图
    this.map.addLayer(vectorLayer);
    let extent = vectorSource.getExtent();
    let isLocate =
      this.selectOption.isLocate != null ? this.selectOption.isLocate : true;
    if (isLocate) {
      this.util.fit2Map(extent, () => {
        // 是否显示图例
        if (
          this.selectOption.isShowRampLegend &&
          this.selectOption.isShowXzq &&
          this.xzqOption.isRamp
        ) {
          this.createLegend();
        }
      });
    }
    if (this.selectOption.isDrill) {
      this.isZoom = true;
      this.drillDown();
    }
  }

  // 设置行政区颜色
  setXzqColor(feature) {
    // 设置行政区样式
    let val = feature.values_ ? feature.values_ : {};
    let name = val[this.xzqmc_field];
    let xzqdm = val[this.xzqdm_field];
    let color;
    if (!this.xzqOption.isRamp) {
      color = this.xzqFill;
    } else {
      let value = this.options.rampData[xzqdm];
      color = this.util.getColor(value);
      color = color ? color : this.xzqFill;
    }
    return this._getStyle(color, this.xzqBorder, name);
  }
  /**
   * 自定义渲染样式
   */
  _getStyle(fillcolor, strokeColor, xzqmc) {
    let fill = new Fill({
      color: fillcolor
    });
    let stroke = new Stroke({
      color: strokeColor,
      width: this.rampOption.strokeWidth ? this.rampOption.strokeWidth : 1
    });
    let fontStroke = this.rampOption.fontStroke;
    let fongSize = this.rampOption.fontSize ? this.rampOption.fontSize : 14;
    let fontColor = this.rampOption.fontColor
      ? this.rampOption.fontColor
      : '#FFF';
    let text = new Text({
      text: xzqmc,
      font: `${fongSize}px bold Microsoft YaHei `,
      fill: new Fill({
        color: fontColor ? fontColor : '#FFF'
      })
    });
    if (fontStroke.isShow) {
      text.setStroke(
        new Stroke({
          width: fontStroke.width ? fontStroke.width : 3,
          color: fontStroke.color ? fontStroke.color : '#dc096b'
        })
      );
    }
    let queryStyle = new Style({
      fill: fill,
      stroke: stroke
    });
    if (this.xzqOption.isShowXzqName) {
      queryStyle.setText(text);
    }
    return queryStyle;
  }

  // 清除专题图
  clear(type) {
    if (!type || type === 'clearAll') {
      this.clearLayer();
      if (this.chart) {
        this.chart.clear();
      }
    } else if (type === 'ramp') {
      this.clearRamp();
    } else {
      if (this.chart) {
        this.chart.clear();
      }
    }
  }
  // 清除行政区
  clearXzq() {
    let features = this.xzqSource.getFeatures();
    if (features.length > 0) {
      features.forEach((f) => {
        this.xzqSource.removeFeature(f);
      });
    }
  }

  // 清除图层
  clearLayer() {
    let layers = this.map.getLayers().getArray();
    if (layers.length > 0) {
      let mapID = 'mapCharts_xzq_' + this.mapId;
      layers.forEach((layer) => {
        if (layer.values_.id === mapID) {
          this.map.removeLayer(layer);
        }
      });
    }
    if (this.drillDownEvt) {
      unByKey(this.drillDownEvt);
    }
    if ($('#mapChartsLegend_' + this.mapId).length > 0) {
      $('#mapChartsLegend_' + this.mapId).remove();
    }
    this.isZoom = false;
  }

  // 清除渐变色图
  clearRamp() {
    this.clearLegend();
    this.xzqLayer.setStyle((f) => {
      let name = f.val[this.xzqmc_field];
      let color = this.xzqFill;
      return this._getStyle(color, this.xzqBorder, name);
    });
  }

  // 清除图例
  clearLegend() {
    if (
      $('#chartLegend_' + this.mapId).length < 1 &&
      $('#mapChartsLegend_' + this.mapId).length > 0
    ) {
      $('#mapChartsLegend_' + this.mapId).remove();
    } else if ($('#rampLegend_' + this.mapId).length > 0) {
      $('#rampLegend_' + this.mapId).remove();
    }
  }

  // 创建渐变图图例
  createLegend() {
    let legendConfig = this.options.legendConfig;
    if ($('#mapChartsLegend_' + this.mapId).length > 0) {
      if ($('#rampLegend_' + this.mapId).length > 0) {
        $('#rampLegend_' + this.mapId).remove();
      }
    } else {
      this.util.createLegendPanel(legendConfig);
    }
    let context = `<div id="rampLegend_${this.mapId}" style="font-size:12px;"><div>渐变色图例:</div>`;
    for (const key in this.legendColorObj) {
      context +=
        '<div style="height:20px;padding:3px 5px;"><div style="background:' +
        this.legendColorObj[key] +
        ';width:20px;height:15px;margin: 0px 5px;position:relative;float:left"></div><div style="position:relative;float:left;">' +
        key +
        '</div></div>';
    }
    context += '</div>';
    $('#legendContext_' + this.mapId).append(context);
  }

  // 下钻功能
  drillDown() {
    this.drillDownEvt = this.map.getView().on('change:resolution', (evt) => {
      let oldValue = evt.oldValue;
      let targetValue = evt.target.values_.resolution;
      let flag = oldValue > targetValue; // 判断是放大还是缩小
      let mapCenter = this.map.getView().getCenter();
      let pixelPoint = this.map.getPixelFromCoordinate(mapCenter);
      if (this.isZoom) {
        // 过滤掉初始加载的缩放
        this.xzqQuery(pixelPoint, flag);
      }
    });
  }

  /**
   * 行政区事件
   * @param {*} pixelPoint
   * @param {*} flag   true=放大,false=缩小
   */
  xzqQuery(pixelPoint, flag) {
    // 判断当前点是否是在行政区要素里面
    let features = this.map.getFeaturesAtPixel(pixelPoint);
    if (!features || features.length < 1) {
      return;
    }
    let values = features[0].values_ ? features[0].values_ : {};
    let xzqdm = values[this.xzqdm_field] + '';
    let length = xzqdm.length;

    // 缩放事件
    let size = this.map.getSize();
    let extent = this.map.getView().calculateExtent(size);
    let mapArea = getArea(extent);
    let featureArea = features[0].getGeometry().getArea();
    let rabit = featureArea / mapArea;
    if (rabit > 0.3 && flag) {
      if (this.xzqdm_up === xzqdm) {
        return;
      }
      this.xzqdm_down = null;
      this.xzqdm_up = xzqdm;
      this.parentXzqdm = xzqdm;
      if (this.callback) {
        this.callback(xzqdm);
      }
    }
    if (rabit < 0.08 && !flag) {
      // 地图缩小,减两级
      if (length < 6) {
        xzqdm = xzqdm.substring(0, xzqdm.length - 2);
      } else if (length === 6) {
        xzqdm = xzqdm.substring(0, xzqdm.length - 4);
      } else if (length === 9) {
        xzqdm = xzqdm.substring(0, xzqdm.length - 5);
      } else {
        xzqdm = xzqdm.substring(0, xzqdm.length - 6);
      }
      if (!xzqdm) {
        return;
      }
      if (this.xzqdm_down === xzqdm) {
        return;
      }
      this.xzqdm_up = null;
      this.xzqdm_down = xzqdm;
      this.parentXzqdm = xzqdm;
      if (this.callback) {
        this.callback(xzqdm);
      }
    }
  }
}
