const layerInfo = [
  {
    parentName: '无',
    createTime: '2021-06-09 02:35:19',
    updateTime: '2022-07-13 16:04:26',
    id: 'c422cb5b645e41608d2af078959d6587',
    label: '资源目录',
    sort: 868,
    type: 'directory',
    tp: 'directory',
    proxyPath: '/gisqBI/api/gis/proxy?',
    directoryName: '资源目录'
  },
  {
    parent: 'c422cb5b645e41608d2af078959d6587',
    layerDesc: '图层介绍',
    showIndex: 3827,
    identifyField: [
      {
        search: '用地编号,用地名称,规划用地',
        isOpenStyle: true,
        lyr: 'http://server.mars2d.cn/arcgis/rest/services/mars/guihua/MapServer/0',
        display: '用地编号,用地名称,规划用地',
        name: '0',
        popup3d:
          '用地编号:{用地编号}<br/>用地名称:{用地名称}<br/>规划用地:{规划用地}',
        anotherName: '规划一张图',
        pickfeaturestyle: {
          outline: true,
          color: '#05D524',
          outlineWidth: 1,
          outlineColor: '#05D524',
          fill: true,
          opacity: 100,
          outlineOpacity: 100
        },
        formConfig: [
          {
            name: '用地审批',
            formUrl: 'https://www.baidu.com?id={用地编号}&name={用地名称}'
          }
        ],
        fieldLink: {
          用地编号: 'https://www.baidu.com?id={用地编号}'
        },
        fieldAliases: {
          FID: 'FID',
          Shape: 'Shape',
          OBJECTID: 'OBJECTID',
          用地编号: '用地编号',
          用地名称: '用地名称',
          Shape_Leng: 'Shape_Leng',
          Shape_Area: 'Shape_Area',
          规划用地: '规划用地'
        }
      }
    ],
    geotype: 'polygon',
    legendLayers: [],
    highParamInfo: [],
    type: 'dynamic',
    initChecked: true,
    id: 'cd8b28d7-1987-90ad-e9fb-f1828fca7601',
    group: '2',
    serverOrigin: 'arcgis',
    mapIndex: 3827,
    label: '规划图',
    sort: 3828,
    proxyPath: '/gisqBI/api/gis/proxy?',
    url: 'http://server.mars2d.cn/arcgis/rest/services/mars/guihua/MapServer',
    visibleLayers: ['0'],
    queryUrl:
      'http://server.mars2d.cn/arcgis/rest/services/mars/guihua/MapServer/0',
    parentName: '二维图层',
    layerTag: 'hfguihua',
    selectLayer: '0',
    isPop: true,
    opacity: 1,
    tp: ''
  },
  {
    parent: 'c422cb5b645e41608d2af078959d6587',
    layerDesc: '图层介绍',
    showIndex: 5400,
    identifyField: [
      {
        search:
          'OBJECTID,所在区县,规划比对,用地面积,建设形式,项目名称,备注,建设情况,单元,建设年限,具体位置,设施类型,举办者类型,设施规模,招生规模',
        isOpenStyle: false,
        lyr: 'http://server.mars3d.cn/geoserver/mars/wfs?mars:hfjy',
        display:
          'OBJECTID,所在区县,规划比对,用地面积,建设形式,项目名称,备注,建设情况,单元,建设年限,具体位置,设施类型,举办者类型,设施规模,招生规模',
        name: 'hfjy',
        popup3d:
          'OBJECTID:{OBJECTID}<br/>所在区县:{所在区县}<br/>规划比对:{规划比对}<br/>用地面积:{用地面积}<br/>建设形式:{建设形式}<br/>项目名称:{项目名称}<br/>备注:{备注}<br/>建设情况:{建设情况}<br/>单元:{单元}<br/>建设年限:{建设年限}<br/>具体位置:{具体位置}<br/>设施类型:{设施类型}<br/>举办者类型:{举办者类型}<br/>设施规模:{设施规模}<br/>招生规模:{招生规模}',
        anotherName: 'hfjy'
      }
    ],
    geotype: 'point',
    legendLayers: [],
    highParamInfo: [],
    type: 'geoserver-wms',
    isCheckedArr: [true],
    initChecked: false,
    id: '26abf885-0639-f96c-4bda-9182cdc73a4a',
    group: '2',
    serverOrigin: 'geoserver',
    mapIndex: 5414,
    geoStr: 'the_geom',
    label: '教育设施点',
    sort: 5414,
    url: 'http://server.mars3d.cn/geoserver/mars/wms',
    geoLayerIsGroup: true,
    visibleLayers: ['hfjy'],
    queryUrl: 'http://server.mars3d.cn/geoserver/mars/wms?mars:hfjy',
    parentName: 'GeoServer',
    layerTag: 'wmsjyssd',
    selectLayer: 'hfjy',
    name: '教育设施点',
    opacity: 1,
    tp: 'layer'
  }
];

export default {
  layerInfo
};
