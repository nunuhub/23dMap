<template>
  <span v-if="plotList && plotList.length > 0" class="sh-plot-legend">
    <div
      v-for="(plot, key) in plotList"
      :key="plot.id"
      class="plot-legend-item"
      :style="columStyle"
    >
      <div class="plot-legend-content">
        <div class="legendImg">
          <div
            class="imagesDiv"
            :style="`height:${imgSize}px;width:${imgSize}px`"
          >
            <svg
              v-if="plot.type == 'RailLoadLine'"
              :style="`height:${imgSize}px;width:${imgSize}px`"
              width="45px"
              height="45px"
              viewBox="0 0 45 45"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <!-- Generator: Sketch 59 (86127) - https://sketch.com -->
              <g
                id="页面-1"
                stroke="none"
                stroke-width="1"
                fill="none"
                fill-rule="evenodd"
              >
                <g id="编组-17" transform="translate(0.318019, 0.211418)">
                  <rect
                    id="矩形"
                    :fill="plot.color"
                    transform="translate(22.500000, 22.500000) rotate(-315.000000) translate(-22.500000, -22.500000) "
                    x="-5"
                    y="19"
                    width="55"
                    height="7"
                  ></rect>
                  <rect
                    id="矩形备份-20"
                    :fill="plot.color2"
                    transform="translate(11.893398, 11.500000) rotate(-315.000000) translate(-11.893398, -11.500000) "
                    x="5.39339828"
                    y="8"
                    width="13"
                    height="7"
                  ></rect>
                  <rect
                    id="矩形备份-21"
                    :fill="plot.color2"
                    transform="translate(33.681981, 33.288582) rotate(-315.000000) translate(-33.681981, -33.288582) "
                    x="28.6819805"
                    y="29.7885822"
                    width="10"
                    height="7"
                  ></rect>
                </g>
              </g>
            </svg>
            <svg
              v-else-if="plot.type == 'RailLoadCurve'"
              :style="`height:${imgSize}px`"
              width="37px"
              height="39px"
              viewBox="0 0 37 39"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g
                id="页面-1"
                stroke="none"
                stroke-width="1"
                fill="none"
                fill-rule="evenodd"
              >
                <g id="编组-18">
                  <path
                    id="路径-16"
                    :fill="plot.color"
                    d="M0,6 L7,0 C10.2942865,11.7361278 13.6276198,19.4027945 17,23 C20.3723802,26.5972055 27.0390469,29.5972055 37,32 L32,39 C21.8055495,35.5911396 14.8055495,31.924473 11,28 C7.19445047,24.075527 3.5277838,16.7421937 0,6 Z"
                  ></path>
                  <polygon
                    id="路径-16备份"
                    :fill="plot.color2"
                    points="24 28 29 30 24 36 18 33"
                  ></polygon>
                  <polygon
                    id="路径-16备份-2"
                    :fill="plot.color2"
                    points="10 11 12 16 7 23 4 17"
                  ></polygon>
                </g>
              </g>
            </svg>
            <icon
              v-else-if="plot.isSvg"
              :svg="plot.src"
              :fill-color="plot.color"
              :storke-color="plot.color2"
              :style="`height:${imgSize}px`"
            ></icon>
            <div v-else :style="`width:${imgSize}px;overflow:hidden`">
              <img
                crossorigin="anonymous"
                :src="plot.src"
                :width="`${imgSize}px`"
                :height="`${imgSize}px`"
                class="img-inner"
                :style="{
                  filter: 'drop-shadow(' + imgSize + 'px 0 ' + plot.color + ')',
                  objectFit: 'scale-down',
                  verticalAlign: 'top'
                }"
              />
            </div>
          </div>
        </div>
        <p class="plot-legend-item-label" @keyup="editName(key, plot, $event)">
          {{ plot.name }}
        </p>
      </div>
    </div>
  </span>
</template>

<script>
import * as PlotTypes from 'shinegis-client-23d/src/map-core/olPlot/Utils/PlotTypes';
import Bus from 'shinegis-client-23d/src/utils/bus';
import { newGuid } from 'shinegis-client-23d/src/utils/common';
import Icon from './icon/icon.vue';

export default {
  name: 'ShPlotLegend',
  components: {
    Icon: Icon
  },
  // eslint-disable-next-line vue/require-prop-types
  props: ['columStyle', 'imgSize'],
  data() {
    return {
      plotList: [],
      plotTypeList: [
        {
          type: 'TextArea',
          sort: 1
        },
        {
          type: 'Point',
          sort: 2
        },
        {
          type: 'Polyline',
          label: '直线'
        },
        {
          type: 'Curve',
          label: '曲线'
        },
        {
          type: 'MultipleCurve',
          label: '复合曲线'
        },
        {
          type: 'RailLoadLine',
          label: '铁路线'
        },
        {
          type: 'RailLoadCurve',
          label: '铁路曲线'
        },
        {
          type: 'Arc',
          label: '弓形'
        },
        {
          type: 'DoubleArrow',
          label: '双箭头'
        },
        {
          type: 'SquadCombat',
          label: '分队战斗行动'
        },
        {
          type: 'FineArrow',
          label: '粗单尖头箭头'
        },
        {
          type: 'DottedArrow',
          label: '虚线箭头'
        },
        {
          type: 'Circle',
          label: '圆'
        },
        {
          type: 'RectAngle',
          label: '矩形'
        },
        {
          type: 'Ellipse',
          label: '椭圆'
        },
        {
          type: 'Polygon',
          label: '多边形'
        },
        {
          type: 'FreePolygon',
          label: '自由面'
        },
        // {
        //     value: "Lune",
        //     label: "弓形",
        // },
        {
          type: 'Sector',
          label: '扇形'
        }
      ],
      plotSortMap: new Map(),
      testColor: '#ffcc00'
    };
  },
  mounted() {
    this.initPlotSort();
    Bus.$on('RefreshPlotLegend', (plots) => {
      this.initPlotList(plots);
    });
  },
  methods: {
    initPlotSort() {
      let sort = 1;
      this.plotSortMap = new Map();
      for (let plotType of this.plotTypeList) {
        this.plotSortMap.set(plotType.type, sort);
        sort++;
      }
    },
    initPlotList(plots) {
      this.plotList = [];
      this.plotMap = {};
      for (let plot of plots) {
        let src, color, name;
        let isSvg = false;
        let color2; // 部分类型存在2个color
        switch (plot.type) {
          /* case PlotTypes.TEXTAREA:
              src
              break;*/
          case PlotTypes.POINT:
            src = plot.style.point.src;
            color = plot.style.point.color;
            if (src.indexOf('circle') > 0) {
              src = require('../../../src/assets/img/plotImgs/polygon/圆.png');
              color = plot.style.fill;
            }
            name = '图标';
            break;
          case PlotTypes.PENNANT:
            break;
          case PlotTypes.POLYLINE:
            src = require('../../../src/assets/img/line/直线.png');
            name = '直线';
            color = plot.style.stroke;
            break;
          case PlotTypes.DASHLINE:
            src = require('../../../src/assets/img/arrow/虚线箭头.png');
            name = '虚线箭头';
            color = plot.style.dashStroke;
            break;
          case PlotTypes.RAILLOADLINE:
            src = require('../../../src/assets/img/line/铁路线.png');
            name = '铁路线';
            color = plot.style.roadStroke;
            color2 = plot.style.roadDashStroke;
            break;
          case PlotTypes.RAILLOADCURVE:
            src = require('../../../src/assets/img/line/铁路曲线.png');
            name = '铁路曲线';
            color = plot.style.roadStroke;
            color2 = plot.style.roadDashStroke;
            break;
          case PlotTypes.ARC:
            src = require('../../../src/assets/img/line/弓形.png');
            name = '弓形';
            color = plot.style.stroke;
            break;
          case PlotTypes.CIRCLE:
            name = '圆';
            src =
              require('!raw-loader!../../../src/assets/img/plotImgs/polygon/圆.svg').default;
            color = plot.style.gradients[0].color;
            color2 = plot.style.polyStroke;
            isSvg = true;
            break;
          case PlotTypes.CURVE:
            src = require('../../../src/assets/img/line/曲线.png');
            name = '曲线';
            color = plot.style.stroke;
            break;
          case PlotTypes.DASHCURVE:
            src = require('../../../src/assets/img/arrow/虚线箭头.png');
            name = '虚线箭头';
            color = plot.style.dashStroke;
            break;
          case PlotTypes.MULTIPLECURVE:
            src = require('../../../src/assets/img/line/复合曲线.png');
            name = '复合曲线';
            color = plot.style.stroke;
            break;
          case PlotTypes.FREEHANDLINE:
            break;
          case PlotTypes.RECTANGLE:
            name = '矩形';
            src =
              require('!raw-loader!../../../src/assets/img/plotImgs/polygon/矩形.svg').default;
            color = plot.style.fill;
            color2 = plot.style.polyStroke;
            isSvg = true;
            break;
          case PlotTypes.ELLIPSE:
            name = '椭圆';
            src =
              require('!raw-loader!../../../src/assets/img/plotImgs/polygon/椭圆形.svg').default;
            color = plot.style.fill;
            color2 = plot.style.polyStroke;
            isSvg = true;
            break;
          case PlotTypes.LUNE:
            name = '弓形';
            src =
              require('!raw-loader!../../../src/assets/img/plotImgs/polygon/弓形.svg').default;
            color = plot.style.fill;
            color2 = plot.style.polyStroke;
            isSvg = true;
            break;
          case PlotTypes.SECTOR:
            name = '扇形';
            src =
              require('!raw-loader!../../../src/assets/img/plotImgs/polygon/扇形.svg').default;
            color = plot.style.fill;
            color2 = plot.style.polyStroke;
            isSvg = true;
            break;
          case PlotTypes.CLOSED_CURVE:
            break;
          case PlotTypes.POLYGON:
            name = '多边形';
            src =
              require('!raw-loader!../../../src/assets/img/plotImgs/polygon/多边形.svg').default;
            color = plot.style.fill;
            color2 = plot.style.polyStroke;
            isSvg = true;
            break;
          case PlotTypes.ATTACK_ARROW:
            break;
          case PlotTypes.FREE_POLYGON:
            name = '自由面';
            src =
              require('!raw-loader!../../../src/assets/img/plotImgs/polygon/自由面.svg').default;
            color = plot.style.fill;
            color2 = plot.style.polyStroke;
            isSvg = true;
            break;
          case PlotTypes.DOUBLE_ARROW:
            src =
              require('!raw-loader!../../../src/assets/img/plotImgs/polygon/双箭头.svg').default;
            name = '双箭头';
            color = plot.style.gradients[0].color;
            color2 = plot.style.polyStroke;
            isSvg = true;
            break;
          case PlotTypes.STRAIGHT_ARROW:
            break;
          case PlotTypes.FINE_ARROW:
            src =
              require('!raw-loader!../../../src/assets/img/plotImgs/polygon/粗单箭头.svg').default;
            name = '粗单尖头箭头';
            color = plot.style.gradients[0].color;
            color2 = plot.style.polyStroke;
            isSvg = true;
            break;
          case PlotTypes.DOTTED_ARROW:
            src = require('../../../src/assets/img/arrow/虚线箭头.png');
            name = '虚线箭头';
            color = plot.style.dashStroke;
            break;
          case PlotTypes.ASSAULT_DIRECTION:
            break;
          case PlotTypes.TAILED_ATTACK_ARROW:
            break;
          case PlotTypes.SQUAD_COMBAT:
            src =
              require('!raw-loader!../../../src/assets/img/plotImgs/polygon/分队战斗.svg').default;
            name = '分队战斗行动';
            color = plot.style.gradients[0].color;
            color2 = plot.style.polyStroke;
            isSvg = true;
            break;
          case PlotTypes.TAILED_SQUAD_COMBAT:
            break;
          case PlotTypes.GATHERING_PLACE:
            break;
          case PlotTypes.RECTFLAG:
            break;
          case PlotTypes.TRIANGLEFLAG:
            break;
          case PlotTypes.CURVEFLAG:
            break;
        }
        if (src && color) {
          if (plot.style.name) {
            // console.log('plot.style.name', plot.style.name)
            name = plot.style.name;
          }
          let item = {
            id: newGuid(),
            type: plot.type,
            src: src,
            name: name,
            color: color,
            color2: color2,
            isSvg: isSvg,
            style: plot.style
          };
          let seemItemId = this.isItemExist(item);
          if (!seemItemId) {
            // console.log('isItemExist', item.style.name, item)
            this.plotList.push(item);
            item.groupId = item.id;
            this.plotMap[item.id] = [item];
          } else {
            item.groupId = seemItemId;
            this.plotMap[seemItemId].push(item);
            if (plot.style.name) {
              let item = this.getItemById(seemItemId);
              item.name = plot.style.name;
            }
          }
        }
      }
      this.plotList.sort(this.plotSort);
      this.$emit('change', this.plotList);
    },
    editName(index, item, $event) {
      item.style.name = $event.target.innerHTML;
      for (let gourpItem of this.plotMap[item.groupId]) {
        gourpItem.style.name = $event.target.innerHTML;
      }
    },
    isItemExist(plot) {
      if (this.plotList && this.plotList.length > 0) {
        for (let item of this.plotList) {
          if (
            item.type === plot.type &&
            item.src === plot.src &&
            item.color === plot.color
          ) {
            if (plot.color2) {
              if (item.color2 === plot.color2) {
                return item.id;
              }
            } else {
              return item.id;
            }
          }
        }
      }
    },
    getItemById(id) {
      if (this.plotList && this.plotList.length > 0) {
        for (let item of this.plotList) {
          if (item.id === id) {
            return item;
          }
        }
      }
    },
    plotSort(plot1, plot2) {
      let sort1 = this.plotSortMap.get(plot1.type);
      let sort2 = this.plotSortMap.get(plot2.type);
      return sort1 - sort2;
    }
  }
};
</script>
