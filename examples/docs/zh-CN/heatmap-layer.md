## HeatmapLayer 热力图图层

基于给定的数据在地图上展示热力图

### 基础用法

基础的按钮用法。

:::demo 使用`type`、`plain`、`round`和`circle`属性来定义 Button 的样式。

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map :widget-info="mapOptions">
      <sh-layer-switcher />
      <sh-heatmap-layer />
    </sh-map>
  </sh-config-provider>
</div>

<script>
  export default {
    data() {
      this.mapOptions = {
        options: {
          center: '117.3675,32.8752',
          zoom: 8,
          scale: true,
          mouseposition: true
        }
      };
      return {};
    }
  };
</script>
```

:::

### Attributes

| 参数       | 说明     | 类型   | 可选值 | 默认值 |
| ---------- | -------- | ------ | ------ | ------ |
| widgetInfo | 配置信息 | Object | -      | -      |

### widgetInfo 示例

```javascript
{
  "zIndex":99,//图层压盖顺序,默认99
  "isGeojson": true, //行政区数据类型(分为geojson数据和在线服务地址,若为geojson,则不需要layerUrl,layerType,layerName,center,zoomLevel等字段)
  "geojson": require('./cluster.json'),
  "isLegend":true,//默认开启图例比例尺
  "layerUrl": "http://122.224.233.68:11510/geoserver/gisqbi/wfs", //xzq服务地址(geoserver-wfs)
  "layerType": "geo-wfs", //行政区服务类型:geo-wfs,geo-wms,arc-vector,arc-title
  "layerName": "xzqh", //数据表名称(geoserver服务必选项)
  "opacity": 0.8, //透明度
  "blur": 15, //模糊大小（以像素为单位）,默认15
  "radius":5, //半径大小(默认5)
  "isSetWeight":false,//设置权重
  "weightName":"weight",//权重对应的字段
  "minMax":[5,999]//权重最大最小值
}
```

### 参数解析

#### 行政区参数

##### 行政区数据

**isGeojson**:热力图数据类型(`true`:geojson 数据,`false`:在线服务地址)  
若为 geojson,则不需要`layerUrl`,`layerType`,`layerName`,
`center`,`zoomLevel`等字段;若为在线服务地址,则不需要`geojson`字段  
**geojson**:geojson 格式的热力图图形数据,热力图数据类型为`true`时才需要配置  
**isLegend**:默认开启图例比例尺  
**layerUrl**:热力图数据在线服务地址
**layerType**:热力图服务类型:geo-wfs,geo-wms,arc-vector,arc-title  
**layerName**:数据表名称(geoserver 服务必选项)
**initLayer**:指定的聚合数据图层(arcgis 图层)
**isSetWeight**:设置权重
**weightName**:权重对应的字段
**minMax**:权重最大最小值

#### 热力图样式

**opacity**:透明度  
**blur**:糊大小（以像素为单位）
