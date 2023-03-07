// 在http.js中引入axios
import axios from 'axios';
// axios.defaults.baseURL = 'http://localhost:21099';
// 环境的切换 http://gisqydsp.vaiwan.com
// if (process.env.NODE_ENV === 'development') {
//   axios.defaults.baseURL = 'http://192.168.2.137:2020';
// } else if (process.env.NODE_ENV === 'debug') {
//   axios.defaults.baseURL = 'http://192.168.2.137:2020';
// } else if (process.env.NODE_ENV === 'production') { // 线上环境
//   axios.defaults.baseURL = 'http://192.168.2.137:2020';
// }

let tokenType = 'Bearer';
/**
 * get方法，对应get请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function get(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params
      })
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err.data);
      });
  });
}

/**
 * post方法，对应post请求
 * @param {String} url [请求的url地址]
 * @param {Object} params [请求时携带的参数]
 */
export function post(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .post(url, JSON.stringify(params))
      .then((res) => {
        resolve(res.data);
      })
      .catch((err) => {
        reject(err.data);
      });
  });
}

/**
 * 运维端请求的get方法，
 * @param {String} url [请求的url地址]
 * @param {Object} config [请求时携带的参数]  config.token [请求头的token]
 */
export function getFromAdmin(url, config) {
  // 根据header和token构造新的header
  if (!config.headers) {
    config.headers = {
      'Content-Type': 'application/json'
    };
  }
  if (config.token) {
    config.headers['X-Gisq-Token'] = tokenType + ' ' + config.token;
  }
  if (config.applicationId) {
    config.headers['ApplicationId'] = config.applicationId;
  }
  return axios.get(url, config);
}
/**
 * 运维端请求的get方法，
 * @param {String} url [请求的url地址]
 * @param {Object} config [请求时携带的参数]  config.token [请求头的token]
 */
export function postFromAdmin(url, data, config) {
  // 根据header和token构造新的header
  if (!config.headers) {
    config.headers = {
      'Content-Type': 'application/json'
    };
  }
  if (config.token) {
    config.headers['X-Gisq-Token'] = tokenType + ' ' + config.token;
  }
  if (config.applicationId) {
    config.headers['ApplicationId'] = config.applicationId;
  }
  return axios.post(url, data, config);
}

/**
 * 兼容老版本的运维端解析,ga服务需要单独处理
 * @param result
 * @returns {*} {success,data,message}
 */
export function parseResult(result) {
  if (result.data.code === '0000') {
    let response = result.data;
    return {
      success: true,
      data: response.result ? response.result : response.data
    };
  } else {
    let message = result.data.description
      ? result.data.description
      : result.data.message;
    return {
      success: false,
      message: message
    };
  }
}

/**
 * 兼容新老版本的ga服务
 * @param result
 * @returns {*} {success,data,message}
 */
export function parseGaResult(response) {
  response = response.headers ? response.data : response;
  let isSuccess = true;
  if (response.code) {
    isSuccess = response.code === '0000';
  } else if (response.message) {
    isSuccess = response.message === 'success';
  }
  if (isSuccess) {
    let data = response.result ? response.result : response.data;
    if (data.error) {
      return {
        success: false,
        message: data.error
      };
    } else if (data.IsSucess === false) {
      let detailError = '';
      data.EditErrors.forEach((errorMsg) => {
        detailError += errorMsg.ErrorMsg + '<br/>';
      });
      return {
        success: false,
        message: detailError
      };
    } else {
      return {
        success: true,
        data: data
      };
    }
  } else {
    let message = response.description
      ? response.description
      : response.message;
    return {
      success: false,
      message: message
    };
  }
}
