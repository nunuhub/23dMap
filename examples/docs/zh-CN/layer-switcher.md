## LayerSwitcher 底图切换

提供 `map` `earth`视图切换功能以及不同类型底图的切换功能。

### 基础用法

默认内置了全国天地图数据。

:::demo

```html
<div style="height:100%;width:100%">
  <sh-map-earth>
    <sh-layer-switcher />
  </sh-map-earth>
</div>
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
    <sh-map-earth>
      <sh-layer-switcher />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### Attributes

| 参数    | 属性类型 | 类型  | 可选值 | 默认值                 | 说明     |
| ------- | -------- | ----- | ------ | ---------------------- | -------- |
| options | 动态属性 | array | -      | 默认内置全国天地图配置 | 底图配置 |

### Events

| 事件名称            | 说明                             | 回调参数                                                  |
| ------------------- | -------------------------------- | --------------------------------------------------------- |
| change:view         | 点击视图切换卡片时触发           | -                                                         |
| change:checkedLayer | 通过底图组件添加或移除图层时触发 | (type, layer) type: 'add' / 'remove'; layer: 图层配置信息 |
