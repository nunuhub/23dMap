import ToolBar from './src/main';
import { componentTypes } from './src/config';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

const withHocComponent = withConfigComponent(ToolBar, {
  transform: (data) => {
    const options = data.config;
    return {
      options
    };
  }
});

withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;

export { componentTypes as supportComponents };
