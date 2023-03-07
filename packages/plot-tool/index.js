import PlotTool from './src/main';

/* istanbul ignore next */
PlotTool.install = function (Vue) {
  Vue.component(PlotTool.name, PlotTool);
};

export default PlotTool;
