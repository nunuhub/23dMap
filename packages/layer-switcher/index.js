import LayerSwitcher from './src/main';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

/* istanbul ignore next */
const withHocComponent = withConfigComponent(LayerSwitcher, {
  // eslint-disable-next-line no-unused-vars
  transform: (data) => {
    const config = data.config;

    return {
      options: config
    };
  }
});

withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;
