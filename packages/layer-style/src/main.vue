<template>
  <div v-show="visible" class="sh-layer-style">
    <general-container
      ref="container"
      :is-show.sync="visible"
      :style-config="cardStyleConfig"
      :theme-style="cardThemeStyle"
      :title="title ? title : '图层样式'"
      :berth="berth"
      :position="position"
      :append-to-body="appendToBody"
      :img-src="imgSrc ? imgSrc : 'layer-manager'"
      :theme="theme"
      :drag-enable="dragEnable"
      :only-container="onlyContainer"
      @change:isShow="onChangeIsShow"
    >
      <el-radio-group
        v-model="radio"
        style="margin-left: 20px"
        @change="radioChange"
      >
        <el-radio
          v-for="(item, index) in styleInfos"
          :key="index"
          :label="index"
          >{{ item.label }}</el-radio
        >
      </el-radio-group>
      <!--      <el-tabs v-model="selectTab" type="card" @tab-click="changeTab">
        <el-tab-pane label="颜色" name="color">颜色</el-tab-pane>
        <el-tab-pane label="自定义" name="custom">图片</el-tab-pane>
      </el-tabs>-->
      <span v-if="style.styleOptions">
        <el-form
          v-if="style.type === 'point'"
          ref="form"
          :model="style.styleOptions"
          label-width="100px"
        >
          <color-picker-form-item
            v-model="style.styleOptions.color"
            :show-alpha="false"
            size="small"
            label="填充颜色"
          />
          <el-form-item label="填充透明度">
            <el-slider
              v-model="style.styleOptions.opacity"
              :min="0"
              :max="1"
              :step="0.01"
              style="margin-right: 20px"
            ></el-slider>
          </el-form-item>
          <color-picker-form-item
            v-model="style.styleOptions.outlineColor"
            :show-alpha="false"
            size="small"
            label="描边颜色"
          />
          <el-form-item label="描边透明度">
            <el-slider
              v-model="style.styleOptions.outlineOpacity"
              w
              :min="0"
              :max="1"
              :step="0.01"
              style="margin-right: 20px"
            ></el-slider>
          </el-form-item>
          <el-form-item label="描边宽度">
            <el-input-number
              v-model="style.styleOptions.outlineWidth"
              :min="0"
              :max="30"
              :step="0.1"
              size="small"
            ></el-input-number>
          </el-form-item>
          <el-form-item label="半径">
            <el-input-number
              v-model="style.styleOptions.scale"
              :min="0"
              :max="30"
              :step="0.1"
              size="small"
            ></el-input-number>
          </el-form-item>
        </el-form>
        <el-form
          v-else-if="style.type === 'polyline'"
          ref="form"
          :model="style.styleOptions"
          label-width="100px"
        >
          <color-picker-form-item
            v-model="style.styleOptions.color"
            :show-alpha="false"
            size="small"
            label="描边颜色"
          />
          <el-form-item label="描边透明度">
            <el-slider
              v-model="style.styleOptions.opacity"
              :min="0"
              :max="1"
              :step="0.01"
              style="margin-right: 20px"
              size="small"
            ></el-slider>
          </el-form-item>
          <el-form-item label="描边宽度">
            <el-input-number
              v-model="style.styleOptions.width"
              :min="0"
              :max="30"
              :step="0.1"
              size="small"
            ></el-input-number>
          </el-form-item>
        </el-form>
        <el-form
          v-else
          ref="form"
          :model="style.styleOptions"
          label-width="100px"
        >
          <color-picker-form-item
            v-model="style.styleOptions.color"
            :show-alpha="false"
            size="small"
            label="填充颜色"
          />
          <el-form-item label="填充透明度">
            <el-slider
              v-model="style.styleOptions.opacity"
              :min="0"
              :max="1"
              :step="0.01"
              style="margin-right: 20px"
              label="填充透明度"
            ></el-slider>
          </el-form-item>
          <color-picker-form-item
            v-model="style.styleOptions.outlineColor"
            :show-alpha="false"
            size="small"
            label="描边颜色"
          />
          <el-form-item label="描边透明度">
            <el-slider
              v-model="style.styleOptions.outlineOpacity"
              :min="0"
              :max="1"
              :step="0.01"
              style="margin-right: 20px"
              size="small"
            ></el-slider>
          </el-form-item>
          <el-form-item label="描边宽度">
            <el-input-number
              v-model="style.styleOptions.outlineWidth"
              :min="0"
              :max="30"
              :step="0.1"
              size="small"
            ></el-input-number>
          </el-form-item>
        </el-form>
      </span>
      <div class="btns">
        <el-button type="primary" size="small" @click="changeStyle"
          >确认</el-button
        >
        <el-button type="warning" size="small" @click="cancel">取消</el-button>
      </div>
    </general-container>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import ColorPickerFormItem from './color-picker-form-item';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import LayerGroup from 'ol/layer/Group';

export default {
  name: 'ShLayerStyle',
  components: {
    GeneralContainer,
    ColorPickerFormItem
  },
  mixins: [common, emitter, generalCardProps],
  props: {
    layerInfo: Object
  },
  data() {
    return {
      visible: this.isShow,
      styleInfos: [], //多子图层的时候，存储每个子图层的layer和style
      temp3dLayerInfo: {},
      isShowRadio: false,
      radio: '',
      selectTab: 'color',
      style: {},
      typeConfig: {
        isShowBtn: false, // true时展示btn点btn显示面板,false直接显示面板
        isStartFix: false, // 初始化时Fix状态是否启用
        titleBar: {
          miniBtn: false,
          maxBtn: false,
          closeBtn: false,
          fixBtn: false,
          title: true
        },
        size: {
          width: '300px'
        }
      }
    };
  },
  computed: {
    cardStyleConfig() {
      return {
        ...this.typeConfig,
        ...this.styleConfig
      };
    }
  },
  watch: {
    //监听layerInfo获取layer对象和style配置
    layerInfo: {
      handler() {
        this.styleInfos = [];
        this.isShowRadio = false;
        if (this.layerInfo) {
          this.layer = this.$map?.getLayerById(this.layerInfo.id);
          if (this.layer) {
            //图层组
            if (this.layer instanceof LayerGroup) {
              let layerArray = this.layer.getLayers().getArray();
              if (layerArray && layerArray.length > 1) {
                this.isShowRadio = true;
                for (let index in layerArray) {
                  let layer = layerArray[index];
                  let styleInfo = {
                    id: layer.values_.info.id,
                    label: layer.values_.info.visibleLayers[index],
                    layer: layer,
                    style: layer.getLayerStyle() ? layer.getLayerStyle() : {}
                  };
                  this.styleInfos.push(styleInfo);
                }
              }
              this.layer = layerArray[0];
              this.radio = 0;
              this.style = this.layer.getLayerStyle()
                ? this.layer.getLayerStyle()
                : {};
            } else {
              //单图层
              this.style = this.layer.getLayerStyle()
                ? this.layer.getLayerStyle()
                : {};
            }
          } else {
            //未加载的图层取配置
            this.style = this.layerInfo.style ? this.layerInfo.style : {};
          }
          //三维加载逻辑
          if (this.$earth) {
            this.layer3d = this.$earth.viewer.shine.getLayer(
              this.layerInfo.id,
              'id'
            );
            if (this.layer3d) {
              this.layer3d.layer.show = false;
              let myLayerInfo = this.layerInfo;
              if (myLayerInfo.mapServerUrl) {
                let myUrl = myLayerInfo.mapServerUrl;
                let myId = myLayerInfo.id;
                this.temp3dLayerInfo = Object.assign({}, myLayerInfo);
                this.temp3dLayerInfo.styletest = this.style;
                this.temp3dLayerInfo.url = myUrl;
                this.temp3dLayerInfo.originId = myId;
                this.temp3dLayerInfo.id = myId + 'temp';
                this.temp3dLayerInfo.visible = true;
                this.$earth.viewer.shine.addLayer(this.temp3dLayerInfo);
              }
            } else {
              //未加载的图层取配置
              //this.style = this.layerInfo.style ? this.layerInfo.style : {};
            }
          }
        }
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    if (this.$map || this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    // 组件逻辑开始入口,如果组件有初始运行逻辑，请在此方法内编写，不要修改此方法名；如果没有可删除此方法。
    begin() {},
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    isSupportedLayerStyle(data) {
      let type = data.type;
      return (
        type === 'feature' ||
        type === 'feature-pbf' ||
        type === 'geoserver-wfs' ||
        type === 'geoserver-vectorTiled' ||
        type === 'vectorTiled'
      );
    },
    radioChange(value) {
      this.layer = this.styleInfos[value].layer;
      this.style = this.styleInfos[value].style;
    },
    changeTab() {
      this.style.type = this.selectTab;
      this.style.isGradient = true;
    },
    changeStyle() {
      // 2D修改样式
      this.layer.setLayerStyle(this.style);
      // 3D修改样式
      this.$earth.viewer.shine.removeLayer(this.temp3dLayerInfo, 'id');
      this.temp3dLayerInfo.styletest = this.style;
      this.temp3dLayerInfo.visible = true;
      this.$earth.viewer.shine.addLayer(this.temp3dLayerInfo);
    },
    cancel() {
      this.$emit('update:isShow', false);
    }
  }
};
</script>
