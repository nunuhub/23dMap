## BaseControl3d 基础配置

三维地球基础配置组件

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
      <sh-layer-switcher />
      <sh-layer-manager />
      <sh-scheme-layer :isShow="false" defaultScheme="<%flatten_scheme%>" />
      <sh-base-control3d />
    </sh-map-earth>
  </sh-config-provider>
</div>

<script>
  export default {
    components: {},
    data() {
      return {
        // 地图模式: '2D' '23D' '3D'
        viewMode: '3D'
      };
    }
  };
</script>
```

:::

### Attributes

> 继承[基础面板](#/zh-CN/component/general-card)组件除 `theme` `destroyOnClose`外的其他 Attributes

| 参数名 | 类型 | 可选值 | 默认值 | 说明 |
| ------ | ---- | ------ | ------ | ---- |

### Events

> 继承[基础面板](#/zh-CN/component/general-card)组件 Events

### Methods

> 继承[基础面板](#/zh-CN/component/general-card)组件 Methods

| 方法名  | 说明                               | 参数                                                   |
| ------- | ---------------------------------- | ------------------------------------------------------ |
| execute | 设定各种基础配置（天气、抗锯齿……） | (key,value) key:'fog','base_light'……,value：true/false |
