## GeneralCard 基础面板

基础的悬浮面板组件，提供拖动、自动停靠和样式配置等能力。

### 基本用法

基础用法。

:::demo

```html
<div style="position: absolute;z-index: 1;">
  <el-radio-group v-model="closeBtn" style="margin-bottom: 20px;">
    <el-radio-button :label="true">显示关闭按钮</el-radio-button>
    <el-radio-button :label="false">不显示关闭按钮</el-radio-button>
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
    <sh-map>
      <sh-layer-switcher />
      <sh-general-card
        :styleConfig="styleConfig"
        :theme="theme"
        :dragEnable="dragEnable"
      >
        面板内容
      </sh-general-card>
    </sh-map>
  </sh-config-provider>
</div>
<script>
  export default {
    data() {
      return {
        closeBtn: true,
        theme: 'light',
        dragEnable: true
      };
    },
    computed: {
      styleConfig() {
        return {
          titleBar: {
            closeBtn: this.closeBtn
          }
        };
      }
    }
  };
</script>
```

:::

### 主题配置

基础面板组件提供了主题自定义配置能力，以适应不同场景。

:::demo 通过 `themeStyle` 属性配置主题。

```html
<div style="position: absolute;z-index: 1;">
  <el-radio-group v-model="theme" style="margin-bottom: 20px;">
    <el-radio-button label="light">亮色模式</el-radio-button>
    <el-radio-button label="dark">暗色模式</el-radio-button>
  </el-radio-group>
  <el-form :inline="true">
    <el-form-item label="亮色模式背景颜色">
      <el-color-picker v-model="lightBgColor"></el-color-picker>
    </el-form-item>
    <el-form-item label="亮色模式内容文字颜色">
      <el-color-picker v-model="lightTextColor"></el-color-picker>
    </el-form-item>
    <el-form-item label="暗色模式背景颜色">
      <el-color-picker v-model="darkBgColor"></el-color-picker>
    </el-form-item>
    <el-form-item label="暗色模式内容文字颜色">
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
    <sh-map>
      <sh-layer-switcher />
      <sh-general-card :theme="theme" :themeStyle="themeStyle">
        面板内容
      </sh-general-card>
    </sh-map>
  </sh-config-provider>
</div>
<script>
  export default {
    data() {
      return {
        theme: 'light',
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
            panel: {
              backgroundColor: this.lightBgColor
            },
            primaryFont: {
              fontColor: this.lightTextColor
            }
          },
          dark: {
            panel: {
              backgroundColor: this.darkBgColor
            },
            primaryFont: {
              fontColor: this.darkTextColor
            }
          }
        };
      }
    }
  };
</script>
```

:::

### 科技风主题示例

利用四个边角样式实现一个科技风主题面板。

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
      <sh-general-card :styleConfig="styleConfig" :themeStyle="themeStyle">
        <div class="card-container">面板内容</div>
      </sh-general-card>
    </sh-map-earth>
  </sh-config-provider>
</div>

<script>
  export default {
    data() {
      return {
        styleConfig: {
          isShowCorner: true
        },
        themeStyle: {
          //二维配置
          light: {
            title: {
              backgroundColor: 'transparent',
              backgroundImage:
                'linear-gradient(89deg, #004FF9 0%, rgba(7, 12, 19, 0) 100%)',
              fontSize: '16px',
              color: '#FFFFFF',
              margin: '9px 8px 0',
              borderRadius: '0'
            },
            toolButton: {
              color: '#8395A9'
            },
            primaryFont: {
              fontSize: '12px',
              fontColor: 'rgba(51,51,51,1)'
            },
            panel: {
              backgroundColor: 'rgba(0, 5, 30, 0.9)',
              border: '1px solid #404D5A',
              opacity: ''
            },
            floatButton: {
              fillcolor: 'rgba(233, 239, 248, 0.9)',
              shadowColor: 'rgba(41, 47, 54, 0.6)',
              opacity: ''
            },
            corner: {
              height: '12px',
              width: '12px',
              border: '2px solid #00AAFF'
            }
          },
          //三维配置
          dark: {
            title: {
              backgroundColor: 'transparent',
              backgroundImage:
                'linear-gradient(89deg, #004FF9 0%, rgba(7, 12, 19, 0) 100%)',
              fontSize: '16px',
              color: '#FFFFFF',
              margin: '9px 8px 0',
              borderRadius: '0'
            },
            toolButton: {
              color: '#8395A9'
            },
            primaryFont: {
              fontSize: '12px',
              fontColor: 'rgba(51,51,51,1)'
            },
            panel: {
              backgroundColor: 'rgba(0, 5, 30, 0.9)',
              border: '1px solid #404D5A',
              opacity: ''
            },
            floatButton: {
              fillcolor: 'rgba(233, 239, 248, 0.9)',
              shadowColor: 'rgba(41, 47, 54, 0.6)',
              opacity: ''
            },
            corner: {
              height: '12px',
              width: '12px',
              border: '2px solid #00AAFF'
            }
          }
        }
      };
    }
  };
</script>
```

:::

### 主题示例&自定义修改样式

图层目录组件基于该组件完成，以图层目录组件为例展示该自定义主题。

在图层目录组件中，图层树部分有更多的样式需求，`themeStyle` 无法满足配置需求,此时可以通过添加 css 来完成。

**注意区分主题模式，`dark` 模式会带上 dark 标签**
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
      <sh-layer-manager class="theme-demo3" :themeStyle="themeStyle" />
      <sh-layer-switcher />
    </sh-map-earth>
  </sh-config-provider>
</div>

<script>
  export default {
    data() {
      return {
        themeStyle: {
          //二维配置
          light: {
            //标题样式,参数等同Style
            title: {
              backgroundImage: 'linear-gradient(to right, cyan , yellow)',
              fontSize: '16px',
              color: 'rgba(255,255,255,1)',
              margin: '4px'
            },
            //面板样式,参数等同Style
            panel: {
              backgroundColor: 'rgba(180,255,180,0.8)',
              border: '1px solid #4db3ff70',
              opacity: ''
            },
            //按钮样式,参数等同Style
            floatButton: {
              backgroundColor: 'rgba(180,255,180,0.8)',
              shadowColor: 'rgba(41, 47, 54, 0.6)',
              opacity: ''
            },
            //标题栏上功能按钮
            toolButton: {
              color: 'blue'
            },
            //四个角的配置 styleConfig.isShowCorner为true时才生效
            corner: {
              height: '12px',
              width: '12px',
              border: '2px solid #215aff'
            }
          },
          //三维配置
          dark: {
            //标题样式,参数等同Style
            title: {
              backgroundImage: 'linear-gradient(to right, blue , cyan)',
              color: '#e2e2e2',
              fontSize: '16px'
            },
            //面板样式,参数等同Style
            panel: {
              backgroundColor: 'rgba(41, 47, 255, 0.6)',
              border: '1px solid #4db3ff70',
              opacity: ''
            },
            //按钮样式,参数等同Style
            floatButton: {
              backgroundColor: '#555e67',
              shadowColor: 'rgba(250,250,250,0.8)',
              opacity: ''
            }
          }
        }
      };
    }
  };
</script>
<style>
  .theme-demo3
    .sh-layer-manager
    .layer-tree
    .el-tree
    .el-tree-node
    .el-tree-node__content
    .custom-tree-node
    .layerlabel {
    color: white;
  }
  .theme-demo3
    .sh-layer-manager.dark
    .layer-tree
    .el-tree-node
    .el-tree-node__content
    .custom-tree-node
    .layerlabel {
    color: rgb(255, 200, 200);
  }
</style>
```

:::

:::tip

基础面板提供 `light` 和 `dark` 两种主题配置，此组件库中的其他组件在使用此组件时，默认在 `map` 视图下使用 `light` 主题，在 `earth` 视图下使用 `dark`主题。

:::

### Attributes

| 参数           | 属性类型 | 类型    | 可选值       | 默认值                                                                         | 说明                                     |
| -------------- | -------- | ------- | ------------ | ------------------------------------------------------------------------------ | ---------------------------------------- |
| isShow         | 静态属性 | boolean | -            | true                                                                           | 是否显示 general-card，支持 .sync 修饰符 |
| title          | 静态属性 | string  | -            | 标题                                                                           | 面板标题                                 |
| imgSrc         | 静态属性 | string  | -            | -                                                                              | 面板图标，支持图片路径或 base64          |
| position       | 静态属性 | object  | -            | { type: 'absolute', top: '100px', left: '100px', bottom: '0px', right: '0px' } | 初始位置                                 |
| theme          | 动态属性 | string  | light / dark | light                                                                          | 主题模式,默认为亮色模式                  |
| onlyContainer  | 静态属性 | boolean | -            | false                                                                          | 是否只显示内容区域                       |
| dragEnable     | 动态属性 | boolean | -            | true                                                                           | 是否可拖拽移动                           |
| styleConfig    | 动态属性 | object  | -            | [默认功能配置](#mo-ren-gong-neng-pei-zhi)                                      | 面板功能配置                             |
| themeStyle     | 动态属性 | object  | -            | [默认主题配置](#mo-ren-zhu-ti-pei-zhi)                                         | 主题配置                                 |
| appendToBody   | 静态属性 | boolean | -            | false                                                                          | 是否将面板插入至 body 元素               |
| destroyOnClose | 静态属性 | boolean | -            | false                                                                          | 是否在关闭时销毁面板里的子元素           |

### Events

| 事件名称      | 说明                 | 回调参数 |
| ------------- | -------------------- | -------- |
| change:isShow | 面板展示或隐藏时触发 | value    |

### Methods

| 参数        | 说明                  | 参数                                                |
| ----------- | --------------------- | --------------------------------------------------- |
| changeShow  | 改变面板显示/隐藏状态 | value: true 为展示，false 为隐藏 不传值则为切换状态 |
| getPosition | 获取面板最新位置      | -                                                   |

### 默认功能配置

默认面板功能配置及各属性介绍。

```js
{
  isShowBtn: false, // true时展示btn,点btn显示面板,false直接显示面板
  isStartFix: false, // 初始化时Fix状态是否启用
  isShowCorner: false, // 是否展示四个高亮边角
  titleBar: {
    miniBtn: true, // 是否显示缩小按钮
    maxBtn: false, // 暂未使用
    closeBtn: true, // 是否显示关闭按钮
    fixBtn: true, // 是否显示固定按钮
    title: true // 是否显示标题
  },
  toolBtnSize: { // 面板头部按钮样式
    size: '16px',
    margin: '8px'
  },
  btnSize: { // 面板图标/缩小后的按钮样式
    size: '32px',
    padding: '8px',
    radius: '16px'
  },
  size: { // 面板整体样式
    radius: '4px',
    width: '275px',
    height: '80vh'
  }
}
```

### 默认主题配置

默认面板主题配置及各属性介绍。

```js
{
  light: {
    // 面板头部样式,参数等同Style
    title: {
      backgroundColor: 'rgba(233, 239, 248, 0.9)',
      backgroundImage: '',
      fontSize: '16px',
      color: 'rgba(51,51,51,1)'
    },
    // 面板内容区域字体样式,参数等同Style
    primaryFont: {
      fontSize: '12px',
      fontColor: 'rgba(51,51,51,1)'
    },
    // 面板内容区域样式,参数等同Style
    panel: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      border: '1px solid #4db3ff70',
      opacity: ''
    },
     // 面板头部按钮样式,参数等同Style
    toolButton: {
      color: '#000'
    },
    // 面板缩小后的按钮样式,参数等同Style
    floatButton: {
      backgroundColor: 'rgba(233, 239, 248, 0.9)',
      backgroundImage: '',
      shadowColor: 'rgba(41, 47, 54, 0.6)',
      opacity: ''
    },
    // 面板四个角的配置 styleConfig.isShowCorner为true时才生效
    corner: {
      height: '12px',
      width: '12px',
      border: '2px solid #215aff'
    }
  },
  dark: {
    title: {
      backgroundColor: '#555e67',
      backgroundImage: '',
      color: '#e2e2e2',
      fontSize: '16px'
    },
    primaryFont: {
      fontSize: '12px',
      fontColor: 'rgba(255,255,255,1)'
    },
    panel: {
      backgroundColor: 'rgba(41, 47, 54, 0.6)',
      border: '1px solid #4db3ff70',
      opacity: ''
    },
    toolButton: {
      color: '#fff'
    },
    floatButton: {
      backgroundColor: '#555e67',
      backgroundImage: '',
      shadowColor: 'rgba(250,250,250,0.8)',
      opacity: ''
    },
    corner: {
      height: '12px',
      width: '12px',
      border: '2px solid #215aff'
    }
  }
}
```
