<template>
  <el-popover
    ref="popover"
    v-model="visible"
    popper-class="sh-layer-switcher-sublayer-popover"
    placement="top"
    trigger="manual"
    :visible-arrow="false"
    @show="onPopoverShow"
  >
    <div
      slot="reference"
      v-popover:popover
      class="setup"
      @click.stop="visible = !visible"
    >
      <i class="el-icon-d-arrow-left"></i>
    </div>
    <div
      class="popover-container"
      @mouseover="onPopoverMouseOver"
      @mouseout="onPopoverMouseOut"
    >
      <!-- <el-checkbox
        v-model="checkAll"
        border
        :indeterminate="isIndeterminate"
        @change="handleCheckAllChange"
        >全选</el-checkbox
      > -->
      <el-checkbox
        v-for="layer in options"
        :key="layer.id"
        v-model="layer.isDefault"
        border
        class="sublayer"
        :style="{
          backgroundImage: `url(${layer.thumbnailUrl || defaultThumbnail})`
        }"
        >{{ layer.layerNameAlias || layer.label }}</el-checkbox
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
  name: 'ShLayerSwitcherSublayerPopover',
  mixins: [commom, emitter, generalControlProps],
  props: {
    view: {
      type: String
    },
    options: {
      type: Array,
      default: () => []
    },
    defaultThumbnail: {
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
      checkAll: false,
      oldLayer: cloneDeep(this.options),
      isIndeterminate: true
    };
  },
  watch: {
    options: {
      // 在嵌套的变更中，只要没有替换对象本身，
      // 那么这里的 `newValue` 和 `oldValue` 相同
      handler(value) {
        const selectTypes = [];
        value.forEach((layer, index) => {
          selectTypes.push(layer.isDefault);
          if (layer.isDefault !== this.oldLayer[index].isDefault) {
            const changeType = layer.isDefault ? 'add' : 'remove';
            this.changeLayer(layer, this.view, changeType);
          }
        });

        this.setCheckBoxStatus(selectTypes);
        this.oldLayer = cloneDeep(value);
      },
      deep: true
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
      this.setCheckBoxStatus(selectTypes);
    },
    initLayerManager() {
      this.mapLayerManager = this.$map?.layerManager;
      this.earthLayerManager = this.$earth?.viewer?.shine.layerManager;
    },
    setCheckBoxStatus(selectTypes) {
      const types = new Set(selectTypes);
      if (types.size === 2) {
        // 半选
        this.isIndeterminate = true;
      } else if (types.size === 1) {
        // 全选或全不选
        this.isIndeterminate = false;
        this.checkAll = [...types][0];
      }
    },
    handleCheckAllChange(value) {
      this.options.forEach((item) => {
        item.isDefault = value;
      });
    },
    changeLayer(layer, target, type) {
      if (target === 'map') {
        if (type === 'add') {
          this.mapLayerManager?.addCheckedLayers(layer);
        } else if (type === 'remove') {
          this.mapLayerManager?.removeCheckedLayers(layer);
        }
        this.$emit('onChangeCheckedLayer', type, layer, target);
      } else {
        if (type === 'add') {
          this.earthLayerManager?.addCheckedLayers(layer);
        } else if (type === 'remove') {
          this.earthLayerManager?.removeCheckedLayers(layer);
        }
        this.$emit('onChangeCheckedLayer', type, layer, target);
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
