/**
 * @Author han
 * @Date 2020/11/10 16:08
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as Util from '../../Tool/Util3';
import * as util from '../../Tool/Util1';

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
      case 'silhouette': //跳过扩展其他属性的参数
      case 'silhouetteColor':
      case 'silhouetteAlpha':
      case 'silhouetteSize':
      case 'fill':
      case 'color':
      case 'opacity':
        break;
      case 'modelUrl':
        //模型uri
        entityattr.uri = value;
        break;

      case 'clampToGround':
        //贴地
        if (value)
          entityattr.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
        else entityattr.heightReference = Cesium.HeightReference.NONE;
        break;
      case 'heightReference':
        switch (value) {
          case 'NONE':
            entityattr.heightReference = Cesium.HeightReference.NONE;
            break;
          case 'CLAMP_TO_GROUND':
            entityattr.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
            break;
          case 'RELATIVE_TO_GROUND':
            entityattr.heightReference =
              Cesium.HeightReference.RELATIVE_TO_GROUND;
            break;
          default:
            entityattr.heightReference = value;
            break;
        }
        break;
      case 'distanceDisplayCondition':
        //是否按视距显示
        if (value) {
          entityattr.distanceDisplayCondition =
            new Cesium.DistanceDisplayCondition(
              Number(style.distanceDisplayCondition_near || 0),
              Number(style.distanceDisplayCondition_far || 100000)
            );
        } else {
          entityattr.distanceDisplayCondition = null;
        }
        break;
    }
  }

  //轮廓
  if (style.silhouette) {
    entityattr.silhouetteColor = new Cesium.Color.fromCssColorString(
      style.silhouetteColor || '#FFFFFF'
    ).withAlpha(Number(style.silhouetteAlpha || 1.0));
    entityattr.silhouetteSize = Number(style.silhouetteSize || 1.0);
  } else entityattr.silhouetteSize = 0.0;

  //透明度、颜色

  let opacity = Object.hasOwnProperty.call(style, 'opacity')
    ? Number(style.opacity)
    : 1;
  if (style.fill)
    entityattr.color = new Cesium.Color.fromCssColorString(
      style.color || '#FFFFFF'
    ).withAlpha(opacity);
  else
    entityattr.color = new Cesium.Color.fromCssColorString('#FFFFFF').withAlpha(
      opacity
    );

  return entityattr;
};

//获取entity的坐标
export const getPositions = (entity) => {
  let position = entity.position;
  if (position && position.getValue)
    position = position.getValue(util.currentTime());

  return [position];
};

//获取entity的坐标（geojson规范的格式）
export const getCoordinates = (entity) => {
  let positions = getPositions(entity);
  return Util.cartesians2lonlats(positions);
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
