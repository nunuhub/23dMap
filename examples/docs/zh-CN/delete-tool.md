## DeleteTool 删除组件

提供删除地块功能的组件

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
      <sh-select-tool style="position: absolute;top: 0;left: 0" />
      <sh-delete-tool style="position: absolute;top: 0;left: 100px" />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### Attributes

| 参数          | 属性类型 | 类型   | 可选值 | 默认值 | 说明                                                                      |
| ------------- | -------- | ------ | ------ | ------ | ------------------------------------------------------------------------- |
| deleteOptions | 静态属性 | Object |        |        | 附加参数，用于在删除前和删除后的流程里执行其他操作需要，参考 shinega 接口 |

### Events

| 事件名称      | 说明           | 回调参数                                    |
| ------------- | -------------- | ------------------------------------------- |
| deleteSuccess | 删除成功后触发 | (featureId,feature)删除的地块 id 和地块对象 |

### Methods

| 方法名  | 说明         | 参数 |
| ------- | ------------ | ---- |
| execute | 触发删除操作 | -    |
