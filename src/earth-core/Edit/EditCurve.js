/**
 * @Author han
 * @Date 2020/11/10 11:14
 */
import { line2curve } from '../Draw/EntityAttr/PolylineAttr15';
import { EditPolyline } from './EditPolyline12';

/**
 * 编辑曲线类
 * @extends EditBase.EditPolyline
 * @memberOf EditBase.EditPolyline
 */
class EditCurve extends EditPolyline {
  constructor(opts) {
    super(opts);
  }

  getPositionsFromEntity() {
    this._positions_draw = this.entity._positions_draw;
    this._positions_show =
      this.entity._positions_show || this.getGraphic().positions.getValue();
  }
  changePositionsToCallback() {}
  /**
   * 坐标位置相关
   * 编辑时，更新_positions_show
   */
  updateAttrForEditing() {
    if (this._positions_draw == null || this._positions_draw.length < 3) {
      this._positions_show = this._positions_draw;
      this.entity._positions_show = this._positions_show;
      return;
    }

    this._positions_show = line2curve(
      this._positions_draw,
      this.entity.attribute.style.closure
    );
    this.entity._positions_show = this._positions_show;
  }

  /**
   * 图形编辑结束后调用
   */
  finish() {
    this.entity._positions_show = this._positions_show;
    this.entity._positions_draw = this._positions_draw;
  }
}

export { EditCurve };
