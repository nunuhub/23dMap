## ToolBar 工具条

可自动读取并绑定控制相关地图功能的工具条组件。

### 基础用法

只需通过 `key` 值传递组件名称，工具条组件即可自动读取组件并补充默认 `name`、 `img`、 `view`等字段信息。

:::demo

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map-earth>
      <sh-layer-switcher />
      <sh-layer-manager />
      <sh-identify-popup :isShow="false" />
      <sh-draw-tool />
      <sh-draw-tool3d />
      <sh-tool-bar :options="options" />
    </sh-map-earth>
  </sh-config-provider>
</div>
<script>
  export default {
    data() {
      return {
        options: [
          {
            key: 'sh-layer-manager'
          },
          {
            key: 'sh-identify-popup'
          },
          {
            key: 'sh-draw-tool'
          },
          {
            key: 'sh-draw-tool3d'
          }
        ]
      };
    }
  };
</script>
```

:::

### 使用运维端配置

配合 `全局化配置` 组件使用，工具条组件可读取运维端功能目录并自动生成相应 `options`。

**注意：在运维端勾选但未在代码中引入并声明该功能组件的话不会在工具条上展示该菜单项**

:::demo

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map-earth>
      <sh-layer-switcher />
      <sh-layer-manager />
      <sh-draw-tool />
      <sh-draw-tool3d />
      <sh-tool-bar />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### 添加自定义菜单项

只需通过 `key` 值传递组件名称，工具条组件即可自动读取组件并补充默认 `name`、 `img`、 `view`等字段信息。

:::demo

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map-earth>
      <sh-layer-switcher />
      <sh-layer-manager />
      <sh-identify-popup :isShow="false" />
      <sh-draw-tool />
      <sh-draw-tool3d />
      <sh-tool-bar
        :activeIndex.sync="activeIndex"
        :options="options"
        @select="select"
        @unselect="unselect"
      />
    </sh-map-earth>
  </sh-config-provider>
</div>
<script>
  export default {
    data() {
      return {
        activeIndex: [],
        options: [
          {
            key: 'sh-layer-manager'
          },
          {
            key: 'sh-identify-popup'
          },
          {
            key: 'sh-draw-tool'
          },
          {
            key: 'sh-draw-tool3d'
          },
          {
            key: '123456',
            name: '自定义按钮'
          }
        ]
      };
    },
    methods: {
      select(key) {
        if (key === '123456') {
          this.activeIndex.push(key);
        }
      },
      unselect(key) {
        if (key === '123456') {
          const index = this.activeIndex.findIndex((ele) => ele === key);
          if (index > -1) {
            this.activeIndex.splice(index, 1);
          }
        }
      }
    }
  };
</script>
```

:::

:::tip

该组件只会自动读取和绑定组件，不会自动引入相关组件（例如图层目录组件），实际的功能组件需要自行手动引入

:::

:::warning

该组件需要放在所有地图组件的最底部使用，否则无法正常使用。示例：

```js
<sh-map-earth>
  <sh-layer-switcher />
  <sh-layer-manager />
  ...
  <!-- 其他组件 -->
  ...
  <!-- 放置在最底部 -->
  <sh-tool-bar />
</sh-map-earth>

:::

### Attributes
 > 继承[基础工具条](#/zh-CN/component/general-bar)组件Attributes


| 参数      |  属性类型    | 类型      | 可选值     | 默认值   |        说明       |
|---------- |------------|-------- |---------- |------------ |----------------- |
| isShow | 动态属性 | boolean | - | true | 是否显示 |
| activeIndex | 动态属性 | array | - | [] | 处于激活状态的选择的key，支持 .sync 修饰符 |
| showCardState | 静态属性 | boolean | - | true |  是否显示面板类组件(card、bar)的激活状态 |


### Events
 > 继承[基础工具条](#/zh-CN/component/general-bar)组件Events

### Methods
 > 继承[基础工具条](#/zh-CN/component/general-bar)组件Methods
```
