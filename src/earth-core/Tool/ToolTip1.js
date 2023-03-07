/* eslint-disable no-empty */
/*
 * @Author: liujh
 * @Date: 2020/8/21 17:18
 * @Description:
 */
/* 82 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import Jquery from 'jquery';
import * as Point from './Point2';
import * as Util from './Util1';

class Tooltip {
  constructor(viewer, options) {
    let _this = this;

    //_classCallCheck(this, Tooltip)

    this.viewer = viewer;
    this.options = options || {};

    this._enable = true;
    this.viewerid = viewer._container.id;

    this.highlighted = {
      feature: undefined,
      originalColor: new Cesium.Color()
    };
    this.defaultHighlightedClr = new Cesium.Color.fromCssColorString('#95e40c');

    //兼容历史接口
    this.getTooltipForConfig = Util.getTooltipForConfig;

    //添加弹出框
    let infoDiv =
      '<div id="' +
      this.viewerid +
      'tooltip-view" class="cesium-popup" style="display:none">' +
      '     <div class="cesium-popup-content-wrapper  cesium-popup-background">' +
      '         <div id="' +
      this.viewerid +
      'tooltip-content" class="cesium-popup-content cesium-popup-color"></div>' +
      '     </div>' +
      '     <div class="cesium-popup-tip-container"><div class="cesium-popup-tip  cesium-popup-background"></div></div>' +
      '</div> ';
    Jquery('#' + this.viewerid).append(infoDiv);

    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    //鼠标移动事件
    this.handler.setInputAction(function (event) {
      if (_this.options.onMouseMove) _this.options.onMouseMove(event);
      // _this.mouseMovingPicking(event)    //纪舒敏begin 去除鼠标移动获取对象事件
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }

  mouseMovingPicking(event) {
    let _this2 = this;

    if (!this._enable) return;

    Jquery('.cesium-viewer').css('cursor', '');

    if (
      this.viewer.scene.screenSpaceCameraController.enableRotate === false ||
      this.viewer.scene.screenSpaceCameraController.enableTilt === false ||
      this.viewer.scene.screenSpaceCameraController.enableTranslate === false
    ) {
      this.close();
      return;
    }

    let position = event.endPosition;

    let entity; //鼠标感知的对象，可能是entity或primitive等
    let pickedObject;
    try {
      pickedObject = this.viewer.scene.pick(position, 5, 5);
    } catch (e) {}

    //普通entity对象 && this.viewer.scene.pickPositionSupported
    if (
      Cesium.defined(pickedObject) &&
      Cesium.defined(pickedObject.id) &&
      pickedObject.id instanceof Cesium.Entity
    ) {
      entity = pickedObject.id;
    }
    //单体化3dtiles数据的处理(如：BIM的构件，城市白膜建筑)
    else if (
      Cesium.defined(pickedObject) &&
      Cesium.defined(pickedObject.tileset) &&
      Cesium.defined(pickedObject.getProperty)
    ) {
      let cfg = pickedObject.tileset._config;
      if (cfg) {
        //取属性
        let attr = {};
        let names = pickedObject.getPropertyIds();
        for (let i = 0; i < names.length; i++) {
          let name = names[i];
          if (!pickedObject.hasProperty(name)) continue;

          let val = pickedObject.getProperty(name);
          if (val == null) continue;
          attr[name] = val;
        }

        entity = {
          id: pickedObject._batchId,
          tooltip: {
            html: (0, Util.getTooltipForConfig)(cfg, attr),
            anchor: cfg.popupAnchor || [0, -15]
          },
          attr: attr, //回调方法中用
          feature: pickedObject //回调方法中用
        };
        if (!cfg.noMouseMove) {
          if (cfg.mouseover) entity.mouseover = cfg.mouseover;
          if (cfg.mouseover) entity.mouseover = cfg.mouseover;
        }

        //高亮显示单体对象
        if (cfg.showMoveFeature) {
          this.highlighPick(pickedObject, cfg.moveFeatureColor);
        }
      }
    }
    //primitive对象
    else if (pickedObject && Cesium.defined(pickedObject.primitive)) {
      entity = pickedObject.primitive;
    }

    if (entity) {
      //存在鼠标感知的对象
      if (entity.popup || entity.click || entity.cursorCSS) {
        Jquery('.cesium-viewer').css('cursor', entity.cursorCSS || 'pointer');
      }

      //加统一的 mouseover 鼠标移入处理
      if (!entity.noMouseMove) {
        //排除标识了不处理其移入事件的对象 ，比如高亮对象本身
        clearTimeout(this.lastTime);
        this.lastTime = setTimeout(function () {
          _this2.activateMouseOver(entity, position);
        }, 20);
      }

      //tooltip
      if (entity.tooltip) {
        let cartesian = (0, Point.getCurrentMousePosition)(
          this.viewer.scene,
          position
        );
        this.show(entity, cartesian, position);
      } else {
        this.close();
      }
    } else {
      this.close();

      clearTimeout(this.lastTime);
      this.lastTime = setTimeout(function () {
        _this2.activateMouseOut();
      }, 20);
    }
  }

  show(entity, cartesian, position) {
    if (entity == null || entity.tooltip == null) return;

    //计算显示位置
    if (position == null)
      position = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        this.viewer.scene,
        cartesian
      );
    if (position == null) {
      this.close();
      return;
    }

    let $view = Jquery('#' + this.viewerid + 'tooltip-view');

    //显示内容
    let inhtml;
    if (typeof entity.tooltip === 'object') {
      inhtml = entity.tooltip.html;
      if (entity.tooltip.check) {
        if (!entity.tooltip.check()) {
          this.close();
          return;
        }
      }
    } else {
      inhtml = entity.tooltip;
    }

    if (typeof inhtml === 'function') {
      inhtml = inhtml(entity, cartesian); //回调方法
    }
    if (!inhtml) return;

    Jquery('#' + this.viewerid + 'tooltip-content').html(inhtml);
    $view.show();

    //定位位置
    let x = position.x - $view.width() / 2;
    let y = position.y - $view.height();

    let tooltip = entity.tooltip;
    if (
      tooltip &&
      (typeof tooltip === 'undefined' ? 'undefined' : typeof tooltip) ===
        'object' &&
      tooltip.anchor
    ) {
      x += tooltip.anchor[0];
      y += tooltip.anchor[1];
    } else {
      y -= 15; //默认偏上10像素
    }
    $view.css('transform', 'translate3d(' + x + 'px,' + y + 'px, 0)');
  }

  close() {
    Jquery('#' + this.viewerid + 'tooltip-content').empty();
    Jquery('#' + this.viewerid + 'tooltip-view').hide();

    this.unHighlighPick();
  }

  activateMouseOver(entity, position) {
    if (this.lastEntity === entity) return;

    this.activateMouseOut();

    if (entity.mouseover && typeof entity.mouseover === 'function')
      entity.mouseover(entity, position);

    this.lastEntity = entity;
  }

  activateMouseOut() {
    if (this.lastEntity == null) return;

    if (
      this.lastEntity.mouseout &&
      typeof this.lastEntity.mouseout === 'function'
    )
      this.lastEntity.mouseout(this.lastEntity);
    this.lastEntity = null;
  }

  unHighlighPick() {
    if (Cesium.defined(this.highlighted.feature)) {
      try {
        this.highlighted.feature.color = this.highlighted.originalColor;
      } catch (ex) {}
      this.highlighted.feature = undefined;
    }
  }

  highlighPick(pickedFeature, color) {
    this.unHighlighPick();
    this.highlighted.feature = pickedFeature;

    Cesium.Color.clone(pickedFeature.color, this.highlighted.originalColor);
    if (color && typeof color === 'string')
      color = new Cesium.Color.fromCssColorString(color);
    pickedFeature.color = color || this.defaultHighlightedClr;
  }

  destroy() {
    this.close();

    this.handler.destroy();
    delete this.handler;

    Jquery('#' + this.viewerid + 'tooltip-view').remove();
  }

  get enable() {
    return this._enable;
  }

  set enable(value) {
    this._enable = value;
    if (!value) {
      this.close();
    }
  }
}

export { Tooltip };
