/** 飞行漫游 **/
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
  // 漫游列表
  getRoamList(params) {
    return this.get('/roam/list', params);
  }
  // 漫游新增
  addRoam(data) {
    return this.post('/roam/add', data);
  }
  // 漫游详情
  roamDetail(id) {
    return this.get('/roam/details/' + id);
  }
  // 漫游删除
  delRoam(id) {
    return this.get('/roam/del/' + id);
  }
  // 漫游修改
  editRoam(data) {
    return this.post('/roam/modify', data);
  }
}
export { CommonInterface };
