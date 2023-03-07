<template>
  <div class="sh-earth-zoom" :style="{ ...themeVariables }">
    <div class="zoom-in" title="放大" @click.stop="onZoomIn">
      <icon-svg icon-class="zoom-in" width="16px" height="16px" theme="dark" />
    </div>
    <div class="zoom-out" title="缩小" @click.stop="onZoomOut">
      <icon-svg icon-class="zoom-out" width="16px" height="16px" theme="dark" />
    </div>
  </div>
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import generalControlProps from 'shinegis-client-23d/src/mixins/components/general-control-props';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import ZoomNavigationControl from 'sge-navigation/viewModels/ZoomNavigationControl';

export default {
  name: 'ShEarthZoom',
  components: {
    IconSvg
  },
  mixins: [commom, emitter, generalControlProps],
  mounted() {
    this.zoomIn = new ZoomNavigationControl(this.$earth.viewer, true);
    this.zoomOut = new ZoomNavigationControl(this.$earth.viewer, false);
  },
  methods: {
    onZoomIn() {
      this.zoomIn.zoom(this.zoomIn.relativeAmount);
    },
    onZoomOut() {
      this.zoomOut.zoom(this.zoomOut.relativeAmount);
    }
  }
};
</script>
