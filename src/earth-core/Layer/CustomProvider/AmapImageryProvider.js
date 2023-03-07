import { AmapMercatorTilingScheme } from './TilingScheme';
import * as Cesium from 'cesium_shinegis_earth';
class AmapImageryProvider extends Cesium.UrlTemplateImageryProvider {
  constructor(options = {}) {
    /*        if (options.crs === 'WGS84') {
            options.tilingScheme = new AmapMercatorTilingScheme()
        }*/
    options.tilingScheme = new AmapMercatorTilingScheme();
    super(options);
  }
}

export { AmapImageryProvider };
