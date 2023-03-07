## FileExport 文件导出

文件导出为地块的组件

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
      <sh-file-export />
    </sh-map>
  </sh-config-provider>
</div>
```

:::

### Attributes

> 继承[基础面板](#/zh-CN/component/general-card)组件除 `theme` `destroyOnClose`外的其他 Attributes

| 参数名        | 说明               | 类型    | 默认值 | 可选值 |
| ------------- | ------------------ | ------- | ------ | ------ |
| url           | 导出服务的 url     | String  | -      | -      |
| fileTypes     | 可支持的文件类型   | Array   | -      | -      |
| imgIconConfig | 图标参数           | Object  | -      | -      |
| visible       | 控制面板显示和隐藏 | Boolean | -      | -      |

### Methods

> 继承[基础面板](#/zh-CN/component/general-card)组件 Methods

| 方法名  | 说明                            | 参数                  |
| ------- | ------------------------------- | --------------------- |
| setMap  | 绑定地图容器                    | (map) GisMap 组件.map |
| setShow | 代码控制是否显示 Menu 面板      | (isShow) Boolean      |
| isShow  | 返回是否显示 Menu 面板(Boolean) | -                     |
