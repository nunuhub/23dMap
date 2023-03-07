<template>
  <div ref="target" class="sh-earth-scale-line"></div>
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import DistanceLegendViewModel from 'sge-navigation/viewModels/DistanceLegendViewModel';

export default {
  name: 'ShEarthScaleLine',
  mixins: [commom, emitter],
  mounted() {
    this.container = document.createElement('div');
    this.container.className = 'cesium-widget-cesiumNavigationContainer';
    this.container.appendChild(this.$refs.target);
    this.$refs.target.setAttribute('id', 'distanceLegendDiv');
    this.$earth.viewer.container.appendChild(this.container);
    this.distanceLegendViewModel = DistanceLegendViewModel.create({
      container: this.$refs.target,
      terria: this.$earth.viewer,
      mapElement: this.container,
      enableDistanceLegend: true
    });
  },
  beforeDestroy() {
    this.$earth.viewer.container.removeChild(this.container);
  }
};
</script>
