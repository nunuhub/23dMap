<template>
  <div class="sh-map-earth sh-base-component un-select">
    <Map
      v-if="mapViewMode != '3D'"
      v-show="currentView === 'map'"
      ref="map"
      :controls="controls"
      :init-layers="initLayers"
      :projection="projection"
      :center="center"
      :zoom="zoom"
      :min-zoom="minZoom"
      :max-zoom="maxZoom"
      :mouse-wheel-zoom-enable="mouseWheelZoomEnable"
      :double-click-zoom-enable="doubleClickZoomEnable"
      :drag-pan-enable="dragPanEnable"
      @mapInited="mapInited"
    />
    <Earth
      v-if="isMapLoad && mapViewMode != '2D'"
      v-show="currentView === 'earth'"
      ref="earth"
      :controls="controls"
      :init-layers="initLayers"
      :map="$map"
      :projection="projection"
      :center="center"
      :height="height"
      :zoom="zoom"
      :heading="heading"
      :roll="roll"
      :pitch="pitch"
      @earthInited="earthInited"
    />
    <slot v-if="isMapLoad && isEarthLoad" />
  </div>
</template>

<script>
import Map from 'shinegis-client-23d/packages/map';
import Earth from 'shinegis-client-23d/packages/earth';
import { getMapViewMode } from 'shinegis-client-23d/src/utils/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import interaction from 'shinegis-client-23d/src/mixins/interaction';
import { v4 as uuidv4 } from 'uuid';

export default {
  name: 'ShMapEarth',
  components: {
    Map,
    Earth
  },
  mixins: [emitter, interaction],
  provide() {
    return {
      reactiveViewMode: () => this.mapViewMode,
      reactiveView: () => this.currentView,
      reactiveMap: () => this.$map,
      reactiveEarth: () => this.$earth,
      emitterId: this.emitterId
    };
  },
  props: {
    // 地图模式 '2D' '3D' '23D'
    viewMode: {
      type: [String, Number],
      default: '23D'
    },
    // 初始视图（map、earth） 只在 "23D"模式下有效
    view: {
      type: String,
      default: 'map'
    },
    // 地图控件
    controls: {
      type: Array,
      default: () => [
        'FullFigure',
        'Zoom',
        'Geolocation',
        'Rotate',
        'ScaleLine',
        'FullScreen',
        'NavigationHelp'
      ]
    },
    initLayers: {
      type: Array,
      default: () => []
    },
    projection: {
      type: String
    },
    // 地图中心点
    center: {
      type: Array
    },
    // 地图缩放层级
    zoom: {
      type: Number
    },
    // 高度
    height: {
      type: Number
    },
    // 方位角
    heading: {
      type: Number
    },
    // 旋转角
    roll: {
      type: Number
    },
    // 俯仰角
    pitch: {
      type: Number
    },
    // 地图是否可通过鼠标滚轮缩放浏览
    mouseWheelZoomEnable: {
      type: Boolean,
      default: true
    },
    // 地图是否可通过双击鼠标放大地图
    doubleClickZoomEnable: {
      type: Boolean,
      default: true
    },
    // 地图是否可通过鼠标拖拽平移
    dragPanEnable: {
      type: Boolean,
      default: true
    },
    minZoom: {
      type: Number,
      default: 0
    },
    maxZoom: {
      type: Number,
      default: 28
    }
  },
  data() {
    this.$map = undefined;
    this.$earth = undefined;
    return {
      // 当前地图模式
      currentView: this.getInitView(),
      isMapLoad: false,
      isEarthLoad: false
    };
  },
  computed: {
    initialized() {
      const { isMapLoad, isEarthLoad } = this;
      return isMapLoad && isEarthLoad;
    },
    mapViewMode() {
      return getMapViewMode(this.viewMode);
    }
  },
  watch: {
    initialized(state) {
      state &&
        setTimeout(() => {
          this.$emit('mapEarthInited', {
            map: this.$map,
            earth: this.$earth,
            mapRef: this.$refs.map,
            earthRef: this.$refs.earth
          });
        }, 0);
    },
    mapViewMode: {
      handler(newVal, oldVal) {
        this.currentView = this.getInitView();
        if (this.mapViewMode === '3D') {
          this.isMapLoad = true;
          this.isEarthLoad = oldVal === '23D';
        } else if (this.mapViewMode === '2D') {
          this.isEarthLoad = true;
          this.isMapLoad = oldVal === '23D';
        } else if (this.mapViewMode === '23D') {
          this.isEarthLoad = false;
          this.isMapLoad = oldVal === '2D';
        }
      },
      immediate: true
    },
    currentView(val) {
      if (val === 'earth') {
        setTimeout(() => {
          this.$earth.viewer.shine.ol3d.setEnabled(true);
        }, 10);
      } else {
        this.$earth.viewer.shine.ol3d.setEnabled(false);
        this.$nextTick(() => {
          this.$map.updateSize();
        });
      }
      this.$emit('change:view', val);
    },
    view(val) {
      if (this.mapViewMode === '23D') {
        this.currentView = val;
      }
    }
  },
  beforeCreate() {
    this.emitterId = uuidv4();
  },
  mounted() {
    const version = Object.keys(
      require('../../../examples/versions.json')
    ).reverse()[0];
    // eslint-disable-next-line no-console
    console.log('shinegis-client-23d version:', version);
    this.subscribe.$on('layer-switcher:change:view', this.toggleViewMode);
  },
  methods: {
    mapInited(map) {
      this.$map = map;
      this.isMapLoad = true;
      this.$map.on('afterAddMapLink', (e) => {
        if (this.$earth) {
          this.resetEarthElement(e.element);
        }
      });
      this.$map.on('afterRemoveMapLink', (e) => {
        if (this.$earth) {
          this.resetEarthElement(e.element);
        }
      });
    },
    earthInited(earth) {
      this.$earth = earth;
      this.isEarthLoad = true;
    },
    toggleViewMode() {
      this.currentView = this.currentView === 'map' ? 'earth' : 'map';
    },
    resetEarthElement(element) {
      let earthTarget = document.getElementById(
        this.$earth.viewer._container.id
      );
      earthTarget.style.width = element.style.width;
      earthTarget.style.height = element.style.height;
    },
    getInitView() {
      if (this.mapViewMode === '23D') {
        return this.view;
      } else {
        return this.mapViewMode === '3D' ? 'earth' : 'map';
      }
    }
  }
};
</script>
