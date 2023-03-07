import GeneralBar from './src/main';

/* istanbul ignore next */
GeneralBar.install = function (Vue) {
  Vue.component(GeneralBar.name, GeneralBar);
};

export default GeneralBar;
