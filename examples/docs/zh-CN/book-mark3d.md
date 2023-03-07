## BookMark3d 场景视廊

场景视廊组件

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
    <sh-map-earth viewMode="3D">
      <sh-layer-switcher></sh-layer-switcher>
      <sh-book-mark3d />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### Attributes

> 继承[基础面板](#/zh-CN/component/general-card)组件除 `theme` `destroyOnClose`外的其他 Attributes

| 参数      | 属性类型 | 类型    | 可选值                                    | 默认值               | 说明                           |
| --------- | -------- | ------- | ----------------------------------------- | -------------------- | ------------------------------ |
| isShow    | 动态属性 | boolean | -                                         | true                 | 是否显示                       |
| url       | 静态属性 | String  | 例: http://192.168.20.28:8089/clientadmin | 不传则默认运维端地址 | 手动传入 url 优先级高于运维端  |
| hasRoam   | 静态属性 | Boolean | -                                         | true                 | 项目中必须引用飞行漫游组件有效 |
| isLocal   | 静态属性 | Boolean | -                                         | false                | 是否使用本地缓存数据           |
| muluList  | 静态属性 | Array   | -                                         | []                   | 传入的本地目录数据             |
| sceneList | 静态属性 | Array   | -                                         | []                   | 传入的本地场景数据             |

### Events

> 继承[基础面板](#/zh-CN/component/general-card)组件 Events

| 事件名称        | 说明                                       | 回调参数               |
| --------------- | ------------------------------------------ | ---------------------- |
| save:localMulu  | 目录数据变动触发(isLocal 为 true 的情况下) | (val) 当前所有目录数据 |
| save:localScene | 场景数据变动触发(isLocal 为 true 的情况下) | (val) 当前所有场景数据 |

### Methods

> 继承[基础面板](#/zh-CN/component/general-card)组件 Methods

| 方法名        | 说明                         | 参数                        |
| ------------- | ---------------------------- | --------------------------- |
| getCameraView | 获取视图参数                 | -                           |
| setCameraView | 将相机从当前位置定位到新位置 | cameraView, options         |
| getImage      | 获取当前地图的缩略图         | type, width,height,callback |

## 示例代码

```javascript
// 获取当前视图参数
let a = this.$refs.BookMark.getCameraView();
console.log(a); // {"y": 30.247628,"x": 120.173619,"z": 4011333.9,"heading": 360,"pitch": -90,"roll": 0}

// 将相机从当前位置定位到新位置
let cameraView = {
  y: 30.247628,
  x: 120.173619,
  z: 4011333.9,
  heading: 360,
  pitch: -90,
  roll: 0
};
let options = { isFly: true }; // 是否加飞行动画
this.$refs.BookMark.setCameraView(cameraView, options);

// 获取当前地图的缩略图
let type = 'base64'; // 可选值 base64, file, url
let widht = 800,
  height = 400;
this.$refs.BookMark.getImage(type, widht, height, (val) => {
  console.log(val);
});

// 本地目录数据示例
let muluList = [
  {
    describe: '',
    id: '537f038f-accd-4d17-9fac-91f6ce00accd',
    isDefault: true,
    name: 'qqq'
  }
];

// 本地场景数据示例
let sceneList = [
  {
    id: '537f038f-accd-4d17-9fac-91f6ce00accd',
    y: 30.627864,
    x: 120.577169,
    z: 541.49,
    heading: 357,
    pitch: -57.2,
    roll: 0,
    name: '666',
    baseMap: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABwCAYAAABbwT', // base64 || 图片地址
    catalogId: '1e9ef3e1-1c1e-4341-9d20-2d5d832acaef' // 目录id
  }
];
```
