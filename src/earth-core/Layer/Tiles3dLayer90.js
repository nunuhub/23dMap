/* eslint-disable no-prototype-builtins */
/* eslint no-empty: ["error", { "allowEmptyCatch": true }] */
/*
 * @Author: liujh
 * @Date: 2020/8/24 9:40
 * @Description:
 */
/* 90 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import { BaseLayer } from './BaseLayer10';
import * as util from '../Tool/Util1';
import * as tilesetTool from './Tileset55';
import * as point from '../Tool/Point2';

const Tiles3dLayer = BaseLayer.extend({
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
    if (Cesium.defined(this.config.visibleDistanceMax))
      this.viewer.scene.camera.changed.removeEventListener(
        this.updateVisibleDistance,
        this
      );

    if (this.viewer.scene.primitives.contains(this.model))
      this.viewer.scene.primitives.remove(this.model);

    delete this.model;
    delete this.boundingSphere;
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
    this.config.maximumScreenSpaceError =
      this.config.maximumScreenSpaceError || 2; //默认16
    this.config.maximumMemoryUsage = this.config.maximumMemoryUsage || 512; //默认512MB

    this.model = this.viewer.scene.primitives.add(
      new Cesium.Cesium3DTileset((0, util.getProxyUrl)(this.config))
    );
    if (!this.config.dthurl) {
      this.model._config = this.config;

      for (let key in this.config) {
        if (this.config.hasOwnProperty(key)) {
          if (
            key === 'url' ||
            key === 'type' ||
            key === 'style' ||
            key === 'classificationType'
          )
            continue;
          try {
            this.model[key] = this.config[key];
          } catch (e) {}
        }
      }
    }
    if (this.config.style) {
      //设置style
      this.model.style = new Cesium.Cesium3DTileStyle(this.config.style);
    }

    let that = this;
    // begin 纪舒敏
    //初始化伴有倾斜摄影单体化tiles
    if (this.config.dthurl) {
      that.viewer.dthTileset;
      that.viewer.dthTileset = new Cesium.Cesium3DTileset({
        url: that.config.dthurl,
        classificationType: Cesium.ClassificationType.CESIUM_3D_TILE
      });
      that.viewer.dthTileset.style = new Cesium.Cesium3DTileStyle({
        color: 'rgba(255, 255, 255, 0.01)'
      });
      that.sthModel = that.viewer.scene.primitives.add(that.viewer.dthTileset);
      that.sthModel._config = that.config;
      for (let key in that.config) {
        if (that.config.hasOwnProperty(key)) {
          if (
            key === 'url' ||
            key === 'type' ||
            key === 'style' ||
            key === 'classificationType'
          )
            continue;
          try {
            this.sthModel[key] = that.config[key];
          } catch (e) {}
        }
      }

      if (that.viewer.cx) {
        that.viewer.dthTileset.show = true;
      }
      // if (this.config.infZD) {
      //     that.viewer.dthTileset.infZD = this.config.infZD
      // }
    }
    //3dtile白模按照属性字段设为不同颜色
    if (this.config.style) {
      if (this.config.style.colorty && window.color_type) {
        let color_3dtile = window.color_type;
        let r, g, b;
        let colorty = that.config.style.colorty;
        let proID = that.config.style.proID;

        let arrayCondition = [];
        for (let j = 0; j < color_3dtile[colorty].type.length; j++) {
          let tyname = color_3dtile[colorty].type[j];
          r = color_3dtile[colorty].color[tyname][0];
          g = color_3dtile[colorty].color[tyname][1];
          b = color_3dtile[colorty].color[tyname][2];
          let tycolor = 'rgba(' + r + ',' + g + ',' + b + ',' + 1 + ')';
          let tycondition = '${' + proID + "} === '" + tyname + "'";
          let item = [tycondition, tycolor];
          arrayCondition.push(item);
        }
        arrayCondition.push(['true', 'rgba(255,235,175,' + 1 + ')']);

        that.model.style = new Cesium.Cesium3DTileStyle({
          color: {
            conditions: arrayCondition
          }
        });
      }
    }
    //end
    this.model.readyPromise.then((tileset) => {
      if (this.readyPromise) {
        this.readyPromise(tileset);
      }

      if (this.hasOpacity && this._opacity !== 1) {
        //透明度
        this.setOpacity(this._opacity);
      }

      //记录模型原始的中心点
      let boundingSphere = tileset.boundingSphere;
      this.boundingSphere = boundingSphere;

      if (tileset._root && tileset._root.transform) {
        this.orginMatrixInverse = Cesium.Matrix4.inverse(
          Cesium.Matrix4.fromArray(tileset._root.transform),
          new Cesium.Matrix4()
        );

        if (this.config.scale > 0 && this.config.scale !== 1) {
          tileset._root.transform = Cesium.Matrix4.multiplyByUniformScale(
            tileset._root.transform,
            this.config.scale,
            tileset._root.transform
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
          this.config.offset = this.viewer.shine.point2map(this.config.offset); //转换坐标系【如果是高德谷歌国测局坐标系时转换坐标进行加偏，其它的原样返回】
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

      if (this.config.clippingPolygonPoints)
        tilesetTool.addClippingPolygon(
          tileset,
          this.config.clippingPolygonPoints
        );
      /*  //// 上虞2018测试用例
            tilesetTool.addClippingPolygon(tileset,[
                [120.872443, 30.018867, 0],
                [120.868918, 30.017778, 0],
                [120.871546, 30.014059, 0],
                [120.874824, 30.013998, 0],
                [120.875705, 30.01891, 0]
            ]);*/

      //去除0，避免快速切换视点 陈利军
      if (!this.viewer.shine.isFlyAnimation() && this.config.flyTo) {
        this.centerAt();
      }

      if (this.config.calback) {
        this.config.calback(tileset);
      }

      if (Cesium.defined(this.config.visibleDistanceMax))
        this.bindVisibleDistance();
    });
  },

  autoHeight: function autoHeight(position, offsetopt) {
    let that = this;
    //求地面海拔
    point.terrainPolyline({
      viewer: this.viewer,
      positions: [position, position],
      calback: function calback(raisedPositions, noHeight) {
        if (raisedPositions == null || raisedPositions.length === 0 || noHeight)
          return;

        let point = point.formatPosition(raisedPositions[0]);
        let offsetZ = point.z - that.originalCenter.z + 1;
        offsetopt.z = offsetZ;

        that.updateMatrix(offsetopt);
      }
    });
  },
  //变换原点坐标
  updateMatrix: function updateMatrix(offsetopt) {
    if (this.model == null) return;

    // console.log((this.config.name || "") + " 模型修改后位置:" + JSON.stringify(offsetopt))

    this.positionCenter = Cesium.Cartesian3.fromDegrees(
      offsetopt.x,
      offsetopt.y,
      offsetopt.z
    );

    tilesetTool.updateMatrix(this.model, offsetopt);
  },

  hasOpacity: true,
  //设置透明度
  setOpacity: function setOpacity(value) {
    this._opacity = value;
    let that = this;
    if (this.config.onSetOpacity && window.color_type) {
      this.config.onSetOpacity(value); //外部自定义处理
    } else {
      // begin 纪舒敏 3dtile opacity改变
      let color_3dtile = window.color_type;
      let r, g, b, o;
      o = value;
      if (this.model) {
        if (!that.config.style) {
          that.model.style = new Cesium.Cesium3DTileStyle({
            color: 'color() *vec4(' + value + ')'
          });
        } else {
          if (
            this.config.style.color &&
            typeof this.config.style.color == 'string'
          ) {
            let rgba = Cesium.Color.fromAlpha(
              Cesium.Color.fromCssColorString(that.config.style.color),
              o
            ); //that.config.style.color.substr(4, 11);
            let color = rgba.toCssColorString(); //"rgba(" + rgb + "," + o + ")";
            that.model.style = new Cesium.Cesium3DTileStyle({
              color: color
            });
          }
          ///<----修正原有配色方案透明度设置bug clj
          if (this.config.style.color.conditions) {
            let styleArray = this.config.style.color.conditions;
            for (let index = 0; index < styleArray.length; index++) {
              const element = styleArray[index];
              let colorstyle = Cesium.Color.fromAlpha(
                Cesium.Color.fromCssColorString(element[1]),
                o
              );
              element[1] = colorstyle.toCssColorString();
            }
            let style = new Cesium.Cesium3DTileStyle();
            style.color = {
              conditions: styleArray
            };
            that.model.style = style;
          }
          if (this.config.style.colorty) {
            let colorty = that.config.style.colorty;
            let proID = that.config.style.proID;
            let arrayCondition = [];
            for (let j = 0; j < color_3dtile[colorty].type.length; j++) {
              let tyname = color_3dtile[colorty].type[j];
              r = color_3dtile[colorty].color[tyname][0];
              g = color_3dtile[colorty].color[tyname][1];
              b = color_3dtile[colorty].color[tyname][2];
              let tycolor = 'rgba(' + r + ',' + g + ',' + b + ',' + o + ')';
              let tycondition = '${' + proID + "} === '" + tyname + "'";
              let item = [tycondition, tycolor];
              arrayCondition.push(item);
            }
            arrayCondition.push(['true', 'rgba(255,235,175,' + o + ')']);
            let style = new Cesium.Cesium3DTileStyle();
            style.color = {
              conditions: arrayCondition
            };
            that.model.style = style;
          }
        }
      }
      //end
    }
  },
  showClickFeature: function showClickFeature(value) {
    if (this.model) {
      this.model._config.showClickFeature = value;
    } else {
      this.config.showClickFeature = value;
    }
  },
  //绑定
  bindVisibleDistance: function bindVisibleDistance() {
    this.viewer.scene.camera.changed.addEventListener(
      this.updateVisibleDistance,
      this
    );
  },
  updateVisibleDistance: function updateVisibleDistance() {
    if (!this._visible) return;
    if (this.viewer.scene.mode !== Cesium.SceneMode.SCENE3D) return;
    if (!this.model || !this.boundingSphere || !this.positionCenter) return;

    let camera_distance = Cesium.Cartesian3.distance(
      this.positionCenter,
      this.viewer.camera.position
    );
    if (camera_distance > this.config.visibleDistanceMax + 100000) {
      //在模型的外包围外
      this.model.show = false;
    } else {
      let target = point.pickCenterPoint(this.viewer.scene); //取屏幕中心点坐标
      if (Cesium.defined(target)) {
        let camera_distance = Cesium.Cartesian3.distance(
          target,
          this.viewer.camera.position
        );
        this.model.show = camera_distance < this.config.visibleDistanceMax;
      } else {
        this.model.show = true;
      }
    }
  }
});

export { Tiles3dLayer };
