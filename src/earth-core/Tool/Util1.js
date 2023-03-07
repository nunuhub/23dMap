/* eslint-disable no-prototype-builtins */

import * as Cesium from 'cesium_shinegis_earth';
import Jquery from 'jquery';
import * as turf from '@turf/turf';
import * as Util from './Util3';
import { terrainPolyline as PointTerrainPolyline } from './Point2';

export function isNumber(obj) {
  return typeof obj === 'number' && obj.constructor === Number;
}

export function isString(str) {
  return typeof str === 'string' && str.constructor === String;
}

//计算长度，单位：米
export function getLength(positions) {
  if (!Cesium.defined(positions) || positions.length < 2) return 0;

  let distance = 0;
  for (let i = 1, len = positions.length; i < len; i++) {
    distance += Cesium.Cartesian3.distance(positions[i - 1], positions[i]);
  }
  return distance;
}

/**  单位换算，格式化显示长度     */
export function formatLength(val, unit) {
  if (val === null || val === undefined) return '';

  if (unit === null || unit === 'auto') {
    if (val < 1000) unit = 'm';
    else unit = 'km';
  }

  let valstr = '';
  switch (unit) {
    default:
    case 'm':
      valstr = val.toFixed(2) + '米';
      break;
    case 'km':
      valstr = (val * 0.001).toFixed(2) + '公里';
      break;
    case 'mile':
      valstr = (val * 0.00054).toFixed(2) + '海里';
      break;
    case 'zhang':
      valstr = (val * 0.3).toFixed(2) + '丈';
      break;
  }
  return valstr;
}

//面积
export function getArea(positions, noAdd) {
  let coordinates = Util.cartesians2lonlats(positions);

  if (!noAdd && coordinates.length > 0) coordinates.push(coordinates[0]);

  let area = turf.area({
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [coordinates]
    }
  });
  return area;
}

/**  进行单位换算，格式化显示面积    */
export function formatArea(val, unit) {
  if (val === null) return '';

  if (unit === null || unit === 'auto') {
    if (val < 1000000) unit = 'm';
    else unit = 'km';
  }

  let valstr = '';
  switch (unit) {
    default:
    case 'm':
      valstr = val.toFixed(2) + '平方米';
      break;
    case 'km':
      valstr = (val / 1000000).toFixed(2) + '平方公里';
      break;
    case 'mu':
      valstr = (val * 0.0015).toFixed(2) + '亩';
      break;
    case 'ha':
      valstr = (val * 0.0001).toFixed(2) + '公顷';
      break;
  }

  return valstr;
}

//求方位角
export function getAngle(firstPoint, endPoints) {
  let carto1 = Cesium.Cartographic.fromCartesian(firstPoint);
  let carto2 = Cesium.Cartographic.fromCartesian(endPoints);

  let pt1 = turf.point([
    Cesium.Math.toDegrees(carto1.longitude),
    Cesium.Math.toDegrees(carto1.latitude),
    carto1.height
  ]);
  let pt2 = turf.point([
    Cesium.Math.toDegrees(carto2.longitude),
    Cesium.Math.toDegrees(carto2.latitude),
    carto2.height
  ]);

  let bearing = Math.round(turf.rhumbBearing(pt1, pt2));
  return bearing;
}

export function alert(msg, title) {
  if (window.haoutil && window.haoutil.alert)
    //此方法需要引用haoutil
    window.haoutil.alert(msg, title);
  else if (window.layer)
    //此方法需要引用layer.js
    window.layer.alert(msg, {
      title: title || '提示',
      skin: 'layui-layer-lan layer-mars-dialog',
      closeBtn: 0,
      anim: 0
    });
  else window.alert(msg);
}

export function msg(msg) {
  if (window.haoutil && window.haoutil.msg)
    //此方法需要引用haoutil
    window.haoutil.msg(msg);
  else if (window.toastr)
    //此方法需要引用toastr
    window.toastr.info(msg);
  else if (window.layer) window.layer.msg(msg); //此方法需要引用layer.js
  else window.alert(msg);
}

//url参数获取
export function getRequest() {
  let url = location.search; //获取url中"?"符后的字串
  let theRequest = new Object();
  if (url.indexOf('?') !== -1) {
    let str = url.substr(1);
    let strs = str.split('&');
    for (let i = 0; i < strs.length; i++) {
      theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1]);
    }
  }
  return theRequest;
}

export function getRequestByName(name) {
  let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
  let r = window.location.search.substr(1).match(reg);
  if (r !== null) return decodeURI(r[2]);
  return null;
}

export function clone(obj, level) {
  if (level == null) level = 5; //避免死循环，拷贝的层级最大深度

  if (
    null === obj ||
    'object' !== (typeof obj === 'undefined' ? 'undefined' : typeof obj)
  )
    return obj;

  // Handle Date
  if (obj instanceof Date) {
    let copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array && level >= 0) {
    let copy = [];
    for (let i = 0, len = obj.length; i < len; ++i) {
      copy[i] = clone(obj[i], level - 1);
    }
    return copy;
  }

  // Handle Object
  if (
    (typeof obj === 'undefined' ? 'undefined' : typeof obj) === 'object' &&
    level >= 0
  ) {
    let copy = {};
    for (let attr in obj) {
      if (typeof attr === 'function') continue;
      if (attr === '_layer' || attr === '_layers' || attr === '_parent')
        continue;

      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr], level - 1);
    }
    return copy;
  }
  return obj;
}

export function currentTime() {
  if (window.viewer) return window.viewer.clock.currentTime;
  else return Cesium.JulianDate.fromDate(new Date());
}

export function template(str, data) {
  if (str === null) return str;

  for (let col in data) {
    if (data.hasOwnProperty(col)) {
      let showval = data[col];
      if (showval === null || showval === 'Null' || showval === 'Unknown')
        showval = '';

      if (col.substr(0, 1) === '_') {
        col = col.substring(1); //cesium 内部属性
      }

      if (showval.getValue && typeof showval.getValue === 'function') {
        showval = showval.getValue(currentTime());
      }

      str = str.replace(new RegExp('{' + col + '}', 'gm'), showval);
    }
  }
  return str;
}

export function expandUrl(url) {
  const urls = [];
  let subdomainsArray;
  let match = /\{([a-z])-([a-z])\}/.exec(url);
  if (match) {
    // char range
    const startCharCode = match[1].charCodeAt(0);
    const stopCharCode = match[2].charCodeAt(0);
    let charCode;
    for (charCode = startCharCode; charCode <= stopCharCode; ++charCode) {
      urls.push(url.replace(match[0], String.fromCharCode(charCode)));
    }
    return urls;
  }
  match = /\{(\d+)-(\d+)\}/.exec(url);
  if (match) {
    // number range
    /*        const stop = parseInt(match[2], 10);
        for (let i = parseInt(match[1], 10); i <= stop; i++) {
            urls.push(url.replace(match[0], i.toString()));
        }
        return urls;*/
    url = url.replace(match[0], '{s}');
    subdomainsArray = Array.from(
      Array(Number(match[2]) - Number(match[1]) + 1)
    ).map((e, i) => Number(match[1]) + i);

    return { subdomainsArray: subdomainsArray.map(String), url: url };
  } else {
    return { url: url };
  }
  // urls.push(url);
}

//简化Cesium内的属性，方便popup等使用
export function getAttrVal(attr) {
  try {
    let newattr = {};
    if (attr?._propertyNames && attr._propertyNames.length > 0) {
      let _iteratorNormalCompletion = true;
      let _didIteratorError = false;
      let _iteratorError = undefined;
      let _iterator;
      try {
        let _step;
        for (
          _iterator = attr._propertyNames[Symbol.iterator](), _step;
          !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
          _iteratorNormalCompletion = true
        ) {
          let _key = _step.value;

          let showval = attr[_key];
          if (
            showval === null ||
            showval === '' ||
            showval === 'Null' ||
            showval === 'Unknown'
          )
            continue;

          if (showval.getValue && typeof showval.getValue === 'function') {
            newattr[_key] = showval.getValue(currentTime());
          } else {
            if (typeof showval === 'function') continue;
            newattr[_key] = showval;
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            // eslint-disable-next-line no-unsafe-finally
            throw _iteratorError;
          }
        }
      }
    } else {
      for (let key in attr) {
        if (attr.hasOwnProperty(key)) {
          let showval = attr[key];
          if (
            showval === null ||
            showval === '' ||
            showval === 'Null' ||
            showval === 'Unknown'
          )
            continue;

          if (showval.getValue && typeof showval.getValue === 'function') {
            newattr[key] = showval.getValue(currentTime());
          } else {
            if (typeof showval === 'function') continue;
            newattr[key] = showval;
          }
        }
      }
    }
    return newattr;
  } catch (e) {
    console.error('getAttrVal 出错', e);
  }
  return attr;
}

//通用，统一配置popup方式
export function getPopupForConfig(cfg, attr) {
  let _title = cfg.popupNameField ? attr[cfg.popupNameField] : cfg.name;

  if (cfg.popup) {
    return getPopup(cfg.popup, attr, _title);
  } else if (cfg.columns) {
    return getPopup(cfg.columns, attr, _title);
  }
  return false;
}

//通用，统一配置Tooltip方式
export function getTooltipForConfig(cfg, attr) {
  let _title = cfg.tooltipNameField ? attr[cfg.tooltipNameField] : cfg.name;

  if (cfg.tooltip) {
    return getPopup(cfg.tooltip, attr, _title);
  }
  return false;
}

//获取Popup或Tooltip格式化字符串
export function getPopup(cfg, attr, title) {
  if (!attr) return false;

  attr = getAttrVal(attr); //取值

  title = title || '';

  if (Util.isArray(cfg)) {
    //数组
    let countsok = 0;
    let inhtml =
      '<div class="mars-popup-titile">' +
      title +
      '</div><div class="mars-popup-content" >';
    for (let i = 0; i < cfg.length; i++) {
      let thisfield = cfg[i];

      let col = thisfield.field;
      if (col === null || attr[col] === null) continue;
      if (typeof attr[col] === 'function') continue;

      if (thisfield.type === 'details') {
        //详情按钮
        let showval = Jquery.trim(attr[col || 'OBJECTID']);
        if (showval === null) continue;

        inhtml +=
          '<div style="text-align: center;padding: 10px 0;"><button type="button" onclick="' +
          thisfield.calback +
          "('" +
          showval +
          '\');" " class="btn btn-info  btn-sm">' +
          (thisfield.name || '查看详情') +
          '</button></div>';
        continue;
      }

      let showval = Jquery.trim(attr[col]);
      if (
        showval === null ||
        showval === '' ||
        showval === 'Null' ||
        showval === 'Unknown' ||
        showval === '0' ||
        showval.length === 0
      )
        continue;

      if (thisfield.format) {
        //使用外部 格式化js方法
        try {
          showval = eval(thisfield.format + '(' + showval + ')');
        } catch (e) {
          console.error('getPopupByConfig error:' + thisfield.format);
        }
      }
      if (thisfield.unit) {
        showval += thisfield.unit;
      }

      //han 修改样式
      // inhtml += '<div><label>' + thisfield.name + '</label>' + showval + '</div>';
      const classRow = countsok % 2 === 0 ? 'singleRow' : 'doubleRow';
      inhtml += `<div class=${classRow}><label class="mars-popup-row-field">${thisfield.name}</label><label class="mars-popup-row-value">${showval}</label></div>`;
      countsok++;
    }
    inhtml += '</div>';

    if (countsok === 0) return false;
    return inhtml;
  } else if (
    (typeof cfg === 'undefined' ? 'undefined' : typeof cfg) === 'object'
  ) {
    //对象,type区分逻辑
    switch (cfg.type) {
      case 'iframe': {
        let _url = template(cfg.url, attr);
        let inhtml =
          '<iframe id="ifarm" src="' +
          _url +
          '"  style="width:' +
          (cfg.width || '300') +
          'px;height:' +
          (cfg.height || '300') +
          'px;overflow:hidden;margin:0;" scrolling="no" frameborder="0" ></iframe>';
        return inhtml;
      }
      case 'javascript': {
        //回调方法
        return eval(cfg.calback + '(' + JSON.stringify(attr) + ')');
      }
    }
  } else if (typeof cfg === 'function') {
    return cfg(attr);
  } else if (cfg === 'all') {
    //全部显示
    let countsok = 0;
    let inhtml =
      '<div class="mars-popup-titile">' +
      title +
      '</div><div class="mars-popup-content" >';
    for (let col in attr) {
      if (attr.hasOwnProperty(col)) {
        try {
          if (col === null || attr[col] === null) continue;

          if (
            col === 'Shape' ||
            col === 'FID' ||
            col === 'OBJECTID' ||
            col === '_definitionChanged' ||
            col === '_propertyNames'
          )
            continue; //不显示的字段

          if (col.substr(0, 1) === '_') {
            col = col.substring(1); //cesium 内部属性
          }

          if (
            typeof attr[col] === 'object' &&
            attr[col].hasOwnProperty &&
            attr[col].hasOwnProperty('getValue')
          )
            attr[col] = attr[col].getValue(currentTime());
          if (typeof attr[col] === 'function') continue;

          let showval = Jquery.trim(attr[col]);
          if (
            showval === null ||
            showval === '' ||
            showval === 'Null' ||
            showval === 'Unknown' ||
            showval === '0' ||
            showval.length === 0
          )
            continue; //不显示空值，更美观友好

          //han 修改样式
          // inhtml += '<div><label>' + col + '</label>' + showval + '</div>';
          const classRow = countsok % 2 === 0 ? 'singleRow' : 'doubleRow';
          inhtml += `<div class=${classRow}><label class="mars-popup-row-field">${col}</label><label class="mars-popup-row-value">${showval}</label></div>`;
          countsok++;
        } catch (e) {
          console.error(e);
        }
      }
    }
    inhtml += '</div>';

    if (countsok === 0) return false;
    return inhtml;
  } else {
    //格式化字符串
    return template(cfg, attr);
  }

  return false;
}

export function isPCBroswer() {
  let sUserAgent = navigator.userAgent.toLowerCase();

  let bIsIpad = sUserAgent.match(/ipad/i) === 'ipad';
  let bIsIphoneOs = sUserAgent.match(/iphone/i) === 'iphone';
  let bIsMidp = sUserAgent.match(/midp/i) === 'midp';
  let bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) === 'rv:1.2.3.4';
  let bIsUc = sUserAgent.match(/ucweb/i) === 'ucweb';
  let bIsAndroid = sUserAgent.match(/android/i) === 'android';
  let bIsCE = sUserAgent.match(/windows ce/i) === 'windows ce';
  let bIsWM = sUserAgent.match(/windows mobile/i) === 'windows mobile';
  if (
    bIsIpad ||
    bIsIphoneOs ||
    bIsMidp ||
    bIsUc7 ||
    bIsUc ||
    bIsAndroid ||
    bIsCE ||
    bIsWM
  ) {
    return false;
  } else {
    return true;
  }
}

//获取浏览器类型及版本
export function getExplorerInfo() {
  let explorer = window.navigator.userAgent.toLowerCase();
  //ie
  if (explorer.indexOf('msie') >= 0) {
    let ver = Number(explorer.match(/msie ([\d]+)/)[1]);
    return {
      type: 'IE',
      version: ver
    };
  }
  //firefox
  else if (explorer.indexOf('firefox') >= 0) {
    let ver = Number(explorer.match(/firefox\/([\d]+)/)[1]);
    return {
      type: 'Firefox',
      version: ver
    };
  }
  //Chrome
  else if (explorer.indexOf('chrome') >= 0) {
    let ver = Number(explorer.match(/chrome\/([\d]+)/)[1]);
    return {
      type: 'Chrome',
      version: ver
    };
  }
  //Opera
  else if (explorer.indexOf('opera') >= 0) {
    let ver = Number(explorer.match(/opera.([\d]+)/)[1]);
    return {
      type: 'Opera',
      version: ver
    };
  }
  //Safari
  else if (explorer.indexOf('Safari') >= 0) {
    let ver = Number(explorer.match(/version\/([\d]+)/)[1]);
    return {
      type: 'Safari',
      version: ver
    };
  }
  return {
    type: explorer,
    version: -1
  };
}

//检测浏览器webgl支持
export function webglreport() {
  let exinfo = getExplorerInfo();
  if (exinfo.type === 'IE' && exinfo.version < 11) {
    return false;
  }

  try {
    let glContext;
    let canvas = document.createElement('canvas');
    let requestWebgl2 = typeof WebGL2RenderingContext !== 'undefined';
    if (requestWebgl2) {
      glContext =
        canvas.getContext('webgl2') ||
        canvas.getContext('experimental-webgl2') ||
        undefined;
    }
    if (glContext === null) {
      glContext =
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl') ||
        undefined;
    }
    if (glContext === null) {
      return false;
    }
  } catch (e) {
    return false;
  }
  return true;
}

export function getProxyUrl(config) {
  if (!config.proxy || !config.url) return config;
  if (config.url instanceof Cesium.Resource) return config;

  let opts = {};
  for (let key in config) {
    if (config.hasOwnProperty(key)) {
      opts[key] = config[key];
    }
  }
  if (typeof opts.proxy === 'boolean' && opts.proxy === true) {
    opts.proxy = window.localAndProjectPath + '/proxy/proxy.jsp';
  }
  opts.url = new Cesium.Resource({
    url: opts.url,
    proxy: new Cesium.DefaultProxy(opts.proxy)
  });

  return opts;
}

export function getRootPath() {
  //获取当前网址，如： http://localhost:8080/3DMap_LJH1/proxy/proxy.jsp
  let curPath = window.document.location.href;
  //获取主机地址之后的目录，如： 3DMap_LJH1/proxy/proxy.jsp
  let pathName = window.document.location.pathname;
  let pos = curPath.indexOf(pathName);
  //获取主机地址，如： http://localhost:8080
  let localhostPaht = curPath.substring(0, pos);
  //获取带"/"的项目名，如：/3DMap_LJH1
  let projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);

  return localhostPaht + projectName;
}

//地形构造

let _ellipsoid = new Cesium.EllipsoidTerrainProvider({
  ellipsoid: Cesium.Ellipsoid.WGS84
});

//是否无地形
export function hasTerrain(viewer) {
  return !(
    viewer.terrainProvider === _ellipsoid ||
    viewer.terrainProvider instanceof Cesium.EllipsoidTerrainProvider
  );
}

export function getEllipsoidTerrain() {
  return _ellipsoid;
}

export function getTerrainProvider(cfg) {
  if (!cfg) return _ellipsoid;
  if (!cfg.hasOwnProperty('requestWaterMask')) cfg.requestWaterMask = true;
  if (!cfg.hasOwnProperty('requestVertexNormals'))
    cfg.requestVertexNormals = true;

  let terrainProvider;

  if (
    cfg.type === 'ion' ||
    cfg.url === 'ion' ||
    cfg.url === '' ||
    cfg.url === null
  ) {
    terrainProvider = new Cesium.CesiumTerrainProvider({
      url: Cesium.IonResource.fromAssetId(1)
    });
  } else if (cfg.type === 'ellipsoid' || cfg.url === 'ellipsoid') {
    terrainProvider = _ellipsoid;
  } else if (cfg.type === 'gee' || cfg.type === 'google') {
    //谷歌地球地形服务
    terrainProvider = new Cesium.GoogleEarthEnterpriseTerrainProvider({
      metadata: new Cesium.GoogleEarthEnterpriseMetadata(getProxyUrl(cfg))
    });
  } else if (cfg.type === 'arcgis') {
    //ArcGIS地形服务
    terrainProvider = new Cesium.ArcGISTiledElevationTerrainProvider(
      getProxyUrl(cfg)
    );
  } else {
    terrainProvider = new Cesium.CesiumTerrainProvider(getProxyUrl(cfg));
  }
  return terrainProvider;
}

//创建模型
export function createModel(cfg, viewer) {
  cfg = viewer.shine.point2map(cfg); //转换坐标系

  let position = Cesium.Cartesian3.fromDegrees(cfg.x, cfg.y, cfg.z || 0);

  let heading = Cesium.Math.toRadians(cfg.heading || 0);
  let pitch = Cesium.Math.toRadians(cfg.pitch || 0);
  let roll = Cesium.Math.toRadians(cfg.roll || 0);
  let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);

  let converter = cfg.converter || Cesium.Transforms.eastNorthUpToFixedFrame;
  let orientation = Cesium.Transforms.headingPitchRollQuaternion(
    position,
    hpr,
    viewer.scene.globe.ellipsoid,
    converter
  );

  let model = viewer.entities.add({
    name: cfg.name || '',
    position: position,
    orientation: orientation,
    model: cfg,
    tooltip: cfg.tooltip,
    popup: cfg.popup
  });
  return model;
}

export function formatDegree(value) {
  value = Math.abs(value);
  let v1 = Math.floor(value); //度
  let v2 = Math.floor((value - v1) * 60); //分
  let v3 = Math.round(((value - v1) * 3600) % 60); //秒
  return v1 + '° ' + v2 + "'  " + v3 + '"';
}

/**
 * 计算曲线链路的点集（a点到b点的，空中曲线）
 * @param startPoint 开始节点
 * @param endPoint 结束节点
 * @param angularityFactor 曲率
 * @param numOfSingleLine 点集数量
 * @returns {Array}
 */
export function getLinkedPointList(
  startPoint,
  endPoint,
  angularityFactor,
  numOfSingleLine
) {
  let result = [];

  let startPosition = Cesium.Cartographic.fromCartesian(startPoint);
  let endPosition = Cesium.Cartographic.fromCartesian(endPoint);

  let startLon = (startPosition.longitude * 180) / Math.PI;
  let startLat = (startPosition.latitude * 180) / Math.PI;
  let endLon = (endPosition.longitude * 180) / Math.PI;
  let endLat = (endPosition.latitude * 180) / Math.PI;

  let dist = Math.sqrt(
    (startLon - endLon) * (startLon - endLon) +
      (startLat - endLat) * (startLat - endLat)
  );

  //let dist = Cesium.Cartesian3.distance(startPoint, endPoint);
  let angularity = dist * angularityFactor;

  let startVec = Cesium.Cartesian3.clone(startPoint);
  let endVec = Cesium.Cartesian3.clone(endPoint);

  let startLength = Cesium.Cartesian3.distance(
    startVec,
    Cesium.Cartesian3.ZERO
  );
  let endLength = Cesium.Cartesian3.distance(endVec, Cesium.Cartesian3.ZERO);

  Cesium.Cartesian3.normalize(startVec, startVec);
  Cesium.Cartesian3.normalize(endVec, endVec);

  if (Cesium.Cartesian3.distance(startVec, endVec) === 0) {
    return result;
  }

  //let cosOmega = Cesium.Cartesian3.dot(startVec, endVec);
  //let omega = Math.acos(cosOmega);

  let omega = Cesium.Cartesian3.angleBetween(startVec, endVec);

  result.push(startPoint);
  for (let i = 1; i < numOfSingleLine - 1; i++) {
    let t = (i * 1.0) / (numOfSingleLine - 1);
    let invT = 1 - t;

    let startScalar = Math.sin(invT * omega) / Math.sin(omega);
    let endScalar = Math.sin(t * omega) / Math.sin(omega);

    let startScalarVec = Cesium.Cartesian3.multiplyByScalar(
      startVec,
      startScalar,
      new Cesium.Cartesian3()
    );
    let endScalarVec = Cesium.Cartesian3.multiplyByScalar(
      endVec,
      endScalar,
      new Cesium.Cartesian3()
    );

    let centerVec = Cesium.Cartesian3.add(
      startScalarVec,
      endScalarVec,
      new Cesium.Cartesian3()
    );

    let ht = t * Math.PI;
    let centerLength =
      startLength * invT + endLength * t + Math.sin(ht) * angularity;
    centerVec = Cesium.Cartesian3.multiplyByScalar(
      centerVec,
      centerLength,
      centerVec
    );

    result.push(centerVec);
  }

  result.push(endPoint);

  return result;
}

// determine if polygon ring coordinates are clockwise. clockwise signifies outer ring, counter-clockwise an inner ring
// or hole. this logic was found at http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-
// points-are-in-clockwise-order
//ringToPoints 数据格式支持Cartesian3数组、Cartographic数组以及[经度][维度]普通数组
//顺时针是 true
export function ringIsClockwise(ringToPoints) {
  if (!ringToPoints || !ringToPoints.length) return undefined;
  let ringToTest = undefined;
  if (ringToPoints[0] instanceof Cesium.Cartesian3) {
    let cartographicPositions =
      Cesium.Ellipsoid.WGS84.cartesianArrayToCartographicArray(ringToPoints);
    let cartographicPointsArray = [];
    for (let i = 0; i < cartographicPositions.length; i++) {
      let cartographicPoint = cartographicPositions[i];
      let point = [2];
      point[0] = cartographicPoint.longitude;
      point[1] = cartographicPoint.latitude;
      cartographicPointsArray.push(point);
    }
    ringToTest = cartographicPointsArray;
  }
  if (ringToPoints[0] instanceof Cesium.Cartographic) {
    let cartographicPointsArray2;
    cartographicPointsArray2 = [];
    for (let j = 0; j < ringToPoints.length; j++) {
      let cartographicPoint2 = ringToPoints[j];
      let point = [2];
      point[0] = cartographicPoint2.longitude;
      point[1] = cartographicPoint2.latitude;
      cartographicPointsArray2.push(point);
    }
    ringToTest = cartographicPointsArray2;
  }

  if (typeof ringToTest === 'undefined') ringToTest = ringToPoints.slice(0);

  let rLength = ringToTest.length;
  let signedArea =
    ringToTest[0][1] * (ringToTest[rLength - 1][0] - ringToTest[1][0]);
  ringToTest[rLength] = ringToTest[0];
  for (let i = 1; i < rLength; ++i) {
    signedArea +=
      ringToTest[i][1] * (ringToTest[i - 1][0] - ringToTest[i + 1][0]);
  }
  return signedArea * 0.5 < 0;
}

//=====================兼容历史版本=====================
export const terrainPolyline = PointTerrainPolyline;
