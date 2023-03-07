<template>
  <div v-show="shouldShow" class="sh-split-tool">
    <div v-show="isShow" style="width: 100%; height: 100%">
      <span
        v-if="$slots.default"
        style="width: 100%; height: 100%"
        @click="toggle"
      >
        <slot></slot>
      </span>
      <general-button
        v-else
        :position="position"
        :is-column="isColumn"
        :drag-enable="dragEnable"
        :icon-class="iconClass ? iconClass : 'split'"
        :show-img="showImg"
        :show-label="showLabel"
        :theme-style="themeStyle"
        :title="title ? title : '分割'"
        @click="toggle"
      />
    </div>
    <general-container
      v-if="dialogVisible"
      ref="container"
      class="sh-split-tool"
      title="确定分割图班?"
      :style-config="cardStyleConfig"
      :position="panelPosition"
      :append-to-body="true"
      :img-src="iconClass ? iconClass : 'split'"
      theme="light"
      @afterClose="toggle"
      @change:isShow="onChangeIsShow"
    >
      <div>
        <div class="diaBody split-label">
          <div v-if="cardShow" style="width: 100%">
            <div class="lineListDiv">
              <div v-if="lineList.length > 0">
                <div
                  v-for="(line, index) in lineList"
                  :key="line.id"
                  class="lineItem"
                  @mouseenter="mouseover(line)"
                  @mouseleave="mouseLeave(line)"
                >
                  <div class="lineName">{{ line.name }}:</div>
                  <div
                    class="lineDiv"
                    :style="`background: ${line.color};`"
                  ></div>
                  <span
                    v-show="line.show"
                    class="delBtn"
                    @click="_deleteLine(line.id, index)"
                  >
                    <i class="el-icon-delete"></i>
                  </span>
                </div>
              </div>
              <div v-else style="text-align: center">请绘制分割线</div>
            </div>
          </div>
        </div>
        <div class="btns">
          <el-button type="primary" size="small" @click="_confirmSave">{{
            isSplitFinish ? '保 存' : '切 割'
          }}</el-button>
          <el-button
            v-if="!isSplitFinish"
            type="warning"
            size="small"
            @click="clearAll"
            >清空</el-button
          >
          <el-button
            v-if="isSplitFinish"
            type="warning"
            size="small"
            @click="revoke"
            >撤销</el-button
          >
        </div>
        <!--        <span
          slot="footer"
          class="dialog-footer"
          style="
            text-align: center;
            display: block;
            float: right;
            margin-top: -10px;
          "
        >
          &lt;!&ndash;                    <el-button
                        style="min-width:80px;color:rgb(14 124 236);background:transparent;border:0px;font-size:16px"
                        @click="_executeSplit">分 割</el-button>&ndash;&gt;
          <el-button
            style="
              min-width: 80px;
              color: rgb(14 124 236);
              background: transparent;
              border: 0;
              font-size: 16px;
            "
            type="primary"
            @click="_confirmSave"
            >{{ isSplitFinish ? '保 存' : '切 割' }}</el-button
          >
          <el-button
            style="
              min-width: 80px;
              color: rgb(14 124 236);
              background: transparent;
              border: 0;
              font-size: 16px;
            "
            type="primary"
            @click="clearAll"
            >清 空</el-button
          >
          <el-button
            v-if="isSplitFinish"
            style="
              min-width: 80px;
              color: rgb(14 124 236);
              background: transparent;
              border: 0;
              font-size: 16px;
            "
            @click="revoke"
            >撤 销</el-button
          >
        </span>-->
      </div>
    </general-container>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { Draw } from 'ol/interaction';
import { Fill, Stroke, Style, Text } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import { multiLineString } from '@turf/helpers';
import { Loading, Message } from 'element-ui';
import { strDateTime } from 'shinegis-client-23d/src/utils/common';
import WKT from 'ol/format/WKT';
import GeoJSON from 'ol/format/GeoJSON';
import GeneralButton from 'shinegis-client-23d/packages/general-button';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import generalButtonProps from 'shinegis-client-23d/src/mixins/components/general-button-props';
import GaApi from 'shinegis-client-23d/src/utils/GaApi';

export default {
  name: 'ShSplitTool',
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
        left: '490px'
      })
    },
    url: {
      type: String
    },
    lineConfig: {
      type: Object
    },
    autoExecute: {
      //是否自动执行切割
      type: Boolean,
      default: true
    },
    autoSave: {
      //是否自动保存
      type: Boolean,
      default: false
    },
    isShowDialog: {
      //是否自动保存
      type: Boolean,
      default: true
    },
    panelPosition: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '40vh',
        left: '400px',
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
      isSplitFinish: false,
      warningDuration: 1500,
      showCard: true, //是否展示切割线列表框
      cardShow: false, //切割线列表框展示状态
      lineList: [],
      allFeatures: {},
      wktFormat: new WKT(),
      geoJSON: new GeoJSON(),
      splitWkts: [],
      deleteIds: [],
      active: false, //组件当前活动状态
      dialogVisible: false,
      newFeatures: [],
      originFeatures: [],
      splitCount: 0, //执行切割的次数
      reovkeIndex: 0, //撤销次数
      layerPrimaryKey: 'id' //图层主键字段
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
    if (this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    // 组件逻辑开始入口,如果组件有初始运行逻辑，请在此方法内编写，不要修改此方法名；如果没有可删除此方法。
    begin() {
      // ...
      this._baseUrl = this.url ? this.url : this.shinegaUrl;
    },
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    toggle(isOpen) {
      let type;
      if (typeof isOpen === 'boolean') {
        type = isOpen;
      } else {
        type = !this.active;
      }
      type ? this.activate() : this.deactivate();
    },
    activate() {
      this.isSplitFinish = false;
      this.splitCount = 0;
      this.reovkeIndex = 0;
      this.originFeatures = [];
      this.newFeatures = [];
      let _allSelectFeature = this.$map.getSelectFeatures();
      if (_allSelectFeature.length > 0) {
        this.active = true;
        this.dialogVisible = !this.autoSave;
        if (this.isShowDialog === false) {
          this.dialogVisible = false;
        }
        if (this.showCard) {
          this.cardShow = true;
        }
        this._initLine();
        this.$emit('change:active', true);
      } else {
        Message.warning('请先选择需要被分割的地块');
      }
    },
    deactivate() {
      this.isSplitFinish = false;
      this.splitCount = 0;
      this.reovkeIndex = 0;
      this.originFeatures = [];
      this.newFeatures = [];
      if (this.drawLine) {
        //this.drawLine.deactivate();
        this.$map.removeInteraction(this.drawLine);
      }
      if (this.showCard) {
        this.cardShow = false;
      }
      this.active = false;
      this.dialogVisible = false;
      this.$emit('change:active', false);
    },
    //清空
    clearAll() {
      this.lineList.forEach((item) => {
        let id = item.id;
        let feature = this.allFeatures[id];
        if (feature) {
          try {
            this.drawSource.removeFeature(feature);
          } catch (e) {
            console.warn(e);
          }
        }
      });
      this.lineList = [];
      this.allFeatures = {};
    },
    //执行切割
    _executeSplit() {
      let selectFeature = (this.selectedFeatures =
        this.$map.getSelectFeatures());
      if (selectFeature && selectFeature.length > 0) {
        let splitLine = this._createMuliLine();
        this.splitWkts = [];
        this.deleteIds = [];
        selectFeature.forEach((item, i) => {
          let geom = item.getGeometry();
          let wkt = this.wktFormat.writeGeometry(geom);
          this.splitWkts.push({
            id: 'split_' + i,
            geom: wkt
          });
          let id_ = item.id_ ? item.id_ : item.ol_uid;
          let idArr = id_.split('.');
          let id = idArr[1] ? idArr[1] : idArr[0];
          this.deleteIds.push(id);
        });

        this._bboxCilp(splitLine, this.splitWkts);
      } else {
        Message.warning('请选择要切割的图形');
      }
    },

    //合并切割线
    _createMuliLine() {
      let allLineFeatures = Object.values(this.allFeatures);
      let coordsArr = [];
      allLineFeatures.forEach((line) => {
        let geom = line.getGeometry();
        let coords = geom.getCoordinates();
        coordsArr.push(coords);
      });
      let multiLine = multiLineString(coordsArr);
      let line = this.geoJSON.readFeature(multiLine.geometry);
      let geom = line.getGeometry();
      return this.wktFormat.writeGeometry(geom);
    },

    //分割
    _bboxCilp(splitLine, features) {
      let loadingInstance = this._Loading();
      new GaApi(this._baseUrl)
        .split({
          features: features,
          splitLine: splitLine,
          token: this.token
        })
        .then((result) => {
          if (result.success) {
            if (result.data.length > 0) {
              this.isSplitFinish = true;
              this.resultHandel(result.data, this.layerPrimaryKey);
              loadingInstance.close();
            } else {
              Message.warning('没有分割结果!');
            }
          } else {
            Message.error('图形分割失败!');
          }
        })
        .catch((err) => {
          loadingInstance.close();
          console.error(err);
          Message.error('图形分割失败!');
        });
    },

    //切割结果处理
    resultHandel(result, pk) {
      this.splitCount += 1;
      this.reovkeIndex = this.splitCount;
      this.newFeatures = [];
      //这里为可以撤销，先不执行保存
      let selectFeature = (this.selectedFeatures =
        this.$map.getSelectFeatures());
      let originObj = { id: this.splitCount, features: selectFeature };
      this.originFeatures.push(originObj);
      let features = [];
      result.forEach((item) => {
        let id = item.id;
        let polygons = this.wktFormat.readGeometry(item.st_astext);
        let targetFeature = null;
        selectFeature.forEach((item, i) => {
          if (id === 'split_' + i) {
            targetFeature = item;
          }
        });
        let geoms = polygons.geometries_;
        geoms.forEach((geo, index) => {
          //创建一个新的feature,
          if (!this.autoSave) {
            let newFeature = targetFeature.clone();
            newFeature.setGeometry(geo);
            if (index !== 0) {
              newFeature.unset(pk);
            }
            newFeature.set('tempSelected', true);
            this.$map
              .getLayerById('drawLayer')
              .getSource()
              .addFeature(newFeature);
            this.newFeatures.push(newFeature);
          }
          let wkt = this.wktFormat.writeGeometry(geo);
          let featureParam = this._setParams({
            wkt: wkt,
            id: id,
            index: index
          });
          if (featureParam) {
            features.push(featureParam);
          }
        });
        //移除原来的feature
        this.$map
          .getLayerById('drawLayer')
          .getSource()
          .removeFeature(targetFeature);
      });
      if (features.length > 0) {
        this.$emit('splitSuccess', features);
        //如果需要自动保存
        if (this.autoSave) {
          this.splitCount = 0;
          this.reovkeIndex = 0;
          this._save(features);
          this.splitCount = 0;
          this.reovkeIndex = 0;
        }
      }
      this.clearAll();
    },
    //封装保存参数
    _setParams(options) {
      let wktString = options.wkt;
      let id = options.id;
      let feature = options.feature;
      let index = options.index;
      id = id.split('_')[1];
      let currentFeature = null;
      if (feature) {
        currentFeature = feature;
      } else {
        currentFeature = this.selectedFeatures[id];
      }
      let attrObj = currentFeature.values_;
      attrObj = attrObj ? attrObj : {};
      let attribute = [],
        featureObj = {};
      for (const key in attrObj) {
        if (key === 'id' && index && index > 0) {
          continue;
        }
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
    //确认保存时调用的接口
    _confirmSave() {
      //还未切割,先进行切割
      if (!this.isSplitFinish) {
        this._executeSplit();
        //不是自动保存时,进行保存
      } else if (!this.autoSave) {
        let editLayerInfo = this._getEditLayerInfo();
        if (!editLayerInfo) {
          Message.warning('请先选择需要保存的图层');
          return;
        }
        let selectFeature = (this.selectedFeatures =
          this.$map.getSelectFeatures());
        let features = [];
        selectFeature.forEach((item) => {
          let wkt = this.wktFormat.writeGeometry(item.getGeometry());
          let featureParam = this._setParams({
            wkt: wkt,
            id: '1_1',
            feature: item
          });
          if (featureParam) {
            features.push(featureParam);
          }
        });
        if (features.length > 0) {
          this._save(features);
        }
      }
      this.splitCount = 0;
      this.reovkeIndex = 0;
    },
    //自动保存时调用的接口
    _save(features) {
      new GaApi(this._baseUrl)
        .save({
          features: features,
          options: this.options?.saveOptions,
          ruleOptions: this.ruleOptions,
          token: this.token
        })
        .then((result) => {
          this.loadingInstance.close();
          if (result.success) {
            // 清空临时层地块
            let tempLayer = this.$map.getLayerById('drawLayer');
            tempLayer.getSource().clear();
            Message.success('图形分割成功');
            this.$map.refresh();
            //this._clearLayer()//清除临时层 图层移除会导致后续不能绘制 所以先注释
            this.clearAll(); //清空切割线列表
          } else {
            Message.error('分割结果保存失败');
          }
        })
        .catch((err) => {
          console.error(err);
          Message.error('分割结果保存失败');
          this.loadingInstance.close();
        });
    },
    //移除被分割的图形
    _deleteCurrentGraphics() {
      let editLayerInfo = this._getEditLayerInfo();
      // 获取目标图层主键
      new GaApi(this._baseUrl)
        .getPrimaryKey({
          layerTable: editLayerInfo.layerTable,
          token: this.token
        })
        .then((result) => {
          if (result.success) {
            this.primaryKey = result.data.key;
            this.primaryType = result.data.type;
            let newDeleteIds = [];
            this.deleteIds.forEach((id) => {
              if (
                this.primaryType === 'bigint' ||
                this.primaryType === 'smallint' ||
                this.primaryType === 'integer'
              ) {
                newDeleteIds = this.deleteIds;
              } else {
                newDeleteIds.push("'" + id + "'");
              }
            });
            // 删除
            new GaApi(this._baseUrl)
              .delete({
                featureClass: editLayerInfo.layerTable,
                filterWhere:
                  this.primaryKey + ' in (' + newDeleteIds.join(',') + ')',
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
                  Message.error('原图形删除失败');
                }
              })
              .catch((err) => {
                console.error(err);
                Message.error('原图形删除失败');
              });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    },

    drawLineEnd(feature) {
      this.isSplitFinish = false;
      let style = this._getStyle();
      feature.setStyle(style);
      this._setList(feature);
      if (this.autoExecute) {
        this._executeSplit();
      }
    },

    _initLine() {
      if (!this.drawLine && this.$map) {
        let map = this.$map;
        let drawSource = (this.drawSource = this._createSplitLayer(map));
        let lineColor = this.lineConfig ? this.lineConfig.lineColor : '';
        this.drawLine = new Draw({
          type: 'LineString',
          source: drawSource,
          map: map,
          style: new Style({
            fill: new Fill({ color: '#0044CC' }),
            stroke: new Stroke({
              lineDash: [1, 2, 3, 4, 5, 6],
              color: lineColor ? lineColor : '#34f509',
              width: 4
            })
          })
        });
        this.drawLine.on('drawend', (evt) => {
          this.drawLineEnd(evt.feature);
        });
      }
      this.$map.addInteraction(this.drawLine);
    },

    //删除其中一条
    _deleteLine(id, index) {
      this.$delete(this.lineList, index);
      let feature = this.allFeatures[id];
      if (feature) {
        this.drawSource.removeFeature(feature);
        this.$delete(this.allFeatures, id);
      }
    },

    //创建切割临时层
    _createSplitLayer(map) {
      let layers = this.$map.getLayers().getArray();
      let splitLineLayer = null,
        splitSource = null;
      layers.forEach((layer) => {
        if (layer.values_.id === 'flashTempLayer') {
          splitLineLayer = layer;
        }
      });
      if (splitLineLayer) {
        splitSource = splitLineLayer.getSource();
      } else {
        splitSource = new VectorSource();
        let vectorLayer = new VectorLayer({
          id: 'splitLineLayer',
          source: splitSource,
          zIndex: 9999999,
          opacity: 1
        });
        map.addLayer(vectorLayer);
      }
      return splitSource;
    },

    //设置切割线列表数据
    _setList(feature) {
      let len = this.lineList.length;
      let lastData = this.lineList[len - 1];
      let index = lastData ? lastData.id.split('_')[1] : 0;
      let id = 'split_' + (parseInt(index) + 1);
      feature.id = id;
      let fObj = {
        id: id,
        name: '切割线' + (parseInt(index) + 1),
        color: this._lineColor ? this._lineColor : '#34f509'
      };
      this.allFeatures[id] = feature;
      this.$set(this.lineList, len, fObj);
    },

    //设置切割线样式
    _getStyle() {
      let lineColor = this.lineConfig ? this.lineConfig.lineColor : '';
      let style = new Style({
        fill: new Fill({ color: '#0044CC' }),
        stroke: new Stroke({
          lineDash: [1, 2, 3, 4, 5, 6],
          color: lineColor ? lineColor : '#34f509',
          width: 4
        })
      });
      let showTag = this.lineConfig ? this.lineConfig.showTag : false;
      if (showTag) {
        let tagColor = this.lineConfig ? this.lineConfig.tagColor : '';
        //计算中间数据被删除的情况下的标记
        let len = this.lineList.length;
        let lastData = this.lineList[len - 1];
        let index = lastData ? lastData.id.split('_')[1] : 0;
        let text = new Text({
          font: '20px Microsoft YaHei',
          text: parseInt(index) + 1 + '',
          textAlign: 'left',
          fill: new Fill({
            color: tagColor ? tagColor : '#f50938'
          })
        });
        style.setText(text);
      }
      return style;
    },

    //获取当前编辑图层的信息
    _getEditLayerInfo() {
      if (!this.layerManager) {
        this.layerManager = this.$map.layerManager;
      }
      let editLayer = this.layerManager.getEditLayer();
      let editLayerInfo = editLayer ? editLayer.metadata : undefined; // 目标图层配置信息
      if (!editLayerInfo || !editLayerInfo.layerTable) {
        // Message({
        //     message:"当前图层没有配置数据源",
        //     type:"warning",
        //     offset:30
        // })
        if (this.loadingInstance) {
          this.loadingInstance.close();
        }
        return null;
      }
      return editLayerInfo;
    },

    //获取wkid
    _getWkid() {
      let wkid = 'EPSG:4490',
        spatialReference = 4490;
      if (this.$map) {
        wkid = this.$map.getView().getProjection().getCode();
        spatialReference = wkid.includes(':') ? wkid.split(':')[1] : wkid;
      }
      return { projection: wkid, spatialReference: spatialReference };
    },

    //清除临时层
    _clearLayer() {
      let layers = this.$map.getLayers().getArray();
      if (layers.length > 0) {
        layers.forEach((layer) => {
          if (layer.values_.id === 'splitLineLayer') {
            this.$map.removeLayer(layer);
          }
        });
      }
      this.deactivate();
      this.drawLine = null;
    },
    //加载遮罩
    _Loading() {
      if (!this.loadingInstance) {
        this.loadingInstance = Loading.service({
          target: this.$map.getTargetElement(),
          lock: true,
          text: '正在分割...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
      }
      return this.loadingInstance;
    },
    //撤销操作
    revoke() {
      if (this.reovkeIndex > 0) {
        this.newFeatures.forEach((item) => {
          this.$map.getLayerById('drawLayer').getSource().removeFeature(item);
        });
        this.newFeatures = [];
        this.originFeatures.forEach((item) => {
          if (item.id === this.reovkeIndex) {
            this.$map
              .getLayerById('drawLayer')
              .getSource()
              .addFeatures(item.features);
            this.originFeatures.splice(this.originFeatures.indexOf(item), 1);
            item.features.forEach((f) => {
              this.newFeatures.push(f);
            });
          }
        });
        this.reovkeIndex -= 1;
        this.splitCount = this.reovkeIndex;
      } else {
        //this.deactivate();
      }
    },
    mouseover(line) {
      //移进显示
      this.lineList.forEach((item) => {
        this.$set(item, 'show', false);
      });
      this.$set(line, 'show', true);
    },
    mouseLeave(line) {
      //移出不显示
      this.$set(line, 'show', false);
    }
  }
};
</script>
