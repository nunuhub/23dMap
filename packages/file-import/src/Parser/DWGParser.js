import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import WKT from 'ol/format/WKT';
import { registerProj } from 'shinegis-client-23d/src/map-core/CustomProjection';
import { locationGeometry } from '../common';
import { getCenter } from 'ol/extent.js';
import { Vector as VectorLayer } from 'ol/layer.js';
import { Vector as VectorSource } from 'ol/source.js';
import {
  Circle as CircleStyle,
  Fill,
  Stroke,
  Style,
  Icon,
  Text
} from 'ol/style.js';
import { selectStyles } from 'shinegis-client-23d/src/utils/olUtil';
import GaApi from 'shinegis-client-23d/src/utils/GaApi';
/**
 * 需求说明：
 * 1.每一个dwg文件的导入都创建一个临时层
 * 2.dwg中的点线面同时展示在一个临时层中
 * 3.读取dwg文件中随服务返回的颜色信息，以此颜色展示在临时层上
 * 4.支持dwg/dxf文件类型的导入
 * 5.一次导入只能接收一个dwg/dxf类型的文件（接口）
 */

/**
 * 导入dwg,dxf文件解析器
 */
class DWGParser {
  constructor(_opt) {
    _opt = Object.assign({}, _opt);
    this.map = _opt.map;
    this.url = _opt.url;
    this.token = _opt.token;
    this.dxfFile = _opt.importFiles[0];
    this.importFileType = _opt.importFileType;
    this.importFileExt = _opt.importFileExt;
    this.mapDelNo = _opt.mapDelNo;
    this.mapProjectionCode = _opt.mapProjectionCode;
    this.index = _opt.dwgCount;
    this.projCode = _opt.projCode;
  }

  process() {
    // 坐标系
    let wkid = this.mapProjectionCode.substring(
      this.mapProjectionCode.lastIndexOf(':') + 1,
      this.mapProjectionCode.length
    );
    let fromwkid = this.projCode.substring(
      this.projCode.lastIndexOf(':') + 1,
      this.projCode.length
    );
    return new Promise((resolve, reject) => {
      new GaApi(this.url)
        .importFile({
          files: [this.dxfFile],
          wkid: wkid,
          fromwkid: fromwkid,
          token: this.token
        })
        .then((result) => {
          if (result.success) {
            let data = result.data.features
              ? result.data.features
              : result.data.data[0].features;
            let features = [];
            let wktFormat = new WKT();
            let geometrys = [];
            data.forEach((element) => {
              try {
                let geo = wktFormat.readGeometry(element.wkt);

                geometrys.push(geo);
                let feature = new Feature({
                  geometry: geo
                });
                // 遍历属性信息
                for (let key in element.attributes) {
                  feature.set(key, element.attributes[key]);
                }
                // 考虑文字层，单独处理 ，点线面几何在同一个方法中处理
                let styles;
                if (element.attributes.drawingTool === 'LABEL') {
                  styles = this.labelStyles(element.attributes);
                } else {
                  // 点线面几何
                  if (element.wkt.indexOf('POLYGON') > 0) {
                    styles = this.addStyles(
                      element.attributes.c,
                      'polygon',
                      feature
                    );
                  } else if (element.wkt.indexOf('POINT') > 0) {
                    styles = this.addStyles(
                      element.attributes.c,
                      'point',
                      feature
                    );
                  } else {
                    styles = this.addStyles(
                      element.attributes.c,
                      'line',
                      feature
                    );
                  }
                }
                feature.originalStyle = styles;
                //feature.setStyle(styles);

                feature.setStyle(selectStyles);
                feature.set('tempSelected', true);
                feature.set('isImport', true);
                feature.set('area', element.area);
                feature.set('length', element.length);
                // feature.set("tempSelected",true)
                // 在此处获取地块的坐标系信息 ，如未找到坐标系信息 ，则以默认2000坐标系进行转换
                let tempGeo = this.projectionTransform(
                  feature.getGeometry(),
                  reject
                );
                feature.setGeometry(tempGeo);
                features.push(feature);
              } catch (err) {
                console.warn('导入错误:', err);
              }
            });
            this.map
              .getLayerById('drawLayer')
              .getSource()
              .addFeatures(features);
            // 创建新的临时层及添加地块至该临时层
            // this.addGrasToTempLyr(features , geometrys)
            resolve(features);
            locationGeometry(this.map, geometrys); // 定位
          } else {
            reject(new Error('导入错误:' + result.message));
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  /**
   * 创建临时图层
   * 添加地块至临时图层
   *  @param {array} features
   *  @param {number} index
   */
  addGrasToTempLyr(features, geometrys) {
    // 先添加一个
    let id = 'impDwg_' + this.index;
    let templyr = new VectorLayer({
      id: id,
      zIndex: 999,
      source: new VectorSource(),
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.3)'
        }),
        stroke: new Stroke({
          color: 'rgba(255, 0, 0, 2)',
          width: 2
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33'
          })
        })
      })
    });
    // 加载该临时图层
    this.map.addLayer(templyr);
    // 添加所有feature到临时图层
    templyr.getSource().addFeatures(features);
    locationGeometry(this.map, geometrys); // 定位
  }
  /** 文字层的渲染样式
   * @param {object} attributes
   */
  labelStyles(attributes) {
    let styles = [];
    styles.push(
      new Style({
        text: new Text({
          font: 'Calibri,sans-serif',
          text: attributes.t,
          // s:'0.7g',
          // dx: "0.746667g",
          // dy: "0.53375g",
          // f: "SimSun",
          // p: "5",
          // s: "1.05g",
          textAlign: 'center',
          // 文本基线
          textBaseline: 'middle',
          fill: new Fill({
            color: attributes.c
          }),
          stroke: new Stroke({
            color: attributes.c,
            width: 1
          })
        })
      })
    );

    return styles;
  }

  /** 几何地块的渲染颜色
   * @param {string} rgba
   */
  addStyles(rgba, type, feature) {
    let styles = [];
    styles.push(
      new Style({
        fill: new Fill({
          color: 'rgba(255, 0, 0, 0.0)'
        }),
        stroke: new Stroke({
          color: rgba,
          width: 2
        }),
        image: new CircleStyle({
          fill: new Fill({
            color: [255, 0, 0]
          }),
          radius: 3
        })
      })
    );
    if (type === 'polygon') {
      styles.push(
        new Style({
          geometry: new Point(getCenter(feature.getGeometry().getExtent())),
          image: new Icon({
            anchor: [0.5, 0.9],
            src: 'static/img/location.png' // 图片路径
          })
        })
      );
    } else if (type === 'line') {
      styles.push(
        new Style({
          geometry: new Point(getCenter(feature.getGeometry().getExtent())),
          image: new Icon({
            anchor: [0.5, 1],
            src: 'static/img/location.png' // 图片路径
          })
        })
      );
    }

    return styles;
  }
  /**
   * 文件导入中的投影转换：
   * 需要获取两个坐标系，即源坐标系(文件坐标系,默认使用2000)和目标坐标系(当前地图坐标系);
   * （或者判断当源文件与当前地图的是否有带号是否是地理坐标系情况一致，就获取当前地图的
   *   坐标参考作为源文件的坐标系信息，不一致再采用默认2000 。当前采用全默认）
   *
   *   一.文件中X坐标无带号（6位）
   *      1.当前地图有带号(或可计算带号)
   *          给文件中的坐标加上当前地图的带号；
   *          使用带号计算源坐标系；
   *      2.当前地图无带号
   *          使用默认坐标系
   *   二.文件中X坐标有带号（8位）
   *          使用带号计算源坐标系；
   *   三.文件中X坐标为经度（小于180）
   * @param {object} geometry
   */
  projectionTransform(geometry, reject) {
    //projCode 存在时不需要转坐标系, 后端以及转过了, 没有时,可以在前端进行尝试转坐标系
    if (this.projCode) {
      return geometry;
    }
    // 源坐标系(文件坐标系) EPSG
    let fileProjectionCode = this.projCode;

    // 源文件其中一个坐标点的x坐标
    let coordinateX = geometry.flatCoordinates[0];
    if (coordinateX >= -180 && coordinateX <= 180) {
      // 经纬度
      fileProjectionCode = 'EPSG:4490';
    } else if (coordinateX.toFixed().length === 6) {
      // 无带号
      if (this.mapDelNo !== '' && this.mapDelNo !== 0) {
        // 当前地图有带号
        fileProjectionCode = 'EPSG:' + (4488 + Number(this.mapDelNo));
      } else {
        fileProjectionCode = 'EPSG:4549';
      }
    } else if (coordinateX.toFixed().length === 8) {
      // 有带号
      // 文件中的坐标带号
      let fileDelNo = coordinateX.toString().substring(0, 2);
      fileProjectionCode = 'EPSG:' + (4488 + Number(fileDelNo));
    } else {
      return reject(new Error('存在坐标格式有误的文件'));
    }
    registerProj(fileProjectionCode);
    let _geometry = geometry.transform(
      fileProjectionCode,
      this.mapProjectionCode
    );
    return _geometry;
  }
}

export default DWGParser;
