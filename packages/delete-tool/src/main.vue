<template>
  <div v-show="shouldShow" class="sh-delete-tool">
    <div v-show="isShow">
      <span v-if="$slots.default" @click="execute">
        <slot></slot>
      </span>
      <general-button
        v-else
        :position="position"
        :is-column="isColumn"
        :icon-class="iconClass ? iconClass : 'delete'"
        :show-img="showImg"
        :show-label="showLabel"
        :drag-enable="dragEnable"
        :theme-style="themeStyle"
        :title="title ? title : '删除'"
        @click="execute"
      />
    </div>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import GeneralButton from 'shinegis-client-23d/packages/general-button';
import generalButtonProps from 'shinegis-client-23d/src/mixins/components/general-button-props';
import DeleteTool from './delete-tool';

export default {
  name: 'ShDeleteTool',
  components: {
    GeneralButton
  },
  mixins: [common, generalButtonProps],
  props: {
    url: {
      type: String
    },
    adminUrl: {
      type: String
    },
    deleteOptions: {
      type: Object
    },
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '1px',
        left: '280px'
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
      this.initDelete();
    },
    initDelete() {
      let DeleteWidget = new DeleteTool(
        this.$map,
        this.url ? this.url : this.shinegaUrl,
        this.token,
        this.fastApplicationId,
        this.configInstance ? this.configInstance.url : this.adminUrl,
        this.deleteOptions,
        this.shinegaInitData
      );
      DeleteWidget.setCallback((featureIds, deleteFeatures) => {
        this.$emit('deleteSuccess', featureIds, deleteFeatures);
        this.$map.clearTempFeature();
      });
      DeleteWidget.init();
    }
  }
};
</script>
