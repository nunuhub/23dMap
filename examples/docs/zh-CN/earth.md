## Earth 三维地球组件

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
    <sh-earth>
      <sh-layer-switcher />
    </sh-earth>
  </sh-config-provider>
</div>
```

:::

### 地球控件

使用 `controls` 属性加载地球控件。

:::demo

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-earth :controls="controls">
      <sh-layer-switcher />
    </sh-earth>
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

### 动态改变属性

地球的**动态属性**在地球创建成功后可以动态地改变。

:::demo

```html
<div style="position: absolute;z-index: 1;">
  <el-button type="primary" plain @click="changeCenter">改变地球中心</el-button>
</div>
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-earth :center="center">
      <sh-layer-switcher />
    </sh-earth>
  </sh-config-provider>
</div>

<script>
  export default {
    data() {
      return {
        center: [113, 34]
      };
    },
    methods: {
      changeCenter() {
        this.center = [113 + Math.random() * 10, 34 + Math.random() * 10];
      }
    }
  };
</script>
```

:::

### Attributes

| 参数       | 属性类型 | 类型             | 可选值                                                                                         | 默认值                                                                                       | 说明                                 |
| ---------- | -------- | ---------------- | ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------ |
| projection | 静态属性 | string           | -                                                                                              | EPSG:4490                                                                                    | center 的坐标系                      |
| center     | 动态属性 | [number, number] | -                                                                                              | [111.7579, 31.6736]                                                                          | 初始中心经纬度,坐标类型同 projection |
| height     | 动态属性 | number           | -                                                                                              | 6149142.56                                                                                   | 初始视高                             |
| heading    | 动态属性 | number           | -                                                                                              | 0                                                                                            | 初始方位角                           |
| roll       | 动态属性 | number           | -                                                                                              | 0                                                                                            | 初始旋转角                           |
| pitch      | 动态属性 | number           | -                                                                                              | -90                                                                                          | 初始倾斜角                           |
| controls   | 动态属性 | array            | FullFigure / Zoom / Geolocation / Rotate / ScaleLine / FullScreen / NavigationHelp / ScenePick | ['FullFigure', 'Zoom', 'Geolocation', 'Rotate', 'ScaleLine', 'FullScreen', 'NavigationHelp'] | 控件列表                             |

### 地球控件配置

通过配置 `controls` 属性添加地球控件。

目前支持八种控件：

- FullFigure 复位控件
- Zoom 地球缩放控件
- Geolocation 地理位置控件
- Rotate 指北针控件
- ScaleLine 比例尺控件
- FullScreen 全屏控件
- NavigationHelp 导航介绍控件
- ScenePick 三维视图控件

`controls` 属性取值是一个数组，数组每一项就是每个控件的配置；如果想启用控件的默认配置，直接写出控件名字（字符串）即可，如果需要自定义控件的配置，以对象来定义。如：

```javascript
const controls = ['Zoom', 'Geolocation'];
/* ... */
<ShEarth :controls="controls"/>
```

### Events

| 事件名称    | 说明           | 回调参数                                    |
| ----------- | -------------- | ------------------------------------------- |
| earthInited | 地球初始化完成 | [Earth](#/zh-CN/jsapi/shine-earth) 对象实例 |
