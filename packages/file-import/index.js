import FileImport from './src/main';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

/* istanbul ignore next */
const withHocComponent = withConfigComponent(FileImport, {
  transform: (data) => {
    const { show, label, position, config = {} } = data;
    const fileTypes = [];
    for (let index in config.fileInfo) {
      let value = config.fileInfo[index].value;
      if (config[value] === true) {
        fileTypes.push(config.fileInfo[index]);
      }
    }
    return {
      isShow: show,
      title: label,
      position,
      fileTypes
    };
  }
});
withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;
