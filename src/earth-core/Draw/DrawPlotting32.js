import { plotUtil } from './plotUtil';
import { Utils } from '../Widget/SpatialAnalysis/index';
import * as Cesium from 'cesium_shinegis_earth';
import * as PlottingAttr from './EntityAttr/PlottingAttr15';
import { EditPlotting } from '../Edit/EditPlotting32';
import { DrawPolyline } from './DrawPolyline8';
import { getMaxHeight } from '../Tool/Point2';

const PlottingType = {
  STRAIGHT_ARROW: 1, //直箭头
  FINE_ARROW: 2, //细箭头
  ATTACK_ARROW_PW: 3, //攻击箭头 平尾
  ATTACK_ARROW_YW: 4, //攻击箭头 燕尾
  DOUBLE_ARROW: 5, //钳击箭头
  CLOSED_CURVE: 6, //闭合曲面
  GATHERING_PLACE: 7 //集结地
};
Object.freeze(PlottingType);
/**
 * 面绘制类
 * @extends DrawBase.DrawPolyline
 * @memberOf DrawBase.DrawPolyline
 */
class DrawPlotting extends DrawPolyline {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'polygon';
    this._minPointNum = 2;
    this._maxPointNum = 2;
    this.editClass = EditPlotting;
    this.attrClass = PlottingAttr;
  }

  /**
   * 根据attribute参数创建Entity
   * @param attribute
   * @returns {entity}
   */
  createFeature(attribute) {
    this._positions_draw = [];

    this.plottingType =
      attribute?.attr?.plottingType || PlottingType.STRAIGHT_ARROW;
    if (this.plottingType <= PlottingType.FINE_ARROW) {
      this._minPointNum = 2;
      this._maxPointNum = 2;
    } else if (this.plottingType === PlottingType.DOUBLE_ARROW) {
      this._minPointNum = 3;
      this._maxPointNum = 5;
    } else if (this.plottingType === PlottingType.GATHERING_PLACE) {
      this._minPointNum = 2;
      this._maxPointNum = 3; //其实可以放开
    } else {
      this._minPointNum = 3;
      this._maxPointNum = Number.POSITIVE_INFINITY;
    }

    let that = this;
    let addattr = {
      polygon: PlottingAttr.style2Entity(attribute.style),
      attribute: attribute
    };

    //线：绘制时前2点时 + 边线宽度大于1时
    addattr.polyline = {
      clampToGround: attribute?.style?.clampToGround,
      show: false
    };

    this.entity = this.dataSource.entities.add(addattr); //创建要素对象
    this.entity.polygon.hierarchy = new Cesium.CallbackProperty(
      generatePolygonHierarchy(that, that),
      false
    );

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
    return PlottingAttr.style2Entity(style, entity.polygon);
  }

  /**
   * 绑定outline
   * @param entity
   */
  bindOutline(entity) {
    //是否显示：绘制时前2点时 或 边线宽度大于1时
    entity.polyline.show = new Cesium.CallbackProperty(function (time) {
      let arr = PlottingAttr.getPositions(entity, true);
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

      let arr = PlottingAttr.getPositions(entity, true);
      if (arr && arr.length < 3) return arr;

      return arr?.concat([arr[0]]);
    }, false);
    entity.polyline.width = new Cesium.CallbackProperty(function () {
      let arr = PlottingAttr.getPositions(entity, true);
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
        let arr = PlottingAttr.getPositions(entity, true);
        if (arr && arr.length < 3) {
          if (entity.polygon.material.color)
            return entity.polygon.material.color.getValue(time);
          else return Cesium.Color.YELLOW;
        }
        return entity.polygon.outlineColor.getValue(time);
      }, false)
    );
  }

  /**
   * 编辑样式更新
   */
  updateAttrForDrawing() {
    let style = this.entity.attribute?.style;
    if (style?.extrudedHeight) {
      //存在extrudedHeight高度设置时
      let maxHight = getMaxHeight(this.getDrawPosition());
      this.entity.polygon.extrudedHeight =
        maxHight + Number(style.extrudedHeight);
    }
  }

  /**
   * 图形绘制结束后调用
   */
  finish() {
    let entity = this.entity;

    entity.editing = this.getEditClass(entity); //绑定编辑对象
    entity.editing.plottingType = this.plottingType;

    entity._positions_draw = this.getDrawPosition();
    let that = this;
    entity.polygon.hierarchy = generatePolygonHierarchy(entity, that)();
    entity.editing.changePositionsToCallback(false);
  }
  toGeoJSON(entity) {
    return this.attrClass.toGeoJSON(entity);
  }
}
function generatePolygonHierarchy(entity, scope) {
  return () => {
    let positions = entity._positions_draw;
    let PolygonHierarchy = new Cesium.PolygonHierarchy();
    if (
      scope.plottingType === PlottingType.STRAIGHT_ARROW ||
      scope.plottingType === PlottingType.FINE_ARROW
    ) {
      //直箭头 细箭头
      if (positions instanceof Array && positions.length === 2) {
        let bodyModality =
          scope.plottingType === PlottingType.FINE_ARROW ? 0.15 : 0.05;
        plotUtil.fineArrowDefualParam.tailWidthFactor = bodyModality;
        let [trailP, topP] = positions;
        trailP = Utils.cartesianToLonLatHeight(trailP);
        topP = Utils.cartesianToLonLatHeight(topP);
        let outputPs = plotUtil.algorithm.fineArrow(trailP, topP);
        PolygonHierarchy.positions = outputPs;
      }
    } else if (
      scope.plottingType === PlottingType.ATTACK_ARROW_YW ||
      scope.plottingType === PlottingType.ATTACK_ARROW_PW
    ) {
      //攻击箭头_燕尾//平尾
      if (positions instanceof Array && positions.length >= 3) {
        let trailModality = scope.plottingType - PlottingType.ATTACK_ARROW_PW; //0-平尾 1-燕尾
        plotUtil.tailedAttackArrowDefualParam.swallowTailFactor = trailModality;
        let inputPositions = positions.map((a) => {
          return Utils.cartesianToLonLatHeight(a);
        });
        let outputPs = plotUtil.algorithm.tailedAttackArrow(inputPositions);
        PolygonHierarchy.positions = outputPs.polygonalPoint;
      }
      if (positions instanceof Array && positions.length === 2) {
        PolygonHierarchy.positions = positions;
      }
    } else if (scope.plottingType === PlottingType.DOUBLE_ARROW) {
      //钳击
      if (positions instanceof Array && positions.length >= 3) {
        let inputPositions = positions.map((a) => {
          return Utils.cartesianToLonLatHeight(a);
        });
        let outputPs = plotUtil.algorithm.doubleArrow(inputPositions);
        PolygonHierarchy.positions = outputPs.polygonalPoint;
      }
      if (positions instanceof Array && positions.length === 2) {
        PolygonHierarchy.positions = positions;
      }
    } else if (scope.plottingType === PlottingType.GATHERING_PLACE) {
      //集结地
      if (positions instanceof Array && positions.length >= 2) {
        let inputPositions = positions.map((a) => {
          return Utils.cartesianToLonLatHeight(a);
        });
        let outputPs = plotUtil.algorithm.gatheringPlace(inputPositions);
        PolygonHierarchy.positions = outputPs;
      }
    } else if (scope.plottingType === PlottingType.CLOSED_CURVE) {
      if (positions instanceof Array && positions.length >= 2) {
        let inputPositions = positions.map((a) => {
          return Utils.cartesianToLonLatHeight(a);
        });
        let outputPs = plotUtil.algorithm.closedCurve(inputPositions);
        PolygonHierarchy.positions = outputPs;
      }
    }
    return PolygonHierarchy;
  };
}

export { PlottingType, DrawPlotting, generatePolygonHierarchy };
