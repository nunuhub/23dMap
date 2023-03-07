## Navigate 行政区导航

行政区导航组件

## 基本用法

:::demo

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map-earth viewMode="23D">
      <sh-layer-switcher />
      <sh-navigate
        :xzqLayer="xzqLayer"
        :initXZQ="initXZQ"
        :navigateConfig="navigateConfig"
      />
    </sh-map-earth>
  </sh-config-provider>
</div>

<script>
  export default {
    data() {
      return {
        xzqLayer: {
          url: 'http://192.168.20.28:19598/clientadmin/xzq',
          layerName: 'gisplatform'
        },
        initXZQ: '',
        navigateConfig: {
          time: 10000, // 过多久填充消失
          borderColor: '#fff', // 边界颜色
          borderWidth: 5, // 边界宽度
          fillColor: 'rgb(255, 255, 0, 0.4)' // 填充色
        }
      };
    }
  };
</script>
```

:::

### Attributes

> 继承[基础面板](#/zh-CN/component/general-card)组件除 `theme` `destroyOnClose`外的其他 Attributes

| 参数名         | 说明                     | 类型       | 默认值                                                                               | 可选值 |
| -------------- | ------------------------ | ---------- | ------------------------------------------------------------------------------------ | ------ |
| xzqLayer       | 行政区导航服务配置       | Object     | -url:服务地址,layerName:每一套导航数据对应一个 layerName(依据具体项目而定)           | -      |
| initXZQ        | 初始行政区代码           | String/num | - 不传或传''则从全国开始                                                             | -      |
| isNeedLoad     | 是否页面加载时直接定位   | Boolean    | false                                                                                | -      |
| navigateConfig | 填充配置                 | Object     | {time:10000，borderColor: '#fff', borderWidth: 5,fillColor: "rgb(255, 255, 0, 0.4)"} | -      |
| useSearch      | 启用组件自带的搜索功能   | Boolean    | true                                                                                 | -      |
| maxSearchCount | 搜索时返回的最大结果条数 | Number     | 50                                                                                   | -      |
| pageSize       | 单页结果数量             | Number     | 10                                                                                   | -      |

### Events

> 继承[基础面板](#/zh-CN/component/general-card)组件 Events

| 事件名称  | 说明                     | 回调参数                                                                       |
| --------- | ------------------------ | ------------------------------------------------------------------------------ |
| navigated | 每次行政区定位结束后触发 | (finalPlace,extent) finalPlace:行政区对象{xzqmc:'',xzqdm:''},extent:行政区边界 |

### Methods

> 继承[基础面板](#/zh-CN/component/general-card)组件 Methods

| 参数              | 说明                                 | 参数              | 返回结果       |
| ----------------- | ------------------------------------ | ----------------- | -------------- |
| querySearch       | 行政区关键字查询                     | 无                | 行政区结果列表 |
| locateXzq         | 根据行政区代码定位行政区             | xzqdm(行政区代码) |                |
| getSubList(async) | 根据行政区代码获取下一级的行政区列表 | xzqdm(行政区代码) | 行政区列表     |

## 示例代码

```javascript
xzqLayer:{
  url: "http://192.168.20.28:8089/clientadmin/xzq", // 服务地址
  layerName: "shinegis23d", // 图层名称，默认为shinegis23d,可根据具体项目数据配置进行变更
},
initXZQ:'330000'
navigateConfig: {
  time: 10000, // 过多久填充消失
  borderColor: '#fff', // 边界颜色
  borderWidth: 5, // 边界宽度
  fillColor: "rgb(255, 255, 0, 0.4)" // 填充色
},

```
