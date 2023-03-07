import axios from 'axios';

class Api {
  constructor(url) {
    this.mxdPath = '\\Templates\\CustomTemplates';
    this.filePath = '\\ClientApp\\TempFile';
    this.request = axios.create({
      baseURL: url // url = base url + request url
      // timeout: 30 * 1000 // request timeout
    });
  }

  // 获取模板列表
  getFileList(params) {
    return this.request({
      url: '/USC/File/GetFileList/',
      method: 'get',
      params
    });
  }

  // 获取模板详情
  getPageLayoutPro(params) {
    return this.request({
      url: '/USC/Print/GetPageLayoutPro',
      method: 'get',
      params
    });
  }

  // 后端制图
  print(params) {
    return this.request({
      url: '/USC/Print/Print',
      method: 'post',
      data: params
    });
  }
  // 下载制图结果
  getFile(params) {
    return this.request({
      url: '/USC/File/GetFile/',
      method: 'get',
      params,
      responseType: 'arraybuffer'
    });
  }
}

export default Api;
