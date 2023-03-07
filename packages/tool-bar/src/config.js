/**
 * 工具条中的组件类型
 * card/bar: 面板类，工具条控制面板展示隐藏（选中表示打开面板，未选表示关闭面板） 组件本身需提供changeShow方法
 * interaction: 交互类，工具条控制功能打开关闭（选中表示打开功能，未选表示关闭功能） 组件本身需提供activate和deactivate方法
 * action: 动作类，工具条点击时执行动作（没有选中态） 组件本身需提供execute方法
 */
export const componentTypes = {
  'sh-layer-manager': {
    type: 'card',
    name: '图层目录',
    img: 'layer-manager'
  },
  'sh-scheme-layer': {
    type: 'card',
    name: '方案图层',
    img: 'layer-manager'
  },
  'sh-map-share': {
    type: 'card',
    name: '地图分享',
    img: 'map-share'
  },
  'sh-legend': {
    type: 'card',
    name: '图例',
    img: 'legend'
  },
  'sh-draw-tool': {
    type: 'bar',
    view: 'map',
    name: '绘制',
    img: 'draw-tool'
  },
  'sh-map-measure': {
    type: 'card',
    view: 'map',
    name: '地图测量',
    img: 'map-measure'
  },
  'sh-file-export': {
    type: 'card',
    view: 'map',
    name: '文件导出',
    img: 'file-export'
  },
  'sh-navigate': {
    type: 'card',
    name: '行政区导航',
    img: 'navigate'
  },
  'sh-roller-blind': {
    type: 'card',
    name: '卷帘',
    img: 'roller-blind'
  },
  'sh-draw-tool3d': {
    type: 'bar',
    view: 'earth',
    name: '绘制',
    img: 'draw-tool'
  },
  'sh-book-mark3d': {
    type: 'card',
    view: 'earth',
    name: '场景视廊',
    img: 'book-mark3d'
  },
  'sh-roam3d': {
    type: 'card',
    view: 'earth',
    name: '飞行漫游',
    img: 'roam3d'
  },
  'sh-spatial-analysis3d': {
    type: 'bar',
    view: 'earth',
    name: '空间分析',
    img: 'clip-analysis'
  },
  'sh-map-measure3d': {
    type: 'bar',
    view: 'earth',
    name: '测量',
    img: 'map-measure'
  },
  'sh-clip-tools': {
    type: 'card',
    view: 'earth',
    name: '模型裁切',
    img: 'clip-tools'
  },
  'sh-flatten-tools': {
    type: 'card',
    view: 'earth',
    name: '开挖压平',
    img: 'flatten-tools'
  },
  'sh-base-control3d': {
    type: 'card',
    view: 'earth',
    name: '基础配置',
    img: 'base-control-3d'
  },
  'sh-place-search': {
    type: 'card',
    view: 'map',
    name: '一键搜索',
    img: 'place-search'
  },
  'sh-map-label': {
    type: 'card',
    view: 'map',
    name: '标记',
    img: 'map-label'
  },
  'sh-identify-popup': {
    type: 'interaction',
    name: '查询',
    img: 'identify-popup'
  },
  'sh-select-tool': {
    type: 'interaction',
    view: 'map',
    name: '选择',
    img: 'select-tool'
  },
  'sh-cutting-layer': {
    type: 'interaction',
    view: 'map',
    name: '图层裁剪',
    img: 'cutting'
  },
  'sh-scene-split3d': {
    type: 'interaction',
    view: 'earth',
    name: '分屏',
    img: 'scene-split3d'
  },
  'sh-union-tool': {
    type: 'interaction',
    view: 'map',
    name: '合并',
    img: 'union'
  },
  'sh-split-tool': {
    type: 'interaction',
    view: 'map',
    name: '分割',
    img: 'split'
  },
  'sh-save-tool': {
    type: 'action',
    view: 'map',
    name: '保存',
    img: 'save'
  },
  'sh-file-import': {
    type: 'action',
    view: 'map',
    name: '文件导入',
    img: 'file-import'
  },
  'sh-export-map': {
    type: 'action',
    view: 'map',
    name: '制图',
    img: 'export-map'
  },
  'sh-delete-tool': {
    type: 'action',
    view: 'map',
    name: '删除',
    img: 'delete'
  },
  'sh-copy-tool': {
    type: 'action',
    view: 'map',
    name: '复制',
    img: 'copy'
  },
  'sh-paste-tool': {
    type: 'action',
    view: 'map',
    name: '粘贴',
    img: 'paste'
  }
};
