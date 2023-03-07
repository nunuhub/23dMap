<template>
  <div class="sh-legend-edit" :class="{ dark: theme === 'dark' }">
    <general-container
      ref="container"
      :is-show.sync="visible"
      :style-config="cardStyleConfig"
      :theme-style="cardThemeStyle"
      :title="title ? title : '图例配置'"
      :position="position"
      :img-src="imgSrc ? imgSrc : 'legend'"
      :berth="berth"
      :theme="theme"
      class="sh-legend"
      :class="{ dark: theme === 'dark' }"
      :append-to-body="appendToBody"
      :drag-enable="dragEnable"
      :only-container="onlyContainer"
      :before-close="beforeClose"
      @change:isShow="onChangeIsShow"
    >
      <template slot="extBtn">
        <el-tooltip
          content="保存"
          placement="top"
          :open-delay="300"
          style="cursor: pointer"
        >
          <icon-svg
            icon-class="attr-save"
            :fillcolor="btnFillColor"
            width="16px"
            height="16px"
            padding="2px"
            @click.native="save"
          />
        </el-tooltip>
      </template>
      <div class="editorContainer">
        <div class="layerNameContainer">
          <span class="label-layer">图层名称</span>
          <el-switch v-model="showName" class="switch-layer"> </el-switch>
        </div>
        <div class="divider" />
        <div class="layerContainer">
          <div class="layer-card">
            <div class="layer-card-header">
              <span class="layer-card-header-title">显示图层</span>
              <div class="layer-card-header-checkbox">
                <el-checkbox
                  v-model="isAllSelect"
                  :indeterminate="isIndeterminate"
                  @change="handleCheckAllChange"
                />
                <span class="layer-card-header-checkbox-label">全选</span>
              </div>
            </div>
            <div class="divider" />
            <div class="layer-edit-container">
              <!--	左侧图层列表					-->
              <div class="layer-list">
                <div
                  v-for="(lyr, index) in editLegendList"
                  :key="'layer-list' + index"
                  class="layer-list-item"
                  :class="{ 'is-active': selectedIndex === index }"
                >
                  <el-checkbox
                    v-model="lyr.isShow"
                    class="layer-list-item-checkbox"
                    @change="handleCheckedLayersChange"
                  />
                  <edit-span
                    v-model="lyr.title"
                    class="layer-list-item-name single-label"
                    :style="fontStyle"
                  />
                  <icon-svg
                    :icon-class="
                      selectedIndex === index ? 'left_arrow' : 'right_arrow'
                    "
                    fillcolor="#C0C4CC"
                    width="28px"
                    height="28px"
                    padding="9px"
                    @click.native="showLegendList(lyr, index)"
                  />
                </div>
              </div>
              <!--	右侧图例列表					-->
              <div v-if="layer" class="legend-list">
                <div
                  v-for="(childLayer, i) in layer.layers"
                  :key="'legend-list' + i + '_' + layer.id"
                >
                  <div
                    v-for="(leg, ii) in childLayer.legend"
                    :id="'legend' + ii + '_' + layer.id"
                    :key="'legend' + ii + '_' + layer.id"
                    class="layer-list-item"
                  >
                    <img
                      v-if="layer.type === 'arcgis'"
                      class="legend-list-img"
                      :src="'data:image/png;base64,' + leg.imageData"
                      :width="customWidth"
                      :height="customWidth"
                    />
                    <symbolLegendIcon
                      v-else-if="layer.type === 'symbol'"
                      class="legend-list-img"
                      :style-obj="leg"
                      :type="layer.symbolType"
                      :width="customWidth"
                      :height="customWidth"
                    />
                    <legendIcon
                      v-else
                      class="legend-list-img"
                      :symbolizers="leg.symbolizers"
                      :width="customWidth"
                      :height="customWidth"
                    ></legendIcon>
                    <edit-span
                      v-model="leg.label"
                      class="legend-list-name single-label"
                      :style="fontStyle"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </general-container>
  </div>
</template>
<script>
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { editTypeConfig } from './utils/config';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import legendIcon from './icon/geoserver-legend-icon';
import symbolLegendIcon from './icon/symbol-legend-icon';
import editSpan from './edit-span';
import { Message } from 'element-ui';

export default {
  name: 'ShLegendEdit',
  components: {
    symbolLegendIcon,
    GeneralContainer,
    IconSvg,
    legendIcon,
    editSpan
  },
  mixins: [common, emitter, generalCardProps],
  props: {
    isShowName: {
      type: Boolean,
      default: true
    },
    customWidth: {
      type: Number,
      default: 14
    },
    btnFillColor: {
      type: String
    },
    legendListObj: {
      type: Object,
      default: () => {}
    },
    fontStyle: {
      type: Object
    }
  },
  data() {
    return {
      showName: true,
      isAllSelect: true,
      editLegendList: [],
      layer: null,
      selectedIndex: -1,
      isIndeterminate: true
    };
  },
  computed: {
    cardStyleConfig() {
      let style = JSON.parse(
        JSON.stringify({
          ...editTypeConfig,
          ...this.styleConfig
        })
      );
      return style;
    }
  },
  watch: {
    legendListObj: {
      handler() {
        this.initData();
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    this.showName = this.isShowName;
  },
  methods: {
    onChangeIsShow(value) {
      //还原数据
      this.initData();
      this.$emit('change:isShow', value);
    },
    initData() {
      this.showName = this.isShowName;
      this.editLegendList = JSON.parse(JSON.stringify(this.legendListObj));
      this.handleCheckedLayersChange();
    },
    closeLegendList() {
      this.selectedIndex = -1;
      this.layer = null;
    },
    showLegendList(layer, index) {
      if (layer.isLowVersion === true) {
        Message({
          type: 'warning',
          message:
            '该服务Geoserver版本过低，无法进行图例名称编辑，请升级到2.15.0及以上的版本再进行编辑'
        });
      } else {
        if (this.selectedIndex === index) {
          this.closeLegendList();
        } else {
          this.layer = layer;
          this.selectedIndex = index;
        }
      }
    },
    handleCheckAllChange(value) {
      this.isIndeterminate = false;
      for (let id in this.editLegendList) {
        let legend = this.editLegendList[id];
        legend.isShow = value;
      }
    },
    handleCheckedLayersChange() {
      let selectNum = 0;
      let allCount = Object.keys(this.editLegendList).length;
      for (let id in this.editLegendList) {
        let legend = this.editLegendList[id];
        if (legend.isShow) {
          selectNum++;
        }
      }
      this.isAllSelect = selectNum === allCount;
      this.isIndeterminate = selectNum > 0 && selectNum < allCount;
    },
    save() {
      this.$emit('save', this.editLegendList, this.showName);
      this.closeLegendList();
    },
    beforeClose() {
      this.closeLegendList();
      return true;
    }
  }
};
</script>
