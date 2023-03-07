## RollerBlind 卷帘

卷帘组件

### 基本用法

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
      <sh-layer-manager />
      <sh-roller-blind />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### Attributes

> 继承[基础面板](#/zh-CN/component/general-card)组件除 `theme`外的其他 Attributes

| 参数          | 属性类型 | 类型   | 可选值 | 默认值            | 说明                                                 |
| ------------- | -------- | ------ | ------ | ----------------- | ---------------------------------------------------- |
| sliderColor2d | 静态属性 | string | -      | '#666'            | 二维模式下时卷帘线条的颜色(仅当卷帘方式为纵向或横向) |
| sliderColor3d | 静态属性 | string | -      | '#d3d3d3'         | 三维模式下时卷帘线条的颜色(仅当卷帘方式为纵向或横向) |
| position      | 静态属性 | object | -      | -                 | 卷帘的初始位置                                       |
| circleColor   | 静态属性 | string | -      | '#FF0000'         | 卷帘线条的颜色(仅当卷帘方式为'圆形')                 |
| circleBgColor | 静态属性 | string | -      | 'rgba(1,1,1,0.1)' | 卷帘遮蔽部分的背景颜色(仅当卷帘方式为'圆形')         |

### Events

> 继承[基础面板](#/zh-CN/component/general-card)组件 Events

| 事件名称  | 说明                   | 回调参数 |
| --------- | ---------------------- | -------- |
| initBlind | 初始化已加载的图层图例 | -        |

### Methods

> 继承[基础面板](#/zh-CN/component/general-card)组件 Methods

| 方法名      | 说明               | 参数                      |
| ----------- | ------------------ | ------------------------- |
| zoomToLayer | 视角跳转到当前图层 | (layerInfo)运维端图层配置 |
| clearJldb   | 退出所有卷帘对比   | -                         |
| jldbActive  | 开启卷帘           | 图层                      |
| jldbDisable | 退出卷帘对比       | 图层 id                   |
