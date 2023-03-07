/*
 * @Author: liujh
 * @Date: 2020/9/21 9:55
 * @Description:
 */
/* 19 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import { cartesians2lonlats } from '../../Tool/Util3';
import { currentTime } from '../../Tool/Util1';

//属性赋值到entity
export const style2Entity = (style, entityattr) => {
  style = style || {};

  if (entityattr == null) {
    //默认值
    entityattr = {
      scale: 1,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      verticalOrigin: Cesium.VerticalOrigin.BOTTOM
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
      case 'scaleByDistance_near': //跳过扩展其他属性的参数
      case 'scaleByDistance_nearValue':
      case 'scaleByDistance_far':
      case 'scaleByDistance_farValue':
      case 'distanceDisplayCondition_far':
      case 'distanceDisplayCondition_near':
        break;
      case 'opacity':
        //透明度
        entityattr.color = new Cesium.Color.fromCssColorString(
          '#FFFFFF'
        ).withAlpha(Cesium.defaultValue(value, 1.0));
        break;
      case 'rotation':
        //旋转角度
        entityattr.rotation = Cesium.Math.toRadians(value);
        break;
      case 'scaleByDistance':
        //是否按视距缩放
        if (value) {
          entityattr.scaleByDistance = new Cesium.NearFarScalar(
            Number(Cesium.defaultValue(style.scaleByDistance_near, 1000)),
            Number(Cesium.defaultValue(style.scaleByDistance_nearValue, 1.0)),
            Number(Cesium.defaultValue(style.scaleByDistance_far, 1000000)),
            Number(Cesium.defaultValue(style.scaleByDistance_farValue, 0.1))
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
              Number(
                Cesium.defaultValue(style.distanceDisplayCondition_near, 0)
              ),
              Number(
                Cesium.defaultValue(style.distanceDisplayCondition_far, 100000)
              )
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
      case 'horizontalOrigin':
        switch (value) {
          case 'CENTER':
            entityattr.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
            break;
          case 'LEFT':
            entityattr.horizontalOrigin = Cesium.HorizontalOrigin.LEFT;
            break;
          case 'RIGHT':
            entityattr.horizontalOrigin = Cesium.HorizontalOrigin.RIGHT;
            break;
          default:
            entityattr.horizontalOrigin = value;
            break;
        }
        break;
      case 'verticalOrigin':
        switch (value) {
          case 'CENTER':
            entityattr.verticalOrigin = Cesium.VerticalOrigin.CENTER;
            break;
          case 'TOP':
            entityattr.verticalOrigin = Cesium.VerticalOrigin.TOP;
            break;
          case 'BOTTOM':
            entityattr.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
            break;
          default:
            entityattr.verticalOrigin = value;
            break;
        }
        break;
      case 'visibleDepth':
        if (value) entityattr.disableDepthTestDistance = 0;
        else entityattr.disableDepthTestDistance = Number.POSITIVE_INFINITY; //一直显示，不被地形等遮挡

        break;
    }
  }

  return entityattr;
};

//获取entity的坐标
export const getPositions = (entity) => {
  return [entity.position.getValue(currentTime())];
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
