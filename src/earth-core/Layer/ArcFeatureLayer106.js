/*
 * @Author: liujh
 * @Date: 2020/9/21 15:34
 * @Description:
 */
/* 106 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import * as esriLeaflet from '../ThirdParty/EsriLeafLet32';
import { GeoJsonLayer } from './GeoJsonLayer27';

const ArcFeatureLayer = GeoJsonLayer.extend({
  queryData: function queryData() {
    if (this.dataSource) {
      this.viewer.dataSources.remove(this.dataSource);
      this.dataSource = null;
    }
    let that = this;

    let url = this.config.url;

    if (this.config.layers && this.config.layers.length > 0)
      url += '/' + this.config.layers[0];

    let query = esriLeaflet.default.query({
      url: url
    });
    if (this.config.where) query.where(this.config.where);

    query.run(function (error, featureCollection /* , response */) {
      if (error != null && error.code > 0) {
        console.error(error.message, '服务访问出错');
        return;
      }

      if (
        featureCollection === undefined ||
        featureCollection === null ||
        featureCollection.features.length === 0
      ) {
        console.error('未找到符合查询条件的要素！');
      } else {
        //剔除有问题数据
        let featuresOK = [];
        for (let i = 0; i < featureCollection.features.length; i++) {
          let feature = featureCollection.features[i];
          if (feature == null || feature.geometry == null) continue;
          if (
            feature.geometry.coordinates &&
            feature.geometry.coordinates.length === 0
          )
            continue;
          featuresOK.push(feature);
        }
        featureCollection.features = featuresOK;

        let dataSource = new Cesium.GeoJsonDataSource();
        let loadedPromise = Cesium.GeoJsonDataSource.load(featureCollection, {
          clampToGround: true
        });
        loadedPromise
          .then(function () {
            that.showResult(dataSource);
          })
          .catch(function (error) {
            that.showError('服务出错', error);
          });
      }
    });
  },
  setWhere: function setWhere(where) {
    this.config.where = where;
    this.queryData();
  }
});
export { ArcFeatureLayer };
