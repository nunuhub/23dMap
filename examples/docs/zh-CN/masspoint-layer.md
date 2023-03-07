## MasspointLayer 权重散点图

基于 geojson 数据,根据权重展示不同颜色,不同大小的散点

## 基本用法

:::demo

```html
<template>
  <div style="height:100%;width:100%">
    <sh-config-provider
      type="<%your_admin_type%>"
      url="<%your_admin_url%>"
      schemeId="<%your_admin_scheme_id%>"
      token="<%your_admin_token%>"
    >
      <sh-map>
        <sh-layer-switcher />
        <sh-masspoint-layer />
      </sh-map>
    </sh-config-provider>
  </div>
</template>
```

:::

### Attributes

| 参数       | 说明     | 类型   | 可选值 | 默认值 |
| ---------- | -------- | ------ | ------ | ------ |
| widgetInfo | 配置信息 | Object | -      | -      |

### 参数示例

```javascript
{
    zIndex:99,//图层压盖顺序,默认99
    isGeoJson: true,//是否是geojson数据
    geojson: require("../xxxxx.json"),
    minMax:[5,20000],
    color:"rgba(217,17,17,1)",
    minOpacity:0.4,
    minMaxR:[3,10]
}
```

### 参数解析

#### 1.基础参数

**zIndex**:图层压盖顺序,默认 99  
**isGeoJson**:行政区数据类型(`true`:geojson 数据,`false`:传递对应的 dataConfig 数据)  
**geojson**:geojson 格式的行政区图形数据,行政区数据类型为`true`时才需要配置

##### 2.2.样式配置(xzqOptions)

**minMax**:最大/最小值  
**minOpacity**:散点的最小透明度  
**minMaxR**:散点的最小/最大半径  
**color**:散点图颜色(支持 16 进制,rgba)
