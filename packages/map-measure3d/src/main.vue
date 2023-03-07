<template>
  <div v-show="shouldShow" class="sh-map-measure3d">
    <general-container
      ref="container"
      :is-show="false"
      :style-config="cardStyleConfig"
      :title="titleStr"
      :position="panelPosition"
      :img-src="panelImgSrc ? panelImgSrc : 'map-measure'"
      :theme="theme"
      @change:isShow="changeCard"
    >
      <div class="measure_top" :class="{ light: theme === 'light' }">
        <div class="measure_t_l">
          <el-input v-model="formInfo.data.text" class="input-with-select">
            <el-select
              slot="append"
              :value="unitText"
              placeholder=""
              class="smallModify"
              @change="handleEvent($event)"
            >
              <el-option
                v-for="(childItem, childIndex) in formInfo.units"
                :key="childIndex"
                :label="childItem.key"
                :value="[childItem.value, childItem.type, childItem.key]"
                :disabled="!unitDisable"
              />
            </el-select>
          </el-input>
        </div>
        <div class="measure_del" @click="remove">清空</div>
      </div>
      <div
        class="measure_table measure_result"
        :class="{ light: theme === 'light' }"
      >
        <div v-if="measure_record.length > -1" class="measure_item first">
          <div class="item_l">测量类型</div>
          <div class="item_r">测量值</div>
          <div class="item_d">操作&nbsp;</div>
        </div>
        <div class="measure_result">
          <div
            v-for="(item, index) in measure_record"
            :key="index"
            class="measure_item"
          >
            <div class="item_l">{{ item.measureType }}</div>
            <div class="item_r">{{ item.measureValue }}</div>
            <img
              class="delete item_d"
              style="object-fit: scale-down"
              src="../../../src/assets/img/map-measure3d/trash.svg"
              @click.stop="handleEvent('deleteMea', item)"
            />
          </div>
        </div>
      </div>
    </general-container>
    <general-bar
      :mode="mode"
      :drag-enable="dragEnable"
      :is-show.sync="visible"
      :position="position"
      :options="toolOptions"
      :active-index="activeIndex"
      :theme="theme"
      :theme-style="barThemeStyle"
      @select="select"
      @unselect="unselect"
      @change:isShow="onChangeIsShow"
    />
    <div id="charts_mm">
      <div id="echartsView_mm"></div>
      <div class="echartsView-closeBotton" @click="closeEchartsView"></div>
    </div>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import generalBarProps from 'shinegis-client-23d/src/mixins/components/general-bar-props';
import emitter from 'shinegis-client-23d/src/mixins/emitter';

import { Measure } from 'shinegis-client-23d/src/earth-core/Entry57';
import {
  formatArea,
  formatLength
} from 'shinegis-client-23d/src/earth-core/Tool/Util1';
import * as echarts from 'echarts';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import dialogDrag from 'shinegis-client-23d/src/utils/dialogDrag';
import GeneralBar from 'shinegis-client-23d/packages/general-bar';
const units = {
  length: [
    { key: '米', value: 'm', type: 'length' },
    { key: '公里', value: 'km', type: 'length' },
    { key: '海里', value: 'mile', type: 'length' },
    { key: '丈', value: 'zhang', type: 'length' }
  ],
  area: [
    { key: '平方米', value: 'm', type: 'area' },
    { key: '平方公里', value: 'km', type: 'area' },
    { key: '亩', value: 'mu', type: 'area' },
    { key: '公顷', value: 'ha', type: 'area' }
  ]
};
let measureControl, currEditFeature, parametersCopy;
export default {
  name: 'ShMapMeasure3d',
  components: { GeneralContainer, GeneralBar },
  directives: { dialogDrag },
  mixins: [common, generalBarProps, emitter],
  props: {
    panelCardProps: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      defaultLayerName: 'tempMeasureLayer',
      titleStr: '图上量测',
      header: false,
      measure_record: [
        // 存放测量结果。
        /* {  //label和value
          measureType: "贴地距离",
          measureValue: "5120 米",
        }*/
      ],
      toolOptions: [
        {
          key: 'spatialDis', // 空间距离
          img: 'spatial-dis',
          name: '空间距离'
        },
        {
          key: 'ctgDis', // 贴地距离 clamp to ground
          img: 'clamp-ground-dis',
          name: '贴地距离'
        },
        /* {
          key: 'measureSection', // 地形剖面
          img: 'topographicProfile',
          name: '地形剖面'
        }, */ {
          key: 'measureArea', // 面积测量
          img: 'measure-area',
          name: '面积测量'
        },
        {
          key: 'measureAngle', // 方位测量
          img: 'measure-angle',
          name: '方位测量'
        },
        {
          key: 'measureHeight', // 高度测量
          img: 'measure-height',
          name: '高度测量'
        },
        {
          key: 'superHeight', // 三角测高
          img: 'super-height',
          name: '三角测量'
        },
        {
          key: 'measurePoint', // 坐标测量
          img: 'measure-point',
          name: '坐标测量'
        }
      ],
      activeIndex: [],
      unitText: '米',
      unitDisable: true,
      unitType: 'length',
      formInfo: {
        data: { text: '', value: null },
        unit: '', // 初始状态下先不设
        units: [
          { key: '米', value: 'm' },
          { key: '公里', value: 'km' },
          { key: '海里', value: 'mile' },
          { key: '丈', value: 'zhang' }
        ],
        fieldList: {}
      }
    };
  },
  computed: {
    shouldShow() {
      return this.currentView === 'earth';
    },
    cardStyleConfig() {
      return {
        ...this.typeConfig,
        ...this.styleConfig
      };
    },
    panelStyleConfig() {
      return this.panelCardProps?.styleConfig;
    },
    panelPosition() {
      return (
        this.panelCardProps?.position || {
          type: 'absolute',
          top: '100px',
          left: '35px'
        }
      );
    },
    panelImgSrc() {
      return this.panelCardProps?.imgSrc;
    }
  },
  watch: {
    currentInteraction(name) {
      if (name !== this.$options.name && name !== '') {
        measureControl.clearMeasureById(); //包含endLastDraw方法
      }
    }
  },
  mounted() {
    document.getElementById('charts_mm').hidden = true;
    if (this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
      this.activeIndex = [];
    }
  },
  methods: {
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    changeCard(val) {
      if (!val) {
        this.remove();
        this.closeEchartsView();
      }
    },
    begin() {
      let viewer;
      viewer = this.$earth.viewer;
      this.initMeasure(viewer, { name: this.defaultLayerName });
    },
    initMeasure(viewer, options) {
      // 初始化三维绘制器
      measureControl =
        measureControl || new Measure({ viewer: viewer, ...options });
      this.$emit('inited', measureControl);
      let drawTool = measureControl.draw();
      drawTool.on('change:active', (e) => {
        if (e.active) {
          !this.activeIndex.includes(e.drawtype) &&
            this.activeIndex.push(e.drawtype);
        } else {
          this.activeIndex = [];
        }
        this.$emit('change:active', e.active);
      });
      let _this = this;
      drawTool.startEditing = function startEditing(entity) {
        this.stopEditing();
        if (entity === undefined || !this._hasEdit) return;

        if (entity.editing && entity.editing.activate) {
          entity.editing.activate();
        }

        this.currEditFeature = entity;
        currEditFeature = entity;
        _this.setUnits(entity);
      };
      drawTool.stopEditing = function stopEditing() {
        if (
          this.currEditFeature &&
          this.currEditFeature.editing &&
          this.currEditFeature.editing.disable
        ) {
          this.currEditFeature.editing.disable();
        }
        this.currEditFeature = null;
        currEditFeature = null;
      };
      /** 1、类似方位测量等，删除entity时，同时移除辅助线、标注。 2、移除掉信息框里的记录 */
      drawTool.on('delete-feature', (entity) => {
        let entities = drawTool.dataSource.entities;
        entity._totalLable && entities.remove(entity._totalLable);
        if (entity?._arrLables?.length > 0) {
          for (let index = 0; index < entity._arrLables.length; index++) {
            const element = entity._arrLables[index];
            entities.remove(element);
          }
        }
        entity._exline && entities.remove(entity._exline);
        let scored = this.measure_record.find((e) => {
          return e.id === entity._id;
        });
        if (scored && scored.measureValue.includes(this.formInfo.data.text)) {
          this.formInfo.data.text = null;
        }
        let pointInRecord = this.measure_record.findIndex(
          (e) => e.id === entity._id
        );
        if (pointInRecord > -1) {
          this.measure_record.splice(pointInRecord, 1);
        }
      });
    },
    activate(type) {
      let _this = this;
      this.$refs.container.changeShow(true);
      let msType;
      let typeText = this.toolOptions.find((e) => {
        return e.key === type;
      }).name;
      let options = {
        unit: '公里',
        terrain: false,
        isSuper: false,
        calback: () => {
          // console.log("calbackcalback", distanceStr, distance);
        },
        calbackresult: (distanceStr, entity) => {
          // console.log("calbackresultcalbackresult", distanceStr, entity);
          // distanceStr 指测量字符串（包括面积和方位测量）
          if (msType === 'length') {
            typeText = entity.attribute.style.clampToGround
              ? '贴地距离'
              : '空间距离';
          }
          if (msType.includes('oint')) {
            distanceStr = distanceStr.replace('<label>海拔</label>', '');
          }
          let value = entity._totalLable && entity._totalLable.attribute.value;
          this.formInfo.data.value = value; // 存放测量结果的值。
          entity.distanceStr = distanceStr;
          // 分开数值和单位 distanceStr.replaceAll(/[\u4e00-\u9fa5]/g,'')
          let numberText, unitText;
          [numberText, unitText] = this.splitNumberAndUnit(distanceStr);
          this.unitText = unitText;
          this.formInfo.data.text = numberText; // 存放测量结果的字符串。
          const id = entity.id;
          let check = this.measure_record.findIndex((e) => e.id === id);
          let v = entity._totalLable && entity._totalLable.attribute.value;
          if (check > -1) {
            // 修改或插入'测量记录'数组。
            this.measure_record[check].measureType = typeText;
            this.measure_record[check].measureValue = distanceStr;
            this.measure_record[check].value = v;
          } else {
            this.measure_record.unshift({
              measureType: typeText,
              measureValue: distanceStr,
              value: v,
              id: id
            });
          }

          msType = msType.replace('measure', '');
          msType = msType.toLowerCase();

          if (msType === 'height') {
            msType = options.isSuper ? 'super_height' : 'height';
          }
          entity.unitType = msType; // ‘单位’类型。用于单位转换方法的第一个参数。
          this.setUnits(entity);
        }
      };

      this.unitDisable = true; // 当测量类型为'方位测量'和'坐标测量'时不显示。
      msType = type;
      options.terrain = true;
      switch (type) {
        case 'spatialDis': {
          msType = 'measureLength';
          options.addHeight = 1;
          options.terrain = false;
          break;
        }
        case 'ctgDis': {
          msType = 'measureLength';
          options.terrain = true;
          break;
        }
        case 'superHeight': {
          // 三角测高
          msType = 'measureHeight';
          options.isSuper = true;
          break;
        }
        case 'measureSection': {
          typeText = '剖面距离';
          msType = 'measureSection';

          options.calback = function showSectionResult(param) {
            if (param.arrHB && param.arrHB.length) {
              _this.setEchartsData(param);
            }
          };
          break;
        }
        case 'measurePoint': {
          this.unitDisable = false;
          break;
        }
        case 'measureAngle': {
          this.unitDisable = false;
        }
      }
      this.formInfo.units = type === 'measureArea' ? units.area : units.length;
      let unit = this.formInfo.units.find((e) => {
        return e.value === this.formInfo.unit;
      });
      this.unitText = unit ? unit.key : this.formInfo.units[0].key;
      unit = unit ? unit.value : this.formInfo.units[0].value;
      options.unit = unit;
      parametersCopy = { msType, options };
      measureControl[msType](options);
    },
    select(key) {
      let text = this.toolOptions.find((e) => {
        return e.key === key;
      }).name;
      this.titleStr = '图上量测:' + text;
      // eslint-disable-next-line vue/no-mutating-props
      this.imgSrc = text;
      this.formInfo.data.text = '';
      this.activate(key);
    },
    unselect() {
      this.activeIndex = [];
      this.deactivate();
    },
    remove() {
      measureControl.clearMeasure();
      this.formInfo.data.text = '';
      this.measure_record = [];
      this.closeEchartsView();
    },
    handleEvent(unit, item) {
      if (unit === 'deleteMea') {
        let id = item.id;

        let jundgeRemove = item.measureValue.includes(this.formInfo.data.text);
        if (jundgeRemove) this.formInfo.data.text = null;

        let index = this.measure_record.findIndex((e) => {
          return e.id === id;
        });
        this.measure_record.splice(index, 1); // 移除信息窗内的记录
        measureControl.clearMeasureById(id); // 移除entity
        return;
      }
      this.changeUnit(unit);
    },
    changeUnit(unit) {
      //['mu', 'area', '亩'],原先想放出该方法，但参数形式需修改。
      // 两种情形，一是已经绘制完成，此时updateUnit(已实现)，二是尚未绘制，此时将单位传入绘制行为。//不管了。
      this.formInfo.unit = unit[0];
      let lengthOrArea = unit[1];
      this.unitText = unit[2];
      unit = unit[0];
      let dr = measureControl.draw();
      let pl = dr.drawCtrl.polyline;
      let pg = dr.drawCtrl.polygon;
      if (parametersCopy && (pl._enabled || pg._enabled)) {
        // 开启了绘制后点击修改单位，此时重新绘制。
        const { msType, options } = parametersCopy;
        options.unit = unit;
        measureControl[msType](options);
      }
      measureControl.updateUnit(lengthOrArea, unit);
      // 更改单位
      if (currEditFeature) {
        let entity = currEditFeature;
        let value = entity._totalLable.attribute.value;
        let a, b, c;
        if (lengthOrArea === 'area') {
          a = formatArea(value, unit);
          [b, c] = this.splitNumberAndUnit(a);
        } else {
          a = formatLength(value, unit);
          [b, c] = this.splitNumberAndUnit(a);
        }
        this.formInfo.data.text = b;
        this.unitText = c;
      }

      // 为记录栏里所有可改的数值更改单位。
      let arr = this.measure_record;
      arr.forEach((e) => {
        if (e.measureType.includes('距离') && lengthOrArea === 'length') {
          let v = e.value;
          e.measureValue = formatLength(v, unit);
        } else if (e.measureType === '面积测量' && lengthOrArea === 'area') {
          let v = e.value;
          e.measureValue = formatArea(v, unit);
        }
      });
    },
    setEchartsData(data) {
      document.getElementById('charts_mm').hidden = false;
      if (this.myChart == null) {
        this.myChart = echarts.init(
          document.getElementById('echartsView_mm'),
          'dark'
        );
      }
      var arrPoint = data.arrPoint;

      var option = {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        grid: {
          left: 10,
          right: 10,
          bottom: 10,
          containLabel: true
        },
        dataZoom: [
          {
            type: 'inside',
            throttle: 50
          }
        ],
        tooltip: {
          trigger: 'axis',
          // position: function (point, params, dom, rect, size) {
          //    return [10, 20];
          // },
          formatter: function (params) {
            var inhtml = '';
            if (params.length === 0) return inhtml;
            var point = arrPoint[params[0].dataIndex]; // 所在经纬度
            params[0].axisValue = Number(params[0].axisValue);
            params[0].value = Number(params[0].value);
            inhtml +=
              '所在位置&nbsp;' +
              point.x +
              ',' +
              point.y +
              '<br />' +
              '距起点&nbsp;<label>' +
              formatLength(params[0].axisValue) +
              '</label><br />' +
              params[0].seriesName +
              "&nbsp;<label style='color:" +
              params[0].color +
              ";'>" +
              formatLength(params[0].value) +
              '</label><br />';

            return inhtml;
          }
        },
        xAxis: [
          {
            name: '行程',
            type: 'category',
            boundaryGap: false,
            axisLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            data: data.arrLen
          }
        ],
        yAxis: [
          {
            // name: '高度',
            type: 'value',
            axisLabel: {
              rotate: 60,
              formatter: '{value} 米'
            }
          }
        ],
        series: [
          {
            name: '高程值',
            type: 'line',
            smooth: true,
            symbol: 'none',
            sampling: 'average',
            itemStyle: {
              normal: {
                color: 'rgb(255, 70, 131)'
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: 'rgb(255, 158, 68)'
                  },
                  {
                    offset: 1,
                    color: 'rgb(255, 70, 131)'
                  }
                ])
              }
            },
            data: data.arrHB
          }
        ]
      };
      this.myChart.setOption(option);
    },
    closeEchartsView() {
      this.myChart && this.myChart.dispose();
      this.myChart = undefined;
      document.getElementById('charts_mm').hidden = true;
    },
    closeMeasure() {
      // 关闭窗体。同时删除图上的测量要素。
      this.$refs.container.changeShow(false);
      this.remove();
    },
    deactivate() {
      let drawTool = measureControl.draw();
      drawTool.stopDraw();
    },
    setUnits(e) {
      // 就方位测量和坐标测量时不显示。 就面积的单位不同于其他。
      if (e) {
        // 当前编辑要素存在时，单位切换显示。
        // this.formInfo.data.text = e.distanceStr;
        let [b, c] = this.splitNumberAndUnit(e.distanceStr);
        this.formInfo.data.text = b;
        this.unitText = c;

        this.formInfo.data.value =
          e._totalLable && e._totalLable.attribute.value;
        this.unitDisable = true;
        this.formInfo.units =
          e.attribute.type === 'polygon' ? units.area : units.length;
        if (e.attribute.type === 'point' || e.unitType === 'angle') {
          this.unitDisable = false;
        }
      }
    },
    splitNumberAndUnit(str = '12.65公里') {
      let numberStr, unitStr;
      numberStr = str.replaceAll(/[\u4e00-\u9fa5]/g, '');
      unitStr = str.replace(numberStr, '');
      return [numberStr, unitStr];
    }
  }
};
</script>
