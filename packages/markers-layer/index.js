import MarkersLayer from './src/main';

/* istanbul ignore next */
MarkersLayer.install = function (Vue) {
  Vue.component(MarkersLayer.name, MarkersLayer);
};

export default MarkersLayer;
