## ConfigProvider 全局化配置

ConfigProvider 使用 vue 的 provide/inject 特性，只需在应用外围包裹一次即可全局生效。

### 基础用法

读取运维端配置，为所有地图组件提供统一的全局化配置

```js
<sh-config-provider
  url="client_admin_url"
  token="your_token"
  schemeId="your_schemeId"
>
  <sh-map />
</sh-config-provider>
```

### 在国土平台（geoplat）中获取配置

```js
<sh-config-provider
  type="geoplat"
  url="http://192.168.11.77:8095/geoplat/application/getAllApplicationInfo"
  applicationId="your_applicationId"
  token="X-Gisq-Token"
>
  <sh-map />
</sh-config-provider>
```

### 其他可单独配置的全局参数

```js
<sh-config-provider shinegaUrl="your_shinegaUrl" token="your_token">
  <sh-map />
</sh-config-provider>
```

### 其他组件获取运维端配置

```js
inject: {
  // configManager单例对象
  configInstance: {
    default:null
  }
},
mounted(){
  this.configInstance.getWidgetInfoByTag('组件编码(运维端查看)').then((result)=>{
    console.log(result)
  })
}
```

### Attributes

| 参数                  | 属性类型 | 说明                         | 类型   | 可选值                  | 默认值      |
| --------------------- | -------- | ---------------------------- | ------ | ----------------------- | ----------- |
| type                  | 动态属性 | 配置服务来源                 | string | clientAdmin / geoplat   | clientAdmin |
| url                   | 动态属性 | 服务地址                     | string | —                       | —           |
| schemeId              | 动态属性 | 方案 ID                      | string | —                       | —           |
| applicationId         | 动态属性 | 国土空间平台应用 id          | string | —                       | —           |
| token                 | 动态属性 | 统一用户中心登录返回的 token | string | —                       | —           |
| fastApplicationId     | 静态属性 | 快速构建平台应用 id          | string | -                       | -           |
| shinegaUrl            | 动态属性 | ga 服务地址                  | string | -                       | -           |
| shinegaInitData       | 静态属性 | ga 保存删除初前置条件        | Object | (options)见下方配置详情 | -           |
| generalCardThemeStyle | 静态属性 | 全局面板类组件主题配置       | object | -                       | -           |
| generalBarThemeStyle  | 静态属性 | 全局工具条类组件主题配置     | object | -                       | -           |

### options

shinegaInitData

```javascript
{
  xm: 'string', //存在xm，保存和删除前会判断目标图层的标识是否与xm相同
  editProjectGuid: 'string', //当指定xmGuid，则所选择要保存/删除的地块xm_guid必须等于该xmGuid或为空
  editBlockGuid: 'string', //当指定dkGuid,如果选中地块为一个，那么这个地块的dk_guid必须与dkGuid一致,或者dk_guid为空
  keyfield: 'string',
  keyvalue: 'string' //keyfield,keyvalue配套使用,均为','隔开的字符串,保存的时候会分隔’,‘
  // 将得到的数组的filed和value,保存至地块属性中
}
```
