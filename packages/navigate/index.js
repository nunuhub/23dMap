import Navigate from './src/main';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

/* istanbul ignore next */
const withHocComponent = withConfigComponent(Navigate, {
  transform: (data, mapConfig, clientAdmin) => {
    const { show, label, position } = data;
    const { initXZQ, origin, xzqdm, xzqmc, layerName } = data.config;
    const { url } = clientAdmin;
    return {
      isShow: show,
      title: label,
      position,
      xzqLayer: {
        url: url + '/xzq',
        origin,
        xzqdm,
        xzqmc,
        layerName
      },
      initXZQ
    };
  }
});
withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;
