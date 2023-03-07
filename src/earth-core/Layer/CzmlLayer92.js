/*
 * @Author: liujh
 * @Date: 2020/8/24 9:45
 * @Description:
 */
/* 92 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import { GeoJsonLayer } from './GeoJsonLayer27';
import * as util from '../Tool/Util1';

const CzmlLayer = GeoJsonLayer.extend({
  queryData: function queryData() {
    let that = this;

    let config = util.getProxyUrl(this.config);

    let dataSource = Cesium.CzmlDataSource.load(config.url, config);
    dataSource
      .then(function (dataSource) {
        that.showResult(dataSource);
      })
      .catch(function (error) {
        that.showError('服务出错', error);
      });
  },
  getEntityAttr: function getEntityAttr(entity) {
    if (entity.description && entity.description.getValue)
      return entity.description.getValue(this.viewer.clock.currentTime);
  }
});
export { CzmlLayer };
