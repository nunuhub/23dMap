<template>
  <div v-show="showLayerConfig && noClose">
    <div class="newLayer">
      <div v-show="isImportLayer" class="option-style">
        服务地址：&nbsp;&nbsp;<input
          v-model="serviceUrl"
          :class="inputClass"
          style="width: 200px"
        />
      </div>
      <div class="option-style">
        图层名称：&nbsp;&nbsp;<input
          v-model="layerName"
          :class="inputClass"
          style="width: 200px"
        />
      </div>
      <div v-show="isImportLayer" class="option-style">
        展示字段：&nbsp;&nbsp;<input
          v-model="showField"
          :class="inputClass"
          style="width: 200px"
        />
      </div>
      <div class="option-style">
        图层类型：&nbsp;&nbsp;
        <el-select
          v-model="layerType"
          :class="{ dark: currentView === 'earth' }"
          size="mini"
          placeholder="请选择图层类型"
        >
          <el-option
            v-for="(item, index) in layerTypes"
            :key="index"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <div v-show="layerType === 'iconLayer' && isImportLayer">
        选择图标：&nbsp;&nbsp;
        <div class="icons">
          <div
            v-for="item in icons"
            :id="item.id"
            :key="item.id"
            style="width: 50px; height: 50px; border: 1px solid #eee"
            @click="chooseIcon(item)"
          ></div>
        </div>
      </div>
      <div v-show="layerType === 'panelLayer'" class="option-style">
        颜色主题：&nbsp;&nbsp;
        <el-select
          v-model="theme"
          :class="{ dark: currentView === 'earth' }"
          size="mini"
          placeholder="请选择颜色主题"
        >
          <el-option
            v-for="(item, index) in themes"
            :key="index"
            :label="item.label"
            :value="item.value"
          >
          </el-option>
        </el-select>
      </div>
      <div class="layerStyleConfig">
        <div v-show="layerType === 'panelLayer'" class="option-style">
          图层样式：&nbsp;&nbsp;
          <el-radio-group v-model="isBorderRound">
            <el-radio :label="3"
              ><span :style="currentTheme">直角边框</span></el-radio
            >
            <el-radio :label="6"
              ><span :style="currentTheme">圆角边框</span></el-radio
            >
          </el-radio-group>
        </div>
        <div v-show="layerType === 'panelLayer'" class="option-style">
          位置偏移：&nbsp;&nbsp;
          <el-radio-group v-model="isOffset">
            <el-radio label="center-center"
              ><span :style="currentTheme">居中</span></el-radio
            >
            <el-radio label="center-top"
              ><span :style="currentTheme">偏上</span></el-radio
            ><br />
            <el-radio label="center-bottom"
              ><span :style="currentTheme">偏下</span></el-radio
            >
            <el-radio label="center-right"
              ><span :style="currentTheme">偏右</span></el-radio
            >
            >
          </el-radio-group>
        </div>
        <div v-show="layerType === 'panelLayer'" class="option-style">
          气泡对话框：&nbsp;&nbsp;
          <el-switch
            v-model="isBubble"
            active-color="#13ce66"
            inactive-color="#cecdcd"
          >
          </el-switch>
        </div>
        <div
          :class="{ dark: currentView === 'earth' }"
          style="margin-top: 10px"
        >
          <div class="form_item">
            <span class="form_label">是否按距显示：</span>
            <el-radio v-model="config.distanceDisplayCondition" :label="true"
              >是</el-radio
            >
            <el-radio v-model="config.distanceDisplayCondition" :label="false"
              >否</el-radio
            >
          </div>
          <div v-if="config.distanceDisplayCondition" class="form_item">
            <span class="form_label">显示范围：</span>
            <el-input-number
              v-model="config.distanceDisplayCondition_near"
              :controls="false"
            ></el-input-number>
            <span style="margin: 0 10px">~</span>
            <el-input-number
              v-model="config.distanceDisplayCondition_far"
              :controls="false"
            ></el-input-number>
          </div>
          <div class="form_item">
            <span class="form_label">是否按视距缩放：</span>
            <el-radio v-model="config.scaleByDistance" :label="true"
              >是</el-radio
            >
            <el-radio v-model="config.scaleByDistance" :label="false"
              >否</el-radio
            >
          </div>
          <div v-if="config.scaleByDistance" class="form_item">
            <span class="form_label">缩放下限：</span>
            <el-input-number
              v-model="config.scaleByDistance_near"
              :controls="false"
            ></el-input-number>
            <span style="margin: 0 10px">-</span>
            <el-input-number
              v-model="config.scaleByDistance_nearValue"
              :controls="false"
            ></el-input-number>
          </div>
          <div v-if="config.scaleByDistance" class="form_item">
            <span class="form_label">缩放上限：</span>
            <el-input-number
              v-model="config.scaleByDistance_far"
              :controls="false"
            ></el-input-number>
            <span style="margin: 0 10px">-</span>
            <el-input-number
              v-model="config.scaleByDistance_farValue"
              :controls="false"
            ></el-input-number>
          </div>
        </div>
      </div>
    </div>
    <div
      style="
        width: 100%;
        display: flex;
        justify-content: center;
        margin-top: 10px;
      "
    >
      <el-button type="primary" size="mini" round @click="saveLayer">
        确定
      </el-button>

      <el-button type="warning" size="mini" round @click="closeLayerConfig"
        >取消</el-button
      >
    </div>
  </div>
</template>

<script>
import { commonStyle } from './AnnoFormSetting.js';
import { Message } from 'element-ui';
export default {
  name: 'LayerForm',
  mixins: [commonStyle],
  props: {
    showLayerConfig: {
      type: Boolean,
      default: false
    },
    isImportLayer: {
      type: Boolean,
      default: false
    },
    annoInstance: {
      type: Object
    },
    currentLayer: {
      type: Object
    },
    isLayerAdd: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      layerName: '',
      layerType: '',
      layerTypes: [
        { label: '图标注记', value: 'iconLayer' },
        { label: '面板注记', value: 'panelLayer' },
        { label: '模型注记', value: 'moduleLayer' },
        { label: '视频注记', value: 'videoLayer' },
        { label: '服务注记', value: 'serviceLayer' }
      ],
      themes: [],
      isBubble: false,
      isBorderRound: 3,
      showField: '',
      icons: [
        { id: '1', imgSrc: 'Assets3D/img/mark1.png' },
        { id: '2', imgSrc: 'Assets3D/img/mark2.png' },
        { id: '3', imgSrc: 'Assets3D/img/mark3.png' },
        { id: '4', imgSrc: 'Assets3D/img/mark4.png' }
      ],
      theme: '浅色主题',
      serviceUrl: '',
      isOffset: false,
      noClose: true,
      config: {
        distanceDisplayCondition: true,
        distanceDisplayCondition_near: 0,
        distanceDisplayCondition_far: 100000,
        scaleByDistance: true,
        scaleByDistance_near: 500,
        scaleByDistance_nearValue: 1,
        scaleByDistance_far: 3000,
        scaleByDistance_farValue: 0.5
      }
    };
  },
  watch: {
    isLayerAdd: function (val) {
      if (!val) {
        this.layerName = this.currentLayer.layerName;
        this.layerType = this.currentLayer.layerType;
        this.config = this.currentLayer.styleOptions.config;
        this.isBorderRound = this.currentLayer.styleOptions.isBorderRound;
        this.isBubble = this.currentLayer.styleOptions.isBubble;
        this.isOffset = this.currentLayer.styleOptions.isOffset;
        this.theme = this.currentLayer.styleOptions.theme;
      } else {
        this.layerName = '';
        this.layerType = '';
      }
    }
  },
  mounted() {},
  methods: {
    closeLayerConfig() {
      this.noClose = false;
    },
    saveLayer() {
      if (!this.isImportLayer) {
        let opt = {
          layerName: this.layerName,
          layerType: this.layerType,
          styleOptions: {
            theme: this.theme,
            isBubble: this.isBubble,
            isBorderRound: this.isBorderRound,
            isOffset: this.isOffset,
            config: this.config
          },
          isShow: this.currentLayer.isShow,
          layerID: this.currentLayer.layerID
        };
        this.annoInstance.saveLayers(opt, this.isLayerAdd).then(() => {
          this.$emit('getLayers');
          Message({
            message: '图层保存成功!',
            type: 'success'
          });
        });
      } else {
        let config = {
          layerName: this.layerName,
          layerType: this.layerType,
          serviceUrl: this.serviceUrl
        };
        this.annoInstance.generateAnnoLayer(config).then(() => {
          this.$parent.getLayers();
          Message({
            message: '图层导入成功!',
            type: 'success'
          });
        });
      }
    }
  }
};
</script>

<style scoped lang="scss">
.option-style {
  margin-top: 10px;
  display: flex;
  align-items: center;
}
.newLayer {
  font-size: 10px;
  padding-top: 10px;
  margin-left: 5px;
}
.Input {
  font-size: 10px;
  height: 25px;
  border-radius: 5px;
  border: 1px solid #cecdcd;
}
.lightInput {
  background: rgba(255, 255, 255, 0);
  color: black;
  @extend .Input;
}
.darkInput {
  background: transparent;
  color: white;
  @extend .Input;
}
.darkInput:focus {
  color: white;
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
</style>
