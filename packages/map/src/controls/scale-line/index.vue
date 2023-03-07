<template>
  <div ref="scale" class="sh-scale-line" />
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import ScaleLine from './ScaleLine';

export default {
  name: 'ShScaleLine',
  mixins: [commom, emitter],
  props: {
    options: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    this.scaleLine;
    return {};
  },
  mounted() {
    this.createControl();
  },
  destroyed() {
    this.$map.removeControl(this.scaleLine);
  },
  methods: {
    createControl() {
      this.scaleLine = new ScaleLine({
        target: this.$refs.scale,
        ...this.options
      });
      this.$map.addControl(this.scaleLine);
    }
  }
};
</script>
