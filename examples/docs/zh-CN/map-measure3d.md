## MapMeasure3d 测量工具

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
    <sh-map-earth :viewMode="viewMode">
      <sh-layer-switcher />
      <sh-layer-manager />
      <sh-scheme-layer :isShow="false" defaultScheme="<%flatten_scheme%>" />
      <sh-map-measure3d :position="position" :panelCardProps="panelCardProps" />
    </sh-map-earth>
  </sh-config-provider>
</div>

<script>
  export default {
    components: {},
    data() {
      return {
        // 地图模式: '2D' '23D' '3D'
        viewMode: '3D',
        position: {
          type: 'absolute',
          top: '310px',
          right: '50px'
        },
        panelCardProps: {
          position: {
            type: 'absolute',
            top: '10px',
            left: '10px'
          }
        }
      };
    }
  };
</script>
```

:::

### Attributes

> 继承[基础工具条](#/zh-CN/component/general-bar)组件 Attributes

| 参数名         | 类型   | 可选值 | 默认值 | 说明                 |
| -------------- | ------ | ------ | ------ | -------------------- |
| panelCardProps | Object | -      | -      | `属性面板`的各项参数 |

### Events

> 继承[基础工具条](#/zh-CN/component/general-bar)组件 Events

| 事件名称 | 说明           | 回调参数           |
| -------- | -------------- | ------------------ |
| inited   | 量测对象初始化 | (Measure) 量测对象 |

### Methods

> 继承[基础工具条](#/zh-CN/component/general-bar)组件 Methods

| 方法名           | 说明                                   | 参数                               |
| ---------------- | -------------------------------------- | ---------------------------------- |
| actieve          | 代码触发测量功能                       | (type) [measureType](#measuretype) |
| deactieve        | 停止当前正在进行的测量行为             | -                                  |
| remove           | 移除所有已绘制的图形，关闭剖面测量图表 | -                                  |
| closeEchartsView | 关闭剖面测量图表                       | -                                  |

### measureType

```javascript
 'spatialDis'空间距离
 'ctgDis' 贴地距离
 'measureHeight'高度测量
 'superHeight' 三角测高
 'measureSection' 剖面测量
 'measurePoint' 坐标测量
 'measureAngle' 方位测量
 'measureArea' 面积测量
```
