/**
 * @Author han
 * @Date 2021/1/8 15:01
 */

const _createClass = (function () {
  function defineProperties(target, props) {
    for (let i = 0; i < props.length; i++) {
      let descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ('value' in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

import * as Cesium from 'cesium_shinegis_earth';
import { gcj2wgs } from './PointConvert25';
import { msg } from './Util1';

//高德POI查询 类
const GaodePOIGeocoder = (function () {
  //========== 构造方法 ==========
  function GaodePOIGeocoder(options) {
    options = options || {};
    this.citycode = options.citycode || '';
    //内置高德地图服务key，建议后期修改为自己申请的
    //.00.. debugger
    this.gaodekey = options.key;
  }

  //========== 对外属性 ==========
  // //裁剪距离
  // get distance() {
  //     return this._distance || 0
  // }
  // set distance(val) {
  //     this._distance = val
  // }

  //========== 方法 ==========

  _createClass(GaodePOIGeocoder, [
    {
      key: 'getOneKey',
      value: function getOneKey() {
        let arr = this.gaodekey;
        let n = Math.floor(Math.random() * arr.length + 1) - 1;
        return arr[n];
      }
    },
    {
      key: 'geocode',
      value: function geocode(query /* geocodeType */) {
        let that = this;

        let key = this.getOneKey();

        let resource = new Cesium.Resource({
          url: 'http://restapi.amap.com/v3/place/text',
          queryParameters: {
            key: key,
            city: this.citycode,
            //citylimit: true,
            keywords: query
          }
        });

        return resource.fetchJson().then(function (results) {
          if (results.status == 0) {
            msg('请求失败(' + results.infocode + ')：' + results.info);
            return;
          }
          if (results.pois.length === 0) {
            msg('未查询到“' + query + '”相关数据！');
            return;
          }

          let height = 3000;
          if (that.viewer.camera.positionCartographic.height < height)
            height = that.viewer.camera.positionCartographic.height;

          return results.pois.map(function (resultObject) {
            let arrjwd = resultObject.location.split(',');
            arrjwd = gcj2wgs(arrjwd); //纠偏
            let lnglat = that.viewer.shine.point2map({
              x: arrjwd[0],
              y: arrjwd[1]
            });

            return {
              displayName: resultObject.name,
              destination: Cesium.Cartesian3.fromDegrees(
                lnglat.x,
                lnglat.y,
                height
              )
            };
          });
        });
      }
    }
  ]);

  return GaodePOIGeocoder;
})();
export { GaodePOIGeocoder };
