import GeoJSON from 'ol/format/GeoJSON';
import WFS from 'ol/format/WFS';
import { getForViewAndSize } from 'ol/extent';
import Polygon from 'ol/geom/Polygon';
import Feature from 'ol/Feature';
import { and as andFilter, intersects } from 'ol/format/filter';

class IdentifyTask {
  constructor(layerOption) {
    this.layerOption = layerOption;
    this.geojsonFormat = new GeoJSON();
  }

  execute(identifyParameters) {
    return new Promise((resolve) => {
      let url = this.layerOption.url;
      if (!url.includes('authkey') && this.layerOption.authkey) {
        let connect = url.includes('?') ? '&' : '?';
        url += connect + 'authkey=' + this.layerOption.authkey;
      }
      this.geoserverQuery(url, identifyParameters).then((wfsFeatures) => {
        let results = [],
          identifyResult = {};
        wfsFeatures.forEach((feature) => {
          let result = {
            layerLabel: this.layerOption.label,
            layerId: this.layerOption.id,
            isPop: this.layerOption.isPop,
            layerTag: this.layerOption.layerTag,
            feature: feature,
            titleKey: this.layerOption.titleKey,
            identifySet: this.layerOption.identifyField
          };
          results.push(result);
        });
        identifyResult.type = 'geoserver';
        identifyResult.results = results;
        resolve(identifyResult);
      });
    });
  }

  /**
   * geoserver 服务使用feature相交查询
   * @param url
   * @param feature
   * @param identifyParameters
   * @returns {Promise}
   */
  geoserverQuery(url, identifyParameters) {
    let filter = identifyParameters.filter;
    if (identifyParameters.coordinate) {
      let size = [10, 10]; //缓冲范围
      let geomStr = this.layerOption.geomStr
        ? this.layerOption.geomStr
        : 'the_geom';
      let viewResolution = identifyParameters.map.getView().getResolution();
      let extent = getForViewAndSize(
        identifyParameters.coordinate,
        viewResolution,
        0,
        size
      );
      let polygon = new Polygon([
        [
          [extent[0], extent[1]],
          [extent[0], extent[3]],
          [extent[2], extent[3]],
          [extent[2], extent[1]],
          [extent[0], extent[1]]
        ]
      ]);
      let feature = new Feature({
        geometry: polygon
      });
      filter = identifyParameters.filter
        ? andFilter(
            identifyParameters.filter,
            intersects(geomStr, feature.getGeometry())
          )
        : intersects(geomStr, feature.getGeometry());
    }
    let featureRequest = new WFS().writeGetFeature({
      //坐标系统
      srsName: identifyParameters.projection.getCode(),
      //命名空间
      featureNS: '',
      //工作区名称
      featurePrefix: this.layerOption.visibleLayers[0].split(':')[0],
      //查询图层
      featureTypes: this.layerOption.visibleLayers,
      outputFormat: 'application/json',
      geometryName: identifyParameters.geomStr || 'the_geom',
      filter
    });
    //WFS服务地址
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        body: new XMLSerializer().serializeToString(featureRequest)
      })
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          let feaArr = [];
          let jf = json.features;
          feaArr = jf.map((item) => {
            return this.geojsonFormat.readFeature(JSON.stringify(item));
          });
          resolve(feaArr);
        })
        .catch((error) => {
          resolve([]);
          reject(error);
        });
    });
  }
}

export default IdentifyTask;
