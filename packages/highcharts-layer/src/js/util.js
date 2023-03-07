import $ from 'jquery';
// 专题图工具类
export default class util {
  constructor(map) {
    this.map = map;
    this.mapId = this.map.getTarget().id; // 地图dom节点的id
  }

  // 渐变色计算
  valueRangeColor(valueRange, rampColor, isRampFill) {
    this.colorArr = [];
    this.valueRange = valueRange;
    this.rampColor = rampColor;
    if (isRampFill) {
      let step = valueRange.length;
      let startColor = rampColor[0];
      let endColor = rampColor[1];
      this.colorArr = this.gradientColor(startColor, endColor, step);
    } else {
      this.colorArr = rampColor;
    }
    return this.getLegendColorObj();
  }
  // 获取图例对应的颜色对象
  getLegendColorObj() {
    let obj = {};
    this.valueRange.forEach((range, index) => {
      obj[range] = this.colorArr[index];
    });
    return obj;
  }

  // 根据数值获取颜色
  getColor(value) {
    let index = -1;
    value = value ? value : 0;
    this.valueRange.forEach((val, i) => {
      let valArr = [];
      if (val.indexOf('~') !== -1) {
        valArr = val.split('~');
      } else if (val.indexOf('-') !== -1) {
        valArr = val.split('-');
      }
      if (valArr.length > 0) {
        let startNum = Number(valArr[0]);
        let endNum = Number(valArr[1]);
        if (value >= startNum && value < endNum) {
          index = i;
        }
      }
    });
    let color;
    if (index > -1) {
      color = this.colorArr[index];
    }
    return color;
  }

  // 获取渐变色
  gradientColor(startColor, endColor, step) {
    let startRGB = this.colorRgb(startColor); // 转换为rgb数组模式
    let startR = startRGB[0];
    let startG = startRGB[1];
    let startB = startRGB[2];

    let endRGB = this.colorRgb(endColor);
    let endR = endRGB[0];
    let endG = endRGB[1];
    let endB = endRGB[2];

    let sR = (endR - startR) / step; // 总差值
    let sG = (endG - startG) / step;
    let sB = (endB - startB) / step;

    let colorArr = [];
    for (let i = 0; i < step; i++) {
      // 计算每一步的hex值
      let hex = this.colorHex(
        'rgb(' +
          Number(sR * i + startR) +
          ',' +
          Number(sG * i + startG) +
          ',' +
          Number(sB * i + startB) +
          ')'
      );
      colorArr.push(hex);
    }
    return colorArr;
  }

  // 转rgb
  colorRgb(sColor) {
    let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    let regRbg = /rgb/;
    sColor = sColor.toLowerCase();
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        let sColorNew = '#';
        for (let i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      // 处理六位的颜色值
      let sColorChange = [];
      for (let i = 1; i < 7; i += 2) {
        sColorChange.push(Number('0x' + sColor.slice(i, i + 2)));
      }
      return sColorChange;
    } else if (regRbg.test(sColor)) {
      let sColorChange = [];
      for (let i = 0; i < 5; i++) {
        sColorChange.push(this.rgbaNum(sColor, i));
      }
      return sColorChange;
    } else {
      return sColor;
    }
  }
  rgbaNum(rgba, index) {
    let val = rgba.match(/(\d(\.\d+)?)+/g);
    return Number(val[index]);
  }
  // 转十六进制
  colorHex(rgb) {
    let _this = rgb;
    let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (/^(rgb|RGB)/.test(_this)) {
      let aColor = _this.replace(/(?:(|)|rgb|RGB)*/g, '').split(',');
      let strHex = '#';
      for (let i = 0; i < aColor.length; i++) {
        let hex = Number(aColor[i]).toString(16);
        hex = hex < 10 ? 0 + '' + hex : hex; // 保证每个rgb的值为2位
        if (hex === '0') {
          hex += hex;
        }
        strHex += hex;
      }
      if (strHex.length !== 7) {
        strHex = _this;
      }
      return strHex;
    } else if (reg.test(_this)) {
      let aNum = _this.replace(/#/, '').split('');
      if (aNum.length === 6) {
        return _this;
      } else if (aNum.length === 3) {
        let numHex = '#';
        for (let i = 0; i < aNum.length; i += 1) {
          numHex += aNum[i] + aNum[i];
        }
        return numHex;
      }
    } else {
      return _this;
    }
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
  // 缩放至当前图层
  fit2Map(featureExtent, callback) {
    this.map.getView().fit(featureExtent, {
      size: this.map.getSize()
    });
    if (callback) {
      callback();
    }
  }

  createLegendPanel(legendConfig) {
    if ($('#mapChartsLegend_' + this.mapId).length > 0) {
      $('#mapChartsLegend_' + this.mapId).remove();
    }
    let img = require('../images/legend.png');
    let legendHtml =
      `<div id="mapChartsLegend_${this.mapId}" style="position:absolute;z-index:10;box-shadow: 0px 1px 5px;` +
      ` background:rgb(255, 255, 255,${legendConfig.opacity});${legendConfig.style}">
                          <div id="legendContainer_${this.mapId}" style="border-radius: 3px;">`;
    if (!legendConfig.hideTitle) {
      legendHtml += `<div class="legendTitle" style="font-size: 14px;background: #409eff;color: #fff;border-top-left-radius: 3px;border-top-right-radius: 3px;text-align: center">
                       专题图例<span class="legendHide" style="cursor: pointer;position:relative;float:right;right:5px;" title="最小化">&#8801;</span>
                    </div>`;
    }
    legendHtml += `<div id="legendContext_${this.mapId}" style="max-height:200px;overflow: auto;"></div>
                  </div>
                  <div id="showLegend_${this.mapId}" style="display:none;cursor: pointer;width: 32px;height: 32px;" title="专题图例">
                      <img src="${img}" style="background:rgb(255, 255, 255,${legendConfig.opacity});">
                  </div>
                </div>`;
    $('#' + this.mapId).append(legendHtml);
    // 绑定图例事件
    $('.legendHide')
      .off('click')
      .click(() => {
        $('#legendContainer_' + this.mapId).hide();
        $('#showLegend_' + this.mapId).show();
      });
    $('#showLegend_' + this.mapId)
      .off('click')
      .click(() => {
        $('#legendContainer_' + this.mapId).show();
        $('#showLegend_' + this.mapId).hide();
      });
  }

  // 计算三角形面积
  triangleArea(p0, p1, p2) {
    let area = 0.0;
    area =
      p0[0] * p1[1] +
      p1[0] * p2[1] +
      p2[0] * p0[1] -
      p1[0] * p0[1] -
      p2[0] * p1[1] -
      p0[0] * p2[1];
    return area / 2;
  }
  // 获取多边形的质心
  getPolygonAreaCenter(points) {
    let sum_x = 0;
    let sum_y = 0;
    let sum_area = 0;
    let p1 = points[1];
    let p2;
    let area;
    for (let i = 2; i < points.length; i++) {
      p2 = points[i];
      area = this.triangleArea(points[0], p1, p2);
      sum_area += area;
      sum_x += (points[0][0] + p1[0] + p2[0]) * area;
      sum_y += (points[0][1] + p1[1] + p2[1]) * area;
      p1 = p2;
    }
    let xx = sum_x / sum_area / 3;
    let yy = sum_y / sum_area / 3;
    return [xx, yy];
  }

  // 获取多边形的质心点
  getInnerPoint(features, xzqdm_field) {
    let obj = {};
    features.forEach((feature) => {
      let geo = feature.getGeometry();
      let type = geo.getType();
      let xzqdm = feature.values_[xzqdm_field];
      let innerPoint;
      // 获取质心点
      if (type === 'Polygon') {
        innerPoint = feature.getGeometry().getInteriorPoint().getCoordinates();
      } else if (type === 'MultiPolygon') {
        innerPoint = feature
          .getGeometry()
          .getInteriorPoints()
          .getCoordinates()[0];
      }
      obj[xzqdm] = innerPoint;
    });
    return obj;
  }
}
