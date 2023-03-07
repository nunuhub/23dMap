## GeneralBar 基础工具条

基础的工具条工具，提供水平/垂直两种使用模式。

### 基本用法

基础用法。

:::demo 基础工具条默认为垂直模式，通过 `mode` 属性可以使导航菜单变更为水平模式。另外提供了两种颜色配置模式，可通过 `theme` 属性来切换不同的主题。基础工具条还提供了拖动能力，利用 `dragEnable` 来控制拖动能力。

```html
<div style="position: absolute;z-index: 1;">
  <el-radio-group v-model="mode" style="margin-bottom: 20px;">
    <el-radio-button label="vertical">垂直模式</el-radio-button>
    <el-radio-button label="horizontal">水平模式</el-radio-button>
  </el-radio-group>
  <el-radio-group v-model="theme" style="margin-bottom: 20px;">
    <el-radio-button label="light">亮色模式</el-radio-button>
    <el-radio-button label="dark">暗色模式</el-radio-button>
  </el-radio-group>
  <el-radio-group v-model="dragEnable" style="margin-bottom: 20px;">
    <el-radio-button :label="true">可拖动</el-radio-button>
    <el-radio-button :label="false">不可拖动</el-radio-button>
  </el-radio-group>
</div>
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map-earth>
      <sh-layer-switcher />
      <sh-general-bar
        :mode="mode"
        :theme="theme"
        :dragEnable="dragEnable"
        :options="options"
      />
    </sh-map-earth>
  </sh-config-provider>
</div>
<script>
  export default {
    data() {
      return {
        options: [
          {
            key: '1',
            icon: 'el-icon-location',
            name: '选项一'
          },
          {
            key: '2',
            icon: 'el-icon-share',
            name: '选项二'
          },
          {
            key: '3',
            icon: 'el-icon-setting',
            name: '选项三'
          },
          {
            key: '4',
            icon: 'el-icon-document',
            name: '选项四'
          },
          {
            key: '5',
            icon: 'el-icon-menu',
            name: '选项五',
            children: [
              {
                key: '5-1',
                icon: 'el-icon-menu',
                name: '选项一'
              },
              {
                key: '5-2',
                icon: 'el-icon-menu',
                name: '选项二'
              },
              {
                key: '5-3',
                icon: 'el-icon-menu',
                name: '选项三'
              }
            ]
          }
        ],
        theme: 'light',
        mode: 'vertical',
        dragEnable: true
      };
    }
  };
</script>
```

:::

### 激活状态控制

可控制菜单项选中与取消选中。

:::demo

```html
<div style="position: absolute;z-index: 1;">
  <el-radio-group v-model="mode" style="margin-bottom: 20px;">
    <el-radio-button label="vertical">垂直模式</el-radio-button>
    <el-radio-button label="horizontal">水平模式</el-radio-button>
  </el-radio-group>
  <el-radio-group v-model="theme" style="margin-bottom: 20px;">
    <el-radio-button label="light">亮色模式</el-radio-button>
    <el-radio-button label="dark">暗色模式</el-radio-button>
  </el-radio-group>
</div>
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map-earth>
      <sh-layer-switcher />
      <sh-general-bar
        :activeIndex="activeIndex"
        :mode="mode"
        :theme="theme"
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
        options: [
          {
            key: '1',
            icon: 'el-icon-location',
            name: '选项一'
          },
          {
            key: '2',
            icon: 'el-icon-share',
            name: '选项二'
          },
          {
            key: '3',
            icon: 'el-icon-setting',
            name: '选项三'
          },
          {
            key: '4',
            icon: 'el-icon-document',
            name: '选项四'
          },
          {
            key: '5',
            icon: 'el-icon-menu',
            name: '选项五',
            children: [
              {
                key: '5-1',
                icon: 'el-icon-menu',
                name: '选项一'
              },
              {
                key: '5-2',
                icon: 'el-icon-menu',
                name: '选项二'
              },
              {
                key: '5-3',
                icon: 'el-icon-menu',
                name: '选项三'
              }
            ]
          }
        ],
        activeIndex: [],
        theme: 'light',
        mode: 'vertical'
      };
    },
    methods: {
      select(key) {
        this.activeIndex.push(key);
      },
      unselect(key) {
        const index = this.activeIndex.findIndex((ele) => ele === key);
        if (index > -1) {
          this.activeIndex.splice(index, 1);
        }
      }
    }
  };
</script>
```

:::

### 主题配置

基础工具条组件提供了主题自定义配置能力，以适应不同场景。

:::demo 通过 `themeStyle` 属性配置主题。

```html
<div style="position: absolute;z-index: 1;">
  <el-radio-group v-model="mode" style="margin-bottom: 20px;">
    <el-radio-button label="vertical">垂直模式</el-radio-button>
    <el-radio-button label="horizontal">水平模式</el-radio-button>
  </el-radio-group>
  <el-radio-group v-model="theme" style="margin-bottom: 20px;">
    <el-radio-button label="light">亮色模式</el-radio-button>
    <el-radio-button label="dark">暗色模式</el-radio-button>
  </el-radio-group>
  <el-form :inline="true">
    <el-form-item label="亮色模式背景颜色">
      <el-color-picker v-model="lightBgColor"></el-color-picker>
    </el-form-item>
    <el-form-item label="亮色模式文字颜色">
      <el-color-picker v-model="lightTextColor"></el-color-picker>
    </el-form-item>
    <el-form-item label="暗色模式背景颜色">
      <el-color-picker v-model="darkBgColor"></el-color-picker>
    </el-form-item>
    <el-form-item label="暗色模式文字颜色">
      <el-color-picker v-model="darkTextColor"></el-color-picker>
    </el-form-item>
  </el-form>
</div>
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map-earth>
      <sh-layer-switcher />
      <sh-general-bar
        :mode="mode"
        :theme="theme"
        :options="options"
        :themeStyle="themeStyle"
      />
    </sh-map-earth>
  </sh-config-provider>
</div>
<script>
  export default {
    data() {
      return {
        options: [
          {
            key: '1',
            icon: 'el-icon-location',
            name: '选项一'
          },
          {
            key: '2',
            icon: 'el-icon-share',
            name: '选项二'
          },
          {
            key: '3',
            icon: 'el-icon-setting',
            name: '选项三'
          },
          {
            key: '4',
            icon: 'el-icon-document',
            name: '选项四'
          },
          {
            key: '5',
            icon: 'el-icon-menu',
            name: '选项五',
            children: [
              {
                key: '5-1',
                icon: 'el-icon-menu',
                name: '选项一'
              },
              {
                key: '5-2',
                icon: 'el-icon-menu',
                name: '选项二'
              },
              {
                key: '5-3',
                icon: 'el-icon-menu',
                name: '选项三'
              }
            ]
          }
        ],
        theme: 'light',
        mode: 'vertical',
        lightBgColor: '#ffffff',
        lightTextColor: '#303133',
        darkBgColor: '#3d454c',
        darkTextColor: '#fff'
      };
    },
    computed: {
      themeStyle() {
        return {
          light: {
            background: {
              base: this.lightBgColor,
              footer: this.lightBgColor
            },
            text: {
              base: this.lightTextColor
            }
          },
          dark: {
            background: {
              base: this.darkBgColor,
              footer: this.darkBgColor
            },
            text: {
              base: this.darkTextColor
            }
          }
        };
      }
    }
  };
</script>
```

:::

:::tip

基础工具条提供 `light` 和 `dark` 两种主题配置，此组件库中的其他组件在使用此组件时，默认在 `map` 视图下使用 `light` 主题，在 `earth` 视图下使用 `dark`主题。

:::

### Attributes

| 参数        | 属性类型 | 类型    | 可选值                | 默认值                                                                     | 说明                                    |
| ----------- | -------- | ------- | --------------------- | -------------------------------------------------------------------------- | --------------------------------------- |
| isShow      | 静态属性 | boolean | -                     | true                                                                       | 是否显示 general-bar，支持 .sync 修饰符 |
| position    | 静态属性 | object  | -                     | { type: 'absolute', top: '50%', left: '50%', bottom: '0px', right: '0px' } | 初始位置                                |
| theme       | 动态属性 | string  | light / dark          | light                                                                      | 主题模式,默认为亮色模式                 |
| options     | 动态属性 | array   | -                     | []                                                                         | 展示数据                                |
| activeIndex | 动态属性 | array   | -                     | []                                                                         | 处于激活状态的选择的 key                |
| mode        | 动态属性 | string  | horizontal / vertical | vertical                                                                   | 模式                                    |
| dragEnable  | 动态属性 | boolean | -                     | true                                                                       | 是否可拖拽移动                          |
| themeStyle  | 动态属性 | object  | -                     | [默认主题配置](#mo-ren-zhu-ti-pei-zhi)                                     | 主题配置                                |

### options Attributes

| 参数     | 类型    | 可选值      | 默认值 | 说明                                                                                   |
| -------- | ------- | ----------- | ------ | -------------------------------------------------------------------------------------- |
| key      | string  | -           | -      | 唯一值                                                                                 |
| name     | string  | -           | -      | 名称                                                                                   |
| icon     | string  | -           | -      | font-class 名称，例如[ElementUI Icon](https://element.eleme.io/#/zh-CN/component/icon) |
| img      | string  | -           | -      | 其他图片，支持图片路径或 base64                                                        |
| view     | string  | map / earth | -      | 只在该视图下可见                                                                       |
| hidden   | boolean | -           | true   | 是否显示，优先级高于 `view`                                                            |
| disabled | boolean | -           | false  | 是否禁用                                                                               |
| children | array   | -           | -      | 子级菜单项                                                                             |

### Events

| 事件名称      | 说明                   | 回调参数                  |
| ------------- | ---------------------- | ------------------------- |
| change:open   | 工具条打开或关闭时触发 | value                     |
| change:isShow | 工具条展示或隐藏时触发 | value                     |
| select        | 菜单选中回调           | key: 选中菜单项的 key     |
| unselect      | 菜单取消选中回调       | key: 取消选中菜单项的 key |

### Methods

| 参数        | 说明                    | 参数                                                |
| ----------- | ----------------------- | --------------------------------------------------- |
| changeShow  | 改变工具条显示/隐藏状态 | value: true 为展示，false 为隐藏 不传值则为切换状态 |
| getPosition | 获取工具条最新位置      | -                                                   |

### 默认主题配置

默认主题配置及各属性介绍。

```js
{
  light: {  // 亮色模式配置
    background: { // 背景颜色配置
      base: '#ffffff', // 基础背景色
      hover: '#ecf5ff', // hover状态时背景色
      active: '#3385ff', // active状态时背景色
      footer: '#ffffff' // 底部按钮背景色
    },
    text: { // 文字颜色配置
      base: '#303133', // 基础文字颜色
      hover: '#303133', // hover状态时文字颜色
      active: '#fff' // active状态时文字颜色
    },
    icon: { // 图标颜色
      color: '#909399' // 图标颜色
    },
    space: { // 间隔条样式配置
      width: '1px', // 间隔条宽度
      color: '#c0c4cc' // 间隔条颜色
    },
    border: { // 边框
      width: '0px', // 边框宽度
      style: 'solid', // 边框模式
      color: '#000' // 边框颜色
    }
  },
  dark: { // 暗色模式配置
    background: {
      base: '#555E67',
      hover: '#F0884A',
      active: '#FF6105',
      footer: '#3d454c'
    },
    text: {
      base: '#fff',
      hover: '#fff',
      active: '#fff'
    },
    icon: {
      color: '#fff'
    },
    space: {
      width: '1px',
      color: '#c0c4cc'
    },
    border: {
      width: '0px',
      style: 'solid',
      color: '#fff'
    }
  }
}
```
