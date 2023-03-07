import { parseGaResult, postFromAdmin } from '../utils/httprequest';
import qs from 'qs';
import { getFromAdmin } from '../utils/httprequest';
import { saveAs } from 'file-saver';

class GaApi {
  constructor(url) {
    this.shinegaUrl = url;
  }

  // 导入文件
  importFile({ files, wkid, fromwkid, token }) {
    let formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file.raw);
    });
    formData.append('wkid', wkid);
    if (fromwkid) {
      formData.append('fromwkid', fromwkid);
    }
    // shapeonly 参数  true：只返回图层数据  false：同时返回属性信息
    formData.append('shapeonly', false);
    let config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      token: token
    };
    return new Promise((resolve, reject) => {
      postFromAdmin(this.shinegaUrl, formData, config)
        .then((response) => {
          let result = parseGaResult(response);
          resolve(result);
        })
        .catch((err) => {
          this._handleError(err, reject);
        });
    });
  }

  exportFile({ wkts, extension, filename, exportFileExt, wkid, token }) {
    let formData = new FormData();
    // 请求参数
    formData.append('wkts', JSON.stringify(wkts));
    formData.append('extension', extension);
    formData.append('filename', filename);
    formData.append('wkid', wkid);
    // let config = {
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   }
    // };
    return new Promise((resolve, reject) => {
      // 发送请求(接收数据流时，要设置responseType为arraybuffer)
      postFromAdmin(this.shinegaUrl, formData, {
        //responseType: 'arraybuffer',
        token: token
      })
        .then((response) => {
          // 调用FileSaver插件，保存文件
          response = response.headers ? response.data : response;
          if (response.success) {
            let exportBlob = this._dataURLtoBlob(response.result);
            saveAs(exportBlob, filename + exportFileExt);
            resolve('导出成功');
          } else if (typeof response === 'string') {
            this._exportFile(
              { wkts, extension, filename, exportFileExt, wkid, token },
              resolve,
              reject
            );
          } else {
            reject(new Error('导出错误:' + response.description));
          }
        })
        .catch((err) => {
          console.error(err);
          reject(new Error('导出错误'));
        });
    });
  }

  // 获取面积
  getArea(param, token) {
    let config = {
      headers: {
        'Content-Type': 'application/json'
      },
      token: token,
      params: { spheroid: false }
    };
    return new Promise((resolve) => {
      postFromAdmin(this.shinegaUrl + '/geometry/util/area', param, config)
        .then((response) => {
          let result = parseGaResult(response);
          resolve(result);
        })
        .catch(() => {
          resolve();
        });
    });
  }

  // 获取图层主键
  getPrimaryKey({ layerTable, token }) {
    return new Promise((resolve, reject) => {
      postFromAdmin(
        this.shinegaUrl + '/primaryKey',
        qs.stringify({
          tableName: layerTable
        }),
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          token: token
        }
      )
        .then((response) => {
          let result = parseGaResult(response);
          resolve(result);
        })
        .catch((err) => {
          this._handleError(err, reject);
        });
    });
  }

  // 保存
  save({ features, options, ruleOptions, token }) {
    return new Promise((resolve, reject) => {
      let formData = new FormData();
      formData.append('features', JSON.stringify(features));
      if (options) {
        formData.append('options', JSON.stringify(options));
      } else {
        formData.append('options', '{}');
      }
      if (ruleOptions) {
        formData.append('ruleOptions', ruleOptions);
      }
      // 保存请求
      postFromAdmin(this.shinegaUrl + '/edit/save', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        token: token
      })
        .then((response) => {
          let result = parseGaResult(response);
          resolve(result);
        })
        .catch((err) => {
          this._handleError(err, reject);
        });
    });
  }

  // 删除
  delete({ featureClass, filterWhere, deleteOptions, ruleOptions, token }) {
    return new Promise((resolve, reject) => {
      var params = new FormData();
      params.append('featureClass', featureClass);
      params.append('filterWhere', filterWhere);
      if (deleteOptions) {
        params.append('options', JSON.stringify(deleteOptions));
      } else {
        params.append('options', '{}');
      }
      if (ruleOptions) {
        params.append('ruleOptions', ruleOptions);
      }
      postFromAdmin(this.shinegaUrl + '/edit/delete', params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        token: token
      })
        .then((response) => {
          let result = parseGaResult(response);
          resolve(result);
        })
        .catch((err) => {
          if (err.message.indexOf('405') > -1) {
            this._deleteUseGet({
              featureClass,
              filterWhere,
              deleteOptions,
              token,
              resolve,
              reject
            });
          } else {
            this._handleError(err, reject);
          }
        });
    });
  }

  // 分割
  split({ features, splitLine, token }) {
    return new Promise((resolve, reject) => {
      let url = this.shinegaUrl + '/geometry/util/split';
      postFromAdmin(url, features, {
        headers: { 'Content-Type': 'application/json;charset=UTF-8' },
        params: {
          line: splitLine
        },
        token: token
      })
        .then((response) => {
          let result = parseGaResult(response);
          resolve(result);
        })
        .catch((err) => {
          this._handleError(err, reject);
        });
    });
  }

  _exportFile(
    { wkts, extension, filename, exportFileExt, wkid, token },
    resolve,
    reject
  ) {
    let formData = new FormData();
    // 请求参数
    formData.append('wkts', JSON.stringify(wkts));
    formData.append('extension', extension);
    formData.append('filename', filename);
    formData.append('wkid', wkid);
    // let config = {
    //   headers: {
    //     'Content-Type': 'application/x-www-form-urlencoded'
    //   }
    // };
    // 发送请求(接收数据流时，要设置responseType为arraybuffer)
    postFromAdmin(this.shinegaUrl, formData, {
      responseType: 'arraybuffer',
      token: token
    })
      .then((response) => {
        // 调用FileSaver插件，保存文件
        response = response.headers ? response.data : response;
        if (response) {
          let exportBlob = new Blob([response]);
          saveAs(exportBlob, filename + exportFileExt);
          resolve('导出成功');
        } else {
          reject(new Error('导出错误'));
        }
      })
      .catch((err) => {
        console.error(err);
        reject(new Error('导出错误'));
      });
  }

  _deleteUseGet({
    featureClass,
    filterWhere,
    deleteOptions,
    token,
    resolve,
    reject
  }) {
    getFromAdmin(this.shinegaUrl + '/edit/delete', {
      params: { featureClass, filterWhere, deleteOptions },
      token: token
    })
      .then((response) => {
        let result = parseGaResult(response);
        resolve(result);
      })
      .catch((err) => {
        this._handleError(err, reject);
      });
  }

  _dataURLtoBlob(dataurl) {
    var bstr = atob(dataurl),
      n = bstr.length,
      u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr]);
  }

  _handleError(err, reject) {
    console.error(err);
    let message = '';
    if (err.response) {
      message = err.response.data.message;
    } else {
      message = err.message;
    }
    reject(new Error('导入错误:' + message));
  }
}

export default GaApi;
