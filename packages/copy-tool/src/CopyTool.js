import { Message } from 'element-ui';

export default class CopyTool {
  constructor(subscribe, map) {
    this.name = 'graphicCopy';
    this.map = map;
    this.subscribe = subscribe;
    this.layerManager = map.layerManager;
    this.copyGraphic = [];
    this.bindEvt();
  }

  startCopy() {
    let copyGraphic = this.map.getSelectFeatures();
    if (copyGraphic && copyGraphic.length > 0) {
      this.copyGraphic = [...copyGraphic];
      //获取复制的图形所属的图层
      let editLayer = this.layerManager.getEditLayer();
      let copyiedLayer = editLayer ? editLayer.metadata : null; // 目标图层配置信息
      this.copyiedLayer = JSON.parse(JSON.stringify(copyiedLayer));
      Message.success('图形复制成功,可用粘贴组件粘贴');
    } else {
      Message.success('请选择需要复制的图形');
    }
  }

  bindEvt() {
    this.subscribe.$on('paste-tool:getCopyFeatures', (func) => {
      func(this.copyGraphic, this.copyiedLayer);
    });
    this.subscribe.$on('paste-tool:clearCopyFeatures', () => {
      this.clearCopy();
    });
  }
  clearCopy() {
    this.copyGraphic = null;
    this.copyiedLayer = null;
  }
}
