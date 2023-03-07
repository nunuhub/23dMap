<template>
  <div class="sh-map-share">
    <general-container
      :is-show.sync="visible"
      :title="title ? title : '地图分享'"
      :img-src="imgSrc ? imgSrc : 'map-share'"
      :berth="berth"
      :position="position"
      :style-config="styleConfig"
      :theme="theme"
      :drag-enable="dragEnable"
      :theme-style="cardThemeStyle"
      :only-container="onlyContainer"
      :append-to-body="appendToBody"
      @change:isShow="onChangeIsShow"
    >
      <div class="shareUrl">
        <el-input
          ref="urlInput"
          v-model="mapUrl"
          :disabled="urlDisabled"
          placeholder=""
        >
        </el-input>
        <div class="copyUrl" @click="copyUrl">复制地址</div>
        <p>您可以通过以上链接与朋友分享当前地图位置</p>
      </div>
    </general-container>
  </div>
</template>
<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import { Message } from 'element-ui';
import { addParamToUrl } from 'shinegis-client-23d/src/utils/uitls';

export default {
  name: 'ShMapShare',
  components: {
    GeneralContainer
  },
  mixins: [common, emitter, generalCardProps],
  props: {
    params: {
      type: Object,
      default: () => ({})
    },
    //   地图地址
    url: {
      type: String
    }
  },
  data() {
    return {
      mapUrl: '',
      urlDisabled: true
    };
  },
  watch: {
    url: {
      handler() {
        this.getUrl();
      },
      immediate: true
    }
  },
  mounted() {
    if (this.$map || this.$earth) {
      this.getUrl();
    }
  },
  methods: {
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    getUrl() {
      let originUrl = this.url ? this.url : location.href;
      Object.keys(this.params).forEach((ele) => {
        originUrl = addParamToUrl(originUrl, ele, this.params[ele]);
      });
      if (this.currentView === 'map') {
        let [x, y] = this.$map.getView().getCenter();
        let z = this.$map.getView().getZoom();
        this.mapUrl = addParamToUrl(originUrl, 'x', x);
        this.mapUrl = addParamToUrl(this.mapUrl, 'y', y);
        this.mapUrl = addParamToUrl(this.mapUrl, 'z', z);
        this.mapUrl = addParamToUrl(this.mapUrl, 'viewMode', 'map');
      }
      if (this.currentView === 'earth') {
        let { x, y, z, heading, pitch, roll } = this.$earth
          .getViewer()
          .shine.getCameraView();
        this.mapUrl = addParamToUrl(originUrl, 'x', x);
        this.mapUrl = addParamToUrl(this.mapUrl, 'y', y);
        this.mapUrl = addParamToUrl(this.mapUrl, 'z', z);
        this.mapUrl = addParamToUrl(this.mapUrl, 'heading', heading);
        this.mapUrl = addParamToUrl(this.mapUrl, 'pitch', pitch);
        this.mapUrl = addParamToUrl(this.mapUrl, 'roll', roll);
        this.mapUrl = addParamToUrl(this.mapUrl, 'viewMode', 'earth');
      }
    },
    copyUrl() {
      this.urlDisabled = false;
      this.getUrl();
      this.$nextTick(() => {
        let url = this.$refs.urlInput;
        url.select(); // 选择对象
        document.execCommand('Copy'); // 执行浏览器复制命令
        Message.success('复制成功');
        this.urlDisabled = true;
      });
    }
  }
};
</script>
