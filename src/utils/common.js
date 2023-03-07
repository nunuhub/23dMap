/* eslint-disable radix */
/**
 * 此JS文件存放普通JS公共方法
 */
import axios from 'axios';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';

/**
 * 读取xml字符串，返回XML
 * @param {String} xmlstr
 */
export function LoadXmlText(xmlstr) {
  let xmlDoc;
  if (window.DOMParser) {
    // 非IE浏览器
    xmlDoc = new DOMParser().parseFromString(xmlstr, 'text/xml');
  } else {
    // IE浏览器
    // eslint-disable-next-line no-undef
    xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
    // 或者：xmlDoc = new ActiveXObject("MSXML2.DOMDocument");
    xmlDoc.async = 'false'; // 不启用异步，保证加载文件成功之前不会进行下面操作
    xmlDoc.loadXML(xmlstr);
  }
  return xmlDoc;
}
// xml转json
export function xmlToJson(xml) {
  // Create the return object
  var obj = {};

  if (xml.nodeType === 1) {
    // element
    // do attributes
    if (xml.attributes.length > 0) {
      obj['@attributes'] = {};
      for (var j = 0; j < xml.attributes.length; j++) {
        var attribute = xml.attributes.item(j);
        obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
      }
    }
  } else if (xml.nodeType === 3) {
    // text
    obj = xml.nodeValue;
  }

  // do children
  if (xml.hasChildNodes()) {
    for (var i = 0; i < xml.childNodes.length; i++) {
      var item = xml.childNodes.item(i);
      var nodeName = item.nodeName;
      if (typeof obj[nodeName] === 'undefined') {
        obj[nodeName] = xmlToJson(item);
      } else {
        if (typeof obj[nodeName].push === 'undefined') {
          var old = obj[nodeName];
          obj[nodeName] = [];
          obj[nodeName].push(old);
        }
        obj[nodeName].push(xmlToJson(item));
      }
    }
  }
  return obj;
}

// 异步获取config.json
export function getConfigJSON() {
  return new Promise((resolve, reject) => {
    axios
      .get('static/config/config.json')
      .then((response) => {
        resolve(response.data);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
}

// 获取新的GUID
export function newGuid() {
  var guid = '';
  for (var i = 1; i <= 32; i++) {
    var n = Math.floor(Math.random() * 16.0).toString(16);
    guid += n;
    if (i === 8 || i === 12 || i === 16 || i === 20) {
      guid += '-';
    }
  }
  return guid;
}

/**
 * rgb(rgba)转hex16进制颜色
 * @param val 例如:"rgba(255, 255, 255, 1)"
 * @returns {string}
 */
export function rgbToHex(val) {
  //RGB(A)颜色转换为HEX十六进制的颜色值
  let r,
    g,
    b,
    a,
    regRgba = /rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(,([.\d]+))?\)/, //判断rgb颜色值格式的正则表达式，如rgba(255,20,10,.54)
    rsa = val.replace(/\s+/g, '').match(regRgba);
  if (rsa) {
    r = parseInt(rsa[1]).toString(16);
    r = r.length === 1 ? '0' + r : r;
    g = (+rsa[2]).toString(16);
    g = g.length === 1 ? '0' + g : g;
    b = (+rsa[3]).toString(16);
    b = b.length === 1 ? '0' + b : b;
    a = +(rsa[5] ? rsa[5] : 1) * 100;
    return {
      hex: '#' + r + g + b,
      r: parseInt(r, 16),
      g: parseInt(g, 16),
      b: parseInt(b, 16),
      alpha: Math.ceil(a)
    };
  } else {
    return { hex: '无效', alpha: 100 };
  }
}

/**
 * hex16进制颜色转rgb(rgba)
 * @param hex 例如:"#23ff45"
 * @param opacity 不透明度
 * @returns {string}
 */
export function hexToRgba(hex, opacity) {
  return (
    'rgba(' +
    parseInt('0x' + hex.slice(1, 3)) +
    ',' +
    parseInt('0x' + hex.slice(3, 5)) +
    ',' +
    parseInt('0x' + hex.slice(5, 7)) +
    ',' +
    opacity +
    ')'
  );
}

/**
 * JS颜色十六进制转换为rgb或rgba,返回的格式为 rgba（255，255，255，0.5）字符串
 * sHex为传入的十六进制的色值
 * alpha为rgba的透明度
 */
export function colorRgba(sHex, alpha) {
  // 十六进制颜色值的正则表达式
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  /* 16进制颜色转为RGB格式 */
  let sColor = sHex.toLowerCase();
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      var sColorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    // 处理六位的颜色值
    var sColorChange = [];
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
    }
    // return sColorChange.join(',')
    return 'rgba(' + sColorChange.join(',') + ',' + alpha + ')';
  } else {
    return sColor;
  }
}

export function getRgbaArray(value) {
  value = value.replace(/\s*/g, '');
  const aColor = value.replace(/(?:\(|\)|rgba|RGBA)*/g, '').split(',');
  const result = [];
  for (let i = 0; i < aColor.length; i++) {
    const hex = Number(aColor[i]);
    result.push(hex);
  }
  return result;
}

/**
 * 查询功能中，查询到的geometry的展示样式
 */
const queryFill = new Fill({
  color: [255, 0, 0, 0.3]
});
const queryStroke = new Stroke({
  color: [255, 0, 0],
  width: 3
});
/**
 * 异步加载js文件
 */
export const queryStyle = new Style({
  fill: queryFill,
  stroke: queryStroke,
  image: new CircleStyle({
    fill: new Fill({
      color: [255, 0, 0]
    }),
    radius: 7
  })
});

export function loadScript(url, callback) {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  if (script.readyState) {
    // ie游览器
    script.onreadystatechange = function () {
      if (script.readyState === 'loaded' || script.readyState === 'complete') {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {
    // 其他
    script.onload = function () {
      callback();
    };
  }
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}

export function strDateTime(str) {
  var r = str.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})(Z)$/);
  if (r === null) return false;
  var d = new Date(r[1], r[3] - 1, r[4]);
  return (
    d.getFullYear() === r[1] &&
    d.getMonth() + 1 === r[3] &&
    d.getDate() === r[4]
  );
}

export function setIntervalCount(
  handler,
  timeout,
  maxCount,
  overCountCallback
) {
  var executeCount = 0;
  const timer = setInterval(() => {
    if (executeCount < maxCount) {
      executeCount++;
      handler();
    } else {
      clearInterval(timer);
      if (overCountCallback) {
        overCountCallback();
      }
    }
  }, timeout);
  return timer;
}

export function changeElementByClassName(className, resolve) {
  const element = document.getElementsByClassName(className);
  if (element) {
    if (element instanceof HTMLCollection) {
      for (const item of element) {
        resolve(item);
      }
    } else {
      resolve(element);
    }
  }
}

export function mapIndexSort(a, b) {
  if (a.mapIndex === undefined) {
    a.mapIndex = 0;
  }
  if (b.mapIndex === undefined) {
    b.mapIndex = 0;
  }
  return a.mapIndex - b.mapIndex;
}

/**
 * 获取viewMode
 * @param {*} type Number 0/1/2
 */
export function getMapViewMode(type) {
  if (type === 0 || (type.toUpperCase && type.toUpperCase() === '2D')) {
    return '2D';
  } else if (type === 1 || (type.toUpperCase && type.toUpperCase() === '23D')) {
    return '23D';
  } else if (type === 2 || (type.toUpperCase && type.toUpperCase() === '3D')) {
    return '3D';
  }
}

/**
 * 将驼峰字符转换为中划线字符
 * @param {string} str 需要转换的字符
 * @returns 示例:TButtonTest => t-button-test
 */
export function formatConversion(str) {
  return str.replace(/([a-zA-Z])([A-Z])/g, '$1-$2').toLowerCase();
}
//度分秒格式的经纬度转小数点格式
export function lonlatTransfer(coord) {
  if (!Array.isArray(coord)) return;
  // eslint-disable-next-line no-useless-escape
  let reg = /[\'\"]/;
  if (reg.test(coord[0])) {
    let jingdufen = coord[0].split("'")[0];
    let jingdu = jingdufen.split('°')[0];
    let jingfen = jingdufen.split('°')[1];
    let jingmiao = coord[0].split("'")[1].replace('"', '');
    coord[0] = (
      parseInt(jingdu) +
      parseInt(jingfen) / 60 +
      parseInt(jingmiao / 3600)
    )
      .toFixed(6)
      .toString();
    let weidufen = coord[1].split("'")[0];
    let weidu = weidufen.split('°')[0];
    let weifen = weidufen.split('°')[1];
    let weigmiao = coord[1].split("'")[1].replace('"', '');
    coord[1] = (
      parseInt(weidu) +
      parseInt(weifen) / 60 +
      parseInt(weigmiao / 3600)
    )
      .toFixed(6)
      .toString();
  } else {
    let jingdufen = coord[0].split('′')[0];
    let jingdu = jingdufen.split('°')[0];
    let jingfen = jingdufen.split('°')[1];
    let jingmiao = coord[0].split('′')[1].replace('″', '');
    coord[0] = (
      parseInt(jingdu) +
      parseInt(jingfen) / 60 +
      parseInt(jingmiao / 3600)
    )
      .toFixed(6)
      .toString();
    let weidufen = coord[1].split('′')[0];
    let weidu = weidufen.split('°')[0];
    let weifen = weidufen.split('°')[1];
    let weigmiao = coord[1].split('′')[1].replace('″', '');
    coord[1] = (
      parseInt(weidu) +
      parseInt(weifen) / 60 +
      parseInt(weigmiao / 3600)
    )
      .toFixed(6)
      .toString();
  }
  return coord;
}
//不严格的indexof
export function indexOf(array, item) {
  if (array && array.length > 0) {
    for (let i in array) {
      // eslint-disable-next-line eqeqeq
      if (array[i] == item) {
        return i;
      }
    }
  }
  return -1;
}
