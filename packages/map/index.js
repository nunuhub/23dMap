import Map from './src/map';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

/* istanbul ignore next */
const withHocComponent = withConfigComponent(Map, {
  transform: (data, mapConfig) => {
    const { projection, center, controls, zoom } = mapConfig;

    return {
      projection,
      center,
      controls,
      zoom: Number(zoom)
    };
  }
});

withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;
