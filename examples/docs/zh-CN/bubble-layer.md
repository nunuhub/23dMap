## BubbleLayer 气泡图

基于给定的数据在地图上展示气泡图

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
        <sh-bubble-layer />
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
  "zIndex":99,//图层压盖顺序,默认99
  "isGeojson": false,//行政区数据类型(分为geojson数据和在线服务地址,若为geojson,则不需要layerUrl,layerType,layerName,center,zoomLevel等字段)
  "geojson": undefined,
  "layerUrl": "http://122.224.233.68:11510/geoserver/gisqbi/wfs",//xzq服务地址(geoserver-wfs)
  "layerType": "geoserver-wfs",//行政区服务类型:geo-wfs,geo-wms,arc-vector,arc-title
  "layerName": "xzqh",//数据表名称(geoserver服务必选项)
  "center": [120.40446, 29.31152],//xzq服务是切片的话,需要提供缩放到该行政区的中心点,
  "zoomLevel": 7,//xzq服务是切片的话,需要提供当前缩放级别
  "centerWkid": "EPSG:4490",//当前提供的中心点或定位点坐标的坐标系
  "isShowXzqName": true,//是否显示行政区名称
  "fillColor": "rgba(5, 121, 138, 0.4)",//地图行政区区域填充色,支持rab,rgba,十六进制颜色代码,推荐使用rgba
  "borderColor": "rgba(5, 121, 138, 0.8)",//地图行政区边界线颜色,支持rab,rgba,十六进制颜色代码,推荐使用rgba
  "bubbleMaxR": 50,//气泡最大半径
  "bubbleMinR": 38,//气泡最小半径
  "isBubbleImage": false,//是否使用气泡图片
  "bubbleFloat": true,//是否需要浮动效果
  "isShowTitle": false,//是否展示气泡内容的标题
  "fontSize": 14,//气泡内字体大小
  "xzqdm_field": "xzqdm",//行政区代码对应的字段名称(oracle数据库区分大小写)
  "xzqmc_field": "xzqmc",//行政区名称对应的字段名称(oracle数据库区分大小写)
  "boxShadowSize": 5,//非图片气泡的阴影大小
  "zoomRatio": 1,//缩放比例
  "isDrill": true,//是否启用下钻
  //图例配置
  "legendConfig": {
    "isShow": true,//是否显示图例
    "hideTitle": false,//是否隐藏图例面板的标题
    //图例位置style配置(style字符串)
    "style": "bottom:100px;right:20px;",
    "opacity": 0.8//透明度
  },
  "fontConfig": [
    {
      "name": "年度完成投资额",//气泡内容标题
      "color": "rgb(186,247,223)",//气泡内字体颜色,支持rab,rgba,十六进制颜色代码
      "imgUrl": '',//图片气泡的url(如果使用图片气泡),imgUrl与bubbleColor二选一
      "bubbleColor": "rgba(7, 214, 52, 0.9)",//非图片气泡的填充色,支持rab,rgba,十六进制颜色代码,推荐使用rgba
      "bubbleShadowColor": ""//非图片气泡的阴影色,支持rab,rgba,十六进制颜色代码推荐使用rgba
    },
    {
      "name": "项目数",
      "color": "rgb(247,226,155)",
      "imgUrl": '',
      "bubbleColor": "rgba(249, 207, 4, 0.8)",
      "bubbleShadowColor": ""
    }
  ],
  "bubbleNumTop": 32,//气泡内字体偏移量(相对上面)
  "bubbleNumLeft": -3,//气泡内字体偏移量(相对左面)
  "totaldata": {
    "3301": [
      {
        "value": 18636,//行政区内的气泡内容
        //气泡位置
        "positionPoint": [119.8938, 30.1355],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      },
      {
        "value": 1233,
        "positionPoint": [119.2596, 29.7149],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      }
    ],
    "3302": [
      {
        "value": 9625,
        "positionPoint": [121.3934, 29.9371],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      },
      {
        "value": 390,
        "positionPoint": [121.6956, 29.3994],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      }
    ],
    "3303": [
      {
        "value": 12729,
        "positionPoint": [120.7672, 28.2237],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      },
      {
        "value": 1100,
        "positionPoint": [120.1547, 27.6224],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      }
    ],
    "3304": [
      {
        "value": 8822,
        "positionPoint": [121.0968, 30.7123],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      },
      {
        "value": 1091,
        "positionPoint": [120.5035, 30.5476],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      }
    ],
    "3305": [
      {
        "value": 10178,
        "positionPoint": [119.5367, 30.6409],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      },
      {
        "value": 1294,
        "positionPoint": [120.2041, 30.7947],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      }
    ],
    "3306": [
      {
        "value": 9213,
        "positionPoint": [120.7507, 30.0201],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      },
      {
        "value": 1027,
        "positionPoint": [120.8496, 29.5697],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      }
    ],
    "3307": [
      {
        "value": 9325,
        "positionPoint": [119.7015, 29.1110],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      },
      {
        "value": 1065,
        "positionPoint": [120.3772, 29.1577],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      }
    ],
    "3308": [
      {
        "value": 4984,
        "positionPoint": [118.5150, 29.0149],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      },
      {
        "value": 1303,
        "positionPoint": [119.1376, 28.9835],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      }
    ],
    "3309": [
      {
        "value": 6579,
        "positionPoint": [122.2339, 29.9487],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      },
      {
        "value": 483,
        "positionPoint": [122.4751, 30.4756],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      }
    ],
    "3310": [
      {
        "value": 8905,
        "positionPoint": [120.7892, 28.7897],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      },
      {
        "value": 1200,
        "positionPoint": [121.3660, 28.8995],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      }
    ],
    "3311": [
      {
        "value": 3414,
        "positionPoint": [119.1687, 28.0811],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      },
      {
        "value": 1430,
        "positionPoint": [119.8499, 28.3005],
        "wkid": "EPSG:4490",//气泡放置坐标的坐标系
      }
    ]
  }
}
```

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
**center**:xzq 服务是切片的话,需要提供缩放到该行政区的中心点，例:`[120.40446, 29.31152]`  
**zoomLevel**:xzq 服务是切片的话,需要提供当前缩放级别  
**centerWkid**:当前提供的中心点或定位点坐标的坐标系,例:`EPSG:4490`
**xzqdm_field**:行政区代码对应的字段名称(oracle 数据库区分大小写)  
**xzqmc_field**:行政区名称对应的字段名称(oracle 数据库区分大小写)

##### 行政区样式

**isShowXzqName**:是否显示行政区名称,布尔类型  
**fillColor**:地图行政区区域填充色,支持 rab,rgba,十六进制颜色代码,推荐使用 rgba  
**borderColor**:地图行政区边界线颜色,支持 rab,rgba,十六进制颜色代码,推荐使用 rgba

#### 气泡参数

**bubbleMaxR**:气泡最大半径  
**bubbleMinR**:气泡最小半径  
**isBubbleImage**:是否使用气泡图片  
**bubbleFloat**:是否展示气泡内容的标题  
**fontSize**:气泡内字体大小  
**boxShadowSize**:非图片气泡的阴影大小  
**bubbleNumTop**:气泡内字体偏移量(相对上面)  
**bubbleNumLeft**:气泡内字体偏移量(相对左面)  
**fontConfig**:气泡字体颜色，整体颜色

#### 气泡数据集

**totaldata**:展示的气泡数据集，如下

```javascript
{
  "3301": [
    {
      "value": 18636,//行政区内的气泡内容
      //气泡位置
      "positionPoint": [119.8938, 30.1355],
      "wkid": "EPSG:4490",//气泡放置坐标的坐标系
    },
    {
      "value": 1233,
      "positionPoint": [119.2596, 29.7149],
      "wkid": "EPSG:4490",//气泡放置坐标的坐标系
    }
  ],
  "3302": [
    {
      "value": 9625,
      "positionPoint": [121.3934, 29.9371],
      "wkid": "EPSG:4490",//气泡放置坐标的坐标系
    },
    {
      "value": 390,
      "positionPoint": [121.6956, 29.3994],
      "wkid": "EPSG:4490",//气泡放置坐标的坐标系
    }
  ]
}
```
