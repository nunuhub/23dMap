import BookMark3d from './src/main';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

/* istanbul ignore next */
const withHocComponent = withConfigComponent(BookMark3d, {
  transform: (data, mapConfig, clientAdmin) => {
    const { show, label, position } = data;
    const { url, schemeId } = clientAdmin;

    return {
      isShow: show,
      title: label,
      position,
      url,
      schemeId
    };
  }
});

withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;
