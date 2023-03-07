## FileImport 文件导入

文件导入为地块的组件

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
      <sh-file-import />
    </sh-map>
  </sh-config-provider>
</div>
```

:::

### 自定义图标

```javascript
<file-import>
  <!--添加你想要的按钮-->
</file-import>
```

### Attributes

| 参数名      | 说明                                                            | 类型    | 默认值 | 可选值         |
| ----------- | --------------------------------------------------------------- | ------- | ------ | -------------- |
| url         | 导入服务的 url                                                  | String  | -      | -              |
| fileTypes   | 可支持的文件类型                                                | Array   | -      | -              |
| mode        | 导入模式,每次导入是否清楚上一次地块,single 为清除, multi 不清除 | String  | single | [single,multi] |
| visible     | 控制面板显示和隐藏                                              | Boolean | -      | -              |
| showRecords | 是否显示导入文件记录                                            | Boolean | -      | -              |

### Events

| 事件名称      | 说明         | 回调参数                           |
| ------------- | ------------ | ---------------------------------- |
| importSuccess | 导入成功回调 | (geojson)导入成功返回 geojson 数据 |

### Methods

| 方法名  | 说明         | 参数 |
| ------- | ------------ | ---- |
| execute | 执行导入功能 | -    |
