import MapEarth from './src/map-earth';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

/* istanbul ignore next */
const withHocComponent = withConfigComponent(MapEarth, {
  transform: (data, mapConfig) => {
    const {
      viewMode,
      view,
      projection,
      center,
      controls,
      zoom,
      height,
      heading,
      pitch,
      roll
    } = mapConfig;

    return {
      viewMode,
      view,
      projection,
      center,
      controls,
      zoom: Number(zoom),
      height: Number(height),
      heading: Number(heading),
      pitch: Number(pitch),
      roll: Number(roll)
    };
  }
});
withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;
