## MapShare 地图分享

地图分享

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
    <sh-map-earth
      ref="mapEarth"
      :mapOptions="mapOptions"
      @mapEarthInited="mapEarthInited"
    >
      <sh-layer-switcher />
      <sh-map-share :params="params" />
    </sh-map-earth>
  </sh-config-provider>
</div>
<script>
  export default {
    data() {
      return {
        mapOptions: {
          center: [117.27643232150454, 31.86426160458683],
          zoom: 16
        },
        params: {
          preview: '基础用法'
        }
      };
    },
    methods: {
      mapEarthInited(obj) {
        try {
          let search = window.location.href.split('?')[1];
          let searchParams = new URLSearchParams(search);
          let x = searchParams.get('x');
          let y = searchParams.get('y');
          let z = searchParams.get('z');
          // 三维参数
          let heading = searchParams.get('heading');
          let pitch = searchParams.get('pitch');
          let roll = searchParams.get('roll');
          //地图视图模式
          let view = searchParams.get('viewMode');
          if (view === 'map') {
            this.mapOptions.center = [Number(x), Number(y)];
            this.mapOptions.zoom = Number(z);
          } else if(view === 'earth') {
            //三维定位
            this.$refs.mapEarth.toggleViewMode(view);
            obj.earth.centerAt(
              {
                center: [Number(x), Number(x)],
                height: Number(z),
                heading: Number(heading),
                pitch: Number(pitch),
                roll: Number(roll)
              }
            );
          }
        } catch (e) {}
      }
    }
  };
</script>
```

:::

### Attributes

> 继承[基础面板](#/zh-CN/component/general-card)组件除 `theme` `destroyOnClose`外的其他 Attributes

| 参数名 | 属性类型 | 说明            | 类型   | 默认值 | 可选值 |
| ------ | -------- | --------------- | ------ | ------ | ------ |
| url    | 静态属性 | 分享地图地址    | String | -      | -      |
| params | 静态属性 | 自定义 url 参数 | Object | -      | -      |
