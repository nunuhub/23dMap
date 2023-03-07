<template>
  <div class="sh-zoom" :style="{ ...themeVariables }">
    <div class="zoom-in" title="放大" @click.stop="() => zoomByDelta(delta)">
      <icon-svg icon-class="zoom-in" width="16px" height="16px" theme="light" />
    </div>
    <div class="zoom-out" title="缩小" @click.stop="() => zoomByDelta(-delta)">
      <icon-svg
        icon-class="zoom-out"
        width="16px"
        height="16px"
        theme="light"
      />
    </div>
  </div>
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import generalControlProps from 'shinegis-client-23d/src/mixins/components/general-control-props';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import { easeOut } from 'ol/easing';

export default {
  name: 'ShZoom',
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
    this.zoom;
    return {
      duration: this.options?.duration || 250,
      delta: this.options?.delta || 1
    };
  },
  methods: {
    zoomByDelta(delta) {
      const view = this.$map.getView();
      if (!view) {
        return;
      }
      const currentZoom = view.getZoom();
      if (currentZoom !== undefined) {
        const newZoom = view.getConstrainedZoom(currentZoom + delta);
        if (this.duration_ > 0) {
          if (view.getAnimating()) {
            view.cancelAnimations();
          }
          view.animate({
            zoom: newZoom,
            duration: this.duration_,
            easing: easeOut
          });
        } else {
          view.setZoom(newZoom);
        }
      }
    }
  }
};
</script>
