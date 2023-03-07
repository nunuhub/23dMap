import Bus from '../utils/bus';
import { Message } from 'element-ui';
import { Tile as TileLayer } from 'ol/layer.js';
import VectorTileLayer from 'ol/layer/VectorTile.js';
import LayerGenerater from './LayerGenerater.js';
import { transformExtent } from 'ol/proj';
import LayerGroup from 'ol/layer/Group';
import Observable from 'ol/Observable';
import Event from 'ol/events/Event.js';
import { extend as extendExtent } from 'ol/extent';

const LayerManagerEventType = {
  /**
   * 调用addLayer函数，在加载图层之前触发
   */
  BEFOREADDLAYER: 'beforeAddLayer',
  /**
   * 调用addLayer函数，在加载图层之后触发
   */
  AFTERADDLAYER: 'afterAddLayer',
  /**
   * 调用removeLayer函数，在加载图层之前触发
   */
  BEFOREREMOVELAYER: 'beforeRemoveLayer',
  /**
   * 调用removeLayer函数，在加载图层之后触发
   */
  AFTERREMOVELAYER: 'afterRemoveLayer',
  /**
   * 调用addLayerError函数，在加载图层失败之后触发
   */
  ADDLAYERERROR: 'addLayerError'
};

export class LayerManagerEvent extends Event {
  constructor(type, layer, payload) {
    super(type);
    this.layer = layer;
    this.payload = payload;
  }
}

/**
 * 图层控制类
 */
class LayerManager extends Observable {
  constructor(map) {
    super();
    this.nowTop = 999;
    this.map = map;
    // 添加图层时是否使用运维端配置的图层顺序排序
    this.isAutoTop = false;
    // 切片图层(只能存在一个坐标系下的切片图层)
    this.tildLayer = [];
    // 所有图层配置数据
    this.tocData = [];
    // 图层目录选中图层
    this.checkedLayers = [];
    this.dataMap = new Map();
    this.promiseMap = new Map();
    // 底图图层(后期新增 不同于baseLayers)
    this.baseMapLayers = [];
    // 项目图层
    this.projectLayers = [];
    // 当前编辑层
    this.editLayer = undefined;
    // 图层渲染上下文
    this.layerContexts = [];
    // 初始图层定位
    this.initData = null;
    // 图层生成类
    this.layerGenerater = new LayerGenerater(map);
  }

  setMap(map) {
    this.map = map;
  }

  getCheckedLayers() {
    return this.checkedLayers;
  }

  /**
   * 获取当前编辑图层
   * @returns Layer
   */
  getEditLayer() {
    if (
      this.editLayer &&
      this.editLayer.metadata &&
      this.editLayer.metadata.editing
    ) {
      return this.editLayer;
    }
  }

  /**
   * 设置当前编辑层
   * @param {要设置为编辑层的图层id} id
   */
  setEditLayerById(data) {
    let layer = this.getLayerById(data.id);
    if (layer) {
      layer.metadata = layer.values_.info;
      if (this.getEditLayer()) {
        this.getEditLayer().metadata.editing = false;
      }
      this.setEditLayer(layer);
      layer.metadata.editing = true;
      return true;
    } else {
      return false;
    }
  }

  /**
   * 设置当前编辑层
   * @param {要设置为编辑层的图层} layer
   */
  setEditLayer(layer) {
    this.editLayer = layer;
  }

  /**
   * 图层配置信息
   * @param {图层配置信息数据} tocConfigData
   */
  setTocData(tocConfigData) {
    this.tocData = tocConfigData;
  }

  /**
   * 添加图层的入口，供外部调用
   * @param {*} data
   */
  addLayer(data) {
    this.isDisableFit = false;
    return new Promise((resolve, reject) => {
      if (this.dataMap.has(data.id)) {
        data = this.dataMap.get(data.id);
      }
      /**
       * 限制重复加载的异步问题
       */
      if (!this.promiseMap.has(data.id)) {
        let promise = this.layerGenerater.generate(data);
        this.promiseMap.set(data.id, promise);
        promise
          .then((layer) => {
            this.promiseMap.delete(data.id);
            if (data.needChecked && this.indexOfCheckedLayers(data) === -1) {
              //图层已被移除不需要加载
              return;
            }
            if (data.initExtent) {
              layer.set('initExtent', data.initExtent);
            }
            this.addLayerToMap(layer);
            resolve(layer);
          })
          .catch((error) => {
            // 三维报错 忽略
            if (error.name === 'DeveloperError') {
              console.error('三维', error);
            } else if (
              error.stack.indexOf('earth-core') > -1 ||
              error.stack.indexOf('ImageryProvider') > -1
            ) {
              console.error('三维', error);
            } else {
              console.error(error);
              this.dispatchEvent(
                new LayerManagerEvent(
                  LayerManagerEventType.ADDLAYERERROR,
                  data,
                  error
                )
              );
              Message({
                message: error,
                type: 'error'
              });
              reject(error);
            }
          });
      }
    });
  }

  /**
   * 图层目录组件使用的添加图层接口
   * @param {*} item 图层信息
   * @returns
   */
  addCheckedLayers(item) {
    item.needChecked = true;
    if (this.checkedLayers.length === 0) {
      this.checkedLayers.push(item);
    } else {
      // 过滤同id图层
      for (let checkLayer of this.checkedLayers) {
        if (checkLayer.id === item.id) {
          return Promise.reject(new Error(`地图中已加载id为${item.id}图层`));
        }
      }
      // 根据地图压盖顺序排序
      for (let i = 0, l = this.checkedLayers.length; i < l; i++) {
        if (item.mapIndex >= this.checkedLayers[i].mapIndex) {
          this.checkedLayers.splice(i, 0, item);
          break;
        }
        if (i === this.checkedLayers.length - 1) {
          this.checkedLayers.push(item);
        }
      }
    }
    return this.addLayer(item);
  }

  /**
   * 图层目录组件使用的删除图层接口
   * @param {*} item 图层信息
   */
  removeCheckedLayers(item) {
    let checkedLayers = this.getCheckedLayers();
    for (let i = 0, l = checkedLayers.length; i < l; i++) {
      if (checkedLayers[i].id === item.id) {
        checkedLayers.splice(i, 1);
        this.removeLayer(item);
        break;
      }
    }
    this.checkedLayers = checkedLayers;
  }

  indexOfCheckedLayers(item) {
    let checkedLayers = this.getCheckedLayers();
    for (let i = 0, l = checkedLayers.length; i < l; i++) {
      if (checkedLayers[i].id === item.id) {
        return i;
      }
    }
    return -1;
  }

  /**
   * 分组，并且针对基础底图和项目图层重新排序，让项目图层永远在基础图层之上
   * @param layer
   * @param data
   */
  groupLayer(layer, data) {
    // 判断是否为底图，条件可以变更为图层类型，后续再定
    if (data.group === '1') {
      this.baseMapLayers.push(layer);
    } else {
      this.projectLayers.push(layer);
    }
    // 重新对mapIndex排序
    this.reBuildZIndex();
  }

  reBuildZIndex() {
    let baseMax = 0;
    let projectMin = 65535;
    for (let layer of this.baseMapLayers) {
      let zIndex = parseFloat(layer.getZIndex() ? layer.getZIndex() : 0);
      baseMax = Math.max(baseMax, zIndex);
    }
    for (let layer of this.projectLayers) {
      let zIndex = parseFloat(layer.getZIndex() ? layer.getZIndex() : 0);
      projectMin = Math.min(projectMin, zIndex);
    }
    // 最小的项目图层小于最大的基础底图，则要重新排序
    if (this.baseMapLayers.length > 0 && projectMin <= baseMax) {
      let DValue = baseMax - projectMin + 10;
      for (let layer of this.projectLayers) {
        let zIndex = parseFloat(layer.getZIndex() ? layer.getZIndex() : 0);
        layer.values_.info.zIndex = zIndex + DValue;
        layer.setZIndex(zIndex + DValue);
      }
    }
  }

  /**
   * 删除图层，对外提供调用
   * @param {*} data
   */
  removeLayer(data) {
    this.clearSelectFeaturesByTag(data.layerTag);
    let id = data.id ? data.id : data.get('id');
    let layers = this.getAllLayerById(id);
    for (let layer of layers) {
      if (layer instanceof TileLayer) {
        for (let i = 0, l = this.tildLayer.length; i < l; i++) {
          if (layer === this.tildLayer[i]) {
            this.tildLayer.splice(i, 1);
            break;
          }
        }
        // 重新设置地图minZoom maxZomm
        if (this.tildLayer.length > 0) {
          let minZooms = [];
          let maxZomms = [];
          this.tildLayer.forEach((element) => {
            minZooms.push(element.getSource().tileGrid.minZoom);
            maxZomms.push(element.getSource().tileGrid.maxZoom);
          });
        } else {
          this.setMinAndMaxZoom(0, 28);
        }
      }
      this.dispatchEvent(
        new LayerManagerEvent(LayerManagerEventType.BEFOREREMOVELAYER, layer)
      );
      this.map.removeLayer(layer);
      this.dispatchEvent(
        new LayerManagerEvent(LayerManagerEventType.AFTERREMOVELAYER, layer)
      );
    }
  }

  /**
   * 将图层添加到ol的map上
   * @param {*} layer
   */
  addLayerToMap(layer) {
    let self = this;
    if (this.map.mask) {
      layer.addFilter(this.map.mask);
    }
    this.dispatchEvent(
      new LayerManagerEvent(
        LayerManagerEventType.BEFOREADDLAYER,
        layer,
        layer.values_.info
      )
    );
    this.map.addLayer(layer);
    this.dispatchEvent(
      new LayerManagerEvent(
        LayerManagerEventType.AFTERADDLAYER,
        layer,
        layer.values_.info
      )
    );
    // 缩放到图层
    if (layer.get('isFit') && layer.get('initExtent')) {
      this.fitToLayer(layer);
    }
    // 这里处理掩模
    layer.on('postrender', function (e) {
      self.layerContexts.push(e);
    });

    layer.once('postcompose', () => {
      Bus.$emit('layerrender', layer);
    });
    // 图层初始过滤
    this.initFilter(layer);
  }

  /**
   * 图层初始过滤
   */
  initFilter(layer) {
    let mapOption = this.map.get('params');
    if (layer.getSource && layer.getSource().updateParams) {
      if (mapOption && mapOption.filter) {
        mapOption.filter.forEach((filterWhere) => {
          if (layer.values_.layerTag === filterWhere.layerTag) {
            layer.getSource().updateParams({
              CQL_FILTER: filterWhere.where
            });
          }
        });
      }
    }
  }

  setDisableFit(isDisableFit) {
    this.isDisableFit = isDisableFit;
  }

  /**
   * 缩放到图层
   * @param {ol.layer.layer} layer
   */
  fitToLayer(layer) {
    if (this.isDisableFit) {
      return;
    }
    if (layer instanceof TileLayer || layer instanceof VectorTileLayer) {
      let extent = transformExtent(
        layer.get('initExtent'),
        'EPSG:4326',
        this.map.getView().getProjection().getCode()
      );
      this.map.getView().fit(extent, this.map.getSize());
      if (
        layer.getMaxResolution() !== Infinity &&
        this.map
          .getView()
          .getResolutionForExtent(
            layer.get('initExtent') > layer.getMaxResolution() / 2
          )
      ) {
        this.map.getView().setResolution(layer.getMaxResolution() / 2);
      }
    } else {
      this.map
        .getView()
        .fit(
          transformExtent(
            layer.get('initExtent'),
            'EPSG:4326',
            this.map.getView().getProjection().getCode()
          ),
          this.map.getSize()
        );
    }
  }

  /**
   * 设置地图最大和最小缩放等级
   * @param {*} minZoom
   * @param {*} maxZoom
   */
  setMinAndMaxZoom(minZoom, maxZoom) {
    if (this.map.getView().getResolution()) {
      let isExistMinZoom = this.map.options ? this.map.options.minZoom : false;
      let isExistMaxZoom = this.map.options ? this.map.options.maxZoom : false;
      if (!isExistMinZoom || this.map.getView().getMinZoom() > minZoom) {
        if (this.map.getView().getResolution()[minZoom] === undefined) {
          minZoom = minZoom + 1;
        }
        this.map.getView().setMinZoom(minZoom);
      }
      if (!isExistMaxZoom || this.map.getView().getMaxZoom() < maxZoom) {
        this.map.getView().setMaxZoom(maxZoom);
      }
    }
  }

  /**
   * 修改图层透明度
   * @param {Object} item
   */
  changeLayerOpacity(item) {
    if (this.map.getLayerById(item.id)) {
      this.map.getLayerById(item.id).setOpacity(item.opacity);
    }
  }

  /**
   * 根据图层ID查找图层
   * @param {*} id
   */
  getLayerById(id) {
    let layer;
    let layers = this.map.getLayers().getArray();
    for (let i = 0; i < layers.length; i++) {
      let tempLayerId = layers[i].get('id');
      if (tempLayerId === id) {
        layer = layers[i];
        break;
      }
    }
    return layer;
  }

  /**
   * 根据图层ID查找图层
   * 特殊情况下Id可能会重复
   * @param {*} id
   */
  getAllLayerById(id) {
    let idLayers = [];
    let layers = this.map.getLayers().getArray();
    for (let i = 0; i < layers.length; i++) {
      let tempLayerId = layers[i].get('id');
      if (tempLayerId === id) {
        idLayers.push(layers[i]);
      }
    }
    return idLayers;
  }

  getLayerDataById(id) {
    for (let tree of this.tocData) {
      if (tree.children && tree.children.length > 0) {
        let layer = this.queryTocData(tree, 'id', id);
        if (layer) {
          return layer;
        }
      } else if (tree.url && tree.url !== '') {
        if (tree.id === id) {
          return tree;
        }
      }
    }
  }

  getLayerDataByLayerTag(layerTag) {
    for (let tree of this.tocData) {
      if (tree.children && tree.children.length > 0) {
        let result = this.queryTocData(tree, 'layerTag', layerTag);
        if (result) {
          return result;
        }
      } else if (tree.url && tree.url !== '') {
        if (tree.layerTag === layerTag) {
          return tree;
        }
      }
    }
  }

  // 递归查询
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
  }

  // 获取图层透明度 结果0-100
  getLayerOpacity(id) {
    let layer = this.getLayerById(id);
    if (layer) {
      return layer.getOpacity();
    } else {
      return -1;
    }
  }

  // 设置图层透明度 参数0-100
  setLayerOpacity(id, opacity) {
    let layer = this.getLayerById(id);
    if (layer) {
      //图层组还需要给子图层设置透明度
      if (layer instanceof LayerGroup) {
        let layers = layer.getLayers().getArray();
        for (let layerChild of layers) {
          layerChild.setOpacity(opacity / 100);
        }
      }
      layer.setOpacity(opacity / 100);
    }
  }

  // 设置图层置顶
  setLayerTop(id) {
    const targetLayer = this.getLayerById(id);
    if (targetLayer) {
      let max = 0;
      const layerArray = this.map.getLayers().getArray();
      layerArray.forEach((layer) => {
        const layerType = layer.values_?.info?.group;
        if (layerType) {
          const zIndex = layer.getZIndex() || 0;
          max = Math.max(max, zIndex);
        }
      });
      targetLayer.setZIndex(max + 1);
    }
  }

  zoomToLayer(id) {
    let layer = this.getLayerById(id);
    if (layer) {
      this.fitToLayer(layer);
    }
  }
  zoomToLayers(array) {
    let extent;
    //遍历获取一个最大的extent
    for (let layerInfo of array) {
      let layer = this.getLayerById(layerInfo.id);
      if (layer) {
        let layerExtent = transformExtent(
          layer.get('initExtent'),
          'EPSG:4326',
          this.map.getView().getProjection().getCode()
        );
        if (extent) {
          extent = extendExtent(extent, layerExtent);
        } else {
          extent = layerExtent;
        }
      }
    }
    if (extent) {
      this.map.getView().fit(extent, this.map.getSize());
    }
  }

  // 设置图层叠加顺序
  setLayerIndex(id, zIndex) {
    let layer = this.getLayerById(id);
    if (layer instanceof LayerGroup) {
      let layers = layer.getLayers().getArray();
      layer.setZIndex(zIndex);
      for (let layerChild of layers) {
        if (!Number.isInteger(layerChild.values_.info.mapIndex)) {
          zIndex = zIndex - 0.001;
        }
        this._changeLayerZoom(layerChild, zIndex);
      }
    } else {
      this._changeLayerZoom(layer, zIndex);
    }
  }

  _changeLayerZoom(layer, zIndex) {
    layer.setZIndex(zIndex);
  }

  setData(data) {
    this.dataMap.set(data.id, data);
  }

  clearSelectFeaturesByTag(layerTag) {
    let selectFeatures = this.map.getSelectFeatures();
    let source = this.map.getLayerById('drawLayer').getSource();
    for (let feature of selectFeatures) {
      if (feature.values_.layerTag === layerTag) {
        source.removeFeature(feature);
      }
    }
  }
}

export default LayerManager;
