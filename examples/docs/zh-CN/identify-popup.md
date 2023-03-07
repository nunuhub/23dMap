## IdentifyPopup 查询弹窗

地图 i 查询功能

### 基础用法

基础的查询弹窗用法。

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
      <sh-layer-manager />
      <sh-scheme-layer
        :isShow="false"
        defaultScheme="<%identify_popup_scheme1%>"
      />
      <sh-identify-popup defaultActive />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### 切换查询方式

除了默认的点查询外，还可以通过控制面板选择使用线、面和缓冲区方式查询。

**切换查询方式功能只支持在 2D 视图下展示**

:::demo 通过设置 `showPanel` 属性展示查询面板，设置 `panelConfig` 属性可控制查询面板展示项

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
      <sh-layer-manager />
      <sh-scheme-layer
        :isShow="false"
        defaultScheme="<%identify_popup_scheme1%>"
      />
      <sh-identify-popup defaultActive showPanel />
      <sh-select-tool :style="{ top: '55px'}" />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### 查询面板样式

支持斑马纹和边框样式配置

:::demo 通过设置 `stripe` `border` 属性来控制查询结果面板表格展示斑马纹或边框。

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
      <sh-layer-manager />
      <sh-scheme-layer
        :isShow="false"
        defaultScheme="<%identify_popup_scheme1%>"
      />
      <sh-identify-popup defaultActive :stripe="false" border />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### 查询面板外链

可通过运维端配置字段外链或者超链接按钮

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
      <sh-layer-manager />
      <sh-scheme-layer
        :isShow="false"
        defaultScheme="<%identify_popup_scheme2%>"
      />
      <sh-identify-popup defaultActive :stripe="false" border />
    </sh-map-earth>
  </sh-config-provider>
</div>
```

:::

### 自定义查询面板

通过插槽来展示自己的查询面板

:::demo 通过 `mapPopup` `earthPopup` 插槽来替换二三维下的默认查询面板为自定义面板。

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
      <sh-layer-manager />
      <sh-scheme-layer
        :isShow="false"
        defaultScheme="<%identify_popup_scheme1%>"
      />
      <sh-identify-popup
        ref="identify"
        defaultActive
        @identifyedAll="identifyedAll"
        @identifyedAll3d="identifyedAll"
      >
        <template v-slot:mapPopup>
          <div class="mapPopup">
            <el-button
              class="close"
              type="danger"
              icon="el-icon-close"
              size="mini"
              circle
              @click="close"
            />
            <p>
              图层名称: {{ identifyResult ? identifyResult.layerLabel : ''}}
            </p>
            <span
              >地块名称: {{ identifyResult ?
              identifyResult.results[0].attributes['用地名称'] : ''}}</span
            >
          </div>
        </template>
        <template v-slot:earthPopup>
          <div class="mapPopup">
            <el-button
              class="close"
              type="danger"
              icon="el-icon-close"
              size="mini"
              circle
              @click="close"
            />
            <p>
              图层名称: {{ identifyResult ? identifyResult.layerLabel : ''}}
            </p>
            <span
              >地块名称: {{ identifyResult ?
              identifyResult.results[0].attributes['用地名称'] : ''}}</span
            >
          </div>
        </template>
      </sh-identify-popup>
    </sh-map-earth>
  </sh-config-provider>
</div>

<script>
  export default {
    data() {
      return {
        identifyResult: null
      };
    },
    watch: {
      identifyResult(value) {
        this.$refs.identify.highLightFeature(value.results[0]);
      }
    },
    methods: {
      identifyedAll(e) {
        console.log(e);
        this.identifyResult = e.result[0];
      },
      close() {
        this.$refs.identify.closePopup();
      }
    }
  };
</script>
```

:::

### Attributes

| 参数                | 属性类型 | 类型    | 可选值                       | 默认值                                                   | 说明                                                                                                                                                  |
| ------------------- | -------- | ------- | ---------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| isShow              | 动态属性 | boolean | -                            | true                                                     | 默认按钮是否展示                                                                                                                                      |
| defaultActive       | 静态属性 | boolean | -                            | false                                                    | 功能是否默认打开                                                                                                                                      |
| isStayActive        | 静态属性 | boolean | -                            | false                                                    | 是否一直保持 active 状态(active 状态会被其他交互事件关闭)                                                                                             |
| queryMode           | 静态属性 | string  | click / polygon / line / box | click                                                    | 查询模式（只在二维地图生效）: 点击查询/多边形查询/线查询/框选查询                                                                                     |
| showPanel           | 静态属性 | boolean | -                            | false                                                    | 是否展示查询面板                                                                                                                                      |
| panelConfig         | 静态属性 | boolean | -                            | ['type', 'buffer']                                       | 查询面板配置 type 表示查询方式切换面板；buffer 表示缓冲区查询面板                                                                                     |
| defaultBufferRadius | 静态属性 | number  | -                            | 100                                                      | 默认缓冲半径                                                                                                                                          |
| bindModeButton      | 静态属性 | boolean | -                            | true                                                     | 是否展示模式切换按钮                                                                                                                                  |
| defaultBindFeature  | 静态属性 | boolean | -                            | true                                                     | 是否展示面板默认绑定查询结果位置；为 true 时，查询结果面板将绑定查询结果位置，跟随地图移动；为 false 时，查询结果面板将作为独立悬浮窗，不跟随地图移动 |
| stripe              | 静态属性 | boolean | -                            | true                                                     | 面板属性框是否展示斑马纹                                                                                                                              |
| stripeColor         | 静态属性 | object  | -                            | {map: ['#FFF', '#fafafa'],earth: ['#696969', '#555e67']} | 斑马纹颜色配置                                                                                                                                        |
| border              | 静态属性 | boolean | -                            | false                                                    | 面板属性框是否展示边框                                                                                                                                |
| disabledPopup       | 静态属性 | boolean | -                            | false                                                    | 强制不弹窗，开启后即使运维端图层配置了可弹窗也不再弹窗                                                                                                |

### Slot

| 参数       | 说明                       |
| ---------- | -------------------------- |
| default    | 自定义功能按钮             |
| mapPopup   | 二维视图下的自定义弹窗界面 |
| earthPopup | 三维视图下的自定义弹窗界面 |

### Events

| 事件名称        | 说明                                               | 回调参数                                                                                |
| --------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------- |
| change:active   | 查询功能打开或关闭时触发                           | (active, identifyType) active:开启状态; identifyType: 查询类型（active 为 true 时有值） |
| identifyed      | 二维视图下 I 查询某个图层查询任务完毕时触发        | ({result,coordinate,queryId}) result:查询结果; coordinate:查询坐标;queryId: 查询 id     |
| identifyedAll   | 二维视图下 I 查询全部图层查询完毕时触发            | ({result,coordinate,queryId}) result:查询结果; coordinate:查询坐标;queryId: 查询 id     |
| identifyed3d    | 三维视图下 I 查询某个图层查询任务完毕时触发        | ({result,coordinate,queryId}) result:查询结果; coordinate:查询坐标;queryId: 查询 id     |
| identifyedAll3d | 三维视图下 I 查询全部图层查询完毕时触发            | ({result,coordinate,queryId}) result:查询结果; coordinate:查询坐标;queryId: 查询 id     |
| change:feature  | 当在查询面板中切换展示查询结果(例如翻页操作)时触发 | result                                                                                  |

### Methods

| 参数             | 说明                  | 参数                                                            |
| ---------------- | --------------------- | --------------------------------------------------------------- |
| toggle           | 开启或关闭 I 查询功能 | (isOpen)布尔类型,表示想要打开或者关闭,可以不传,不传则为改变状态 |
| activate         | 开启 I 查询功能       | -                                                               |
| deactivate       | 关闭 I 查询功能       | -                                                               |
| highLightFeature | 高亮查询结果对象      | (result) 查询结果                                               |
| closePopup       | 关闭查询弹窗          | -                                                               |
