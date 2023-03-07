import ClusterLayer from './src/main';

/* istanbul ignore next */
ClusterLayer.install = function (Vue) {
  Vue.component(ClusterLayer.name, ClusterLayer);
};

export default ClusterLayer;
