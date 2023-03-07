/**
 * @Author han
 * @Date 2020/11/10 15:56
 */

import * as Cesium from 'cesium_shinegis_earth';
import { setFillMaterial } from '../../Scene/CustomMaterialAll';
import { currentTime } from '../../Tool/Util1';
import { cartesians2lonlats } from '../../Tool/Util3';

//属性赋值到entity
export const style2Entity = (style, entityattr) => {
  style = style || {};

  if (!entityattr) {
    entityattr = {
      fill: true
    };
  }

  //Style赋值值Entity
  for (let key in style) {
    let value = style[key];
    switch (key) {
      default:
        //直接赋值
        entityattr[key] = value;
        break;
      case 'opacity': //跳过扩展其他属性的参数
      case 'outlineOpacity':
      case 'color': //填充颜色
      case 'materialType':
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
          value || '#FFFF00'
        ).withAlpha(style.outlineOpacity ?? style.opacity ?? 1.0);
        break;
    }
  }

  //设置填充材质
  setFillMaterial(entityattr, style);

  return entityattr;
};

//获取entity的坐标P
export const getPositions = (entity) => {
  return entity.wall.positions.getValue(currentTime());
};

//获取entity的坐标（geojson规范的格式）
export const getCoordinates = (entity) => {
  let positions = getPositions(entity);
  return cartesians2lonlats(positions);
};

//entity转geojson
export const toGeoJSON = (entity) => {
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
