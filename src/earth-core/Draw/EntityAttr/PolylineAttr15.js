import * as Cesium from 'cesium_shinegis_earth';
import * as turf from '@turf/turf';
import * as Util1 from '../../Tool/Util1';
import * as DrawUtil from '../../Tool/Util3';
import { setFillMaterial } from '../../Scene/CustomMaterialAll';

//属性赋值到entity
const style2Entity = (style, entityattr) => {
  style = style || {};

  if (entityattr == null) {
    //默认值
    entityattr = {};
  }

  if (style.clampToGround) {
    entityattr.arcType = Cesium.ArcType.GEODESIC;
  }

  //Style赋值值Entity
  for (let key in style) {
    let value = style[key];
    switch (key) {
      default:
        //直接赋值
        entityattr[key] = value;
        break;
      case 'lineType': //跳过扩展其他属性的参数
      case 'color':
      case 'opacity':
      case 'outline':
      case 'outlineWidth':
      case 'outlineColor':
      case 'outlineOpacity':
      case 'flowDuration':
      case 'flowImage':
      case 'dashLength':
      case 'glowPower':
      case 'grid_lineCount':
      case 'grid_lineThickness':
      case 'grid_cellAlpha':
      case 'checkerboard_repeat':
      case 'checkerboard_oddcolor':
      case 'stripe_oddcolor':
      case 'stripe_repeat':
      case 'animationDuration':
      case 'animationImage':
      case 'animationRepeatX':
      case 'animationRepeatY':
      case 'animationAxisY':
      case 'animationGradient':
      case 'animationCount':
      case 'randomColor':
        break;
    }
  }
  setFillMaterial_line(entityattr, style);
  return entityattr;
};
function setFillMaterial_line(entityattr, style) {
  if (style.material) {
    entityattr.material = style.material;
    return entityattr;
  }
  if (style.color || style.lineType) {
    let color = new Cesium.Color.fromCssColorString(
      style.color || '#FFFF00'
    ).withAlpha(Number(Cesium.defaultValue(style.opacity, 1.0)));

    switch (style.lineType) {
      case 'solid':
        //实线
        entityattr.material = color;
        break;
      case 'outline':
        entityattr.material = new Cesium.PolylineOutlineMaterialProperty({
          color: color,
          outlineWidth: Number(style.outlineWidth || 1.0),
          outlineColor: new Cesium.Color.fromCssColorString(
            style.outlineColor || '#FFFF00'
          ).withAlpha(Number(style.outlineOpacity ?? style.opacity ?? 1.0))
        });
        break;
      case 'dash':
        //虚线
        entityattr.material = new Cesium.PolylineDashMaterialProperty({
          dashLength: style.dashLength || style.outlineWidth || 16.0,
          color: color,
          gapColor: new Cesium.Color.fromCssColorString(
            style.outlineColor || '#FFFF00'
          ).withAlpha(Number(style.outlineOpacity ?? style.opacity ?? 1.0))
        });
        break;
      case 'glow':
        //发光线
        entityattr.material = new Cesium.PolylineGlowMaterialProperty({
          glowPower: style.glowPower / 10 || 0.1,
          color: color
        });
        break;
      case 'arrow':
        //箭头线
        entityattr.material = new Cesium.PolylineArrowMaterialProperty(color);
        break;
      default:
        setFillMaterial(entityattr, style);
    }
  }
}

//获取entity的坐标
const getPositions = (entity, isShowPositions) => {
  if (
    !isShowPositions &&
    entity._positions_draw &&
    entity._positions_draw.length > 0
  )
    return entity._positions_draw; //曲线等情形时，取绑定的数据

  return entity.polyline.positions.getValue(Util1.currentTime());
};

//获取entity的坐标（geojson规范的格式）
const getCoordinates = (entity) => {
  let positions = getPositions(entity);
  let coordinates = DrawUtil.cartesians2lonlats(positions);
  return coordinates;
};

//entity转geojson
const toGeoJSON = (entity) => {
  let coordinates = getCoordinates(entity);
  return {
    type: 'Feature',
    properties: entity.attribute || {},
    geometry: {
      type: 'LineString',
      coordinates: coordinates
    }
  };
};

//折线转曲线
const line2curve = (_positions_draw, closure) => {
  if (!turf) return _positions_draw;

  let coordinates = _positions_draw.map((position) =>
    DrawUtil.cartesian2lonlat(position)
  );
  if (closure)
    //闭合曲线
    coordinates.push(coordinates[0]);
  let defHeight = coordinates[coordinates.length - 1][2];

  let line = turf.lineString(coordinates);
  let curved = turf.bezier(line);
  //bezier方法忽略了高程，将z替换到y位置进行bezier然后添加回来。
  let coordinates2 = coordinates.map((e) => {
    return [e[1], e[2]];
  });
  let line2 = turf.lineString(coordinates2);
  let curved2 = turf.bezier(line2);
  curved.geometry.coordinates.forEach((e, index) => {
    e[2] = curved2.geometry.coordinates[index][1];
  });

  let _positions_show = DrawUtil.lonlats2cartesians(
    curved.geometry.coordinates,
    defHeight
  );
  return _positions_show;
};

export {
  style2Entity,
  getPositions,
  getCoordinates,
  toGeoJSON,
  line2curve,
  setFillMaterial_line
};
