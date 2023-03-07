/* eslint-disable no-prototype-builtins */
/*
 * @Author: liujh
 * @Date: 2020/9/29 11:05
 * @Description:
 */
/* 62 */
/***/

import { Class } from './Class13';
import * as Util from './Util3';

/*
 * @class Evented
 * @aka Evented
 * @inherits Class
 *
 * A set of methods shared between event-powered classes (like `Map` and `Marker`). Generally, events allow you to execute some function when something happens with an object (e.g. the user clicks on the map, causing the map to fire `'click'` event).
 *
 * @example
 *
 * ```js
 * map.on('click', function(e) {
 * 	alert(e.latlng)
 * } )
 * ```
 *
 * Leaflet deals with event listeners by reference, so if you want to add a listener and then remove it, define it as a function:
 *
 * ```js
 * function onClick(e) { ... }
 *
 * map.on('click', onClick)
 * map.off('click', onClick)
 * ```
 */

/**
 * 事件类
 * @class
 * @alias Evented
 * @extends Class
 */
let Events = {
  /* @method on(type: String, fn: Function, context?: Object): this
   * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
   *
   * @alternative
   * @method on(eventMap: Object): this
   * Adds a set of type/listener pairs, e.g. `{click: onClick, mousemove: onMouseMove}`
   */
  /**
   * Adds a listener function (`fn`) to a particular event type of the object. You can optionally specify the context of the listener (object the this keyword will point to). You can also pass several space-separated types (e.g. `'click dblclick'`).
   * @param types
   * @param fn
   * @param context
   * @returns {Events}
   */
  on: function on(types, fn, context) {
    // types can be a map of types/handlers
    if (
      (typeof types === 'undefined' ? 'undefined' : typeof types) === 'object'
    ) {
      for (let type in types) {
        // we don't process space-separated events here for performance
        // it's a hot path since Layer uses the on(obj) syntax
        if (types.hasOwnProperty(type)) {
          this._on(type, types[type], fn);
        }
      }
    } else {
      // types can be a string of space-separated words
      types = Util.splitWords(types);

      for (let i = 0, len = types.length; i < len; i++) {
        this._on(types[i], fn, context);
      }
    }

    return this;
  },

  /* @method off(type: String, fn?: Function, context?: Object): this
   * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
   *
   * @alternative
   * @method off(eventMap: Object): this
   * Removes a set of type/listener pairs.
   *
   * @alternative
   * @method off: this
   * Removes all listeners to all events on the object.
   */
  /**
   * Removes a previously added listener function. If no function is specified, it will remove all the listeners of that particular event from the object. Note that if you passed a custom context to `on`, you must pass the same context to `off` in order to remove the listener.
   * @param types
   * @param fn
   * @param context
   * @returns {Events}
   */
  off: function off(types, fn, context) {
    if (!types) {
      // clear all listeners if called without arguments
      delete this._events;
    } else if (
      (typeof types === 'undefined' ? 'undefined' : typeof types) === 'object'
    ) {
      for (let type in types) {
        if (types.hasOwnProperty(type)) {
          this._off(type, types[type], fn);
        }
      }
    } else {
      types = Util.splitWords(types);

      for (let i = 0, len = types.length; i < len; i++) {
        this._off(types[i], fn, context);
      }
    }

    return this;
  },

  un: function un(types, fn, context) {
    if (!types) {
      // clear all listeners if called without arguments
      delete this._events;
    } else if (
      (typeof types === 'undefined' ? 'undefined' : typeof types) === 'object'
    ) {
      for (let type in types) {
        if (types.hasOwnProperty(type)) {
          this._off(type, types[type], fn);
        }
      }
    } else {
      types = Util.splitWords(types);

      for (let i = 0, len = types.length; i < len; i++) {
        this._off(types[i], fn, context);
      }
    }

    return this;
  },

  // attach listener (without syntactic sugar now)
  _on: function _on(type, fn, context) {
    this._events = this._events || {};

    /* get/init listeners for type */
    let typeListeners = this._events[type];
    if (!typeListeners) {
      typeListeners = [];
      this._events[type] = typeListeners;
    }

    if (context === this) {
      // Less memory footprint.
      context = undefined;
    }
    let newListener = {
        fn: fn,
        ctx: context
      },
      listeners = typeListeners;

    // check if fn already there
    for (let i = 0, len = listeners.length; i < len; i++) {
      if (listeners[i].fn === fn && listeners[i].ctx === context) {
        return;
      }
    }

    listeners.push(newListener);
  },

  _off: function _off(type, fn, context) {
    let listeners, i, len;

    if (!this._events) {
      return;
    }

    listeners = this._events[type];

    if (!listeners) {
      return;
    }

    if (!fn) {
      // Set all removed listeners to noop so they are not called if remove happens in fire
      for (i = 0, len = listeners.length; i < len; i++) {
        listeners[i].fn = Util.falseFn;
      }
      // clear all listeners for a type if function isn't specified
      delete this._events[type];
      return;
    }

    if (context === this) {
      context = undefined;
    }

    if (listeners) {
      // find fn and remove it
      for (i = 0, len = listeners.length; i < len; i++) {
        let l = listeners[i];
        if (l.ctx !== context) {
          continue;
        }
        if (l.fn === fn) {
          // set the removed listener to noop so that's not called if remove happens in fire
          l.fn = Util.falseFn;

          if (this._firingCount) {
            /* copy array in case events are being fired */
            this._events[type] = listeners = listeners.slice();
          }
          listeners.splice(i, 1);

          return;
        }
      }
    }
  },

  /**
   * Fires an event of the specified type. You can optionally provide an data
   * @param type
   * @param data
   * @param propagate
   * @returns {Events}
   */
  // @method fire(type: String, data?: Object, propagate?: Boolean): this
  // Fires an event of the specified type. You can optionally provide an data
  // object — the first argument of the listener function will contain its
  // properties. The event can optionally be propagated to event parents.
  fire: function fire(type, data, propagate) {
    if (!this.listens(type, propagate)) {
      return this;
    }

    let event = Util.extend({}, data, {
      type: type,
      target: this,
      sourceTarget: (data && data.sourceTarget) || this
    });

    if (this._events) {
      let listeners = this._events[type];

      if (listeners) {
        this._firingCount = this._firingCount + 1 || 1;
        for (let i = 0, len = listeners.length; i < len; i++) {
          let l = listeners[i];
          l.fn.call(l.ctx || this, event);
        }

        this._firingCount--;
      }
    }

    if (propagate) {
      // propagate the event to parents (set with addEventParent)
      this._propagateEvent(event);
    }

    return this;
  },

  /**
   * Returns `true` if a particular event type has any listeners attached to it.
   * @param type
   * @param propagate
   * @returns {boolean}
   */
  // @method listens(type: String): Boolean
  // Returns `true` if a particular event type has any listeners attached to it.
  listens: function listens(type, propagate) {
    let listeners = this._events && this._events[type];
    if (listeners && listeners.length) {
      return true;
    }

    if (propagate) {
      // also check parents for listeners if event propagates
      for (let id in this._eventParents) {
        if (this._eventParents.hasOwnProperty(id)) {
          if (this._eventParents[id].listens(type, propagate)) {
            return true;
          }
        }
      }
    }
    return false;
  },

  /**
   * Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
   * @param types
   * @param fn
   * @param context
   * @returns {Events}
   */
  // @method once(…): this
  // Behaves as [`on(…)`](#evented-on), except the listener will only get fired once and then removed.
  once: function once(types, fn, context) {
    if (
      (typeof types === 'undefined' ? 'undefined' : typeof types) === 'object'
    ) {
      for (let type in types) {
        if (types.hasOwnProperty(type)) {
          this.once(type, types[type], fn);
        }
      }
      return this;
    }

    let handler = Util.bind(function () {
      this.off(types, fn, context).off(types, handler, context);
    }, this);

    // add a listener that's executed once and removed after that
    return this.on(types, fn, context).on(types, handler, context);
  },

  /**
   * Adds an event parent - an `Evented` that will receive propagated events
   * @param obj
   * @returns {Events}
   */
  // @method addEventParent(obj: Evented): this
  // Adds an event parent - an `Evented` that will receive propagated events
  addEventParent: function addEventParent(obj) {
    this._eventParents = this._eventParents || {};
    this._eventParents[Util.stamp(obj)] = obj;
    return this;
  },

  /**
   * Removes an event parent, so it will stop receiving propagated events
   * @param obj
   * @returns {Events}
   */
  // @method removeEventParent(obj: Evented): this
  // Removes an event parent, so it will stop receiving propagated events
  removeEventParent: function removeEventParent(obj) {
    if (this._eventParents) {
      delete this._eventParents[Util.stamp(obj)];
    }
    return this;
  },

  _propagateEvent: function _propagateEvent(e) {
    for (let id in this._eventParents) {
      if (this._eventParents.hasOwnProperty(id)) {
        this._eventParents[id].fire(
          e.type,
          Util.extend(
            {
              layer: e.target,
              propagatedFrom: e.target
            },
            e
          ),
          true
        );
      }
    }
  }
};

// aliases we should ditch those eventually

// @method addEventListener(…): this
// Alias to [`on(…)`](#evented-on)
Events.addEventListener = Events.on;

// @method removeEventListener(…): this
// Alias to [`off(…)`](#evented-off)

// @method clearAllEventListeners(…): this
// Alias to [`off()`](#evented-off)
Events.removeEventListener = Events.clearAllEventListeners = Events.off;

// @method addOneTimeEventListener(…): this
// Alias to [`once(…)`](#evented-once)
Events.addOneTimeEventListener = Events.once;

// @method fireEvent(…): this
// Alias to [`fire(…)`](#evented-fire)
Events.fireEvent = Events.fire;

// @method hasEventListeners(…): Boolean
// Alias to [`listens(…)`](#evented-listens)
Events.hasEventListeners = Events.listens;

let Evented = Class.extend(Events);

export { Evented, Events };
// export {Events}

/***/
