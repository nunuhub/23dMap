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
      postFromAdmin(this.baseUrl + url, JSON.stringify(params), {
        token: this.token,
        applicationId: this.applicationId,
        params: { schemeId: this.schemeId }
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
  // 新增
  saveFlatten(data) {
    return this.post('/press/save', data);
  }
  // 编辑
  editFlatten(data) {
    return this.post('/press/modify', data);
  }
  // 列表
  getFlattenList(data) {
    return this.get('/press/list', data);
  }
  // 删除
  deleteFlatten(id) {
    return this.post('/press/del/' + id);
  }
  // 批量跟新/新增
  saveList(data) {
    return this.post('/press/modifyList', data);
  }
  // 批量移除
  removeList(data) {
    return this.post('/press/removeList', data);
  }
}
export { CommonInterface };
