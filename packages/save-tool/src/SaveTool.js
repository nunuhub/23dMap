import WKT from 'ol/format/WKT';
import { Message, Loading } from 'element-ui';
import $ from 'jquery';
import Bus from 'shinegis-client-23d/src/utils/bus';
import Collection from 'ol/Collection';
import { strDateTime } from 'shinegis-client-23d/src/utils/common';
import GaApi from 'shinegis-client-23d/src/utils/GaApi';
import { getSaveRuleOptions } from 'shinegis-client-23d/src/utils/plug/client-admin/rule';
class GraphicSave {
  constructor(map, url, options) {
    this.name = 'graphicSave';
    this.map = map;
    this.options = options;
    this.baseUrl =
      url && url !== '' ? url : 'http://192.168.11.77:8084/zjzs/ga/';
    this.adminUrl = options.adminUrl;
    this.layerManager = this.map.layerManager;
  }

  /**
   * 保存组件启用先决条件判断
   * 1、是否有选中目标图层
   * 2、是否选中了地块
   * 3、根据目标图层类型判断 数据源及图层主键  是否是必须项
   * 4、如果是必须项，检查其是否为空
   * @method init
   */
  init() {
    this.currentTargetLayer = this.layerManager.getEditLayer()
      ? this.layerManager.getEditLayer().metadata
      : undefined; // 目标图层配置信息
    this.selectFeatures = this.map.getSelectFeatures();
    if (this.currentTargetLayer === undefined) {
      Message({
        message: '目标图层未选中',
        type: 'warning',
        showClose: true
      });
      return;
    }
    if (this.selectFeatures.length === 0) {
      // 地块未选中则进行提示
      Message({
        message: '请选中要保存的地块',
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
    // 满足先决条件以后，进行后置条件判断
    this.postCondition();
  }

  /**
   * 后置条件判断
   * 1、要保存的要素是否都属于目标图层
   * 2、如果map中存在xm，目标图层的标识是否与xm相同
   * 3、如果map中存在xmGuid，判断要保存的地块xm_guid是否与xmGuid相同或者是否为空
   * 4、如果map中存在dkGuid，判断要保存地块是否只有一个，并且地块dk_guid是否与dkGuid相同或者是否为空
   * @method postCondition
   */
  postCondition() {
    let self = this;
    let selectFeatures = this.selectFeatures;
    this.mapOptions = this.options?.shinegaInitData;
    // 判断要保存的要素是否都属于要保存的图层，如果有要素的layerTag和目标图层不一致，则提示
    let isExsited = $(selectFeatures).filter((index, feature) => {
      return (
        feature.layerTag &&
        feature.layerTag !== self.currentTargetLayer.layerTag
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
    let layerTag = this.currentTargetLayer.layerTag
      ? this.currentTargetLayer.layerTag
      : '';
    // 当map中xm的值存在，但目标图层的标识与xm不同，不能进行保存操作
    if (
      this.mapOptions &&
      this.mapOptions.xm &&
      this.mapOptions.xm.trim().length > 0 &&
      this.mapOptions.xm.toUpperCase() !== layerTag.toUpperCase()
    ) {
      Message({
        message: '操作非法，限定图层标识【' + self.mapOptions.xm + '】',
        type: 'warning',
        showClose: true
      });
      return;
    }
    // 当指定xmGuid，则所选择要保存的地块xm_guid必须等于该xmGuid或为空
    if (
      this.mapOptions &&
      this.mapOptions.editProjectGuid &&
      this.mapOptions.editProjectGuid.trim().length > 0
    ) {
      let xmGuidIsExsited = $(selectFeatures).filter(
        (featureIndex, feature) => {
          for (var i in feature.values_) {
            if (i.toUpperCase() === 'XM_GUID') {
              return (
                feature.values_[i] &&
                feature.values_[i].trim().length > 0 &&
                feature.values_[i] !== self.mapOptions.editProjectGuid
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
    // 条件都满足以后，请求服务获取表主键，进行数据封装
    new GaApi(this.baseUrl)
      .getPrimaryKey({
        layerTable: this.currentTargetLayer.layerTable,
        token: this.options.token
      })
      .then((result) => {
        if (result.success) {
          this.primaryKey = result.data.key;
          this.primaryType = result.data.type;
          // 数据封装
          // 数据封装
          getSaveRuleOptions({
            url: this.adminUrl,
            tocId: this.currentTargetLayer.id,
            token: this.options.token,
            applicationId: this.options.applicationId,
            hasRules: this.currentTargetLayer.hasRules
          }).then((ruleOptions) => {
            this.ruleOptions = ruleOptions;
            this.processDataNew();
          });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }

  processDataNew() {
    let features = [];
    let selectFeatures = this.selectFeatures;
    let fieldArray = [];
    let valueArray = [];
    if (
      this.mapOptions &&
      this.mapOptions.keyfield &&
      this.mapOptions.keyvalue
    ) {
      fieldArray = this.mapOptions.keyfield.split(',');
      valueArray = this.mapOptions.keyvalue.split(',');
    }
    $.each(selectFeatures, (index, feature) => {
      if (
        feature.get('tempSelected') &&
        fieldArray &&
        fieldArray.length > 0 &&
        valueArray &&
        valueArray.length > 0 &&
        fieldArray.length === valueArray.length
      ) {
        for (let index = 0; index < fieldArray.length; index++) {
          feature.set(fieldArray[index].toUpperCase(), valueArray[index]);
        }
      }
    });

    if (this.options && this.options.isShowEdit) {
      Bus.$emit('startFeatureEditing', {
        type: 'add',
        features: new Collection(selectFeatures)
      });
    } else {
      let loadingInstance = Loading.service({
        target: this.map.getTargetElement(),
        lock: true,
        text: '保存中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.1)'
      });
      features = this.processData(selectFeatures);
      // 保存请求
      new GaApi(this.baseUrl)
        .save({
          features: features,
          options: this.options.saveOptions,
          ruleOptions: this.ruleOptions,
          token: this.options.token
        })
        .then((result) => {
          // response = response.headers?response.data:response
          loadingInstance.close(); // 关闭等待遮罩
          if (result.success) {
            // 清空临时层地块
            let tempLayer = this.map.getLayerById('drawLayer');
            tempLayer.getSource().clear();
            let key = this.currentTargetLayer.id;
            // 重新加载图层资源
            let layer = this.map.getLayerById(key);
            layer.getSource().refresh();
            this.map.refresh();
            Message({
              message: '地块保存成功',
              type: 'success',
              showClose: true
            });
            let oids = result.data.oids;
            if (oids && oids instanceof Array && oids.length > 0) {
              for (let i = 0; i < features.length; i++) {
                // 是否已存在ID
                /* let attrIsExsited = $(features[i].attribute).filter((index, item) => {
                                return item.name.toUpperCase() === this.primaryKey.toUpperCase()
                            })
                            if (attrIsExsited.length==0){
                                let idAttribute = {name: this.primaryKey.toUpperCase(), value: oids[i]}
                                features[i].attribute.push(idAttribute)
                            }*/
                let idAttribute = {
                  name: this.primaryKey?.toLowerCase(),
                  value: oids[i]
                };
                features[i].attribute.push(idAttribute);
              }
            }
            if (this.callback) {
              this.callback(features);
            }
            /* if ($('#FeatureEditingCard')[0]) {
                        $('#FeatureEditingCard').hide()
                    }*/
            // this.selectFeatures.clear()
          } else {
            Message({
              message: result.message ? result.message : '地块保存失败',
              type: 'warning',
              dangerouslyUseHTMLString: true,
              showClose: true
            });
            // Bus.$alert(detailError, '保存失败', {
            //   dangerouslyUseHTMLString: true
            // })
          }
        })
        .catch((error) => {
          Message({
            message: '地块保存失败',
            type: 'warning',
            showClose: true
          });
          loadingInstance.close();
          console.error(error);
        });
    }
  }

  processData(selectFeatures) {
    let features = [];
    let wktFormat = new WKT();
    let newFeatureNum = 1;
    $.each(selectFeatures, (index, feature) => {
      let self = this;
      // geoserver类型服务，geometry采用wkt传参
      let toBeSaveFeature = {};
      let attributeArr = [];
      let filterWhere = '';
      // 判断当前选中地块的id是否存在，如果存在，则说明保存的地块已存在于库中，进行的是编辑后的保存操作
      let featureId = feature.values_[self.primaryKey?.toLowerCase()];
      if (featureId) {
        let value;
        if (
          self.primaryType === 'bigint' ||
          self.primaryType === 'smallint' ||
          self.primaryType === 'integer' ||
          typeof featureId === 'number'
        ) {
          value = featureId;
        } else {
          //vaule = featureId.trim()
          value = featureId.substring(
            featureId.lastIndexOf('.') + 1,
            featureId.length
          );
          value = "'" + value + "'";
        }
        filterWhere = self.primaryKey + ' in (' + value + ')';
      }
      // 将选中的图形中的字段添加进来
      // 首先判断新的attributeArr数组中是否已经存在对应的字段
      // 若不存在则添加
      for (let attr in feature.values_) {
        if (typeof feature.values_[attr] !== 'object') {
          // 去掉属性中的geometry
          let attrIsExsited = $(attributeArr).filter((index, item) => {
            return item.name === attr.toUpperCase();
          });
          if (attrIsExsited.length === 0) {
            let value = feature.values_[attr];
            if (typeof value === 'string') {
              if (strDateTime(value)) {
                value = '' + value.substr(0, value.length - 1) + '';
              }
            }
            attributeArr.push({
              name: attr.toUpperCase(),
              value: value
            });
          }
        }
      }
      // 判断新的attributeArr数组中是否含有"DK_GUID"字段
      let dkguidIsExsited = $(attributeArr).filter((index, item) => {
        return item.name === 'DK_GUID';
      });
      if (dkguidIsExsited.length === 0) {
        attributeArr.push({
          name: 'DK_GUID',
          value: this.newGuid()
        });
      }
      // 判断新的attributeArr数组中是否含有"XM_GUID"字段
      let xmguidIsExsited = $(attributeArr).filter((index, item) => {
        return item.name === 'XM_GUID';
      });
      if (xmguidIsExsited.length === 0) {
        attributeArr.push({
          name: 'XM_GUID',
          value: this.newGuid()
        });
      }
      // 判断新的attributeArr数组中是否含有"DK_MC"字段
      let dkmcIsExsited = $(attributeArr).filter((index, item) => {
        return item.name === 'DK_MC';
      });
      if (dkmcIsExsited.length === 0) {
        attributeArr.push({
          name: 'DK_MC',
          value: '新地块' + newFeatureNum
        });
        newFeatureNum++;
      } else if (dkmcIsExsited[0].value?.indexOf('新地块') > -1) {
        newFeatureNum++;
      }

      let wktString = wktFormat.writeGeometry(feature.getGeometry());
      let projection = this.map.getView().getProjection();
      let wkid = projection.code_.split(':')[1];
      // 数据源
      toBeSaveFeature.featureClass = this.currentTargetLayer.layerTable;
      // 是否启用拓扑检查，默认为true
      toBeSaveFeature.topological = true;
      // 拓扑检查等级  0为低级  1为中级  2为高级
      toBeSaveFeature.checkLevel = this.currentTargetLayer.topologyCheck;
      // geoserver 采用wkt传递geometry
      toBeSaveFeature.geometry = wktString;
      // 地块属性信息
      toBeSaveFeature.attribute = attributeArr;
      // 空间投影坐标系
      toBeSaveFeature.spatialReference = wkid;
      // 若为编辑地块，则传递相应字段信息
      toBeSaveFeature.filter = filterWhere;
      features.push(toBeSaveFeature);
    });
    return features;
  }

  setActive(flag) {
    if (flag) {
      this.init();
    }
  }

  setCallback(callback) {
    this.callback = callback;
  }

  /**
   * 生成guid随机数
   * @method newGuid
   */
  newGuid() {
    var guid = '';
    for (var i = 1; i <= 32; i++) {
      var n = Math.floor(Math.random() * 16.0).toString(16);
      guid += n;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        guid += '-';
      }
    }
    return guid;
  }
}

export default GraphicSave;
