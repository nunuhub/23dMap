import 'ol/ol.css';
import View from 'ol/View';
import { defaults as defaultControls } from 'ol/control';
import CoreMap from '../map-core/ShineMap';
import { transformCoordinate, transformExtent } from '../utils/format';
import { mapDefaultLayers } from '../utils/config/map-config';

class ShineMap extends CoreMap {
  constructor(element, options = {}) {
    const {
      center = [111.7579, 31.6736],
      zoom = 5,
      projection = 'EPSG:4490',
      minZoom,
      maxZoom,
      minResolution,
      maxResolution,
      constrainResolution
    } = options;
    const olOptions = {
      target: element,
      transformProjection: projection,
      layers: mapDefaultLayers,
      view: new View({
        center,
        zoom,
        projection,
        minZoom,
        maxZoom,
        minResolution,
        maxResolution,
        constrainResolution
      }),
      controls: defaultControls({
        zoom: false
      })
    };
    super(olOptions);
  }

  /**
   * 强制重新计算地图视口大小 在第三方代码更改地图视口的大小时调用
   */
  resize() {
    this.updateSize();
  }

  /**
   * 地图缩放至指定位置
   * @param {object} position 位置信息
   * @param {array} position.center 中心点
   * @param {array} position.zoom 地图层级
   * @param {object} options 其他配置信息
   * @param {number} options.duration 动画过度的时长控制，单位 ms，默认值800
   * @param {string} options.projection center的坐标系信息 默认为当前地图坐标系
   */
  centerAt(position, { duration = 800, projection } = {}) {
    const defaultCenter = this.getView().getCenter();
    const defaultZoom = this.getView().getZoom();
    let { center = defaultCenter, zoom = defaultZoom } = position;
    const mapProjection = this.getView().getProjection().getCode();
    if (position.center && projection && mapProjection !== projection) {
      center = transformCoordinate(center, projection, mapProjection);
    }
    this.getView().animate({
      center,
      zoom,
      duration
    });
  }

  /**
   * 设置当前地图显示范围
   * @param {array} extent [minX, minY, maxX, maxY]
   * @param {number} options.duration 动画过度的时长控制，单位 ms 默认为800
   * @param {string} options.projection extent的坐标系信息 默认为当前地图坐标系
   * @param {array} options.padding  距离边框的内边距(以像素为单位)，数组中的值是顶部、右侧、底部和左侧填充。
   */
  setExtent(
    extent,
    { duration = 800, projection, padding = [0, 0, 0, 0] } = {}
  ) {
    let theExtent = extent;
    const mapProjection = this.getView().getProjection().getCode();
    if (projection && projection !== mapProjection) {
      theExtent = transformExtent(extent, projection, mapProjection);
    }
    this.getView().fit(theExtent, {
      padding,
      maxZoom: this.getView().getMaxZoom(),
      duration
    });
  }

  /**
   * 获取当前地图窗口范围
   * @returns extent [minX, minY, maxX, maxY]
   */
  getExtent() {
    return super.getExtent();
  }

  /**
   * 获取当前地图中心点
   * @returns center [x, y]
   */
  getCenter() {
    return this.getView().getCenter();
  }

  /**
   * 获取当前地图zoom
   * @returns zoom
   */
  getZoom() {
    return this.getView().getZoom();
  }

  /**
   * 添加图层
   * @param {object} data 图层配置信息
   */
  addLayer(data) {
    super.addLayer(data);
  }

  /**
   * 移除图层
   * @param {object} data 图层配置信息
   */
  removeLayer(data) {
    super.removeLayer(data);
  }

  /**
   * 获取用作地图视口的元素
   * @returns HTMLElement
   */
  getViewport() {
    return super.getViewport().parentNode;
  }
}

export default ShineMap;
