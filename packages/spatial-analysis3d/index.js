import SpatialAnalysis3d from './src/main';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

/* istanbul ignore next */
const withHocComponent = withConfigComponent(SpatialAnalysis3d, {
  transform: (data) => {
    const { show, position } = data;

    return {
      isShow: show,
      position
    };
  }
});

withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;
