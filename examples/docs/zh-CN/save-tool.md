## SaveTool 保存组件

提供保存地块功能的组件

### 基础用法

基础的组件用法。

:::demo 基础用法。

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
      <sh-draw-tool />
      <sh-save-tool />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### Attributes

| 参数        | 属性类型 | 类型   | 可选值 | 默认值 | 说明                                                                      |
| ----------- | -------- | ------ | ------ | ------ | ------------------------------------------------------------------------- |
| saveOptions | 静态属性 | Object |        |        | 附加参数，用于在保存前和保存后的流程里执行其他操作需要，参考 shinega 接口 |

### Events

| 事件名称    | 说明           | 回调参数            |
| ----------- | -------------- | ------------------- |
| saveSuccess | 保存成功后触发 | (feature)保存的地块 |

### Methods

| 方法名  | 说明         | 参数 |
| ------- | ------------ | ---- |
| execute | 触发保存操作 | -    |
