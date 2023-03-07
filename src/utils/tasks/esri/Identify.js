import EsriJSON from 'ol/format/EsriJSON';
import GeoJSON from 'ol/format/GeoJSON';
import Point from 'ol/geom/Point';
import Task from './Task';
import { getEsriSpatialReference } from '../../../utils/olUtil';

export default class Query extends Task {
  /**
   * Query查询实例化
   * @param {*} url arcgis 矢量服务地址
   * @param {*} options {returnGeometry:true,layers:[],layerDefs:'',returnZ:false,returnM:false}
   */
  constructor(url, options, layerOption) {
    super();
    this.path = 'identify'; // 服务接口
    this.params = {
      layers: 'all',
      tolerance: 3,
      returnGeometry: true
    };
    this.url = url + '/' + this.path;
    this.layerOption = layerOption;
    this.geojsonFormat = new GeoJSON();
    this.esrijsonFormat = new EsriJSON();
    if (options) {
      if (options.returnGeometry === true || options.returnGeometry === false) {
        this.params.returnGeometry = options.returnGeometry;
      }
      if (options.layers) {
        this.params.layers = options.layers;
      }
      if (options.layerDefs) {
        this.params.layerDefs = options.layerDefs;
      }
      if (options.returnZ === true || options.returnZ === false) {
        this.params.returnZ = options.returnZ;
      }
      if (options.returnM === true || options.returnM === false) {
        this.params.returnM = options.returnM;
      }
      if (options.authkey) {
        this.params.authkey = options.authkey;
      }
    }
  }

  /**
   * i查询
   * @param {*} position 查询的几何-geojson格式/Array
   * @param {*} map 地图对象
   * @param {*} options 其他参数
   */
  at(
    position,
    { map, viewer },
    { cartesian, tileWidth, tileHeight, rectangle }
  ) {
    let geometry;
    let esriSpatialReference;
    if (map) {
      geometry = position;
      esriSpatialReference = getEsriSpatialReference(
        map.getView().getProjection().getCode()
      );
      this.params.sr = esriSpatialReference;
      this.params.width = map.getSize()[0];
      this.params.height = map.getSize()[1];
      this.params.imageDisplay = [this.params.width, this.params.height, 96];
      const extent = map.getView().calculateExtent(map.getSize());
      this.params.mapExtent = {
        xmin: extent[0],
        ymin: extent[1],
        xmax: extent[2],
        ymax: extent[3],
        spatialReference: esriSpatialReference
      };
    } else if (viewer) {
      this.cartesian = cartesian;
      this.position = position;
      const sr = '4326';
      const point = new Point(position);
      geometry = this.geojsonFormat.writeGeometry(point);
      this.params.sr = sr;
      this.params.width = tileWidth;
      this.params.height = tileHeight;
      this.params.imageDisplay = [this.params.width, this.params.height, 96];
      this.params.mapExtent = `${rectangle.west},${rectangle.south},${rectangle.east},${rectangle.north}`;
    }
    this._setGeometryParams(geometry, esriSpatialReference);
    return this;
  }

  /**
   * 时间段查询
   * @param {*} start
   * @param {*} end
   */
  between(start, end) {
    this.params.time = [start.valueOf(), end.valueOf()];
    return this;
  }

  run(callback, context) {
    return new Promise((resolve, reject) => {
      this.request((error, response) => {
        const { serverOrigin, label, id, isPop, layerTag } = this.layerOption;
        const identifyResult = {
          type: serverOrigin,
          results: [],
          layerLabel: label,
          layerId: id,
          isPop,
          layerTag
        };
        const results = [];
        if (response?.results?.length > 0) {
          response.results.forEach((element) => {
            const feature = this.esrijsonFormat.readFeature(element);
            const attributes = element.attributes;

            const result = {
              identifyField: this.layerOption.identifyField?.find(
                (ele) => ele.layerId === element.layerId
              ),
              geometry: this.geojsonFormat.writeGeometry(feature.getGeometry()),
              attributes
            };
            // 三维模式下查询使用鼠标点击位置作为弹窗位置
            if (this.cartesian) {
              result.cartesian = this.cartesian;
              result.position = this.position;
            }
            results.push(result);
          });
          identifyResult.results = results;
        }
        if (callback) {
          callback.call(context, error, identifyResult);
        }
        if (error) {
          reject(error);
        } else {
          resolve(identifyResult);
        }
      }, context);
    });
  }

  _setGeometryParams(geojson, esriSpatialReference) {
    const geometry = this.geojsonFormat.readGeometry(geojson);
    const esriGeometry = this.esrijsonFormat.writeGeometryObject(geometry);
    if (esriSpatialReference) {
      esriGeometry.spatialReference = {
        wkid: esriSpatialReference
      };
    }
    this.params.geometry = esriGeometry;
    this.params.geometryType = this.geojsonTypeToArcGIS(geometry.getType());
    if (
      this.params.geometryType !== 'esriGeometryPoint' &&
      this.params.geometryType !== 'esriGeometryPolyline'
    ) {
      this.params.tolerance = 0;
    }
  }
}
