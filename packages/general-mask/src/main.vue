<template>
  <div class="sh-general-mask"></div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import getMaskGeoJson from 'shinegis-client-23d/src/map-core/mask';
import GeoJSON from 'ol/format/GeoJSON';
import Mask from 'ol-ext/filter/Mask';
import { Fill } from 'ol/style';
import { Message } from 'element-ui';
import Color from 'color';

export default {
  name: 'ShGeneralMask',
  mixins: [common, emitter],
  props: {
    maskConfig: {
      type: Object
    },
    disable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      options: undefined,
      geoJsonFeature: undefined,
      mask: undefined
    };
  },
  mounted() {
    if (this.$map || this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    // 组件逻辑开始入口,如果组件有初始运行逻辑，请在此方法内编写，不要修改此方法名；如果没有可删除此方法。
    begin() {
      // ...
      if (!this.disable) this.initConfig();
    },
    async initConfig() {
      if (!this.maskConfig) {
        Message.error('请提供掩膜配置信息');
        return;
      }
      this.options = {
        layer: {
          url: this.maskConfig.url,
          visibleLayers: this.maskConfig.layerName,
          selectLayer: this.maskConfig.layerName,
          type: this.maskConfig.type
        },
        where: this.maskConfig.where,
        xzqdm: this.maskConfig.xzqdm,
        token: this.token
      };
      //请求回来的掩膜数据存储在maskFeature中
      this.geoJsonFeature = await this.requestMaskData(
        this.$map.getView().getProjection().getCode(),
        this.options
      );
      if (this.$map) {
        this.remove2DMask();
        this.add2DMask();
      }
      if (this.$earth) {
        this.remove3DMask();
        this.add3DMask();
      }
    },
    //请求掩膜数据
    requestMaskData(epsgCode, options) {
      return new Promise((resolve, reject) => {
        getMaskGeoJson(epsgCode, options).then((geojson) => {
          //添加遮罩，定义掩摸图层
          var maskFeature = geojson;
          maskFeature ? resolve(maskFeature) : reject('请求掩膜数据失败！');
        });
      });
    },
    //添加至2D地图
    add2DMask() {
      if (!this.geoJsonFeature) return;
      let maskFeature = new GeoJSON().readFeature(this.geoJsonFeature);
      var mask = new Mask({
        feature: maskFeature,
        inner: false,
        fill: new Fill({
          color: this.maskConfig.color
            ? this.maskConfig.color
            : [255, 255, 255, 1]
        })
      });
      this.mask = mask;
      this.$map.mask = this.mask;

      this.$map.getLayers().forEach((layer) => {
        if (this.geoJsonFeature !== null) {
          layer.addFilter(this.mask);
        }
      });
    },

    //3D添加掩膜
    add3DMask() {
      if (!this.geoJsonFeature) return;
      //添加遮罩，定义掩摸图层
      let unitObject = Color(this.maskConfig.color).unitObject(); //{r,g,b,alpha}
      this.$earth.viewer.shine.add3DMask(this.geoJsonFeature, unitObject);
    },
    remove2DMask() {
      if (this.mask) {
        this.$map.getLayers().forEach((layer) => {
          layer.removeFilter(this.mask);
        });
        this.$map.mask = undefined;
      }
    },
    remove3DMask() {
      this.$earth.viewer.shine.remove3DMask();
    }
  }
};
</script>
