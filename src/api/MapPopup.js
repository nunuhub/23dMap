import Overlay from 'ol/Overlay';

class Popup {
  /**
   * 构造函数
   * @param {*} map 地图对象
   * @param {*} options 配置对象
   * @param {*} options.element 弹窗html元素
   */
  constructor(map, options) {
    this.map = map;
    this.overlayTip = new Overlay({
      element: options.element,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      },
      positioning: 'bottom-center'
    });
    this.map.addOverlay(this.overlayTip);
  }

  /**
   * 设置弹窗位置
   * @param {Array} position 坐标位置[x, y]
   */
  setPosition(position) {
    this.overlayTip.setPosition(position);
  }

  /**
   * 销毁弹窗
   */
  destroy() {
    this.map.removeOverlay(this.overlayTip);
  }
}

export default Popup;
