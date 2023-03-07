/*
 * @Author: liujh
 * @Date: 2020/9/21 9:56
 * @Description:
 */
/* 9 */
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
      scale: 1.0,
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
      case 'font_style': //跳过扩展其他属性的参数
      case 'font_weight':
      case 'font_size':
      case 'font_family':
      case 'scaleByDistance_near':
      case 'scaleByDistance_nearValue':
      case 'scaleByDistance_far':
      case 'scaleByDistance_farValue':
      case 'distanceDisplayCondition_far':
      case 'distanceDisplayCondition_near':
      case 'background_opacity':
      case 'pixelOffsetY':
        break;

      case 'text':
        //文字内容
        entityattr.text = value.replace(new RegExp('<br />', 'gm'), '\n');
        break;
      case 'color':
        //颜色
        entityattr.fillColor = new Cesium.Color.fromCssColorString(
          value || '#ffffff'
        ).withAlpha(Number(style.opacity || 1.0));
        break;

      case 'border':
        //是否衬色
        entityattr.style = value
          ? Cesium.LabelStyle.FILL_AND_OUTLINE
          : Cesium.LabelStyle.FILL;
        break;
      case 'border_color':
        //衬色
        entityattr.outlineColor = new Cesium.Color.fromCssColorString(
          value || '#000000'
        ).withAlpha(Number(style.opacity || 1.0));
        break;
      case 'border_width':
        entityattr.outlineWidth = value;
        break;
      case 'background':
        //是否背景色
        entityattr.showBackground = value;
        break;
      case 'background_color':
        //背景色
        entityattr.backgroundColor = new Cesium.Color.fromCssColorString(
          value || '#000000'
        ).withAlpha(Number(style.background_opacity || style.opacity || 0.5));
        break;
      case 'pixelOffset':
        //偏移量
        entityattr.pixelOffset = new Cesium.Cartesian2(
          style.pixelOffset[0],
          style.pixelOffset[1]
        );
        break;
      case 'hasPixelOffset':
        //是否存在偏移量
        if (!value) entityattr.pixelOffset = new Cesium.Cartesian2(0, 0);
        break;
      case 'pixelOffsetX':
        //偏移量
        entityattr.pixelOffset = new Cesium.Cartesian2(
          value,
          style.pixelOffsetY
        );
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

  //样式（倾斜、加粗等）
  entityattr.font =
    (style.font_style || 'normal') +
    ' small-caps ' +
    (style.font_weight || 'normal') +
    ' ' +
    (style.font_size || '25') +
    'px ' +
    (style.font_family || '楷体');

  return entityattr;
};

//获取entity的坐标
export const getPositions = (entity) => {
  return [entity.position.getValue?.(currentTime()) || entity.position];
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
