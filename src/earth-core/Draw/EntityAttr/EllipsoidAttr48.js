/**
 * @Author han
 * @Date 2020/11/10 15:43
 */

import * as Cesium from 'cesium_shinegis_earth';
import { setFillMaterial } from '../../Scene/CustomMaterialAll';
import { currentTime } from '../../Tool/Util1';
import { cartesians2lonlats } from '../../Tool/Util3';

//属性赋值到entity
//椭球体
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
      case 'widthRadii':
      case 'heightRadii':
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
      case 'extentRadii': {
        //球体长宽高半径
        let extentRadii = style.extentRadii || 100;
        let widthRadii = style.widthRadii || 100;
        let heightRadii = style.heightRadii || 100;
        entityattr.radii = new Cesium.Cartesian3(
          extentRadii,
          widthRadii,
          heightRadii
        );
        break;
      }
    }
  }

  //设置填充材质
  setFillMaterial(entityattr, style);

  return entityattr;
};

//获取entity的坐标
export const getPositions = (entity) => {
  return [entity.position.getValue(currentTime())];
};

//获取entity的坐标（geojson规范的格式）
export const getCoordinates = (entity) => {
  const positions = getPositions(entity);
  return cartesians2lonlats(positions);
};

//entity转geojson
export const toGeoJSON = (entity) => {
  const coordinates = getCoordinates(entity);
  return {
    type: 'Feature',
    properties: entity.attribute || {},
    geometry: {
      type: 'Point',
      coordinates: coordinates[0]
    }
  };
};
