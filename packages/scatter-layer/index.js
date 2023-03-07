import ScatterLayer from './src/main';

/* istanbul ignore next */
ScatterLayer.install = function (Vue) {
  Vue.component(ScatterLayer.name, ScatterLayer);
};

export default ScatterLayer;
