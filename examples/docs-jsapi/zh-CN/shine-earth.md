## ShineEarth 地球对象类

地球对象类，封装了地图的属性设置、图层变更、事件交互等接口的类。

```js
new ShineEarth(element, options?);
```

### 参数说明

- element (string) 地球的容器元素的 ID 。注意：地球容器在创建之前必须拥有实际大小，否则可能出现地球无法渲染的问题。

- options (object) 地球初始化参数

| 参数名称           | 参数类型         | 默认值              | 说明                                 |
| ------------------ | ---------------- | ------------------- | ------------------------------------ |
| options.projection | string           | EPSG:4490           | center 的坐标系                      |
| options.center     | [number, number] | [111.7579, 31.6736] | 初始中心经纬度,坐标类型同 projection |
| options.height     | number           | 6149142.56          | 初始视高                             |
| options.heading    | number           | 0                   | 初始方位角                           |
| options.roll       | number           | 0                   | 初始旋转角                           |
| options.pitch      | number           | -90                 | 初始倾斜角                           |

### 成员函数

#### centerAt(position, options?)

地球缩放至指定位置

参数说明

| 参数名称           | 参数类型         | 默认值                           | 说明                |
| ------------------ | ---------------- | -------------------------------- | ------------------- |
| position.center    | [number, number] | 当前视图中心点坐标               | 中心点坐标          |
| position.height    | number           | 当前视图相机高度                 | 相机高度            |
| position.heading   | number           | 当前视图方位角                   | 方位角              |
| position.roll      | number           | 当前视图旋转角                   | 旋转角              |
| position.pitch     | number           | 当前视图倾斜角                   | 倾斜角              |
| options.duration   | number           | 默认值是内部自动计算的一个动态值 | 动画过度的时长控制  |
| options.projection | string           | EPSG:4490                        | center 的坐标系信息 |

#### setExtent(extent, options?)

设置当前地球显示范围

参数说明

| 参数名称           | 参数类型 | 默认值                           | 说明                          |
| ------------------ | -------- | -------------------------------- | ----------------------------- |
| extent             | array    | -                                | 范围 [minX, minY, maxX, maxY] |
| options.duration   | number   | 默认值是内部自动计算的一个动态值 | 动画过度的时长控制            |
| options.projection | string   | EPSG:4490                        | extent 的坐标系信息           |

#### getExtent()

获取当前地球窗口范围

返回值

| 值名称 | 值类型 | 说明                          |
| ------ | ------ | ----------------------------- |
| extent | array  | 范围 [minX, minY, maxX, maxY] |

#### getCenter()

获取当前地球中心点

返回值

| 值名称 | 值类型           | 说明               |
| ------ | ---------------- | ------------------ |
| center | [number, number] | 当前视图中心点坐标 |

#### getHeight()

获取当前地球视高

返回值

| 值名称 | 值类型 | 说明             |
| ------ | ------ | ---------------- |
| height | number | 当前视图相机高度 |

#### getZoom()

获取当前地球 zoom 由视高计算得来，并不十分准确

返回值

| 值名称 | 值类型 | 说明             |
| ------ | ------ | ---------------- |
| zoom   | number | 当前地球缩放等级 |

#### getOrientation()

获取当前地球视角方向等属性

返回值

| 值名称              | 值类型 | 说明           |
| ------------------- | ------ | -------------- |
| orientation.heading | number | 当前地球方位角 |
| orientation.roll    | number | 当前地球旋转角 |
| orientation.pitch   | number | 当前地球倾斜角 |

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

获取用作地球视口的元素

返回值

| 值名称  | 值类型      | 说明     |
| ------- | ----------- | -------- |
| element | HTMLElement | dom 元素 |

#### resize()

强制重新计算地球视口大小
