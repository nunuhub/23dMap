import MapShare from './src/main';

/* istanbul ignore next */
MapShare.install = function (Vue) {
  Vue.component(MapShare.name, MapShare);
};

export default MapShare;
