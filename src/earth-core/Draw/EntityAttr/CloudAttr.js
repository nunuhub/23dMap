import * as Cesium from 'cesium_shinegis_earth';
import { cartesians2lonlats } from '../../Tool/Util3';

//属性赋值到entity
export const style2Entity = (style, entityattr) => {
  style = style || {};

  if (entityattr == null) {
    //默认值
    entityattr = {};
  }
  const defaultParameters = {
    scaleX: 25,
    scaleY: 12,
    maximumSizeX: 25,
    maximumSizeY: 12,
    maximumSizeZ: 15,
    renderSlice: true, // if false, renders the entire surface of the ellipsoid
    slice: 0.36,
    brightness: 1.0
  };
  style = { ...defaultParameters, ...style };

  //Style赋值值Entity

  entityattr.scale = new Cesium.Cartesian2(style.scaleX, style.scaleY);
  entityattr.maximumSize = new Cesium.Cartesian3(
    style.maximumSizeX,
    style.maximumSizeY,
    style.maximumSizeZ
  );
  entityattr.slice = style.renderSlice ? style.slice : -1.0;
  entityattr.brightness = style.brightness;

  return entityattr;
};

//获取entity的坐标
export const getPositions = (entity) => {
  return [entity.position];
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
