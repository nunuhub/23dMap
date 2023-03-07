import EChartsLayer from 'ol-echarts';

export default class Migrate {
  constructor(map) {
    this.map = map;
    this.maxR = 20; // 最大半径
    this.minR = 5; // 最小半径
    this.maxL = 5; // 最大线宽
    this.minL = 1; // 最小线宽
    this.K = 1; // 权重半径比
    this.L = 1; // 权重线宽比
    this.maxW = -Infinity; // 最大权重(半径)
    this.minW = Infinity; // 最小权重(半径)
    this.maxLW = -Infinity; // 最大权重(线宽)
    this.minLW = Infinity; // 最小权重(线宽)
  }

  initMigrate(options) {
    this.options = options;
    this.clear();
    this.setMaxMin();
    let series = this.setSeries();
    let params = {
      tooltip: {
        trigger: 'item'
      },
      series
    };
    this.createChartLayer(params);
  }

  clear() {
    if (this.chart) {
      this.chart.clear();
      this.chart.remove();
      this.chart = null;
    }
  }

  setMaxMin() {
    let options = this.options;
    if (options.maxR) {
      this.maxR = options.maxR; // 最大半径
    }
    if (options.minR) {
      this.minR = options.minR; // 最小半径
    }
    if (options.maxL) {
      this.maxL = options.maxL; // 最小线宽
    }
    if (options.minL) {
      this.minL = options.minL; // 最小线宽
    }
  }

  createChartLayer(options) {
    let chart = (this.chart = new EChartsLayer(options, {
      hideOnMoving:
        this.options && this.options.hideOnMoving
          ? this.options.hideOnMoving
          : true,
      hideOnZooming:
        this.options && this.options.hideOnZooming
          ? this.options.hideOnZooming
          : true
    }));
    chart.appendTo(this.map);
    if (this.options.zIndex > -1) {
      chart.setZIndex(this.options.zIndex);
    }
  }

  convertData(data) {
    const res = [];
    if (data) {
      let start = data.start.value;
      let fromCoord = [start[0], start[1]];
      let endData = data.end;
      this.cal_weight(start[2]);
      endData.forEach((item) => {
        let position = item.value;
        let toCoord = [position[0], position[1]];
        res.push({
          fromName: data.start.name,
          toName: item.name,
          coords: [fromCoord, toCoord]
        });
        this.cal_weight(position[2]);
      });
    }
    return res;
  }

  // 根据权重计算圆圈的半径比
  cal_weight(value) {
    value = value ? value : 1;
    if (value > this.maxW) {
      this.maxW = value;
    }
    if (value < this.minW) {
      this.minW = value;
    }
  }

  setSeries() {
    let series = [];
    let data = this.options.data;
    let _minL = Infinity;
    let _maxL = -Infinity;
    data.forEach((item) => {
      if (item.value > _maxL) {
        _maxL = item.value;
      }
      if (item.value < _minL) {
        _minL = item.value;
      }
    });
    this.maxLW = _maxL;
    this.minLW = _minL;
    this.L = this.cal_K(this.maxL, this.minL, _maxL, _minL);
    data.forEach((item, i) => {
      if (this.options.trail) {
        let lineObj = this.createLine(item, i);
        series.push(lineObj);
      }
      let planeObj = this.createIcon(item, i);
      series.push(planeObj);
      let pointObj = this.createPoints(item, i);
      series.push(pointObj);
    });
    this.K = this.cal_K(this.maxR, this.minR, this.maxW, this.minW);
    return series;
  }

  // 计算权重比例系数(半径,线宽)
  cal_K(maxNum, minNum, maxW, minW) {
    let D = maxNum - minNum; // 参数差(半径,线宽)
    let W = maxW - minW; // 权重差
    return D / W;
  }

  // 计算线宽
  cal_lineW(lineW) {
    let l = this.L * (lineW - this.minLW) + this.minL;
    return Math.ceil(l);
  }

  createLine(item) {
    let animation = this.options && this.options.animation;
    let lineObj = {
      // name: "",
      type: 'lines',
      zlevel: 1,
      effect: {
        // 线性特效
        show: animation ? animation : false,
        period: this.options.speed ? this.options.speed : 6, // 动画时间
        trailLength: this.options.trailLength ? this.options.trailLength : 0.7, // 特效尾迹长度
        color: '#fff', // 特效颜色
        symbolSize: this.cal_lineW(item.value) + 1
      },
      lineStyle: {
        normal: {
          color: item.color ? item.color : this.getColor(),
          width: 0,
          curveness: 0.2
        }
      },
      data: this.convertData(item)
    };
    return lineObj;
  }

  createIcon(item) {
    let animation = this.options && this.options.animation;
    let iconObj = {
      // name: "b",
      type: 'lines',
      zlevel: 2,
      effect: {
        // 特效
        show: animation ? animation : false,
        period: this.options.speed ? this.options.speed : 6,
        trailLength: 0,
        symbol: this.options.iconPath,
        symbolSize: 15 + this.cal_lineW(item.value)
      },
      lineStyle: {
        normal: {
          color: item.color ? item.color : this.getColor(),
          width: this.cal_lineW(item.value),
          opacity: this.options.opacity ? this.options.opacity : 0.5,
          curveness: 0.2
        }
      },
      data: this.convertData(item)
    };
    return iconObj;
  }

  createPoints(item) {
    let pointObj = {
      name: '',
      type: 'effectScatter',
      coordinateSystem: 'geo',
      zlevel: 2,
      rippleEffect: {
        brushType: 'stroke'
      },
      label: {
        normal: {
          show: this.options.isShowName ? this.options.isShowName : false,
          position: 'right',
          formatter: '{b}'
        }
      },
      symbolSize: (val) => {
        let value = val[2] ? val[2] : 1;
        let r = this.K * (value - this.minW) + this.minR;
        return Math.ceil(r);
      },
      itemStyle: {
        normal: {
          color: item.color ? item.color : this.getColor()
        }
      },
      tooltip: {
        formatter: (data) => {
          if (this.options.tooltip) {
            return this.options.tooltip(data);
          } else {
            return '';
          }
        }
      },
      data: [item.start].concat(item.end)
    };
    return pointObj;
  }
  getColor() {
    var str = '#';
    // 定义一个十六进制的值的数组
    var lzp = [
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      'a',
      'b',
      'c',
      'd',
      'e',
      'f'
    ];
    // 遍历循环产生 6 个数
    for (var i = 0; i < 6; i++) {
      // 随机产生 0~15 的个索引数,然后根据该索引找到数组中对应的值,拼接到一起
      var lut = Number(Math.random() * 16);
      str += lzp[lut];
    }
    return str;
  }
}
