export const earthDefaultConfig = {
  id: 'cesiumContainer555',
  baseLayerPicker: false, // 地图底图
  navigationHelpButton: false,
  sceneModePicker: false,
  homeButton: false,
  fullscreenButton: false,
  infoBox: false,
  geocoder: false,
  navigation: {},
  controls: [
    {
      crs: '',
      type: 'location'
    },
    {
      type: 'mousezoom'
    },
    {
      style: {
        top: 'auto',
        bottom: '240px',
        right: '2px'
      },
      type: 'navigation'
    }
  ],
  showRenderLoopErrors: true,
  center: {
    heading: 360,
    roll: 360,
    x: 120.173619,
    y: 30.247628,
    z: 4011333.9,
    pitch: -90
  },
  basemaps: [],
  defaultKey: {
    www_bing:
      'AtkX3zhnRe5fyGuLU30uZw8r3sxdBDnpQly7KfFTCB2rGlDgXBG3yr-qEiQEicEc',
    CesiumionToken:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJmNDEzNmM2ZC02YTVmLTQ5YWEtODI4My1kN2ZkMTZjYWY4MmMiLCJpZCI6MTY4ODIsInNjb3BlcyI6WyJhc3IiLCJnYyJdLCJpYXQiOjE1NzEyOTE5NDd9.z0SU6f7Ou6381zw8UzAvFGIz6n7X0HNgCpse_kfBJXg',
    www_tdt: 'e8355c4f15927bf3bf73b4801e30611a',
    geocoderConfig: {
      key: [
        'f2fedb9b08ae13d22f1692cd472d345e',
        '81825d9f2bafbb14f235d2779be90c0f',
        'b185732970a4487de104fa71ef575f29',
        '2e6ca4aeb6867fb637a5bee8333e5d3a',
        '027187040fa924e56048468aaa77b62c'
      ]
    }
  },
  maxzoom: 50000000,
  minzoom: 1,
  vrButton: false,
  operationallayers: [],
  style: {
    debugShowFramesPerSecond: false,
    resolutionScale: true, //屏幕缩放自适应
    atmosphere: true,
    testTerrain: true,
    lighting: false,
    fog: true
  }
};
