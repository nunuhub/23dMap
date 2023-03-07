/* eslint-disable no-prototype-builtins */
/*
 * @Author: liujh
 * @Date: 2020/8/21 17:04
 * @Description:
 */
/* 61 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import Jquery from 'jquery';
import * as Util from './Tool/Util1';
import { ViewerEx } from './ViewerEx';
// import { GaodePOIGeocoder } from './Tool/GaodePOIGeocoder97';
import { Layer } from './Layer26';

function createMap(opt) {
  if (opt.url) {
    Jquery.ajax({
      type: 'get',
      dataType: 'json',
      url: opt.url,
      timeout: 0, //永不超时
      success: function success(config) {
        //let a = JSON.parse(JSON.stringify(config))

        if (config.serverURL) opt.serverURL = config.serverURL;
        //map初始化
        if (opt.configStyle) {
          opt.configStyle(config);
        }
        let viewer = initMap(config.map3d, opt);
        if (opt.success) opt.success(viewer, config, config); //第2个config为了兼容1.7以前版本
      },
      error: function error(/* XMLHttpRequest, textStatus, errorThrown */) {
        console.error(opt.url + '文件加载失败！');
        Util.alert(opt.url + '文件加载失败！');
      }
    });
    return null;
  } else {
    let viewer = initMap(opt.data, opt);
    if (opt.success) opt.success(viewer, opt.data);
    return viewer;
  }
}

function initMap(config, optsWB) {
  let id = optsWB.id;
  window.localAndProjectPath = Util.getRootPath();
  //数据优先级：optsWB > config > opts
  let clock = new Cesium.Clock();
  //如果options未设置时的默认参数
  let opts = {
    animation: false, //是否创建动画小器件，左下角仪表
    timeline: false, //是否显示时间线控件
    fullscreenButton: true, //右下角全屏按钮
    vrButton: false, //右下角vr虚拟现实按钮

    geocoder: false, //是否显示地名查找控件
    sceneModePicker: false, //是否显示投影方式控件
    homeButton: true, //回到默认视域按钮
    navigationHelpButton: true, //是否显示帮助信息控件
    navigationInstructionsInitiallyVisible: false, //在用户明确单击按钮之前是否自动显示

    infoBox: true, //是否显示点击要素之后显示的信息
    selectionIndicator: false, //选择模型是是否显示绿色框,
    shouldAnimate: true,
    showRenderLoopErrors: true, //是否显示错误弹窗信息

    baseLayerPicker: false, //地图底图
    contextmenu: true, //右键菜单
    //orderIndependentTranslucency: false
    clockViewModel: new Cesium.ClockViewModel(clock)
  };

  //config中可以配置map所有options
  for (let key in config) {
    if (config.hasOwnProperty(key)) {
      opts[key] = config[key];
    }
  }
  //wboptions中可以配置map所有options覆盖
  if (opts) {
    for (let key in optsWB) {
      if (optsWB.hasOwnProperty(key)) {
        if (key === 'id' || key === 'success') continue;
        opts[key] = optsWB[key];
      }
    }
  }

  //一些默认值的修改【by 木遥】
  if (Cesium.Ion && (opts.ionToken || opts.defaultKey))
    Cesium.Ion.defaultAccessToken =
      opts.ionToken || opts.defaultKey.CesiumionToken;
  Cesium.AnimationViewModel.defaultTicks = opts.animationTicks || [
    0.1, 0.25, 0.5, 1.0, 2.0, 5.0, 10.0, 15.0, 30.0, 60.0, 120.0, 300.0, 600.0,
    900.0, 1800.0, 3600.0
  ];

  //自定义搜索栏Geocoder
  /*        if (opts.geocoder === true) {
                opts.geocoder = new GaodePOIGeocoder.GaodePOIGeocoder(opts.defaultKey.geocoderConfig)
            }*/

  //地形
  let terrainProvider;
  if (opts.terrain && opts.terrain.visible) {
    terrainProvider = Util.getTerrainProvider(opts.terrain, opts.serverURL);
  } else {
    terrainProvider = Util.getEllipsoidTerrain();
  }
  opts.terrainProvider = terrainProvider;

  //地图底图图层预处理
  let hasremoveimagery = false;
  if (opts.baseLayerPicker) {
    //有baseLayerPicker插件时
    if (
      !opts.imageryProviderViewModels &&
      opts.basemaps &&
      opts.basemaps.length > 0
    ) {
      let imgOBJ = getImageryProviderArr(opts.basemaps);
      opts.imageryProviderViewModels = imgOBJ.imageryProviderViewModels;
      opts.selectedImageryProviderViewModel =
        imgOBJ.imageryProviderViewModels[imgOBJ.index];
    }

    if (!opts.terrainProviderViewModels) {
      opts.terrainProviderViewModels = getTerrainProviderViewModelsArr(
        opts.terrain,
        opts.serverURL
      );
      opts.selectedTerrainProviderViewModel = opts.terrainProviderViewModels[0];
      if (terrainProvider instanceof Cesium.EllipsoidTerrainProvider) {
        terrainProvider =
          opts.selectedTerrainProviderViewModel.creationCommand();
        opts.terrainProvider = terrainProvider;
      }
    }
  } else {
    //无baseLayerPicker插件时
    if (opts.imageryProvider == null) {
      //未配底图时
      hasremoveimagery = true;
      opts.imageryProvider = new Cesium.TileMapServiceImageryProvider({
        url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
      });
    }
  }

  //地球初始化
  let viewer = new Cesium.Viewer(id, opts);

  //地图底图图层
  if (hasremoveimagery) {
    let imageryLayerCollection = viewer.imageryLayers;
    let length = imageryLayerCollection.length;
    for (let i = 0; i < length; i++) {
      let layer = imageryLayerCollection.get(0);
      imageryLayerCollection.remove(layer, true);
    }
  }
  /*        if (opts.geocoder) {
                opts.geocoder.viewer = viewer
            }*/

  delete opts.geocoder;
  delete opts.imageryProviderViewModels;
  delete opts.selectedImageryProviderViewModel;
  delete opts.terrainProviderViewModels;
  delete opts.selectedTerrainProviderViewModel;
  delete opts.terrainProvider;
  delete opts.imageryProvider;

  viewer.shine = new ViewerEx(viewer, opts); //火星扩展的viewer支持

  viewer.shine.terrainProvider = terrainProvider;
  viewer.gisdata = {
    config: viewer.shine.config //兼容1.7以前的历史版本属性
  };
  return viewer;
}

//获取配置的地形
function getTerrainProvider(cfg, serverURL) {
  if (cfg && cfg.url) {
    if (serverURL) {
      cfg.url = cfg.url.replace('$serverURL$', serverURL);
    }
    cfg.url = cfg.url
      .replace('$hostname$', location.hostname)
      .replace('$host$', location.host);
  }

  return Util.getTerrainProvider(cfg);
}

//获取自定义底图切换
function getImageryProviderArr(layersCfg) {
  let providerViewModels = [];
  let selectedIndex = 0;

  window._temp_createImageryProvider = Layer.createImageryProvider;

  for (let i = 0; i < layersCfg.length; i++) {
    let item = layersCfg[i];
    if (item.type === 'group' && item.layers == null) continue;

    if (item.visible) selectedIndex = providerViewModels.length;

    let funstr =
      'window._temp_basemaps' +
      i +
      ' = function () {\
                        let item = ' +
      JSON.stringify(item) +
      '\
                        if (item.type == "group") {\
                            let arrVec = []\
                            for (let index = 0; index < item.layers.length; index++) {\
                                let temp = window._temp_createImageryProvider(item.layers[index])\
                                if (temp == null) continue\
                                arrVec.push(temp)\
                            }\
                            return arrVec\
                        }\
                        else {\
                            return window._temp_createImageryProvider(item)\
                        } \
                    }';
    eval(funstr);

    let imgModel = new Cesium.ProviderViewModel({
      name: item.name || '未命名',
      tooltip: item.name || '未命名',
      iconUrl: item.icon || '',
      creationFunction: eval('window._temp_basemaps' + i)
    });
    providerViewModels.push(imgModel);
  }

  return {
    imageryProviderViewModels: providerViewModels,
    index: selectedIndex
  };
}

function getTerrainProviderViewModelsArr(cfg, serverURL) {
  return [
    new Cesium.ProviderViewModel({
      name: '中国地形(20版内网)',
      iconUrl: Cesium.buildModuleUrl(
        'Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'
      ),
      tooltip: '由总部内网提供的全国30米地形服务，可在总部内网或VPN模式下访问',
      category: '',
      creationFunction: function creationFunction() {
        return getTerrainProvider(
          { url: 'http://192.168.20.117:8087/static/DEM/china_TIF' },
          serverURL
        );
      }
    }),
    new Cesium.ProviderViewModel({
      name: '中国地形(20版外网)',
      iconUrl: Cesium.buildModuleUrl(
        'Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'
      ),
      tooltip: '由总部提供的全国30米地形服务，存在一定的不稳定性',
      category: '',
      creationFunction: function creationFunction() {
        return getTerrainProvider(
          { url: 'http://ework.gisquest.com:20129/internetdata/china2020dem' },
          serverURL
        );
      }
    }),
    new Cesium.ProviderViewModel({
      name: '全球地形',
      iconUrl: Cesium.buildModuleUrl(
        'Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'
      ),
      tooltip: 'Cesium官方 提供的高分辨率全球地形',
      category: '',
      creationFunction: function creationFunction() {
        return Util.getTerrainProvider({
          type: 'ion'
        });
      }
    }),
    new Cesium.ProviderViewModel({
      name: 'ESRI地形',
      iconUrl: Cesium.buildModuleUrl(
        'Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'
      ),
      tooltip: '由ESRI在线提供的ArcGISTiledElevationTerrainProvider',
      category: '',
      creationFunction: function creationFunction() {
        return Util.getTerrainProvider({
          type: 'arcgis',
          url: 'https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer'
        });
      }
    }),
    new Cesium.ProviderViewModel({
      name: '无地形',
      iconUrl: Cesium.buildModuleUrl(
        'Widgets/Images/TerrainProviders/Ellipsoid.png'
      ),
      tooltip: 'WGS84标准椭球，即 EPSG:4326',
      category: '',
      creationFunction: function creationFunction() {
        return Util.getEllipsoidTerrain();
      }
    })
  ];
}

export { createMap, initMap };
