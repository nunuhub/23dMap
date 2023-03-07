import BubbleLayer from './src/main';

/* istanbul ignore next */
BubbleLayer.install = function (Vue) {
  Vue.component(BubbleLayer.name, BubbleLayer);
};

export default BubbleLayer;
