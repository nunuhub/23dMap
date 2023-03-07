<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-form
    ref="form"
    class="page-form sh-page-formsa"
    :class="className"
    :model="data"
    :rules="rules"
    :label-width="labelWidth"
  >
    <div v-for="(ConfigList, index) in getConfigList()" :key="index">
      <div
        v-if="ConfigList.title"
        class="Collapse"
        @click.prevent="ConfigList.title.showList = !ConfigList.title.showList"
      >
        <i
          v-if="showdel"
          :class="
            ConfigList.title.showList
              ? 'el-icon-caret-bottom'
              : 'el-icon-caret-right'
          "
        ></i>
        <i
          v-else
          :class="
            ConfigList.title.showList
              ? 'el-icon-arrow-down'
              : 'el-icon-arrow-right'
          "
        ></i>
        {{ ConfigList.title.name }}
        <div
          v-if="ConfigList.title.addTemp"
          class="TEM"
          @click.stop="handleClick('addtemplate', ConfigList)"
        >
          <i class="el-icon-plus"></i>
        </div>
        <!-- 删除按钮 -->
        <div v-if="showdel" @click.stop="handleClick('deltem', index)">
          <div
            style="
              width: 16px;
              height: 16px;
              line-height: 14px;
              background: #ff5e67;
              border-radius: 50%;
              color: #fff;
              position: absolute;
              right: 10px;
              top: 5px;
              text-align: center;
            "
          >
            -
          </div>
        </div>
      </div>
      <div v-show="ConfigList.title.showList">
        <!-- temsolt -->
        <template v-if="ConfigList.title.addTemp">
          <slot :name="'form-' + ConfigList.slotprop" />
        </template>
        <el-row v-for="(item0, index0) in ConfigList.formList" :key="index0">
          <el-col
            v-for="(item, index2) in item0"
            :key="index2"
            :span="item.span || 24 / item0.length"
          >
            <!--  item.span||24 -->
            <!-- label-width 额外加上 -->
            <el-form-item
              v-if="!item.hidden"
              :prop="item.value"
              :label="item.label"
              :label-width="item.labelWidth"
              :class="item.className"
            >
              <!-- solt -->
              <template v-if="item.type === 'slot'">
                <slot :name="'form-' + item.value" />
              </template>

              <!-- 普通输入框 -->
              <el-input
                v-if="item.type === 'input' || item.type === 'password'"
                v-model="data[item.value]"
                :type="item.type"
                :disabled="item.disabled || true"
                :placeholder="getPlaceholder(item)"
                clearable
                @input="handleEvent(item.value, $event)"
              />
              <!-- (长度是一半的)普通输入框 -->
              <el-input
                v-if="item.type === 'input_2' || item.type === 'password'"
                v-model="data[item.value]"
                :type="item.type"
                :disabled="item.disabled"
                :placeholder="getPlaceholder(item)"
                clearable
                @input="handleEvent(item.value, $event)"
              />
              <!-- 文本输入框 -->
              <el-input
                v-if="item.type === 'textarea'"
                v-model.trim="data[item.value]"
                :type="item.type"
                :disabled="item.disabled"
                :placeholder="getPlaceholder(item)"
                :autosize="item.autosize || { minRows: 2, maxRows: 10 }"
                @input="handleEvent(item.value, $event)"
              />
              <!-- 计数器 -->
              <el-input-number
                v-if="item.type === 'inputNumber'"
                v-model="data[item.value]"
                controls-position="right"
                :min="item.min"
                :max="item.max"
                :step="item.step"
                :step-strictly="item.stepStrictly"
                @change="handleEvent(item.value, $event)"
              />
              <!--计数器2 用于淹没分析组件-->
              <div v-if="item.type === 'inputNumber2'" style="height: 33px">
                <el-input-number
                  v-if="item.type === 'inputNumber2'"
                  v-model="data[item.value]"
                  controls-position="right"
                  :min="item.min"
                  :max="item.max"
                  :precision="3"
                  @change="handleEvent(item.value, $event)"
                />
                <template slot="suffix" class="unit_Meters"> 米 </template>
              </div>
              <!-- 选择框 -->
              <el-select
                v-if="item.type === 'select'"
                v-model="data[item.value]"
                :disabled="item.disabled"
                :clearable="item.clearable"
                :filterable="item.filterable"
                :multiple="item.multiple"
                :collapse-tags="item.collapse_tags"
                :placeholder="getPlaceholder(item)"
                @change="handleEvent(item.value, $event)"
              >
                <el-option
                  v-for="(childItem, childIndex) in item.list"
                  :key="childIndex"
                  :label="childItem.key"
                  :value="childItem.value"
                />
              </el-select>
              <!-- 选择框  专用于坡向-->

              <el-select
                v-if="item.type === 'select_custom'"
                v-model="data[item.value]"
                :disabled="item.disabled"
                :clearable="item.clearable"
                :filterable="item.filterable"
                :multiple="item.multiple"
                :collapse-tags="item.collapse_tags"
                :placeholder="getPlaceholder(item)"
                @change="handleEvent(item.value, $event)"
              >
                <el-option
                  v-for="(childItem, childIndex) in item.list"
                  :key="childIndex"
                  :value="childItem.value"
                  style="padding: 0 20px 2 10px"
                >
                  <span
                    style="float: left; transform: translateX(-10px)"
                    :label="childItem.key"
                    :value="childItem.value"
                    >{{ childItem.key }}</span
                  >
                  <span style="float: right" class="aspect_span"
                    ><input
                      v-model="data[childItem.value]"
                      type="color"
                      style="margin-top: 3px; padding: 0"
                      @click.stop="() => {}"
                      @input.stop="
                        handleEvent('aspect_color_single', {
                          aspect: childItem.value,
                          color: data[childItem.value]
                        })
                      "
                  /></span>
                </el-option>
              </el-select>
              <!-- 选择框-专用于坡度坡向高程 -->
              <div v-if="item.type === 'select_terrain'">
                <span>
                  <el-select
                    v-model="data[item.value]"
                    :disabled="item.disabled"
                    :clearable="item.clearable"
                    :filterable="item.filterable"
                    :multiple="item.multiple"
                    :collapse-tags="item.collapse_tags"
                    :placeholder="getPlaceholder(item)"
                    @change="handleEvent(item.value, $event)"
                  >
                    <el-option
                      v-for="(childItem, childIndex) in item.list"
                      :key="childIndex"
                      :label="childItem.key"
                      :value="childItem.value"
                    />
                  </el-select>
                </span>
                <span>
                  <div
                    v-if="data[item.value] == 'polygon'"
                    style="
                      padding-left: 10px;
                      display: block;
                      top: -45px;
                      right: -94px;
                      position: relative;
                      width: 0%;
                    "
                  >
                    <el-button
                      size="mini"
                      class="terrain_add"
                      @click="
                        handleEvent('addPolygon', 'click', 'btnRowbtnRow')
                      "
                      >+</el-button
                    >
                  </div>
                </span>
              </div>
              <!-- 颜色选择 noInput属性是为地形分析的颜色区间而设，即是否显示输入框 -->
              <div v-if="item.type === 'ColorPicker2'" class="divContent">
                <el-input
                  v-if="!item.noInput"
                  v-model="data[item.value]"
                  class="colorInput"
                  placeholder=""
                  @input="handleEvent_color(item.value, data[item.value])"
                ></el-input>
                <el-color-picker
                  v-model="data[item.value]"
                  @active-change="handleEvent(item.value, $event)"
                ></el-color-picker>
              </div>

              <!--因element的颜色选择器没有取色器，所以用input=color来--->
              <div v-if="item.type === 'ColorPicker'" class="divContent">
                <el-input
                  v-if="!item.noInput"
                  v-model="data[item.value]"
                  class="colorInput"
                  placeholder=""
                  style="z-index: 10"
                  @input="handleEvent_color(item.value, data[item.value])"
                ></el-input>
                <input
                  v-model="data[item.value]"
                  type="color"
                  style="margin-top: 3px; padding: 0; z-index: 10"
                  @input="handleEvent(item.value, data[item.value])"
                />
              </div>
              <!-- switch -->
              <el-switch
                v-if="item.type === 'switch'"
                v-model="data[item.value]"
                @change="handleEvent(item.value, $event)"
              ></el-switch>
              <!--DateTimePicker -->
              <el-date-picker
                v-if="item.type === 'time'"
                v-model="data[item.value]"
                type="datetime"
                @change="handleEvent(item.value, $event)"
                @focus="handleEvent(item.value, 'focus')"
              >
              </el-date-picker>
              <!--日照分析的进度控制 按钮行 -->
              <div v-if="item.type === 'play'">
                <button
                  id="playBtn"
                  class="btn btn1"
                  type="button"
                  @click="handleEvent('start', 'start')"
                ></button>
                <button
                  class="btn btn2"
                  type="button"
                  @click="handleEvent('stop', 'stop')"
                ></button>
              </div>
              <!--按钮行 class="btnRow"-->
              <div
                v-if="item.type === 'btnRow'"
                style="padding-left: 10px; height: 100%"
              >
                <span
                  v-for="(factor, indexF) in item.list"
                  :key="indexF"
                  class="btnSpan"
                >
                  <el-button
                    size="mini"
                    :class="{
                      btnRow: true,
                      selected: data[factor.value]
                    }"
                    @click="handleEvent(factor.value, 'click', 'btnRowbtnRow')"
                    >{{ factor.name }}</el-button
                  >
                </span>
              </div>
              <!--日照分析的节气按钮 -->
              <div v-if="item.type === 'solarTermBtn'">
                <button
                  class="btn_solarTerm"
                  type="button"
                  @click="handleEvent('solarTermBtn', 'solarTermBtn')"
                >
                  <span>节气</span>&nbsp;&nbsp;<span
                    style="font-weight: bold"
                    >{{ data[item.value] }}</span
                  >
                </button>
              </div>
              <!-- slider -->
              <div v-if="item.type === 'slider'" style="display: flex">
                <el-slider
                  v-model="data[item.value]"
                  style="width: 60%; margin-right: 10px"
                  :min="item.min"
                  :max="item.max"
                  :step="item.step"
                  @input="handleEvent(item.value, $event)"
                ></el-slider>
                <el-input
                  v-model="data[item.value]"
                  style="width: 30%"
                  placeholder=""
                  @input="handleEvent(item.value, $event)"
                >
                  <template slot="suffix">
                    {{ item.suffix === undefined ? '%' : item.suffix }}
                  </template>
                </el-input>
              </div>
              <!--slider contain inputNumber   -->
              <div
                v-if="item.type === 'slider&inputNumber'"
                style="display: flex; height: 100%"
              >
                <el-slider
                  v-model="data[item.value]"
                  style="width: 60%; margin-right: 10px"
                  :min="item.min"
                  :max="item.max"
                  :step="item.step"
                  @input="handleEvent(item.value, $event)"
                ></el-slider>
                <el-input-number
                  v-model="data[item.value]"
                  style="width: 30%"
                  class="nopadding position_modify"
                  controls-position="right"
                  :min="item.min"
                  :max="item.max"
                  :step="item.step"
                  @change="handleEvent(item.value, $event)"
                />
              </div>

              <!--坡度分析的渐变色带-->
              <div v-if="item.type === 'colorRamp'" style="height: 100%">
                <canvas
                  id="colorRamp"
                  width="120px"
                  height="24px"
                  style="display: block; position: absolute; top: 4px"
                ></canvas>
              </div>
              <!--剖面分析的结果条-->
              <div v-if="item.type === 'clipDisplay'" class="clipContainer">
                <!--剖面分析点击信息图标出现的小信息窗-->
                <div
                  id="layui-layer5"
                  class="layui-layer-tips"
                  type="tips"
                  hidden="true"
                  style="
                    z-index: 19891019;
                    position: absolute;
                    left: 66.3375px;
                    top: 148px;
                    color: #d0d0d0;
                  "
                >
                  <div
                    id=""
                    class="layui-layer-content"
                    style="background-color: rgb(18, 18, 18)"
                  >
                    <span>相机</span>
                    <span class="clip-info-close" @click="closeInfo"></span>
                    <hr style="margin: 1px" />
                    <div style="color: #d0d0d0">
                      <span>经度：{{ item.info.longitude }}°</span><br />
                      <span>纬度：{{ item.info.latitude }}°</span><br />
                      <span>视高：{{ item.info.height }}米</span><br />
                      <span>方向：{{ item.info.direction }}°</span><br />
                      <span>俯仰角：{{ item.info.pitch }}°</span>
                    </div>
                    <i
                      class="layui-layer-TipsG layui-layer-TipsB"
                      style="border-right-color: rgb(18, 18, 18)"
                    ></i>
                  </div>
                </div>
                <div
                  v-for="(factor, number) in item.list"
                  :key="number"
                  :title="number"
                  class="listRow"
                  @click="handleEvent('openEcharts', number)"
                >
                  <span class="name"
                    >{{ number + 1 }}-结果 {{ factor.distancestr }}</span
                  >
                  <img
                    class="info"
                    src="../../../src/assets/img/spatial-analysis3d/info.svg"
                    @click.stop="handleEvent('openInfo', number)"
                  />
                  <img
                    class="delete"
                    src="../../../src/assets/img/spatial-analysis3d/trash.svg"
                    @click.stop="handleEvent('deleteMea', number)"
                  />
                </div>
              </div>

              <el-checkbox-group
                v-if="item.type === 'checkBoxGroup'"
                v-model="data[item.value]"
              >
                <el-checkbox
                  v-for="Item in item.list"
                  :key="Item.key"
                  @change="handleEvent(Item.key, $event)"
                ></el-checkbox>
              </el-checkbox-group>
              <!-- radioBox -->
              <el-radio-group
                v-if="item.type == 'radioGroup'"
                v-model="data[item.value]"
                @change="handleEvent(item.value, $event)"
              >
                <el-radio
                  v-for="(Item, index3) in item.list"
                  :key="index3"
                  :label="Item.key"
                  >{{ Item.key }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </div>
  </el-form>
</template>

<!-- eslint-disable no-prototype-builtins -->
<!-- eslint-disable vue/no-mutating-props -->
<script>
import { Utils } from 'shinegis-client-23d/src/earth-core/Widget/SpatialAnalysis/index';
const FromCSS = Utils.getColor('fromCssColorString');
export default {
  name: 'PageForm',
  props: {
    // 自定义类名
    className: {
      type: String
    },

    showdel: {
      type: Boolean,
      default: false
    },
    // 表单数据
    data: {
      type: Object
    },
    // 相关字段
    fieldList: {
      type: Array
    },
    // 验证规则
    rules: {
      type: Object
    },
    // 相关的列表
    listTypeInfo: {
      type: Object
    },
    // label宽度
    labelWidth: {
      type: String,
      default: '120px'
    },
    refObj: {
      type: Object
    }
  },
  data() {
    return {
      activeNames: ['1']
    };
  },
  watch: {
    data: {
      handler: function () {
        // 将form实例返回到父级
        this.$emit('update:refObj', this.$refs.form);
      },
      deep: true // 深度监听
    }
  },
  mounted() {
    // 将form实例返回到父级
    this.$emit('update:refObj', this.$refs.form);
  },
  methods: {
    handleChange() {
      // console.log(val);
    },
    // 获取字段列表
    getConfigList() {
      return this.fieldList.filter(
        (item) =>
          !item.hasOwnProperty('show') ||
          (item.hasOwnProperty('show') && item.show)
      );
    },
    // 得到placeholder的显示
    getPlaceholder(row) {
      let placeholder;
      if (row.type === 'input' || row.type === 'textarea') {
        placeholder = '' + row.label; // "请输入"
      } else if (
        row.type === 'select' ||
        row.type === 'time' ||
        row.type === 'date'
      ) {
        placeholder = '请选择' + row.label;
      } else {
        placeholder = row.label;
      }
      return placeholder;
    },
    // 绑定的相关事件
    handleEvent(value, num) {
      // console.log('value,num', value, num);
      this.$emit('handleEvent', value, num);
    },
    handleEvent_color(value, color) {
      // 对颜色字符串的规范化过滤
      let a = FromCSS(color);
      if (a) {
        this.data[value] = a.toCssHexString();
        this.handleEvent(value, this.data[value]);
      }
    },
    // 派发按钮点击事件
    handleClick(event, data) {
      this.$emit('handleClick', event, data);
    },
    // 关闭测量结果栏点击后打开的信息窗。
    closeInfo() {
      document.getElementById('layui-layer5').hidden = true;
    }
  }
};
</script>
