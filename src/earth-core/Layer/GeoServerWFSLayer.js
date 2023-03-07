/*
 * @Author: liujh
 * @Description:
 */

import * as Cesium from 'cesium_shinegis_earth';

import { CustomFeatureGridLayer } from './CustomFeatureGridLayer31';
import WFS from 'ol/format/WFS';
import * as Filter from 'ol/format/filter';

const GeoServerWFSLayer = CustomFeatureGridLayer.extend({
  //获取网格内的数据，calback为回调方法，参数传数据数组
  getDataForGrid: function getDataForGrid(opts, calback) {
    let url = this.config.url;

    let filter = this.config.where ? this.config.where : null;
    let writeOptions = {
      srsName: 'EPSG:4490',
      // featureNS: data.url,    //命名空间
      // featurePrefix: 'zbtr',               //工作区域
      featureTypes: this.config.visibleLayers, // 图层名
      bbox: [
        opts.rectangle.xmin,
        opts.rectangle.ymin,
        opts.rectangle.xmax,
        opts.rectangle.ymax
      ],
      geometryName: this.config.geoStr || 'the_geom',
      outputFormat: 'application/json'
    };
    if (filter) {
      let filterObj = filter;
      if (typeof filter === 'string') {
        filterObj = JSON.parse(filter);
      }
      writeOptions.filter = this.parseFilter(filterObj);
    }
    let featureRequest = new WFS().writeGetFeature(writeOptions);

    let requestUrl = url;
    if (opts.authkey) {
      requestUrl = requestUrl + '?authkey=' + opts.authkey;
    }

    fetch(requestUrl, {
      method: 'POST',
      body: new XMLSerializer().serializeToString(featureRequest)
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        calback(json.features);
      })
      .catch((error) => {
        console.error(error);
      });
  },
  //根据数据创造entity
  createEntity: function createEntity(opts, item, calback) {
    let that = this;
    /* let clampToGround;
    let classificationType;
    if (this.config.symbol.styleOptions) {
      //等样式配置完善后生效
      clampToGround = this.config.symbol.styleOptions.clampToGround;
      classificationType = this.config.symbol.styleOptions.classificationType;
    } */
    let dataSource = Cesium.GeoJsonDataSource.load(item, {
      clampToGround: true,
      classificationType: 2
      //zIndex: 2
    });
    dataSource
      .then(function (dataSource) {
        if (that.checkHasBreak[opts.key]) {
          return; //异步请求结束时，如果已经卸载了网格就直接跳出。
        }
        if (dataSource.entities.values.length === 0) return null;
        let entity = dataSource.entities.values[0];
        //entity._id = that.config.id + '_' + opts.key + '_' + entity.id;
        entity._id = that.config.id + '_' + entity.id;

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
    if (!this.dataSource.entities.getById(entity._id)) {
      this.dataSource.entities.add(entity);
    }

    calback(entity);
  },
  setWhere: function setWhere(where) {
    this.config.where = where;
    this.reload();
  },
  parseFilter(filter) {
    if (!filter.type) {
      console.warn('type字段不存在');
      return;
    }
    if (!filter.param) {
      console.warn('param字段不存在');
      return;
    }
    let filterConditions = [];
    switch (filter.type.toLowerCase()) {
      case 'and':
        for (let i = 0; i < filter.param.length; i++) {
          let filterChild = this.parseFilter(filter.param[i]);
          filterConditions.push(filterChild);
        }
        return Filter.and.apply(null, filterConditions);
      case 'or':
        for (let i = 0; i < filter.param.length; i++) {
          let filterChild = this.parseFilter(filter.param[i]);
          filterConditions.push(filterChild);
        }
        return Filter.or.apply(null, filterConditions);
      case 'not':
        for (let i = 0; i < filter.param.length; i++) {
          let filterChild = this.parseFilter(filter.param[i]);
          filterConditions.push(filterChild);
        }
        return Filter.not.apply(null, filterConditions);
      case '=':
        return Filter.equalTo(filter.param[0], filter.param[1]);
      case '!==':
        return Filter.notEqualTo(filter.param[0], filter.param[1]);
      case '>':
        return Filter.greaterThan(filter.param[0], filter.param[1]);
      case '<':
        return Filter.lessThan(filter.param[0], filter.param[1]);
      case '>=':
        return Filter.greaterThanOrEqualTo(filter.param[0], filter.param[1]);
      case '<=':
        return Filter.lessThanOrEqualTo(filter.param[0], filter.param[1]);
      case 'between':
        return Filter.between(
          filter.param[0],
          filter.param[1],
          filter.param[2]
        );
    }
  }
});
export { GeoServerWFSLayer };
