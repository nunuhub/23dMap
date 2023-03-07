import * as Cesium from 'cesium_shinegis_earth';
import * as RectangleAttr from './EntityAttr/RectangleAttr44';
import { DrawPolyline } from './DrawPolyline8';
import { getMaxHeight } from '../Tool/Point2';
import { EditRectangle } from '../Edit/EditRectangle45';

/**
 * 绘制矩形类
 * @extends DrawBase.DrawPolyline
 * @memberOf DrawBase.DrawPolyline
 */
class DrawRectangle extends DrawPolyline {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'rectangle';
    this._minPointNum = 2;
    this._maxPointNum = 2;
    this.editClass = EditRectangle;
    this.attrClass = RectangleAttr;
  }

  /**
   * 获取矩形
   * @returns {Cesium.Rectangle}
   */
  getRectangle() {
    let positions = this.getDrawPosition();
    if (positions.length < 2) return null;
    return Cesium.Rectangle.fromCartesianArray(positions);
  }

  /**
   * 根据attribute参数创建Entity
   * @param attribute
   * @returns {entity}
   */
  createFeature(attribute) {
    this._positions_draw = [];

    let that = this;
    let addattr = {
      rectangle: RectangleAttr.style2Entity(attribute.style),
      attribute: attribute
    };
    addattr.rectangle.coordinates = new Cesium.CallbackProperty(function () {
      return that.getRectangle();
    }, false);

    //线：边线宽度大于1时
    addattr.polyline = {
      clampToGround: attribute.style.clampToGround,
      arcType: Cesium.ArcType.RHUMB,
      show: false
    };

    this.entity = this.dataSource.entities.add(addattr); //创建要素对象
    this.entity.mark311 = this.drawTool.id;
    this.entity._draw_positions = this._positions_draw; //为什么就rectangle有'_draw_positions'和'_positions_draw'?
    this.bindOutline(this.entity); //边线

    return this.entity;
  }

  /**
   * 属性转entity
   * @param style
   * @param entity
   * @returns {entity}
   */
  style2Entity(style, entity) {
    return RectangleAttr.style2Entity(style, entity.rectangle);
  }

  /**
   * 绑定outline
   * @param entity
   */
  bindOutline(entity) {
    //是否显示：边线宽度大于1时
    entity.polyline.show = new Cesium.CallbackProperty(function (time) {
      return (
        entity.rectangle.outline?.getValue(time) &&
        entity.rectangle.outlineWidth?.getValue(time) > 1
      );
    }, false);
    //同步其贴地状态。
    entity.polyline.clampToGround = new Cesium.CallbackProperty(function () {
      return entity.attribute.style.clampToGround;
    }, false);
    //为outline/polyline扩展上了旋转情况下的同步。
    entity.polyline.positions = new Cesium.CallbackProperty(function (time) {
      if (entity.polyline.show?.getValue(time) === false) return null;

      let positions = entity._positions_draw; // _draw_positions
      if (!positions) return null;
      let height = entity.rectangle.height
        ? entity.rectangle.height.getValue(time)
        : 0;

      let re = Cesium.Rectangle.fromCartesianArray(positions);
      let pt1 = Cesium.Cartesian3.fromRadians(re.west, re.south, height);
      let pt2 = Cesium.Cartesian3.fromRadians(re.east, re.south, height);
      let pt3 = Cesium.Cartesian3.fromRadians(re.east, re.north, height);
      let pt4 = Cesium.Cartesian3.fromRadians(re.west, re.north, height);
      let rotation = entity.rectangle.rotation;
      rotation = Cesium.Math.toDegrees(rotation);
      if (Cesium.defined(rotation) && rotation !== 0) {
        let RadiansRotation = Cesium.Math.toRadians(rotation);
        let rectangle = new Cesium.RectangleOutlineGeometry({
          ellipsoid: Cesium.Ellipsoid.WGS84,
          rectangle: re,
          height: height,
          rotation: RadiansRotation
        });
        let geometry =
          Cesium.RectangleOutlineGeometry.createGeometry(rectangle);
        let pointNumber = geometry.indices.length / 2;
        let vs = geometry.attributes.position.values;
        let w1 = { x: vs[0], y: vs[1], z: vs[2] };
        let w2 = { x: vs[3], y: vs[4], z: vs[5] };
        let w3 = { x: vs[6], y: vs[7], z: vs[8] };
        let w4 = { x: vs[9], y: vs[10], z: vs[11] };
        let w5 = { x: vs[12], y: vs[13], z: vs[14] };
        if (pointNumber === 4) {
          [pt1, pt2, pt3, pt4] = [w1, w2, w3, w4];
        } else if (pointNumber === 6) {
          [pt1, pt2, pt3, pt4] = [w1, w2, w4, w5];
        } else {
          let points = [];
          for (let i = 0; i < pointNumber; i++) {
            let p = { x: vs[3 * i], y: vs[3 * i + 1], z: vs[3 * i + 2] };
            points[i] = p;
          }
          points.push(points[0]);
          return points;
        }
      }

      return [pt1, pt2, pt3, pt4, pt1];
    }, false);
    entity.polyline.width = new Cesium.CallbackProperty(function (time) {
      return entity.rectangle.outlineWidth?.getValue(time);
    }, false);
    entity.polyline.zIndex = new Cesium.CallbackProperty(function () {
      return entity.rectangle.zIndex?.getValue();
    }, false);
    entity.polyline.material = new Cesium.ColorMaterialProperty(
      new Cesium.CallbackProperty(function (time) {
        return entity.rectangle.outlineColor?.getValue(time);
      }, false)
    );
  }

  /**
   * 编辑样式更新
   */
  updateAttrForDrawing() {
    let style = this.entity.attribute.style;
    if (!style.clampToGround) {
      let maxHight = getMaxHeight(this.getDrawPosition());
      if (maxHight !== 0) {
        this.entity.rectangle.height = maxHight;
        style.height = maxHight;

        if (style.extrudedHeight)
          this.entity.rectangle.extrudedHeight =
            maxHight + Number(style.extrudedHeight);
      }
    }
  }

  /**
   * 图形绘制结束后调用
   */
  finish() {
    let entity = this.entity;

    entity.editing = this.getEditClass(entity); //绑定编辑对象

    entity._positions_draw = this._positions_draw;
    //entity.rectangle.coordinates = this.getRectangle()
    entity.rectangle.coordinates = new Cesium.CallbackProperty(function () {
      if (entity._positions_draw.length < 2) return null;
      return Cesium.Rectangle.fromCartesianArray(entity._positions_draw);
    }, false);
  }
}

export { DrawRectangle };
