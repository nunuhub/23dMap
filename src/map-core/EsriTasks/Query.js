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
   * @param {*} options {returnGeometry:true,where:'1=1',outSR:EPSG:4326,returnZ:false,returnM:false}
   */
  constructor(url, options) {
    super();
    this.path = 'query'; // 服务接口
    this.params = {
      returnGeometry: true,
      where: '1=1',
      outFields: '*',
      returnZ: false,
      returnM: false
    };
    this.url = url + '/' + this.path;
    if (options) {
      if (options.returnGeometry === true || options.returnGeometry === false) {
        this.params.returnGeometry = options.returnGeometry;
      }
      if (options.where) {
        this.params.where = options.where;
      }
      if (options.outSR) {
        this.params.outSR = getEsriSpatialReference(options.outSR);
      }
      if (options.returnZ === true || options.returnZ === false) {
        this.params.returnZ = options.returnZ;
      }
      if (options.returnM === true || options.returnM === false) {
        this.params.returnM = options.returnM;
      }
      if (options.envelope) {
        this.params.geometry = options.envelope;
      }
      if (options.authkey) {
        this.params.authkey = options.authkey;
      }
    }
  }

  /**
   * 包含查询 返回的地块完全包含在搜索的几何图形中。
   * @param {*} geometry openlayers的geometry对象
   * @param {*} projCode 如EPSG:4490
   */
  within(geometry, projCode) {
    this._setGeometryParams(geometry, projCode);
    this.params.spatialRel = 'esriSpatialRelContains'; // to the REST api this reads geometry **contains** layer
    return this;
  }

  /**
   * 相交查询，返回图层中与指定图形相交的地块。
   * @param {*} geometry openlayers的geometry对象
   * @param {*} projCode 如EPSG:4490
   */
  intersects(geometry, projCode) {
    this._setGeometryParams(geometry, projCode);
    this.params.spatialRel = 'esriSpatialRelIntersects';
    return this;
  }

  /**
   * 包含查询 返回的地块完全包含搜索的几何图形。
   * @param {*} geometry openlayers的geometry对象
   * @param {*} projCode 如EPSG:4490
   */
  contains(geometry, projCode) {
    this._setGeometryParams(geometry, projCode);
    this.params.spatialRel = 'esriSpatialRelWithin'; // to the REST api this reads geometry **within** layer
    return this;
  }

  /**
   * 如果两个形状的内部交集不是空的，并且其尺寸小于两个形状的最大尺寸，则返回特征。共用一个端点的两条线不会相交。适用于线条/线条、线条/区域、多点/区域和多点/线条形状类型组合。
   * @param {*} geometry openlayers的geometry对象
   * @param {*} projCode 如EPSG:4490
   */
  crosses(geometry, projCode) {
    this._setGeometryParams(geometry, projCode);
    this.params.spatialRel = 'esriSpatialRelCrosses';
    return this;
  }

  /**
   * 如果两个形状共享一个公共边界，则返回特征。但是，两个形状的内部交叉点必须为空。在点/线的情况下，点可能只接触线的端点。适用于除点/点以外的所有组合
   * @param {*} geometry openlayers的geometry对象
   * @param {*} projCode 如EPSG:4490
   */
  touches(geometry, projCode) {
    this._setGeometryParams(geometry, projCode);
    this.params.spatialRel = 'esriSpatialRelTouches';
    return this;
  }

  /**
   * 如果两个形状的交集产生同一维度但不同于两个形状的对象，则返回特征。适用于面积/面积、线/线和多点/多点形状类型组合。
   * @param {*} geometry openlayers的geometry对象
   * @param {*} projCode 如EPSG:4490
   */
  overlaps(geometry, projCode) {
    this._setGeometryParams(geometry, projCode);
    this.params.spatialRel = 'esriSpatialRelOverlaps';
    return this;
  }

  /**
   * 如果两个形状的外接矩形相交，则返回
   * @param {*} geometry openlayers的geometry对象
   * @param {*} projCode 如EPSG:4490
   */
  bboxIntersects(geometry, projCode) {
    this._setGeometryParams(geometry, projCode);
    this.params.spatialRel = 'esriSpatialRelEnvelopeIntersects';
    return this;
  }

  /**
   * 如果查询几何图形的外接矩形与目标几何图形的索引项相交，则返回特征
   * @param {*} geometry openlayers的geometry对象
   * @param {*} projCode 如EPSG:4490
   */
  indexIntersects(geometry, projCode) {
    this._setGeometryParams(geometry, projCode);
    this.params.spatialRel = 'esriSpatialRelIndexIntersects'; // Returns a feature if the envelope of the query geometry intersects the index entry for the target geometry
    return this;
  }

  // only valid for Feature Services running on ArcGIS Server 10.3+ or ArcGIS Online
  /**
   * 仅对运行在ArcGIS服务器10.3+或ArcGIS Online上的功能服务有效
   * @param {*} point openlalyers几何对象
   * @param {*} radius 缓冲距离
   * @param {*} projCode 如EPSG:4490
   */
  nearby(point, projCode, radius) {
    this._setGeometryParams(point, projCode);
    this.params.spatialRel = 'esriSpatialRelIntersects';
    this.params.units = 'esriSRUnit_Meter';
    this.params.distance = radius;
    return this;
  }

  /**
   * 属性查询
   * @param {*} string
   */
  where(string) {
    this.params.where = string;
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

  simplify(map, factor) {
    var mapWidth = Math.abs(
      map.getBounds().getWest() - map.getBounds().getEast()
    );
    this.params.maxAllowableOffset = (mapWidth / map.getSize().y) * factor;
    return this;
  }

  orderBy(fieldName, order) {
    order = order || 'ASC';
    this.params.orderByFields = this.params.orderByFields
      ? this.params.orderByFields + ','
      : '';
    this.params.orderByFields += [fieldName, order].join(' ');
    return this;
  }

  run(callback, context) {
    this._cleanParams();
    return new Promise((resolve, reject) => {
      this.request(function (error, response) {
        if (response && response.features && response.features.length > 0) {
          var esrijsonFormat = new EsriJSON();
          const features = [];
          response.features.forEach((element) => {
            const feature = esrijsonFormat.readFeature(element);
            features.push(feature);
          });
          response.features = features;
          // 兼容I格式
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
  }

  count(callback, context) {
    this._cleanParams();
    this.params.returnCountOnly = true;
    return this.request(function (error, response) {
      callback.call(context, error, response);
    }, context);
  }

  ids(callback, context) {
    this._cleanParams();
    this.params.returnIdsOnly = true;
    return this.request(function (error, response) {
      callback.call(context, error, response);
    }, context);
  }

  distinct() {
    // geometry must be omitted for queries requesting distinct values
    this.params.returnGeometry = false;
    this.params.returnDistinctValues = true;
    return this;
  }

  // only valid for map services
  layer(layer) {
    this.path = layer + '/query';
    return this;
  }

  _trapSQLerrors(error) {
    if (error) {
      if (error.code === '400') {
        console.warn.apply(
          'one common syntax error in query requests is encasing string values in double quotes instead of single quotes'
        );
      }
    }
  }

  _cleanParams() {
    delete this.params.returnIdsOnly;
    delete this.params.returnExtentOnly;
    delete this.params.returnCountOnly;
  }

  _setGeometryParams(geometry, projCode) {
    var esrijsonFormat = new EsriJSON();
    const esriGeometry = esrijsonFormat.writeGeometryObject(geometry);
    // esriGeometry.spatialReference =getEsriSpatialReference(projCode);
    this.params.inSR = getEsriSpatialReference(projCode);
    this.params.geometry = esriGeometry;
    this.params.geometryType = this.geojsonTypeToArcGIS(geometry.getType());
  }
}
