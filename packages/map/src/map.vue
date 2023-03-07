<template>
  <div
    :id="mapId"
    ref="map"
    class="sh-map"
    :class="{ 'sh-base-component': $isBaseComponent }"
  >
    <div class="sh-map-controls">
      <FullFigure
        v-if="isLoad && getControlIsShow('FullFigure')"
        :options="getControlOption('FullFigure')"
        :init-position="initPosition"
      />
      <Zoom
        v-if="isLoad && getControlIsShow('Zoom')"
        :options="getControlOption('Zoom')"
      />
      <FullScreen
        v-if="isLoad && getControlIsShow('FullScreen')"
        :options="getControlOption('FullScreen')"
      />
    </div>
    <Geolocation
      v-if="isLoad && getControlIsShow('Geolocation')"
      :options="getControlOption('Geolocation')"
    />
    <Rotate
      v-if="isLoad && getControlIsShow('Rotate')"
      :options="getControlOption('Rotate')"
    />
    <ScaleLine
      v-if="isLoad && getControlIsShow('ScaleLine')"
      :options="getControlOption('ScaleLine')"
    />
    <!-- 内嵌组件预留插槽  -->
    <slot v-if="isLoad"></slot>
  </div>
</template>

<script>
import { Vector as VectorSource } from 'ol/source.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { transform } from 'ol/proj';
import ShineMap from 'shinegis-js-api/ShineMap';
import { fromExtent } from 'ol/geom/Polygon';
import LinearRing from 'ol/geom/LinearRing';
import { registerProj } from 'shinegis-client-23d/src/map-core/CustomProjection';
import { get as getProjection } from 'ol/proj';
import { getLabelStyle } from 'shinegis-client-23d/src/map-core/layers/arcgis/label/labelStyleUtils';
import LayerGroup from 'ol/layer/Group';
import Translate from 'ol/interaction/Translate';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import interaction from 'shinegis-client-23d/src/mixins/interaction';
import Geolocation from './controls/geolocation';
import Zoom from './controls/zoom';
import Rotate from './controls/rotate';
import ScaleLine from './controls/scale-line';
import FullScreen from 'shinegis-client-23d/packages/full-screen';
import { v4 as uuidv4 } from 'uuid';
import elementResizeDetectorMaker from 'element-resize-detector';
import FullFigure from 'shinegis-client-23d/packages/full-figure';

export default {
  name: 'ShMap',
  components: {
    Geolocation,
    Zoom,
    Rotate,
    ScaleLine,
    FullScreen,
    FullFigure
  },
  mixins: [emitter, interaction],
  provide() {
    return {
      reactiveViewMode: () => '2D',
      reactiveView: () => 'map',
      reactiveMap: () => this.$map,
      emitterId: this.emitterId
    };
  },
  props: {
    // 地图平移过程中是否使用动画
    animateEnable: {
      type: Boolean,
      default: true
    },
    // 地图是否可通过鼠标滚轮缩放浏览
    mouseWheelZoomEnable: {
      type: Boolean,
      default: true
    },
    // 地图是否可通过双击鼠标放大地图
    doubleClickZoomEnable: {
      type: Boolean,
      default: true
    },
    // 地图是否可通过鼠标拖拽平移
    dragPanEnable: {
      type: Boolean,
      default: true
    },
    // 地图坐标系
    projection: {
      type: String,
      default: 'EPSG:4490'
    },
    // 地图切片方案对应的最大比例尺
    maxScale: {
      type: Number
    },
    minResolution: {
      type: Number
    },
    maxResolution: {
      type: Number
    },
    // 地图中心点
    center: {
      type: Array,
      default: () => {
        return null;
      }
    },
    // 地图缩放层级
    zoom: {
      type: Number,
      default: 5
    },
    minZoom: {
      type: Number,
      default: 0
    },
    maxZoom: {
      type: Number,
      default: 28
    },
    // 缩放时是否为整数zoom
    constrainResolution: {
      type: Boolean,
      default: false
    },
    // 地图控件
    controls: {
      type: Array,
      default: () => [
        'FullFigure',
        'Zoom',
        'Geolocation',
        'Rotate',
        'ScaleLine',
        'FullScreen'
      ]
    },
    // 初始图层定位
    initData: Object,
    // 初始加载图层，主要提供BI使用
    initLayers: {
      type: Array,
      default: () => []
    }
  },
  data() {
    //  地图对象
    this.$map = undefined;
    // 汇总后的总配置信息
    this.$configInfo = {};
    // ??
    this.translateInteractions = [];
    this.mapId = uuidv4();
    return {
      isLocate: false,
      config: null,
      isLoad: false,
      basemapcontrol: false,
      importTestIsShow: true,
      showPosition: true,
      showZoom: true,
      fullscreenControl: null,
      showScale: true,
      maskFeature: null,
      maskGeometry: null
    };
  },
  watch: {
    animateEnable: function (val) {
      this.$map.setStatus({
        animateEnable: val
      });
    },
    mouseWheelZoomEnable: function (val) {
      this.$map.setStatus({
        mouseWheelZoomEnable: val
      });
    },
    doubleClickZoomEnable: function (val) {
      this.$map.setStatus({
        doubleClickZoomEnable: val
      });
    },
    dragPanEnable: function (val) {
      this.$map.setStatus({
        dragPanEnable: val
      });
    },
    center: function (val) {
      this.$map.setCenter(val);
    },
    zoom: function (val) {
      this.$map.setZoom(val);
    }
  },
  beforeCreate() {
    this.$isBaseComponent =
      this.$parent?.$parent?.$options?.name !== 'ShMapEarth';
    this.emitterId = this.$isBaseComponent
      ? uuidv4()
      : this.$parent.$parent.emitterId;
  },
  mounted() {
    if (this.$isBaseComponent) {
      const version = Object.keys(
        require('../../../examples/versions.json')
      ).reverse()[0];
      // eslint-disable-next-line no-console
      console.log('shinegis-client-23d version:', version);
    }
    setTimeout(() => {
      this.initmap();
      // 监听容器大小变化，当变化时触发updateSize
      const erd = elementResizeDetectorMaker();
      erd.listenTo(this.$map.getTargetElement(), () => this.$map.updateSize());
    });
  },
  methods: {
    // 初始化地图
    initmap() {
      const {
        projection,
        center: defaultCenter,
        zoom,
        minZoom,
        maxZoom,
        minResolution,
        maxResolution,
        constrainResolution
      } = this.$props;
      registerProj(projection);
      let baseProjection = getProjection(projection);
      baseProjection.setGlobal(true);

      const center = defaultCenter
        ? defaultCenter
        : transform([111.7579, 31.6736], 'EPSG:4490', projection);

      this.initPosition = {
        center,
        zoom
      };

      this.$map = new ShineMap(this.$refs.map, {
        center,
        zoom,
        projection,
        minZoom,
        maxZoom,
        minResolution,
        maxResolution,
        constrainResolution
      });

      this.$map.setStatus({
        animateEnable: this.animateEnable,
        mouseWheelZoomEnable: this.mouseWheelZoomEnable,
        doubleClickZoomEnable: this.doubleClickZoomEnable,
        dragPanEnable: this.dragPanEnable
      });
      this.createMapEvents();
      this.setLayerLocation();
      this.setInitLayers();
      // 设置绘制图层样式方法 后续考虑是否应该放在draw-tool组件中
      // this.setDrawLayerStyle(this.drawLayerStyle);
      this.$emit('mapInited', this.$map);
      window.shinemap = this.$map;
      this.isLoad = true;
    },
    createMapEvents() {
      Object.keys(this.$listeners).forEach((eventName) => {
        // 只注册有map前缀的事件
        if (eventName.includes('map:')) {
          this.$map.on(eventName.replace('map:', ''), (e) => {
            this.$listeners[eventName].call(this, e);
          });
        }
      });
    },
    /**
     * 初始图层定位功能：若设置此参数，则地图初始化完成后会自动执行该定位功能
     */
    setLayerLocation() {
      if (this.initData) {
        this.$map.layerManager.initData = this.initData;
        const listener = (e) => {
          if (e.layer.get('layerTag') === this.initData.xm) {
            // 移除事件监听
            this.$map.layerManager.un('afterAddLayer', listener);
            const options = {
              tag: this.initData.xm,
              subLayerId: '0',
              isStopFlashHlight: false,
              express: this.initData.whereClause,
              isShow: true
            };
            this.$map.search(options, (isSuccess, result, featureLength) => {
              if (isSuccess) {
                if (featureLength && featureLength > 0) {
                  this.$map.layerManager.setDisableFit(true);
                }
                this.$emit('layerLocationSuccess', result);
              }
            });
          }
        };
        this.$map.layerManager.on('afterAddLayer', listener);
      }
    },
    setInitLayers() {
      for (let i = 0; i < this.initLayers.length; i++) {
        this.$map.layerManager.addCheckedLayers(this.initLayers[i]);
      }
    },
    // 如果传递参数中含有xm以及whereClause,初始加载默认图层并实现定位
    initQuery() {
      const fillColor = this.config.options.drawLayerStyle.fillColor
        ? this.config.options.drawLayerStyle.fillColor
        : 'rgba(255, 255, 255, 0.2)';
      const strokeColor = this.config.options.drawLayerStyle.strokeColor
        ? this.config.options.drawLayerStyle.strokeColor
        : 'rgba(0, 191, 255, 2)';
      var options = {
        tag: this.config.options.initData.xm,
        subLayerId: '0',
        isStopFlashHlight: false,
        express: this.config.options.initData.whereClause,
        isShow: true,
        flashStyle: {
          fillColor: fillColor,
          strokeColor: strokeColor
        }
      };
      this.$map.search(options, (isSuccess, result, featureLength) => {
        if (isSuccess) {
          if (featureLength && featureLength > 0) {
            this.$map.layerManager.setDisableFit(true);
          }
          this.$emit('initQuerySuccess', result);
        }
      });
    },
    setDrawLayerStyle(style) {
      if (style) {
        const drawLayer = this.$map.getLayerById('drawLayer');
        const fillColor = style.fillColor
          ? style.fillColor
          : 'rgba(255, 255, 255, 0.2)';
        const strokeColor = style.strokeColor
          ? style.strokeColor
          : 'rgba(0, 191, 255, 2)';
        const pointColor = style.pointColor ? style.pointColor : '#ffcc33';
        const drawStyle = new Style({
          fill: new Fill({
            color: fillColor
          }),
          stroke: new Stroke({
            color: strokeColor,
            width: 2
          }),
          image: new CircleStyle({
            radius: 7,
            fill: new Fill({
              color: pointColor
            })
          })
        });
        this.$map.drawStyle = drawStyle;
        drawLayer.setStyle(drawStyle);
      }
    },
    /**
     * 获取地图控件是否展示
     * @param name 控件名称
     */
    getControlIsShow(name) {
      const nameList = this.controls.map((control) => {
        if (typeof control === 'object') {
          return control.name;
        }
        return control;
      });
      return nameList.includes(name);
    },
    /**
     * 获取控件配置信息
     * @param name 控件名称
     */
    getControlOption(name) {
      const target = this.controls.find((control) => control.name === name);
      return target ? target.options : null;
    },
    /*
     * 根据layerid加载图层
     * 放在图层目录组件更合适？
     * */
    toggle(layerid, isShow, isZoom) {
      let data = this.$map.layerManager.getLayerDataById(layerid);
      if (!data) {
        data = this.$map.layerManager.getLayerDataByLayerTag(layerid);
      }
      //单个图层
      if (data) {
        data = JSON.parse(JSON.stringify(data));
        // 设置isFit为isZoom,控制是否缩放
        data.isFit = isZoom !== undefined ? isZoom : data.isFit;
        this.$emit('setLayerChecked', data, isShow, null);
      } else {
        //目录
        this.$emit('setLayerChecked', layerid, isShow, null);
      }
    },
    setSynchronous(options) {
      if (options) {
        const action = options.action;
        if (action === 'clear') {
          this.$map.removeAllLinkMap();
        } else if (action === 'add') {
          const layerData = options.data;
          if (layerData && layerData.length > 0) {
            this.addLinkMapArray(layerData, 0);
          }
        }
      }
    },
    /*
     * 新增图层 可以通过layerFilter过滤
     * {layerTag,layerFilter}
     * */
    addTargetLayer(options) {
      const layerid = options.layerTag;
      const filter = options.layerFilter;
      let data = this.$map.layerManager.getLayerDataById(layerid);
      if (!data) {
        data = this.$map.layerManager.getLayerDataByLayerTag(layerid);
      }
      if (data) {
        data.filter = filter;
        data = JSON.parse(JSON.stringify(data));
        // 设置isFit为isZoom,控制是否缩放
        data.isFit = !!options.isZoom;
        this.$emit('setLayerChecked', data, true, null);
      }
    },
    // 擦除操作,产生遮罩范围
    erase(geom) {
      var extent = [-180, -90, 180, 90];
      // eslint-disable-next-line new-cap
      var polygonRing = new fromExtent(extent);
      var coords = geom.getCoordinates();
      coords.forEach((coord) => {
        var linearRing = new LinearRing(coord);
        polygonRing.appendLinearRing(linearRing);
      });
      return polygonRing;
    },
    // 标记图层刷新每个feature样式
    refreshZjById(layerId, style) {
      const layer = this.$map.getLayerById(layerId);
      if (layer instanceof LayerGroup) {
        // layer.zjOptions = style
        const layerArray = layer.getLayers().getArray();
        for (const layerChild of layerArray) {
          const opacity = style && style.opacity ? style.opacity : 100;
          layerChild.setOpacity(opacity / 100);
          const source = layerChild.getSource();
          if (source instanceof VectorSource) {
            const features = layerChild.getSource().getFeatures();
            for (const feature of features) {
              const properties = feature.getProperties();
              let xzqmc = properties.xzqmc
                ? properties.xzqmc
                : properties.XZQMC;
              const name = properties.name ? properties.name : properties.NAME;
              xzqmc = xzqmc || name;
              feature.setStyle(getLabelStyle(style, xzqmc));
            }
          }
        }
      }
    },
    replaceZjInfo(data) {
      this.$map.layerManager.setData(data);
    },
    startTranslateZj(resolve) {
      const layers = this.$map.getLayers().getArray();
      for (const layer of layers) {
        const layerInfo = layer.metadata ? layer.metadata : layer.values_.info;
        if (
          layerInfo &&
          (layerInfo.type === 'feature-zj' || layerInfo.type === 'geoserver-zj')
        ) {
          if (layer instanceof LayerGroup) {
            const translateInteraction = new Translate({
              layers: layer.getLayers().getArray()
            });
            translateInteraction.on('translateend', (f) => {
              const properties = f.features.getArray()[0].values_;
              let xzqmc = properties.xzqmc
                ? properties.xzqmc
                : properties.XZQMC;
              const name = properties.name ? properties.name : properties.NAME;
              xzqmc = xzqmc || name;
              const coordinate = f.coordinate;
              if (!layerInfo.translate) {
                layerInfo.translate = {};
              }
              layerInfo.translate[xzqmc] = coordinate;
              this.replaceZjInfo(layerInfo);
              resolve(layerInfo);
            });
            this.$map.addInteraction(translateInteraction);
            this.translateInteractions.push(translateInteraction);
          }
        }
      }
    },
    stopTranslate() {
      for (const translateInteraction of this.translateInteractions) {
        this.$map.removeInteraction(translateInteraction);
      }
      this.translateInteractions = [];
    }
  }
};
</script>
