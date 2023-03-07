/*
 * @Author: liujh
 * @Date: 2020/8/24 10:02
 * @Description:
 */
/* 87 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import { TileLayer } from './TileLayer54';

const FeatureGridLayer = TileLayer.extend({
  dataSource: null,
  hasOpacity: false,
  create: function create() {
    let that = this;
    this.dataSource = new Cesium.CustomDataSource(this.config.id); //用于entity
    this.primitives = new Cesium.PrimitiveCollection(this.config.id); //用于primitive
    this.config.buildings = Cesium.defaultValue(this.config.buildings, {
      cloumn: 'floor'
    });
    this.config.symbol = Cesium.defaultValue(this.config.symbol, {
      styleOptions: {
        color: '#f8fafa',
        outlineColor: '#0d3685',
        outlineWidth: 5,
        opacity: 0.7
      }
    });

    //this.config.type_new = "custom_featuregrid"

    this.config.addImageryCache = function (opts) {
      return that._addImageryCache(opts);
    };
    this.config.removeImageryCache = function (opts) {
      return that._removeImageryCache(opts);
    };
    this.config.removeAllImageryCache = function (opts) {
      return that._removeAllImageryCache(opts);
    };
  },
  getLength: function getLength() {
    return this.primitives.length + this.dataSource.entities.values.length;
  },
  addEx: function addEx() {
    this.viewer.dataSources.add(this.dataSource);
    // console.log("a dataSource add to dataSources")
    this.viewer.scene.primitives.add(this.primitives);
  },
  removeEx: function removeEx() {
    this.viewer.dataSources.remove(this.dataSource);
    // console.log("a dataSource been removed from dataSources")
    this.viewer.scene.primitives.remove(this.primitives);
  },
  _addImageryCache: function _addImageryCache(/* opts */) {},
  _removeImageryCache: function _removeImageryCache(/* opts */) {},
  _removeAllImageryCache: function _removeAllImageryCache() {}
});
export { FeatureGridLayer };
