import FullScreen from './src/main';

/* istanbul ignore next */
FullScreen.install = function (Vue) {
  Vue.component(FullScreen.name, FullScreen);
};

export default FullScreen;
