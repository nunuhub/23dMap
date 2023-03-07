/*
 * @Author: liujh
 * @Date: 2020/8/24 9:52
 * @Description:
 */
/* 96 */
/***/

import * as Cesium from 'cesium_shinegis_earth';

function FeatureGridImageryProvider(options) {
  options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT);
  this.options = options;
  this._tileWidth = Cesium.defaultValue(options.tileWidth, 256);
  this._tileHeight = Cesium.defaultValue(options.tileHeight, 256);
  this._minimumLevel = Cesium.defaultValue(options.minimumLevel, 16);
  this._maximumLevel = options.maximumLevel;
  //预期初始化提供图层范围，暂时由高级参数配置，后续已排计划构建统一二三维初始化获取范围
  if (options.initExtent && options.initExtent.length == 4) {
    let rectangle = {
      xmin: options.initExtent[0],
      ymin: options.initExtent[1],
      xmax: options.initExtent[2],
      ymax: options.initExtent[3]
    };
    options.rectangle = rectangle;
  }

  if (
    options.rectangle &&
    options.rectangle.xmin &&
    options.rectangle.xmax &&
    options.rectangle.ymin &&
    options.rectangle.ymax
  ) {
    let xmin = options.rectangle.xmin;
    let xmax = options.rectangle.xmax;
    let ymin = options.rectangle.ymin;
    let ymax = options.rectangle.ymax;
    options.rectangle = Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax);
  }
  this._tilingScheme = Cesium.defaultValue(
    options.tilingScheme,
    new Cesium.GeographicTilingScheme({
      ellipsoid: options.ellipsoid
    })
  );
  this._rectangle = Cesium.defaultValue(
    options.rectangle,
    this._tilingScheme.rectangle
  );
  this._rectangle = Cesium.Rectangle.intersection(
    this._rectangle,
    this._tilingScheme.rectangle
  );
  this._hasAlphaChannel = Cesium.defaultValue(options.hasAlphaChannel, true);

  this._errorEvent = new Cesium.Event();
  this._readyPromise = Promise.resolve(true);
  this._credit = undefined;
  this._ready = true;
}

Object.defineProperties(FeatureGridImageryProvider.prototype, {
  url: {
    get: function get() {
      return this._url;
    }
  },

  token: {
    get: function get() {
      return this._token;
    }
  },

  proxy: {
    get: function get() {
      return this._proxy;
    }
  },

  tileWidth: {
    get: function get() {
      //>>includeStart("debug", pragmas.debug)
      if (!this._ready) {
        throw new Cesium.DeveloperError(
          'tileWidth must not be called before the imagery provider is ready.'
        );
      }
      //>>includeEnd("debug")

      return this._tileWidth;
    }
  },

  tileHeight: {
    get: function get() {
      //>>includeStart("debug", pragmas.debug)
      if (!this._ready) {
        throw new Cesium.DeveloperError(
          'tileHeight must not be called before the imagery provider is ready.'
        );
      }
      //>>includeEnd("debug")

      return this._tileHeight;
    }
  },

  maximumLevel: {
    get: function get() {
      //>>includeStart("debug", pragmas.debug)
      if (!this._ready) {
        throw new Cesium.DeveloperError(
          'maximumLevel must not be called before the imagery provider is ready.'
        );
      }
      //>>includeEnd("debug")

      return this._maximumLevel;
    }
  },

  minimumLevel: {
    get: function get() {
      //>>includeStart("debug", pragmas.debug)
      if (!this._ready) {
        throw new Cesium.DeveloperError(
          'minimumLevel must not be called before the imagery provider is ready.'
        );
      }
      //>>includeEnd("debug")
      return 0;
    }
  },

  tilingScheme: {
    get: function get() {
      //>>includeStart("debug", pragmas.debug)
      if (!this._ready) {
        throw new Cesium.DeveloperError(
          'tilingScheme must not be called before the imagery provider is ready.'
        );
      }
      //>>includeEnd("debug")

      return this._tilingScheme;
    }
  },

  rectangle: {
    get: function get() {
      //>>includeStart("debug", pragmas.debug)
      if (!this._ready) {
        throw new Cesium.DeveloperError(
          'rectangle must not be called before the imagery provider is ready.'
        );
      }
      //>>includeEnd("debug")

      return this._rectangle;
    }
  },

  tileDiscardPolicy: {
    get: function get() {
      //>>includeStart("debug", pragmas.debug)
      if (!this._ready) {
        throw new Cesium.DeveloperError(
          'tileDiscardPolicy must not be called before the imagery provider is ready.'
        );
      }
      //>>includeEnd("debug")

      return this._tileDiscardPolicy;
    }
  },

  errorEvent: {
    get: function get() {
      return this._errorEvent;
    }
  },

  ready: {
    get: function get() {
      return this._ready;
    }
  },

  readyPromise: {
    get: function get() {
      return this._readyPromise;
    }
  },

  credit: {
    get: function get() {
      return this._credit;
    }
  },

  usingPrecachedTiles: {
    get: function get() {
      return this._useTiles;
    }
  },

  hasAlphaChannel: {
    get: function get() {
      return true;
    }
  },

  layers: {
    get: function get() {
      return this._layers;
    }
  }
});

FeatureGridImageryProvider.prototype.getTileCredits =
  function (/* x, y, level */) {
    return undefined;
  };

//显示瓦片信息
FeatureGridImageryProvider.prototype.requestImage = function (x, y, level) {
  let canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;

  if (level < this._minimumLevel) return Promise.resolve(canvas);

  if (this.options.debuggerTileInfo) {
    let context = canvas.getContext('2d');

    context.strokeStyle = '#ffff00';
    context.lineWidth = 2;
    context.strokeRect(1, 1, 255, 255);

    let label = 'L' + level + 'X' + x + 'Y' + y;
    context.font = 'bold 25px Arial';
    context.textAlign = 'center';
    context.fillStyle = 'black';
    context.fillText(label, 127, 127);
    context.fillStyle = '#ffff00';
    context.fillText(label, 124, 124);
  }
  return Promise.resolve(canvas);
};

FeatureGridImageryProvider.prototype._getGridKey = function (opts) {
  return opts.level + '_x' + opts.x + '_y' + opts.y;
};

FeatureGridImageryProvider.prototype.addImageryCache = function (opts) {
  if (opts.level < this._minimumLevel || opts.level < opts.maxLevel - 1) return;

  //console.log("新增" + JSON.stringify(opts))
  if (this.options.addImageryCache) {
    opts.key = this._getGridKey(opts);
    this.options.addImageryCache(opts);
  }
};

FeatureGridImageryProvider.prototype.removeImageryCache = function (opts) {
  if (
    opts.maxLevel < this._minimumLevel &&
    this.options.removeAllImageryCache
  ) {
    this.options.removeAllImageryCache();
  }
  if (opts.level < this._minimumLevel) return;

  //console.log("删除" + JSON.stringify(opts))
  if (this.options.removeImageryCache) {
    opts.key = this._getGridKey(opts);
    this.options.removeImageryCache(opts);
  }
};

export { FeatureGridImageryProvider };
