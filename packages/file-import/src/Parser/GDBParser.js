import Feature from 'ol/Feature';
import { locationGeometry } from '../common';
import { selectStyles } from 'shinegis-client-23d/src/utils/olUtil';
import { postFromAdmin } from 'shinegis-client-23d/src/utils/httprequest';
import EsriJSON from 'ol/format/EsriJSON';
import { registerProj } from 'shinegis-client-23d/src/map-core/CustomProjection';
/**
 * 导入shp文件解析器
 */
class GDBParser {
  constructor(_opt) {
    _opt = Object.assign({}, _opt);
    this.map = _opt.map;
    this.url = _opt.url;
    this.token = _opt.token;
    this.mapProjectionCode = _opt.map.getView().getProjection().getCode();
  }

  getLayerName(importFiles, type) {
    let self = this;
    return new Promise((resolve, reject) => {
      self.gdbFileName = '';
      let file = importFiles[0];
      let fileName = file.name;
      var reader = new FileReader();
      //以二进制的形式读取文件的内容
      reader.readAsDataURL(file, 'UTF-8');
      reader.onload = function () {
        let base64Str = this.result;
        var param = [{ base64str: base64Str, type: type, name: fileName }];
        let config = {
          headers: {
            'Content-Type': 'application/json'
          },
          token: self.token
        };
        postFromAdmin(self.url + '/uploadFile', param, config)
          .then((response) => {
            response = response.headers ? response.data : response;
            if (response.code === 200) {
              if (response.data && response.data.length > 0) {
                self.gdbFileName = response.data[0];
                let config = {
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  token: self.token
                };
                var param = { file: self.gdbFileName };
                postFromAdmin(self.url + '/getLayerName', param, config).then(
                  (response) => {
                    response = response.headers ? response.data : response;
                    if (response.code === 200) {
                      resolve(response.data);
                    } else {
                      reject(response.msg);
                    }
                  }
                );
              }
            } else {
              reject(response.msg);
            }
          })
          .catch(() => {
            reject('GDB解析服务连接失败');
          });
      };
    });
  }

  importGdbLayer(layerName) {
    return new Promise((resolve, reject) => {
      if (!this.gdbFileName) {
        reject('请先导入gdb/mdb文件');
        return;
      }
      if (!layerName) {
        reject('请选择要导入的图层');
        return;
      }
      var param = {
        file: this.gdbFileName,
        layer: layerName
      };
      let config = {
        headers: {
          'Content-Type': 'application/json'
        },
        token: this.token
      };
      postFromAdmin(this.url + '/exportLayers/list', param, config)
        .then((response) => {
          response = response.headers ? response.data : response;
          if (response.code === 200) {
            let data = response.data;
            if (typeof data === 'string') {
              data = JSON.parse(data);
            }

            let features = [];
            let geometrys = [];
            let esriJSON = new EsriJSON();
            data.forEach((element) => {
              let esriJson = element.SHAPE;
              if (esriJson) {
                if (typeof esriJson === 'string') {
                  esriJson = JSON.parse(esriJson);
                }
                let dataProjection = esriJson.spatialReference
                  ? 'EPSG:' + esriJson.spatialReference.wkid
                  : this.mapProjectionCode;
                registerProj(dataProjection);
                let options = {
                  dataProjection: dataProjection,
                  featureProjection: this.mapProjectionCode
                };
                let geo = esriJSON.readGeometry(esriJson, options);
                geometrys.push(geo);
                let feature = new Feature({
                  geometry: geo
                });
                // 遍历属性信息
                for (let key in element) {
                  if (key !== 'SHAPE') {
                    feature.set(key, element[key]);
                  }
                }
                feature.setStyle(selectStyles);
                feature.set('tempSelected', true);
                feature.set('isImport', true);
                features.push(feature);
              }
            });
            // 添加所有feature到临时图层
            this.map
              .getLayerById('drawLayer')
              .getSource()
              .addFeatures(features);
            resolve(features);
            locationGeometry(this.map, geometrys);
          } else {
            reject(response.msg);
          }
        })
        .catch((e) => {
          console.warn(e);
          reject('GDB导入服务连接失败');
        });
    });
  }
}

export default GDBParser;
