/**
 * @Author han
 * @Date 2020/11/9 16:40
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as draggerCtl from './Dragger6';
import { EditPolygon } from './EditPolygon16';
import { message } from '../Tool/ToolTip4';
import {
  setPositionsHeight,
  updateHeightForClampToGround
} from '../Tool/Point2';

/**
 * 编辑圆环类
 * @extends EditBase.EditPolyline.EditPolygon
 * @memberOf EditBase.EditPolyline.EditPolygon
 */
class EditCircle extends EditPolygon {
  constructor(opts) {
    super(opts);
  }

  /**
   * 取enity对象的对应矢量数据
   * @returns {Cesium.EllipseGraphics}
   */
  getGraphic() {
    return this.entity.ellipse;
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
   * 获取圆环的所有坐标
   * @returns {[position]} 坐标数组
   */
  getPosition() {
    //加上高度
    if (this.getGraphic().height !== undefined) {
      let newHeight = this.getGraphic().height.getValue(
        this.viewer.clock.currentTime
      );
      for (let i = 0, len = this._positions_draw.length; i < len; i++) {
        this._positions_draw[i] = setPositionsHeight(
          this._positions_draw[i],
          newHeight
        );
      }
    }
    return this._positions_draw;
  }

  /**
   * 绑定拖动把手
   */
  bindDraggers() {
    let that = this;

    let clampToGround = this.isClampToGround();
    let positions = this.getPosition();

    let diff = new Cesium.Cartesian3();
    let newPos = new Cesium.Cartesian3();
    let style = this.entity.attribute.style;

    //中心点
    let position = positions[0];
    if (clampToGround) {
      //贴地时求贴模型和贴地的高度
      position = updateHeightForClampToGround(this.viewer, position);
      positions[0] = position;
    }

    let dragger = draggerCtl.createDragger(this.dataSource, {
      position: position,
      //clampToGround: clampToGround,
      onDrag: function onDrag(dragger, position) {
        Cesium.Cartesian3.subtract(position, positions[dragger.index], diff); //记录差值

        positions[dragger.index] = position;

        //============高度处理=============
        if (!style.clampToGround) {
          let height = that.formatNum(
            Cesium.Cartographic.fromCartesian(position).height,
            2
          );
          that.getGraphic().height = height;
          style.height = height;
        }

        let time = that.viewer.clock.currentTime;

        //============半径同步处理=============
        Cesium.Cartesian3.add(
          dragger.majorDragger.position.getValue(time),
          diff,
          newPos
        );
        dragger.majorDragger.position = newPos;

        if (dragger.minorDragger) {
          Cesium.Cartesian3.add(
            dragger.minorDragger.position.getValue(time),
            diff,
            newPos
          );
          dragger.minorDragger.position = newPos;
        }

        //============高度调整拖拽点处理=============
        if (that.entity.attribute.style.extrudedHeight !== undefined)
          that.updateDraggers();
      }
    });
    dragger.index = 0;
    this.draggers.push(dragger);

    let time = this.viewer.clock.currentTime;

    //获取椭圆上的坐标点数组
    let cep = Cesium.EllipseGeometryLibrary.computeEllipsePositions(
      {
        center: position,
        semiMajorAxis: this.getGraphic().semiMajorAxis.getValue(time), //长半轴
        semiMinorAxis: this.getGraphic().semiMinorAxis.getValue(time), //短半轴
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
    if (clampToGround) {
      //贴地时求贴模型和贴地的高度
      majorPos = updateHeightForClampToGround(this.viewer, majorPos);
    }
    positions[1] = majorPos;
    let majorDragger = draggerCtl.createDragger(this.dataSource, {
      position: majorPos,
      type: draggerCtl.PointType.EditAttr,
      tooltip: message.dragger.editRadius,
      //clampToGround: clampToGround,
      onDrag: function onDrag(dragger, position) {
        if (that.getGraphic().height !== undefined) {
          let newHeight = that.getGraphic().height.getValue(time);
          position = setPositionsHeight(position, newHeight);
          dragger.position = position;
        }
        positions[dragger.index] = position;

        let radius = that.formatNum(
          Cesium.Cartesian3.distance(positions[0], position),
          2
        );
        that.getGraphic().semiMajorAxis = radius;

        if (style.radius) {
          //圆
          that.getGraphic().semiMinorAxis = radius;
          style.radius = radius;
        } else {
          //todo 长半轴 >= 短半轴
          if (
            that.getGraphic().semiMajorAxis < that.getGraphic().semiMinorAxis
          ) {
            that.getGraphic().semiMinorAxis = that.getGraphic().semiMajorAxis;
            that.getGraphic().semiMajorAxis = radius;
          }
          style.semiMajorAxis = radius;
        }

        if (that.entity.attribute.style.extrudedHeight !== undefined)
          that.updateDraggers();
      }
    });
    majorDragger.index = 1;
    dragger.majorDragger = majorDragger;
    this.draggers.push(majorDragger);

    //短半轴上的坐标点
    if (this._maxPointNum === 3) {
      //椭圆
      //短半轴上的坐标点
      let minorPos = new Cesium.Cartesian3(
        cep.positions[3],
        cep.positions[4],
        cep.positions[5]
      );
      if (clampToGround) {
        //贴地时求贴模型和贴地的高度
        minorPos = updateHeightForClampToGround(this.viewer, minorPos);
      }
      positions[2] = minorPos;
      let minorDragger = draggerCtl.createDragger(this.dataSource, {
        position: minorPos,
        type: draggerCtl.PointType.EditAttr,
        tooltip: message.dragger.editRadius,
        //clampToGround: clampToGround,
        onDrag: function onDrag(dragger, position) {
          if (that.getGraphic().height !== undefined) {
            let newHeight = that.getGraphic().height.getValue(time);
            position = setPositionsHeight(position, newHeight);
            dragger.position = position;
          }
          positions[dragger.index] = position;

          let radius = that.formatNum(
            Cesium.Cartesian3.distance(positions[0], position),
            2
          );
          that.getGraphic().semiMinorAxis = radius;

          if (style.radius) {
            //圆
            that.getGraphic().semiMajorAxis = radius;
            style.radius = radius;
          } else {
            //todo 长半轴 >= 短半轴
            if (
              that.getGraphic().semiMajorAxis < that.getGraphic().semiMinorAxis
            ) {
              that.getGraphic().semiMajorAxis = radius;
              that.getGraphic().semiMinorAxis = radius;
            }
            style.semiMinorAxis = radius;
          }

          if (that.entity.attribute.style.extrudedHeight !== undefined)
            that.updateDraggers();
        }
      });
      minorDragger.index = 2;
      dragger.minorDragger = minorDragger;
      this.draggers.push(minorDragger);
    }

    //创建高度拖拽点
    if (this.getGraphic().extrudedHeight) {
      let extrudedHeight = this.getGraphic().extrudedHeight.getValue(time);

      //顶部 中心点
      let position = setPositionsHeight(positions[0], extrudedHeight);
      let draggerTop = draggerCtl.createDragger(this.dataSource, {
        position: position,
        onDrag: function onDrag(dragger, position) {
          position = setPositionsHeight(position, that.getGraphic().height);
          positions[0] = position;

          that.updateDraggers();
        }
      });
      this.draggers.push(draggerTop);

      let _pos =
        this._maxPointNum === 3 ? [positions[1], positions[2]] : [positions[1]];
      this.bindHeightDraggers(_pos);

      this.heightDraggers.push(draggerTop); //拖动高度时联动修改此点高
    }
  }
}

export { EditCircle };
