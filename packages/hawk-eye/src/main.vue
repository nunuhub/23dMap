<template>
  <div class="sh-hawk-eye">
    <div ref="hawkEye" class="hawkEye" :style="hawkEyeStyle"></div>
    <div class="showbtn" :style="showbtnStyle()" @click="show">
      <IconSvg
        height="16px"
        width="16px"
        :theme="themeStyle()"
        :icon-class="selectSvg()"
      />
    </div>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import ShineMap from 'shinegis-client-23d/src/map-core/ShineMap';
import 'ol/ol.css';
import { View } from 'ol';
import { defaults } from 'ol/control';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';

export default {
  name: 'ShHawkEye',
  components: { IconSvg },
  mixins: [common, emitter],
  props: {
    initLayers: {
      type: Array,
      default: () => [
        {
          parent: '1352ea0a-d327-bc06-0dc4-917aae367eb1',
          layerDesc: '图层介绍',
          showIndex: 1396,
          serverOrigin: 'other',
          identifyField: [],
          mapIndex: 1452,
          geotype: 'polygon',
          legendLayers: [],
          label: '电子地图',
          sort: 1508,
          highParamInfo: [],
          type: 'tdt',
          url: 'http://t1.tianditu.com/vec_w/wmts?tk=5f6be52182d36a123d68995e0c8fc8fa',
          visibleLayers: ['vec'],
          parentName: '基础地图',
          layerTag: 'wewerwer',
          selectLayer: 'vec',
          name: '电子地图',
          initChecked: false,
          id: 'f8d3717c-e84d-1f5c-b8af-b17c2f319b5f',
          opacity: 1,
          tp: 'layer',
          group: '1',
          networkType: '',
          wmtsUrl: 'true',
          saveField: '',
          geoStr: '',
          layerTable: '',
          topologyCheck: ''
        }
      ]
    },
    zoomLevel: {
      type: Number,
      default: 3
    }
  },
  data() {
    this.map = null;
    return {
      showMap: true,
      hawkEyeStyle: {},
      hideBtn3d: {
        bottom: '23px',
        left: '10px',
        backgroundColor: '#525E67'
      },
      showBtn3d: {
        bottom: '139px',
        left: '176px',
        backgroundColor: '#525E67'
      },
      hideBtn2d: {
        bottom: '23px',
        left: '10px',
        backgroundColor: 'white'
      },
      showBtn2d: {
        bottom: '139px',
        left: '176px',
        backgroundColor: 'white'
      },
      hideHawkEye: { width: '0', height: '0', border: 'none' },
      showhawkEye: {
        width: '200px',
        height: '150px',
        border: '1px solid #8FDEFF'
      }
    };
  },
  mounted() {
    if (this.$map || this.$earth) {
      this.begin();
    }
  },
  beforeDestroy() {
    this.$map.un('moveend', this.mapChangeZoom);
    this.$map.un('moveend', this.mapChangeCenter);
    this.$map.un('pointerdrag', this.mapChangeCenter);
    this.$earth.viewer.camera.changed.removeEventListener(this.earthChange);
  },
  methods: {
    // 组件逻辑开始入口,如果组件有初始运行逻辑，请在此方法内编写，不要修改此方法名；如果没有可删除此方法。
    begin() {
      let target = this.$refs.hawkEye;
      let view = new View({
        projection: 'EPSG:4490',
        center: [0, 0],
        zoom: 7
      });
      this.map = new ShineMap({
        target: target,
        view: view,
        controls: defaults({
          zoom: false
        })
      });
      this.map.addLayer(this.initLayers[0]);
      if (this.$map) {
        this.$map.on('moveend', this.mapChangeZoom);
        this.$map.on('moveend', this.mapChangeCenter);
        this.$map.on('pointerdrag', this.mapChangeCenter);
      } else if (this.$earth) {
        this.$earth.viewer.camera.changed.addEventListener(this.earthChange);
      }
    },
    show() {
      //显示或隐藏地图
      if (this.showMap) {
        this.showMap = false;
        this.hawkEyeStyle = this.hideHawkEye;
      } else {
        this.showMap = true;
        this.hawkEyeStyle = this.showHawkEye;
      }
    },
    showbtnStyle() {
      if (this.currentView === 'map') {
        if (this.showMap) {
          return this.showBtn2d;
        } else {
          return this.hideBtn2d;
        }
      } else {
        if (this.showMap) {
          return this.showBtn3d;
        } else {
          return this.hideBtn3d;
        }
      }
    },
    selectSvg() {
      if (this.showMap) {
        return 'minimize';
      } else {
        return 'hawk-eye';
      }
    },
    themeStyle() {
      if (this.currentView === 'map') {
        return 'light';
      } else {
        return 'dark';
      }
    },
    mapChangeZoom() {
      //当大地图的缩放级别变化时，小地图的也跟着变
      let zoom = this.$map.getView().getZoom();
      if (zoom >= this.zoomLevel + 1) {
        this.map.getView().setZoom(zoom - this.zoomLevel);
      } else {
        this.map.getView().setZoom(1);
      }
    },
    mapChangeCenter() {
      //使小地图的中心点始终和大地图的一致
      let center = this.$map.getView().getCenter();
      this.map.getView().setCenter(center);
    },
    earthChange() {
      let target = this.$earth.viewer.shine.getCameraView();
      let zoom = this.$earth.viewer.shine.getLevel(target.z);
      let center = [target.x, target.y];
      if (zoom >= this.zoomLevel + 1) {
        this.map.getView().setZoom(zoom - this.zoomLevel);
      } else {
        this.map.getView().setZoom(1);
      }
      this.map.getView().setCenter(center);
    }
  }
};
</script>
