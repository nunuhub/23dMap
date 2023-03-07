import HighchartsLayer from './src/main';

/* istanbul ignore next */
HighchartsLayer.install = function (Vue) {
  Vue.component(HighchartsLayer.name, HighchartsLayer);
};

export default HighchartsLayer;
