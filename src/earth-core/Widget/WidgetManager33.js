/* eslint-disable no-prototype-builtins */
/*
 * @Author: liujh
 * @Date: 2020/10/9 10:22
 * @Description:
 */
/* 33 */
/***/

import Jquery from 'jquery';
import { Loader } from '../Tool/Loader34';

//widget模块公共处理类，勿轻易修改

let basePath = ''; //widgets目录统一前缀，如果widgets目录不在当前页面的同级目录，在其他处时可以传入basePath参数，参数值为：widgets目录相对于当前页面的路径
let defoptions;
let cacheVersion;
let isdebuger;

let thismap;
let widgetsdata = [];

//初始化插件
function init(map, widgetcfg, _basePath) {
  thismap = map;
  widgetcfg = widgetcfg || {};
  basePath = _basePath || '';
  //debugger
  widgetsdata = [];
  defoptions = widgetcfg.defaultOptions || {
    windowOptions: {
      position: 'rt',
      maxmin: false,
      resize: true
    },
    autoDisable: true,
    disableOhter: true
  };

  //cacheVersion = widgetcfg.version;
  //if (cacheVersion == "time") cacheVersion = new Date().getTime();

  //将自启动的加入
  let arrtemp = widgetcfg.widgetsAtStart;
  if (arrtemp && arrtemp.length > 0) {
    for (let i = 0; i < arrtemp.length; i++) {
      let item = arrtemp[i];
      if (!item.hasOwnProperty('uri') || item.uri === '') {
        // console.log('widget未配置uri：' + JSON.stringify(item));
        continue;
      }
      if (item.hasOwnProperty('visible') && !item.visible) continue;

      item.autoDisable = false;
      item.openAtStart = true;
      item._nodebug = true;

      bindDefOptions(item);
      widgetsdata.push(item);

      //done @wtt for switching ipad mode
      if (/paidTool/gi.test(item.uri) && item.launchIpadMode) {
        arrtemp.map(function (value /* index, obj */) {
          if (/toolbarright/gi.test(value.uri)) {
            value.disableThis = true;
          }
        });
      }
    }
  }

  //显示测试栏
  //为了方便测试，所有widget会在页面下侧生成一排按钮，每个按钮对应一个widget，单击后激活对应widget
  isdebuger = widgetcfg['debugger'];
  if (isdebuger) {
    let inhtml =
      '<div id="widget-testbar" class="widgetbar animation-slide-bottom no-print-view" > ' +
      '     <div style="height: 30px; line-height:30px;"><b style="color: #4db3ff;">widget测试栏</b>&nbsp;&nbsp;<button  id="widget-testbar-remove"  type="button" class="btn btn-link btn-xs">关闭</button> </div>' +
      '     <button id="widget-testbar-disableAll" type="button" class="btn btn-info" ><i class="fa fa-globe"></i>漫游</button>' +
      '</div>';
    Jquery('body').append(inhtml);

    Jquery('#widget-testbar-remove').click(function () {
      removeDebugeBar();
    });
    Jquery('#widget-testbar-disableAll').click(function () {
      disableAll();
    });
  }

  //将配置的加入
  arrtemp = widgetcfg.widgets;
  if (arrtemp && arrtemp.length > 0) {
    for (let i = 0; i < arrtemp.length; i++) {
      let item = arrtemp[i];
      if (item.type === 'group') {
        let inhtml =
          ' <div class="btn-group dropup">  <button type="button" class="btn btn-primary dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i class="fa fa-align-justify"></i>' +
          item.name +
          ' <span class="caret"></span></button> <ul class="dropdown-menu">';
        for (let j = 0; j < item.children.length; j++) {
          let childItem = item.children[j];
          if (!childItem.hasOwnProperty('uri') || childItem.uri === '') {
            // console.log('widget未配置uri：' + JSON.stringify(childItem));
            continue;
          }

          inhtml +=
            ' <li data-widget="' +
            childItem.uri +
            '" class="widget-btn" ><a href="#"><i class="fa fa-star"></i>' +
            childItem.name +
            '</a></li>';

          bindDefOptions(childItem);
          widgetsdata.push(childItem); //将配置的加入
        }
        inhtml += '</ul></div>';

        if (isdebuger && !item._nodebug) {
          Jquery('#widget-testbar').append(inhtml);
        }
      } else {
        if (!item.hasOwnProperty('uri') || item.uri === '') {
          //   console.log('widget未配置uri：' + JSON.stringify(item));
          continue;
        }

        //显示测试栏
        if (isdebuger && !item._nodebug) {
          let inhtml =
            '<button type="button" class="btn btn-primary widget-btn" data-widget="' +
            item.uri +
            '"  > <i class="fa fa-globe"></i>' +
            item.name +
            ' </button>';
          Jquery('#widget-testbar').append(inhtml);
        }

        bindDefOptions(item);
        widgetsdata.push(item); //将配置的加入
      }
    }

    if (isdebuger) {
      Jquery('#widget-testbar .widget-btn').each(function () {
        Jquery(this).click(function () {
          let uri = Jquery(this).attr('data-widget');
          if (uri == null || uri === '') return;

          if (isActivate(uri)) {
            disable(uri);
          } else {
            activate(uri);
          }
        });
      });
    }
  }

  for (let i = 0; i < widgetsdata.length; i++) {
    let item = widgetsdata[i];

    if (item.openAtStart || item.createAtStart) {
      _arrLoadWidget.push(item);
    }
  }

  Jquery(window).resize(function () {
    for (let i = 0; i < widgetsdata.length; i++) {
      let item = widgetsdata[i];
      if (item._class) {
        item._class.indexResize(); //BaseWidget: indexResize
      }
    }
  });

  if (isdebuger) {
    let hash = getLocationParam();
    if (hash) {
      activate(hash);
    }
  }

  loadWidgetJs();
}

function getDefWindowOptions() {
  return clone(defoptions.windowOptions);
}

function clone(from, to) {
  if (
    from == null ||
    (typeof from === 'undefined' ? 'undefined' : typeof from) !== 'object'
  )
    return from;
  if (from.constructor !== Object && from.constructor !== Array) return from;
  if (
    from.constructor === Date ||
    from.constructor === RegExp ||
    from.constructor === Function ||
    from.constructor === String ||
    from.constructor === Number ||
    from.constructor === Boolean
  )
    return new from.constructor(from);

  to = to || new from.constructor();

  for (let name in from) {
    if (from.hasOwnProperty(name)) {
      to[name] =
        typeof to[name] == 'undefined' ? clone(from[name], null) : to[name];
    }
  }

  return to;
}

function getLocationParam() {
  let param = window.location.toString();
  if (param.indexOf('#') === -1) {
    return '';
  }
  param = param.split('#');
  if (param && param.length > 0) {
    return param[1];
  }
}

function bindDefOptions(item) {
  //赋默认值至options（跳过已存在设置值）
  if (defoptions) {
    for (let aa in defoptions) {
      if (defoptions.hasOwnProperty(aa)) {
        if (aa === 'windowOptions') {
          //for (let jj in defoptions["windowOptions"]) {
          //    if (!item["windowOptions"].hasOwnProperty(jj)) {
          //        item["windowOptions"][jj] = defoptions["windowOptions"][jj];
          //    }
          //}
        } else if (!item.hasOwnProperty(aa)) {
          item[aa] = defoptions[aa];
        }
      }
    }
  }

  //赋值内部使用属性
  item.path = getFilePath(basePath + item.uri);
  item.name = item.name || item.label; //兼容name和label命名
}

//激活指定模块
function activate(item, noDisableOther) {
  if (thismap == null && item.viewer) {
    init(item.viewer);
  }

  //参数是字符串id或uri时
  if (typeof item === 'string') {
    item = {
      uri: item
    };

    if (noDisableOther != null) item.disableOhter = !noDisableOther; //是否释放其他已激活的插件
  } else {
    if (item.uri == null) {
      console.error('activate激活widget时需要uri参数！');
    }
  }

  let thisItem;
  for (let i = 0; i < widgetsdata.length; i++) {
    let othitem = widgetsdata[i];
    if (item.uri === othitem.uri || (othitem.id && item.uri === othitem.id)) {
      thisItem = othitem;
      if (thisItem.isloading) return thisItem; //激活了正在loading的widget 防止快速双击了菜单

      //赋值
      for (let aa in item) {
        if (item.hasOwnProperty(aa)) {
          if (aa === 'uri') continue;
          thisItem[aa] = item[aa];
        }
      }

      break;
    }
  }
  if (thisItem == null) {
    bindDefOptions(item);
    thisItem = item;
    //非config中配置的，外部传入，首次激活
    widgetsdata.push(item);
  }

  if (isdebuger) {
    // console.log('开始激活widget：' + thisItem.uri);
    window.location.hash = '#' + thisItem.uri;
  }

  //释放其他已激活的插件
  if (thisItem.disableOhter) {
    disableAll(thisItem.uri, thisItem.group);
  } else {
    disableGroup(thisItem.group, thisItem.uri);
  }

  //激活本插件
  if (thisItem._class) {
    if (thisItem._class.isActivate) {
      //已激活时
      if (thisItem._class.update) {
        //刷新
        thisItem._class.update();
      } else {
        //重启
        thisItem._class.disableBase();
        let timetemp = setInterval(function () {
          if (thisItem._class.isActivate) return;
          thisItem._class.activateBase();
          clearInterval(timetemp);
        }, 200);
      }
    } else {
      thisItem._class.activateBase(); // BaseWidget: activateBase
    }
  } else {
    for (let i = 0; i < _arrLoadWidget.length; i++) {
      if (_arrLoadWidget[i].uri === thisItem.uri)
        //如果已在加载列表中的直接跳出
        return _arrLoadWidget[i];
    }
    _arrLoadWidget.push(thisItem);

    if (_arrLoadWidget.length === 1) {
      loadWidgetJs();
    }
  }
  return thisItem;
}

function getWidget(id) {
  for (let i = 0; i < widgetsdata.length; i++) {
    let item = widgetsdata[i];

    if (id === item.uri || id === item.id) {
      return item;
    }
  }
}

function getClass(id) {
  let item = getWidget(id);
  if (item) return item._class;
  else return null;
}

function isActivate(id) {
  let _class = getClass(id);
  if (_class == null) return false;
  return _class.isActivate;
}

function disable(id) {
  if (id == null) return;
  for (let i = 0; i < widgetsdata.length; i++) {
    let item = widgetsdata[i];

    if (item._class && (id === item.uri || id === item.id)) {
      item._class.disableBase();
      break;
    }
  }
}

//释放所有widget
function disableAll(nodisable, group) {
  for (let i = 0; i < widgetsdata.length; i++) {
    let item = widgetsdata[i];

    if (group && item.group === group) {
      //同组别的全部释放
    } else {
      if (!item.autoDisable) continue;
    }

    //指定不释放的跳过
    if (nodisable && (nodisable === item.uri || nodisable === item.id))
      continue;

    if (item._class) {
      if (/roamfly|roamPoint/gi.test(item.uri)) continue; //DONE wtt
      item._class.disableBase(); ////BaseWidget: disableBase
    }
  }
}

//释放同组widget
function disableGroup(group, nodisable) {
  if (group == null) return;

  for (let i = 0; i < widgetsdata.length; i++) {
    let item = widgetsdata[i];
    if (item.group === group) {
      //指定不释放的跳过
      if (nodisable && (nodisable === item.uri || nodisable === item.id))
        continue;
      if (item._class) {
        item._class.disableBase(); ////BaseWidget: disableBase
      }
    }
  }
}

function eachWidget(calback) {
  for (let i = 0; i < widgetsdata.length; i++) {
    let item = widgetsdata[i];
    calback(item);
  }
}

let _arrLoadWidget = [];
let loadItem;
let isloading;

function loadWidgetJs() {
  if (_arrLoadWidget.length === 0) return;

  if (isloading) {
    setTimeout(loadWidgetJs, 500);
    return;
  }
  isloading = true;

  loadItem = _arrLoadWidget[0];
  loadItem.isloading = true;
  let _uri = loadItem.uri;
  /*    if (cacheVersion) {
            if (_uri.indexOf("?") == -1) _uri += "?time=" + cacheVersion;
            else _uri += "&time=" + cacheVersion;
        }*/

  if (window.NProgress) {
    window.NProgress.start();
  }

  if (isdebuger) console.warn('开始加载js：' + basePath + _uri);

  Loader.async([basePath + _uri], function () {
    isloading = false;
    loadItem.isloading = false;
    if (isdebuger) console.warn('完成js加载：' + basePath + _uri);

    if (window.NProgress) {
      window.NProgress.done(true);
    }

    _arrLoadWidget.shift();
    loadWidgetJs();
  });
}

function bindClass(_class) {
  //debugger
  if (loadItem == null) {
    let _jspath = getThisJSPath();
    for (let i = 0; i < widgetsdata.length; i++) {
      let item = widgetsdata[i];
      if (_jspath.endsWith(item.uri)) {
        item.isloading = false;
        item._class = new _class(item, thismap);
        item._class.activateBase(); // BaseWidget: activateBase
        return item._class;
      }
    }
  } else {
    loadItem.isloading = false;
    loadItem._class = new _class(loadItem, thismap);
    loadItem._class.activateBase(); // BaseWidget: activateBase
    return loadItem._class;
  }
}

function getThisJSPath() {
  let jsPath;
  let js = document.scripts;
  for (let i = js.length - 1; i >= 0; i--) {
    jsPath = js[i].src;
    if (jsPath == null || jsPath === '') continue;
    if (jsPath.indexOf('widgets') === -1) continue;
    //jsPath = jsPath.substring(0, jsPath.lastIndexOf("/") + 1);
    return jsPath;
  }
  return '';
}

//获取路径
function getFilePath(file) {
  let pos = file.lastIndexOf('/');
  return file.substring(0, pos + 1);
}

function removeDebugeBar() {
  Jquery('#widget-testbar').remove();
}

function getCacheVersion() {
  return cacheVersion;
}

function getBasePath() {
  return basePath;
}

export {
  init,
  getDefWindowOptions,
  activate,
  getWidget,
  getClass,
  isActivate,
  disable,
  disableAll,
  disableGroup,
  eachWidget,
  bindClass,
  removeDebugeBar,
  getCacheVersion,
  getBasePath
};
