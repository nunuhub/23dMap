<template>
  <div class="sh-annotation">
    <general-container
      :is-show.sync="visible"
      :title="title ? title : '标注'"
      :style-config="cardStyleConfig"
      :img-src="imgSrc ? imgSrc : 'place-search'"
      :berth="berth"
      :position="position"
      :theme="theme"
      :drag-enable="dragEnable"
      :append-to-body="appendToBody"
      :theme-style="themeStyle"
      :only-container="onlyContainer"
      @change:isShow="onChangeIsShow"
    >
      <div id="all">
        <div class="layerAndData" :style="currentTheme">
          <div class="layers">
            <div class="globe-style">
              <div class="layersInfo" @click="showlayerlist = !showlayerlist">
                <span>查看所有注记图层({{ layers.length }})</span>
                <span
                  ><svg
                    v-show="!showlayerlist"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-chevron-down"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                    />
                  </svg>
                  <svg
                    v-show="showlayerlist"
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-chevron-up"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"
                    />
                  </svg>
                </span>

                <div
                  v-show="showlayerlist"
                  class="dropdownlist"
                  :style="selectClass"
                >
                  <div
                    v-for="item in layers"
                    :key="item.layerID"
                    style="height: 20px; margin-top: 5px; display: flex"
                  >
                    <div style="width: 20px; margin-left: 10px">
                      <el-checkbox
                        v-model="item.isShow"
                        @change="layerLoadChange(item)"
                      ></el-checkbox>
                    </div>
                    <div
                      style="
                        width: 180px;
                        overflow: hidden;
                        white-space: nowrap;
                        margin-left: 10px;
                        text-overflow: ellipsis;
                      "
                      @click="editLayer(item)"
                    >
                      {{ item.layerName }}
                    </div>
                    <div
                      class="width:30px;margin-left:15px;"
                      @click="handleDeleteLayer(item)"
                    >
                      <span class="cursor" title="删除">
                        <svg
                          style="width: 13px; height: 13px"
                          fill="red"
                          class="bi bi-trash3"
                          viewBox="0 0 16 16"
                        >
                          <path
                            d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <span
                class="cursor"
                title="新建图层"
                @click="createNewLayer(true)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="#409eff"
                  class="bi bi-plus-circle-fill"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"
                  />
                </svg>
              </span>
              <span
                class="cursor"
                title="导入图层"
                @click="createNewLayer(false)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="#409eff"
                  class="bi bi-arrow-down-right-circle-fill"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm5.904-2.803a.5.5 0 1 0-.707.707L9.293 10H6.525a.5.5 0 0 0 0 1H10.5a.5.5 0 0 0 .5-.5V6.525a.5.5 0 0 0-1 0v2.768L5.904 5.197z"
                  />
                </svg>
              </span>
            </div>
          </div>
          <layer-form
            ref="layerform"
            :show-layer-config="showLayerConfig"
            :anno-instance="annoInstance"
            :is-import-layer="isImportLayer"
            :is-layer-add="isLayerAdd"
            :current-layer="currentLayer"
            @getLayers="getLayers"
          ></layer-form>
          <div v-show="showlayerdata" class="data">
            <div class="tableTitle">
              <span style="margin-left: 5px">{{ currentLayer.layerName }}</span>
              <span
                class="cursor"
                style="margin-right: 12px"
                @click="addOneMarker(currentLayer)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="#409eff"
                  class="bi bi-plus-circle-fill"
                  viewBox="0 0 16 16"
                >
                  <path
                    d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"
                  />
                </svg>
              </span>
            </div>
            <div class="table">
              <div class="layerStyle"></div>
              <div class="search">
                <div class="searchbtn" @click="querySearch">
                  <i class="el-icon-search"></i>
                </div>
                <input
                  ref="inpt"
                  v-model="keyWords"
                  placeholder="输入关键词以搜索..."
                  class="inp"
                  @keyup.enter.prevent="onKeyPosition($event)"
                />
              </div>
              <div
                v-for="(item, index) in pageData"
                :key="index"
                class="items"
                @click="showInfo(item)"
              >
                <div class="item-id">{{ index + 1 }}</div>
                <div class="item-title">
                  {{
                    item.layerType === 'iconLayer'
                      ? item.content_txt
                        ? item.content_txt
                        : '无标题'
                      : item.title_txt
                      ? item.title_txt
                      : item.content_txt
                  }}
                </div>
                <div class="item-operate">
                  <span class="cursor" title="定位" @click.stop="locate(item)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="#409eff"
                      class="bi bi-send"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"
                      />
                    </svg>
                  </span>
                  &nbsp;
                  <span
                    class="cursor"
                    title="删除"
                    @click.stop="handleDeleteMarker(item)"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="red"
                      class="bi bi-trash3"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5ZM11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H2.506a.58.58 0 0 0-.01 0H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1h-.995a.59.59 0 0 0-.01 0H11Zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5h9.916Zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47ZM8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5Z"
                      />
                    </svg>
                  </span>
                </div>
              </div>
              <div v-show="currentLayerData.length > 10" class="pages">
                <el-pagination
                  layout="prev, pager, next"
                  :small="true"
                  :total="currentLayerData.length"
                  :page-size="10"
                  @current-change="getSingPageData"
                >
                </el-pagination>
              </div>
            </div>
          </div>
        </div>
        <div v-show="showDetail" class="detail" :style="currentTheme">
          <div class="sidebar">
            <div
              style="
                height: 60px;
                width: 12px;
                cursor: pointer;
                border-radius: 5px;
                display: flex;
                align-items: center;
                color: white;
                background: rgb(172, 171, 171);
              "
              @click="closeInfo"
            >
              <i class="el-icon-arrow-left"></i>
            </div>
          </div>
          <div class="info">
            <!-- 配置表单放置在此处 -->
            <icon-form
              v-show="currentLayer.layerType === 'iconLayer'"
              ref="iconform"
              :prop-item="currentItem"
            ></icon-form>
            <panel-form
              v-show="currentLayer.layerType === 'panelLayer'"
              ref="panelform"
              :prop-item="currentItem"
            ></panel-form>
            <model-form
              v-show="currentLayer.layerType === 'moduleLayer'"
              ref="modelform"
              :prop-item="currentItem"
            ></model-form>
            <div class="form-config">
              坐标位置：地图上选择<el-switch
                v-model="isPickOnMap"
                active-color="#13ce66"
                inactive-color="#a8a8a8"
                @change="pickOnMap"
              >
              </el-switch>
            </div>
            <div class="form-config">
              x：<input v-model="currentItem.position.x" :class="inputClass" />
            </div>
            <div class="form-config">
              y：<input v-model="currentItem.position.y" :class="inputClass" />
            </div>
            <div class="form-config">
              z：<input v-model="currentItem.position.z" :class="inputClass" />
            </div>
            <div v-show="currentView === 'earth'" class="form-config">
              z2：<input v-model="currentItem.z2" :class="inputClass" />
            </div>
            <div
              style="display: flex; justify-content: center; margin-top: 15px"
            >
              <el-button type="primary" size="mini" round @click="preview"
                >预览</el-button
              ><el-button type="warning" size="mini" round @click="saveInfo"
                >保存</el-button
              >
            </div>
          </div>
        </div>
      </div>
    </general-container>
    <anno-dom
      v-for="(item, index) in propLayerData"
      v-show="item.isShow"
      :key="index"
      :anno-data="item"
      :round-style="enableRound"
      :bubble-style="enableBubble"
      :draw-tool="drawTool"
      :current-layer="currentLayer"
    >
      <template #head>{{ item.title_txt }}</template>
      <template #body>{{ item.content_txt }}</template>
    </anno-dom>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import cardDrag from 'shinegis-client-23d/src/directives/card-drag';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import Point from 'ol/geom/Point';
import { getuuid } from 'shinegis-client-23d/src/map-core/olPlot/Utils/utils';
import Annotation from './Annotation.js';
import { Draw } from 'shinegis-client-23d/src/earth-core/Entry57';
// import * as DrawEventType from 'shinegis-client-23d/src/earth-core/Tool/EventType7';
import { lonlat2cartesian } from 'shinegis-client-23d/src/earth-core/Tool/Util3';
// let drawTool;
import AnnoDom from './anno-dom.vue';
import PanelForm from './panel-form.vue';
import IconForm from './icon-form.vue';
import ModelForm from './model-form.vue';
import LayerForm from './layer-form.vue';
import { commonStyle } from './AnnoFormSetting.js';
import Jquery from 'jquery';
import { Message } from 'element-ui';

export default {
  name: 'ShAnnotation',
  directives: { cardDrag },
  components: {
    GeneralContainer: GeneralContainer,
    AnnoDom: AnnoDom,
    PanelForm: PanelForm,
    IconForm: IconForm,
    ModelForm: ModelForm,
    LayerForm: LayerForm
  },
  mixins: [common, emitter, generalCardProps, commonStyle],
  props: {
    moduleUrl: {
      type: String,
      default: ''
    },
    url: {
      type: String
    },
    schemeId: {
      type: String
    },
    enableRound: {
      type: Object
    },
    enableBubble: {
      type: Object
    },
    defaultTheme: {
      type: Object,
      default: () => ({
        title_bgcolor: 'rgba(255,255,255,1)',
        title_txt_color: 'rgba(0,0,0,1)',
        title_txt_size: '10',
        title_bgwidth: '180',
        title_bgheight: '20',
        content_bgcolor: 'rgba(255,255,255,0.8)',
        content_bgimage: '',
        content_txt_color: 'rgba(0,0,0,1)',
        content_txt_size: '10',
        content_bgwidth: '180',
        content_bgheight: '60'
      })
    }
  },
  data() {
    return {
      currentLayer: {},
      typeConfig: {
        size: {
          width: '300px'
        }
      },
      layers: [],
      hoveToDelete: false,
      showlayerlist: false,
      showlayerdata: false,
      showLayerConfig: false,
      isImportLayer: false,
      showLayerTypes: false,
      showThemes: false,
      showDetail: false,
      settingType: 'normal',
      isOffset: 'center-center',
      currentTheme: {},
      isLayerAdd: true, // 图层是新增/编辑
      showSelectedMarkers: [], // 选中图层的所有注记
      selectedLayerType: { label: '请选择...' },
      selectClass: {},
      operatingState: '',
      mapZoom: undefined,
      selectStyle: {},
      inputClass: undefined,
      keyWords: '',
      currentItem: {
        title_txt: '',
        content_txt: '',
        onTop: true,
        theme: this.defaultTheme,
        position: {
          x: '0',
          y: '0',
          z: '0'
        },
        modelurl: 'Assets3D/model/car.gltf',
        z2: 0
      },
      annoInstance: undefined,
      icons: [
        { id: '1', imgSrc: 'Assets3D/img/mark1.png' },
        { id: '2', imgSrc: 'Assets3D/img/mark2.png' },
        { id: '3', imgSrc: 'Assets3D/img/mark3.png' },
        { id: '4', imgSrc: 'Assets3D/img/mark4.png' }
      ],
      themes: [],
      currentLayerData: [],
      propLayerData: [],
      pageData: [],
      isPickOnMap: false
    };
  },
  computed: {
    cardStyleConfig() {
      return {
        ...this.typeConfig,
        ...this.styleConfig
      };
    }
  },
  watch: {
    currentView: {
      handler(view) {
        if (view === 'earth') {
          this.currentTheme = this.darktheme;
          this.selectClass = this.darkselect;
          this.inputClass = 'darkInput';
          // if (this.drawTool) this.render_3D(this.showSelectedMarkers);
        } else {
          this.currentTheme = this.lighttheme;
          this.selectClass = this.lightselect;
          this.inputClass = 'lightInput';
        }
      },
      immediate: true
    },
    currentLayerType: {
      handler(val) {
        if (val === 'iconlayer') {
          this.iconInfo = true;
        }
      },
      immediate: true
    }
  },
  mounted() {
    if (this.$map || this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    // 组件逻辑开始入口,如果组件有初始运行逻辑，请在此方法内编写，不要修改此方法名；如果没有可删除此方法。
    begin() {
      let url = this.url
        ? this.url
        : this.configInstance
        ? this.configInstance.url
        : '';
      if (!url) {
        Message.error('未找到url参数或运维端配置');
        return;
      }
      let urlReg = url.split('/');
      let baseUrl = this.url
        ? this.url
        : urlReg[0] + '//' + urlReg[2] + '/' + urlReg[3];
      let schemeId = this.schemeId
        ? this.schemeId
        : this.configInstance
        ? this.configInstance.params.schemeId
        : '';
      if (!schemeId) {
        Message.error('未找到schemeId参数或运维端配置');
        return;
      }
      //获取所有的图层信息，初始化一个annotation类
      this.annoInstance = new Annotation({
        baseUrl: baseUrl,
        schemeId: schemeId,
        userId: this.configInstance.params.userId,
        viewer: this.$earth.viewer
      });
      this.getLayers();
      this.initDraw3d();
      // this.layers.forEach((l) => {
      //   l.hoveToDelete = false;
      // });
      this.mapZoom = this.$map.getView().getZoom();
    },
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    // 初始化三维绘制
    initDraw3d() {
      let options = {
        hasPopup: true,
        hasEdit: false,
        horizontalBar: false,
        labelShow: true,
        polygonShow: true,
        polylineShow: true,
        showToolbar: true,
        verticalBar: true,
        name: 'markerLayer1'
      };
      this.drawTool = new Draw(this.$earth.viewer, options);
      this.drawTool.on('change:active', (e) => {
        this.$emit('change:active', e.active);
      });
      // 绘制完成
      // drawTool.on(DrawEventType.DrawCreated, function (e) {
      //   // currEntity = e.entity;
      //   // console.log('currEntity', currEntity);
      // });
    },
    async getLayers() {
      let a = await this.annoInstance.refreshLayers({
        size: 1000,
        current: 1
      });
      let arr = a.data.records;
      arr.forEach((ele) => {
        ele.styleOptions = this.annoInstance.isJSON(ele.styleOptions)
          ? JSON.parse(ele.styleOptions)
          : ele.styleOptions;
        ele.isShow = ele.isShow === 0 ? false : true;
      });
      this.layers = arr;
    },
    async getMarkerList(layerID) {
      let resMarker = await this.annoInstance.getMarkerList({
        noteTocId: layerID || this.currentLayer.layerID,
        size: 1000,
        current: 1
      });
      let arr = resMarker.data.data;
      arr.forEach((ele) => {
        ele.position = this.annoInstance.isJSON(ele.position)
          ? JSON.parse(ele.position)
          : ele.position;
        ele.theme = this.annoInstance.isJSON(ele.theme)
          ? JSON.parse(ele.theme)
          : ele.theme;
      });
      this.pageData = arr;
      return arr;
    },
    handleDeleteLayer(item) {
      this.$confirm(
        '确定是否删除图层<' + item.layerName + '>, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.annoInstance.removeAnnotationLayer(item.layerID).then(() => {
            this.getLayers();
            Message({
              message: '删除成功!',
              type: 'success'
            });
          });
        })
        .catch(() => {
          Message({
            message: '取消删除！',
            type: 'info'
          });
        });
    },
    createNewLayer(val) {
      this.isLayerAdd = true;
      this.showLayerConfig = true;
      this.$refs.layerform.noClose = true;
      val ? (this.isImportLayer = false) : (this.isImportLayer = true);
    },

    handleDeleteMarker(item) {
      this.$confirm(
        '确定是否删除注记<' + item.title_txt + '>, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.annoInstance
            .deleteMarker(item, this.currentLayer.layerID)
            .then(() => {
              this.getMarkerList();
              Message({
                message: '删除成功!',
                type: 'success'
              });
              this.deleteEntity(item.id);
            });
        })
        .catch(() => {
          Message({
            message: '取消删除！',
            type: 'info'
          });
        });
    },
    //控制注记图层是否展示,item:当前图层对象
    async layerLoadChange(item) {
      let markerList = await this.getMarkerList(item.layerID);
      if (item.isShow) {
        this.showSelectedMarkers = this.showSelectedMarkers.concat(markerList);
      } else {
        let ids = markerList.map((ele) => ele.id);
        let newArr = this.showSelectedMarkers.filter((o) => {
          return !ids.includes(o.id);
        });
        this.showSelectedMarkers = newArr;
        ids.forEach((id) => {
          this.deleteEntity(id);
        });
      }
      this.showSelectedMarkers.forEach((ele) => {
        ele.isShow = true;
        ele.layer = item;
        if (ele.layertype === 'iconLayer') {
          var styleStr =
            'style="width:' +
            ele.theme.title_txt_size +
            'px;height:' +
            ele.theme.title_txt_size +
            'px;color:' +
            ele.theme.title_txt_color +
            ';"';
          ele.title_txt = ele.title_txt.replace('<svg', '<svg ' + styleStr);
        }
      });
      this.propLayerData = this.showSelectedMarkers;
      // if (item.isShow) {
      //   if (item.layerType === 'iconLayer') {
      //     this.iconData.forEach((e) => {
      //       var styleStr =
      //         'style="width:' +
      //         e.theme.title_txt_size +
      //         'px;height:' +
      //         e.theme.title_txt_size +
      //         'px;color:' +
      //         e.theme.title_txt_color +
      //         ';"';
      //       e.title_txt = e.title_txt.replace('<svg', '<svg ' + styleStr);
      //       e.isShow = true;
      //       this.propLayerData.push(e);
      //     });
      //   } else {
      //     let idArray = this.propLayerData.map((p) => p.layerID);
      //     if (!idArray.includes(item.layerID)) {
      //       this.annotationData.forEach((e) => {
      //         e.isShow = true;
      //         this.propLayerData.push(e);
      //       });
      //     } else {
      //       this.propLayerData.forEach((e) => (e.isShow = true));
      //     }
      //   }
      // }
    },
    //展开容器面板，填写具体的注记属性的配置，item:一条注记数据
    showInfo(item) {
      if (this.currentItem.id) {
        this.$map.removeOverlay(this.$map.getOverlayById(this.currentItem.id));
      }
      if (item.layerType === 'iconLayer') {
        this.iconInfo = true;
        this.panelInfo = false;
      } else {
        this.iconInfo = false;
        this.panelInfo = true;
      }
      this.currentItem = JSON.parse(JSON.stringify(item));
      this.typeConfig.size = Object.assign({}, { width: '610px' });
      this.showDetail = true;
      this.operatingState = 'edit';
    },
    async editLayer(layer) {
      let resLayer = await this.annoInstance.getLayerInfo(layer.layerID);
      let layerInfo = resLayer.data;
      layerInfo.styleOptions = JSON.parse(layerInfo.styleOptions);
      this.getMarkerList(layer.layerID);
      this.isLayerAdd = false;
      this.currentLayerData.length > 10
        ? (this.pageData = this.currentLayerData.slice(0, 10))
        : (this.pageData = this.currentLayerData);
      this.currentLayer = layerInfo;
      this.showlayerdata = true;
    },
    locate(data) {
      if (!this.currentLayer.isShow && this.operatingState === '') {
        Message({
          showClose: true,
          message: '请确保图层处于展示状态再进行定位',
          type: 'error'
        });
        return;
      }
      if (this.currentView !== 'earth') {
        let lon = parseFloat(data.position.x);
        let lat = parseFloat(data.position.y);
        let view = this.$map.getView();
        var point = new Point([lon, lat]);
        view.fit(point, {
          size: this.$map.getSize(),
          duration: 700,
          minResolution: view.getResolution()
        });
      } else {
        this.$earth.viewer.shine.centerPoint(
          lonlat2cartesian([
            Number(data.position.x),
            Number(data.position.y),
            Number(data.position.z)
          ]),
          {
            radius: 1000
          }
        );
      }
    },
    pickOnMap(val) {
      if (this.currentView !== 'earth') {
        var pointer = document.createElement('div');
        pointer.id = 'tempDraw';
        pointer.style =
          'width:12px;height:12px;background:#409eff;border-radius:50%;position:absolute;';
        if (val) {
          this.$map.getTargetElement().appendChild(pointer);
          document.onmousemove = function (e) {
            pointer.style.left = e.clientX + 'px';
            pointer.style.top = e.clientY + 'px';
          };

          this.$map.on('singleclick', this.mapClick);
        } else {
          document.getElementById('tempDraw').remove();
          this.$map.un('singleclick', this.mapClick);
        }
      } else {
        if (val) {
          this.annoInstance.activeMouse((point) => {
            this.currentItem.position = point;
          });
        } else {
          this.annoInstance.disableMouse();
        }
      }
    },
    querySearch() {},
    clear() {},
    preview() {
      if (this.currentView !== 'earth') {
        if (this.operatingState === 'add') {
          this.currentItem.id = getuuid();
          this.currentItem.isShow = true;
          this.propLayerData.push(this.currentItem);
        } else {
          let nowItem = this.$refs.panelform.getNowItem();
          if (nowItem.isShow) {
            this.propLayerData.forEach((e) => {
              if (e.id === nowItem.id) {
                this.removeDOM(e.id);
              }
            });
            this.propLayerData.push(nowItem);
          } else {
            nowItem.isShow = true;
            let oldItme = JSON.parse(JSON.stringify(nowItem));
            this.propLayerData.push(oldItme);
          }
        }
        this.locate(this.currentItem);
      } else {
        this.deleteEntity(this.currentItem.id);
        this.propLayerData.splice(
          this.propLayerData.findIndex(
            (item) => item.id === this.currentItem.id
          ),
          1
        );
        if (!this.currentItem.id) {
          this.currentItem.id = getuuid();
        }
        let _opts = { ...this.currentItem, isShow: true };
        this.propLayerData.push(_opts);
        this.locate(_opts);
      }
    },
    // 根据id删除entity
    deleteEntity(id) {
      let entity = this.drawTool.getEntityById(id);
      if (entity) {
        if (entity.guide) this.drawTool.deleteEntity(entity.guide);
        this.drawTool.deleteEntity(entity);
      }
      Jquery('#' + id).remove();
    },
    mapClick(e) {
      if (e) {
        this.currentItem.position.x = e.coordinate[0].toFixed(6);
        this.currentItem.position.y = e.coordinate[1].toFixed(6);
      }
    },
    addOneMarker() {
      this.blankCurrentItem();
      this.operatingState = 'add';
      this.typeConfig.size = Object.assign({}, { width: '610px' });
      this.showDetail = true;
    },
    saveInfo() {
      let currentData = { ...this.currentItem };
      let opts = Object.assign(currentData, {
        layerType: this.currentLayer.layerType,
        layerID: this.currentLayer.layerID
      });
      // console.log('opts', opts);
      this.annoInstance
        .saveMarker(opts, this.operatingState === 'add')
        .then(() => {
          this.getMarkerList();
          this.operatingState = 'edit';
        });
    },
    closeInfo() {
      this.removeDOM(this.currentItem.id);
      this.typeConfig.size = Object.assign({}, { width: '300px' });
      this.showDetail = false;
    },
    chooseTheme(theme) {
      this.selectedTheme = theme;
    },
    chooseLayerType(type) {
      this.selectedLayerType = type;
    },
    blankCurrentItem() {
      this.currentItem = {
        title_txt: '',
        content_txt: '',
        onTop: true,
        theme: this.defaultTheme,
        position: {
          x: '0',
          y: '0',
          z: '0'
        },
        modelurl: 'Assets3D/model/car.gltf',
        z2: 0
      };
    },
    getSingPageData(start) {
      this.pageData = this.currentLayerData.filter(
        (r, index) => index >= (start - 1) * 10 && index <= (start - 1) * 10 + 9
      );
    },
    removeDOM(id) {
      this.$map.removeOverlay(this.$map.getOverlayById(id));
    },
    removeAllOverlay() {
      for (let i = this.$map.getOverlays().getArray().length; i >= 0; i--) {
        this.$map.removeOverlay(this.$map.getOverlays().getArray()[i]);
      }
    },
    onKeyPosition(e) {
      var keyCode = e.keyCode;
      if (keyCode === 13) {
        this.search();
      }
    },
    // 三维视距转二维zoom值
    distanceToZoom(val) {
      let num = Number(val);
      if (num > 7000000) return 5;
      if (num < 1000) return 17.7;
      let corresponding = {
        7000000: 5,
        2380000: 6.5,
        1350000: 7.3,
        750000: 8.2,
        400000: 9.2,
        200000: 10,
        80000: 11.4,
        40000: 12.5,
        20000: 13.4,
        10000: 14.4,
        5000: 15.4,
        3000: 16.2,
        1000: 17.7
      };
      if (corresponding[num]) return corresponding[num];
      let maxArr = [];
      let minArr = [];
      for (let n in corresponding) {
        if (num > Number(n)) {
          minArr.push(n);
        } else {
          maxArr.push(n);
        }
      }
      let next = maxArr[0];
      maxArr.forEach((ele) => {
        if (Number(ele) < Number(next)) {
          next = ele;
        }
      });
      let prev = minArr[0];
      minArr.forEach((ele) => {
        if (Number(ele) > Number(prev)) {
          prev = ele;
        }
      });
      let prop = Number(((num - prev) / (next - prev)).toFixed(2));
      let zoomCha = Number(
        (corresponding[prev] - corresponding[next]).toFixed(2)
      );
      let result = corresponding[next] + zoomCha * prop;
      return Number(result.toFixed(2));
    }
  }
};
</script>
<style scoped lang="scss">
#all {
  display: flex;
  flex-direction: row;
  overflow-x: hidden;
}
.globe-style {
  display: flex;
  width: 290px;
  align-items: center;
  justify-content: space-around;
  font-size: 10px;
}
.layersInfo {
  width: 230px;
  height: 25px;
  border: 1px solid #cecdcd;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  cursor: pointer;
}
.layerAndData {
  width: 300px;
}
.layerTypeSelect {
  width: 200px;
  height: 25px;
  display: flex;
  align-items: center;
  border: 1px solid #cecdcd;
  color: #9c9c9c;
  border-radius: 5px;
  cursor: pointer;
  position: relative;
}
.layertypes {
  width: 200px;
  height: 140px;
  overflow-y: auto;
  z-index: 20;
  position: fixed;
  border: 1px solid #cecdcd;
  border-radius: 5px;
  top: 136px;
}
.themeslist {
  width: 200px;
  height: 200px;
  overflow-y: auto;
  z-index: 20;
  position: fixed;
  border: 1px solid #cecdcd;
  border-radius: 5px;
  top: 175px;
}

.detail {
  width: 305px;
  height: 600px;
  display: flex;
  background: transparent;
}

.dropdownlist {
  position: fixed;
  z-index: 10;
  margin-top: 130px;
  width: 230px;
  height: 102px;
  overflow-y: auto;
  border: 1px solid #cecdcd;
}
.search {
  margin-bottom: 10px;
}
.searchbtn {
  position: absolute;
  left: 15px;
  height: 25px;
  width: 30px;
  font-size: 10px;
  color: #cecdcd;
  cursor: pointer;
  border: 1px solid #cecdcd;
  border-radius: 5px;
  border-right: 0px;
  border-top-right-radius: 0px;
  border-bottom-right-radius: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.inp {
  width: 244px;
  height: 25px;
  border: 1px solid #cecdcd;
  border-radius: 5px;
  margin-left: 40px;
  border-left: 0px;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  display: flex;
  align-items: center;
  line-height: 32px;
  font-size: 10px;
  background-color: transparent;
}
input::-webkit-input-placeholder {
  color: #cecdcd;
  font-size: 10px;
  /* placeholder颜色  */
}
.inp:focus {
  border: 1px solid #cecdcd;
  outline: none;
  border-left: 0px;
  color: #cecdcd;
}
.Input {
  font-size: 10px;
  height: 25px;
  border-radius: 5px;
  border: 1px solid #cecdcd;
}
.lightInput {
  background: rgba(255, 255, 255, 0);
  color: black;
  @extend .Input;
}
.darkInput {
  background: transparent;
  color: white;
  @extend .Input;
}
.darkInput:focus {
  color: white;
}
.items {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  margin-top: 5px;
}
.item-id {
  width: 5px;
}
.item-title {
  width: 150px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: center;
  cursor: pointer;
}
.item-title:hover {
  background: #e6a23c;
  cursor: pointer;
  box-shadow: 1px 1px 1px rgba(192, 190, 190, 0.7);
}
.item-operate {
  width: 45px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.data {
  margin-top: 15px;
}
.tableTitle {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  width: 296px;
  font-size: 10px;
  justify-content: space-between;
  border-bottom: 2px solid rgb(172, 171, 171);
}
.sidebar {
  border-left: 2px solid rgb(172, 171, 171);
  height: 100%;
  display: flex;
  align-items: center;
  margin-right: 5px;
}
.modules {
  width: 290px;
  height: 240px;
  overflow-y: auto;
  overflow-x: hidden;
}

.modules::-webkit-scrollbar {
  /*滚动条整体样式*/
  width: 5px; /*高宽分别对应横竖滚动条的尺寸*/
  height: 150px;
}
.modules::-webkit-scrollbar-thumb {
  /*滚动条里面小方块*/
  border-radius: 5px;
  background: #a1a0a0;
}
.form-config {
  margin-top: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.colorInput {
  width: 25px;
  height: 25px;
}
.cursor {
  cursor: pointer;
}
</style>
