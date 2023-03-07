/**
 * @Author han
 * @Date 2020/11/10 15:59
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as draggerCtl from './Dragger6';
import { EditPolyline } from './EditPolyline12';
import { message } from '../Tool/ToolTip4';
import { addPositionsHeight, setPositionsHeight } from '../Tool/Point2';
import { cartesian2lonlat } from '../Tool/Util3';
/* import { updatePlane } from '../Layer/Tileset55'; */

/**
 * 编辑墙壁类
 * @extends EditBase.EditPolyline
 * @memberOf EditBase.EditPolyline
 */
class EditWall extends EditPolyline {
  constructor(opts) {
    super(opts);

    this._maximumHeights = null;
    this._minimumHeights = null;
    this.heightDraggers = null;
  }

  /**
   * 取enity对象的对应矢量数据
   * @returns {Cesium.WallGraphics}
   */
  getGraphic() {
    return this.entity.wall;
  }

  getPositionsFromEntity() {
    let time = this.viewer.clock.currentTime;
    this._positions_draw =
      this.entity._positions_draw || this.getGraphic().positions.getValue(time);
    this._minimumHeights =
      this.entity._minimumHeights ||
      this.getGraphic().minimumHeights.getValue(time);
    this._maximumHeights =
      this.entity._maximumHeights ||
      this.getGraphic().maximumHeights.getValue(time);
  }
  /**
   * 坐标位置相关
   */
  updateAttrForEditing() {
    let style = this.entity.attribute.style;
    let position = this.getPosition();
    let len = position.length;

    this._maximumHeights = new Array(len);
    this._minimumHeights = new Array(len);

    for (let i = 0; i < len; i++) {
      let height = Cesium.Cartographic.fromCartesian(position[i]).height;
      this._minimumHeights[i] = height;
      this._maximumHeights[i] = height + Number(style.extrudedHeight);
    }

    //同步更新
    this.entity._maximumHeights = this._maximumHeights;
    this.entity._minimumHeights = this._minimumHeights;
  }

  /**
   * 图形编辑结束后调用
   */
  finish() {
    this.entity._positions_draw = this._positions_draw;
    this.entity._maximumHeights = this._maximumHeights;
    this.entity._minimumHeights = this._minimumHeights;
  }

  /**
   * 绑定拖动把手
   */
  bindDraggers() {
    let that = this;

    let clampToGround = this.isClampToGround();

    let positions = this.getPosition();
    let style = this.entity.attribute.style;
    let hasMidPoint = positions.length < this._maxPointNum; //是否有新增点

    for (let i = 0, len = positions.length; i < len; i++) {
      let loc = positions[i];

      //各顶点
      let dragger = draggerCtl.createDragger(this.dataSource, {
        position: loc,
        clampToGround: clampToGround,
        onDrag: function onDrag(dragger, position) {
          positions[dragger.index] = position;

          //============高度调整拖拽点处理=============
          if (that.heightDraggers && that.heightDraggers.length > 0) {
            that.heightDraggers[dragger.index].position = addPositionsHeight(
              position,
              style.extrudedHeight
            );
          }

          //============新增点拖拽点处理=============
          if (hasMidPoint) {
            if (dragger.index > 0) {
              //与前一个点之间的中点
              that.draggers[dragger.index * 2 - 1].position =
                Cesium.Cartesian3.midpoint(
                  position,
                  positions[dragger.index - 1],
                  new Cesium.Cartesian3()
                );
            }
            if (dragger.index < positions.length - 1) {
              //与后一个点之间的中点
              that.draggers[dragger.index * 2 + 1].position =
                Cesium.Cartesian3.midpoint(
                  position,
                  positions[dragger.index + 1],
                  new Cesium.Cartesian3()
                );
            }
          }
        }
      });
      dragger.index = i;
      this.draggers.push(dragger);

      //中间点，拖动后新增点
      if (hasMidPoint) {
        let nextIndex = i + 1;
        if (nextIndex < len) {
          let midpoint = Cesium.Cartesian3.midpoint(
            loc,
            positions[nextIndex],
            new Cesium.Cartesian3()
          );
          let draggerMid = draggerCtl.createDragger(this.dataSource, {
            position: midpoint,
            type: draggerCtl.PointType.AddMidPoint,
            tooltip: message.dragger.addMidPoint,
            clampToGround: clampToGround,
            onDragStart: function onDragStart(dragger, position) {
              positions.splice(dragger.index, 0, position); //插入点
              that.updateAttrForEditing();
            },
            onDrag: function onDrag(dragger, position) {
              positions[dragger.index] = position;
            },
            onDragEnd: function onDragEnd() {
              that.updateDraggers();
            }
          });
          draggerMid.index = nextIndex;
          this.draggers.push(draggerMid);
        }
      }
    }

    //创建高程拖拽点
    this.bindHeightDraggers();
    //创建墙面的横向拖拽点。用于裁切功能。
    if (this.entity.attribute.config && this.entity.attribute.config.isContour)
      this.bindMoveHorizontalDraggers(positions);
  }

  /**
   * 高度调整拖拽点
   */
  bindHeightDraggers() {
    let that = this;

    this.heightDraggers = [];

    let positions = this.getPosition();
    let style = this.entity.attribute.style;
    let extrudedHeight = Number(style.extrudedHeight);

    for (let i = 0, len = positions.length; i < len; i++) {
      let loc = addPositionsHeight(positions[i], extrudedHeight);

      let dragger = draggerCtl.createDragger(this.dataSource, {
        position: loc,
        type: draggerCtl.PointType.MoveHeight,
        tooltip: message.dragger.moveHeight,
        onDrag: function onDrag(dragger, position) {
          let thisHeight = Cesium.Cartographic.fromCartesian(position).height;
          style.extrudedHeight = that.formatNum(
            thisHeight - that._minimumHeights[dragger.index],
            2
          );

          for (let i = 0; i < positions.length; i++) {
            if (i === dragger.index) continue;
            that.heightDraggers[i].position = addPositionsHeight(
              positions[i],
              style.extrudedHeight
            );
          }
          that.updateAttrForEditing();
        }
      });
      dragger.index = i;

      this.draggers.push(dragger);
      this.heightDraggers.push(dragger);
    }
  }

  bindMoveHorizontalDraggers(positions) {
    let that = this;
    for (let i = 0, len = this.draggers.length; i < len; i++) {
      this.dataSource.entities.remove(this.draggers[i]);
    }
    this.draggers = [];
    this.heightDraggers = [];
    positions = this.entity.wall.positions.getValue();
    let [a, b] = positions;
    let midpoint = Cesium.Cartesian3.midpoint(a, b, a.clone()); // 中心点
    let _position = cartesian2lonlat(midpoint); // 中心点
    let _height = this.entity.attribute.style.extrudedHeight / 2; // 中心高度
    _position = Cesium.Cartesian3.fromDegrees(
      _position[0],
      _position[1],
      _position[2] + _height
    );

    let lastPosition;
    let dragger = draggerCtl.createDragger(this.dataSource, {
      position: _position,
      type: draggerCtl.PointType.MoveLevel,
      tooltip: '鼠标拖拽切面',
      onDrag: function onDrag(dragger, position) {
        /*将上次点位与此次点位组成向量，向wall的法向量投影，即为wall该移动的向量，再将该向量加到wall两点上即可。 */
        let [p1, p2] = that.entity.wall.positions.getValue();
        let dir = Cesium.Cartesian3.subtract(p1, p2, new Cesium.Cartesian3()); //边的法向量

        let midpoint = Cesium.Cartesian3.midpoint(
          p1,
          p2,
          new Cesium.Cartesian3()
        ); //边上中点
        let currP = position;
        let vector;
        lastPosition = lastPosition ? lastPosition : position;
        vector = Cesium.Cartesian3.subtract(
          lastPosition,
          currP,
          new Cesium.Cartesian3()
        );
        lastPosition = position;

        let carto = Cesium.Cartographic.fromCartesian(midpoint);
        carto.height = 50;
        let midH = Cesium.Cartographic.toCartesian(carto);
        let vector2 = Cesium.Cartesian3.subtract(
          midpoint,
          midH,
          new Cesium.Cartesian3()
        );

        let normalOfPlane = Cesium.Cartesian3.cross(
          dir,
          vector2,
          new Cesium.Cartesian3()
        );
        normalOfPlane = Cesium.Cartesian3.normalize(
          normalOfPlane,
          new Cesium.Cartesian3()
        );
        //投影
        let projectV = Cesium.Cartesian3.projectVector(
          vector,
          normalOfPlane,
          new Cesium.Cartesian3()
        );
        //定量移动，每次移动15米
        // projectV = Cesium.Cartesian3.normalize(projectV, new Cesium.Cartesian3())
        // projectV = Cesium.Cartesian3.multiplyByScalar(projectV, -2, new Cesium.Cartesian3())
        projectV = Cesium.Cartesian3.multiplyByScalar(
          projectV,
          -1,
          new Cesium.Cartesian3()
        );

        /* console.log('vector', vector)
                console.log('vectorLength', Cesium.Cartesian3.magnitude(vector))
                console.log('平移距离', Cesium.Cartesian3.magnitude(projectV)) */
        p1 = Cesium.Cartesian3.add(p1, projectV, new Cesium.Cartesian3());
        p2 = Cesium.Cartesian3.add(p2, projectV, new Cesium.Cartesian3());
        that.entity.wall.positions = [p1, p2];
        that._positions_draw = [p1, p2]; //同时更新该数组。

        // let h = that.entity.wall.maximumHeights.getValue();
        // that.heightDraggers[0].position = addPositionsHeight(p1,h[0]);
        // that.heightDraggers[1].position = addPositionsHeight(p2,h[1]);
        // that.updateHorizontalDraggers()
        updateWallDraggers();
        // dragger.callback&& dragger.callback([p1, p2])facade1
        dragger.callback && dragger.callback([p1, p2], 'facade1');
      },
      onDragEnd: function onDrag() {
        lastPosition = null;
      }
    });
    // 立面高度拖拽点
    let style = this.entity.attribute.style;
    // let h = that.entity.wall.maximumHeights.getValue();
    let pointCenter = Cesium.Cartesian3.midpoint(a, b, a.clone());
    let pointCenter_h = addPositionsHeight(
      pointCenter,
      Number(style.extrudedHeight)
    );
    let dragger1 = draggerCtl.createDragger(this.dataSource, {
      position: pointCenter_h,
      type: draggerCtl.PointType.MoveHeight,
      tooltip: message.dragger.moveHeight,
      onDrag: function onDrag(dragger, position) {
        let thisHeight = Cesium.Cartographic.fromCartesian(position).height;
        let below_h = Cesium.Cartographic.fromCartesian(
          dragger4.position.getValue()
        ).height;
        if (below_h < thisHeight) {
          style.extrudedHeight = that.formatNum(
            thisHeight - that._minimumHeights[0],
            2
          );
          dragger1.position = position;
          that.updateAttrForEditing();
          // that.updateHorizontalDraggers()
          updateWallDraggers();
          dragger.callback && dragger.callback(position, 'facade4');
        } else {
          dragger1.position = setPositionsHeight(position, below_h);
        }
      }
    });
    // 立面底面拖拽点
    let lastPosition4;
    let dragger4 = draggerCtl.createDragger(this.dataSource, {
      position: midpoint,
      type: draggerCtl.PointType.MoveHeight,
      tooltip: message.dragger.moveHeight,
      onDrag: function onDrag(dragger, position) {
        let thisHeight = Cesium.Cartographic.fromCartesian(position).height;
        let top_h = Cesium.Cartographic.fromCartesian(
          dragger1.position.getValue()
        ).height;
        if (thisHeight < top_h) {
          lastPosition4 = lastPosition4 ? lastPosition4 : position;
          let height_cha =
            Cesium.Cartographic.fromCartesian(lastPosition4).height -
            Cesium.Cartographic.fromCartesian(position).height;
          style.extrudedHeight += height_cha;
          let arr = that._positions_draw;
          let new_arr = [];
          for (let i = 0; i < arr.length; i++) {
            new_arr.push(setPositionsHeight(arr[i], thisHeight));
          }
          that._positions_draw = new_arr;
          that.entity.wall.positions = new_arr;
          dragger2.position = new_arr[0];
          dragger3.position = new_arr[1];
          dragger4.position = position;
          // that.updateHorizontalDraggers()
          updateWallDraggers();
          dragger.callback && dragger.callback(position, 'facade5');
          lastPosition4 = position;
        } else {
          dragger4.position = setPositionsHeight(position, top_h);
        }
      }
    });
    // 立面宽度拖拽点
    let lastPosition2;
    let dragger2 = draggerCtl.createDragger(this.dataSource, {
      position: a,
      type: draggerCtl.PointType.MoveLevel,
      tooltip: message.dragger.moveHeight,
      onDrag: function onDrag(dragger, position) {
        let [a1, a2] = that.entity.wall.positions.getValue();
        lastPosition2 = lastPosition2 ? lastPosition2 : position;
        let _vector2;
        _vector2 = Cesium.Cartesian3.subtract(
          lastPosition2,
          position,
          new Cesium.Cartesian3()
        );
        lastPosition2 = position;

        let dir2 = Cesium.Cartesian3.subtract(a1, a2, new Cesium.Cartesian3()); //面的法向量
        let normalOfPlane2 = Cesium.Cartesian3.normalize(
          dir2,
          new Cesium.Cartesian3()
        );
        //投影
        let projectV2 = Cesium.Cartesian3.projectVector(
          _vector2,
          normalOfPlane2,
          new Cesium.Cartesian3()
        );
        projectV2 = Cesium.Cartesian3.multiplyByScalar(
          projectV2,
          -1,
          new Cesium.Cartesian3()
        );

        a1 = Cesium.Cartesian3.add(a1, projectV2, new Cesium.Cartesian3());
        that._positions_draw = [a1, a2]; //同时更新该数组。
        that.entity.wall.positions = [a1, a2];
        that.updateAttrForEditing();
        // that.updateHorizontalDraggers()
        updateWallDraggers();
        dragger.callback && dragger.callback([a1, a2], 'facade2');
      },
      onDragEnd: function onDrag() {
        lastPosition2 = null;
      }
    });
    // 立面宽度拖拽点
    let lastPosition3;
    let dragger3 = draggerCtl.createDragger(this.dataSource, {
      position: b,
      type: draggerCtl.PointType.MoveLevel,
      tooltip: message.dragger.moveHeight,
      onDrag: function onDrag(dragger, position) {
        let [b1, b2] = that.entity.wall.positions.getValue();
        lastPosition3 = lastPosition3 ? lastPosition3 : position;
        let _vector3;
        _vector3 = Cesium.Cartesian3.subtract(
          lastPosition3,
          position,
          new Cesium.Cartesian3()
        );
        lastPosition3 = position;

        let dir3 = Cesium.Cartesian3.subtract(b1, b2, new Cesium.Cartesian3()); //面的法向量
        let normalOfPlane3 = Cesium.Cartesian3.normalize(
          dir3,
          new Cesium.Cartesian3()
        );
        //投影
        let projectV3 = Cesium.Cartesian3.projectVector(
          _vector3,
          normalOfPlane3,
          new Cesium.Cartesian3()
        );
        projectV3 = Cesium.Cartesian3.multiplyByScalar(
          projectV3,
          -1,
          new Cesium.Cartesian3()
        );

        b2 = Cesium.Cartesian3.add(b2, projectV3, new Cesium.Cartesian3());
        that._positions_draw = [b1, b2]; //同时更新该数组。
        that.entity.wall.positions = [b1, b2];
        that.updateAttrForEditing();
        // that.updateHorizontalDraggers()
        updateWallDraggers();
        dragger.callback && dragger.callback([b1, b2], 'facade3');
      },
      onDragEnd: function onDrag() {
        lastPosition3 = null;
      }
    });
    dragger.point.color = new Cesium.Color.fromCssColorString('#f00');
    dragger2.point.color = new Cesium.Color.fromCssColorString('#1c197d');
    dragger3.point.color = new Cesium.Color.fromCssColorString('#1c197d');
    this.draggers.push(dragger, dragger1, dragger2, dragger3, dragger4);
    this.heightDraggers.push(dragger1);
    this.horizontalDraggers = this.horizontalDraggers
      ? this.horizontalDraggers
      : [];
    this.horizontalDraggers.push(dragger);

    function updateWallDraggers() {
      let [p1New, p2New] = that._positions_draw;
      // let hNew = that.entity.wall.maximumHeights.getValue();
      let pointCenterNew = Cesium.Cartesian3.midpoint(
        p1New,
        p2New,
        p1New.clone()
      );
      dragger1.position = addPositionsHeight(
        pointCenterNew,
        Number(style.extrudedHeight)
      );
      dragger2.position = p1New;
      dragger3.position = p2New;
      let dragger4p = Cesium.Cartesian3.midpoint(p1New, p2New, p1New.clone());
      dragger4.position = dragger4p;
      dragger.position = Cesium.Cartesian3.midpoint(
        dragger4p,
        dragger1.position.getValue(),
        dragger4p.clone()
      );
    }
  }
  updateHorizontalDraggers() {
    let positions = this.entity.wall.positions.getValue();
    let [a, b] = positions;
    let midpoint = Cesium.Cartesian3.midpoint(a, b, a.clone()); // 中心点
    let _position = cartesian2lonlat(midpoint); // 中心点
    let _height = this.entity.attribute.style.extrudedHeight / 2; // 中心高度
    // console.log('拖拽点的位置', _position[0], _position[1], _height)
    _position = Cesium.Cartesian3.fromDegrees(
      _position[0],
      _position[1],
      _position[2] + _height
    );
    this.horizontalDraggers[0].position = _position; //这里放位置。
  }
}

export { EditWall };
