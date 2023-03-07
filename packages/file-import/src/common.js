import { getCenter, extend } from 'ol/extent.js';

// 获取新的GUID
export function newGuid() {
  var guid = '';
  for (var i = 1; i <= 32; i++) {
    var n = Math.floor(Math.random() * 16.0).toString(16);
    guid += n;
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      guid += '-';
    }
  }
  return guid;
}

/**
 * 定位图形
 * @param {} map
 * @param {*} geometrys
 */
export function locationGeometry(map, geometrys) {
  if (geometrys && geometrys.length > 0 && map) {
    let ext = null;
    for (let index = 0; index < geometrys.length; index++) {
      const geo = geometrys[index];
      if (!geo) {
        continue;
      }
      if (ext == null) {
        ext = [...geo.getExtent()];
      } else {
        ext = extend(ext, geo.getExtent());
      }
    }

    if (ext != null) {
      let res = map.getView().getResolutionForExtent(ext, map.getSize());
      if (res < map.getView().getMaxResolution()) {
        map.getView().setResolution(res);
        map.getView().setCenter(getCenter(ext));
      } else {
        console.error('导入的图形数据坐标有误', ext, geometrys);
      }
    }
  }
}
export function getNowTime() {
  let now = new Date();
  let month = now.getMonth() < 10 ? '0' + now.getMonth() : now.getMonth();
  let day = now.getDay() < 10 ? '0' + now.getDay() : now.getDay();
  let hour = now.getHours() < 10 ? '0' + now.getHours() : now.getHours();
  let minute =
    now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
  let second =
    now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
  let time =
    now.getFullYear() +
    '/' +
    month +
    '/' +
    day +
    ' ' +
    hour +
    ':' +
    minute +
    ':' +
    second;
  return time;
}
