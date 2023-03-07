<template>
  <div
    :id="earthId"
    class="sh-earth cesium-container"
    :class="{ 'sh-base-component': $isBaseComponent }"
  >
    <div class="sh-earth-controls">
      <FullFigure
        v-if="isEarthLoad && getControlIsShow('FullFigure')"
        :options="getControlOption('FullFigure')"
        :init-position="initPosition"
      />
      <Zoom
        v-if="isEarthLoad && getControlIsShow('Zoom')"
        :options="getControlOption('Zoom')"
      />
      <FullScreen
        v-if="isEarthLoad && getControlIsShow('FullScreen')"
        :options="getControlOption('FullScreen')"
      />
      <NavigationHelp
        v-if="isEarthLoad && getControlIsShow('NavigationHelp')"
        :options="getControlOption('NavigationHelp')"
      />
      <ScenePick
        v-if="isEarthLoad && getControlIsShow('ScenePick')"
        :options="getControlOption('ScenePick')"
      />
    </div>
    <Rotate
      v-if="isEarthLoad && getControlIsShow('Rotate')"
      :options="getControlOption('Rotate')"
    />
    <ScaleLine
      v-if="isEarthLoad && getControlIsShow('ScaleLine')"
      :options="getControlOption('ScaleLine')"
    />
    <Geolocation
      v-if="isEarthLoad && getControlIsShow('Geolocation')"
      :options="getControlOption('Geolocation')"
    />
    <slot v-if="isEarthLoad" />
  </div>
</template>

<script type="text/javascript">
import ShineEarth from 'shinegis-js-api/ShineEarth';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import interaction from 'shinegis-client-23d/src/mixins/interaction';
import { v4 as uuidv4 } from 'uuid';
import FullFigure from 'shinegis-client-23d/packages/full-figure';
import FullScreen from 'shinegis-client-23d/packages/full-screen';
import Zoom from './controls/zoom';
import Rotate from './controls/rotate';
import ScaleLine from './controls/scale-line';
import Geolocation from './controls/geolocation';
import NavigationHelp from './controls/navigation-help';
import ScenePick from './controls/scene-pick';

export default {
  name: 'ShEarth',
  components: {
    FullFigure,
    Zoom,
    Rotate,
    ScaleLine,
    Geolocation,
    FullScreen,
    NavigationHelp,
    ScenePick
  },
  mixins: [emitter, interaction],
  inject: {
    // 地图模式 '2D' '3D' '23D'
    reactiveViewMode: {
      default: function () {
        return () => '3D';
      }
    },
    configInstance: {
      default: null
    }
  },
  provide() {
    return {
      reactiveViewMode: () => '3D',
      reactiveView: () => 'earth',
      reactiveEarth: () => this.$earth,
      emitterId: this.emitterId
    };
  },
  props: {
    // 二维地图对象
    map: Object,
    initLayers: {
      type: Array,
      default: () => []
    },
    // 控件
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
    // 地图坐标系
    projection: {
      type: String,
      default: 'EPSG:4490'
    },
    // 地图中心点
    center: {
      type: Array,
      default: () => {
        return [111.7579, 31.6736];
      }
    },
    // 高度
    height: {
      type: Number,
      default: 6149142.56
    },
    zoom: {
      type: Number
    },
    // 方位角
    heading: {
      type: Number,
      default: 0
    },
    // 旋转角
    roll: {
      type: Number,
      default: 0
    },
    // 倾斜角
    pitch: {
      type: Number,
      default: -90
    }
  },
  data() {
    this.$earth = undefined;
    this.earthId = uuidv4();
    return {
      isEarthLoad: false
    };
  },
  computed: {
    currentPosition() {
      return {
        center: this.center,
        height: this.height,
        heading: this.heading,
        roll: this.roll,
        pitch: this.pitch
      };
    }
  },
  watch: {
    currentPosition(value) {
      this.$earth?.centerAt(value);
    }
  },
  beforeCreate() {
    this.$isBaseComponent =
      this.$parent?.$parent.$options?.name !== 'ShMapEarth';
    this.emitterId = this.$isBaseComponent
      ? uuidv4()
      : this.$parent.$parent.emitterId;
  },
  mounted() {
    if (this.$isBaseComponent) {
      const version = Object.keys(
        require('../../../examples/versions.json')
      ).reverse()[0];
      // eslint-disable-next-line no-console
      console.log('shinegis-client-23d version:', version);
    }
    setTimeout(() => {
      this.initEarth();
      this.setInitLayers();
    });
  },
  methods: {
    initEarth() {
      this.$earth = new ShineEarth(this.earthId, {
        center: this.center,
        projection: this.projection,
        height: this.height,
        heading: this.heading,
        roll: this.roll,
        pitch: this.pitch,
        map: this.map
      });
      let realHeight;
      // zoom优先级高于height
      if (this.zoom != null) {
        realHeight = this.$earth.viewer.shine.levelToHeight(this.zoom);
      } else {
        realHeight = this.height;
      }
      this.initPosition = {
        center: this.center,
        height: realHeight,
        heading: this.heading,
        roll: this.roll,
        pitch: this.pitch
      };
      this.isEarthLoad = true;
      this.$emit('earthInited', this.$earth);
    },
    setInitLayers() {
      for (let i = 0; i < this.initLayers.length; i++) {
        this.$earth.viewer.shine.layerManager.addCheckedLayers(
          this.initLayers[i]
        );
      }
    },
    /**
     * 获取地图控件是否展示
     * @param name 控件名称
     */
    getControlIsShow(name) {
      const nameList = this.controls.map((control) => {
        if (typeof control === 'object') {
          return control.name;
        }
        return control;
      });
      return nameList.includes(name);
    },
    /**
     * 获取控件配置信息
     * @param name 控件名称
     */
    getControlOption(name) {
      const target = this.controls.find((control) => control.name === name);
      return target ? target.earthOptions : null;
    }
  }
};
</script>
