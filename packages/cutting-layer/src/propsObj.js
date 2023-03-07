export const propsObj = {
  defaultActive: {
    type: Boolean,
    default() {
      return false;
    }
  },
  isShow: {
    type: Boolean,
    default() {
      return true;
    }
  },
  //裁剪参数
  cuttingOptions: {
    type: Object,
    default() {
      return {
        geoJson: '', //要裁剪区域的geoJson
        isMask: false,
        maskType: 'pruning',
        stopMoveListener: false,
        geoLayer: {
          layer: {},
          whereInfo: ''
        },
        targetLayers: [],
        maskConfig: {
          fillColor: '',
          strokeColor: '',
          strokeWidth: 0
        },
        locateConfig: {
          isFit: false,
          isLocate: false,
          center: '',
          resolution: ''
        }
      };
    }
  }
};
//测试代码
export const options = {
  geoJson: '', //要裁剪区域的geoJson
  isMask: true,
  stopMoveListener: false, //地图拖动状态下,停止裁剪(避免卡顿)
  // maskType: 'pruning'//扣除
  maskType: 'pruning', //fill填充,pruning扣除
  //被裁剪的图层ids(已加载的图层)
  targetLayers: [
    'f8d3717c-e84d-1f5c-b8af-b17c2f319b5f2D电子地图',
    '35f38315-c80e-cf6a-683b-917c82b67a712D电子地图'
  ],
  //非geojson数据时,提供可查询到裁剪区域的服务数据,并自定义查询CQL
  geoLayer: {
    layer: {
      //图层信息
      visibleLayers: ['fgy:kj000101a'], //geoserver: [post:xzqh], arcgis: [0]
      type: 'dynamic', //'geoserver-wfs'
      // url: 'http://223.4.76.89:8000/geoserver/fgy/wms',
      url: 'http://192.168.11.148:6080/arcgis/rest/services/%E8%A1%8C%E6%94%BF%E5%8C%BA%E5%AF%BC%E8%88%AA/MapServer',
      serverOrigin: 'arcgis'
    },
    whereInfo: "xzqdm='3301'" //非geoJson时,自定义服务以及查询CQL
  },
  //遮罩层样式配置
  maskConfig: {
    fillColor: 'rgba(0, 0, 0, 0.6)', //遮罩颜色
    strokeColor: 'rgba(255, 69, 0, 1)', //遮罩边界线颜色
    strokeWidth: 2 //边界线粗细
  },
  //是否固定地图裁剪的位置以及缩放级别
  locateConf: {
    isLocate: false,
    center: '', //固定位置中心点(非必须)
    resolution: '' //当前地图缩放级别(非必须)
  }
};
