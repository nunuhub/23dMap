## FlattenTools 开挖压平

开挖压平组件

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
    <sh-map-earth viewMode="3D">
      <sh-layer-switcher />
      <sh-layer-manager />
      <sh-scheme-layer :isShow="false" defaultScheme="<%flatten_scheme%>" />
      <sh-flatten-tools />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### 传入 geojson 用法

:::demo

```html
<div style="position: absolute;z-index: 1;">
  <el-row style="margin-bottom: 20px;">
    <el-button type="primary" @click="terrainTest()">地形开挖</el-button>
    <el-button type="primary" @click="flatten()">3dtiles压平</el-button>
    <el-button type="warning" @click="del()">清除</el-button>
  </el-row>
</div>
<div style="height:100%;width:100%">
  <sh-config-provider
    type="<%your_admin_type%>"
    url="<%your_admin_url%>"
    schemeId="<%your_admin_scheme_id%>"
    token="<%your_admin_token%>"
  >
    <sh-map-earth viewMode="3D" @mapEarthInited="getMap">
      <sh-layer-switcher />
      <sh-layer-manager />
      <sh-scheme-layer :isShow="false" defaultScheme="<%flatten_scheme%>" />
    </sh-map-earth>
  </sh-config-provider>
</div>

<script>
  let GeoJSON = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [120.555786, 30.660105],
        [120.553838, 30.657457],
        [120.554252, 30.654658],
        [120.557518, 30.65483],
        [120.558596, 30.657238]
      ]
    }
  };
  export default {
    data() {
      (this.earth = null), (this.tilesets = []);
      return {};
    },
    methods: {
      getMap(val) {
        this.earth = val.earth;
      },
      terrainTest(val) {
        this.earth.FlattenTool.clipTerrainByGeojson(GeoJSON);
      },
      flatten(val) {
        let map3d = this.earth.viewer;
        let checked3dTilesLayers = map3d.shine.checkedLayers.filter(
          (item) => item.type == '3dtiles'
        );
        checked3dTilesLayers.forEach((o) => {
          let layer = map3d.shine.getLayer(o.id, 'id');
          this.tilesets.push(layer.model);
        });
        this.earth.FlattenTool.flattenTilesetByGeojson(GeoJSON, {
          tilesets: this.tilesets,
          height: 0
        });
      },
      del() {
        this.earth.FlattenTool.deleteTerrainPolygon();
        this.earth.FlattenTool.deleteTilesetPolygon(this.tilesets);
      }
    }
  };
</script>
```

:::

:::tip

注意：地图已存在的开挖或压平面不宜相距太远(列如杭州开挖一块，上海开挖一块)，避免距离太远因像素偏差导致的形状不规则问题。
:::

### Attributes

> 继承[基础面板](#/zh-CN/component/general-card)组件除 `theme` `destroyOnClose`外的其他 Attributes

| 参数     | 属性类型 | 类型    | 可选值                                    | 默认值                  | 说明                               |
| -------- | -------- | ------- | ----------------------------------------- | ----------------------- | ---------------------------------- |
| isShow   | 动态属性 | boolean | -                                         | true                    | 是否显示                           |
| url      | 静态属性 | String  | 例: http://192.168.20.28:8089/clientadmin | 不传则默认运维端地址    | 手动传入 url 优先级高于运维端      |
| schemeId | 静态属性 | String  | 例: 0c3eb7ec-c004-eefb-8c0f-81786210ebf3  | 不传则默认运维端方案 id | 手动传入 schemeId 优先级高于运维端 |
| isCustom | 静态属性 | boolean | -                                         | false                   | 是否自定义开挖压平                 |

### Events

> 继承[基础面板](#/zh-CN/component/general-card)组件 Events

### Methods

| 方法名                  | 说明                     | 参数                                   |
| ----------------------- | ------------------------ | -------------------------------------- |
| clipTilesetByGeojson    | 裁切 3DTileset           | (GeoJSON, { tilesets })                |
| flattenTilesetByGeojson | 压平 3DTileset           | (GeoJSON, { tilesets, height})         |
| clipTerrainByGeojson    | 裁切 地形                | (GeoJSON)                              |
| flattenTerrainByGeojson | 压平 地形                | (GeoJSON, { height })                  |
| deleteTilesetPolygon    | 3DTileset 删除一个或全部 | (tilesets, index) index 不传则删除全部 |
| deleteTerrainPolygon    | 地形删除一个或全部       | (index) index 不传则删除全部           |
