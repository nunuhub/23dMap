<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="sh-place-search">
    <general-container
      ref="container"
      :is-show.sync="visible"
      :style-config="styleConfig"
      :title="title ? title : '一键搜索'"
      :img-src="imgSrc ? imgSrc : 'place-search'"
      :berth="berth"
      :position="position"
      :theme="theme"
      :drag-enable="dragEnable"
      :only-container="isOnlyContainer"
      overflow="overflow:hidden"
      :theme-style="cardThemeStyle"
      :append-to-body="appendToBody"
      @change:isShow="onChangeIsShow"
    >
      <div>
        <div v-show="showSearchBar" class="searchBar">
          <div class="searchLogo" @click="search">
            <!-- <IconSvg
              :height="20"
              :width="20"
              :theme="theme"
              :icon-class="iconSrc"
            /> -->
            <img :src="imgSrc" class="Img" />
          </div>
          <el-input
            ref="inpt"
            v-model="keyWords"
            placeholder="搜索兴趣点/行政区/经纬度"
            :class="{ dark: currentView === 'earth' }"
            @keyup.enter.native="onKeyPosition($event)"
            @input="input"
          >
            <i
              v-show="keyWords"
              slot="suffix"
              class="el-input__icon el-icon-circle-close searchbtn"
              @click="clear"
            ></i>
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="search"
            ></el-button>
          </el-input>
        </div>
        <div :class="isSearch()">
          <div
            v-show="showResult"
            ref="rightContent"
            v-loading="loading"
            class="resultPanel"
            element-loading-text="搜索中"
          >
            <div
              v-show="isShowResult"
              key="first"
              :class="{ allCount: true, dark: currentView === 'earth' }"
            >
              共
              <span style="color: #007aff"
                ><strong>{{ resultArray.length }}</strong></span
              >条相关结果
            </div>
            <div ref="resultcontainer" style="overflow: hidden">
              <div
                v-for="(item, index) in pageData"
                :id="'item' + item.order"
                :key="item.order"
                class="items"
                :style="{ 'animation-duration': index / 25 + 's' }"
                @click="locate(item)"
              >
                <div>
                  <div
                    class="Icon"
                    :style="{
                      background: 'url(' + backImg + ') no-repeat'
                    }"
                  >
                    <div class="index">{{ item.order + 1 }}</div>
                  </div>
                </div>
                <div
                  v-if="
                    item.from === 'GeoServer' || item.from === 'ArcGISServer'
                  "
                  class="property"
                >
                  <div class="names">
                    <span
                      :title="item.name"
                      v-html="hilightKeyWord(item.name, keyWords)"
                    ></span>
                  </div>
                  <div
                    v-for="(field, inde) in item.fieldArray"
                    :key="inde"
                    class="names"
                  >
                    {{ field.label }}:
                    <span
                      v-html="
                        hilightKeyWord(
                          item.from === 'GeoServer'
                            ? item.properties[field.value] ||
                                '配置字段与服务字段不一致'
                            : item.attributes[field.value] ||
                                '配置字段与服务字段不一致',
                          keyWords
                        )
                      "
                    ></span>
                  </div>
                </div>

                <div
                  v-if="
                    item.from !== 'GeoServer' && item.from !== 'ArcGISServer'
                  "
                  class="property"
                >
                  <div class="topLine">
                    <span
                      :class="isLabel()"
                      :title="item.name"
                      v-html="hilightKeyWord(item.name, keyWords)"
                    ></span>
                    <label
                      v-show="label"
                      class="addressFrom"
                      :style="{ background: item.color }"
                      >&nbsp;{{ item.from }}&nbsp;</label
                    >
                  </div>
                  <div class="address" :title="item.address">
                    地址：<span
                      v-html="hilightKeyWord(item.address, keyWords)"
                    ></span>
                  </div>
                  <!-- <div v-show="label" class="address">
                    来源：
                    <label
                      class="addressFrom"
                      :style="{ background: item.color }"
                      >&nbsp;{{ item.from }}&nbsp;</label
                    >
                  </div> -->
                </div>
              </div>
            </div>
          </div>
          <div
            v-show="isShowResult && resultArray.length > pageSize"
            class="pages"
          >
            <el-pagination
              layout="prev, pager, next"
              :small="true"
              :pager-count="5"
              :total="resultArray.length"
              :page-size="pageSize"
              @current-change="getSingPageData"
            >
            </el-pagination>
          </div>
          <div v-if="noResult" class="noresultpanel">
            <br />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="46"
              height="46"
              fill="currentColor"
              class="bi bi-search"
              viewBox="0 0 16 16"
            >
              <path
                d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
              />
            </svg>
            <br /><br />
            未搜索到该区域，您可以在地图上<span style="color: #007aff"
              >添加注记</span
            >
          </div>
        </div>
      </div>
    </general-container>
    <div v-show="showMark" id="marker" ref="marker" class="sh-place-search">
      <img :src="backImg" />
      <div>{{ currentName }}</div>
    </div>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import cardDrag from 'shinegis-client-23d/src/directives/card-drag';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { lonlatTransfer } from 'shinegis-client-23d/src/utils/common.js';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import SearchEngine from './SearchEngine.js';
import Overlay from 'ol/Overlay';
import GeoJSON from 'ol/format/GeoJSON';
import EsriJSON from 'ol/format/EsriJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import { transformCoordinate } from 'shinegis-client-23d/src/utils/format.js';
import XZQ from 'shinegis-client-23d/src/map-core/xzqService.js';
import { Message } from 'element-ui';
import { Draw } from 'shinegis-client-23d/src/earth-core/Entry57';
import { lonlat2cartesian } from 'shinegis-client-23d/src/earth-core/Tool/Util3';
import { GeoJsonLayer } from 'shinegis-client-23d/src/earth-core/Layer/GeoJsonLayer27';
import { registerProj } from 'shinegis-client-23d/src/map-core/CustomProjection';
import _ from 'lodash-es';
import defaultLogo from './img/zhenshanLogo.png';
// import IconSvg from 'shinegis-client-23d/packages/icon-svg';

let drawTool;
export default {
  name: 'ShPlaceSearch',
  components: {
    GeneralContainer
  },
  directives: { cardDrag },
  mixins: [common, emitter, generalCardProps],
  props: {
    imgSrc: {
      type: String,
      default: defaultLogo
    },
    showSearchBar: {
      type: Boolean,
      default: true
    },
    searchConfig: {
      type: Array,
      default: () => [
        {
          type: 'tdt',
          enable: true,
          maxcount: 50,
          url: 'http://api.tianditu.gov.cn/v2/search?&type=query',
          key: '5f6be52182d36a123d68995e0c8fc8fa'
        }
      ]
    },
    xzqLimit: {
      type: Number
    },
    label: {
      type: Boolean,
      default: false
    },
    searchProjection: {
      type: String,
      default: 'EPSG:4490'
    },
    pageSize: {
      type: Number,
      default: 10
    },
    extent: {
      type: Array
    },
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '34px',
        left: '50px'
      })
    }
  },
  data() {
    return {
      iconSrc: 'place-search',
      isOnlyContainer: true,
      isComponentShow: true,
      loading: false,
      noMore: false,
      showMark: false,
      keyWords: '',
      serviceType: '',
      backImg: require('shinegis-client-23d/src/assets/icon/location.svg'),
      finalConfig: [],
      pageData: [],
      currentName: '',
      mapProjectionCode: undefined,
      noResult: false,
      showtips: true,
      showResult: false,
      shieldWords: ['省', '市', '县', '乡', '镇', '区', '村', '街道'],
      regNum: /^[0-9]+.?[0-9]*$/,
      regChinese: /.*[\u4e00-\u9fa5]+.*$/,
      regEnglish: /^[a-zA-Z]/,
      regSpace: /\s+/g,
      regCn: /[·！#￥（——）：；“”‘、|《。》？、【】[\]]/im,
      regEn: /[~!@#$%^&*()_+<>?:{}/;[\]]/im,
      resultArray: [],
      isShowResult: false,
      searchLayer: null
    };
  },
  computed: {
    shouldShow() {
      if (this.viewMode === '2D') {
        return true;
      } else if (this.viewMode === '3D') {
        return false;
      } else {
        return this.currentView === 'map';
      }
    }
  },
  watch: {
    keyWords: {
      handler(newval) {
        this.$nextTick(() => {
          if (newval === '') this.clear();
        });
      },
      immediate: true
    }
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
      this.mapProjectionCode = this.$map?.getView().getProjection().getCode();
      this.$earth && this.initDraw();
    },
    isSearch() {
      if (this.showResult || this.isShowResult || this.noResult) {
        return 'openDropBottom';
      } else {
        return 'closeDropBottom';
      }
    },
    initDraw() {
      let options = {
        hasPopup: true,
        hasEdit: false,
        horizontalBar: false,
        labelShow: true,
        polygonShow: true,
        polylineShow: true,
        showToolbar: true,
        verticalBar: true,
        name: 'markerLayer1'
      };
      drawTool = new Draw(this.$earth.viewer, options);
    },
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    clear() {
      if (this.showSearchBar) {
        this.keyWords = '';
        this.$refs.inpt.focus();
      }
      this.showMark = false;
      this.removeFeature();
      this.showResult = false;
      this.noMore = false;
      this.pageData.length = 0;
      this.resultArray.length = 0;
      this.noResult = false;
      this.currentName = '';
      this.isShowResult = false;
      this.removeMarker3d();
    },
    hilightKeyWord(name, word) {
      let nameStr = name.toString();
      if (nameStr.includes(word)) {
        let nt = '<span style="color:#EE431C;">' + word + '</span>';
        return nameStr.replace(word, nt) + '&nbsp;';
      } else {
        return nameStr;
      }
    },
    //检测输入内容是否合法
    checkValue() {
      //屏蔽行政区单个关键字
      if (
        this.shieldWords.includes(this.keyWords) &&
        this.keyWords.length === 1
      ) {
        this.noResult = true;
        return false;
      }
      //屏蔽中英文字符标点
      else if (
        this.regCn.test(this.keyWords) ||
        this.regEn.test(this.keyWords)
      ) {
        this.noResult = true;
        return false;
      }
      //确保坐标对中的内容合法，若以逗号分割，则必须是数字
      else if (this.keyWords.includes(',') || this.keyWords.includes('，')) {
        if (
          this.regEnglish.test(this.keyWords) ||
          this.regCn.test(this.keyWords) ||
          this.regEn.test(this.keyWords)
        ) {
          return false;
        } else {
          return true;
        }
      }
      //空格非法
      else if (this.regSpace.test(this.keyWords)) {
        return false;
      } else if (this.keyWords.length === 0) {
        return false;
      } else {
        return true;
      }
    },
    judgeType() {
      if (this.keyWords) {
        //if the keywords is pure number we think it as xzq code
        if (
          this.regNum.test(this.keyWords) &&
          !this.regChinese.test(this.keyWords) &&
          !this.regEnglish.test(this.keyWords) &&
          !this.keyWords.includes(',') &&
          !this.keyWords.includes('，')
        ) {
          this.serviceType = 'xzq';
        } else if (
          this.keyWords.includes(',') ||
          this.keyWords.includes('，')
        ) {
          if (
            !this.regChinese.test(this.keyWords) &&
            !this.regEnglish.test(this.keyWords)
          )
            this.serviceType = 'coordinate';
        } else {
          this.serviceType = 'keywords';
        }
      }
    },
    async searchCore(config, keywords) {
      var xzqdm = this.xzqLimit && this.xzqLimit !== '' ? this.xzqLimit : '';
      var [GAODE, TDT, XZQ, GEO, ARC, BAIDU] = [[], [], [], [], [], []];
      config = config.filter((t) => t.enable === true);
      let typeArray = config.map((t) => t.type);
      // console.log(typeArray)
      let xzq;
      let tdt;
      let gaode;
      let baidu;
      let geo;
      let arcgis;
      let searchXzq;
      let searchTdt;
      let searchGaode;
      let searchBaidu;
      let searchGeo = [];
      let searchArc = [];

      if (typeArray.includes('geoserver')) {
        geo = config.filter((t) => t.type === 'geoserver');
        geo.forEach((item) => {
          if (this.extent) {
            item.map = this.$map;
            item.extent = this.extent;
          }
          searchGeo.push(SearchEngine.getGeoserverData(item, keywords));
        });
      }
      let searchGeoP = Promise.all(searchGeo);

      if (typeArray.includes('arcgis') && this.serviceType === 'keywords') {
        arcgis = config.filter((t) => t.type === 'arcgis');
        arcgis.forEach((item) => {
          if (this.extent) {
            item.map = this.$map;
            item.extent = this.extent;
          }
          searchArc.push(SearchEngine.getArcgisServerData(item, keywords));
        });
      }
      let searchArcP = Promise.all(searchArc);

      if (typeArray.includes('xzq')) {
        xzq = config.filter((t) => t.type === 'xzq');
        this.serviceType === 'xzq'
          ? (xzq[0].queryField = 'xzqdm')
          : (xzq[0].queryField = 'xzqmc');
        xzq[0].token = this.token;
        xzq[0].applicationId = this.fastApplicationId;
        searchXzq = SearchEngine.getXzqData(xzq[0], keywords);
      }

      if (typeArray.includes('tdt') && this.serviceType === 'keywords') {
        tdt = config.filter((t) => t.type === 'tdt');
        tdt[0].xzqdm = xzqdm;
        searchTdt = SearchEngine.getTDTData(tdt[0], keywords);
      }

      if (typeArray.includes('gaode') && this.serviceType === 'keywords') {
        gaode = config.filter((t) => t.type === 'gaode');
        gaode[0].xzqdm = xzqdm;
        searchGaode = SearchEngine.getGaodeData(gaode[0], keywords);
      }

      if (typeArray.includes('baidu') && this.serviceType === 'keywords') {
        baidu = config.filter((t) => t.type === 'baidu');
        baidu[0].xzqdm = xzqdm;
        searchBaidu = SearchEngine.getBaiduData(baidu[0], keywords);
      }

      var [res1, res2, res3, res4, res5, res6] = await Promise.all([
        searchTdt,
        searchGaode,
        searchXzq,
        searchBaidu,
        searchGeoP,
        searchArcP
      ]);

      if (tdt) {
        // TDT = await searchTdt;
        TDT = res1;
      }
      if (gaode) {
        // GAODE = await searchGaode;
        GAODE = res2;
      }
      if (xzq) {
        // XZQ = await searchXzq;
        XZQ = res3;
      }
      if (baidu) {
        // BAIDU = await searchBaidu;
        BAIDU = res4;
      }
      if (geo) {
        res5.forEach((item) => {
          GEO.push(...item);
        });
      }
      if (arcgis) {
        res6.forEach((item) => {
          ARC.push(...item);
        });
      }

      return [...GEO, ...ARC, ...XZQ, ...TDT, ...GAODE, ...BAIDU];
    },

    input: _.debounce(function () {
      this.search();
    }, 500),

    async search(keyWords) {
      // 外部调用
      if (keyWords && typeof keyWords === 'string') {
        this.keyWords = keyWords;
      }
      this.pageData.length = 0;
      this.resultArray.length = 0;
      this.noResult = false;
      this.showResult = false;
      this.currentName = '';
      if (this.checkValue()) {
        this.showResult = true;
        this.loading = true;
        this.judgeType();
        if (this.serviceType === 'coordinate') {
          var coord = [];
          this.loading = false;
          this.showResult = false;
          this.keyWords.includes(',') === true
            ? (coord = this.keyWords.split(','))
            : (coord = this.keyWords.split('，'));
          if (this.keyWords.includes('°')) {
            coord = lonlatTransfer(coord);
          }

          this.locate(coord, false);
        } else {
          if (!this.searchConfig || this.searchConfig.length === 0) {
            Message.error('请提供查询服务配置');
            this.loading = false;
            this.noResult = true;
            this.showResult = false;
            return;
          }
          // console.log(this.searchCore(this.searchConfig, this.keyWords));
          this.searchCore(this.searchConfig, this.keyWords).then((res) => {
            if (res) {
              this.resultArray = res;
              this.loading = false;
              if (this.resultArray.length === 0) {
                this.showResult = false;
                this.noResult = true;
              } else {
                this.showResult = true;
                if (this.resultArray.length > this.pageSize) {
                  this.getSingPageData(1);
                } else {
                  this.resultArray.forEach((r, index) => {
                    r.order = index;
                  });
                  this.pageData = this.resultArray;
                }
                this.isShowResult = true;
              }
            } else {
              this.noResult = true;
            }
          });
        }
      }
    },
    //定位至点击元素
    locate(target) {
      this.currentName = '';
      if (this.serviceType === 'coordinate') {
        this.currentName = target.toString();
        this.locateToPoint_2d(target, false);
      } else if (this.serviceType === 'xzq') {
        this.locateToPolygon_2d(target);
      } else {
        if (target.lonlat) {
          this.currentName = target.name || '';
          if (this.$map) {
            this.locateToPoint_2d(target.lonlat, false);
            this.locateToPoint_3d(target.lonlat);
          } else {
            // 三维点渲染定位
            this.locateToPoint_3d(target.lonlat);
          }
        } else {
          if (this.$map) {
            this.locateToPolygon_2d(target);
          } else {
            this.locateToPolygon_3d(target);
          }
        }
      }
    },
    /**
     * 对外暴露坐标定位
     * @param center
     */
    locatePoint(center) {
      let coord =
        center.includes(',') === true ? center.split(',') : center.split('，');
      if (center.includes('°')) {
        coord = lonlatTransfer(coord);
      }
      this.currentName = coord.toString();
      if (this.$map) {
        this.locateToPoint_2d(coord, false);
      } else {
        // 三维点渲染定位
        this.locateToPoint_3d(coord);
      }
    },
    matchCoordinates(coordinates, feature) {
      coordinates = coordinates.map((c) => parseFloat(c));
      if (this.$map) {
        if (this.mapProjectionCode === 'EPSG:3857') {
          coordinates = transformCoordinate(
            coordinates,
            'EPSG:4326',
            this.mapProjectionCode
          );
        } else {
          /* 只要不是3857投影，就统一把输入坐标转化成地图坐标系 */
          if (
            this.searchProjection &&
            this.searchProjection !== this.mapProjectionCode
          ) {
            coordinates = transformCoordinate(
              coordinates,
              this.searchProjection,
              this.mapProjectionCode
            );
          } else if (
            feature &&
            feature.dataProjection &&
            feature.dataProjection !== this.mapProjectionCode
          ) {
            coordinates = transformCoordinate(
              coordinates,
              feature.dataProjection,
              this.mapProjectionCode
            );
          } else {
            coordinates = this.projectionTransform(
              coordinates,
              this.mapProjectionCode
            );
          }
        }
      } else {
        coordinates = this.projectionTransform(coordinates, 'EPSG:4490');
      }

      if (feature) {
        this.currentName = feature.fieldOnMap || '';
      }

      if (!Array.isArray(coordinates)) {
        typeof coordinates === 'string'
          ? (coordinates = coordinates.split(','))
          : Message.error('坐标格式不合法');
      }
      return coordinates;
    },
    locateToPoint_3d(target, feature) {
      let coordinate = this.matchCoordinates(target, feature);
      if (!this.$earth) return;
      this.removeMarker3d();
      let coordinates = coordinate.map((c) => parseFloat(c));
      let title = this.currentName || '标记';
      var marker_attribute = {
        edittype: 'billboard',
        name: '图标点标记',
        style: {
          image: this.backImg,
          clampToGround: true,
          label: {
            text: title,
            font_size: 18,
            font_family: '黑体',
            font_weight: '900',
            color: '#ffffff',
            border: true,
            border_color: '#000000',
            background: true,
            background_color: 'rgb(85, 94, 103)',
            background_opacity: 0.8,
            pixelOffset: [0, -35], // 偏移量
            clampToGround: true, // 贴地
            visibleDepth: true // 一直显示，不被地形等遮挡
          }
        },
        attr: { id: 'place-search-marker' },
        type: 'billboard'
      };
      let pC3 = lonlat2cartesian(coordinates);
      let entity = drawTool.attributeToEntity(marker_attribute, pC3);
      this.$earth.viewer.flyTo(entity, { duration: 2 });
    },
    locateToPolygon_3d(features) {
      let _features = [];
      for (let i = 0; i < features.length; i++) {
        let obj = {
          type: 'GeoJSON',
          geometry: {
            type: features[i].getGeometry().getType(),
            coordinates: features[i].getGeometry().getCoordinates()
          }
        };
        _features.push(obj);
      }
      let featObj = {
        type: 'FeatureCollection',
        features: _features
      };
      let config = {
        name: 'navigateLayer',
        url: featObj,
        flyTo: true,
        duration: 2,
        symbol: {
          styleOptions: {
            color: '#ffff0066',
            opacity: 0,
            // outlineColor: '#ffffff',
            outlineColor: '#EE431C',
            outlineWidth: 3,
            clampToGround: true
          }
        }
      };
      this.searchLayer = new GeoJsonLayer(config, this.$earth.viewer);
      this.searchLayer.queryData();
    },
    locateToPoint_2d(coordinates, isZoom, feature) {
      let coordinate = this.matchCoordinates(coordinates, feature);
      let view = this.$map.getView();

      this.showMark = true;

      let resolution = isZoom ? null : view.getResolution();
      //minResolution:view.getResolution()如果需要excent不变，也就是视图不放大时打开这个注释
      view.animate({ center: coordinate, resolution: resolution });
      if (!this.markerOverlay) {
        this.markerOverlay = new Overlay({
          positioning: 'center-center',
          element: this.$refs.marker,
          stopEvent: false
        });
      }
      this.markerOverlay.setPosition(coordinate);
      this.$map.addOverlay(this.markerOverlay);
    },
    async locateToPolygon_2d(feature) {
      this.removeFeature();
      var geojsonObject = {};
      if (feature.geometryType === 'Point') {
        feature.from === 'ArcGISServer'
          ? this.locateToPoint_2d(
              [feature.geometry.x, feature.geometry.y],
              false,
              feature
            )
          : this.locateToPoint_2d(feature.geometry.coordinates, false, feature);
      } else {
        if (feature.from === 'ShineGIS') {
          let xzqInstance = new XZQ(feature.url, feature.layerName);
          // geojsonObject = new GeoJSON().readFeatures(
          //   xzqInstance.getGeometry(feature.xzqdm)
          // );
          let geojson = await xzqInstance.getGeometry(feature.xzqdm);
          geojsonObject = new GeoJSON().readFeatures(geojson);
        } else {
          geojsonObject = { ...feature };
        }
        if (geojsonObject) {
          if (feature.from === 'ArcGISServer') {
            geojsonObject = new EsriJSON().readFeatures(geojsonObject);
          } else {
            if (this.mapProjectionCode === 'EPSG:3857') {
              let options = {
                dataProjection: this.mapProjectionCode,
                featureProjection: 'EPSG:4326'
              };
              let json = new GeoJSON(options).writeFeatures(geojsonObject);
              geojsonObject = new GeoJSON().readFeatures(json);
            } else {
              if (this.mapProjectionCode !== feature.dataProjection) {
                let options = {
                  dataProjection: this.mapProjectionCode,
                  featureProjection: feature.dataProjection
                };
                let json = new GeoJSON(options).writeFeatures(geojsonObject);
                geojsonObject = new GeoJSON().readFeatures(json);
              } else {
                if (feature.from === 'GeoServer') {
                  geojsonObject = new GeoJSON().readFeatures(geojsonObject);
                } else {
                  let json = new GeoJSON().writeFeatures(geojsonObject);
                  geojsonObject = new GeoJSON().readFeatures(json);
                }
              }
            }
          }
          var vectorSource = new VectorSource({
            features: geojsonObject
          });

          var vectorLayer = new VectorLayer({
            id: 'xzqSearchLayer',
            source: vectorSource,
            zIndex: 9999,
            style: () => {
              return new Style({
                stroke: new Stroke({ color: '#EE431C', width: 3 }),
                fill: new Fill({ color: 'rgba(255,255,255,0)' })
              });
            }
          });

          //添加到地图
          this.$map.addLayer(vectorLayer);
          // 三维面渲染定位
          this.locateToPolygon_3d(geojsonObject);
        }
        let extent = vectorSource.getExtent();
        this.$map
          .getView()
          .fit(extent, { size: this.$map.getSize(), duration: 600 });
      }
    },
    removeMarker() {
      this.removeOverlay();
      this.removeMarker3d();
    },
    removeOverlay() {
      if (this.markerOverlay) {
        this.$map.removeOverlay(this.markerOverlay);
        this.markerOverlay = null;
      }
    },
    removeFeature() {
      let layers = this.$map?.getLayers()?.getArray();
      layers?.forEach((layer) => {
        if (layer.values_.id === 'xzqSearchLayer') {
          this.$map?.removeLayer(layer);
        }
      });
      this.removeFeature3d();
    },
    removeMarker3d() {
      let marker = drawTool?.getEntityById('place-search-marker');
      if (!marker) return;
      drawTool.deleteEntity(marker);
    },
    removeFeature3d() {
      this.searchLayer?.remove();
      this.searchLayer = null;
    },
    getSingPageData(start) {
      this.pageData = this.resultArray.filter((r, index) => {
        r.order = index;
        return (
          index >= (start - 1) * this.pageSize &&
          index <= (start - 1) * this.pageSize + this.pageSize - 1
        );
      });
    },
    //键盘事件，按下回车以搜索
    onKeyPosition(e) {
      //window.event ? e.keyCode : e.which
      var keyCode = e.keyCode;
      if (keyCode === 13) {
        //事件逻辑
        this.search();
      }
    },
    projectionTransform(coordinate, mapProj) {
      // 源坐标系(文件坐标系) EPSG
      let fileProjectionCode;
      if (coordinate[0] >= -180 && coordinate[0] <= 180) {
        // 经纬度
        fileProjectionCode = 'EPSG:4490';
      } else if (coordinate[0].toFixed().length === 6) {
        // 无带号
        fileProjectionCode = 'EPSG:4549';
      } else if (coordinate[0].toFixed().length === 8) {
        // 有带号
        // 文件中的坐标带号
        let fileDelNo = coordinate[0].toString().substring(0, 2);
        fileProjectionCode = 'EPSG:' + (4488 + Number(fileDelNo));
      }
      try {
        registerProj(fileProjectionCode);
        return transformCoordinate(coordinate, fileProjectionCode, mapProj);
      } catch (e) {
        console.warn('坐标系' + fileProjectionCode + '暂不支持定位');
        console.error(e);
      }
    },
    isLabel() {
      if (this.label) {
        return 'names';
      } else {
        return 'onlyNames';
      }
    }
  }
};
</script>
