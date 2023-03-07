import RollerBlind from './src/main';

/* istanbul ignore next */
RollerBlind.install = function (Vue) {
  Vue.component(RollerBlind.name, RollerBlind);
};

export default RollerBlind;
