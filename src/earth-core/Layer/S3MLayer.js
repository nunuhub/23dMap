/* eslint-disable no-prototype-builtins */
/*
 * @Author: liujh
 * @Date: 2020/8/24 9:40
 * @Description:
 */
/* 90 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import { Tiles3dLayer } from '../Layer/Tiles3dLayer90';
import { S3MTilesLayerProvider } from '../Other/S3M/S3MTilesLayerProvider';
import * as util from '../Tool/Util1';

const S3MLayer = Tiles3dLayer.extend({
  model: null,
  originalCenter: null,
  positionCenter: null,
  boundingSphere: null,
  //添加
  add: function add() {
    if (this.model) {
      if (!this.viewer.scene.primitives.contains(this.model))
        this.viewer.scene.primitives.add(this.model);
    } else {
      this.initData();
    }
  },
  //移除
  remove: function remove() {
    if (this.viewer.scene.primitives.contains(this.model))
      this.viewer.scene.primitives.remove(this.model);

    delete this.model;
  },
  //定位至数据区域
  centerAt: function centerAt(duration) {
    if (this.config.extent || this.config.center) {
      this.viewer.shine.centerAt(this.config.extent || this.config.center, {
        duration: duration,
        isWgs84: true
      });
    } else if (this.boundingSphere) {
      this.viewer.camera.flyToBoundingSphere(this.boundingSphere, {
        offset: new Cesium.HeadingPitchRange(
          0.0,
          -0.5,
          this.boundingSphere.radius * 2
        ),
        duration: duration
      });
    }
  },

  initData: function initData() {
    //默认值
    //this.config.maximumScreenSpaceError = this.config.maximumScreenSpaceError || 2 //默认16
    //this.config.maximumMemoryUsage = this.config.maximumMemoryUsage || 512 //默认512MB
    let url = util.getProxyUrl(this.config).url;
    //this.model = this.viewer.scene.primitives.add(new Cesium.Cesium3DTileset((0, util.getProxyUrl)(this.config)))
    this.model = this.viewer.scene.primitives.add(
      new S3MTilesLayerProvider({ context: this.viewer.scene._context, url })
    );

    this.model.readyPromise
      .then((S3Mtileset) => {
        if (this.readyPromise) {
          this.readyPromise(S3Mtileset);
        }

        //记录模型原始的中心点
        let boundingSphere = S3Mtileset.boundingSphere;
        this.boundingSphere = boundingSphere;

        if (S3Mtileset._root && S3Mtileset._root.transform) {
          this.orginMatrixInverse = Cesium.Matrix4.inverse(
            Cesium.Matrix4.fromArray(S3Mtileset._root.transform),
            new Cesium.Matrix4()
          );

          if (this.config.scale > 0 && this.config.scale !== 1) {
            S3Mtileset._root.transform = Cesium.Matrix4.multiplyByUniformScale(
              S3Mtileset._root.transform,
              this.config.scale,
              S3Mtileset._root.transform
            );
          }
        }

        let position = boundingSphere.center; //模型原始的中心点
        this.positionCenter = position;
        let catographic = Cesium.Cartographic.fromCartesian(position);

        let height = Number(catographic.height.toFixed(2));
        let longitude = Number(
          Cesium.Math.toDegrees(catographic.longitude).toFixed(6)
        );
        let latitude = Number(
          Cesium.Math.toDegrees(catographic.latitude).toFixed(6)
        );
        this.originalCenter = {
          x: longitude,
          y: latitude,
          z: height
        };
        // console.log((this.config.name || "") + " 模型原始位置:" + JSON.stringify(this.originalCenter))

        //转换坐标系【如果是高德谷歌国测局坐标系时转换坐标进行加偏，其它的原样返回】
        let rawCenter = this.viewer.shine.point2map(this.originalCenter);
        if (
          rawCenter.x !== this.originalCenter.x ||
          rawCenter.y !== this.originalCenter.y ||
          this.config.offset != null
        ) {
          this.config.offset = this.config.offset || {}; //配置信息中指定的坐标信息或高度信息
          if (this.config.offset.x && this.config.offset.y) {
            this.config.offset = this.viewer.shine.point2map(
              this.config.offset
            ); //转换坐标系【如果是高德谷歌国测局坐标系时转换坐标进行加偏，其它的原样返回】
          }

          let offsetopt = {
            x: this.config.offset.x || rawCenter.x,
            y: this.config.offset.y || rawCenter.y,
            z: this.config.offset.z || 0,
            heading: this.config.offset.heading,
            axis: this.config.axis,
            scale: this.config.scale,
            transform: this.config.offset.hasOwnProperty('transform')
              ? this.config.offset.transform
              : this.config.offset.heading != null
          };

          if (this.config.offset.z === '-height') {
            offsetopt.z = -height + 5;
            this.updateMatrix(offsetopt);
          } else if (this.config.offset.z === 'auto') {
            this.autoHeight(position, offsetopt);
          } else {
            this.updateMatrix(offsetopt);
          }
        }
        //去除0，避免快速切换视点 陈利军
        if (!this.viewer.shine.isFlyAnimation() && this.config.flyTo) {
          this.centerAt();
        }

        if (this.config.calback) {
          this.config.calback(S3Mtileset);
        }

        if (Cesium.defined(this.config.visibleDistanceMax))
          this.bindVisibleDistance();
      })
      .otherwise((error) => {
        console.error(error);
      });
    this.viewer.scene.camera.setView({
      destination: new Cesium.Cartesian3(
        -2182469.166141913,
        4386579.0994979935,
        4069925.783807108
      ),
      orientation: { heading: 5.213460518239332, pitch: -0.5150671720144846 }
    }); //老数据
  }
});

export { S3MLayer };
