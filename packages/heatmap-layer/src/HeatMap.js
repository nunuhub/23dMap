import GeoJSON from 'ol/format/GeoJSON';
import EsriJSON from 'ol/format/EsriJSON';
import $ from 'jquery';
import VectorSource from 'ol/source/Vector';
import Heatmap from 'ol/layer/Heatmap';

export default class HeatMap {
  constructor(map, callback) {
    this.name = 'HeatMap';
    this.map = map;
    this.callback = callback; // 缩放回调函数
    this.currentWkid = this.map.getView().getProjection().getCode();
    this.geoJSON = new GeoJSON();
    this.esrijsonFormat = new EsriJSON();
    this.mapId = this.map.getTarget().id; // 地图dom节点的id
  }

  // 初始化热力图
  initHeatMap(options) {
    this.options = options;
    this.minMax = this.options.minMax;
    this.clear();
    if (this.options.isGeojson) {
      this._geoJson(this.options.geojson);
    } else if (this.options.layerUrl) {
      this._loadVecLayer();
    } else {
      alert('请配置热力图数据');
    }
  }

  // 处理热力图数据
  _geoJson(json, wkid) {
    let dataWkid = (json.wkid ? json.wkid : wkid ? wkid : '4490') + '';
    if (dataWkid.indexOf('EPSG:') === -1) {
      dataWkid = 'EPSG:' + dataWkid;
    }
    let vectorSource = null;
    let f = null;
    if (this.options.isGeojson) {
      f = this.geoJSON.readFeatures(json, {
        dataProjection: dataWkid,
        featureProjection: this.currentWkid
      });
    } else {
      f = json;
    }
    vectorSource = new VectorSource();
    if (this.options.isSetWeight && this.options.weightName) {
      this.setWeight(vectorSource, f.length);
    }
    vectorSource.addFeatures(f);
    this.vector = new Heatmap({
      id: 'HeatMap',
      zIndex: this.options.zIndex ? this.options.zIndex : 99,
      source: vectorSource,
      opacity: this.options.opacity ? this.options.opacity : 0.8, // 透明度
      blur: this.options.blur ? this.options.blur : 15, // 模糊大小（以像素为单位）,默认15
      radius: this.options.radius ? this.options.radius : 5, // 半径大小（以像素为单位),默认5
      // 矢量图层的渲染模式：
      // 'image'：矢量图层呈现为图像。性能出色，但点符号和文本始终随视图一起旋转，像素在缩放动画期间缩放。
      // 'vector'：矢量图层呈现为矢量。即使在动画期间也能获得最准确的渲染，但性能会降低。
      renderMode: 'image'
    });
    this.map.addLayer(this.vector);

    if (this.minMax && this.minMax.length > 0 && this.options.isLegend) {
      this.setLegend(this.minMax[1], this.minMax[0]);
    }
  }

  // 设置权重
  setWeight(vectorSource, length) {
    let name = this.options.weightName;
    let maxWeight = 0;
    let minWeight = 0;
    let num = 0;
    vectorSource.on('addfeature', (event) => {
      var weight = event.feature.get(name);
      if (weight || weight === 0 || weight === '0') {
        weight = Number(weight);
        event.feature.set('weight', weight);
        if (!this.minMax && this.minMax.length < 1) {
          if (weight > maxWeight) maxWeight = weight;
          if (weight < maxWeight) minWeight = weight;
        }
      } else {
        event.feature.set('weight', 1);
      }
      if (num === length - 1 && this.options.isLegend) {
        if (!this.minMax && this.minMax.length < 1) {
          this.setLegend(maxWeight, minWeight);
        }
      }
      num++;
    });
  }

  setLegend(max, min) {
    setTimeout(() => {
      // 保留两位小数
      let def = max - min;
      let mid1 = Math.round((def / 4) * 3 + min);
      let mid2 = Math.round((def / 4) * 2 + min);
      let mid3 = Math.round((def / 4) * 1 + min);
      if (max <= 1 && min <= 1) {
        max = 1;
        min = 0;
        mid1 = 0.75;
        mid2 = 0.5;
        mid3 = 0.25;
      }
      let colors = JSON.parse(JSON.stringify(this.vector.getGradient()));
      let color = `linear-gradient(${colors.reverse().join(',')});`;
      let heatLegend = `<div style="width: 80px;height: 150px;position: absolute;
                        float: right;bottom: 45px;right: 10px;font-size: 12px;" id="heatGradient_${this.mapId}">
                        <div style="width: 60px;height:100%;position: relative;float: left;text-align: right">
                        <div>${max}</div>
                        <div style="margin: 18px 0">${mid1}</div>
                        <div style="margin: 18px 0">${mid2}</div>
                        <div style="margin: 18px 0">${mid3}</div>
                        <div>${min}</div>
                        </div>
                        <div id="heatGradient_Div" style="width: 20px;height:100%;
                        position: relative;float: left;background-image:${color}"></div>
                     </div> `;
      $('#' + this.mapId).append(heatLegend);
    }, 1000);
  }

  // 加载
  _loadVecLayer() {
    if (this.options.layerType === 'geo-wfs') {
      this.loadGeoserverWFS();
    } else if (this.options.layerType === 'arc-vector') {
      this.loadArcgisVector();
    } else {
      console.error('暂不支持其他服务类型');
    }
  }

  // 加载geoserver-wfs图层数据
  loadGeoserverWFS() {
    var urlString = this.options.layerUrl;
    var param = {
      service: 'WFS',
      version: '1.1.0',
      request: 'GetFeature',
      typeName: this.options.layerName,
      outputFormat: 'application/json',
      maxFeatures: 100000,
      srsName: this.currentWkid,
      CQL_FILTER: '1=1'
    };
    this._Ajax(urlString, param, (response) => {
      let features = this.geoJSON.readFeatures(response);
      this._geoJson(features, this.currentWkid);
    });
  }

  // 加载arcgis的动态图层
  loadArcgisVector() {
    let code = this.currentWkid.split(':')[1];
    let urlString =
      this.options.layerUrl + '/' + this.options.initLayer + '/query';
    let param = {
      f: 'json',
      outSR: code,
      outFields: '*',
      where: '1=1'
    };
    this._Ajax(urlString, param, (response) => {
      let features = this.esrijsonFormat.readFeatures(response);
      this._geoJson(features, code);
    });
  }

  // 清除图层
  clear() {
    let layers = this.map.getLayers().getArray();
    layers.forEach((layer) => {
      if (layer.values_.id === 'HeatMap') {
        this.map.removeLayer(layer);
      }
    });
    $(`#heatGradient_${this.mapId}`).remove();
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
