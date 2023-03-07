import WKT from 'ol/format/WKT';
import GaApi from 'shinegis-client-23d/src/utils/GaApi';

/**
 * 请求ga接口给features赋值area
 * @param url
 * @param features
 * @param projection
 * @param token
 * @returns {Promise<unknown>}
 */
export function setAreaByGa({ url, features, projection, token }) {
  return new Promise((resolve) => {
    if (url && projection && features && features.length > 0) {
      let param = [];
      let wkid = projection.split(':')[1];
      for (let i = 0; i < features.length; i++) {
        // 已经存在area不获取面积覆盖
        if (features[i].get('area')) {
          continue;
        }
        let wkt = new WKT().writeFeature(features[i]);
        param.push({
          geom: wkt,
          id: i,
          wkid: wkid
        });
      }
      if (param.length === 0) {
        resolve();
        return;
      }
      new GaApi(url)
        .getArea(param, token)
        .then((result) => {
          if (result.success) {
            for (let item of result.data) {
              features[item.id]?.set('area', item['st_area']);
            }
          }
          resolve();
        })
        .catch(() => {
          resolve();
        });
    } else {
      resolve();
    }
  });
}
