## GeneralMask 掩膜组件

掩膜组件

## 基本用法

:::demo

```html
<div style="height:100%;width:100%">
  <sh-map-earth>
    <sh-layer-switcher />
    <sh-general-mask :maskConfig="maskConfig"></sh-general-mask>
  </sh-map-earth>
</div>

<script>
  export default {
    data() {
      return {
        maskConfig: {
          url: 'http://192.168.20.28:19598/clientadmin/xzq',
          layerName: 'gisplatform',
          type: 'private',
          where: '1=1',
          xzqdm: '330782'
          //color:'rgba(0,0,0,1)'
        }
      };
    }
  };
</script>
```

:::

### Attributes

| 参数名               | 说明                                                  | 类型   | 默认值              | 可选值                                      |
| -------------------- | ----------------------------------------------------- | ------ | ------------------- | ------------------------------------------- |
| maskConfig.url       | 掩膜图形获取地址                                      | String | -                   | -                                           |
| maskConfig.layerName | 服务图层名称                                          | String | -                   | -                                           |
| maskConfig.type      | 服务类型                                              | String | -                   | dynamic/wfs/private                         |
| maskConfig.where     | 查询条件                                              | String | -                   | 符合 geoserver/arcgis server 的查询条件即可 |
| maskConfig.xzqdm     | 掩膜行政区代码, private 类型时必传,其余两种类型可不传 | String | -                   | -                                           |
| maskConfig.color     | 被掩盖部分的颜色                                      | String | rgba(255,255,255,1) | rgba/HEX 颜色                               |
