## SpatialAnalysis3d 空间分析

### 基础用法

基础的空间分析工具用法。

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
      <sh-layer-manager />
      <sh-scheme-layer :isShow="false" defaultScheme="<%flatten_scheme%>" />
      <sh-spatial-analysis3d />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### Attributes

> 继承[基础工具条](#/zh-CN/component/general-bar)组件 Attributes

| 参数名         | 类型   | 可选值 | 默认值 | 说明                 |
| -------------- | ------ | ------ | ------ | -------------------- |
| panelCardProps | Object | -      | -      | `属性面板`的各项参数 |

### Events

> 继承[基础工具条](#/zh-CN/component/general-bar)组件 Events

### Methods

> 继承[基础工具条](#/zh-CN/component/general-bar)组件 Methods

| 方法名              | 说明                     | 参数           | 可选值                                                                                  | 备注                   |
| ------------------- | ------------------------ | -------------- | --------------------------------------------------------------------------------------- | ---------------------- |
| getAnalysisInstance | 获取空间分析功能实例     | (instanceName) | "flood","visible","viewShed",</br>"controlHeight","sun","clip","skyLine","terrain"      |                        |
| execute             | 执行空间分析某一具体分析 | (type)         | "viewShed","flood","visible",</br>"controlHeight","clip"                                | 例如开始视域分析的绘制 |
| clear               | 删除某一具体分析的结果   | (type)         | "flood","visible","viewShed",</br>"controlHeight","sun","clip",</br>"skyLine","terrain" | 例如清除视域分析的结果 |
| clearAll            | 清除所有分析的结果       | ()             |                                                                                         |                        |
