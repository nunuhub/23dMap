import SHPExporter from './Exporter/SHPExporter';
import DXFExporter from './Exporter/DXFExporter';
import GTJZDExporter from './Exporter/GTJZDExporter';
import CUSTOMIZEExporter from './Exporter/CUSTOMIZEExporter';
import ZJSGTZYTExporter from './Exporter/ZJSGTZYTExporter';

class FileExport {
  constructor(_opt) {
    _opt = Object.assign({}, _opt);
    this.map = _opt.map;
    // 文件名
    this.exportFileName = _opt.exportFileName
      ? _opt.exportFileName
      : 'exportFile';
    // 导出文件类型
    this.exportFileTypeAndExt = _opt.exportFileTypeAndExt
      ? _opt.exportFileTypeAndExt
      : 'SHP|.shp';
    // 当前地图坐标系
    this.mapProjectionCode = this.map.getView().getProjection().getCode();
    // 当前要导出的地块集合（map上选中的Features）
    this.exportFeatures = this.map.getSelectFeatures();

    // let tempLayer = this.map.getLayerById('drawLayer');
    // 调用文件格式解析器时传递的参数
    this.options = {
      url: _opt.url,
      token: _opt.token,
      exportFileName: this.exportFileName,
      exportFileType: this.exportFileTypeAndExt.split('|')[0].toUpperCase(),
      exportFileExt: this.exportFileTypeAndExt.split('|')[1],
      isWithDH: true,
      exportFeatures: this.exportFeatures,
      mapProjectionCode: this.mapProjectionCode,
      isToTransformProj: _opt.isToTransformProj,
      transformProjection: this.map.transformProjection,
      isDegree: false
    };
  }

  exportFile() {
    if (this.exportFeatures && this.exportFeatures.length > 0) {
      /**
       * 原生格式处理:
       * 1.在原生格式中，文件是有度带号和没有度带号之分的，因此需要分开处理，但是实际上这两个类型的文件代码是差不多的，所以
       * 在这里考虑使用一个格式解析器文件；
       * 2.'NDH'表示无带号，这里整合有无带号两个格式，用"isWithDH"字段表示有无带号
       */
      if (this.options.exportFileType.indexOf('NDH') >= 0) {
        this.options.exportFileType = this.options.exportFileType.replace(
          'NDH',
          ''
        );
        // 分带标志 false表示无带号
        this.options.isWithDH = false;
      }

      return this.fileTypeFilter();
    } else {
      throw new Error('当前未选择导出地块');
    }
  }

  fileTypeFilter() {
    // SHP和DXF调用服务，为异步操作，用Promise操作
    // 其他格式文件导出为同步，在这里也使用Promise,是为了外部调用的统一性
    switch (this.options.exportFileType) {
      case 'SHP': {
        let shpEporter = new SHPExporter(this.options);
        return shpEporter.generate();
      }
      case 'DXF':
      case 'DWG': {
        let dxfEporter = new DXFExporter(this.options);
        return dxfEporter.generate();
      }
      case 'ZDY': {
        let zdyExporter = new CUSTOMIZEExporter(this.options);
        return new Promise((resolve, reject) => {
          try {
            zdyExporter.generate();
            resolve('导出成功');
          } catch (error) {
            console.error(error);
            reject(error);
          }
        });
      }
      case 'ZJSGTZYT': {
        let zjsExporter = new ZJSGTZYTExporter(this.options);
        return new Promise((resolve, reject) => {
          try {
            zjsExporter.generate();
            resolve('导出成功');
          } catch (error) {
            console.error(error);
            reject(error);
          }
        });
      }
      case 'GTJZD': {
        let gtjzdExporter = new GTJZDExporter(this.options);
        return new Promise((resolve, reject) => {
          try {
            gtjzdExporter.generate();
            resolve('导出成功');
          } catch (error) {
            console.error(error);
            reject(error);
          }
        });
      }
      default:
        return new Promise((resolve, reject) => {
          reject('所选导出文件格式不支持');
        });
    }
  }
}

export default FileExport;
