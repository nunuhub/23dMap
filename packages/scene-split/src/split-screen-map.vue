<template>
  <div v-show="isShow" :id="mapId" ref="linkmap" class="sh-linkmap">
    <div class="linkmapcontent">
      <span class="title">{{ title }}</span>
      <label
        class="el-icon-close"
        type="button"
        title="关闭窗口"
        @click="removeLinkMap(this)"
      ></label>
    </div>
    <el-select
      v-show="isSelect"
      v-model="label"
      placeholder="请选择图层"
      :filterable="true"
      :clearable="true"
      @change="changeLayer($event)"
    >
      <el-option
        v-for="item in layerData"
        :key="item.id"
        :label="item.label"
        :value="item.label"
      >
      </el-option>
    </el-select>
  </div>
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { defaults as defaultControls } from 'ol/control';
import ShineMap from 'shinegis-client-23d/src/map-core/ShineMap';
import LayerGenerater from 'shinegis-client-23d/src/map-core/LayerGenerater';

export default {
  name: 'SceneSplitMap',
  mixins: [commom, emitter],
  props: {
    layerData: {
      type: Array
    },
    mapId: {
      type: String
    },
    isSelect: {
      type: Boolean
    },
    mainLayer: {
      type: Object
    }
  },
  data() {
    return {
      label: '',
      isShow: true,
      linkLayer: '',
      linkMap: '',
      title: '',
      //ol的对象
      layer: []
    };
  },
  mounted() {
    this.createLinkMap();
    this.addLinkMap();
    let dataOptions = this.$map.layerManager.checkedLayers;
    dataOptions.forEach((item) => {
      if (item.isBaseMapLayer) {
        this.loadLayer(item);
      }
    });
    this.subscribe.$on(
      'layer-switcher:change:checkedLayer',
      (type, layer, target) => {
        if (target === 'map') {
          if (type === 'add') {
            this.loadLayer(layer);
          } else {
            this.linkMap
              .getLayers()
              .getArray()
              .forEach((item) => {
                if (layer.id === item.values_.id) {
                  this.linkMap.removeLayer(item);
                }
              });
          }
        }
      }
    );
  },
  methods: {
    changeLayer() {
      //通过图层label找到的图层数据，所以图层必须保证label不重复
      this.removeLayer();
      this.linkLayer = this.layerData.find((item) => item.label === this.label);
      this.loadLayer(this.linkLayer);
    },
    //  加载图层
    loadLayer(layer) {
      return new Promise((resolve, reject) => {
        let data;
        if (typeof layer === 'string') {
          data = this.layerManager.getLayerDataById(layer);
          if (!data) {
            data = this.layerManager.getLayerDataByLayerTag(layer);
            !data && reject('未能识别图层信息');
          }
        } else {
          data = layer;
        }
        const layerGenerater = new LayerGenerater(this.$map);
        if (data instanceof Array) {
          const promises = [];
          for (const layerItem of data) {
            promises.push(layerGenerater.generate(layerItem));
          }
          Promise.all(promises).then((result) => {
            resolve(this._addLinkMap(result));
          });
        } else {
          layerGenerater.generate(data).then((layer) => {
            this.layer = layer;
            //选择框选中项
            this.label = this.layer.values_.info.label;
            resolve(this._addLinkMap([layer]));
          });
        }
      });
    },
    //在mapid节点上追加节点
    addLinkMap() {
      this.Elmap = this.$map.getTargetElement().parentElement;
      let Ellinkmap = this.$refs.linkmap;
      this.Elmap.append(Ellinkmap);
      //通过图层右键，图层信息会直接传过来
      if (JSON.stringify(this.mainLayer) !== '{}') {
        this.linkLayer = this.mainLayer;
        this.loadLayer(this.mainLayer);
        this.title = this.mainLayer.label;
      } else {
        //地图默认加载选择框中的第一项
        if (this.layerData.length !== 0) {
          this.label = this.layerData[0].label;
          this.loadLayer(this.layerData[0]);
        }
      }
    },
    //移除图层
    removeLayer() {
      if (this.linkLayer && this.linkMap) {
        this.linkMap.removeLayer(this.layer);
      }
    },
    createLinkMap(layer) {
      this.linkMap = new ShineMap({
        target: this.mapId,
        layers: layer,
        view: this.$map.getView(),
        controls: defaultControls({
          zoom: false
        })
      });
    },
    _addLinkMap(layer) {
      this.linkMap.addLayer(layer[0]);
      this.$map.updateSize();
      this.updateSize();
      return this.mapId;
    },
    updateSize() {
      this.linkMap.updateSize();
    },
    //移除
    removeLinkMap() {
      this.$emit('click', this.mapId);
    }
  }
};
</script>
