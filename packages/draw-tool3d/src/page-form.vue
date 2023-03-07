<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-form
    ref="form"
    class="page-form sh-page-formdt"
    :class="className"
    :model="data"
    :rules="rules"
    :label-width="labelWidth"
  >
    <div
      v-if="data.featureType === 'billboard' && data.imageBox"
      class="imageBox"
    >
      <img
        v-for="(image, key) in images"
        :key="key"
        :src="image.url"
        alt=""
        class="image"
        @click="handleEvent('image', image.url)"
      />
    </div>
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
        <!-- <div
          v-if="ConfigList.title.addTemp"
          @click.stop="handleClick('addtemplate', ConfigList)"
          class="TEM"
        >
          <i class="el-icon-plus"></i>
        </div> -->
        <!-- &&ConfigList.formList[index].showMark -->
        <!-- 删除按钮 -->
        <div
          v-if="ConfigList.canAdd"
          @click.stop="handleClick('addtemplate', index)"
        >
          <div
            style="
              width: 16px;
              height: 16px;
              line-height: 14px;
              background: #ff5e67;
              border-radius: 50%;
              color: #fff;
              position: absolute;
              right: 28px;
              top: 5px;
              text-align: center;
            "
          >
            +
          </div>
        </div>
        <div
          v-if="ConfigList.canAdd"
          @click.stop="handleClick('deltem', index)"
        >
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
      <div v-show="ConfigList.title.showList" class="content-panel">
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
          :label-width="item.labelWidth"
        >
          <!-- solt -->
          <template v-if="item.type === 'slot'">
            <slot :name="'form-' + item.value" />
          </template>

          <!-- 普通输入框 -->
          <el-input
            v-if="item.type === 'input' || item.type === 'password'"
            :value="data[item.value]"
            :type="item.type"
            :disabled="item.disabled !== false"
            :placeholder="getPlaceholder(item)"
            clearable
            @input="handleEvent(item.value, $event)"
          />
          <!-- 文本输入框 -->
          <el-input
            v-if="item.type === 'textarea'"
            :value="data[item.value]"
            :type="item.type"
            :disabled="item.disabled"
            :placeholder="getPlaceholder(item)"
            :autosize="item.autosize || { minRows: 2, maxRows: 10 }"
            @input="handleEvent(item.value, $event)"
          />
          <!-- 计数器 -->
          <el-input-number
            v-if="item.type === 'inputNumber'"
            :value="data[item.value]"
            controls-position="right"
            :min="item.min || 1"
            :max="item.max"
            :step="
              item.step || item.min < 1 ? 0.1 : item.max < 2 ? 0.1 : undefined
            "
            @change="handleEvent(item.value, $event)"
          />
          <!-- 图标库 -->
          <div v-if="item.type === 'imageGallery'">
            <img
              class="icon"
              :src="data[item.value]"
              @click="handleEvent('iconLibrary', $event)"
            />
          </div>
          <!-- 选择框 -->
          <el-select
            v-if="item.type === 'select'"
            :value="data[item.value]"
            :disabled="item.disabled"
            :clearable="item.clearable"
            :filterable="item.filterable"
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
          <!-- 颜色选择 -->
          <div v-if="item.type === 'ColorPicker2'" class="divContent">
            <el-input
              :value="data[item.value]"
              class="colorInput"
              placeholder=""
              @input="handleEvent_color(item.value, $event)"
            ></el-input>
            <el-color-picker
              :value="data[item.value]"
              @active-change="handleEvent(item.value, $event.target.value)"
            ></el-color-picker>
          </div>

          <!--因element的颜色选择器没有取色器，所以用input=color来--->
          <div v-if="item.type === 'ColorPicker'" class="divContent">
            <el-input
              v-if="!item.noInput"
              v-model="data[item.value]"
              class="colorInput"
              placeholder=""
              @input="handleEvent_color(item.value, $event)"
            ></el-input>
            <input
              :value="data[item.value]"
              type="color"
              style="margin-top: 3px; padding: 0"
              @input="handleEvent(item.value, $event.target.value)"
            />
          </div>
          <!--按钮行-->
          <div v-if="item.type === 'btnRow'" style="padding-left: 10px">
            <span
              v-for="(factor, indexF) in item.list"
              :key="indexF"
              class="btnSpan"
            >
              <el-button
                class="btnRow"
                size="mini"
                @click="handleEvent(factor.value, 'click', 'btnRowbtnRow')"
                >{{ factor.name }}</el-button
              >
              <!--   <button
                    class="btnRow"
                    @click ="handleEvent(factor.value, 'click','btnRowbtnRow')"
                  >
                    {{ factor.name }}
                  </button> -->
            </span>
          </div>

          <!-- switch -->
          <el-switch
            v-if="item.type === 'switch'"
            :value="data[item.value]"
            @change="handleEvent(item.value, $event)"
          ></el-switch>

          <!-- slider -->
          <div
            v-if="item.type === 'slider'"
            style="display: flex"
            class="slider"
          >
            <el-slider
              :value="data[item.value]"
              style="width: 60%; margin-right: 10px"
              :min="item.min"
              :max="item.max"
              @input="handleEvent(item.value, $event)"
            ></el-slider>
            <el-input
              :value="data[item.value]"
              style="width: 30%; padding: 0"
              placeholder=""
              @input="handleEvent_input(item.value, $event)"
            >
              <template slot="suffix"> % </template>
            </el-input>
          </div>

          <el-checkbox-group
            v-if="item.type === 'checkBoxGroup'"
            :value="data[item.value]"
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
            :value="data[item.value]"
          >
            <el-radio
              v-for="(Item, index1) in item.list"
              :key="index1"
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
import { Utils } from 'shinegis-client-23d/src/earth-core/Widget/SpatialAnalysis/index';
const files = require
  .context(
    'cesium_shinegis_earth/Build/Cesium/Assets/Textures/maki',
    false,
    /\.png$/
  )
  .keys();
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
  computed: {
    images() {
      let result = files.map((e) => {
        let url = `Assets/Textures/maki/${e.slice(2)}`;
        let obj = { url: url };
        return obj;
      });
      result = result.concat([
        { url: 'Assets3D/img/mark0.svg' },
        { url: 'Assets3D/img/mark1.png' },
        { url: 'Assets3D/img/mark2.png' },
        { url: 'Assets3D/img/mark3.png' },
        { url: 'Assets3D/img/mark4.png' }
      ]);
      return result;
    }
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
      // console.log("fieldList", this.fieldList);
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
    handleEvent(value, num) {
      this.$emit('handleEvent', value, num);
    },
    handleEvent_color(value, color) {
      // 对颜色字符串的规范化过滤
      let a = FromCSS(color);
      if (a) {
        this.handleEvent(value, a.toCssHexString());
      }
    },
    handleEvent_input(value, n) {
      // 对数字字符串的规范化过滤
      n = Number(n);
      let v;
      if (typeof n === 'number' && !Number.isNaN(n)) {
        this.handleEvent(value, n);
        v = n;
      } else {
        v = 1;
      }
      this.handleEvent(value, v);
    },
    // 派发按钮点击事件
    handleClick(event, data) {
      this.$emit('handleClick', event, data);
    }
  }
};
</script>
