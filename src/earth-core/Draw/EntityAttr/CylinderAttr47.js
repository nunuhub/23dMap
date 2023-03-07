/**
 * @Author han
 * @Date 2020/11/10 13:59
 */

import * as Cesium from 'cesium_shinegis_earth';
import { setFillMaterial } from '../../Scene/CustomMaterialAll';
import { cartesians2lonlats } from '../../Tool/Util3';
import { currentTime } from '../../Tool/Util1';

//属性赋值到entity
export const style2Entity = (style, entityattr) => {
  style = style || {};

  if (entityattr == null) {
    //默认值
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
      case 'color':
      case 'animation':
        break;
      case 'outlineColor':
        //边框颜色
        entityattr.outlineColor = new Cesium.Color.fromCssColorString(
          value || '#FFFF00'
        ).withAlpha(style.outlineOpacity || style.opacity || 1.0);
        break;
      case 'radius':
        //半径（圆）
        entityattr.topRadius = Number(value);
        entityattr.bottomRadius = Number(value);
        break;
    }
  }

  //设置填充材质
  setFillMaterial(entityattr, style);

  return entityattr;
};

//获取entity的坐标
export const getPositions = (entity) => {
  let positon = entity.position.getValue(currentTime());
  if (entity._positions_draw && entity._positions_draw.length > 0)
    positon = entity._positions_draw[0];
  return [positon];
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
      type: 'Point',
      coordinates: coordinates[0]
    }
  };
};
