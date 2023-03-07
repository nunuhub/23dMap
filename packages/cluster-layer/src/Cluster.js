import $ from 'jquery';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import MultiPolygon from 'ol/geom/MultiPolygon';
import { Vector as VectorLayer } from 'ol/layer';
import { Cluster, Vector as VectorSource } from 'ol/source';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style';
import { transform, getTransform } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import EsriJSON from 'ol/format/EsriJSON';
import { getCenter } from 'ol/extent';

export default class ClusterMap {
  constructor(map) {
    this.name = 'ClusterMap';
    this.map = map;
    this.geoJSON = new GeoJSON();
    this.esrijsonFormat = new EsriJSON();
    this.currentWkid = this.map.getView().getProjection().getCode();
  }

  // 初始化聚合地图
  initCluster(options) {
    let features = [];
    this.options = options;
    if (this.options.isGeoJson) {
      // 根据geojson创建聚合图层
      features = this.createFeatur();
      this._addClusterData(features, 'geojson');
    } else if (this.options.layerUrl) {
      this.loadVecData(); // 根据指定服务获取聚合数据
    } else {
      let count = 10000;
      let x = 119.23435232;
      let y = 29.78435232;
      for (let i = 0; i < count; ++i) {
        let coordinates = [
          3 - 6 * Math.random() + x,
          2 - 4 * Math.random() + y
        ];
        let point = transform(
          coordinates,
          'EPSG:4490',
          this.map.getView().getProjection().getCode()
        );
        features[i] = new Feature(new Point(point));
      }
      this._addClusterData(features, 'geojson');
    }
  }

  // 根据geojson处理聚合图层
  createFeatur() {
    let features = [];
    let geojson;
    geojson = this.options.geojson;
    // 坐标系wkid处理
    let dataWkid = this.currentWkid;
    if (geojson.wkid) {
      dataWkid = geojson.wkid;
      if (dataWkid.indexOf('EPSG:') === -1) {
        dataWkid = 'EPSG:' + dataWkid;
      }
    } else if (geojson.spatialReference) {
      dataWkid = 'EPSG:' + geojson.spatialReference.wkid;
    }
    let geoFeature = geojson.features;
    for (let i = 0; i < geoFeature.length; i++) {
      const geoFea = geoFeature[i];
      let geometry;
      let point;
      let type = geoFea.geometry.type;
      if (type.toLowerCase() === 'point') {
        point = geometry = new Point(geoFea.geometry.coordinates);
        point.applyTransform(getTransform(dataWkid, this.currentWkid));
      } else if (type.toLowerCase() === 'polygon') {
        geometry = new Polygon(geoFea.geometry.coordinates);
        geometry.applyTransform(getTransform(dataWkid, this.currentWkid));
        point = geometry.getInteriorPoint();
      } else if (type.toLowerCase() === 'multiPolygon') {
        geometry = new MultiPolygon(geoFea.geometry.coordinates);
        geometry.applyTransform(getTransform(dataWkid, this.currentWkid));
        point = new Point(getCenter(geometry.getExtent()));
      } else {
        alert('存在不支持聚合的图形类型');
        return;
      }
      features[i] = new Feature(point);
    }
    return features;
  }

  // 根据图层url加载矢量数据
  loadVecData() {
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
      this._addClusterData(response, 'geo-wfs');
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
      this._addClusterData(response, 'arc-vector');
    });
  }

  // geojson数据加载
  _addClusterData(jsonData, type) {
    // 获取wfs服务数据,转换成geojson
    let features;
    if (type === 'geo-wfs') {
      features = this.geoJSON.readFeatures(jsonData);
    } else if (type === 'arc-vector') {
      features = this.esrijsonFormat.readFeatures(jsonData);
    } else if (type === 'geojson') {
      features = jsonData;
    }
    features = $.grep(features, (f) => {
      return f.get('geometry');
    });
    // 初始化图层资源
    let source = new VectorSource({
      features: features
    });
    // 初始化聚合图
    let clusterSource = new Cluster({
      distance: this.options.distance,
      source: source,
      geometryFunction: (feature) => {
        let point;
        let geometry = feature.getGeometry();
        if (geometry.getType() === 'Point') {
          point = geometry;
        } else if (geometry.getType() === 'Polygon') {
          point = geometry.getInteriorPoint();
        } else if (geometry.getType() === 'MultiPolygon') {
          point = new Point(getCenter(geometry.getExtent()));
        } else {
          return null;
        }
        return point;
      }
    });

    let styleCache = {};
    this.clusters = new VectorLayer({
      id: 'clusters_xzq',
      source: clusterSource,
      zIndex: this.options.zIndex ? this.options.zIndex : 99,
      style: (feature) => {
        return this.setStyle(styleCache, feature);
      }
    });
    this.map.addLayer(this.clusters);
  }

  // 设置聚合点样式
  setStyle(styleCache, feature) {
    let size = feature.get('features').length;
    let style = styleCache[size];
    let styleArr = [];
    let radius = this.options.radius
      ? this.options.radius
      : size.toString().length * 5;
    let maxZoom = this.map.getView().getMaxZoom();
    let currentZoom = this.map.getView().getZoom();
    if (size > 1 && currentZoom < maxZoom - 3) {
      if (!style) {
        style = new Style({
          text: this.style_text(size)
        });
        style.setImage(this.style_circle(radius));
        styleCache[size] = style;
      }
      styleArr.push(style);
    } else {
      let clusterFeatures = feature.get('features');
      for (let i = 0; i < clusterFeatures.length; i++) {
        const originalFeature = clusterFeatures[i];
        let type = originalFeature.getGeometry().getType();
        if (type === 'Polygon' || type === 'MultiPolygon') {
          let orStyle = this.setPolygonStyle(originalFeature);
          styleArr.push(orStyle);
        } else {
          if (!style) {
            style = new Style({
              text: this.style_text(size)
            });
            style.setImage(this.style_circle(radius));
            styleCache[size] = style;
          }
          styleArr.push(style);
        }
      }
    }
    return styleArr;
  }

  // 设置聚合点的样式
  style_circle(radius) {
    let style = new CircleStyle({
      radius: radius > 10 ? radius : 10,
      fill: new Fill({ color: this.options.colorConfig.fillColor }),
      stroke: this.options.isShowBorder
        ? new Stroke({ color: this.options.colorConfig.borderColor })
        : undefined
    });
    return style;
  }

  // 设置聚合内数字
  style_text(size) {
    let text = '';
    if (this.options.isShowNum) {
      text = new Text({
        text: size.toString(),
        font: this.options.colorConfig.font.size + 'px serif',
        fill: new Fill({ color: this.options.colorConfig.font.fontColor }),
        stroke: new Stroke({
          color: this.options.colorConfig.font.borderColor,
          width: this.options.colorConfig.font.borderWidth
        })
      });
    }
    return text;
  }

  setPolygonStyle(feature) {
    // 普通多边形的样式
    let colorConfig = this.options.colorConfig;
    let style = new Style({
      geometry: feature.getGeometry(),
      fill: new Fill({
        color: colorConfig.fillColor
      }),
      stroke: new Stroke({
        color: colorConfig.borderColor,
        width: 1
      }),
      text: new Text({
        text: feature.text,
        textAlign: 'center',
        textBaseline: 'middle',
        font: colorConfig.font.size + 'px serif',
        fill: new Fill({ color: colorConfig.font.fontColor }),
        stroke: new Stroke({
          color: colorConfig.font.borderColor,
          width: colorConfig.font.borderWidth
        })
      })
    });
    return style;
  }

  // 清除聚合图层
  clear() {
    let layers = this.map.getLayers().getArray();
    layers.forEach((layer) => {
      if (layer.values_.id === 'clusters_xzq') {
        this.map.removeLayer(layer);
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
