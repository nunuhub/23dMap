## HawkEye 鹰眼

### 基本用法

:::demo

```html
<div style="height:500px;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map-earth>
      <sh-layer-switcher />
      <sh-hawk-eye />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### Attributes

| 参数       | 属性类型 | 类型   | 可选值 | 默认值 | 说明             |
| ---------- | -------- | ------ | ------ | ------ | ---------------- |
| initLayers | 静态属性 | array  | -      | -      | 鹰眼里显示的地图 |
| zoomLevel  | 静态属性 | number | -      | 3      | 地图的缩放级别   |

### Events

| 事件名称 | 说明                                 | 回调参数 |
| -------- | ------------------------------------ | -------- |
| show     | 点击按钮时触发，控制鹰眼的显示或隐藏 | -        |
