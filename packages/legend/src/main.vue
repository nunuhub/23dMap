<template>
  <div class="sh-legend" :class="{ dark: theme === 'dark' }">
    <general-container
      ref="container"
      :is-show.sync="visible"
      :style-config="cardStyleConfig"
      :theme-style="cardThemeStyle"
      :title="title ? title : '图例'"
      :position="position"
      :img-src="imgSrc ? imgSrc : 'legend'"
      :berth="berth"
      :theme="theme"
      class="sh-legend"
      :class="{ dark: theme === 'dark' }"
      :append-to-body="appendToBody"
      :drag-enable="dragEnable"
      :only-container="onlyContainer"
      @change:isShow="onChangeIsShow"
    >
      <template v-if="isEdit" slot="extBtn">
        <el-tooltip
          content="编辑"
          placement="top"
          :open-delay="300"
          style="cursor: pointer"
        >
          <icon-svg
            icon-class="attr-edit"
            :fillcolor="btnFillColor"
            width="16px"
            height="16px"
            padding="2px"
            @click.native="showEdit"
          />
        </el-tooltip>
      </template>
      <div ref="legendList" class="legendList">
        <!--	Loading和消息	-->
        <div
          v-if="Object.keys(legendListObj).length < 1 && plotList.length === 0"
          style="text-align: center; vertical-align: middle; font-size: 12px"
        >
          <div v-if="loading" class="loadingDiv">
            <div style="color: #000000">正在加载...</div>
          </div>
          <div v-else>暂无数据</div>
        </div>
        <!-- 图例	-->
        <span v-else>
          <!--	图层图例	-->
          <div
            v-for="(lyrs, key) in legendListObj"
            :key="key"
            class="legList"
            :style="columStyle"
          >
            <template v-if="lyrs.isShow">
              <div
                v-if="showName"
                :style="_layerNameFontStyle"
                class="legList-layerName"
              >
                {{ lyrs.title }}
              </div>
              <icon-svg
                v-if="!lyrs.isShowChildFilter && isShowFilterBtn"
                :icon-class="lyrs.isHide ? 'inVisible' : 'visible'"
                :fillcolor="lyrs.isHide ? '#C0C4CC' : '#467CF3'"
                :width="customWidth + 'px'"
                :height="customWidth + 'px'"
                class="layer-visible"
                @click.native="layerFilter(lyrs)"
              />
              <!--图层图例-->
              <div
                v-for="(layer, i) in lyrs.layers"
                :key="'lyr_' + i + '_' + key"
              >
                <div
                  v-for="(leg, ii) in layer.legend"
                  :key="'leg_' + ii + '_' + key"
                  class="legendContainer"
                >
                  <div style="overflow: hidden">
                    <template v-if="lyrs.isLowVersion">
                      <div class="legendImg">
                        <img :src="leg.src" />
                      </div>
                    </template>
                    <template v-else>
                      <div class="legendImg">
                        <img
                          v-if="lyrs.type === 'arcgis'"
                          :src="'data:image/png;base64,' + leg.imageData"
                          :width="customWidth"
                          :height="customWidth"
                        />
                        <symbolLegendIcon
                          v-else-if="lyrs.type === 'symbol'"
                          :style-obj="leg"
                          :type="lyrs.symbolType"
                          :width="customWidth"
                          :height="customWidth"
                        />
                        <legendIcon
                          v-else
                          :symbolizers="leg.symbolizers"
                          :width="customWidth"
                          :height="customWidth"
                        ></legendIcon>
                      </div>
                      <div class="legendName" :style="_fontStyle">
                        {{ leg.label }}
                      </div>
                    </template>

                    <icon-svg
                      v-if="lyrs.isShowChildFilter && isShowFilterBtn"
                      :icon-class="leg.isHide ? 'inVisible' : 'visible'"
                      :fillcolor="leg.isHide ? '#C0C4CC' : '#467CF3'"
                      :width="customWidth + 'px'"
                      :height="customWidth + 'px'"
                      class="layer-visible"
                      @click.native="legendFilter(lyrs, i, leg)"
                    />
                  </div>
                </div>
              </div>
            </template>
          </div>
          <!--		标绘图例			-->
          <div v-if="isShowName && plotExist" :style="_layerNameFontStyle">
            标绘
          </div>
          <plot-legend
            ref="plotLegend"
            :style="_fontStyle"
            :colum-style="columStyle"
            :img-size="customWidth"
            @change="plotChange"
          ></plot-legend>
        </span>
      </div>
      <template slot="extContainer">
        <legend-edit
          :is-show.sync="isShowEdit"
          :theme-style="cardThemeStyle"
          :position="editPosition"
          :style-config="editStyleConfig"
          :btn-fill-color="btnFillColor"
          :legend-list-obj="legendListObj"
          :font-style="_fontStyle"
          :drag-enable="false"
          :is-show-name="showName"
          @change:isShow="isShowEdit = $event"
          @save="changeLegend"
        />
      </template>
    </general-container>
  </div>
</template>
<script>
import $ from 'jquery';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import legendIcon from './icon/geoserver-legend-icon';
import symbolLegendIcon from './icon/symbol-legend-icon';
import PlotLegend from './plot-legend.vue';
import LegendEdit from './legend-edit.vue';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import {
  typeConfig,
  defaultFontStyle,
  defaultLayerNameFontStyle
} from './utils/config';
import parseLayerLegend from 'shinegis-client-23d/packages/legend/src/utils/ParseLayerLegend';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';

export default {
  name: 'ShLegend',
  components: {
    symbolLegendIcon,
    legendIcon,
    PlotLegend,
    GeneralContainer,
    IconSvg,
    LegendEdit
  },
  mixins: [common, emitter, generalCardProps],
  props: {
    isEdit: {
      type: Boolean,
      default: true
    },
    customWidth: {
      type: Number,
      default: 14
    },
    isShowName: {
      type: Boolean,
      default: true
    },
    showLegendIds: {
      type: Array
    },
    columnNum: {
      type: Number,
      default: 1
    },
    isShowFilterBtn: {
      type: Boolean,
      default: true
    },
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        bottom: '37px',
        left: '50px'
      })
    },
    fontStyle: {
      type: Object,
      default: () => defaultFontStyle
    },
    layerNameFontStyle: {
      type: Object,
      default: () => defaultLayerNameFontStyle
    },
    editStyleConfig: {
      type: Object
    }
  },
  data() {
    return {
      container: null,
      loading: false,
      plotExist: false,
      isShowEdit: false,
      showName: true,
      legendListObj: {},
      arrActive: [],
      plotList: [],
      arcgisActive: []
    };
  },
  computed: {
    cardStyleConfig() {
      let style = JSON.parse(
        JSON.stringify({
          ...typeConfig,
          ...this.styleConfig
        })
      );
      return style;
    },
    _fontStyle() {
      let fontStyle = JSON.parse(
        JSON.stringify({
          ...defaultFontStyle,
          ...this.fontStyle
        })
      );
      return fontStyle;
    },
    _layerNameFontStyle() {
      let layerNameFontStyle = JSON.parse(
        JSON.stringify({
          ...defaultLayerNameFontStyle,
          ...this.layerNameFontStyle
        })
      );
      layerNameFontStyle.color =
        this.currentView === 'map'
          ? 'rgba(31,111,216,1)'
          : 'rgb(255, 255, 255)';
      return layerNameFontStyle;
    },
    columStyle() {
      return `width:${100 / this.columnNum}%;float:left`;
    },
    btnFillColor() {
      let color;
      if (this.container && this.container.getStyle().toolButton) {
        return this.container.getStyle().toolButton.color;
      } else {
        color = this.theme === 'dark' ? '#fff' : '#000';
      }
      return color;
    },
    editPosition() {
      let width = this.cardStyleConfig?.size?.width
        ? Number(this.cardStyleConfig.size.width.replace('px', ''))
        : 275;
      let paddingLeft = width + 10;
      return {
        type: 'absolute',
        top: 0,
        left: paddingLeft + 'px'
      };
    }
  },
  watch: {
    isShowName: {
      handler() {
        this.showName = this.isShowName;
      },
      immediate: true
    }
  },
  mounted() {
    if (this.$map) {
      this.begin();
    }
    this.$nextTick(() => {
      this.container = this.$refs.container;
    });
  },
  methods: {
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    begin() {
      if (this.$map) {
        this.legendListObj = {};
        //开启监听
        this.$map.layerManager.on('afterAddLayer', (item) => {
          let lyrInfo = item.layer.values_.info; // 运维端配置信息
          if (lyrInfo && lyrInfo.isShowLegend !== false) {
            this.addLayerLegend(lyrInfo);
          }
        });
        this.$map.layerManager.on('afterRemoveLayer', (item) => {
          let id = item.layer.get('id');
          let _arcLegendObj = this.legendListObj[id];
          if (_arcLegendObj) {
            this.$delete(this.legendListObj, id);
          }
          let index = this.arrActive.indexOf(id);
          if (index > -1) {
            this.arrActive.splice(index, 1);
          }
        });
        //解析已加载图层的图例
        this.initLegends();
      }
    },
    showEdit() {
      this.isShowEdit = true;
    },
    // 初始化已加载的图层图例
    initLegends() {
      if (this.$map && this.$map.getLayers) {
        let legendLayers = [];
        let layers = this.$map.getLayers().getArray();
        if (layers.length > 0) {
          legendLayers = $.grep(layers, (lyr) => {
            let info = lyr.values_.info;
            return info && info.type && info.type.indexOf('tdt') === -1;
          });
          // 图层图例
          if (legendLayers.length > 0) {
            legendLayers.forEach((item) => {
              let lyrInfo = item.values_.info;
              this.addLayerLegend(lyrInfo);
            });
          }
          // this.$refs.plotLegend.initPlotList()
        }
      }
    },
    // 解析并添加图层的图例
    addLayerLegend(lyrInfo) {
      let ids = this.showLegendIds;
      // 当ids不存在时,以isShowLegend为准
      let flag = Array.isArray(ids) ? ids.includes(lyrInfo.id) : true;
      if (flag) {
        let promise = parseLayerLegend(lyrInfo, this.customWidth);
        if (promise) {
          this.loading = true;
          promise
            .then((dataObj) => {
              // todo处理异步,可能存在afterRemoveLayer已经执行过的图层
              this.$set(this.legendListObj, lyrInfo.id, dataObj);
              this.loading = false;
            })
            .catch((error) => {
              this.loading = false;
              console.warn(error);
            });
        }
      }
    },
    layerFilter(layer) {
      this.$set(layer, 'isHide', !layer.isHide);
      this.changeLayerVisible(layer.id, !layer.isHide);
      this.change3dLayerVisible(layer.id, !layer.isHide);
    },

    legendFilter(layer, i, legend) {
      this.$set(legend, 'isHide', !legend.isHide);
      let childLayer = layer.layers[i];
      if (childLayer.isExistFilter) {
        this.parseToFilter(childLayer, layer);
      } else {
        // 不带Filter的服务,并且为单图层
        if (layer.layers.length === 1) {
          this.changeLayerVisible(layer.id, !legend.isHide);
          this.change3dLayerVisible(layer.id, !legend.isHide);
        } else {
          this.changeChildLayerVisible(layer);
          this.change3dChildLayerVisible(layer);
        }
      }
    },
    /**
     * 根据子图层所有的图例生成过滤条件,触发过滤
     */
    parseToFilter(childLayer, layer) {
      // 过滤带Filter的服务
      let filterArr = [];
      for (let rule of childLayer.legend) {
        if (rule.filter) {
          if (rule.isHide) {
            if (layer.info?.type.indexOf('wfs') > -1) {
              let filter = {
                type: 'not',
                param: [rule.filter]
              };
              filterArr.push(filter);
            } else {
              filterArr.push(`not (${rule.filter})`);
            }
          }
        } else {
          console.warn('图层图例未配置过滤条件');
        }
      }
      let where;
      if (layer.info?.type.indexOf('wfs') > -1) {
        if (filterArr.length === 1) {
          where = filterArr[0];
        } else if (filterArr.length > 1) {
          where = {
            type: 'and',
            param: filterArr
          };
        }
      } else {
        let str = filterArr.join(' and '); // where条件
        where = str ? str : '1=1';
      }
      this.$map.filterLayer(layer.id, where);
      if (this.$earth) this.$earth.viewer.shine.filterLayer(layer.id, where);
    },

    /**
     * 根据图例隐藏子图层
     */
    changeChildLayerVisible(lyrObj) {
      let layer = this.$map.getLayerById(lyrObj.id);
      if (layer) {
        let showChildLayer = [];
        for (let item of lyrObj.layers) {
          // 子图层以第0个legend的isHide为准
          // todo 子图层且存在多个legend（需要过滤和隐藏复合）
          if (!item.legend[0].isHide) {
            showChildLayer.push(
              lyrObj.type === 'arcgis' ? item.layerId : item.layerName
            );
          }
        }
        let trueVisibleLayer = showChildLayer.join(',');
        if (trueVisibleLayer !== '') {
          let peer = lyrObj.type === 'arcgis' ? 'show:' : '';
          layer.getSource().updateParams({
            LAYERS: peer + trueVisibleLayer
          });
          layer.setVisible(true);
        } else {
          layer.setVisible(false);
        }
      }
    },
    change3dChildLayerVisible(lyrObj) {
      if (this.$earth) {
        let layer3d = this.$earth.viewer.shine.getLayer(lyrObj.id, 'id');
        if (layer3d) {
          let showChildLayer = [];
          for (let item of lyrObj.layers) {
            // 子图层以第0个legend的isHide为准
            // todo 子图层且存在多个legend（需要过滤和隐藏复合）
            if (!item.legend[0].isHide) {
              showChildLayer.push(
                lyrObj.type === 'arcgis' ? item.layerId : item.layerName
              );
            }
          }
          let trueVisibleLayer = showChildLayer.join(',');
          if (trueVisibleLayer !== '') {
            /*          let peer = lyrObj.type === 'arcgis' ? 'show:' : '';
          layer.getSource().updateParams({
            LAYERS: peer + trueVisibleLayer
          });*/
            layer3d.setVisible(true);
          } else {
            layer3d.setVisible(false);
          }
        }
      }
    },
    changeLayerVisible(layerId, visible) {
      let layer = this.$map.getLayerById(layerId);
      if (layer) {
        layer.setVisible(visible);
      }
    },
    change3dLayerVisible(layerId, visible) {
      if (this.$earth) {
        let layer3d = this.$earth.viewer.shine.getLayer(layerId, 'id');
        if (layer3d) {
          layer3d.setVisible(visible);
        }
      }
    },

    plotChange(plotList) {
      this.plotList = plotList;
      if (this.plotList && this.plotList.length > 0) {
        this.plotExist = true;
      }
    },
    changeLegend(legendList, showName) {
      this.legendListObj = legendList;
      this.showName = showName;
      this.isShowEdit = false;
    }
  }
};
</script>
