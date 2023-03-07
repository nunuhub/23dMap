<template>
  <div ref="button" class="sh-earth-scene-pick">
    <span class="container">
      <div
        :id="item.id"
        class="button"
        :style="{ ...themeVariables }"
        :title="item.text"
        @click="handleEvent('open_close_scenePicker')"
      >
        <IconSvg
          :icon-class="item.icon"
          theme="dark"
          width="16px"
          height="16px"
        />
      </div>
      <div
        v-for="(factor, order) in item.list"
        v-show="!factor.hidden"
        :key="order"
        class="button"
        :style="{ ...themeVariables }"
        :title="factor.text"
        @click="handleEvent(factor.id)"
      >
        <IconSvg
          :icon-class="factor.icon"
          width="16px"
          height="16px"
          theme="dark"
        />
      </div>
    </span>
  </div>
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import generalControlProps from 'shinegis-client-23d/src/mixins/components/general-control-props';

export default {
  name: 'ShScenePick',
  components: { IconSvg },
  mixins: [commom, emitter, generalControlProps],
  data() {
    return {
      item: {
        id: 'scene_3d',
        icon: 'scene-mode-3d', // 二维视图、哥伦布视图
        text: '三维视图',
        list: [
          {
            id: 'scene_2d',
            icon: 'scene-mode-2d',
            text: '二维视图',
            hidden: true
          },
          {
            id: 'scene_Columbus',
            icon: 'scene-mode-columbus',
            text: '哥伦布视图',
            hidden: true
          }
        ]
      }
    };
  },
  methods: {
    begin() {},
    handleEvent(key) {
      if (key === 'open_close_scenePicker') {
        //开关栏目
        let arr = this.item.list;
        arr.forEach((e) => {
          e.hidden = !e.hidden;
        });
        return;
      } else {
        let scene = this.$earth.viewer.scene;
        switch (key) {
          case 'scene_2d': {
            scene.morphTo2D(0);
            break;
          }
          case 'scene_3d': {
            scene.morphTo3D(0);
            break;
          }
          case 'scene_Columbus': {
            scene.morphToColumbusView(0);
          }
        }
        let arr = this.item.list;
        let selectedFactor = arr.find((e) => e.id === key);
        let temp = { ...this.item };
        this.item.icon = selectedFactor.icon;
        this.item.id = selectedFactor.id;
        this.item.text = selectedFactor.text;
        selectedFactor.icon = temp.icon;
        selectedFactor.id = temp.id;
        selectedFactor.text = temp.text;
        this.handleEvent('open_close_scenePicker');
      }
    }
  }
};
</script>
