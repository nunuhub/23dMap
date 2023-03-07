/**
 * @Author han
 * @Date 2020/11/10 13:32
 */

import { EditPolyline } from './EditPolyline12';

/**
 * 编辑线体类
 * @extends EditBase.EditPolyline
 * @memberOf EditBase.EditPolyline
 */
class EditPolylineVolume extends EditPolyline {
  constructor(opts) {
    super(opts);
  }

  /**
   * 取enity对象的对应矢量数据
   * @returns {DrawBase.DrawPolyline.DrawPolylineVolume}
   */
  getGraphic() {
    return this.entity.polylineVolume;
  }

  /**
   * 修改坐标会回调，提高显示的效率
   */
  changePositionsToCallback() {
    this._positions_draw = this.entity._positions_draw;
  }
}

export { EditPolylineVolume };
