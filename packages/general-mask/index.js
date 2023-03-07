import GeneralMask from './src/main';

/* istanbul ignore next */
GeneralMask.install = function (Vue) {
  Vue.component(GeneralMask.name, GeneralMask);
};

export default GeneralMask;
