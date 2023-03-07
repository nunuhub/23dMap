/*
 * @Author: liujh
 * @Date: 2020/8/24 9:59
 * @Description:
 */
/* 13 */ ///Class
/***/

import * as Util from './Util3.js';

/**
 * @class
 * @constructor
 */
function Class() {}

/**
 * 继承方法
 * @param props
 * @returns {NewClass}
 */
Class.extend = function (props) {
  // @function extend(props: Object): Function
  // [Extends the current class](#class-inheritance) given the properties to be included.
  // Returns a Javascript function that is a class constructor (to be called with `new`).
  let NewClass = function NewClass() {
    // call the constructor
    if (this.initialize) {
      this.initialize.apply(this, arguments);
    }

    // call all constructor hooks
    this.callInitHooks();
  };

  let parentProto = (NewClass.__super__ = this.prototype);

  let proto = Util.create(parentProto);
  proto.constructor = NewClass;

  NewClass.prototype = proto;

  // inherit parent's statics
  for (let i in this) {
    // eslint-disable-next-line no-prototype-builtins
    if (this.hasOwnProperty(i) && i !== 'prototype' && i !== '__super__') {
      NewClass[i] = this[i];
    }
  }

  // mix static properties into the class
  if (props.statics) {
    Util.extend(NewClass, props.statics);
    delete props.statics;
  }

  // mix includes into the prototype
  if (props.includes) {
    // checkDeprecatedMixinEvents(props.includes)
    Util.extend.apply(null, [proto].concat(props.includes));
    delete props.includes;
  }

  // merge options
  if (proto.options) {
    props.options = Util.extend(Util.create(proto.options), props.options);
  }

  // mix given properties into the prototype
  Util.extend(proto, props);

  proto._initHooks = [];

  // add method for calling all hooks
  proto.callInitHooks = function () {
    if (this._initHooksCalled) {
      return;
    }

    if (parentProto.callInitHooks) {
      parentProto.callInitHooks.call(this);
    }

    this._initHooksCalled = true;

    for (let i = 0, len = proto._initHooks.length; i < len; i++) {
      proto._initHooks[i].call(this);
    }
  };

  return NewClass;
};

/**
 * [Includes a mixin](#class-includes) into the current class.
 * @param props
 * @returns {Class}
 */
// @function include(properties: Object): this
// [Includes a mixin](#class-includes) into the current class.
Class.include = function (props) {
  Util.extend(this.prototype, props);
  return this;
};

/**
 * [Merges `options`](#class-options) into the defaults of the class.
 * @param options
 * @returns {Class}
 */
// @function mergeOptions(options: Object): this
// [Merges `options`](#class-options) into the defaults of the class.
Class.mergeOptions = function (options) {
  Util.extend(this.prototype.options, options);
  return this;
};

/**
 * Adds a [constructor hook](#class-constructor-hooks) to the class.
 * @param fn
 * @returns {Class}
 */
// @function addInitHook(fn: Function): this
// Adds a [constructor hook](#class-constructor-hooks) to the class.
Class.addInitHook = function (fn) {
  // (Function) || (String, args...)
  let args = Array.prototype.slice.call(arguments, 1);

  let init =
    typeof fn === 'function'
      ? fn
      : function () {
          this[fn].apply(this, args);
        };

  this.prototype._initHooks = this.prototype._initHooks || [];
  this.prototype._initHooks.push(init);
  return this;
};

export { Class };
