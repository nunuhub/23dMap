import { Loading, Message, MessageBox } from 'element-ui';
import WKT from 'ol/format/WKT';
import GaApi from 'shinegis-client-23d/src/utils/GaApi';
import { getSaveRuleOptions } from 'shinegis-client-23d/src/utils/plug/client-admin/rule';

export default class PatesTool {
  constructor(emitter, map, url, token, applicationId) {
    this.name = 'pasteGraphics';
    this.map = map;
    this.emitter = emitter;
    this.baseUrl =
      url && url !== '' ? url : 'http://192.168.9.84:8099/spatial/';
    this.token = token;
    this.applicationId = applicationId;
    this.layerManager = map.layerManager;
    this.Wkid = this.map.getView().getProjection().getCode();
    this.spatialReference = this.Wkid.includes(':')
      ? this.Wkid.split(':')[1]
      : this.Wkid;
  }
  startPaste() {
    let editLayer = this.layerManager.getEditLayer();
    this.currentTargetLayer = editLayer ? editLayer.metadata : undefined; // 目标图层配置信息
    this.emitter.$emit('getCopyFeatures', (data, copyiedLayer) => {
      if (data) {
        this.copyiedLayer = copyiedLayer;
        this._validate(data);
      } else {
        Message.warning('请先选择需要复制的图形');
      }
    });
  }

  _popBox(data) {
    if (this.currentTargetLayer) {
      let label = this.currentTargetLayer.label;
      MessageBox.confirm(`是否将复制的图形粘贴到 "${label}" 层?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          // 满足先决条件以后，进行后置条件判断
          // 条件都满足以后，请求服务获取表主键，进行数据封装
          new GaApi(this.baseUrl)
            .getPrimaryKey({
              layerTable: this.currentTargetLayer.layerTable,
              token: this.token
            })
            .then((result) => {
              if (result.success) {
                this.primaryKey = result.data.key;
                this.primaryType = result.data.type;
                // 数据封装
                // 数据封装
                getSaveRuleOptions({
                  url: this.configInstance ? this.configInstance.url : null,
                  tocId: this.currentTargetLayer.id,
                  token: this.token,
                  applicationId: this.applicationId,
                  hasRules: this.currentTargetLayer.hasRules
                }).then((ruleOptions) => {
                  this.ruleOptions = ruleOptions;
                  this._processData(data);
                });
              }
            })
            .catch((error) => {
              console.error(error);
            });
        })
        .catch(() => {});
    } else {
      Message.warning('无可编辑图层');
    }
  }
  _validate(data) {
    if (this.currentTargetLayer) {
      let label = this.currentTargetLayer.label;
      let copyLayerLabel = this.copyiedLayer.label;
      if (label === copyLayerLabel) {
        Message({
          message: '不能把复制的图形粘贴到自己所在的图层,请切换编辑图层',
          type: 'warning',
          showClose: true
        });
        return;
      }
      if (!this.currentTargetLayer.layerTable) {
        Message({
          message: '图层未配置数据源，请检查',
          type: 'warning',
          showClose: true
        });
        return;
      }
      this._popBox(data);
    } else {
      Message({
        message: '请选择当前可编辑层',
        type: 'warning',
        showClose: true
      });
    }
  }

  //封装请求参数
  _processData(selectFeatures) {
    let features = [];
    selectFeatures.forEach((feature) => {
      let attribute = [],
        featureObj = {};
      let valObj = feature.values_;
      valObj = valObj ? valObj : {};
      for (const key in valObj) {
        if (
          key !== 'geometry' &&
          key !== 'isSelected' &&
          key !== 'tempSelected' &&
          key !== this.primaryKey
        ) {
          attribute.push({
            name: key,
            value: valObj[key]
          });
        }
      }
      featureObj.attribute = attribute;
      featureObj.featureClass = this.currentTargetLayer.layerTable;
      featureObj.topological = true;
      featureObj.checkLevel = 0;
      let wktFormat = new WKT();
      let geom = feature.getGeometry();
      featureObj.geometry = wktFormat.writeGeometry(geom);
      featureObj.spatialReference = this.spatialReference;
      featureObj.filter = '';
      features.push(featureObj);
    });
    // save
    this._save(features);
  }

  _save(features) {
    let loadingInstance = Loading.service({
      target: this.map.getTargetElement(),
      lock: true,
      text: '保存中...',
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    });
    // 保存请求
    new GaApi(this.baseUrl)
      .save({
        features: features,
        ruleOptions: this.ruleOptions,
        token: this.token
      })
      .then((result) => {
        loadingInstance.close(); // 关闭等待遮罩
        if (result.success) {
          // 清空临时层地块
          let tempLayer = this.map.getLayerById('drawLayer');
          tempLayer.getSource().clear();
          // 重新加载图层资源
          let key = this.currentTargetLayer.id;
          let layer = this.map.getLayerById(key);
          layer.getSource().refresh();
          // this.map.removeLayer(layer)
          // this.map.addLayer(layer)
          Message.success('图形粘贴成功');
          this.emitter.$emit('clearCopyFeatures');
        } else {
          Message({
            message: result.message ? result.message : '图形粘贴失败',
            type: 'warning',
            dangerouslyUseHTMLString: true,
            showClose: true
          });
        }
      })
      .catch((error) => {
        Message.error('图形粘贴失败:' + error.message);
        loadingInstance.close(); // 关闭等待遮罩
      });
  }
}
