## MarkersLayer 标签图

基于给定的数据在地图上展示标签图

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
        <sh-markers-layer />
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

### Events

| 事件名称       | 说明         | 回调参数     |
| -------------- | ------------ | ------------ |
| onRegionChange | 触发下钻回调 | 行政区划代码 |

### widgetInfo 示例

[mark.json](data/mark)

### 参数解析

#### 行政区参数

##### 行政区数据

**isGeojson**:行政区数据类型(`true`:geojson 数据,`false`:在线服务地址)  
若为 geojson,则不需要`layerUrl`,`layerType`,`layerName`,
`center`,`zoomLevel`等字段;若为在线服务地址,则不需要`geojson`字段  
**geojson**:geojson 格式的行政区图形数据,行政区数据类型为`true`时才需要配置  
**layerUrl**:行政区数据在线服务地址
**layerType**:行政区服务类型:geo-wfs,geo-wms,arc-vector,arc-title  
**layerName**:数据表名称(geoserver 服务必选项)
**xzqdm_field**:行政区代码对应的字段名称(oracle 数据库区分大小写)

##### 行政区样式

**isShowXzq**:是否显示行政区边界,布尔类型

#### 标签参数

**type**:标签类型(circle,polygon)  
**drillEvt**:下钻回调,存在则启用下钻  
**clickEvt**:点击事件

#### 标签数据集

**regions**:展示的标签数据集，如下

```javascript
{
    "3301": {
        "value": 123,//行政区内的气泡内容
        "name": "杭州",
        "borderColor":"#f10808",
        "fontSize":14,
        "nameColor":"#072eef",
        "numColor":"#072eef",
        "backgroundColor":"#fff"
    },
    "3302": {
        "value": 456,//行政区内的气泡内容
        "name": "宁波",
        "borderColor":"#f10808",
        "fontSize":14,
        "nameColor":"#072eef",
        "numColor":"#072eef",
        "backgroundColor":"#fff"
    }
}
```
