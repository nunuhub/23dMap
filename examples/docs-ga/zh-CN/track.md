## 空间数据追溯分析服务

**请求方式:POST**

**请求地址:/spatial/analy/track**

### 接口描述

被追溯的目标图层列表

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
      <sh-layer-manager />
      <sh-select-tool @selected="selected" />
    </sh-map-earth>
  </sh-config-provider>
</div>

<script>
  export default {
    data() {
      this.map = null;
      this.earth = null;
      return {
        // 地图模式: '2D' '23D' '3D'
        viewMode: '23D',
        ids: [],
        source: 'tongxiang.st_nzydk',
        traTables: ['tongxiang.st_cbdk', 'tongxiang.st_gddk']
      };
    },
    methods: {
      selected(res) {
        let item = JSON.parse(res);
        this.ids = item.properties.id;
        this.params =
          'ids=' +
          this.ids +
          '&source=' +
          this.source +
          '&traTables=' +
          this.traTables;
        fetch('http://192.168.11.20:19599/spatial/analy/track', {
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
            alert(result.result);
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

| 参数名称  | 是否必须 | 数据类型 | 说明                                                                       |
| --------- | -------- | -------- | -------------------------------------------------------------------------- |
| ids       | true     | array    | 需要追溯的要素的 ID 列表                                                   |
| source    | true     | string   | 源表名称（从源表中追溯 ID），pg 数据库需要包含 schema,示例值(sde.st_nzydk) |
| traTables | true     | array    | 被追溯的目标图层列表                                                       |
