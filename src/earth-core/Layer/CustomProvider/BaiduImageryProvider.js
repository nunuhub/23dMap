import { BaiduMercatorTilingScheme } from './TilingScheme';
import * as Cesium from 'cesium_shinegis_earth';

class BaiduImageryProvider {
  constructor(options = {}) {
    this._url = options.url;
    this._labelStyle = options.labelStyle || 'web2D';
    this._tileWidth = 256;
    this._tileHeight = 256;
    this._maximumLevel = 18;
    //this._crs = options.crs || 'BD09'
    this._crs = 'WGS84';
    //this._crs = 'BD09'

    if (options.crs === 'WGS84') {
      const resolutions = [];
      for (let i = 0; i < 19; i++) {
        resolutions[i] = 256 * Math.pow(2, 18 - i);
      }
      this._tilingScheme = new BaiduMercatorTilingScheme({
        resolutions,
        rectangleSouthwestInMeters: new Cesium.Cartesian2(
          -20037726.37,
          -12474104.17
        ),
        rectangleNortheastInMeters: new Cesium.Cartesian2(
          20037726.37,
          12474104.17
        )
      });
    } else {
      this._tilingScheme = new Cesium.WebMercatorTilingScheme({
        rectangleSouthwestInMeters: new Cesium.Cartesian2(-33554054, -33746824),
        rectangleNortheastInMeters: new Cesium.Cartesian2(33554054, 33746824)
      });
    }
    this._rectangle = this._tilingScheme.rectangle;
    this._credit = undefined;
    this._token = undefined;
    this._style = options.style || 'normal';
  }

  get url() {
    return this._url;
  }

  get token() {
    return this._token;
  }

  get tileWidth() {
    if (!this.ready) {
      throw new Cesium.DeveloperError(
        'tileWidth must not be called before the imagery provider is ready.'
      );
    }
    return this._tileWidth;
  }

  get tileHeight() {
    if (!this.ready) {
      throw new Cesium.DeveloperError(
        'tileHeight must not be called before the imagery provider is ready.'
      );
    }
    return this._tileHeight;
  }

  get maximumLevel() {
    if (!this.ready) {
      throw new Cesium.DeveloperError(
        'maximumLevel must not be called before the imagery provider is ready.'
      );
    }
    return this._maximumLevel;
  }

  get minimumLevel() {
    if (!this.ready) {
      throw new Cesium.DeveloperError(
        'minimumLevel must not be called before the imagery provider is ready.'
      );
    }
    return 0;
  }

  get tilingScheme() {
    if (!this.ready) {
      throw new Cesium.DeveloperError(
        'tilingScheme must not be called before the imagery provider is ready.'
      );
    }
    return this._tilingScheme;
  }

  get rectangle() {
    if (!this.ready) {
      throw new Cesium.DeveloperError(
        'rectangle must not be called before the imagery provider is ready.'
      );
    }
    return this._rectangle;
  }

  get ready() {
    return !!this._url;
  }

  get credit() {
    return this._credit;
  }

  get hasAlphaChannel() {
    return true;
  }

  getTileCredits(/* x, y, level */) {}

  /**
   * Request Image
   * @param x
   * @param y
   * @param level
   * @returns {Promise<HTMLImageElement | HTMLCanvasElement>}
   */
  requestImage(x, y, level) {
    if (!this.ready) {
      throw new Cesium.DeveloperError(
        'requestImage must not be called before the imagery provider is ready.'
      );
    }
    const xTiles = this._tilingScheme.getNumberOfXTilesAtLevel(level);
    const yTiles = this._tilingScheme.getNumberOfYTilesAtLevel(level);
    let url = this._url
      .replace('{z}', level)
      .replace('{s}', String(1))
      .replace('{style}', this._style)
      .replace('{labelStyle}', this._labelStyle)
      .replace('{time}', String(new Date().getTime()));

    if (this._crs === 'WGS84') {
      url = url.replace('{x}', String(x)).replace('{y}', String(-y));
    } else {
      url = url
        .replace('{x}', String(x - xTiles / 2))
        .replace('{y}', String(yTiles / 2 - y - 1));
    }
    return Cesium.ImageryProvider.loadImage(this, url);
  }
}

export { BaiduImageryProvider };
