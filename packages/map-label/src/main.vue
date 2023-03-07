<template>
  <div class="sh-map-label">
    <general-container
      :is-show.sync="visible"
      :style-config="cardStyleConfig"
      :title="title ? title : '地图标注'"
      :position="position"
      :img-src="imgSrc ? imgSrc : 'map-label'"
      :berth="berth"
      :theme="theme"
      :theme-style="cardThemeStyle"
      :drag-enable="dragEnable"
      :only-container="onlyContainer"
      :append-to-body="appendToBody"
      @change:isShow="changeIsShow"
    >
      <div class="map-label-content">
        <!--  配置界面  -->
        <div class="config-body">
          <el-form
            ref="form"
            :model="labelConfig"
            size="small"
            label-width="80px"
          >
            <el-form-item label="标注文字">
              <el-input
                v-model="labelConfig.text"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 4 }"
                @change="updateLabel"
              />
            </el-form-item>
            <el-form-item label="文字大小:">
              <div style="display: flex; align-items: center">
                <el-input-number
                  v-model="labelConfig.textSize"
                  style="width: 80px"
                  controls-position="right"
                  :min="12"
                  :max="100"
                  @change="updateLabel"
                >
                </el-input-number>
                <span style="margin-left: 24px">文字颜色:</span>
                <el-color-picker
                  v-model="labelConfig.textColor"
                  style="margin-left: 8px"
                  :show-alpha="true"
                  @change="updateLabel"
                >
                </el-color-picker>
              </div>
            </el-form-item>
            <el-form-item label="边框颜色:">
              <div style="display: flex; align-items: center">
                <el-color-picker
                  v-model="labelConfig.strokeColor"
                  :show-alpha="true"
                  @change="updateLabel"
                >
                </el-color-picker>
                <span style="margin-left: 72px">填充颜色:</span>
                <el-color-picker
                  v-model="labelConfig.fillColor"
                  style="margin-left: 8px"
                  :show-alpha="true"
                  @change="updateLabel"
                >
                </el-color-picker>
              </div>
            </el-form-item>
          </el-form>
        </div>
        <div class="bottom-btn-content">
          <el-button type="primary" size="small" @click="addLabel"
            >新增</el-button
          >
          <el-button
            v-if="isDelete"
            type="primary"
            size="small"
            @click="stopDelete"
            >取消</el-button
          >
          <el-button v-else type="primary" size="small" @click="startDelete"
            >删除</el-button
          >
          <el-button type="warning" size="small" @click="deleteAll"
            >清空</el-button
          >
        </div>
      </div>
    </general-container>
  </div>
</template>

<script>
import Label from './Label';
import VectorSource from 'ol/source/Vector';
import { Vector as VectorLayer } from 'ol/layer';
import { Pointer } from 'ol/interaction';
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';

export default {
  name: 'ShMapLabel',
  components: {
    GeneralContainer
  },
  mixins: [common, emitter, generalCardProps],
  props: {},
  data() {
    this.labelMap = new Map();
    return {
      typeConfig: {
        size: {
          width: '320px'
        }
      },
      isDelete: false,
      labelConfig: {
        text: '新增标注',
        textSize: 16,
        textColor: '#ffffff',
        fillColor: 'rgb(79, 215, 228)',
        strokeColor: 'rgb(243,243,243)'
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
  mounted() {
    if (this.$map) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    changeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    begin() {
      var tempLabelLayer = new VectorLayer({
        id: 'tempLabelLayer',
        zIndex: 999999,
        source: new VectorSource()
      });
      this.$map.addLayer(tempLabelLayer);

      this.$map.on('moveend', () => {
        for (let label of this.labelMap.values()) {
          let anchorPixel = this.$map.getPixelFromCoordinate(label.anchorPoint);
          let textLeftBottomPixelX = anchorPixel[0] - label.deltaXY[0];
          let textLeftBottomPixelY = anchorPixel[1] - label.deltaXY[1];
          label.textLeftBottomMapPoint = this.$map.getCoordinateFromPixel([
            textLeftBottomPixelX,
            textLeftBottomPixelY
          ]);
          label.update();
        }
      });
      this.moveInteraction = new Pointer({
        handleDownEvent: this.startMoveFeature,
        handleDragEvent: this.moveFeature,
        handleUpEvent: this.stopMoveFeature
      });
      this.$map.addInteraction(this.moveInteraction);
      this.$map.on('dblclick', (event) => {
        this.selectLabel && this.selectLabel.unSelect();
        this.selectLabel = null;
        if (this.visible) {
          event.preventDefault();
          event.stopPropagation();
          this.selectFeature = this.getFeatureAtPixel(event.pixel);
          if (this.selectFeature) {
            if (this.selectFeature.get('key')) {
              this.selectLabel = this.labelMap.get(
                this.selectFeature.get('key')
              );
              if (this.selectLabel) {
                this.selectLabel.select();
                this.labelConfig = JSON.parse(
                  JSON.stringify(this.selectLabel.labelConfig)
                );
              }
            }
          }
        }
      });
    },
    unSelectLabel() {
      if (this.selectLabel) {
        this.updateLabel();
        this.selectLabel.unSelect();
        this.selectLabel = null;
      }
    },
    changeDialog(isShow) {
      this.isDialogShow = isShow;
    },
    addLabel() {
      this.stopDelete();
      this.unSelectLabel();
      let label = new Label(
        this.$map,
        JSON.parse(JSON.stringify(this.labelConfig))
      );
      this.$map.once('click', (evt) => {
        label.create(evt.coordinate);
        this.labelMap.set(label.key, label);
      });
    },
    updateLabel() {
      if (this.selectLabel) {
        this.selectLabel.labelConfig = JSON.parse(
          JSON.stringify(this.labelConfig)
        );
        this.selectLabel.updateText();
        this.selectLabel.update();
      }
    },
    startDelete() {
      this.unSelectLabel();
      this.isDelete = true;
      for (let label of this.labelMap.values()) {
        label.startDelete();
      }
      this.$map.on('click', this.deleteEvent);
    },
    stopDelete() {
      this.isDelete = false;
      for (let label of this.labelMap.values()) {
        label.stopDelete();
      }
      this.$map.un('click', this.deleteEvent);
    },
    //map删除的点击事件
    deleteEvent(event) {
      event.preventDefault();
      event.stopPropagation();
      let selectFeature = this.getFeatureAtPixel(event.pixel);
      if (selectFeature) {
        if (
          selectFeature.get('key') &&
          selectFeature.get('type') === 'anchor'
        ) {
          let selectLabel = this.labelMap.get(selectFeature.get('key'));
          if (selectLabel) {
            selectLabel.delete();
            this.labelMap.delete(selectLabel.key);
          }
        }
      }
    },
    deleteAll() {
      this.unSelectLabel();
      for (let label of this.labelMap.values()) {
        label.delete();
      }
      this.labelMap.clear();
    },
    startMoveFeature(evt) {
      this.featureToMove = this.getFeatureAtPixel(evt.pixel);
      if (this.featureToMove) {
        if (this.featureToMove.get('key')) {
          this.label = this.labelMap.get(this.featureToMove.get('key'));
          if (this.label) {
            this.downCoordinate = evt.coordinate;
            this.textLeftBottomMapPoint = this.label.textLeftBottomMapPoint;
            return true;
          }
        }
      }
      return false;
    },
    moveFeature(evt) {
      this.$map.getTargetElement().style.cursor = 'grabbing';
      let type = this.featureToMove.get('type');
      if (type === 'anchor') {
        this.label.anchorPoint = evt.coordinate;
        this.label.update();
      } else {
        let deltaX = evt.coordinate[0] - this.downCoordinate[0];
        let deltaY = evt.coordinate[1] - this.downCoordinate[1];
        this.label.textLeftBottomMapPoint = [
          this.textLeftBottomMapPoint[0] + deltaX,
          this.textLeftBottomMapPoint[1] + deltaY
        ];
        this.label.update();
      }
    },
    stopMoveFeature() {
      this.$map.getTargetElement().style.cursor = '';
      return false;
    },
    getFeatureAtPixel(pixel) {
      const feature = (this.$map.getFeaturesAtPixel(pixel, {
        hitTolerance: 2,
        layerFilter: (layer) => layer.get('id') === 'tempLabelLayer'
      }) || [])[0];
      return feature;
    }
  }
};
</script>
