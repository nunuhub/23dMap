import { Point, Polygon } from 'ol/geom';
import Feature from 'ol/Feature';
import { Fill, Style, Text, Circle, Icon } from 'ol/style';
import Stroke from 'ol/style/Stroke.js';
import { newGuid } from 'shinegis-client-23d/src/utils/common';

class Label {
  constructor(map, labelConfig) {
    this.map = map;
    this.labelConfig = labelConfig;
    this.labelSource = this.map.getLayerById('tempLabelLayer').getSource();
    this.key = newGuid();
    this.isSelect = false;
  }
  /**
   * 在地图上创建标注 外部调用 参数point是必须的
   * @param {Array}  point  锚点所在位置
   */
  create(point) {
    this.anchorPoint = point;
    this.createFeature();
  }

  /**
   * 在地图上创建标注 内部调用 根据anchorPoint生成polygon,Label,anchor三个Feature
   */
  createFeature() {
    let coordinates = this.createDefalultRings();
    let polygon = new Polygon([coordinates]);
    this.polygonFeature = new Feature(polygon);
    this.polygonFeature.set('key', this.key);
    this.polygonFeature.set('type', 'popup');
    this.labelSource.addFeature(this.polygonFeature);

    //label
    if (this.textCenterPoint) {
      let point = new Point(this.textCenterPoint);
      this.textFeature = new Feature(point);
      this.textFeature.set('key', this.key);
      this.textFeature.set('type', 'label');
      this.labelSource.addFeature(this.textFeature);
    }

    let anchorGeometry = new Point(this.anchorPoint);
    this.anchorFeature = new Feature(anchorGeometry);
    this.anchorFeature.set('key', this.key);
    this.anchorFeature.set('type', 'anchor');
    this.labelSource.addFeature(this.anchorFeature);

    // 设置样式
    this.setStyle();
  }

  /**
   * 设置Feautre样式,选择样式或者删除样式存在即用选中或删除，不存在则用默认样式
   */
  setStyle() {
    let anchorStyle = this.anchorStyle
      ? this.anchorStyle
      : new Style({
          image: new Circle({
            radius: 3.5,
            fill: new Fill({
              color: 'rgb(193,217,255)'
            }),
            stroke: new Stroke({
              color: 'rgb(88,140,215)',
              width: 1
            })
          })
        });
    let polygonStyle = this.polygonStyle
      ? this.polygonStyle
      : new Style({
          fill: new Fill({
            color: this.labelConfig.fillColor
          }),
          stroke: new Stroke({
            color: this.labelConfig.strokeColor
          })
        });
    let textStyle = new Style({
      text: new Text({
        font: this.labelConfig.textSize + 'px Microsoft YaHei  sans-serif',
        text: this.labelConfig.text,
        fill: new Fill({
          color: this.labelConfig.textColor
        })
      })
    });
    this.anchorFeature.setStyle(anchorStyle);
    this.polygonFeature.setStyle(polygonStyle);
    this.textFeature.setStyle(textStyle);
  }

  /**
   * 根据字体大小或者标注内容的变更 重新计算textLeftBottomMapPoint的值,做到自适应效果
   */
  updateText() {
    var newSize = this.caculateSizeMargin(
      this.labelConfig.text,
      this.labelConfig.textSize
    );
    var tempScreenPoint = this.map.getPixelFromCoordinate(
      this.textLeftBottomMapPoint
    );
    let deltaX = newSize.width - this.textSymbolSize.width;
    let deltaY = newSize.height - this.textSymbolSize.height;
    deltaY = this.position === 'top' ? deltaY : -deltaY;
    var textLeftBottomScreenPoint = [
      tempScreenPoint[0] - deltaX,
      tempScreenPoint[1] + deltaY
    ];
    this.textLeftBottomMapPoint = this.map.getCoordinateFromPixel(
      textLeftBottomScreenPoint
    );
  }

  /**
   * 锚点或者气泡左下角位置变更,或者颜色字体变更 均可以用改方法刷新样式
   */
  update(labelOptions) {
    if (this.polygonFeature) {
      this.labelSource.removeFeature(this.polygonFeature);
    }
    if (this.textFeature) {
      this.labelSource.removeFeature(this.textFeature);
    }
    if (this.anchorFeature) {
      this.labelSource.removeFeature(this.anchorFeature);
    }
    if (labelOptions) {
      if (labelOptions.anchorPoint) {
        this.anchorPoint = labelOptions.anchorPoint;
      }
      if (labelOptions.textLeftBottomMapPoint) {
        this.textLeftBottomMapPoint = labelOptions.textLeftBottomMapPoint;
      }
      if (labelOptions.labelConfig) {
        this.labelConfig = labelOptions.labelConfig;
      }
    }
    this.createFeature();
  }

  /**
   * 启用删除模式
   */
  startDelete() {
    this.isStartDelete = true;
    this.anchorStyle = new Style({
      image: new Icon({
        src: require('../../../src/assets/img//map-label/maplabel-delete.png')
      })
    });
    this.anchorFeature.setStyle(this.anchorStyle);
  }
  /**
   * 关闭删除模式
   */
  stopDelete() {
    this.isStartDelete = false;
    this.anchorStyle = new Style({
      image: new Circle({
        radius: 3.5,
        fill: new Fill({
          color: 'rgb(193,217,255)'
        }),
        stroke: new Stroke({
          color: 'rgb(88,140,215)',
          width: 1
        })
      })
    });
    this.anchorFeature.setStyle(this.anchorStyle);
  }

  /**
   * 删除对应的Feature
   */
  delete() {
    if (this.polygonFeature) {
      this.labelSource.removeFeature(this.polygonFeature);
    }
    if (this.textFeature) {
      this.labelSource.removeFeature(this.textFeature);
    }
    if (this.anchorFeature) {
      this.labelSource.removeFeature(this.anchorFeature);
    }
  }

  /**
   * Label 选中并修改样式
   */
  select() {
    this.isSelect = true;
    this.polygonStyle = new Style({
      fill: new Fill({
        color: this.labelConfig.fillColor
      }),
      stroke: new Stroke({
        color: this.labelConfig.strokeColor,
        width: 6
      })
    });
    this.polygonFeature.setStyle(this.polygonStyle);

    this.anchorStyle = new Style({
      image: new Circle({
        radius: 6,
        fill: new Fill({
          color: 'rgb(255,150,0)'
        }),
        stroke: new Stroke({
          color: 'rgb(243,243,243)',
          width: 1.25
        })
      })
    });
    this.anchorFeature.setStyle(this.anchorStyle);
  }

  /**
   * Label 取消选中并修改样式
   */
  unSelect() {
    this.isSelect = false;
    this.polygonStyle = new Style({
      fill: new Fill({
        color: this.labelConfig.fillColor
      }),
      stroke: new Stroke({
        color: this.labelConfig.strokeColor
      })
    });
    this.polygonFeature.setStyle(this.polygonStyle);

    this.anchorStyle = new Style({
      image: new Circle({
        radius: 3.5,
        fill: new Fill({
          color: 'rgb(193,217,255)'
        }),
        stroke: new Stroke({
          color: 'rgb(88,140,215)',
          width: 1
        })
      })
    });
    this.anchorFeature.setStyle(this.anchorStyle);
  }

  /**
   * 获得多边形点序列
   * @method createDefalultRings
   * @param {Array}  point  锚点所在位置
   */
  createDefalultRings() {
    var pointlist = [];
    //未考虑边框的margin和padding
    var text = this.labelConfig.text;
    var fontsize = this.labelConfig.textSize;
    var textSymbolSize = this.caculateSizeMargin(text, fontsize);
    this.textSymbolSize = textSymbolSize;
    var margin = textSymbolSize.margin;
    var singleHeight = textSymbolSize.singleHeight;
    var width = textSymbolSize.width + margin;
    var height = textSymbolSize.height + margin;

    var textLeftBottomScreenPoint = [];
    var anchorScreenPoint = this.map.getPixelFromCoordinate(this.anchorPoint);

    if (this.textLeftBottomMapPoint == null) {
      //点击添加按钮时第一次生成
      let x = anchorScreenPoint[0] - width;
      let y = anchorScreenPoint[1] + singleHeight + height;
      textLeftBottomScreenPoint = [x, y];
      this.textLeftBottomMapPoint = this.map.getCoordinateFromPixel(
        textLeftBottomScreenPoint
      );
    }

    textLeftBottomScreenPoint = this.map.getPixelFromCoordinate(
      this.textLeftBottomMapPoint
    );
    var textCenterPoint = [
      textLeftBottomScreenPoint[0] + width / 2,
      textLeftBottomScreenPoint[1] - height / 2
    ];
    this.textCenterPoint = this.map.getCoordinateFromPixel(textCenterPoint);

    //用于缩放后的计算
    this.deltaXY = [];
    this.deltaXY.push(anchorScreenPoint[0] - textLeftBottomScreenPoint[0]);
    this.deltaXY.push(anchorScreenPoint[1] - textLeftBottomScreenPoint[1]);
    //delt和left两参数的作用是：当锚点不在生成的标注矩形框中时，根据这两个参数，画出两条脚边
    var delt = 40;
    var left = 10;
    if (width / 3.0 <= delt) {
      delt = width / 3.0;
    }
    if (width / 3.0 <= left) {
      left = width / 3;
      delt = width / 3;
    }
    var anchorPoint;
    //锚点在矩形框上方
    if (anchorScreenPoint[1] < textCenterPoint[1] - height / 2.0) {
      this.position = 'top';
      if (anchorScreenPoint[0] > textCenterPoint[0]) {
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width - left,
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        pointlist.push(this.anchorPoint);
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width - left - delt,
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
      } else {
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width / 2,
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        pointlist.push(this.anchorPoint);
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width / 2 - delt,
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
      }
    }
    if (anchorScreenPoint[1] > textCenterPoint[1] + height / 2.0) {
      //锚点在矩形框下方
      this.position = 'bottom';
      if (anchorScreenPoint[0] > textCenterPoint[0]) {
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width - left - delt,
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        pointlist.push(this.anchorPoint);
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width - left,
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
      } else {
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width / 2 - delt,
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        pointlist.push(this.anchorPoint);
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width / 2,
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
      }
    }
    if (
      anchorScreenPoint[1] <= textCenterPoint[1] + height / 2.0 &&
      anchorScreenPoint[1] >= textCenterPoint[1] - height / 2
    ) {
      //锚点在矩形左侧
      if (anchorScreenPoint[0] > textCenterPoint[0] + width / 2) {
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1] - height / 3
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        pointlist.push(this.anchorPoint);
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1] - (2 * height) / 3
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
      }
      if (anchorScreenPoint[0] < textCenterPoint[0] - width / 2) {
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1] - (2 * height) / 3
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        pointlist.push(this.anchorPoint);
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1] - height / 3
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
      }
      if (
        anchorScreenPoint[0] >= textCenterPoint[0] - width / 2 &&
        anchorScreenPoint[0] <= textCenterPoint[0] + width / 2
      ) {
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0] + width,
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1] - height
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
        anchorPoint = [
          textLeftBottomScreenPoint[0],
          textLeftBottomScreenPoint[1]
        ];
        pointlist.push(this.map.getCoordinateFromPixel(anchorPoint));
      }
    }
    return pointlist;
  }

  /**
   * 计算字体大小
   */
  computeFontSize(str, style) {
    let sizeD = {
      width: 0,
      height: 0,
      singleHeight: 0,
      margin: 20,
      rowCount: 0
    };
    if (str) {
      //对str进行分行\n
      str = str.replaceAll('</div>', '');
      str = str.replaceAll('<div>', '\n');
      let strArray = str.split('\n');
      if (strArray && strArray.length > 0) {
        for (let strSingle of strArray) {
          let size = this.computeSingleFontSize(strSingle, style);
          sizeD.width = Math.max(sizeD.width, size.width);
          sizeD.singleHeight = Math.max(sizeD.singleHeight, size.height);
        }
        sizeD.height = sizeD.singleHeight * strArray.length;
      }
      sizeD.rowCount = strArray.length;
      sizeD.margin = Math.max(16, Math.min(sizeD.width, sizeD.height) / 4);
    }
    return sizeD;
  }

  /**
   * 计算单行字体大小
   */
  computeSingleFontSize(str, style) {
    let spanDom = document.createElement('span');
    spanDom.style.fontSize = style.fontSize;
    spanDom.style.opacity = '0';
    spanDom.style.fontFamily = style.fontFamily;
    spanDom.style.fontWeight = style.fontWeight;
    spanDom.innerHTML = str;
    let first = document.body.firstChild; //得到页面的第一个元素。
    if (first) {
      document.body.insertBefore(spanDom, first);
    } else {
      document.body.append(spanDom);
    }
    let sizeD = {};
    sizeD.width = spanDom.offsetWidth;
    sizeD.height = spanDom.offsetHeight + spanDom.offsetTop;
    spanDom.remove();
    return sizeD;
  }
  /**
   * 计算标注宽度、高度边距
   * @method caculateSizeMargin
   * @param {string} value   标注内容
   * @param {string} fontsize 标注大小
   */
  caculateSizeMargin(text, fontsize) {
    let style = {
      fontSize: fontsize + 'px',
      fontFamily: 'Microsoft YaHei'
    };
    return this.computeFontSize(text, style);
  }
}
export default Label;
