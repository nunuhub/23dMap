<template>
  <el-form
    ref="form"
    :model="form"
    label-width="0px"
    style="width: 100px"
    @test="lengthtest"
  >
    <el-form-item label="">
      <el-select
        v-if="polygonFlag"
        slot="append"
        v-model="form.format"
        placeholder=""
        class="smallModify"
        @change="change"
      >
        <el-option
          v-for="item in formats"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
      <el-select
        v-if="lengthFlag"
        slot="append"
        v-model="form.lengthUnit"
        placeholder=""
        class="smallModify"
        @change="lengthChange"
      >
        <el-option
          v-for="item in lengthUnits"
          :key="item.value"
          style="color: black"
          :label="item.label"
          :value="item.value"
        ></el-option>
      </el-select>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data() {
    return {
      form: {
        format: '平方米',
        lengthUnit: '米'
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
      polygonFlag: true
    };
  },
  mounted() {},
  methods: {
    change: function () {
      this.$emit('getmsg', this.form.format);
    },
    lengthChange: function () {
      this.$emit('getmsg', this.form.lengthUnit);
    },
    lengthtest(measureType) {
      if (measureType === 'LineString') {
        this.lengthFlag = true;
        this.polygonFlag = false;
      } else {
        this.lengthFlag = false;
        this.polygonFlag = true;
      }
    }
  }
};
</script>
<style>
.el-form >>> .el-form-item .el-form-item__content {
  /* line-height: 40px; */
  position: relative;
  font-size: 14px;
}

.el-form >>> .el-form-item__label {
  text-align: right;
  vertical-align: middle;
  float: left;
  font-size: 14px;
  color: white;
  /* line-height: 40px; */
  padding: 0 12px 0 0;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.el-select {
  display: inline-block;
  position: relative;
  width: 100px;
  height: 40px;
  margin: 0px 5px 5px 5px;
  background-color: transparent;
  vertical-align: middle;
}

.el-select >>> .el-input__inner {
  -webkit-appearance: none;
  background: transparent;
  border: 0px;
  color: black;
  background-image: none;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  display: inline-block;
  font-size: inherit;
  line-height: 40px;
  outline: 0;
  padding: 0 15px;
  -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
  width: 100%;
}
</style>
