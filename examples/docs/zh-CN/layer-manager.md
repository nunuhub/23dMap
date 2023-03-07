## LayerManager 图层目录

图层目录组件

### 基本使用

可通过图层目录控制图层加载、移除

:::demo

```html
<div style="height:100%;width:100%">
  <sh-map>
    <sh-layer-manager :layersInfo="widgetinfo" />
  </sh-map>
</div>

<script>
  export default {
    data() {
      this.widgetinfo = [
        {
          showIndex: 1,
          parent: null,
          initChecked: 'false',
          id: '00000001000100060001000000000000',
          label: '图层目录',
          tp: 'directory',
          guid: 'db125b76-5a90-2e5e-598c-6158173707b0',
          editing: false
        },
        {
          showIndex: 3,
          parent: '00000001000100060001000000000000',
          initChecked: 'false',
          id: '00000001000100060001000000000001',
          label: '基础地图',
          tp: 'directory',
          guid: 'e81731c2-19af-f9e4-839e-7b4a53403835',
          editing: false
        },
        {
          parent: '00000001000100060001000000000001',
          showIndex: 6,
          serverOrigin: 'other',
          identifyField: [],
          geotype: 'polygon',
          mapIndex: 2,
          topology: '2',
          label: '天地图影像地图',
          type: 'tdt',
          url: 'http://t0.tianditu.gov.cn/img_c/wmts?tk=17d1619c13e4508bc1945bd59de4edf8',
          visibleLayers: ['img'],
          layerTag: 'TDT_img',
          initChecked: true,
          id: '00000001000100060001000000001002',
          opacity: 1,
          region: 'img(img)',
          tp: 'layer',
          group: '1',
          guid: '6db09a92-c9fa-64cc-80d2-2ee7dd8e90f9',
          editing: false,
          children: []
        },
        {
          showIndex: 8,
          parent: '00000001000100060001000000000001',
          serverOrigin: 'other',
          identifyField: [],
          mapIndex: 4,
          geotype: 'polygon',
          mobile: false,
          label: '天地图电子地图',
          mobileOpacity: false,
          type: 'tdt',
          url: 'http://t0.tianditu.gov.cn/vec_c/wmts?tk=17d1619c13e4508bc1945bd59de4edf8',
          visibleLayers: ['vec'],
          isUserPictureLegend: false,
          topologyCheck: '0',
          layerTag: 'TDT_vec',
          selectLayer: '',
          isSwitch: false,
          isFilter: false,
          initChecked: false,
          id: 'b780289b293a409c8046e7983017fa4c',
          opacity: 1,
          showInfoWindow: true,
          tp: 'layer',
          group: '1',
          guid: 'bc7f75a4-5c28-08f3-d95e-cf8abc2c43d2',
          editing: false,
          children: []
        }
      ];
      return {};
    }
  };
</script>
```

:::

### 使用运维端配置

:::demo

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map>
      <sh-layer-manager />
      <sh-layer-switcher />
    </sh-map>
  </sh-config-provider>
</div>
```

:::

### Attributes

> 继承[基础面板](#/zh-CN/component/general-card)组件除 `theme` `destroyOnClose`外的其他 Attributes

| 参数                | 属性类型 | 类型    | 可选值 | 默认值 | 说明                                                        |
| ------------------- | -------- | ------- | ------ | ------ | ----------------------------------------------------------- |
| isShow              | 动态属性 | boolean | -      | true   | 是否显示                                                    |
| defaultExpandedKeys | 静态属性 | array   | -      | -      | 默认展开的节点的 key 的数组                                 |
| layersInfo          | 静态属性 | array   | -      | -      | 图层数据                                                    |
| isAutoTop           | 静态属性 | boolean | -      | false  | 加载图层是否自动置顶（为 false 时，根据配置的层级关系加载） |
| maxLayerLimit       | 静态属性 | number  | -      | 100    | 最多允许同时展现到地图上的图层数量                          |
| initLoadLocation    | 静态属性 | boolean | -      | true   | 运维端设置为初始加载并定位的图层，是否启用这些图层的定位    |

### Events

> 继承[基础面板](#/zh-CN/component/general-card)组件 Events

| 事件名称   | 说明                   | 回调参数 |
| ---------- | ---------------------- | -------- |
| treeLoaded | 图层树初始化完成时触发 | -        |

### Methods

> 继承[基础面板](#/zh-CN/component/general-card)组件 Methods

| 方法名               | 说明                         | 参数                                                   |
| -------------------- | ---------------------------- | ------------------------------------------------------ |
| clear                | 清空选中                     | -                                                      |
| initSchemeByLayerIds | 根据图层 Id 数组过滤树的功能 | (layerArr)图层 Id 的数组                               |
| offScheme            | 解除过滤功能                 | -                                                      |
| setRollBlind         | 根据图层 id 设置卷帘         | 图层 id                                                |
| deleteRollblind      | 根据图层 id 移除卷帘         | 图层 id                                                |
| mapLink              | 根据图层添加分屏             | (layerInfo)运维端图层配置                              |
| setLayerTop          | 图层置顶                     | (layerInfo)运维端图层配置                              |
| openEdit             | 设置当前可编辑层             | (layerInfo)运维端图层配置                              |
| changeLayerOpacity   | 修改图层透明度               | (layerInfo)运维端图层配置,执行前修改 layerInfo.opacity |
