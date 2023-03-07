import LayerManager from './src/layer-manager';
import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';

/* istanbul ignore next */
const withHocComponent = withConfigComponent(LayerManager, {
  transform: (data, mapConfig) => {
    const { show, label, position } = data;
    const isAutoTopTarget = mapConfig?.['layer_auto_top'];
    const maxLayerLimitTarget = mapConfig?.['max_layer_count'];
    const isAutoTop = isAutoTopTarget ? isAutoTopTarget.value : undefined;
    const maxLayerLimit = maxLayerLimitTarget
      ? Number(maxLayerLimitTarget.value)
      : undefined;

    return {
      isShow: show,
      title: label,
      position,
      layersInfo: data.layersInfo || [],
      isAutoTop,
      maxLayerLimit
    };
  }
});

withHocComponent.install = function (Vue) {
  Vue.component(withHocComponent.name, withHocComponent);
};

export default withHocComponent;
