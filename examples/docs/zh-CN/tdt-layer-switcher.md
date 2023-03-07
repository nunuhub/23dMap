## TdtLayerSwitcher 天地图底图切换
提供天地图电子地图、影像地图、地形图的切换功能；目前仅支持二维地图

### 基础用法

基础的天地图底图切换用法。

:::demo 使用`defaultActive`属性来控制初始加载的图层类型。

```html
<div style="height:100%;width:100%">
  <sh-map>
    <sh-layer-switcher />
  </sh-map>
</div>
```
:::

### Attributes
| 参数      |是否动态参数 | 说明    | 类型      | 可选值       | 默认值   |
|---------- |------------|-------- |---------- |-------------  |-------- |
| defaultActive | 否 | 初始加载类型 | string | vec / img / ter (电子/影像/地形)| vec | 
| tk | 天地图秘钥 |否 |  string | - | - |
