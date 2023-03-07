import 'cesium_shinegis_earth/Build/Cesium/Widgets/widgets.css';
import '../earth-core/Assets/Css/SGEStyle.css';
import * as SGE from '../earth-core/Entry57';
import { transformCoordinate, transformExtent } from '../utils/format';
import { earthDefaultConfig } from '../utils/config/earth-config';

class ShineEarth {
  constructor(element, options = {}) {
    const {
      center = [111.7579, 31.6736],
      height = 6149142.56,
      projection = 'EPSG:4490',
      heading = 0,
      roll = 0,
      pitch = -90,
      map
    } = options;
    const coordinate = transformCoordinate(center, projection, 'EPSG:4490');
    const earthConfig = {
      ...earthDefaultConfig,
      center: {
        heading,
        roll,
        x: coordinate[0],
        y: coordinate[1],
        z: height,
        pitch
      }
    };
    SGE.Map.createMap({
      id: element,
      data: earthConfig,
      map2d: map,
      is2d: map ? 1 : 2,
      success: (viewer) => {
        this.viewer = viewer;
      }
    });
    this.layerManager = this.viewer.shine.layerManager;
  }

  /**
   * 强制重新计算地球视口大小 在第三方代码更改地球视口的大小时调用
   */
  resize() {
    this.viewer.forceResize();
  }

  /**
   * 地球缩放至指定位置
   * @param {object} position 位置信息
   * @param {array} position.center 中心点
   * @param {number} position.height 相机高度
   * @param {number} position.heading 方位角
   * @param {number} position.roll 旋转角
   * @param {number} position.pitch 倾斜角
   * @param {object} options 其他配置信息
   * @param {number} options.duration 动画过度的时长控制，单位 ms，默认值是内部自动计算的一个动态值
   * @param {string} options.projection center的坐标系信息 默认为'EPSG:4490'
   */
  centerAt(position, { duration, projection = 'EPSG:4490' } = {}) {
    const {
      x,
      y,
      z,
      heading: defaultHeading,
      roll: defaultRoll,
      pitch: defaultPitch
    } = this.viewer.shine.getCameraView(true);

    let {
      center = [x, y],
      height = z,
      heading = defaultHeading,
      roll = defaultRoll,
      pitch = defaultPitch
    } = position;
    const coordinate = transformCoordinate(center, projection, 'EPSG:4490');
    this.viewer.shine.centerAt(
      { x: coordinate[0], y: coordinate[1], z: height, heading, roll, pitch },
      {
        duration: duration != null ? duration / 1000 : undefined,
        isWgs84: true
      }
    );
  }

  /**
   * 设置当前地球显示范围
   * @param {array} extent [minX, minY, maxX, maxY]
   * @param {number} options.duration 动画过度的时长控制，单位 ms
   * @param {string} options.projection extent的坐标系信息 默认为'EPSG:4490'
   */
  setExtent(extent, { duration, projection = 'EPSG:4490' } = {}) {
    let theExtent = extent;
    if (projection !== 'EPSG:4490') {
      theExtent = transformExtent(extent, projection, 'EPSG:4490');
    }
    const earthExtent = {
      xmin: theExtent[0],
      ymin: theExtent[1],
      xmax: theExtent[2],
      ymax: theExtent[3]
    };

    this.viewer.shine.centerAt(earthExtent, {
      duration: duration != null ? duration / 1000 : undefined,
      isWgs84: true
    });
  }

  /**
   * 获取当前地球窗口范围
   * @returns extent [minX, minY, maxX, maxY]
   */
  getExtent() {
    const earthExtent = this.viewer.shine.getExtent(true);
    return [
      earthExtent.xmin,
      earthExtent.ymin,
      earthExtent.xmax,
      earthExtent.ymax
    ];
  }

  /**
   * 获取当前地球中心点
   * @returns center [x, y]
   */
  getCenter() {
    const { x, y } = this.viewer.shine.getCameraView(true);
    return [x, y];
  }

  /**
   * 获取当前地球视高
   * @returns z
   */
  getHeight() {
    const { z } = this.viewer.shine.getCameraView(true);
    return z;
  }

  /**
   * 获取当前地球zoom  由视高计算得来，并不十分准确
   * @returns zoom
   */
  getZoom() {
    const { z } = this.viewer.shine.getCameraView(true);
    const zoom = this.viewer.shine.getLevel(z);
    return zoom;
  }

  /**
   * 获取视角方向等属性
   * @returns Object
   */
  getOrientation() {
    const { heading, roll, pitch } = this.viewer.shine.getCameraView(true);
    return { heading, roll, pitch };
  }

  /**
   * 添加图层
   * @param {object} data 图层配置信息
   */
  addLayer(data) {
    data.visible = true;
    this.viewer.shine.addLayer(data);
  }

  /**
   * 移除图层
   * @param {object} data 图层配置信息
   */
  removeLayer(data) {
    this.viewer.shine.removeLayer(data);
  }

  getViewer() {
    return this.viewer;
  }

  olcs3dUpdate() {
    this.viewer.shine.ol3d.update();
  }
  /**
   * 是否进入地下
   * @func groundUnder
   * @param opts {isUnderGround: false} false 为进入地下，默认为true即不能进入地下
   */
  groundUnder(opt) {
    this.viewer.shine.groundUnder(opt);
  }
  /**
   * 球体表面透明
   * @func groundTranslucency
   * @param opts {isTranslucency: true, alpha: 0.7} false 为进入地下，默认为true即不能进入地下
   * @param isTranslucency 为 true 进入透明模式，默认为false
   * @param alpha 0-1 透明度
   * @param fadeByDistance 是否自适用视距
   */
  groundTranslucency(opt) {
    this.viewer.shine.groundTranslucency(opt);
  }
  useTranslucencyRectangle(rings) {
    this.viewer.shine.useTranslucencyRectangle(rings);
  }

  /**
   * 获取用作地球视口的元素
   * @returns HTMLElement
   */
  getViewport() {
    return this.viewer.container;
  }
}

export default ShineEarth;
