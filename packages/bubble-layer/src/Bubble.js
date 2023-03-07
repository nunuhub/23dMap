import GeoJSON from 'ol/format/GeoJSON';
import $ from 'jquery';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import ImageWMS from 'ol/source/ImageWMS';
import { Image as ImageLayer } from 'ol/layer';
import TileLayer from 'ol/layer/Tile';
import { transform, getTransform } from 'ol/proj';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import Stroke from 'ol/style/Stroke';
import Overlay from 'ol/Overlay';
import Fill from 'ol/style/Fill';
import EsriJSON from 'ol/format/EsriJSON';
import TileArcGISRest from 'ol/source/TileArcGISRest';
import { getArea } from 'ol/extent.js';
import { unByKey } from 'ol/Observable';
import Feature from 'ol/Feature';
import Polygon from 'ol/geom/Polygon';
import MultiPolygon from 'ol/geom/MultiPolygon';
import greenBubbleImg from './images/greenBubble.png';
import yellowBubbleImg from './images/yellowBubble.png';

export default class Bubble {
  constructor(map, callback) {
    this.name = 'Bubble';
    this.map = map;
    this.callback = callback; // 缩放回调函数
    this.setAnimation(); // 自定义浮动动画规则
    this.currentWkid = this.map.getView().getProjection().getCode();
    this.geoJSON = new GeoJSON();
    this.esrijsonFormat = new EsriJSON();
    this.imgList = [
      greenBubbleImg,
      yellowBubbleImg,
      greenBubbleImg,
      yellowBubbleImg
    ];
    this.isFirst = true;
    this.mapId = this.map.getTarget().id; // 地图dom节点的id
  }

  // 初始化气泡图
  initBubble(options) {
    this.options = options;
    // xzq关键字段(大小写)
    this.xzqdm_field = this.options.xzqdm_field;
    this.xzqmc_field = this.options.xzqmc_field;
    this.xzqFill =
      options && options.fillColor
        ? options.fillColor
        : 'rgba(5, 121, 138, 0.4)';
    this.xzqBorder =
      options && options.borderColor
        ? options.borderColor
        : 'rgba(5, 121, 138, 0.8)';
    // 清除已经存在的气泡
    this.clear();
    let getNewPointArr = null;
    let isArray = this.options.center && Array.isArray(this.options.center);
    if (isArray) {
      getNewPointArr = transform(
        this.options.center,
        this.options.centerWkid,
        this.currentWkid
      );
    } else {
      let centerX = parseFloat(this.options.center.split(',')[0]);
      let centerY = parseFloat(this.options.center.split(',')[1]);
      getNewPointArr = transform(
        [centerX, centerY],
        this.options.centerWkid,
        this.currentWkid
      );
    }

    if (this.isFirst) {
      setTimeout(() => {
        this.map.getView().setCenter(getNewPointArr);
        // eslint-disable-next-line radix
        this.map.getView().setZoom(parseInt(this.options.zoomLevel));
      }, 500);
      this.isFirst = false;
    }
    // $(".ol-overlaycontainer").empty()
    // //移除专题图可能加载过的行政区图层,后面重新加载
    // this.clearXZQ()
    // 计算半径大小比例系数
    this.calculation_R_Size_K();
    this.loadXZQ(); // 初始化行政区
    this.createLegend(); // 图例
    this.map.render();
  }

  // 加载行政区
  loadXZQ() {
    let layerType = this.options.layerType;
    if (this.options.isGeojson) {
      this.createFeature(this.options.geojson);
    } else if (layerType === 'geoserver-wfs') {
      this.loadGeoserverWFS();
    } else if (layerType === 'geoserver-wms') {
      this.loadGeoserverWMS();
    } else if (layerType === 'dynamic') {
      this._Ajax(
        this.options.layerUrl,
        {
          f: 'json'
        },
        (response) => {
          let layers = response.layers;
          // let layersNum = this.options.layersNum
          for (let i = 0; i < layers.length; i++) {
            const initLayer = layers[i].id;
            this.loadArcgisVector(initLayer);
          }
        }
      );
    } else if (layerType === 'tiled') {
      this.loadArcgisTile();
    }
  }

  // 结合提供的geojson数据创建行政区的feature
  createFeature(geojson) {
    let features = [];
    let featuresData = geojson.features;
    let dataWkid = geojson.wkid + '';
    if (dataWkid.indexOf('EPSG:') === -1) {
      dataWkid = 'EPSG:' + dataWkid;
    }
    for (let i = 0; i < featuresData.length; i++) {
      const geometry = featuresData[i].geometry;
      const properties = featuresData[i].properties;
      let type = geometry.type;
      let polygon;
      if (type.toLowerCase() === 'polygon') {
        polygon = new Polygon(geometry.coordinates);
      } else if (type.toLowerCase() === 'multipolygon') {
        polygon = new MultiPolygon(geometry.coordinates);
      } else {
        console.error('不支持polygon/multiPolygon以外的数据');
        return;
      }
      polygon.applyTransform(getTransform(dataWkid, this.currentWkid));
      let obj = {
        geometry: polygon
      };
      for (const key in properties) {
        obj[key] = properties[key];
      }
      let feature = new Feature(obj);
      features.push(feature);
      // 绘制气泡
      this.createBubble(properties[this.xzqdm_field]);
    }
    this._GeoJson(features, 'geojson');
  }

  // 加载geoserver-wfs图层
  loadGeoserverWFS() {
    var urlString = this.options.layerUrl;
    let key = Object.keys(this.options.totaldata)[0];
    let length = key.length;
    if (key.length > 6) {
      key = key.substring(0, key.length - 3);
    } else {
      key = key.substring(0, key.length - 2);
    }
    let cqlFilter = `${this.xzqdm_field} like '${key}%' and length(${this.xzqdm_field})=${length}`;
    var param = {
      service: 'WFS',
      version: '1.1.0',
      request: 'GetFeature',
      typeName: this.options.layerName,
      outputFormat: 'application/json',
      maxFeatures: 3200,
      srsName: this.currentWkid,
      CQL_FILTER: cqlFilter
    };
    this._Ajax(urlString, param, (response) => {
      this._GeoJson(response, 'geo-wfs');
      // 绘制气泡
      response.features.forEach((feature) => {
        let properties = feature.properties;
        this.createBubble(properties[this.xzqdm_field]);
      });
    });
  }

  // 加载geoserver-wms服务
  loadGeoserverWMS() {
    let wmsSource = new ImageWMS({
      url: this.options.layerUrl,
      params: {
        layers: this.options.layerName,
        VERSION: '1.1.0'
      },
      serverType: 'geoserver',
      crossOrigin: 'anonymous',
      projection: this.currentWkid
    });
    let wmsLayer = new ImageLayer({
      source: wmsSource,
      opacity: 0.8,
      id: 'bubble_xzq',
      zIndex: this.options.zIndex ? this.options.zIndex : 99
    });
    setTimeout(() => {
      // wmsLayer.setZIndex(999)
      this.map.addLayer(wmsLayer);

      let getNewPointArr = null;
      let isArray = this.options.center && Array.isArray(this.options.center);
      if (isArray) {
        getNewPointArr = transform(
          this.options.center,
          this.options.centerWkid,
          this.currentWkid
        );
      } else {
        let centerX = parseFloat(this.options.center.split(',')[0]);
        let centerY = parseFloat(this.options.center.split(',')[1]);
        getNewPointArr = transform(
          [centerX, centerY],
          this.options.centerWkid,
          this.currentWkid
        );
      }
      this.map.getView().setCenter(getNewPointArr);
      // eslint-disable-next-line radix
      this.map.getView().setZoom(parseInt(this.options.zoom));
      let totaldata = this.options.totaldata;
      for (const key in totaldata) {
        this.createBubble(key);
      }
    }, 1500);
  }

  // 加载arcgis-vector图层
  loadArcgisVector(initLayer) {
    let code = this.currentWkid.split(':')[1];
    let urlString = this.options.layerUrl + '/' + initLayer + '/query';
    let key = Object.keys(this.options.totaldata)[0];
    let length = key.length;
    if (key.length > 6) {
      key = key.substring(0, key.length - 3);
    } else {
      key = key.substring(0, key.length - 2);
    }
    let cql = `${this.xzqdm_field} like '${key}%' AND char_length(${this.xzqdm_field})=${length}`;
    let param = {
      f: 'json',
      outFields: '*',
      outSR: code,
      // returnGeometry: false,
      where: cql
    };
    this._Ajax(urlString, param, (response) => {
      if (response && response.error) {
        console.error(response.error);
      } else {
        if (response && response.features.length > 0) {
          let features = this._GeoJson(response, 'arc-vector');
          // 绘制气泡
          features.forEach((feature) => {
            let values = feature.values_;
            this.createBubble(values[this.xzqdm_field]);
          });
        } else {
          // console.log("图层第" + initLayer + " 层未查询到数据")
        }
      }
    });
  }

  // 加载arcgis切片图层
  loadArcgisTile() {
    var layer = new TileLayer({
      source: new TileArcGISRest({
        url: this.options.layerUrl
      }),
      zIndex: this.options.zIndex ? this.options.zIndex : 99
    });
    setTimeout(() => {
      this.map.addLayer(layer);
      let getNewPointArr = null;
      let isArray = Array.isArray(this.options.center);
      if (isArray) {
        getNewPointArr = transform(
          this.options.center,
          this.options.centerWkid,
          this.currentWkid
        );
      } else {
        let centerX = parseFloat(this.options.center.split(',')[0]);
        let centerY = parseFloat(this.options.center.split(',')[1]);
        getNewPointArr = transform(
          [centerX, centerY],
          this.options.centerWkid,
          this.currentWkid
        );
      }
      this.map.getView().setCenter(getNewPointArr);
      this.map.getView().setZoom(10);
      let totaldata = this.options.totaldata;
      for (const key in totaldata) {
        this.createBubble(key);
      }
    }, 1500);
  }

  // geojson数据加载
  _GeoJson(jsonData, type) {
    // 获取wfs服务数据,转换成geojson
    let features;
    if (type === 'geo-wfs') {
      features = this.geoJSON.readFeatures(jsonData);
    } else if (type === 'arc-vector') {
      features = this.esrijsonFormat.readFeatures(jsonData);
    } else if (type === 'geojson') {
      features = jsonData;
    }
    // 初始化图层资源
    let vectorSource = new VectorSource();
    vectorSource.addFeatures(features);
    // 设置加载图层
    let vectorLayer = new VectorLayer({
      id: 'bubble_xzq',
      source: vectorSource,
      zIndex: this.options.zIndex ? this.options.zIndex : 99,
      opacity: 1,
      style: (feature) => {
        // 设置行政区样式
        let name = feature.values_[this.xzqmc_field];
        return this._getStyle(this.xzqFill, this.xzqBorder, name);
      }
    });
    // 添加到地图
    this.map.addLayer(vectorLayer);
    let extent = vectorSource.getExtent();
    this.fit2Map(extent);
    return features;
  }

  // 创建气泡
  createBubble(xzqdm) {
    let data = this.options.totaldata[xzqdm];
    let fontConfig = this.options.fontConfig;
    if (!data) {
      return;
    }
    let imgHtml = '';
    data.forEach((element, index) => {
      let fc = fontConfig[index];
      let ev = element.value;
      if (fc) {
        let valueStr = ev === 'null' || ev === 'NULL' ? 0 : ev;
        let value = Number(valueStr);
        let R = this.K * (value - this.minValue) + this.minR;
        let D = 2 * R;
        let id = this.newGuid();
        // 模拟创建hightchart的svg节点
        let title = (fc.name && fc.name + ' : ') + value;
        let bubbleHtml = `<div class="labelTooltip2" id="bubblecharts_${id}" title="${title}" style="cursor: pointer;"></div>`;
        // 插入节点
        $('.ol-overlaycontainer').append(bubbleHtml);
        // overlap展示
        let position = element.positionPoint;
        // 图片配置
        let src = fontConfig[index].imgUrl
          ? fontConfig[index].imgUrl
          : this.imgList[index];
        if (this.options.isBubbleImage) {
          imgHtml = this.createImgBubble(D, fontConfig[index], element, src);
        } else {
          let size = D - 32;
          imgHtml = this.createDomBubble(fontConfig[index], size, value, index);
        }
        $('#bubblecharts_' + id).append(imgHtml);
        let currentWkid = this.map.getView().getProjection().getCode();
        position = transform(position, element.wkid, currentWkid);
        let bubble = new Overlay({
          position: position,
          positioning: 'center-center',
          stopEvent: false,
          element: document.getElementById('bubblecharts_' + id)
        });
        this.map.addOverlay(bubble);
        // 设置气泡浮动动画的样式
        if (this.options.bubbleFloat) {
          let dom = $('#bubblecharts_' + id);
          let domParent = dom.parent();
          let ss = Math.random() + 2;
          let animate = `bubbleAnimation ${ss}s ease infinite alternate`;
          $(domParent).css('-webkit-animation', animate);
          $(domParent).css('-o-animation', animate);
          $(domParent).css('animation', animate);
          // 保证气泡图不变形
          setTimeout(() => {
            let child = dom.find('.bubbleDivClass');
            let height = child.height();
            let width = child.width();
            if (height < width) {
              width = height;
              $(child).css('width', width);
            } else {
              height = width;
              $(child).css('height', height);
            }
          }, 100);
        }
      }
    });
    this.isZoom = true;
  }

  // 创建图例
  createLegend() {
    if (this.options.legendConfig) {
      let legendConfig = this.options.legendConfig;
      if (legendConfig.isShow) {
        let img = require('./images/legend.png');
        let legendHtml = `<div id="bubbleLegend" style="position:absolute;z-index:10;${legendConfig.style}">
                            <div id="legendContainer" style="background:rgb(255, 255, 255,${legendConfig.opacity});border-radius: 3px;">`;
        if (!legendConfig.hideTitle) {
          legendHtml += `<div class="legendTitle" style="font-size: 14px;background: #409eff;color: #fff;border-top-left-radius: 3px;border-top-right-radius: 3px;text-align: center">
                        图例<span class="legendHide" style="cursor: pointer;position:relative;float:right;right:5px;top:0px;" title="最小化">&#8801;</span></div>`;
        }
        legendHtml += `</div>
                        <div id="showLegend" style="display:none;cursor: pointer;position: relative;float: right;" title="气泡图例">
                        <img src="${img}" style="background:rgb(255, 255, 255,${legendConfig.opacity});">
                      </div>
                    </div>`;
        $('#' + this.mapId).append(legendHtml);
        let fontConfig = this.options.fontConfig;
        let size = 20; // 图例中的气泡设置固定直径
        // 设置图例内容
        fontConfig.forEach((font, index) => {
          let bubbleHtml = '';
          let bubbleName = font.name || font.staticField;
          if (this.options.isBubbleImage) {
            let src = font.imgUrl ? font.imgUrl : this.imgList[index];
            bubbleHtml = `<div style="padding:5px;">
                            <div class="bubbleDivClass">
                              <div style="position: relative;float: left;">
                                <img class="bubbleImg" style="width: ${size}px;height:${size}px;padding:1px;" src=" ${src}"/>
                              </div>
                              <div style="font-size: ${this.options.fontSize}px;"> ${bubbleName} </div>
                            </div>
                          </div>`;
          } else {
            bubbleHtml += '<div style="padding:5px;">';
            bubbleHtml += this.createDomBubble(font, size, null, true);
            bubbleHtml +=
              '<div style="font-size:' +
              this.options.fontSize +
              'px;">' +
              bubbleName +
              '</div>';
            bubbleHtml += '</div>';
          }
          $('#legendContainer').append(bubbleHtml);
        });
        // 绑定图例事件
        $('.legendHide')
          .off('click')
          .click(() => {
            $('#legendContainer').hide();
            $('#showLegend').show();
          });
        $('#showLegend')
          .off('click')
          .click(() => {
            $('#legendContainer').show();
            $('#showLegend').hide();
          });
      }
    }
  }

  // 使用html+css创建气泡
  createDomBubble(item, size, value, isLegend) {
    let op = this.options;
    let color = item.bubbleColor || 'rgba(5,245,181,0.9)';
    let fontColor = item.color || 'rgba(239,239,9,0.9)';
    let name = item.name;
    let startColor = 'rgb(255,255,253)';
    let shadowColor = item.bubbleShadowColor || 'rgba(170, 170, 170, 0.8)';
    let darkColor = this.getDarkColor(color, 0.6);
    let fontDarkColor = this.getDarkColor(fontColor, 0.5);
    let fontSize = this.options.fontSize ? this.options.fontSize : '16';
    let boxShadowSize = '3px 6px 9px 0px';
    if (op.boxShadowSize) {
      boxShadowSize = `${op.boxShadowSize - 2}px ${op.boxShadowSize}px 7px 0px`;
    }

    let style1 = `border-radius: 50%;border-style: solid;border-width: 1px;border-color: ${color};`;
    let style2 = `background-image: -moz-linear-gradient( -50deg,${startColor} 0%,${color} 50%);`;
    let style3 = `background-image: -webkit-linear-gradient( -50deg,${startColor} 0%,${color} 50%);`;
    let style4 = `background-image: -ms-linear-gradient( -50deg,${startColor} 0%,${color} 50%);`;
    let style5 = `box-shadow:${boxShadowSize} ${shadowColor},inset 10px 15px 13px -10px rgba(255, 255, 255, 0.8),
                  inset -8px -7px 13px -10px ${darkColor};position: relative;`;
    let style6 = `width:${size}px;height:${size}px;text-align: center;vertical-align: middle;display: table-cell;opacity: 0.9;`;
    let style = style1 + style2 + style3 + style4 + style5 + style6;

    //气泡 中内容
    let spanHtml = '';
    if (!isLegend) {
      let lColor = this.getLightColor(fontColor, 0.6);
      let s1 = `font-size:12px;-webkit-text-fill-color:${lColor};`;
      let s2 = `text-shadow: -1px 0 ${fontDarkColor},0 1px ${fontDarkColor},1px 0 ${fontDarkColor}, 0 -1px ${fontDarkColor};`;
      let s3 = `font-size:${fontSize}px;`;
      let sty = s1 + s2;
      if (this.options.isShowTitle) {
        // 设置气泡内名称
        spanHtml += `<span class="nameTag" style="${sty}">${name}</span>`;
      }
      // 设置气泡内数字
      spanHtml += `<span class="nameTag" style="${sty + s3}">${value}</span>`;
    }
    if (isLegend) {
      style += 'float:left;';
    }
    let bubbleHtml = `<div class="bubbleDivClass" style="${style}">${spanHtml}</div>`;
    return bubbleHtml;
  }

  // 创建默认图片气泡
  createImgBubble(D, item, element, src) {
    let name = item.name;
    let op = this.options;
    let fontColor = item.color || 'rgba(5,245,181,0.9)';
    let bubbleShadowColor = item.bubbleShadowColor || 'rgba(5,245,181,0.9)';
    let shadowColor = bubbleShadowColor || fontColor;
    let num = this.options.bubbleNumTop ? this.options.bubbleNumTop : 32; // 计算偏移量
    let fillColor = this.getLightColor(shadowColor, 0.6); // 计算填充色(亮)
    let fontDarkColor = this.getDarkColor(fontColor, 0.5); // 计算阴影色
    // 设置阴影style字符串
    let shadowColorStr = `-1px 0 ${fontDarkColor},0 1px ${fontDarkColor},1px 0 ${fontDarkColor},0 -1px ${fontDarkColor}`;
    let fontSize = this.options.fontSize ? this.options.fontSize : 18;
    let imgHtml = '<div class="bubbleDivClass">';
    if (this.options.isShowTitle) {
      let top = (D - num) / 2 - 8;
      let style1 = `position:absolute;width:100% ;text-align:center;top:${top};`;
      let style2 = `font-size:${fontSize}px;color: transparent;-webkit-text-fill-color: ${fillColor};`;
      let style3 = `text-shadow:${shadowColorStr};font-family: Microsoft YaHei;`;
      let style = style1 + style2 + style3;
      imgHtml += `<div class="bubbleText" style="${style}">${name}:</div>`;
    }
    let titleTop = op.isShowTitle ? (D - num) / 2 + 14 : (D - num) / 2;
    let titleLeft = op.bubbleNumLeft ? op.bubbleNumLeft : -3;
    imgHtml += `<div class="bubbleText" style="position:absolute;width:100% ;text-align:center;top:${titleTop}px;
                    left:${titleLeft}px;font-size:12px; color: transparent;-webkit-text-fill-color:${fillColor}
                        text-shadow:${shadowColorStr};font-family: Microsoft YaHei;">${element.value}</div>`;
    imgHtml += `<img class="bubbleImg" style="width:${D}px;height:${D}px;padding:1px;" src="${src}"/>`;
    imgHtml += '</div>';
    return imgHtml;
  }

  // 计算气泡半径大小比例系数
  calculation_R_Size_K() {
    let totaldata = this.options.totaldata;
    let maxR = this.options.bubbleMaxR;
    let minR = this.options.bubbleMinR;
    this.maxValue = -Infinity;
    this.minValue = Infinity;
    for (const key in totaldata) {
      let data = totaldata[key];
      data.forEach((ele) => {
        let valueStr =
          ele.value === 'null' || ele.value === 'NULL' ? 0 : ele.value;
        let value = Number(valueStr);
        if (this.maxValue < value) {
          this.maxValue = value;
        }
        if (this.minValue > value) {
          this.minValue = value;
        }
      });
    }
    let subNum = this.maxValue - this.minValue;
    this.maxR = maxR ? maxR : 50;
    this.minR = minR ? minR : 38;
    // 计算半径差值的比例系数
    this.K = (this.maxR - this.minR) / subNum;
  }

  // 缩放至当前图层
  fit2Map() {
    // let zoomRatio = this.options.zoomRatio;
    if (!this.mapResolution) {
      this.mapResolution = this.map.getView().getResolution();
    }
    // let resolution = this.mapResolution / zoomRatio;
    // this.map.getView().setResolution(resolution)

    // 是否启用下钻
    if (this.options.isDrill) {
      this.drillDown();
    } else {
      if (this.drillDownEvt) {
        unByKey(this.drillDownEvt);
      }
    }
  }

  /**
   * 自定义渲染样式
   */
  _getStyle(fillcolor, strokeColor, xzqmc) {
    let fill = new Fill({
      color: fillcolor
    });
    let stroke = new Stroke({
      color: strokeColor,
      width: 2
    });
    let text = new Text({
      text: xzqmc,
      font: '16px bold Microsoft YaHei ',
      fill: new Fill({
        color: '#FFF'
      })
    });
    let queryStyle = new Style({
      fill: fill,
      stroke: stroke
    });
    if (this.options.isShowXzqName) {
      queryStyle.setText(text);
    }
    return queryStyle;
  }

  // 创建随机guid
  newGuid() {
    var guid = '';
    for (var i = 1; i <= 32; i++) {
      var n = Math.floor(Math.random() * 16.0).toString(16);
      guid += n;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        guid += '-';
      }
    }
    return guid;
  }

  // 得到hex颜色值为color的加深颜色值，level为加深的程度，限0-1之间
  getDarkColor(color, level) {
    let rgbc = [];
    if (color.indexOf('#') !== -1) {
      rgbc = this.HexToRgb(color);
    } else if (color.indexOf('rgb') !== -1) {
      rgbc = color.split('(')[1].split(')')[0].split(',');
    } else if (color.indexOf(',') !== -1) {
      rgbc = color.split(',');
    } else {
      rgbc = color;
    }
    // floor 向下取整
    for (let i = 0; i < 3; i++) {
      rgbc[i] = Math.floor(Number((rgbc[i] + '').trim()) * (1 - level));
    }
    return this.RgbToHex(rgbc[0], rgbc[1], rgbc[2]);
  }

  // 将hex颜色值str转化成rgb数组
  HexToRgb(str) {
    // replace替换查找的到的字符串
    str = str.replace('#', '');
    // match得到查询数组
    let hxs = str.match(/../g);
    for (let i = 0; i < 3; i++) hxs[i] = parseInt(hxs[i], 16);
    return hxs;
  }

  // 将rgb颜色值为a,b,c转化成hex颜色值
  RgbToHex(a, b, c) {
    let hexs = [a.toString(16), b.toString(16), c.toString(16)];
    for (let i = 0; i < 3; i++) {
      if (hexs[i].length === 1) hexs[i] = '0' + hexs[i];
    }
    return '#' + hexs.join('');
  }

  // 计算浅色
  getLightColor(color, level) {
    let rgbc = [];
    if (color.indexOf('#') !== -1) {
      rgbc = this.HexToRgb(color);
    } else if (color.indexOf('rgb') !== -1) {
      rgbc = color.split('(')[1].split(')')[0].split(',');
    } else if (color.indexOf(',') !== -1) {
      rgbc = color.split(',');
    } else {
      rgbc = color;
    }
    for (let i = 0; i < 3; i++) {
      rgbc[i] = Math.floor(
        (255 - Number((rgbc[i] + '').trim())) * level +
          Number((rgbc[i] + '').trim())
      );
    }
    return this.RgbToHex(rgbc[0], rgbc[1], rgbc[2]);
  }

  // 自定义注册浮动动画规则
  setAnimation() {
    const styleSheet = document.createElement('style');
    document.head.appendChild(styleSheet);
    styleSheet.textContent = `
      @keyframes bubbleAnimation {
        from {margin-top:0px;}
        to {margin-top:12px;}
      }
      @-webkit-keyframes bubbleAnimation {
        from {margin-top:0px;}
        to {margin-top:12px;}
      }`;
  }

  // 移除可能已经加载的xzq
  clearXZQ() {
    // 清除地图绑定事件
    this.isZoom = false;
    if (this.drillDownEvt) {
      unByKey(this.drillDownEvt);
    }
    let layers = this.map.getLayers().getArray();
    layers.forEach((layer) => {
      if (layer.values_.id === 'bubble_xzq') {
        this.map.removeLayer(layer);
      }
    });
  }

  // 封装ajax请求
  _Ajax(urlString, param, callback) {
    $.ajax({
      url: urlString,
      type: 'POST',
      dataType: 'json',
      data: param,
      success: (response) => {
        callback(response);
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  // 下钻功能
  drillDown() {
    if (
      this.options.layerType === 'geoserver-wfs' ||
      this.options.layerType === 'dynamic' ||
      this.options.isGeojson === true
    ) {
      this.drillDownEvt = this.map.getView().on('change:resolution', (evt) => {
        let oldValue = evt.oldValue;
        let targetValue = evt.target.values_.resolution;
        let flag = oldValue > targetValue; // 判断是放大还是缩小
        let mapCenter = this.map.getView().getCenter();
        let pixelPoint = this.map.getPixelFromCoordinate(mapCenter);

        let xzqlayer = this.map.getLayerById('bubble_xzq');
        let zoom = this.map.getView().getZoom();
        if (xzqlayer != null) {
          if (zoom >= 13) {
            xzqlayer.setVisible(false);
          } else {
            xzqlayer.setVisible(true);
          }
        }

        if (this.isZoom) {
          this.xzqQuery(pixelPoint, flag);
        }
      });
    }
  }

  /**
   * 行政区事件
   * @param {*} pixelPoint
   * @param {*} flag   true=放大,false=缩小
   */
  xzqQuery(pixelPoint, flag) {
    // 判断当前点是否是在行政区要素里面
    let features = this.map.getFeaturesAtPixel(pixelPoint);
    if (!features || features.length < 1) {
      return;
    }
    let values = features[0].values_;
    let xzqdm = values[this.xzqdm_field];
    let length = xzqdm.length;

    // 缩放事件
    let size = this.map.getSize();
    let extent = this.map.getView().calculateExtent(size);
    let mapArea = getArea(extent);
    let featureArea = features[0].getGeometry().getArea();
    let rabit = featureArea / mapArea;
    if (rabit > 0.3 && flag) {
      if (this.xzqdm_up === xzqdm) {
        return;
      }
      this.xzqdm_down = null;
      this.xzqdm_up = xzqdm;
      this.parentXzqdm = xzqdm;
      if (this.callback) {
        this.callback(xzqdm);
      }
    }
    if (rabit < 0.08 && !flag) {
      // 地图缩小,减两级
      if (length < 6) {
        xzqdm = xzqdm.substring(0, xzqdm.length - 2);
      } else if (length === 6) {
        xzqdm = xzqdm.substring(0, xzqdm.length - 4);
      } else if (length === 9) {
        xzqdm = xzqdm.substring(0, xzqdm.length - 5);
      } else {
        xzqdm = xzqdm.substring(0, xzqdm.length - 6);
      }
      if (!xzqdm) {
        return;
      }
      if (this.xzqdm_down === xzqdm) {
        return;
      }
      this.xzqdm_up = null;
      this.xzqdm_down = xzqdm;
      this.parentXzqdm = xzqdm;
      if (this.callback) {
        this.callback(xzqdm);
      }
    }
  }

  // 点击地图获取当前点击位置的坐标
  mapClick(type, fun) {
    if (type === 'getPoint') {
      this.evevt = this.map.on('click', (evt) => {
        let features = this.map.getFeaturesAtPixel(evt.pixel);
        let obj = {
          xzqdm: '',
          xzqmc: ''
        };
        if (features && features.length > 0) {
          let value = features[0].values_;
          obj.xzqdm = value[this.xzqdm_field];
          obj.xzqmc = value[this.xzqmc_field];
        }
        obj.positionPoint = evt.coordinate;
        fun(obj);
      });
    } else {
      if (this.evevt) {
        unByKey(this.evevt);
      }
    }
  }

  // 对外接口:清除气泡图
  clear() {
    // 清除已经存在的气泡
    var domS = $('[id^=bubblecharts_]');
    if ($('#bubbleLegend').length > 0) {
      $('#bubbleLegend')[0].remove();
    }

    if (domS.length > 0) {
      for (let i = 0; i < domS.length; i++) {
        domS[i].parentElement.remove();
      }
    }
    // 移除专题图可能加载过的行政区图层,后面重新加载
    this.clearXZQ();
  }
}
