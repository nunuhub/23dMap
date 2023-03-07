## Roam3d 飞行漫游

飞行漫游组件

### 基础用法

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
      <sh-map-earth viewMode="3D">
        <sh-layer-switcher />
        <sh-roam3d ref="roam" />
        <el-button
          style="position: absolute; top: 20px; right: 150px"
          @click="test()"
          >传入数据飞行</el-button
        >
        <el-button
          style="position: absolute; top: 80px; right: 150px"
          @click="stop()"
          >停止飞行</el-button
        >
      </sh-map-earth>
    </sh-config-provider>
  </div>
</template>
<script>
  let testJson = {
    geometry: {
      type: 'LineString',
      coordinates: [
        [120.21554, 30.213461, 17.9],
        [120.219607, 30.215724, 17.36],
        [120.218702, 30.216884, 17.43],
        [120.222816, 30.218871, 19.76]
      ]
    },
    name: '测试',
    id: '65d5dc30296d0608066f162213cd53d1',
    properties: {
      attr: {
        name: '测试',
        point: 'model_car',
        showLabel: false,
        showLine: true,
        showShadow: false,
        cameraType: 'gs',
        followedX: 300,
        followedZ: 200,
        clockRange: false,
        id: '0705180508'
      },
      type: 'polyline',
      style: { color: '#ffff00' },
      speed: 100
    },
    type: 'Feature'
  };
  export default {
    components: {},
    data() {
      return {};
    },
    methods: {
      test() {
        this.$refs.roam.fly(testJson, true);
      },
      stop() {
        this.$refs.roam.stop();
      }
    }
  };
</script>
```

:::

### Attributes

> 继承[基础面板](#/zh-CN/component/general-card)组件除 `theme` `destroyOnClose`外的其他 Attributes

| 参数   | 属性类型 | 类型    | 可选值                                    | 默认值               | 说明                          |
| ------ | -------- | ------- | ----------------------------------------- | -------------------- | ----------------------------- |
| isShow | 动态属性 | boolean | -                                         | true                 | 是否显示                      |
| url    | 静态属性 | String  | 例: http://192.168.20.28:8089/clientadmin | 不传则默认运维端地址 | 手动传入 url 优先级高于运维端 |

### Events

> 继承[基础面板](#/zh-CN/component/general-card)组件 Events

### Methods

> 继承[基础面板](#/zh-CN/component/general-card)组件 Methods

| 方法名           | 说明         | 参数                                             |
| ---------------- | ------------ | ------------------------------------------------ |
| fly              | 传入数据飞行 | (val, true), val 参照示例代码                    |
| start            | 开始飞行     | -                                                |
| suspend          | 暂停         | -                                                |
| stop             | 停止飞行     | -                                                |
| backward         | 回退上一节点 | -                                                |
| forward          | 跳到下一节点 | -                                                |
| cameraTypeChange | 改变视角     | gs(跟随视角)、dy(锁定第一视角)、sd(锁定上帝视角) |
| setComponentShow | 工具条显隐   | boolean                                          |

## 示例代码

```javascript
let testJson = {
  geometry: {
    type: 'LineString',
    coordinates: [
      [120.21554, 30.213461, 7.9],
      [120.219607, 30.215724, 7.36],
      [120.218702, 30.216884, 7.43],
      [120.222816, 30.218871, 9.76]
    ]
  },
  name: '测试',
  id: '65d5dc30296d0608066f162213cd53d1',
  properties: {
    attr: {
      name: '测试',
      point: 'model_car', // 漫游对象：point、model_car、model_air、model_weixin
      showLabel: false, // 是否显示注记
      showLine: true, // 是否显示路线
      showShadow: false, // 投影
      cameraType: 'dy', // 视角：gs(跟随视角)、dy(锁定第一视角)、sd(锁定上帝视角)
      followedX: 300, // 距离运动点的距离（后方）
      followedZ: 200, // 距离运动点的高度（上方）
      clockRange: false, // 到达终止时间后 false(停止)/true(循环)
      id: '0705180508'
    },
    type: 'polyline',
    style: { color: '#ffff00' },
    speed: 100 // 速度
  },
  type: 'Feature'
};
// 传入json飞行
this.$refs.roam.fly(testJson, true);
```
