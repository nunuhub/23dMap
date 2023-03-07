/**
 * @Author han
 * @Date 2020/11/10 13:38
 */

import * as Cesium from 'cesium_shinegis_earth';
import { cartesians2lonlats } from '../../Tool/Util3';
import { currentTime } from '../../Tool/Util1';
import { setFillMaterial } from '../../Scene/CustomMaterialAll';

//属性赋值到entity
export const style2Entity = (style, entityattr) => {
  style = style || {};

  if (entityattr == null) {
    //默认值
    entityattr = {
      fill: true
    };
  }

  //贴地时，剔除高度相关属性
  if (style.clampToGround) {
    if (Object.hasOwnProperty.call(style, 'height')) delete style.height;
    if (Object.hasOwnProperty.call(style, 'extrudedHeight'))
      delete style.extrudedHeight;
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
        break;
      case 'outlineColor':
        //边框颜色
        entityattr.outlineColor = new Cesium.Color.fromCssColorString(
          value || '#FFFF00'
        ).withAlpha(style.outlineOpacity || style.opacity || 1.0);
        break;
      case 'color':
        //填充颜色
        entityattr.material = new Cesium.Color.fromCssColorString(
          value || '#FFFF00'
        ).withAlpha(Number(style.opacity || 1.0));
        break;
      case 'cornerType':
        switch (value) {
          case 'BEVELED':
            entityattr.cornerType = Cesium.CornerType.BEVELED;
            break;
          case 'MITERED':
            entityattr.cornerType = Cesium.CornerType.MITERED;
            break;
          case 'ROUNDED':
            entityattr.cornerType = Cesium.CornerType.ROUNDED;
            break;
          default:
            entityattr.cornerType = value;
            break;
        }
        break;
    }
  }

  //设置填充材质
  setFillMaterial(entityattr, style);

  return entityattr;
};

//获取entity的坐标
export const getPositions = (entity) => {
  return entity.corridor.positions.getValue(currentTime());
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
