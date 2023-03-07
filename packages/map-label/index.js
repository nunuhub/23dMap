import MapLabel from './src/main';

/* istanbul ignore next */
MapLabel.install = function (Vue) {
  Vue.component(MapLabel.name, MapLabel);
};

export default MapLabel;
