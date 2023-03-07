/* eslint-disable no-case-declarations */
import * as Cesium from 'cesium_shinegis_earth';
import { ringIsClockwise } from '../Tool/Util1';
import { cartesian2lonlat, lonlat2cartesian, formatNum } from '../Tool/Util3';
// import { getCameraView } from '../Tool/Point2';
import {
  getInverseTransform,
  getOriginCoordinateSystemPoint
} from '../Layer/Tileset55';
import * as turf from '@turf/turf';

// 任意裁切面
class ClipTools {
  constructor(viewer, dataSource) {
    this.viewer = viewer || {};
    this.dataSource = dataSource;
    this.arrDistance = []; // 距离
    this.arrNormal = []; // 面法向
    this.arrHeight = [];
    this.tilesetArr = [];
    this.flattenP = [];
    this.type = 0;
    this.isOutside = false; //盒内
    this.draggerHandler = null;
    this.boxEntity = null;
    this.boxDraggers = [];
  }

  // 设置tileset
  setTilesetArr(tilesetArr) {
    this.tilesetArr = tilesetArr;
  }

  // 设置裁切类型
  setType(type) {
    this.type = type;
  }

  // 设置裁切盒子内外
  setOutside(isOutside) {
    this.isOutside = isOutside;
  }

  // 获取盒子编辑坐标点
  getPosition() {
    return this.boxEntity.editing._positions_draw;
  }

  getGraphic() {
    return this.boxEntity.polygon;
  }

  getDraggers() {
    return this.boxEntity.editing.draggers;
  }

  setPosition(positions) {
    this.boxEntity.editing._positions_draw = positions;
    this.boxEntity._positions_draw = positions;
  }

  // 更新polygon
  updatePolygon() {
    let _this = this;
    this.boxEntity.polygon.hierarchy = new Cesium.CallbackProperty(function () {
      let positions = _this.getPosition();
      return new Cesium.PolygonHierarchy(positions);
    }, false);
  }

  formatNum(num, digits) {
    return formatNum(num, digits);
  }

  // 创建移动旋转指示器
  createIndicator(entity) {
    this.boxEntity = entity;
    this.boxDraggers = entity.editing.draggers;
    let position_center = this.boxDraggers[4].position.getValue();
    let positionLonlat = cartesian2lonlat(position_center);

    this.dataSource.entities.add({
      id: 'clip_move_surface',
      name: 'move_surface',
      position: position_center,
      ellipse: {
        semiMinorAxis: 4,
        semiMajorAxis: 4,
        material: Cesium.Color.ORANGE.withAlpha(0.5),
        height: entity.polygon.extrudedHeight.getValue() + 0.02,
        outline: false
      }
    });
    // let move_surface = this.dataSource.entities.add({
    //   id: 'clip_move_surface',
    //   name: 'move_surface',
    //   rectangle: {
    //     coordinates: Cesium.Rectangle.fromDegrees(positionLonlat[0], positionLonlat[1], positionLonlat[0] + 0.00003, positionLonlat[1] + 0.000025),
    //     material: Cesium.Color.ORANGE.withAlpha(0.5),
    //     height: entity._rectangle.extrudedHeight.getValue() + 0.02,
    //     outline: false,
    //   }
    // });
    this.dataSource.entities.add({
      id: 'clip_move_line1',
      name: 'move_line1',
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          positionLonlat[0],
          positionLonlat[1],
          entity.polygon.extrudedHeight.getValue() + 0.06,
          positionLonlat[0] + 0.00006,
          positionLonlat[1],
          entity.polygon.extrudedHeight.getValue() + 0.06
        ]),
        width: 20,
        material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW)
      }
    });
    this.dataSource.entities.add({
      id: 'clip_move_line2',
      name: 'move_line2',
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          positionLonlat[0],
          positionLonlat[1],
          entity.polygon.extrudedHeight.getValue() + 0.06,
          positionLonlat[0],
          positionLonlat[1] + 0.00005,
          entity.polygon.extrudedHeight.getValue() + 0.06
        ]),
        width: 20,
        material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW)
      }
    });
    let center = cartesian2lonlat(position_center);
    let options = { steps: 60, units: 'meters' };
    let circle1 = turf.circle(center, 4.5, options);
    let circle2 = turf.circle(center, 4, options);
    let outside = circle1.geometry.coordinates[0].map((e) => {
      return Cesium.Cartesian3.fromDegrees.apply(this, e);
    });
    let inside = circle2.geometry.coordinates[0].map((e) => {
      return Cesium.Cartesian3.fromDegrees.apply(this, e);
    });
    this.dataSource.entities.add({
      id: 'clip_move_circle',
      name: 'move_circle',
      polygon: {
        hierarchy: {
          positions: outside,
          holes: [{ positions: inside }]
        },
        height: entity.polygon.extrudedHeight.getValue() + 0.08
      }
    });
    //console.log('move_circle', move_circle);
    this.bindEvent();
  }

  // 绑定鼠标事件
  bindEvent() {
    let _this = this;
    let draggerHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.canvas);
    draggerHandler.dragger = null;
    let moveLine, moveEllipse, movePolygon;
    draggerHandler.setInputAction(function (event) {
      let pickedObject = _this.viewer.scene.pick(event.position);
      if (Cesium.defined(pickedObject)) {
        let entity =
          pickedObject.id ||
          pickedObject.primitive.id ||
          pickedObject.primitive;
        // console.log('鼠标点击', entity);
        if (
          entity.id === 'clip_move_surface' ||
          entity.id === 'clip_move_line1' ||
          entity.id === 'clip_move_line2' ||
          entity.id === 'clip_move_circle'
        ) {
          _this.viewer.scene.screenSpaceCameraController.enableRotate = false;
          _this.viewer.scene.screenSpaceCameraController.enableTilt = false;
          _this.viewer.scene.screenSpaceCameraController.enableTranslate = false;
          _this.viewer.scene.screenSpaceCameraController.enableInputs = false;

          draggerHandler.dragger = entity;
          _this.viewer._container.style.cursor = 'crosshair';
          _this.boxEntity.editing.activate();

          if (Cesium.defined(pickedObject.id.polyline)) {
            moveLine = pickedObject.id.polyline;
            moveLine.material = new Cesium.PolylineArrowMaterialProperty(
              Cesium.Color.RED
            );
          }
          // if (Cesium.defined(pickedObject.id.rectangle)) {
          //   moveRectangle = pickedObject.id.rectangle
          //   moveRectangle.material = Cesium.Color.RED
          // }
          if (Cesium.defined(pickedObject.id.ellipse)) {
            moveEllipse = pickedObject.id.ellipse;
            moveEllipse.material = Cesium.Color.RED;
          }
          if (Cesium.defined(pickedObject.id.polygon)) {
            movePolygon = pickedObject.id.polygon;
            movePolygon.material = Cesium.Color.RED;
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
    draggerHandler.setInputAction(function (event) {
      let dragger = draggerHandler.dragger;
      if (dragger) {
        let startRay = _this.viewer.camera.getPickRay(event.startPosition);
        let startPoint = _this.viewer.scene.globe.pick(
          startRay,
          _this.viewer.scene,
          new Cesium.Cartesian3()
        );
        let endRay = _this.viewer.camera.getPickRay(event.endPosition);
        let endtPoint = _this.viewer.scene.globe.pick(
          endRay,
          _this.viewer.scene,
          new Cesium.Cartesian3()
        );
        let vector = Cesium.Cartesian3.subtract(
          endtPoint,
          startPoint,
          new Cesium.Cartesian3()
        );

        let entityType = dragger.id;
        // 偏差
        /* let dx = event.endPosition.x - event.startPosition.x;
        let dy = event.endPosition.y - event.startPosition.y;
        // 方向
        let heading = getCameraView(_this.viewer).heading; */
        //console.log('target');
        switch (entityType) {
          case 'clip_move_surface':
            let normal = Cesium.Cartesian3.subtract(
              endtPoint,
              startPoint,
              new Cesium.Cartesian3()
            ); // 任意方向
            let normalOfPlane = Cesium.Cartesian3.normalize(
              normal,
              new Cesium.Cartesian3()
            );
            _this.dragIndicator(vector, normalOfPlane);
            break;
          case 'clip_move_line1':
            let draggerLine1 =
              _this.dataSource.entities.getById('clip_move_line1').polyline;
            let line_ps = draggerLine1.positions.getValue();
            let normal1 = Cesium.Cartesian3.subtract(
              line_ps[0],
              line_ps[1],
              new Cesium.Cartesian3()
            ); // x轴方向
            let normalOfPlane1 = Cesium.Cartesian3.normalize(
              normal1,
              new Cesium.Cartesian3()
            );
            _this.dragIndicator(vector, normalOfPlane1);
            break;
          case 'clip_move_line2':
            let draggerLine2 =
              _this.dataSource.entities.getById('clip_move_line2').polyline;
            let line_ps2 = draggerLine2.positions.getValue();
            let normal2 = Cesium.Cartesian3.subtract(
              line_ps2[0],
              line_ps2[1],
              new Cesium.Cartesian3()
            ); // y轴方向
            let normalOfPlane2 = Cesium.Cartesian3.normalize(
              normal2,
              new Cesium.Cartesian3()
            );
            _this.dragIndicator(vector, normalOfPlane2);
            break;
          case 'clip_move_circle':
            let draggers = _this.getDraggers();
            let pC2 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
              _this.viewer.scene,
              draggers[4].position.getValue()
            ); // 圆中心点
            let p1C2 = event.startPosition;
            let p2C2 = event.endPosition;
            // (x2-x1)*(y3-y1)-(y2-y1)*(x3-x1) 大于0为顺时针
            // let a = (p2C2.x - p1C2.x)*(pC2.y - p1C2.y) - (p2C2.y - p1C2.y)*(pC2.x - p1C2.x);
            let p1 = Cesium.Cartesian2.subtract(
              p1C2,
              pC2,
              new Cesium.Cartesian2()
            );
            let p2 = Cesium.Cartesian2.subtract(
              p2C2,
              pC2,
              new Cesium.Cartesian2()
            );
            let a = Cesium.Cartesian2.cross(p1, p2); // 大于0为顺时针
            let angle = Cesium.Cartesian2.angleBetween(p1, p2);
            let degree = Cesium.Math.toDegrees(angle);
            let _angle = a > 0 ? -degree : degree;
            _this.rotateIndicator(_angle);
            break;
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    draggerHandler.setInputAction(function () {
      if (draggerHandler.dragger) {
        if (_this.boxEntity.editing) {
          // 更新绑定拖拽点
          _this.boxEntity.editing.updateDraggers();
          // 拖拽点编辑回调
          _this.boxEntity.editing.draggers.forEach((dragger) => {
            dragger.callback = (position, type) => {
              _this.updatePlane(position, type);
            };
          });
        }
        if (moveLine) {
          moveLine.material = new Cesium.PolylineArrowMaterialProperty(
            Cesium.Color.YELLOW
          );
        }
        if (moveEllipse) {
          moveEllipse.material = Cesium.Color.ORANGE.withAlpha(0.5);
        }
        if (movePolygon) {
          movePolygon.material = Cesium.Color.WHITE;
        }

        draggerHandler.dragger = null;
        _this.viewer._container.style.cursor = 'default';

        _this.viewer.scene.screenSpaceCameraController.enableRotate = true;
        _this.viewer.scene.screenSpaceCameraController.enableTilt = true;
        _this.viewer.scene.screenSpaceCameraController.enableTranslate = true;
        _this.viewer.scene.screenSpaceCameraController.enableInputs = true;
      }
    }, Cesium.ScreenSpaceEventType.LEFT_UP);
    this.draggerHandler = draggerHandler;
  }

  // 拖动指示器
  dragIndicator(vector, normalOfPlane) {
    let _this = this;
    let positions = this.getPosition();
    let draggers = this.getDraggers();

    //投影
    let projectV = Cesium.Cartesian3.projectVector(
      vector,
      normalOfPlane,
      new Cesium.Cartesian3()
    );
    projectV = Cesium.Cartesian3.multiplyByScalar(
      projectV,
      1,
      new Cesium.Cartesian3()
    );
    let newArrPc3s = [];
    for (let i = 0; i < positions.length; i++) {
      let newPc3 = Cesium.Cartesian3.add(
        positions[i],
        projectV,
        new Cesium.Cartesian3()
      );
      newArrPc3s.push(newPc3);
    }

    // 更新polygon坐标、PolygonGraphics
    _this.setPosition(newArrPc3s);
    _this.updatePolygon();

    //更新拖拽点坐标
    for (let j = 0; j < draggers.length; j++) {
      draggers[j].position = Cesium.Cartesian3.add(
        draggers[j].position.getValue(),
        projectV,
        new Cesium.Cartesian3()
      );
      _this.updatePlane(draggers[j].position.getValue(), 'box-' + (j + 1));
    }

    // 更新指示器坐标
    let polyCenter = draggers[4].position.getValue();
    this.updateIndicatorPositions(polyCenter);
  }
  // 旋转指示器
  rotateIndicator(angle) {
    let _this = this;
    let positions = this.getPosition();
    let draggers = this.getDraggers();

    let position_t = draggers[4].position.getValue();
    let position_b = draggers[5].position.getValue();
    // 盒子中心点
    let position_c = Cesium.Cartesian3.midpoint(
      position_t,
      position_b,
      position_t.clone()
    );
    // 旋转矩阵
    let rotationM = Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(angle));
    for (let n = 0; n < this.tilesetArr.length; n++) {
      let tileset = this.tilesetArr[n];
      let inverseTransform = getInverseTransform(tileset); //原点矩阵
      // 初始位置四个面的法向量 右前左后
      /*  let initialNormals = [
        new Cesium.Cartesian3(1, 0, 0),
        new Cesium.Cartesian3(0, -1, 0),
        new Cesium.Cartesian3(-1, 0, 0),
        new Cesium.Cartesian3(0, 1, 0)
      ]; */
      for (let i = 0; i < 4; i++) {
        // 更新normal
        this.arrNormal[n][i] = Cesium.Matrix3.multiplyByVector(
          rotationM,
          this.arrNormal[n][i],
          new Cesium.Cartesian3()
        );
        // 更新旋转后的拖拽点坐标
        draggers[i].position = this.rotatedPointByAngle(
          draggers[i].position.getValue(),
          position_c,
          -angle
        );
        // 更新距离
        let _pointC3 = getOriginCoordinateSystemPoint(
          draggers[i].position.getValue(),
          inverseTransform
        );
        let newPlane = Cesium.Plane.fromPointNormal(
          _pointC3,
          this.arrNormal[n][i]
        );
        this.arrDistance[n][i] = newPlane.distance;
      }
      //更新盒子polygon坐标、PolygonGraphics
      let newArrPc3s = [];
      for (let j = 0; j < positions.length; j++) {
        let newPc3 = this.rotatedPointByAngle(positions[j], position_b, -angle);
        newArrPc3s.push(newPc3);
      }
      _this.setPosition(newArrPc3s);
      _this.updatePolygon();
    }
  }
  // 更新指示器坐标
  updateIndicatorPositions(position_center) {
    let positionLonlat = cartesian2lonlat(position_center);
    let positionLonlat1 = [
      positionLonlat[0] + 0.00006,
      positionLonlat[1],
      positionLonlat[2] + 0.06
    ];
    let positionLonlat2 = [
      positionLonlat[0],
      positionLonlat[1] + 0.00005,
      positionLonlat[2] + 0.06
    ];
    // x轴
    let draggerLine1 =
      this.dataSource.entities.getById('clip_move_line1').polyline;
    let endPositions1 = [position_center, lonlat2cartesian(positionLonlat1)];
    draggerLine1.positions = new Cesium.CallbackProperty(function () {
      return endPositions1;
    }, false);
    // y轴
    let draggerLine2 =
      this.dataSource.entities.getById('clip_move_line2').polyline;
    let endPositions2 = [position_center, lonlat2cartesian(positionLonlat2)];
    draggerLine2.positions = new Cesium.CallbackProperty(function () {
      return endPositions2;
    }, false);
    // 面
    let draggerSurface = this.dataSource.entities.getById('clip_move_surface');
    let extrudedHeight =
      Cesium.Cartographic.fromCartesian(position_center).height;
    draggerSurface.position = new Cesium.CallbackProperty(() => {
      return position_center;
    }, false);
    draggerSurface.ellipse.height = new Cesium.CallbackProperty(() => {
      return extrudedHeight + 0.02;
    }, false);
    // 圆环
    let draggerCircle = this.dataSource.entities.getById('clip_move_circle');
    draggerCircle.polygon.height = new Cesium.CallbackProperty(() => {
      return extrudedHeight + 0.08;
    }, false);
    let center = cartesian2lonlat(position_center);
    let options = { steps: 60, units: 'meters' };
    let circle1 = turf.circle(center, 4.5, options);
    let circle2 = turf.circle(center, 4, options);
    let outside = circle1.geometry.coordinates[0].map((e) => {
      return Cesium.Cartesian3.fromDegrees.apply(this, e);
    });
    let inside = circle2.geometry.coordinates[0].map((e) => {
      return Cesium.Cartesian3.fromDegrees.apply(this, e);
    });
    let hierarchy = {
      positions: outside,
      holes: [{ positions: inside }]
    };
    draggerCircle.polygon.hierarchy = new Cesium.CallbackProperty(() => {
      return hierarchy;
    }, false);
  }

  // 裁切
  toClip(points, heightPoint) {
    this.arrDistance = [];
    this.arrNormal = [];
    for (let n = 0; n < this.tilesetArr.length; n++) {
      this.arrDistance.push([0, 0, 0, 0, 0, 0]);
      this.arrNormal.push([0, 0, 0, 0, 0, 0]);
      this.arrHeight.push(0);
      let tileset = this.tilesetArr[n];
      let inverseTransform = getInverseTransform(tileset); //原点矩阵
      switch (this.type) {
        case 0: // 水平面
          let levelPlanes = this.getPolygonPlane(tileset, points);
          let point_c = getOriginCoordinateSystemPoint(
            heightPoint,
            inverseTransform
          );
          let down = new Cesium.Cartesian3(0, 0, -1); // 向下
          let downPlane = this.computePlaneTmp(down, point_c);
          this.isOutside = false;
          this.createClippingPlanes(
            tileset,
            [downPlane, ...levelPlanes],
            n,
            heightPoint
          );
          break;
        case 1: // 立面
          let p1C3 = getOriginCoordinateSystemPoint(
            points[0],
            inverseTransform
          );
          let p2C3 = getOriginCoordinateSystemPoint(
            points[1],
            inverseTransform
          );
          let p1hC3 = getOriginCoordinateSystemPoint(
            heightPoint[0],
            inverseTransform
          );

          let facadeLower = new Cesium.Cartesian3(0, 0, -1);
          let facadePlane = this.computePlaneTmp(facadeLower, p1C3, p2C3); // 立面1
          let facade1 = Cesium.Cartesian3.subtract(
            p1C3,
            p2C3,
            new Cesium.Cartesian3()
          );
          facade1 = Cesium.Cartesian3.normalize(facade1, facade1);
          let facadePlane1 = this.computePlaneTmp(facade1, p1C3); // 立面2
          let facade2 = Cesium.Cartesian3.subtract(
            p2C3,
            p1C3,
            new Cesium.Cartesian3()
          );
          facade2 = Cesium.Cartesian3.normalize(facade2, facade2);
          let facadePlane2 = this.computePlaneTmp(facade2, p2C3); // 立面3
          let facade3 = new Cesium.Cartesian3(0, 0, 1);
          let facadePlane3 = this.computePlaneTmp(facade3, p1hC3); // 立面4 上
          let facade4 = new Cesium.Cartesian3(0, 0, -1);
          let facadePlane4 = this.computePlaneTmp(facade4, p1C3); // 立面5 下
          this.isOutside = false;
          this.createClippingPlanes(
            tileset,
            [
              facadePlane,
              facadePlane1,
              facadePlane2,
              facadePlane3,
              facadePlane4
            ],
            n,
            heightPoint
          );
          break;
        case 2: // 盒子
          let phorn1 = getOriginCoordinateSystemPoint(
            points[0],
            inverseTransform
          );
          let phorn2 = getOriginCoordinateSystemPoint(
            points[1],
            inverseTransform
          );
          let phorn3 = getOriginCoordinateSystemPoint(
            points[2],
            inverseTransform
          );
          let phorn4 = getOriginCoordinateSystemPoint(
            points[3],
            inverseTransform
          );
          let boxh = getOriginCoordinateSystemPoint(
            heightPoint,
            inverseTransform
          );

          let direction1 = this.isOutside
            ? Cesium.Cartesian3.subtract(
                phorn1,
                phorn4,
                new Cesium.Cartesian3()
              )
            : Cesium.Cartesian3.subtract(
                phorn4,
                phorn1,
                new Cesium.Cartesian3()
              );
          direction1 = Cesium.Cartesian3.normalize(direction1, direction1);
          let plane1 = this.computePlaneTmp(direction1, phorn4); // 右

          let direction2 = this.isOutside
            ? Cesium.Cartesian3.subtract(
                phorn4,
                phorn3,
                new Cesium.Cartesian3()
              )
            : Cesium.Cartesian3.subtract(
                phorn3,
                phorn4,
                new Cesium.Cartesian3()
              );
          direction2 = Cesium.Cartesian3.normalize(direction2, direction2);
          let plane2 = this.computePlaneTmp(direction2, phorn3); // 前

          let direction3 = this.isOutside
            ? Cesium.Cartesian3.subtract(
                phorn3,
                phorn2,
                new Cesium.Cartesian3()
              )
            : Cesium.Cartesian3.subtract(
                phorn2,
                phorn3,
                new Cesium.Cartesian3()
              );
          direction3 = Cesium.Cartesian3.normalize(direction3, direction3);
          let plane3 = this.computePlaneTmp(direction3, phorn2); // 左

          let direction4 = this.isOutside
            ? Cesium.Cartesian3.subtract(
                phorn2,
                phorn1,
                new Cesium.Cartesian3()
              )
            : Cesium.Cartesian3.subtract(
                phorn1,
                phorn2,
                new Cesium.Cartesian3()
              );
          direction4 = Cesium.Cartesian3.normalize(direction4, direction4);
          let plane4 = this.computePlaneTmp(direction4, phorn1); // 后

          let direction5 = this.isOutside
            ? new Cesium.Cartesian3(0, 0, -1)
            : new Cesium.Cartesian3(0, 0, 1);
          let plane5 = this.computePlaneTmp(direction5, boxh); // 上

          let direction6 = this.isOutside
            ? new Cesium.Cartesian3(0, 0, 1)
            : new Cesium.Cartesian3(0, 0, -1);
          let plane6 = this.computePlaneTmp(direction6, phorn1); // 下
          this.createClippingPlanes(
            tileset,
            [plane1, plane2, plane3, plane4, plane5, plane6],
            n,
            heightPoint
          );
          break;
        case 3: // 凸多边形
          //console.log('=====1', points, heightPoint);
          let polygonPlanes = this.getPolygonPlane(tileset, points);
          let pointBelow = getOriginCoordinateSystemPoint(
            points[0],
            inverseTransform
          );
          let below = new Cesium.Cartesian3(0, 0, -1);
          let belowPlane = this.computePlaneTmp(below, pointBelow); //下
          let pointUp = getOriginCoordinateSystemPoint(
            heightPoint,
            inverseTransform
          );
          let up = new Cesium.Cartesian3(0, 0, 1);
          let upPlane = this.computePlaneTmp(up, pointUp); //上
          this.isOutside = false;
          this.createClippingPlanes(
            tileset,
            [upPlane, belowPlane, ...polygonPlanes],
            n,
            heightPoint
          );
          break;
      }
    }
  }

  // 构造裁切面
  createClippingPlanes(tileset, planes, n, position) {
    let _this = this;
    // let boundingSphere = tileset.boundingSphere;
    // let radius = boundingSphere.radius;
    // let boundingSphere = tileset._root.boundingVolume.boundingSphere;
    // let radius = boundingSphere.radius;
    // tileset.readyPromise.then(() => {
    tileset.backFaceCulling = false; // 开启双面
    tileset.clippingPlanes = new Cesium.ClippingPlaneCollection({
      planes: planes,
      edgeWidth: 1,
      edgeColor: Cesium.Color.WHITE,
      enabled: true,
      unionClippingRegions: this.isOutside
    });
    for (var i = 0; i < tileset.clippingPlanes.length; ++i) {
      let planei = tileset.clippingPlanes.get(i);
      this.dataSource.entities.add({
        // position: boundingSphere.center,
        position: position,
        plane: {
          // dimensions: new Cesium.Cartesian2(
          //   radius * 2.5,
          //   radius * 2.5
          // ),
          dimensions: new Cesium.Cartesian2(300, 300),
          material: Cesium.Color.RED.withAlpha(0),
          plane: new Cesium.CallbackProperty(
            _this.createPlaneUpdateFunction(planei, n, i),
            false
          )
        }
      });
    }
    // })
  }

  // 更新裁切面的distance
  updatePlane(poistion, type) {
    if (type !== 0 && type.indexOf('box') !== -1) {
      let draggers = this.getDraggers();
      let polyCenter = draggers[4].position.getValue();
      this.updateIndicatorPositions(polyCenter);
    }
    for (let n = 0; n < this.tilesetArr.length; n++) {
      let tileset = this.tilesetArr[n];
      let _inverseTransform = getInverseTransform(tileset); //原点矩阵
      let pointC, pointC1, pointC2;
      if (Array.isArray(poistion)) {
        pointC1 = getOriginCoordinateSystemPoint(
          poistion[0],
          _inverseTransform
        );
        pointC2 = getOriginCoordinateSystemPoint(
          poistion[1],
          _inverseTransform
        );
      } else {
        pointC = getOriginCoordinateSystemPoint(poistion, _inverseTransform);
      }
      switch (type) {
        case 0: // 水平面
          this.arrDistance[n][0] = pointC.z;
          break;
        case 'facade1': // 立面
          let facadeLower = new Cesium.Cartesian3(0, 0, -1);
          let facadePlane = this.computePlaneTmp(facadeLower, pointC1, pointC2);
          this.arrDistance[n][0] = facadePlane.distance;
          break;
        case 'facade2':
          let facade1 = Cesium.Cartesian3.subtract(
            pointC1,
            pointC2,
            new Cesium.Cartesian3()
          );
          facade1 = Cesium.Cartesian3.normalize(facade1, facade1);
          let facadePlane1 = this.computePlaneTmp(facade1, pointC1);
          this.arrDistance[n][1] = facadePlane1.distance;
          break;
        case 'facade3':
          let facade2 = Cesium.Cartesian3.subtract(
            pointC2,
            pointC1,
            new Cesium.Cartesian3()
          );
          facade2 = Cesium.Cartesian3.normalize(facade2, facade2);
          let facadePlane2 = this.computePlaneTmp(facade2, pointC2);
          this.arrDistance[n][2] = facadePlane2.distance;
          break;
        case 'facade4':
          this.arrDistance[n][3] = -pointC.z;
          break;
        case 'facade5':
          this.arrDistance[n][4] = pointC.z;
          break;
        case 'box-5': //盒子
          this.arrDistance[n][4] = this.isOutside ? pointC.z : -pointC.z;
          break;
        case 'box-6':
          this.arrDistance[n][5] = this.isOutside ? -pointC.z : pointC.z;
          break;
        case 'box-1':
          // this.arrDistance[n][0] = this.isOutside ? pointC.x : -pointC.x; 旧
          this.arrDistance[n][0] = this.computePlaneDistance(
            pointC,
            this.arrNormal[n][0]
          );
          break;
        case 'box-3':
          // this.arrDistance[n][2] = this.isOutside ? -pointC.x : pointC.x;
          this.arrDistance[n][2] = this.computePlaneDistance(
            pointC,
            this.arrNormal[n][2]
          );
          break;
        case 'box-2':
          // this.arrDistance[n][1] = this.isOutside ? -pointC.y : pointC.y;
          this.arrDistance[n][1] = this.computePlaneDistance(
            pointC,
            this.arrNormal[n][1]
          );
          break;
        case 'box-4':
          // this.arrDistance[n][3] = this.isOutside ? pointC.y : -pointC.y;
          this.arrDistance[n][3] = this.computePlaneDistance(
            pointC,
            this.arrNormal[n][3]
          );
          break;
        case 'polygon-1': // 多边形上
          this.arrDistance[n][0] = -pointC.z;
          break;
        case 'polygon-2': // 多边形下
          this.arrDistance[n][1] = pointC.z;
          break;
      }
    }
  }

  // 计算distance
  computePlaneDistance(point, normal) {
    // let _normal = Cesium.Cartesian3.normalize(normal, normal)
    let plane = Cesium.Plane.fromPointNormal(point, normal);
    return plane.distance;
  }

  // 更新裁切面
  createPlaneUpdateFunction(plane, i, j) {
    let that = this;
    this.arrDistance[i][j] = plane.distance;
    this.arrNormal[i][j] = plane.normal;
    return function () {
      plane.distance = that.arrDistance[i][j];
      plane.normal = that.arrNormal[i][j];
      return plane;
    };
  }

  // 法向和点生成裁切面
  computePlaneTmp(direction, p1, p2) {
    if (p2) {
      //  由p1指向p2的向量
      let vector = Cesium.Cartesian3.subtract(p2, p1, new Cesium.Cartesian3());
      // 计算normal， vector叉乘direction，得到平面法向量，这个法向量指向direction的右侧
      let normal = Cesium.Cartesian3.cross(
        vector,
        direction,
        new Cesium.Cartesian3()
      );
      normal = Cesium.Cartesian3.normalize(normal, normal);

      //由于已经获得了法向量和过平面的一点，因此可以直接构造Plane,并进一步构造ClippingPlane
      let planeTmp = Cesium.Plane.fromPointNormal(p1, normal);
      return Cesium.ClippingPlane.fromPlane(planeTmp);
    } else {
      let planeTmp1 = Cesium.Plane.fromPointNormal(p1, direction);
      return Cesium.ClippingPlane.fromPlane(planeTmp1);
    }
  }

  // 清除裁切
  clearClippingPlane() {
    if (this.draggerHandler) {
      this.draggerHandler.destroy();
      this.draggerHandler = undefined;
    }
    for (let i = 0; i < this.tilesetArr.length; i++) {
      let _clippingPlanes = this.tilesetArr[i].clippingPlanes;
      if (_clippingPlanes && _clippingPlanes.length > 0) {
        _clippingPlanes.removeAll();
      }
      // let len = JSON.parse(JSON.stringify(_clippingPlanes.length));
      // for(let i = 0; i < len; i++){
      //   _clippingPlanes.remove(_clippingPlanes.get(0))
      // }
      this.tilesetArr[i].backFaceCulling = true;
    }
  }

  // 旋转更改坐标点
  updateRotationPosition(points, angle) {
    let midpoint = Cesium.Cartesian3.midpoint(
      points[0],
      points[1],
      points[0].clone()
    );
    let newP1 = this.rotatedPointByAngle(points[0], midpoint, angle);
    let newP2 = this.rotatedPointByAngle(points[1], midpoint, angle);
    return [newP1, newP2];
  }

  //position_A绕position_B逆时针旋转angle度（角度）得到新点
  rotatedPointByAngle(position_A, position_B, angle) {
    //以B点为原点建立局部坐标系（东方向为x轴,北方向为y轴,垂直于地面为z轴），得到一个局部坐标到世界坐标转换的变换矩阵
    var localToWorld_Matrix =
      Cesium.Transforms.eastNorthUpToFixedFrame(position_B);
    //求世界坐标到局部坐标的变换矩阵
    var worldToLocal_Matrix = Cesium.Matrix4.inverse(
      localToWorld_Matrix,
      new Cesium.Matrix4()
    );
    //B点在局部坐标的位置，其实就是局部坐标原点
    /* var localPosition_B = Cesium.Matrix4.multiplyByPoint(
      worldToLocal_Matrix,
      position_B,
      new Cesium.Cartesian3()
    ); */
    //A点在以B点为原点的局部的坐标位置
    var localPosition_A = Cesium.Matrix4.multiplyByPoint(
      worldToLocal_Matrix,
      position_A,
      new Cesium.Cartesian3()
    );
    //根据数学公式A点逆时针旋转angle度后在局部坐标系中的x,y,z位置
    var new_x =
      localPosition_A.x * Math.cos(Cesium.Math.toRadians(angle)) +
      localPosition_A.y * Math.sin(Cesium.Math.toRadians(angle));
    var new_y =
      localPosition_A.y * Math.cos(Cesium.Math.toRadians(angle)) -
      localPosition_A.x * Math.sin(Cesium.Math.toRadians(angle));
    var new_z = localPosition_A.z;
    //最后应用局部坐标到世界坐标的转换矩阵求得旋转后的A点世界坐标
    return Cesium.Matrix4.multiplyByPoint(
      localToWorld_Matrix,
      new Cesium.Cartesian3(new_x, new_y, new_z),
      new Cesium.Cartesian3()
    );
  }

  // 获取多边形裁切面
  getPolygonPlane(tileset, points) {
    if (points.length > 2) {
      let polygonClockWise;
      let cartesian3Points = [];

      switch (true) {
        case points[0] instanceof Cesium.Cartesian3:
          cartesian3Points = points;
          polygonClockWise = ringIsClockwise(cartesian3Points);
          break;
        case points[0] instanceof Cesium.Cartographic:
          let cartographicPointsArray = [];
          for (let index = 0; index < points.length; index++) {
            const degree = points[index];
            cartesian3Points.push(
              Cesium.Cartesian3.fromDegrees(
                degree.longitude,
                degree.latitude,
                degree.height
              )
            );
            let point = [2];
            point[0] = degree.longitude;
            point[1] = degree.latitude;
            cartographicPointsArray.push(point);
          }
          polygonClockWise = ringIsClockwise(cartographicPointsArray);
          break;
        default:
          for (let index = 0; index < points.length; index++) {
            const degree = points[index];
            cartesian3Points.push(
              Cesium.Cartesian3.fromDegrees(degree[0], degree[1], degree[2])
            );
          }
          polygonClockWise = ringIsClockwise(points);
      }

      let clippingPlanes = [];
      let pointsLength = cartesian3Points.length;

      let inverseTransform = getInverseTransform(tileset);

      var direction = polygonClockWise;

      for (let i = 0; i < pointsLength; ++i) {
        let nextIndex = (i + 1) % pointsLength;

        let up = new Cesium.Cartesian3(0, 0, 10);
        // let up = _unionClippingRegions ? new Cesium.Cartesian3(0, 0, -10) : new Cesium.Cartesian3(0, 0, 10);
        let right;
        if (direction) {
          //顺时针
          right = Cesium.Cartesian3.subtract(
            getOriginCoordinateSystemPoint(
              cartesian3Points[i],
              inverseTransform
            ),
            getOriginCoordinateSystemPoint(
              cartesian3Points[nextIndex],
              inverseTransform
            ),
            new Cesium.Cartesian3()
          );
        } else {
          right = Cesium.Cartesian3.subtract(
            getOriginCoordinateSystemPoint(
              cartesian3Points[nextIndex],
              inverseTransform
            ),
            getOriginCoordinateSystemPoint(
              cartesian3Points[i],
              inverseTransform
            ),
            new Cesium.Cartesian3()
          );
        }
        if (right.x === 0 && right.y === 0 && right.z === 0) {
          return (clippingPlanes = []);
        }
        right = Cesium.Cartesian3.normalize(right, right);

        let normal = Cesium.Cartesian3.cross(
          right,
          up,
          new Cesium.Cartesian3()
        );
        normal = Cesium.Cartesian3.normalize(normal, normal);

        // Compute distance by pretending the plane is at the origin
        clippingPlanes.push(
          new Cesium.ClippingPlane.fromPlane(
            Cesium.Plane.fromPointNormal(
              getOriginCoordinateSystemPoint(
                cartesian3Points[i],
                inverseTransform
              ),
              normal
            )
          )
        );
      }
      return clippingPlanes;
    }
  }
}
export { ClipTools };
