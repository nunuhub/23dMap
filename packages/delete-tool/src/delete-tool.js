import { Message, MessageBox, Loading } from 'element-ui';
import $ from 'jquery';
import GaApi from 'shinegis-client-23d/src/utils/GaApi';
import { getDeleteRuleOptions } from 'shinegis-client-23d/src/utils/plug/client-admin/rule';

class DeleteTool {
  constructor(
    map,
    url,
    token,
    applicationId,
    adminUrl,
    deleteOptions,
    shinegaInitData
  ) {
    this.name = 'graphicDelete';
    this.map = map;
    // this.mapOptions = map.get('params') // 初始化地图参数
    this.baseUrl =
      url && url !== '' ? url : 'http://192.168.11.77:8084/zjzs/ga/';
    this.token = token;
    this.adminUrl = adminUrl;
    this.applicationId = applicationId;
    this.deleteOptions = deleteOptions;
    this.shinegaInitData = shinegaInitData;
    this.layerManager = this.map.layerManager;
  }

  /**
   * 删除组件启用先决条件判断
   * 1、是否有选中目标图层
   * 2、是否选中了地块
   * @method init
   */
  init() {
    this.currentTargetLayer = this.layerManager.getEditLayer()
      ? this.layerManager.getEditLayer().metadata
      : undefined; // 目标图层配置信息
    this.selectFeatures = this.map.getSelectFeatures();
    if (this.selectFeatures.length === 0) {
      Message({
        showClose: true,
        message: '请选中要删除的地块！',
        type: 'warning'
      });
      return;
    }
    // 先决条件满足以后，进行后置条件判断
    this.postCondition();
  }

  /**
   * 后置条件判断
   * 1、要删除的要素，是否是目标图层或临时绘制层
   * 2、如果map中存在xm，目标图层的标识是否与xm相同
   * 3、如果map中存在xmGuid，判断要删除的地块xm_guid是否与xmGuid相同或者是否为空
   * 4、如果map中存在dkGuid，判断要删除的地块是否只有一个，并且地块dk_guid是否与dkGuid相同或者是否为空
   * @method postCondition
   */
  postCondition() {
    let self = this;
    self.tempFeatures = [];
    self.layerFeatures = [];
    let selectItems = self.map.getSelectFeatures();
    this.mapOptions = this.shinegaInitData;

    // 判断要保存的要素是否都属于要保存的图层，如果有要素的layerTag和目标图层不一致，则提示
    let isExsited = $(selectItems).filter((index, feature) => {
      return (
        feature.layerTag &&
        feature.layerTag !== self.currentTargetLayer?.layerTag
      );
    });

    if (isExsited.length > 0) {
      Message({
        message:
          '操作非法，选择地块中包含非【' +
          self.currentTargetLayer.label +
          '】图层的地块！',
        type: 'warning',
        showClose: true
      });
      return;
    }

    let layerTag = this.currentTargetLayer?.layerTag
      ? this.currentTargetLayer.layerTag
      : '';
    if (
      this.mapOptions &&
      this.mapOptions.xm &&
      this.mapOptions.xm.trim().length > 0
    ) {
      // 当map中xm的值存在，为TEMP，只能删除临时层
      if (this.mapOptions.xm.toUpperCase() === 'TEMP') {
        let isExsited = $(selectItems).filter((index, feature) => {
          return !feature.values_.tempSelected;
        });
        if (isExsited.length > 0) {
          Message({
            message: '操作非法，只能删除临时层地块',
            type: 'warning',
            showClose: true
          });
          return;
        }
        // 当map中xm的值存在，但目标图层的标识与xm不同，不能进行保存操作
      } else if (this.mapOptions.xm.toUpperCase() !== layerTag.toUpperCase()) {
        Message({
          message: '操作非法，限定图层标识【' + self.mapOptions.xm + '】',
          type: 'warning',
          showClose: true
        });
        return;
      }
    }

    // 当指定xmGuid，则所选择要保存的地块xm_guid必须等于该xmGuid或为空
    if (
      this.mapOptions &&
      this.mapOptions.editProjectGuid &&
      this.mapOptions.editProjectGuid.trim().length > 0
    ) {
      let xmGuidIsExsited = $(this.selectFeatures).filter(
        (featureIndex, feature) => {
          for (var i in feature.values_) {
            if (i.toUpperCase && i.toUpperCase() === 'XM_GUID') {
              return (
                feature.values_[i] &&
                feature.values_[i].trim().length > 0 &&
                feature.values_[i] !== this.mapOptions.editProjectGuid
              );
            }
          }
        }
      );
      if (xmGuidIsExsited.length > 0) {
        Message({
          message: '操作非法，选择的地块中包含非本项目的地块！',
          type: 'warning',
          showClose: true
        });
        return;
      }
    }
    // 当指定dkGuid
    // 如果选中地块为一个，那么这个地块的dk_guid必须与dkGuid一致
    // 或者dk_guid为空
    if (
      this.mapOptions &&
      this.mapOptions.editBlockGuid &&
      this.mapOptions.editBlockGuid.trim().length > 0
    ) {
      if (this.selectFeatures.length > 1) {
        Message({
          message: '操作非法，只能保存指定的地块！',
          type: 'warning',
          showClose: true
        });
        return;
      } else {
        for (var i in this.selectFeatures[0].values_) {
          let value = this.selectFeatures[0].values_[i];
          let key = i;
          if (
            key.toUpperCase() === 'DK_GUID' &&
            value &&
            value.trim() !== '' &&
            value !== this.mapOptions.editBlockGuid
          ) {
            Message({
              message: '操作非法，只能保存指定的地块！',
              type: 'warning',
              showClose: true
            });
            return;
          }
        }
      }
    }
    // 区分选中地块中临时层及图层地块
    $.each(selectItems, (featureIndex, feature) => {
      if (feature.get('isSelected')) {
        // 选中的是图层地块
        self.layerFeatures.push(feature);
      } else if (feature.get('tempSelected')) {
        // 选中的是临时地块
        self.tempFeatures.push(feature);
      }
    });

    // options里面的逻辑判断暂时不执行
    // 执行删除操作
    this.delete();
  }

  /**
   * 删除地块
   */
  delete() {
    let self = this;
    MessageBox.confirm('是否删除选中的地块？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(() => {
        // 如果选中地块中有临时层地块，先将临时层选中的地块删除
        if (self.tempFeatures.length > 0) {
          let tempLayer = this.map.getLayerById('drawLayer');
          $.each(self.tempFeatures, (featureIndex, feature) => {
            tempLayer.getSource().removeFeature(feature);
          });
        }
        // 如果选中地块中有图层地块
        if (self.layerFeatures.length > 0) {
          // 等待遮罩
          this.loadingInstance = Loading.service({
            target: this.map.getTargetElement(),
            lock: true,
            text: '正在删除...',
            spinner: 'el-icon-loading',
            background: 'rgba(0, 0, 0, 0.1)'
          });

          self.currentTargetLayer = this.layerManager.getEditLayer().metadata;
          // 获取目标图层主键
          // 获取目标图层主键
          new GaApi(this.baseUrl)
            .getPrimaryKey({
              layerTable: this.currentTargetLayer.layerTable,
              token: this.token
            })
            .then((result) => {
              if (result.success) {
                self.primaryKey = result.data.key;
                self.primaryType = result.data.type;
                let featureIds = '';
                let deleteFeatures = [];
                self.layerFeatures.forEach((feature) => {
                  let id = feature.values_[self.primaryKey];
                  deleteFeatures.push(feature);
                  if (
                    self.primaryType === 'bigint' ||
                    self.primaryType === 'smallint' ||
                    self.primaryType === 'integer'
                  ) {
                    featureIds += id + ',';
                  } else {
                    featureIds += "'" + id + "',";
                  }
                });
                featureIds = featureIds.substring(0, featureIds.length - 1);
                //获取规则信息
                getDeleteRuleOptions({
                  url: this.adminUrl,
                  tocId: this.currentTargetLayer.id,
                  token: this.token,
                  applicationId: this.applicationId,
                  hasRules: this.currentTargetLayer.hasRules
                }).then((ruleOptions) => {
                  // 删除
                  new GaApi(this.baseUrl)
                    .delete({
                      featureClass: self.currentTargetLayer.layerTable,
                      filterWhere: self.primaryKey + ' in (' + featureIds + ')',
                      deleteOptions: this.deleteOptions,
                      ruleOptions: ruleOptions,
                      token: this.token
                    })
                    .then((result) => {
                      this.loadingInstance.close();
                      if (result.success) {
                        // 重新加载图层资源
                        try {
                          let key = self.currentTargetLayer.id;
                          let layer = this.map.getLayerById(key);
                          layer.getSource().refresh();
                          this.map.refresh();
                          //layer.getSource().clear()
                          let source = this.map
                            .getLayerById('drawLayer')
                            .getSource();
                          for (let feature of this.selectFeatures) {
                            //临时层已经删除过了 重复删除会有问题
                            if (!feature.get('tempSelected')) {
                              source.removeFeature(feature);
                            }
                          }
                        } catch (e) {
                          console.warn(e);
                        }

                        Message({
                          message: '删除成功',
                          type: 'success',
                          showClose: true
                        });
                        if (this.callback) {
                          this.callback(featureIds, deleteFeatures);
                        }
                        //self.map.getSelectFeatures().clear()
                      } else {
                        Message({
                          message: result.message ? result.message : '删除失败',
                          type: 'warning',
                          dangerouslyUseHTMLString: true,
                          showClose: true
                        });
                        // Bus.$alert(detailError, '保存失败', {
                        //   dangerouslyUseHTMLString: true
                        // })
                      }
                    })
                    .catch((e) => {
                      console.error(e);
                      this.loadingInstance.close();
                      Message({
                        showClose: true,
                        type: 'error',
                        message: '删除失败'
                      });
                    });
                });
              } else {
                this.loadingInstance.close();
                Message({
                  showClose: true,
                  type: 'error',
                  message: '获取主键失败'
                });
              }
            })
            .catch(() => {
              this.loadingInstance.close();
              Message({
                showClose: true,
                type: 'error',
                message: '删除失败'
              });
            });
        }
      })
      .catch((e) => {
        console.error(e);
        this.loadingInstance.close();
        Message({
          showClose: true,
          type: 'info',
          message: '已取消删除'
        });
      });
  }

  setActive(flag) {
    if (flag) {
      this.init();
    }
  }

  setCallback(callback) {
    this.callback = callback;
  }
}

export default DeleteTool;
