import { getProj, registerProj } from '../../CustomProjection';
import { GisqOfflineMbTilesLayer } from 'gisq-ol-mobile-offline';

class OfflineTileLayer {
  constructor(map) {
    this.map = map;
  }

  generate(data) {
    return new Promise((resolve) => {
      this.plusReady(() => {
        let localMbTilesPath = data.url;
        let metadata = GisqOfflineMbTilesLayer.getMedata(localMbTilesPath);
        if (typeof metadata === 'string') {
          metadata = JSON.parse(metadata);
        }
        registerProj(metadata.srs);
        let proj = getProj(metadata.srs);
        let origin = metadata.origin.split(',');
        let bounds = metadata.bounds.split(',');
        let resAndSacles = metadata.resolution.split(';');
        let resolutions = [];
        for (let resAndSacle of resAndSacles) {
          if (resAndSacle && resAndSacle.length > 0) {
            let res = parseFloat(resAndSacle.split('_')[0]);
            resolutions.push(res);
          }
        }
        for (let i in origin) {
          origin[i] = parseFloat(origin[i]);
        }
        for (let i in bounds) {
          bounds[i] = parseFloat(bounds[i]);
        }
        var nativeLayers = new GisqOfflineMbTilesLayer({
          path: localMbTilesPath,
          projection: proj,
          resolutions: resolutions,
          origin: origin,
          tileType: 'arcgis'
        });
        let layer = nativeLayers.getLayer();
        layer.set('id', data.id);
        layer.set('info', data);
        layer.set('layerTag', data.layerTag);
        layer.setOpacity(data.opacity);
        layer.setZIndex(data.mapIndex);
        layer.set('isFit', data.isFit);
        layer.set('initExtent', bounds);
        resolve(layer);
      });
    });
  }

  plusReady(callback) {
    if (window.plus) {
      callback();
    } else {
      document.addEventListener('plusready', callback);
    }
  }
}

export default OfflineTileLayer;
