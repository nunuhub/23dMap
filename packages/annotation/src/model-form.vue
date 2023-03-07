<template>
  <div>
    <div class="property">
      <div class="model_config item_config">
        <!-- <div class="config_title">
          <span>模型配置</span>
        </div> -->
        <div class="form_item">
          <span class="form_label">标题内容：</span>
          <el-input
            v-model="currentItem.title_txt"
            :class="{ dark: currentView === 'earth' }"
          ></el-input>
        </div>
        <div class="form_item">
          <span class="form_label">模型对象：</span>
          <el-select
            v-model="currentItem.modelurl"
            :class="{ dark: currentView === 'earth' }"
            size="mini"
            placeholder="请选择图层类型"
          >
            <el-option
              v-for="(item, index) in modelArr"
              :key="index"
              :label="item.label"
              :value="item.value"
            >
            </el-option>
          </el-select>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { commonMethods } from './AnnoFormSetting.js';
import { commonStyle } from './AnnoFormSetting.js';
export default {
  name: 'ModelForm',
  mixins: [commonMethods, commonStyle],
  props: {
    propItem: {
      type: Object
    }
  },
  data() {
    return {
      currentItem: {},
      modelArr: [
        {
          label: '汽车',
          value: 'Assets3D/model/car.gltf',
          imgSrc: 'Assets3D/img/qiche.jpg'
        },
        {
          label: '飞机',
          value: 'Assets3D/model/plane.glb',
          imgSrc: 'Assets3D/img/feiji.jpg'
        },
        {
          label: '卫星',
          value: 'Assets3D/model/satelight.gltf',
          imgSrc: 'Assets3D/img/weixing.jpg'
        }
      ]
    };
  },
  watch: {},
  mounted() {},
  methods: {}
};
</script>
