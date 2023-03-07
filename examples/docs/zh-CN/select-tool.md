## SelectTool 选择组件

提供选择图层地块功能的组件

### 基础用法

基础的组件用法。

:::demo 基础用法。

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map :center="center" :zoom="zoom">
      <sh-layer-manager />
      <sh-scheme-layer
        :isShow="false"
        defaultScheme="<%identify_popup_scheme1%>"
      />
      <sh-layer-switcher />
      <sh-select-tool />
    </sh-map>
  </sh-config-provider>
</div>
```

:::

### Attributes

| 参数       | 属性类型 | 类型   | 可选值    | 默认值    | 说明         |
| ---------- | -------- | ------ | --------- | --------- | ------------ |
| returnType | 静态属性 | string | 'geojson' | 'geojson' | 返回数据类型 |

### Events

| 事件名称 | 说明             | 回调参数             |
| -------- | ---------------- | -------------------- |
| selected | 选择到图形后触发 | (result)选择到的数据 |

### Methods

| 方法名     | 说明               | 参数                                                            |
| ---------- | ------------------ | --------------------------------------------------------------- |
| toggle     | 开启或关闭选择功能 | (isOpen)布尔类型,表示想要打开或者关闭,可以不传,不传则为改变状态 |
| activate   | 开启选择功能       | -                                                               |
| deactivate | 关闭选择功能       | -                                                               |
