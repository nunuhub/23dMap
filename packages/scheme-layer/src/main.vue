<template>
  <div class="sh-scheme-layer">
    <general-container
      :is-show.sync="visible"
      :title="title ? title : '图层方案'"
      :img-src="imgSrc ? imgSrc : 'layer-manager'"
      :berth="berth"
      :style-config="styleConfig"
      :position="position"
      :theme="theme"
      :drag-enable="dragEnable"
      :theme-style="cardThemeStyle"
      :only-container="onlyContainer"
      :append-to-body="appendToBody"
      @change:isShow="onChangeIsShow"
    >
      <div class="popBody" :class="{ light: theme === 'light' }">
        <div
          v-for="item in config"
          :key="item.id"
          :class="{ active: item.id === isActive, list_item: true }"
          @click="selectScheme(item.id)"
        >
          <div class="item_t">
            <el-image v-if="item.fileInfo" :src="item.fileInfo" class="elimg">
            </el-image>
            <div
              v-else
              class="default"
              :style="{
                backgroundImage: 'url(' + require('./img/default.png') + ')'
              }"
            ></div>
          </div>
          <div class="item_b">{{ item.name }}</div>
          <div class="icon">
            <icon-svg
              v-if="item.id === isActive"
              icon-class="selected"
              width="20px"
              height="20px"
            ></icon-svg>
            <span v-else class="icon_no"></span>
          </div>
        </div>
      </div>
    </general-container>
  </div>
</template>
<script>
import common from 'shinegis-client-23d/src/mixins/common';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';

export default {
  name: 'ShSchemeLayer',
  components: {
    GeneralContainer,
    IconSvg
  },
  mixins: [common, generalCardProps, emitter],
  props: {
    config: {
      type: Array,
      default: () => []
    },
    defaultScheme: {
      type: String
    }
  },
  data() {
    return {
      isActive: null
    };
  },
  mounted() {
    if (this.$map || this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
    this.subscribe.$once('layer-manager:treeLoaded', () => {
      if (this.defaultScheme) {
        this.selectScheme(this.defaultScheme);
      }
    });
  },
  methods: {
    begin() {
      if (this.viewMode === '3D') {
        this.theme = 'dark';
      } else {
        this.theme = 'light';
      }
    },
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    initTheme(val) {
      this.theme = val;
    },
    // 选中方案
    selectScheme(id) {
      if (this.isActive === id) {
        this.isActive = null;
        this.$emit('selected', []);
      } else {
        this.isActive = id;
        const data = this.config.find((item) => item.id === id);
        this.$emit('selected', data.tocInfoList);
      }
    }
  }
};
</script>
