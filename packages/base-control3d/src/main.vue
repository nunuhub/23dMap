<template>
  <div class="sh-base-control-3d">
    <div v-show="shouldShow">
      <general-container
        ref="container"
        :is-show.sync="visible"
        :style-config="styleConfig"
        :title="title ? title : '基础配置'"
        :position="position"
        :img-src="imgSrc ? imgSrc : 'base-control-3d'"
        :berth="berth"
        :theme="theme"
        :theme-style="cardThemeStyle"
        :drag-enable="dragEnable"
        @change:isShow="onChangeIsShow"
      >
        <page-form
          :ref-obj.sync="formInfo.ref"
          :data="formInfo.data"
          :field-list="formInfo.fieldList"
          :label-width="formInfo.labelWidth"
          @handleEvent="handleEvent"
        />
      </general-container>
    </div>
  </div>
</template>

<script>
/* eslint-disable vue/no-mutating-props */
import common from 'shinegis-client-23d/src/mixins/common';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import * as Cesium from 'cesium_shinegis_earth';
import PageForm from './page-form.vue';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import { FormLists } from './ui-config';
import Weather from 'shinegis-js-api/Weather';
let wea;

export default {
  name: 'ShBaseControl3d',
  components: {
    PageForm,
    GeneralContainer
  },
  mixins: [common, generalCardProps, emitter],
  data() {
    return {
      formInfo: {
        ref: null,
        data: {
          rain: false,
          rainfall: -1,
          snow: false,
          snowfall: -1,
          atmosphericProfile: false,
          fog: false,
          controlType: 'weatherControl',
          brightness_changer: false,
          anti_aliasing: false,
          base_light: false,
          terrain_light: false,
          atmospheric_rendering: false,
          brightness: 100,
          screen_adaption: false,
          fps_changer: false,
          deep_inspection: false,
          front_keyboard: 'w',
          back_keyboard: 's',
          left_keyboard: 'a',
          right_keyboard: 'd',
          above_keyboard: '↑',
          below_keyboard: '↓',
          clockwise_keyboard: '←',
          anticlockwise_keyboard: '→'
        },
        fieldList: [
          {
            title: { name: '这里为空', showList: true },
            header: {
              value: 'controlType',
              list: [
                {
                  title: '天气控制',
                  svg: 'weather-control',
                  value: 'weatherControl'
                },
                {
                  title: '高级控制',
                  svg: 'base-control',
                  value: 'baseControl'
                }
                /* {
                  title: '键盘控制',
                  svg: 'keyboard-control',
                  value: 'keyboardControl'
                } */
              ]
            },
            formList: FormLists['weatherControl']
          }
        ],
        labelWidth: '70px'
      }
    };
  },
  computed: {
    shouldShow() {
      return this.currentView === 'earth';
    }
  },
  mounted() {
    if (this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    begin() {
      let viewer;
      viewer = this.$earth.viewer;
      this.initBaseComponent(viewer);
      this.initDialogState(viewer);
    },
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    initBaseComponent(viewer) {
      viewer.scene.globe.depthTestAgainstTerrain = true;
      wea = new Weather(this.$earth);
    },
    initDialogState(viewer) {
      // 保持面板状态和场景配置对应。
      // eslint-disable-next-line no-unreachable
      let scene = viewer.scene;
      let data = this.formInfo.data;
      data.atmosphericProfile = scene.skyAtmosphere.show;
      data.fog = scene.fog.enabled;
      data.terrain_light = scene.globe.enableLighting;
      data.atmospheric_rendering =
        scene.skyAtmosphere.show && scene.globe.showGroundAtmosphere;
      data.screen_adaption = viewer.resolutionScale !== 1;
      data.anti_aliasing = scene.fxaa;
      data.base_light = scene.globe.enableLighting && viewer.shadows;
      data.fps_changer = scene.debugShowFramesPerSecond;
      data.deep_inspection = scene.globe.depthTestAgainstTerrain;
    },
    handleEvent(value, num) {
      const viewer = this.$earth.viewer;
      if (!viewer) return;
      switch (value) {
        case 'controlType': {
          this.formInfo.data.controlType = num;
          let fieldList = this.formInfo.fieldList[0];
          fieldList.formList = FormLists[num];
          break;
        }
        case 'rain':
        case 'rainfall': {
          let rain = this.formInfo.data.rain;
          let rainfall = this.formInfo.data.rainfall;
          if (rain) {
            /*  this.formInfo.data.snow = false;
            this.formInfo.data.snowfall = -1; */
            this.formInfo.data.rainfall =
              rainfall === -1 ? rainfall + 1 : rainfall;
            rainfall = this.formInfo.data.rainfall;
            wea.rain(rainfall + 1);
          } else {
            this.formInfo.data.rainfall = -1;
            wea.rain(0);
          }
          break;
        }
        case 'snow':
        case 'snowfall': {
          let snow = this.formInfo.data.snow;
          let snowfall = this.formInfo.data.snowfall;
          if (snow) {
            this.formInfo.data.snowfall =
              snowfall === -1 ? snowfall + 1 : snowfall;
            snowfall = this.formInfo.data.snowfall;
            wea.snow(snowfall + 1);
          } else {
            this.formInfo.data.snowfall = -1;
            wea.snow(0);
          }
          break;
        }
        case 'brightness_changer':
        case 'brightness': {
          let brightness_changer = this.formInfo.data.brightness_changer;
          let brightness = this.formInfo.data.brightness;
          let scene = viewer.scene;
          let stages = scene.postProcessStages;
          if (brightness_changer) {
            viewer.scene.brightness =
              viewer.scene.brightness ||
              stages.add(
                Cesium.PostProcessStageLibrary.createBrightnessStage()
              );
            viewer.scene.brightness.enabled = true;
            viewer.scene.brightness.uniforms.brightness = Number(
              brightness / 100
            );
          } else {
            viewer.scene.brightness
              ? (viewer.scene.brightness.enabled = false)
              : null;
          }
          break;
        }
        default:
          this.execute(value, num);
      }
    },
    execute(key, value) {
      const viewer = this.$earth.viewer;
      if (!viewer) return;
      const scene = viewer.scene;
      switch (key) {
        case 'rain':
          wea.rain(value); //0,1,2,3,4
          break;
        case 'snow':
          wea.snow(value);
          break;
        case 'atmosphericProfile': {
          scene.skyAtmosphere.show = value;
          break;
        }
        case 'fog': {
          scene.fog.enabled = value;
          break;
        }
        case 'base_light': {
          scene.globe.enableLighting = value;
          viewer.shadows = value;
          viewer.terrainShadows = value ? 1 : 3;
          break;
        }
        case 'terrain_light': {
          scene.globe.enableLighting = !!value;
          break;
        }
        case 'anti_aliasing': {
          scene.fxaa = value;
          scene.postProcessStages.fxaa.enabled = value;
          break;
        }
        case 'screen_adaption': {
          if (value) {
            viewer.resolutionScale = window.devicePixelRatio;
          } else {
            viewer.resolutionScale = 1;
          }
          break;
        }
        case 'atmospheric_rendering': {
          scene.skyAtmosphere.show = value;
          scene.globe.showGroundAtmosphere = value;
          this.formInfo.data.atmosphericProfile = value;
          break;
        }
        case 'fps_changer': {
          scene.debugShowFramesPerSecond = value;
          break;
        }
        case 'deep_inspection': {
          scene.globe.depthTestAgainstTerrain = value;
          break;
        }
      }
    }
  }
};
</script>
