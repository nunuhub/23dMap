/** 开挖压平 **/
import {
  postFromAdmin,
  getFromAdmin,
  parseResult
} from 'shinegis-client-23d/src/utils/httprequest';
import { Message } from 'element-ui';

class CommonInterface {
  constructor(url, token, applicationId, schemeId) {
    this.baseUrl = url;
    this.token = token;
    this.applicationId = applicationId;
    this.schemeId = schemeId;
  }
  get(url, params) {
    return new Promise((resolve, reject) => {
      getFromAdmin(this.baseUrl + url, {
        params: { schemeId: this.schemeId, ...params },
        token: this.token,
        applicationId: this.applicationId
      })
        .then((res) => {
          let result = parseResult(res);
          if (result.success) {
            resolve(result.data);
          } else {
            Message.error(result.message);
          }
        })
        .catch((err) => {
          reject(err.data);
        });
    });
  }
  post(url, params) {
    return new Promise((resolve, reject) => {
      postFromAdmin(
        this.baseUrl + url,
        JSON.stringify({ schemeId: this.schemeId, ...params }),
        {
          token: this.token,
          applicationId: this.applicationId
        }
      )
        .then((res) => {
          let result = parseResult(res);
          if (result.success) {
            resolve(result.data);
          } else {
            Message.error(result.message);
          }
        })
        .catch((err) => {
          reject(err.data);
        });
    });
  }
  // 存储
  saveGeoJson(geojson) {
    let data = { id: this.schemeId, config: JSON.stringify(geojson) };
    return this.post('/draw/update', data);
  }
  // 读取
  getGeoJson(id) {
    return this.get(`/draw/getDrawById/${id || this.schemeId}`);
  }
}
export { CommonInterface };
