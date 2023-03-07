/* eslint-disable no-prototype-builtins */
/*
 * @Author: liujh
 * @Date: 2020/8/24 9:39
 * @Description:
 */
/* 89 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import { BaseLayer } from './BaseLayer10';

/*class GltfLayer_es6 extends BaseLayer {
    constructor(item, viewer) {
        super(item, viewer)

        this.model = null
        this.hasOpacity = true
    }

    //添加
    add() {
        if (this.model) {
            this.viewer.entities.add(this.model)
        } else {
            this.initData()
        }
    }

    //移除
    remove() {
        this.viewer.entities.remove(this.model)
    }

    //定位至数据区域
    centerAt(duration) {
        if (this.model == null) return

        if (this.config.extent || this.config.center) {
            this.viewer.shine.centerAt(this.config.extent || this.config.center, {
                duration: duration,
                isWgs84: true
            })
        } else {
            let cfg = this.config.position
            this.viewer.shine.centerAt(cfg, {
                duration: duration,
                isWgs84: true
            })
        }
    }

    initData() {
        let cfg = this.config.position
        cfg = this.viewer.shine.point2map(cfg) //转换坐标系

        let position = Cesium.Cartesian3.fromDegrees(cfg.x, cfg.y, cfg.z || 0)
        let heading = Cesium.Math.toRadians(cfg.heading || 0)
        let pitch = Cesium.Math.toRadians(cfg.pitch || 0)
        let roll = Cesium.Math.toRadians(cfg.roll || 0)
        let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll)
        let orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr)

        let modelopts = {
            uri: this.config.url
        }
        for (let key in this.config) {
            if (this.config.hasOwnProperty(key)) {
                if (key === "url" || key === "name" || key === "position" || key === "center" || key === "tooltip" || key === "popup") continue
                modelopts[key] = this.config[key]
            }
        }

        this.model = this.viewer.entities.add({
            name: this.config.name,
            position: position,
            orientation: orientation,
            model: modelopts,
            _config: this.config,
            tooltip: this.config.tooltip,
            popup: this.config.popup
        })
    }

    //设置透明度
    setOpacity(value) {
        if (this.model == null) return
        this.model.model.color = new Cesium.Color.fromCssColorString("#FFFFFF").withAlpha(value)
    }
}*/

const GltfLayer = BaseLayer.extend({
  model: null,
  dataSource: null,
  //添加
  add: function add() {
    if (!this.config.reload && this.dataSource) {
      //this.config.reload可以外部控制每次都重新请求数据
      this.viewer.dataSources.add(this.dataSource);
    } else {
      this.dataSource = new Cesium.CustomDataSource(this.config.name);
      this.viewer.dataSources.add(this.dataSource);
      this.initData();
    }
  },
  //移除
  remove: function remove() {
    this.viewer.dataSources.remove(this.dataSource);
  },
  //定位至数据区域
  centerAt: function centerAt(duration) {
    if (this.model == null) return;

    if (this.config.extent || this.config.center) {
      this.viewer.shine.centerAt(this.config.extent || this.config.center, {
        duration: duration,
        isWgs84: true
      });
    } else {
      let cfg = this.config.position;
      this.viewer.shine.centerAt(cfg, {
        duration: duration,
        isWgs84: true
      });
    }
  },

  initData: function initData() {
    let cfg = this.config.position;
    cfg = this.viewer.shine.point2map(cfg); //转换坐标系

    let scale = this.config.scale || 1;
    let position = Cesium.Cartesian3.fromDegrees(cfg.x, cfg.y, cfg.z || 0);
    let heading = Cesium.Math.toRadians(cfg.heading || 0);
    let pitch = Cesium.Math.toRadians(cfg.pitch || 0);
    let roll = Cesium.Math.toRadians(cfg.roll || 0);
    let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
    let orientation = Cesium.Transforms.headingPitchRollQuaternion(
      position,
      hpr
    );

    let modelopts = {
      uri: this.config.url,
      scale: scale
    };
    for (let key in this.config) {
      if (this.config.hasOwnProperty(key)) {
        if (
          key === 'url' ||
          key === 'name' ||
          key === 'position' ||
          key === 'center' ||
          key === 'tooltip' ||
          key === 'popup'
        )
          continue;
        modelopts[key] = this.config[key];
      }
    }

    this.model = this.dataSource.entities.add({
      name: this.config.name,
      position: position,
      orientation: orientation,
      model: modelopts,
      _config: this.config,
      tooltip: this.config.tooltip,
      popup: this.config.popup
    });
  },
  //设置透明度
  hasOpacity: true,
  setOpacity: function setOpacity(value) {
    if (this.model == null) return;
    this.model.model.color = new Cesium.Color.fromCssColorString(
      '#FFFFFF'
    ).withAlpha(value);
  }
});
export { GltfLayer };
