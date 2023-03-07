import IconSvg from './src/main';

/* istanbul ignore next */
IconSvg.install = function (Vue) {
  Vue.component(IconSvg.name, IconSvg);
};

export default IconSvg;
