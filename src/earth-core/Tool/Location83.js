/* eslint-disable no-prototype-builtins */
/*
 * @Author: liujh
 * @Date: 2020/8/24 9:01
 * @Description:
 */
/* 83 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import Jquery from 'jquery';
import * as Point from './Point2';
import * as Util from './Util1';

//“鼠标经纬度提示”控件
class Location {
  constructor(viewer, options) {
    // _classCallCheck(this, Location)
    this.viewer = viewer;
    this.options = options;
    this.containerid = viewer._container.id + '_location_shine_jwd';
    this.locationFormat =
      options.format ||
      '<div>视高：{height}米</div><div>俯仰角：{pitch}度</div><div>方向：{heading}度</div><div>海拔：{z}米</div><div>纬度:{y}</div><div>经度:{x}</div>';

    this.inhtml =
      '<div id="' +
      this.containerid +
      '"  class="location-bar animation-slide-bottom no-print" ></div>';
    Jquery('#' + viewer._container.id).prepend(this.inhtml);

    if (options.style) {
      Jquery('#' + this.containerid).css(options.style);
    } else {
      Jquery('#' + this.containerid).css({
        left: viewer.animation ? '170px' : '0',
        right: '0',
        bottom: viewer.timeline ? '25px' : '0'
      });
    }
    this.locationData = {};
    this.locationData.height = Point.formatNum(
      viewer.camera.positionCartographic.height,
      1
    );
    this.locationData.heading = Point.formatNum(
      Cesium.Math.toDegrees(viewer.camera.heading),
      0
    );
    this.locationData.pitch = Point.formatNum(
      Cesium.Math.toDegrees(viewer.camera.pitch),
      0
    );
    /*        if(document.getElementsByClassName("cesium-performanceDisplay-fps")[0]){
            this.locationData.FPS = document.getElementsByClassName("cesium-performanceDisplay-fps")[0].childNodes[0].nodeValue

        }*/
    //纪舒敏 相机位置经纬度
    this.locationData.screenjd = Point.formatNum(
      Cesium.Math.toDegrees(this.viewer.camera.positionCartographic.longitude),
      4
    );
    this.locationData.screenwd = Point.formatNum(
      Cesium.Math.toDegrees(this.viewer.camera.positionCartographic.latitude),
      4
    );
    //end

    //纪舒敏 移除鼠标位置获取更新
    // if (Cesium.defaultValue(this.options.bindEvent, true)) {
    //     let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    //     handler.setInputAction(function(movement) {
    //         _this.updateData(movement)
    //     }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
    //     this.handler = handler
    // }

    //相机移动结束事件
    viewer.scene.camera.changed.addEventListener(this.updaeCamera, this);
  }

  //纪舒敏 移除鼠标位置获取更新
  updateData(movement) {
    let cartesian = Point.getCurrentMousePosition(
      this.viewer.scene,
      movement.endPosition
    );
    if (!cartesian) return;

    let cartographic = Cesium.Cartographic.fromCartesian(cartesian);

    this.locationData.z = Point.formatNum(
      cartographic.height / this.viewer.scene.terrainExaggeration,
      1
    );

    let jd = Cesium.Math.toDegrees(cartographic.longitude);
    let wd = Cesium.Math.toDegrees(cartographic.latitude);

    switch (this.options.crs) {
      default: {
        //和地图一致的原坐标
        let fixedLen = this.options.hasOwnProperty('toFixed')
          ? this.options.toFixed
          : 6;
        this.locationData.x = Point.formatNum(jd, fixedLen);
        this.locationData.y = Point.formatNum(wd, fixedLen);
        break;
      }
      case 'degree':
        //度分秒形式
        this.locationData.x = Util.formatDegree(jd);
        this.locationData.y = Util.formatDegree(wd);
        break;
      case 'project': {
        //投影坐标
        let fixedLen = this.options.hasOwnProperty('toFixed')
          ? this.options.toFixed
          : 0;
        this.locationData.x = Point.formatNum(cartesian.x, fixedLen);
        this.locationData.y = Point.formatNum(cartesian.y, fixedLen);
        break;
      }

      case 'wgs': {
        //标准wgs84格式坐标
        let fixedLen = this.options.hasOwnProperty('toFixed')
          ? this.options.toFixed
          : 6;

        let wgsPoint = this.viewer.shine.point2wgs({
          x: jd,
          y: wd
        }); //坐标转换为wgs
        this.locationData.x = Point.formatNum(wgsPoint.x, fixedLen);
        this.locationData.y = Point.formatNum(wgsPoint.y, fixedLen);
        break;
      }
      case 'wgs-degree': {
        //标准wgs84格式坐标
        let wgsPoint = this.viewer.shine.point2wgs({
          x: jd,
          y: wd
        }); //坐标转换为wgs
        this.locationData.x = Util.formatDegree(wgsPoint.x);
        this.locationData.y = Util.formatDegree(wgsPoint.y);
        break;
      }
    }

    let inhtml;
    if (typeof this.locationFormat === 'function') {
      //回调方法
      inhtml = this.locationFormat(this.locationData);
    } else {
      inhtml = Util.template(this.locationFormat, this.locationData);
    }
    Jquery('#' + this.containerid).html(inhtml);
  }

  updaeCamera() {
    this.locationData.height = Point.formatNum(
      this.viewer.camera.positionCartographic.height,
      1
    );
    this.locationData.heading = Point.formatNum(
      Cesium.Math.toDegrees(this.viewer.camera.heading),
      0
    );
    this.locationData.pitch = Point.formatNum(
      Cesium.Math.toDegrees(this.viewer.camera.pitch),
      0
    );
    //纪舒敏 相机位置经纬度
    this.locationData.screenjd = Point.formatNum(
      Cesium.Math.toDegrees(this.viewer.camera.positionCartographic.longitude),
      4
    );
    this.locationData.screenwd = Point.formatNum(
      Cesium.Math.toDegrees(this.viewer.camera.positionCartographic.latitude),
      4
    );
    //end
    //纪舒敏 视高大于某值，弹窗关闭
    if (this.viewer.shine.popup) {
      //根据sgg要求，暂行取消视角设定。 yagnw
      /*  if (this.locationData.height > 8000)
                this.viewer.shine.popup.close() */
    }

    //if (this.locationData.x == null) return

    let inhtml;
    if (typeof this.locationFormat === 'function') {
      //回调方法
      inhtml = this.locationFormat(this.locationData);
    } else {
      inhtml = Util.template(this.locationFormat, this.locationData);
    }
    Jquery('#' + this.containerid).html(inhtml);
  }

  destroy() {
    //相机移动结束事件
    this.viewer.scene.camera.changed.removeEventListener(
      this.updaeCamera,
      this
    );

    if (this.handler) {
      this.handler.destroy();
      delete this.handler;
    }
    Jquery('#' + this.containerid).remove();
  }
}

export { Location };
