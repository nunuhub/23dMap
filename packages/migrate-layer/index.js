import MigrateLayer from './src/main';

/* istanbul ignore next */
MigrateLayer.install = function (Vue) {
  Vue.component(MigrateLayer.name, MigrateLayer);
};

export default MigrateLayer;
