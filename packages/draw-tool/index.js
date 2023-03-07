import DrawTool from './src/main';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

/* istanbul ignore next */
const withHocComponent = withConfigComponent(DrawTool, {
  transform: (data) => {
    const { show, position, config = {} } = data;
    const options = {
      cad: config.cadControl,
      drawPoint: config.drawControl,
      drawLine: config.drawLineControl,
      drawPolygon: config.drawPolyControl,
      modify: config.modifyControl,
      clear: config.clearControl,
      rotate: config.rotateControl,
      buffer: config.bufferControl,
      union: config.unionControl,
      intersection: config.intersectionControl,
      difference: config.differenceControl
    };
    return {
      isShow: show,
      position,
      options
    };
  }
});
withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;
