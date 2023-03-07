import CuttingLayer from './src/main';
/* istanbul ignore next */
CuttingLayer.install = function (Vue) {
  Vue.component(CuttingLayer.name, CuttingLayer);
};

export default CuttingLayer;
