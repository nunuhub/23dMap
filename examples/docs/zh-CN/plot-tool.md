## PlotTool 标绘组件

提供标绘能力

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
    <sh-map-earth>
      <sh-layer-switcher />
      <sh-plot-tool
        ref="plottool"
        style="position:absolute;top:0px;right:0px"
      />
      <el-cascader
        style="position:absolute;top:20px;left:20px"
        v-model="value"
        :options="options"
        @change="handleChange"
      >
      </el-cascader>
    </sh-map-earth>
  </sh-config-provider>
</div>
<script>
  export default {
    data() {
      return {
        type: 'Arc',
        value: ['Arc'],
        options: [
          {
            value: 'Arc',
            label: '弓形',
            children: [
              {
                value: 'Arc',
                label: '弓形'
              }
            ]
          },
          {
            value: 'Arrow',
            label: '箭头',
            children: [
              {
                value: 'AttackArrow',
                label: 'AttackArrow 进攻箭头'
              },
              {
                value: 'DoubleArrow',
                label: 'DoubleArrow 双箭头'
              },
              {
                value: 'DottedArrow',
                label: 'DottedArrow 虚线箭头'
              },
              {
                value: 'StraightArrow',
                label: 'StraightArrow 细直箭头'
              },
              {
                value: 'FineArrow',
                label: 'FineArrow 粗单尖头箭头'
              },
              {
                value: 'AssaultDirection',
                label: 'AssaultDirection 粗单直箭头'
              },
              {
                value: 'TailedAttackArrow',
                label: 'TailedAttackArrow 进攻方向（尾）'
              },
              {
                value: 'SquadCombat',
                label: 'SquadCombat 分队战斗行动'
              },
              {
                value: 'TailedSquadCombat',
                label: 'TailedSquadCombat 分队战斗行动（尾）'
              }
            ]
          },
          {
            value: 'Circle',
            label: '圆形',
            children: [
              {
                value: 'Circle',
                label: '圆形'
              },
              {
                value: 'Ellipse',
                label: '椭圆'
              }
            ]
          },
          {
            value: 'Flag',
            label: '旗标',
            children: [
              {
                value: 'RectFlag',
                label: 'RectFlag 直角旗标'
              },
              {
                value: 'TriangleFlag',
                label: 'TriangleFlag 三角旗标'
              },
              {
                value: 'CurveFlag',
                label: 'CurveFlag 曲线旗标'
              }
            ]
          },
          {
            value: 'Point',
            label: '点',
            children: [
              {
                value: 'Point',
                label: 'Point 点'
              },
              {
                value: 'Pennant',
                label: 'Pennant 三角旗标'
              }
            ]
          },
          {
            value: 'Polygon',
            label: '面',
            children: [
              {
                value: 'RectAngle',
                label: 'RectAngle 规则矩形'
              },
              {
                value: 'Lune',
                label: 'Lune 弓形'
              },
              {
                value: 'Sector',
                label: 'Sector 扇形'
              },
              {
                value: 'ClosedCurve',
                label: 'ClosedCurve 闭合曲面'
              },
              {
                value: 'Polygon',
                label: 'Polygon 多边形'
              },
              {
                value: 'FreePolygon',
                label: 'FreePolygon 自由面'
              },
              {
                value: 'GatheringPlace',
                label: 'GatheringPlace 集结地'
              }
            ]
          },
          {
            value: 'Polyline',
            label: '线',
            children: [
              {
                value: 'Curve',
                label: 'Curve 曲线'
              },
              {
                value: 'DashCurve',
                label: 'DashCurve 虚曲线'
              },
              {
                value: 'MultipleCurve',
                label: 'MultipleCurve 复合曲线'
              },
              {
                value: 'Polyline',
                label: 'Polyline 直线'
              },
              {
                value: 'Dashline',
                label: 'Dashline 虚线'
              },
              {
                value: 'RailLoadLine',
                label: 'RailLoadLine 铁路线'
              },
              {
                value: 'RailLoadCurve',
                label: 'RailLoadCurve 铁路曲线'
              },
              {
                value: 'FreeHandLine',
                label: 'FreeHandLine 自由线'
              }
            ]
          },
          {
            value: 'Text',
            label: '文本',
            children: [
              {
                value: 'TextArea',
                label: 'TextArea 注记'
              }
            ]
          }
        ]
      };
    },
    methods: {
      handleChange(value) {
        this.type = value[value.length - 1];
        this.$refs.plottool.activate(this.type);
      }
    }
  };
</script>
```

:::
