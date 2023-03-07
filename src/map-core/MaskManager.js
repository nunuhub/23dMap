import GeoJSON from 'ol/format/GeoJSON';
import Mask from 'ol-ext/filter/Mask';
import { Fill } from 'ol/style';
import getMaskGeoJson from './mask';

class MaskManager {
  constructor(map) {
    this.map = map;
    this.mask = null;
  }

  static getInstance(map) {
    if (!MaskManager.instanceMap) {
      MaskManager.instanceMap = new Map();
    }
    if (map) {
      const id = map.mapid;
      if (!MaskManager.instanceMap.get(id)) {
        const instance = new MaskManager(map);
        MaskManager.instanceMap.set(id, instance);
      }
      return MaskManager.instanceMap.get(id);
    } else {
      return MaskManager.instanceMap.values().next().value;
    }
  }

  async addMask(options) {
    var self = this;
    // 自己有传值就用传值的options,没传值就用运维端配置
    if (options) {
      this.maskOptions = options;
    }
    // 在掩膜未加载完毕就切换行政区的话 会通过maskPromise去等待上一次掩膜加载完毕，再进行新一次的加载，防止异步导致第一次覆盖了第二次
    this.maskPromise = new Promise((resolve) => {
      // 获取geojson
      getMaskGeoJson(
        this.map.getView().getProjection().getCode(),
        this.maskOptions
      ).then((geojson) => {
        // 添加遮罩，定义掩摸图层
        const maskFeature = new GeoJSON().readFeature(geojson);
        if (maskFeature != null) {
          var mask = new Mask({
            feature: maskFeature,
            inner: false,
            fill: new Fill({
              color: [255, 255, 255, 1]
            })
          });
          self.mask = mask;
          self.map.mask = self.mask;
        }
        self.map.getLayers().forEach((layer) => {
          if (maskFeature != null) {
            layer.addFilter(self.mask);
          }
        });
        // self.map.getLayerById('drawLayer').addFilter(self.mask);
        resolve();
      });
    });
  }

  refresh() {
    if (this.maskOptions && this.maskPromise) {
      this.maskPromise.then(() => {
        this.clear();
        this.addMask(this.maskOptions);
      });
    }
  }

  clear() {
    if (this.mask) {
      this.map.getLayers().forEach((layer) => {
        layer.removeFilter(this.mask);
      });
      this.map.mask = undefined;
    }
  }
}

export default MaskManager;
