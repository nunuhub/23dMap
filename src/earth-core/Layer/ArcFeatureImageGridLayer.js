/*
 * @Author: liujh
 * @Date: 2020/9/29 10:26
 * @Description:
 */
/* 107 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
//import * as leaflet from '../ThirdParty/LeafLet20';
//import * as esriLeaflet from '../ThirdParty/EsriLeafLet32';
import { CustomFeatureImageGridLayer } from './CustomFeatureImageGridLayer';

const ArcFeatureImageGridLayer = CustomFeatureImageGridLayer.extend({
  /*   //获取网格内的数据，calback为回调方法，参数传数据数组
  getDataForGrid: function getDataForGrid(opts, calback) {
    let that = this;
    if (!that._visible || !that._cacheGrid[opts.key]) {
      return; //异步请求结束时,如果已经卸载了网格就直接跳出。
    }
  }, */
  //根据数据创造entity
  createEntity: function createEntity(opts, item, calback) {
    let that = this;

    //临时demo原型请求，后续优化
    const url =
      this.config.url +
      '/export?' +
      'bbox=' +
      opts.rectangle.xmin +
      ',' +
      opts.rectangle.ymin +
      ',' +
      opts.rectangle.xmax +
      ',' +
      opts.rectangle.ymax +
      ',' +
      '&bboxSR=4326&layers=show:0&transparent=true&format=png32&size=512,512&imageSR=4326&f=image';
    const material = new Cesium.ImageMaterialProperty({
      image: url,
      repeat: Cesium.Cartesian2(1.0, 1.0), // 不重复
      transparent: true, // 启用png透明
      color: Cesium.Color.WHITE.withAlpha(that.config.opacity)
    });

    let entityGraphics = new Cesium.RectangleGraphics({
      //name: that.config.id + '_' + opts.key,
      coordinates: Cesium.Rectangle.fromDegrees(
        opts.rectangle.xmin,
        opts.rectangle.ymin,
        opts.rectangle.xmax,
        opts.rectangle.ymax
      ),
      material: material
    });

    let entity = this.dataSource.entities.add({
      rectangle: entityGraphics,
      name: that.config.id + '_' + opts.key
    });

    calback(entity);

    return null;
  },
  //根据数据创造entity
  createPrimitive: function createPrimitive(opts, item, calback) {
    let that = this;

    //临时demo原型请求，后续优化
    const url =
      this.config.url +
      '/export?' +
      'bbox=' +
      opts.rectangle.xmin +
      ',' +
      opts.rectangle.ymin +
      ',' +
      opts.rectangle.xmax +
      ',' +
      opts.rectangle.ymax +
      ',' +
      '&bboxSR=4326&layers=show:' +
      that.config.visibleLayers.join(',') +
      '&transparent=true&format=png32&size=256,256&imageSR=4326&f=image';

    let primitiveGeometry = new Cesium.RectangleGeometry({
      rectangle: Cesium.Rectangle.fromDegrees(
        opts.rectangle.xmin,
        opts.rectangle.ymin,
        opts.rectangle.xmax,
        opts.rectangle.ymax
      ),
      vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
    });

    const geometry = new Cesium.GeometryInstance({
      geometry: primitiveGeometry
    });

    const primitive = new Cesium.GroundPrimitive({
      id: that.config.id + '_' + opts.key,
      geometryInstances: geometry,
      appearance: new Cesium.EllipsoidSurfaceAppearance({
        translucent: true,
        material: new Cesium.Material({
          fabric: {
            type: 'Image',
            uniforms: {
              image: url,
              color: Cesium.Color.WHITE.withAlpha(that.config.opacity)
            }
          }
        })
      }),
      asynchronous: false, // 确定图元是异步创建还是阻塞直到准备就绪
      compressVertices: false, // 启用顶点压缩
      releaseGeometryInstances: false,
      allowPicking: false,
      imageReady: true,
      classificationType: Cesium.ClassificationType.BOTH
    });
    /* primitive.appearance.material._textures = new Texture({
      context: this.viewer.scene.frameState.context,
      source: {
        width: 1,
        height: 1,
        arrayBufferView: new Uint8Array([255, 255, 255, 0])
      },
      flipY: false
    }); */

    this.primitives.add(primitive).readyPromise.then((primitive) => {
      calback(primitive);
    });
    //return null;
  },
  //更新entity，并添加到地图上
  _addEntity: function _addEntity(entity, calback) {
    //样式
    // let symbol = this.config.symbol;
    // if (symbol) {
    //   if (typeof symbol === 'function') {
    //     symbol(entity, entity.properties); //回调方法
    //   } else if (symbol === 'default') {
    //     this.setDefSymbol(entity);
    //   } else {
    //     this.setConfigSymbol(entity, symbol);
    //   }
    // }
    //鼠标事件

    this.bindMourseEvnet(entity);

    //if (!this.dataSource.entities.contains(entity))
    // if (!this.dataSource.entities.getById(entity._id))
    //   this.dataSource.entities.add({
    //     rectangle: entity,
    //     name: this.config.id + '_' + opts.key
    //   });

    calback(entity);
  },
  setWhere: function setWhere(where) {
    this.config.where = where;
    this.reload();
  }
});
export { ArcFeatureImageGridLayer };
