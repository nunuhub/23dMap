<template>
  <div v-show="visible" class="sh-map-popup" :style="{ ...themeVariables }">
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
        <slot name="cardExtend"></slot>
      </PopupCard>
    </slot>
  </div>
</template>

<script>
import MapPopup from 'shinegis-js-api/MapPopup';
import PopupCard from './popup-card/index.vue';
import GeoJSON from 'ol/format/GeoJSON';
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { getCenter } from 'ol/extent';
import {
  bindPosition,
  unbindPosition,
  styleConfig,
  themeStyle
} from './config';

const geojsonFormat = new GeoJSON();

export default {
  name: 'ShMapPopup',
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
      default: () => ['#FFF', '#fafafa']
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
    this.curFeature;
    this.mapPopup;
    this.bindPosition = bindPosition;
    this.unbindPosition = unbindPosition;
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
        '--titleBackgroundColor': this.themeStyle.light.title.backgroundColor,
        '--titleFontColor': this.themeStyle.light.title.color,
        '--panelBackgroundColor': this.themeStyle.light.panel.backgroundColor,
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
        this.$map.getViewport().parentNode.removeChild(this.$el);
        this.createPopup();
      } else {
        this.$map.removeOverlay(this.mapPopup);
        this.$map.getViewport().parentNode.appendChild(this.$el);
      }
    }
  },
  beforeDestroy() {
    this.closePopup();
    if (this.bindFeatureValue) {
      this.$map.removeOverlay(this.mapPopup);
    } else {
      this.$map.getViewport().parentNode.removeChild(this.$el);
    }
  },
  mounted() {
    if (this.bindFeatureValue) {
      this.createPopup();
    } else {
      this.$map.getViewport().parentNode.appendChild(this.$el);
    }
    this.identify.on('identifyed', ({ result, queryId }) => {
      if (this.disabledPopup) return;
      //过滤掉运维端配置的不弹窗数据
      if (result.isPop === false) return;
      if (this.queryId === queryId) {
        if (result.results.length > 0) {
          this.totalData.push(result);
        }
      } else {
        this.queryId = queryId;
        this.totalData = [];
        this.totalData.id = this.queryId;
        if (result.results.length > 0) {
          this.totalData.push(result);
        }
      }
    });
    // 移除图层时，同时移除该图层的查询结果
    this.$map.layerManager.on('afterRemoveLayer', (e) => {
      const targetIndx = this.totalData.findIndex(
        (item) => item.layerId === e.layer.get('id')
      );
      if (targetIndx > -1) {
        const filterData = this.totalData.filter(
          (item) => item.layerId !== e.layer.get('id')
        );
        this.totalData = filterData;
      }
    });
  },
  methods: {
    onChangeFeature(result) {
      this.$emit('change:feature', result);
      this.clearHighLight();
      result && this.highLightFeature(result);
    },
    clearHighLight() {
      this.identify.clearHighLight();
      this.curFeature = undefined;
    },
    createPopup() {
      this.mapPopup = new MapPopup(this.$map, {
        element: this.$el
      });
      let position;
      if (this.curFeature) {
        const geometry = geojsonFormat.readGeometry(this.curFeature.geometry);
        position = getCenter(geometry.getExtent());
      }
      this.mapPopup.setPosition(position);
    },
    closePopup() {
      this.visible = false;
      this.clearHighLight();
      this.mapPopup?.setPosition(undefined);
    },
    resetPopup(center) {
      this.visible = true;
      if (this.bindFeatureValue) {
        this.$nextTick(() => {
          this.mapPopup.setPosition(center);
        });
      }
    },
    /**
     * @param result 查询结果
     * @param resetPopup 是否需要重置弹窗位置
     */
    highLightFeature(result, resetPopup = true) {
      const { geometry: geojson } = result;
      this.curFeature = result;
      //计当前弹窗的位置
      if (resetPopup) {
        const center = getCenter(
          geojsonFormat.readGeometry(geojson).getExtent()
        );
        this.resetPopup(center);
      }
      // 高亮地块
      this.identify.highLightFeature(result);
    },
    onConnectModeChange() {
      this.bindFeatureValue = !this.bindFeatureValue;
    },
    onZoom() {
      if (this.curFeature) {
        const geometry = geojsonFormat.readGeometry(this.curFeature.geometry);
        if (geometry.getType() === 'Point') {
          const center = geometry.getCoordinates();
          this.$map.centerAt({
            center,
            zoom: this.$map.getView().getMaxZoom() ?? 18
          });
        } else {
          const extent = geometry.getExtent();
          this.$map.setExtent(extent, { padding: [300, 300, 300, 300] });
        }
      }
    }
  }
};
</script>
