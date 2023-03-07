<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-form
    ref="form"
    class="page-form sh-page-formev"
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
                v-if="item.type === 'input'"
                v-model="data[item.value]"
                :type="item.type"
                :disabled="item.disabled"
                :placeholder="getPlaceholder(item)"
                clearable
                @change="handleEvent(item.value, $event)"
              />
              <!-- (长度是一半的)普通输入框 -->
              <el-input
                v-if="item.type === 'input_url'"
                v-model="data[item.value]"
                :type="item.type"
                :disabled="item.disabled"
                :placeholder="getPlaceholder(item)"
                clearable
                @change="handleEvent(item.value, $event)"
              />
              <!-- 单栏多格 用于一个点经度、纬度、高度三个参数的输入 -->
              <div></div>
              <el-input
                v-if="item.type === 'input_position'"
                v-model="data[item.value]"
                :type="item.type"
                :disabled="item.disabled"
                :placeholder="getPlaceholder(item)"
                clearable
                @input="handleEvent_number(item.value, $event)"
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
              <!--因element的颜色选择器没有取色器，所以用input=color来--->
              <div v-if="item.type === 'ColorPicker'" class="divContent">
                <el-input
                  v-if="!item.noInput"
                  v-model="data[item.value]"
                  class="colorInput"
                  placeholder=""
                  style="z-index: 10"
                  @input="handleEvent(item.value, data[item.value])"
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
export default {
  name: 'ShPageFormev',
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
      if (row.placeholder) return row.placeholder;
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
    handleEvent_number(key, value) {
      // 对数字字符串的规范化过滤
      value = value.replace(/[^\d.]/g, '');
      this.data[key] = value;
      this.handleEvent(key, value);
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
