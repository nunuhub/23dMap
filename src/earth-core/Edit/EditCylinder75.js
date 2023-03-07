/**
 * @Author han
 * @Date 2020/11/10 14:05
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as draggerCtl from './Dragger6';
import { EditPolygon } from './EditPolygon16';
import { message } from '../Tool/ToolTip4';
import { addPositionsHeight } from '../Tool/Point2';

/**
 * 编辑圆锥体
 * @extends EditBase.EditPolyline.EditPolygon
 * @memberOf EditBase.EditPolyline.EditPolygon
 */
class EditCylinder extends EditPolygon {
  constructor(opts) {
    super(opts);
  }

  /**
   * 取enity对象的对应矢量数据
   * @returns {Cesium.CylinderGraphics}
   */
  getGraphic() {
    return this.entity.cylinder;
  }

  /**
   * 修改坐标会回调，提高显示的效率
   */
  changePositionsToCallback() {
    // this._positions_draw = this.entity._positions_draw;
    let time = this.viewer.clock.currentTime;
    let that = this;

    this.attr_bottomRadius = this.getGraphic().bottomRadius.getValue(time);
    this.getGraphic().bottomRadius = new Cesium.CallbackProperty(function () {
      return that.attr_bottomRadius;
    }, false);

    this.attr_length = this.getGraphic().length.getValue(time);
    this.getGraphic().length = new Cesium.CallbackProperty(function () {
      return that.attr_length;
    }, false);
  }

  /**
   * 图形编辑结束后调用
   */
  finish() {
    this.entity._positions_draw = this._positions_draw;

    this.getGraphic().bottomRadius = this.attr_bottomRadius;
    this.getGraphic().length = this.attr_length;
  }

  /**
   * 绑定拖动把手
   */
  bindDraggers() {
    let that = this;

    let positions = this.getPosition();

    let diff = new Cesium.Cartesian3();
    //let newPos = new Cesium.Cartesian3();
    let style = this.entity.attribute.style;

    //中心点
    position = positions[0];

    let dragger = draggerCtl.createDragger(this.dataSource, {
      position: position,
      onDrag: function onDrag(dragger, position) {
        Cesium.Cartesian3.subtract(position, positions[dragger.index], diff); //记录差值

        positions[dragger.index] = position;

        //============高度调整拖拽点处理=============
        that.updateDraggers();
      }
    });
    dragger.index = 0;
    this.draggers.push(dragger);

    //let time = this.viewer.clock.currentTime;

    //获取椭圆上的坐标点数组
    let cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions(
      {
        center: position,
        semiMajorAxis: this.attr_bottomRadius, //长半轴
        semiMinorAxis: this.attr_bottomRadius, //短半轴
        rotation: Cesium.Math.toRadians(Number(style.rotation || 0)),
        granularity: 2.0
      },
      true,
      false
    );

    //长半轴上的坐标点
    let majorPos = new Cesium.Cartesian3(
      cep.positions[0],
      cep.positions[1],
      cep.positions[2]
    );

    positions[1] = majorPos;
    let bottomRadiusDragger = draggerCtl.createDragger(this.dataSource, {
      position: majorPos,
      type: draggerCtl.PointType.EditAttr,
      tooltip: message.dragger.editRadius,
      onDrag: function onDrag(dragger, position) {
        positions[dragger.index] = position;

        let radius = that.formatNum(
          Cesium.Cartesian3.distance(positions[0], position),
          2
        );
        that.attr_bottomRadius = radius;
        style.bottomRadius = radius;

        that.updateDraggers();
      }
    });
    this.draggers.push(bottomRadiusDragger);

    //创建高度拖拽点
    let position = addPositionsHeight(positions[0], this.attr_length);
    let draggerTop = draggerCtl.createDragger(this.dataSource, {
      position: position,
      type: draggerCtl.PointType.MoveHeight,
      tooltip: message.dragger.moveHeight,
      onDrag: function onDrag(dragger, position) {
        let length = that.formatNum(
          Cesium.Cartesian3.distance(positions[0], position),
          2
        );
        that.attr_length = length;
        style.length = length;

        that.updateDraggers();
      }
    });
    this.draggers.push(draggerTop);
  }
}
export { EditCylinder };
