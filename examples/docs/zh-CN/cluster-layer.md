## ClusterLayer 聚合图层

基于给定的数据在地图上展示聚合图

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
        <sh-cluster-layer />
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

### widgetInfo 示例

```javascript
{
  zIndex:99,//图层压盖顺序,默认99
  isGeoJson: false,//是否是geojson数据
  geojson: undefined,
  layerUrl: "http://192.168.11.48:8080/geoserver/pg/ows",
  layerType: "geo-wfs",//动态服务类型:geo-wfs,arc-vector
  initLayer: 0,//指定的聚合数据图层(arcgis图层)
  layerName: "pg:st_xmtx_p_p",//数据表名称(geoserver服务必选项)

  //聚合颜色配置
  colorConfig: {
    fillColor: "rgba(0,204,204,0.8)",
    borderColor: "#00FF00",
    font: {
      borderColor: "#fff",//面图层配置,点图层不需要
      fontColor: "#fff",
      size: 12,//面图层配置,点图层不需要
      borderWidth: 3//面图层配置,点图层不需要
    }
  },
  distance: 30,  //聚合之间的最小距离（以像素为单位）
  isShowNum: true,//是否显示聚合数字
  radius: undefined,//默认是自动计算
  isShowBorder: false,//是否显示聚合点的边框
}
```

### 参数解析

#### 行政区参数

##### 行政区数据

**isGeojson**:聚合数据类型(`true`:geojson 数据,`false`:在线服务地址)  
若为 geojson,则不需要`layerUrl`,`layerType`,`layerName`,
`center`,`zoomLevel`等字段;若为在线服务地址,则不需要`geojson`字段  
**geojson**:geojson 格式的聚合图形数据,聚合数据类型为`true`时才需要配置  
**layerUrl**:聚合数据在线服务地址
**layerType**:聚合服务类型:geo-wfs,geo-wms,arc-vector,arc-title  
**layerName**:数据表名称(geoserver 服务必选项)
**initLayer**:指定的聚合数据图层(arcgis 图层)

#### 聚合样式

**distance**:聚合之间的最小距离（以像素为单位）  
**isShowNum**:是否显示聚合数字  
**radius**:半径数值,默认是自动计算  
**isShowBorder**:是否显示聚合点的边框  
**colorConfig**:聚合颜色配置

#### colorConfig 参数

**fillColor**:填充颜色  
**borderColor**:边框颜色  
**font.fontColor**:字体颜色  
**font.size**:面图层配置,点图层不需要  
**font.borderColor**:面图层配置,点图层不需要,面图层边框颜色  
**font.borderWidth**:面图层配置,点图层不需要，面图层边框宽度
