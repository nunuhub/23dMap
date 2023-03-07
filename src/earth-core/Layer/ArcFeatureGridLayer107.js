/*
 * @Author: liujh
 * @Date: 2020/9/29 10:26
 * @Description:
 */
/* 107 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import * as leaflet from '../ThirdParty/LeafLet20';
import * as esriLeaflet from '../ThirdParty/EsriLeafLet32';
import { CustomFeatureGridLayer } from './CustomFeatureGridLayer31';

const ArcFeatureGridLayer = CustomFeatureGridLayer.extend({
  //获取网格内的数据，calback为回调方法，参数传数据数组
  getDataForGrid: function getDataForGrid(opts, calback) {
    let that = this;
    ///待完善以支持聚合模式
    /* this.dataSource.clustering.enabled = true;
    const pixelRange = 5; //this.dataSource.clustering.pixelRange;
    this.dataSource.clustering.pixelRange = 0;
    this.dataSource.clustering.pixelRange = pixelRange; */

    let url = this.config.url;
    //let url = this.config.queryUrl
    //let showGridLayers = this.config.visibleLayers.join();
    //this.config.layers = showGridLayers
    // if (this.config.layers && this.config.layers.length > 0) url += "/" + this.config.layers[0]
    if (this.config.visibleLayers && this.config.visibleLayers.length > 0)
      url += '/' + this.config.visibleLayers[0];

    let query = esriLeaflet.query({
      url: url
    });

    //网格
    let bounds = leaflet.toLatLngBounds(
      leaflet.toLatLng(opts.rectangle.ymin, opts.rectangle.xmin),
      leaflet.toLatLng(opts.rectangle.ymax, opts.rectangle.xmax)
    );
    //query.within(bounds)

    if (this.config.where) {
      query.where(this.config.where);
    }
    //修改查询参数，改为相交，默认只包含瓦片内，导致相交矢量面都缺失
    query.intersects(bounds);

    query.run(function (error, featureCollection /* , response */) {
      if (!that._visible || !that._cacheGrid[opts.key]) {
        return; //异步请求结束时,如果已经卸载了网格就直接跳出。
      }

      if (error != null && error.code > 0) {
        console.error('arcgis服务访问出错' + error.message);
        return;
      }

      if (featureCollection === undefined || featureCollection === null) {
        return; //数据为空
      }

      if (featureCollection.type === 'Feature')
        featureCollection = {
          type: 'FeatureCollection',
          features: [featureCollection]
        };

      calback(featureCollection.features);
    });
  },
  //根据数据创造entity
  createEntity: function createEntity(opts, item, calback) {
    let that = this;
    let clampToGround;
    let classificationType;
    if (this.config.symbol.styleOptions) {
      //等样式配置完善后生效
      clampToGround = this.config.symbol.styleOptions.clampToGround;
      classificationType = this.config.symbol.styleOptions.classificationType;
    }
    let dataSource = Cesium.GeoJsonDataSource.load(item, {
      clampToGround: clampToGround ? clampToGround : true,
      classificationType: classificationType ? classificationType : 0
      //zIndex: 2
    });
    dataSource
      .then(function (dataSource) {
        if (that.checkHasBreak[opts.key]) {
          return; //异步请求结束时，如果已经卸载了网格就直接跳出。
        }

        if (dataSource.entities.values.length === 0) return null;
        let entity = dataSource.entities.values[0];
        //存在不同网格请求同一个矢量对象，直接用外部指定id机制
        entity._id = that.config.id /* + '_' + opts.key  */ + '_' + entity.id;
        entity.geojsondata = item;
        that._addEntity(entity, calback);
      })
      .catch(function (error) {
        that.showError('服务出错', error);
      });

    return null;
  },
  //更新entity，并添加到地图上
  _addEntity: function _addEntity(entity, calback) {
    //样式
    let symbol = this.config.symbol;
    if (symbol) {
      if (typeof symbol === 'function') {
        symbol(entity, entity.properties); //回调方法
      } else if (symbol === 'default') {
        this.setDefSymbol(entity);
      } else {
        this.setConfigSymbol(entity, symbol);
      }
    }
    //鼠标事件

    this.bindMourseEvnet(entity);

    //if (!this.dataSource.entities.contains(entity))
    if (!this.dataSource.entities.getById(entity._id))
      this.dataSource.entities.add(entity);

    calback(entity);
  },
  setWhere: function setWhere(where) {
    this.config.where = where;
    this.reload();
  }
});
export { ArcFeatureGridLayer };
