## HighchartsLayer Highcharts 图层

基于给定的数据在地图上展示 Highcharts 专题图

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
        <sh-highcharts-layer />
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
  selectOption: {
    isShowXzq: true,//是否显示行政区:ramp
    isShowCharts: true,//是否显示专题图(柱状图,饼状图,环形图)
    isShowRampLegend: true,//是否显示图例
    chartType: "pie",//bar,pie,ring,若isShowCharts为false,不传
    isDrill: true//是否启用下钻功能
  },
  xzqOption: {
    isGeoJson: false,
    geojson: undefined,
    layerUrl: "http://122.224.233.68:11510/geoserver/gisqbi/wfs",//xzq服务地址(geoserver-wfs)
    layerType: "geo-wfs",//行政区服务类型:geo-wfs,arc-vector
    layerName: "xzqh",//数据表名称(geoserver服务必选项)
    centerWkid: "EPSG:4490",//当前提供的中心点或定位点坐标的坐标系

    xzqdm_field: "xzqdm",//行政区代码对应的字段名称(oracle数据库区分大小写)
    xzqmc_field: "xzqmc",//行政区名称对应的字段名称(oracle数据库区分大小写)
    initXZQ: 33,//初始行政区代码

    isShowXzqName: true,//是否显示行政区名称
    isRamp: true,//是否使用渐变色图
    //渐变色属性配置(行政区的填充色)
    rampOption: {
      borderColor: "rgba(5, 121, 138, 0.8)",//isRamp:false时,可自定义
      fillColor: "rgba(5, 121, 138, 0.4)",//isRamp:false时,可自定义,isRamp:true时不需要
      strokeWidth:1,//边界宽度
      fontSize:14,//字体大小
      fontColor:"#f30635",//字体颜色
      fontStroke:{//字体描边设置
        isShow:false,
        width:2,
        color:"#dc096b"
      },
      isRampFill: true,//是否渐变填充,false为自定义填充
      valueRange: ["0~200", "200~500", "500~1000", "1000~1500", "1500~2500", "2500~50000"],//或者["0-500", "500-1500", "1500-3000"],向下包容如[0,500)
      //isRampFill为true,则传递两个颜色:起始颜色和结束颜色,若为false,则为自定义颜色,颜色数组与valueRange数组一一对应
      // rampColor: ["#8A2BE2", "#FF8C00", "#ff7f50", "#87cefa", "#da70d6", "#32cd32"],
      rampColor: ["#8A2BE2", "#FF8C00"],//起始颜色和结束颜色
    },
  },
  //图例基础配置
  legendConfig: {
    isShow: true,//是否显示图例
    hideTitle: false,//是否隐藏图例面板的标题
    //图例位置style配置(style字符串)
    style: "bottom:80px;right:20px;",
    opacity: 0.8//透明度
  },
  //渐变色图数据对象(不需要渐变色时,即:isRamp: false,可不传)
  rampData: {
    3301: 434,
    3302: 734,
    3303: 2256,
    3304: 1446,
    3305: 7896,
    3306: 3256,
    3307: 1768,
    3308: 1278,
    3309: 3457,
    3310: 978,
    3311: 184
  },

  //专题图参数
  chartOption: {
    isShowChartLegend: true,//是否显示专题图图例
    legend: [
      { name: "农用地", color: "#ff7f50" },
      { name: "建设用地", color: "#87cefa" },
      { name: "未利用地", color: "#da70d6" }
    ],
    //其他专题图数据对象
    data: {
      3301: [
        { "value": 2000, "name": "农用地" },
        { "value": 800, "name": "建设用地" },
        { "value": 1200, "name": "未利用地" }
      ],
      3302: [
        { "value": 2000, "name": "农用地" },
        { "value": 800, "name": "建设用地" },
        { "value": 1200, "name": "未利用地" }
      ],
      3303: [
        { "value": 2000, "name": "农用地" },
        { "value": 800, "name": "建设用地" },
        { "value": 1200, "name": "未利用地" }
      ],
      3304: [
        { "value": 2000, "name": "农用地" },
        { "value": 800, "name": "建设用地" },
        { "value": 1200, "name": "未利用地" }
      ],
      3305: [
        { "value": 2000, "name": "农用地" },
        { "value": 800, "name": "建设用地" },
        { "value": 1200, "name": "未利用地" }
      ],
      3306: [
        { "value": 2000, "name": "农用地" },
        { "value": 800, "name": "建设用地" },
        { "value": 1200, "name": "未利用地" }
      ],
      3307: [
        { "value": 2000, "name": "农用地" },
        { "value": 800, "name": "建设用地" },
        { "value": 1200, "name": "未利用地" }
      ],
      3308: [
        { "value": 2000, "name": "农用地" },
        { "value": 800, "name": "建设用地" },
        { "value": 1200, "name": "未利用地" }
      ],
      3309: [
        { "value": 2000, "name": "农用地" },
        { "value": 800, "name": "建设用地" },
        { "value": 1200, "name": "未利用地" }
      ],
      3310: [
        { "value": 2000, "name": "农用地" },
        { "value": 800, "name": "建设用地" },
        { "value": 1200, "name": "未利用地" }
      ],
      3311: [
        { "value": 2000, "name": "农用地" },
        { "value": 800, "name": "建设用地" },
        { "value": 1200, "name": "未利用地" }
      ]
    }
  },
}
```

### 参数解析

#### 1.开关参数(selectOption)

**selectOption.isShowXzq**:是否显示行政区渐变图:ramp  
**selectOption.isShowCharts**:是否显示专题图(柱状图,饼状图,环形图)  
**selectOption.isShowRampLegend**:是否显示渐变图例  
**selectOption.chartType**:专题图类型，分为 bar,pie,ring,若 isShowCharts 为 false,不传  
**isDrill**:是否启用下钻功能

#### 2.渐变图配置参数(xzqOption)

##### 2.1.数据源配置

**isGeoJson**:行政区数据类型(`true`:geojson 数据,`false`:在线服务地址)  
若为 geojson,则不需要`layerUrl`,`layerType`,`layerName`,
`center`,`zoomLevel`等字段;若为在线服务地址,则不需要`geojson`字段  
**geojson**:geojson 格式的行政区图形数据,行政区数据类型为`true`时才需要配置  
**layerUrl**:行政区数据在线服务地址  
**layerType**:行政区服务类型:`geo-wfs`,`geo-wms`,`arc-vector`,`arc-title`  
**layerName**:数据表名称(geoserver 服务必选项)  
**centerWkid**:当前提供的中心点或定位点坐标的坐标系,例:`EPSG:4490`  
**xzqdm_field**:行政区代码对应的字段名称(oracle 数据库区分大小写)  
**xzqmc_field**:行政区名称对应的字段名称(oracle 数据库区分大小写)  
**initXZQ**:初始行政区代码

##### 2.2.样式配置

**isShowXzqName**:是否显示行政区名称  
**isRamp**:是否使用渐变色  
**rampOption**:渐变色配置

##### 2.2.1.rampOption 配置

**borderColor**:`isRamp`:false 时,行政区边框色可自定义  
**fillColor**: `isRamp`:false 时,行政区填充色可自定义  
**strokeWidth**:边界宽度  
**fontSize**:字体大小  
**fontColor**:字体颜色  
**fontStroke**:{ //字体描边  
 &nbsp;&nbsp;&nbsp;&nbsp;**isShow:** 是否启用字体描边  
 &nbsp;&nbsp;&nbsp;&nbsp;**width:** 描边宽度  
 &nbsp;&nbsp;&nbsp;&nbsp;**color:** 描边颜色  
 }  
**isRampFill**:`true`时颜色值根据`rampColor`取首位 2 个值作为起始和终结色计算得出,`false`则严格按照`rampColor`数组来  
**valueRange**:渐变数值分组  
**rampColor**:渐变颜色数组

#### 3.渐变数据(rampData)

Key 为行政区代码,value 为当前行政区的数值

#### 4.专题图参数(chartOption)

**isShowChartLegend**:是否显示专题图图例  
**legend**:专题图颜色和分类  
**data**:专题图数据集

#### 5.图例配置参数(legendConfig)

**isShow**:是否显示图例  
**hideTitle**:是否隐藏图例面板的标题  
**style**:图例容器样式，可控制图例位置  
**opacity**:图例透明度
