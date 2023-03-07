import MasspointLayer from './src/main';

/* istanbul ignore next */
MasspointLayer.install = function (Vue) {
  Vue.component(MasspointLayer.name, MasspointLayer);
};

export default MasspointLayer;
