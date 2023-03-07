import { Evented } from './Tool/Event62';
import { Layer } from './Layer26';

const LayerManagerEventType = {
  /**
   * 调用addLayer函数，在加载图层之前触发
   */
  BEFOREADD3DLAYER: 'beforeAdd3dLayer',
  /**
   * 调用addLayer函数，在加载图层之后触发
   */
  AFTERADD3DLAYER: 'afterAdd3dLayer',
  /**
   * 调用removeLayer函数，在加载图层之前触发
   */
  BEFOREREMOVE3DLAYER: 'beforeRemove3dLayer',
  /**
   * 调用removeLayer函数，在加载图层之后触发
   */
  AFTERREMOVE3DLAYER: 'afterRemove3dLayer',
  /**
   * 调用addLayerError函数，在加载图层失败之后触发
   */
  ADD3DLAYERERROR: 'add3dLayerError'
};

/**
 * 图层控制类
 */
const LayerManager = Evented.extend({
  initialize: function initialize(options) {
    this.viewer = options.viewer;
    this.config = options.config;
    this._isFlyAnimation = false;
    //this.crs = Cesium.defaultValue(this.config.crs, '3857'); //坐标系
    //存放业务图层
    this.arrOperationallayers = [];
    //存放底图图层
    this.arrBasemaps = [];
    //初始化用
    this.arrInitLayers = [];
    //---------------------------------------------------------------------------------------------
    // Bi中为了和toc2d部分功能保持一致，后续分离
    //this.map = map
    //this.mapid = map.mapid
    // 矢量切片中取feature的一个唯一属性作为标识符
    this.idProp = undefined;
    // 可视化图层
    this.visualizationLayer = undefined;
    // 切片图层(只能存在一个坐标系下的切片图层)
    this.tildLayer = [];
    // 选中图层，layerController.vue使用
    this.checkedLayers = [];
    //所有图层配置数据
    this.tocData = [];
    //底图图层
    //this.baseLayers = []
    //当前编辑层
    this.editLayer = undefined;
  },
  //处理图层
  /*_initLayers() {
    let orderlayers = []; //计算order

    //没baseLayerPicker插件时才按内部规则处理。
    let arrBasemaps = [];
    if (!this.config.baseLayerPicker) {
      let layersCfg = this.config.basemaps;
      if (layersCfg && layersCfg.length > 0) {
        for (let i = 0; i < layersCfg.length; i++) {
          let item = layersCfg[i];
          if (item.visible && item.crs) this.crs = item.crs;
          let layer = Layer.createLayer(
            item,
            this.viewer,
            this.config.serverURL,
            this.config.defaultKey
          );
          if (layer) arrBasemaps.push(layer);

          orderlayers.push(item);
          if (item.type === 'group' && item.layers) {
            for (let idx = 0; idx < item.layers.length; idx++) {
              let childitem = item.layers[idx];
              orderlayers.push(childitem);
            }
          }
        }
      }
    }
    this.arrBasemaps = arrBasemaps;

    //可叠加图层
    let arrOperationallayers = [];
    let layersCfg = this.config.operationallayers;
    if (layersCfg && layersCfg.length > 0) {
      for (let i = 0; i < layersCfg.length; i++) {
        let item = layersCfg[i];
        let layer = Layer.createLayer(
          item,
          this.viewer,
          this.config.serverURL,
          this.config.defaultKey
        );
        if (layer) arrOperationallayers.push(layer);

        orderlayers.push(item);
        if (item.type === 'group' && item.layers) {
          for (let idx = 0; idx < item.layers.length; idx++) {
            let childitem = item.layers[idx];
            orderlayers.push(childitem);
          }
        }
      }
    }
    this.arrOperationallayers = arrOperationallayers;
    if (arrOperationallayers[2]) {
      arrOperationallayers[2].centerAt();
    }

    //计算 顺序字段,
    for (let i = 0; i < orderlayers.length; i++) {
      let item = orderlayers[i];

      //计算层次顺序
      let order = Number(item.order);
      if (isNaN(order)) order = i;
      item.order = order;

      //图层的处理
      if (item._layer != null) {
        item._layer.setZIndex(order);
      }
    }
  },*/

  addLayer(data) {
    try {
      //var orderlayers = []; //计算order
      let layer;
      this.fire(LayerManagerEventType.BEFOREADD3DLAYER, { data });
      if (
        (data?.isBaseMapLayer && data.isBaseMapLayer === true) ||
        (data?.isInitLayer && data.isInitLayer === true)
      ) {
        if (data.group === '1') {
          this.config.basemaps.push(data);
          layer = Layer.createLayer(
            data,
            this.viewer,
            this.config.serverURL,
            this.config.defaultKey
          );
          if (layer) this.arrBasemaps.push(layer);
        } else if (data.group === '2') {
          this.config.operationallayers.push(data);
          layer = Layer.createLayer(
            data,
            this.viewer,
            this.config.serverURL,
            this.config.defaultKey
          );
          if (layer) this.arrOperationallayers.push(layer);
        }
      } else {
        if (data.group === '1') {
          this.config.basemaps.push(data);
          layer = Layer.createLayer(
            data,
            this.viewer,
            this.config.serverURL,
            this.config.defaultKey
          );
          if (layer) this.arrBasemaps.push(layer);
        } else if (data.group === '2') {
          //可叠加图层
          //var arrOperationallayers = [];
          this.config.operationallayers.push(data);

          layer = Layer.createLayer(
            data,
            this.viewer,
            this.config.serverURL,
            this.config.defaultKey
          );
          if (layer) this.arrOperationallayers.push(layer);
        }
      }
      this.fire(LayerManagerEventType.AFTERADD3DLAYER, { data, layer });
      if (data.isFit) {
        this.isLayerFit(layer, data);
      }
    } catch (e) {
      this.fire(LayerManagerEventType.ADD3DLAYERERROR, data);
      console.warn(e);
    }
  },
  //fix(earth-core):修复图层初始化使用isFit定位异常的问题
  async isLayerFit(layer, data) {
    const dataFit =
      layer?.layer?.imageryProvider?.readyPromise || layer?.model?.readyPromise;
    await dataFit;
    if (data.camera) {
      this.centerAt(data.data);
    } else {
      layer.centerAt();
    }
  },
  /**
   * 根据过滤条件对图层进行过滤
   * @param {*} id 图层id
   * @param {*} where 过滤条件
   */
  filterLayer(id, where) {
    //1、查找图层
    let layer, type;
    layer = this.arrBasemaps.find((l) => l.config?.id === id);
    layer = layer || this.arrOperationallayers.find((l) => l.config?.id === id);
    if (!layer) {
      console.warn('该id图层不存在');
      return;
    }
    type = layer.config.type;
    switch (type) {
      default:
      case 'dynamic': {
        //生成sql字符串
        let layerDefs = {};
        //考虑多图层情况
        let layersString = layer.config.visibleLayers;
        layersString.forEach((e) => {
          layerDefs[e] = where;
        });
        layerDefs = JSON.stringify(layerDefs);
        layer.layer.imageryProvider.layers;
        layer.layer._imageryProvider._layerDefs = layerDefs;
        layer.layer.imageryProvider._ready &&
          layer.layer.imageryProvider._reload();
        break;
      }
      case 'feature': {
        //待测试
        layer.setWhere(where);
        break;
      }
      case 'geoserver-wfs': {
        let currentFilter3dLayer = this.getLayer(layer.config.id, 'id');
        if (currentFilter3dLayer) {
          currentFilter3dLayer.setVisible(false);
          setTimeout(() => {
            layer.setWhere(where);
            currentFilter3dLayer.setVisible(true);
          }, 250);
        }
      }
    }
  },

  //获取指定图层 keyname默认为名称
  getLayer(key, keyname) {
    if (keyname == null) keyname = 'name';

    let layersCfgB = this.arrBasemaps;
    if (layersCfgB && layersCfgB.length > 0) {
      for (let i = 0; i < layersCfgB.length; i++) {
        let itemB = layersCfgB[i];
        if (itemB == null || itemB.config[keyname] !== key) continue;
        return itemB;
      }
    }

    let layersCfgO = this.arrOperationallayers;
    if (layersCfgO && layersCfgO.length > 0) {
      for (let i = 0; i < layersCfgO.length; i++) {
        let itemO = layersCfgO[i];
        if (itemO == null || itemO.config[keyname] !== key) continue;
        return itemO;
      }
    }
    // return null
  },

  removeLayer(data) {
    let a = this.getLayer(data.id, 'id');
    //pbf样式编辑临时方案
    let b = this.getLayer(data.id + 'temp', 'id');
    //this.viewer.imageryLayers.remove(a,true)
    this.fire(LayerManagerEventType.BEFOREREMOVE3DLAYER, { data, a });
    if (a) {
      a.setVisible(false);
    }
    if (b) {
      b.setVisible(false);
    }

    var layersCfg = this.arrBasemaps;
    if (layersCfg && layersCfg.length > 0) {
      for (var i = 0; i < layersCfg.length; i++) {
        var item = layersCfg[i];
        if (item == null || item.config.id === data.id) {
          this.arrBasemaps.splice(i, 1);
          break;
        }
      }
    }

    layersCfg = this.arrOperationallayers;
    if (layersCfg && layersCfg.length > 0) {
      for (let i = 0; i < layersCfg.length; i++) {
        let item = layersCfg[i];
        if (item == null || item.config.id === data.id) {
          this.arrOperationallayers.splice(i, 1);
          break;
        }
      }
    }

    layersCfg = this.config.operationallayers;
    if (layersCfg && layersCfg.length > 0) {
      for (let i = 0; i < layersCfg.length; i++) {
        let item = layersCfg[i];
        if (item == null || item.id === data.id) {
          this.config.operationallayers.splice(i, 1);
          break;
        }
      }
    }
    this.fire(LayerManagerEventType.AFTERREMOVE3DLAYER, { data });
  },

  /**
   * 图层配置信息
   * @param {图层配置信息数据} tocConfigData
   */
  setTocData(tocConfigData) {
    this.tocData = tocConfigData;
  },

  getLayerDataById(id) {
    for (let tree of this.tocData) {
      if (tree.children && tree.children.length > 0) {
        return this.queryTocData(tree, 'id', id);
      } else if (tree.url && tree.url !== '') {
        if (tree.id === id) {
          return tree;
        }
      }
    }
  },

  /*  getLayerById(id) {
    let layer;
    let layers = this.getLayers().getArray();
    for (let i = 0; i < layers.length; i++) {
      let tempLayerId = layers[i].get('id');
      if (tempLayerId === id) {
        layer = layers[i];
        break;
      }
    }
    return layer;
  },*/

  queryTocData(tree, filed, value) {
    if (tree.children && tree.children.length > 0) {
      for (let layer of tree.children) {
        if (layer.children && layer.children.length > 0) {
          let queryResult = this.queryTocData(layer, filed, value);
          if (queryResult) {
            return queryResult;
          }
        } else if (layer[filed] === value) {
          return layer;
        }
      }
    }
  },

  addCheckedLayers(data) {
    data.visible = true;
    this.checkedLayers = this.getCheckedLayers();
    let checkedLayers = this.checkedLayers;
    if (checkedLayers.length === 0) {
      checkedLayers.push(data);
    } else {
      // 根据地图压盖顺序排序
      for (let i = 0, l = checkedLayers.length; i < l; i++) {
        if (data.mapIndex >= checkedLayers[i].mapIndex) {
          checkedLayers.splice(i, 0, data);
          break;
        }
        if (i === checkedLayers.length - 1) {
          checkedLayers.push(data);
        }
      }
    }
    this.addLayer(data);
  },

  getCheckedLayers() {
    return this.checkedLayers;
  },

  removeCheckedLayers(data) {
    let checkedLayers = this.getCheckedLayers();
    for (let i = 0, l = checkedLayers.length; i < l; i++) {
      if (checkedLayers[i].id === data.id) {
        checkedLayers.splice(i, 1);
        this.removeLayer(data);
        break;
      }
    }
    this.checkedLayers = checkedLayers;
  },

  //获取图层透明度 结果0-100
  getLayerOpacity(/* id */) {
    return;
    /*   let layer = this.getLayer(id, 'id');
    if (layer) {
      return layer.getOpacity() * 100;
    } else {
      return 100;
    } */
  },

  //设置图层透明度 参数0-100
  setLayerOpacity(id, opacity) {
    let layer = this.getLayer(id, 'id');
    if (layer) {
      layer.setOpacity(opacity / 100);
    }
  },

  zoomToLayer(opts) {
    if (opts.camera) {
      this.centerAt(opts.camera);
    } else {
      let layerId = opts.id;
      let currentLayer = this.getLayer(layerId, 'id');
      if (currentLayer) {
        currentLayer.centerAt(2);
      }
    }
  },

  // 设置图层置顶
  setLayerTop(id) {
    let layer = this.getLayer(id, 'id');
    if (layer) {
      let max = 0;
      let group = layer.config.group; // 图层类型，基础图层和项目图层分开
      let layerArray = this.arrOperationallayers;
      for (let item of layerArray) {
        let layerGroup = item.config.group ? item.config.group : null;
        if (layerGroup === group) {
          let zIndex = item.config.mapIndex ? item.config.mapIndex : 0;
          max = Math.max(max, zIndex);
        }
      }
      layer.setZIndex(max + 1);
    }
  }
});

export { LayerManager };
