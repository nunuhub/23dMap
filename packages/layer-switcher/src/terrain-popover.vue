<template>
  <el-popover
    ref="popover"
    v-model="visible"
    trigger="manual"
    popper-class="sh-layer-switcher-terrain-popover"
    placement="top"
    :visible-arrow="false"
    @show="onPopoverShow"
  >
    <div slot="reference" class="setup" @click.stop="visible = !visible">
      <i class="el-icon-d-arrow-left"></i>
    </div>
    <div
      class="popover-container"
      @mouseover="onPopoverMouseOver"
      @mouseout="onPopoverMouseOut"
    >
      <el-radio
        v-for="layer in options"
        :key="layer.id"
        v-model="currentTerrain"
        :label="layer.id"
        border
        class="sublayer"
        :style="{
          backgroundImage: `url(${layer.thumbnailUrl || defaultThumbnail})`
        }"
        >{{ layer.layerNameAlias || layer.label }}</el-radio
      >
    </div>
  </el-popover>
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import generalControlProps from 'shinegis-client-23d/src/mixins/components/general-control-props';
import { cloneDeep } from 'lodash-es';

export default {
  name: 'ShLayerSwitcherTerrainPopover',
  mixins: [commom, emitter, generalControlProps],
  props: {
    view: {
      type: String,
      default: 'earth'
    },
    options: {
      type: Array,
      default: () => []
    },
    defaultThumbnail: {
      type: String
    },
    defaultValue: {
      type: String
    },
    currentPopover: {
      type: String
    },
    id: {
      type: String
    },
    open: {
      type: Boolean
    }
  },
  data() {
    this.mapLayerManager = null;
    this.earthLayerManager = null;
    return {
      visible: false,
      oldLayer: cloneDeep(this.options),
      currentTerrain: this.defaultValue
    };
  },
  watch: {
    currentTerrain(value, oldValue) {
      const addLayer = this.options.find((item) => item.id === value);
      const removelayer = this.options.find((item) => item.id === oldValue);
      removelayer && this.changeLayer(removelayer, this.view, 'remove');
      addLayer && this.changeLayer(addLayer, this.view, 'add');
      this.$emit('update:defaultValue', value);
    },
    currentView(value) {
      if (value !== this.view) {
        this.visible = false;
      }
    },
    open(value) {
      if (!value) {
        this.visible = false;
      }
    },
    visible(value) {
      if (value) {
        this.$emit('update:currentPopover', this.id);
      }
    },
    currentPopover(value) {
      if (value !== this.id) {
        this.visible = false;
      }
    }
  },
  beforeDestroy() {
    this.options.forEach((layer) => {
      if (layer.isDefault) {
        this.changeLayer(layer, this.view, 'remove');
      }
    });
  },
  mounted() {
    this.initLayerManager();
    this.init();
  },
  methods: {
    init() {
      const selectTypes = [];
      this.options.forEach((layer) => {
        selectTypes.push(layer.isDefault);
        if (layer.isDefault) {
          this.changeLayer(layer, this.view, 'add');
        }
      });
    },
    initLayerManager() {
      this.mapLayerManager = this.$map?.layerManager;
      this.earthLayerManager = this.$earth?.viewer?.shine.layerManager;
    },
    changeLayer(layer, target, type) {
      if (target === 'map') {
        if (type === 'add') {
          this.mapLayerManager?.addCheckedLayers(layer);
        } else if (type === 'remove') {
          this.mapLayerManager?.removeCheckedLayers(layer);
        }
      } else {
        if (type === 'add') {
          this.earthLayerManager?.addCheckedLayers(layer);
        } else if (type === 'remove') {
          this.earthLayerManager?.removeCheckedLayers(layer);
        }
        this.$emit('onChangeCheckedLayer', type, layer);
      }
    },
    onPopoverShow() {
      this.$nextTick(() => {
        Object.keys(this.themeVariables).forEach((key) => {
          this.$refs.popover.popperElm.style.setProperty(
            key,
            this.themeVariables[key]
          );
        });
      });
    },
    onPopoverMouseOver() {
      this.$emit('popoverMouseOver');
    },
    onPopoverMouseOut() {
      this.$emit('popoverMouseOut');
    }
  }
};
</script>
