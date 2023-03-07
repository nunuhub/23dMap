import DrawTool3d from './src/main';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';
import { getToolOptions, defaultOptions } from './src/ui-config';
/* istanbul ignore next */
const withHocComponent = withConfigComponent(DrawTool3d, {
  transform: (data, mapConfig, clientAdmin) => {
    const { show, position, config = {} } = data;
    const { url, schemeId } = clientAdmin;
    Object.assign(defaultOptions, config);
    // 形如'***Show'（polygonShow=false）,即对该功能的显隐进行设置。
    let isHorizontal = config.isHorizontal;
    let options = { ...defaultOptions };
    for (let [key, value] of Object.entries(defaultOptions)) {
      let strCheck = key.match(/Control\b/);
      if (strCheck && !value) {
        key = key.replace('Control', '');
        options[key] = false;
      }
    }
    let toolOptions = getToolOptions(options);
    return {
      isShow: show,
      position,
      isHorizontal,
      toolOptions,
      url,
      schemeId
    };
  }
});
withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;
