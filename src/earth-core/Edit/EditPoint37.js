import * as draggerCtl from './Dragger6';
import { EditBase } from './EditBase18';
import { message } from '../Tool/ToolTip4';

/**
 * 编辑点类
 * @extends EditBase
 * @memberOf EditBase
 */
class EditPoint extends EditBase {
  constructor(opts) {
    super(opts);
  }

  getPosition() {
    return this.entity.position.getValue
      ? this.entity.position.getValue()
      : this.entity.position;
  }
  /**
   * 外部更新位置
   * @param position {position} 坐标
   */
  setPositions(position) {
    this.entity.position = position;
  }

  /**
   * 绑定拖动把手
   */
  bindDraggers() {
    let that = this;

    this.entity.draw_tooltip = message.dragger.def;
    draggerCtl.createDragger(this.dataSource, {
      dragger: this.entity,
      onDrag: function onDrag(dragger, newPosition) {
        that.entity.position = newPosition;
      }
    });
  }

  /**
   * 图形编辑结束后调用
   */
  finish() {
    this.entity.draw_tooltip = null;
  }
}

export { EditPoint };
