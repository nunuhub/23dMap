import FileExport from './src/main';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

/* istanbul ignore next */
const withHocComponent = withConfigComponent(FileExport, {
  configName: 'FileExport',
  transform: (data) => {
    const fileTypeConfig = data.config ? data.config : {};
    const fileTypes = [];
    for (let index in fileTypeConfig.fileInfo) {
      let value = fileTypeConfig.fileInfo[index].value;
      if (fileTypeConfig[value] === true) {
        fileTypes.push(fileTypeConfig.fileInfo[index]);
      }
    }
    return {
      fileTypes
    };
  }
});
withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;
