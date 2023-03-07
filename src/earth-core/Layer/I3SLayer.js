/*
 * @Author: liujh
 * @Date: 2022/12/11 9:40
 * @Description:支持加载 cesium 原生i3slayer服务
 */

import * as Cesium from 'cesium_shinegis_earth';
import { BaseLayer } from './BaseLayer10';
import * as tilesetTool from './Tileset55';
import * as point from '../Tool/Point2';

const I3SLayer = BaseLayer.extend({
  provider: null,
  model: null,
  center: null,
  originalCenter: null,
  positionCenter: null,
  boundingSphere: null,
  //添加
  add: function add() {
    if (this.provider) {
      if (!this.viewer.scene.primitives.contains(this.provider))
        this.viewer.scene.primitives.add(this.provider);
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

    if (this.viewer.scene.primitives.contains(this.provider))
      this.viewer.scene.primitives.remove(this.provider);

    delete this.model;
    delete this.provider;
    delete this.boundingSphere;
  },
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
    } else if (this.center) {
      this.viewer.camera.setView({
        destination: Cesium.Ellipsoid.WGS84.cartographicToCartesian(this.center)
      });
    }
  },

  initData: function initData() {
    const i3sUrl = this.config.url;

    // Create i3s and Cesium3DTileset options to pass optional parameters useful for debugging and visualizing
    const cesium3dTilesetOptions = {
      skipLevelOfDetail: this.config.skipLevelOfDetail
        ? this.config.skipLevelOfDetail
        : false,
      debugShowBoundingVolume: false
    };
    const i3sOptions = {
      url: i3sUrl,
      traceFetches: false, // for tracing I3S fetches
      cesium3dTilesetOptions: cesium3dTilesetOptions // options for internal Cesium3dTileset
    };

    // Create I3S data provider
    const i3sProvider = new Cesium.I3SDataProvider(i3sOptions);

    //this.viewer.scene.primitives.add(i3sProvider);
    this.provider = this.viewer.scene.primitives.add(i3sProvider);
    this.provider.readyPromise.then((provider) => {
      if (this.readyPromise) {
        this.readyPromise(provider);
      }

      if (this.hasOpacity && this._opacity !== 1) {
        //透明度
        this.setOpacity(this._opacity);
      }
      //记录模型原始的中心点
      let tileset;
      let i3sLayer = provider.layers[0]; //provider.layers[0]后期存在复合provider优化
      let layerType = i3sLayer._data.layerType;

      if (layerType == '3DObject') {
        tileset = i3sLayer.tileset;
      } else if (layerType == 'Building') {
        this.center = Cesium.Rectangle.center(provider.extent);
        this.center.height = 500.0;
      } else if (layerType == 'IntegratedMesh') {
        tileset = i3sLayer.tileset;
      }
      if (!tileset) return;
      let boundingSphere = tileset.boundingSphere;
      this.boundingSphere = boundingSphere;
      this.model = tileset;

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
          // eslint-disable-next-line no-prototype-builtins
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
      if (this.provider) {
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
    if (this.provider) {
      this.provider._config.showClickFeature = value;
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
    if (!this.provider || !this.boundingSphere || !this.positionCenter) return;

    let camera_distance = Cesium.Cartesian3.distance(
      this.positionCenter,
      this.viewer.camera.position
    );
    if (camera_distance > this.config.visibleDistanceMax + 100000) {
      //在模型的外包围外
      this.provider.show = false;
    } else {
      let target = point.pickCenterPoint(this.viewer.scene); //取屏幕中心点坐标
      if (Cesium.defined(target)) {
        let camera_distance = Cesium.Cartesian3.distance(
          target,
          this.viewer.camera.position
        );
        this.provider.show = camera_distance < this.config.visibleDistanceMax;
      } else {
        this.provider.show = true;
      }
    }
  }
});
export { I3SLayer };
