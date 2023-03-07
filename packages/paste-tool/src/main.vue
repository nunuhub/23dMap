<template>
  <div v-show="shouldShow" class="sh-paste-tool">
    <div v-show="isShow">
      <span v-if="$slots.default" class="geomPasteTool" @click="startPaste">
        <slot></slot>
      </span>
      <general-button
        v-else
        :position="position"
        :is-column="isColumn"
        :icon-class="iconClass ? iconClass : 'paste'"
        :show-img="showImg"
        :drag-enable="dragEnable"
        :show-label="showLabel"
        :theme-style="themeStyle"
        :title="title ? title : '粘贴'"
        @click="startPaste"
      />
    </div>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import PasteTool from './PasteTool';
import GeneralButton from 'shinegis-client-23d/packages/general-button';
import generalButtonProps from 'shinegis-client-23d/src/mixins/components/general-button-props';

export default {
  name: 'ShPasteTool',
  components: {
    GeneralButton
  },
  mixins: [common, emitter, generalButtonProps],
  props: {
    url: {
      type: String
    },
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '1px',
        left: '420px'
      })
    }
  },
  data() {
    return {
      shouldShow: false
    };
  },
  watch: {
    currentView: {
      handler(val) {
        this.shouldShow = val === 'map';
      },
      immediate: true
    }
  },
  mounted() {
    if (this.$map) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    // 组件逻辑开始入口,如果组件有初始运行逻辑，请在此方法内编写，不要修改此方法名；如果没有可删除此方法。
    begin() {
      // ...
      this.initPaste();
    },
    initPaste() {
      this.PasteTool = new PasteTool(
        this,
        this.$map,
        this.url ? this.url : this.shinegaUrl,
        this.token,
        this.fastApplicationId
      );
    },
    execute() {
      this.PasteTool.startPaste();
    },
    startPaste() {
      this.execute();
    }
  }
};
</script>
