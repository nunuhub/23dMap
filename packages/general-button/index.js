import GeneralButton from './src/main';

/* istanbul ignore next */
GeneralButton.install = function (Vue) {
  Vue.component(GeneralButton.name, GeneralButton);
};

export default GeneralButton;
