import * as Cesium from 'cesium_shinegis_earth';
import * as DrawUtil from '../../Tool/Util3';
import { getMaxHeight } from '../../Tool/Point2';
import { setFillMaterial } from '../../Scene/CustomMaterialAll';

//属性赋值到entity
export const style2Entity = (style, entityattr) => {
  style = style || {};

  if (entityattr == null) {
    //默认值
    entityattr = {};
  }

  //Style赋值值Entity
  for (let key in style) {
    let value = style[key];
    switch (key) {
      default:
        //直接赋值
        entityattr[key] = value;
        break;
      case 'color': //跳过扩展其他属性的参数
      case 'opacity':
      case 'outlineOpacity':
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
      case 'outlineColor':
        //边框颜色
        entityattr.outlineColor = new Cesium.Color.fromCssColorString(
          value || style.color || '#FFFF00'
        ).withAlpha(
          Cesium.defaultValue(
            style.outlineOpacity,
            Cesium.defaultValue(style.opacity, 1.0)
          )
        );
        break;
      case 'extrudedHeight': {
        //高度
        let maxHight = 0;
        if (entityattr.hierarchy) {
          let positions = getPositions({
            polygon: entityattr
          });
          maxHight = getMaxHeight(positions);
        }
        entityattr.extrudedHeight = Number(value) + maxHight;
        break;
      }
      case 'clampToGround':
        //贴地
        entityattr.perPositionHeight = !value;
        break;
      case 'stRotation':
        //材质旋转角度
        entityattr.stRotation = Cesium.Math.toRadians(value);
        break;
    }
  }

  //设置填充材质
  setFillMaterial(entityattr, style);

  return entityattr;
};

//获取entity的坐标
export const getPositions = (entity, isShowPositions) => {
  if (
    !isShowPositions &&
    entity._positions_draw &&
    entity._positions_draw.length > 0
  )
    return entity._positions_draw; //箭头标绘取的是 对用户显示的position
};

//获取entity的坐标（geojson规范的格式）
export const getCoordinates = (entity) => {
  let positions = getPositions(entity);
  return DrawUtil.cartesians2lonlats(positions);
};

//entity转geojson
export const toGeoJSON = (entity) => {
  let coordinates = getCoordinates(entity);
  let feature = {
    type: 'Feature',
    properties: { ...(entity.attribute || {}), ...{ type: 'plotting' } },
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates]
    }
  };
  return feature;
};
