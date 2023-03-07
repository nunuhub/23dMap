import { geoStrParse } from './geoserver-geom/GeoStrParse';
import { symbolParse } from './symbol/SymbolParse';

export function preParse(data) {
  return new Promise((resolve) => {
    // 二三维参数统一
    if (data.minimumLevel) {
      data.minZoom = data.minimumLevel - 1;
    }
    symbolParse(data)
      .then(() => {
        toGeoStrParse(data, resolve);
      })
      .catch((e) => {
        console.warn(e);
        toGeoStrParse(data, resolve);
      });
  });
}

function toGeoStrParse(data, resolve) {
  geoStrParse(data)
    .then(() => {
      resolve();
    })
    .catch((e) => {
      console.warn(e);
      resolve();
    });
}
