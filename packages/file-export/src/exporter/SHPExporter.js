import WKT from 'ol/format/WKT';
import GaApi from 'shinegis-client-23d/src/utils/GaApi';

/**
 * 导出shp文件解析器
 */
class SHPExporter {
  constructor(_opt) {
    this.url = _opt.url;
    this.token = _opt.token;
    this.exportFileName = _opt.exportFileName;
    this.exportFileType = _opt.exportFileType;
    this.exportFileExt = _opt.exportFileExt;
    this.exportFeatures = _opt.exportFeatures;
    this.mapProjectionCode = _opt.mapProjectionCode;
  }

  /**
   * 解析入口函数
   */
  generate() {
    let wkts = [];
    let wktFormat = new WKT();
    let wkid = this.mapProjectionCode.substring(
      this.mapProjectionCode.lastIndexOf(':') + 1,
      this.mapProjectionCode.length
    );
    // 将地图上feature转换为WKT格式
    this.exportFeatures.forEach((feature) => {
      wkts.push(wktFormat.writeFeature(feature));
    });
    return new GaApi(this.url).exportFile({
      wkts: wkts,
      extension: 'shp',
      filename: this.exportFileName,
      wkid: wkid,
      exportFileExt: '.zip',
      token: this.token
    });
  }
}

export default SHPExporter;
