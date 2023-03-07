import UnionTool from './src/main';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

/* istanbul ignore next */
const withHocComponent = withConfigComponent(UnionTool, {
  transform: (data) => {
    const { show, label, position } = data;

    return {
      isShow: show,
      title: label,
      position
    };
  }
});

withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;
