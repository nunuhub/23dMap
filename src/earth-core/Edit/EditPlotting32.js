import * as PolygonAttr from '../Draw/EntityAttr/PolygonAttr14';
import { EditPolyline } from './EditPolyline12';
import * as Cesium from 'cesium_shinegis_earth';
import { generatePolygonHierarchy } from '../Draw/DrawPlotting32';

/**
 * 态势标绘编辑类
 * @extends EditBase.EditPolyline
 * @memberOf EditBase.EditPolyline
 */
class EditPlotting extends EditPolyline {
  constructor(opts) {
    super(opts);
    this.hasClosure = true; // 是否首尾相连闭合（线不闭合，面闭合），用于处理中间点
  }

  /**
   * 取enity对象的对应矢量数据
   * @returns {DrawBase.DrawPolyline.DrawPolygon|*}
   */
  getGraphic() {
    return this.entity.polygon;
  }

  /**
   * 外部更新位置
   * @param positions {[position]} 坐标
   */
  setPositions(positions) {
    let that = this;
    this.entity._positions_draw = positions;
    this._positions_draw = positions;
    //填补例外情况：外部调用，且要素未处于编辑态。
    if (this.entity.polygon.hierarchy instanceof Cesium.ConstantProperty) {
      this.entity.polygon.hierarchy = new Cesium.ConstantProperty(
        generatePolygonHierarchy(this.entity, that)()
      );
      this.entity.polyline.positions = new Cesium.ConstantProperty(
        (function (time) {
          if (!that.entity.polyline.show.getValue(time)) return null;
          let arr = PolygonAttr.getPositions(that.entity, true);
          if (arr && arr.length < 3) return arr;
          return arr.concat([arr[0]]);
        })()
      );
    }
  }
  /**
   * 修改坐标属性，从constantProperty改为callbackProperty，提高显示的效率
   * 不仅修改polygon自己的hierarchy，还修改其bindOutline的属性。
   *
   */
  changePositionsToCallback(constant2callback = true) {
    let that = this;
    let entity = this.entity;
    if (!(entity instanceof Cesium.Entity)) return; //primitive 属性只支持常量

    if (constant2callback) {
      entity.polygon.hierarchy = new Cesium.CallbackProperty(
        generatePolygonHierarchy(entity, that),
        false
      );

      entity.polyline.show = new Cesium.CallbackProperty(function (time) {
        let arr = PolygonAttr.getPositions(entity, true);
        if (arr && arr.length < 3) return true;
        return (
          entity.polygon.outline &&
          entity.polygon.outline.getValue(time) &&
          entity.polygon.outlineWidth &&
          entity.polygon.outlineWidth.getValue(time) > 1
        );
      }, false);

      entity.polyline.positions = new Cesium.CallbackProperty(function (time) {
        if (!entity.polyline.show.getValue(time)) return null;

        let arr = PolygonAttr.getPositions(entity, true);
        if (arr && arr.length < 3) return arr;

        return arr.concat([arr[0]]);
      }, false);
      entity.polyline.width = new Cesium.CallbackProperty(function () {
        let arr = PolygonAttr.getPositions(entity, true);
        if (arr && arr.length < 3) return 2;

        return (
          entity.polygon.outlineWidth && entity.polygon.outlineWidth.getValue()
        );
      }, false);
      entity.polyline.zIndex = new Cesium.CallbackProperty(function () {
        return entity.polygon.zIndex && entity.polygon.zIndex.getValue();
      }, false);

      entity.polyline.material = new Cesium.ColorMaterialProperty(
        new Cesium.CallbackProperty(function (time) {
          let arr = PolygonAttr.getPositions(entity, true);
          if (arr && arr.length < 3) {
            if (entity.polygon.material.color)
              return entity.polygon.material.color.getValue(time);
            else return Cesium.Color.YELLOW;
          }
          return entity.polygon.outlineColor.getValue(time);
        }, false)
      );
    } else {
      this.entity.polygon.hierarchy = new Cesium.ConstantProperty(
        generatePolygonHierarchy(entity, that)()
      );
      entity.polyline.show = entity.polyline.show.getValue();
      entity.polyline.positions = entity.polyline.positions.getValue();
      entity.polyline.width = entity.polyline.width.getValue();
      entity.polyline.zIndex = entity.polyline.zIndex.getValue();
      entity.polyline.material = new Cesium.ColorMaterialProperty(
        entity.polyline.material.getValue().color
      );
    }
  }
  finish() {
    this.changePositionsToCallback(false);
  }

  /**
   * 是否首尾相连闭合（线不闭合，面闭合），用于处理中间点
   * @returns {boolean}
   */
  isClampToGround() {
    return Object.hasOwnProperty.call(
      this.entity.attribute.style,
      'clampToGround'
    )
      ? this.entity.attribute.style.clampToGround
      : !this.entity.attribute.style.perPositionHeight;
  }
}

export { EditPlotting };
