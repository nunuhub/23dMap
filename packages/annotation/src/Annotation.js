import axios from 'axios';
import { Message } from 'element-ui';
import * as Cesium from 'cesium_shinegis_earth';
import {
  getCurrentMousePosition,
  formatPosition
} from 'shinegis-client-23d/src/earth-core/Tool/Point2';
import { getuuid } from 'shinegis-client-23d/src/map-core/olPlot/Utils/utils';

class Annotation {
  constructor(opts) {
    this.annotationData = [];
    this.baseUrl = opts.baseUrl;
    this.style = {};
    this.schemeId = opts.schemeId;
    this.userId = opts.userId;
    this.handler = null;
    this.viewer = opts.viewer;
    this.fields = [
      { alias: 'id', name: 'id', length: 64, type: 'varchar' },
      { alias: '名称', name: 'title_txt', length: 255, type: 'varchar' },
      { alias: '备注', name: 'content_txt', length: 255, type: 'varchar' },
      { alias: '图层类型', name: 'layerType', length: 64, type: 'varchar' },
      { alias: '图层id', name: 'layerID', length: 64, type: 'varchar' },
      { alias: '样式', name: 'theme', length: 2550, type: 'varchar' },
      { alias: '坐标', name: 'position', length: 64, type: 'varchar' },
      { alias: '模型地址', name: 'modelurl', length: 255, type: 'varchar' },
      { alias: '辅助线高度', name: 'z2', length: 64, type: 'varchar' }
    ];
  }
  get(url, params) {
    return new Promise((resolve, reject) => {
      axios
        .get(this.baseUrl + url, {
          params
        })
        .then((res) => {
          resolve(res.data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
  post(url, params) {
    return new Promise((resolve, reject) => {
      axios
        .post(this.baseUrl + url, JSON.stringify(params))
        .then(
          (res) => {
            if (res.data.code === '0000') {
              resolve(res.data);
            } else {
              Message({
                message: res.data.message,
                type: 'error'
              });
              reject(res.data.message);
            }
          },
          (error) => {
            Message({
              message: error.message,
              type: 'error'
            });
            reject(error.message);
          }
        )
        .catch((err) => {
          reject(err);
        });
    });
  }

  generateAnnoLayer(config) {
    //1.创建图层信息
    let opts = {
      name: config.layerName || '未命名图层',
      type: config.layerType,
      styleOptions: config.styleOptions
    };
    this.saveLayers(opts, true);
    //2.构建注记数据
    if (config.serviceUrl) {
      this.get(config.serviceUrl).then((res) => {
        if (res.data) {
          if (
            res.data.geometryType &&
            res.data.geometryType === 'esriGeometryPoint'
          ) {
            res.data.features.forEach((f) => {
              let marker = {
                title_txt: config.icon,
                content_txt: f.attributes[config.showField],
                theme: config.theme,
                position: {
                  x: f.attributes.geometry.x,
                  y: f.attributes.geometry.y,
                  z: config.z
                }
              };
              this.saveMarker(marker, true);
            });
          } else if (
            res.data.features &&
            res.data.features[0].geometry.type === 'Point'
          ) {
            //todo
          } else if (
            res.data.features &&
            res.data.features[0].geometry.type === 'Polygon'
          ) {
            //todo
          }
        }
      });
    }
  }
  /**
   * search data by layer,used to be show the current annotation
   * @param layer maybe layer id can be the unique primary key to get data
   * @return dataList {Array}  */
  getAnnoDatafromLayer() {
    //this.getData(this.url, layerid);
  }

  // 图层列表
  refreshLayers(opts) {
    let data = Object.assign(opts, {
      userId: this.userId,
      schemaId: this.schemeId
    });
    return this.get('/note-toc/noteTocList', data);
  }
  // 删除图层
  removeAnnotationLayer(layerID) {
    return this.post('/note-toc/deleteNodeToc/' + layerID);
  }
  // 新增/更新图层
  saveLayers(opts, status) {
    let data = {
      layerName: opts.layerName,
      layerType: opts.layerType,
      isShow: opts.isShow ? 1 : 0,
      grid: 0,
      fields: JSON.stringify(this.fields),
      geometryType: 'pointz',
      srid: 4490,
      schemaId: this.schemeId,
      userId: this.userId,
      styleOptions: JSON.stringify(opts.styleOptions)
    };
    if (status) {
      return this.post('/note-toc/saveNoteToc', data);
    } else {
      data.layerID = opts.layerID;
      return this.post('/note-toc/updateNodeToc', data);
    }
  }
  // 图层信息
  getLayerInfo(layerID) {
    return this.get('/note-toc/noteTocDetailsById/' + layerID);
  }
  // 注记列表
  getMarkerList(opts) {
    let data = Object.assign(opts, {
      fields: opts.fields || this.fields.map((item) => item.name)
    });
    return this.post(
      '/note-toc/noteTocDataById?' +
        'size=' +
        data.size +
        '&current=' +
        data.current +
        '&noteTocId=' +
        data.noteTocId,
      data.fields
    );
  }
  // 新增/更新注记
  saveMarker(opts, status) {
    let point = JSON.parse(JSON.stringify(opts.position));
    let obj = Object.assign(opts, {
      id: opts.id || getuuid(),
      theme: JSON.stringify(opts.theme),
      position: JSON.stringify(opts.position)
    });
    let data = [];
    for (let i = 0; i < this.fields.length; i++) {
      let fieldObj = {};
      fieldObj.name = this.fields[i].name;
      fieldObj.type = this.fields[i].type;
      fieldObj.data = obj[this.fields[i].name];
      data.push(fieldObj);
    }
    data.push({
      name: 'geom',
      type: 'geom',
      data: 'POINT(' + point.x + ' ' + point.y + ' ' + point.z + ')'
    });
    let markData = {
      data: data,
      noteTocId: opts.layerID,
      srid: 4490,
      noteGeo: 'POINT(' + point.x + ' ' + point.y + ' ' + point.z + ')'
    };
    if (status) {
      return this.post('/note-toc/insertNoteData', markData);
    } else {
      let updateData = {
        ...markData,
        where: 'id=' + "'" + opts.id + "'"
      };
      return this.post('/note-toc/updateNoteData', updateData);
    }
  }
  // 删除注记
  deleteMarker(opts, noteTocId) {
    let point = JSON.parse(JSON.stringify(opts.position));
    let data = [];
    let obj = { ...opts };
    obj.theme = JSON.stringify(obj.theme);
    obj.position = JSON.stringify(obj.position);
    for (let i = 0; i < this.fields.length; i++) {
      let fieldObj = {};
      fieldObj.name = this.fields[i].name;
      fieldObj.type = this.fields[i].type;
      fieldObj.data = obj[this.fields[i].name];
      data.push(fieldObj);
    }
    data.push({
      name: 'geom',
      type: 'varchar',
      data: 'POINT(' + point.x + ' ' + point.y + ' ' + point.z + ')'
    });
    let delData = {
      data: data,
      noteTocId: noteTocId,
      where: 'id=' + "'" + opts.id + "'"
    };
    return this.post('/note-toc/deleteNoteData', delData);
  }
  // 激活鼠标地图选择
  activeMouse(getCurrentPosition) {
    let that = this;
    this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.handler.setInputAction(function (movement) {
      var cartesian = getCurrentMousePosition(
        that.viewer.scene,
        movement.position
      );
      if (cartesian) {
        let point = formatPosition(cartesian);
        getCurrentPosition(point);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }
  // 释放鼠标地图选择
  disableMouse() {
    this.handler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    this.handler.destroy();
  }
  image2base64(img) {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    var ext = img.src.substring(img.src.lastIndexOf('.') + 1).toLowerCase();
    var dataURL = canvas.toDataURL('image/' + ext);
    return dataURL;
  }
  // 检查JSON.parse是否可用
  isJSON(str) {
    if (!str) return false;
    if (typeof str === 'string') {
      try {
        var obj = JSON.parse(str);
        if (typeof obj === 'object' && obj) {
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
  }
}
export default Annotation;
