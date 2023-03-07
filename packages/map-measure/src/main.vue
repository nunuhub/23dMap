<template>
  <div v-show="shouldShow" class="sh-map-measure">
    <general-container
      :is-show.sync="visible"
      :style-config="cardStyleConfig"
      :title="title ? title : '图上量算'"
      :position="position"
      :img-src="imgSrc ? imgSrc : 'map-measure'"
      :berth="berth"
      :theme="theme"
      :theme-style="cardThemeStyle"
      :drag-enable="dragEnable"
      :append-to-body="appendToBody"
      :only-container="onlyContainer"
      @change:isShow="changeIsShow"
    >
      <div id="measureCard" style="right: 0px">
        <div class="measurDiv">
          <div class="measureButton">
            <span
              class="funSpan"
              :class="{ active: measureType === 'Polygon' }"
              @click="initMapMeasure('Polygon')"
            >
              <div class="measureButtonImg">
                <img
                  class="funImg"
                  src="../../../src/assets/img/MapMeasure/Measure_Area.png"
                  style="border: none"
                />
                <div>
                  <a class="funFont" style="text-decoration: none; color: black"
                    >测面积</a
                  >
                </div>
              </div>
            </span>

            <span
              class="funSpan"
              :class="{ active: measureType === 'LineString' }"
              @click="initMapMeasure('LineString')"
            >
              <div class="measureButtonImg">
                <img
                  class="funImg"
                  src="../../../src/assets/img/MapMeasure/Measure_Distance.png"
                  style="border: none"
                />
                <div>
                  <a class="funFont" style="text-decoration: none; color: black"
                    >测距离</a
                  >
                </div>
              </div>
            </span>

            <span
              class="funSpan"
              :class="{ active: measureType === 'Point' }"
              @click="initMapMeasure('Point')"
            >
              <div class="measureButtonImg">
                <img
                  class="funImg"
                  src="../../../src/assets/img/MapMeasure/Measure_Point.png"
                  style="border: none"
                />
                <div>
                  <a class="funFont" style="text-decoration: none; color: black"
                    >定坐标</a
                  >
                </div>
              </div>
            </span>
          </div>

          <div class="measure_top" :class="{ light: theme === 'light' }">
            <div class="measure_t_l">
              <el-input v-model="form.data" class="input-with-select">
                <el-select
                  v-if="polygonFlag"
                  slot="append"
                  v-model="form.format"
                  :disabled="form.data === ''"
                  placeholder=""
                  class="smallModify"
                  @change="getChildMsg(form.format)"
                >
                  <el-option
                    v-for="item in formats"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
                <el-select
                  v-else-if="lengthFlag"
                  slot="append"
                  v-model="form.lengthUnit"
                  :disabled="form.data === ''"
                  placeholder=""
                  class="smallModify"
                  @change="getChildMsg(form.lengthUnit)"
                >
                  <el-option
                    v-for="item in lengthUnits"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  ></el-option>
                </el-select>
                <div v-else slot="append" class="smallModify single-div">
                  坐标
                </div>
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
                  src="../../../src/assets/svg/trash.svg"
                  @click.stop="handleEvent('deleteMea', item)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </general-container>
  </div>
</template>

<script>
// import UnitSetting from './UnitSetting.vue';
import MapMeasure from './MapMeasure.js';
import cardDrag from 'shinegis-client-23d/src/directives/card-drag';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import common from 'shinegis-client-23d/src/mixins/common';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import emitter from 'shinegis-client-23d/src/mixins/emitter';

export default {
  name: 'ShMapMeasure',
  directives: { cardDrag },
  components: {
    GeneralContainer
  },
  mixins: [common, generalCardProps, emitter],
  props: {
    bgcolor: {
      type: String,
      default: '#3385ff'
    }
  },
  data() {
    this.mapMeasure = null;
    return {
      typeConfig: {
        size: {
          width: '320px',
          height: '600px' // 原先300
        }
      },
      titleStyle: '',
      measureType: '',
      msg: [
        {
          value: '米',
          label: '米'
        },
        {
          value: '千米',
          label: '千米'
        }
      ],
      background: this.bgcolor,
      measureUnit: '平方米',
      form: {
        format: '平方米',
        lengthUnit: '米',
        data: ''
      },
      formats: [
        {
          value: '平方米',
          label: '平方米'
        },
        {
          value: '平方千米',
          label: '平方千米'
        },
        {
          value: '公顷',
          label: '公顷'
        },
        {
          value: '亩',
          label: '亩'
        }
      ],
      lengthUnits: [
        {
          value: '米',
          label: '米'
        },
        {
          value: '千米',
          label: '千米'
        }
      ],
      lengthFlag: false,
      polygonFlag: true,
      measure_record: [
        // 存放测量结果。
        /* {  //label和value
          measureType: "贴地距离",
          measureValue: "5120 米",
        }*/
      ]
    };
  },
  computed: {
    styleObject() {
      return {
        '--background-color': this.bgcolor
      };
    },
    shouldShow() {
      if (this.viewMode === '2D') {
        return true;
      } else if (this.viewMode === '3D') {
        return false;
      } else {
        return this.currentView === 'map';
      }
    },
    cardStyleConfig() {
      return {
        ...this.typeConfig,
        ...this.styleConfig
      };
    }
  },
  watch: {
    currentInteraction(name) {
      if (name !== this.$options.name) {
        this.mapMeasure?.deactivate(false);
      }
    }
  },
  mounted() {
    if (this.$map) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    begin() {
      this.mapMeasure = new MapMeasure(this.$map);
      this.mapMeasure.on('change:active', (e) => {
        if (!e.active) {
          this.measureType = '';
        }
        this.$emit('change:active', e.active);
      });
      this.mapMeasure.setOnChangeLisnter((type, result) => {
        if (type === 'change') {
          this.form.data = result;
        } else {
          this.measure_record.unshift({
            id: result,
            measureType: this.polygonFlag
              ? '面积'
              : this.lengthFlag
              ? '距离'
              : '定坐标',
            measureValue: this.form.data + ' ' + this.measureUnit
          });
        }
      });
    },
    changeIsShow(value) {
      this.$emit('change:isShow', value);
      if (!value) {
        this.mapMeasure.deactivate(false);
        this.remove();
      }
    },
    initMapMeasure(measureType) {
      if (this.measureType === measureType) {
        this.mapMeasure.deactivate(false);
        return;
      }
      let unitSetting = this.form;
      this.measureType = measureType;
      // 点击每个按钮的时候，动态改变子组件里的data值
      let unit = null;
      this.form.data = '';
      if (measureType === 'Polygon') {
        unit = unitSetting.format;
        this.measureUnit = unitSetting.format;
        this.lengthFlag = false;
        this.polygonFlag = true;
      } else if (measureType === 'LineString') {
        unit = unitSetting.lengthUnit;
        this.measureUnit = unitSetting.lengthUnit;
        this.lengthFlag = true;
        this.polygonFlag = false;
      } else {
        this.lengthFlag = false;
        this.polygonFlag = false;
        this.measureUnit = '';
      }
      let options = {
        type: measureType,
        unit: unit
      };
      this.mapMeasure.activate(options);
    },
    getChildMsg(val) {
      // 当下拉框测量工具单位改变时，对应的的测量计算停止，并重新按照新单位计算
      let newResult = this.mapMeasure.result;
      if (this.measureUnit !== val) {
        newResult = this.mapMeasure.convertResult(
          this.measureUnit,
          val,
          this.mapMeasure.result
        );
        this.mapMeasure.result = newResult;
        this.form.data = newResult;
      }
      this.measureUnit = val;
      this.measure_record[0].measureValue = this.form.data + this.measureUnit;
      this.mapMeasure.changeMeasureTooltip(
        this.mapMeasure.result + ' ' + this.measureUnit
      );
      this.initMapMeasure(this.measureType);
    },
    remove() {
      this.mapMeasure.deactivate();
      this.form.data = '';
      this.measure_record = [];
    },
    handleEvent(unit, item) {
      if (unit === 'deleteMea') {
        let id = item.id;

        let jundgeRemove = item.measureValue.includes(this.form.data);
        if (jundgeRemove) this.form.data = null;

        let index = this.measure_record.findIndex((e) => {
          return e.id === id;
        });
        this.measure_record.splice(index, 1); // 移除信息窗内的记录
        this.mapMeasure.removeById(id); // 移除entity
        return;
      }
    }
  }
};
</script>
