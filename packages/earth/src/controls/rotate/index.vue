<template>
  <div ref="target" class="sh-earth-rotate"></div>
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { Event as CesiumEvent } from 'cesium_shinegis_earth';
import NavigationViewModel from 'sge-navigation/viewModels/NavigationViewModel';

export default {
  name: 'ShEarthRotate',
  mixins: [commom, emitter],
  mounted() {
    this.$earth.viewer.afterWidgetChanged = new CesiumEvent();
    this.$earth.viewer.beforeWidgetChanged = new CesiumEvent();
    this.navigationViewModel = NavigationViewModel.create({
      container: this.$refs.target,
      terria: this.$earth.viewer,
      enableZoomControls: false,
      enableCompass: true
    });
  }
};
</script>
