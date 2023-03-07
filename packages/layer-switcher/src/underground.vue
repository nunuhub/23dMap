<template>
  <div
    ref="target"
    class="sh-layer-switcher-underground"
    :style="{ ...themeVariables }"
  >
    <div ref="btn" class="underground" title="地下空间" @click.stop="onClick">
      <icon-svg
        icon-class="underground"
        width="16px"
        height="16px"
        theme="dark"
      />
    </div>
    <div ref="card" class="underground-card" :class="{ visible: visible }">
      <el-form label-width="80px" label-position="left" size="mini">
        <el-form-item label="地下空间">
          <el-switch v-model="open"></el-switch>
        </el-form-item>
        <el-form-item label="自适应视距">
          <el-switch v-model="fadeByDistance"></el-switch>
        </el-form-item>
        <el-form-item label="地表透明度">
          <el-slider
            v-model="opacity"
            :min="0"
            :max="1"
            :step="0.1"
          ></el-slider>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import generalControlProps from 'shinegis-client-23d/src/mixins/components/general-control-props';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';

export default {
  name: 'ShLayerSwitcherUnderground',
  components: {
    IconSvg
  },
  mixins: [commom, emitter, generalControlProps],
  props: {
    options: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      visible: false,
      open: false,
      fadeByDistance: true,
      opacity: 0.7
    };
  },
  watch: {
    open: {
      handler(value) {
        this.$earth.groundUnder({ isUnderGround: !value });
        this.$earth.groundTranslucency({
          isTranslucency: value,
          fadeByDistance: this.fadeByDistance,
          alpha: this.opacity
        });
      },
      immediate: true
    },
    fadeByDistance(value) {
      if (this.open) {
        this.$earth.groundTranslucency({
          isTranslucency: true,
          fadeByDistance: value,
          alpha: this.opacity
        });
      }
    },
    opacity(value) {
      if (this.open) {
        this.$earth.groundTranslucency({
          isTranslucency: true,
          fadeByDistance: this.fadeByDistance,
          alpha: value
        });
      }
    }
  },
  mounted() {
    this.$earth
      .getViewport()
      .getElementsByClassName('sh-earth-controls')[0]
      .appendChild(this.$refs.target);
    if (typeof PointerEvent !== 'undefined') {
      document.addEventListener('pointerdown', this.closeCard, true);
    } else {
      document.addEventListener('mousedown', this.closeCard, true);
      document.addEventListener('touchstart', this.closeCard, true);
    }
  },
  beforeDestroy() {
    // 关闭地下空间
    if (
      this.$earth
        .getViewport()
        .getElementsByClassName('sh-earth-controls')[0]
        .contains(this.$refs.target)
    ) {
      this.$earth
        .getViewport()
        .getElementsByClassName('sh-earth-controls')[0]
        .removeChild(this.$refs.target);
    }
    this.$earth.groundUnder({ isUnderGround: true });
    this.$earth.groundTranslucency({
      isTranslucency: false
    });
    if (typeof PointerEvent !== 'undefined') {
      document.removeEventListener('pointerdown', this.closeCard, true);
    } else {
      document.removeEventListener('mousedown', this.closeCard, true);
      document.removeEventListener('touchstart', this.closeCard, true);
    }
  },
  methods: {
    onClick() {
      this.visible = !this.visible;
    },
    closeCard(e) {
      if (
        !this.$refs.card.contains(e.target) &&
        !this.$refs.btn.contains(e.target)
      ) {
        this.visible = false;
      }
    }
  }
};
</script>
