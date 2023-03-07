import GeoJSON from 'ol/format/GeoJSON';
import $ from 'jquery';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { getTransform } from 'ol/proj';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import Stroke from 'ol/style/Stroke';
import Overlay from 'ol/Overlay';
import Fill from 'ol/style/Fill';
import EsriJSON from 'ol/format/EsriJSON';
import { getArea } from 'ol/extent.js';
import { unByKey } from 'ol/Observable';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import MultiPolygon from 'ol/geom/MultiPolygon';
import centerOfMass from '@turf/center-of-mass';
import {
  polygon as t_polygon,
  multiPolygon as t_multiPolygon
} from '@turf/helpers';

/**
 *  @author yy
 *  @date 2020/10/27
 *  @description
 */
export default class Mark {
  constructor(map) {
    this.map = map;
    this.currentWkid = this.map.getView().getProjection().getCode();
    this.geoJSON = new GeoJSON();
    this.esrijsonFormat = new EsriJSON();
    this.mapId = this.map.getTarget().id; // 地图dom节点的id
    this.centerObj = {};
  }

  // 初始化标记
  initMark(options) {
    this.clearMark();
    this.options = options;
    // xzqdm字段(大小写)
    this.xzqdm_field = this.options.xzqdm_field;
    this.xzqFill = this.options.fillColor
      ? this.options.fillColor
      : 'rgba(5, 121, 138, 0.4)';
    this.xzqBorder = this.options.borderColor
      ? this.options.borderColor
      : 'rgba(5, 121, 138, 0.8)';
    this.loadXZQ();
  }

  // 加载行政区
  loadXZQ() {
    let layerType = this.options.layerType;
    if (this.options.isGeojson) {
      this.createFeature(this.options.geojson);
    } else if (layerType === 'geoserver-wfs') {
      this.loadGeoserverWFS();
    } else if (layerType === 'dynamic') {
      this._Ajax(
        this.options.layerUrl,
        {
          f: 'json'
        },
        (response) => {
          let layers = response.layers;
          for (let i = 0; i < layers.length; i++) {
            const initLayer = layers[i].id;
            this.loadArcgisVector(initLayer);
          }
        }
      );
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
    // 初始化图层资源
    let vectorSource = new VectorSource();
    vectorSource.addFeatures(features);
    // 设置加载图层
    let vectorLayer = new VectorLayer({
      id: 'mark_xzq',
      source: vectorSource,
      zIndex: this.options.zIndex ? this.options.zIndex : 99,
      style: (feature) => {
        // 设置行政区样式
        if (this.options.isShowXZQ) {
          let name = feature.values_[this.xzqmc_field];
          return this._getStyle(this.xzqFill, this.xzqBorder, name);
        } else {
          return new Style({
            fill: new Fill({
              color: 'rgba(0,0,0,0)'
            }),
            stroke: new Stroke({
              color: 'rgba(0,0,0,0)',
              width: 0
            })
          });
        }
      }
    });
    // 获取行政区的对中心点
    this.getMarksPoint(features);
    // 添加到地图
    this.map.addLayer(vectorLayer);
    this.fit2Map();
    this.createMark();
  }
  // 结合提供的geojson数据创建行政区的feature
  createFeature(geojson) {
    let features = [];
    let featuresData = geojson.features;
    let dataWkid = this.currentWkid;
    if (geojson.wkid) {
      dataWkid = geojson.wkid;
      if (dataWkid.indexOf('EPSG:') === -1) {
        dataWkid = 'EPSG:' + dataWkid;
      }
    } else if (geojson.spatialReference) {
      dataWkid = 'EPSG:' + geojson.spatialReference.wkid;
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
        console.error('不支持Polygon/MultiPolygon以外的图形数据');
        return;
      }
      polygon.applyTransform(getTransform(dataWkid, this.currentWkid));
      let obj = {
        geometry: polygon
      };
      for (const key in properties) {
        obj[key] = properties[key];
      }
      let feature = new Feature(obj);
      features.push(feature);
      // //绘制气泡
      // this.createBubble(properties[this.xzqdm_field])
    }
    this._GeoJson(features, 'geojson');
  }

  // 加载geoserver-wfs图层
  loadGeoserverWFS() {
    var urlString = this.options.layerUrl;
    let key = Object.keys(this.options.regions)[0];
    let length = key.length;
    if (key.length > 6) {
      key = key.substring(0, key.length - 3);
    } else {
      key = key.substring(0, key.length - 2);
    }
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
        key +
        "%' and length(" +
        this.xzqdm_field +
        ')=' +
        length
    };
    this._Ajax(urlString, param, (response) => {
      this._GeoJson(response, 'geo-wfs');
    });
  }

  // 加载arcgis-vector图层
  loadArcgisVector(initLayer) {
    let code = this.currentWkid.split(':')[1];
    let urlString = this.options.layerUrl + '/' + initLayer + '/query';
    let key = Object.keys(this.options.totaldata)[0];
    let length = key.length;
    if (key.length > 6) {
      key = key.substring(0, key.length - 3);
    } else {
      key = key.substring(0, key.length - 2);
    }
    let param = {
      f: 'json',
      outFields: '*',
      outSR: code,
      // returnGeometry: false,
      where:
        this.xzqdm_field +
        " like '" +
        key +
        "%' AND char_length(" +
        this.xzqdm_field +
        ')=' +
        length
    };
    this._Ajax(urlString, param, (response) => {
      if (response && response.features.length > 0) {
        this._GeoJson(response, 'arc-vector');
      } else {
        // console.log("图层第" + initLayer + " 层未查询到数据")
      }
    });
  }

  // 获取标记点
  getMarksPoint(features) {
    if (features.length > 0) {
      this.centerObj = {};
      features.forEach((item) => {
        let geo = item.getGeometry();
        let coord = geo.getCoordinates();
        let center = null;
        let py = null;
        if (geo instanceof MultiPolygon) {
          py = t_multiPolygon(coord);
          center = centerOfMass(py);
        } else {
          py = t_polygon(coord);
          center = centerOfMass(py);
        }
        let xzq = item.get(this.xzqdm_field);
        this.centerObj[xzq] = center.geometry.coordinates;
      });
    }
  }
  // 创建标记
  createMark() {
    let data = this.options.regions;
    if (data) {
      for (const key in data) {
        let point = this.centerObj[key];
        let valObj = data[key];
        this.createMarkPop(point, valObj, key);
      }
      this.isZoom = true;
      if (this.options.clickEvt) {
        this.clickEvtFun();
      }
    }
  }

  // 设置弹窗配置
  setPopConfig(valObj, id) {
    if (valObj.borderColor) {
      $('#markId_' + id).css('border', '1px solid ' + valObj.borderColor);
    }
    if (valObj.fontSize) {
      $('#markId_' + id).css('font-size', valObj.fontSize);
    }
    if (valObj.nameColor) {
      let dom = $('#markId_' + id).find('.markName');
      dom.css('color', valObj.nameColor);
    }
    if (valObj.nameColor) {
      let dom = $('#markId_' + id).find('.markValue');
      dom.css('color', valObj.numColor);
    }
    if (valObj.backgroundColor) {
      $('#markId_' + id).css('background', valObj.backgroundColor);
      // $("#markId_"+id).css("background","-webkit-linear-gradient(left,#52A0FD 0%,#00e2fa 80%,#00e2fa 100%)")
      $('#markId_' + id).css('box-shadow', valObj.boxshadow);
    }
  }

  // 点击事件
  clickEvtFun() {
    $('.markDivClass').css('cursor', 'pointer');
    $('.markDivText')
      .off('click')
      .on('click', (evt) => {
        let currentDom = evt.currentTarget;
        let parent = $(currentDom).parent();
        let dom = $(parent);
        let xzq = dom.attr('role');
        let checked = dom.attr('checked');
        let dataObj = this.options.regions[xzq];
        if (dataObj) {
          let nameColor = dataObj.nameColor ? dataObj.nameColor : '#fff';
          let numColor = dataObj.numColor ? dataObj.numColor : '#fff';
          if (!checked) {
            let doms = $('.markDivClass');
            for (let i = 0; i < doms.length; i++) {
              let item = $(doms[i]);
              let ch = item.attr('checked');
              if (ch) {
                item.attr('checked', false);
                item.css('background', dataObj.backgroundColor);
                item.find('.markName').css('color', nameColor);
                item.find('.markValue').css('color', numColor);
              }
            }
            let markName = dom.find('.markName')[0].innerHTML;
            let markValue = dom.find('.markValue')[0].innerHTML;
            if (markValue.indexOf('(') > -1) {
              markValue = markValue.split('(')[1].split(')')[0];
            }
            let obj = {
              xzq: xzq,
              name: markName,
              value: markValue
            };
            dom.attr('checked', true);
            dom.css('background', dataObj.toggleColor);
            dom.find('.markName').css('color', '#fff');
            dom.find('.markValue').css('color', '#fff');
            this.options.clickEvt(obj);
          } else {
            dom.attr('checked', false);
            dom.css('background', dataObj.backgroundColor);
            dom.find('.markName').css('color', nameColor);
            dom.find('.markValue').css('color', numColor);
          }
        }
      });
  }

  // 创建标记框
  createMarkPop(point, valObj, xzq) {
    let id = this.newGuid();
    let imgHtml = '';
    if (this.options.type === 'circle') {
      imgHtml =
        '<div class="markDivClass" style="border-radius: 50%;padding: 10px;box-shadow: 5px 5px 5px lightgrey;"  role="' +
        xzq +
        '" id="markId_' +
        id +
        '">';
    } else {
      imgHtml =
        '<div class="markDivClass" style="border-radius: 5px;padding: 10px;box-shadow: 5px 5px 5px lightgrey;"  role="' +
        xzq +
        '"  id="markId_' +
        id +
        '">';
    }
    imgHtml +=
      '<div class="markDivText markName" style="text-align:center;padding:2px 5px 1px">' +
      valObj.name +
      '<a class="markDivText markValue" style="text-decoration:none;">' +
      valObj.value +
      '</a></div></div>';
    // imgHtml += '<div class="markDivText markValue" style="text-align:center;padding:1px 5px 2px">('+valObj.value+')</div>';
    imgHtml += '</div>';
    // 插入节点
    $('#' + this.mapId)
      .find('.ol-overlaycontainer')
      .append(imgHtml);
    let mark = new Overlay({
      position: point,
      positioning: 'center-center',
      stopEvent: true,
      element: document.getElementById('markId_' + id)
    });
    this.map.addOverlay(mark);
    this.setPopConfig(valObj, id);
  }

  // 下钻功能
  drillDown() {
    if (
      this.options.layerType === 'geoserver-wfs' ||
      this.options.layerType === 'dynamic' ||
      this.options.isGeojson === true
    ) {
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
  }

  clearMark() {
    // 清除已经存在的气泡
    let domS = $('#' + this.mapId).find('.markDivClass');
    if (domS.length > 0) {
      for (let i = 0; i < domS.length; i++) {
        domS[i].parentElement.remove();
      }
    }
    $('.markDivText').off('click');
    $('.markDivClass').css('cursor', 'default');
    // 移除专题图可能加载过的行政区图层,后面重新加载
    this.clearXZQ();
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
      if (layer.values_.id === 'mark_xzq') {
        this.map.removeLayer(layer);
      }
    });
  }

  // 缩放至当前图层
  fit2Map() {
    let zoomRatio = this.options.zoomRatio ? this.options.zoomRatio : 1;
    if (!this.mapResolution) {
      this.mapResolution = this.map.getView().getResolution();
    }
    let resolution = this.mapResolution / zoomRatio;
    this.map.getView().setResolution(resolution);

    // 是否启用下钻
    if (this.options.drillEvt) {
      // 下钻回调
      this.callback = this.options.drillEvt;
      this.drillDown();
    } else {
      if (this.drillDownEvt) {
        unByKey(this.drillDownEvt);
      }
    }
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
      fill: fill,
      stroke: stroke
    });
    if (this.options.isShowXzqName) {
      queryStyle.setText(text);
    }
    return queryStyle;
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
  // 创建随机guid
  newGuid() {
    var guid = '';
    for (var i = 1; i <= 32; i++) {
      var n = Math.floor(Math.random() * 16.0).toString(16);
      guid += n;
      if (i === 8 || i === 12 || i === 16 || i === 20) guid += '-';
    }
    return guid;
  }
}
