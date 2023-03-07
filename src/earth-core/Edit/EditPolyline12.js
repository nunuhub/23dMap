import * as Cesium from 'cesium_shinegis_earth';
import * as draggerCtl from './Dragger6';
import {
  updateHeightForClampToGround,
  setPositionsHeight,
  getMaxHeight,
  centerOfMass
} from '../Tool/Point2';
import { getArea } from '../Tool/Util1';
import { message } from '../Tool/ToolTip4';
import { EditBase } from './EditBase18';
import { cartesian2lonlat, cartesians2lonlats } from '../Tool/Util3';
import * as turf from '@turf/turf';

const Ct3 = Cesium.Cartesian3;
const darkOrange = Cesium.Color.DARKORANGE.clone();
const deepBlue = Cesium.Color.DEEPSKYBLUE.clone();
let CompositeDragger = class {
  constructor() {}
  create(positions) {
    //根据传入的positions计算envelope，确定复合拖拽器的大小
    //获取并计算中心点的高度。
    let h = 0;
    positions.forEach((e) => {
      h += cartesian2lonlat(e)[2];
    });
    h /= positions.length;

    let center = centerOfMass(positions, h);
    let center_lonlat = cartesian2lonlat(center);
    let delta;
    if (positions.length >= 3) {
      let area = getArea(positions);
      let radius = Math.sqrt(area / Math.PI) * 2;
      //且先按照1° = 111km换算
      delta = (radius * 2) / 111000;
    } else {
      let coordinates = cartesians2lonlats(positions);
      let features = turf.featureCollection([turf.lineString(coordinates)]);
      let envelope = turf.envelope(features);
      let [w, s, e, n] = envelope.bbox;
      delta = Math.min(e - w, n - s);
    }
    let origin_lonlat = [
      center_lonlat[0] - delta / 16,
      center_lonlat[1] - delta / 16,
      h
    ];
    let rightP_lonlat = [origin_lonlat[0] + delta / 8, origin_lonlat[1], h],
      topP_lonlat = [origin_lonlat[0], origin_lonlat[1] + delta / 8, h];
    let rightTopP_lonlat = [
      origin_lonlat[0] + delta / 8,
      origin_lonlat[1] + delta / 8,
      h
    ];
    let origin = Ct3.fromDegrees.apply(undefined, origin_lonlat);
    let rightP = Ct3.fromDegrees.apply(undefined, rightP_lonlat);
    let topP = Ct3.fromDegrees.apply(undefined, topP_lonlat);
    let rightTopP = Ct3.fromDegrees.apply(undefined, rightTopP_lonlat);
    //将geometry移动到LCS (Local Coordinate System)
    let transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    let transform_inv = Cesium.Matrix4.inverse(transform, new Cesium.Matrix4());
    function c2lcs(cartesian3) {
      return Cesium.Matrix4.multiplyByPoint(
        transform_inv,
        cartesian3,
        new Ct3()
      );
    }
    let origin_lcs = c2lcs(origin);
    let rightP_lcs = c2lcs(rightP);
    let topP_lcs = c2lcs(topP);
    let rightTopP_lcs = c2lcs(rightTopP);

    let rightArrow = new Cesium.GeometryInstance({
      geometry: new Cesium.PolylineGeometry({
        positions: [origin_lcs.clone(), rightP_lcs.clone()], //[origin, rightP],
        width: 12.0,
        arcType: Cesium.ArcType.NONE,
        vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT
      })
    });
    let topArrow = new Cesium.GeometryInstance({
      geometry: new Cesium.PolylineGeometry({
        positions: [origin_lcs.clone(), topP_lcs.clone()],
        width: 12.0,
        vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT
      })
    });
    //圆  半径也可以按照points构成多边形的面积的1/8，因为考虑到旋转后引起rightP等的变化
    let radius = Ct3.distance(center, rightP);
    let circle = new Cesium.CircleOutlineGeometry({
      center: center, //center,
      radius: radius * 1.2,
      granularity: 0.01
    });
    circle = Cesium.CircleOutlineGeometry.createGeometry(circle);
    let points_circle = [];
    let pointNumber = circle.indices.length / 2;
    let vs = circle.attributes.position.values;
    for (let i = 0; i < pointNumber; i++) {
      let p = { x: vs[3 * i], y: vs[3 * i + 1], z: vs[3 * i + 2] };
      p = setPositionsHeight(p, h);
      let p_lcs = c2lcs(p);
      points_circle[i] = p_lcs;
    }
    points_circle.push(points_circle[0]);

    circle = new Cesium.GeometryInstance({
      geometry: new Cesium.PolylineGeometry({
        positions: points_circle,
        width: 6.0,
        arcType: Cesium.ArcType.NONE,
        vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT
      })
    });
    //面
    let polygon = new Cesium.PolygonGeometry({
      polygonHierarchy: new Cesium.PolygonHierarchy([
        origin_lcs.clone(),
        rightP_lcs.clone(),
        rightTopP_lcs.clone(),
        topP_lcs.clone()
      ])
    });
    let plane = new Cesium.PlaneGeometry({
      vertexFormat: Cesium.MaterialAppearance.VERTEX_FORMAT
    });
    var dimensions = new Cesium.Cartesian3(
      Ct3.distance(origin, rightP),
      Ct3.distance(origin, topP),
      1.0
    );
    var scaleMatrix = Cesium.Matrix4.fromScale(dimensions);
    polygon = new Cesium.GeometryInstance({
      modelMatrix: scaleMatrix,
      geometry: plane //Cesium.PolygonGeometry.createGeometry(polygon)
    });

    let primitiveArrow_horizontal = new Cesium.Primitive({
      geometryInstances: rightArrow,
      asynchronous: true,
      modelMatrix: transform,
      appearance: new Cesium.PolylineMaterialAppearance({
        renderState: {
          depthTest: {
            enabled: false
          }
        },
        material: new Cesium.Material({
          fabric: {
            type: 'PolylineArrow',
            uniforms: {
              color: deepBlue
            }
          }
        })
      })
    });
    let primitiveArrow_vertical = new Cesium.Primitive({
      geometryInstances: topArrow,
      asynchronous: true,
      modelMatrix: transform,
      appearance: new Cesium.PolylineMaterialAppearance({
        renderState: {
          depthTest: {
            enabled: false
          }
        },
        material: new Cesium.Material({
          fabric: {
            type: 'PolylineArrow',
            uniforms: {
              color: deepBlue
            }
          }
        })
      })
    });
    primitiveArrow_horizontal.draggerName = 'arrow_horizontal';

    primitiveArrow_vertical.draggerName = 'arrow_vertical';
    let primitiveCircle = new Cesium.Primitive({
      geometryInstances: circle,
      asynchronous: true,
      modelMatrix: transform,
      releaseGeometryInstances: false, //后面mouse_over时修改instance里的color属性
      appearance: new Cesium.PolylineMaterialAppearance({
        renderState: {
          depthTest: {
            enabled: false
          }
        },
        material: new Cesium.Material({
          fabric: {
            type: 'Color',
            uniforms: {
              color: darkOrange
            }
          }
        })
      })
    });
    primitiveCircle.draggerName = 'circle';
    let primitivePlane = new Cesium.Primitive({
      geometryInstances: polygon,
      asynchronous: true,
      modelMatrix: transform,
      appearance: new Cesium.MaterialAppearance({
        material: new Cesium.Material({
          fabric: {
            type: 'Color',
            uniforms: {
              color: darkOrange
            }
          }
        }),
        renderState: {
          depthTest: {
            enabled: false
          }
        }
      })
    });
    primitivePlane.draggerName = 'plane';
    let primitiveCollection = new Cesium.PrimitiveCollection();
    primitiveCollection.add(primitiveArrow_horizontal);
    primitiveCollection.add(primitiveArrow_vertical);
    primitiveCollection.add(primitiveCircle);
    primitiveCollection.add(primitivePlane);
    primitiveCollection._origin = center;
    return primitiveCollection;
  }
};

/**
 * 编辑线类
 * @extends EditBase
 * @memberOf EditBase
 */
class EditPolyline extends EditBase {
  constructor(opts) {
    super(opts);
    this._positions_draw = opts[0]._positions_draw; // 坐标位置相关
    this._hasMidPoint = true; // 是否可在中间新增点
    this.hasClosure = false; // 是否首尾相连闭合（线不闭合，面闭合），用于处理中间点
    this.heightDraggers = null; // 子类用，高度调整拖拽点  陈利军移动顶部高度代码
  }

  /**
   * 取enity对象的对应矢量数据
   * @returns {polyline}
   */
  getGraphic() {
    return this.entity.polyline;
  }

  /**
   * 获取线的所有坐标
   * @returns {[position]}
   */
  getPosition() {
    //dragger将获取该数组。 拖动dragger时，该数组元素被修改。但primitive无法响应到该修改。
    return this._positions_draw || this.entity._positions_draw;
  }

  /**
   * 外部更新位置
   * @param positions {[position]} 坐标
   */
  setPositions(positions) {
    this._positions_draw = positions;
    this.entity._positions_draw = positions; //回调
    if (this.entity.polyline.positions instanceof Cesium.ConstantProperty) {
      //非回调
      this.entity.polyline.positions = new Cesium.ConstantProperty(positions);
    }
    this.updateAttrForEditing();
  }

  /**
   * 修改坐标会回调，提高显示的效率
   */
  changePositionsToCallback(constant2callback = true) {
    //this._positions_draw = this.entity._positions_draw || this.getGraphic().positions.getValue(this.viewer.clock.currentTime)
    let entity = this.entity;
    if (!(entity instanceof Cesium.Entity)) {
      entity.positions = entity._positions_draw;
      return;
    }
    if (constant2callback) {
      this.getGraphic().positions = new Cesium.CallbackProperty(() => {
        return entity._positions_draw;
      }, false);
    } else {
      this.getGraphic().positions = entity._positions_draw;
    }
  }

  /**
   * 图形编辑结束后调用
   */
  finish() {
    //this.entity._positions_draw = this.getPosition()
    this.changePositionsToCallback(false);
  }

  /**
   * 是否贴地
   * @returns {boolean}
   */
  isClampToGround() {
    return this.entity.attribute.style.clampToGround;
  }

  /**
   * 是否可在中间新增点
   * @returns {boolean}
   */
  hasMidPoint() {
    return this._hasMidPoint && this.getPosition().length < this._maxPointNum;
  }

  /**
   * 子类用，根据属性更新坐标
   * @param position
   * @returns {position}
   */
  updatePositionsHeightByAttr(position) {
    return position;
  }

  /**
   * 主要发挥的作用是，primitive模式下，右键删除dragger后，修改线图形。
   */
  updateAttrForEditing() {
    /////////////////////////
    if (this.entity instanceof Cesium.Polyline)
      this.entity.positions = this.getPosition();
  }
  /**
   * 绑定拖动把手
   */
  bindDraggers() {
    let that = this;
    let positions = this.getPosition();

    let clampToGround = this.isClampToGround();
    let hasMidPoint = this.hasMidPoint();

    for (let i = 0, len = positions.length; i < len; i++) {
      let loc = positions[i];

      loc = this.updatePositionsHeightByAttr(loc);
      if (clampToGround) {
        //贴地时求贴模型和贴地的高度
        loc = updateHeightForClampToGround(this.viewer, loc);
        positions[i] = loc;
      }

      //各顶点  移动底部面代码 陈利军
      let dragger = draggerCtl.createDragger(this.dataSource, {
        position: loc,
        //clampToGround: clampToGround,
        onDragStart: (dragger, position) => {
          that.fire('drag-start', dragger, position);
        },
        onDrag: function onDrag(dragger, position) {
          position = that.updatePositionsHeightByAttr(position);
          dragger.position = position;
          positions[dragger.index] = position;
          // 开挖压平
          dragger.callback && dragger.callback(positions);

          //============高度调整拖拽点处理（子类用）=============
          if (that.heightDraggers && that.heightDraggers.length > 0) {
            let extrudedHeight = that
              .getGraphic()
              .extrudedHeight.getValue(that.viewer.clock.currentTime);
            that.heightDraggers[dragger.index].position = setPositionsHeight(
              position,
              extrudedHeight
            );
          }

          //============新增点拖拽点处理=============
          if (hasMidPoint) {
            let draggersIdx;
            let nextPositionIdx;
            //与前一个点之间的中点
            if (that.hasClosure || (!that.hasClosure && dragger.index !== 0)) {
              if (dragger.index === 0) {
                draggersIdx = len * 2 - 1;
                nextPositionIdx = len - 1;
              } else {
                draggersIdx = dragger.index * 2 - 1;
                nextPositionIdx = dragger.index - 1;
              }
              let nextPosition = positions[nextPositionIdx];
              let midpoint = Ct3.midpoint(position, nextPosition, new Ct3());
              midpoint = that.updatePositionsHeightByAttr(midpoint);
              if (clampToGround) {
                //贴地时求贴模型和贴地的高度
                midpoint = updateHeightForClampToGround(that.viewer, midpoint);
              }
              that.draggers[draggersIdx].position = midpoint;
            }

            //与后一个点之间的中点
            if (
              that.hasClosure ||
              (!that.hasClosure && dragger.index !== len - 1)
            ) {
              if (dragger.index === len - 1) {
                draggersIdx = dragger.index * 2 + 1;
                nextPositionIdx = 0;
              } else {
                draggersIdx = dragger.index * 2 + 1;
                nextPositionIdx = dragger.index + 1;
              }
              let midpoint = Ct3.midpoint(
                position,
                positions[nextPositionIdx],
                new Ct3()
              );
              midpoint = that.updatePositionsHeightByAttr(midpoint);
              if (clampToGround) {
                //贴地时求贴模型和贴地的高度
                midpoint = updateHeightForClampToGround(that.viewer, midpoint);
              }
              that.draggers[draggersIdx].position = midpoint;
            }
          }
          that.fire('drag', dragger, position);
        },
        onDragEnd: function onDragEnd(dragger, position) {
          that.fire('drag-end', dragger, position);
        }
      });
      dragger.index = i;
      this.draggers.push(dragger);

      //中间点，拖动后新增点
      if (
        hasMidPoint &&
        (this.hasClosure || (!this.hasClosure && i < len - 1))
      ) {
        let nextIndex = (i + 1) % len;
        let midpoint = Ct3.midpoint(loc, positions[nextIndex], new Ct3());
        midpoint = that.updatePositionsHeightByAttr(midpoint);
        if (clampToGround) {
          //贴地时求贴模型和贴地的高度
          midpoint = updateHeightForClampToGround(this.viewer, midpoint);
        }

        let draggerMid = draggerCtl.createDragger(this.dataSource, {
          position: midpoint,
          type: draggerCtl.PointType.AddMidPoint,
          tooltip: message.dragger.addMidPoint,
          //clampToGround: clampToGround,
          onDragStart: function onDragStart(dragger, position) {
            positions.splice(dragger.index, 0, position); //插入点
            that.entity.thisIdx = dragger.index; //todo @wtt 7.22 用于判断点被添加后，是否stopEdit
            that.fire('drag-start', dragger, position);
          },
          onDrag: function onDrag(dragger, position) {
            positions[dragger.index] = position;

            // 开挖压平
            dragger.callback && dragger.callback(positions);
            that.fire('drag', dragger, position);
          },
          onDragEnd: function onDragEnd(dragger, position) {
            that.updateDraggers();
            that.fire('drag-end', dragger, position);
          }
        });
        draggerMid.index = nextIndex;
        draggerMid._isMidPoint = true;
        this.draggers.push(draggerMid);
      }
    }
    //创建平移拖拽点(有复合拖拽后可弃用)
    if (!this.draggers) {
      let center = centerOfMass(positions);
      if (clampToGround) {
        //贴地时求贴模型和贴地的高度
        center = updateHeightForClampToGround(this.viewer, center);
      }
      //console.log('center', center, positions);
      let lastPosition;
      let deltaX, deltaY, deltaZ;
      let moveType = ''; //left,right
      let scordHeight;
      //创建重心平移拖拽点
      let dragger = draggerCtl.createDragger(this.dataSource, {
        position: center,
        onDragStart: function onDragStart(dragger, position) {
          moveType = 'left';
          lastPosition = position;
        },
        onDrag: function onDrag(dragger, position) {
          position = that.updatePositionsHeightByAttr(position);
          dragger.position = position;
          if (moveType === 'left') {
            [deltaX, deltaY, deltaZ] = [
              position.x - lastPosition.x,
              position.y - lastPosition.y,
              position.z - lastPosition.z
            ];
            let deltaVector = { x: deltaX, y: deltaY, z: deltaZ };
            for (let index = 0; index < positions.length; index++) {
              positions[index] = Ct3.add(
                positions[index],
                deltaVector,
                new Ct3()
              );
            }
            for (let index = 0; index < that.draggers.length; index++) {
              let dragger = that.draggers[index];
              dragger.position = Ct3.add(
                dragger.position.getValue(),
                deltaVector,
                new Ct3()
              );
            }
            lastPosition = position;
          } else if (moveType === 'right') {
            [deltaX, deltaY, deltaZ] = [
              position.x - lastPosition.x,
              position.y - lastPosition.y,
              position.z - lastPosition.z
            ];
            let deltaVector = { x: deltaX, y: deltaY, z: deltaZ };
            for (let index = 0; index < positions.length; index++) {
              positions[index] = Ct3.add(
                positions[index],
                deltaVector,
                new Ct3()
              );
              positions[index] = setPositionsHeight(
                positions[index],
                scordHeight
              );
            }
            for (let index = 0; index < that.draggers.length; index++) {
              let dragger = that.draggers[index];
              dragger.position = Ct3.add(
                dragger.position.getValue(),
                deltaVector,
                new Ct3()
              );
              dragger.position = setPositionsHeight(
                dragger.position.getValue(),
                scordHeight
              );
            }
            lastPosition = position;
          }
        },
        onDragEnd: function onDrag() {
          lastPosition = null;
          moveType = '';
        },
        onRightDown: function (dragger, position) {
          moveType = 'right';
          //记录下该点的高度
          scordHeight = cartesian2lonlat(position)[2];
          lastPosition = position;
        },
        onRightUp: function () {
          moveType = '';
          lastPosition = null;
        }
      });
      dragger.index = this.draggers.length;
      this.draggers.push(dragger);
    }
    //创建复合拖拽体
    if (this.entity.attribute.style.isCompositeDragger)
      this.bindCompositeDraggers();
    //创建高程拖拽点
    if (this.getGraphic()?.extrudedHeight) this.bindHeightDraggers();

    // 创建底面高程拖拽点
    if (this.entity.attribute.style.isDragBelow) this.bindBelowHeightDraggers();

    // 创建多边形高程拖拽点
    // if (this.entity.attribute.style.isMoveHeightFlatten) this.bindFlattenHeightDraggers()

    // 创建盒子拖拽点
    if (this.entity.attribute.config && this.entity.attribute.config.isBox)
      this.bindBoxDraggers();
  }
  /**
   * 更新dragger的坐标。因为 updateDragger是销毁再创建，开销太大。所以建立该方法。
   */
  updateDraggerPositions() {
    if (!this._enabled) {
      return this;
    }
    let positions = this.getPosition();
    let draggers = this.draggers;
    for (let i = 0, len = draggers.length; i < len; i++) {
      let dragger = draggers[i];
      let a = Math.floor(i / 2); //因draggers包含顶点和中点，需将二者分出。
      if (!dragger._isMidPoint) dragger.position = positions[a];
      else {
        let [frontP, rearP] = [positions[a], positions[a + 1] || positions[0]];
        let midpoint = Ct3.midpoint(frontP, rearP, new Ct3());
        midpoint = this.updatePositionsHeightByAttr(midpoint);
        /* if (this.isClampToGround()) { //降低性能，贴地步骤可挪到ondragEnd中
          midpoint = updateHeightForClampToGround(this.viewer, midpoint);
        } */
        dragger.position = midpoint;
      }
    }
  }
  bindCompositeDraggers() {
    //创建复合拖拽器，平移，旋转，正交平移
    let that = this;
    let positions = this.getPosition();
    let compositeDragger = new CompositeDragger();
    this.draggers_pri = compositeDragger.create(positions);

    this.viewer.scene.primitives.add(this.draggers_pri);

    //如果要调整draggers的位置，是否可以换个方式不用forEach。这样可能内存占用过多？
    function getNormal() {
      let eastNormal, northNormal, transform, transform_inv;
      let positions = that.getPosition();
      let h = 0;
      positions.forEach((e) => {
        h += cartesian2lonlat(e)[2];
      });
      h /= positions.length;
      let origin = centerOfMass(positions, h);
      transform = Cesium.Transforms.eastNorthUpToFixedFrame(origin);
      transform_inv = Cesium.Matrix4.inverse(transform, new Cesium.Matrix4());
      eastNormal = Cesium.Matrix4.multiplyByPoint(
        transform,
        new Ct3(1, 0, 0),
        new Ct3()
      );
      northNormal = Cesium.Matrix4.multiplyByPoint(
        transform,
        new Ct3(0, 1, 0),
        new Ct3()
      );
      Ct3.subtract(origin, eastNormal, eastNormal);
      Ct3.subtract(origin, northNormal, northNormal);
      Ct3.normalize(eastNormal, eastNormal);
      Ct3.normalize(northNormal, northNormal);
      return [eastNormal, northNormal, transform, transform_inv];
    }
    let [eastNormal, northNormal, transform, transform_inv] = getNormal();
    function c2lcs(cartesian3) {
      return Cesium.Matrix4.multiplyByPoint(
        transform_inv,
        cartesian3,
        new Ct3()
      );
    }
    function lcs2C(cartesian3) {
      return Cesium.Matrix4.multiplyByPoint(transform, cartesian3, new Ct3());
    }
    this.draggers_pri._primitives.forEach((primitive) => {
      let lastP;
      let position_lcs = new Ct3(),
        lastP_lcs = new Ct3();
      let origin_screen, p1;
      let transform_type; //变换类型:横向、纵向平移，整体平移，旋转
      draggerCtl.createDragger(this.dataSource, {
        dragger: primitive,
        onDragStart: (dragger, position) => {
          transform_type = dragger.draggerName;
          //当rotate时，取origin的屏幕坐标。
          lastP = position;
          let positions = this.getPosition();
          let origin = centerOfMass(positions); //因拖拽会改变其原点，故此处每次都重新取原点。
          origin_screen = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
            this.viewer.scene,
            origin
          );
          Cesium.Matrix4.multiplyByPoint(transform_inv, position, lastP_lcs);
        },
        onDrag: (dragger, position) => {
          Cesium.Matrix4.multiplyByPoint(transform_inv, position, position_lcs);
          let vector_lcs = Ct3.subtract(position_lcs, lastP_lcs, new Ct3());
          switch (transform_type) {
            case 'arrow_horizontal': {
              //lcs下，平移。
              Ct3.projectVector(vector_lcs, Ct3.UNIT_X, vector_lcs);
              break;
            }
            case 'arrow_vertical': {
              Ct3.projectVector(
                vector_lcs,
                Cesium.Cartesian3.UNIT_Y,
                vector_lcs
              );
              break;
            }
            case 'circle': {
              p1 =
                p1 ||
                Cesium.SceneTransforms.wgs84ToWindowCoordinates(
                  that.viewer.scene,
                  lastP
                );
              let p2 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
                that.viewer.scene,
                position
              );
              let v1 = Ct3.subtract(p1, origin_screen, new Ct3());
              let v2 = Ct3.subtract(p2, origin_screen, new Ct3());
              p1 = p2;
              v1.z = v2.z = 0;
              if (Ct3.magnitude(v1) === 0) return;
              let angle = Ct3.angleBetween(v1, v2);
              //旋转方向
              let dir = Cesium.Cartesian3.cross(v2, v1, new Ct3());
              dir = dir.z / Math.abs(dir.z);
              angle *= dir;
              let mt3 = Cesium.Matrix3.fromRotationZ(angle);
              let positions = this.getPosition();
              for (let i = 0; i < positions.length; i++) {
                //先取其在LCS下的坐标.
                let p_lcs = Cesium.Matrix4.multiplyByPoint(
                  transform_inv,
                  positions[i],
                  new Ct3()
                );
                let afterRotationP = Cesium.Matrix3.multiplyByVector(
                  mt3,
                  p_lcs,
                  new Cesium.Cartesian3()
                );
                let p = Cesium.Matrix4.multiplyByPoint(
                  transform,
                  afterRotationP,
                  new Ct3()
                );
                //更改图形坐标。（因graphic的坐标编辑时是callbackProperty）
                positions[i] = p;
              }
              for (let index = 0; index < this.draggers_pri.length; index++) {
                const element = this.draggers_pri.get(index);
                Cesium.Matrix4.multiplyByMatrix3(
                  element.modelMatrix,
                  mt3,
                  element.modelMatrix
                );
              }
              //将旋转记录到平移的法向量上
              Cesium.Matrix3.multiplyByVector(mt3, eastNormal, eastNormal);
              Cesium.Matrix3.multiplyByVector(mt3, northNormal, northNormal);
              lastP = position.clone();
              that.updateDraggerPositions();
              return;
            }
          }
          let translationMatrix = Cesium.Matrix4.fromTranslation(
            vector_lcs,
            new Cesium.Matrix4()
          );
          let positions = this.getPosition();
          for (let i = 0; i < positions.length; i++) {
            let lc = c2lcs(positions[i]);
            Cesium.Matrix4.multiplyByPoint(translationMatrix, lc, lc);
            let c = lcs2C(lc);
            positions[i] = c;
          }
          that.setPositions([...positions]);
          for (let index = 0; index < this.draggers_pri.length; index++) {
            const element = this.draggers_pri.get(index);
            Cesium.Matrix4.multiply(
              element.modelMatrix,
              translationMatrix,
              element.modelMatrix
            );
          }
          lastP = position.clone();
          //将dragger变换矩阵的改变结果，同步给多边形的顶点组。
          transform = this.draggers_pri.get(0).modelMatrix.clone();
          transform_inv = Cesium.Matrix4.inverse(
            transform,
            new Cesium.Matrix4()
          );
          Cesium.Matrix4.multiplyByPoint(transform_inv, position, lastP_lcs);
          that.updateDraggerPositions();
        },
        onDragEnd: () => {
          p1 = lastP = transform_type = undefined;
          /*  lastP = undefined;
       p1 =  */
        }
      });
    });
  }
  bindHeightDraggers(positions) {
    let that = this;

    this.heightDraggers = [];

    positions = positions || this.getPosition();
    let extrudedHeight = that
      .getGraphic()
      .extrudedHeight.getValue(this.viewer.clock.currentTime);

    for (let i = 0, len = positions.length; i < len; i++) {
      let loc = positions[i];
      loc = setPositionsHeight(loc, extrudedHeight);

      let dragger = draggerCtl.createDragger(this.dataSource, {
        position: loc,
        type: draggerCtl.PointType.MoveHeight,
        tooltip: message.dragger.moveHeight,
        onDrag: function onDrag(dragger, position) {
          let thisHeight = Cesium.Cartographic.fromCartesian(position).height;
          let maxHeight = getMaxHeight(that.getPosition());
          if (thisHeight <= maxHeight) {
            //增加限制，使得拉伸多边形的顶面，永在底面之上。
            thisHeight = maxHeight;
          }

          that.getGraphic().extrudedHeight = thisHeight;
          that.entity.attribute.style.extrudedHeight = that.formatNum(
            thisHeight - maxHeight,
            2
          );

          that.updateHeightDraggers(thisHeight);

          // 更新裁切面
          // updatePlane(position, 'box-5')
        }
      });

      this.draggers.push(dragger);
      this.heightDraggers.push(dragger);
    }
  }

  // 三维多边形上下拖拽点
  bindBelowHeightDraggers() {
    for (let i = 0, len = this.draggers.length; i < len; i++) {
      this.dataSource.entities.remove(this.draggers[i]);
    }
    let that = this;
    let positions = this.getPosition();
    let extrudedHeight = that
      .getGraphic()
      .extrudedHeight.getValue(this.viewer.clock.currentTime);
    // let polyCenter = Cesium.BoundingSphere.fromPoints(positions).center;
    let polyCenter = centerOfMass(positions);
    let lastPosition;
    let dragger1 = draggerCtl.createDragger(this.dataSource, {
      position: polyCenter,
      type: draggerCtl.PointType.MoveHeight,
      tooltip: message.dragger.moveHeight,
      onDrag: function onDrag(dragger, position) {
        let thisHeight = Cesium.Cartographic.fromCartesian(position).height;
        let top_h = Cesium.Cartographic.fromCartesian(
          dragger2.position.getValue()
        ).height;
        if (thisHeight < top_h) {
          lastPosition = lastPosition ? lastPosition : position;
          let chaHeight =
            thisHeight - Cesium.Cartographic.fromCartesian(lastPosition).height;
          let belowDraggers = that.draggers.filter(
            (item) => item._pointType === 1 || item._pointType === 2
          );
          for (let i = 0; i < belowDraggers.length; i++) {
            let belowDragger = belowDraggers[i];
            let _position = setPositionsHeight(
              belowDragger.position.getValue(that.viewer.clock.currentTime),
              thisHeight + chaHeight
            );
            belowDragger.position.setValue(_position);
          }

          let belowPointsArr = [];
          let belowPoints = that.draggers.filter(
            (item) => item._pointType === 1
          );
          for (let i = 0; i < belowPoints.length; i++) {
            belowPointsArr.push(belowPoints[i].position.getValue());
          }
          that.setPositions(belowPointsArr); // 更新底部坐标
          lastPosition = position;
          dragger.callback && dragger.callback(position, 'polygon-2');
        } else {
          dragger1.position = setPositionsHeight(position, top_h);
        }
      },
      onDragEnd: function onDrag() {
        lastPosition = null;
      }
    });
    let polyCenter2 = setPositionsHeight(polyCenter, extrudedHeight); //上
    let dragger2 = draggerCtl.createDragger(this.dataSource, {
      position: polyCenter2,
      type: draggerCtl.PointType.MoveHeight,
      tooltip: message.dragger.moveHeight,
      onDrag: function onDrag(dragger, position) {
        let thisHeight = Cesium.Cartographic.fromCartesian(position).height;
        let below_h = Cesium.Cartographic.fromCartesian(
          dragger1.position.getValue()
        ).height;
        if (below_h < thisHeight) {
          that.getGraphic().extrudedHeight = thisHeight;
          let maxHeight = getMaxHeight(that.getPosition());
          that.entity.attribute.style.extrudedHeight = that.formatNum(
            thisHeight - maxHeight,
            2
          );

          that.updateHeightDraggers(thisHeight);
          // let thisPosition = setPositionsHeight(position, thisHeight + chaHeight)
          dragger.callback && dragger.callback(position, 'polygon-1');
        } else {
          dragger2.position = setPositionsHeight(position, below_h);
        }
      }
    });
    this.draggers.push(dragger1, dragger2);
  }

  // 二维多边形高度拖拽点
  bindFlattenHeightDraggers() {
    for (let i = 0, len = this.draggers.length; i < len; i++) {
      this.dataSource.entities.remove(this.draggers[i]);
    }
    let that = this;
    let positions = this.getPosition();
    // let polyCenter = Cesium.BoundingSphere.fromPoints(positions).center;
    let polyCenter = centerOfMass(positions);
    let lastPosition;
    let dragger = draggerCtl.createDragger(this.dataSource, {
      position: polyCenter,
      type: draggerCtl.PointType.MoveHeight,
      tooltip: message.dragger.moveHeight,
      onDrag: function onDrag(dragger, position) {
        lastPosition = lastPosition ? lastPosition : position;
        let thisHeight = Cesium.Cartographic.fromCartesian(position).height;
        let chaHeight =
          thisHeight - Cesium.Cartographic.fromCartesian(lastPosition).height;
        let belowDraggers = that.draggers.filter(
          (item) => item._pointType === 1 || item._pointType === 2
        );
        for (let i = 0; i < belowDraggers.length; i++) {
          let belowDragger = belowDraggers[i];
          let _position = setPositionsHeight(
            belowDragger.position.getValue(that.viewer.clock.currentTime),
            thisHeight + chaHeight
          );
          belowDragger.position.setValue(_position);
        }

        let belowPointsArr = [];
        let belowPoints = that.draggers.filter((item) => item._pointType === 1);
        for (let i = 0; i < belowPoints.length; i++) {
          belowPointsArr.push(belowPoints[i].position.getValue());
        }
        that.setPositions(belowPointsArr); // 更新底部坐标
        lastPosition = position;
        dragger.callback && dragger.callback(position, 'flatten');
      },
      onDragEnd: function onDrag() {
        lastPosition = null;
      }
    });
    this.draggers.push(dragger);
  }

  // ploygon盒子拖拽点
  bindBoxDraggers() {
    for (let i = 0, len = this.draggers.length; i < len; i++) {
      this.dataSource.entities.remove(this.draggers[i]);
    }
    this.draggers = [];
    let that = this;
    let positionsDraw = this.getPosition();
    let extrudedHeight = that
      .getGraphic()
      .extrudedHeight.getValue(this.viewer.clock.currentTime);

    // let p1jw = cartesian2lonlat(positionsDraw[0]);
    // let p2jw = cartesian2lonlat(positionsDraw[2]);
    // let [x1, x2, y1, y2] = this.computeLonLat(p1jw,p2jw);
    // let z = p2jw[2];

    // 底部坐标 逆时针 西北 西南 东南 东北
    // let p1C3 = lonlat2cartesian([x1, y2, z]);
    // let p2C3 = lonlat2cartesian([x1, y1, z]);
    // let p3C3 = lonlat2cartesian([x2, y1, z]);
    // let p4C3 = lonlat2cartesian([x2, y2, z]);

    let p1C3 = positionsDraw[0];
    let p2C3 = positionsDraw[1];
    let p3C3 = positionsDraw[2];
    let p4C3 = positionsDraw[3];

    that._positions_draw = [p1C3, p2C3, p3C3, p4C3];

    // 上下拖拽点
    let polyCenter6 = Ct3.midpoint(p1C3, p3C3, p1C3.clone());
    let polyCenter5 = setPositionsHeight(polyCenter6, extrudedHeight);
    // 盒子中心点
    let polyCenter = Ct3.midpoint(
      polyCenter6,
      polyCenter5,
      polyCenter6.clone()
    );

    let hSide = Cesium.Cartographic.fromCartesian(polyCenter).height;
    // 侧面四个拖拽点 右前左后
    let polyr = Ct3.midpoint(p3C3, p4C3, p3C3.clone());
    let polyCenter1 = setPositionsHeight(polyr, hSide);
    let polyf = Ct3.midpoint(p2C3, p3C3, p2C3.clone());
    let polyCenter2 = setPositionsHeight(polyf, hSide);
    let polyl = Ct3.midpoint(p1C3, p2C3, p1C3.clone());
    let polyCenter3 = setPositionsHeight(polyl, hSide);
    let polya = Ct3.midpoint(p1C3, p4C3, p1C3.clone());
    let polyCenter4 = setPositionsHeight(polya, hSide);

    // 更新盒子
    that.entity.polygon.hierarchy = new Cesium.CallbackProperty(function () {
      return new Cesium.PolygonHierarchy([p1C3, p2C3, p3C3, p4C3]);
    }, false);
    // 盒子右面拖拽点
    let dragger1 = this.createDraggerFun(polyCenter1, [p1C3, p4C3]);
    dragger1.update = (projectV) => {
      p3C3 = Ct3.add(p3C3, projectV, new Ct3());
      p4C3 = Ct3.add(p4C3, projectV, new Ct3());
      that._positions_draw = [p1C3, p2C3, p3C3, p4C3]; //同时更新盒子的坐标。
      polyCenter1 = Ct3.add(polyCenter1, projectV, new Ct3());
      dragger1.callback && dragger1.callback(polyCenter1, 'box-1');
      updateDraggerPositions();
    };
    // 盒子前面拖拽点
    let dragger2 = this.createDraggerFun(polyCenter2, [p1C3, p2C3]);
    dragger2.update = (projectV) => {
      p2C3 = Ct3.add(p2C3, projectV, new Ct3());
      p3C3 = Ct3.add(p3C3, projectV, new Ct3());
      that._positions_draw = [p1C3, p2C3, p3C3, p4C3];
      polyCenter2 = Ct3.add(polyCenter2, projectV, new Ct3());
      dragger2.callback && dragger2.callback(polyCenter2, 'box-2');
      updateDraggerPositions();
    };
    // 盒子左面拖拽点
    let dragger3 = this.createDraggerFun(polyCenter3, [p4C3, p1C3]);
    dragger3.update = (projectV) => {
      p1C3 = Ct3.add(p1C3, projectV, new Ct3());
      p2C3 = Ct3.add(p2C3, projectV, new Ct3());
      that._positions_draw = [p1C3, p2C3, p3C3, p4C3];
      polyCenter3 = Ct3.add(polyCenter3, projectV, new Ct3());
      dragger3.callback && dragger3.callback(polyCenter3, 'box-3');
      updateDraggerPositions();
    };
    // 盒子后面拖拽点
    let dragger4 = this.createDraggerFun(polyCenter4, [p2C3, p1C3]);
    dragger4.update = (projectV) => {
      p1C3 = Ct3.add(p1C3, projectV, new Ct3());
      p4C3 = Ct3.add(p4C3, projectV, new Ct3());
      that._positions_draw = [p1C3, p2C3, p3C3, p4C3];
      polyCenter4 = Ct3.add(polyCenter4, projectV, new Ct3());
      dragger4.callback && dragger4.callback(polyCenter4, 'box-4');
      updateDraggerPositions();
    };
    // 盒子上面拖拽点
    let dragger5 = draggerCtl.createDragger(this.dataSource, {
      position: polyCenter5,
      type: draggerCtl.PointType.MoveHeight,
      tooltip: message.dragger.moveHeight,
      onDrag: function onDrag(dragger, position) {
        let thisHeight = Cesium.Cartographic.fromCartesian(position).height;
        let below_h = Cesium.Cartographic.fromCartesian(
          dragger6.position.getValue()
        ).height;
        if (below_h < thisHeight) {
          that.getGraphic().extrudedHeight = thisHeight;
          let maxHeight = getMaxHeight(that.getPosition());
          that.entity.attribute.style.extrudedHeight = that.formatNum(
            thisHeight - maxHeight,
            2
          );
          that.updateHeightDraggers(thisHeight);
          // 更新裁切面
          dragger.callback && dragger.callback(position, 'box-5');
          extrudedHeight = thisHeight;
          updateDraggerPositions();
        } else {
          dragger5.position = setPositionsHeight(position, below_h);
        }
      }
    });
    // 盒子底面拖拽点
    let dragger6 = draggerCtl.createDragger(this.dataSource, {
      position: polyCenter6,
      type: draggerCtl.PointType.MoveHeight,
      tooltip: message.dragger.moveHeight,
      onDrag: function onDrag(dragger, position) {
        let thisHeight = Cesium.Cartographic.fromCartesian(position).height;
        let top_h = Cesium.Cartographic.fromCartesian(
          dragger5.position.getValue()
        ).height;
        if (thisHeight < top_h) {
          p1C3 = setPositionsHeight(p1C3, thisHeight);
          p2C3 = setPositionsHeight(p2C3, thisHeight);
          p3C3 = setPositionsHeight(p3C3, thisHeight);
          p4C3 = setPositionsHeight(p4C3, thisHeight);
          // 更新裁切面
          dragger.callback && dragger.callback(position, 'box-6');
          updateDraggerPositions();
        } else {
          dragger6.position = setPositionsHeight(position, top_h);
        }
      }
    });
    this.draggers.push(
      dragger1,
      dragger2,
      dragger3,
      dragger4,
      dragger5,
      dragger6
    );

    updateDraggerPositions();
    //更新拖拽点的坐标
    function updateDraggerPositions() {
      extrudedHeight = that
        .getGraphic()
        .extrudedHeight.getValue(that.viewer.clock.currentTime);
      polyCenter6 = Ct3.midpoint(p1C3, p3C3, p1C3.clone());
      polyCenter5 = setPositionsHeight(polyCenter6, extrudedHeight);
      polyCenter = Ct3.midpoint(polyCenter6, polyCenter5, polyCenter6.clone());
      hSide = Cesium.Cartographic.fromCartesian(polyCenter).height;

      polyr = Ct3.midpoint(p3C3, p4C3, p3C3.clone());
      polyCenter1 = setPositionsHeight(polyr, hSide);
      polyf = Ct3.midpoint(p2C3, p3C3, p2C3.clone());
      polyCenter2 = setPositionsHeight(polyf, hSide);
      polyl = Ct3.midpoint(p1C3, p2C3, p1C3.clone());
      polyCenter3 = setPositionsHeight(polyl, hSide);
      polya = Ct3.midpoint(p1C3, p4C3, p1C3.clone());
      polyCenter4 = setPositionsHeight(polya, hSide);

      dragger1.position.setValue(polyCenter1);
      dragger2.position.setValue(polyCenter2);
      dragger3.position.setValue(polyCenter3);
      dragger4.position.setValue(polyCenter4);
      dragger5.position.setValue(polyCenter5);
      dragger6.position.setValue(polyCenter6);

      that.entity.editing._positions_draw = [p1C3, p2C3, p3C3, p4C3];
    }
  }
  computeLonLat(p1, p2) {
    let x1, x2, y1, y2;
    if (p1[0] < p2[0]) {
      x1 = p1[0];
      x2 = p2[0];
    } else {
      x1 = p2[0];
      x2 = p1[0];
    }
    if (p1[1] < p2[1]) {
      y1 = p1[1];
      y2 = p2[1];
    } else {
      y1 = p2[1];
      y2 = p1[1];
    }
    return [x1, x2, y1, y2];
  }
  createDraggerFun(polyCenter, points) {
    let lastPosition;
    let [a, b] = points;
    let dragger = draggerCtl.createDragger(this.dataSource, {
      position: polyCenter,
      type: draggerCtl.PointType.MoveLevel,
      tooltip: message.dragger.moveHeight,
      onDrag: function onDrag(dragger, position) {
        lastPosition = lastPosition ? lastPosition : position;
        let vector;
        vector = Ct3.subtract(lastPosition, position, new Ct3());
        lastPosition = position;

        let dir = Ct3.subtract(b, a, new Ct3()); //面的法向量
        let normalOfPlane = Ct3.normalize(dir, new Ct3());
        //投影
        let projectV = Ct3.projectVector(vector, normalOfPlane, new Ct3());
        projectV = Ct3.multiplyByScalar(projectV, -1, new Ct3());

        // 更新
        dragger.update && dragger.update(projectV);
      },
      onDragEnd: function onDrag() {
        lastPosition = null;
      }
    });
    return dragger;
  }

  bindMoveHeightDraggers() {
    // debugger
    for (let i = 0, len = this.draggers.length; i < len; i++) {
      this.dataSource.entities.remove(this.draggers[i]);
    }
    this.draggers = [];
    let that = this;
    this.heightDraggers = [];
    // positions = positions || this.getPosition();
    //let [a, b] = positions;
    //midpoint取到的中点并不对。 因为a,b是绘制时的两个点击点。而非矩形对角点。
    //let midpoint = Ct3.midpoint(a, b, a.clone());

    //midpoint2才是正确矩形中心。
    let rectangle =
      this.entity.rectangle && this.entity.rectangle.coordinates.getValue();
    let midpoint2 = Cesium.Rectangle.center(rectangle);
    midpoint2.height =
      this.entity.rectangle.height && this.entity.rectangle.height.getValue();
    midpoint2 = Cesium.Cartographic.toCartesian(midpoint2);

    let dragger = draggerCtl.createDragger(this.dataSource, {
      position: midpoint2,
      type: draggerCtl.PointType.MoveHeight,
      tooltip: message.dragger.moveHeight,
      onDrag: function onDrag(dragger, position) {
        let thisHeight = Cesium.Cartographic.fromCartesian(position).height;
        // console.log('thisHeight',thisHeight)
        that.getGraphic().height.setValue(thisHeight);
        that.entity.attribute.style.height = thisHeight;
        that.updateHeightDraggers(thisHeight);
        // console.log('thisHeight', position)

        // 更新裁切面
        // updatePlane(position, 0)
        dragger.callback && dragger.callback(position, 0);
      }
    });

    this.draggers.push(dragger);
    this.heightDraggers.push(dragger);
  }

  updateHeightDraggers(extrudedHeight) {
    for (let i = 0; i < this.heightDraggers.length; i++) {
      let heightDragger = this.heightDraggers[i];

      let position = setPositionsHeight(
        heightDragger.position.getValue(this.viewer.clock.currentTime),
        extrudedHeight
      );
      heightDragger.position.setValue(position);
    }
  }
}

export { EditPolyline };
