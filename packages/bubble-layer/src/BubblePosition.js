import GeoJSON from 'ol/format/GeoJSON';
import $ from 'jquery';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { transform, getTransform } from 'ol/proj';
import { Fill, Stroke, Style, Icon, Text } from 'ol/style';
import EsriJSON from 'ol/format/EsriJSON';
import { getArea } from 'ol/extent.js';
import { unByKey } from 'ol/Observable';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import MultiPolygon from 'ol/geom/MultiPolygon';
import DoubleClickZoom from 'ol/interaction/DoubleClickZoom';
// 获取气泡图/散点图定位点
export default class BubblePosition {
  constructor(map, callback) {
    this.map = map;
    this.callback = callback;
    this.currentWkid = this.map.getView().getProjection().getCode();
    this.geoJSON = new GeoJSON();
    this.esrijsonFormat = new EsriJSON();
    this.xzqFill = 'rgba(5, 121, 138, 0.4)';
    this.xzqBorder = 'rgba(5, 121, 138, 0.8)';
    // 禁用地图双击放大事件
    this.map.interactions.forEach((mepEvent) => {
      if (mepEvent instanceof DoubleClickZoom) {
        mepEvent.setActive(false);
      }
    });
    $('#map')
      .append(`<button id="getBtn" style="position:absolute;z-index:99;float: left;
    top: 10px;
    left: 100px;">获取数据</button>`);
    $('#getBtn').click(() => {
      this.getPositionData();
    });
  }

  // 初始化
  init(options) {
    if (options) {
      this.options = options;
    } else {
      let dataJson = require('./data/positionJson');
      this.options = dataJson.positionJson;
    }
    this.positionPoints = this.positionPoints
      ? this.positionPoints
      : this.options.positionPoints;
    this.bubbleNum = this.options.bubbleNum; // 气泡种类数
    this.currentXZQ = this.currentXZQ
      ? this.currentXZQ
      : this.options.currentXZQ;
    this.xzqdm_field = this.xzqdm_field
      ? this.xzqdm_field
      : this.options.xzqdm_field;
    this.xzqmc_field = this.xzqmc_field
      ? this.xzqmc_field
      : this.options.xzqmc_field;
    this.xzqdmMaxLength = this.options.xzqdmMaxLength;
    this.xzqdmMinLength = this.options.xzqdmMinLength;
    this.clearXZQ();
    this.setInitKey();
    this.loadXZQ();
  }

  // 设置初始化的行政区代码数据
  setInitKey() {
    this.key = this.currentXZQ + '';
    this.xzqdmLength = this.key.length;
    if (this.xzqdmLength >= 6) {
      this.xzqdmLength += 3;
    } else if (this.xzqdmLength > 1) {
      this.xzqdmLength += 2;
    } else {
      this.xzqdmLength += 1;
    }
  }

  // 加载行政区
  loadXZQ() {
    let layerType = this.options.layerType;
    if (this.options.isGeojson) {
      this.createFeature(this.options.geojson);
    } else if (layerType === 'geo-wfs') {
      this.loadGeoserverWFS();
    } else if (layerType === 'arc-vector') {
      this._Ajax(this.options.layerUrl, { f: 'json' }, (response) => {
        let layers = response.layers;
        for (let i = 0; i < layers.length; i++) {
          const initLayer = layers[i].id;
          this.loadArcgisVector(initLayer);
        }
      });
    } else {
      console.error('行政区服务类型不匹配');
    }
  }

  // 结合提供的geojson数据创建行政区的feature
  createFeature(geojson) {
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
  loadGeoserverWFS() {
    var urlString = this.options.layerUrl;
    var param = {
      service: 'WFS',
      version: '1.1.0',
      request: 'GetFeature',
      typeName: this.options.layerName,
      outputFormat: 'application/json',
      maxFeatures: 3200,
      srsName: this.currentWkid,
      CQL_FILTER:
        this.xzqdm_field +
        " like '" +
        this.key +
        "%' and length(" +
        this.xzqdm_field +
        ')=' +
        this.xzqdmLength
    };
    this._Ajax(urlString, param, (response) => {
      this._GeoJson(response, 'geo-wfs');
    });
  }

  // 加载arcgis-vector图层
  loadArcgisVector(initLayer) {
    let code = this.currentWkid.split(':')[1];
    let urlString = this.options.layerUrl + '/' + initLayer + '/query';
    let param = {
      f: 'json',
      outFields: '*',
      outSR: code,
      // returnGeometry: false,
      where:
        this.xzqdm_field +
        " like '" +
        this.key +
        "%' AND char_length(" +
        this.xzqdm_field +
        ')=' +
        this.xzqdmLength
    };
    this._Ajax(urlString, param, (response) => {
      if (response && response.features.length > 0) {
        this._GeoJson(response, 'arc-vector');
      }
    });
  }

  // 创建定位点图标
  createPosFeatures() {
    this.positFeatures = [];
    for (const key in this.positionPoints) {
      if (key.length === this.xzqdmLength && key.indexOf(this.key) !== -1) {
        let points = this.positionPoints[key];
        points.forEach((point) => {
          point = transform(point, this.options.centerWkid, this.currentWkid);
          const geometry = new Point(point);
          const feature = new Feature({
            geometry: geometry,
            xzqdm: key
          });
          this.positFeatures.push(feature);
        });
      }
    }
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
    // 初始化行政区图层资源
    let vectorSource = (this.vectorSource = new VectorSource());
    vectorSource.addFeatures(features);
    this.createPosFeatures(); // 创建标记点
    vectorSource.addFeatures(this.positFeatures);
    // 设置加载图层
    let vectorLayer = new VectorLayer({
      id: 'position_xzq',
      source: vectorSource,
      zIndex: 9999,
      style: (feature) => {
        let type = feature.getGeometry().getType();
        if (type === 'Point') {
          return new Style({
            image: new Icon({
              anchor: [0.5, 0.8],
              src: require('./images/mark.png')
            })
          });
        } else {
          let name = feature.values_[this.xzqmc_field];
          return this._getStyle(this.xzqFill, this.xzqBorder, name);
        }
      }
    });
    // 添加到地图
    this.map.addLayer(vectorLayer);
    let extent = vectorSource.getExtent();
    this.fit2Map(extent);
    this.mapClick();
    return features;
  }

  mapClick() {
    if (this.mapClickEvt) {
      unByKey(this.mapClickEvt);
    }
    this.mapClickEvt = this.map.on('dblclick', (evt) => {
      let features = this.map.getFeaturesAtPixel(evt.pixel);
      if (features.length < 1) {
        alert('请在行政区面内选取点');
      } else if (features.length === 1) {
        let type = features[0].getGeometry().getType();
        let xzqdm = features[0].values_[this.xzqdm_field];
        if (type !== 'Point') {
          let point = new Point(evt.coordinate);
          let f = new Feature({
            geometry: point,
            xzqdm: xzqdm
          });
          this.vectorSource.addFeature(f);
          let pArr = this.positionPoints[xzqdm];
          if (pArr) {
            // 添加新的定位点
            this.positionPoints[xzqdm].push(evt.coordinate);
          } else {
            this.positionPoints[xzqdm] = [evt.coordinate];
          }
        } else {
          this.vectorSource.removeFeature(features[0]);
          let pArr = [].concat(this.positionPoints[xzqdm]);
          pArr.forEach((p, index) => {
            if (p[0] === evt.coordinate[0] && p[1] === evt.coordinate[1]) {
              this.positionPoints[xzqdm].splice(index, 1);
            }
          });
        }
      } else {
        features.forEach((f) => {
          let xzqdm = f.values_[this.xzqdm_field];
          let type = f.getGeometry().getType();
          if (type === 'Point') {
            this.vectorSource.removeFeature(f);
            let geo = f.getGeometry().getCoordinates();
            let pArr = [].concat(this.positionPoints[xzqdm]);
            pArr.forEach((p, index) => {
              if (p[0] === geo[0] && p[1] === geo[1]) {
                this.positionPoints[xzqdm].splice(index, 1);
              }
            });
          }
        });
      }
    });
  }

  // 缩放至当前图层
  fit2Map(featureExtent) {
    this.map.getView().fit(featureExtent, {
      size: this.map.getSize()
    });
    this.isZoom = true;
    this.drillDown();
    this.addPositionObj();
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
      width: 2
    });
    let text = new Text({
      text: xzqmc,
      font: '16px bold Microsoft YaHei ',
      fill: new Fill({
        color: '#FFF'
      })
    });
    let queryStyle = new Style({
      text: text,
      fill: fill,
      stroke: stroke
    });
    return queryStyle;
  }

  // 下钻功能
  drillDown() {
    if (this.drillDownEvt) {
      unByKey(this.drillDownEvt);
    }
    this.drillDownEvt = this.map.getView().on('change:resolution', (evt) => {
      let oldValue = evt.oldValue;
      let targetValue = evt.target.values_.resolution;
      let flag = oldValue > targetValue; // 判断是放大还是缩小
      let mapCenter = this.map.getView().getCenter();
      let pixelPoint = this.map.getPixelFromCoordinate(mapCenter);
      if (this.isZoom) {
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
    let values = features[0].values_;
    let xzqdm = values[this.xzqdm_field];
    if (!xzqdm) {
      return;
    }
    let length = xzqdm.length;
    // 缩放事件
    let size = this.map.getSize();
    let extent = this.map.getView().calculateExtent(size);
    let mapArea = getArea(extent);
    let featureArea = features[0].getGeometry().getArea();
    let rabit = featureArea / mapArea;
    if (rabit > 0.3 && flag) {
      if (this.xzqdm_up === xzqdm || xzqdm.length >= this.xzqdmMaxLength) {
        return;
      }
      this.xzqdm_down = null;
      this.xzqdm_up = xzqdm;
      this.parentXzqdm = xzqdm;
      if (this.callback) {
        this.callback(xzqdm);
      }
      this.currentXZQ = xzqdm;
      this.init(this.options);
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
      if (!xzqdm || xzqdm.length < this.xzqdmMinLength) {
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
      this.currentXZQ = xzqdm;
      this.init(this.options);
    }
  }

  // 移除可能已经加载的xzq
  clearXZQ() {
    // 清除地图绑定事件
    this.isZoom = false;
    if (this.drillDownEvt) {
      unByKey(this.drillDownEvt);
    }
    let layers = this.map.getLayers().getArray();
    layers.forEach((layer) => {
      if (layer.values_.id === 'position_xzq') {
        this.map.removeLayer(layer);
      }
    });
  }

  // 获取当前的定位坐标
  getPositionData() {
    return this.positionPoints;
  }
  // 添加定位坐标数据
  addPositionObj() {
    let features = this.vectorSource.getFeatures();
    features.forEach((feature) => {
      let geo = feature.getGeometry();
      let type = geo.getType();
      if (type === 'Point') {
        let xzqdm = feature.values_.xzqdm;
        if (this.positionPoints[xzqdm]) {
          // 多次缩放会重复数据
          let pArr = this.positionPoints[xzqdm];
          let newP = geo.getCoordinates();
          let isRepeat = false;
          pArr.forEach((p) => {
            if (p[0] === newP[0] && p[1] === newP[1]) {
              isRepeat = true;
            }
          });
          if (!isRepeat) {
            this.positionPoints[xzqdm].push(newP);
          }
        } else {
          this.positionPoints[xzqdm] = [];
          this.positionPoints[xzqdm].push(geo.getCoordinates());
        }
      }
    });
  }

  // 封装ajax请求
  _Ajax(urlString, param, callback) {
    $.ajax({
      url: urlString,
      type: 'POST',
      dataType: 'json',
      data: param,
      success: (response) => {
        callback(response);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }
}
