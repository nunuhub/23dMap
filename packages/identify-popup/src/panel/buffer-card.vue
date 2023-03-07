<template>
  <div class="sh-identify-popup-buffer-card">
    <el-form label-width="80px" size="mini" :model="buffer">
      <el-form-item label="图形来源">
        <el-select v-model="buffer.source" placeholder="请选择图形来源">
          <el-option label="绘制" value="draw"></el-option>
          <el-option label="选择" value="select"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-show="buffer.source === 'draw'" label="绘制类型">
        <el-radio-group v-model="buffer.drawType" class="drawType">
          <el-radio label="Point">点</el-radio>
          <el-radio label="LineString">线</el-radio>
          <el-radio label="Polygon">面</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="缓冲半径">
        <div class="input-group">
          <el-input-number
            v-model="buffer.radius"
            controls-position="right"
            :min="0"
            :step="10"
          ></el-input-number>
          <div class="append">米</div>
        </div>
      </el-form-item>
    </el-form>
    <div class="btns">
      <el-button type="primary" size="mini" @click="bufferIdentify"
        >查询</el-button
      >
    </div>
  </div>
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { Draw } from 'ol/interaction.js';
import GeoJSON from 'ol/format/GeoJSON';
import { buffer as turfBuffer } from '@turf/turf';

const geojsonFormat = new GeoJSON();

export default {
  name: 'ShIdentifyPopupBufferCard',
  mixins: [commom, emitter],
  props: {
    identify: {
      type: Object
    },
    currentQueryType: {
      type: String
    },
    defaultBufferRadius: {
      type: Number,
      default: 100
    }
  },
  data() {
    this.draw = null;
    this.originFeature = null;
    return {
      buffer: {
        source: 'draw',
        drawType: 'Point',
        radius: this.defaultBufferRadius
      }
    };
  },
  watch: {
    'buffer.source': {
      handler(value, oldVal) {
        if (oldVal === 'select') {
          this.$emit('changeSelect', false);
          this.subscribe.$off('select-tool:selected', this.onSelected);
        }
        if (value === 'draw') {
          this.createDraw(this.buffer.drawType);
        } else if (value === 'select') {
          this.closeDraw();
          this.subscribe.$on('select-tool:selected', this.onSelected);
          this.$emit('changeSelect', true);
        }
        this.$emit('update:currentQueryType', `buffer-${value}`);
      },
      immediate: true
    },
    'buffer.drawType': function (value) {
      this.closeDraw();
      if (this.buffer.source === 'draw') {
        this.createDraw(value);
      }
    },
    'buffer.radius': function () {
      if (this.originFeature) {
        this.setBufferedFeature(this.originFeature);
      }
    }
  },
  beforeDestroy() {
    this.$emit('changeSelect', false);
    this.subscribe.$off('select-tool:selected', this.onSelected);
    this.clearDrawLayer();
    this.closeDraw();
  },
  methods: {
    createDraw(type) {
      const source = this.$map.getLayerById('identifyDrawLayer').getSource();
      const params = {
        source: source,
        type
      };
      this.draw = new Draw(params);
      this.draw.on('drawend', (evt) => {
        this.originFeature = evt.feature.clone();
        setTimeout(() => this.setBufferedFeature(evt.feature), 0);
      });
      this.$map.addInteraction(this.draw);
    },
    closeDraw() {
      this.clearDrawLayer();
      this.originFeature = null;
      if (this.draw) {
        this.$map.removeInteraction(this.draw);
        this.draw = null;
      }
    },
    clearDrawLayer() {
      this.$map.getLayerById('identifyDrawLayer').getSource().clear();
    },
    onSelected(e) {
      if (e) {
        const features = geojsonFormat.readFeatures(e);
        if (features.length > 0) {
          this.originFeature = features[0];
          this.setBufferedFeature(features[0]);
        }
      }
    },
    setBufferedFeature(feature) {
      this.clearDrawLayer();
      if (!feature) return;
      const projectionCode = this.$map.getView().getProjection().getCode();
      const geom = feature.getGeometry().transform(projectionCode, 'EPSG:4326');
      const buffered = turfBuffer(
        geojsonFormat.writeGeometryObject(geom),
        this.buffer.radius / 1000
      );
      let bufferedFeature;
      // radius为0时，缓冲结果为空
      if (buffered) {
        bufferedFeature = geojsonFormat.readFeature(buffered);
      } else {
        bufferedFeature = feature;
      }
      bufferedFeature.setGeometry(
        bufferedFeature.getGeometry().transform('EPSG:4326', projectionCode)
      );
      this.$map
        .getLayerById('identifyDrawLayer')
        .getSource()
        .addFeature(bufferedFeature);
    },
    bufferIdentify() {
      const feature = this.$map
        .getLayerById('identifyDrawLayer')
        .getSource()
        .getFeatures()[0];
      if (feature) {
        this.identify.identifyLayer(feature);
        setTimeout(() => {
          this.clearDrawLayer();
          this.originFeature = null;
        }, 500);
      }
    }
  }
};
</script>
