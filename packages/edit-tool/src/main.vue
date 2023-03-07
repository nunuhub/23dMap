<template>
  <div v-show="shouldShow">
    <general-container
      id="editdrawer"
      class="editDrawer"
      :title="title ? title : '图形编辑'"
      :class="{ dark: theme === 'dark' }"
      :is-show.sync="drawer"
      :style-config="cardStyleConfig"
      :theme-style="cardThemeStyle"
      :position="position"
      :img-src="imgSrc ? imgSrc : 'edit'"
      :berth="berth"
      :theme="theme"
      :append-to-body="appendToBody"
      :drag-enable="dragEnable"
      :only-container="onlyContainer"
      :before-close="cancelEditing"
      @change:isShow="onChangeIsShow"
    >
      <div id="FeatureEditingCard">
        <el-card class="box-card">
          <div>
            <el-tabs v-model="activeName">
              <el-tab-pane label="坐标编辑" name="first">
                <CoordinatesEditing
                  ref="coordinatesEditing"
                  :map="map"
                  :prev-step-disabled-copy.sync="prevStepDisabled"
                  :next-strp-disabled-copy.sync="nextStrpDisabled"
                  :save-disabled="saveDisabled"
                >
                </CoordinatesEditing>
              </el-tab-pane>
              <el-tab-pane label="属性编辑" name="second">
                <AttributesEditing
                  ref="attributesEditing"
                  :map="map"
                ></AttributesEditing>
              </el-tab-pane>
            </el-tabs>
          </div>
          <div style="margin: 25px 5px 5px 5px; display: flow-root">
            <div v-show="activeName === 'first'" style="float: left">
              <el-button
                id="disabled"
                type="warning"
                size="small"
                :disabled="prevStepDisabled"
                title="撤销"
                @click="clickStep"
                ><img
                  src="../../../src/assets/img/edit-tool/revert.png"
                  width="12"
                  height="12"
                  alt="缩放"
              /></el-button>
              <el-button
                type="warning"
                size="small"
                :disabled="nextStrpDisabled"
                title="恢复"
                @click="clickStep"
              >
                <img
                  src="../../../src/assets/img/edit-tool/resume.png"
                  width="12"
                  height="12"
                  alt="缩放"
                />
              </el-button>
            </div>
            <div style="float: right">
              <el-button size="small" @click="cancelEditing()">取消</el-button>
              <el-button
                type="primary"
                :disabled="saveDisabled"
                size="small"
                @click="postCondition()"
                >保存</el-button
              >
            </div>
          </div>
        </el-card>
      </div>
    </general-container>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import $ from 'jquery';
import Bus from 'shinegis-client-23d/src/utils/bus';
import { Message, Loading } from 'element-ui';
import WKT from 'ol/format/WKT';
import CoordinatesEditing from './coordinates-editing.vue';
import AttributesEditing from './attributes-editing.vue';
import GaApi from 'shinegis-client-23d/src/utils/GaApi';
import { getSaveRuleOptions } from 'shinegis-client-23d/src/utils/plug/client-admin/rule';

export default {
  name: 'ShEditTool',
  components: {
    CoordinatesEditing,
    GeneralContainer,
    AttributesEditing
  },
  mixins: [common, generalCardProps, emitter],
  props: {
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '70px',
        right: '70px'
      })
    },
    baseUrl: {
      type: String
    },
    adminUrl: {
      type: String
    },
    saveOptions: {
      type: Object
    }
  },
  data() {
    return {
      typeConfig: {
        size: {
          width: '335px',
          height: '555px' // 原先300
        }
      },
      map: null,
      activeName: 'first',
      selectedFeatures: undefined,
      prevStepDisabled: true, // 上一步按钮禁用状态
      nextStrpDisabled: true, // 下一步按钮禁用状态
      saveDisabled: false, // 保存按钮禁用状态
      removeOperation: false,
      drawer: false, //是否打开内容编辑抽屉
      type: 'edit',
      select: null,
      modify: null,
      mBaseUrl: ''
    };
  },
  computed: {
    cardStyleConfig() {
      return {
        ...this.typeConfig,
        ...this.styleConfig
      };
    },
    shouldShow() {
      if (this.viewMode === '2D') {
        return true;
      } else if (this.viewMode === '3D') {
        return false;
      } else {
        return this.currentView === 'map';
      }
    }
  },
  mounted() {
    if (this.$map) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
    this.mBaseUrl = this.baseUrl ? this.baseUrl : this.shinegaUrl;
    Bus.$on('cancelEdit', () => {
      this.drawer = false;
      this.closeWindow();
    });
    Bus.$on('startFeatureEditing', (options) => {
      let self = this;
      let layerManager = this.$map.layerManager;
      this.currentTargetLayer = layerManager.getEditLayer()?.metadata; // 目标图层配置信息
      if (!this.currentTargetLayer) {
        //Message('请选择当前可编辑层');
        return;
      }
      this.mapOptions = this.shinegaInitData ? this.shinegaInitData : {};
      this.type = options.type;
      if (options.type === 'edit') {
        this.select = options.select;
        this.modify = options.modify;
        this.selectedFeatures = this.select.getFeatures();
      } else {
        this.selectedFeatures = options.features;
      }

      let selectedFeatureArray = this.selectedFeatures.getArray();

      // 判断要保存的要素是否都属于要保存的图层，如果有要素的layerTag和目标图层不一致，则提示
      let isExsited = $(selectedFeatureArray).filter((index, feature) => {
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
      if (
        this.mapOptions &&
        this.mapOptions.xm &&
        this.mapOptions.xm.trim().length > 0
      ) {
        // 当map中xm的值存在，为TEMP，只能删除临时层
        if (this.mapOptions.xm.toUpperCase() === 'TEMP') {
          let isExsited = $(selectedFeatureArray).filter((index, feature) => {
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
        } else if (
          this.mapOptions.xm.toUpperCase() !== layerTag.toUpperCase()
        ) {
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
        this.mapOptions.editProjectGuid &&
        this.mapOptions.editProjectGuid.trim().length > 0
      ) {
        let xmGuidIsExsited = $(selectedFeatureArray).filter(
          (featureIndex, feature) => {
            for (var i in feature.values_) {
              if (i.toUpperCase() === 'XM_GUID') {
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
        if (selectedFeatureArray.length > 1) {
          Message({
            message: '操作非法，只能保存指定的地块！',
            type: 'warning',
            showClose: true
          });
          return;
        } else {
          for (var i in selectedFeatureArray[0].values_) {
            let value = selectedFeatureArray[0].values_[i];
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

      this.drawer = true;

      this.$nextTick(() => {
        this.$refs.coordinatesEditing.resetData();
        this.$refs.coordinatesEditing.startEdit(this.selectedFeatures);
        this.$refs.attributesEditing.startEdit(
          this.selectedFeatures,
          this.shinegaInitData
        );
      });
    });
  },
  methods: {
    begin() {
      this.$map.layerManager.on('afterRemoveLayer', (item) => {
        let id = item.layer.get('id');
        if (
          this.$map.layerManager.getEditLayer()?.metadata?.id === id &&
          this.selectedFeatures?.getArray() &&
          this.selectedFeatures.getArray().length > 0
        ) {
          this.closeWindow();
        }
      });
      this.$emit('inited');
    },
    initEdit() {
      //  let interactionManager =InteractionManager.getInstance(this.$map)
      //  interactionManager.interactions.push(new EditTool(this.$map))
      //  interactionManager.openInteraction('editTool')
    },
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    closeWindow() {
      let curFeature = this.selectedFeatures.getArray()[0];
      if (!curFeature) {
        return;
      }
      if (this.$refs.coordinatesEditing.initEditCoord) {
        if (curFeature.getId() === undefined) {
          curFeature.setId('removeFeature');
        }
        let drawLayerSource = this.$map.getLayerById('drawLayer').getSource();

        if (curFeature.get('isSelected') === true) {
          var selectArray = this.$map.getSelectFeatures();
          for (var i = 0; i < selectArray.length; i++) {
            var selectedItem = selectArray[i];
            if (selectedItem.get('isSelected')) {
              selectArray.splice(i, 1);
              i--;
              drawLayerSource.removeFeature(selectedItem);
            }
          }
          if (this.type === 'edit') {
            this.select.getFeatures().getArray().pop();
            //drawLayerSource.getFeatures().pop()
            //this.select.getLayer(curFeature).getSource().removeFeature(curFeature);
            this.modify.getOverlay().getSource().clear();
          }
        } else {
          // 将地块恢复至编辑前的初始状态
          curFeature
            .getGeometry()
            .setCoordinates(this.$refs.coordinatesEditing.initEditCoord);
        }
        //恢复图形状态
        Bus.$emit('revokeFeatureEditing', true);
        this.$emit('closeWindow');
      }
      this.drawer = false;
      // this.selectedFeatures.clear()
    },
    /**
     * 点击上一步、下一步按钮触发此方法
     * 此处的中心思想是监听tableData的变化，将上一次的数据记录下来(删除节点单独处理)
     * 通过控制上一步或下一步的禁用状态，实现数据的交替赋值
     * @method clickStep
     */
    clickStep() {
      this.$refs.coordinatesEditing.clickStep();
    },
    /* 保存要素(如果要素是空间服务里的要素)*/
    saveFeature(features) {
      let self = this;
      // 等待遮罩
      let loadingInstance = Loading.service({
        target: this.$map.getTargetElement(),
        lock: true,
        text: '保存中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.1)'
      });
      let layerManager = this.$map.layerManager;
      let currentTargetLayer = layerManager.getEditLayer().metadata; // 目标图层配置信息
      new GaApi(this.mBaseUrl)
        .save({
          features: features,
          options: this.options?.saveOptions,
          ruleOptions: this.ruleOptions,
          token: this.token
        })
        .then((result) => {
          //this.$emit('saveSuccess')
          loadingInstance.close(); // 关闭等待遮罩
          self.afterSave(result, currentTargetLayer);
        })
        .catch((error) => {
          loadingInstance.close(); // 关闭等待遮罩
          Bus.$alert(error, '保存失败', {
            dangerouslyUseHTMLString: true
          });
        });
    },
    afterSave(result, currentTargetLayer) {
      let key = currentTargetLayer.id;
      if (result != null && result.success) {
        // 清空临时层地块
        let tempLayer = this.$map.getLayerById('drawLayer');
        tempLayer.getSource().clear();
        // 重新加载图层资源,
        let layer = this.$map.getLayerById(key);
        layer.getSource().refresh();
        let res = this.$map.getView().getResolution();
        res = res + 0.00001 * res;
        this.$map.getView().setResolution(res);
        Message({
          message: '地块保存成功',
          type: 'success',
          showClose: true
        });
        this.$emit('saveSuccess');
        this.closeWindow();
      } else {
        Bus.$alert(
          result.message ? result.message : '地块保存失败',
          '保存失败',
          {
            dangerouslyUseHTMLString: true
          }
        );
      }
    },
    /**
     * 后置条件判断
     * @method postCondition
     */
    postCondition() {
      if (!this.$refs.coordinatesEditing.getState()) {
        Message({
          message: '请先完成坐标编辑，再进行保存操作',
          type: 'warning',
          showClose: true
        });
        return;
      }
      let self = this;
      let selectFeatures =
        this.selectedFeatures && this.selectedFeatures.getArray().length > 0
          ? [this.selectedFeatures.getArray()[0]]
          : [];
      let layerManager = this.$map.layerManager;
      let currentTargetLayer = layerManager.getEditLayer().metadata;
      if (currentTargetLayer === null) {
        Message({
          message: '目标图层未选中',
          type: 'warning',
          showClose: true
        });
        return;
      }
      if (selectFeatures.length === 0) {
        // 地块未选中则进行提示
        Message({
          message: '请选中要保存的地块',
          type: 'warning',
          showClose: true
        });
        return;
      }
      if (
        !currentTargetLayer.layerTable ||
        currentTargetLayer.layerTable.trim() === ''
      ) {
        Message({
          message: '图层未配置数据源，请检查',
          type: 'warning',
          showClose: true
        });
        return;
      }
      // 判断要保存的要素是否都属于要保存的图层，如果有要素的layerTag和目标图层不一致，则提示
      let isExsited = $(selectFeatures).filter((index, feature) => {
        return (
          feature.layerTag && feature.layerTag !== currentTargetLayer.layerTag
        );
      });

      if (isExsited.length > 0) {
        Message({
          message:
            '操作非法，选择地块中包含非【' +
            currentTargetLayer.label +
            '】图层的地块！',
          type: 'warning',
          showClose: true
        });
        return;
      }
      // 等待遮罩
      let loadingInstance = Loading.service({
        target: this.$map.getTargetElement(),
        lock: true,
        text: '获取主键中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.1)'
      });
      // 条件都满足以后，请求服务获取表主键，进行数据封装
      new GaApi(this.mBaseUrl)
        .getPrimaryKey({
          layerTable: currentTargetLayer.layerTable,
          token: this.token
        })
        .then((result) => {
          loadingInstance.close();
          if (result.success) {
            this.primaryKey = result.data.key;
            this.primaryType = result.data.type;
            getSaveRuleOptions({
              url: this.configInstance
                ? this.configInstance.url
                : this.adminUrl,
              tocId: currentTargetLayer.id,
              token: this.token,
              applicationId: this.fastApplicationId,
              hasRules: currentTargetLayer.hasRules
            }).then((ruleOptions) => {
              this.ruleOptions = ruleOptions;
              // 数据封装
              var features = self.processData(currentTargetLayer);
              self.saveFeature(features);
            });
          } else {
            Message({
              message: '获取主键失败，请检查数据源',
              type: 'warning',
              showClose: true
            });
          }
        })
        .catch((error) => {
          loadingInstance.close();
          console.error(error);
          Message({
            message: '获取主键失败，请检查数据源',
            type: 'warning',
            showClose: true
          });
        });
    },

    cancelEditing() {
      let curFeature = this.selectedFeatures?.getArray()?.[0];
      if (curFeature) {
        this.$confirm('是否放弃当前编辑，地块将恢复初始状态？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          closeOnClickModal: false,
          closeOnPressEscape: false
        })
          .then(() => {
            this.closeWindow();
          })
          .catch(() => {});
      } else {
        this.drawer = false;
      }
      return false;
    },

    handleClose() {
      this.cancelEditing();
    },

    /**
     * 数据处理，设置要保存的要素，目前mapOptions
     * 1、判断mapOptions.xmGuid是否有值，如果有值，则属性添加XM_GUID
     * 2、判断mapOptions.dkGuid是否有值，如果有值，则属性添加DK_GUID
     * 3、如果map中存在xmGuid，判断要保存的地块xm_guid是否与xmGuid相同或者是否为空
     * 4、如果map中存在dkGuid，判断要保存地块是否只有一个，并且地块dk_guid是否与dkGuid相同或者是否为空
     * @method processData
     */
    processData(currentTargetLayer) {
      let features = [];
      let wktFormat = new WKT();
      let selectFeatures =
        this.selectedFeatures && this.selectedFeatures.getArray().length > 0
          ? [this.selectedFeatures.getArray()[0]]
          : [];
      selectFeatures.forEach((feature) => {
        // geoserver类型服务，geometry采用wkt传参
        let toBeSaveFeature = {};
        let geometry = feature.getGeometry();
        let attributeArr = [];
        let filterWhere;
        // 将选中的图形中的字段添加进来
        // 首先判断新的attributeArr数组中是否已经存在对应的字段
        // 若不存在则添加
        let attrEditTable = this.$refs.attributesEditing.getTableData();
        for (let item of attrEditTable) {
          if (typeof item.value !== 'object') {
            // 去掉属性中的geometry
            /*let attrIsExsited = $(attributeArr).filter((index, item) => {
							return item.name === attrEditTable[index].key.toUpperCase()
						})*/
            //console.log('push')
            attributeArr.push({
              name: item.key.toUpperCase(),
              value: item.value
            });
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
            value: '新地块'
          });
        }
        let wktString = wktFormat.writeGeometry(geometry);
        filterWhere = '';
        // 判断当前选中地块的id是否存在，如果存在，则说明保存的地块已存在于库中，进行的是编辑后的保存操作
        let featureId = feature.values_[this.primaryKey?.toLowerCase()];
        if (featureId) {
          let value;
          if (
            this.primaryType === 'bigint' ||
            this.primaryType === 'smallint' ||
            this.primaryType === 'integer' ||
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
          filterWhere = this.primaryKey + ' in (' + value + ')';
        }
        let projection = this.$map.getView().getProjection();
        let wkid = projection.code_.split(':')[1];
        // geoserver 采用wkt传递geometry
        toBeSaveFeature.geometry = wktString;

        // 数据源
        toBeSaveFeature.featureClass = currentTargetLayer.layerTable;
        // 是否启用拓扑检查，默认为true
        toBeSaveFeature.topological = true;
        // 拓扑检查等级  0为低级  1为中级  2为高级
        toBeSaveFeature.checkLevel = currentTargetLayer.topologyCheck;
        // 地块属性信息
        toBeSaveFeature.attribute = attributeArr;
        // 空间投影坐标系
        toBeSaveFeature.spatialReference = wkid;
        // 若为编辑地块，则传递相应字段信息
        toBeSaveFeature.filter = filterWhere;
        features.push(toBeSaveFeature);
      });
      return features;
    },
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
};
</script>

<style>
#FeatureEditingCard {
  height: auto;
}

#FeatureEditingCard > .box-card > .el-card__body {
  padding: 0 8px;
}

#FeatureEditingCard > .box-card > .el-card__header {
  padding: 1px 1px;
}
#FeatureEditingCard > .box-card {
  background: transparent !important;
  box-shadow: initial !important;
  border: initial !important;
}
</style>
