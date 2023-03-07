<template>
  <div v-show="shouldShow" class="sh-save-tool">
    <div v-show="isShow">
      <span v-if="$slots.default" @click="execute">
        <slot></slot>
      </span>
      <general-button
        v-else
        :position="position"
        :is-column="isColumn"
        :icon-class="iconClass ? iconClass : 'save'"
        :show-img="showImg"
        :drag-enable="dragEnable"
        :show-label="showLabel"
        :theme-style="themeStyle"
        :title="title ? title : '保存'"
        @click="execute"
      />
    </div>
  </div>
</template>

<script>
import SaveTool from './SaveTool';
import common from 'shinegis-client-23d/src/mixins/common';
import GeneralButton from 'shinegis-client-23d/packages/general-button';
import generalButtonProps from 'shinegis-client-23d/src/mixins/components/general-button-props';
export default {
  name: 'ShSaveTool',
  components: {
    GeneralButton
  },
  mixins: [common, generalButtonProps],
  props: {
    map: Object,
    url: String,
    adminUrl: String,
    saveOptions: Object,
    isShowEdit: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '1px',
        left: '210px'
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
  mounted() {},
  methods: {
    // 统一对外方法名称
    execute() {
      this.initSave();
    },
    initSave() {
      let SaveWidget = new SaveTool(
        this.$map,
        this.url ? this.url : this.shinegaUrl,
        {
          adminUrl: this.configInstance
            ? this.configInstance.url
            : this.adminUrl,
          token: this.token,
          applicationId: this.fastApplicationId,
          isShowEdit: this.isShowEdit,
          saveOptions: this.saveOptions,
          shinegaInitData: this.shinegaInitData
        }
      );
      SaveWidget.setCallback((features) => {
        this.$emit('saveSuccess', features);
      });
      SaveWidget.init();
    }
  }
};
</script>
<style scoped>
.save {
  border: 0;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  line-height: 23px;
  transition: all 0.3s ease-out;
  width: 48px;
  background: lightgray;
}
</style>
