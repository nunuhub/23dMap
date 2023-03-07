/*
 * @Author: liujh
 * @Date: 2020/8/24 9:35
 * @Description:
 */
/* 54 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import { BaseLayer } from './BaseLayer10';
import { Layer } from '../Layer26';
import { xmlToJson } from '../../utils/common';
import $ from 'jquery';
import { cloneDeep } from 'lodash-es';

const TileLayer = BaseLayer.extend({
  layer: null,

  //添加
  add: function add() {
    if (this.layer != null) {
      this.remove();
    }
    this.addEx();
    let imageryProvider = this.createImageryProvider(this.config);
    if (!Cesium.defined(imageryProvider)) return;

    let options = this.config;

    let imageryOpt = {
      show: true,
      alpha: this._opacity
    };
    if (
      Cesium.defined(options.rectangle) &&
      Cesium.defined(options.rectangle.xmin) &&
      Cesium.defined(options.rectangle.xmax) &&
      Cesium.defined(options.rectangle.ymin) &&
      Cesium.defined(options.rectangle.ymax)
    ) {
      let xmin = options.rectangle.xmin;
      let xmax = options.rectangle.xmax;
      let ymin = options.rectangle.ymin;
      let ymax = options.rectangle.ymax;
      let rectangle = Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax);
      this.rectangle = rectangle;
      imageryOpt.rectangle = rectangle;
    }
    if (Cesium.defined(options.brightness))
      imageryOpt.brightness = options.brightness;
    if (Cesium.defined(options.contrast))
      imageryOpt.contrast = options.contrast;
    if (Cesium.defined(options.hue)) imageryOpt.hue = options.hue;
    if (Cesium.defined(options.saturation))
      imageryOpt.saturation = options.saturation;
    if (Cesium.defined(options.gamma)) imageryOpt.gamma = options.gamma;
    if (Cesium.defined(options.maximumAnisotropy))
      imageryOpt.maximumAnisotropy = options.maximumAnisotropy;
    if (Cesium.defined(options.minimumTerrainLevel))
      imageryOpt.minimumTerrainLevel = options.minimumTerrainLevel;
    if (Cesium.defined(options.maximumTerrainLevel))
      imageryOpt.maximumTerrainLevel = options.maximumTerrainLevel;

    this.layer = new Cesium.ImageryLayer(imageryProvider, imageryOpt);
    this.layer.config = this.config;

    this.viewer.imageryLayers.add(this.layer);

    if (this.layer.config.group == 1) {
      //  this.viewer.imageryLayers.lowerToBottom(this.layer)
    }
    //this.setZIndex(this.config.order)
    this.setZIndex(this.config.mapIndex);
  },
  //方便外部继承覆盖该方法
  createImageryProvider: function createImageryProvider(config) {
    return Layer.createImageryProvider(config); //调用layer.js
  },
  addEx: function addEx() {
    //子类使用
  },
  //移除
  remove: function remove() {
    if (this.layer == null) return;
    this.removeEx();
    this.viewer.imageryLayers.remove(this.layer, true);
    this.layer = null;
  },
  removeEx: function removeEx() {
    //子类使用
  },
  //定位至数据区域
  centerAt: function centerAt(duration) {
    if (this.layer == null) return;
    if (this.config.extent || this.config.center) {
      this.viewer.shine.centerAt(this.config.extent || this.config.center, {
        duration: duration,
        isWgs84: true
      });
    } else if (Cesium.defined(this.rectangle)) {
      this.viewer.camera.flyTo({
        destination: this.rectangle,
        duration: duration
      });
    } else {
      let [rectang, west, south, east, north, that] = [
        null,
        '',
        '',
        '',
        '',
        this
      ];
      if (this.layer.config.type === 'geoserver-wms') {
        /*      var [rectang, west, south, east, north, that] = [
                  null,
                  '',
                  '',
                  '',
                  '',
                  this
                ];*/
        $.ajax({
          type: 'GET',
          url: this.layer.config.url + '?service=WMS&request=GetCapabilities',
          async: false,
          success: function (data) {
            let cap = xmlToJson(data);
            var vilidateLayer;
            if (Array.isArray(cap['WMS_Capabilities'].Capability.Layer)) {
              vilidateLayer = cap[
                'WMS_Capabilities'
              ].Capability.Layer.Layer.filter((element) => {
                if (
                  element.Name['#text'] == that.layer.config.visibleLayers ||
                  element.Name['#text'] == that.layer.config.name
                )
                  return element;
              });
            } else {
              vilidateLayer = cap['WMS_Capabilities'].Capability.Layer.Layer;
            }

            if (vilidateLayer) {
              if (Array.isArray(vilidateLayer[0].BoundingBox)) {
                west = vilidateLayer[0].BoundingBox[0]['@attributes'].minx;
                south = vilidateLayer[0].BoundingBox[0]['@attributes'].miny;
                east = vilidateLayer[0].BoundingBox[0]['@attributes'].maxx;
                north = vilidateLayer[0].BoundingBox[0]['@attributes'].maxy;
              } else {
                west = vilidateLayer[0].BoundingBox['@attributes'].minx;
                south = vilidateLayer[0].BoundingBox['@attributes'].miny;
                east = vilidateLayer[0].BoundingBox['@attributes'].maxx;
                north = vilidateLayer[0].BoundingBox['@attributes'].maxy;
              }
              let deviation = 1.8 * (north - south);
              rectang = new Cesium.Rectangle.fromDegrees(
                west,
                south - deviation,
                east,
                north - deviation
              );
            } else {
              console.error('Invalid positioning layer!');
            }
          },
          error: function () {
            console.error('Failed to request Boundbox of layer!');
          }
        });
      } else if (this.layer.config.type === 'geoserver-wmts') {
        let wmtsObj = this.config.WMTSparams;
        let recArr = wmtsObj.position.split(' ');
        if (wmtsObj.ServiceType === 'geoserver') {
          let deviation = 1.8 * (recArr[3] - recArr[1]);
          rectang = new Cesium.Rectangle.fromDegrees(
            recArr[0],
            recArr[1] - deviation,
            recArr[2],
            recArr[3] - deviation
          );
        } else {
          let deviation = 1.8 * (recArr[2] - recArr[0]);
          rectang = new Cesium.Rectangle.fromDegrees(
            recArr[1],
            recArr[0] - deviation,
            recArr[3],
            recArr[2] - deviation
          );
        }
      } else if (this.layer.config.type === 'wmts') {
        let wmtsObj = this.config.WMTSparams;
        let recArr = wmtsObj.position.split(' ');
        if (wmtsObj.ServiceType === 'geoserver') {
          let deviation = 1.8 * (recArr[3] - recArr[1]);
          rectang = new Cesium.Rectangle.fromDegrees(
            recArr[0],
            recArr[1] - deviation,
            recArr[2],
            recArr[3] - deviation
          );
        } else {
          let deviation = 1.8 * (recArr[2] - recArr[0]);
          rectang = new Cesium.Rectangle.fromDegrees(
            recArr[1],
            recArr[0] - deviation,
            recArr[3],
            recArr[2] - deviation
          );
        }
      } else {
        rectang = cloneDeep(this.layer.imageryProvider.rectangle);
        //rectang = Object.assign({}, this.layer.imageryProvider.rectangle); //默认读取配置信息
        let deviation = 1.8 * (rectang.north - rectang.south);
        rectang.north = rectang.north - deviation;
        rectang.south = rectang.south - deviation;
      }
      if (
        Cesium.defined(rectang) &&
        rectang !== Cesium.Rectangle.MAX_VALUE &&
        rectang.west > 0 &&
        rectang.south > 0 &&
        rectang.east > 0 &&
        rectang.north > 0
      ) {
        this.viewer.camera.flyTo({
          destination: rectang,
          duration: duration,
          orientation: {
            heading: Cesium.Math.toRadians(0), //y轴旋转
            pitch: Cesium.Math.toRadians(-45.0), //z轴旋转
            roll: 0.0 //旋转速度
          }
        });
      }
    }
  },
  //设置透明度
  hasOpacity: true,
  _opacity: 1,
  setOpacity: function setOpacity(value) {
    this._opacity = value;
    if (this.layer == null) return;

    this.layer.alpha = value;
  },
  //设置叠加顺序
  hasZIndex: true,
  setZIndex: function setZIndex(order) {
    if (this.layer == null || order == null) return;

    //先移动到最顶层
    this.viewer.imageryLayers.raiseToTop(this.layer);

    let layers = this.viewer.imageryLayers._layers;
    for (let i = layers.length - 1; i >= 0; i--) {
      if (layers[i] == this.layer) continue;
      let _temp = layers[i].config;
      if (_temp && _temp.mapIndex) {
        if (order < _temp.mapIndex) {
          this.viewer.imageryLayers.lower(this.layer);
        }
      }
    }
  }
});

export { TileLayer };
