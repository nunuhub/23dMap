/**
 * @Author han
 * @Date 2020/11/10 13:27
 */

import * as Cesium from 'cesium_shinegis_earth';
import { cartesians2lonlats } from '../../Tool/Util3';
import { currentTime } from '../../Tool/Util1';

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
      case 'opacity': //跳过扩展其他属性的参数
      case 'outlineOpacity':
      case 'radius':
      case 'shape':
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
        ).withAlpha(style.outlineOpacity || style.opacity || 1.0);
        break;
      case 'color':
        //填充颜色
        entityattr.material = new Cesium.Color.fromCssColorString(
          value || '#FFFF00'
        ).withAlpha(Number(style.opacity || 1.0));
        break;
    }
  }

  //材质优先
  if (style.material) entityattr.material = style.material;

  //管道样式
  style.radius = style.radius || 10;
  switch (style.shape) {
    default:
    case 'pipeline':
      entityattr.shape = getCorridorShape1(style.radius); //（厚度固定为半径的1/3）
      break;
    case 'circle':
      entityattr.shape = getCorridorShape2(style.radius);
      break;
    case 'star':
      entityattr.shape = getCorridorShape3(style.radius);
      break;
  }

  return entityattr;
};

//管道形状1【内空管道】 radius整个管道的外半径
export const getCorridorShape1 = (radius) => {
  let hd = radius / 3;
  let startAngle = 0;
  let endAngle = 360;

  let pss = [];
  for (let i = startAngle; i <= endAngle; i++) {
    let radians = Cesium.Math.toRadians(i);
    pss.push(
      new Cesium.Cartesian2(
        radius * Math.cos(radians),
        radius * Math.sin(radians)
      )
    );
  }
  for (let i = endAngle; i >= startAngle; i--) {
    let radians = Cesium.Math.toRadians(i);
    pss.push(
      new Cesium.Cartesian2(
        (radius - hd) * Math.cos(radians),
        (radius - hd) * Math.sin(radians)
      )
    );
  }
  return pss;
};

//管道形状2【圆柱体】 radius整个管道的外半径
export const getCorridorShape2 = (radius) => {
  let startAngle = 0;
  let endAngle = 360;

  let pss = [];
  for (let i = startAngle; i <= endAngle; i++) {
    let radians = Cesium.Math.toRadians(i);
    pss.push(
      new Cesium.Cartesian2(
        radius * Math.cos(radians),
        radius * Math.sin(radians)
      )
    );
  }
  return pss;
};

//管道形状3【星状】 radius整个管道的外半径 ,arms星角的个数（默认6个角）
export const getCorridorShape3 = (radius, arms) => {
  arms = arms || 6;
  let angle = Math.PI / arms;
  let length = 2 * arms;
  let pss = new Array(length);
  for (let i = 0; i < length; i++) {
    let r = i % 2 === 0 ? radius : radius / 3;
    pss[i] = new Cesium.Cartesian2(
      Math.cos(i * angle) * r,
      Math.sin(i * angle) * r
    );
  }
  return pss;
};

//获取entity的坐标
export const getPositions = (entity) => {
  if (entity._positions_draw && entity._positions_draw.length > 0)
    return entity._positions_draw; //取绑定的数据

  return entity.polylineVolume.positions.getValue(currentTime());
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
