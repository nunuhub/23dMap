/* eslint-disable no-prototype-builtins */
/*
 * @Author: liujh
 * @Date: 2020/8/24 9:45
 * @Description:
 */
/* 91 */
/***/
import * as Cesium from 'cesium_shinegis_earth';
import { GeoJsonLayer } from './GeoJsonLayer27';
import * as util from '../Tool/Util1';

const KmlLayer = GeoJsonLayer.extend({
  queryData: function queryData() {
    let that = this;

    let config = util.getProxyUrl(this.config);

    if (config.symbol && config.symbol.styleOptions) {
      let style = config.symbol.styleOptions;
      if (Cesium.defined(style.clampToGround)) {
        config.clampToGround = style.clampToGround;
      }
    }

    let dataSource = Cesium.KmlDataSource.load(config.url, {
      camera: this.viewer.scene.camera,
      canvas: this.viewer.scene.canvas,
      clampToGround: config.clampToGround
    });
    dataSource
      .then(function (dataSource) {
        that.showResult(dataSource);
      })
      .catch(function (error) {
        that.showError('服务出错', error);
      });
  },
  getEntityAttr: function getEntityAttr(entity) {
    let attr = {
      name: entity.name,
      description: entity.description
    };
    let extendedData = entity._kml.extendedData;
    for (let key in extendedData) {
      if (extendedData.hasOwnProperty(key)) {
        attr[key] = extendedData[key].value;
      }
    }
    attr = util.getAttrVal(attr);

    if (attr.description) {
      attr.description = attr.description.replace(/<div[^>]+>/g, ''); //剔除div html标签
    }

    return attr;
  }
});
export { KmlLayer };
