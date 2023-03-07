/* eslint-disable no-prototype-builtins */
/*
 * @Author: liujh
 * @Date: 2020/10/9 10:24
 * @Description:
 */
/* 60 */
/***/

import Jquery from 'jquery';
//import ztree from "lib/jquery/ztree/jquery.ztree.all.min"
import { Class } from '../Tool/Class13';
import * as DrawUtil from '../Tool/Util3';
import { Loader } from '../Tool/Loader34';
import * as WidgetManager from './WidgetManager33';
//import layer from "lib/layer/layer"
import layer from 'layer';

window.layer = layer;
let _resources_cache = [];
const BaseWidget = Class.extend({
  viewer: null,
  options: {},
  config: {}, //配置的config信息
  path: '', //当前widget目录相对路径
  isActivate: false, //是否激活状态
  isCreate: false,
  initialize: function initialize(cfg, map) {
    this.viewer = map;
    this.config = cfg;
    this.path = cfg.path || '';
    this.init();
  },
  addCacheVersion: function addCacheVersion(_resource) {
    if (_resource == null) return _resource;

    let cacheVersion = WidgetManager.getCacheVersion();
    if (cacheVersion) {
      if (_resource.indexOf('?') == -1) _resource += '?time=' + cacheVersion;
      else if (_resource.indexOf('time=' + cacheVersion) == -1)
        _resource += '&time=' + cacheVersion;
    }
    return _resource;
  },
  //激活插件
  activateBase: function activateBase() {
    let that = this;

    if (this.isActivate) {
      //已激活状态时跳出
      this.changeWidgetView(function (viewopt) {
        if (viewopt._dom) {
          //将层置顶
          Jquery('.layui-layer').each(function () {
            Jquery(this).css('z-index', 19891000);
          });
          Jquery(viewopt._dom).css('z-index', 19891014);
        }
      });
      return;
    }

    this.beforeActivate();
    this.isActivate = true;
    //console.log("激活widget:" + this.config.uri);

    if (!this.isCreate) {
      //首次进行创建
      if (this.options.resources && this.options.resources.length > 0) {
        let resources = [];

        for (let i = 0; i < this.options.resources.length; i++) {
          let _resource = this.options.resources[i];
          _resource = this._getUrl(_resource);

          if (_resources_cache.indexOf(_resource) != -1) continue; //不加重复资源

          resources.push(_resource);
        }
        _resources_cache = _resources_cache.concat(resources); //不加重复资源

        Loader.async(resources, function () {
          let result = that.create(function () {
            that._createWidgetView();
            that.isCreate = true;
          });
          if (result) return;
          if (that.config.createAtStart) {
            that.config.createAtStart = false;
            that.isActivate = false;
            that.isCreate = true;
            return;
          }
          that._createWidgetView();
          that.isCreate = true;
        });
        return;
      } else {
        let result = this.create(function () {
          that._createWidgetView();
          this.isCreate = true;
        });
        if (result) return;
        if (that.config.createAtStart) {
          that.config.createAtStart = false;
          that.isActivate = false;
          that.isCreate = true;
          return;
        }
      }
      this.isCreate = true;
    }
    this._createWidgetView();

    return this;
  },
  //创建插件的view
  _createWidgetView: function _createWidgetView() {
    let viewopt = this.options.view;
    if (viewopt === undefined || viewopt === null) {
      this._startActivate();
    } else if (DrawUtil.isArray(viewopt)) {
      this._viewcreate_allcount = viewopt.length;
      this._viewcreate_okcount = 0;

      for (let i = 0; i < viewopt.length; i++) {
        this.createItemView(viewopt[i]);
      }
    } else {
      this._viewcreate_allcount = 1;
      this._viewcreate_okcount = 0;
      this.createItemView(viewopt);
    }
  },
  changeWidgetView: function changeWidgetView(calback) {
    let viewopt = this.options.view;
    if (viewopt === undefined || viewopt === null) {
      return false;
    } else if (DrawUtil.isArray(viewopt)) {
      let hascal = false;
      for (let i = 0; i < viewopt.length; i++) {
        hascal = hascal || calback(viewopt[i]);
      }
      return hascal;
    } else {
      return calback(viewopt);
    }
  },
  createItemView: function createItemView(viewopt) {
    switch (viewopt.type) {
      default:
      case 'window':
        this._openWindow(viewopt);
        break;
      case 'divwindow':
        this._openDivWindow(viewopt);
        break;
      case 'append': {
        let view_url = this._getUrl(viewopt.url);
        let that = this;
        that.getHtml(view_url, function (html) {
          that._appendView(viewopt, html);
        });
        break;
      }

      case 'custom': {
        //自定义
        let view_url = this._getUrl(viewopt.url);

        let that = this;
        viewopt.open(
          view_url,
          function (html) {
            that.winCreateOK(viewopt, html);

            that._viewcreate_okcount++;
            if (that._viewcreate_okcount >= that._viewcreate_allcount) {
              that._startActivate(html);
            }
          },
          this
        );
        break;
      }
    }
  },
  _viewcreate_allcount: 0,
  _viewcreate_okcount: 0,
  //==============layer弹窗=================
  _openWindow: function _openWindow(viewopt) {
    let that = this;
    let view_url = this._getUrl(viewopt.url);

    let opts = {
      type: 2,
      content: [view_url, 'no'],
      success: function success(layero, index) {
        viewopt._layerOpening = false;
        viewopt._dom = layero;

        //得到iframe页的窗口对象，执行iframe页的方法：viewWindow.method();
        let viewWindow = window[layero.find('iframe')[0]['name']];

        //隐藏弹窗
        if (that.config.hasOwnProperty('visible') && !that.config.visible)
          Jquery(layero).hide();

        layer.setTop(layero);
        that.winCreateOK(viewopt, viewWindow);

        that._viewcreate_okcount++;
        if (that._viewcreate_okcount >= that._viewcreate_allcount)
          that._startActivate(layero);
        //DONE wtt
        let minBtn = layero.find('.minWin');
        if (minBtn.length != 0) {
          //bind min&restore events to this layer
          let $min = layero.find('.minWin'),
            $restore = layero.find('.restoreWin');
          $min.on('click', () => {
            layer.min(index, { useOriginalPosition: true });
            $min.hide();
            $restore.show();
          });
          $restore.on('click', () => {
            layer.restore(index);
            //防止宽度恢复时有问题，如飞行漫游的宽度有问题
            layero
              .children('.layui-layer-content,.layui-layer-title')
              .css('width', 'inherit');
            $restore.hide();
            $min.show();
          });
          Jquery('.minWin,.restoreWin').on('mousedown', function (e) {
            e.stopPropagation();
          });
        }
        //通知页面,页面需要定义initWidgetView方法

        if (viewWindow && viewWindow.initWidgetView)
          (that.layerIndex = index), viewWindow.initWidgetView(that);
        else
          console.error(
            '' +
              view_url +
              '页面没有定义function initWidgetView(widget)方法，无法初始化widget页面!'
          );
      }
    };
    if (viewopt._layerIdx > 0) {
      //debugger
    }

    viewopt._layerOpening = true;
    viewopt._layerIdx = layer.open(this._getWinOpt(viewopt, opts));
    //DONE wtt
    if (/roamline/gi.test(view_url)) {
      postMessage({ layerIndex: viewopt._layerIdx });
    }
  },
  _openDivWindow: function _openDivWindow(viewopt) {
    //let view_url = "src/lib/widgets/"+this._getUrl(viewopt.url);
    // let view_url = '@/lib/widgets/' + this._getUrl(viewopt.url);
    //div弹窗
    let that = this;
    let data = document.getElementsByClassName('CesiumViewer');
    let layero = data[0].innerHTML;
    viewopt._layerOpening = false;
    //let layero1= document.getElementsByClassName("CesiumViewer")
    viewopt._dom = layero;

    //隐藏弹窗
    if (that.config.hasOwnProperty('visible') && !that.config.visible)
      Jquery(layero).hide();
    //layer.setTop(layero);
    that.winCreateOK(viewopt, layero);

    that._viewcreate_okcount++;
    if (that._viewcreate_okcount >= that._viewcreate_allcount)
      that._startActivate(layero);
    viewopt._layerOpening = true;
    // let test1 = that._getWinOpt(viewopt);
    //viewopt._layerIdx = layer.open(that._getWinOpt(viewopt, opts));

    // let test2 = layer.open(test1)
    let test2 = 1;
    viewopt._layerIdx = test2;
    /*this.getHtml(view_url, function (data) {
            let opts = {
                type: 1,
                //content: data,
                content: data[0].innerHTML,
                success: function success(layero) {
                    viewopt._layerOpening = false;
                    //let layero1= document.getElementsByClassName("CesiumViewer")
                    viewopt._dom = layero;

                    //隐藏弹窗
                    if (that.config.hasOwnProperty("visible") && !that.config.visible) Jquery(layero).hide();
debugger
                   // layer.setTop(layero);
                    that.winCreateOK(viewopt, layero);

                    that._viewcreate_okcount++;
                    if (that._viewcreate_okcount >= that._viewcreate_allcount) that._startActivate(layero);
                }
            };
            viewopt._layerOpening = true;
            let test1 = that._getWinOpt(viewopt, opts)
            //viewopt._layerIdx = layer.open(that._getWinOpt(viewopt, opts));
            debugger
            let test2 = layer.open(test1)
            viewopt._layerIdx = test2;
        });*/
  },
  _getUrl: function _getUrl(url) {
    url = this.addCacheVersion(url);

    if (url.startsWith('/') || url.startsWith('.') || url.startsWith('http'))
      return url;
    else return this.path + url;
  },
  _getWinOpt: function _getWinOpt(viewopt, opts) {
    //优先使用cofig中配置，覆盖js中的定义
    let def = WidgetManager.getDefWindowOptions();
    let windowOptions = Jquery.extend(def, viewopt.windowOptions);
    windowOptions = Jquery.extend(windowOptions, this.config.windowOptions);
    viewopt.windowOptions = windowOptions; //赋值

    let that = this,
      name = this.config.name;
    let _size = this._getWinSize(windowOptions);
    if (windowOptions.justMin == undefined || windowOptions.justMin == true) {
      let winset =
        '<i class="fa fa-window-minimize fa-1 minWin"></i><i class="fa fa-window-restore fa-1 restoreWin"></i>';
      let titleStyle =
        'padding:0 32px 0 10px;display:flex;justify-content:space-between;align-items:center;';
      name = [name + winset, titleStyle];
    }

    //默认值
    let defOpts = {
      title: windowOptions.noTitle ? false : name || ' ',
      area: _size.area,
      offset: _size.offset,
      shade: 0,
      maxmin: false,
      zIndex: 1,
      beforeEnd: function beforeEnd() {
        that.beforeDisable();
      },
      end: function end() {
        // 销毁后触发的回调
        viewopt._layerIdx = -1;
        viewopt._dom = null;
        that.disableBase(true);
      },
      full: function full(dom) {
        //最大化后触发的回调
        that.winFull(dom);
      },
      min: function min(dom) {
        //最小化后触发的回调
        that.winMin(dom);
      },
      restore: function restore(dom) {
        //还原 后触发的回调
        that.winRestore(dom);
      }
    };
    let cfgOpts = Jquery.extend(defOpts, windowOptions);
    return Jquery.extend(cfgOpts, opts || {});
  },
  //计算弹窗大小和位置
  _getWinSize: function _getWinSize(windowOptions) {
    //获取高宽
    let _width = this.bfb2Number(
      windowOptions.width,
      document.documentElement.clientWidth,
      windowOptions
    );
    let _height = this.bfb2Number(
      windowOptions.height,
      document.documentElement.clientHeight,
      windowOptions
    );

    //计算位置offset
    let offset = '';
    let position = windowOptions.position;
    if (position) {
      if (typeof position == 'string') {
        //t顶部,b底部,r右边缘,l左边缘,lt左上角,lb左下角,rt右上角,rb右下角
        offset = position;
      } else if (
        (typeof position === 'undefined' ? 'undefined' : typeof position) ==
        'object'
      ) {
        let _top;
        let _left;

        if (position.hasOwnProperty('top') && position.top != null) {
          _top = this.bfb2Number(
            position.top,
            document.documentElement.clientHeight,
            windowOptions
          );
        }
        if (position.hasOwnProperty('bottom') && position.bottom != null) {
          windowOptions._hasresize = true;

          let _bottom = this.bfb2Number(
            position.bottom,
            document.documentElement.clientHeight,
            windowOptions
          );

          if (_top != null) {
            _height = document.documentElement.clientHeight - _top - _bottom;
          } else {
            _top = document.documentElement.clientHeight - _height - _bottom;
          }
        }

        if (position.hasOwnProperty('left') && position.left != null) {
          _left = this.bfb2Number(
            position.left,
            document.documentElement.clientWidth,
            windowOptions
          );
        }
        if (position.hasOwnProperty('right') && position.right != null) {
          windowOptions._hasresize = true;
          let _right = this.bfb2Number(
            position.right,
            document.documentElement.clientWidth,
            windowOptions
          );

          if (_left != null) {
            _width = document.documentElement.clientWidth - _left - _right;
          } else {
            _left = document.documentElement.clientWidth - _width - _right;
          }
        }

        if (_top == null)
          _top = (document.documentElement.clientHeight - _height) / 2;
        if (_left == null)
          _left = (document.documentElement.clientWidth - _width) / 2;

        offset = [_top + 'px', _left + 'px'];
      }
    }

    //最大最小高度判断
    if (
      windowOptions.hasOwnProperty('minHeight') &&
      _height < windowOptions.minHeight
    ) {
      windowOptions._hasresize = true;
      _height = windowOptions.minHeight;
    }
    if (
      windowOptions.hasOwnProperty('maxHeight') &&
      _height > windowOptions.maxHeight
    ) {
      windowOptions._hasresize = true;
      _height = windowOptions.maxHeight;
    }

    //最大最小宽度判断
    if (
      windowOptions.hasOwnProperty('minHeight') &&
      _width < windowOptions.minWidth
    ) {
      windowOptions._hasresize = true;
      _width = windowOptions.minWidth;
    }
    if (
      windowOptions.hasOwnProperty('maxWidth') &&
      _width > windowOptions.maxWidth
    ) {
      windowOptions._hasresize = true;
      _width = windowOptions.maxWidth;
    }

    let area;
    if (_width && _height) area = [_width + 'px', _height + 'px'];
    else area = _width + 'px';

    return {
      area: area,
      offset: offset
    };
  },
  bfb2Number: function bfb2Number(str, allnum, windowOptions) {
    if (typeof str == 'string' && str.indexOf('%') != -1) {
      windowOptions._hasresize = true;

      return (allnum * Number(str.replace('%', ''))) / 100;
    }
    return str;
  },
  //==============直接添加到index上=================
  _appendView: function _appendView(viewopt, html) {
    viewopt._dom = Jquery(html).appendTo(viewopt.parent || 'body');

    this.winCreateOK(viewopt, html);

    this._viewcreate_okcount++;
    if (this._viewcreate_okcount >= this._viewcreate_allcount)
      this._startActivate(html);
  },

  //释放插件
  disableBase: function disableBase(nobefore) {
    if (!this.isActivate) return;

    if (!nobefore) this.beforeDisable();

    let has = this.changeWidgetView(function (viewopt) {
      if (viewopt._layerIdx != null && viewopt._layerIdx != -1) {
        if (viewopt._layerOpening) {
          //窗口还在加载中
          //console.log("释放widget窗口还在加载中:" + viewopt._layerIdx);
        }
        layer.close(viewopt._layerIdx);
        return true;
      } else {
        if (viewopt.type == 'append' && viewopt._dom) {
          viewopt._dom.remove();
          viewopt._dom = null;
        }
        if (viewopt.type == 'custom' && viewopt.close) {
          viewopt.close();
        }
        return false;
      }
    });
    if (has) return;

    this.disable();
    this.isActivate = false;
    //console.log("释放widget:" + this.config.uri);
  },
  //设置view弹窗的显示和隐藏
  setViewVisible: function setViewVisible(visible) {
    this.changeWidgetView(function (viewopt) {
      if (viewopt._layerIdx != null && viewopt._layerIdx != -1) {
        if (visible) {
          Jquery('#layui-layer' + viewopt._layerIdx).show();
        } else {
          Jquery('#layui-layer' + viewopt._layerIdx).hide();
        }
      } else if (viewopt.type == 'append' && viewopt._dom) {
        if (visible) Jquery(viewopt._dom).show();
        else Jquery(viewopt._dom).hide();
      }
    });
  },
  //设置view弹窗的css
  setViewCss: function setViewCss(style) {
    this.changeWidgetView(function (viewopt) {
      if (viewopt._layerIdx != null && viewopt._layerIdx != -1) {
        Jquery('#layui-layer' + viewopt._layerIdx).css(style);
      } else if (viewopt.type == 'append' && viewopt._dom) {
        Jquery(viewopt._dom).css(style);
      }
    });
  },
  //主窗体改变大小后触发
  indexResize: function indexResize() {
    if (!this.isActivate) return;

    let that = this;
    this.changeWidgetView(function (viewopt) {
      if (
        viewopt._layerIdx == null ||
        viewopt._layerIdx == -1 ||
        viewopt.windowOptions == null ||
        !viewopt.windowOptions._hasresize
      )
        return;

      let _size = that._getWinSize(viewopt.windowOptions);
      let _style = {
        width: _size.area[0],
        height: _size.area[1],
        top: _size.offset[0],
        left: _size.offset[1]
      };
      Jquery(viewopt._dom).attr('myTopLeft', true);

      layer.style(viewopt._layerIdx, _style);

      if (viewopt.type == 'divwindow') layer.iframeAuto(viewopt._layerIdx);
    });
  },
  _startActivate: function _startActivate(layero) {
    this.activate(layero);
    if (this.config.success) {
      this.config.success(this);
    }
    if (!this.isActivate) {
      //窗口打开中没加载完成时，被释放
      this.disableBase();
    }
  },
  //子类继承后覆盖
  init: function init() {},
  //子类继承后覆盖
  create: function create(/* endfun */) {},
  //子类继承后覆盖
  beforeActivate: function beforeActivate() {},
  activate: function activate(/* layero */) {},

  //子类继承后覆盖
  beforeDisable: function beforeDisable() {},
  disable: function disable() {},

  //子类继承后覆盖
  winCreateOK: function winCreateOK(/* opt, result */) {},
  //窗口最大化后触发
  winFull: function winFull() {},
  //窗口最小化后触发
  winMin: function winMin() {},
  //窗口还原 后触发
  winRestore: function winRestore() {},

  //公共方法
  getHtml: function getHtml(url, callback) {
    Jquery.ajax({
      url: url,
      type: 'GET',
      dataType: 'html',
      timeout: 0, //永不超时
      success: function success(/* data */) {
        let a = document.getElementsByClassName('CesiumViewer');
        callback(a);
      }
    });
  }
});
export { BaseWidget };
