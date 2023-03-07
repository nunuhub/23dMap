import ExportMap from './src/main';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

/* istanbul ignore next */
const withHocComponent = withConfigComponent(ExportMap, {
  configName: 'ExportMap',
  transform: (data, overAll) => {
    const config = JSON.parse(data.config || '{}');
    const scales = config.scaleArr;
    const url = overAll.find((item) => item.key === 'export_map_server')?.value;

    return {
      scales,
      url
    };
  }
});
withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;
