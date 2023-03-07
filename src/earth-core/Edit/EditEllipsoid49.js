/**
 * @Author han
 * @Date 2020/11/10 15:46
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as draggerCtl from './Dragger6';
import { message } from '../Tool/ToolTip4';
import { EditBase } from './EditBase18';
import { addPositionsHeight, setPositionsHeight } from '../Tool/Point2';

/**
 * 编辑椭球类
 * @extends EditBase
 * @memberOf EditBase
 */
class EditEllipsoid extends EditBase {
  constructor(opts) {
    super(opts);
    this._positions_draw = null;
  }

  getPositionsFromEntity() {
    this._positions_draw = this.entity._positions_draw[0];
  }
  /**
   * 图形编辑结束后调用
   */
  finish() {
    this._positions_draw = null;
  }

  /**
   * 更新半径
   * @param style
   */
  updateRadii(style) {
    let radii = new Cesium.Cartesian3(
      Number(style.extentRadii),
      Number(style.widthRadii),
      Number(style.heightRadii)
    );
    this.entity.ellipsoid.radii.setValue(radii);
  }

  /**
   * 绑定拖动把手
   */
  bindDraggers() {
    let that = this;

    let style = this.entity.attribute.style;

    //位置中心点
    let position = this.entity.position.getValue(this.viewer.clock.currentTime);
    let dragger = draggerCtl.createDragger(this.dataSource, {
      position: addPositionsHeight(position, style.heightRadii),
      onDrag: function onDrag(dragger, position) {
        this._positions_draw = position;
        that.entity.position.setValue(position);
        that.updateDraggers();
      }
    });
    this.draggers.push(dragger);

    //获取椭圆上的坐标点数组
    let cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions(
      {
        center: position,
        semiMajorAxis: Number(style.extentRadii), //长半轴
        semiMinorAxis: Number(style.widthRadii), //短半轴
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
    let majorDragger = draggerCtl.createDragger(this.dataSource, {
      position: majorPos,
      type: draggerCtl.PointType.EditAttr,
      tooltip: message.dragger.editRadius,
      onDrag: function onDrag(dragger, position) {
        let newHeight = Cesium.Cartographic.fromCartesian(
          that._positions_draw
        ).height;
        position = setPositionsHeight(position, newHeight);
        dragger.position = position;

        style.extentRadii = that.formatNum(
          Cesium.Cartesian3.distance(that._positions_draw, position),
          2
        ); //短半轴

        that.updateRadii(style);
        that.updateDraggers();
      }
    });
    dragger.majorDragger = majorDragger;
    this.draggers.push(majorDragger);

    //短半轴上的坐标点
    let minorPos = new Cesium.Cartesian3(
      cep.positions[3],
      cep.positions[4],
      cep.positions[5]
    );
    let minorDragger = draggerCtl.createDragger(this.dataSource, {
      position: minorPos,
      type: draggerCtl.PointType.EditAttr,
      tooltip: message.dragger.editRadius,
      onDrag: function onDrag(dragger, position) {
        let newHeight = Cesium.Cartographic.fromCartesian(
          that._positions_draw
        ).height;
        position = setPositionsHeight(position, newHeight);
        dragger.position = position;

        style.widthRadii = that.formatNum(
          Cesium.Cartesian3.distance(that._positions_draw, position),
          2
        ); //长半轴

        that.updateRadii(style);
        that.updateDraggers();
      }
    });
    dragger.minorDragger = minorDragger;
    this.draggers.push(minorDragger);
  }
}

export { EditEllipsoid };
