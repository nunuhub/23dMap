<template>
  <div class="sh-layer-switcher" :style="{ ...themeVariables }">
    <div
      class="mapType"
      :class="[currentView, { open: open }]"
      :style="{
        width: mapTypeWidth
      }"
      @mouseover="onMouseOver"
      @mouseout="onMouseOut"
    >
      <div
        v-show="!open"
        class="card"
        :style="{
          ...displayCardStyle
        }"
      >
        <img
          class="basic-image"
          :src="displayCardImg"
          :style="{
            background: `url(${require('../../../src/assets/img/layer-switcher/shadow-1.png')})`
          }"
        />
        <span class="label">
          {{ displayCardLabel }}
        </span>
      </div>
      <div
        v-if="viewMode === '23D'"
        class="card model"
        :style="{
          ...modelCardStyle
        }"
        @click="onChnageModel"
      >
        <img
          v-show="!open"
          class="basic-image"
          src="../../../src/assets/img/layer-switcher/shadow-1.png"
        />
        <img v-show="open" class="basic-image" :src="modelImageUrl" />
        <div v-show="open" class="label model" :class="currentView">
          2D
          <img
            class="change"
            src="../../../src/assets/img/layer-switcher/change.png"
          />
          3D
        </div>
      </div>
      <div
        v-for="(item, index) in mapOptionsChildren"
        v-show="cardIsShow('map', index)"
        :key="item.id"
        class="card map"
        :class="{ active: item.id === mapDefaultShow }"
        :style="{
          ...mapTypeCardStyle(index)
        }"
        @click.stop="() => onMapCardClick(item)"
      >
        <img
          v-show="!open"
          class="basic-image"
          :src="mapCardImg(item, index)"
        />
        <img v-show="open" class="basic-image" :src="item.thumbnailUrl" />
        <SubLayerPopover
          v-if="item.id === mapDefaultShow"
          view="map"
          :options="item.children"
          :default-thumbnail="item.thumbnailUrl"
          :current-popover.sync="currentPopover"
          :open="open"
          @popoverMouseOver="onMouseOver"
          @popoverMouseOut="onMouseOut"
          @onChangeCheckedLayer="onChangeCheckedLayer"
        />
        <span v-show="open" class="label">
          {{ item.label }}
        </span>
      </div>
      <div
        v-for="(item, index) in earthOptionsChildren"
        v-show="cardIsShow('earth', index)"
        :key="item.id"
        class="card earth"
        :class="{
          active: item.id === earthDefaultShow
        }"
        :style="{
          ...mapTypeCardStyle(index)
        }"
        @click.stop="() => onEarthCardClick(item)"
      >
        <img
          v-show="!open"
          class="basic-image"
          :src="mapCardImg(item, index)"
        />
        <img v-show="open" class="basic-image" :src="item.thumbnailUrl" />
        <SubLayerPopover
          v-if="item.id === earthDefaultShow"
          :id="item.id"
          view="earth"
          :options="item.children"
          :default-thumbnail="item.thumbnailUrl"
          :current-popover.sync="currentPopover"
          :open="open"
          @popoverMouseOver="onMouseOver"
          @popoverMouseOut="onMouseOut"
          @onChangeCheckedLayer="onChangeCheckedLayer"
        />
        <span v-show="open" class="label">
          {{ item.label }}
        </span>
      </div>
      <div
        v-if="terrainConfig"
        v-show="cardIsShow('earth', earthOptionsChildren.length)"
        class="card earth"
        :class="{
          active: terrainDefaultShow
        }"
        :style="{
          ...mapTypeCardStyle(earthOptionsChildren.length)
        }"
        @click.stop="() => onEarthCardClick(terrainConfig)"
      >
        <img
          v-show="!open"
          class="basic-image"
          :src="mapCardImg(terrainConfig, earthOptionsChildren.length)"
        />
        <img
          v-show="open"
          class="basic-image"
          :src="terrainConfig.thumbnailUrl"
        />
        <TerrainPopover
          v-if="terrainDefaultShow"
          v-show="open"
          :id="terrainConfig.id"
          :options="terrainConfig.children"
          :default-thumbnail="terrainConfig.thumbnailUrl"
          :default-value.sync="defaultTerrain"
          :current-popover.sync="currentPopover"
          :open="open"
          @popoverMouseOver="onMouseOver"
          @popoverMouseOut="onMouseOut"
          @onChangeCheckedLayer="onChangeCheckedLayer"
        />
        <span v-show="open" class="label">
          {{ terrainConfig.label }}
        </span>
      </div>
    </div>
    <Underground v-if="underGround" />
  </div>
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import generalControlProps from 'shinegis-client-23d/src/mixins/components/general-control-props';
import SubLayerPopover from './sublayer-popover.vue';
import TerrainPopover from './terrain-popover.vue';
import Underground from './underground.vue';
import { defaultOptions } from './config';
import { cloneDeep } from 'lodash-es';

export default {
  name: 'ShLayerSwitcher',
  components: { SubLayerPopover, TerrainPopover, Underground },
  mixins: [commom, emitter, generalControlProps],
  props: {
    options: {
      type: Array,
      default: () => defaultOptions
    },
    // 初始加载定位 是否启用默认加载图层的isFit属性  默认启用
    initLoadLocation: {
      type: Boolean,
      default: true
    }
  },
  data() {
    this.closeTimeout = null;
    return {
      open: false,
      configOptions: cloneDeep(this.options),
      mapDefaultShow: '',
      earthDefaultShow: '',
      terrainDefaultShow: '',
      defaultTerrain: '',
      currentPopover: ''
    };
  },
  computed: {
    mapOptions() {
      return this.configOptions.find((ele) => ele.type === 'map');
    },
    mapOptionsChildren() {
      let options = this.mapOptions?.children || [];
      options = options.map((ele) => {
        ele.children = ele.children.map((item, index) => ({
          ...item,
          isBaseMapLayer: true,
          mapIndex: ele.children.length - index - 1
        }));
        return ele;
      });
      return options;
    },
    earthOptions() {
      return this.configOptions.find((ele) => ele.type === 'earth');
    },
    earthOptionsChildren() {
      let options = (this.earthOptions?.children || []).filter(
        (item) => item.type !== 'terrain'
      );
      options = options.map((ele) => {
        ele.children = ele.children.map((item, index) => ({
          ...item,
          isBaseMapLayer: true,
          mapIndex: ele.children.length - index - 1
        }));
        return ele;
      });
      return options;
    },
    terrainConfig() {
      return (this.earthOptions?.children || []).find(
        (item) => item.type === 'terrain'
      );
    },
    underGround() {
      return (
        this.$earth &&
        this.terrainDefaultShow &&
        this.terrainConfig?.underGround
      );
    },
    currentTypes() {
      const currentLength =
        this.currentView === 'map'
          ? this.mapOptionsChildren.length
          : this.earthOptionsChildren.length + (this.terrainConfig ? 1 : 0);
      return currentLength;
    },
    mapTypeWidth() {
      const cards =
        this.viewMode === '23D' ? this.currentTypes + 1 : this.currentTypes;
      return this.open ? cards * (10 + 86) + 10 + 'px' : '110px';
    },
    cardIsShow() {
      return function (type, index) {
        if (this.currentView !== type) {
          return false;
        } else {
          const realIndex = this.viewMode === '23D' ? index + 1 : index;
          let limit =
            this.viewMode === '23D' ? this.currentTypes : this.currentTypes - 1;
          limit = limit > 2 ? 2 : limit;
          const showType = realIndex < limit ? true : false;
          return this.open ? true : showType;
        }
      };
    },
    modelImageUrl() {
      let img =
        this.currentView === 'map'
          ? this.mapOptions?.thumbnailUrl
          : this.earthOptions?.thumbnailUrl;
      if (!img) {
        img = require(`../../../src/assets/img/layer-switcher/${this.currentView}.png`);
      }
      return img;
    },
    displayCardStyle() {
      return {
        zIndex: this.currentTypes + 1,
        right: '5px'
      };
    },
    displayCardImg() {
      const currentMapActive = this.mapOptionsChildren.find(
        (item) => item.id === this.mapDefaultShow
      );
      const currentEarthActive = this.earthOptionsChildren.find(
        (item) => item.id === this.earthDefaultShow
      );
      return this.currentView === 'map'
        ? currentMapActive?.thumbnailUrl
        : currentEarthActive?.thumbnailUrl;
    },
    displayCardLabel() {
      const currentMapActive = this.mapOptionsChildren.find(
        (item) => item.id === this.mapDefaultShow
      );
      const currentEarthActive = this.earthOptionsChildren.find(
        (item) => item.id === this.earthDefaultShow
      );
      return this.currentView === 'map'
        ? currentMapActive?.label
        : currentEarthActive?.label;
    },
    modelCardStyle() {
      return {
        zIndex: this.currentTypes,
        right: this.open ? this.currentTypes * (10 + 86) + 10 + 'px' : '10px'
      };
    },
    mapTypeCardStyle() {
      return function (index) {
        const holder = this.viewMode === '23D' ? 1 : 0;
        return {
          zIndex: this.currentTypes - index - 1,
          right: this.open
            ? (this.currentTypes - index - 1) * (10 + 86) + 10 + 'px'
            : (index + 2 + holder) * 5 + 'px'
        };
      };
    },
    mapCardImg() {
      return (item, index) => {
        const realIndex = this.viewMode === '23D' ? index + 1 : index;
        if (realIndex >= 0 && realIndex < 2) {
          return require(`../../../src/assets/img/layer-switcher/shadow-${
            realIndex + 1
          }.png`);
        } else {
          return item.thumbnailUrl;
        }
      };
    }
  },
  watch: {
    options(value) {
      this.configOptions = cloneDeep(value);
      this.init();
    },
    terrainConfig: {
      handler(value) {
        this.defaultTerrain = value?.children?.find(
          (item) => item.isDefault
        )?.id;
      },
      immediate: true
    }
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      this.mapDefaultShow = this.mapOptions?.defaultShow;
      this.earthDefaultShow = this.earthOptions?.defaultShow;
      this.terrainDefaultShow = this.earthOptions?.terrainDefaultShow;
    },
    onMapCardClick(item) {
      this.mapDefaultShow = item.id;
    },
    onEarthCardClick(item) {
      if (item.type === 'terrain') {
        this.terrainDefaultShow = !this.terrainDefaultShow;
      } else {
        this.earthDefaultShow = item.id;
      }
    },
    onMouseOver() {
      if (this.closeTimeout) {
        clearTimeout(this.closeTimeout);
        this.closeTimeout = null;
      }
      this.open = true;
    },
    onMouseOut() {
      this.closeTimeout = setTimeout(() => {
        this.open = false;
      }, 800);
    },
    onChnageModel() {
      this.$emit('change:view');
    },
    onChangeCheckedLayer(type, layer, target) {
      this.$emit('change:checkedLayer', type, layer, target);
    }
  }
};
</script>
