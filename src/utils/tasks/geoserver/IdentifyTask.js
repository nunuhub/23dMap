import GeoJSON from 'ol/format/GeoJSON';
import WFS from 'ol/format/WFS';
import { intersects, and } from 'ol/format/filter';
import { transform } from 'ol/proj';
import { buffer as turfBuffer } from '@turf/turf';
import Point from 'ol/geom/Point';
import CQL from '../../format/CQL';

class IdentifyTask {
  constructor() {
    this.geojsonFormat = new GeoJSON();
    this.identifyParameters;
  }

  execute(params) {
    this.identifyParameters = params;
    return new Promise((resolve) => {
      let url = this.identifyParameters.layerOption.url;
      if (
        !url.includes('authkey') &&
        this.identifyParameters.layerOption.authkey
      ) {
        let connect = url.includes('?') ? '&' : '?';
        url +=
          connect + 'authkey=' + this.identifyParameters.layerOption.authkey;
      }
      this._geoserverQuery(url).then((features) => {
        const { serverOrigin, label, id, isPop, layerTag } =
          this.identifyParameters.layerOption;
        const identifyResult = {
          type: serverOrigin,
          results: [],
          layerLabel: label,
          layerId: id,
          isPop,
          layerTag
        };
        const results = [];
        features.forEach((feature) => {
          const featureTarget = feature.id_.slice(
            0,
            feature.id_.lastIndexOf('.')
          );
          const attributes = feature.getProperties();
          delete attributes.geometry;
          let result = {
            identifyField:
              this.identifyParameters.layerOption.identifyField?.find(
                (item) => item.name === featureTarget
              ),
            geometry: this.geojsonFormat.writeGeometry(feature.getGeometry()),
            attributes
          };
          // 三维模式下查询使用鼠标点击位置作为弹窗位置
          if (this.identifyParameters.viewer) {
            result.cartesian = this.identifyParameters.cartesian;
            result.position = this.identifyParameters.position;
          }
          results.push(result);
        });
        identifyResult.results = results;
        resolve(identifyResult);
      });
    });
  }

  /**
   * geoserver 服务使用feature相交查询
   * @param url
   * @returns {Promise}
   */
  _geoserverQuery(url) {
    const geometry = this._getIdentifyGeometry();
    const geomStr = this.identifyParameters.layerOption.geoStr
      ? this.identifyParameters.layerOption.geoStr
      : 'the_geom';
    let filterStr = this.identifyParameters.layerOption._filter
      ? this.identifyParameters.layerOption._filter
      : this.identifyParameters.layerOption.filter;
    let cqlFilter;
    if (filterStr) {
      cqlFilter = new CQL().read(filterStr);
    }

    const intersectsFilter = intersects(geomStr, geometry);
    let filter = cqlFilter
      ? and(cqlFilter, intersectsFilter)
      : intersectsFilter;

    let featureRequest = new WFS().writeGetFeature({
      //坐标系统
      srsName: this.identifyParameters.projectionCode,
      //命名空间
      featureNS: '',
      //工作区名称
      featurePrefix: '',
      //查询图层
      featureTypes: this.identifyParameters.layers,
      outputFormat: 'application/json',
      geometryName: this.identifyParameters.layerOption.geoStr || 'the_geom',
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
        .then((response) => {
          let features = [];
          features = response.features.map((item) => {
            return this.geojsonFormat.readFeature(JSON.stringify(item));
          });
          resolve(features);
        })
        .catch((error) => {
          resolve([]);
          reject(error);
        });
    });
  }

  /**
   * 获取buffer后的Geometry
   */
  _getIdentifyGeometry() {
    // 点查询
    if (this.identifyParameters.coordinate) {
      const point = this.geojsonFormat.writeGeometryObject(
        new Point(
          // turf buffer只支持经纬度坐标
          transform(
            this.identifyParameters.coordinate,
            this.identifyParameters.projectionCode,
            'EPSG:4326'
          )
        )
      );
      const buffered = turfBuffer(
        point,
        (this.identifyParameters.tolerance *
          this.identifyParameters.resolution) /
          1000
      );
      return this.geojsonFormat
        .readFeature(buffered)
        .getGeometry()
        .transform('EPSG:4326', this.identifyParameters.projectionCode);
    } else {
      const geometry = this.geojsonFormat.readGeometry(
        this.identifyParameters.position
      );
      if (geometry.getType() === 'LineString') {
        const transformedGeometry = geometry.transform(
          this.identifyParameters.projectionCode,
          'EPSG:4326'
        );
        const buffered = turfBuffer(
          this.geojsonFormat.writeGeometryObject(transformedGeometry),
          (this.identifyParameters.tolerance *
            this.identifyParameters.resolution) /
            1000
        );
        return this.geojsonFormat
          .readFeature(buffered)
          .getGeometry()
          .transform('EPSG:4326', this.identifyParameters.projectionCode);
      } else {
        return geometry;
      }
    }
  }
}

export default IdentifyTask;
