## ScatterLayer 散点图

基于给定的数据在地图上展示散点图

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
        <sh-scatter-layer />
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

```javascript
{
  zIndex:99,//图层压盖顺序,默认99
  isGeoJson: false,//是否是geojson数据
  geojson: undefined,
  layerUrl: "http://192.168.11.48:8080/geoserver/pg/ows",
  // layerUrl: "http://192.168.11.44:6080/arcgis/rest/services/ST_QZZS_D_2/MapServer",
  // layerUrl: "http://192.168.11.36:6080/arcgis/rest/services/XB_FINAL_AnHui/MapServer",
  // layerType: "arc-vector",//动态服务类型:geo-wfs,arc-vector
  layerType: "geo-wfs",//动态服务类型:geo-wfs,arc-vector
  layerName: "pg:zj_xzqh",//数据表名称(geoserver服务必选项)
  wkid: "EPSG:4490",
  zoomRatio: 1,
  currentXZQ: 3308,//初始显示的行政区(国家级,省级,市级,县级)
  isDrill: true,//是否开启下钻功能
  //分类显示散点，不传，则使用默认颜色，若所有的点是同一种颜色，则只传递一种即可
  //若是使用图片，则不需要color，传递图片url即可，若是使用自定义颜色，则不需要img
  categoryObj: [
    { type: 'A类', color: '#FF0000', img:'' },
    { type: 'B类', color: '#FFA500', img:'' },
    { type: 'C类', color: '#00BFFF', img:'' },
    { type: 'D类', color: '#00FF00', img:'' },
    { type: 'E类', color: '#FFFF00', img:'' },
    { type: 'F类', color: '#0000EE', img:'' }
  ],
  scatterOption: {//散点标注配置
    isShowTargetName: true,//是否显示散点对应的标注
    targetField:"name",//显示标注对应的字段
    targetName: {//散点对应的名称的字体颜色和大小
      color: '#fff',
      size: '12px',
      top:'0px',
      left:'0px',
      weight:'',
      family:''
    }
  },
  xzqOption: {//行政区相关配置
    isShowXzqName: true,//是否显示行政区名称
    xzqdm_field: "xzqdm",//行政区代码对应的字段名称(oracle数据库区分大小写)
    xzqmc_field: "xzqmc",//行政区名称对应的字段名称(oracle数据库区分大小写)
    xzqFill: 'rgba(5, 121, 138, 0.4)',//行政区填充色
    xzqBorder: 'rgba(5, 121, 138, 0.8)',//行政区边界色
    xzqNameOption: {//行政区名称配置
      color: "#fff",
      font: '16px bold Microsoft YaHei'//大小，粗细，字体
    }
  },
  //图例配置
  legendConfig: {
    isShow: true,//是否显示图例
    hideTitle: false,//是否隐藏图例面板的标题
    //图例位置style配置(style字符串)
    style: "bottom:100px;right:20px;",
    opacity: 0.8//透明度
  },
  pointIcon: {//散点图标大小设置
    isShowImg:true,//是否使用图片
    width:24,
    height:24
  },
  dataOptions: [
      { "name": "项目1", "type": "A类", "positionPoint": [118.24447631835938, 29.228439331054688] },
      { "name": "项目1", "type": "A类", "positionPoint": [118.49166870117188, 29.221572875976562] },
      { "name": "项目1", "type": "A类", "positionPoint": [118.35433959960938, 29.146041870117188] },
      { "name": "项目1", "type": "A类", "positionPoint": [118.28018188476562, 29.023818969726562] },
      { "name": "项目2", "type": "B类", "positionPoint": [118.46420288085938, 29.104843139648438] },
      { "name": "项目2", "type": "B类", "positionPoint": [118.575439453125, 29.019699096679688] },
      { "name": "项目2", "type": "B类", "positionPoint": [118.82125854492188, 28.845291137695312] },
      { "name": "项目3", "type": "C类", "positionPoint": [118.685302734375, 28.772506713867188] },
      { "name": "项目3", "type": "C类", "positionPoint": [118.6468505859375, 28.593978881835938] },
      { "name": "项目3", "type": "C类", "positionPoint": [118.5040283203125, 28.624191284179688] },
      { "name": "项目4", "type": "D类", "positionPoint": [118.91189575195312, 29.224319458007812] },
      { "name": "项目4", "type": "D类", "positionPoint": [119.03549194335938, 29.135055541992188] },
      { "name": "项目4", "type": "D类", "positionPoint": [119.09866333007812, 29.185867309570312] },
      { "name": "项目4", "type": "D类", "positionPoint": [119.26071166992188, 29.111709594726562] },
      { "name": "项目5", "type": "E类", "positionPoint": [119.13299560546875, 29.025192260742188] },
      { "name": "项目5", "type": "E类", "positionPoint": [119.23736572265625, 29.041671752929688] },
      { "name": "项目2", "type": "B类", "positionPoint": [118.7237548828125, 29.058151245117188] },
      { "name": "项目2", "type": "B类", "positionPoint": [118.55758666992188, 28.911209106445312] },
      { "name": "项目2", "type": "B类", "positionPoint": [118.8555908203125, 28.996353149414062] },
      { "name": "项目5", "type": "E类", "positionPoint": [119.27993774414062, 28.948287963867188] },
      { "name": "项目5", "type": "E类", "positionPoint": [119.27169799804688, 28.863143920898438] },
      { "name": "项目5", "type": "E类", "positionPoint": [119.1302490234375, 28.816452026367188] },
      { "name": "项目5", "type": "E类", "positionPoint": [119.17556762695312, 29.038925170898438] },
      { "name": "项目3", "type": "C类", "positionPoint": [118.63449096679688, 28.481369018554688] },
      { "name": "项目3", "type": "C类", "positionPoint": [118.97369384765625, 28.736801147460938] },
      { "name": "项目4", "type": "D类", "positionPoint": [119.04510498046875, 28.874130249023438] },
      { "name": "项目4", "type": "D类", "positionPoint": [118.96133422851562, 29.034805297851562] },
      { "name": "项目6", "type": "F类", "positionPoint": [118.94485473632812, 29.054031372070312] },
      { "name": "项目6", "type": "F类", "positionPoint": [118.79928588867188, 29.016952514648438] },
      { "name": "项目6", "type": "F类", "positionPoint": [118.69216918945312, 28.854904174804688] },
      { "name": "项目6", "type": "F类", "positionPoint": [118.88168334960938, 29.283370971679688] },
      { "name": "项目6", "type": "F类", "positionPoint": [119.12887573242188, 29.191360473632812] },
      { "name": "项目6", "type": "F类", "positionPoint": [118.35296630859375, 28.883743286132812] }
    ]
}
```

### 参数解析

#### 1.数据源配置

**isGeojson**:行政区数据类型(`true`:geojson 数据,`false`:在线服务地址)  
若为 geojson,则不需要`layerUrl`,`layerType`,`layerName`,
`center`,`zoomLevel`等字段;若为在线服务地址,则不需要`geojson`字段  
**geojson**:geojson 格式的行政区图形数据,行政区数据类型为`true`时才需要配置  
**layerUrl**:行政区数据在线服务地址  
**layerType**:行政区服务类型:`geo-wfs`,`geo-wms`,`arc-vector`,`arc-title`  
**layerName**:数据表名称(geoserver 服务必选项)  
**wkid**:当前提供的中心点或定位点坐标的坐标系,例:`EPSG:4490`  
**currentXZQ**:初始行政区代码  
**zoomRatio**:缩放比率  
**isDrill**:是否启用下钻功能

#### 2.散点图分类(categoryObj)

分类显示散点，不传，则使用默认颜色，若所有的点是同一种颜色，则只传递一种即可  
若是使用图片，则不需要 color，传递图片 url 即可，若是使用自定义颜色，则不需要 img  
**type**:分类名称  
**color**://分类颜色  
**img**:分类图片 url

#### 3.散点图标注配置(scatterOption)

**isShowTargetName**:是否显示散点对应的标注  
**targetField**://显示标注对应的字段  
**targetName**:散点对应的名称的样式

#### 4.行政区相关配置(xzqOption)

**isShowXzqName**:是否显示行政区名称  
**xzqdm_field**:行政区代码对应的字段名称(oracle 数据库区分大小写)  
**xzqmc_field**:行政区名称对应的字段名称(oracle 数据库区分大小写)  
**xzqFill**:行政区填充色  
**xzqBorder**:行政区边界色  
**xzqNameOption**:行政区名称样式

#### 5.图例配置参数(legendConfig)

**isShow**:是否显示图例  
**hideTitle**:是否隐藏图例面板的标题  
**style**:图例容器样式，可控制图例位置  
**opacity**:图例透明度

#### 6.散点图标大小设置(pointIcon)

**isShowImg**:是否使用图片  
**width**:图片宽度  
**height**:图片高度

#### 6.数据集设置(dataOptions)

**name**:项目名称  
**type**:分类  
**positionPoint**:散点坐标
