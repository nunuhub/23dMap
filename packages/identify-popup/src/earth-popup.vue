<template>
  <div v-show="visible" class="sh-earth-popup" :style="{ ...themeVariables }">
    <slot>
      <PopupCard
        :position="bindFeatureValue ? bindPosition : unbindPosition"
        :options="totalData"
        :style-config="styleConfig"
        :theme-style="themeStyle"
        :img-src="imgSrc"
        :bind-feature="bindFeatureValue"
        :stripe="stripe"
        :border="border"
        :bind-mode-button="bindModeButton"
        @change:feature="onChangeFeature"
        @change:connectMode="onConnectModeChange"
        @zoom="onZoom"
        @close="closePopup"
      >
        <slot name="cardExtend"></slot
      ></PopupCard>
    </slot>
  </div>
</template>

<script>
import EarthPopup from 'shinegis-js-api/EarthPopup';
import PopupCard from './popup-card/index.vue';
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import {
  bindPosition,
  unbindPosition,
  styleConfig,
  themeStyle
} from './config';
import { getCenter } from 'ol/extent';
import GeoJSON from 'ol/format/GeoJSON';
import { v4 as uuidv4 } from 'uuid';

const geojsonFormat = new GeoJSON();

export default {
  name: 'ShEarthPopup',
  components: { PopupCard },
  mixins: [commom, emitter],
  props: {
    colorConfig: {
      type: Object
    },
    active: {
      type: Boolean,
      default: false
    },
    identify: {
      type: Object,
      require: true
    },
    bindFeature: {
      type: Boolean,
      default: true
    },
    // 是否为斑马纹 table
    stripe: {
      type: Boolean,
      default: true
    },
    stripeColor: {
      type: Array,
      default: () => ['#696969', '#555e67']
    },
    // 是否带有边框
    border: {
      type: Boolean,
      default: false
    },
    bindModeButton: {
      type: Boolean,
      default: true
    },
    popupCardProps: {
      type: Object
    },
    disabledPopup: {
      type: Boolean,
      default: false
    }
  },
  data() {
    this.bindPosition = bindPosition;
    this.unbindPosition = unbindPosition;
    this.pickedObjects = {};
    return {
      visible: false,
      totalData: [],
      isActive: 0,
      queryId: '',
      bindFeatureValue: this.bindFeature
    };
  },
  computed: {
    imgSrc() {
      return this.popupCardProps?.imgSrc;
    },
    styleConfig() {
      return {
        ...styleConfig,
        ...(this.popupCardProps?.styleConfig || {})
      };
    },
    themeStyle() {
      return {
        light: {
          ...themeStyle.light,
          ...(this.popupCardProps?.themeStyle?.light || {})
        },
        dark: {
          ...themeStyle.dark,
          ...(this.popupCardProps?.themeStyle?.dark || {})
        }
      };
    },
    themeVariables() {
      const variables = {
        '--titleBackgroundColor': this.themeStyle.dark.title.backgroundColor,
        '--titleFontColor': this.themeStyle.dark.title.color,
        '--panelBackgroundColor': this.themeStyle.dark.panel.backgroundColor,
        '--stripeColorFirst': this.stripeColor[0],
        '--stripeColorSecond': this.stripeColor[1]
      };
      return variables;
    }
  },
  watch: {
    active: function (value) {
      !value && this.closePopup();
    },
    queryId: function () {
      !this.$slots.default && this.closePopup();
    },
    bindFeatureValue: function (value) {
      if (value) {
        document
          .getElementById(this.$earth.viewer._container.id)
          .removeChild(this.$el);
        this.createPopup();
      } else {
        this.earthPopup?.destroy();
        this.earthPopup = null;
        document
          .getElementById(this.$earth.viewer._container.id)
          .appendChild(this.$el);
      }
    }
  },
  beforeDestroy() {
    this.closePopup();
    if (this.bindFeatureValue) {
      this.earthPopup?.destroy();
    } else {
      document
        .getElementById(this.$earth.viewer._container.id)
        .removeChild(this.$el);
    }
  },
  mounted() {
    if (this.bindFeatureValue) {
      this.createPopup();
    } else {
      document
        .getElementById(this.$earth.viewer._container.id)
        .appendChild(this.$el);
    }
    this.identify.on('identifyed3d', ({ result, queryId }) => {
      if (this.disabledPopup) return;
      //过滤掉运维端配置的不弹窗数据
      if (result.isPop === false) return;
      if (this.queryId === queryId) {
        if (result.results.length > 0) {
          const data = this.handlePickedObject(result);
          this.totalData.push(data);
        }
      } else {
        this.queryId = queryId;
        this.totalData = [];
        this.pickedObjects = {};
        this.totalData.id = this.queryId;
        if (result.results.length > 0) {
          const data = this.handlePickedObject(result);
          this.totalData.push(data);
        }
      }
    });
  },
  methods: {
    createPopup() {
      this.earthPopup = new EarthPopup(this.$earth, {
        element: this.$el
      });
      let position;
      if (this.curFeature) {
        position = this.getPositionOfFeature(this.curFeature);
      }
      this.earthPopup.setPosition(position);
    },
    onChangeFeature(value) {
      const result = this.remakePickedObject(value);
      this.$emit('change:feature', result);
      this.clearHighLight();
      if (result) {
        this.highLightFeature(result);
      }
    },
    resetPopup(position) {
      this.visible = true;
      this.earthPopup?.setPosition(position);
    },
    /**
     * @param result 查询结果
     * @param resetPopup 是否需要重置弹窗位置
     */
    highLightFeature(result, resetPopup = true) {
      this.identify.highLightFeature(result);
      this.curFeature = result;
      if (resetPopup) {
        const position = this.getPositionOfFeature(result);
        this.resetPopup(position);
      }
    },
    clearHighLight() {
      this.identify.clearHighLight();
      this.curFeature = undefined;
    },
    closePopup() {
      this.visible = false;
      this.clearHighLight();
      this.earthPopup?.setPosition(undefined);
    },
    onConnectModeChange() {
      this.bindFeatureValue = !this.bindFeatureValue;
    },
    onZoom() {
      if (this.curFeature) {
        let position;
        if (this.curFeature.position) {
          position = this.curFeature.position;
        } else {
          const lnglat = getCenter(
            geojsonFormat.readGeometry(this.curFeature.geometry).getExtent()
          );
          lnglat[2] = 1000;
          position = lnglat;
        }

        this.$earth.centerAt({
          center: position,
          heading: 0,
          roll: 0,
          pitch: -90
        });
      }
    },
    getPositionOfFeature(result) {
      let position;
      if (this.curFeature.position) {
        position = result.position;
      } else if (result.geometry) {
        const center = getCenter(
          geojsonFormat.readGeometry(result.geometry).getExtent()
        );
        position = center;
      }

      return position;
    },
    // 处理pickedObject对象，防止进入vue data监听
    handlePickedObject(value) {
      const result = { ...value };
      result.results.forEach((item) => {
        // 如果存在pickedObject对象，则用id替换并记录
        if (item.pickedObject) {
          const id = uuidv4();
          this.pickedObjects[id] = item.pickedObject;
          item.pickedObject = id;
        }
      });
      return result;
    },
    // 重新组装还原pickedObject对象
    remakePickedObject(value) {
      if (value == null) return value;
      const result = { ...value };
      // 如果存在pickedObject对象，则用id替换并记录
      if (result.pickedObject) {
        result.pickedObject = this.pickedObjects[result.pickedObject];
      }
      return result;
    }
  }
};
</script>
