import { transform } from 'ol/proj';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import LinearRing from 'ol/geom/LinearRing';
import { locationGeometry } from '../common';
import { registerProj } from 'shinegis-client-23d/src/map-core/CustomProjection';
import { newGuid } from '../common';
import { selectStyles } from 'shinegis-client-23d/src/utils/olUtil';
import { MultiPolygon } from 'ol/geom';
/**
 * 导入国土资源部标准格式文件解析器
 */
class GTJZDParser {
  constructor(_opt) {
    _opt = Object.assign({}, _opt);
    this.map = _opt.map;
    this.allGeometry = [];
    this.importFiles = _opt.importFiles;
    this.importFileType = _opt.importFileType;
    this.importFileExt = _opt.importFileExt;
    this.mapProjectionCode = _opt.mapProjectionCode;
    this.mapDelNo = _opt.mapDelNo;
    this.mapProjectionName = _opt.mapProjectionName;
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
    this.fileProjection = undefined;
  }
  /**
   * 入口函数
   */
  process() {
    // 所有异步读取文件的Promise
    let asyncPromises = [];
    this.importFiles.forEach((file) => {
      let fileReader = new FileReader();
      asyncPromises.push(
        new Promise((resolve, reject) => {
          fileReader.readAsText(file.raw);
          fileReader.onload = (e) => {
            let encoding =
              e.target.result.indexOf('�') === -1 ? 'utf-8' : 'gbk';
            fileReader.readAsText(file.raw, encoding);
            fileReader.onload = (e) => {
              let result = e.target.result;
              if (!result.includes('J1') || !result.includes('属性描述')) {
                return reject(new Error('文件内容不符合国土资源厅格式标准'));
              }

              let resultArray = result.split('\r\n');

              // 删除所有空行 并分组
              for (let i = 0, l = resultArray.length; i < l; i++) {
                if (resultArray[i] === '') {
                  resultArray.splice(i, 1);
                  --i;
                }
              }
              let startIndex = [];
              for (let i = 0, l = resultArray.length; i < l; i++) {
                if (resultArray[i] === '[属性描述]') {
                  startIndex.push(i);
                }
              }
              let resultArrays = [];
              for (let i = 1; i < startIndex.length; i++) {
                resultArrays.push(
                  resultArray.slice(startIndex[i - 1], startIndex[i])
                );
              }
              resultArrays.push(
                resultArray.slice(
                  startIndex[startIndex.length - 1],
                  resultArray.length
                )
              );
              this.features = [];
              let allFeatures = [];
              let allGeometrys = [];
              for (let result of resultArrays) {
                let { features, geometrys } = this.stringTransform(
                  result,
                  reject
                );
                allFeatures = allFeatures.concat(features ? features : []);
                allGeometrys = allGeometrys.concat(geometrys ? geometrys : []);
              }
              locationGeometry(this.map, allGeometrys);
              resolve(allFeatures);
            };
          };
        })
      );
    });
    return Promise.all(asyncPromises);
  }

  /**
   * 将文件中的字符串信息整合为有规律的数组
   * @param {Array} resultArray
   * @param {Function} resolve
   * @param {Function} reject
   */
  stringTransform(resultArray, resolve, reject) {
    if (this.isGTJZD(resultArray)) {
      // 获取txt文档中的坐标系信息
      let fileProjectionString = resultArray[4].toString().split('=')[1];
      if (fileProjectionString === '2000国家大地坐标系') {
        this.fileProjection = 'CGCS2000';
      } else if (fileProjectionString === '80国家大地坐标系') {
        this.fileProjection = 'xian80';
      } else {
        // 如果坐标系信息为空，则默认取2000国家大地坐标系
        this.fileProjection = 'CGCS2000';
      }

      // 所有地块的坐标信息 Array.<{polygonCoordinates, polygonAttributes}>
      let featureCoordinates = [];
      // 存放一个地块的所有坐标信息 Array.<linearRingCoordinates>
      let polygonCoordinates = [];
      // 存放一个地块的所有属性信息
      let polygonAttributes = {};
      // 存放一个线型环的所有坐标信息 Array.<ol.Coordinate>
      let linearRingCoordinates = [];
      // 线型环序号
      let ringIndex = 1;
      let isFisrt = true;
      // 首先删除前12行属性信息，遍历剩余坐标信息
      resultArray = resultArray.splice(12, resultArray.length);
      // resultArray.forEach((element, index) => {
      for (let index = 0, l = resultArray.length; index < l; index++) {
        let elementArray = resultArray[index].split(',');
        // "4,73752130.87812415,1-0,绘制地块,面,,,,@"  ：代表一个面的开始
        if (elementArray.length >= 7) {
          // 如果linearRingCoordinates存有数据，则是上一个面的结束
          if (linearRingCoordinates.length > 0) {
            polygonCoordinates.push(linearRingCoordinates);
            featureCoordinates.push({
              coordinates: polygonCoordinates,
              attributes: polygonAttributes
            });
            // 清空polygonCoordinates，以便下一个面信息存储
            polygonCoordinates = [];
            // 重置线型环,以便下一个信息存储
            linearRingCoordinates = [];
            // 重置ringIndex为1,开始下一个polygon的ring计数
            ringIndex = 1;
            isFisrt = true;
          }
          polygonAttributes = {
            DK_GUID: newGuid(),
            DK_BH: elementArray[2], // 地块编号
            DK_MC: elementArray[3], // 地块名称
            DK_XH: elementArray[2].split('-')[1], // 地块序号
            TDYT: elementArray[6] // 地块用途
          };
        } else if (elementArray.length === 4) {
          // "J1,1,3224322.723,40380216.104" : 提取坐标点
          if (isFisrt) {
            ringIndex = elementArray[1] * 1;
            isFisrt = false;
          }
          // elementArray[1]的数字代表线型环的序号
          if (elementArray[1] * 1 === ringIndex) {
            // 坐标系转换
            let coordinate = this.projectionTransform(
              [Number(elementArray[3]), Number(elementArray[2])],
              reject
            );
            linearRingCoordinates.push(coordinate);
          } else {
            // 开始下一个ring,把上一个ring坐标数组放入polygonCoordinates，
            if (linearRingCoordinates.length >= 3) {
              polygonCoordinates.push(linearRingCoordinates);
            }
            // 同时，清空linearRingCoordinates
            linearRingCoordinates = [];
            ringIndex++;
            // 坐标系转换
            let coordinate = this.projectionTransform(
              [elementArray[3] * 1, elementArray[2] * 1],
              reject
            );
            linearRingCoordinates.push(coordinate);
          }
          // 判断是否是最后一个
          if (index === resultArray.length - 1) {
            // 结束
            polygonCoordinates.push(linearRingCoordinates);
            featureCoordinates.push({
              coordinates: polygonCoordinates,
              attributes: polygonAttributes
            });
          }
        } else {
          return reject(new Error('存在不符合国土资源部标准格式的文件'));
        }
      }
      // 将地块添加到地图上
      return this.addFeatureToMap(featureCoordinates, reject);
    } else {
      return reject(new Error('存在不符合国土资源部标准格式的文件'));
    }
  }

  /**
   * 判断是否符合国土资源部标注
   */
  isGTJZD(resultArray) {
    if (resultArray.length > 9) {
      let isDK = false;
      let isAttr = false;
      let dkIndex = 0;
      for (let i in resultArray) {
        if (resultArray[i] === '[地块坐标]') {
          isDK = true;
          dkIndex = Number(i);
        }
        if (resultArray[i] === '[属性描述]') {
          isAttr = true;
        }
      }
      if (isDK && isAttr) {
        if (resultArray[dkIndex + 1].split(',').length >= 7) {
          return true;
        }
      }
      return false;
    }
  }
  /**
   * 文件导入中的投影转换：
   * 需要获取两个坐标系，即源坐标系(文件坐标系)和目标坐标系(当前地图坐标系);
   *
   *   一.文件中X坐标无带号（6位）
   *      1.当前地图有带号(或可计算带号)
   *          给文件中的坐标加上当前地图的带号；
   *          使用带号计算源坐标系；
   *      2.当前地图无带号
   *          使用默认坐标系
   *   二.文件中X坐标有带号（8位）
   *          使用带号计算源坐标系；
   *   三.文件中X坐标为经度（小于3位）
   *          默认是CGCS2000或xian80的地理坐标系
   * @param {Array} coordinate
   * @param {Function} reject
   */
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
      fileProjectionCode = this.map.transformProjection;
    }
    try {
      registerProj(fileProjectionCode);
      return transform(coordinate, fileProjectionCode, this.mapProjectionCode);
    } catch (e) {
      console.error(e);
      reject(new Error('坐标系' + fileProjectionCode + '暂不支持导入'));
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
        // 挖孔地块 在外面套个MultiPolygon,不然转化为WKT类型不对
        if (polygonInfo.coordinates.length === 1) {
          feature.setGeometry(polygonGeometry);
        } else {
          let mutilGeomeyty = new MultiPolygon([]);
          mutilGeomeyty.appendPolygon(polygonGeometry);
          feature.setGeometry(mutilGeomeyty);
        }

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
      this.allGeometry = this.allGeometry.concat(geometrys);
      return { features, geometrys };
    } catch (error) {
      reject('导入出错：' + error);
    }
  }
}

export default GTJZDParser;
