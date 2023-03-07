## DrawTool 二维绘制工具

提供 `map` 视图下绘制、编辑能力的工具条组件。

### 基础用法

:::demo

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map>
      <sh-layer-switcher />
      <sh-draw-tool />
    </sh-map>
  </sh-config-provider>
</div>
```

:::

### 水平模式工具条

:::demo 工具条默认为垂直模式，通过 mode 属性可以使导航菜单变更为水平模式。

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map>
      <sh-layer-switcher />
      <sh-draw-tool mode="horizontal" />
    </sh-map>
  </sh-config-provider>
</div>
```

:::

### 自定义选择工具

:::demo 通过 `options` 自定义配置工具列表

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map>
      <sh-layer-switcher />
      <sh-draw-tool :options="drawTooloptions" />
    </sh-map>
  </sh-config-provider>
</div>

<script>
  export default {
    data() {
      return {
        drawTooloptions: {
          cad: false,
          drawPoint: false,
          clear: false
        }
      };
    }
  };
</script>
```

:::

### 自定义界面

:::demo 通过 `inited` 事件获取 `drawtool` 对象

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map>
      <sh-layer-switcher />
      <sh-draw-tool :isShow="false" @inited="drawInited" />
      <el-button-group class="btn-group">
        <el-button type="primary" @click="drawActivate('drawLine')"
          >绘制线</el-button
        >
        <el-button type="primary" @click="drawActivate('drawPolygon')"
          >绘制面</el-button
        >
        <el-button type="primary" @click="drawActivate('modify')"
          >编辑</el-button
        >
        <el-button type="primary" @click="removeAll()">移除所有图形</el-button>
      </el-button-group>
    </sh-map>
  </sh-config-provider>
</div>

<script>
  export default {
    data() {
      this.drawtool;
      return {};
    },
    methods: {
      drawInited(tool) {
        this.drawtool = tool;
      },
      drawActivate(type) {
        this.drawtool.activate(type);
      },
      removeAll() {
        this.drawtool.removeAll();
      }
    }
  };
</script>
```

:::

### Attributes

> 继承[基础工具条](#/zh-CN/component/general-bar)组件 Attributes

| 参数              | 属性类型 | 类型    | 可选值 | 默认值                   | 说明                                           |
| ----------------- | -------- | ------- | ------ | ------------------------ | ---------------------------------------------- |
| isShow            | 动态属性 | boolean | -      | true                     | 工具条是否显示                                 |
| options           | 动态属性 | object  | -      | [默认 options](#options) | 工具条配置项                                   |
| isDrawEndSelected | 动态属性 | boolean | -      | true                     | 绘制完立即选中，选中样式为 selectTool 选中样式 |

### Events

> 继承[基础工具条](#/zh-CN/component/general-bar)组件 Events

| 事件名称      | 说明                         | 回调参数                                                                         |
| ------------- | ---------------------------- | -------------------------------------------------------------------------------- |
| inited        | 绘制组件功能初始化完成后触发 | drawtool 工具对象                                                                |
| drawend       | 绘制结束回调                 | (geojson)每次绘制结束返回 geojson 数据                                           |
| change:active | 工具条工具激活或关闭时触发   | (active, tool, activeTools) 分别为激活状态、触发该事件的工具名称、已激活的工具名 |
| change:isShow | 工具条显示或隐藏时触发       | (value) 显示状态                                                                 |

### drawtool 对象方法

> 继承[基础工具条](#/zh-CN/component/general-bar)组件 Methods

| 方法名          | 说明                 | 参数                                                                                                                                                                                                                              | 返回值   |
| --------------- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| activate        | 触发绘制功能         | cad / drawPoint / drawLine / drawPolygon / modify / rotate                                                                                                                                                                        | -        |
| deactivate      | 关闭绘制功能         | -                                                                                                                                                                                                                                 | -        |
| removeAll       | 移除所有已绘制的图形 | id 若 id 为空，则移除默认绘制图层上的图形，否则移除对应 id 的图层上的图形                                                                                                                                                         | -        |
| createDrawLayer | 创建绘制图层         | {id, name, layerTag}                                                                                                                                                                                                              | layer    |
| loadGeoJson     | 加载 GeoJson 数据    | (geojson, {isClear,isFly,layerId,style}) GeoJSON:待上图的数据；isClear:是否清除之前的图形（默认值：false）；isFly：加载后是否定位至数据（默认值：false）;layerId:图层 id（默认值：'drawLayer'），style：[图层样式](#generalstyle) | features |
| removeFeatures  | 移除绘制的图形       | (features)                                                                                                                                                                                                                        | -        |
| removeFeature   | 移除绘制的图形       | (feature)                                                                                                                                                                                                                         | -        |
| setFeatureStyle | 设置图形的样式       | (feature, style) feature: 图形 style: [图形样式](#generalstyle)                                                                                                                                                                   | -        |

### options

默认配置项

```javascript
{
  cad: true,
  drawPoint: true,
  drawLine: true,
  drawPolygon: true,
  modify: true,
  clear: true,
  rotate: true
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
  }
}
```
