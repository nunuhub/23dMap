<template>
  <div v-show="shouldShow" class="sh-draw-tool">
    <general-bar
      :mode="mode"
      :drag-enable="dragEnable"
      :is-show.sync="visible"
      :position="position"
      :options="toolOptions"
      :active-index="activeIndex"
      :theme-style="barThemeStyle"
      @change:isShow="onChangeIsShow"
      @select="select"
      @unselect="unselect"
    />
  </div>
</template>

<script>
import DrawTool from './DrawTool.js';
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import GeneralBar from 'shinegis-client-23d/packages/general-bar';
import generalBarProps from 'shinegis-client-23d/src/mixins/components/general-bar-props';
import { defaultOptions, getToolOptions } from './config';
import { selectStyles } from 'shinegis-client-23d/src/utils/olUtil';

export default {
  name: 'ShDrawTool',
  components: {
    GeneralBar
  },
  mixins: [commom, emitter, generalBarProps],
  props: {
    // drawend事件返回数据的格式
    returnType: {
      type: String,
      default: 'geojson'
    },
    // 工具条配置
    options: {
      type: Object,
      default: function () {
        return defaultOptions;
      }
    },
    isDrawEndSelected: {
      type: Boolean,
      default: true
    }
  },
  data() {
    this.drawTool;
    return {
      activeIndex: []
    };
  },
  computed: {
    // 在三维模式下隐藏
    shouldShow() {
      return this.currentView === 'map';
    },
    toolOptions() {
      return getToolOptions({ ...defaultOptions, ...this.options });
    }
  },
  watch: {
    currentInteraction(name) {
      if (name !== this.$options.name) {
        this.deactivate();
      }
    },
    options() {
      this.$map && this.begin();
    }
  },
  beforeDestroy() {
    this.deactivate();
  },
  mounted() {
    if (this.$map) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    // 组件逻辑开始入口,如果组件有初始运行逻辑，请在此方法内编写
    begin() {
      if (this.drawTool) {
        this.activeIndex = [];
        this.drawTool.destory();
      }
      this.drawTool = new DrawTool(this.$map, {
        showToolbar: false,
        ...this.options
      });
      this.drawTool.init();
      this.drawTool.on('drawend', (e) => {
        if (this.isDrawEndSelected) {
          e.feature.set('tempSelected', true);
          e.feature.setStyle(selectStyles);
        }
        let result =
          this.returnType === 'geojson'
            ? this.$map.transformGeo(e.feature)
            : e.feature;
        this.$emit('drawend', result);
      });
      this.drawTool.on('change:active', (e) => {
        if (e.active) {
          !this.activeIndex.includes(e.tool) && this.activeIndex.push(e.tool);
        } else {
          const oldActiveIndex = [...this.activeIndex];
          const targetIndex = this.activeIndex.findIndex(
            (item) => item === e.tool
          );
          if (targetIndex > -1) {
            oldActiveIndex.splice(targetIndex, 1);
            this.activeIndex = [...oldActiveIndex];
          }
        }
        this.$emit('change:active', e.active, e.tool, this.activeIndex);
      });
      this.$emit('inited', this.drawTool);
    },
    activate(type) {
      this.drawTool.activate(type);
    },
    deactivate() {
      if (this.drawTool) {
        this.drawTool.deactivate();
      }
    },
    removeSelect() {
      this.drawTool.removeSelect();
    },
    removeAll(id) {
      this.drawTool.removeAll(id);
    },
    removeTarget() {
      this.drawTool.removeTarget();
    },
    clearFinish() {
      this.drawTool.clearFinish();
    },
    select(type) {
      if (type === 'clear') {
        this.drawTool.removeAll();
      } else {
        this.drawTool.activate(type);
      }
    },
    unselect(type) {
      this.drawTool.deactivate(type);
    },
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    createDrawLayer(option) {
      return this.drawTool.createDrawLayer(option);
    },
    loadGeoJson(geojson, option) {
      return this.drawTool.loadGeoJson(geojson, option);
    },
    removeFeatures(features) {
      this.drawTool.removeFeatures(features);
    },
    removeFeature(feature) {
      this.drawTool.removeFeature(feature);
    },
    setFeatureStyle(feature, style) {
      this.drawTool.setFeatureStyle(feature, style);
    }
  }
};
</script>
