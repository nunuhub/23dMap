import IdentifyPopup from './src/main';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

const withHocComponent = withConfigComponent(IdentifyPopup, {
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
