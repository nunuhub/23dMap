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
    showIndex: 3828,
    identifyField: [
      {
        search: 'LEVEL,FID',
        isOpenStyle: true,
        lyr: 'http://server.mars2d.cn/arcgis/rest/services/mars/hfroad/MapServer/0',
        display: 'LEVEL,FID',
        name: '0',
        popup3d: 'LEVEL:{LEVEL}<br/>FID:{FID}',
        anotherName: '合肥_全域道路',
        pickfeaturestyle: {
          outline: true,
          color: '#05D524',
          outlineWidth: 1,
          outlineColor: '#05D524',
          fill: true,
          opacity: 100,
          outlineOpacity: 100
        },
        config: [
          {
            enumData: [],
            search: 'LEVEL',
            value2: false,
            value1: true,
            display: 'LEVEL',
            num: false
          },
          {
            enumData: [],
            search: 'FID',
            value2: false,
            value1: true,
            display: 'FID',
            num: false
          }
        ]
      }
    ],
    geotype: 'polyline',
    highParamInfo: [],
    type: 'dynamic',
    initChecked: true,
    id: '0c1bd832-942c-307a-d688-21828fcef2a1',
    group: '2',
    serverOrigin: 'arcgis',
    mapIndex: 3828,
    label: '路线图',
    sort: 3829,
    proxyPath: '/gisqBI/api/gis/proxy?',
    url: 'http://server.mars2d.cn/arcgis/rest/services/mars/hfroad/MapServer',
    visibleLayers: ['0'],
    queryUrl:
      'http://server.mars2d.cn/arcgis/rest/services/mars/hfroad/MapServer/0',
    parentName: '二维图层',
    layerTag: 'hfroad',
    selectLayer: '0',
    isPop: true,
    opacity: 1,
    tp: ''
  }
];

const layerInfo2 = [
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
  }
];

export default {
  layerInfo,
  layerInfo2
};
