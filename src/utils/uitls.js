// url字符串添加参数
// url:路径地址 paramName：参数名 replaceWith：参数值
export function addParamToUrl(url, paramName, replaceWith) {
  var re = eval('/(' + paramName + '=)([^&]*)/gi');
  if (url.match(re)) {
    url = url.replace(re, paramName + '=' + replaceWith);
  } else {
    var paraStr = paramName + '=' + replaceWith;
    var idx = url.indexOf('?');
    let trueUrl = url;
    // 处理代理的url
    if (idx > -1 && url.indexOf('?http') > -1) {
      trueUrl = url.substring(idx + 1);
      idx = trueUrl.indexOf('?');
    }
    if (idx < 0) {
      url += '?';
    } else if (idx >= 0 && idx !== trueUrl.length - 1) {
      url += '&';
    }
    url = url + paraStr;
  }
  return url;
}
export function appendPath(url, path) {
  var idx = url.indexOf('?');
  let trueUrl = url;
  // 处理代理的url
  if (idx > -1 && url.indexOf('?http') > -1) {
    let proxyLength = idx + 1;
    trueUrl = url.substring(idx + 1);
    idx = trueUrl.indexOf('?');
    if (idx > -1) {
      idx += proxyLength;
    }
  }
  if (idx > -1) {
    return url.substring(0, idx) + '/' + path + url.substring(idx);
  } else {
    return url + '/' + path;
  }
}
export function getCapabilitiesUrl(data) {
  let requestUrl = addParamToUrl(data.url, 'SERVICE', 'WMTS');
  requestUrl = addParamToUrl(requestUrl, 'request', 'getCapabilities');
  requestUrl = addParamToUrl(requestUrl, 'version', '1.0.0');
  requestUrl = addParamByData(requestUrl, data);
  return requestUrl;
}

export function addParamByData(requestUrl, data) {
  if (data.authkey) {
    requestUrl = addParamToUrl(requestUrl, 'authkey', data.authkey);
  }
  if (data.appid) {
    // requestUrl = requestUrl + '&authkey=' + data.authkey
    requestUrl = addParamToUrl(requestUrl, 'appid', data.appid);
  }
  return requestUrl;
}

export function getQueryVariable(url, variable) {
  if (url.indexOf('?') > -1) {
    var query = url.split('?')[1];
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      if (pair[0] === variable) {
        return pair[1];
      }
    }
  }
  return false;
}

/**
 * 获取url的参数返回一个参数数组
 * @param url
 * @returns {*[{name,value}]|*}
 */
export function getUrlParams(url) {
  let proxyIndex = url.indexOf('jsp?');
  if (proxyIndex > -1) {
    if (url.indexOf('?', proxyIndex + 3) > -1) {
      let query = url.split('?')[2];
      return createParamByQuery(query);
    }
  } else {
    if (url.indexOf('?') > -1) {
      let query = url.split('?')[1];
      return createParamByQuery(query);
    }
  }
  return [];
}

function createParamByQuery(query) {
  let vars = query.split('&');
  return vars.map((item) => {
    var pair = item.split('=');
    return {
      name: pair[0],
      value: pair[1]
    };
  });
}

export function getBoolean(booleanStr) {
  try {
    // eslint-disable-next-line no-eval
    return eval(booleanStr);
  } catch (e) {
    return false;
  }
}
