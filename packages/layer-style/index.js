import LayerStyle from './src/main';

/* istanbul ignore next */
LayerStyle.install = function (Vue) {
  Vue.component(LayerStyle.name, LayerStyle);
};

export default LayerStyle;
