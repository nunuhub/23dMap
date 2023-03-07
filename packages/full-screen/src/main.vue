<template>
  <div
    class="sh-full-screen"
    :style="{ ...themeVariables }"
    :title="item.text"
    @click="execute"
  >
    <IconSvg
      :icon-class="item.icon"
      :theme="theme"
      width="16px"
      height="16px"
    />
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import generalControlProps from 'shinegis-client-23d/src/mixins/components/general-control-props';
import Fullscreen from 'shinegis-client-23d/src/utils/plug/Fullscreen';

let toggleButton;
export default {
  name: 'ShFullScreen',
  components: { IconSvg },
  mixins: [common, emitter, generalControlProps],
  data() {
    return {
      item: {
        id: 'fullScreen',
        icon: 'full-screen',
        text: '全屏'
      }
    };
  },
  mounted() {
    if (this.$map || this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  beforeDestroy() {
    document.removeEventListener('fullscreenchange', toggleButton);
  },
  methods: {
    begin() {
      //增加全屏切换时的监听，改变全屏按钮样式
      let that = this;
      toggleButton = function toggleButton() {
        if (Fullscreen.fullscreen === true) {
          that.item = {
            id: 'exitFullScreen',
            icon: 'exit-full-screen',
            text: '退出全屏'
          };
        } else {
          that.item = {
            id: 'fullScreen',
            icon: 'full-screen',
            text: '全屏'
          };
        }
      };
      document.removeEventListener('fullscreenchange', toggleButton);
      document.addEventListener('fullscreenchange', toggleButton);
    },
    /**
     * 执行全屏或退出全屏
     * true为全屏，false退出
     */
    execute() {
      let flag = Fullscreen.fullscreen === false;
      let div = document.body;
      flag ? Fullscreen.requestFullscreen(div) : Fullscreen.exitFullscreen();
    }
  }
};
</script>
