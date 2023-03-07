<template>
  <div v-show="shouldShow" class="sh-union-tool">
    <div v-show="isShow" style="width: 100%; height: 100%">
      <span
        v-if="$slots.default"
        style="width: 100%; height: 100%"
        @click="activate"
      >
        <slot></slot>
      </span>
      <general-button
        v-else
        :position="position"
        :is-column="isColumn"
        :icon-class="iconClass ? iconClass : 'union'"
        :show-img="showImg"
        :show-label="showLabel"
        :drag-enable="dragEnable"
        :theme-style="themeStyle"
        :title="title ? title : '合并'"
        @click="activate"
      />
    </div>
    <general-container
      v-if="dialogVisible"
      ref="container"
      class="sh-union-tool"
      :title="showList ? '确定合并图斑?' : '提示'"
      :style-config="cardStyleConfig"
      :position="panelPosition"
      :append-to-body="true"
      :img-src="iconClass ? iconClass : 'union'"
      theme="light"
      @afterClose="revoke"
    >
      <div>
        <div class="diaBody">
          <div v-if="showList" style="width: 100%">
            <div style="margin-bottom: 5px; margin-left: 5px">选择目标图班</div>
            <div class="left">
              <div class="tableHeader">图班列表</div>
              <div class="tableBody">
                <div
                  v-for="(f, i) in featureList"
                  :key="'DK_' + i"
                  :class="'DK_btn DK_' + i"
                  @click="setAttrList(i)"
                >
                  图班-{{ i + 1 }}
                </div>
              </div>
            </div>
            <div class="right">
              <div class="tableHeader">
                <div class="blockDiv">
                  <div class="nameDiv">字段名称</div>
                  <div class="valueDiv">字段值</div>
                </div>
              </div>
              <div class="tableBody">
                <div
                  v-for="(value, name) in attArr"
                  :key="name"
                  class="blockDiv"
                >
                  <div class="nameDiv">{{ name }}</div>
                  <div class="valueDiv">{{ value }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else style="width: 100%">
            <!--            <div style="height: 1px; width: 100%; background: #cccccc"></div>-->
            <div class="textTip">确定合并图斑?</div>
            <!--            {{ '当前选择合并的图斑数量为' + featureList.length + '个' }}-->
          </div>
        </div>
        <div class="btns">
          <el-button type="primary" size="small" @click="confirmPanel"
            >合并</el-button
          >
          <el-button type="warning" size="small" @click="revoke"
            >取消</el-button
          >
        </div>
      </div>
    </general-container>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { Loading, Message, MessageBox } from 'element-ui';
import { Style, Fill, Stroke } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import union from '@turf/union';
import {
  multiPolygon as t_multiPolygon,
  polygon as t_polygon
} from '@turf/helpers';
import WKT from 'ol/format/WKT';
import { strDateTime } from 'shinegis-client-23d/src/utils/common';
import GeneralButton from 'shinegis-client-23d/packages/general-button';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import generalButtonProps from 'shinegis-client-23d/src/mixins/components/general-button-props';
import GeoJSON from 'ol/format/GeoJSON';
import GaApi from 'shinegis-client-23d/src/utils/GaApi';

export default {
  name: 'ShUnionTool',
  components: {
    GeneralButton,
    GeneralContainer
  },
  mixins: [common, emitter, generalButtonProps],
  props: {
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '1px',
        left: '560px'
      })
    },
    url: {
      type: String
    },
    //是否展示合并图斑列表
    showList: {
      type: Boolean,
      default: false
    },
    //是否自动保存
    autoSave: {
      type: Boolean,
      default: false
    },
    //是否自动执行合并
    autoExecute: {
      type: Boolean,
      default: true
    },
    panelPosition: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '40vh',
        left: '40vw',
        zIndex: 9999
      })
    },
    panelStyleConfig: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      shouldShow: false,
      typeConfig: {
        isShowBtn: false, // true时展示btn点btn显示面板,false直接显示面板
        isStartFix: false, // 初始化时Fix状态是否启用
        titleBar: {
          miniBtn: false,
          maxBtn: false,
          closeBtn: true,
          fixBtn: false,
          title: true
        },
        autoVisible: false,
        size: {
          radius: '4px',
          width: '300px',
          height: '300px'
        }
      },
      dialogVisible: false,
      baseUrl: '',
      featureList: [],
      flashLayer: null,
      attArr: {},
      featureIndex: 0,
      geoJSON: null,
      wktFormat: new WKT(),
      deleteIds: [],
      active: false, //组件当前活动状态

      newFeatures: [],
      originFeatures: [],
      unionCount: 0, //执行合并的次数
      reovkeIndex: 0 //撤销次数
    };
  },
  computed: {
    cardStyleConfig() {
      return {
        ...this.typeConfig,
        ...this.panelStyleConfig
      };
    }
  },
  watch: {
    currentView: {
      handler(val) {
        this.shouldShow = val === 'map';
      },
      immediate: true
    },
    currentInteraction(name) {
      if (name !== this.$options.name) {
        if (this.active) {
          this.deactivate();
        }
      }
    }
  },
  mounted() {
    if (this.$map) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    // 组件逻辑开始入口,如果组件有初始运行逻辑，请在此方法内编写，不要修改此方法名；如果没有可删除此方法。
    begin() {
      this.geoJSON = new GeoJSON();
      this.baseUrl = this.url ? this.url : this.shinegaUrl;
    },
    activate() {
      this.active = true;
      if (this.showList) {
        this.dialogbodyheight = 3000;
      } else {
        this.dialogbodyheight = 50;
      }
      //document.getElementsByClassName('el-dialog')[0].setAttribute('style', '');
      this.showDialog();
    },
    deactivate() {
      this.dialogVisible = false;
      this.active = false;
    },
    _getWkid() {
      let wkid = 'EPSG:4490',
        spatialReference = 4490;
      if (this.$map) {
        wkid = this.$map.getView().getProjection().getCode();
        spatialReference = wkid.includes(':') ? wkid.split(':')[1] : wkid;
      }
      return { projection: wkid, spatialReference: spatialReference };
    },

    showDialog() {
      if (!this.flashLayer) {
        this._createFlashLayer();
      }
      if (!this.dialogVisible) {
        this.dialogVisible = this._getSelectFeatures();
        if (this.dialogVisible === true) {
          this.dialogVisible = true;
          if (this.autoExecute && !this.showList) {
            this._startUnoin();
          }
        } else if (this.dialogVisible === 'one') {
          //如果选中一个
          this.dialogVisible = false;
          Message.info('请继续选择图形');
          //发送自定义事件到gis-select.vue 改变isMobile属性值
          this.$emit('change:isStayAdd', true);
        } else {
          Message.warning('请选择两个相邻图形');
        }
      } else {
        this.dialogVisible = false;
      }
    },

    //确认框
    confirmPanel() {
      this.dialogVisible = false;
      //如果展示合并图斑的列表
      if (this.showList) {
        let text = `是否确定合并当前选中图形,并继承【图形-${
          this.featureIndex + 1
        }】的属性?`;
        MessageBox.confirm(text, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            // 执行合并
            this._startUnoin();
          })
          .catch((err) => {
            console.error(err);
            //取消后还原面板
            this.dialogVisible = true;
            this.setAttrList(this.featureIndex);
          });
      } else {
        if (!this.autoExecute) {
          this._startUnoin();
        }
        this.confirmSave();
      }
    },

    //开始合并
    _startUnoin() {
      this.flashSource.clear();
      this.unionCount += 1;
      this.reovkeIndex = this.unionCount;
      this.newFeatures = [];
      let features = this.featureList;
      let cloneFeatures = [];
      features.forEach((item) => {
        cloneFeatures.push(item.clone());
      });
      let originObj = { id: this.unionCount, features: cloneFeatures };
      this.originFeatures.push(originObj);

      let polygon = this._unionGeometry(features);
      let feature = this.geoJSON.readFeature(polygon.geometry);
      let geom = feature.getGeometry();
      //把当前选择的featureIndex的Geometry设置为合并后的geometry
      features[this.featureIndex].setGeometry(geom);
      this.newFeatures.push(features[this.featureIndex]);
      features.forEach((item, index) => {
        if (index !== this.featureIndex) {
          this.$map.getLayerById('drawLayer').getSource().removeFeature(item);
        }
      });
      //如果自动保存，就执行保存，否则
      if (this.autoSave) {
        let wktString = this.wktFormat.writeGeometry(geom);
        let fObj = this._setParams(wktString);
        if (fObj) {
          this._save([fObj]);
        }
      }
    },

    //封装保存参数
    _setParams(wktString) {
      let currentFeature = this.featureList[this.featureIndex];
      this.needDeleteFeature = [];
      for (let i = 0; i < this.featureList.length; i++) {
        if (i !== this.featureIndex) {
          this.needDeleteFeature.push(this.featureList[i]);
        }
      }
      let attrObj = currentFeature.values_;
      attrObj = attrObj ? attrObj : {};
      let attribute = [],
        featureObj = {};
      for (const key in attrObj) {
        if (
          key !== 'geometry' &&
          key !== 'isSelected' &&
          key !== 'tempSelected'
        ) {
          let value = attrObj[key];
          if (typeof value === 'string') {
            if (strDateTime(value)) {
              value = '' + value.substr(0, value.length - 1) + '';
            }
          }
          attribute.push({
            name: key,
            value: value
          });
        }
      }
      let editLayerInfo = this._getEditLayerInfo();
      if (editLayerInfo) {
        featureObj.attribute = attribute;
        featureObj.featureClass = editLayerInfo.layerTable;
        featureObj.topological = true;
        featureObj.checkLevel = 0;
        featureObj.geometry = wktString;
        featureObj.spatialReference = this._getWkid().spatialReference;
        featureObj.filter = '';
      } else {
        featureObj = null;
      }
      return featureObj;
    },

    //调用接口,保存数据
    _save(features) {
      let loadingInstance = this._Loading();
      new GaApi(this.baseUrl)
        .save({
          features: features,
          options: this.options?.saveOptions,
          ruleOptions: this.ruleOptions,
          token: this.token
        })
        .then((result) => {
          loadingInstance.close(); // 关闭等待遮罩
          if (result.success) {
            // 清空临时层地块
            let tempLayer = this.$map.getLayerById('drawLayer');
            tempLayer.getSource().clear();
            Message.success('图形合并成功');
            this.$emit('change:isStayAdd', false);
            this._clearLayer(); //清除临时闪烁层
            this._delete();
            this.$map.refresh();
          } else {
            Message.error('图形合并失败');
          }
        })
        .catch((error) => {
          loadingInstance.close(); // 关闭等待遮罩
          Message.error('图形合并失败:' + error);
        });
    },

    _delete() {
      let editLayerInfo = this._getEditLayerInfo();
      // 获取目标图层主键
      new GaApi(this.baseUrl)
        .getPrimaryKey({
          layerTable: editLayerInfo.layerTable,
          token: this.token
        })
        .then((result) => {
          if (result.success) {
            this.primaryKey = result.data.key;
            this.primaryType = result.data.type;
            let featureIds = '';
            let deleteFeatures = [];
            this.needDeleteFeature.forEach((feature) => {
              let id = feature.values_[this.primaryKey];
              deleteFeatures.push(feature);
              if (
                this.primaryType === 'bigint' ||
                this.primaryType === 'smallint' ||
                this.primaryType === 'integer'
              ) {
                featureIds += id + ',';
              } else {
                featureIds += "'" + id + "',";
              }
            });
            featureIds = featureIds.substring(0, featureIds.length - 1);
            // 删除
            new GaApi(this.baseUrl)
              .delete({
                featureClass: editLayerInfo.layerTable,
                filterWhere: this.primaryKey + ' in (' + featureIds + ')',
                token: this.token
              })
              .then((result) => {
                if (result.success) {
                  // 重新加载图层资源
                  let key = editLayerInfo.id;
                  let layer = this.$map.getLayerById(key);
                  layer.getSource().refresh();
                  this.$map.refresh();
                } else {
                  Message.error('移除原图形失败');
                }
              })
              .catch((err) => {
                console.error(err);
                Message.error('移除原图形失败');
              });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },

    //获取当前编辑图层的信息
    _getEditLayerInfo() {
      if (!this.layerManager) {
        this.layerManager = this.$map.layerManager;
      }
      let editLayer = this.layerManager.getEditLayer();
      let editLayerInfo = editLayer ? editLayer.metadata : undefined; // 目标图层配置信息
      if (!editLayerInfo || !editLayerInfo.layerTable) {
        Message({
          message: '当前图层没有配置数据源',
          type: 'warning',
          offset: 30
        });
        return null;
      } else {
        return editLayerInfo;
      }
    },

    //合并图形
    _unionGeometry(geoArr) {
      let polygon = null;
      geoArr.forEach((item) => {
        let geom = item.getGeometry();
        if (geom) {
          let po = null,
            type = geom.getType();
          let coords = geom.getCoordinates();
          if (type === 'MultiPolygon') {
            po = t_multiPolygon(coords);
          } else if (type === 'Polygon') {
            po = t_polygon(coords);
          }
          if (po) {
            polygon = polygon ? union(polygon, po) : po;
          }
        }
      });
      return polygon;
    },

    //获取选中图形,并判断有几个
    _getSelectFeatures() {
      let flag = false;
      let _allSelectFeature = this.$map.getSelectFeatures();
      if (!_allSelectFeature || _allSelectFeature.length < 1) {
        flag = false;
      } else if (_allSelectFeature.length === 1) {
        flag = 'one';
      } else {
        this.featureList = _allSelectFeature;
        this.setAttrList(0);
        flag = true;
        //设置当前删除的id数组
        this.deleteIds = [];
        _allSelectFeature.forEach((item) => {
          let id_ = item.id_ ? item.id_ : item.ol_uid;
          let idArr = id_.split('.');
          let id = idArr[1] ? idArr[1] : idArr[0];
          this.deleteIds.push(id);
        });
      }

      return flag;
    },

    //设置属性列表
    setAttrList(index) {
      this.featureIndex = index;
      let feature = this.featureList[index];
      let valObj = feature.values_;
      valObj = valObj ? valObj : {};
      this.attArr = {};
      for (const key in valObj) {
        if (
          key !== 'geometry' &&
          key !== 'isSelected' &&
          key !== 'tempSelected'
        ) {
          this.$set(this.attArr, key, valObj[key]);
        }
      }
      let timer = setInterval(() => {
        let domList = document.getElementsByClassName('DK_btn');
        if (domList.length > 0) {
          clearInterval(timer);
          for (let i = 0; i < domList.length; i++) {
            let dom = domList[i];
            let style = dom.style;
            if (i === index) {
              style.color = '#409eff';
            } else {
              style.color = '#000';
            }
          }
        }
      });
      this.flashGraphic(feature);
      // this._createFlashLayer(feature)
    },

    //设置闪烁图斑
    flashGraphic(feature) {
      let index = 0,
        _self = this;

      function show() {
        index++;
        _self.flashSource.addFeature(feature);
        setTimeout(() => {
          close();
        }, 400);
      }

      function close() {
        _self.flashSource.removeFeature(feature);
        if (index < 3) {
          setTimeout(() => {
            show();
          }, 400);
        }
      }

      setTimeout(() => {
        show();
      }, 100);
    },

    //创建闪烁临时层
    _createFlashLayer() {
      let layers = this.$map.getLayers().getArray();
      let flashTempLayer = null;
      layers.forEach((layer) => {
        if (layer.values_.id === 'flashTempLayer') {
          flashTempLayer = layer;
        }
      });
      if (flashTempLayer) {
        this.flashSource = flashTempLayer.getSource();
      } else {
        this.flashSource = new VectorSource();
        this.flashLayer = new VectorLayer({
          source: this.flashSource,
          id: 'flashTempLayer',
          zIndex: 9999999,
          style: new Style({
            fill: new Fill({
              color: '#f8f404'
            }),
            stroke: new Stroke({
              color: '#03f82c',
              width: 2
            })
          })
        });
        this.$map.addLayer(this.flashLayer);
      }
    },

    //清除临时层
    _clearLayer() {
      let layers = this.$map.getLayers().getArray();
      if (layers.length > 0) {
        layers.forEach((layer) => {
          if (layer.values_.id === 'flashTempLayer') {
            this.$map.removeLayer(layer);
            this.flashLayer = null;
          }
        });
      }
    },

    //加载遮罩
    _Loading() {
      if (!this.loadingInstance) {
        this.loadingInstance = Loading.service({
          target: this.$map.getTargetElement(),
          lock: true,
          text: '合并中...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
      }
      return this.loadingInstance;
    },
    //撤销合并
    revoke() {
      if (this.reovkeIndex > 0) {
        let hasFeature = false;
        this.newFeatures.forEach((item) => {
          if (
            this.$map.getLayerById('drawLayer').getSource().hasFeature(item)
          ) {
            hasFeature = true;
            return;
          }
        });
        // 合并图斑不存在时，代表地块被其他方式清空了，不进行撤回操作
        if (!hasFeature) {
          this.dialogVisible = false;
          return;
        }
        this.newFeatures.forEach((item) => {
          try {
            this.$map.getLayerById('drawLayer').getSource().removeFeature(item);
          } catch (err) {
            console.error(err);
          }
        });
        this.newFeatures = [];
        this.originFeatures.forEach((item) => {
          if (item.id === this.reovkeIndex) {
            this.$map
              .getLayerById('drawLayer')
              .getSource()
              .addFeatures(item.features);
            this.originFeatures.pop(item);
            item.features.forEach((f) => {
              this.newFeatures.push(f);
            });
          }
        });
        this.reovkeIndex -= 1;
        this.unionCount = this.reovkeIndex;
        this.featureIndex = -1;
      }
      this.dialogVisible = false;
    },
    //确认保存
    confirmSave() {
      if (this.featureIndex !== -1) {
        let feature = this.$map.getSelectFeatures()[0];
        let wkt = this.wktFormat.writeGeometry(feature.getGeometry());
        let fObj = this._setParams(wkt);
        if (fObj) {
          this._save([fObj]);
          this.unionCount = 0;
          this.reovkeIndex = 0;
          this.featureIndex = -1;
          this.featureList = [];
        } else {
          this.dialogVisible = true;
        }
      }
    }
  }
};
</script>
