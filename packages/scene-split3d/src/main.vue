<template>
  <div v-show="shouldShow" class="sh-scene-split3d">
    <div v-show="isShow" class="button-container">
      <span v-if="$slots.default" @click="() => toggle()">
        <slot></slot>
      </span>
      <general-button
        v-else
        :active="isShowContent"
        :position="position"
        :is-column="isColumn"
        :drag-enable="dragEnable"
        :icon-class="iconClass ? iconClass : 'scene-split3d'"
        :show-img="showImg"
        :show-label="showLabel"
        :theme-style="themeStyle"
        :title="title ? title : '分屏'"
        @click="() => toggle()"
      />
    </div>
    <div v-if="isShowContent" v-cardDrag class="split_view">
      <div class="split_type move_header dragEnable">
        <div
          :class="{ type_item: true, active: viewType == '3d' }"
          @click="selected('3d')"
        >
          <icon-svg icon-class="three-dimension-view"></icon-svg>
          <span class="line">|</span>
          <icon-svg icon-class="three-dimension-view"></icon-svg>
        </div>
        <div
          :class="{ type_item: true, active: viewType == '2d' }"
          @click="selected('2d')"
        >
          <icon-svg icon-class="two-dimension-view"></icon-svg>
          <span class="line">|</span>
          <icon-svg icon-class="three-dimension-view"></icon-svg>
        </div>
        <div
          :class="{ type_item: true, active: viewType == 'zs' }"
          @click="selected('zs')"
        >
          <span style="color: #fff; font-size: 12px">正视</span>
          <span class="line">|</span>
          <icon-svg icon-class="three-dimension-view"></icon-svg>
        </div>
        <div class="type_item" @click="signOut()">
          <span style="color: #fff">退出分屏</span>
        </div>
      </div>
    </div>
    <Earth
      v-if="isShowContent"
      :earth-config="earthConfig"
      @earthInited="getEarth"
    >
      <layer-manager
        v-if="layerInfos.length > 0"
        ref="tocLeft"
        :position="layerManagerPosition"
        theme="dark"
        :layers-info="layerInfos"
      ></layer-manager>
      <layer-manager
        v-else
        ref="tocLeft"
        :position="layerManagerPosition"
        theme="dark"
      ></layer-manager>
    </Earth>
  </div>
</template>

<script>
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import $ from 'jquery';
import LayerManager from 'shinegis-client-23d/packages/layer-manager';
import cardDrag from 'shinegis-client-23d/src/directives/card-drag';
import { setPositionsHeight } from 'shinegis-client-23d/src/earth-core/Tool/Point2';
import {
  cartesian2Carto,
  toCartesian2,
  CesiumDragEvt,
  lonlat2cartesian
} from 'shinegis-client-23d/src/earth-core/Tool/Util3';
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { earthDefaultConfig } from 'shinegis-client-23d/src/utils/config/earth-config';
import Earth from 'shinegis-client-23d/packages/earth';
import { Message } from 'element-ui';
import GeneralButton from 'shinegis-client-23d/packages/general-button';
import generalButtonProps from 'shinegis-client-23d/src/mixins/components/general-button-props';

let Map3dLeft, Map3d;
export default {
  name: 'ShSceneSplit3d',
  components: {
    LayerManager: LayerManager,
    IconSvg: IconSvg,
    Earth: Earth,
    GeneralButton: GeneralButton
  },
  directives: { cardDrag },
  mixins: [common, emitter, generalButtonProps],
  props: {
    isShow: {
      type: Boolean,
      default: true
    },
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '1px',
        left: '640px'
      })
    },
    configdata: {
      type: Object,
      default: () => {}
    },
    title: {
      type: String,
      default: '分屏对比'
    },
    layerManagerPosition: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '20px',
        left: '20px',
        bottom: 'unset',
        right: 'unset'
      })
    },
    config: {
      type: Object,
      default: () => ({
        isShowBtn: false, // true时展示btn点btn显示面板,false直接显示面板
        titleBar: {
          miniBtn: false,
          maxBtn: false,
          closeBtn: true,
          title: true
        },
        autoVisible: false,
        btnSize: {
          size: '32px',
          padding: '8px',
          radius: '4px'
        },
        size: {
          width: '275px',
          height: '300px'
        }
      })
    },
    imgSrc: {
      type: String,
      default: 'scene-split3d'
    },
    theme: {
      type: String,
      default: 'dark'
    },
    layerInfos: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      shouldShow: false,
      isShowContent: false,
      showBaseMap: false,
      viewerStat: false, // 为了防止事件被触发两次
      viewerExStat: false,
      timer1: null,
      timer2: null,
      dragging: false,
      heading: null,
      pos: null,
      viewType: '3d',
      is2d: false,
      modeData: '3D',
      is3D: true // 主屏3d模式为true
    };
  },
  computed: {
    earthConfig() {
      let obj = { ...earthDefaultConfig };
      obj.id = 'cesiumContainer666';
      return obj;
    }
  },
  watch: {
    currentView: {
      handler(val) {
        this.shouldShow = val === 'earth';
        this.is3D = val === 'earth';
        if (!this.is3D) {
          this.signOut();
        }
      },
      immediate: true
    }
  },
  mounted() {
    if (this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
    // 底图切换事件 副屏同步主屏
    this.subscribe.$on(
      'layer-switcher:change:checkedLayer',
      (type, layer, target) => {
        if (this.isShowContent) {
          if (target !== 'map') {
            if (type === 'add') {
              Map3dLeft.shine.addLayer(layer);
            } else {
              Map3dLeft.shine.removeLayer(layer);
            }
          }
        }
      }
    );
  },
  beforeDestroy() {
    this.deactivate();
  },
  methods: {
    begin() {
      Map3d = this.$earth.viewer;
    },
    toggle() {
      if (!this.is2d) {
        if (this.isShowContent) {
          this.signOut();
        } else {
          this.split();
        }
      } else {
        if (this.isSplit) {
          this.signOut2d3d();
        } else {
          this.split2d3d();
        }
      }
    },
    // 激活分屏，默认三维分屏
    activate() {
      if (!this.is2d) {
        this.split();
      } else {
        this.split2d3d();
      }
    },
    deactivate() {
      if (!this.is2d) {
        this.signOut();
      } else {
        this.signOut2d3d();
      }
    },
    getEarth(val) {
      Map3dLeft = val.viewer;
      this.initBase();
    },
    selected(type) {
      this.viewType = type;
      this.split();
    },
    // 分屏 两侧都为3d
    split() {
      if (!this.currentView === 'earth') {
        Message({
          message: '请切换至三维模式！',
          type: 'warning'
        });
        return;
      }
      if (this.isShowContent) {
        this.changeType();
      } else {
        this.isShowContent = true;
        this.viewType = '3d';
      }
      this.$emit('change:active', true);
    },
    initBase() {
      let dataOptions = Map3d.shine.layerManager.checkedLayers;
      dataOptions.forEach((item) => {
        if (item.isBaseMapLayer) {
          Map3dLeft.shine.addLayer(item);
        }
      });
      $('#' + this.$earth.viewer._container.id).css({
        position: 'absolute',
        height: '100%',
        left: '50%',
        width: '50%'
      });
      let earthView = $('#' + Map3d._container.id).parent();
      earthView.append($('.sh-scene-split3d'));
      $('#' + Map3dLeft._container.id).css({
        position: 'absolute',
        height: '100%',
        left: '0',
        width: '50%'
      });

      Map3d.camera.changed.addEventListener(
        this._map_extentChangeHandler,
        this
      );
      Map3d.camera.percentageChanged = 0.01;

      Map3dLeft.camera.changed.addEventListener(
        this._mapEx_extentChangeHandler,
        this
      );
      Map3dLeft.camera.percentageChanged = 0.01;

      this._map_extentChangeHandler();

      this.changeType();
    },
    changeType() {
      const handlerEx = Map3dLeft.screenSpaceEventHandler;
      const handler = Map3d.screenSpaceEventHandler;
      switch (this.viewType) {
        case '3d':
          Map3dLeft.scene.morphTo3D(0);
          Map3dLeft.scene.screenSpaceCameraController.enableTilt = true;
          CesiumDragEvt(handlerEx, null, true);
          CesiumDragEvt(handler, null, true);
          break;
        case '2d': {
          Map3dLeft.scene.morphTo2D(0);
          let lastPos = Map3d.camera.position;
          CesiumDragEvt(handlerEx, null, true);
          CesiumDragEvt(
            handler,
            () => {
              this.dragging = true;
              this.heading = Map3d.camera.heading;
              const pitch = Map3d.camera.pitch;
              const boundary = -Math.PI / 6;
              if (pitch > boundary) {
                Map3d.camera.setView({
                  destination: lastPos,
                  orientation: {
                    heading: Map3d.camera.heading,
                    pitch: boundary - 0.0001,
                    roll: Map3d.camera.roll
                  }
                });
                Map3d.scene.screenSpaceCameraController.enableTilt = false;
              }
            },
            false,
            () => {
              Map3d.scene.screenSpaceCameraController.enableTilt = true;
            }
          );
          break;
        }
        case 'zs':
          Map3dLeft.scene.morphTo3D(0);
          CesiumDragEvt(handler, () => {
            this.dragging = true;
            this.heading = Map3d.camera.heading;
          });
          CesiumDragEvt(handlerEx, (e) => {
            Map3dLeft.camera.setView({
              destination: Map3dLeft.camera.position,
              orientation: {
                heading:
                  Map3dLeft.camera.heading +
                  (e.endPosition.x - e.startPosition.x) * 0.0085,
                pitch: -Math.PI / 2,
                roll: 0
              }
            });
          });
          Map3dLeft.scene.screenSpaceCameraController.enableTilt = false;
          break;
      }
    },
    // 三维退出分屏
    signOut() {
      this.isShowContent = false;
      // this.$emit('getShow', this.isShowContent);
      this.$emit('change:active', false);
      $('#' + this.$earth.viewer._container.id).css({
        position: 'absolute',
        height: '100%',
        left: '0',
        width: '100%'
      });
    },
    // 主屏监听
    _map_extentChangeHandler() {
      if (this.viewerExStat) {
        this.viewerExStat = false;
        return;
      }
      this.viewerStat = true;

      Map3dLeft.camera.changed.removeEventListener(
        this._mapEx_extentChangeHandler,
        this
      );
      this.updateView(Map3d, Map3dLeft, true);
      clearTimeout(this.timer1);
      this.timer1 = setTimeout(() => {
        Map3dLeft.camera.changed.addEventListener(
          this._mapEx_extentChangeHandler,
          this
        );
      }, 10);
    },
    // 分屏监听
    _mapEx_extentChangeHandler() {
      if (this.viewerStat) {
        this.viewerStat = false;
        return;
      }
      this.viewerExStat = true;
      Map3d.camera.changed.removeEventListener(
        this._map_extentChangeHandler,
        this
      );
      this.updateView(Map3dLeft, Map3d);
      clearTimeout(this.timer2);
      this.timer2 = setTimeout(() => {
        Map3d.camera.changed.addEventListener(
          this._map_extentChangeHandler,
          this
        );
      }, 10);
    },
    updateView(viewerChange, viewerUpdate, handleViewer) {
      if ((this.viewType === '2d' || this.viewType === 'zs') && handleViewer) {
        if (!this.dragging) {
          let cameraPos = viewerChange.camera.position;
          const cartoCam = cartesian2Carto(cameraPos);
          let pos = viewerChange.scene.pickPosition(
            toCartesian2(
              viewerChange.scene.canvas.width / 2,
              viewerChange.scene.canvas.height / 2
            )
          );
          if (!pos) return;
          // const carto = toCartographic(pos);
          // this.pos = toCartesian3(carto.longitude,carto.latitude,cartoCam.height)
          this.pos = setPositionsHeight(pos, cartoCam.height);
          this.heading = Map3d.camera.heading;
        } else {
          this.dragging = false;
        }
        // console.log("heading", this.heading);
        return viewerUpdate.camera.setView({
          destination: this.pos,
          orientation: {
            heading: Map3d.camera.heading,
            pitch: -Math.PI / 2,
            roll: 0
          }
        });
      }
      let point = viewerChange.shine.getCameraView(true);
      // viewerUpdate.shine.centerAt(point, { isWgs84: true });
      viewerUpdate.camera.setView({
        destination: lonlat2cartesian([point.x, point.y, point.z]),
        orientation: {
          // heading: Cesium.Math.toRadians(Cesium.defaultValue(point.heading, 0)),
          heading: (point.heading / 180) * Math.PI,
          pitch: (point.pitch / 180) * Math.PI,
          roll: (point.roll / 180) * Math.PI
        }
      });
    },

    // 左侧二维，右侧三维
    split2d3d() {
      // this.isSplit = !this.isSplit;
      this.isSplit = true;
      this.$emit('change:active', true);
      $(this.$map.getTargetElement()).css({
        position: 'absolute',
        height: '100%',
        left: '0',
        width: '50%',
        borderRight: '1px solid #fff'
      });
      this.$map.updateSize();
      // this.fullScreen();
      // setTimeout(() => {
      //   this.exitScreen();
      // }, 100);

      $('.cesium-container').css({
        position: 'absolute',
        height: '100%',
        left: '50%',
        width: '50%'
      });
      $('.cesium-container').show();

      Map3d.shine.ol3d.update(true);
      Map3d.shine.ol3d.setEnabled(true, true);
    },
    signOut2d3d() {
      this.isSplit = false;
      this.$emit('change:active', false);
      Map3d.shine.ol3d.update(false);
      Map3d.shine.ol3d.setEnabled(false, false);
      // this.fullScreen();
      // setTimeout(() => {
      //   this.exitScreen();
      // }, 100);
      $(this.$map.getTargetElement()).css({
        position: 'absolute',
        height: '100%',
        left: '0',
        width: '100%'
      });
      this.$map.updateSize();
      $('.cesium-container').hide();
    },
    // 全屏
    fullScreen() {
      var el = document.documentElement;
      var rfs =
        el.requestFullScreen ||
        el.webkitRequestFullScreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen;
      if (typeof rfs !== 'undefined' && rfs) {
        rfs.call(el);
      }
      return;
    },
    // 退出全屏
    exitScreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      // if (typeof cfs !== 'undefined' && cfs) {
      //   cfs.call(el);
      // }
    }
  }
};
</script>
