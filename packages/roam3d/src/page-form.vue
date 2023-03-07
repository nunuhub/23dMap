<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-form
    ref="form"
    class="page-form"
    :class="className"
    :model="data"
    :rules="rules"
    :label-width="labelWidth"
  >
    <div
      v-for="(ConfigList, index) in getConfigList()"
      :id="index == pointIndex ? 'light' + pointIndex : 'nolight'"
      :key="index"
      :class="{ highlight: index == pointIndex }"
    >
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
        <!-- <div
          v-if="ConfigList.title.addTemp"
          @click.stop="handleClick('addtemplate', ConfigList)"
          class="TEM"
        >
          <i class="el-icon-plus"></i>
        </div> -->
        <!-- 增加按钮 -->
        <div v-if="showdel" @click.stop="handleClick('addtem', index)">
          <div
            style="
              width: 16px;
              height: 16px;
              line-height: 14px;
              background: #467cf3;
              border-radius: 50%;
              color: #fff;
              position: absolute;
              right: 36px;
              top: 5px;
              text-align: center;
            "
          >
            +
          </div>
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
        <el-form-item
          v-for="(item, index2) in ConfigList.formList"
          :key="index2"
          :prop="item.value"
          :label="item.label"
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
            :disabled="item.disabled"
            :placeholder="getPlaceholder(item)"
            clearable
            @change="handleEvent()"
          />
          <!-- 文本输入框 -->
          <el-input
            v-if="item.type === 'textarea'"
            v-model.trim="data[item.value]"
            :type="item.type"
            resize="none"
            :disabled="item.disabled"
            :placeholder="getPlaceholder(item)"
            :autosize="item.autosize || { minRows: 2, maxRows: 10 }"
            @change="handleEvent()"
          />
          <!-- 计数器 -->
          <el-input-number
            v-if="item.type === 'inputNumber'"
            v-model="data[item.value]"
            controls-position="right"
            :min="item.min"
            :max="item.max"
            :step="item.step"
            @change="handleEvent(item.value)"
          />
          <!-- 选择框 -->
          <el-select
            v-if="item.type === 'select'"
            v-model="data[item.value]"
            :disabled="item.disabled"
            :clearable="item.clearable"
            :filterable="item.filterable"
            :placeholder="getPlaceholder(item)"
            @change="handleEvent()"
          >
            <el-option
              v-for="(childItem, childIndex) in item.list"
              :key="childIndex"
              :label="childItem.label"
              :value="childItem.value"
            />
          </el-select>
          <!-- 颜色选择 -->
          <div v-if="item.type === 'ColorPicker'" class="divContent">
            <el-input
              v-model="data[item.value]"
              class="colorInput"
              placeholder=""
            ></el-input>
            <el-color-picker v-model="data[item.value]"></el-color-picker>
          </div>

          <!-- switch -->
          <el-switch
            v-if="item.type === 'switch'"
            v-model="data[item.value]"
            active-color="#0486FE"
          ></el-switch>
          <!-- slider -->
          <div v-if="item.type === 'slider'" style="display: flex">
            <el-slider
              v-model="data[item.value]"
              style="width: 60%; margin-right: 10px"
            ></el-slider>
            <el-input
              v-model="data[item.value]"
              style="width: 30%"
              placeholder=""
            >
              <template slot="suffix"> % </template>
            </el-input>
          </div>

          <el-checkbox-group
            v-if="item.type === 'checkBoxGroup'"
            v-model="data[item.value]"
          >
            <el-checkbox
              v-for="Item in item.list"
              :key="Item.key"
              :label="Item.key"
              >{{ Item.value }}</el-checkbox
            >
          </el-checkbox-group>
          <!-- radioBox -->
          <el-radio-group
            v-if="item.type == 'radioGroup'"
            v-model="data[item.value]"
            @change="handleEvent()"
          >
            <el-radio
              v-for="(Item, index3) in item.list"
              :key="index3"
              :label="Item.key"
              >{{ Item.value }}</el-radio
            >
          </el-radio-group>
        </el-form-item>
      </div>
    </div>
  </el-form>
</template>

<!-- eslint-disable no-prototype-builtins -->
<script>
import { Message } from 'element-ui';

export default {
  name: 'PageForm',
  props: {
    // 鼠标选中的点
    pointIndex: {
      type: Number,
      default: null
    },
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
        placeholder = '请输入' + row.label;
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
    handleEvent(event) {
      this.$emit('handleEvent', this.data, event);
    },
    // 派发按钮点击事件
    handleClick(event, index) {
      if (this.getConfigList().length === 2) {
        Message({
          type: 'warning',
          message: '无法删除，点数量不能少于2'
        });
      } else {
        this.$emit('handleClick', event, index, this.data);
      }
      // this.$emit('handleClick', event, index, this.data);
    }
  }
};
</script>
