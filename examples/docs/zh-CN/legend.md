## Legend 图例

图例组件

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
    <sh-map>
      <sh-layer-switcher />
      <sh-layer-manager />
      <sh-legend />
    </sh-map>
  </sh-config-provider>
</div>
```

:::

### Attributes

> 继承[基础面板](#/zh-CN/component/general-card)组件除 `theme` `destroyOnClose`外的其他 Attributes

| 参数                 | 属性类型 | 类型    | 可选值 | 默认值 | 说明                                    |
|--------------------| -------- | ------- | ------ | ------ |---------------------------------------|
| isEdit             | 动态属性 | boolean  | -      | true   | 是否开启编辑模式                              |
| customWidth        | 动态属性 | number  | -      | 14     | 图例图标的大小                               |
| isShowName         | 动态属性 | boolean | -      | true   | 是否展示图层名称                              |
| showLegendIds      | 动态属性 | array   | -      | -      | 限制只展示数组中图层的图例，不传不限制                   |
| columnNum          | 动态属性 | number  | -      | 1      | 图例分多少列                                |
| fontStyle          | 动态属性 | object  | -      | -      | 图例文字样式，格式等同 vue-style                 |
| layerNameFontStyle | 动态属性 | object  | -      | -      | 图层文字样式，格式等同 vue-style                 |
| editStyleConfig    | 动态属性 | object  | -      | -      | 编辑面板的[默认功能配置](#mo-ren-gong-neng-pei-zhi) |

### Events

> 继承[基础面板](#/zh-CN/component/general-card)组件 Events

### Methods

> 继承[基础面板](#/zh-CN/component/general-card)组件 Methods
