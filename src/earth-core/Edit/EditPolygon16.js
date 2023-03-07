import * as PolygonAttr from '../Draw/EntityAttr/PolygonAttr14';
import { EditPolyline } from './EditPolyline12';
import * as Cesium from 'cesium_shinegis_earth';
import { setPositionsHeight } from '../Tool/Point2';

/**
 * 编辑面类
 * @extends EditBase.EditPolyline
 * @memberOf EditBase.EditPolyline
 */
class EditPolygon extends EditPolyline {
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
    this.entity._positions_draw = positions;
    this._positions_draw = positions;
    //填补例外情况：外部调用，且要素未处于编辑态。
    if (this.entity.polygon?.hierarchy instanceof Cesium.ConstantProperty) {
      this.entity.polygon.hierarchy = new Cesium.ConstantProperty(
        new Cesium.PolygonHierarchy(positions)
      );
      let lines = [...positions];
      lines.push(lines[0]); //线条需要加上最后一段边
      this.entity.polyline.positions = new Cesium.ConstantProperty(lines);
    }
  }
  /**
   * 修改坐标属性，从constantProperty改为callbackProperty，提高显示的效率
   * 不仅修改polygon自己的hierarchy，还修改其bindOutline的属性。
   *
   */
  changePositionsToCallback(constant2callback = true) {
    //更改思路，在拖拽开始时设为回调，结束时设为常量。 原先是编辑启动时回调，关闭为常量。
    //this._positions_draw = this.entity._positions_draw || PolygonAttr.getPositions(this.entity)//可能会影响控高分析结果
    let entity = this.entity;
    if (!(entity instanceof Cesium.Entity)) return; //primitive 属性只支持常量
    if (constant2callback) {
      entity.polygon.hierarchy = new Cesium.CallbackProperty(() => {
        let positions = entity._positions_draw;
        return new Cesium.PolygonHierarchy(positions);
      }, false); //false则 polygonGraphic.fill =false 无效

      entity.polyline.show = new Cesium.CallbackProperty(function (time) {
        let arr = PolygonAttr.getPositions(entity, true);
        if (arr && arr.length < 3) return true;
        return Boolean(
          entity.polygon.outline &&
            entity.polygon.outline.getValue(time) &&
            entity.polygon.outlineWidth &&
            entity.polygon.outlineWidth.getValue(time) > 1 &&
            !entity.polygon.extrudedHeight
        );
      }, false);

      entity.polyline.positions = new Cesium.CallbackProperty(function (time) {
        if (entity.polyline.show?.getValue(time) === false) return null;

        let arr = PolygonAttr.getPositions(entity, true);
        if (arr && arr.length < 3) return arr;
        if (entity.polygon.height) {
          arr = setPositionsHeight(arr, entity.polygon.height);
        }
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
      let positions = this.entity._positions_draw;
      this.entity.polygon.hierarchy = new Cesium.ConstantProperty(
        new Cesium.PolygonHierarchy(positions)
      );

      entity.polyline.show = entity.polyline.show.getValue();
      entity.polyline.positions = entity.polyline.positions.getValue();
      entity.polyline.width = entity.polyline.width.getValue();
      entity.polyline.zIndex = entity.polyline.zIndex?.getValue();
      entity.polyline.material = new Cesium.ColorMaterialProperty(
        entity.polyline.material.getValue().color
      );
    }
  }
  /**
   * 原先是调用editPolyline的finish（）。 但控高分析里this.getPosition()返回的点高度一直为0。 所以这里重写个finish()解决。
   * 遇bug可尝试将此方法注释。
   */
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
  /**
   * 继承父类，根据属性更新坐标
   * @param position
   * @returns {[position]} 坐标数组
   */
  updatePositionsHeightByAttr(position) {
    if (this.getGraphic().height !== undefined) {
      let newHeight = this.getGraphic().height.getValue(
        this.viewer.clock.currentTime
      );
      position = setPositionsHeight(position, newHeight);
    }
    return position;
  }
}
export { EditPolygon };
