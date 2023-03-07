/** 场景视廊 **/
// import axios from 'axios';
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
            reject(result.message);
          }
        })
        .catch((err) => {
          reject(err.data);
        });
    });
  }
  postform(url, data = {}) {
    return new Promise((resolve, reject) => {
      postFromAdmin(this.baseUrl + url, data, {
        token: this.token,
        applicationId: this.applicationId,
        params: { schemeId: this.schemeId }
      }).then(
        (response) => {
          let result = parseResult(response);
          if (result.success) {
            resolve(result.data);
          } else {
            Message.error(result.message);
          }
        },
        (err) => {
          reject(err);
        }
      );
    });
  }
  // 目录列表
  getCatalogList() {
    return this.get('/sceneCatalog/list');
  }
  // 目录新增/修改
  editCatalog(data) {
    return this.post('/sceneCatalog/update', data);
  }
  // 目录详情
  detailCatalog(id) {
    return this.get('/sceneCatalog/details/' + id);
  }
  // 目录删除
  delCatalog(id) {
    return this.get('/sceneCatalog/del/' + id);
  }
  // 文件上传
  fileUpload(data) {
    return this.postform('/file/upload', data);
  }
  // 场景新增/修改
  editScene(data) {
    return this.post('/scene/update', data);
  }
  // 场景获取
  getScene(id) {
    return this.get('/scene/getSceneByCatalog/' + id);
  }
  // 场景删除
  delScene(id) {
    return this.get('/scene/del/' + id);
  }
  // 场景详情
  detailScene(id) {
    return this.get('/scene/details/' + id);
  }
  // 场景移动
  moveScene(data) {
    return this.post('/scene/sceneMove', data);
  }
}
export { CommonInterface };
