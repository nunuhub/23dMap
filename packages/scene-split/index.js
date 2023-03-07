import SceneSplit from './src/main';

/* istanbul ignore next */
SceneSplit.install = function (Vue) {
  Vue.component(SceneSplit.name, SceneSplit);
};

export default SceneSplit;
