<template>
  <div v-show="isShow" class="sh-cutting-layer">
    <span v-if="$slots.default" @click="() => toggle()">
      <slot></slot>
    </span>
    <general-button
      v-else
      :is-column="!!isColumn"
      :icon-class="'cutting'"
      :active="active"
      :show-img="!!showImg"
      :show-label="!!showLabel"
      :theme-style="themeStyle"
      :drag-enable="dragEnable"
      :title="title ? title : '裁剪'"
      @click="() => toggle()"
    ></general-button>
  </div>
</template>
<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import GeneralButton from 'shinegis-client-23d/packages/general-button';
import { propsObj } from './propsObj';
import Cutting from './Cutting';
import generalButtonProps from 'shinegis-client-23d/src/mixins/components/general-button-props';

export default {
  name: 'ShCuttingLayer',
  components: { GeneralButton },
  mixins: [common, emitter, generalButtonProps],
  props: propsObj,
  data() {
    this.cutting;
    return {
      active: false
    };
  },
  mounted() {
    if (this.$map) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    toggle() {
      if (this.active) {
        this.deactivate();
      } else {
        this.activate();
      }
      this.active = !this.active;
    },
    /**
     * 裁剪开始入口,
     */
    begin() {
      if (this.defaultActive) {
        //初始执行裁剪,裁剪参数必传
        this.activate();
      }
    },

    /**
     * 执行
     */
    activate() {
      if (!this.cutting) {
        this.cutting = new Cutting(this.$map);
      }
      // 不传参数则展示默认测试数据
      this.cutting.initCutting(this.cuttingOptions);
    },

    /**
     * 清除
     */
    deactivate() {
      this.cutting && this.cutting.clearCutLayers();
    },

    /**
     * 根据图层id,添加裁剪图层
     * @param id
     */
    addCuttingLayerById(id) {
      if (this.cutting && this.cuttingOptions) {
        this.cutting.addCuttingLayer(id);
      }
    },
    /**
     * 根据图层id移除对应的裁剪图层
     * @param id
     */
    removeCuttingLayerById(id) {
      if (this.cutting && this.cuttingOptions) {
        this.cutting.removeCutLayerById(id);
      }
    },

    /**
     * 获取当前裁剪的图层id
     * @returns {string[]}
     */
    getCutLayersIds() {
      if (this.cutting) {
        return this.cutting.getCutLayersIds();
      } else {
        return [];
      }
    }
  },
  render() {
    return null;
  }
};
</script>
