import * as Cesium from 'cesium_shinegis_earth';
import * as EventType from './EventType7';
import * as PolylineAttr from './EntityAttr/PolylineAttr15';
import {
  getCurrentMousePosition,
  addPositionsHeight,
  setPositionsHeight
} from '../Tool/Point2';
import { message } from '../Tool/ToolTip4';
import { DrawBase } from './DrawBase22';
import { EditPolyline } from '../Edit/EditPolyline12';
import { computeRectanglePoints } from '../Tool/Util3';
import * as Util from '../Tool/Util3';

/**
 * 线绘制类
 * @extends DrawBase
 * @memberOf DrawBase
 */
class DrawPolyline extends DrawBase {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'polyline';
    this._minPointNum = 2;
    this._maxPointNum = 9999;
    this.editClass = EditPolyline;
    this.attrClass = PolylineAttr;
    this.geometryInstances = [];
    this.polylinePrimitive;
  }

  /**
   * 根据attribute参数创建Entity
   * @param attribute
   * @returns {entity}
   */
  //根据attribute参数创建Entity
  createFeature(attribute) {
    this._positions_draw = [];
    if (!this._minPointNum_def) this._minPointNum_def = this._minPointNum;
    if (!this._maxPointNum_def) this._maxPointNum_def = this._maxPointNum;

    if (attribute.config) {
      //允许外部传入
      this._minPointNum = attribute.config.minPointNum || this._minPointNum_def;
      this._maxPointNum = attribute.config.maxPointNum || this._maxPointNum_def;
    } else {
      this._minPointNum = this._minPointNum_def;
      this._maxPointNum = this._maxPointNum_def;
    }

    let that = this;
    let addattr = {
      polyline: PolylineAttr.style2Entity(attribute.style),
      attribute: attribute
    };
    addattr.polyline.positions = new Cesium.CallbackProperty(function () {
      return that.getDrawPosition();
    }, false);
    this.entity = this.dataSource.entities.add(addattr); //创建要素对象；
    this.entity._positions_draw = this._positions_draw;

    return this.entity;
  }
  /**
   * 用于加载GeoJson
   * @param {*} features
   * @returns primitive
   */
  loadJson(features) {
    let geometryInstances = [];
    let options = PolylineAttr.style2Entity(features[0].properties.style);
    let material = options.material.getValue?.() || options.material;
    let [type, value] = [
      material.getType?.() || 'Color',
      material.getValue?.() || { color: material }
    ];
    let appearance = new Cesium.PolylineMaterialAppearance({
      material: new Cesium.Material({
        fabric: {
          type: type,
          uniforms: value
        }
      })
    });
    for (let index = 0; index < features.length; index++) {
      const feature = features[index];
      let attribute = feature.properties;
      let positions = Util.getPositionByGeoJSON(feature); //取到了positions
      let options = PolylineAttr.style2Entity(attribute.style);

      let instance = new Cesium.GeometryInstance({
        geometry: new Cesium.PolylineGeometry({
          positions: positions,
          width: options.width || 2.0,
          vertexFormat: Cesium.PolylineMaterialAppearance.VERTEX_FORMAT
        })
      });
      geometryInstances.push(instance);
    }
    let primitive = this.primitives.add(
      new Cesium.Primitive({
        geometryInstances: geometryInstances,
        appearance: appearance
      })
    );
    return primitive;
  }

  /**
   * 属性转entity
   * @param style
   * @param entity
   * @returns {entity}
   */
  style2Entity(style, entity) {
    return PolylineAttr.style2Entity(style, entity.polyline);
  }

  /**
   * 绑定鼠标事件
   */
  bindEvent() {
    let _this = this;
    let lastPointTemporary = false;
    this.getHandler().setInputAction(function (event) {
      //单击添加点
      let point = getCurrentMousePosition(
        _this.viewer.scene,
        event.position,
        _this.entity
      ); //可能primitive模式下排除_this.entity异常。
      if (point) {
        if (lastPointTemporary) {
          _this._positions_draw.pop();
        }
        lastPointTemporary = false;

        //在绘制点基础自动增加高度
        if (
          _this.entity.attribute &&
          _this.entity.attribute.config &&
          _this.entity.attribute.config.addHeight
        )
          point = addPositionsHeight(
            point,
            _this.entity.attribute.config.addHeight
          );

        // 第二点与第一点等高
        if (
          _this.entity.attribute &&
          _this.entity.attribute.config &&
          _this.entity.attribute.config.isSameHeight
        ) {
          if (_this._positions_draw.length >= 1) {
            let carto = Cesium.Cartographic.fromCartesian(
              _this._positions_draw[0]
            );
            point = setPositionsHeight(point, carto.height);
          }
        }
        _this._positions_draw.push(point);

        // 盒子
        if (
          _this.entity.attribute &&
          _this.entity.attribute.config &&
          _this.entity.attribute.config.isBox
        ) {
          if (_this._positions_draw.length === 4) {
            _this._positions_draw = computeRectanglePoints(
              _this._positions_draw[0],
              point
            );
          }
        }
        _this.updateAttrForDrawing();

        _this.fire(EventType.DrawAddPoint, {
          drawtype: _this.type,
          entity: _this.entity,
          position: point,
          positions: _this._positions_draw
        });

        if (_this._positions_draw.length >= _this._maxPointNum) {
          //点数满足最大数量，自动结束
          _this.disable();
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    this.getHandler().setInputAction(function (event) {
      //右击删除上一个点
      _this._positions_draw.pop(); //删除最后标的一个点

      let point = getCurrentMousePosition(
        _this.viewer.scene,
        event.position,
        _this.entity
      );
      if (point) {
        if (lastPointTemporary) {
          _this._positions_draw.pop();
        }
        lastPointTemporary = true;

        _this.fire(EventType.DrawRemovePoint, {
          drawtype: _this.type,
          entity: _this.entity,
          position: point,
          positions: _this._positions_draw
        });

        _this._positions_draw.push(point);
        _this.updateAttrForDrawing();
      }
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    ///编辑鼠标移动事件处理
    this.getHandler().setInputAction(function (event) {
      //鼠标移动
      // console.log('mouse')
      if (_this._positions_draw.length <= 1)
        _this.tooltip.showAt(event.endPosition, message.draw.polyline.start);
      else if (_this._positions_draw.length < _this._minPointNum)
        //点数不满足最少数量
        _this.tooltip.showAt(event.endPosition, message.draw.polyline.cont);
      else if (_this._positions_draw.length >= _this._maxPointNum)
        //点数满足最大数量
        _this.tooltip.showAt(event.endPosition, message.draw.polyline.end2);
      else _this.tooltip.showAt(event.endPosition, message.draw.polyline.end);

      let point = getCurrentMousePosition(
        _this.viewer.scene,
        event.endPosition,
        _this.entity
      );

      // 绘制墙体等高用
      let conditions = _this.entity.attribute.config?.isContour;
      if (conditions && _this._positions_draw.length === 2) {
        let maxh = _this.entity.wall.maximumHeights.getValue();
        let minh = _this.entity.wall.minimumHeights.getValue();
        _this.entity.wall.maximumHeights = [maxh[0], maxh[0]];
        _this.entity.wall.minimumHeights = [minh[0], minh[0]];
      }

      if (point) {
        if (lastPointTemporary) {
          if (
            _this.entity.attribute?.config?.isBox &&
            _this._positions_draw.length === 4
          ) {
            _this._positions_draw.splice(2, 1);
          } else {
            _this._positions_draw.pop();
          }
        }
        lastPointTemporary = true;

        if (
          _this.entity.attribute?.config?.isBox &&
          _this._positions_draw.length === 3
        ) {
          _this._positions_draw = computeRectanglePoints(
            _this._positions_draw[0],
            point
          );
        } else {
          _this._positions_draw.push(point);
        }
        // 盒子
        if (_this.entity.attribute?.config?.isBox) {
          if (_this._positions_draw.length === 2) {
            _this._positions_draw = computeRectanglePoints(
              _this._positions_draw[0],
              _this._positions_draw[1]
            );
          }
        }
        _this.updateAttrForDrawing();

        _this.fire(EventType.DrawMouseMove, {
          drawtype: _this.type,
          entity: _this.entity,
          position: point,
          positions: _this._positions_draw
        });
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    this.getHandler().setInputAction(function () {
      //双击结束标绘
      //必要代码 消除双击带来的多余经纬度
      _this._positions_draw.pop();
      _this.endDraw();
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  }

  /**
   * 外部控制，完成绘制，比如手机端无法双击结束
   */
  endDraw() {
    if (!this._enabled) {
      return this;
    }

    if (this._positions_draw.length < this._minPointNum) return; //点数不够

    if (this.viewer.paid) {
      this._positions_draw.pop();
    }

    this.updateAttrForDrawing();
    this.disable();
  }

  /**
   * 图形绘制结束后调用
   */
  finish() {
    let entity = this.entity;

    entity._positions_draw = this.getDrawPosition();
    entity.editing = this.getEditClass(entity); //绑定编辑对象

    entity.editing.changePositionsToCallback(false);
    this._positions_draw = null;
  }
}

export { DrawPolyline };
