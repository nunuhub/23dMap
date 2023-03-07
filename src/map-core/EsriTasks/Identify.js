import EsriJSON from 'ol/format/EsriJSON';
import Task from './Task';
import { getEsriSpatialReference } from '../../utils/olUtil';

/**
 *
 */
export default class Query extends Task {
  /**
   * Query查询实例化
   * @param {*} url arcgis 矢量服务地址
   * @param {*} options {returnGeometry:true,layers:[],layerDefs:'',returnZ:false,returnM:false}
   */
  constructor(url, options) {
    super();
    this.path = 'identify'; // 服务接口
    this.params = {
      layers: 'all',
      tolerance: 3,
      returnGeometry: true
    };
    this.url = url + '/' + this.path;
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
   * @param {*} geometry 查询的几何
   * @param {*} map 地图对象
   */
  at(geometry, map) {
    const esriSpatialReference = getEsriSpatialReference(
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
      this.request(function (error, response) {
        if (response && response.results && response.results.length > 0) {
          var esrijsonFormat = new EsriJSON();
          const features = [];
          response.results.forEach((element) => {
            const feature = esrijsonFormat.readFeature(element);
            feature.layerId = element.layerId;
            feature.layerName = element.layerName;
            feature.displayFieldName = element.displayFieldName;
            feature.value = element.value;
            features.push(feature);
          });
          response.results = features;
          response.type = 'arcgis';
        }
        if (callback) {
          callback.call(context, error, response);
        }
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      }, context);
    });
    // return this.request(function (error, response) {
    //     if (response && response.results && response.results.length > 0) {
    //         var esrijsonFormat = new EsriJSON();
    //         let features = [];
    //         response.results.forEach(element => {
    //             let feature = esrijsonFormat.readFeature(element);
    //             feature.layerId=element.layerId;
    //             feature.layerName=element.layerName;
    //             feature.displayFieldName=element.displayFieldName;
    //             feature.value=element.value;
    //             features.push(feature);
    //         })
    //         response.results = features;
    //     }
    //     callback.call(context, error, response);
    // }, context);
  }

  _setGeometryParams(geometry, esriSpatialReference) {
    var esrijsonFormat = new EsriJSON();
    const esriGeometry = esrijsonFormat.writeGeometryObject(geometry);
    if (esriSpatialReference) {
      esriGeometry.spatialReference = esriSpatialReference;
    }
    this.params.geometry = esriGeometry;
    this.params.geometryType = this.geojsonTypeToArcGIS(geometry.getType());
  }
}
