import ConfigProvider from './src/config-provider';
import ConfigManager from './src/ConfigManager';
import ConfigManagerGt from './src/ConfigManagerGt';

/* istanbul ignore next */
ConfigProvider.install = function (Vue) {
  Vue.component(ConfigProvider.name, ConfigProvider);
};

export default ConfigProvider;

export { ConfigManager, ConfigManagerGt };
