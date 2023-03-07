import { transform } from 'ol/proj';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import LinearRing from 'ol/geom/LinearRing';
import { locationGeometry } from '../common';
import { registerProj } from 'shinegis-client-23d/src/map-core/CustomProjection';
import { selectStyles } from 'shinegis-client-23d/src/utils/olUtil';

class CustomizeParser {
  constructor(_opt) {
    _opt = Object.assign({}, _opt);
    this.map = _opt.map;
    this.importFiles = _opt.importFiles;
    this.importFileType = _opt.importFileType;
    this.importFileExt = _opt.importFileExt;
    this.mapProjectionCode = _opt.mapProjectionCode;
    this.mapDelNo = _opt.mapDelNo;
    this.mapProjectionName = _opt.mapProjectionName;
    this.sumArray = [];
    // 用于根据带号计算坐标系的基准
    this.prodeta = {
      CGCS2000: '4488',
      xian80: '2324'
    };
    // 文件坐标无带号，当前地图也无带号时，文件坐标系取默认值
    this.defaultFIleProjection = {
      CGCS2000: 'EPSG:4549',
      xian80: 'EPSG:2385'
    };
    // CGCS2000和xian80的地理坐标系
    this.degreeProjection = {
      CGCS2000: 'EPSG:4490',
      xian80: 'EPSG:4610'
    };
    /**
     * 文件坐标系
     * {"CGCS2000" || "xian80"}
     */
    this.fileProjection = 'CGCS2000';
  }
  process() {
    // 所有异步读取文件的Promise
    let asyncPromises = [];
    this.importFiles.forEach((file) => {
      let fileReader = new FileReader();
      asyncPromises.push(
        new Promise((resolve, reject) => {
          fileReader.readAsText(file.raw, 'UTF-8');
          fileReader.onload = (e) => {
            let result = e.target.result;
            if (result.includes('J1')) {
              return reject(new Error('文件内容不符合自定义文件格式标准'));
            }

            let resultArray =
              result.indexOf('\r\n') > -1
                ? result.split('\r\n')
                : result.split('\n');
            // 删除所有空行
            for (let i = 0, l = resultArray.length; i < l; i++) {
              if (resultArray[i] === '') {
                resultArray.splice(i, 1);
                --i;
              }
            }
            this.stringTransform(resultArray, resolve, reject);
          };
        })
      );
    });
    return Promise.all(asyncPromises);
  }
  projectionTransform(coordinate, reject) {
    // 源坐标系(文件坐标系) EPSG
    let fileProjectionCode;
    if (coordinate[0] >= -180 && coordinate[0] <= 180) {
      // 经纬度
      fileProjectionCode = this.degreeProjection[this.fileProjection];
    } else if (coordinate[0].toFixed().length === 6) {
      // 无带号
      if (this.mapDelNo !== '' && this.mapDelNo !== 0) {
        // 当前地图有带号
        coordinate[0] = Number('' + this.mapDelNo + coordinate[0]);
        fileProjectionCode =
          'EPSG:' +
          (Number(this.prodeta[this.fileProjection]) + Number(this.mapDelNo));
      } else {
        fileProjectionCode = this.defaultFIleProjection[this.fileProjection];
      }
    } else if (coordinate[0].toFixed().length === 8) {
      // 有带号
      // 文件中的坐标带号
      let fileDelNo = coordinate[0].toString().substring(0, 2);
      fileProjectionCode =
        'EPSG:' +
        (Number(this.prodeta[this.fileProjection]) + Number(fileDelNo));
    } else {
      return reject('存在坐标格式有误的文件');
    }
    registerProj(fileProjectionCode);
    return transform(coordinate, fileProjectionCode, this.mapProjectionCode);
  }
  recursion(arr) {
    var currentIndex = 0;
    arr.forEach((el, index) => {
      if (el === arr[0] && index !== 0) {
        currentIndex = index;
        return;
      }
    });
    let temp = arr.splice(0, currentIndex + 1);
    this.sumArray.push(temp);
    if (arr.length > 0) {
      // 去除数组中第一个文字信息元素
      let pattern = /导出面数据[0-9][0-9]*/g;
      let arrMatch = arr[0].match(pattern);
      if (arrMatch && arrMatch.length > 0) {
        let exportStr = arrMatch[0];
        if (arr[0] === exportStr) {
          arr.shift();
        } else {
          arr[0] = arr[0].replace(exportStr + '\n', '');
        }
      }

      this.recursion(arr);
    }
  }
  stringTransform(resultArray, resolve, reject) {
    // 去除数组中第一个文字信息元素
    if (resultArray[0] === '导出面数据0') {
      resultArray.shift();
    } else {
      resultArray[0] = resultArray[0].replace('导出面数据0\n', '');
    }
    if (resultArray.length > 0) {
      // 1.切割坐标串，切割成若干个数组
      this.recursion(resultArray);
      let allFeatures = [];
      let allGeometrys = [];
      this.sumArray.forEach((poly) => {
        var twoDArray = [];
        poly.forEach((str) => {
          twoDArray.push(str.split(','));
        });
        var featureArray = [];
        twoDArray.forEach((arr) => {
          var tempArr = [];
          arr.forEach((str) => {
            tempArr.push(parseFloat(str));
          });
          featureArray.push(tempArr);
        });

        var finalArray = featureArray.map((f) => this.projectionTransform(f));

        // 将地块添加到地图上
        let featureCoord = [];
        featureCoord[0] = { attributes: {}, coordinates: [finalArray] };
        let { features, geometrys } = this.addFeatureToMap(
          featureCoord,
          reject
        );
        allFeatures = allFeatures.concat(features ? features : []);
        allGeometrys = allGeometrys.concat(geometrys ? geometrys : []);
      });
      locationGeometry(this.map, allGeometrys);
      resolve(allFeatures);
    } else {
      return reject(new Error('自定义文件格式有误'));
    }
  }
  /**
   * 将数组中的坐标信息转化为geometry，并添加到地图上
   * @param {Array} featureCoordinates
   * @param {Function} resolve
   * @param {Function} reject
   */
  addFeatureToMap(featureCoordinates, reject) {
    try {
      // 所有的地块  Array.<ol.Feature>
      let features = [];
      let geometrys = [];
      // 遍历坐标数组，生成openlayers中的ol.Feature
      featureCoordinates.forEach((polygonInfo) => {
        let feature = new Feature();
        let polygonGeometry = new Polygon([]);
        // 遍历坐标
        polygonInfo.coordinates.forEach((linearRingCoordinates) => {
          let linearRing = new LinearRing([]);
          linearRing.setCoordinates(linearRingCoordinates);
          polygonGeometry.appendLinearRing(linearRing);
        });
        feature.setGeometry(polygonGeometry);
        geometrys.push(polygonGeometry);
        // 遍历属性信息
        for (let key in polygonInfo.attributes) {
          feature.set(key, polygonInfo.attributes[key]);
        }
        feature.setStyle(selectStyles);
        feature.set('tempSelected', true);
        feature.set('isImport', true);
        features.push(feature);
      });
      // 添加ol.Feature到临时图层
      this.map.getLayerById('drawLayer').getSource().addFeatures(features);
      return { features, geometrys };
    } catch (error) {
      reject('导入出错：' + error);
    }
  }
}
export default CustomizeParser;
