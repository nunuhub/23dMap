## MigrateLayer 迁徙图

基于给定的数据在地图上展示迁徙图

## 基本用法

:::demo

```html
<template>
  <div style="height:100%;width:100%">
    <sh-config-provider
      type="<%your_admin_type%>"
      url="<%your_admin_url%>"
      schemeId="<%your_admin_scheme_id%>"
      token="<%your_admin_token%>"
    >
      <sh-map>
        <sh-layer-switcher />
        <sh-migrate-layer />
      </sh-map>
    </sh-config-provider>
  </div>
</template>
```

:::

### Attributes

| 参数       | 说明     | 类型   | 可选值 | 默认值 |
| ---------- | -------- | ------ | ------ | ------ |
| widgetInfo | 配置信息 | Object | -      | -      |

### widgetInfo 示例

```javascript
{
    zIndex:99,//图层压盖顺序,默认99
    animation:true,//是否显示动画
    speed:6,//动画速度(animation为true时生效)
    //动画图标(svg矢量路径)(animation为true时生效)
    iconPath:"path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z",
    iconSize:15,//动画图标大小
    hideOnMoving: true,//地图拖动时,隐藏效果图
    hideOnZooming: true,//地图缩放时,隐藏效果图
    trail:true,//是否显示图标动画拖尾(animation为true时生效)
    trailColor:"",//拖尾颜色(animation为true时生效)
    trailLength:0.5,//拖尾长度,0~1之间(animation为true时生效)
    opacity:0.5,//飞线透明度
    isShowName:false,//显示标注名称
    maxR:20,//最大半径(选配,默认是20)
    minR:5,//最小半径(选配,默认是5)
    maxL:5,//最大线宽(选配,默认是5)
    minL:1,//最小线宽(选配,默认是1)
    tooltip:(data)=>{//鼠标提示tip回调(选配)
        let tip = data.marker+data.name
        let arr =data.value
        tip+="<br/>X:"+arr[0]+"<br/>Y:"+arr[1]
        return tip
    },
    //飞线图数据
    data:[{
        start:{//起始点
            value:[120.20570684390306, 30.24843568235209,25],
            name:"杭州",//起始点名称(标注)
        },
        end:[{
            value:[121.62020713827685, 29.8627464527333,7],
            name:"宁波"//结束点名称(标注)
        },{
            value:[120.69528448237773, 27.99740206292214,4],
            name:"温州"
        },{
            value:[120.75119295661207, 30.74845333005124,10],
            name:"嘉兴"
        },{
            value:[120.08161315943065, 30.89612035995604,6],
            name:"湖州"
        },{
            value:[120.57941610867438, 30.053351543686688,9],
            name:"绍兴"
        }],
        value:12,//线性权重(线的粗细),
        color:""//线的颜色
    },{
        start:{//起始点
            value:[119.64271144837487, 29.082082642200245,22],
            name:"金华",//起始点名称
        },
        end:[{
            value:[121.62020713827685, 29.8627464527333,7],
            name:"宁波"
        },{
            value:[118.8545533800524, 28.97346828329961,4],
            name:"衢州"
        },{
            value:[122.20318602847783, 29.988185803936762,6],
            name:"舟山"
        },{
            value:[120.57941610867438, 30.053351543686688,5],
            name:"绍兴"
        }],
        value:15,//线性权重(线的粗细),
        color:""//线的颜色
    },{
        start:{//起始点
            value:[121.41632236508624, 28.659246754765803,30],
            name:"台州",//起始点名称
        },
        end:[{
            value:[120.20570684390306, 30.24843568235209,4],
            name:"杭州"
        },{
            value:[118.8545533800524, 28.97346828329961,3],
            name:"衢州"
        },{
            value:[122.20318602847783, 29.988185803936762,6],
            name:"舟山"
        }],
        value:13,//线性权重(线的粗细),
        color:""//线的颜色
    }]
}
```

### 参数解析

**animation**:是否显示动画  
**speed**:动画速度(`animation`为 true 时生效)  
**iconPath**:动画图标(svg 矢量路径)(`animation`为 true 时生效)  
**iconSize**:动画图标大小  
**hideOnMoving**:地图拖动时,隐藏效果图  
**hideOnZooming**:地图缩放时,隐藏效果图  
**trail**:是否显示图标动画拖尾(`animation`为 true 时生效)  
**trailColor**:拖尾颜色(`animation`为 true 时生效)  
**trailLength**:拖尾长度,0~1 之间(`animation`为 true 时生效)  
**opacity**:飞线透明度  
**isShowName**:显示标注名称  
**maxR**:最大半径(选配,默认是 20)  
**minR**:最小半径(选配,默认是 5)  
**maxL**:最大线宽(选配,默认是 5)  
**minL**:最小线宽(选配,默认是 1)  
**tooltip**://鼠标提示 tip 回调(选配)  
**data**:展示的数据集，如下
