<template>
  <div class="sh-rotate" :style="{ ...themeVariables }">
    <img
      v-if="customImg"
      class="customImg"
      :src="customImg"
      :style="{ transform: 'rotate(' + rotation + 'deg)' }"
      @click="resetNorth"
    />
    <div
      v-else
      :style="{ transform: 'rotate(' + rotation + 'deg)' }"
      @click.stop="resetNorth"
    >
      <div class="rotate-outer-ring-background"></div>
      <div class="rotate-outer-ring">
        <icon-svg
          icon-class="compass-outer"
          width="60px"
          height="60px"
          theme="light"
        />
      </div>
      <div class="rotate-gyro-background">
        <icon-svg
          icon-class="compass-inner"
          width="30px"
          height="30px"
          theme="light"
        />
      </div>
    </div>
  </div>
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import generalControlProps from 'shinegis-client-23d/src/mixins/components/general-control-props';

export default {
  name: 'ShRotate',
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
      customImg: this.options?.src,
      rotation: 0
    };
  },
  mounted() {
    this.setInitRotate();
    this.$map.getView().on('change:rotation', (e) => {
      const rotation = e.target.getRotation();
      this.rotation = this.transRotation(rotation);
      this.$emit('change', this.rotation);
    });
  },
  methods: {
    // 初始状态的rotation
    setInitRotate() {
      const rotation = this.$map.getView().getRotation();
      this.rotation = this.transRotation(rotation);
    },
    // 弧度转角度
    transRotation(rotation) {
      let angle = (rotation * 180) / Math.PI;
      if (angle < 0) {
        angle += 360;
      }
      angle = angle.toFixed(0) * 1;
      return angle;
    },
    // 重置正北方向
    resetNorth() {
      this.$map.getView().setRotation(0);
    }
  }
};
</script>
