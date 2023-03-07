## ExportMap 制图组件

制图组件

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
      <sh-export-map />
    </sh-map>
  </sh-config-provider>
</div>
```

:::

### Attributes

> 继承[基础面板](#/zh-CN/component/general-card)组件除 `theme` `destroyOnClose`外的其他 Attributes

| 参数   | 属性类型 | 类型   | 可选值 | 默认值     | 说明             |
| ------ | -------- | ------ | ------ | ---------- | ---------------- |
| url    | 静态属性 | String | -      | 运维端配置 | 模板制图后端地址 |
| scales | 静态属性 | array  | -      | 运维端配置 | 可选比例尺配置   |

### Events

> 继承[基础面板](#/zh-CN/component/general-card)组件 Events

| 事件名称 | 说明                                  | 回调参数 |
| -------- | ------------------------------------- | -------- |
| start    | 启用制图后触发,用于隐藏界面上其他元素 | -        |
| end      | 关闭制图后触发,用于恢复界面上其他元素 | -        |

### Methods

> 继承[基础面板](#/zh-CN/component/general-card)组件 Methods

| 方法名  | 说明         | 参数 |
| ------- | ------------ | ---- |
| execute | 启用制图功能 | -    |
