## DrawTool3d 绘制工具

### 基础用法

基础的绘制工具用法。

:::demo

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map-earth viewMode="3D">
      <sh-layer-switcher />
      <sh-layer-manager />
      <sh-scheme-layer :isShow="false" defaultScheme="<%flatten_scheme%>" />
      <sh-draw-tool3d />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### 加载 GeoJson 数据

加载模型

:::demo

```html
<div style="height:100%;width:100%">
  <sh-map-earth viewMode="3D">
    <sh-layer-switcher />
    <sh-draw-tool3d ref="dt" @inited="getDraw" />
    <el-button-group class="btn-group">
      <el-button type="primary" @click="setS(feature,style)"
        >设定样式</el-button
      >
      <el-button type="primary" @click="delete1(feature)">删除图形</el-button>
      <el-button type="primary" @click="delete2(features)"
        >删除图形（数组）</el-button
      >
    </el-button-group>
  </sh-map-earth>
</div>

<script>
  export default {
    data() {
      return { style: { fillColor: '#f00' } };
    },
    methods: {
      getDraw(drawTool) {
        this.drawTool = drawTool;
        let point = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [121.137088, 30.377457]
              }
            },
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [121.138242, 30.381983]
              }
            },
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [121.133063, 30.382761]
              }
            }
          ]
        };
        let style = {
          model: {
            name: '模型',
            url: 'http://data.mars3d.cn/gltf/mars/ship/ship05.glb',
            opacity: 1,
            scale: 2,
            silhouette: true
          }
        };
        let entities = drawTool.loadGeoJson(point, {
          type: 'model',
          style
        });
        let entity = entities[0];
        this.features = entities;

        let lineString = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                coordinates: [
                  [121.148812, 30.38861],
                  [121.1339425, 30.3769433],
                  [121.1411603, 30.3670205]
                ],
                type: 'LineString'
              }
            }
          ]
        };
        drawTool.loadGeoJson(lineString, {
          type: 'polyline',
          isFly: true
        });

        let lineString2 = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                coordinates: [
                  [121.149812, 30.38761],
                  [121.1421603, 30.3650205],
                  [121.1491603, 30.3650205]
                ],
                type: 'LineString'
              }
            }
          ]
        };
        drawTool.loadGeoJson(lineString2, {
          type: 'polyline',
          isFly: true,
          style: {
            lineType: 'polylineCityLink', //轨迹线
            clampToGround: true,
            width: 18,
            fillColor: 'blue'
          }
        });
        let lineString3 = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                coordinates: [
                  [121.14981, 30.385234],
                  [121.15717, 30.38113],
                  [121.14864, 30.37092]
                ],
                type: 'LineString'
              }
            }
          ]
        };
        drawTool.loadGeoJson(lineString3, {
          type: 'wall',
          isFly: true,
          style: {
            fillType: 'dynamicGradualWall', //走马灯
            fillColor: '#ffff00ff',
            extrudedHeight: 200
          }
        });
        let polygon = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                coordinates: [
                  [
                    [121.13057, 30.376114],
                    [121.13009, 30.3752425],
                    [121.13124, 30.3742045],
                    [121.13225, 30.375367],
                    [121.13057, 30.376114]
                  ]
                ],
                type: 'Polygon'
              }
            },
            {
              type: 'Feature',
              properties: {},
              geometry: {
                coordinates: [
                  [
                    [121.13057, 30.367114],
                    [121.13009, 30.3662425],
                    [121.13124, 30.3652045],
                    [121.13225, 30.366367],
                    [121.13057, 30.367114]
                  ]
                ],
                type: 'Polygon'
              }
            }
          ]
        };
        let features = drawTool.loadGeoJson(polygon, {
          type: 'polygon',
          style: {
            fillColor: 'yellow',
            height: 250,
            extrudedHeight: 80,
            fillType: 'animationCircle'
          }
        });
        this.feature = features[0];
        let polygon2 = {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                coordinates: [
                  [
                    [121.15057, 30.376114],
                    [121.15009, 30.3752425],
                    [121.15124, 30.3742045],
                    [121.15225, 30.375367],
                    [121.15057, 30.376114]
                  ]
                ],
                type: 'Polygon'
              }
            },
            {
              type: 'Feature',
              properties: {},
              geometry: {
                coordinates: [
                  [
                    [121.15057, 30.387114],
                    [121.15009, 30.3862425],
                    [121.15124, 30.3852045],
                    [121.15225, 30.386367],
                    [121.15057, 30.387114]
                  ]
                ],
                type: 'Polygon'
              }
            }
          ]
        };
        drawTool.loadGeoJson(polygon2, {
          type: 'polygon',
          style: {
            fillColor: 'red',
            clampToGround: true,
            strokeWidth: 6,
            strokeColor: 'blue'
          }
        });
      },
      setS(feature, style) {
        this.drawTool.setFeatureStyle(feature, style);
      },
      delete1(feature) {
        this.drawTool.removeFeature(feature);
      },
      delete2(features) {
        this.drawTool.removeFeatures(features);
      }
    }
  };
</script>
```

:::

### Attribute

> 继承[基础工具条](#/zh-CN/component/general-bar)组件 Attributes

| 参数名         | 类型    | 可选值     | 默认值 | 说明                           |
| -------------- | ------- | ---------- | ------ | ------------------------------ |
| panelCardProps | Object  | -          | -      | `属性面板`的各项参数           |
| preLoad        | Boolean | true/false | false  | 组件初始化时加载上次保存的图形 |
| eidtAfterDraw  | Boolean | true/false | true   | 绘制完后进入编辑               |
| url            | String  | -          | -      | 手动配置存储和加载地址         |
| schemeId       | String  | -          | -      | 手动配置方案 id                |
| options        | Object  | -          | -      | 工具条中各图形的绘制启用设定   |

### Events

> 继承[基础工具条](#/zh-CN/component/general-bar)组件 Events

| 事件名称      | 说明                       | 回调参数                                                                         |
| ------------- | -------------------------- | -------------------------------------------------------------------------------- |
| inited        | 绘制对象初始化             | (Draw) 绘制对象                                                                  |
| drawend       | 绘制结束回调               | (geojson)每次绘制结束返回 geojson 数据                                           |
| change:active | 工具条工具激活或关闭时触发 | (active, tool, activeTools) 分别为激活状态、触发该事件的工具名称、已激活的工具名 |

### Methods

> 继承[基础工具条](#/zh-CN/component/general-bar)组件 Methods

| 方法名          | 说明                                 | 参数                         |
| --------------- | ------------------------------------ | ---------------------------- |
| activate        | 开始手动绘制。将返回绘制的要素对象   | (type) [drawType](#drawtype) |
| deactivate      | 中止绘制                             | ()                           |
| remove          | 移除已绘制图形                       | (entity)支持单个和数组       |
| removeAll       | 移除所有已绘制的图形(按图层删或全删) | (/id)当参数为空时删除所 层   |
| createDrawLayer | 见下方 drawTool                      |                              |
| loadGeoJson     | 见下方 drawTool                      |                              |

### DrawTool 对象方法

> drawTool 对象上的方法，可通过 inited 获取 drawTool 对象。

| 方法名          | 说明                                           | 参数                                                                                                                                                                                                                                                                     |
| --------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| activate        | 开始手动绘制。将返回绘制的要素对象             | (type) [drawType](#drawtype)                                                                                                                                                                                                                                             |
| deactivate      | 中止绘制                                       | ()                                                                                                                                                                                                                                                                       |
| createDrawLayer | 创建一个绘制图层,如果已存在则返回该图层        | ({ id, name, layerTag })对象，包含该图层 id、name、tag                                                                                                                                                                                                                   |
| loadGeoJson     | 加载 GeoJson 数据。 将返回加载后的要素对象数组 | (GeoJSON,{isClear,isFly,isFlash,layerId,style,type}) GeoJSON:待上图的数据；isClear:是否清除之前的图形；isFly：加载后是否定位至数据;isFlash：加载后是否闪烁提示片刻;layerId:图层 id，style：图层样式[generalStyle](#generalstyle);type:要素类型[drawType](#drawtype),必填 |
| removeFeature   | 移除图形                                       | (feature)feature:待移除的图形                                                                                                                                                                                                                                            |
| removeFeatures  | 移除图形(数组)                                 | (features)features:待移除的图形数组                                                                                                                                                                                                                                      |
| removeAll       | 移除 drawTool 内所有图形                       |                                                                                                                                                                                                                                                                          |
| setFeatureStyle | 设置图形样式                                   | (features,style)features:图形;style：图层样式[generalStyle](#generalstyle)                                                                                                                                                                                               |

### Methods 示例

```javascript
//开始绘制polygon
draw('polygon');
//加载GeoJson数据。（例子为：标记、线、面）
let a = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        edittype: 'billboard',
        name: '图标点标记',
        style: { image: 'Assets3D/img/mark0.svg' },
        attr: { id: '20220728153540' },
        type: 'billboard'
      },
      geometry: {
        type: 'Point',
        coordinates: [118.195745, 30.064036, 259.67]
      }
    },
    {
      type: 'Feature',
      properties: {
        edittype: 'polyline',
        name: '线',
        config: { minPointNum: 2 },
        style: { color: '#ffff00' },
        attr: { id: '20220728153646' },
        type: 'polyline'
      },
      geometry: {
        type: 'LineString',
        coordinates: [
          [120.619875, 30.828672, -16.28],
          [119.69788, 30.039838, 281.71],
          [120.702098, 29.895578, 237.49]
        ]
      }
    },
    {
      type: 'Feature',
      properties: {
        edittype: 'polygon_clampToGround',
        name: '贴地面',
        config: { height: false },
        style: {},
        attr: { id: '20220728153657' },
        type: 'polygon'
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [121.812305, 31.056245, 0],
            [121.695954, 28.699345, 0],
            [123.399903, 28.722531, 0],
            [121.812305, 31.056245, 0]
          ]
        ]
      }
    }
  ]
};
let entities = loadJson(a, {
  idClear: true,
  isFly: true,
  id: 3514615,
  style: null
});
```

### drawType

| 绘制类型                | 说明     |
| ----------------------- | -------- |
| point                   | 点       |
| polyline                | 线       |
| polygon                 | 面       |
| polygon_clampToGround   | 贴地面   |
| rectangle               | 矩形     |
| rectangleImg            | 图片矩形 |
| rectangle_clampToGround | 贴地矩形 |
| circle                  | 圆       |
| circle_clampToGround    | 贴地圆   |
| curve                   | 曲线     |
| curve_clampToGround     | 贴地曲线 |
| ellipse                 | 椭圆     |
| ellipse_clampToGround   | 贴地椭圆 |
| extrudedCircle          | 拉伸圆   |
| extrudedEllipse         | 拉伸椭圆 |
| extrudedPolygon         | 拉伸面   |
| extrudedRectangle       | 拉伸矩形 |
| billboard               | 图标     |
| label                   | 文字     |
| model                   | 模型     |
| wall                    | 墙       |

### options

默认配置项

```javascript
{
  circle: true,
  curve: true,
  ellipse: true,
  ellipsoid: true,
  extrudedCircle: true,
  extrudedEllipse: true,
  extrudedPolygon: true,
  extrudedRectangle: true,
  billboard: true,
  label: true,
  model: true,
  point: true,
  line: true,
  polygon: true,
  polyline: true,
  rectangle: true,
  rectangleImg: true,
  wall: true,
}
```

### generalStyle

```javascript
{
  fillColor: 'rgba(0, 79, 249, 0.5)',
  strokeColor: '#FFFFFF',
  strokeWidth: 1.25,
  circle: {
    fillColor: 'rgba(0, 79, 249, 0.5)',
    strokeColor: '#FFFFFF',
    strokeWidth: 1.25,
    radius: 5
  },
  icon: {
    src: '',
    anchor: [0.5, 0.5]
  },
  text: {
    font: '13px Calibri,sans-serif',
    fillColor: '#FFF',
    strokeColor: '#004ff9',
    strokeWidth: 1.25,
    offset: [1, 2],
    text: '123'
  },
  model: {
    url: 'Assets3D/model/car.gltf'
  }
}
```
