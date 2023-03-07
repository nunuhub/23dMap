## ShineMap 地图对象类

地图对象类，封装了地图的属性设置、图层变更、事件交互等接口的类。

```js
new ShineMap(element, options?);
```

### 参数说明

- element (HTMLElement | string) 地图的容器，可以是元素本身，也可以是元素的 ID 。注意：地图容器在创建之前必须拥有实际大小，否则可能出现地图无法渲染的问题。

- options (object) 地图初始化参数

| 参数名称                    | 参数类型         | 默认值              | 说明                                 |
| --------------------------- | ---------------- | ------------------- | ------------------------------------ |
| options.projection          | string           | EPSG:4490           | 地图坐标系                           |
| options.center              | [number, number] | [111.7579, 31.6736] | 初始中心经纬度,坐标类型同 projection |
| options.zoom                | number           | 5                   | 地图显示的缩放级别                   |
| options.minZoom             | number           | 0                   | 地图允许显示的最小缩放级别           |
| options.maxZoom             | number           | 28                  | 地图允许显示的最大缩放级别           |
| options.minResolution       | number           | -                   | 用于确定分辨率约束的最小分辨率       |
| options.maxResolution       | number           | -                   | 用于确定分辨率约束的最大分辨率       |
| options.constrainResolution | boolean          | false               | 缩放时是否为整数 zoom                |

### 事件

### click

单击而不拖动地图时触发,双击将触发两次（未配置 dblclick 事件时）

### singleclick

一次真正的单击，没有触发拖动和双击。请注意，此事件延迟 250 毫秒，以确保它不是双击。

### dblclick

map 对象 dblclick 事件，双击而不拖动地图时触发

### moveend

移动地图后触发

### movestart

当地图开始移动时触发

### 成员函数

#### centerAt(position, options?)

地图缩放至指定位置

参数说明

| 参数名称           | 参数类型         | 默认值               | 说明                |
| ------------------ | ---------------- | -------------------- | ------------------- |
| position.center    | [number, number] | 当前地图中心点坐标   | 地图中心点坐标      |
| position.zoom      | number           | 当前地图层级         | 地图层级            |
| options.duration   | number           | 800 （单位：ms）     | 动画过度的时长控制  |
| options.projection | string           | 默认为当前地图坐标系 | center 的坐标系信息 |

#### setExtent(extent, options?)

设置当前地图显示范围

参数说明

| 参数名称           | 参数类型 | 默认值               | 说明                                                                   |
| ------------------ | -------- | -------------------- | ---------------------------------------------------------------------- |
| extent             | array    | -                    | 范围 [minX, minY, maxX, maxY]                                          |
| padding            | array    | [0, 0, 0, 0]         | 距离边框的内边距(以像素为单位)，数组中的值是顶部、右侧、底部和左侧填充 |
| options.duration   | number   | 800 （单位：ms）     | 动画过度的时长控制                                                     |
| options.projection | string   | 默认为当前地图坐标系 | extent 的坐标系信息                                                    |

#### getExtent()

获取当前地图窗口范围

返回值

| 值名称 | 值类型 | 说明                          |
| ------ | ------ | ----------------------------- |
| extent | array  | 范围 [minX, minY, maxX, maxY] |

#### getCenter()

获取当前地图中心点

返回值

| 值名称 | 值类型           | 说明               |
| ------ | ---------------- | ------------------ |
| center | [number, number] | 当前地图中心点坐标 |

#### getZoom()

获取当前地图 zoom

返回值

| 值名称 | 值类型 | 说明             |
| ------ | ------ | ---------------- |
| zoom   | number | 当前地图缩放等级 |

#### addLayer(data)

添加图层

参数说明

| 参数名称 | 参数类型 | 默认值 | 说明         |
| -------- | -------- | ------ | ------------ |
| data     | object   | -      | 图层配置信息 |

#### removeLayer(data)

移除图层

参数说明

| 参数名称 | 参数类型 | 默认值 | 说明         |
| -------- | -------- | ------ | ------------ |
| data     | object   | -      | 图层配置信息 |

#### getViewport()

获取用作地图视口的元素

返回值

| 值名称  | 值类型      | 说明     |
| ------- | ----------- | -------- |
| element | HTMLElement | dom 元素 |

#### resize()

强制重新计算地图视口大小，在第三方代码更改地图视口的大小时调用
