/**
 * @Author han
 * @Date 2020/11/17 9:45
 */

import { centerOfMass } from '../../Tool/Point2';
import * as billboard from './BillboardAttr19';
import * as label from './LabelAttr9';
import * as point from './PointAttr29';
import * as model from './ModelAttr24';
import * as polyline from './PolylineAttr15';
import * as polylineVolume from './PolyLineVolumeAttr39';
import * as wall from './WallAttr50';
import * as corridor from './CorridorAttr41';
import * as polygon from './PolygonAttr14';
import * as circle from './CircleAttr30';
import * as cylinder from './CylinderAttr47';
import * as rectangle from './RectangleAttr44';
import * as ellipsoid from './EllipsoidAttr48';

const ellipse = circle;
export {
  billboard,
  label,
  point,
  model,
  polygon,
  polyline,
  polylineVolume,
  wall,
  circle,
  corridor,
  cylinder,
  rectangle,
  ellipsoid,
  ellipse
};

export const defNullFun = () => null;

export const getAttrClass = (entity) => {
  if (entity.billboard) return billboard;
  if (entity.point) return point;
  if (entity.label) return label;
  if (entity.model) return model;
  if (entity.polyline) return polyline;
  if (entity.polylineVolume) return polylineVolume;
  if (entity.corridor) return corridor;
  if (entity.wall) return wall;
  if (entity.ellipse) return circle;
  if (entity.cylinder) return cylinder;
  if (entity.polygon) return polygon;
  if (entity.rectangle) return rectangle;
  if (entity.ellipsoid) return ellipsoid;

  return {
    getCoordinates: defNullFun,
    getPositions: defNullFun,
    toGeoJSON: defNullFun,
    style2Entity: defNullFun
  };
};

export const getCoordinates = (entity) => {
  return getAttrClass(entity).getCoordinates(entity);
};

export const getPositions = (entity) => {
  return getAttrClass(entity).getPositions(entity);
};

export const getCenterPosition = (entity) => {
  let pots = getPositions(entity);
  if (!pots || pots.length === 0) return null;
  if (pots.length === 1) return pots[0];

  let position;
  if (entity.polygon) position = centerOfMass(pots);
  else position = pots[Math.floor(pots.length / 2)];
  return position;
};

export const toGeoJSON = (entity) => {
  return getAttrClass(entity).toGeoJSON(entity);
};

export const style2Entity = (style, entity) => {
  return getAttrClass(entity).style2Entity(style, entity);
};

/**
 * 定义所有图形的样式 二三维统一
 */
export const defaultStyle = {
  fillColor: '#0ff',
  strokeColor: '#ff0',
  strokeWidth: '2',
  icon: {
    src: '',
    anchor: [0.5, 0.5]
  },
  circle: {
    radius: '500',
    fillColor: '#0ff',
    strokeColor: '#ff0',
    strokeWidth: '2'
  },
  text: {
    text: '文字',
    fillColor: '#0ff',
    strokeColor: '#ff0',
    strokeWidth: '2'
  },
  model: {
    url: 'Assets3D/model/car.gltf'
  }
};
