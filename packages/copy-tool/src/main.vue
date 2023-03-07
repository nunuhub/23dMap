<template>
  <div v-show="shouldShow" class="sh-copy-tool">
    <div v-show="isShow">
      <span v-if="$slots.default" class="geomCopyTool" @click="startCopy">
        <slot></slot>
      </span>
      <general-button
        v-else
        :position="position"
        :is-column="isColumn"
        :icon-class="iconClass ? iconClass : 'copy'"
        :show-img="showImg"
        :show-label="showLabel"
        :theme-style="themeStyle"
        :drag-enable="dragEnable"
        :title="title ? title : '复制'"
        @click="startCopy"
      />
    </div>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import CopyTool from './CopyTool';
import GeneralButton from 'shinegis-client-23d/packages/general-button';
import generalButtonProps from 'shinegis-client-23d/src/mixins/components/general-button-props';

export default {
  name: 'ShCopyTool',
  components: {
    GeneralButton
  },
  mixins: [common, emitter, generalButtonProps],
  props: {
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '1px',
        left: '350px'
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
      this.initCopy();
    },
    initCopy() {
      this.CopyTool = new CopyTool(this.subscribe, this.$map);
    },
    execute() {
      if (this.CopyTool) {
        this.CopyTool.startCopy();
      } else {
        this.CopyTool = new CopyTool(this.subscribe, this.$map);
        this.CopyTool.startCopy();
      }
    },
    startCopy() {
      this.execute();
    },
    clearCopy() {
      if (this.CopyTool) {
        this.CopyTool.clearCopy();
      }
    }
  }
};
</script>
