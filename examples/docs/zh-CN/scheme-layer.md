## SchemeLayer 方案图层

方案图层组件

### 基础用法

:::demo 使用`type`、`plain`、`round`和`circle`属性来定义 Button 的样式。

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map-earth>
      <sh-layer-manager />
      <sh-layer-switcher />
      <sh-scheme-layer />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### Attributes

> 继承[基础面板](#/zh-CN/component/general-card)组件除 `theme` `destroyOnClose`外的其他 Attributes

| 参数          | 属性类型 | 类型    | 可选值 | 默认值 | 说明              |
| ------------- | -------- | ------- | ------ | ------ | ----------------- |
| isShow        | 动态属性 | boolean | -      | true   | 是否显示          |
| defaultScheme | 静态属性 | string  | -      | -      | 默认选中的方案 ID |

### Events

> 继承[基础面板](#/zh-CN/component/general-card)组件 Events

| 事件名称 | 说明                     | 回调参数          |
| -------- | ------------------------ | ----------------- |
| selected | 选择方案或取消选择时触发 | data 图层配置信息 |

### Methods

> 继承[基础面板](#/zh-CN/component/general-card)组件 Methods
