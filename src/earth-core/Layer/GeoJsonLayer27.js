/*
 * @Author: liujh
 * @Date: 2020/8/24 9:38
 * @Description:
 */
/* 27 */
/***/
import * as Cesium from 'cesium_shinegis_earth';
import Jquery from 'jquery';
import * as util from '../Tool/Util1';
import * as point from '../Tool/Point2';
import { BaseLayer } from './BaseLayer10';
import * as BillBoard from '../Draw/EntityAttr/BillboardAttr19';
import * as Label from '../Draw/EntityAttr/LabelAttr9';
import * as Model from '../Draw/EntityAttr/ModelAttr24';
import * as PolyLine from '../Draw/EntityAttr/PolylineAttr15';
import * as PolyGon from '../Draw/EntityAttr/PolygonAttr14';

const GeoJsonLayer = BaseLayer.extend({
  dataSource: null,
  //添加
  add: function add() {
    if (!this.config.reload && this.dataSource) {
      //this.config.reload可以外部控制每次都重新请求数据
      this.viewer.dataSources.add(this.dataSource);
    } else {
      this.queryData();
    }
  },
  //移除
  remove: function remove() {
    this.viewer.dataSources.remove(this.dataSource);
  },
  //定位至数据区域
  centerAt: function centerAt(duration) {
    if (this.config.extent || this.config.center) {
      this.viewer.shine.centerAt(this.config.extent || this.config.center, {
        duration: duration,
        isWgs84: true
      });
    } else {
      if (this.dataSource == null) return;
      //this.viewer.zoomTo(this.dataSource.entities.values)
      this.viewer.flyTo(this.dataSource.entities.values, {
        duration: duration || this.config.duration
      });
    }
  },

  queryData: function queryData() {
    let that = this;

    let config = util.getProxyUrl(this.config);
    if (config.symbol && config.symbol.styleOptions) {
      let style = config.symbol.styleOptions;
      if (Cesium.defined(style.clampToGround)) {
        config.clampToGround = style.clampToGround;
      }
      if (Cesium.defined(style.color)) {
        let color = new Cesium.Color.fromCssColorString(
          Cesium.defaultValue(style.color, '#FFFF00')
        ).withAlpha(Number(Cesium.defaultValue(style.opacity, 0.5)));
        config.fill = color;
      }
      if (Cesium.defined(style.outlineColor)) {
        let outlineColor = new Cesium.Color.fromCssColorString(
          style.outlineColor || '#FFFFFF'
        ).withAlpha(
          Cesium.defaultValue(
            style.outlineOpacity,
            Cesium.defaultValue(style.opacity, 1.0)
          )
        );
        config.stroke = outlineColor;
      }
      if (Cesium.defined(style.outlineWidth)) {
        config.strokeWidth = style.outlineWidth;
      }
    }

    let dataSource = new Cesium.GeoJsonDataSource();
    // dataSource.layerID = c onfig.id;
    let loadPromise = dataSource.load(config.url, config);
    loadPromise
      .then(function (dataSource) {
        dataSource.entities.owner.name = config.id;
        that.showResult(dataSource);
      })
      .catch(function (error) {
        that.showError('服务出错', error);
      });
  },
  showResult: function showResult(dataSource) {
    if (this.dataSource) {
      this.viewer.dataSources.remove(this.dataSource);
    }
    this.dataSource = dataSource;
    this.viewer.dataSources.add(dataSource);

    if (this.config.flyTo) this.centerAt();

    //===========设置样式=============
    let entities = dataSource.entities.values;
    for (let i = 0, len = entities.length; i < len; i++) {
      let entity = entities[i];

      //样式
      if (this.config.symbol) {
        if (this.config.symbol === 'default') this.setDefSymbol(entity);
        else this.setConfigSymbol(entity, this.config.symbol);
      }
      this.bindMourseEvnet(entity);
    }

    if (this._opacity !== 1) this.setOpacity(this._opacity);
  },

  //设置透明度
  hasOpacity: true,
  _opacity: 1,
  setOpacity: function setOpacity(value) {
    this._opacity = value;
    if (this.dataSource == null) return;

    let entities = this.dataSource.entities.values;

    for (let i = 0, len = entities.length; i < len; i++) {
      let entity = entities[i];

      if (
        entity.polygon &&
        entity.polygon.material &&
        entity.polygon.material.color
      ) {
        this._updatEntityAlpha(entity.polygon.material.color, this._opacity);
        if (entity.polygon.outlineColor) {
          this._updatEntityAlpha(entity.polygon.outlineColor, this._opacity);
        }
      }

      if (
        entity.polyline &&
        entity.polyline.material &&
        entity.polyline.material.color
      ) {
        this._updatEntityAlpha(entity.polyline.material.color, this._opacity);
      }

      if (entity.billboard) {
        entity.billboard.color = new Cesium.Color.fromCssColorString(
          '#FFFFFF'
        ).withAlpha(this._opacity);
      }

      if (entity.model) {
        entity.model.color = new Cesium.Color.fromCssColorString(
          '#FFFFFF'
        ).withAlpha(this._opacity);
      }

      if (entity.label) {
        let _opacity = this._opacity;
        if (
          entity.attribute &&
          entity.attribute.label &&
          entity.attribute.label.opacity
        )
          _opacity = entity.attribute.label.opacity;

        if (entity.label.fillColor)
          this._updatEntityAlpha(entity.label.fillColor, _opacity);
        if (entity.label.outlineColor)
          this._updatEntityAlpha(entity.label.outlineColor, _opacity);
        if (entity.label.backgroundColor)
          this._updatEntityAlpha(entity.label.backgroundColor, _opacity);
      }
    }
  },
  _updatEntityAlpha: function _updatEntityAlpha(color, opacity) {
    if (!color) return;
    let newclr = color.getValue(this.viewer.clock.currentTime);
    if (!newclr || !newclr.withAlpha) return color;

    newclr = newclr.withAlpha(opacity);
    color.setValue(newclr);
  },

  //鼠标事件，popup tooltip
  bindMourseEvnet: function bindMourseEvnet(entity) {
    let that = this;

    //popup弹窗

    if (this.config.columns || this.config.popup) {
      entity.popup = {
        html: function html(entity) {
          let attr = that.getEntityAttr(entity);
          if (util.isString(attr)) return attr;
          else return util.getPopupForConfig(that.config, attr);
        },
        anchor: this.config.popupAnchor || [0, -15]
      };
    }
    if (this.config.tooltip) {
      entity.tooltip = {
        html: function html(entity) {
          let attr = that.getEntityAttr(entity);
          if (util.isString(attr)) return attr;
          else
            return util.getPopupForConfig(
              {
                popup: that.config.tooltip
              },
              attr
            );
        },
        anchor: this.config.tooltipAnchor || [0, -15]
      };
    }
    if (this.config.click) {
      entity.click = this.config.click;
    }

    if (this.config.mouseover) {
      entity.mouseover = this.config.mouseover;
    }
    if (this.config.mouseout) {
      entity.mouseout = this.config.mouseout;
    }
  },

  //获取属性
  getEntityAttr: function getEntityAttr(entity) {
    return util.getAttrVal(entity.properties);
  },
  //默认symbol
  colorHash: {},
  setDefSymbol: function setDefSymbol(entity) {
    let attr = this.getEntityAttr(entity) || {};
    if (entity.polygon) {
      let name = attr.id || attr.OBJECTID || 0;
      let color = this.colorHash[name];
      if (!color) {
        color = Cesium.Color.fromRandom({
          minimumGreen: 0.75,
          maximumBlue: 0.75,
          alpha: this._opacity
        });
        this.colorHash[name] = color;
      }
      entity.polygon.material = color;
      entity.polygon.outline = true;
      entity.polygon.outlineColor = Cesium.Color.WHITE;
    } else if (entity.polyline) {
      let name = attr.id || attr.OBJECTID || 0;
      let color = this.colorHash[name];
      if (!color) {
        color = Cesium.Color.fromRandom({
          minimumGreen: 0.75,
          maximumBlue: 0.75,
          alpha: this._opacity
        });
        this.colorHash[name] = color;
      }
      entity.polyline.material = color;
      entity.polyline.width = 2;
    } else if (entity.billboard) {
      entity.billboard.scale = 0.5;
      entity.billboard.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
      entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
    }
  },
  //外部配置的symbol
  setConfigSymbol: function setConfigSymbol(entity, symbol) {
    let attr = this.getEntityAttr(entity) || {};
    let styleOpt = symbol.styleOptions;

    if (symbol.styleField) {
      //存在多个symbol，按styleField进行分类
      let styleFieldVal = attr[symbol.styleField];
      let styleOptField = symbol.styleFieldOptions[styleFieldVal];
      if (styleOptField != null) {
        styleOpt = util.clone(styleOpt);
        styleOpt = Jquery.default.extend(styleOpt, styleOptField);
      }
    }

    //外部使用代码示例
    // let layerWork = viewer.shine.getLayer(301087, "id")
    // layerWork.config.symbol.calback = function (attr, entity) {
    //     let val = Number(attr["floor"]._value)
    //     if (val < 10)
    //         return { color: "#ff0000" }
    //     else
    //         return { color: "#0000ff" }
    // }
    if (typeof symbol.calback === 'function') {
      //回调方法
      let styleOptField = symbol.calback(attr, entity, symbol);
      if (!styleOptField) return;

      styleOpt = util.clone(styleOpt);
      styleOpt = Jquery.default.extend(styleOpt, styleOptField);
    }

    styleOpt = styleOpt || {};

    // this._opacity = styleOpt.opacity || 1 //透明度

    if (entity.polyline) {
      (0, PolyLine.style2Entity)(styleOpt, entity.polyline);

      //线时，加上文字标签
      if (styleOpt.label && styleOpt.label.field) {
        styleOpt.label.heightReference = Cesium.defaultValue(
          styleOpt.label.heightReference,
          Cesium.HeightReference.CLAMP_TO_GROUND
        );

        let labelattr = Label.style2Entity(styleOpt.label);
        labelattr.text = attr[styleOpt.label.field] || labelattr.text || '';

        let pots = PolyLine.getPositions(entity);
        let position = pots[Math.floor(pots.length / 2)];
        if (styleOpt.label.position) {
          if (styleOpt.label.position === 'center') {
            position = point.centerOfMass(pots);
          } else if (util.isNumber(styleOpt.label.position)) {
            position = pots[styleOpt.label.position];
          }
        }

        let lblEx = this.dataSource.entities.add({
          position: position,
          label: labelattr,
          properties: attr
        });
        this.bindMourseEvnet(lblEx);
      }
    }
    if (entity.polygon) {
      (0, PolyGon.style2Entity)(styleOpt, entity.polygon);

      //加上线宽
      if (styleOpt.outlineWidth && styleOpt.outlineWidth > 1) {
        entity.polygon.outline = false;
        let newopt = {
          color: styleOpt.outlineColor,
          width: styleOpt.outlineWidth,
          opacity: styleOpt.outlineOpacity,
          lineType: styleOpt.lineType ? styleOpt.lineType : 'solid',
          clampToGround: styleOpt.clampToGround,
          outline: styleOpt.outline ? styleOpt.outline : false
        };
        let polyline = PolyLine.style2Entity(newopt);
        polyline.positions = PolyGon.getPositions(entity);
        let lineEx = this.dataSource.entities.add({
          polyline: polyline,
          properties: attr
        });
        this.bindMourseEvnet(lineEx);
      } else if (styleOpt.outlineWidth && styleOpt.outlineWidth == 1) {
        entity.polygon.outline = true;
        let newopt = {
          color: styleOpt.outlineColor,
          width: 1,
          opacity: styleOpt.outlineOpacity,
          lineType: styleOpt.lineType ? styleOpt.lineType : 'solid',
          clampToGround: styleOpt.clampToGround
        };
        let polyline = PolyLine.style2Entity(newopt);
        polyline.positions = PolyGon.getPositions(entity);
        let lineEx = this.dataSource.entities.add({
          polyline: polyline,
          properties: attr
        });
        this.bindMourseEvnet(lineEx);
      }

      //面时，加上文字标签
      if (styleOpt.label && styleOpt.label.field) {
        styleOpt.label.heightReference = Cesium.defaultValue(
          styleOpt.label.heightReference,
          Cesium.HeightReference.CLAMP_TO_GROUND
        );

        let labelattr = Label.style2Entity(styleOpt.label);
        labelattr.text = attr[styleOpt.label.field] || labelattr.text || '';
        let labelHeight = styleOpt.extrudedHeight
          ? styleOpt.extrudedHeight
          : null;
        let lblEx = this.dataSource.entities.add({
          position: point.centerOfMass(
            PolyGon.getPositions(entity),
            labelHeight
          ),
          label: labelattr,
          properties: attr
        });
        this.bindMourseEvnet(lblEx);
      }

      //是建筑物时
      //是建筑物（体块）时
      if (symbol.volumeStyle) {
        let floor = Number(attr[symbol.volumeStyle.cloumn] || 1); //层数

        let height = 3.5; //层高
        let heightCfg = symbol.volumeStyle.height;
        if (util.isNumber(heightCfg)) {
          height = heightCfg;
        } else if (util.isString(heightCfg)) {
          height = attr[heightCfg] || height;
        }

        entity.polygon.extrudedHeight = floor * height;
      }
      //纪舒敏 begin 是控规数据时,jzheight建筑高度字段
      if (styleOpt.jzheight) {
        let jzheight = attr[styleOpt.jzheight]; //建筑高
        if (jzheight) {
          if (jzheight._value !== 0) {
            entity.polygon.extrudedHeight = jzheight;
            entity.polygon.heightReference =
              Cesium.HeightReference.CLAMP_TO_GROUND;
          }
        }
      }
      //控规图层根据config配置的colorty为用地类型字段名，

      if (styleOpt.colorty && window.color_type) {
        let o;
        if (this._opacity) o = this._opacity;
        else o = 1;
        let colorty = styleOpt.colorty;
        let proID = attr[styleOpt.proID];
        let color = window.color_type[colorty].color[proID];
        if (!color) {
          entity.polygon.material = new Cesium.Color(1, 1, 1, o);
        } else {
          let r, g, b;
          r = color[0] / 255;
          g = color[1] / 255;
          b = color[2] / 255; //.toFixed(3)
          entity.polygon.material = new Cesium.Color(r, g, b, o);
        }
      }
      //end
    }

    //entity本身存在文字标签
    if (entity.label) {
      styleOpt.label = styleOpt.label || styleOpt || {};
      styleOpt.label.heightReference = Cesium.defaultValue(
        styleOpt.label.heightReference,
        Cesium.HeightReference.CLAMP_TO_GROUND
      );

      Label.style2Entity(styleOpt.label, entity.label);
      if (styleOpt.label.field)
        entity.label.text =
          attr[styleOpt.label.field] || entity.label.text || '';
    }

    if (entity.billboard) {
      styleOpt.heightReference = Cesium.defaultValue(
        styleOpt.heightReference,
        Cesium.HeightReference.CLAMP_TO_GROUND
      );
      BillBoard.style2Entity(styleOpt, entity.billboard);

      //图标时，加上文字标签 (entity本身不存在label时)
      if (styleOpt.label && styleOpt.label.field && !entity.label) {
        styleOpt.label.heightReference = Cesium.defaultValue(
          styleOpt.label.heightReference,
          Cesium.HeightReference.CLAMP_TO_GROUND
        );

        let labelattr = Label.style2Entity(styleOpt.label);
        labelattr.text = attr[styleOpt.label.field] || labelattr.text || '';

        let lblEx = this.dataSource.entities.add({
          position: entity.position,
          label: labelattr,
          properties: attr
        });
        this.bindMourseEvnet(lblEx);
      }

      //支持小模型
      if (styleOpt.model) {
        styleOpt.model.heightReference = Cesium.defaultValue(
          styleOpt.model.heightReference,
          Cesium.HeightReference.CLAMP_TO_GROUND
        );

        let modelattr = Model.style2Entity(styleOpt.model);

        let lblEx = this.dataSource.entities.add({
          position: entity.position,
          model: modelattr,
          properties: attr
        });
        this.bindMourseEvnet(lblEx);
      }
    }

    entity.attribute = styleOpt;
  }
});
export { GeoJsonLayer };
