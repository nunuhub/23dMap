import * as Cesium from 'cesium_shinegis_earth';
import * as PolygonAttr from './EntityAttr/PolygonAttr14';
import { EditPolygon } from '../Edit/EditPolygon16';
import { DrawPolyline } from './DrawPolyline8';
import { getMaxHeight, setPositionsHeight } from '../Tool/Point2';
import * as Util from '../Tool/Util3';
/**
 * 面绘制类
 * @extends DrawBase.DrawPolyline
 * @memberOf DrawBase.DrawPolyline
 */
class DrawPolygon extends DrawPolyline {
  constructor(opts) {
    opts = opts || {};
    super(opts);

    this.type = 'polygon';
    this._minPointNum = 3;
    this._maxPointNum = 9999;
    this.editClass = EditPolygon;
    this.attrClass = PolygonAttr;
  }

  /**
   * 根据attribute参数创建Entity
   * @param attribute
   * @returns {entity}
   */
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
      polygon: PolygonAttr.style2Entity(attribute.style),
      attribute: attribute
    };

    addattr.polygon.hierarchy = new Cesium.CallbackProperty(function () {
      let positions = that.getDrawPosition();
      return new Cesium.PolygonHierarchy(positions);
    }, false);

    //线：绘制时前2点时 + 边线宽度大于1时
    addattr.polyline = {
      clampToGround: attribute.style.clampToGround,
      show: false
    };

    this.entity = this.dataSource.entities.add(addattr); //创建要素对象
    this.entity.mark311 = this.drawTool.id;

    this.bindOutline(this.entity); //边线

    return this.entity;
  }
  /**
   * 用于加载GeoJson
   * @param {*} features
   * @returns primitive
   */
  loadJson(features) {
    let geometryInstances = [];
    let options = PolygonAttr.style2Entity(features[0].properties.style);
    let material = options.material.getValue?.() || options.material;
    let [type, value] = [
      material.getType?.() || 'Color',
      material.getValue?.() || { color: material }
    ];
    let appearance = new Cesium.MaterialAppearance({
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
      let options = PolygonAttr.style2Entity(attribute.style);

      let instance = new Cesium.GeometryInstance({
        geometry: new Cesium.PolygonGeometry({
          polygonHierarchy: new Cesium.PolygonHierarchy(positions),
          extrudedHeight: options.extrudedHeight,
          height: options.height,
          perPositionHeight: options.perPositionHeight
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

  getDrawPosition() {
    //存在高度属性则将高度应用到坐标中
    let style = this.entity.attribute.style;
    if (style.height && this.entity.polygon.perPositionHeight == false)
      this._positions_draw = setPositionsHeight(
        this._positions_draw,
        style.height
      );

    return this._positions_draw;
  }
  /**
   * 属性转entity
   * @param style
   * @param entity
   * @returns {entity}
   */
  style2Entity(style, entity) {
    return PolygonAttr.style2Entity(style, entity.polygon);
  }

  /**
   * 绑定outline
   * @param entity
   */
  bindOutline(entity) {
    //是否显示：绘制时前2点时 或 边线宽度大于1时
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
      //考虑polygon.height的情况
      if (entity.polygon.height) {
        arr = setPositionsHeight(arr, entity.polygon.height);
      }
      return arr.concat([arr[0]]);
    }, false);
    entity.polyline.width = new Cesium.CallbackProperty(function () {
      let arr = PolygonAttr.getPositions(entity, true);
      if (arr && arr.length < 3) return 2;

      return parseInt(
        entity.polygon.outlineWidth && entity.polygon.outlineWidth.getValue()
      );
    }, false);
    entity.polyline.zIndex =
      entity.polygon.zIndex && entity.polygon.zIndex.getValue();

    entity.polyline.material = new Cesium.ColorMaterialProperty(
      new Cesium.CallbackProperty(function (time) {
        let arr = PolygonAttr.getPositions(entity, true);
        if (arr && arr.length < 3) {
          if (entity.polygon.material.color)
            return entity.polygon.material.color.getValue(time);
          else return Cesium.Color.YELLOW;
        }
        return (
          entity.polygon.outlineColor?.getValue(time) || Cesium.Color.YELLOW
        );
      }, true)
    );
  }

  /**
   * 编辑样式更新
   */
  updateAttrForDrawing() {
    let style = this.entity.attribute.style;
    // if (style.extrudedHeight) {
    //存在extrudedHeight高度设置时
    let maxHight = getMaxHeight(this.getDrawPosition());
    if (style.height && this.entity.polygon.perPositionHeight == false) {
      maxHight = style.height;
      let arr = setPositionsHeight(this._positions_draw, style.height);
      for (let index = 0; index < this._positions_draw.length; index++) {
        this._positions_draw[index] = arr[index];
      }
    }
    if (style.extrudedHeight)
      this.entity.polygon.extrudedHeight =
        maxHight + Number(style.extrudedHeight || 0);
    // }
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
  /**
   * 转换为JSON
   * @param entity
   * @returns {*}
   */
  toGeoJSON(entity) {
    if (entity.attribute?.attr?.isPlotting) {
      //因为动态标绘其实走的polygon，所以在这儿转接回DrawPlotting
      return this.drawTool.drawCtrl.plotting.toGeoJSON(entity);
    } else return this.attrClass.toGeoJSON(entity);
  }
  /**
   * 处理高度，坐标里的高，height属性
   */
  /* attributeToEntity(attribute, positions) {
    let entity = this.createFeature(attribute)
    if (attribute?.style?.height) {
      this._positions_draw = setPositionsHeight(positions, attribute.style.height)
    }
    this.updateAttrForDrawing(true)
    this.finish()
    return entity
  } */
  jsonToEntity(geojson) {
    let attribute = geojson.properties;
    let height = 0;
    if (attribute?.style?.height) height = attribute.style.height;
    let positions = Util.getPositionByGeoJSON(geojson, height);
    return this.attributeToEntity(attribute, positions);
  }
}
export { DrawPolygon };
