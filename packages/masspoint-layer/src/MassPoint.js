/* eslint-disable radix */
import GeoJSON from 'ol/format/GeoJSON';
import $ from 'jquery';
import { unByKey } from 'ol/Observable';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { Fill, Circle, Style } from 'ol/style';
import { Message } from 'element-ui';

export default class massPoint {
  constructor(map, callback) {
    this.name = 'massPoint';
    this.map = map;
    this.callback = callback; // 缩放回调函数
    this.currentWkid = this.map.getView().getProjection().getCode();
    this.geoJSON = new GeoJSON();
    this.mapId = this.map.getTarget().id; // 地图dom节点的id
  }

  // 初始化散点图
  initPoint(options) {
    this.options = options;
    this.legendConfig = this.options.legendConfig; // 图例配置

    this.clearMassPoint(); // 清除可能存在的残留数据
    this._loadData();
    this._createLegend(); // 创建图例
  }

  _loadData() {
    if (this.options.geojson) {
      let jsonData = this.options.geojson;
      let dataWkid = (jsonData.wkid ? jsonData.wkid : '4490') + '';
      if (dataWkid.indexOf('EPSG:') === -1) {
        dataWkid = 'EPSG:' + dataWkid;
      }
      let features = this.geoJSON.readFeatures(jsonData, {
        dataProjection: dataWkid,
        featureProjection: this.currentWkid
      });
      this.createFeature(features);
    } else {
      Message.error({ message: '没有散点数据', offset: 30 });
    }
  }

  // 清除散点图
  clearMassPoint() {
    let layers = this.map.getLayers().getArray();
    if (layers.length > 0) {
      let mapID = 'massPoint_' + this.mapId;
      layers.forEach((layer) => {
        if (layer.values_.id === mapID) {
          this.map.removeLayer(layer);
        }
      });
    }
  }

  // 创建散点图
  createFeature(features) {
    let vectorSource = null;
    vectorSource = new VectorSource();

    vectorSource.addFeatures(features);
    this.vector = new VectorLayer({
      id: 'massPoint_' + this.mapId,
      zIndex: this.options.zIndex ? this.options.zIndex : 99,
      source: vectorSource,
      style: (feature) => {
        let weight = feature.get('weight');
        let rbga = this._calcColor(weight);
        let R = this._calcRadius(weight);
        return this._getStyle(rbga, R);
      }
    });
    this.map.addLayer(this.vector);
  }

  // 计算半径
  _calcRadius(weight) {
    let minMax = this.options.minMax;
    let minMaxR = this.options.minMaxR;
    let R = 5;
    if (minMax && minMax && minMax.length === 2 && minMaxR.length === 2) {
      let defNum = minMax[1] - minMax[0];
      let defR = minMaxR[1] - minMaxR[0];
      let K = defR / defNum;
      R = (weight - minMax[0]) * K + minMaxR[0];
    } else {
      console.error('缺失计算半径的参数');
    }
    return R;
  }
  // 计算颜色
  _calcColor(weight) {
    let minMax = this.options.minMax;
    let rgba = '';
    if (minMax && minMax.length === 2) {
      let minOpacity = this.options.minOpacity;
      minOpacity = minOpacity ? minOpacity : 0.5;
      let def = 1 - minOpacity;
      let Opacity = (weight / minMax[1]) * def + minOpacity;
      let color = this.options.color;
      if (color.indexOf('#') > -1) {
        rgba = this.hexToRgba(color, Opacity);
      } else if (color.indexOf('rgba') > -1) {
        let arr = color.split(',');
        rgba = [arr[0], arr[1], arr[2]].join(',') + ',' + Opacity + ')';
      } else if (color.indexOf('rgb') > -1) {
        rgba = color.replace(')', ',' + Opacity + ')');
      } else {
        console.error('不支持的颜色代码');
      }
    }
    return rgba;
  }

  _getStyle(fillcolor, radius) {
    let fill = new Fill({
      color: fillcolor
    });
    let image = new Circle({
      radius: radius ? radius : 3,
      fill: fill
    });
    let queryStyle = new Style({
      image: image
    });
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

  // 创建图例
  _createLegend() {}
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

  hexToRgba(hex, opacity) {
    let r = parseInt('0x' + hex.slice(1, 3));
    let g = parseInt('0x' + hex.slice(3, 5));
    let b = parseInt('0x' + hex.slice(5, 7));
    return `rgba(${r},${g},${b},${opacity})`;
  }
}
