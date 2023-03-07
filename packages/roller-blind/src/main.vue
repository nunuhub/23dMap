<template>
  <div class="sh-roller-blind">
    <general-container
      ref="container"
      :is-show.sync="visible"
      :title="title ? title : '卷帘'"
      :style-config="cardStyleConfig"
      :class="{ dark: theme === 'dark' }"
      :position="position"
      :berth="berth"
      :theme="theme"
      :img-src="imgSrc ? imgSrc : 'roller-blind'"
      :append-to-body="appendToBody"
      :only-container="onlyContainer"
      :drag-enable="dragEnable"
      :before-close="beforeClose"
      @change:isShow="onChangeIsShow"
    >
      <div>
        <div v-if="isMapMode" class="blindStyle">
          <div>
            <span class="blindStyleSpan">卷帘方式:</span>
            <el-radio-group v-model="direction" size="medium">
              <el-radio label="vertical">纵向 </el-radio>
              <el-radio label="horizontal">横向</el-radio>
              <el-radio label="circle">圆形</el-radio>
            </el-radio-group>
            <el-select
              v-if="direction === 'circle'"
              v-model="circleR"
              size="mini"
            >
              <el-option value="1">1</el-option>
              <el-option value="1.25">1.25</el-option>
              <el-option value="1.5">1.5</el-option>
              <el-option value="2">2</el-option>
              <el-option value="3">3</el-option>
            </el-select>
          </div>
        </div>
      </div>
      <div class="bottomHalf" :style="isOpen ? openStyle : closeStyle">
        <div class="jl_l jl_layer titleStyle">
          卷帘图层:<span class="showIcon" @click="changeOpen"
            ><i v-if="isOpen" class="el-icon-caret-top"></i
            ><i v-else class="el-icon-caret-bottom"></i
          ></span>
        </div>
        <div
          class="content"
          :style="isMapMode ? lightContentStyle : darkContentStyle"
        >
          <div
            v-for="(item, index) in rollerLayer"
            :key="index"
            class="checkWrap"
            style="margin: 5px"
          >
            <el-checkbox
              v-model="showArr"
              :label="item.label"
              @change="check(item)"
            ></el-checkbox>
          </div>
        </div>
      </div>
    </general-container>
  </div>
</template>

<script>
import $ from 'jquery';
import { panelProps } from './propsObj';
import cardDrag from 'shinegis-client-23d/src/directives/card-drag';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import common from 'shinegis-client-23d/src/mixins/common';
import { unByKey } from 'ol/Observable';
import { typeConfig } from './config';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import LayerGroup from 'ol/layer/Group';

export default {
  name: 'ShRollerBlind',
  directives: { cardDrag },
  components: { GeneralContainer },
  mixins: [common, generalCardProps, emitter],
  props: panelProps,
  data() {
    this.mapLayerManager = null;
    this.earthLayerManager = null;
    return {
      showMore: false,
      isOpen: false,
      isMapMode: true, //当前地图页面:true二维,false三维
      preRenderEvtObj: {},
      postRenderEvtObj: {},
      splitPosition: null,
      direction: 'vertical',
      circleR: 1,
      linkMap: [],
      rollerLayer: [],
      layerIds: [],
      layerArr: [],
      showArr: [],
      jldbIds: [], // 卷帘对比选中的图层id
      jldbArr: [],
      openStyle: {
        maxHeight: '190px'
      },
      closeStyle: {
        maxHeight: '25px'
      },
      darkContentStyle: {
        backgroundColor: 'rgba(134, 139, 147, 0.9)'
      },
      lightContentStyle: {
        backgroundColor: 'rgba(233, 239, 248, 0.9)'
      }
    };
  },
  computed: {
    cardStyleConfig() {
      let style = JSON.parse(
        JSON.stringify({
          ...typeConfig,
          ...this.styleConfig
        })
      );
      return style;
    }
  },
  watch: {
    currentView: {
      handler(value) {
        this.isMapMode = value === 'map';
        this.direction = 'vertical';
        this.reload();
        this.clearJldb();
        this.rollerLayer.forEach((item) => {
          if (item.isCheckd) {
            item.isCheckd = !item.isCheckd;
          }
        });
        this.showArr = [];
      },
      immediate: true
    },
    jldbArr(val) {
      if (val.length > 0) {
        // 开启卷帘
        this.$emit('jldbState', true);
      } else {
        // 关闭卷帘
        this.$emit('jldbState', false);
        if (this.$earth) {
          this.$earth.viewer.scene.splitPosition = 0;
        }
      }
      this.reload();
    },
    direction() {
      this.reload();
    }
  },
  mounted() {
    if (this.$map || this.$earth) {
      this.mapLayerManager = this.$map?.layerManager;
      this.earthLayerManager = this.$earth?.viewer.shine.layerManager;
      setTimeout(() => {
        this.begin();
      }, 0);
    }
    this.subscribe.$on('scene-split:clearBlind', (arr) => {
      if (arr.length === 0) {
        this.reload();
        this.clearJldb();
        this.rollerLayer.forEach((item) => {
          if (item.isCheckd) {
            item.isCheckd = !item.isCheckd;
          }
        });
        this.showArr = [];
      }
    });
    this.subscribe.$on('scene-split:linkMapNum', (arr) => {
      this.linkMap = arr;
    });
  },
  beforeDestroy() {
    this.subscribe.$off('scene-split:linkMapNum');
    this.subscribe.$off('scene-split:clearBlind');
  },
  destroyed() {
    $('.sh-base-component #slider').remove();
    this.$map?.getViewport().removeEventListener('mousemove', this._circleClip);
  },

  methods: {
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
      if (value === true) {
        this.jldbArrChange(this.layerArr, this.layerIds);
      }
    },
    begin() {
      if (this.$earth) {
        this.earthLayerManager.on('afterAdd3dLayer', (item) => {
          let lyrInfo = item.layer.config;
          if (lyrInfo.type === '3dtiles') {
            lyrInfo._zIndex = '-1';
          } else {
            lyrInfo._zIndex = this.$earth.viewer.imageryLayers.indexOf(
              item.layer.layer
            );
          }

          this.addLayerEvent(lyrInfo);
        });
        this.earthLayerManager.on('afterRemove3dLayer', (item) => {
          let lyrInfo = item.data;
          this.removeLayerEvent(lyrInfo);
        });
        //解析已加载图层
        this.initBlind();
      } else {
        if (this.$map) {
          this.$map?.layerManager.on('afterAddLayer', (item) => {
            let lyrInfo = item.layer.values_.info;
            lyrInfo._zIndex = item.layer.getZIndex();
            this.addLayerEvent(lyrInfo);
          });
          this.$map?.layerManager.on('afterRemoveLayer', (item) => {
            let lyrInfo = item.layer.values_.info;
            this.removeLayerEvent(lyrInfo);
          });
          //解析已加载图层
          this.initBlind();
        }
      }
    },

    addLayerEvent(lyrInfo) {
      if (lyrInfo.isBaseMapLayer) {
        return;
      }
      this.rollerLayer.push(lyrInfo);
      this.rollerLayer.sort(this.compare);
    },
    removeLayerEvent(lyrInfo) {
      let lyrInfoId = lyrInfo.id;
      let i = 0;
      this.rollerLayer.forEach((item) => {
        if (item.id === lyrInfoId) {
          this.rollerLayer.splice(i, 1);
        } else {
          i++;
        }
      });
      i = 0;
      this.showArr.forEach((item) => {
        if (item.id === lyrInfoId) {
          this.showArr.splice(i - 1, 2);
          return;
        } else {
          i++;
        }
      });
      if (lyrInfo.isCheckd) {
        lyrInfo.isCheckd = !lyrInfo.isCheckd;
      }
      // this.check(lyrInfo);
      //this.jldbDisable(lyrInfoId);//全部卷帘取消
    },
    // 初始化已加载的图层图例
    initBlind() {
      if (this.$map && this.$map.getLayers) {
        let legendLayers = [];
        let layers = this.$map.getLayers().getArray();
        if (layers.length > 0) {
          legendLayers = $.grep(layers, (lyr) => {
            let info = lyr.values_.info;
            return info && info.type;
          });
          // 图层图例
          if (legendLayers.length > 0) {
            legendLayers.forEach((item) => {
              let lyrInfo = item.values_.info;
              let zIndex = item.getZIndex();
              lyrInfo._zIndex = zIndex;
              if (lyrInfo.isBaseMapLayer) {
                return;
              }
              this.rollerLayer.push(lyrInfo);
            });
          }
          // this.$refs.plotLegend.initPlotList()
          this.rollerLayer.sort(this.compare);
        }
      }
    },
    check(item) {
      if (!item.isCheckd) {
        let i = 0;
        this.jldbActive(item);
        this.showArr.forEach((el) => {
          if (el.id === item.id) {
            i++;
          }
        });
        if (i === 0) {
          this.showArr.push(item);
        }
        this.zoomToLayer(item);
        item.isCheckd = !item.isCheckd;
      } else {
        let i = 0;
        this.showArr.forEach((el) => {
          if (item.id === el.id) {
            this.showArr.splice(i, 1);
            return;
          } else {
            i++;
          }
        });
        this.jldbDisable(item.id);
        item.isCheckd = !item.isCheckd;
      }
    },
    jldbActive(data) {
      this.setData();
      this.isMapMode ? this._2D_roller(data) : this._3D_roller(data);
    },
    // 退出卷帘对比
    jldbDisable(id, isClearAll = false) {
      !isClearAll && this.setData();
      this.layerIds.splice(
        this.layerIds.findIndex((item) => item === id),
        1
      );
      this.layerArr = this.layerArr.filter((item) => {
        return item.id !== id;
      });
      let layer;
      layer = this.earthLayerManager.getLayer(id, 'id');
      /*      if (this.viewMode === '3D') {
        layer = this.$earth.viewer.shine.getLayer(id, 'id');
      } else if (this.viewMode === '23D') {
        layer = this.earthLayerManager.getLayer(id, 'id');
      }*/
      //jldbArr变化回调
      !isClearAll && this.jldbArrChange(this.layerArr, this.layerIds);
      let splitReal = layer.layer ? layer.layer : layer.model;
      splitReal.splitDirection = 0;
    },
    //三维卷帘
    _3D_roller(layerData) {
      let layer = {},
        data = layerData ? layerData : this.layerData;
      layer = this.earthLayerManager.getLayer(data.id, 'id');
      if (layer?.layer) {
        layer.layer.splitDirection = 1;
      }
      if (layer?.model) {
        layer.model.splitDirection = 1;
      }
      //图层顺序导致的
      /*      let ImageryLayers =
        this.viewMode === '3D'
          ? this.$earth.viewer.imageryLayers
          : this.earthLayerManager.viewer.imageryLayers;
      ImageryLayers.raiseToTop(layer.layer);*/
      this.layerIds.unshift(data.id);
      this.layerArr.unshift(data);
      //jldbArr变化回调
      this.jldbArrChange(this.layerArr, this.layerIds);
    },

    //二维卷帘
    _2D_roller(layerData) {
      const data = layerData ? layerData : this.layerData;
      this.layerIds.unshift(data.id);
      this.layerArr.unshift(data);
      //jldbArr变化回调
      this.jldbArrChange(this.layerArr, this.layerIds);
    },

    // 退出所有卷帘对比
    clearJldb() {
      if (this.jldbArr.length === 0) return;
      this.setData();
      let arr = JSON.parse(JSON.stringify(this.layerArr));
      for (let i = 0; i < arr.length; i++) {
        this.jldbDisable(arr[i].id, true);
      }
      this.jldbArrChange(this.layerArr, this.layerIds);
    },
    setData() {
      this.layerIds = this.jldbIds;
      this.layerArr = this.jldbArr;
    },
    //jldbArr变化回调
    jldbArrChange(arr, ids) {
      if (this.linkMap.length > 0) {
        this.clearAll_Jldb();
        this._confirm('当前正在执行分屏功能,是否关闭所有分屏?', () => {
          // this.$refs.sceneSplit.removeAllLinkMap();
          this.linkMap = [];
          this.$emit('clearLinkMap', this.linkMap);
          if (arr !== this.jldbArr) {
            this.jldbArr = arr;
            this.jldbIds = ids;
            this.$emit('blind', this.jldbArr);
          }
        });
      } else {
        this.jldbArr = arr;
        this.jldbIds = ids;
        this.$emit('blind', this.jldbArr);
      }
    },
    _confirm(msg, callback) {
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          callback && callback();
        })
        .catch(() => {
          this.rollerLayer.forEach((item) => {
            if (item.isCheckd) {
              item.isCheckd = !item.isCheckd;
            }
          });
          this.showArr = [];
        });
    },
    //清除所有卷帘接口
    clearAll_Jldb(callback) {
      this.jldbArr = [];
      this.jldbIds = [];
      this.$emit('blind', this.jldbArr);
      this.$nextTick(() => {
        callback && callback();
      });
    },

    /**
     * 缩放到图层
     */
    zoomToLayer(data) {
      if (this.viewMode === '2D') {
        this.mapLayerManager.zoomToLayer(data.id);
      } else if (this.viewMode === '23D') {
        if (data.serverOrigin === '3d_server') {
          this.earthLayerManager.zoomToLayer(data);
        } else {
          this.mapLayerManager.zoomToLayer(data.id);
        }
      } else if (this.viewMode === '3D') {
        this.earthLayerManager.zoomToLayer(data);
      }
    },
    //重新加载
    reload() {
      this.clearEvt();
      $('.sh-base-component #slider').remove();
      if (this.direction !== 'circle') {
        this.setSliderListener();
      } else {
        this.$map
          ?.getViewport()
          .addEventListener('mousemove', this._circleClip);
        // window.addEventListener('mousemove', this._circleClip);
        this._2dClip();
      }
    },
    //卷帘事件监听
    setSliderListener() {
      this.$map &&
        this.$map
          .getViewport()
          .removeEventListener('mousemove', this._circleClip);
      if ($('#slider').length < 1 && this.jldbArr.length > 0) {
        //判断是否是横向卷帘(卷帘线垂直)
        const isV = this.direction !== 'vertical' && this.isMapMode;
        const sliderClass = !isV ? 'jldb_slider_V' : 'jldb_slider_H';
        const blockClass = !isV ? 'slider_block_V' : 'slider_block_H';
        const sColor2d = 'background-color: ' + this.sliderColor2d;
        const sColor3d = 'background-color: ' + this.sliderColor3d;
        const sliderColor = this.isMapMode ? sColor2d : sColor3d;
        let slider = $(`<div id='slider' style="${sliderColor}"
                            class=${sliderClass}>
                <div class=${blockClass} style="${sliderColor}"></div>
            </div>"`);
        $('.sh-base-component').append(slider);
        document
          .getElementById('slider')
          .addEventListener('mousedown', this.mouseDown, false);
        window.addEventListener('mouseup', this.mouseUp, false);
        //卷帘线起始位置
        this.setSplitPositon(slider[0]);
      }
      this.isMapMode && this._2dClip();
    },

    mouseDown(e) {
      let slider = document.getElementById('slider');
      if (this.direction !== 'vertical' && this.isMapMode) {
        this.dragStartY = e.clientY - slider.offsetTop;
      } else {
        this.dragStartX = e.clientX - slider.offsetLeft;
      }
      window.addEventListener('mousemove', this.sliderMove, true);
    },
    mouseUp() {
      window.removeEventListener('mousemove', this.sliderMove, true);
    },
    //卷帘线移动事件
    sliderMove(e) {
      let slider = document.getElementById('slider');
      let splitPosition = null;
      if (this.direction !== 'vertical' && this.isMapMode) {
        splitPosition =
          (e.clientY - this.dragStartY) / slider.parentElement.offsetHeight;
        slider.style.top = 100.0 * splitPosition + '%';
      } else {
        splitPosition =
          (e.clientX - this.dragStartX) / slider.parentElement.offsetWidth;
        slider.style.left = 100.0 * splitPosition + '%';
      }
      //设置卷帘线实时位置(包含三维卷帘事件执行)
      this.setSplitPositon(slider, splitPosition);
      //二维卷帘
      this.isMapMode && this.$map?.render();
    },

    //二维canvas 裁剪(卷帘)
    _2dClip() {
      this.clearEvt();
      this.jldbArr.forEach((lry) => {
        const layer = this.mapLayerManager.getLayerById(lry.id);
        this.ctxPrender(layer, lry.id);
      });
    },

    addMask(ctx) {
      if (this.direction === 'circle') {
        ctx.moveTo(0, 0);
        ctx.lineTo(ctx.canvas.width, 0);
        ctx.lineTo(ctx.canvas.width, ctx.canvas.height);
        ctx.lineTo(0, ctx.canvas.height);
        ctx.lineTo(0, 0);
        ctx.fillStyle = this.circleBgColor;
        ctx.fill('evenodd');
      }
    },
    //二维图层canvas裁剪(卷帘)
    ctxPrender(layer, id) {
      if (layer instanceof LayerGroup) {
        let prerenderEvtArray = [];
        let postrenderEvtArray = [];
        for (let item of layer.getLayers().getArray()) {
          let prerenderEvt = item.on('prerender', (event) => {
            this.changeCtx(event);
          });
          prerenderEvtArray.push(prerenderEvt);
          let postrenderEvt = item.on('postrender', (event) => {
            let ctx = event.context;
            ctx.restore();
            this.addMask(ctx);
          });
          postrenderEvtArray.push(postrenderEvt);
        }
        this.preRenderEvtObj[id] = prerenderEvtArray;
        this.postRenderEvtObj[id] = postrenderEvtArray;
      } else {
        let prerenderEvt = layer.on('prerender', (event) => {
          this.changeCtx(event);
        });
        let postrenderEvt = layer.on('postrender', (event) => {
          let ctx = event.context;
          ctx.restore();
          this.addMask(ctx);
        });
        this.preRenderEvtObj[id] = prerenderEvt;
        this.postRenderEvtObj[id] = postrenderEvt;
      }

      this.$map?.render();
    },
    // 触发canvas事件
    changeCtx(event) {
      let ctx = event.context;
      //横向,卷帘线纵向vertical
      if (this.direction === 'vertical') {
        // 左右
        let width = ctx.canvas.width * this.splitPosition;
        ctx.save();
        ctx.beginPath();
        ctx.rect(width, 0, ctx.canvas.width - width, ctx.canvas.height);
      } else if (this.direction === 'horizontal') {
        // 上下
        let height = ctx.canvas.height * this.splitPosition;
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, height, ctx.canvas.width, ctx.canvas.height - height);
      } else {
        ctx.save();
        ctx.beginPath();
        let R = 200 * Number(this.circleR);
        ctx.arc(this.layerX, this.layerY, R, 0, 2 * Math.PI);
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.circleColor;
        ctx.stroke();
      }
      ctx.clip();
    },

    //圆形裁剪
    _circleClip(e) {
      this.layerX = e.offsetX;
      this.layerY = e.offsetY;
      this.$map?.render();
    },

    unByKeySelf(evt) {
      if (evt instanceof Array) {
        for (let item of evt) {
          unByKey(item);
        }
      } else {
        unByKey(evt);
      }
    },
    // 清除二维的卷帘图层
    clearEvt(id = null) {
      if (id) {
        let preEvt = this.preRenderEvtObj[id];
        let postEvt = this.postRenderEvtObj[id];
        this.unByKeySelf(preEvt);
        this.unByKeySelf(postEvt);
        delete this.preRenderEvtObj[id];
        delete this.postRenderEvtObj[id];
      } else {
        for (const key in this.preRenderEvtObj) {
          let preEvt = this.preRenderEvtObj[key];
          let postEvt = this.postRenderEvtObj[key];
          this.unByKeySelf(preEvt);
          this.unByKeySelf(postEvt);
        }
        this.preRenderEvtObj = {};
        this.postRenderEvtObj = {};
      }
      this.$map?.render();
    },
    //设置卷帘线的位置
    setSplitPositon(slider, splitPosition = null) {
      const offsetWidth = slider.offsetLeft / slider.parentElement.offsetWidth;
      const offsetHeight = slider.offsetTop / slider.parentElement.offsetHeight;
      const offset =
        this.direction !== 'vertical' && this.isMapMode
          ? offsetHeight
          : offsetWidth;
      this.splitPosition = splitPosition ? splitPosition : offset;
      if (this.isMapMode) return;
      //执行三维卷帘
      this.$earth.viewer.scene.splitPosition = splitPosition
        ? splitPosition
        : offset;
      /*      if (this.viewMode === '3D') {
        this.$earth.viewer.scene.splitPosition = splitPosition
          ? splitPosition
          : offset;
      } else if (this.viewMode === '23D') {
        this.$earth.viewer.scene.splitPosition = splitPosition
          ? splitPosition
          : offset;
      }*/
    },
    beforeClose() {
      this._clearAll();
      return true;
    },
    _clearAll() {
      $('.sh-base-component #slider').remove();
      this.clearEvt();
      this.clearAll_Jldb();
    },
    changeOpen() {
      this.isOpen = !this.isOpen;
    },
    compare(a, b) {
      if (a._zIndex < b._zIndex) {
        return 1;
      } else if (a._zIndex > b._zIndex) {
        return -1;
      } else {
        return 0;
      }
    }
  }
};
</script>
<style lang="scss">
.jldb_slider_V {
  position: absolute;
  left: 50%;
  top: 0px;
  width: 2px;
  height: 100%;
  z-index: 99;
  user-select: none;
}
.jldb_slider_H {
  position: absolute;
  top: 50%;
  left: 0px;
  width: 100%;
  height: 2px;
  z-index: 99;
  user-select: none;
}

.slider_block_V {
  width: 8px;
  height: 30px;
  position: absolute;
  top: calc(50% - 15px);
  right: -3px;
}
.slider_block_H {
  width: 30px;
  height: 8px;
  position: absolute;
  left: calc(50% - 15px);
  top: -3px;
}

.jldb_slider_H:hover {
  cursor: ns-resize;
}
.jldb_slider_V:hover {
  cursor: ew-resize;
}
</style>
