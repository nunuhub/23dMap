## MapEarth 二三维地图

提供二三维地图切换功能的基础地图组件。

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
    <sh-map-earth>
      <sh-layer-manager />
      <sh-layer-switcher />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### Attributes

> 继承[二维地图](#/zh-CN/component/map)组件和[三维地球](#/zh-CN/component/earth)组件的 Attributes

| 参数     | 属性类型 | 类型   | 可选值        | 默认值 | 说明                           |
| -------- | -------- | ------ | ------------- | ------ | ------------------------------ |
| viewMode | 动态属性 | string | 2D / 23D / 3D | 23D    | 地图模式                       |
| view     | 动态属性 | string | map / earth   | map    | 初始视图, 只在 "23D"模式下有效 |

### Events

| 事件名称       | 说明                                    | 回调参数                                                               |
| -------------- | --------------------------------------- | ---------------------------------------------------------------------- |
| mapEarthInited | 二三维地图初始化完成                    | 共四个参数，依次为: map 对象、earth 对象、map 组件对象、earth 组件对象 |
| change:view    | '23D'模式下切换二维地图或三维地球时触发 | (view) 当前地图模式，'map'、'earth'                                    |

### Methods

| 方法名         | 说明         | 参数 |
| -------------- | ------------ | ---- |
| toggleViewMode | 切换地图模式 | -    |
