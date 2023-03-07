<!-- eslint-disable vue/no-v-html -->
<template>
  <div class="sh-navigate">
    <general-container
      :is-show.sync="visible"
      :title="title ? title : '行政区导航'"
      :img-src="imgSrc ? imgSrc : 'navigate'"
      :berth="berth"
      :style-config="styleConfig"
      :position="position"
      :theme="theme"
      :theme-style="cardThemeStyle"
      :drag-enable="dragEnable"
      :only-container="onlyContainer"
      :append-to-body="appendToBody"
      @change:isShow="onChangeIsShow"
    >
      <div class="navigatePop" :class="{ dark: theme === 'dark' }">
        <div id="header" class="popHeader">
          <div>
            <span class="dqwz">当前位置:</span>
            <span
              v-for="(item, index) in addressArray"
              :key="index"
              class="addressLink"
              @click="clickAddress(item.xzqdm)"
              ><span v-show="index !== 0" style="color: black">＞</span
              ><strong>{{ item.xzqmc }}</strong></span
            >
          </div>
        </div>
        <div class="divider"></div>
        <div v-if="useSearch" id="searchBox" class="info">
          <input
            ref="inpt"
            v-model="keyWords"
            placeholder="  支持行政区名称/代码"
            class="inp"
            @keyup.enter.prevent="onKeyPosition($event)"
          />
          <div ref="searchbtn" class="searchbtn" @click="querySearch()">
            <i class="el-icon-search"></i>
          </div>
          <div
            v-show="hasSearchResult"
            :class="
              currentView === 'earth' ? 'resultPanel-dark' : 'resultPanel-light'
            "
            :style="'width:' + dynamicWidth + 'px'"
          >
            <div class="results">
              <div
                v-for="(item, index) in pageData"
                :key="index"
                class="searchItems"
                @click="handleSelect(item)"
              >
                <div>
                  <span
                    v-html="
                      hilightKeyWord(
                        item.xzqmc + '  (' + item.xzqdm + ')',
                        keyWords
                      )
                    "
                  ></span>
                </div>
              </div>
            </div>
            <div
              v-show="allSearchResult.length > pageSize"
              style="
                margin: 5px 0px 5px 0px;
                display: flex;
                justify-content: flex-end;
              "
            >
              <el-pagination
                background
                layout="prev, pager, next"
                :pager-count="5"
                :small="true"
                :total="allSearchResult.length"
                :page-size="pageSize"
                @current-change="getSingPageData"
              >
              </el-pagination>
            </div>
          </div>
          <div
            v-show="noSearchResult"
            :class="
              currentView === 'earth' ? 'resultPanel-dark' : 'resultPanel-light'
            "
            :style="'width:' + dynamicWidth + 'px'"
          >
            <div
              style="
                margin-top: 30px;
                margin-bottom: 30px;
                width: 100%;
                text-align: center;
              "
            >
              未找到匹配的结果
            </div>
          </div>
        </div>

        <div
          class="popBody"
          style="padding: 5px 3% 10px 3%; overflow: hidden; font-size: 12px"
        >
          <div
            id="list"
            v-loading="loading"
            class="listbox"
            element-loading-background="rgba(255, 255, 255, 0.2)"
            element-loading-text="加载中"
          >
            <el-alert
              v-show="noData"
              title="无更多数据..."
              type="info"
              close-text=" "
              center
              style="background-color: rgba(255, 255, 255, 0)"
              show-icon
            >
            </el-alert>
            <span
              v-for="(xzq, index) in subXzqList"
              :key="index"
              class="listSpan"
              @click="clickXzqPanle(xzq)"
              >{{ xzq.xzqmc }}</span
            >
          </div>
        </div>
      </div>
    </general-container>
  </div>
</template>
<script>
import cardDrag from 'shinegis-client-23d/src/directives/card-drag';
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill.js';
import 'animate.css';
import { transform } from 'ol/proj';
import { registerProj } from 'shinegis-client-23d/src/map-core/CustomProjection';
import { postFromAdmin } from 'shinegis-client-23d/src/utils/httprequest';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import common from 'shinegis-client-23d/src/mixins/common';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { GeoJsonLayer } from 'shinegis-client-23d/src/earth-core/Layer/GeoJsonLayer27';
import { Message } from 'element-ui';
import { parseResult } from '../../../src/utils/httprequest';
let Map;
export default {
  name: 'ShNavigate',
  components: {
    GeneralContainer: GeneralContainer
  },
  directives: { cardDrag },
  mixins: [common, generalCardProps, emitter],
  props: {
    xzqLayer: {
      type: Object,
      require: true
    },
    initXZQ: {
      type: String,
      require: true
    },
    navigateConfig: {
      type: Object,
      default: () => ({
        time: 10000, // 过多久填充消失
        borderColor: '#fff',
        borderWidth: 5,
        fillColor: 'rgb(255, 255, 0, 0.4)'
      })
    },
    // 是否页面加载时直接定位
    isNeedLoad: {
      type: Boolean,
      default: false
    },
    useSearch: {
      type: Boolean,
      default: true
    },
    maxSearchCount: {
      type: Number,
      default: 50
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      adName: '',
      adDm: '',
      currentWkid: '', // 地图的坐标系
      dataProjection: '', // 用户传入的数据坐标系信息
      showCountry: false,
      initXzqObj: undefined, // 初始行政区对象
      initCode: '',
      initLevel: undefined, // 初始行政区代码
      addressArray: [],
      keyWords: '',
      curXzqObj: '',
      noResult: false,
      shieldWords: ['省', '市', '县', '乡', '镇', '区', '村', '街道'],
      ZXS: ['110000', '120000', '310000', '500000'],
      regNum: /^[0-9]+.?[0-9]*$/,
      regChinese: /.*[\u4e00-\u9fa5]+.*$/,
      regEnglish: /^[a-zA-Z]/,
      regSpace: /\s+/g,
      regCn: /[·！#￥（——）：；“”‘、|《。》？、【】[\]]/im,
      regEn: /[~!@#$%^&*()_+<>?:{}/;[\]]/im,
      allSearchResult: [],
      pageData: [], // 行政区查询结果返回
      noSearchResult: false,
      hasSearchResult: false,
      subXzqList: [], // 子行政区列表
      searchResult: [],
      geomCache: [], // 行政区边界缓存
      xzqdmCacheList: [],
      searchField: '',
      dynamicWidth: 240,
      allCountryObj: {
        xzqmc: '全国',
        xzqdm: ''
      },
      loading: true,
      noData: false,
      last_timetemp: -1, // 三维清除定时器
      clear2d: -1, // 二维清除定时器,
      typeConfig: {
        size: {
          width: '300px'
        }
      },
      currFeature: null
    };
  },
  watch: {
    keyWords: {
      handler(newval) {
        if (this.useSearch) {
          this.$nextTick(() => {
            if (newval === '') this.clear();
          });
        }
      },
      immediate: true
    },
    addressArray: {
      handler(val) {
        if (this.isShow && val.length === 1 && val[0].xzqmc === '全国') {
          this.$emit('navigated', { xzqmc: '全国', xzqdm: '' });
        }
        this.adName = val[val.length - 1]?.xzqmc;
        this.adDm = val[val.length - 1]?.xzqdm;
      },
      immediate: true
    },
    isShow: {
      handler(val) {
        if (val && this.addressArray.length > 0) {
          if (this.addressArray[this.addressArray.length - 1].xzqdm !== '') {
            this.locateXzq(
              this.addressArray[this.addressArray.length - 1].xzqdm
            );
          } else {
            this.$emit(
              'navigated',
              this.addressArray[this.addressArray.length - 1]
            );
          }
        }
      }
    },
    currentView: {
      handler() {
        if (this.currFeature) {
          this.addToMap(this.currFeature);
        }
      },
      immediate: true
    },
    xzqLayer: {
      handler() {
        this.init();
      },
      deep: true
    }
  },
  created() {
    this.geoJSON = new GeoJSON();
  },
  mounted() {
    if (this.$map || this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
      document.addEventListener('click', (e) => {
        if (e && this.noSearchResult) {
          this.noSearchResult = false;
          this.clear();
        }
      });
    }
  },
  destroyed() {
    if (this.viewMode === '3D') {
      this.clearXZQ3d();
    } else {
      this.clearXZQ(true);
    }
  },
  methods: {
    begin() {
      if (this.viewMode === '2D') {
        Map = this.$map;
        this.currentWkid = Map.getView().getProjection().getCode();
      } else if (this.viewMode === '23D') {
        Map = this.$map;
        this.currentWkid = Map.getView().getProjection().getCode();
        // this.$earth.viewer.shine.ol3d.update();
        // this.$earth.viewer.gisdata.config.style.testTerrain = false;
        //console.log('Map', this.$earth.viewer);
      } else {
        Map = this.$earth.viewer.shine;
        this.currentWkid = '4326';
      }
      this.init();
    },
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    async init() {
      if (!this.xzqLayer) {
        console.error('缺少图层对象');
        return;
      }
      if (!this.initXZQ) {
        this.initCode = '';
      }
      this.addressArray = [];
      this.initCode = this.initXZQ;
      this.initLevel = this.judgeLevel(this.initCode);
      if (this.initLevel === '') {
        this.showCountry = true;
        this.addressArray.push(this.allCountryObj);
      } else {
        this.initXzqObj = await this.getProperty(
          this.initCode,
          false,
          this.initLevel
        );
        if (this.initXzqObj && this.initXzqObj.length > 0) {
          this.addressArray.push(this.initXzqObj[0]);
        }
      }
      if (this.ZXS.includes(this.initCode)) {
        let nextCode = parseInt(this.initCode, 0) + 100;
        nextCode = nextCode.toString();
        this.subXzqList = await this.getSubList(nextCode);
      } else {
        this.subXzqList = await this.getSubList(this.initCode);
      }

      if (this.subXzqList.length !== 0) {
        this.loading = false;
      }
      if (this.isShow) this.locateXzq(this.initCode);
    },
    backToAllCountry() {
      this.noData = false;
      this.init();
      //不写this.addressArray.length=0是因为想触发数组变化监听从而发送事件
      for (let i = this.addressArray.length; i > 1; i--) {
        this.addressArray.pop();
      }
      this.viewMode === '3D' ? this.clearXZQ3d() : this.clearXZQ();
    },

    /**
     * @description:  如果用户需要加载页面时就定位至初始行政区，外部即可调用此函数
     * @param {*}
     * @return {*}
     */
    needLoadLoacate() {
      this.locateXzq(this.initCode);
      this.locateXzq(this.initCode);
      Map.layerManager.setDisableFit(true);
    },
    /**
     * @description: 行政区面板中的行政区
     * @param {*} item
     * @return {*}
     */
    handleSelect(item) {
      this.subXzqList = [];
      if (!this.showCountry) {
        this.addressArray = [];
      } else {
        this.addressArray.splice(1, this.addressArray.length - 1);
      }
      this.searchResult.forEach((r) => {
        if (r.includes(item)) {
          r.forEach((p) => {
            this.addressArray.push(p);
          });
        }
      });
      this.clickAddress(item.xzqdm);
      this.hasSearchResult = false;
      this.clear();
    },

    async clickXzqPanle(xzqObj) {
      this.subXzqList = [];
      var level = this.judgeLevel(xzqObj.xzqdm);
      if (
        level >
        this.judgeLevel(this.addressArray[this.addressArray.length - 1].xzqdm)
      ) {
        this.addressArray.push(xzqObj);
      } else {
        this.addressArray.forEach((el, index) => {
          let elLevel = this.judgeLevel(el.xzqdm);
          if (elLevel === level) {
            el = xzqObj;
            for (let i = index + 1; i < this.addressArray.length; i++) {
              this.addressArray.pop();
            }
          }
        });
      }
      // 处理直辖市的问题
      if (this.ZXS.includes(xzqObj.xzqdm)) {
        let nextCode = parseInt(xzqObj.xzqdm, 0) + 100;
        nextCode = nextCode.toString();
        this.subXzqList = await this.getSubList(nextCode);
      } else {
        if (level < 5) {
          this.noData = false;
          this.subXzqList = await this.getSubList(xzqObj.xzqdm);
        } else {
          this.noData = true;
        }
      }
      this.locateXzq(xzqObj.xzqdm);
    },
    async clickAddress(xzqdm) {
      if (xzqdm === '') {
        this.backToAllCountry();
        return;
      }
      this.subXzqList = [];
      var level = this.judgeLevel(xzqdm);
      if (level < 5) {
        this.noData = false;
      }
      if (xzqdm === this.addressArray[0].xzqdm) {
        if (this.ZXS.includes(xzqdm)) {
          let nextCode = parseInt(xzqdm, 0) + 100;
          nextCode = nextCode.toString();
          this.subXzqList = await this.getSubList(nextCode);
        } else {
          this.subXzqList = await this.getSubList(xzqdm);
        }
        this.addressArray.splice(1, this.subXzqList.length - 1);
        if (this.initLevel === 0) {
          this.addressArray.length = 0;
        }
      } else {
        this.addressArray.forEach((xzq, index) => {
          if (this.judgeLevel(xzq.xzqdm) > level) {
            this.addressArray.splice(index, this.addressArray.length - 1);
          }
        });
        if (this.ZXS.includes(xzqdm)) {
          let nextCode = parseInt(xzqdm, 0) + 100;
          nextCode = nextCode.toString();
          this.subXzqList = await this.getSubList(nextCode);
        } else {
          this.subXzqList = await this.getSubList(xzqdm);
        }
      }

      // locating
      this.locateXzq(xzqdm);
    },

    getProperty(code, init, level) {
      return new Promise((resolve, reject) => {
        let param = {
          conditionList: [
            {
              column: 'xzqdm',
              condition: '=',
              isXzqdm: true,
              value: code
            }
          ],
          getColumns: ['xzqdm', 'xzqmc'],
          level: level,
          init: init,
          schemeId: this.configInstance?.params?.schemeId
        };
        postFromAdmin(
          this.xzqLayer.url +
            '/' +
            'getProperties' +
            '/' +
            this.xzqLayer.layerName,
          JSON.stringify(param),
          {
            headers: {
              'Content-Type': 'application/json'
            },
            token: this.token,
            applicationId: this.fastApplicationId
          }
        )
          .then((res) => {
            let result = parseResult(res);
            if (result.success) {
              resolve(result.data);
            } else {
              resolve([]);
              this.noData = true;
            }
          })
          .catch((e) => {
            if (e) reject('请求行政区图形数据失败');
          });
      });
    },
    getGeomtry(xzqdm) {
      return new Promise((resolve, reject) => {
        var level = this.judgeLevel(xzqdm);
        var feature = {};
        var jsonObj = {};
        // 首先在本地图形缓存数组中寻找
        if (this.geomCache.length !== 0) {
          this.xzqdmCacheList = this.geomCache.map(
            (val) => val.properties.xzqdm
          );
        }
        if (this.xzqdmCacheList.includes(xzqdm)) {
          feature = this.geomCache.filter(
            (val) => val.properties.xzqdm === xzqdm
          );
          resolve(this.geoJSON.readFeatures(feature[0]));
        } else {
          let param = {
            conditionList: [
              {
                column: 'xzqdm',
                condition: '=',
                isXzqdm: true,
                value: xzqdm
              }
            ],
            getColumns: ['geom', 'xzqdm', 'xzqmc'],
            level: level
          };
          postFromAdmin(
            this.xzqLayer.url +
              '/' +
              'getGeoJsonByCondition' +
              '/' +
              this.xzqLayer.layerName,
            JSON.stringify(param),
            {
              headers: {
                'Content-Type': 'application/json'
              },
              token: this.token,
              applicationId: this.fastApplicationId
            }
          )
            .then((res) => {
              let result = parseResult(res);
              if (result.success) {
                // 定位业务
                jsonObj = JSON.parse(result.data);
                jsonObj.geometry.crs
                  ? (this.dataProjection = jsonObj.geometry.crs.properties.name)
                  : (this.dataProjection = 'EPSG:4490');
                feature = this.geoJSON.readFeatures(jsonObj);
                resolve(feature);
                // 写入前端图形缓存数组
                if (this.geomCache.length === 0) {
                  this.geomCache.push(jsonObj);
                } else {
                  this.xzqdmCacheList = this.geomCache.map(
                    (val) => val.properties.xzqdm
                  );
                  if (!this.xzqdmCacheList.includes(jsonObj.properties.xzqdm)) {
                    this.geomCache.push(jsonObj);
                  }
                }
              } else {
                reject('获取行政区图形数据失败');
              }
            })
            .catch((e) => {
              if (e) reject('获取行政区图形数据异常');
            });
        }
      });
    },
    async getSubList(xzqdm) {
      var subList = [];
      if (xzqdm !== '') {
        let level = this.judgeLevel(xzqdm);
        subList = await this.getProperty(xzqdm, false, level + 1);
      } else {
        subList = await this.getProperty(xzqdm, true, '');
      }
      return subList;
    },

    async locateXzq(xzqdm) {
      if (!xzqdm) return;
      let feature = await this.getGeomtry(xzqdm);
      if (this.viewMode !== '3D') {
        this.addToMap(feature); // 使用缓存
        if (this.isShow && this.addressArray.length > 0) {
          var finalPlace = this.addressArray[this.addressArray.length - 1];
        }
        let extent = this.vectorSource.getExtent();
        this.$emit('navigated', finalPlace, extent);
      } else {
        this.addToMap3d(feature); // 三维定位逻辑
      }
    },

    addToMap(features) {
      this.currFeature = features;
      if (this.currentView === 'earth') {
        this.addToMap3d(features);
      } else {
        this.clearXZQ();
        if (this.currentWkid === 'EPSG:3857') {
          let options = {
            dataProjection: this.currentWkid,
            featureProjection: 'EPSG:4326'
          };
          let json = new GeoJSON(options).writeFeatures(features);
          features = new GeoJSON().readFeatures(json);
        } else {
          if (this.dataProjection !== this.currentWkid) {
            let options = {
              dataProjection: this.currentWkid,
              featureProjection: this.dataProjection
            };
            let json = new GeoJSON(options).writeFeatures(features);
            features = new GeoJSON().readFeatures(json);
          } else {
            let json = new GeoJSON().writeFeatures(features);
            features = new GeoJSON().readFeatures(json);
          }
        }
        // 初始化图层资源
        if (!this.vectorSource) {
          this.vectorSource = new VectorSource();
        }
        this.vectorSource.addFeatures(features);
        let time = this.navigateConfig.time ? this.navigateConfig.time : 10000;
        let navigateConfig = this.navigateConfig;
        if (!this.vectorLayer) {
          this.vectorLayer = new VectorLayer({
            id: 'xzqNavigateLayer',
            source: this.vectorSource,
            zIndex: 29999,
            style: () => {
              return new Style({
                stroke: new Stroke({
                  // color: "#fff",
                  // width: 5,
                  color: navigateConfig.borderColor
                    ? navigateConfig.borderColor
                    : '#fff',
                  width: navigateConfig.borderWidth
                    ? navigateConfig.borderWidth
                    : 5
                }),
                fill: new Fill({
                  // color: "rgb(255, 255, 0, 0.4)",
                  color: navigateConfig.fillColor
                    ? navigateConfig.fillColor
                    : 'rgb(255, 255, 0, 0.4)'
                })
              });
            }
          });
          // 添加到地图
          Map.addLayer(this.vectorLayer);
        }
        let extent = this.vectorSource.getExtent();
        // if(extent){
        //   Map.getView().fit(extent,{ size: Map.getSize(), duration: 700 });
        //   this.clear2d = setTimeout(() => {
        //     this.clearXZQ();
        //   }, time);
        // }else{
        //   Message.error("无法获取多边形边界范围");
        // }
        if (extent) {
          /* 因为有些数据是投影坐标系，在这里需要提前转化成地理坐标系 */
          if (
            extent[0].toFixed().length > 3 &&
            Map.getView().getProjection().getCode() === 'EPSG:4490'
          ) {
            let pre = [extent[0], extent[1]];
            let suf = [extent[2], extent[3]];
            let newExtent = this.projectionTransform(pre);
            let new_Extent = this.projectionTransform(suf);
            extent = [];
            extent = [...newExtent, ...new_Extent];
          }
          // if (this.currentView === 'earth') {
          //   let width = this.$earth.viewer.canvas.offsetWidth;
          //   let height = this.$earth.viewer.canvas.offsetHeight;
          //   // let size = [width, height];s
          //   let size = [width, height * 0.7];
          //   Map.getView().fit(extent, { size: size, duration: 700 });
          // } else {
          //   Map.getView().fit(extent, { size: Map.getSize(), duration: 700 });
          // }
          Map.getView().fit(extent, { size: Map.getSize(), duration: 700 });
          this.clear2d = setTimeout(() => {
            this.clearXZQ();
            this.currFeature = null;
          }, time);
        } else {
          Message.error('无法获取多边形边界范围');
        }
      }
    },

    /**
     * @description: 清除行政区
     * @param {Boolean} destory
     * @return {*}
     */
    clearXZQ(destory) {
      if (destory) {
        if (this.viewMode !== '3D') {
          let layers = Map.getLayers().getArray();
          layers.forEach((layer) => {
            if (layer.values_.id === 'xzqNavigateLayer') {
              Map.removeLayer(layer);
            }
          });
        } else {
          // 三维
        }
      } else {
        if (this.vectorSource) {
          let features = this.vectorSource.getFeatures();
          features.forEach((item) => {
            this.vectorSource.removeFeature(item);
          });
          // this.vectorSource.clear(true);
          if (this.clear2d !== -1) {
            clearTimeout(this.clear2d);
            this.clear2d = -1;
          }
        }
      }
    },
    addToMap3d(features) {
      this.clearXZQ3d();
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
            color: this.navigateConfig.fillColor || '#ffff0066',
            opacity: 0.4,
            outlineColor: this.navigateConfig.borderColor || '#ffffff',
            outlineWidth: this.navigateConfig.borderWidth || 5,
            clampToGround: true
          }
        }
      };
      this.navLayer = new GeoJsonLayer(config, this.$earth.viewer);
      this.navLayer.queryData();
      // 定时清除
      let time = this.navigateConfig.time || 10;
      this.last_timetemp = setTimeout(() => {
        this.navLayer.remove();
        this.navLayer = null;
        this.currFeature = null;
      }, time);
    },
    clearXZQ3d() {
      if (this.navLayer) {
        this.navLayer.remove();
        clearTimeout(this.last_timetemp);
        this.navLayer = null;
      }
    },
    async querySearch(keywords, callback) {
      if (keywords) {
        this.keyWords = keywords;
      }
      if (this.checkValue(this.keyWords)) {
        if (this.useSearch) {
          this.dynamicWidth =
            this.$refs.inpt.offsetWidth + this.$refs.searchbtn.offsetWidth;
        }
        let options = {};
        options.maxcount = this.maxSearchCount;
        if (
          this.regNum.test(this.keyWords) &&
          !this.regChinese.test(this.keyWords) &&
          !this.regEnglish.test(this.keyWords) &&
          !this.keyWords.includes(',') &&
          !this.keyWords.includes('，')
        ) {
          options.queryField = 'xzqdm';
          this.searchField = 'xzqdm';
        } else {
          options.queryField = 'xzqmc';
          this.searchField = 'xzqmc';
        }
        this.searchResult = await this.getSearchResult(options, this.keyWords);
        if (this.searchResult.length === 0) {
          this.noSearchResult = true;
        } else {
          //过滤掉市一级的直辖市数据，一级地址链中的市级直辖市数据
          this.searchResult.forEach((r, index) => {
            if (this.ZXS.includes(r[0].xzqdm) && r.length === 2) {
              this.searchResult.splice(index, 1);
            }
            if (this.ZXS.includes(r[0].xzqdm) && r.length > 2) {
              r.splice(1, 1);
            }
          });
          this.allSearchResult = this.searchResult.map((a) => a[a.length - 1]);
          if (keywords) {
            callback(this.allSearchResult);
          }
          this.allSearchResult.length > this.pageSize
            ? this.getSingPageData(1)
            : (this.pageData = this.allSearchResult);

          this.hasSearchResult = true;
        }
      } else {
        this.noSearchResult = true;
      }
    },

    /**
     * @description: 坐标系转换
     * @param {Array} coordinate 横纵坐标数组
     * @return {Array} 经纬度数组
     */
    projectionTransform(coordinate) {
      let fileProjectionCode = this.dataProjection;
      registerProj(fileProjectionCode);
      return transform(coordinate, fileProjectionCode, this.currentWkid);
    },
    getSearchResult(options, keywords) {
      var rules = '';
      options.queryField === 'xzqdm'
        ? (rules = { xzqdm: keywords, size: options.maxcount })
        : (rules = { xzqmc: keywords, size: options.maxcount });
      return new Promise((resolve) => {
        postFromAdmin(
          this.xzqLayer.url + '/xzqSearch/' + this.xzqLayer.layerName,
          rules,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            token: this.token,
            applicationId: this.fastApplicationId
          }
        )
          .then((res) => {
            let result = parseResult(res);
            if (result.success) {
              let xzqresult = result.data;
              if (xzqresult.length > options.maxcount) {
                xzqresult.splice(0, options.maxcount);
              }
              xzqresult.length > 0 ? resolve(xzqresult) : resolve([]);
            } else {
              console.error('行政区数据请求异常', result.message);
              resolve([]);
            }
          })
          .catch((e) => {
            if (e) console.error('行政区数据请求异常');
            resolve([]);
          });
      });
    },
    judgeLevel(code) {
      if (typeof code !== 'string') {
        code = code.toString();
      }
      if (
        (code.length === 6 && code.substring(2, 6) === '0000') ||
        code.length === 2
      ) {
        return 1;
      } else if (
        // 市级
        code.length === 6 &&
        code.substring(4, 6) === '00' &&
        (code.substring(2) !== '0' || code.substring(3) !== '0')
      ) {
        return 2;
      } else if (code.length === 4) {
        return 2;
      } else if (code.length === 6 && code.substring(4, 6) !== '00') {
        // 县级
        return 3;
      } else if (
        code.length === 9 ||
        (code.length === 12 && code.substring(9, 12) === '000')
      ) {
        // 街道级
        return 4;
      } else if (code.length >= 12) {
        // 村级
        return 5;
      } else if (code.length === 0) {
        return '';
      } else {
        console.error('初始代码不合法！');
        return;
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
    //键盘事件，按下回车以搜索
    onKeyPosition(e) {
      //window.event ? e.keyCode : e.which
      var keyCode = e.keyCode;
      if (keyCode === 13) {
        //事件逻辑
        this.querySearch();
      }
    },
    clear() {
      if (this.useSearch) {
        this.keyWords = '';
        this.$refs.inpt.focus();
        this.noSearchResult = false;
        this.resultArray = [];
        this.hasSearchResult = false;
      }
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
    getSingPageData(start) {
      this.pageData = this.allSearchResult.filter(
        (r, index) =>
          index >= (start - 1) * this.pageSize &&
          index <= (start - 1) * this.pageSize + this.pageSize - 1
      );
    }
  }
};
</script>
