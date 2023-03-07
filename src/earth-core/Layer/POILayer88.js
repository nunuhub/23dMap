/*
 * @Author: liujh
 * @Date: 2020/8/24 9:37
 * @Description:
 */
/* 88 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import Jquery from 'jquery';
import * as pointconvert from '../Tool/PointConvert25';
import { CustomFeatureGridLayer } from './CustomFeatureGridLayer31';
import * as billboard from '../Draw/EntityAttr/BillboardAttr19';
import * as point from '../Draw/EntityAttr/PointAttr29';
import * as label from '../Draw/EntityAttr/LabelAttr9';

/*class POILayer_es6 extends CustomFeatureGridLayer {
    constructor(item, layer) {
        super(item, layer)

        this._keys = null
        this._key_index = 0
    }

    getKey() {
        if (!this._keys) {
            //debugger
            this._keys = this.config.key || [ "c95467d0ed2a3755836e37dc27369f97", "4320dda936d909d73ab438b4e29cf2a2", "e64a96ed7e361cbdc0ebaeaf3818c564", "df3247b7df64434adecb876da94755d7", "d4375ec477cb0a473c448fb1f83be781", "13fdd7b2b90a9d326ae96867ebcc34ce", "c34502450ae556f42b21760faf6695a0", "57f8ebe12797a73fc5b87f5d4ef859b1" ]
        }

        let thisidx = this._key_index++ % this._keys.length
        return this._keys[thisidx]
    }

    //获取网格内的数据，calback为回调方法，参数传数据数组
    getDataForGrid(opts, calback) {
        let jwd1 = pointconvert.wgs2gcj([ opts.rectangle.xmin, opts.rectangle.ymax ]) //加偏
        let jwd2 = pointconvert.wgs2gcj([ opts.rectangle.xmax, opts.rectangle.ymin ]) //加偏
        let polygon = jwd1[0] + "," + jwd1[1] + "|" + jwd2[0] + "," + jwd2[1]

        let filter = this.config.filter || {}
        filter.output = "json"
        filter.key = this.getKey()
        filter.polygon = polygon
        if (!filter.offset) filter.offset = 25
        if (!filter.types) filter.types = "120000|130000|190000"

        let that = this
        Jquery.default.ajax({
            url: "http://restapi.amap.com/v3/place/polygon",
            type: "get",
            dataType: "json",
            timeout: "5000",
            data: filter,
            success: function success(data) {
                if (data.infocode !== "10000") {
                    console.log("POI 请求失败(" + data.infocode + ")：" + data.info)
                    return
                }
                let arrdata = data.pois
                calback(arrdata)
            },
            error: function error(data) {
                console.log("POI 请求出错(" + data.status + ")：" + data.statusText)
            }
        })
    }

    //根据数据创造entity
    createEntity(opts, attributes) {
        let inthtml = "<div>名称：" + attributes.name + "</div>" + "<div>地址：" + attributes.address + "</div>" + "<div>区域：" + attributes.pname + attributes.cityname + attributes.adname + "</div>" + "<div>类别：" + attributes.type + "</div>"

        let arrjwd = attributes.location.split(",")
        arrjwd = pointconvert.gcj2wgs(arrjwd) //纠偏
        let lnglat = this.viewer.shine.point2map({
            x: arrjwd[0],
            y: arrjwd[1]
        })

        let entityOptions = {
            name: attributes.name,
            position: Cesium.Cartesian3.fromDegrees(lnglat.x, lnglat.y, this.config.height || 3),
            popup: {
                html: inthtml,
                anchor: [ 0, -15 ]
            },
            properties: attributes
        }

        let symbol = this.config.symbol
        if (symbol) {
            let styleOpt = symbol.styleOptions
            if (symbol.styleField) {
                //存在多个symbol，按styleField进行分类
                let styleFieldVal = attr[symbol.styleField]
                let styleOptField = symbol.styleFieldOptions[styleFieldVal]
                if (styleOptField != null) {
                    styleOpt = Jquery.default.extend({}, styleOpt)
                    styleOpt = Jquery.default.extend(styleOpt, styleOptField)
                }
            }
            styleOpt = styleOpt || {}

            if (styleOpt.image) {
                entityOptions.billboard = (0, billboard.style2Entity)(styleOpt)
                entityOptions.billboard.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND
            } else {
                entityOptions.point = (0, point.style2Entity)(styleOpt)
            }

            //加上文字标签
            if (styleOpt.label) {
                entityOptions.label = (0, label.style2Entity)(styleOpt.label)
                entityOptions.label.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND
                entityOptions.label.text = attributes.name
            }
        } else {
            //无配置时的默认值
            entityOptions.point = {
                color: new Cesium.Color.fromCssColorString("#3388ff"),
                pixelSize: 10,
                outlineColor: new Cesium.Color.fromCssColorString("#ffffff"),
                outlineWidth: 2,
                heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
                scaleByDistance: new Cesium.NearFarScalar(1000, 1, 20000, 0.5)
            }
            entityOptions.label = {
                text: attributes.name,
                font: "normal small-caps normal 16px 楷体",
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.AZURE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -15), //偏移量
                heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND, //是地形上方的高度
                scaleByDistance: new Cesium.NearFarScalar(1000, 1, 5000, 0.8),
                distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 5000)
            }
        }

        let entity = this.dataSource.entities.add(entityOptions)
        return entity
    }
}*/

const POILayer = CustomFeatureGridLayer.extend({
  //查询POI服务
  _keys: null,
  _key_index: 0,
  getKey: function getKey() {
    if (!this._keys) {
      //debugger
      this._keys = this.config.key || [
        'c95467d0ed2a3755836e37dc27369f97',
        '4320dda936d909d73ab438b4e29cf2a2',
        'e64a96ed7e361cbdc0ebaeaf3818c564',
        'df3247b7df64434adecb876da94755d7',
        'd4375ec477cb0a473c448fb1f83be781',
        '13fdd7b2b90a9d326ae96867ebcc34ce',
        'c34502450ae556f42b21760faf6695a0',
        '57f8ebe12797a73fc5b87f5d4ef859b1'
      ];
    }

    let thisidx = this._key_index++ % this._keys.length;
    return this._keys[thisidx];
  },

  //获取网格内的数据，calback为回调方法，参数传数据数组
  getDataForGrid: function getDataForGrid(opts, calback) {
    let jwd1 = pointconvert.wgs2gcj([opts.rectangle.xmin, opts.rectangle.ymax]); //加偏
    let jwd2 = pointconvert.wgs2gcj([opts.rectangle.xmax, opts.rectangle.ymin]); //加偏
    let polygon = jwd1[0] + ',' + jwd1[1] + '|' + jwd2[0] + ',' + jwd2[1];

    let filter = this.config.filter || {};
    filter.output = 'json';
    filter.key = this.getKey();
    filter.polygon = polygon;
    if (!filter.offset) filter.offset = 25;
    if (!filter.types) filter.types = '120000|130000|190000';

    Jquery.default.ajax({
      url: 'http://restapi.amap.com/v3/place/polygon',
      type: 'get',
      dataType: 'json',
      timeout: '5000',
      data: filter,
      success: function success(data) {
        if (data.infocode !== '10000') {
          console.error('POI 请求失败(' + data.infocode + ')：' + data.info);
          return;
        }
        let arrdata = data.pois;
        calback(arrdata);
      },
      error: function error(data) {
        console.error('POI 请求出错(' + data.status + ')：' + data.statusText);
      }
    });
  },
  //根据数据创造entity
  createEntity: function createEntity(opts, attributes) {
    let inthtml =
      '<div>名称：' +
      attributes.name +
      '</div>' +
      '<div>地址：' +
      attributes.address +
      '</div>' +
      '<div>区域：' +
      attributes.pname +
      attributes.cityname +
      attributes.adname +
      '</div>' +
      '<div>类别：' +
      attributes.type +
      '</div>';

    let arrjwd = attributes.location.split(',');
    arrjwd = pointconvert.gcj2wgs(arrjwd); //纠偏
    let lnglat = this.viewer.shine.point2map({
      x: arrjwd[0],
      y: arrjwd[1]
    });

    let entityOptions = {
      name: attributes.name,
      position: Cesium.Cartesian3.fromDegrees(
        lnglat.x,
        lnglat.y,
        this.config.height || 3
      ),
      popup: {
        html: inthtml,
        anchor: [0, -15]
      },
      properties: attributes
    };

    let symbol = this.config.symbol;
    if (symbol) {
      let styleOpt = symbol.styleOptions;
      if (symbol.styleField) {
        //存在多个symbol，按styleField进行分类
        let styleFieldVal = attributes[symbol.styleField];
        let styleOptField = symbol.styleFieldOptions[styleFieldVal];
        if (styleOptField != null) {
          styleOpt = Jquery.default.extend({}, styleOpt);
          styleOpt = Jquery.default.extend(styleOpt, styleOptField);
        }
      }
      styleOpt = styleOpt || {};

      if (styleOpt.image) {
        entityOptions.billboard = (0, billboard.style2Entity)(styleOpt);
        entityOptions.billboard.heightReference =
          Cesium.HeightReference.RELATIVE_TO_GROUND;
      } else {
        entityOptions.point = (0, point.style2Entity)(styleOpt);
      }

      //加上文字标签
      if (styleOpt.label) {
        entityOptions.label = (0, label.style2Entity)(styleOpt.label);
        entityOptions.label.heightReference =
          Cesium.HeightReference.RELATIVE_TO_GROUND;
        entityOptions.label.text = attributes.name;
      }
    } else {
      //无配置时的默认值
      entityOptions.point = {
        color: new Cesium.Color.fromCssColorString('#3388ff'),
        pixelSize: 10,
        outlineColor: new Cesium.Color.fromCssColorString('#ffffff'),
        outlineWidth: 2,
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        scaleByDistance: new Cesium.NearFarScalar(1000, 1, 20000, 0.5)
      };
      entityOptions.label = {
        text: attributes.name,
        font: 'normal small-caps normal 16px 楷体',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: Cesium.Color.AZURE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -15), //偏移量
        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND, //是地形上方的高度
        scaleByDistance: new Cesium.NearFarScalar(1000, 1, 5000, 0.8),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 5000)
      };
    }

    let entity = this.dataSource.entities.add(entityOptions);
    return entity;
  }
});
export { POILayer };
