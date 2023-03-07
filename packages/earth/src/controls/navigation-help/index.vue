<template>
  <div
    ref="button"
    class="sh-earth-navigation-help"
    :style="{ ...themeVariables }"
  >
    <IconSvg
      ref="icon"
      icon-class="help"
      theme="dark"
      width="16px"
      height="16px"
    />
  </div>
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import generalControlProps from 'shinegis-client-23d/src/mixins/components/general-control-props';
import { NavigationHelpButton } from 'cesium_shinegis_earth';

let helpButton;
export default {
  name: 'ShNavigationHelp',
  components: { IconSvg },
  mixins: [commom, emitter, generalControlProps],
  mounted() {
    //  取到cesium的“导航介绍”按钮。移动其位置，并且修改其样式。
    let div = this.$refs.button;
    div.style.zIndex = 5;
    new NavigationHelpButton({
      container: div
    });
    //将cesium导航介绍添加到div上
    helpButton = div.getElementsByClassName(
      'cesium-navigationHelpButton-wrapper'
    )[0];
    div.appendChild(helpButton);
    helpButton.firstChild.className += ' helpButton11';
    //移除cesium自有svg
    let svg = helpButton.getElementsByClassName('cesium-svgPath-svg')[0];
    helpButton.firstElementChild.removeChild(svg);
    //组件svg覆盖其上
    let icon = this.$refs.icon;
    icon.$el.style.position = 'absolute';
    icon.$el.style.zIndex = 6;
    icon.$el.style.transform = 'translateX(8px)translateY(10px)';
    icon.$el.style.pointerEvents = 'none';
  }
};
</script>
