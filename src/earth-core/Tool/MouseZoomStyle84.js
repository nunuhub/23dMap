/**
 * @Author han
 * @Date 2021/1/8 15:18
 */

import * as Cesium from 'cesium_shinegis_earth';
import Jquery from 'jquery';
import { getCurrentMousePosition } from './Point2';

const _createClass = (function () {
  function defineProperties(target, props) {
    for (let i = 0; i < props.length; i++) {
      let descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError('Cannot call a class as a function');
  }
}

//鼠标旋转、放大时的美化图标
const MouseZoomStyle = (function () {
  //========== 构造方法 ==========
  function MouseZoomStyle(viewer, options) {
    _classCallCheck(this, MouseZoomStyle);

    this.viewer = viewer;
    this.options = options;
    let containerid = viewer._container.id + '-mousezoom';
    this.containerid = containerid;

    Jquery('#' + viewer._container.id).append(
      '<div id="' +
        this.containerid +
        '" class="cesium-mousezoom"><div class="zoomimg"/></div>'
    );

    let timetik = -1;

    let handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    handler.setInputAction(function () {
      Jquery('#' + containerid).addClass('cesium-mousezoom-visible');
      clearTimeout(timetik);
      timetik = setTimeout(function () {
        Jquery('#' + containerid).removeClass('cesium-mousezoom-visible');
      }, 200);
    }, Cesium.ScreenSpaceEventType.WHEEL);

    handler.setInputAction(function (evnet) {
      let position = getCurrentMousePosition(viewer.scene, evnet.position);
      if (!position) return;

      if (
        viewer.camera.positionCartographic.height >
        viewer.scene.screenSpaceCameraController.minimumCollisionTerrainHeight
      )
        return;

      handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
      clearTimeout(timetik);
      Jquery('#' + containerid).css({
        top: evnet.position.y + 'px',
        left: evnet.position.x + 'px'
      });
      Jquery('#' + containerid).addClass('cesium-mousezoom-visible');
    }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);

    handler.setInputAction(function () {
      Jquery('#' + containerid).removeClass('cesium-mousezoom-visible');
      handler.setInputAction(function (evnet) {
        Jquery('#' + containerid).css({
          top: evnet.endPosition.y + 'px',
          left: evnet.endPosition.x + 'px'
        });
      }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }, Cesium.ScreenSpaceEventType.MIDDLE_UP);

    this.handler = handler;
  }

  //========== 对外属性 ==========

  // //是否禁用
  // get enable() {
  //     return this._enable
  // }
  // set enable(value) {
  //     this._enable = value
  // }

  //========== 方法 ==========

  _createClass(MouseZoomStyle, [
    {
      key: 'destroy',
      value: function destroy() {
        if (this.handler) {
          this.handler.destroy();
          delete this.handler;
        }

        Jquery('#' + this.containerid).remove();
      }
    }
  ]);

  return MouseZoomStyle;
})();
export { MouseZoomStyle };
