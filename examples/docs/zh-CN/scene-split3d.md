## SceneSplit3d 分屏

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
      <sh-layer-manager :position="position" />
      <sh-scene-split3d ref="SceneSplit" />
      <el-button class="btn" @click="fx()">分屏</el-button>
    </sh-map-earth>
  </sh-config-provider>
</div>

<script>
  export default {
    data() {
      return {
        position: {
          type: 'absolute',
          top: '20px',
          left: '500px',
          bottom: 'unset',
          right: 'unset'
        }
      };
    },
    methods: {
      // 3d模式下分屏 左侧三维，右侧三维
      fx() {
        this.$refs.SceneSplit.toggle();
      }
      // 23d模式下分屏 左侧二维，右侧三维
      // fx() {
      //   this.$refs.SceneSplit.toggle(true)
      // },
    }
  };
</script>
```

:::

### Attributes

| 参数名   | 说明                  | 类型   | 默认值                                                                     | 可选值 |
| -------- | --------------------- | ------ | -------------------------------------------------------------------------- | ------ |
| position | 副屏 layermanger 位置 | Object | {type: 'absolute',top: '20px',left: '20px',bottom: 'unset',right: 'unset'} | -      |

### Events

| 事件名称      | 说明                 | 回调参数                 |
| ------------- | -------------------- | ------------------------ |
| change:active | 分屏激活或关闭时触发 | (value) 布尔值，激活状态 |

### Methods

| 方法名     | 说明           | 参数                                       |
| ---------- | -------------- | ------------------------------------------ |
| toggle     | 开启或关闭分屏 | (is2d)布尔类型，可以不传，不传则为三维分屏 |
| activate   | 开启分屏       | 同上                                       |
| deactivate | 关闭分屏       | 同上                                       |
