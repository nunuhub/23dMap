import Feature from 'ol/Feature';
import WKT from 'ol/format/WKT';
import { locationGeometry } from '../common';
import { selectStyles } from 'shinegis-client-23d/src/utils/olUtil';
import GaApi from 'shinegis-client-23d/src/utils/GaApi';
/**
 * 导入shp文件解析器
 */
class SHPParser {
  constructor(_opt) {
    _opt = Object.assign({}, _opt);
    this.map = _opt.map;
    this.url = _opt.url;
    this.token = _opt.token;
    this.shpFiles = _opt.importFiles;
    this.importFileType = _opt.importFileType;
    this.importFileExt = _opt.importFileExt;
    this.mapProjectionCode = _opt.mapProjectionCode;
  }

  process() {
    this.checkFiles();
    // 检查通过，上传shp文件
    let formData = new FormData();
    this.shpFiles.forEach((file) => {
      formData.append('files', file.raw);
    });
    // 坐标系
    let wkid = this.mapProjectionCode.substring(
      this.mapProjectionCode.lastIndexOf(':') + 1,
      this.mapProjectionCode.length
    );
    return new Promise((resolve, reject) => {
      new GaApi(this.url)
        .importFile({
          files: this.shpFiles,
          wkid: wkid,
          token: this.token
        })
        .then((result) => {
          if (result.success) {
            let data = result.data.features
              ? result.data.features
              : result.data.data[0].features;
            let features = [];
            let wktFormat = new WKT();
            let geometrys = [];
            data.forEach((element) => {
              let geo = wktFormat.readGeometry(element.wkt);
              geometrys.push(geo);
              let feature = new Feature({
                geometry: geo
              });
              // 遍历属性信息
              for (let key in element.attributes) {
                feature.set(key, element.attributes[key]);
              }
              feature.setStyle(selectStyles);
              feature.set('tempSelected', true);
              feature.set('isImport', true);
              feature.set('area', element.area);
              feature.set('length', element.length);
              features.push(feature);
            });
            // 添加所有feature到临时图层
            this.map
              .getLayerById('drawLayer')
              .getSource()
              .addFeatures(features);
            resolve(features);
            locationGeometry(this.map, geometrys);
          } else {
            reject(new Error('导入错误:' + result.message));
          }
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * 检查shape文件是否齐全
   */
  checkFiles() {
    if (this.shpFiles.length === 4) {
      let exts = ['dbf', 'prj', 'shp', 'shx'];
      this.shpFiles.forEach((file) => {
        let extName = file.name.substring(
          file.name.lastIndexOf('.') + 1,
          file.name.length
        );
        for (let i = 0; i < exts.length; i++) {
          if (exts[i] === extName) {
            exts.splice(i, 1);
            break;
          }
        }
      });
      if (exts.length !== 0) {
        // 检查未通过
        throw new Error('请确保同时上传*.dbf/*.prj/*.shp/*.shx文件');
      }
    } else {
      // throw new Error('请确保同时上传*.dbf/*.prj/*.shp/*.shx文件')
    }
  }
}

export default SHPParser;
