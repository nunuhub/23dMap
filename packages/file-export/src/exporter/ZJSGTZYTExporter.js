/* eslint-disable no-unused-vars */
import { getCenter } from 'ol/extent.js';
import { saveAs } from 'file-saver';
import { registerProj } from 'shinegis-client-23d/src/map-core/CustomProjection';

/**
 * 1.导出txt，以平面投影坐标导出
 * 2.投影转换时，地理坐标都转为2000 有带号的投影坐标系
 * 3.判断底图的坐标系 ，为2000有带号投影坐标系时，不进行投影转换
 * 注：a.伪墨卡托投影直接转2000的投影坐标，结果不准确，所以
 * 统一先转2000的地理坐标
 * b.不管底图是什么坐标系，都导出2000有带号的投影坐标系
 * c.暂时不考虑导出无带号的国标格式
 */
/**
 * 导出国土资源部标准格式文件解析器
 */
class ZJSGTZYTExporter {
  constructor(_opt) {
    _opt = Object.assign({}, _opt);
    this.exportFileName = _opt.exportFileName;
    this.exportFileType = _opt.exportFileType;
    this.exportFileExt = _opt.exportFileExt;
    this.exportFeatures = _opt.exportFeatures;
    this.isWithDH = _opt.isWithDH;
    this.mapProjectionCode = _opt.mapProjectionCode;
    // 是否是地理坐标系
    this.isDegree = _opt.isDegree;
    this.isToTransformProj = _opt.isToTransformProj;
    this.transformProjection = _opt.transformProjection;
    this.resultString = '';
  }

  /**
   * 解析入口函数
   */
  generate() {
    // 注册4490坐标系
    let aimProjectionCode = 'EPSG:4490';
    registerProj(aimProjectionCode);
    // 获取坐标系名称
    let projectionName = '2000国家大地坐标系';

    // 写文件头信息
    // this.resultString += '[属性描述]\r\n'
    // this.resultString += '格式版本号=\r\n'
    // this.resultString += '数据产生单位=\r\n'
    // this.resultString += '数据产生日期=\r\n'
    // this.resultString += '坐标系=' + projectionName + '\r\n'
    // this.resultString += '几度分带=3\r\n'
    // this.resultString += '投影类型=高斯克吕格\r\n'
    // this.resultString += '计量单位=米\r\n'
    // this.resultString += '带号=\r\n'
    // this.resultString += '精度=\r\n'
    // this.resultString += '转换参数=0,0,0,0,0,0,0\r\n'
    this.resultString = '导出面数据0\r\n';

    let mapWkid = this.mapProjectionCode.split(':')[1] * 1;
    // 带号处理及完成投影转换
    let exportFeatures = this.exportFeatures;
    // console.log('features',exportFeatures);
    for (let i = 0, l = exportFeatures.length; i < l; i++) {
      if (
        exportFeatures[i].getGeometry().getType() === 'Polygon' ||
        exportFeatures[i].getGeometry().getType() === 'MultiPolygon'
      ) {
        let cloneGra = exportFeatures[i].clone(); // 克隆不改变原地块的属性
        let aimFeature = {};
        if (mapWkid <= 4554 && mapWkid >= 4513) {
          // 2000有带号投影不需要再转换
          aimFeature = cloneGra;
          aimFeature.set('wkid', mapWkid);
        } else {
          aimFeature = this.geoProjection(cloneGra);
          // 获取当前geometry的中心点
          let centerPoint = getCenter(aimFeature.getGeometry().getExtent());
          // 根据中心点的X坐标计算带号
          if (centerPoint[0] >= -180 && centerPoint[0] <= 180) {
            // 说明是地理坐标系
            // 根据中心点x轴坐标计算带号
            let delNo = parseInt((centerPoint[0] - 1.5) / 3 + 1, 10);
            aimFeature.set('delNo', delNo);
            let wkid = delNo + 4488;
            aimFeature.set('wkid', wkid);
          }
        }
        // 转坐标系
        let geo = aimFeature.getGeometry();

        let resultProj = this.isToTransformProj
          ? this.transformProjection
          : 'EPSG:' + aimFeature.get('wkid');
        // 注册导出坐标系
        // console.log('导出的坐标系',resultProj);
        registerProj(resultProj);
        let _geometry = geo.transform('EPSG:' + mapWkid, resultProj);
        aimFeature.setGeometry(_geometry);
        // 计算地块面积
        let area = aimFeature.getGeometry().getArea();
        if (aimFeature.get('DK_MJ')) {
          aimFeature.set('DK_MJ', area);
        }
        // 最终是一个feature，序号，面积三个要素传入拼接字符串函数
        this.connectGeometryString(aimFeature, i, area);
      } else {
        throw new Error('选中的要素中含有非面要素');
      }
    }
    // 导出文件
    this.export();
  }

  /**
   *地块进行投影转换
   *地块坐标系转为2000地理坐标系
   * @param {object}feature
   */
  geoProjection(feature) {
    // 目标投影坐标系
    let aimProjectionCode = 'EPSG:4490';
    let _geometry = feature
      .getGeometry()
      .transform(this.mapProjectionCode, aimProjectionCode);
    feature.setGeometry(_geometry);
    return feature;
  }

  /**
   * 整理feature中的Geometry,并转为特定格式字符串
   * @param {ol.Feature} feature
   * @param {Number} index
   * @param {Number} area
   */
  connectGeometryString(feature, index, area) {
    // console.log('最终导出的feature',feature);
    // 所有的坐标数目
    let pointsCount = 0;
    // 因为openlayers中有MultiPolygon类型，所以使用数组
    let polygons = [];
    // 这里面要素分为MultiPolygon和Polygon两种类型
    if (feature.getGeometry().getType() === 'MultiPolygon') {
      polygons = feature.getGeometry().getPolygons();
      feature
        .getGeometry()
        .getPolygons()
        .forEach((polygon) => {
          polygon.getCoordinates().forEach((arr) => {
            pointsCount += arr.length;
          });
        });
    } else if (feature.getGeometry().getType() === 'Polygon') {
      polygons.push(feature.getGeometry());
      feature
        .getGeometry()
        .getCoordinates()
        .forEach((arr) => {
          pointsCount += arr.length;
        });
    }
    let dkmc = '';
    if (feature.get('DK_MC')) {
      dkmc = feature.get('DK_MC');
    }

    polygons.forEach((polygon, i) => {
      let ringIndex = 0;
      // 遍历Polygon中所有的LinearRing
      polygon.getLinearRings().forEach((linearRing) => {
        ringIndex++;
        // 遍历线型环中所有坐标
        let i = 0;
        linearRing.getCoordinates().forEach((coordinate, coordinateIndex) => {
          // i代表序号，每一个坐标对应一个序号
          i = i + 1;
          // 判断是否需要带号,若需要，则设当前feature的delNo,若不需要，则设delNo=""
          //  let delNo = this.isWithDH ? feature.get('delNo') : ''
          // 如果是最后一个点，则设置coordinateIndex为0
          if (coordinateIndex === linearRing.getCoordinates().length - 1) {
            coordinateIndex = 0;
          }
          // 序号，地块号，圈号，点号
          this.resultString +=
            i +
            ',' +
            (index + 1) +
            ',' +
            ringIndex +
            ',' +
            'J' +
            (coordinateIndex + 1) +
            ',' +
            coordinate[0].toFixed(3) +
            ',' +
            coordinate[1].toFixed(3) +
            '\r\n';
        });
      });
    });
  }

  /**
   * 导出为txt文件
   */
  export() {
    let exportBlob = new Blob(['\ufeff' + this.resultString], {
      type: 'text/plain;charset=utf-8'
    });
    saveAs(exportBlob, this.exportFileName + this.exportFileExt);
  }
}

export default ZJSGTZYTExporter;
