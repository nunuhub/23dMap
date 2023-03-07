import GTJZDParser from './Parser/GTJZDParser';
import SHPParser from './Parser/SHPParser';
import DWGParser from './Parser/DWGParser';
import CUSTOMIZEParser from './Parser/CUSTOMIZEParser';
import ZJSGTZYTParser from './Parser/ZJSGTZYTParser';

// 支持多个文件同时导入，不方便给单个文件选择导入的坐标
// 读取txt文件中的坐标系信息，作为投影转换依据
// txt文件中不存在坐标系信息时，以国标2000导入
// 基于以上不再在导入功能中加入可选择源坐标系功能
class FileImport {
  constructor(_opt) {
    _opt = Object.assign({}, _opt);
    this.map = _opt.map;
    // 导入文件
    this.importFiles = _opt.importFiles;
    this.mapProjectionCode = this.map.getView().getProjection().getCode();
    this.dwgCount = _opt.dwgCount;
    this.projCode = _opt.importProj;

    // 调用文件格式解析器时传递的参数
    this.options = {
      map: this.map,
      url: _opt.url,
      token: _opt.token,
      importFiles: this.importFiles,
      importFileType: _opt.importFileTypeAndExt.split('|')[0].toUpperCase(),
      importFileExt: _opt.importFileTypeAndExt.split('|')[1],
      // 当前地图的带号，''代表无代号
      mapDelNo: '',
      mapProjectionCode: this.mapProjectionCode,
      // 地图坐标系名称 ("CGCS2000" || "xian80")
      mapProjectionName: ''
    };
  }

  importFile() {
    if (this.importFiles instanceof Array && this.importFiles.length > 0) {
      /**
       * 原生格式处理:
       * 1.在原生格式中，文件是有度带号和没有度带号之分的，因此需要分开处理，但是实际上这两个类型的文件代码是差不多的，所以
       * 在这里考虑使用一个格式解析器文件；
       * 2.文件导入时，操作人员可能无法判断文件是否有带号，这里不做分类，后续文件解析器中分析坐标时再处理;
       * 3.记录当前地图坐标系的带号
       */
      let mapCenter = this.map.getView().getCenter();
      if (mapCenter[0] >= -180 && mapCenter[0] <= 180) {
        // 经纬度,可计算带号
        this.options.mapDelNo = Number((mapCenter[0] - 1.5) / 3 + 1);
      } else if (mapCenter[0].toFixed().length > 6) {
        this.options.mapDelNo = mapCenter[0].toString().substring(0, 2);
      }

      return this.fileTypeFilter();
    } else {
      throw new Error('未选择导入文件');
    }
  }
  fileTypeFilter() {
    switch (this.options.importFileType) {
      case 'SHP': {
        let shpParser = new SHPParser(this.options);
        return shpParser.process();
      }
      case 'DWG': {
        this.options.dwgCount = this.dwgCount;
        this.options.projCode = this.projCode;
        let dwgParser = new DWGParser(this.options);
        return dwgParser.process();
      }
      case 'GTJZDGM':
      case 'GTJZD': {
        let gtjzdParser = new GTJZDParser(this.options);
        return gtjzdParser.process();
      }
      case 'ZJSGTZYT': {
        let zjgtParser = new ZJSGTZYTParser(this.options);
        return zjgtParser.process();
      }
      // case 'JDJZD':
      //   let jdjzdParser = new JDJZDParser(this.options);
      //   return jdjzdParser.process();
      // case 'ZSPOINT':
      //   let zsPointParser = new ZSPOINTParser(this.options);
      //   return zsPointParser.process();
      // case 'ZSLINE':
      //   let zsLineParser = new ZSLINEParser(this.options);
      //   return zsLineParser.process();
      case 'ZDY': {
        let ZDYParser = new CUSTOMIZEParser(this.options);
        return ZDYParser.process();
      }

      default:
        return new Promise((resolve, reject) => {
          reject(new Error('所选导入文件格式不支持'));
        });
    }
  }
}

export default FileImport;
