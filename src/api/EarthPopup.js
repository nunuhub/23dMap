import { DivPoint } from '../earth-core/Tool/DivPoint105';

class Popup {
  /**
   * 构造函数
   * @param {*} earth 地球对象
   * @param {*} options 配置对象
   * @param {*} options.element 弹窗html元素
   */
  constructor(earth, options) {
    this.earth = earth;
    this.earthPopup = new DivPoint(this.earth.viewer, {
      html: options.element
    });
  }

  /**
   * 设置弹窗位置
   * @param {Array} position 坐标位置[x, y, z]
   */
  setPosition(position) {
    this.earthPopup.setLonlat(position);
  }

  /**
   * 销毁弹窗
   */
  destroy() {
    this.earthPopup.destroy();
  }
}

export default Popup;
