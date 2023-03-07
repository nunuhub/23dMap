/*
 * @Author: liujh
 * @Date: 2020/9/29 10:06
 * @Description:
 */
/* 29 */
/***/
import * as Cesium from 'cesium_shinegis_earth';
import { cartesians2lonlats } from '../../Tool/Util3';
import { currentTime } from '../../Tool/Util1';

//属性赋值到entity
const style2Entity = (style, entityattr) => {
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
      case 'scaleByDistance_near':
      case 'scaleByDistance_nearValue':
      case 'scaleByDistance_far':
      case 'scaleByDistance_farValue':
      case 'distanceDisplayCondition_far':
      case 'distanceDisplayCondition_near':
        break;
      case 'outlineColor':
        //边框颜色
        entityattr.outlineColor = new Cesium.Color.fromCssColorString(
          value || '#FFFF00'
        ).withAlpha(style.outlineOpacity ?? style.opacity ?? 1.0);
        break;
      case 'color':
        //填充颜色
        entityattr.color = new Cesium.Color.fromCssColorString(
          value || '#FFFF00'
        ).withAlpha(Number(style.opacity ?? 1.0));
        break;
      case 'scaleByDistance':
        //是否按视距缩放
        if (value) {
          entityattr.scaleByDistance = new Cesium.NearFarScalar(
            Number(style.scaleByDistance_near || 1000),
            Number(style.scaleByDistance_nearValue || 1.0),
            Number(style.scaleByDistance_far || 1000000),
            Number(style.scaleByDistance_farValue || 0.1)
          );
        } else {
          entityattr.scaleByDistance = null;
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

      case 'visibleDepth':
        if (value) entityattr.disableDepthTestDistance = 0;
        else entityattr.disableDepthTestDistance = Number.POSITIVE_INFINITY; //一直显示，不被地形等遮挡

        break;
    }
  }

  //无边框时，需设置宽度为0
  if (!style.outline) entityattr.outlineWidth = 0.0;

  return entityattr;
};

//获取entity的坐标
const getPositions = (entity) => {
  return [entity.position.getValue?.(currentTime()) || entity.position];
};

//获取entity的坐标（geojson规范的格式）
const getCoordinates = (entity) => {
  let positions = getPositions(entity);
  return cartesians2lonlats(positions);
};

//entity转geojson
const toGeoJSON = (entity) => {
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

export { style2Entity, getPositions, getCoordinates, toGeoJSON };
