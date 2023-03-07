<template>
  <el-form-item :label="label">
    <el-row>
      <el-col :span="17">
        <el-input v-model="innerColor" :size="size"> </el-input>
      </el-col>
      <el-col :span="4">
        <el-color-picker
          v-model="innerColor"
          :size="size"
          style="margin-left: 8px; vertical-align: center"
          :show-alpha="showAlpha"
        >
        </el-color-picker>
      </el-col>
    </el-row>
  </el-form-item>
</template>

<script>
export default {
  name: 'ColorPickerFormItem',
  model: {
    prop: 'color',
    event: 'change'
  },
  props: {
    color: String,
    label: String,
    size: String,
    showAlpha: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      innerColor: ''
    };
  },
  watch: {
    innerColor() {
      this.$emit('change', this.innerColor);
    },
    color() {
      this.innerColor = this.color;
    }
  },
  mounted() {
    this.innerColor = this.color;
  }
};
</script>
