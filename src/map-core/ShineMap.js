import Map from 'ol/Map';
import { MouseWheelZoom, DragPan, DoubleClickZoom } from 'ol/interaction';
import Bus from '../utils/bus';
import InteractionManager from './InteractionManager';
import LayerManager from './LayerManager';
import QueryManager from './QueryManager';
import MaskManager from './MaskManager';
import {
  getMarkerById,
  addMarker as _addMarker,
  locateGeoJson,
  addGeoJson as _addGeoJson,
  flashFeatures as _flashFeatures,
  locateTempGraphic,
  getMapScale as _getMapScale,
  getResolutionFromScale as _getResolutionFromScale,
  drawGraphic as _drawGraphic,
  deleteGraphic as _deleteGraphic,
  locateGraphic as _locateGraphic,
  zoomTo as _zoomTo,
  animate as _animate,
  transformPoint as _transformPoint,
  transformGeo as _transformGeo,
  setScale as _setScale,
  getCenterOfMass as _getCenter,
  addCrsToGeojson,
  filterLayer as _filterLayer,
  getFeatureById as _getFeatureById,
  updateFeatureById as _updateFeatureById,
  addTrail as _addTrail,
  nearestPointOnGeometry as _nearestPointOnGeometry
} from '../utils/olUtil';
import { registerProj } from './CustomProjection';
import GeoJSON from 'ol/format/GeoJSON';
import WKT from 'ol/format/WKT';
import { transformExtent, transform } from 'ol/proj';
import { getForViewAndSize } from 'ol/extent';
import { MultiPolygon } from 'ol/geom';
import BaseLayer from 'ol/layer/Base';
import {
  multiPolygon as turfMultiPolygon,
  polygon as turfPolygon
} from '@turf/helpers';
import union from '@turf/union';
import Event from 'ol/events/Event.js';

export const ShineMapEventType = {
  /**
   * 调用分屏功能后触发
   */
  AFTERADDMAPLINK: 'afterAddMapLink',
  /**
   * 分屏关闭后触发
   */
  AFTERREMOVEMAPLINK: 'afterRemoveMapLink'
};

export class MapLinkEvent extends Event {
  constructor(type, element) {
    super(type);
    this.element = element;
  }
}

class ShineMap extends Map {
  constructor(options) {
    super(options);
    // "选择"功能中选中的feature
    this._selectFeatures = [];
    // 选中图层，layerController.vue使用
    this._checkedLayers = [];
    // 联动地图
    this.linkMap = [];
    // 当前可编辑图层信息
    this._currentEditLayer = undefined;
    // 地图平移过程中是否使用动画（如调用panBy、panTo、setCenter、setZoomAndCenter等函数
    this.animateEnable = true;
    this.mapid = options.mapid;
    this.layerManager = new LayerManager(this);
    this.interactionManager = new InteractionManager(this);
    this.queryManager = QueryManager.getInstance(this);
    this.maskManager = MaskManager.getInstance(this.$map);
    this.transformProjection = options.transformProjection;
  }

  /**
   * 设置当前地图显示状态，值类型必须时布尔型；包括:
   * 1.地图平移过程中是否使用动画(animateEnable)
   * 2.地图是否可通过鼠标滚轮缩放浏览(mouseWheelZoomEnable)
   * 3.地图是否可通过双击鼠标放大地图(doubleClickZoomEnable)
   * 4.地图是否可通过鼠标拖拽平移(dragPanEnable)
   */
  setStatus(status) {
    Object.keys(status).forEach((key) => {
      if (typeof status[key] === 'boolean') {
        this[key] = status[key];
      }
      switch (key) {
        case 'mouseWheelZoomEnable': {
          const target = this.getInteractions()
            .getArray()
            .find((interaction) => interaction instanceof MouseWheelZoom);
          target?.setActive(status[key]);
          break;
        }
        case 'doubleClickZoomEnable': {
          const target = this.getInteractions()
            .getArray()
            .find((interaction) => interaction instanceof DoubleClickZoom);
          target?.setActive(status[key]);
          break;
        }
        case 'dragPanEnable': {
          const target = this.getInteractions()
            .getArray()
            .find((interaction) => interaction instanceof DragPan);
          target?.setActive(status[key]);
          break;
        }
      }
    });
  }

  /**
   * 交互的坐标系（传入的center坐标系以及导出图形的坐标系）
   */
  setTransformProjection(projection) {
    registerProj(projection);
    this.transformProjection = projection;
  }

  /**
   * 根据图层ID查找图层
   * @param {*} id
   */
  getLayerById(id) {
    let layer;
    const layers = this.getLayers().getArray();
    for (let i = 0; i < layers.length; i++) {
      const tempLayerId = layers[i].get('id');
      if (tempLayerId === id) {
        layer = layers[i];
        break;
      }
    }
    return layer;
  }

  /**
   * 根据图层layerTag查找图层
   * @param {*} layerTag
   */
  getLayerByLayerTag(layerTag) {
    let layer;
    const layers = this.getLayers().getArray();
    for (let i = 0; i < layers.length; i++) {
      const tempLayerTag = layers[i].get('layerTag');
      if (tempLayerTag === layerTag) {
        layer = layers[i];
        break;
      }
    }
    return layer;
  }

  clearSelectFeatures() {
    var selectArray = this.getSelectFeatures();
    let source = this.getLayerById('drawLayer').getSource();
    for (let select of selectArray) {
      source.removeFeature(select);
    }
    this._selectFeatures = [];
  }
  getSelectFeatures() {
    var selectArray = [];
    var graphicArray;
    const layers = this.getLayers().getArray();
    layers.forEach((layer) => {
      // 目前地图选中的要素在临时层上
      if (layer.get('id') === 'drawLayer') {
        graphicArray = layer.getSource().getFeatures();
        graphicArray.forEach((item) => {
          if (item.get('tempSelected') || item.get('isSelected')) {
            selectArray.push(item);
          }
        });
      }
    });
    return selectArray;
  }

  getSelectGeoJson(isTransform, outCrs) {
    var selectArray = this.getSelectFeatures();
    let options = {};
    if (isTransform) {
      // 若outCrs作为参数传入时，有坐标系为注册的可能
      if (outCrs) {
        // 坐标系不存在则注册,存在不操作
        registerProj(outCrs);
      }
      const inCrs = this.getView().getProjection().getCode();
      outCrs = outCrs || this.transformProjection;

      options = {
        dataProjection: outCrs,
        featureProjection: inCrs
      };
    }
    // 加上坐标系
    outCrs = outCrs || this.getView().getProjection().getCode();
    return addCrsToGeojson(
      new GeoJSON(options).writeFeatures(selectArray),
      outCrs
    );
  }

  getSelectWkt(isTransform, outCrs) {
    var selectArray = this.getSelectFeatures();
    let options = {};
    if (isTransform) {
      // 若outCrs作为参数传入时，有坐标系为注册的可能
      if (outCrs) {
        // 坐标系不存在则注册,存在不操作
        registerProj(outCrs);
      }
      const inCrs = this.getView().getProjection().getCode();
      outCrs = outCrs || this.transformProjection;

      options = {
        dataProjection: outCrs,
        featureProjection: inCrs
      };
    }
    let result = '';
    for (const selectFeature of selectArray) {
      result += new WKT(options).writeFeatures([selectFeature], options) + ';';
    }
    return result.substring(0, result.length - 1);
    // return new WKT(options).writeFeatures(selectArray, options)
  }

  setSelectFeatures(selectFeatures) {
    this._selectFeatures = selectFeatures;
  }

  getCheckedLayers() {
    return this._checkedLayers;
  }

  getCurrentEditLayer() {
    return this._currentEditLayer;
  }

  setCurrentEditLayer(currentEditLayer) {
    this._currentEditLayer = currentEditLayer;
  }

  clearCurrentEditLayer() {
    this._currentEditLayer = undefined;
  }

  linkWithMap(map) {
    map.setView(this.getView());
  }

  updateMapSize() {
    this.updateSize();
  }

  /**
   *
   * @param {查询表达} option
   * @example {}
   */
  search(option, callback) {
    const queryManager = QueryManager.getInstance(this);
    //queryManager是单例的话，同时连续执行多次会造成内部的全局参数被污染，2.0考虑重构QueryManager, 1.3.x临时解决方案
    let executeQueryManager = new QueryManager(this);
    executeQueryManager.setTocData(queryManager.tocData);
    executeQueryManager.search(option, callback);
    Bus.$emit('mapSearch', true);
  }

  // 找到图层并添加
  findLayer() {}

  // 根据geojson数据绘制图形并定位
  locateGeoJson(geojson) {
    return locateGeoJson(this, geojson, this.transformProjection);
  }

  // 根据geojson数据绘制图形
  addGeoJson(geojson) {
    return _addGeoJson(this, geojson, this.transformProjection);
  }
  flashFeatures(features, options) {
    _flashFeatures(this, features, options);
  }

  // 根据已经绘制的图形唯一字段进行匹配并定位
  locateTempGraphic(obj) {
    locateTempGraphic(this, obj);
  }

  // 获取当前地图的比例尺
  getMapScale() {
    return _getMapScale(this);
  }

  setMapScale(scale) {
    _setScale(this, scale);
  }

  // 根据指定的比例尺换算分辨率
  getResolutionFromScale(scale) {
    return _getResolutionFromScale(this, scale);
  }

  drawGraphic(options) {
    const crs = options.wktCRS ? options.wktCRS : this.transformProjection;
    options.wktCRS = crs;
    return _drawGraphic(this, options);
  }

  // 删除图形
  deleteGraphic(options) {
    return _deleteGraphic(this, options);
  }

  /* 定位图形 */
  locateGraphic(options) {
    return _locateGraphic(this, options);
  }

  /* 将地图缩放到XY坐标处，并设置缩放级别 */
  zoomTo(xy, zoom, inCrs) {
    // 若inCrs作为参数传入时，有坐标系为注册的可能
    if (inCrs) {
      // 坐标系不存在则注册,存在不操作
      registerProj(inCrs);
    }
    inCrs = inCrs || this.transformProjection;
    _zoomTo(this, inCrs, xy, zoom);
  }

  /**
   * 设置地图中心点
   * @param {*} center 中心点
   * @param {*} projection 坐标系
   */
  setCenter(center, projection) {
    let position = center;
    if (projection) {
      registerProj(projection);
      position = transform(
        position,
        projection,
        this.getView().getProjection()
      );
    }
    if (this.animateEnable) {
      this.getView().animate({
        center: position,
        duration: 2000
      });
    } else {
      this.getView().setCenter(position);
    }
  }

  /**
   * 设置地图层级
   * @param {*} zoom 地图层级
   */
  setZoom(zoom) {
    if (this.animateEnable) {
      this.getView().animate({
        zoom,
        duration: 2000
      });
    } else {
      this.getView().setZoom(zoom);
    }
  }

  /**
   * 设置地图中心点和层级
   * @param {*} zoom 地图层级
   * @param {*} center 中心点
   * @param {*} projection 坐标系
   */
  setZoomAndCenter(zoom, center, projection) {
    let position = center;
    if (projection) {
      registerProj(projection);
      position = transform(
        position,
        projection,
        this.getView().getProjection()
      );
    }
    if (this.animateEnable) {
      this.getView().animate({
        center: position,
        zoom: zoom,
        duration: 2000
      });
    } else {
      this.getView().setCenter(position);
      this.getView().setZoom(zoom);
    }
  }

  /* 将地图缩放到XY坐标处，并设置缩放级别 */
  animate(options) {
    // 若inCrs作为参数传入时，有坐标系为注册的可能
    if (options.inCrs) {
      // 坐标系不存在则注册,存在不操作
      registerProj(options.inCrs);
    }
    options.inCrs = options.inCrs ? options.inCrs : this.transformProjection;
    _animate(this, options);
  }

  /**
   * 转换geo坐标系
   * @param geo Array[feaure] or feature or geometry
   * @param inCrs 默认为底图坐标系
   * @param outCrs 默认为transformProjection
   * return 返回geoJson
   */
  transformGeo(geo, inCrs, outCrs) {
    // 若outCrs作为参数传入时，有坐标系为注册的可能
    if (outCrs) {
      // 坐标系不存在则注册,存在不操作
      registerProj(outCrs);
    }
    inCrs = inCrs || this.getView().getProjection().getCode();
    outCrs = outCrs || this.transformProjection; // 没有传入坐标坐标系则取transformProjection
    outCrs = outCrs || inCrs; // 还没有就用inCrs
    return _transformGeo(this, geo, inCrs, outCrs);
  }

  /**
   * 转换点坐标系
   * @param point
   * @param inCrs 默认为底图坐标系
   * @param outCrs 默认为transformProjection
   * return 返回geoJson
   */
  transformPoint(point, inCrs, outCrs) {
    // 若outCrs作为参数传入时，有坐标系为注册的可能
    if (outCrs) {
      // 坐标系不存在则注册,存在不操作
      registerProj(outCrs);
    }
    if (inCrs) {
      // 坐标系不存在则注册,存在不操作
      registerProj(inCrs);
    }
    inCrs = inCrs || this.getView().getProjection().getCode();
    outCrs = outCrs || this.transformProjection;
    return _transformPoint(this, point, inCrs, outCrs);
  }

  setLocate(options) {
    if (options) {
      if (!options.src) {
        options.src =
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAADN0lEQVRYR8WWTWwNURTH/+e+Sr15lIXGR1g3VERY0BmiFV+JBfHxpm0aIWzsfFYiEWUh8dGKnY02mkbfPBEWFlgg6ZuhGxJRiVhYEITYtH0zqt4cmeervDsz9z2L3uX7n/M/v3vOvfcNYZIXTXJ9lAWwMpNflhAJHfCbAKqD7y8obkCINwC/BMSDgl9wHjennqhuTBnAsLwzAB8CUB1jPgZQl20mj6tAKAEYlvsUwFIVw98xhOt2WkvH5cQCGFb+I0C1cUZSXQEiEsDIulkwdlZU/FdSDEQogGG5BwF0/VfxP8mHbFO7KPOSAqzo45rEFG+IgPmhAET3wP7Lok6iDswbwmIZeFsYT9YPttHwvzFSgAZrdKOAuBNq6PMppyXVMVHXLe8kgf/6baLuw9/0yJx2VwlA7893kKCTUgBGu92snZdpRsY9CsI5mcYS6GLzpEZZrwfMu2WaoET9QLr6hUxbnR1b5HNhSA7OV+zm1D6lDhhZ9wEYjSVGREN2Ork46mAaWe85mOtLC9HdnJncpASgW+41AlokhbyRseHaZ7vm5GUQS3o/pKZX13wCkJQUyuRMrcRTOgLdci8QcFg6S+CYY2rSOeuW207A2ZC8TsfUjih1oMHKbxWgm2GtFlXJeQPb6f1EffUNnut/896F5RBhWy6tlXhKO7Chl1P5au8tgJlRV1EIKr4Dvs91obcmOOkMJ9esGTKvqJcweLkORB04dY1222byalkAK/o+11RNSd4HsFy9UGkkg7sdM7U3dDRR5nr2y2Zi/3alAEx4VfiKtYNtWjBO6Yr9O15luWcZaK8EgoDWnKn1R+XGAjT2vJ46rs0ORtFQHgRfts3U/ricWIDAwMh+WQ/278WZ/daZh4TQmgbSFDxKkUsJoAhx3TsNn0/EGQY6AzscU7uhEqsMgI4OoS9sv0/AmihjJlxy0pry9VUHCLqQcVcy8R0CzQg50oMYya+399aOqOw+iCkLIEjQM6N7iES3pECB/MK6XMv0h6rFKwIIkmRXk4AjOVPrLKd4xQA/boZ7C4wtPw9dv2NqreUW/y+AxmvDs8YTVT++G0fzTeXMfSJo2Wegkl1G5Uw6wHeXphEwQy3ECAAAAABJRU5ErkJggg==';
      }
      options.id = options.id ? options.id : 'locate-marker';
      this.addMarker(options);
    }
  }

  /**
   * @param options
   * {point,inCrs,id,src,isLocate,size,rotation,zoom}
   */
  addMarker(options) {
    options = JSON.parse(JSON.stringify(options));
    if (options) {
      const point = options.point;
      const inCrs = options.inCrs;
      const mapPoint = this.transformPoint(
        point,
        inCrs,
        this.getView().getProjection().getCode()
      );
      options.point = mapPoint;
      _addMarker(this, options);
      // 闪烁
      if (options.flashSrc) {
        this.flashMarker(options);
      }
      if (options.isLocate) {
        this.animate({
          center: mapPoint,
          zoom: options.zoom,
          inCrs: inCrs
        });
      }
    }
  }

  flashMarker(options) {
    // 对上个Marker进行清除闪烁以及选中效果
    if (this.lastMarkerOptions) {
      clearInterval(this.markerFlashTimer);
      if (getMarkerById(this, this.lastMarkerOptions.id)) {
        _addMarker(this, this.lastMarkerOptions);
      }
    }

    // 对本次Marker处理
    options = JSON.parse(JSON.stringify(options));
    this.lastMarkerOptions = JSON.parse(JSON.stringify(options));
    const normalSrc = options.src;
    const flashCount = options.flashCount ? options.flashCount * 2 : 8;
    let n = 0;
    this.markerFlashTimer = setInterval(() => {
      if (n < flashCount) {
        if (n % 2 === 0) {
          options.src = options.flashSrc;
        } else {
          options.src = normalSrc;
        }
        n++;
      } else {
        options.src = options.flashSrc;
        clearInterval(this.markerFlashTimer);
      }
      _addMarker(this, options);
    }, 300);
  }

  /**
   * @param options
   * {inCrs,data,isLocate}
   */
  addMarkers(options) {
    if (options && options.data && options.data.length > 0) {
      for (const item of options.data) {
        item.inCrs = options.inCrs;
        this.addMarker(item);
      }
      if (options.isLocate) {
        let minX = 65565;
        let minY = 65565;
        let maxX = 0;
        let maxY = 0;
        for (const item of options.data) {
          const point = item.point;
          minX = Math.min(minX, point[0]);
          maxX = Math.max(maxX, point[0]);
          minY = Math.min(minY, point[1]);
          maxY = Math.max(maxY, point[1]);
        }
        let extent = [minX, minY, maxX, maxY];
        if (options.inCrs) {
          // 坐标系不存在则注册,存在不操作
          registerProj(options.inCrs);
          extent = transformExtent(
            extent,
            options.inCrs,
            this.getView().getProjection().getCode()
          );
        }
        this.getView().fit(extent, this.getSize());
      }
    }
  }

  removeMarker(id) {
    const layerSource = this.getLayerById('locateLayer').getSource();
    const markerFeature = layerSource.getFeatureById(id);
    layerSource.removeFeature(markerFeature);
  }

  clearMarker() {
    if (this.markerFlashTimer) {
      clearInterval(this.markerFlashTimer);
    }
    const layerSource = this.getLayerById('locateLayer').getSource();
    layerSource.clear();
  }

  markerClick(callback, offset) {
    const layerSource = this.getLayerById('locateLayer').getSource();
    this.on('click', (event) => {
      const coordinate = this.getCoordinateFromPixel(event.pixel);
      const size = offset || 36;
      var GETFEATUREINFO_IMAGE_SIZE = [size, size];
      var extent = getForViewAndSize(
        coordinate,
        this.getView().getResolution(),
        0,
        GETFEATUREINFO_IMAGE_SIZE
      );
      /* var inputgeo = new Polygon([[ [extent[0], extent[1]],
                [extent[0], extent[3]], [extent[2], extent[3]], [extent[2], extent[1]],
                [extent[0], extent[1]] ]]); */
      const features = layerSource.getFeaturesInExtent(extent);
      callback(features);
    });
  }

  getExtent() {
    const leftTop = this.getCoordinateFromPixel([0, 0]);
    const rightBottom = this.getCoordinateFromPixel(this.getSize());
    return [leftTop[0], rightBottom[1], rightBottom[0], leftTop[1]];
  }

  filterLayer(id, where) {
    _filterLayer(this, id, where);
  }

  getCenter(geometry) {
    return _getCenter(geometry);
  }

  refresh() {
    let mapResolution = this.getView().getResolution();
    this.getView().setResolution(mapResolution - 0.00000000001);
    this.getView().setResolution(mapResolution);
  }

  parseWktArray(wktArray, inCrs) {
    const wktFormat = new WKT();
    const features = [];
    for (const wkt of wktArray) {
      const feature = wktFormat.readFeature(wkt);
      features.push(feature);
    }
    let geojson = new GeoJSON().writeFeatures(features);
    if (inCrs) {
      geojson = addCrsToGeojson(geojson, inCrs);
    }
    return geojson;
  }

  unionFeature(features) {
    let result;
    features.forEach((element) => {
      const geo = element.getGeometry();
      const coord = geo.getCoordinates();
      let py = null;
      if (geo instanceof MultiPolygon) {
        py = turfMultiPolygon(coord);
      } else {
        py = turfPolygon(coord);
      }
      if (!result) {
        result = py;
      } else {
        result = union(result, py);
      }
    });
    return new GeoJSON().readFeature(result.geometry);
  }

  getFeatureByWkt(wkt, inCrs) {
    const wktFormat = new WKT();
    let options;
    if (inCrs) {
      registerProj(inCrs);
      options = {
        dataProjection: inCrs,
        featureProjection: this.getView().getProjection().getCode()
      };
    }
    return wktFormat.readFeature(wkt, options);
  }

  unionFeatureFromWktArray(wktArray, inCrs) {
    if (wktArray && wktArray.length > 0) {
      const features = [];
      for (const wkt of wktArray) {
        features.push(this.getFeatureByWkt(wkt, inCrs));
      }
      return this.unionFeature(features);
    }
  }

  parseWkt(wkt, inCrs) {
    const wktFormat = new WKT();
    const feature = wktFormat.readFeature(wkt);
    let geojson = new GeoJSON().writeFeature(feature);
    if (inCrs) {
      geojson = addCrsToGeojson(geojson, inCrs);
    }
    return geojson;
    // return WktParser.parse(wkt)
  }

  convertWkt(geojson) {
    if (!geojson.type) {
      geojson = JSON.parse(geojson);
    }
    const features = new GeoJSON().readFeatures(geojson);
    const wktFormat = new WKT();
    const wktArray = [];
    for (const feature of features) {
      const wkt = wktFormat.writeFeature(feature);
      wktArray.push(wkt);
    }

    const geoJsonCrs = geojson.crs;
    let inCrs;
    if (geoJsonCrs) {
      inCrs = geoJsonCrs.properties.name
        .replace('urn:ogc:def:crs:', '')
        .replace('::', ':');
    }
    return {
      wkt: wktArray,
      inCrs: inCrs
    };
  }

  //国土需要 直接拷了二维的代码 有空再优化
  writeFeatureToWkt(feature, outCrs) {
    let options = {};
    if (outCrs) {
      //坐标系不存在则注册,存在不操作
      registerProj(outCrs);
      let inCrs = this.getView().getProjection().getCode();
      options = {
        dataProjection: outCrs,
        featureProjection: inCrs
      };
    }
    if (feature instanceof Array) {
      return new WKT(options).writeFeatures(feature, options);
    } else {
      return new WKT(options).writeFeature(feature, options);
    }
  }

  getFeatureById(id) {
    return _getFeatureById(this, id);
  }

  updateFeatureById(options) {
    return _updateFeatureById(this, options);
  }

  clearTempFeature() {
    const drawLayer = this.getLayerById('drawLayer');
    if (drawLayer) {
      drawLayer.getSource().clear();
    }
    const popTempLayer = this.getLayerById('popTempLayer');
    if (popTempLayer) {
      popTempLayer.getSource().clear();
    }
  }

  nearestPointOnGeometry(point, geometry) {
    return _nearestPointOnGeometry(point, geometry);
  }

  // 添加轨迹
  addTrail(options) {
    _addTrail(this, options);
  }

  // 全图组件对外开放方法
  getFullFigure() {
    const fullConfig = this.initFullFigureConfig();
    let CoordinateArr = [];
    let layerName = '';
    if (fullConfig.isShow) {
      // 固定值
      CoordinateArr[0] = fullConfig.minCoordinateX;
      CoordinateArr[1] = fullConfig.minCoordinateY;
      CoordinateArr[2] = fullConfig.maxCoordinateX;
      CoordinateArr[3] = fullConfig.maxCoordinateY;
    } else {
      // 图层
      layerName = fullConfig.layerName;
      const layerArr = this.getLayers().getArray();
      for (const layer of layerArr) {
        if (layer.values_.layerTag === layerName) {
          CoordinateArr = layer.values_.initExtent;
        }
      }
    }
    this.getView().fit(CoordinateArr, this.getSize());
  }

  // 清楚遮罩
  clearConver() {
    this.maskManager.clear();
  }
  // 添加遮罩
  addConver(options) {
    this.maskManager.addMask(options);
  }

  addLayer(data) {
    if (data instanceof BaseLayer) {
      super.addLayer(data);
    } else {
      this.layerManager.addLayer(data);
    }
  }

  removeLayer(data) {
    if (data instanceof BaseLayer) {
      super.removeLayer(data);
    } else {
      this.layerManager.removeLayer(data);
    }
  }

  /*
   * 根据layerid设置图层叠加顺序
   * */
  setLayerIndex(layerid, index) {
    this.layerManager.setLayerIndex(layerid, index);
  }

  /*
   * 根据layerid设置图层置顶
   * */
  setLayerTop(layerid) {
    this.layerManager.setLayerTop(layerid);
  }

  /*
   * 根据layerid设置图层透明度
   * */
  setLayerOpacity(layerid, opacity) {
    this.layerManager.setLayerOpacity(layerid, opacity);
  }

  /*
   * 新增图层 可以通过layerFilter过滤
   * {layerTag,layerFilter}
   * */
  addTargetLayer(options) {
    const layerid = options.layerTag;
    const filter = options.layerFilter;
    let data = this.layerManager.getLayerDataById(layerid);
    if (!data) {
      data = this.layerManager.getLayerDataByLayerTag(layerid);
    }
    if (data) {
      data.filter = filter;
      data = JSON.parse(JSON.stringify(data));
      // 设置isFit为isZoom,控制是否缩放
      data.isFit = !!options.isZoom;
      Bus.$emit('setLayerChecked', data, true, null, this.mapid);
    }
  }
  registerProj(inCrs) {
    registerProj(inCrs);
  }
}

export default ShineMap;
