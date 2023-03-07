import Bus from '../utils/bus';
import $ from 'jquery';
import { getCenter, extend } from 'ol/extent';
import QueryTask from './GeoServerTasks/QueryTask';
import Query from './EsriTasks/Query';
import {
  Point,
  LineString,
  LinearRing,
  Polygon,
  MultiPoint,
  MultiLineString,
  MultiPolygon
} from 'ol/geom';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Text from 'ol/style/Text';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle';
import { transform } from 'ol/proj.js';
import QueryParameters from './GeoServerTasks/QueryParameters';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';
import { getMapScale, getResolutionFromScale } from '../utils/olUtil';
import { setIntervalCount } from '../utils/common';

/**
 * OpenGIS中的图层查询控制类
 *   a)目前支持对geoserver图层WFS、WMS和feature服务的这类矢量图层(VectorLayer)做查询定位；
 *   b)Wfs服务在发布时，避免服务名称用中文或者含有中文，会导致无法在平台注册。
 */
class QueryManager {
  constructor(map) {
    this.map = map;
    this.mapid = map.mapid;
    // 所有图层配置数据
    this.tocData = [];
    this.transform = transform;
    // 查询定位后,自定义渲染的feature;
    this.customFeatues = [];
    this.parames = new QueryParameters();
    this.mapSource = this.map.getLayerById('drawLayer');
  }

  static getInstance(map) {
    if (!QueryManager.instanceMap) {
      QueryManager.instanceMap = new Map();
    }
    let id = map.mapid;
    if (!QueryManager.instanceMap.get(id)) {
      let instance = new QueryManager(map);
      QueryManager.instanceMap.set(id, instance);
    }
    return QueryManager.instanceMap.get(id);
  }

  setMap(map) {
    this.map = map;
  }

  /**
   * 图层配置信息
   * @param {图层配置信息数据} tocConfigData
   */
  setTocData(tocConfigData) {
    this.tocData = this.tocData.concat(tocConfigData);
  }

  /**
   * 查询图层信息
   * @param {查询参数配置} option
   */
  search(option, callback) {
    let self = this;
    self.callback = callback;
    self.clickObj = {};
    self.tableName = ''; // 定义geoserver服务的表名
    self.isStopFlashHlight = false;
    self.isLocate = true;
    let loaded = true;
    if (!option.isStayFeature) {
      this.mapSource.getSource().clear();
    }
    if (option.express) {
      try {
        option.express = decodeURIComponent(option.express);
      } catch (e) {
        console.warn(e);
      }
    }
    if (!option.tag || !option.express) {
      alert('缺少图层标识或者查询条件');
    }
    self.optionStyle = option.flashStyle;
    // 根据图层标识筛选图层(当前地图已经加载的图层) 所以图层应该都在layerManager.getCheckedLayers里面
    self.mapLayers = self.map.layerManager.getCheckedLayers();
    let searchLayer = $.grep(self.mapLayers, function (item) {
      return item.layerTag === option.tag;
    });
    // 获取底图容器中选择的图层
    /*if (searchLayer.length < 1 && self.map.getInitLayer) {
      let initLayer = self.map.getInitLayer();
      searchLayer = $.grep(initLayer, (item) => {
        return item.layerTag === option.tag;
      });
    }*/
    // 当前地图未加载该图层,则判断图层配置数据中有没有这个图层
    if (searchLayer.length < 1) {
      loaded = false;
      if (this.tocData && this.tocData.length > 0) {
        searchLayer = [];
        for (let tree of this.tocData) {
          if (tree.children && tree.children.length > 0) {
            let result = this.queryTocData(tree, 'layerTag', option.tag);
            if (result) {
              searchLayer.push(result);
            }
          } else if (tree.url && tree.url !== '') {
            if (tree.layerTag === option.tag) {
              searchLayer.push(tree);
            }
          }
        }
      }
    }
    self.searchAndLocate(searchLayer, option, loaded);
  }

  /**
   * 查询定位的查询地址处理
   * @param {*} searchLayer
   * @param {*} option
   * @param {是否已经选中} isCkecked
   */
  searchAndLocate(searchLayer, option, loaded) {
    let self = this;
    if (searchLayer.length > 0) {
      let lyr = searchLayer[0];
      self.layerTag = lyr.layerTag;
      // option table的优先级高于layerTable
      if (lyr.layerTable && lyr.layerTable !== '') {
        option.table = option.table ? option.table : lyr.layerTable;
      }
      self.isStopFlashHlight = option.isStopFlashHlight;
      if (option.isLocate !== undefined) {
        self.isLocate = option.isLocate;
      }
      self.option = option;
      self.label = lyr.label; // 图层名称
      // 把获取到的图层添加到地图上
      let isAddLayer = option.isAddLayer === undefined;
      let loadingTime = 0;
      if (!loaded && isAddLayer) {
        Bus.$emit('setLayerChecked', lyr.id, true, null, this.map.mapid);
        loadingTime = 500;
      }
      // 过滤图层
      let timer = setIntervalCount(
        () => {
          if (option.filter === true) {
            // 如果是过滤图形，就执行过滤操作
            let targetMapLayer = $.grep(
              self.map.getLayers().getArray(),
              function (item) {
                return item.get('id') === lyr.id;
              }
            );
            if (targetMapLayer && targetMapLayer.length > 0) {
              clearInterval(timer);
              targetMapLayer[0].getSource().updateParams({
                /* 'LAYERS': option.table,*/
                cql_filter: option.express
              });
            }
          } else {
            clearInterval(timer);
          }
        },
        loadingTime,
        10
      );
      // 查询
      setTimeout(() => {
        let type = lyr.type; // 图层类型
        self.customFeatues = []; // 查询定位后,自定义渲染的feature;
        if (
          type.indexOf('geoserver') !== -1 ||
          lyr.url.indexOf('geoserver') !== -1
        ) {
          if (!option.table) {
            self.queryCallback(false, lyr.label + ':请配置数据源');
          }
          // geoserver服务查询定位处理
          // self.tableName = (option.table ? option.tableName : lyr.layerTable).toLowerCase()
          self.tableName = option.table;
          self._geoserverHandle(lyr, option);
        } else if (
          type.indexOf('dynamic') !== -1 ||
          lyr.url.indexOf('arcgis') !== -1
        ) {
          self._arcgisServerHandle(lyr, option);
        }
      }, loadingTime);
      Bus.$emit('mapSearch', false);
    } else {
      alert('找不到定位图层!');
    }
  }

  /**
   * 查询定位的查询地址处理
   * @param {*} searchLayer
   * @param {*} option
   * return promise
   */
  searchFromLayer(lyr, option) {
    let self = this;
    if (lyr.layerTable && lyr.layerTable !== '') {
      option.table = lyr.layerTable;
    }
    self.label = lyr.label; // 图层名称
    let type = lyr.type; // 图层类型
    if (
      type.indexOf('geoserver') !== -1 ||
      lyr.url.indexOf('geoserver') !== -1
    ) {
      // geoserver服务查询定位处理
      // self.tableName = (option.table ? option.tableName : lyr.layerTable).toLowerCase()
      if (!option.table) {
        self.queryCallback(false, lyr.label + ':请配置数据源');
      }
      self.tableName = option.table;
      self._geoserverHandle(lyr, option);
    } else if (
      type.indexOf('dynamic') !== -1 ||
      lyr.url.indexOf('arcgis') !== -1
    ) {
      self._arcgisServerHandle(lyr, option);
    }
  }

  /**
   * 返回geoserver服务查询处理的promise
   * @param {*} lyr
   * @param {*} option
   */
  _geoserverQueryPromise(lyr, option) {
    let self = this;
    // 获取geoserver服务的可见图层
    let visibleLayers = lyr.visibleLayers;
    if (visibleLayers.length < 1) {
      alert('未配置可见图层');
      return;
    }
    self.parames.where = option.express.trim();
    if (option.table) {
      if (option.table.split(':').length === 1) {
        var tableSpace;
        if (lyr.visibleLayers[0].split(':').length > 1) {
          tableSpace = lyr.visibleLayers[0].split(':')[0];
        } else {
          let urlSplits = lyr.url.split('/');
          tableSpace = urlSplits[urlSplits.length - 2];
        }
        self.parames.tableName = tableSpace + ':' + option.table;
      } else {
        self.parames.tableName = option.table;
      }
    }
    self.parames.srsName = self.map.getView().getProjection().getCode();
    self.parames.token = option.token;
    let query = new QueryTask(lyr);
    query.execute(self.parames).then(function (response) {
      response = response.headers ? response.data : response;
      if (response && response.features && response.features.length > 0) {
        self._geoserverResponse(response, option.popTag, option);
      } else {
        self.queryCallback(false, '地图定位未查询到数据');
      }
    });
  }

  _geoserverHandle(lyr, option) {
    let self = this;
    // 获取geoserver服务的可见图层
    let visibleLayers = lyr.visibleLayers;
    if (visibleLayers.length < 1) {
      alert('未配置可见图层');
      return;
    }
    self.parames.where = option.express.trim();
    if (option.table) {
      if (option.table.split(':').length === 1) {
        var tableSpace;
        if (lyr.visibleLayers[0].split(':').length > 1) {
          tableSpace = lyr.visibleLayers[0].split(':')[0];
        } else {
          let urlSplits = lyr.url.split('/');
          tableSpace = urlSplits[urlSplits.length - 2];
        }

        self.parames.tableName = tableSpace + ':' + option.table;
      } else {
        self.parames.tableName = option.table;
      }
    }
    self.parames.srsName = self.map.getView().getProjection().getCode();
    self.parames.propertyName = option.propertyName;
    self.parames.token = option.token;
    let query = new QueryTask(lyr);
    query.execute(self.parames).then(function (response) {
      response = response.headers ? response.data : response;
      if (response && response.features && response.features.length > 0) {
        self._geoserverResponse(response, option.popTag, option);
      } else {
        self.queryCallback(false, '地图定位未查询到数据');
      }
    });
  }

  /**
   * geoserver服务的查询结果处理
   * @param {*} response
   */
  _geoserverResponse(response, popupTag, option) {
    let self = this;
    if (response && response.features && response.features.length > 0) {
      let features = response.features;

      let featureArrays = [];
      let finalExtent = null;
      let geoType = '';
      if (option.propertyName) {
        featureArrays = features;
        self.queryCallback(true, featureArrays, true);
      } else if (features.length > 0) {
        for (let i = 0; i < features.length; i++) {
          let geometry = features[i].geometry;
          let type = geometry.type;
          let newPolygon = null;
          let newCoordinates = [];
          let newCoordinate = [];
          if (type === 'Point') {
            newCoordinates = geometry.coordinates;
          } else if (type === 'MultiPoint') {
            newCoordinates = geometry.coordinates;
          } else if (type === 'MultiPolygon') {
            for (let i = 0; i < geometry.coordinates.length; i++) {
              for (let j = 0; j < geometry.coordinates[i].length; j++) {
                let validCoordinates = $.grep(
                  geometry.coordinates[i][j],
                  function (item) {
                    return item[0] > 0 && item[1] > 0;
                  }
                );
                newCoordinate = [validCoordinates];
                newCoordinates.push(newCoordinate);
              }
            }
          } else {
            newCoordinates = geometry.coordinates;
          }
          geoType = type;
          // 创建当前地图需要渲染的geometry
          if (type === 'MultiPolygon') {
            newPolygon = new MultiPolygon(newCoordinates);
          } else if (type === 'Polygon') {
            newPolygon = new Polygon(newCoordinates);
          } else if (type === 'LineString') {
            newPolygon = new LineString(newCoordinates);
          } else if (type === 'MultiLineString') {
            newPolygon = new MultiLineString(newCoordinates);
          } else if (type === 'Point') {
            newPolygon = new Point(newCoordinates);
          } else if (type === 'MultiPoint') {
            newPolygon = new MultiPoint(newCoordinates);
          } else if (type === 'GeometryCollection') {
            newPolygon = new GeoJSON().readGeometryFromObject(geometry);
          }

          let feature = new Feature(newPolygon);
          feature.setProperties(features[i].properties);
          feature.set('isSelected', true);
          feature.set('isQuery', true);
          feature.set('layerTag', self.layerTag);
          feature.set('id', features[i].properties.id);
          self.flashGeometry(feature);
          // this.mapSource.getSource().addFeature(feature);
          featureArrays.push(feature);
          if (finalExtent === null) {
            if (type !== 'Point' && type !== 'MultiPoint') {
              finalExtent = newPolygon.getExtent();
            }
          } else {
            if (type !== 'Point' && type !== 'MultiPoint') {
              finalExtent = extend(finalExtent, newPolygon.getExtent());
            }
          }
          // 获取当前图形的最大最小坐标数组
          // coordiVertexArr = coordiVertexArr.concat(self._getMultiPolygonArr(newPolygon, id, properties))
        }
        // 定位到当前所有图形所在的位置
        // self._loacteCurrentGraphical(coordiVertexArr)
        if (geoType !== 'Point' && geoType !== 'MultiPoint') {
          let resolution =
            self.map.getView().getResolutionForExtent(finalExtent) * 2;
          this.animateMap(getCenter(finalExtent), resolution);
        } else {
          let ptArray = [];
          for (let feature of features) {
            let pt = feature.geometry.coordinates;
            if (feature.geometry.type === 'MultiPoint') {
              pt = pt[0];
            }
            ptArray.push(pt);

            if (option.drawBuffer === true) {
              // eslint-disable-next-line no-undef
              const parser = new jsts.io.OL3Parser();
              parser.inject(
                Point,
                LineString,
                LinearRing,
                Polygon,
                MultiPoint,
                MultiLineString,
                MultiPolygon
              );
              let bufferFeature = new Feature();
              let bufferPoint = new Point([pt[0], pt[1]]);
              const jstsGeom = parser.read(bufferPoint);
              let project = self.map.getView().getProjection();
              let mapUnit = project.getUnits();
              // eslint-disable-next-line no-undef
              const bo = new jsts.operation.buffer.BufferOp(jstsGeom);
              let width = parseInt(option.bufferWidth, 10);
              if (mapUnit.toString() === 'degrees') {
                width = (width / (2 * Math.PI * 6371004)) * 360;
              }
              const buffered = bo.getResultGeometry(width);
              bufferFeature.setGeometry(parser.write(buffered));
              self.map
                .getLayerById('drawLayer')
                .getSource()
                .addFeatures([bufferFeature]);
            }
          }
          if (ptArray.length === 1) {
            let resolution = self.map
              .getView()
              .getResolutionForZoom(self.map.getView().getMaxZoom() - 3);
            this.animateMap(ptArray[0], resolution);
          } else {
            let finalExtent = new MultiPoint(ptArray).getExtent();
            let resolution =
              self.map.getView().getResolutionForExtent(finalExtent) * 2;
            this.animateMap(getCenter(finalExtent), resolution);
          }
        }
        // 回调success
        self.queryCallback(true, featureArrays);
      }
    } else {
      self.queryCallback(false, '地图定位未查询到数据');
    }
  }

  /**
   * 多个地块查询定位时(单个点的缓冲区),定位到当前所有图形
   * @param {*} coordiVertexArr
   */
  _loacteCurrentGraphical(coordiVertexArr) {
    let self = this;
    if (!self.isLocate) {
      return;
    }
    if (!coordiVertexArr || coordiVertexArr.length === 0) {
      self.queryCallback(false, '地图定位未查询到数据');
      return;
    }
    // 对坐标顶点数组处理,获取最大最小值(从所有图形中筛选出来的顶点)
    let maxMinXY = self._getMaxMinXY(coordiVertexArr);
    if (maxMinXY.maxX === maxMinXY.minX && maxMinXY.maxY === maxMinXY.minY) {
      maxMinXY = self._setPointBuffer([maxMinXY.maxX, maxMinXY.maxY], 8000);
    }
    // 自定义一个涵盖当前所有图形的多边形,设置坐标数组
    let coordinates = [];
    coordinates.push([maxMinXY.maxX, maxMinXY.maxY]);
    coordinates.push([maxMinXY.maxX, maxMinXY.minY]);
    coordinates.push([maxMinXY.minX, maxMinXY.maxY]);
    coordinates.push([maxMinXY.minX, maxMinXY.minY]);
    coordinates.push([maxMinXY.maxX, maxMinXY.maxY]);
    // 创建包含所有图形的一个多边形
    let allPolygon = new Polygon([coordinates]);
    // sizeArr = [self.map.getSize()[0] * 0.8, self.map.getSize()[1] * 0.8];

    let resolution =
      self.map.getView().getResolutionForExtent(allPolygon.getExtent()) * 2;

    this.animateMap(this._getAnchorOrigin(allPolygon), resolution);
    // self.map.getView().fit(allPolygon, {
    //     size: sizeArr
    // });
  }

  /**
   * 根据option设置项，获取最小外接矩形角点作为屏幕中点，默认使用中心点
   * @param {*} polygon
   * type Geometry
   */
  _getAnchorOrigin(polygon) {
    let self = this;
    let extent = polygon.getExtent();
    let center = getCenter(extent);
    // anchorOrigin  根据最小外接矩形角点作为屏幕中点
    if (self.option.anchorOrigin) {
      switch (self.option.anchorOrigin) {
        case 'top-left': {
          center = [extent[0], extent[3]];
          break;
        }
        case 'top-right': {
          center = [extent[2], extent[3]];
          break;
        }
        case 'bottom-left': {
          center = [extent[0], extent[1]];
          break;
        }
        case 'bottom-right': {
          center = [extent[2], extent[1]];
          break;
        }
        default: {
          break;
        }
      }
    }
    return center;
  }

  /**
   * 自定义点的缓冲区
   * @param {*} value
   */
  _setPointBuffer(pointCoordArr, value) {
    let self = this;
    // 获取SpatialReference
    let spatialReference = self.map.getView().getProjection().getCode();

    let defaultSpatialReference = 'EPSG:3857';
    let maxMinXY = []; // 综合点
    let maxXY = []; // 最大值
    let minXY = []; // 最小值
    let getNewPointArr = self.transform(
      pointCoordArr,
      spatialReference,
      defaultSpatialReference
    );
    // 最大值
    maxXY.push(getNewPointArr[0] + value);
    maxXY.push(getNewPointArr[1] + value);
    // 最小值
    minXY.push(getNewPointArr[0] - value);
    minXY.push(getNewPointArr[1] - value);
    // 坐标转换
    let bufferCoord1 = self.transform(
      maxXY,
      defaultSpatialReference,
      spatialReference
    );
    let bufferCoord2 = self.transform(
      minXY,
      defaultSpatialReference,
      spatialReference
    );
    maxMinXY = maxMinXY.concat(bufferCoord1).concat(bufferCoord2);
    let arr = {};
    // 按照[X,Y,X,Y...]顺序存放
    arr.maxX = maxMinXY[0];
    arr.maxY = maxMinXY[1];
    arr.minX = maxMinXY[2];
    arr.minY = maxMinXY[3];
    return arr;
  }

  /**
   * 获取当前图形的最大最小坐标数组(多图形)
   * @param {新创建的渲染图形} currentGeometry
   * @param {图形属性} properties
   */
  _getMultiPolygonArr(currentGeometry, id, properties) {
    let self = this;
    let coordiVertexArr = [];
    let curFeature = new Feature({
      geometry: currentGeometry,
      id: id,
      isQuery: true,
      layerTag: self.layerTag
    });
    // this.mapSource.getSource().addFeature(curFeature);
    self.flashGeometry(curFeature);

    // 添加自定义的feature
    self.customFeatues.push(curFeature);
    // 获取当前图形的最大/最小值,放入数组
    let arr = self._coordVerteHandle(currentGeometry);
    coordiVertexArr = coordiVertexArr.concat(arr);
    let pointXYArr = [];
    pointXYArr.push((arr[0] + arr[2]) / 2);
    pointXYArr.push((arr[1] + arr[3]) / 2);
    let iconFeature = self._setSymbol(pointXYArr, id);
    // 设置查询定位后的图形属性
    self.clickObj[curFeature.olUid] = {
      label: self.label,
      newGeometry: currentGeometry,
      id: id,
      properties: properties,
      iconFeature: iconFeature,
      centerPoint: pointXYArr
    };
    if (
      currentGeometry instanceof Polygon ||
      currentGeometry instanceof MultiPolygon
    ) {
      self.mapSource.getSource().addFeature(iconFeature);
      // 添加自定义的feature
      self.customFeatues.push(iconFeature);
    }
    return coordiVertexArr;
  }

  // 定位闪烁
  featureFlash(curFeature, fillColor, strokeColor) {
    this.mapSource.getSource().addFeature(curFeature);
    if (this.optionStyle && this.optionStyle.fillColor) {
      fillColor = this.optionStyle.fillColor;
    }
    if (this.optionStyle && this.optionStyle.strokeColor) {
      strokeColor = this.optionStyle.strokeColor;
    }
    let self = this;
    let i = 0;
    let queryStyle = new Style({
      fill: new Fill({
        color: 'rgba(0,0,0,0)'
      }),
      stroke: ''
    });
    let Hide = function () {
      curFeature.setStyle(queryStyle);
      setTimeout(Show, 300);
    };
    let Show = function () {
      let type = curFeature.getGeometry();
      if (type instanceof Point) {
        curFeature.setStyle(self._getStyle(fillColor, strokeColor, i * 2 + 3));
      } else {
        curFeature.setStyle(self._getStyle(fillColor, strokeColor));
      }
      i++;
      if (i < 4) {
        setTimeout(Hide, 300);
      } else if (!self.option.isShow) {
        curFeature.setStyle(queryStyle);
        self.mapSource.getSource().removeFeature(curFeature);
      }
    };
    Hide();
  }

  /**
   * 自定义渲染样式
   */
  _getStyle(fcolor, scolor, size) {
    let fillColor = [255, 0, 0, 0.0];
    let strokeColor = [255, 0, 0, 0.3];
    let radius = 5;
    if (fcolor) {
      fillColor = fcolor;
    }
    if (scolor) {
      strokeColor = scolor;
    }
    if (size) {
      radius = size;
    }
    let fill = new Fill({
      color: fillColor
    });
    let stroke = new Stroke({
      color: strokeColor,
      width: 2
    });
    let queryStyle = new Style({
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

  /**
   * 设置定位点的样式
   * @param {*} pointXYArr
   * @param {*} id
   */
  _setSymbol(pointXYArr, id) {
    let self = this;
    let point = new Point(pointXYArr); // 创建点要素
    let pointFeature = new Feature({
      geometry: point,
      id: id,
      isQuery: true,
      layerTag: self.layerTag
    });
    // 为点要素添加样式
    pointFeature.setStyle(self.setIcon(id));
    return pointFeature;
  }

  /**
   * 地图点击事件
   */
  _mapClick() {
    let self = this;
    self.clickObj = {};
    self.map.on('click', function (evt) {
      // 是否显示弹框
      let popTag = false;
      if (popTag) {
        let pixel = self.map.getEventPixel(evt.originalEvent);
        let features = self.map.getFeaturesAtPixel(pixel); // 判断当前单击处是否有要素，捕获到要素时弹出popup
        if (features) {
          for (let i = 0; i < features.length; i++) {
            let feature = features[i];
            // 判断当前单击处是否有要素，捕获到要素时弹出popup
            let olUid = feature.olUid;
            let obj = self.clickObj[olUid];
            if (obj) {
              self.label = obj.label;
              self.setOverLay(obj);
              break;
            }
          }
        }
      }
    });
  }

  setIcon(id) {
    return new Style({
      // 把点的样式换成ICON图标
      image: new Icon({
        anchor: [0.5, 0.1], // 控制标注图片和文字之间的距离
        anchorOrigin: 'bottom-left', // 标注样式的起点位置
        anchorXUnits: 'fraction', // X方向单位：分数
        anchorYUnits: 'fraction', // Y方向单位：像素
        offsetOrigin: 'top-right', // 偏移起点位置的方向
        opacity: 0.75, // 透明度
        src: 'images/location.png' // 图片路径
      }),
      // 文本样式
      text: new Text({
        textAlign: 'center', // 对齐方式
        offsetX: 0,
        offsetY: -16,
        textBaseline: 'middle', // 文本基线
        font: 'normal 12px 微软雅黑', // 字体样式
        text: id + '', // 文本内容(必须是字符串格式)
        fill: new Fill({
          color: '#ffffff'
        }) // 填充样式
      })
    });
  }

  /**
   * 获取当前图形的最大/最小值
   * @param {*} coordiVertexArr
   * @param {*} currentGeometry
   */
  _coordVerteHandle(currentGeometry) {
    let arr = [];
    // 获取所有最大最小坐标数组,以便获取当前所有图形的最大范围
    let geoExtent = currentGeometry.getExtent();
    // let maxMinXY = self._getMaxMinXY(currentGeometry.flatCoordinates)
    // 按照[X,Y,X,Y...]顺序存放
    arr.push(geoExtent[2]);
    arr.push(geoExtent[3]);
    arr.push(geoExtent[0]);
    arr.push(geoExtent[1]);
    return arr;
  }

  _getMaxMinXY(arr) {
    // 设置坐标范围,取圆心
    let maxX = -Infinity;
    let minX = Infinity;
    let maxY = -Infinity;
    let minY = Infinity;
    // ol坐标格式:偶数个是X坐标,奇数个数Y坐标
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      if (i % 2 === 0) {
        if (item > maxX) {
          maxX = item;
        }
        if (item < minX) {
          minX = item;
        }
      } else {
        if (item > maxY) {
          maxY = item;
        }
        if (item < minY) {
          minY = item;
        }
      }
    }
    let msxMinXY = {
      maxX: maxX,
      minX: minX,
      maxY: maxY,
      minY: minY
    };
    return msxMinXY;
  }
  animateMap(center, resolution) {
    if (this.isLocate) {
      //存在配置项resolution
      let optionResolution = this.option.resolution
        ? this.option.resolution
        : resolution;
      //存在配置项zoom
      optionResolution = this.option.zoom
        ? this.map.getView().getResolutionForZoom(this.option.zoom)
        : optionResolution;
      //若需要保证图形完整性：则实际res需要大于图形res
      //反之则取设定的res
      if (this.option.isShowFullFeature) {
        resolution =
          resolution > optionResolution ? resolution : optionResolution;
      } else {
        resolution = optionResolution;
      }
      if (this.option.zoomScale) {
        resolution = resolution * this.option.zoomScale;
      }
      if (getMapScale(this.map, resolution) < 550) {
        resolution = getResolutionFromScale(this.map, 550);
      }
      // 使其不会超过map.view.maxZoom
      let minResolution = this.map
        .getView()
        .getResolutionForZoom(this.map.getView().getMaxZoom());
      resolution = resolution > minResolution ? resolution : minResolution;

      this.map.getView().animate({
        center: center,
        resolution: resolution
      });
    }
  }

  flashGeometry(curFeature) {
    let self = this;
    curFeature.set('isSelected', true);
    curFeature.set('isQuery', true);
    curFeature.set('layerTag', self.layerTag);
    let currentGeometry = curFeature.getGeometry();
    let fillColor = null;
    let strokeColor = '#00FFFF';
    // 是否禁止闪烁高亮
    if (self.isStopFlashHlight) {
      // curFeature.setStyle(self._getStyle());
      if (self.option.isShow) {
        this.mapSource.getSource().addFeature(curFeature);
        if (this.optionStyle && this.optionStyle.fillColor) {
          fillColor = this.optionStyle.fillColor;
        }
        if (this.optionStyle && this.optionStyle.strokeColor) {
          strokeColor = this.optionStyle.strokeColor;
        }
        curFeature.setStyle(self._getStyle(fillColor, strokeColor));
      }
    } else if (
      currentGeometry instanceof LineString ||
      currentGeometry instanceof MultiLineString
    ) {
      // 设置默认渲染样式
      curFeature.setStyle(self._getStyle(fillColor, strokeColor));
      self.featureFlash(curFeature, fillColor, strokeColor);
    } else if (
      currentGeometry instanceof Point ||
      currentGeometry instanceof MultiPoint
    ) {
      self.featureFlash(curFeature, fillColor, strokeColor); // 定位后闪烁
    } else if (
      currentGeometry instanceof Polygon ||
      currentGeometry instanceof MultiPolygon
    ) {
      // 设置默认渲染样式
      curFeature.setStyle(self._getStyle(fillColor, strokeColor));
      self.featureFlash(curFeature, fillColor, strokeColor);
    } else {
      // 设置默认渲染样式
      curFeature.setStyle(self._getStyle(fillColor, strokeColor));
      self.featureFlash(curFeature, fillColor, strokeColor);
    }
  }

  /**
   * arcgis服务的查询地址处理（待处理）
   * @param {*} lyr
   * @param {*} option
   */
  _arcgisServerHandle(lyr, option) {
    let outCode = this.map.getView().getProjection().getCode();
    let query = new Query(lyr.url + '/' + option.subLayerId, {
      outSR: outCode,
      returnGeometry: true,
      where: option.express.trim(),
      envelope: option.envelope,
      outFields: '*',
      returnZ: false,
      returnM: false
    });
    let self = this;
    query.run(function (_err, response) {
      let result = response.features;

      let coordiVertexArr = [];
      result.forEach((feature) => {
        // feature.setStyle(this._getStyle());
        feature.set('isSelected', true);
        feature.set('isQuery', true);
        // this.mapSource.getSource().addFeature(feature);
        self.flashGeometry(feature);
        let arr = self._coordVerteHandle(feature.getGeometry());
        coordiVertexArr = coordiVertexArr.concat(arr);
      });
      self._loacteCurrentGraphical(coordiVertexArr);
      // 回调success
      self.queryCallback(true, result);
    }, this);
  }

  // 递归查询
  queryTocData(tree, filed, value) {
    if (tree.children && tree.children.length > 0) {
      for (let layer of tree.children) {
        if (layer.children && layer.children.length > 0) {
          let queryResult = this.queryTocData(layer, filed, value);
          if (queryResult) {
            return queryResult;
          }
        } else if (layer[filed] === value) {
          return layer;
        }
      }
    }
  }

  queryCallback(isSuccess, result, isOnlyAttr) {
    if (this.callback) {
      let geojson =
        !isSuccess || isOnlyAttr ? result : this.map.transformGeo(result);
      this.callback(isSuccess, geojson, result.length);
    }
    if (isSuccess) {
      if (this.option.success) {
        this.option.success(result);
      }
    } else {
      console.error(result);
      if (this.option.failed) {
        this.option.failed(result);
      }
    }
  }
}

export default QueryManager;
