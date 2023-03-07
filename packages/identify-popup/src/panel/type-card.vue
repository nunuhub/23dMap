<template>
  <div class="sh-identify-popup-type-card">
    <el-radio-group v-model="queryType" size="mini">
      <el-radio label="click">点</el-radio>
      <el-radio label="line">线</el-radio>
      <el-radio label="polygon">面</el-radio>
      <el-radio label="box">框选</el-radio>
    </el-radio-group>
  </div>
</template>

<script>
export default {
  name: 'ShIdentifyPopupTypeCard',
  props: {
    currentQueryType: {
      type: String,
      default: 'click'
    }
  },
  data() {
    return {
      queryType: this.currentQueryType
    };
  },
  watch: {
    queryType(value) {
      this.$emit('update:currentQueryType', value);
    }
  },
  mounted() {
    if (this.queryType.startsWith('buffer')) {
      this.queryType = 'click';
    }
  }
};
</script>
