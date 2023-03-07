import * as Cesium from 'cesium_shinegis_earth';
import Jquery from 'jquery';
import { updateHeightForClampToGround } from './Point2';
import { lonlat2cartesian } from './Util3';

class DivPoint {
  constructor(viewer, opts) {
    this.viewer = viewer;

    this.position = null;
    this.position_original = opts.position;
    this.anchor = opts.anchor;

    //兼容历史写法
    if (opts.visibleDistanceMin || opts.visibleDistanceMax) {
      opts.distanceDisplayCondition = new Cesium.DistanceDisplayCondition(
        opts.visibleDistanceMin || 0,
        opts.visibleDistanceMax || 100000
      );
    }

    //按视距距离显示
    this._distanceDisplayCondition = opts.distanceDisplayCondition;
    this._heightReference = Cesium.defaultValue(
      opts.heightReference,
      Cesium.HeightReference.NONE
    );
    this.opts = opts;

    this._visible = true;
    this._depthTest = true;

    //添加html
    this.$view = Jquery('<div></div>');
    this.$view.append(opts.html);
    this.$view.css({
      position: 'absolute',
      left: '0',
      top: '0'
    });
    this.$view.attr('id', opts.id || 'customDom');
    this.$view.appendTo('#' + viewer._container.id);

    let that = this;
    if (opts.click || opts.popup) {
      this.$view.click(function (e) {
        if (opts.popup) viewer.shine.popup.show(opts, that.position);
        if (opts.click) opts.click(opts, that, e);
      });
    }
    if (opts.tooltip) {
      this.$view.hover(
        function () {
          //移入
          viewer.shine.tooltip.show(opts, that.position);
        },
        function () {
          //移出
          viewer.shine.tooltip.close();
        }
      );
    }
    this.$view.on('mousewheel', function () {
      // Jquery("#" + viewer._container.id).trigger(event)
    });

    //移动事件
    viewer.scene.postRender.addEventListener(this.updateViewPoint, this);
  }

  get dom() {
    return this.$view;
  }

  get visible() {
    return this._visible;
  }

  set visible(val) {
    this._visible = val;
    if (val) this.$view.show();
    else this.$view.hide();
  }

  get depthTest() {
    return this._depthTest;
  }

  set depthTest(value) {
    this._depthTest = value;
  }
  getPositionValue(position) {
    if (!position) return position;

    let _position;
    if (position instanceof Cesium.Cartesian3) {
      _position = position;
    } else if (typeof position.getValue == 'function') {
      _position = position.getValue(this.viewer.clock.currentTime);
    } else if (
      position._value &&
      position._value instanceof Cesium.Cartesian3
    ) {
      _position = position._value;
    }
    return _position;
  }
  updateViewPoint() {
    if (!this._visible) return;
    if (!this.position_original) {
      this.$view.hide();
      return;
    }
    if (this._heightReference === Cesium.HeightReference.CLAMP_TO_GROUND) {
      this.position = updateHeightForClampToGround(
        this.viewer,
        this.position_original
      );
    } else if (
      this._heightReference === Cesium.HeightReference.RELATIVE_TO_GROUND
    ) {
      this.position = updateHeightForClampToGround(
        this.viewer,
        this.position_original,
        true
      );
    } else {
      this.position = this.getPositionValue(this.position_original);
    }

    let scene = this.viewer.scene;
    let point = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      scene,
      this.position
    );

    let camera_distance;
    if (scene.mode === Cesium.SceneMode.SCENE3D) {
      camera_distance = Cesium.Cartesian3.distance(
        this.position,
        this.viewer.camera.position
      );
    } else camera_distance = this.viewer.camera.positionCartographic.height;

    if (
      point == null ||
      (this._distanceDisplayCondition &&
        (this._distanceDisplayCondition.near > camera_distance ||
          this._distanceDisplayCondition.far < camera_distance))
    ) {
      if (this.$view.is(':visible')) {
        //如果node是显示则隐藏
        this.$view.hide();
      }
      return;
    }

    //判断是否在球的背面
    if (this._depthTest && scene.mode === Cesium.SceneMode.SCENE3D) {
      //三维模式下
      let pickRay = scene.camera.getPickRay(point);
      let cartesianNew = scene.globe.pick(pickRay, scene);
      if (cartesianNew) {
        let len = Cesium.Cartesian3.distance(this.position, cartesianNew);
        if (len > 1000 * 1000) {
          if (this.$view.is(':visible')) {
            //如果node是显示则隐藏
            this.$view.hide();
          }
          return;
        }
      }
    }
    //判断是否在球的背面

    //求xy位置
    let height = this.$view.height();
    let width = this.$view.width();
    let x = point.x;
    let y = point.y - height;

    if (this.anchor) {
      if (this.anchor[0] == 'center') x -= width / 2; //默认为div下侧中心点
      else x += this.anchor[0];
      y += this.anchor[1];
    } else {
      x -= width / 2; //默认为div下侧中心点
    }
    if (!this.$view.is(':visible')) {
      //如果node是隐藏的则显示node元素
      this.$view.show();
    }

    //求缩放比例
    let scale = 1;
    if (this.opts.scaleByDistance) {
      let sc = this.opts.scaleByDistance; //Cesium.NearFarScalar
      if (camera_distance <= sc.near) {
        scale = sc.nearValue;
      } else if (camera_distance > sc.near && camera_distance < sc.far) {
        // near 10000, nearValue  1.0,, far 100000, farValue  0.1
        scale =
          sc.nearValue +
          ((sc.farValue - sc.nearValue) * (camera_distance - sc.near)) /
            (sc.far - sc.near);
      } else {
        scale = sc.farValue;
      }
    }

    let css_transform =
      'matrix(' + scale + ',0,0,' + scale + ',' + x + ',' + y + ')';
    let css_transform_origin = 'left bottom 0';

    this.$view.css({
      transform: css_transform,
      'transform-origin': css_transform_origin,
      '-ms-transform': css_transform,
      /* IE 9 */
      '-ms-transform-origin': css_transform_origin,
      '-webkit-transform': css_transform,
      /* Safari 和 Chrome */
      '-webkit-transform-origin': css_transform_origin,
      '-moz-transform': css_transform,
      /* Firefox */
      '-moz-transform-origin': css_transform_origin,
      '-o-transform': css_transform,
      /* Opera */
      '-o-transform-origin': css_transform_origin
    });

    if (this.opts.postRender) {
      this.opts.postRender({
        x: x,
        y: y,
        height: height,
        width: width,
        distance: camera_distance
      });
    }
  }

  setVisible(val) {
    this._visible = val;
    if (val) this.$view.show();
    else this.$view.hide();
  }

  setPosition(value) {
    this.position_original = value;
    this.updateViewPoint();
  }

  setLonlat(value) {
    this.position_original = value ? lonlat2cartesian(value) : value;
    this.updateViewPoint();
  }

  destroy() {
    this.viewer.scene.postRender.removeEventListener(
      this.updateViewPoint,
      this
    );
    this.$view.remove();
    this.$view = null;
    this.position = null;
    this.anchor = null;
    this.viewer = null;
  }
}

export { DivPoint };
