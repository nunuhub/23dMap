/**
 * @Author han
 * @Date 2020/11/10 17:20
 */

import { EditPolygon } from './EditPolygon16';

/**
 * 编辑面Ex类
 * @extends EditBase.EditPolyline.EditPolygon
 * @memberOf EditBase.EditPolyline.EditPolygon
 */
class EditPolygonEx extends EditPolygon {
  constructor(opts) {
    super(opts);

    this._hasMidPoint = false;
  }

  /**
   * 修改坐标会回调，提高显示的效率
   */
  changePositionsToCallback() {
    this._positions_draw = this.entity._positions_draw;
    this._positions_show = this.entity._positions_show;
  }

  /**
   * 坐标位置相关
   */
  updateAttrForEditing() {
    if (
      this._positions_draw == null ||
      this._positions_draw.length < this._minPointNum
    ) {
      this._positions_show = this._positions_draw;
      return;
    }

    this._positions_show = this.getShowPositions(
      this._positions_draw,
      this.entity.attribute
    );

    this.entity._positions_show = this._positions_show;
  }

  /**
   * 子类中重写 ，根据标绘绘制的点，生成显示的边界点
   * @param positions
   * @param attribute
   * @returns {*}
   */
  getShowPositions(positions) {
    return positions;
  }

  /**
   * 图形编辑结束后调用
   */
  finish() {
    this.entity._positions_show = this._positions_show;
    this.entity._positions_draw = this._positions_draw;
  }
}

export { EditPolygonEx };
