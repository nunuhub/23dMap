/**
 * @Author han
 * @Date 2020/11/10 13:48
 */

import * as Cesium from 'cesium_shinegis_earth';
import { setFillMaterial } from '../../Scene/CustomMaterialAll';
import { currentTime } from '../../Tool/Util1';
import { cartesians2lonlats } from '../../Tool/Util3';

//属性赋值到entity
export const style2Entity = (style, entityattr) => {
  style = style || {};

  if (entityattr == null) {
    //默认值
    entityattr = {};
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
      case 'height':
        entityattr.height = Number(value);
        if (style.extrudedHeight)
          entityattr.extrudedHeight =
            Number(style.extrudedHeight) + Number(value);
        break;
      case 'extrudedHeight':
        entityattr.extrudedHeight =
          Number(entityattr.height || style.height || 0) + Number(value);
        break;
      case 'color':
        //填充颜色
        entityattr.material = new Cesium.Color.fromCssColorString(
          value || '#FFFF00'
        ).withAlpha(Number(style.opacity || 1.0));
        break;
      case 'image':
        //填充图片
        entityattr.material = new Cesium.ImageMaterialProperty({
          image: style.image,
          color: new Cesium.Color.fromCssColorString('#FFFFFF').withAlpha(
            Number(style.opacity || 1.0)
          )
        });
        break;
      case 'rotation':
        //旋转角度
        entityattr.rotation = Cesium.Math.toRadians(value);
        if (!style.stRotation)
          entityattr.stRotation = Cesium.Math.toRadians(value);
        else entityattr.stRotation = Cesium.Math.toRadians(style.stRotation);
        break;
      case 'stRotation':
    }
  }

  //设置填充材质
  setFillMaterial(entityattr, style);

  return entityattr;
};

//获取entity的坐标
export const getPositions = (entity) => {
  if (entity._positions_draw && entity._positions_draw.length > 0)
    return entity._positions_draw;

  let time = currentTime();
  let re = entity.rectangle.coordinates.getValue(time); //Rectangle
  let height = entity.rectangle.height
    ? entity.rectangle.height.getValue(time)
    : 0;

  let pt1 = Cesium.Cartesian3.fromRadians(re.west, re.south, height);
  let pt2 = Cesium.Cartesian3.fromRadians(re.east, re.north, height);
  return [pt1, pt2];
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
      type: 'MultiPoint',
      coordinates: coordinates
    }
  };
};

//获取entity对应的 边界 的坐标
export const getPolyPositions = (entity) => {
  let time = currentTime();
  let re = entity.rectangle.coordinates.getValue(time); //Rectangle
  let height = entity.rectangle.height
    ? entity.rectangle.height.getValue(time)
    : 0;

  let pt1 = Cesium.Cartesian3.fromRadians(re.west, re.south, height);
  let pt2 = Cesium.Cartesian3.fromRadians(re.east, re.south, height);
  let pt3 = Cesium.Cartesian3.fromRadians(re.east, re.north, height);
  let pt4 = Cesium.Cartesian3.fromRadians(re.west, re.north, height);

  return [pt1, pt2, pt3, pt4, pt1];
};

//获取entity对应的 边界 的坐标（geojson规范的格式）
export const getPolyCoordinates = (entity) => {
  let positions = getPolyPositions(entity);
  return cartesians2lonlats(positions);
};
