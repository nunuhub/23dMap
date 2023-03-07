import HeatmapLayer from './src/main';

/* istanbul ignore next */
HeatmapLayer.install = function (Vue) {
  Vue.component(HeatmapLayer.name, HeatmapLayer);
};

export default HeatmapLayer;
