<template>
  <div
    class="sh-full-figure"
    title="复位"
    :style="{ ...themeVariables }"
    @click.stop="onClick"
  >
    <icon-svg
      icon-class="reset-view"
      width="16px"
      height="16px"
      :theme="theme"
    />
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import generalControlProps from 'shinegis-client-23d/src/mixins/components/general-control-props';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';

export default {
  name: 'ShFullFigure',
  components: {
    IconSvg
  },
  mixins: [common, generalControlProps],
  props: {
    initPosition: {
      type: Object
    },
    // 暂时不启用
    options: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    onClick() {
      if (this.currentView === 'map') {
        this.$map.getView().animate({
          center: this.initPosition.center,
          zoom: this.initPosition.zoom,
          duration: 2000
        });
      } else {
        this.$earth.centerAt(this.initPosition);
      }
    }
  }
};
</script>
