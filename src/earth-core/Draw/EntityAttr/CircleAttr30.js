/**
 * @Author han
 * @Date 2020/11/9 16:32
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as DrawUtil from '../../Tool/Util3';
import * as turf from '@turf/turf';
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
      case 'color':
      case 'animation':
        break;
      case 'outlineColor':
        //边框颜色
        entityattr.outlineColor = new Cesium.Color.fromCssColorString(
          value || '#FFFF00'
        ).withAlpha(
          Cesium.defaultValue(
            style.outlineOpacity,
            Cesium.defaultValue(style.opacity, 1.0)
          )
        );
        break;
      case 'rotation':
        //旋转角度
        entityattr.rotation = Cesium.Math.toRadians(value);
        if (!style.stRotation)
          entityattr.stRotation = Cesium.Math.toRadians(value);
        break;
      case 'stRotation':
        entityattr.stRotation = Cesium.Math.toRadians(value);
        break;
      case 'height':
        entityattr.height = Number(value) || 0;
        if (style.extrudedHeight)
          entityattr.extrudedHeight =
            Number(style.extrudedHeight) + Number(value);
        break;
      case 'extrudedHeight':
        entityattr.extrudedHeight =
          Number(entityattr.height || style.height || 0) + Number(value);
        break;
      case 'radius':
        //半径（圆）
        entityattr.semiMinorAxis = Number(value);
        entityattr.semiMajorAxis = Number(value);
        break;
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
  let positions = getPositions(entity);
  return DrawUtil.cartesians2lonlats(positions);
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

//获取entity对应的 边界 的坐标
export const getPolyPositions = (entity) => {
  let coordinates = getPolyCoordinates(entity);
  return DrawUtil.lonlats2cartesians(coordinates);
};

//获取entity对应的 边界 的坐标（geojson规范的格式）
export const getPolyCoordinates = (entity) => {
  let radius = entity.ellipse.semiMajorAxis.getValue() / 1000;
  let geojson = turf.buffer(toGeoJSON(entity), radius, { units: 'kilometers' });
  return (
    geojson && geojson.geometry.coordinates && geojson.geometry.coordinates[0]
  );
};
