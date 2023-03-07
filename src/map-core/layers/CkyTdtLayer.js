/**
 * @fileOverview 测科院天地图WMTS服务API
 * @author huht
 * @version 1.0
 */
import { getWidth, getTopLeft, applyTransform } from 'ol/extent';
import WMTS from 'ol/tilegrid/WMTS';
import { XYZ as XYZSource } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import { get as getProjection, getTransform } from 'ol/proj';

class CkyTdtLayer {
  generate(data) {
    return new Promise((resolve) => {
      const projection = getProjection('EPSG:4490');
      const projectionExtent = projection.getExtent();
      const origin = projectionExtent
        ? getTopLeft(projectionExtent)
        : [-180, 90];
      const fromLonLat = getTransform('EPSG:4326', projection);
      const width = projectionExtent
        ? getWidth(projectionExtent)
        : getWidth(applyTransform([-180.0, -90.0, 180.0, 90.0], fromLonLat));
      const resolutions = [];
      const matrixIds = [];
      for (let z = 1; z < 19; z++) {
        resolutions[z] = width / (256 * Math.pow(2, z));
        matrixIds[z] = z;
      }
      const wmtsTileGrid = new WMTS({
        origin: origin,
        resolutions: resolutions,
        matrixIds: matrixIds
      });
      const wmtsSource = new XYZSource({
        crossOrigin: 'anonymous',
        projection: 'EPSG:4490',
        tileGrid: wmtsTileGrid,
        url:
          data.url +
          '?x={x}&y={y}&l={z}&styleId=' +
          data.visibleLayers[0] +
          '&tilesize=256',
        /* tileUrlFunction: function () {
                    return data.url + "?x={x}&y={y}&l={z}&styleId=" + data.visibleLayers[0] + " &tilesize=256"
                }, */
        wrapX: true
      });
      const wmtsLayer = new TileLayer({
        id: data.id,
        info: data,
        layerTag: data.layerTag,
        opacity: 1,
        zIndex: data.mapIndex,
        isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
        source: wmtsSource
      });
      resolve(wmtsLayer);
    });
  }
}

export default CkyTdtLayer;
