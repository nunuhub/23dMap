<!-- eslint-disable vue/no-v-html -->
<template>
  <div>
    <div class="out-wide">
      <div v-if="annoData.layertype === 'panelLayer'">
        <div v-if="annoData.title_txt" :style="headStyle">
          <slot name="head"></slot>
          <div v-if="annoData.title_txt" :style="trangleStyle"></div>
        </div>
        <div v-if="annoData.content_txt" :style="bodyStyle">
          <slot name="body"></slot>
          <div v-if="annoData.content_txt" :style="trangleStyle"></div>
        </div>
      </div>
      <div v-else>
        <div v-if="annoData.onTop" :style="defaultStyle">
          <div v-if="annoData.content_txt" :style="bodyStyle">
            <slot name="body"></slot>
          </div>
          <div v-if="annoData.title_txt" v-html="annoData.title_txt">
            <slot name="head"></slot>
          </div>
        </div>
        <div v-if="!annoData.onTop" :style="defaultStyle">
          <div v-if="annoData.title_txt" v-html="annoData.title_txt">
            <slot name="head"></slot>
          </div>
          <div v-if="annoData.content_txt" :style="bodyStyle">
            <slot name="body"></slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import Overlay from 'ol/Overlay';
import { DivPoint } from 'shinegis-client-23d/src/earth-core/Tool/DivPoint105';
import { lonlat2cartesian } from 'shinegis-client-23d/src/earth-core/Tool/Util3';
import { setPositionsHeight } from 'shinegis-client-23d/src/earth-core/Tool/Point2';

import html2canvas from 'html2canvas';
export default {
  name: 'AnnoDom',
  mixins: [common, emitter],
  props: {
    annoData: {
      type: Object
    },
    roundStyle: {
      type: Object
    },
    bubbleStyle: {
      type: Object
    },
    drawTool: {
      type: Object
    },
    currentLayer: {
      type: Object
    }
  },
  data() {
    return {
      headStyle: {},
      bodyStyle: {},
      zoom: 0,
      defaultStyle:
        'display:flex;flex-direction: column;justify-content:center;align-items:center;text-align:center;'
    };
  },
  watch: {
    annoData: {
      handler() {
        this.render();
      },
      immediate: false
    },
    currentView: {
      handler() {
        this.render();
      },
      immediate: false
    }
  },
  created() {
    this.zoom = this.$map.getView().getZoom();
    let theme = this.annoData.theme;
    this.headStyle = {
      background: theme.title_bgcolor,
      color: theme.title_txt_color,
      width: theme.title_bgwidth + 'px',
      height: theme.title_bgheight + 'px',
      fontSize: theme.title_txt_size + 'px',
      overflow: 'hidden',
      'white-space': 'nowrap',
      'text-overflow': 'ellipsis'
    };
    this.bodyStyle = {
      background: theme.content_bgcolor,
      color: theme.content_txt_color,
      width: theme.content_bgwidth + 'px',
      height: theme.content_bgheight + 'px',
      fontSize: theme.content_txt_size + 'px'
    };
    this.trangleStyle = {
      position: 'absolute',
      left: '30px',
      bottom: '-25px',
      width: 0,
      height: 0,
      'border-width': '14px',
      'border-style': 'solid',
      'border-color': 'transparent',
      'margin-bottom': '-5px',
      'border-top-width': '16px',
      'border-top-color': this.annoData.content_txt
        ? this.annoData.theme.content_bgcolor
        : this.annoData.theme.title_bgcolor,
      color: this.annoData.content_txt
        ? this.annoData.theme.content_bgcolor
        : this.annoData.theme.title_bgcolor
    };

    if (this.annoData.content_txt && !this.annoData.title_txt) {
      //面板启用圆角样式
      if (this.roundStyle) {
        this.bodyStyle['border-radius'] = this.roundStyle.size || '8px';
      }
      if (this.bubbleStyle) {
        //..todo
      }
    } else if (this.annoData.title_txt && !this.annoData.content_txt) {
      //面板启用圆角样式
      if (this.roundStyle) {
        this.headStyle['border-radius'] = this.roundStyle.size || '8px';
      }
    } else if (this.annoData.title_txt && this.annoData.content_txt) {
      //面板启用圆角样式
      if (this.roundStyle) {
        this.headStyle['border-top-left-radius'] =
          this.roundStyle.size || '8px';
        this.headStyle['border-top-right-radius'] =
          this.roundStyle.size || '8px';
        this.bodyStyle['border-bottom-left-radius'] =
          this.roundStyle.size || '8px';
        this.bodyStyle['border-bottom-right-radius'] =
          this.roundStyle.size || '8px';
      }
    }
  },
  mounted() {
    // this.render_2D();
    this.listenMapZoom();
    // this.render_3D();
    this.render();
  },
  methods: {
    render() {
      if (this.currentView !== 'earth') {
        this.render_2D();
      } else {
        this.render_3D();
      }
    },
    render_2D() {
      this.$map.getViewport().appendChild(this.$el);
      var position = [];
      position.push(parseFloat(this.annoData.position.x));
      position.push(parseFloat(this.annoData.position.y));
      var marker = new Overlay({
        id: this.annoData.id,
        layerID: this.annoData.layerID,
        positioning: 'center-center',
        element: this.$el
      });
      marker.setPosition(position);
      this.$map.addOverlay(marker);
    },
    render_3D() {
      let opts = { ...this.annoData };
      let layerInfo = opts.layer || this.currentLayer;
      let positionC3 = lonlat2cartesian([
        Number(opts.position.x),
        Number(opts.position.y),
        Number(opts.position.z)
      ]);
      let entity;
      if (!layerInfo.styleOptions) return;
      let position2 = setPositionsHeight(positionC3, opts.z2 || 0);
      let line_attribute = {
        edittype: 'polyline',
        name: '线',
        config: { minPointNum: 2, maxPointNum: 2 },
        style: {
          lineType: 'dash',
          color: '#fff',
          width: 4,
          clampToGround: false,
          outline: false,
          outlineColor: '#ffffff',
          outlineWidth: 2,
          opacity: 1,
          zIndex: 0
        },
        type: 'polyline'
      };
      let guide = this.drawTool.attributeToEntity(line_attribute, [
        positionC3,
        position2
      ]);
      guide.editing = undefined;
      let styleOptions = layerInfo.styleOptions;
      let config = styleOptions.config;
      switch (layerInfo.layerType) {
        case 'panelLayer':
          var divOpts = {
            position: positionC3,
            id: opts.id,
            html: this.$el,
            // dom偏移
            // anchor: opts.dom_config.isCenterDefault ? false : [offsetX, offsetY],
            // 按距离缩放比例
            scaleByDistance: config.scaleByDistance
              ? {
                  near: config.scaleByDistance_near,
                  nearValue: config.scaleByDistance_nearValue,
                  far: config.scaleByDistance_far,
                  farValue: config.scaleByDistance_farValue
                }
              : false,
            // 按视距距离显示
            visibleDistanceMin: config.distanceDisplayCondition_near,
            visibleDistanceMax: config.distanceDisplayCondition_far
          };
          entity = new DivPoint(this.$earth.viewer, divOpts);
          var attr = {
            id: opts.id,
            title_txt: opts.title_txt,
            content_txt: opts.content_txt
          };
          this.drawTool.updateAttribute({ ...line_attribute, attr }, guide);
          break;
        case 'iconLayer':
          var box = this.strToDom(this.$el.innerHTML);
          this.divToCanvas(box).then((canvas) => {
            var icon_attribute = {
              edittype: 'billboard',
              name: '图标点标记',
              style: {
                visibleDepth: true,
                image: canvas,
                ...config
              },
              type: 'billboard',
              attr: {
                id: opts.id,
                title_txt: opts.title_txt,
                content_txt: opts.content_txt
              }
            };
            entity = this.drawTool.attributeToEntity(
              icon_attribute,
              positionC3
            );
            entity.guide = guide;
            setTimeout(() => {
              document
                .getElementById(this.$earth.viewer._container.id)
                .removeChild(box);
            });
          });
          break;
        case 'moduleLayer':
          var model_attribute = {
            edittype: 'model',
            name: '模型',
            style: {
              scale: 0.5,
              // modelUrl: 'Assets3D/model/plane.glb',
              modelUrl: opts.modelurl,
              distanceDisplayCondition: config.distanceDisplayCondition,
              distanceDisplayCondition_near:
                config.distanceDisplayCondition_near,
              distanceDisplayCondition_far: config.distanceDisplayCondition_far,
              label: {
                text: opts.title_txt,
                font_size: 18,
                font_family: '黑体',
                font_weight: '900',
                color: '#ffffff',
                border: true,
                border_color: '#000000',
                background: true,
                background_color: 'rgb(85, 94, 103)',
                background_opacity: 0.8,
                pixelOffset: [0, -50], // 偏移量
                distanceDisplayCondition: true, // 是否按视距显示
                distanceDisplayCondition_near: 0, // 最小距离
                distanceDisplayCondition_far: 2000, // 最大距离
                clampToGround: false, // 贴地
                visibleDepth: true // 一直显示，不被地形等遮挡
              }
            },
            type: 'model',
            attr: {
              id: opts.id,
              title_txt: opts.title_txt,
              content_txt: opts.content_txt
            }
          };
          entity = this.drawTool.attributeToEntity(model_attribute, positionC3);
          entity.guide = guide;
          break;
      }
      return entity;
    },
    // 创建dom
    strToDom(str, opts) {
      let width = opts?.width || 200;
      let height = opts?.height || 80;
      let objE = document.createElement('div');
      objE.style.width = width + 'px';
      objE.style.minHeight = height + 'px';
      objE.style.position = 'absolute';
      objE.style.top = 0;
      objE.style.zIndex = -1;
      objE.innerHTML = str;
      document.getElementById(this.$earth.viewer._container.id).append(objE);
      return objE;
    },
    // html转画布
    divToCanvas(dom, options) {
      let opts = Object.assign(
        {
          backgroundColor: null,
          useCORS: true,
          imageTimeout: 0,
          allowTaint: false,
          scrollY: 0,
          scrollX: 0,
          scale: 1
        },
        options
      );
      return new Promise((resolve) => {
        html2canvas(dom, opts).then((canvas) => {
          resolve(canvas);
        });
      });
    },
    listenMapZoom() {}
  }
};
</script>

<style>
.trangle {
  position: absolute;
  left: 30px;
  bottom: -20px;
  width: 0;
  height: 0;
  border-width: 10px;
  border-style: solid;
  border-color: transparent;
  margin-bottom: -5px;
  border-top-width: 16px;
  border-top-color: currentColor;
  color: currentColor;
}
</style>
