/**
 * @Author han
 * @Date 2020/11/10 16:12
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as draggerCtl from './Dragger6';
import * as CircleAttr from '../Draw/EntityAttr/CircleAttr30';
import { addPositionsHeight } from '../Tool/Point2';
import { EditBase } from './EditBase18';
import { message } from '../Tool/ToolTip4';

/**
 * 编辑模型类
 * @extends EditBase
 * @memberOf EditBase
 */
class EditPModel extends EditBase {
  constructor(opts) {
    super(opts);
  }

  /**
   * 外部更新位置
   * @param position
   */
  setPositions(position) {
    this.entity.position = position;
    this.entity.modelMatrix = this.getModelMatrix();
  }

  /**
   * 获取模型矩阵matrix
   * @param position
   * @returns {Cesium.Transforms.headingPitchRollToFixedFrame}
   */
  getModelMatrix(position) {
    let cfg = this.entity.attribute.style;

    let hpRoll = new Cesium.HeadingPitchRoll(
      Cesium.Math.toRadians(cfg.heading || 0),
      Cesium.Math.toRadians(cfg.pitch || 0),
      Cesium.Math.toRadians(cfg.roll || 0)
    );
    let fixedFrameTransform = Cesium.Transforms.eastNorthUpToFixedFrame;

    let modelMatrix = Cesium.Transforms.headingPitchRollToFixedFrame(
      position || this.entity.position,
      hpRoll,
      this.viewer.scene.globe.ellipsoid,
      fixedFrameTransform
    );

    // Cesium.Matrix4.multiplyByUniformScale(modelMatrix, Cesium.defaultValue(cfg.scale, 1), modelMatrix)
    return modelMatrix;
  }

  /**
   * 绑定拖动把手
   */
  bindDraggers() {
    if (!this.entity.ready) {
      let that = this;
      this.entity.readyPromise.then(function () {
        that.bindDraggers();
      });
      return;
    }

    let that = this;

    this.entity.draw_tooltip = message.dragger.def;

    draggerCtl.createDragger(this.dataSource, {
      dragger: this.entity,
      onDrag: function onDrag(dragger, newPosition) {
        that.entity.position = newPosition;
        that.entity.modelMatrix = that.getModelMatrix(newPosition);

        that.updateDraggers();
      }
    });

    let style = this.entity.attribute.style;

    let position = this.entity.position;
    let height = Cesium.Cartographic.fromCartesian(position).height;
    let radius = this.entity.boundingSphere.radius;

    //辅助显示：创建角度调整底部圆
    this.entityAngle = this.dataSource.entities.add({
      name: '角度调整底部圆',
      position: new Cesium.CallbackProperty(function () {
        return that.entity.position;
      }, false),
      ellipse: CircleAttr.style2Entity({
        fill: false,
        outline: true,
        outlineColor: '#ffff00',
        outlineOpacity: 0.8,
        radius: radius,
        height: height
      })
    });

    //创建角度调整 拖拽点
    let majorPos = this.getHeadingPosition();
    let majorDragger = draggerCtl.createDragger(this.dataSource, {
      position: majorPos,
      type: draggerCtl.PointType.EditAttr,
      tooltip: message.dragger.editHeading,
      onDrag: function onDrag(dragger, position) {
        let heading = that.getHeading(that.entity.position, position);
        style.heading = that.formatNum(heading, 1);
        //console.log(heading)

        that.entity.modelMatrix = that.getModelMatrix();
        dragger.position = that.getHeadingPosition();
      }
    });
    this.draggers.push(majorDragger);

    //辅助显示：外接包围盒子
    //this.entityBox = this.dataSource.entities.add({
    //    name: "外接包围盒子",
    //    position: new Cesium.CallbackProperty(time => {
    //        return that.entity.position
    //    }, false),
    //    box: {
    //        dimensions: new Cesium.Cartesian3(radius, radius, radius),
    //        fill: false,
    //        outline: true,
    //        outlineColor: Cesium.Color.YELLOW
    //    }
    //})

    //缩放控制点
    let position_scale = addPositionsHeight(position, radius);
    let dragger = draggerCtl.createDragger(this.dataSource, {
      position: position_scale,
      type: draggerCtl.PointType.MoveHeight,
      tooltip: message.dragger.editScale,
      onDrag: function onDrag(dragger, positionNew) {
        let radiusNew = Cesium.Cartesian3.distance(positionNew, position);

        let radiusOld = dragger.radius / style.scale;
        let scaleNew = radiusNew / radiusOld;

        dragger.radius = radiusNew;
        style.scale = that.formatNum(scaleNew, 2);

        that.entity.scale = style.scale;
        // that.entity.modelMatrix = that.getModelMatrix()
        that.updateDraggers();
      }
    });
    dragger.radius = radius;
    this.draggers.push(dragger);

    //this.entityBox = this.dataSource.entities.add({
    //    name: "缩放控制点连接线",
    //    polyline: {
    //        positions: [
    //            position,
    //            position_scale
    //        ],
    //        width: 1,
    //        material: Cesium.Color.YELLOW
    //    }
    //})
  }

  destroyDraggers() {
    EditBase.prototype.destroyDraggers.call(this);

    if (this.entityAngle) {
      this.dataSource.entities.remove(this.entityAngle);
      delete this.entityAngle;
    }
    if (this.entityBox) {
      this.dataSource.entities.remove(this.entityBox);
      delete this.entityBox;
    }
  }

  /**
   * 图形编辑结束后调用
   */
  finish() {
    this.entity.draw_tooltip = null;
  }

  /**
   * 获取head坐标
   * @returns {Cesium.Cartesian3}
   */
  getHeadingPosition() {
    //创建角度调整底部圆
    let position = this.entity.position;
    let radius = this.entity.boundingSphere.radius;
    let angle = -Number(this.entity.attribute.style.heading || 0);

    let rotpos = new Cesium.Cartesian3(radius, 0.0, 0.0);

    let mat = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    let rotationX = Cesium.Matrix4.fromRotationTranslation(
      Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(angle))
    );
    Cesium.Matrix4.multiply(mat, rotationX, mat);

    mat = Cesium.Matrix4.getMatrix3(mat, new Cesium.Matrix3());
    rotpos = Cesium.Matrix3.multiplyByVector(mat, rotpos, rotpos);
    rotpos = Cesium.Cartesian3.add(position, rotpos, rotpos);
    return rotpos;
  }

  /**
   * 获取点相对于中心点的地面角度
   * @param positionCenter
   * @param positionNew
   * @returns {number}
   */
  getHeading(positionCenter, positionNew) {
    //获取该位置的默认矩阵
    let mat = Cesium.Transforms.eastNorthUpToFixedFrame(positionCenter);
    mat = Cesium.Matrix4.getMatrix3(mat, new Cesium.Matrix3());

    let xaxis = Cesium.Matrix3.getColumn(mat, 0, new Cesium.Cartesian3());
    let yaxis = Cesium.Matrix3.getColumn(mat, 1, new Cesium.Cartesian3());
    let zaxis = Cesium.Matrix3.getColumn(mat, 2, new Cesium.Cartesian3());

    //计算该位置 和  positionCenter 的 角度值
    let dir = Cesium.Cartesian3.subtract(
      positionNew,
      positionCenter,
      new Cesium.Cartesian3()
    );
    //z crosss (dirx cross z) 得到在 xy平面的向量
    dir = Cesium.Cartesian3.cross(dir, zaxis, dir);
    dir = Cesium.Cartesian3.cross(zaxis, dir, dir);
    dir = Cesium.Cartesian3.normalize(dir, dir);

    let heading = Cesium.Cartesian3.angleBetween(xaxis, dir);

    let ay = Cesium.Cartesian3.angleBetween(yaxis, dir);
    if (ay > Math.PI * 0.5) {
      heading = 2 * Math.PI - heading;
    }

    return -Cesium.Math.toDegrees(heading);
  }
}

export { EditPModel };
