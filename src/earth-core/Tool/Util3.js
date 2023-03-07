/*
 * @Author: liujh
 * @Date: 2020/8/21 17:08
 * @Description:
 */
/* 3 */
/***/
import * as Cesium from 'cesium_shinegis_earth';
import * as util from './Util1';

export let freeze = Object.freeze;
Object.freeze = function (obj) {
  return obj;
};

// @function create(proto: Object, properties?: Object): Object
// Compatibility polyfill for [Object.create](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
export let create =
  Object.create ||
  (function () {
    function F() {}

    return function (proto) {
      F.prototype = proto;
      return new F();
    };
  })();

// @function extend(dest: Object, src?: Object): Object
// Merges the properties of the `src` object (or multiple objects) into `dest` object and returns the latter. Has an `L.extend` shortcut.
export function extend(dest) {
  let i, j, len, src;

  for (j = 1, len = arguments.length; j < len; j++) {
    src = arguments[j];
    for (i in src) {
      if (Object.hasOwnProperty.call(src, i)) {
        dest[i] = src[i];
      }
    }
  }
  return dest;
}

// @function bind(fn: Function, …): Function
// Returns a new function bound to the arguments passed, like [Function.prototype.bind](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/bind).
export function bind(fn, obj) {
  let slice = Array.prototype.slice;

  if (fn.bind) {
    return fn.bind.apply(fn, slice.call(arguments, 1));
  }

  let args = slice.call(arguments, 2);

  return function () {
    return fn.apply(
      obj,
      args.length ? args.concat(slice.call(arguments)) : arguments
    );
  };
}

// @property lastId: Number
// Last unique ID used by [`stamp()`](#util-stamp)
export let lastId = 0;

// @function stamp(obj: Object): Number
// Returns the unique ID of an object, assigning it one if it doesn't have it.
export function stamp(obj) {
  /*eslint-disable */
    obj._leaflet_id = obj._leaflet_id || (exports.lastId = lastId += 1)
    return obj._leaflet_id
    /* eslint-enable */
}

// @function throttle(fn: Function, time: Number, context: Object): Function
// Returns a function which executes function `fn` with the given scope `context`
// (so that the `this` keyword refers to `context` inside `fn`'s code). The function
// `fn` will be called no more than one time per given amount of `time`. The arguments
// received by the bound function will be any arguments passed when binding the
// function, followed by any arguments passed when invoking the bound function.
export function throttle(fn, time, context) {
  let lock, args, wrapperFn, later;

  later = function later() {
    // reset lock and call if queued
    lock = false;
    if (args) {
      wrapperFn.apply(context, args);
      args = false;
    }
  };

  wrapperFn = function wrapperFn() {
    if (lock) {
      // called too soon, queue to call later
      args = arguments;
    } else {
      // call and lock until later
      fn.apply(context, arguments);
      setTimeout(later, time);
      lock = true;
    }
  };

  return wrapperFn;
}

// @function wrapNum(num: Number, range: Number[], includeMax?: Boolean): Number
// Returns the number `num` modulo `range` in such a way so it lies within
// `range[0]` and `range[1]`. The returned value will be always smaller than
// `range[1]` unless `includeMax` is set to `true`.
export function wrapNum(x, range, includeMax) {
  let max = range[1],
    min = range[0],
    d = max - min;
  return x === max && includeMax ? x : ((((x - min) % d) + d) % d) + min;
}

// @function falseFn(): Function
// Returns a function which always returns `false`.
export function falseFn() {
  return false;
}

// @function formatNum(num: Number, digits?: Number): Number
// Returns the number `num` rounded to `digits` decimals, or to 6 decimals by default.
export function formatNum(num, digits) {
  //let pow = Math.pow(10, (digits === undefined ? 6 : digits))
  //return Math.round(num * pow) / pow
  return Number(num.toFixed(digits || 0));
}

// @function trim(str: String): String
// Compatibility polyfill for [String.prototype.trim](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String/Trim)
export function trim(str) {
  return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, '');
}

// @function splitWords(str: String): String[]
// Trims and splits the string on whitespace and returns the array of parts.
export function splitWords(str) {
  return trim(str).split(/\s+/);
}

// @function setOptions(obj: Object, options: Object): Object
// Merges the given properties to the `options` of the `obj` object, returning the resulting options. See `Class options`. Has an `L.setOptions` shortcut.
export function setOptions(obj, options) {
  if (!Object.hasOwnProperty.call(obj, 'options')) {
    obj.options = obj.options ? create(obj.options) : {};
  }
  for (let i in options) {
    obj.options[i] = options[i];
  }
  return obj.options;
}

// @function getParamString(obj: Object, existingUrl?: String, uppercase?: Boolean): String
// Converts an object into a parameter URL string, e.g. `{a: "foo", b: "bar"}`
// translates to `'?a=foo&b=bar'`. If `existingUrl` is set, the parameters will
// be appended at the end. If `uppercase` is `true`, the parameter names will
// be uppercased (e.g. `'?A=foo&B=bar'`)
export function getParamString(obj, existingUrl, uppercase) {
  let params = [];
  for (let i in obj) {
    params.push(
      encodeURIComponent(uppercase ? i.toUpperCase() : i) +
        '=' +
        encodeURIComponent(obj[i])
    );
  }
  return (
    (!existingUrl || existingUrl.indexOf('?') === -1 ? '?' : '&') +
    params.join('&')
  );
}

let templateRe = /\{ *([\w_-]+) *\}/g;

// @function template(str: String, data: Object): String
// Simple templating facility, accepts a template string of the form `'Hello {a}, {b}'`
// and a data object like `{a: 'foo', b: 'bar'}`, returns evaluated string
// `('Hello foo, bar')`. You can also specify functions instead of strings for
// data values — they will be evaluated passing `data` as an argument.
export function template(str, data) {
  return str.replace(templateRe, function (str, key) {
    let value = data[key];

    if (value === undefined) {
      throw new Error('No value provided for variable ' + str);
    } else if (typeof value === 'function') {
      value = value(data);
    }
    return value;
  });
}

// @function isArray(obj): Boolean
// Compatibility polyfill for [Array.isArray](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray)
export let isArray =
  Array.isArray ||
  function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

// @function indexOf(array: Array, el: Object): Number
// Compatibility polyfill for [Array.prototype.indexOf](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)
export function indexOf(array, el) {
  for (let i = 0; i < array.length; i++) {
    if (array[i] === el) {
      return i;
    }
  }
  return -1;
}

// @property emptyImageUrl: String
// Data URI string containing a base64-encoded empty GIF image.
// Used as a hack to free memory from unused images on WebKit-powered
// mobile devices (by setting image `src` to this string).
export let emptyImageUrl =
  'data:image/gifbase64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

// inspired by http://paulirish.com/2011/requestanimationframe-for-smart-animating/

function getPrefixed(name) {
  return window['webkit' + name] || window['moz' + name] || window['ms' + name];
}

let lastTime = 0;

// fallback for IE 7-8
function timeoutDefer(fn) {
  let time = +new Date(),
    timeToCall = Math.max(0, 16 - (time - lastTime));

  lastTime = time + timeToCall;
  return window.setTimeout(fn, timeToCall);
}

export let requestFn =
  window.requestAnimationFrame ||
  getPrefixed('RequestAnimationFrame') ||
  timeoutDefer;
export let cancelFn =
  window.cancelAnimationFrame ||
  getPrefixed('CancelAnimationFrame') ||
  getPrefixed('CancelRequestAnimationFrame') ||
  function (id) {
    window.clearTimeout(id);
  };

// @function requestAnimFrame(fn: Function, context?: Object, immediate?: Boolean): Number
// Schedules `fn` to be executed when the browser repaints. `fn` is bound to
// `context` if given. When `immediate` is set, `fn` is called immediately if
// the browser doesn't have native support for
// [`window.requestAnimationFrame`](https://developer.mozilla.org/docs/Web/API/window/requestAnimationFrame),
// otherwise it's delayed. Returns a request ID that can be used to cancel the request.
export function requestAnimFrame(fn, context, immediate) {
  if (immediate && requestFn === timeoutDefer) {
    fn.call(context);
  } else {
    return requestFn.call(window, bind(fn, context));
  }
}

// @function cancelAnimFrame(id: Number): undefined
// Cancels a previous `requestAnimFrame`. See also [window.cancelAnimationFrame](https://developer.mozilla.org/docs/Web/API/window/cancelAnimationFrame).
export function cancelAnimFrame(id) {
  if (id) {
    cancelFn.call(window, id);
  }
}

//从plot的 标号默认值F12打印 拷贝，方便读取
let configDefval = {
  label: {
    edittype: 'label',
    name: '文字',
    style: {
      text: '文字',
      color: '#ffffff',
      opacity: 1,
      font_family: '楷体',
      font_size: 30,
      border: true,
      border_color: '#000000',
      border_width: 3,
      background: false,
      background_color: '#000000',
      background_opacity: 0.5,
      font_weight: 'normal',
      font_style: 'normal',
      scaleByDistance: false,
      scaleByDistance_far: 1000000,
      scaleByDistance_farValue: 0.1,
      scaleByDistance_near: 1000,
      scaleByDistance_nearValue: 1,
      distanceDisplayCondition: false,
      distanceDisplayCondition_far: 10000,
      distanceDisplayCondition_near: 0,
      clampToGround: false,
      visibleDepth: true
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  point: {
    edittype: 'point',
    name: '点标记',
    style: {
      pixelSize: 10,
      color: '#3388ff',
      opacity: 1,
      outline: true,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      outlineWidth: 2,
      scaleByDistance: false,
      scaleByDistance_far: 1000000,
      scaleByDistance_farValue: 0.1,
      scaleByDistance_near: 1000,
      scaleByDistance_nearValue: 1,
      distanceDisplayCondition: false,
      distanceDisplayCondition_far: 10000,
      distanceDisplayCondition_near: 0,
      clampToGround: false,
      visibleDepth: true
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  billboard: {
    edittype: 'billboard',
    name: '图标点标记',
    style: {
      image: '',
      opacity: 1,
      scale: 1,
      rotation: 0,
      scaleByDistance: false,
      scaleByDistance_far: 1000000,
      scaleByDistance_farValue: 0.1,
      scaleByDistance_near: 1000,
      scaleByDistance_nearValue: 1,
      distanceDisplayCondition: false,
      distanceDisplayCondition_far: 10000,
      distanceDisplayCondition_near: 0,
      clampToGround: false,
      visibleDepth: true
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  model: {
    edittype: 'model',
    name: '模型',
    style: {
      modelUrl: '',
      scale: 1,
      heading: 0,
      pitch: 0,
      roll: 0,
      fill: false,
      color: '#3388ff',
      opacity: 1,
      silhouette: false,
      silhouetteColor: '#ffffff',
      silhouetteSize: 2,
      silhouetteAlpha: 0.8,
      clampToGround: false
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  polyline: {
    edittype: 'polyline',
    name: '线',
    config: {
      minPointNum: 2
    },
    style: {
      lineType: 'solid',
      animationDuration: 2000,
      animationImage: 'Assets3D/Textures/lineClr.png',
      color: '#3388ff',
      width: 4,
      clampToGround: false,
      outline: false,
      outlineColor: '#ffffff',
      outlineWidth: 2,
      opacity: 1,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  polylineVolume: {
    edittype: 'polylineVolume',
    name: '管道线',
    config: {
      minPointNum: 2
    },
    style: {
      color: '#00FF00',
      radius: 10,
      shape: 'pipeline',
      outline: false,
      outlineColor: '#ffffff',
      opacity: 1
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  corridor: {
    edittype: 'corridor',
    name: '走廊',
    config: {
      height: false,
      minPointNum: 2
    },
    style: {
      height: 0,
      width: 500,
      cornerType: 'ROUNDED',
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      color: '#3388ff',
      opacity: 0.6,
      clampToGround: false,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  extrudedCorridor: {
    edittype: 'extrudedCorridor',
    name: '拉伸走廊',
    config: {
      height: false,
      minPointNum: 2
    },
    style: {
      height: 0,
      extrudedHeight: 40,
      width: 500,
      cornerType: 'ROUNDED',
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      color: '#00FF00',
      opacity: 0.6,
      clampToGround: false,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  polygon: {
    edittype: 'polygon',
    name: '面',
    style: {
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#3388ff',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      clampToGround: false,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  polygon_clampToGround: {
    edittype: 'polygon_clampToGround',
    name: '贴地面',
    config: {
      height: false
    },
    style: {
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#ffff00',
      opacity: 0.6,
      stRotation: 0,
      clampToGround: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  extrudedPolygon: {
    edittype: 'extrudedPolygon',
    name: '拉伸面',
    style: {
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#00FF00',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      extrudedHeight: 100,
      perPositionHeight: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  rectangle: {
    edittype: 'rectangle',
    name: '矩形',
    config: {
      height: false,
      minPointNum: 2,
      maxPointNum: 2
    },
    style: {
      height: 0,
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#3388ff',
      opacity: 0.6,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      rotation: 0,
      stRotation: 0,
      clampToGround: false,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  rectangleImg: {
    edittype: 'rectangleImg',
    name: '图片',
    config: {
      height: false,
      minPointNum: 2,
      maxPointNum: 2
    },
    style: {
      image: '',
      opacity: 1,
      rotation: 0,
      clampToGround: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  extrudedRectangle: {
    edittype: 'extrudedRectangle',
    name: '拉伸矩形',
    config: {
      height: false,
      minPointNum: 2,
      maxPointNum: 2
    },
    style: {
      extrudedHeight: 40,
      height: 0,
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#00FF00',
      opacity: 0.6,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      rotation: 0,
      stRotation: 0,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  circle: {
    edittype: 'circle',
    name: '圆',
    config: {
      height: false
    },
    style: {
      radius: 200,
      height: 0,
      fill: true,
      fillType: 'color',
      animationDuration: 2000,
      animationCount: 1,
      animationGradient: 0.1,
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#3388ff',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      rotation: 0,
      clampToGround: false,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  circle_clampToGround: {
    edittype: 'circle_clampToGround',
    name: '贴地圆',
    config: {
      height: false
    },
    style: {
      radius: 200,
      fillType: 'color',
      animationDuration: 2000,
      animationCount: 1,
      animationGradient: 0.1,
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#ffff00',
      opacity: 0.6,
      stRotation: 0,
      rotation: 0,
      clampToGround: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  extrudedCircle: {
    edittype: 'extrudedCircle',
    name: '圆柱体',
    config: {
      height: false
    },
    style: {
      radius: 200,
      extrudedHeight: 200,
      height: 0,
      fill: true,
      fillType: 'color',
      animationDuration: 2000,
      animationCount: 1,
      animationGradient: 0.1,
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#00FF00',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      rotation: 0,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  ellipse: {
    edittype: 'ellipse',
    name: '椭圆',
    config: {
      height: false
    },
    style: {
      semiMinorAxis: 200,
      semiMajorAxis: 200,
      height: 0,
      fill: true,
      fillType: 'color',
      animationDuration: 2000,
      animationCount: 1,
      animationGradient: 0.1,
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#3388ff',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      rotation: 0,
      clampToGround: false,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  ellipse_clampToGround: {
    edittype: 'ellipse_clampToGround',
    name: '贴地椭圆',
    config: {
      height: false
    },
    style: {
      semiMinorAxis: 200,
      semiMajorAxis: 200,
      fillType: 'color',
      animationDuration: 2000,
      animationCount: 1,
      animationGradient: 0.1,
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#ffff00',
      opacity: 0.6,
      stRotation: 0,
      rotation: 0,
      clampToGround: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  extrudedEllipse: {
    edittype: 'extrudedEllipse',
    name: '椭圆柱体',
    config: {
      height: false
    },
    style: {
      semiMinorAxis: 200,
      semiMajorAxis: 200,
      extrudedHeight: 200,
      height: 0,
      fill: true,
      fillType: 'color',
      animationDuration: 2000,
      animationCount: 1,
      animationGradient: 0.1,
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#00FF00',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      rotation: 0,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  ellipsoid: {
    edittype: 'ellipsoid',
    name: '球体',
    style: {
      extentRadii: 200,
      widthRadii: 200,
      heightRadii: 200,
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#00FF00',
      opacity: 0.6,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  wall: {
    edittype: 'wall',
    name: '墙体',
    config: {
      minPointNum: 2
    },
    style: {
      extrudedHeight: 40,
      fill: true,
      fillType: 'color',
      animationDuration: 2000,
      animationImage: 'Assets3D/Textures/fence.png',
      animationRepeatX: 1,
      animationAxisY: false,
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#00FF00',
      opacity: 0.6,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  }

  //剔除与默认值相同的值
};

export function removeGeoJsonDefVal(geojson) {
  if (!geojson.properties || !geojson.properties.type) return geojson;

  let type = geojson.properties.edittype || geojson.properties.type;
  let def = configDefval[type];
  if (!def) return geojson;

  let newgeojson = util.clone(geojson);
  if (geojson.properties.style && def.style) {
    let newstyle = {};
    for (let i in geojson.properties.style) {
      if (Object.hasOwnProperty.call(geojson.properties.style, i)) {
        let val = geojson.properties.style[i];
        if (!Cesium.defined(val)) continue;

        let valDef = def.style[i];
        if (valDef === val) continue;
        newstyle[i] = val;
      }
    }
    newgeojson.properties.style = newstyle;
  }

  if (geojson.properties.attr && def.attr) {
    let newattr = {};
    for (let i in geojson.properties.attr) {
      if (Object.hasOwnProperty.call(geojson.properties.attr, i)) {
        let val = geojson.properties.attr[i];
        if (!Cesium.defined(val)) continue;

        let valDef = def.attr[i];
        if (valDef === val) continue;

        newattr[i] = val;
      }
    }
    newgeojson.properties.attr = newattr;
  }

  return newgeojson;
}

export function addGeoJsonDefVal(properties) {
  //赋默认值
  let def = configDefval[properties.edittype || properties.type];
  if (def) {
    properties.style = properties.style || {};
    for (let key in def.style) {
      if (Object.hasOwnProperty.call(def.style, key)) {
        let val = properties.style[key];
        if (Cesium.defined(val)) continue;
        properties.style[key] = def.style[key];
      }
    }

    properties.attr = properties.attr || {};
    for (let key in def.attr) {
      if (Object.hasOwnProperty.call(def.attr, key)) {
        let val = properties.attr[key];
        if (Cesium.defined(val)) continue;
        properties.attr[key] = def.attr[key];
      }
    }
  }
  return properties;
}

export function addStyleDefVal(type, style) {
  //赋默认值
  let def = configDefval[type];
  if (def && def.style) {
    style = style || {};
    for (let key in def.style) {
      if (Object.hasOwnProperty.call(def.style, key)) {
        let val = style[key];
        if (val != null) continue;
        style[key] = def.style[key];
      }
    }
  }
  return style;
}

//cesium笛卡尔空间坐标 转 弧度值
export function cartesian2Carto(cartesian) {
  return Cesium.Cartographic.fromCartesian(cartesian);
}

export function toCartesian2(x, y) {
  return new Cesium.Cartesian2(x, y);
}
// 分屏监听用
export function CesiumDragEvt() {
  const [handler, callback, justRemoveListener, middleUpCallback] = arguments;
  handler.removeInputAction(Cesium.ScreenSpaceEventType.MIDDLE_DOWN);
  handler.removeInputAction(Cesium.ScreenSpaceEventType.MIDDLE_UP);
  if (justRemoveListener) return;
  handler.setInputAction(function () {
    handler.setInputAction(function (e) {
      callback && callback(e);
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }, Cesium.ScreenSpaceEventType.MIDDLE_DOWN);

  handler.setInputAction(function (e) {
    middleUpCallback && middleUpCallback(e);
    handler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }, Cesium.ScreenSpaceEventType.MIDDLE_UP);
}

//cesium笛卡尔空间坐标 转 经纬度坐标【用于转geojson】
export function cartesian2lonlat(cartesian) {
  let carto = Cesium.Cartographic.fromCartesian(cartesian);
  if (carto == null) return {};

  let x = formatNum(Cesium.Math.toDegrees(carto.longitude), 6);
  let y = formatNum(Cesium.Math.toDegrees(carto.latitude), 6);
  let z = formatNum(carto.height, 2);

  return [x, y, z];
}

//数组，cesium笛卡尔空间坐标 转 经纬度坐标【用于转geojson】
export function cartesians2lonlats(positions) {
  let coordinates = [];
  for (let i = 0, len = positions.length; i < len; i++) {
    let point = cartesian2lonlat(positions[i]);
    coordinates.push(point);
  }
  return coordinates;
}
// Array.<Number> --> Array.<Cartesian3>
export function coordinatesCartesians(coordinates) {
  return Cesium.Cartesian3.fromDegreesArray(coordinates);
}

//经纬度坐标 转 cesium笛卡尔空间坐标
export function lonlat2cartesian(coord, defHeight) {
  return Cesium.Cartesian3.fromDegrees(
    coord[0],
    coord[1],
    coord[2] || defHeight || 0
  );
}

//数组，经纬度坐标 转 cesium笛卡尔空间坐标
export function lonlats2cartesians(coords, defHeight) {
  let arr = [];
  for (let i = 0, len = coords.length; i < len; i++) {
    let item = coords[i];
    if (isArray(item[0])) arr.push(lonlats2cartesians(item, defHeight));
    else arr.push(lonlat2cartesian(item, defHeight));
  }
  return arr;
}

let webMercatorProjection = new Cesium.WebMercatorProjection();

//cesium笛卡尔空间坐标 转 web mercator投影坐标
export function cartesian2mercator(position) {
  if (!position) return null;
  let point = webMercatorProjection.project(
    Cesium.Cartographic.fromCartesian(position)
  );
  return [point.x, point.y, point.z];
}

//数组，cesium笛卡尔空间坐标 转 web mercator投影坐标
export function cartesians2mercators(arr) {
  let arrNew = [];
  for (let i = 0, len = arr.length; i < len; i++) {
    let point = cartesian2mercator(arr[i]);
    if (point) arrNew.push(point);
  }
  return arrNew;
}

//地理坐标 转 投影坐标
export function lonlat2mercator(lnglat) {
  let cartesian = lonlat2cartesian(lnglat);
  return cartesian2mercator(cartesian);
}

//数组，地理坐标 转 投影坐标
export function lonlats2mercators(arr) {
  let arrNew = [];
  for (let i = 0, len = arr.length; i < len; i++) {
    let point = lonlat2mercator(arr[i]);
    arrNew.push(point);
  }
  return arrNew;
}

//投影坐标 转 cesium笛卡尔空间坐标
export function mercator2cartesian(point) {
  if (isNaN(point[0]) || isNaN(point[1])) return null;

  // let x = point[0] / 20037508.34 * 180
  // let y = point[1] / 20037508.34 * 180
  // y = 180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180)) - Math.PI / 2)
  // return Cesium.Cartesian3.fromDegrees(x,y)

  let carto = webMercatorProjection.unproject(
    new Cesium.Cartesian3(point[0], point[1], point[2] || 0)
  );
  return Cesium.Cartesian3.fromRadians(
    carto.longitude,
    carto.latitude,
    carto.height
  );
}

//数组，投影坐标 转 cesium笛卡尔空间坐标
export function mercators2cartesians(arr) {
  let arrNew = [];
  for (let i = 0, len = arr.length; i < len; i++) {
    let point = mercator2cartesian(arr[i]);
    if (point) arrNew.push(point);
  }
  return arrNew;
}

//投影坐标 转 地理坐标
export function mercator2lonlat(point) {
  let cartesian = mercator2cartesian(point);
  return cartesian2lonlat(cartesian);
}

//数组，投影坐标 转 地理坐标
export function mercators2lonlats(arr) {
  let arrNew = [];
  for (let i = 0, len = arr.length; i < len; i++) {
    let point = mercator2lonlat(arr[i]);
    arrNew.push(point);
  }
  return arrNew;
}

//geojson转entity
export function getPositionByGeoJSON(geojson, defHeight) {
  let geometry = geojson.type === 'Feature' ? geojson.geometry : geojson,
    coords = geometry ? geometry.coordinates : null;

  if (!coords && !geometry) {
    return null;
  }

  switch (geometry.type) {
    case 'Point':
      return lonlat2cartesian(coords, defHeight);
    case 'MultiPoint':
    case 'LineString':
      return lonlats2cartesians(coords, defHeight);

    case 'MultiLineString':
    case 'Polygon':
      return lonlats2cartesians(coords[0], defHeight);
    case 'MultiPolygon':
      return lonlats2cartesians(coords[0][0], defHeight);
    default:
      throw new Error('Invalid GeoJSON object.');
  }
}
// 根据两点计算出矩形四点 左上 逆时针
export function computeRectanglePoints(p1C3, p2C3) {
  let point1 = cartesian2lonlat(p1C3);
  let point2 = cartesian2lonlat(p2C3);
  let x1 = point1[0] < point2[0] ? point1[0] : point2[0];
  let x2 = point1[0] > point2[0] ? point1[0] : point2[0];
  let y1 = point1[1] < point2[1] ? point1[1] : point2[1];
  let y2 = point1[1] > point2[1] ? point1[1] : point2[1];
  let z = point2[2];
  let newP1C3 = lonlat2cartesian([x1, y2, z]);
  let newP2C3 = lonlat2cartesian([x1, y1, z]);
  let newP3C3 = lonlat2cartesian([x2, y1, z]);
  let newP4C3 = lonlat2cartesian([x2, y2, z]);
  // 左上 逆时针
  return [newP1C3, newP2C3, newP3C3, newP4C3];
}
