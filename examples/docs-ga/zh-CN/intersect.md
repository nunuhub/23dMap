## 空间数据叠加分析

**请求方式:POST**

**请求地址:/spatial/analy/intersect**

### 接口描述

空间数据叠加分析服务，根据前端传递的图形参数和被叠加表进行叠加分析

:::demo

```html
<div style="height: 98vh; width: 100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map-earth :viewMode="viewMode" @mapEarthInited="mapEarthInited">
      <sh-layer-switcher />
      <sh-draw-tool ref="drawTool" @drawend="drawend" />
      <sh-layer-manager />
    </sh-map-earth>
  </sh-config-provider>
</div>

<script>
  import GeoJSON from 'ol/format/GeoJSON';
  import WKT from 'ol/format/WKT';
  export default {
    data() {
      this.map = null;
      this.earth = null;
      return {
        // 地图模式: '2D' '23D' '3D'
        viewMode: '23D',
        feature: '',
        jobid: null,
        layer: 'sde.GYLXB_S',
        xmguid: '',
        params: '',
        featureArray: null
      };
    },
    methods: {
      drawend(item) {
        this.jobid = Math.floor(Math.random() * 500).toString();
        this.feature = item;
        this.params =
          'features=' +
          this.feature +
          '&jobid=' +
          this.jobid +
          '&layer=' +
          this.layer +
          '&xmguid=' +
          this.xmguid;
        fetch('http://192.168.11.20:8099/spatial/analy/intersect/', {
          method: 'post',
          body: this.params,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
          .then((data) => {
            return data.json();
          })
          .then((result) => {
            let obj = result.result.data.features;
            for (let key in obj) {
              this.featureArray = obj[key];
              break;
            }
            let geometry;
            let finalGeo;
            let wkt_c = new WKT();
            let geojson_c = new GeoJSON();
            this.featureArray.forEach((item) => {
              geometry = wkt_c.readFeature(item.geom);
              finalGeo = geojson_c.writeFeature(geometry);
              this.$refs.drawTool.loadGeoJson(finalGeo);
            });
          });
      },
      mapEarthInited(obj) {
        this.map = obj.map;
      }
    }
  };
</script>
```

:::

### 请求参数

| 参数名称 | 是否必须 | 数据类型 | 说明                                                            |
| -------- | -------- | -------- | --------------------------------------------------------------- |
| features | true     | string   | 被分析的要素,示例值(从 shinegis-client 客户端 SDK 接口获取)     |
| jobid    | true     | string   | 任务 id,示例值(intersect_abcd)                                  |
| layer    | true     | string   | 要叠加的图层名称，pg 数据库需要包含 schema,示例值(sde.st_nzydk) |
| xmguid   | false    | string   | 项目 GUID                                                       |
