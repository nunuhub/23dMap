<template>
  <div class="sh-geolocation">
    <div v-show="longitude !== '' && latitude !== ''" class="content">
      经度：{{ longitude }}&nbsp;&nbsp;&nbsp;&nbsp;纬度：{{
        latitude
      }}&nbsp;&nbsp;&nbsp;&nbsp;方向：{{ rotation }}度(0度为正北)
    </div>
    <div v-show="false" ref="position"></div>
  </div>
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';

export default {
  name: 'ShGeolocation',
  mixins: [commom, emitter],
  data() {
    return {
      longitude: '',
      latitude: '',
      rotation: 0
    };
  },
  mounted() {
    this.setInitRotate();
    this.subscribe.$on('rotate:change', (rotate) => {
      this.rotation = rotate;
    });
    this.$map.getView().on('change:center', this.onChangeCenter);
    this.onChangeCenter();
  },
  destroyed() {
    this.subscribe.$off('rotate:change');
    this.$map.getView().un('change:center', this.onChangeCenter);
  },
  methods: {
    // 初始状态的rotation
    setInitRotate() {
      const rotation = this.$map.getView().getRotation();
      let angle = (rotation * 180) / Math.PI;
      if (angle < 0) {
        angle += 360;
      }
      angle = angle.toFixed(0) * 1;
      this.rotation = angle;
    },
    onChangeCenter() {
      const center = this.$map.getView().getCenter();
      this.longitude = center[0].toFixed(4);
      this.latitude = center[1].toFixed(4);
    }
  }
};
</script>
