import HawkEye from './src/main';

/* istanbul ignore next */
HawkEye.install = function (Vue) {
  Vue.component(HawkEye.name, HawkEye);
};

export default HawkEye;
