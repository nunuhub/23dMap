import { postFromAdmin, parseResult } from '../utils/httprequest';
import GeoJSON from 'ol/format/GeoJSON';

class XZQ {
  constructor(url, layerName, token) {
    this.url = url;
    this.layerName = layerName;
    this.token = token;
    this.geoJSON = new GeoJSON();
  }

  /**
   * 通过行政区代码判断当前行政区的级别
   * @param code 行政区代码
   * @return level {Number}行政区级别
   * */
  judgeLevel(code) {
    if (typeof code !== 'string') {
      code = code.toString();
    }
    if (
      (code.length === 6 && code.substring(2, 6) === '0000') ||
      code.length === 2
    ) {
      return 1;
    } else if (
      // 市级
      code.length === 6 &&
      code.substring(4, 6) === '00' &&
      (code.substring(2) !== '0' || code.substring(3) !== '0')
    ) {
      return 2;
    } else if (code.length === 4) {
      return 2;
    } else if (code.length === 6 && code.substring(4, 6) !== '00') {
      // 县级
      return 3;
    } else if (
      code.length === 9 ||
      (code.length === 12 && code.substring(9, 12) === '000')
    ) {
      // 街道级
      return 4;
    } else if (code.length >= 12) {
      // 村级
      return 5;
    } else if (code.length === 0) {
      return '';
    } else {
      console.error('初始代码不合法！');
      return;
    }
  }

  /**
   * 通过行政区代码，获取行政区图形的标准geojson数据
   * @param code {Number | String} 行政区代码
   * @return GeoJSON {Object} 标准geojson格式对象
   * @example {geometry: {type: 'MultiPolygon', coordinates: Array(1)}
   * properties: {xzqdm: '330782', xzqmc: '义乌市'}
   * type: "Feature"}
   *  */
  getGeometry(xzqdm) {
    if (typeof xzqdm !== 'string') {
      xzqdm = xzqdm.toString();
    }
    return new Promise((resolve, reject) => {
      var level = this.judgeLevel(xzqdm);
      let param = {
        conditionList: [
          {
            column: 'xzqdm',
            condition: '=',
            isXzqdm: true,
            value: xzqdm
          }
        ],
        getColumns: ['geom', 'xzqdm', 'xzqmc'],
        level: level
      };
      postFromAdmin(
        this.url + '/' + 'getGeoJsonByCondition' + '/' + this.layerName,
        JSON.stringify(param),
        {
          headers: {
            'Content-Type': 'application/json'
          },
          token: this.token
        }
      )
        .then((res) => {
          let result = parseResult(res);
          if (result.success) {
            // 定位业务
            let jsonObj = JSON.parse(result.data);
            jsonObj.geometry.crs
              ? (this.dataProjection = jsonObj.geometry.crs.properties.name)
              : (this.dataProjection = 'EPSG:4490');
            // let feature = this.geoJSON.readFeature(jsonObj);
            resolve(jsonObj);
          } else {
            reject('获取行政区图形数据失败');
          }
        })
        .catch((e) => {
          if (e) reject('获取行政区图形数据异常');
        });
    });
  }

  /**
   * 通过行政区代码只获取行政区属性数据
   * @param code {Number | String} 行政区代码
   * @param init {Boolean} 是否从全国开始
   * @return xzqNameList {Object} 行政区属性对象
   * @example {xzqdm:140000,xzqmc:'山西省'}
   * */
  getProperty(code) {
    var isInit = false;
    if (!code) {
      isInit = true;
    }
    return new Promise((resolve, reject) => {
      let param = {
        conditionList: [
          {
            column: 'xzqdm',
            condition: '=',
            isXzqdm: true,
            value: code
          }
        ],
        getColumns: ['xzqdm', 'xzqmc'],
        level: this.judgeLevel(code),
        init: isInit
      };
      postFromAdmin(
        this.url + '/' + 'getProperties' + '/' + this.layerName,
        JSON.stringify(param),
        {
          headers: {
            'Content-Type': 'application/json'
          },
          token: this.token
        }
      )
        .then((res) => {
          let result = parseResult(res);
          if (result.success) {
            resolve(result.data);
          } else {
            resolve([]);
            this.noData = true;
          }
        })
        .catch((e) => {
          if (e) reject('请求行政区属性数据失败');
        });
    });
  }
  /**
   * 通过行政区代码获取该行政区的下一级（子行政区）列表
   * @param code {Number | String} 行政区代码
   * 如果不传code ，或者code为''，则会返回全国所有省级行政区属性数据
   * @return  {Object} 行政区属性对象
   * */
  getSubXZQList(code) {
    var isInit = false;
    return new Promise((resolve, reject) => {
      if (!code) {
        code = '';
        isInit = true;
      }
      if (typeof code !== 'string') {
        code = code.toString();
      }
      let level = this.judgeLevel(code) + 1;
      let param = {
        conditionList: [
          {
            column: 'xzqdm',
            condition: '=',
            isXzqdm: true,
            value: code
          }
        ],
        getColumns: ['xzqdm', 'xzqmc'],
        level: level,
        init: isInit
      };
      postFromAdmin(
        this.url + '/' + 'getProperties' + '/' + this.layerName,
        JSON.stringify(param),
        {
          headers: {
            'Content-Type': 'application/json',
            token: this.token
          }
        }
      ).then((res) => {
        if (res.data) {
          resolve(res.data);
        } else {
          reject('子行政区列表请求出错');
        }
      });
    });
  }
}
export default XZQ;
