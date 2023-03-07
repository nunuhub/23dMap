## MapMeasure 地图测量

二维地图测量工具组件

### 基础用法

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
      <sh-layer-switcher />
      <sh-map-measure />
    </sh-map>
  </sh-config-provider>
</div>
```

:::

### Attributes

> 继承[基础面板](#/zh-CN/component/general-card)组件除 `theme` `destroyOnClose`外的其他 Attributes

| 参数   | 属性类型 | 类型    | 可选值 | 默认值 | 说明             |
| ------ | -------- | ------- | ------ | ------ | ---------------- |
| isShow | 动态属性 | boolean | -      | true   | 默认面板是否展示 |

### Events

> 继承[基础面板](#/zh-CN/component/general-card)组件 Events

| 事件名称      | 说明                    | 回调参数 |
| ------------- | ----------------------- | -------- |
| change:isShow | 默认面板展示/隐藏时触发 | boolean  |
