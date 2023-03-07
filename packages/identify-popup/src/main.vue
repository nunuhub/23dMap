<template>
  <div class="sh-identify-popup">
    <div v-show="isShow" class="button-container">
      <span v-if="$slots.default" @click="() => toggle()">
        <slot></slot>
      </span>
      <general-button
        v-else
        :is-column="isColumn"
        :position="position"
        :icon-class="iconClass ? iconClass : 'identify-popup'"
        :active="active"
        :show-img="showImg"
        :show-label="showLabel"
        :drag-enable="dragEnable"
        :theme-style="themeStyle"
        :title="title ? title : '查询'"
        @click="() => toggle()"
      />
      <MapPopup
        v-if="ready && (viewMode === '23D' || viewMode === '2D')"
        ref="mapPopup"
        :active="active"
        :identify="identify"
        :color-config="colorConfig"
        :bind-feature="defaultBindFeature"
        :stripe="stripe"
        :border="border"
        :stripe-color="stripeColor.map"
        :bind-mode-button="bindModeButton"
        :popup-card-props="popupCardProps"
        :disabled-popup="disabledPopup"
        @change:feature="onChangeFeature"
      >
        <slot name="mapPopup"></slot>
        <template #cardExtend>
          <slot name="cardExtend"></slot>
        </template>
      </MapPopup>
      <EarthPopup
        v-if="ready && (viewMode === '23D' || viewMode === '3D')"
        ref="earthPopup"
        :active="active"
        :identify="identify"
        :bind-feature="defaultBindFeature"
        :stripe="stripe"
        :border="border"
        :stripe-color="stripeColor.earth"
        :bind-mode-button="bindModeButton"
        :popup-card-props="popupCardProps"
        :disabled-popup="disabledPopup"
        @change:feature="onChangeFeature"
      >
        <slot name="earthPopup"></slot>
      </EarthPopup>
    </div>
    <general-container
      v-if="panelShouldShow"
      :style-config="panelStyleConfig"
      :position="panelPosition"
      theme="light"
      :title="panelTitle ? panelTitle : '查询'"
      :img-src="panelImgSrc ? panelImgSrc : 'identify-popup'"
      style="left: 100px; top: 50px"
      @change:isShow="changeIsShow"
    >
      <el-tabs
        v-model="currentTab"
        type="card"
        :class="['panel-tabs', { 'only-one': panelConfig.length < 2 }]"
      >
        <el-tab-pane label="查询方式" name="type">
          <TypeCard
            v-if="currentTab === 'type'"
            :current-query-type.sync="queryType"
          />
        </el-tab-pane>
        <el-tab-pane label="缓冲区查询" name="buffer">
          <BufferCard
            v-if="currentTab === 'buffer'"
            :identify="identify"
            :current-query-type.sync="queryType"
            :default-buffer-radius="defaultBufferRadius"
          />
        </el-tab-pane>
      </el-tabs>
    </general-container>
  </div>
</template>

<script>
import Identify from 'shinegis-js-api/Identify';
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import GeneralButton from 'shinegis-client-23d/packages/general-button';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import generalButtonProps from 'shinegis-client-23d/src/mixins/components/general-button-props';
import TypeCard from './panel/type-card.vue';
import BufferCard from './panel/buffer-card.vue';

export default {
  name: 'ShIdentifyPopup',
  components: {
    MapPopup: () => import('./map-popup.vue'),
    EarthPopup: () => import('./earth-popup.vue'),
    GeneralButton,
    GeneralContainer,
    TypeCard,
    BufferCard
  },
  mixins: [commom, emitter, generalButtonProps],
  props: {
    // 默认界面是否展示
    isShow: {
      type: Boolean,
      default: true
    },
    bindModeButton: {
      type: Boolean,
      default: true
    },
    // 是否为斑马纹 table
    stripe: {
      type: Boolean,
      default: true
    },
    stripeColor: {
      type: Object,
      default: () => ({
        map: ['#FFF', '#fafafa'],
        earth: ['#696969', '#555e67']
      })
    },
    // 是否带有边框
    border: {
      type: Boolean,
      default: false
    },
    colorConfig: {
      type: Object
    },
    // 功能是否默认打开
    defaultActive: {
      type: Boolean,
      default: false
    },
    //查询方式 "click","polygon","line","box"
    queryMode: {
      type: String,
      default: 'click'
    },
    /**
     * 是否一直保持active状态
     * active状态会被其他互斥交互事件关闭
     * 当isStayActive为true时，当其他互斥交互事件关闭时，i查询组件会恢复原active状态
     */
    isStayActive: {
      type: Boolean,
      default: false
    },
    //当前是否展示 查询面板
    showPanel: {
      type: Boolean,
      default: false
    },
    //查询面板配置
    panelConfig: {
      type: Array,
      default: () => ['type', 'buffer']
    },
    defaultBufferRadius: {
      type: Number,
      default: 100
    },
    panelCardProps: {
      type: Object,
      default: () => {}
    },
    defaultBindFeature: {
      type: Boolean,
      default: true
    },
    popupCardProps: {
      type: Object,
      default: () => {}
    },
    // 强制不弹窗 开启后即使运维端图层配置了可弹窗也不再弹窗
    disabledPopup: {
      type: Boolean,
      default: false
    }
  },
  data() {
    this.identify;
    return {
      ready: false,
      active: false,
      // 是否是被其他互斥事件关闭
      deactivateByOther: false,
      isShowBtn: false, // true时展示btn点btn显示面板,false直接显示面板
      isStartFix: false, // 初始化时Fix状态是否启用
      queryType: this.queryMode ? this.queryMode : 'click',
      currentTab: this.panelConfig[0]
    };
  },
  computed: {
    panelShouldShow() {
      return this.showPanel && this.active && this.currentView === 'map';
    },
    buffPanelShouldShow() {
      return this.buffPanel && this.active && this.currentView === 'map';
    },
    panelStyleConfig() {
      return this.panelCardProps?.styleConfig;
    },
    panelPosition() {
      return (
        this.panelCardProps?.position || {
          type: 'absolute',
          top: '100px',
          right: '135px'
        }
      );
    },
    panelImgSrc() {
      return this.panelCardProps?.imgSrc;
    },
    panelTitle() {
      return this.panelCardProps?.title;
    }
  },
  watch: {
    currentInteraction(name) {
      if (name === '') {
        this.isStayActive && this.deactivateByOther && this.activate();
      } else if (
        name !== this.$options.name &&
        this.queryType !== 'buffer-select'
      ) {
        if (this.active) {
          this.deactivate();
          this.deactivateByOther = true;
        }
      }
    },
    queryType: {
      handler: function (val, oldVal) {
        if (oldVal) {
          this.deactivate();
          this.activate();
        }
      },
      immediate: true
    }
  },
  beforeDestroy() {
    this.deactivate();
  },
  mounted() {
    if (this.$map || this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    begin() {
      this.identify = new Identify(this.$map, this.$earth);
      this.identify.on('change:active', (e) => {
        this.active = e.active;
        this.$emit('change:active', e.active, e.identifyType);
      });
      this.identify.on('identifyed', (e) => {
        this.$emit('identifyed', e);
      });
      this.identify.on('identifyedAll', (e) => {
        this.$emit('identifyedAll', e);
      });
      this.identify.on('identifyedAll3d', (e) => {
        this.$emit('identifyedAll3d', e);
      });
      this.ready = true;
      this.defaultActive && this.activate();
    },
    activate() {
      this.identify?.setActive(true, this.queryType);
    },
    deactivate() {
      this.identify?.setActive(false, this.queryType);
      this.deactivateByOther = false;
    },
    /**
     * 开启或关闭I查询
     */
    toggle(isOpen) {
      let type;
      if (typeof isOpen === 'boolean') {
        type = isOpen;
      } else {
        type = !this.identify.active;
      }
      type ? this.activate() : this.deactivate();
    },
    changeIsShow(value) {
      if (!value) {
        this.deactivate();
      }
    },
    highLightFeature(result) {
      if (this.currentView === 'map') {
        const resetPopup = !!this.$scopedSlots.mapPopup;
        this.$refs.mapPopup.highLightFeature(result, resetPopup);
      } else {
        const resetPopup = !!this.$scopedSlots.earthPopup;
        this.$refs.earthPopup.highLightFeature(result, resetPopup);
      }
    },
    closePopup() {
      if (this.currentView === 'map') {
        this.$refs.mapPopup.closePopup();
      } else {
        this.$refs.earthPopup.closePopup();
      }
    },
    onChangeFeature(result) {
      this.$emit('change:feature', result);
    }
  }
};
</script>
