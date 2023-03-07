import GeoJSON from 'ol/format/GeoJSON';
import EsriJSON from 'ol/format/EsriJSON';
import { Style, Fill, Stroke } from 'ol/style';
import $$ from 'jquery';
import { MultiPolygon } from 'ol/geom';
import { unByKey } from 'ol/Observable';
import Feature from 'ol/Feature';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { getVectorContext } from 'ol/render';
import { Message } from 'element-ui';

export default class Cutting {
  constructor(map) {
    this.map = map;
    this.isAllowCut = true;
    this.currentWkid = map.getView().getProjection().getCode();
    this.targetLayers = [];
    this.geoJSON = new GeoJSON();
    this.esrijsonFormat = new EsriJSON();
    this.prerenderEvtObj = {};
    this.postrenderEvtObj = {};
    this.xzq_features = [];
    this.isFirstExt = true;
  }

  //移动时不能裁切
  initMoveListener() {
    this.map.getTargetElement().addEventListener(
      'mousewheel',
      () => {
        this.isAllowCut = false;
      },
      false
    );
    this.map.on('pointerdown', () => {
      this.isAllowCut = false;
    });
    this.map.getView().on('change:resolution', () => {
      this.isAllowCut = false;
    });
    this.map.on('movestart', () => {
      this.isAllowCut = false;
    });
    this.map.on('moveend', () => {
      if (!this.isAllowCut) {
        this.map.render();
      }
      this.isAllowCut = true;
    });
  }
  //初始化裁剪
  initCutting(options) {
    if (options) {
      this.options = options;
      this.targetLayers = options.targetLayers;
      if (!options.stopMoveListener) {
        this.initMoveListener();
      }
      this.clearCutLayers();
      this.isAllowCut = true;
      this.startCut(options);
    } else {
      Message.warning('裁剪参数缺失');
    }
  }

  /**
   * 开始裁剪
   * @param options
   */
  startCut(options) {
    const geomLayer = options.geoLayer.layer;
    if (options.geoJson) {
      let f = [];
      const geoms = options.geoJson;
      if (typeof geoms === 'string') {
        f.push(JSON.parse(geoms));
      } else {
        f = geoms.map((item) => {
          let json = item.geojsonGis || item;
          return JSON.parse(json);
        });
      }
      this.unionGeometry(f); //合并裁剪面
    } else if (geomLayer && options.geoLayer.whereInfo) {
      let CQL = options.geoLayer.whereInfo;
      setTimeout(() => {
        //延时,等待图层加载
        if (options.geoLayer.whereInfo) {
          //根据查询条件获取图层服务里的图形作为裁剪面
          this.customGeometry(geomLayer, CQL, (data) => {
            this.unionGeometry(data);
          });
        }
      }, 800);
    } else {
      Message.error('未获取到裁剪范围数据！');
    }
  }

  //自定义区域
  customGeometry(geomLayer, CQL, func) {
    if (
      this.whereClause === CQL &&
      this.geomLayerUrl === geomLayer.url &&
      this.xzq_features.length > 0
    ) {
      func(this.xzq_features);
    } else {
      this.whereClause = CQL;
      this.geomLayerUrl = geomLayer.url;
      if (geomLayer.type.indexOf('geoserver') > -1) {
        this.requestGeo(geomLayer, CQL, (features) => {
          this.xzq_features = features;
          func(features);
        });
      } else if (
        geomLayer.type === 'dynamic' ||
        geomLayer.type === 'feature' ||
        geomLayer.type === 'feature-zj'
      ) {
        this.requestArc(geomLayer, CQL, (features) => {
          this.xzq_features = features;
          func(features);
        });
      }
    }
  }

  //合并获取到的区域geometry
  unionGeometry(features) {
    if (this.targetLayers.length > 0) {
      if (features && features.length > 0) {
        let coordArr = [];
        features.forEach((item) => {
          const geo = item.geometry;
          let coord = [];
          if (geo) {
            if (geo.type && geo.type === 'MultiPolygon') {
              coord = geo.coordinates;
            } else {
              coord.push(geo.coordinates);
            }
          } else {
            let geom = item.getGeometry();
            let type = geom.getType();
            if (type === 'Polygon') {
              coord = [item.getGeometry().getCoordinates()];
            } else {
              coord = item.getGeometry().getCoordinates();
            }
          }
          coordArr = [...coordArr, ...coord];
        });
        const milp = new MultiPolygon(coordArr);
        const f = new Feature(milp);
        this.setCutting(f);
      } else {
        Message.error('没有裁剪区域数据');
      }
    } else {
      // Message.error('请加载需要裁剪的图层');
    }
  }

  //设置裁剪
  setCutting(feature) {
    let xzq_geomtry = feature.getGeometry();
    if (this.currentWkid !== 'EPSG:4490') {
      xzq_geomtry = xzq_geomtry.transform('EPSG:4490', this.currentWkid);
    }
    this.dataGeometry = xzq_geomtry;
    let fillStyle = new Fill({
      color: [0, 0, 0, 0]
    });
    this.styleVC = new Style({
      fill: fillStyle
    });
    if (this.dataGeometry) {
      this.targetLayers.forEach((id) => {
        let lyr = this.map.getLayerById(id);
        if (lyr) {
          this.cutPrender(lyr);
        } else {
          console.error(id + '图层未加载');
        }
      });
      setTimeout(() => {
        this.setExtentLocate();
      }, 500);
    }
    this.setMask(feature);
  }

  //设置地图位置(缩放定位)
  setExtentLocate() {
    let fExtent = this.dataGeometry.getExtent();
    let locateConfig = this.options.locateConf || this.options.locateConfig;
    if (!locateConfig || fExtent.includes(Infinity)) return;
    const { isLocate, center, resolution, isFit } = locateConfig;
    if (isFit) {
      this.map.getView().fit(fExtent);
    } else if (isLocate && center && this.isFirstExt) {
      //根据记录设置范围
      this.map.getView().setCenter(center);
      this.map.getView().setResolution(resolution ? resolution : 9);
      this.isFirstExt = false;
    }
  }

  //根据id,添加裁剪图层
  addCuttingLayer(id) {
    const layer = this.map.getLayerById(id);
    if (layer) {
      this.cutPrender(layer);
      this.map.render();
    }
  }

  // 图层绑定
  cutPrender(layer) {
    let prerenderEvt = layer.on('prerender', (event) => {
      if (this.isAllowCut && this.styleVC && this.dataGeometry) {
        this.changeCtx(event);
      }
    });

    let postrenderEvt = layer.on('postrender', (event) => {
      if (this.isAllowCut) {
        let ctx = event.context;
        ctx.restore();
      }
    });
    this.prerenderEvtObj[layer.values_.id] = prerenderEvt;
    this.postrenderEvtObj[layer.values_.id] = postrenderEvt;
  }
  // 触发canvas事件
  changeCtx(event) {
    let ctx = event.context;
    let vecCtx = getVectorContext(event); //6.0版本
    ctx.save();
    vecCtx.setStyle(this.styleVC);
    vecCtx.drawGeometry(this.dataGeometry);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    // ctx.shadowColor = '#ccc';
    // ctx.shadowBlur = 25;
    ctx.stroke();
    ctx.clip();
  }
  // 清除所有绑定的图层事件
  clearCutLayers() {
    for (const key in this.prerenderEvtObj) {
      this.removeCutLayerById(key, false);
    }
    this.prerenderEvtObj = {};
    this.postrenderEvtObj = {};
    this.removeMask();
    this.map.render();
  }
  //根据id移除对应的图层裁剪
  removeCutLayerById(id, refresh = true) {
    const keys = Object.keys(this.prerenderEvtObj);
    if (keys.includes(id)) {
      let preEvt = this.prerenderEvtObj[id];
      let postEvt = this.postrenderEvtObj[id];
      unByKey(preEvt);
      unByKey(postEvt);
      delete this.prerenderEvtObj[id];
      delete this.postrenderEvtObj[id];
      refresh && this.map.render();
    } else {
      Message.error(id + '图层为加载!');
    }
  }

  //移除遮罩
  removeMask() {
    let maskLayer = this.map.getLayerById('cuttingMask');
    maskLayer && this.map.removeLayer(maskLayer);
  }

  //设置遮罩
  setMask(feature) {
    this.removeMask();
    let options = this.options;
    let type = options.maskType;
    if (options.isMask) {
      let coord = this.getMaskPolygon(type, feature);
      this.setMaskLayer(coord);
    }
  }

  getMaskPolygon(type, feature) {
    let coord = [
      [
        [-180, -90],
        [-180, 90],
        [180, 90],
        [180, -90],
        [-180, -90]
      ]
    ];
    if (type === 'fill') {
      coord = [];
    } //填充
    //裁剪(过滤)的范围合并
    let geoType = feature.getGeometry().getType();
    let coordinates = feature.getGeometry().getCoordinates();
    //从整个遮罩面扣除该区域
    if (geoType.toLowerCase() === 'polygon') {
      coord = coord.concat(coordinates);
    } else {
      coordinates.forEach((item) => {
        coord = coord.concat(item);
      });
    }
    return coord;
  }

  //设置遮罩层
  setMaskLayer(coord) {
    let coordArr = [coord];
    let vectorSource = new VectorSource();
    let p = new MultiPolygon(coordArr);
    let feature = new Feature(p);
    vectorSource.addFeature(feature);
    let maskLayer = new VectorLayer({
      id: 'cuttingMask',
      zIndex: this.options.maskIndex || 1099,
      source: vectorSource,
      style: this.setLineStyle()
    });
    this.map.addLayer(maskLayer);
  }

  //设置图形边界样式
  setLineStyle() {
    let defaultLineColor = 'rgba(0, 191, 255, 1)';
    let defaultFillColor = 'rgba(255, 255, 255, 0.5)';
    let defaultLineWidth = 0;

    let maskConfig = this.options.maskConfig;
    let strokeColor = maskConfig.strokeColor;
    let fillColor = maskConfig.fillColor;
    let strokeWidth = maskConfig.strokeWidth;

    let stroke = new Stroke({
      color: strokeColor ? strokeColor : defaultLineColor,
      width: strokeWidth ? strokeWidth : defaultLineWidth
    });
    let fill = new Fill({
      color: fillColor ? fillColor : defaultFillColor
    });
    let style = new Style({
      fill: fill
    });
    if (strokeWidth > 0) {
      style.setStroke(stroke);
    }
    return style;
  }

  //获取geoserver服务的自定义区域
  requestGeo(geomLayer, CQL, callback) {
    let lyrUrl = geomLayer.url;
    let index = lyrUrl.lastIndexOf('/');
    lyrUrl = lyrUrl.substring(0, index) + '/wfs';
    let layerName = geomLayer.visibleLayers[0];
    let currentWkid = this.map.getView().getProjection().getCode();
    $$.ajax({
      url: lyrUrl,
      data: {
        service: 'WFS',
        version: '1.1.0',
        request: 'GetFeature',
        typeName: layerName,
        outputFormat: 'application/json',
        maxFeatures: 3200,
        srsName: currentWkid,
        CQL_FILTER: CQL
      },
      success: (result) => {
        if (result && result.features.length > 0) {
          callback(result.features);
        } else {
          callback(null);
        }
      },
      error: (err) => {
        console.error(err);
        Message.error('获取裁剪区域数据出错');
      }
    });
  }

  //获取arcgis服务的自定义区域
  requestArc(geomLayer, CQL, callback) {
    let currentWkid = this.currentWkid;
    currentWkid = currentWkid.split(':')[1];
    let urlString = geomLayer.url;
    let param = {
      f: 'json'
    };
    $$.ajax({
      url: urlString,
      data: param,
      success: (result) => {
        if (result) {
          result = JSON.parse(result);
          if (result.layers && result.layers.length > 0) {
            let resultArr = [];
            result.layers.forEach((lyr) => {
              let lyrNum = lyr.id;
              let url = urlString + '/' + lyrNum + '/query';
              let p = {
                f: 'json',
                outFields: '*',
                outSR: currentWkid,
                returnGeometry: true,
                where: CQL
              };
              let promiseReq = new Promise((resolve) => {
                this._ajax(url, p, resolve);
                $$.ajax({
                  url: url,
                  data: p,
                  success: (dataResult) => {
                    if (dataResult) {
                      dataResult = JSON.parse(dataResult);
                      let features =
                        this.esrijsonFormat.readFeatures(dataResult);
                      resolve(features);
                    }
                  },
                  error: () => {
                    resolve([]);
                  }
                });
              });
              resultArr.push(promiseReq);
            });
            Promise.all(resultArr).then((dataArr) => {
              let arr = [];
              dataArr.forEach((item) => {
                if (item.length > 0) {
                  arr = arr.concat(item);
                }
              });
              callback(arr);
            });
          }
        }
      },
      error: (err) => {
        console.error(err);
        Message.error('获取裁剪区域数据出错');
      }
    });
  }

  /**
   * 获取已经裁剪的图层id
   * @returns {string[]}
   */
  getCutLayersIds() {
    return Object.keys(this.prerenderEvtObj);
  }

  /**
   * 封装ajax请求
   * @param url
   * @param data
   * @param resolve
   * @private
   */
  _ajax(url, data, resolve) {
    $$.ajax({
      url: url,
      data: data,
      success: (dataResult) => {
        if (dataResult) {
          dataResult = JSON.parse(dataResult);
          let features = this.esrijsonFormat.readFeatures(dataResult);
          resolve(features);
        }
      },
      error: () => {
        resolve([]);
      }
    });
  }
}
