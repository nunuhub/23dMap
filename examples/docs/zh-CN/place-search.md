## PlaceSearch 一键搜索组件

一键搜索组件

## 基本用法

:::demo

```html
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map-earth>
      <sh-layer-switcher />
      <sh-place-search
        :searchConfig="searchConfig"
        :xzqLimit="searchXZQ"
      ></sh-place-search>
    </sh-map-earth>
  </sh-config-provider>
</div>

<script>
  export default {
    data() {
      return {
        searchXZQ: '330100',
        searchConfig: [
          {
            type: 'gaode',
            enable: false,
            maxcount: 1,
            key: '高德地图key',
            url: 'https://restapi.amap.com/v3/place/text?'
          },
          {
            type: 'xzq',
            enable: true,
            maxcount: 10,
            url: 'http://192.168.20.28:8089/clientadmin/xzq',
            layerName: 'shinegis23d'
          },
          {
            type: 'tdt',
            enable: false,
            maxcount: 3,
            url: 'http://api.tianditu.gov.cn/v2/search?&type=query',
            key: '天地图key'
          },
          {
            type: 'geoserver',
            enable: true,
            serverTag: 'aaa',
            maxcount: 20,
            fieldName: '传感器名称',
            geom: 'geom',
            fieldArray: [{ label: '名称', value: '传感器名称' }],
            url: 'https://szh.rfb.zj.gov.cn:8180/geoserver/facility',
            layerName: 'rf_sensor',
            fieldOnMap: '传感器名称' //可选填，点击定位时地图上展示的字段名称
          },
          {
            type: 'geoserver',
            enable: true,
            serverTag: 'bbb',
            maxcount: 20,
            fieldName: 'NAME',
            //当geoserver上的数据源不是来自于shape文件时，修改此参数确定图形字段名
            //geom:'geom',
            fieldArray: [
              { label: '名称', value: 'NAME' },
              { label: '地址', value: 'ADDNAME_1' },
              { label: '电话', value: 'TELEPHONE' },
              { label: '联系人', value: 'LEGAL' }
            ],
            url: 'http://localhost:8080/geoserver/lizhi',
            layerName: 'lizhi:POI',
            fieldOnMap: 'TELEPHONE' //可选填，点击定位时地图上展示的字段名称
          },
          {
            type: 'arcgis',
            enable: false,
            maxcount: 20,
            fieldName: 'NAME',
            fieldArray: [
              { label: '名称', value: 'NAME' },
              { label: '地址', value: 'ADDNAME_1' },
              { label: '电话', value: 'TELEPHONE' },
              { label: '联系人', value: 'LEGAL' }
            ],
            url: 'http://localhost:6080/arcgis/rest/services/poi/MapServer/0',
            fieldOnMap: 'TELEPHONE'
          },
          {
            type: 'baidu',
            enable: false,
            maxcount: 1,
            key: '百度地图key',
            url: 'https://api.map.baidu.com/place/v2/search?'
          }
        ]
      };
    }
  };
</script>
```

:::

### Attributes

> 继承[基础面板](#/zh-CN/component/general-card)组件除 `theme` `destroyOnClose`外的其他 Attributes

| 参数名           | 说明                                                        | 类型    | 默认值      | 可选值                                                               |
| ---------------- | ----------------------------------------------------------- | ------- | ----------- | -------------------------------------------------------------------- | ------------------------------------------------- |
| xzqLimit         | 行政区代码，用于搜索时限制互联网服务的搜索范围              | String  | -           | 互联网服务仅支持市及以下级别的行政区代码                             |
| extent           | 限制开源服务的查询图形边界                                  | Array   | -           | -                                                                    |
| searchConfig     | 搜索配置数组，见示例代码                                    | Array   | -           | 可选其中的一个或几个服务进行配置，不配置时，组件仅可进行坐标查询定位 |
| type             | 服务类型                                                    | String  | -           | gaode/xzq/tdt/geoserver/arcgis/baidu                                 |
| enable           | 是否启用该类型的服务                                        | Boolean | -           | true/false                                                           |
| url              | 服务地址                                                    | String  | -           | -                                                                    |
| maxcount         | 该服务最大返回条数                                          | Number  | -           | -                                                                    | 建议不要超过 100，请求次数过多可能会导致 key 封禁 |
| layerName        | 部分服务需要填写图层名称                                    | String  | -           | 非互联网服务可能会需要配置图层名称时启用                             |
| fieldName        | geoserver/arcgisserver 服务的查询字段                       | String  | -           | 以该字段作为查询条件                                                 |
| fieldArray       | geoserver/arcgisserver 服务自定义配置前端页面显示字段的数组 | Array   | -           | 服务里存在的字段名即可                                               |
| fieldOnMap       | 点击查询结果定位至地图时图标下方显示的文字                  | String  | -           | 服务里存在的字段名即可                                               |
| pageSize         | 每一页的结果条数                                            | Number  | 10          | -                                                                    |
| searchProjection | 坐标搜索时自定义坐标系                                      | String  | 'EPSG:4490' | 可以和地图坐标系做转换的坐标系代码                                   |

### Methods

> 继承[基础面板](#/zh-CN/component/general-card)组件 Methods

| 参数        | 说明                   | 参数                            | 返回结果 |
| ----------- | ---------------------- | ------------------------------- | -------- |
| locatePoint | 根据字符串进行坐标定位 | center(坐标字符串例如:'120,30') |          |
