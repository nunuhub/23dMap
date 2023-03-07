import FullFigure from './src/main';

/* istanbul ignore next */
FullFigure.install = function (Vue) {
  Vue.component(FullFigure.name, FullFigure);
};

export default FullFigure;
