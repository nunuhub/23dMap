/**
 * @Author han
 * @Date 2020/11/10 13:41
 */

import { EditPolyline } from './EditPolyline12';
import { setPositionsHeight } from '../Tool/Point2';

/**
 * 编辑走廊类
 * @extends EditBase.EditPolyline
 * @memberOf EditBase.EditPolyline
 */
class EditCorridor extends EditPolyline {
  constructor(opts) {
    super(opts);
  }

  /**
   * 取enity对象的对应矢量数据
   * @returns {Cesium.CorridorGraphics}
   */
  getGraphic() {
    return this.entity.corridor;
  }

  /**
   * 继承父类，根据属性更新坐标
   * @param position
   * @returns {[position]} 坐标数组
   */
  updatePositionsHeightByAttr(position) {
    if (this.getGraphic().height !== undefined) {
      let newHeight = this.getGraphic().height.getValue(
        this.viewer.clock.currentTime
      );
      position = setPositionsHeight(position, newHeight);
    }
    return position;
  }
}

export { EditCorridor };
