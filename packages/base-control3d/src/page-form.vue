<!-- eslint-disable vue/no-mutating-props -->
<template>
  <el-form
    ref="form"
    class="page-form sh-page-formbc"
    :class="className"
    :model="data"
    :rules="rules"
    :label-width="labelWidth"
  >
    <div v-for="(ConfigList, index) in getConfigList()" :key="index">
      <div
        v-if="ConfigList.title0000"
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
      <div class="Collapse">
        <el-col v-for="(item, index2) in ConfigList.header.list" :key="index2"
          ><div
            :class="{
              border_lr: true,
              selected: data[ConfigList.header.value] == item.value
            }"
            @click="handleEvent('controlType', item.value)"
          >
            <span class="icon_padding"
              ><IconSvg :icon-class="item.svg" width="16px" height="16px"
            /></span>
            <span>{{ item.title }}</span>
          </div></el-col
        >
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
            <el-form-item
              :prop="item.value"
              :label="item.label"
              :class="item.className"
              :label-width="item.labelWidth"
            >
              <!-- solt -->
              <template v-if="item.type === 'slot'">
                <slot :name="'form-' + item.value" />
              </template>

              <!-- ??????????????? -->
              <el-input
                v-if="item.type === 'input' || item.type === 'password'"
                v-model="data[item.value]"
                :type="item.type"
                :disabled="item.disabled !== false"
                :placeholder="getPlaceholder(item)"
                clearable
                @input="handleEvent(item.value, $event)"
              />
              <!-- ??????????????? -->
              <el-input
                v-if="item.type === 'textarea'"
                v-model.trim="data[item.value]"
                :type="item.type"
                :disabled="item.disabled"
                :placeholder="getPlaceholder(item)"
                :autosize="item.autosize || { minRows: 2, maxRows: 10 }"
                @input="handleEvent(item.value, $event)"
              />
              <!-- ????????? -->
              <el-input-number
                v-if="item.type === 'inputNumber'"
                v-model="data[item.value]"
                controls-position="right"
                :min="item.min"
                :max="item.max"
                :step="item.step"
                @change="handleEvent(item.value, $event)"
              />
              <!-- ????????? -->
              <el-select
                v-if="item.type === 'select'"
                v-model="data[item.value]"
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
              <!-- ???????????? -->
              <div v-if="item.type === 'ColorPicker2'" class="divContent">
                <el-input
                  v-model="data[item.value]"
                  class="colorInput"
                  placeholder=""
                ></el-input>
                <el-color-picker
                  v-model="data[item.value]"
                  @active-change="handleEvent(item.value, $event)"
                ></el-color-picker>
              </div>

              <!--???element?????????????????????????????????????????????input=color???--->
              <div v-if="item.type === 'ColorPicker'" class="divContent">
                <el-input
                  v-if="!item.noInput"
                  v-model="data[item.value]"
                  class="colorInput"
                  placeholder=""
                ></el-input>
                <input
                  v-model="data[item.value]"
                  type="color"
                  style="margin-top: 3px; padding: 0"
                  @input="handleEvent(item.value, data[item.value])"
                />
              </div>
              <!--?????????-->
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
                v-model="data[item.value]"
                @change="handleEvent(item.value, $event)"
              ></el-switch>

              <!-- slider -->
              <div
                v-if="item.type === 'slider'"
                style="display: flex"
                class="slider"
              >
                <el-slider
                  v-model="data[item.value]"
                  style="width: 100%; margin-right: 10px"
                  :show-tooltip="false"
                  :format-tooltip="formatTooltip"
                  :max="item.max"
                  :marks="item.marks"
                  @input="handleEvent(item.value, $event)"
                ></el-slider>
                <!-- <el-input
                  style="width: 30%; padding: 0"
                  v-model="data[item.value]"
                  :format-tooltip="formatTooltip"
                >
                  <template slot="suffix"> % </template>
                </el-input> -->
              </div>
              <!-- checkBox -->
              <el-checkbox
                v-if="item.type == 'checkbox'"
                v-model="data[item.value]"
                @input="handleEvent(item.value, $event)"
                >{{ item.checkName }}</el-checkbox
              >
              <!-- ??????????????????????????????????????? -->
              <el-steps
                v-if="item.type == 'steps'"
                :active="data[item.value]"
                process-status="process"
              >
                <el-step
                  v-for="(Item, index3) in item.list"
                  :key="index3"
                  :title="Item.title"
                  icon="el-icon-edit"
                >
                  <template slot="icon">
                    <div
                      class="cursor_point"
                      @click="changeStep(item.value, Item.title, data)"
                    >
                      <IconSvg
                        :icon-class="Item.svg"
                        width="16px"
                        height="16px"
                      /></div></template
                ></el-step>
              </el-steps>

              <!-- ???????????? -->
              <div v-if="item.type == 'keyboardControl'" class="">
                <div class="keyborad-input">
                  <input
                    v-model="data[item.value]"
                    class="keyborad-input inp"
                    maxlength="1"
                    @input="handleEvent(item.value, data[item.value])"
                  />
                </div>
                <div class="warning" :title="item.text"></div>
              </div>

              <!-- radioBox -->
              <el-radio-group
                v-if="item.type == 'radioGroup'"
                v-model="data[item.value]"
              >
                <el-radio
                  v-for="(Item, index4) in item.list"
                  :key="index4"
                  :label="Item.key"
                  >{{ Item.value }}</el-radio
                >
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </div>
    </div>
  </el-form>
</template>

<script>
/* eslint-disable no-prototype-builtins */
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
export default {
  name: 'PageForm',
  components: {
    IconSvg
  },
  props: {
    // ???????????????
    className: {
      type: String
    },

    showdel: {
      type: Boolean,
      default: false
    },
    // ????????????
    data: {
      type: Object
    },
    // ????????????
    fieldList: {
      type: Array
    },
    // ????????????
    rules: {
      type: Object
    },
    // ???????????????
    listTypeInfo: {
      type: Object
    },
    // label??????
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
        // ???form?????????????????????
        this.$emit('update:refObj', this.$refs.form);
      },
      deep: true // ????????????
    }
  },
  mounted() {
    // ???form?????????????????????
    this.$emit('update:refObj', this.$refs.form);
  },
  methods: {
    formatTooltip(val) {
      return val + '%';
    },
    changeStep(value, title, data) {
      if (title.includes('???')) {
        data[value] = 0;
      } else if (title.includes('???')) {
        data[value] = 1;
      } else if (title.includes('???')) {
        data[value] = 2;
      } else if (title.includes('???')) {
        data[value] = 3;
      }
      this.$emit('handleEvent', value, data[value]);
    },
    handleChange() {
      // console.log(val);
    },
    // ??????????????????
    getConfigList() {
      return this.fieldList.filter(
        (item) =>
          !item.hasOwnProperty('show') ||
          (item.hasOwnProperty('show') && item.show)
      );
    },
    // ??????placeholder?????????
    getPlaceholder(row) {
      let placeholder;
      if (row.type === 'input' || row.type === 'textarea') {
        placeholder = '?????????' + row.label;
      } else if (
        row.type === 'select' ||
        row.type === 'time' ||
        row.type === 'date'
      ) {
        placeholder = '?????????' + row.label;
      } else {
        placeholder = row.label;
      }
      return placeholder;
    },
    // ?????????????????????
    handleEvent(value, num) {
      this.$emit('handleEvent', value, num);
    },
    // ????????????????????????
    handleClick(event, data) {
      this.$emit('handleClick', event, data);
    }
  }
};
</script>
