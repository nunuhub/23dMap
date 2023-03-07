import GeoJSON from 'ol/format/GeoJSON';
import EsriJSON from 'ol/format/EsriJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { transform, getTransform } from 'ol/proj';
import { getArea } from 'ol/extent.js';
import { unByKey } from 'ol/Observable';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import MultiPolygon from 'ol/geom/MultiPolygon';
import { Style, Text, Stroke, Fill } from 'ol/style';
import Overlay from 'ol/Overlay';
import $ from 'jquery';
import iconImg from '../../bubble-layer/src/images/mark.png';

export default class Scatter {
  constructor(map, callback) {
    this.name = 'Scatter';
    this.map = map;
    this.callback = callback; // 缩放回调函数
    this.currentWkid = this.map.getView().getProjection().getCode();
    this.geoJSON = new GeoJSON();
    this.esrijsonFormat = new EsriJSON();
    this.mapId = this.map.getTarget().id; // 地图dom节点的id
  }

  // 初始化散点图
  initScatter(options) {
    this.options = options;
    this.xzqOption = this.options.xzqOption; // 行政区配置
    this.scatterOption = this.options.scatterOption; // 散点名称配置
    this.legendConfig = this.options.legendConfig; // 图例配置
    // xzq关键字段(大小写)
    this.xzqdm_field = this.xzqOption.xzqdm_field
      ? this.xzqOption.xzqdm_field
      : 'xzqdm';
    this.xzqmc_field = this.xzqOption.xzqmc_field
      ? this.xzqOption.xzqmc_field
      : 'xzqmc';
    this.categoryObj = this.options.categoryObj; // 散点类别以及对应的颜色
    this.xzqFill = this.xzqOption.xzqFill
      ? this.xzqOption.xzqFill
      : 'rgba(5, 121, 138, 0.4)';
    this.xzqBorder = this.xzqOption.xzqBorder
      ? this.xzqOption.xzqBorder
      : 'rgba(5, 121, 138, 0.8)';
    this.clearScatter(); // 清除可能存在的残留数据
    this._loadXZQ(); // 加载行政区
    this._createLegend(); // 创建图例
  }

  // 清除散点图
  clearScatter() {
    let domS = $('#' + this.mapId).find('.scatterPoint');
    if (domS.length > 0) {
      for (let i = domS.length - 1; i >= 0; i--) {
        domS[i].parentElement.remove();
      }
    }
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
      if (layer.values_.id === 'scatter_xzq') {
        this.map.removeLayer(layer);
      }
    });
  }

  _loadXZQ() {
    if (this.options.isGeoJson) {
      // 根据geojson创建feature数据
      let features = this.createFeature(this.options.geojson);
      this._addClusterData(features, 'geojson');
    } else if (
      this.options.layerType === 'geo-wfs' ||
      this.options.layerType === 'geoserver-wfs'
    ) {
      this._load_geoserver_data(); // 根据指定服务获取聚合数据
    } else if (this.options.layerType === 'arc-vector') {
      this._Ajax(
        this.options.layerUrl,
        {
          f: 'json'
        },
        (response) => {
          let layers = response.layers;
          for (let i = 0; i < layers.length; i++) {
            const initLayer = layers[i].id;
            this._load_arcgis_data(initLayer);
          }
        }
      );
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
      let obj = {
        geometry: polygon
      };
      for (const key in properties) {
        obj[key] = properties[key];
      }
      let feature = new Feature(obj);
      features.push(feature);
    }
    this._GeoJson(features, 'geojson');
  }
  // 加载geoserver的行政区服务
  _load_geoserver_data() {
    var urlString = this.options.layerUrl;
    let key = (this.currentXZQ = this.options.currentXZQ + '');
    let length = key.length;
    if (key.length >= 6) {
      length += 3;
    } else if (key.length > 1) {
      length += 2;
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
  _load_arcgis_data(initLayer) {
    let code = this.currentWkid.split(':')[1];
    let urlString = this.options.layerUrl + '/' + initLayer + '/query';
    let key = (this.currentXZQ = this.options.currentXZQ + '');
    let length = key.length;
    if (key.length >= 6) {
      length += 3;
    } else if (key.length > 1) {
      length += 2;
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
      }
    });
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
    let vectorSource = (this.vectorSource = new VectorSource());
    vectorSource.addFeatures(features);
    // 设置加载图层
    let vectorLayer = new VectorLayer({
      id: 'scatter_xzq',
      source: vectorSource,
      zIndex: this.options.zIndex ? this.options.zIndex : 99,
      style: (feature) => {
        // 设置行政区样式
        let value = feature.values_ ? feature.values_ : {};
        let name = value[this.xzqmc_field];
        return this._getStyle(this.xzqFill, this.xzqBorder, name);
      }
    });
    // 添加到地图
    this.map.addLayer(vectorLayer);
    let extent = vectorSource.getExtent();
    this.fit2Map(extent);
    this._createScatterPoint();
  }

  // 创建散点feature
  _createScatterPoint() {
    let dataObj = this.options.dataOptions;
    let isShowTargetName = this.scatterOption.isShowTargetName;
    let fieldName = this.scatterOption.targetField
      ? this.scatterOption.targetField
      : 'name';
    let fontColor = this.scatterOption.targetName.color
      ? this.scatterOption.targetName.color
      : '#fff';
    let fontSize = this.scatterOption.targetName.size
      ? this.scatterOption.targetName.size
      : '12';
    let fontWeight = this.scatterOption.targetName.weight
      ? this.scatterOption.targetName.weight
      : 'normal';
    let fontFamily = this.scatterOption.targetName.family
      ? this.scatterOption.targetName.family
      : 'auto';
    let top = this.scatterOption.targetName.top
      ? this.scatterOption.targetName.top
      : '0';
    let left = this.scatterOption.targetName.left
      ? this.scatterOption.targetName.left
      : '0';
    let color = '';
    let img = '';
    dataObj.forEach((data) => {
      this.categoryObj.forEach((co) => {
        let type = co.type;
        if (type === data.type) {
          color = co.color;
          img = co.img ? co.img : iconImg;
        }
      });
      let positionPoint = data.positionPoint;
      let name = data[fieldName]; // 模拟创建hightchart的svg节点
      let scatterHtml = `<div class='scatterPoint' title='${name}' style='cursor: pointer;'>`;
      if (isShowTargetName) {
        scatterHtml += `<div style='position:relative;color:${fontColor};font-family: ${fontFamily};
                            font-weight: ${fontWeight};font-size:${fontSize}px;top:${top}px;left:${left}px'>
                            ${name}</div>`;
      }
      scatterHtml += `${this._createSvgMarker(color, img)}</div>`;
      positionPoint = transform(
        positionPoint,
        this.options.wkid,
        this.currentWkid
      );
      let scatter = new Overlay({
        position: positionPoint,
        positioning: 'center-center',
        stopEvent: false,
        element: $(scatterHtml)[0]
      });
      this.map.addOverlay(scatter);
    });
    this.isZoom = true;
  }

  _getStyle(fillcolor, strokeColor, xzqmc) {
    let fill = new Fill({
      color: fillcolor
    });
    let stroke = new Stroke({
      color: strokeColor,
      width: 2
    });
    let font = this.xzqOption.xzqNameOption.font
      ? this.xzqOption.xzqNameOption.font
      : '16px bold Microsoft YaHei';
    let color = this.xzqOption.xzqNameOption.color
      ? this.xzqOption.xzqNameOption.color
      : '#FFF';
    let text = new Text({
      text: xzqmc,
      font: font,
      fill: new Fill({
        color: color
      })
    });
    let queryStyle = new Style({
      fill: fill,
      stroke: stroke
    });
    if (this.xzqOption.isShowXzqName) {
      queryStyle.setText(text);
    }
    return queryStyle;
  }

  // 缩放至当前图层
  fit2Map(featureExtent) {
    let mapSize = this.map.getSize();
    let zoomRatio = this.options.zoomRatio;
    let size = [mapSize[0] * zoomRatio, mapSize[1] * zoomRatio];
    this.map.getView().fit(featureExtent, {
      size: size
    });
    // 是否启用下钻
    if (this.options.isDrill) {
      this.drillDown();
    } else {
      if (this.drillDownEvt) {
        unByKey(this.drillDownEvt);
      }
    }
  }

  // 下钻功能
  drillDown() {
    if (
      this.options.layerType === 'geo-wfs' ||
      this.options.layerType === 'arc-vector' ||
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

  /**
   * 行政区下钻查询事件
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
      if (this.callback) {
        this.callback(xzqdm);
      }
    }
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

  // 创建标记的svg图标
  _createSvgMarker(color, img) {
    let width = this.options.pointIcon.width
      ? this.options.pointIcon.width
      : 20;
    let height = this.options.pointIcon.height
      ? this.options.pointIcon.height
      : 24;
    let markerSvg = '';
    if (this.options.pointIcon.isShowImg) {
      markerSvg = `<div style="float:left;"><img src='${img}' style='width:${width}px;height:${height}px;'></div>`;
    } else {
      markerSvg = `<div style="float:left;"><svg viewBox="0 0 1024 1024" width="${width}" height="${height}">
       <path d="M513.13664 22.17642667c-224.78734222 0-407.01610667 182.22762667-407.01610667
        407.01610666 0 112.63089778 45.75118222 214.57464889 119.68056889 288.26624l-0.78961777
        0.78961778L512 1005.23690667l274.39331555-274.39217778c82.15665778-74.46755555 133.76056889-182.03192889
        133.7605689-301.65105778 0-224.78961778-182.22876445-407.01724445-407.01724445-407.01724444zM512
        584.19086222c-84.97493333 0-153.86055111-68.88675555-153.86055111-153.86055111S427.02392889
        276.47089778 512 276.47089778c84.97379555 0 153.86055111 68.88561778 153.86055111
        153.86055111S596.97379555 584.19086222 512 584.19086222z" fill=" ${color} "></path>
       </svg></div>`;
    }
    return markerSvg;
  }

  // 创建图例
  _createLegend() {
    let scatterChartDom = $('#scatterLegend_' + this.mapId);
    if (scatterChartDom.length > 0) {
      scatterChartDom.remove();
    }
    let legendConfig = this.legendConfig;
    if (legendConfig.isShow) {
      let img = require('./images/legend.png');
      let legendHtml = `<div id="scatterLegend_${this.mapId}" style="position:absolute;z-index:10;box-shadow: 0px 1px 5px;${legendConfig.style}">
                          <div id="legendContainer_${this.mapId}" style="background:rgb(255, 255, 255,${legendConfig.opacity});border-radius: 3px;">`;
      if (!legendConfig.hideTitle) {
        legendHtml += `<div class="legendTitle" style="font-size: 14px;background: #409eff;color: #fff;border-top-left-radius: 3px;border-top-right-radius: 3px;text-align: center;height:25px;">
                       图例<span class="legendHide" style="cursor: pointer;position:relative;float:right;right:5px;top:2px;" title="最小化">&#8801;</span></div>`;
      }
      legendHtml += `</div>
                      <div id="showLegend_${this.mapId}" style="display:none;cursor: pointer;width: 32px;height: 32px;" title="散点图图例">
                      <img src="${img}" style="background:rgb(255, 255, 255,${legendConfig.opacity});">
                    </div>
                  </div>`;
      $('#' + this.mapId).append(legendHtml);
      let categoryObj = this.options.categoryObj;
      // 设置图例内容
      let scatterHtml = '<div style="max-height:200px;overflow: auto;">';
      categoryObj.forEach((cate) => {
        let color = cate.color;
        let type = cate.type;
        let iconImgsrc = cate.img ? cate.img : iconImg;
        scatterHtml += `<div style="padding:5px;height:25px;">
                            <div style="position: relative;float: left;">
                              ${this._createSvgMarker(color, iconImgsrc)}
                              <div style="font-size: 13px;height: 15px;padding:4px 5px;float:left;"> ${type} </div>
                            </div>
                        </div>`;
      });
      scatterHtml += '</div>';
      $('#legendContainer_' + this.mapId).append(scatterHtml);
      // 绑定图例事件
      $('.legendHide')
        .off('click')
        .click(() => {
          $('#legendContainer_' + this.mapId).hide();
          $('#showLegend_' + this.mapId).show();
        });
      $('#showLegend_' + this.mapId)
        .off('click')
        .click(() => {
          $('#legendContainer_' + this.mapId).show();
          $('#showLegend_' + this.mapId).hide();
        });
    }
  }
}
