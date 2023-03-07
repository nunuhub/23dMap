import Earth from './src/earth.vue';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

/* istanbul ignore next */
const withHocComponent = withConfigComponent(Earth, {
  transform: (data, mapConfig) => {
    let { view, projection, center, height, controls, heading, roll, pitch } =
      mapConfig;

    if (view === 'map') {
      heading = 0;
      roll = 0;
      pitch = -90;
    }

    return {
      projection,
      center,
      controls,
      height: Number(height),
      heading: Number(heading),
      roll: Number(roll),
      pitch: Number(pitch)
    };
  }
});

withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;
