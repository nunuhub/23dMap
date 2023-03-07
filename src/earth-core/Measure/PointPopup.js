/*
 * @Author: liujh
 * @Date: 2020/8/24 8:52
 * @Description:
 */
/* 81 */

import * as Cesium from 'cesium_shinegis_earth';
import Jquery from 'jquery';
import * as Point from '../Tool/Point2';
import * as Util from '../Tool/Util1';
import { getCenterPosition } from '../Draw/EntityAttr/AttrAll53';

//修改来自原先处于tool文件夹下的popup81，现仅用于坐标测量的信息显示。
class PointPopup {
  constructor(viewer, options) {
    this.viewer = viewer;
    this.options = options || {};
    this._isOnly = true;
    this._enable = true;
    this.pickOpen = false;
    this._depthTest = true;
    this.viewerid = viewer._container.id;
    this.popupShow = true;
    this.objPopup = {};
    this._pickFeatureProperties = undefined;
    this._pickType = 0; //{ undefined :0 ,entity : 1,3dtile: 2,feature:3,primitive:4}
    this.identifyTasks3d = [];
    this.highlighted = {
      feature: undefined,
      originalColor: new Cesium.Color()
    };
    //this.defaultHighlightedClr = new Cesium.Color.fromCssColorString("#95e40c")
    this.defaultHighlightedClrCss = '#ff0000';
    //兼容历史接口
    this.getPopupForConfig = Util.getPopupForConfig;
    this.getPopup = Util.getPopup;
    this.currentEleId = undefined;
    this.result = undefined;
    //添加弹出框
    let infoDiv = '<div id="' + this.viewerid + 'pupup-all-view" ></div>';
    let infoDivPop = '<div id="' + this.viewerid + 'mypupup-all-view" ></div>';
    Jquery('#' + this.viewerid).append(infoDiv);
    Jquery('#' + this.viewerid).append(infoDivPop);

    //移动事件
    this.viewer.scene.postRender.addEventListener(this.bind2scene, this);
  }

  //========== 方法 ==========
  show(entity, cartesian, viewPoint) {
    if (entity == null || entity.popup == null) return;

    if (!cartesian) {
      //外部直接传入entity调用show时，可以不传入坐标，自动取值
      cartesian = getCenterPosition(entity);
    }

    //对点状贴地数据做特殊处理，
    let graphic =
      entity.billboard || entity.label || entity.point || entity.model;
    if (graphic && graphic.heightReference) {
      cartesian = this.getPositionValue(cartesian);

      if (
        graphic.heightReference._value ===
        Cesium.HeightReference.CLAMP_TO_GROUND
      ) {
        //贴地点，重新计算高度
        cartesian = Point.updateHeightForClampToGround(this.viewer, cartesian);
      } else if (
        graphic.heightReference._value ===
        Cesium.HeightReference.RELATIVE_TO_GROUND
      ) {
        cartesian = Point.updateHeightForClampToGround(
          this.viewer,
          cartesian,
          true
        );
      }
    }

    let eleId = this.getPopupId(entity);

    this.close(eleId);

    this.objPopup[eleId] = {
      id: entity.id,
      popup: entity.popup,
      entity: entity,
      cartesian: cartesian,
      viewPoint: viewPoint
    };

    //显示内容
    let inhtml;
    if (typeof entity.popup === 'object') inhtml = entity.popup.html;
    else inhtml = entity.popup;
    if (!inhtml) return;

    let that = this;
    if (typeof inhtml === 'function') {
      //回调方法
      inhtml = inhtml(entity, cartesian, function (inhtml) {
        that._showHtml(inhtml, eleId, entity, cartesian, viewPoint);
      });
    }

    if (!inhtml) return;

    this._showHtml(inhtml, eleId, entity, cartesian, viewPoint);
  }
  _showHtml(inhtml, eleId, entity, cartesian, viewPoint) {
    Jquery('#' + this.viewerid + 'pupup-all-view').append(
      '<div id="' +
        eleId +
        '" class="cesium-popup">' +
        '            <a id="' +
        eleId +
        '-popup-close" data-id="' +
        eleId +
        '" class="cesium-popup-close-button cesium-popup-color" >×</a>' +
        '            <div class="cesium-popup-content-wrapper cesium-popup-background">' +
        '                <div class="cesium-popup-content cesium-popup-color">' +
        inhtml +
        '</div>' +
        '            </div>' +
        '            <div class="cesium-popup-tip-container"><div class="cesium-popup-tip cesium-popup-background"></div></div>' +
        '        </div>'
    );
    Jquery('#' + eleId)[0].style.zIndex = 0;
    let that = this;
    Jquery('#' + eleId + '-popup-close').click(function () {
      let eleId = Jquery(this).attr('data-id');
      that.close(eleId, true);
      try {
        entity.entityCollection.remove(entity);
      } catch (e) {
        //yangw sgg里需要点击'x',同时移除地图上的点。
        console.error('');
      }
    });

    //计算显示位置
    let result = this.updateViewPoint(
      eleId,
      cartesian,
      entity.popup,
      viewPoint
    );
    if (!result && this._depthTest) {
      this.close(eleId);
    }
  }
  getPositionValue(position) {
    if (!position) return position;

    let _position;
    if (position instanceof Cesium.Cartesian3) {
      _position = position;
    } else if (typeof position.getValue === 'function') {
      _position = position.getValue(this.viewer.clock.currentTime);
    } else if (
      position._value &&
      position._value instanceof Cesium.Cartesian3
    ) {
      _position = position._value;
    }
    return _position;
  }
  updateViewPoint(eleId, position, popup, point) {
    //  console.log('eleid',eleId)
    let _position = this.getPositionValue(position);
    if (!Cesium.defined(_position)) {
      return false;
    }

    let newpoint = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      this.viewer.scene,
      _position
    );
    if (Cesium.defined(newpoint)) {
      point = newpoint;

      if (this.objPopup[eleId]) this.objPopup[eleId].viewPoint = newpoint;
    }

    if (!Cesium.defined(point)) {
      console.error('wgs84ToWindowCoordinates无法转换为屏幕坐标');
      return false;
    }

    //判断是否在球的背面
    let scene = this.viewer.scene;
    if (this._depthTest && scene.mode === Cesium.SceneMode.SCENE3D) {
      //三维模式下
      let pickRay = scene.camera.getPickRay(point);
      let cartesianNew = scene.globe.pick(pickRay, scene);

      if (cartesianNew) {
        let len = Cesium.Cartesian3.distance(_position, cartesianNew);
        if (len > 1000 * 1000) return false;
      }
    }
    //判断是否在球的背面

    //更新html ，实时更新
    if (
      (typeof popup === 'undefined' ? 'undefined' : typeof popup) ===
        'object' &&
      popup.timeRender &&
      popup.html &&
      typeof popup.html === 'function'
    ) {
      let inhtml = popup.html(
        this.objPopup[eleId] && this.objPopup[eleId].entity,
        _position
      );
      Jquery('#' + eleId + ' .cesium-popup-content').html(inhtml);
    }

    let $view = Jquery('#' + eleId);
    let x = point.x - $view.width() / 2;
    let y = point.y - $view.height();

    if (
      popup &&
      (typeof popup === 'undefined' ? 'undefined' : typeof popup) ===
        'object' &&
      popup.anchor
    ) {
      x += popup.anchor[0];
      y += popup.anchor[1];
    }
    $view.css('transform', 'translate3d(' + x + 'px,' + y + 'px, 0)');

    return true;
  }
  bind2scene() {
    for (let i in this.objPopup) {
      if (Object.hasOwnProperty.call(this.objPopup, i)) {
        let item = this.objPopup[i];
        let entityIsOriginal = item.entity instanceof Cesium.Entity;
        if (
          entityIsOriginal &&
          !item.entity.entityCollection.contains(item.entity)
        ) {
          item.entity = null;
          this.close(i);
          continue;
        }
        //当点的position变化后，popup的位置也更改。 因为目前只用到point，所以有position属性，没有问题。
        //长度测量不该也加到这个this.objPopup里。 检查下。
        item.cartesian = item.entity.position.getValue();
        this.updateViewPoint(i, item.cartesian, item.popup, item.viewPoint);
        /* if (!result && this._depthTest) {
                    this.close(i)
                } */
      }
    }
  }
  getPopupId(entity) {
    return (
      this.viewerid +
      'popup_' +
      ((entity.id || '') + '').replace(new RegExp('[^0-9a-zA-Z_]', 'gm'), '_')
    );
  }
  close(eleId) {
    if (!this._isOnly && eleId) {
      if (
        (typeof eleId === 'undefined' ? 'undefined' : typeof eleId) === 'object'
      )
        //传入参数是eneity对象
        eleId = this.getPopupId(eleId);

      for (let i in this.objPopup) {
        if (Object.hasOwnProperty.call(this.objPopup, i)) {
          if (eleId === this.objPopup[i].id || eleId === i) {
            Jquery('#' + i).remove();
            delete this.objPopup[i];
            break;
          }
        }
      }
    } else {
      Jquery('#' + this.viewerid + 'pupup-all-view').empty();
      this.objPopup = {};
    }
  }

  destroy() {
    this.close();
    this.viewer.scene.postRender.removeEventListener(this.bind2scene, this);
    Jquery('#' + this.viewerid + 'pupup-all-view').remove();
  }

  get isOnly() {
    return this._isOnly;
  }

  set isOnly(val) {
    this._isOnly = val;
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

  //是否打开深度判断（true时判断是否在球背面）
  get depthTest() {
    return this._depthTest;
  }

  set depthTest(value) {
    this._depthTest = value;
  }
}

export { PointPopup };
