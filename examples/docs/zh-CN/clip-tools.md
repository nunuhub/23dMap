## ClipTools 模型裁切

模型裁切组件

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
    <sh-map-earth viewMode="3D">
      <sh-layer-switcher />
      <sh-layer-manager />
      <sh-scheme-layer :isShow="false" defaultScheme="<%clip_scheme%>" />
      <sh-clip-tools />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### Attributes

> 继承[基础面板](#/zh-CN/component/general-card)组件除 `theme` `destroyOnClose`外的其他 Attributes

| 参数   | 属性类型 | 类型    | 可选值 | 默认值 | 说明     |
| ------ | -------- | ------- | ------ | ------ | -------- |
| isShow | 动态属性 | boolean | -      | true   | 是否显示 |

### Events

> 继承[基础面板](#/zh-CN/component/general-card)组件 Events

### Methods

> 继承[基础面板](#/zh-CN/component/general-card)组件 Methods

| 方法名   | 说明     | 参数 |
| -------- | -------- | ---- |
| delPlane | 清除裁切 | -    |
