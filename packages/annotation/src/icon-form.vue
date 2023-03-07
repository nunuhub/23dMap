<template>
  <div>
    选择图标<span style="color: red">*</span>：
    <div class="icons">
      <div
        v-for="item in icons"
        :id="item.id"
        :key="item.id"
        style="width: 50px; height: 50px; border: 1px solid #eee"
        @click="chooseIcon(item)"
      ></div>
    </div>
    <div class="form-config">
      图标颜色：<el-color-picker
        v-model="currentItem.theme.title_txt_color"
        show-alpha
        size="small"
      ></el-color-picker
      >&nbsp;图标大小：<input
        v-model="currentItem.theme.title_txt_size"
        type="number"
        :class="inputClass"
        style="width: 50px"
      />&nbsp;px
    </div>
    <div class="form-config">
      文字内容：<input
        v-model="currentItem.content_txt"
        type="text"
        :class="inputClass"
      />
    </div>
    <div class="form-config">
      文字颜色：<el-color-picker
        v-model="currentItem.theme.content_txt_color"
        show-alpha
        size="small"
      ></el-color-picker
      >&nbsp;文字背景颜色：<el-color-picker
        v-model="currentItem.theme.content_bgcolor"
        show-alpha
        size="small"
      ></el-color-picker>
    </div>
    <div class="form-config">
      文字大小：<input
        v-model="currentItem.theme.content_txt_size"
        type="number"
        :class="inputClass"
        style="width: 50px"
      />&nbsp;px
    </div>
    <div class="form-config">
      文字布局:<input
        type="radio"
        value="onTop"
        label="图标上方"
        name="ip"
      /><label>置于图标上方</label
      ><input type="radio" value="onbottom" label="图标下方" name="ip" /><label
        >置于图标下方</label
      >
    </div>
  </div>
</template>

<script>
import { commonMethods } from './AnnoFormSetting.js';
import { commonStyle } from './AnnoFormSetting.js';
export default {
  name: 'IconForm',
  mixins: [commonMethods, commonStyle],
  props: {
    propItem: {
      type: Object
    }
  },
  data() {
    return {
      currentItem: {},
      icons: [
        { id: '1', svg: '' },
        { id: '2', svg: '' },
        { id: '3', svg: '' },
        { id: '4', svg: '' },
        { id: '5', svg: '' },
        { id: '6', svg: '' },
        { id: '7', svg: '' },
        { id: '8', svg: '' }
      ]
    };
  },
  created() {
    this.currentItem = this.propItem;
  }
};
</script>

<style scoped lang="scss">
.form-config {
  margin-top: 10px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}
.icons {
  width: 200px;
  height: 100px;
  display: flex;
  flex-wrap: wrap;
}
.icons:hover {
  cursor: pointer;
}
.Input {
  font-size: 10px;
  height: 25px;
  border-radius: 5px;
  border: 1px solid #cecdcd;
}
.lightInput {
  background: rgba(255, 255, 255, 0.8);
  color: black;
  @extend .Input;
}
.darkInput {
  background: transparent;
  color: white;
  @extend .Input;
}
</style>
