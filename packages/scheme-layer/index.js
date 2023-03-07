import SchemeLayer from './src/main';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

/* istanbul ignore next */
const withHocComponent = withConfigComponent(SchemeLayer, {
  transform: (data) => {
    const { show, label, position } = data;
    const config = data.config;
    return {
      isShow: show,
      title: label,
      position,
      config
    };
  }
});
withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;
