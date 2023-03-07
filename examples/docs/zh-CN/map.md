## Map 二维地图组件

二维地图基础组件。

### 基础用法

Map 的父组件必须具有宽度和高度。

:::demo

```html
<div style="height:100%;width:100%">
  <sh-map>
    <sh-layer-switcher />
  </sh-map>
</div>
```

:::

### 地图控件

使用 `controls` 属性加载地图控件。

:::demo

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map :controls="controls">
      <sh-layer-switcher />
    </sh-map>
  </sh-config-provider>
</div>

<script>
  export default {
    data() {
      return {
        controls: ['Zoom', 'Geolocation', 'Rotate', 'ScaleLine', 'FullScreen']
      };
    }
  };
</script>
```

:::

### 地图事件

为地图绑定事件，试试单击或双击地图。

:::demo 通过 `map:` 前缀的属性给地图绑定事件。

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map @map:click="mapClick" @map:dblclick="mapDblclick">
      <sh-layer-switcher />
    </sh-map>
  </sh-config-provider>
</div>

<script>
  export default {
    methods: {
      mapClick() {
        this.$message('map click');
      },
      mapDblclick() {
        this.$message('map dblclick');
      }
    }
  };
</script>
```

:::

### 动态改变属性

地图的**动态属性**在地图创建成功后可以动态地改变。

:::demo

```html
<div style="position: absolute;z-index: 1;">
  <el-button type="primary" plain @click="changeCenterZoom"
    >改变地图中心</el-button
  >
</div>
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map :center="center" :zoom="zoom">
      <sh-layer-switcher />
    </sh-map>
  </sh-config-provider>
</div>

<script>
  export default {
    data() {
      return {
        center: [113, 34],
        zoom: 6
      };
    },
    methods: {
      changeCenterZoom() {
        this.center = [113 + Math.random() * 10, 34 + Math.random() * 10];
        this.zoom = Math.random() * 15;
      }
    }
  };
</script>
```

:::

### 图层过滤(目前针对 2D)

地图中已加载的图层可以通过 filterLayer 方法进行过滤，也可以在 afterAddLayer 中进行操作达到初始化过滤的效果。  
值得注意的一点是在 geoserver 中使用**中文字段**进行过滤时要**添加双引号**,如:"规划用地" = '建设用地'。arcgis 带不带双引号均可  
:::demo

```html
<div style="position: absolute;z-index: 1;">
  <el-button @click="ghOrigin">规划图原始</el-button>
  <el-button @click="ghFilter">规划图过滤</el-button>
</div>
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map :mapOptions="mapOptions" @mapInited="mapInited">
      <sh-layer-switcher />
      <sh-layer-manager :layersInfo="layersInfo" :isShow="false" />
    </sh-map>
  </sh-config-provider>
</div>
<script>
  import { MapData } from '@sampleData';

  export default {
    data() {
      this.layersInfo = MapData.layerInfo;
      return {
        mapOptions: {
          center: [117.27643232150454, 31.86426160458683],
          zoom: 16
        }
      };
    },
    methods: {
      mapInited(map) {
        this.map = map;
        // 图层加载完成监听
        map.layerManager.on('afterAddLayer', (event) => {
          let layer = event.layer;
          let layerTag = layer.get('layerTag');
          if (layerTag === 'hfguihua') {
            map.filterLayer(layer.get('id'), "规划用地='建设用地'");
          }
        });
      },
      ghOrigin() {
        this.map.filterLayer('cd8b28d7-1987-90ad-e9fb-f1828fca7601', '1=1');
      },
      ghFilter() {
        this.map.filterLayer(
          'cd8b28d7-1987-90ad-e9fb-f1828fca7601',
          "规划用地='建设用地'"
        );
      }
    }
  };
</script>
```

:::

### 属性查询(目前针对 2D)

已配置的图层可以通过 search 方法进行属性查询，并定位高亮  
:::demo

```html
<div style="position: absolute;z-index: 1;">
  <el-button @click="search">查询</el-button>
</div>
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map :mapOptions="mapOptions" @mapInited="mapInited">
      <sh-layer-switcher />
      <sh-layer-manager :layersInfo="layersInfo" :isShow="false" />
    </sh-map>
  </sh-config-provider>
</div>
<script>
  import { MapData } from '@sampleData';

  export default {
    data() {
      this.layersInfo = MapData.layerInfo;
      return {
        mapOptions: {
          center: [117.27643232150454, 31.86426160458683],
          zoom: 16
        }
      };
    },
    methods: {
      mapInited(map) {
        this.map = map;
      },
      search() {
        this.map.search({
          tag: 'hfguihua',
          subLayerId: '0',
          express: 'OBJECTID=8175',
          isShow: true
        });
      }
    }
  };
</script>
```

:::

#### 属性查询参数

```javascript
{
  isLocate: true, //是否定位,默认true
  filter: false, //是否根据express过滤对应图层,默认false
  tag:"gddk", //对应图层目录的layerTag
  subLayerId:"0", //查询图层的层级(arcgis)
  table:"table", //查询图层的图层名(geoserver) 默认取图层配置
  isStopFlashHlight:"true", //是否停止闪烁,true表示不闪烁,默认闪烁
  express:"bh = '3304832014A10076'", //查询的条件
  isShow:true, //闪烁结束过地块是否保持高亮,默认为false
  flashStyle:{  //闪烁的样式
    fillColor:'#00ffff',
    strokeColor:'#00ffff'
  },
  resolution: resolution, // 定位后的resolution,默认根据查询结果的extent计算
  zoom: zoom, // 等同resolution,优先级高于resolution
  success: Function, //查询成功后触发
  failed: Function //查询失败后触发
}
```

### Attributes

| 参数                  | 属性类型 | 类型             | 可选值                                                            | 默认值                                                                     | 说明                                 |
| --------------------- | -------- | ---------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------ |
| projection            | 静态属性 | string           | -                                                                 | EPSG:4490                                                                  | 地图坐标系                           |
| center                | 动态属性 | [number, number] | -                                                                 | [111.7579, 31.6736]                                                        | 初始中心经纬度,坐标类型同 projection |
| zoom                  | 动态属性 | number           | -                                                                 | 5                                                                          | 地图显示的缩放级别                   |
| minZoom               | 静态属性 | number           | -                                                                 | 0                                                                          | 地图允许显示的最小缩放级别           |
| maxZoom               | 静态属性 | number           | -                                                                 | 28                                                                         | 地图允许显示的最大缩放级别           |
| controls              | 动态属性 | array            | FullFigure / Zoom / Geolocation / Rotate / ScaleLine / FullScreen | ['FullFigure', 'Zoom', 'Geolocation', 'Rotate', 'ScaleLine', 'FullScreen'] | 地图控件列表                         |
| mouseWheelZoomEnable  | 动态属性 | boolean          | -                                                                 | true                                                                       | 地图是否可通过鼠标滚轮缩放浏览       |
| doubleClickZoomEnable | 动态属性 | boolean          | -                                                                 | true                                                                       | 地图是否可通过双击鼠标放大地图       |
| dragPanEnable         | 动态属性 | boolean          | -                                                                 | true                                                                       | 地图是否可通过鼠标拖拽平移           |

### 地图控件配置

通过配置 `controls` 属性添加地图控件。

目前支持六种控件：

- FullFigure 复位控件
- Zoom 地图缩放控件
- Geolocation 地理位置控件
- Rotate 指北针控件
- ScaleLine 比例尺控件
- FullScreen 全屏控件

`controls` 属性取值是一个数组，数组每一项就是每个控件的配置；如果想启用控件的默认配置，直接写出控件名字（字符串）即可，如果需要自定义控件的配置，以对象来定义。如：

```javascript
const controls = ['Zoom', 'Geolocation'];
/* ... */
<ShMap :controls="controls"/>
```

或者

```javascript
const controls = ['Zoom', {
  name: 'ScaleLine',
  options: {
    // 以下就是官方提供的可配置属性
    units: 'scale',
    steps: 4
    // ... 以及其他的属性
  }
}];
/* ... */
<ShMap :controls="controls"/>
```

### Events

| 事件名称        | 说明                                                                                                            | 回调参数 |
| --------------- | --------------------------------------------------------------------------------------------------------------- | -------- |
| mapInited       | 地图初始化完成                                                                                                  | map 对象 |
| map:click       | map 对象 `click` 事件,单击而不拖动地图时触发,双击将触发两次（未配置 dblclick 事件时）                           | 事件对象 |
| map:singleclick | map 对象 `singleclick` 事件,一次真正的单击，没有触发拖动和双击。请注意，此事件延迟 250 毫秒，以确保它不是双击。 | 事件对象 |
| map:dblclick    | map 对象 `dblclick` 事件，双击而不拖动地图时触发                                                                | 事件对象 |
| map:moveend     | map 对象 `moveend` 事件，移动地图后触发                                                                         | 事件对象 |
| map:movestart   | map 对象 `movestart` 事件， 当地图开始移动时触发                                                                | 事件对象 |

_要查阅更多 Map 原生事件开发手册，<a href="https://openlayers.org/en/latest/apidoc/module-ol_Map-Map.html" target="_blank">请点击这里。</a>_
