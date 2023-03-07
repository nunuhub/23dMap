/**
 * @Author han
 * @Date 2020/11/10 13:52
 */

import { EditPolygon } from './EditPolygon16';
import {
  setPositionsHeight,
  updateHeightForClampToGround
} from '../Tool/Point2';
import { createDragger } from './Dragger6';

/**
 * 编辑矩形类
 * @extends EditBase.EditPolyline.EditPolygon
 * @memberOf EditBase.EditPolyline.EditPolygon
 */
class EditRectangle extends EditPolygon {
  constructor(opts) {
    super(opts);
  }

  /**
   * 取enity对象的对应矢量数据
   * @returns {Cesium.RectangleGraphics}
   */
  getGraphic() {
    return this.entity.rectangle;
  }
  getPositionsFromEntity() {
    this._positions_draw = this.entity._positions_draw;
  }
  changePositionsToCallback() {}

  /**
   * 图形编辑结束后调用
   */
  finish() {
    this.entity._positions_draw = this._positions_draw;
  }

  /**
   * 是否贴地
   * @returns {boolean}
   */
  isClampToGround() {
    return this.entity.attribute.style.clampToGround;
  }

  /**
   * 绑定拖动把手
   */
  bindDraggers() {
    let that = this;

    let clampToGround = this.isClampToGround();
    let positions = this.getPosition();

    for (let i = 0, len = positions.length; i < len; i++) {
      let position = positions[i];

      if (this.getGraphic().height !== undefined) {
        let newHeight = this.getGraphic().height.getValue(
          this.viewer.clock.currentTime
        );
        position = setPositionsHeight(position, newHeight);
      }

      if (clampToGround) {
        //贴地时求贴模型和贴地的高度
        position = updateHeightForClampToGround(this.viewer, position);
      }

      //各顶点
      let dragger = createDragger(this.dataSource, {
        position: position,
        //clampToGround: clampToGround,
        onDrag: function onDrag(dragger, position) {
          if (that.getGraphic().height !== undefined) {
            let newHeight = that
              .getGraphic()
              .height.getValue(that.viewer.clock.currentTime);
            position = setPositionsHeight(position, newHeight);
            dragger.position = position;
          }

          positions[dragger.index] = position;

          //============高度调整拖拽点处理=============
          if (that.heightDraggers && that.heightDraggers.length > 0) {
            let extrudedHeight = that
              .getGraphic()
              .extrudedHeight.getValue(that.viewer.clock.currentTime);
            that.heightDraggers[dragger.index].position = setPositionsHeight(
              position,
              extrudedHeight
            );
          }
        }
      });
      dragger.index = i;
      this.draggers.push(dragger);
    }

    //创建高程拖拽点
    if (this.getGraphic().extrudedHeight) this.bindHeightDraggers();
    //创建矩形平面的高度拖拽点。用于裁切功能。
    if (this.entity.attribute.style.isMoveHeightPlane)
      this.bindMoveHeightDraggers();
    // 创建盒子拖拽点
    if (this.entity.attribute.style.isBoxbelow) this.bindBoxDraggers();
  }
}

export { EditRectangle };
