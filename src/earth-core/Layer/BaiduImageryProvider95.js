/*
 * @Author: liujh
 * @Date: 2020/8/24 9:52
 * @Description:
 */
/* 95 */
/***/

//import { Cesium } from "cesium_shinegis_earth"
import * as Cesium from 'cesium_shinegis_earth';
const DeveloperError = Cesium.DeveloperError;

let height = 33746824; //百度地图

let width = 33554054;

function BaiduImageryProvider(option) {
  let url = option.url;
  option.layer = option.visibleLayers[0];
  if (Cesium.defined(option.layer)) {
    switch (option.layer) {
      case 'vec':
        url =
          'http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=' +
          (option.bigfont ? 'ph' : 'pl') +
          '&scaler=1&p=1';
        break;
      case 'img_d':
        url =
          'http://shangetu{s}.map.bdimg.com/it/u=x={x}y={y}z={z}v=009type=sate&fm=46';
        break;
      case 'img_z':
        url =
          'http://online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=' +
          (option.bigfont ? 'sh' : 'sl') +
          '&v=020';
        break;
      case 'custom':
        //Custom 各种自定义样式
        //可选值：dark,midnight,grayscale,hardedge,light,redalert,googlelite,grassgreen,pink,darkgreen,bluish
        option.customid = option.customid || 'midnight';
        //url = "http://api{s}.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&customid=" + option.customid
        url =
          'http://online{s}.map.bdimg.com/onlinelabel/?qt=tile&x={x}&y={y}&z={z}&styles=pl&scaler=1&p=1';
        break;
      case 'time': {
        //实时路况
        let time = new Date().getTime();
        url =
          'http://its.map.baidu.com:8002/traffic/TrafficTileService?x={x}&y={y}&level={z}&time=' +
          time +
          '&label=web2D&v=017';
        break;
      }
    }
  }
  this._url = url;

  this._tileWidth = 256;
  this._tileHeight = 256;
  this._maximumLevel = 18;

  let rectangleSouthwestInMeters = new Cesium.Cartesian2(-width, -height);
  let rectangleNortheastInMeters = new Cesium.Cartesian2(width, height);
  this._tilingScheme = new Cesium.WebMercatorTilingScheme({
    rectangleSouthwestInMeters: rectangleSouthwestInMeters,
    rectangleNortheastInMeters: rectangleNortheastInMeters
  });

  this._credit = undefined;
  this._rectangle = this._tilingScheme.rectangle;
  this._ready = true;
}

Object.defineProperties(BaiduImageryProvider.prototype, {
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
        throw new DeveloperError(
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
        throw new DeveloperError(
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
        throw new DeveloperError(
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
        throw new DeveloperError(
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
        throw new DeveloperError(
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
        throw new DeveloperError(
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
        throw new DeveloperError(
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

BaiduImageryProvider.prototype.getTileCredits = function (/* x, y, level */) {
  return undefined;
};

BaiduImageryProvider.prototype.requestImage = function (x, y, level) {
  if (!this._ready) {
    throw new DeveloperError(
      'requestImage must not be called before the imagery provider is ready.'
    );
  }

  let tileW = this._tilingScheme.getNumberOfXTilesAtLevel(level);
  let tileH = this._tilingScheme.getNumberOfYTilesAtLevel(level);

  let url = this._url
    .replace('{x}', x - tileW / 2)
    .replace('{y}', tileH / 2 - y - 1)
    .replace('{z}', level)
    .replace('{s}', Math.floor(Math.random() * 10));

  return Cesium.ImageryProvider.loadImage(this, url);
};

export { BaiduImageryProvider };
