import $ from 'jquery';
import Overlay from 'ol/Overlay';
import highcharts from 'highcharts';
import highcharts3d from 'highcharts/highcharts-3d';
import Util from './util';

export default class Charts {
  constructor(map) {
    this.map = map;
    this.util = new Util(this.map);
    this.mapId = this.map.getTarget().id; // 地图dom节点的id
  }

  // 初始化专题
  init(options, features, legendConfig, xzqdm_field, type) {
    this.options = options;
    this.features = features; // 行政区数据
    this.xzqdm_field = xzqdm_field;
    this.legendOption = options.legend; // 柱状图图例
    this.legendConfig = legendConfig; // 图例基础配置
    this.data = options.data; // 柱状图数据
    highcharts3d(highcharts); // 注册3D图表
    this.modalType = type;
    this.positionPoint = this.util.getInnerPoint(features, xzqdm_field); // 获取质心点对象
    this.createSeries();
    // overlay中的bug: positioning: 'center-center'属性,在地图刷新后才会起效
    this.map.render();
  }

  // 清除专题
  clear() {
    var domS = $('[id^=charts_]');
    if (domS.length > 0) {
      for (let i = 0; i < domS.length; i++) {
        domS[i].parentElement.remove();
      }
    }
    this.clearLegend();
  }

  // 创建柱状图的series
  createSeries() {
    let data = this.data;
    let numCount = 0;
    for (const key in data) {
      let getValue = data[key];
      if (getValue.length > 0) {
        let series = [];
        getValue.forEach((element) => {
          let obj = {};
          obj.name = element.name;
          obj.y = Number(element.value);
          obj.color = this.getColor(element.name);
          series.push(obj);
        });
        numCount += 1;
        this.createBar3D(series, numCount);
        this.setOverLay(this.positionPoint[key], numCount);
      }
    }
    if (this.options.isShowChartLegend) {
      this.createLegend();
    }
  }

  // 创建3d图
  createBar3D(seriesData, num) {
    let width = 20 * seriesData.length;
    if (width < 80) {
      width = 80;
    }
    $('#' + this.mapId)
      .find('.ol-overlaycontainer')
      .append(
        "<div id='charts_" +
          num +
          "' style='width:" +
          width +
          "px;height:80px;'></div>"
      );
    let chart = {
      type: this.modalType === 'bar' ? 'column' : 'pie',
      backgroundColor: 'rgba(0,0,0,0)',
      margin: 0,
      options3d: {
        enabled: true,
        alpha: this.modalType === 'bar' ? 15 : 55,
        beta: this.modalType === 'bar' ? 15 : 0,
        depth: 50,
        viewDistance: 25
      }
    };
    let title = { text: '' };
    let series;
    let plotOptions;
    let animation = { defer: 0, duration: 500 };
    if (this.options.animation) {
      animation = this.options.animation;
    }
    if (this.modalType !== 'bar') {
      // 饼图
      plotOptions = {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          depth: 15,
          dataLabels: { enabled: false }
        }
      };
      series = [{ type: 'pie', data: seriesData, animation: animation }];
    } else {
      plotOptions = { column: { depth: 25 } };
      series = [{ type: 'column', data: seriesData, animation: animation }];
    }

    let json = {};
    json.chart = chart;
    json.title = title;
    json.series = series;
    json.plotOptions = plotOptions;
    json.credits = { enabled: false };
    json.legend = { enabled: false };
    json.xAxis = { visible: false };
    json.yAxis = { visible: false };
    if (this.modalType !== 'bar') {
      json.tooltip = {
        style: { fontSize: '12px', width: '200px' },
        pointFormat: '占比: {point.percentage:.1f}%<br/>数值:{point.y}'
      };
      if (this.modalType === 'ring') {
        json.plotOptions.pie.innerSize = 25;
      }
    } else {
      json.tooltip = {
        style: { fontSize: '12px', width: '200px' },
        pointFormat: '数值:{point.y}'
      };
    }
    highcharts.chart('charts_' + num, json);
  }

  // 根据名称获取对应的颜色
  getColor(name) {
    let color = '';
    this.options.legend.forEach((data) => {
      if (data.name === name) {
        color = data.color;
      }
    });
    return color;
  }

  // 设置图表展示dom
  setOverLay(centerPoint, num) {
    let echarts = new Overlay({
      position: centerPoint,
      positioning: 'center-center',
      // stopEvent: false,
      element: document.getElementById('charts_' + num)
    });
    this.map.addOverlay(echarts);
  }

  // 清除图例
  clearLegend() {
    if (
      $('#rampLegend_' + this.mapId).length < 1 &&
      $('#mapChartsLegend_' + this.mapId).length > 0
    ) {
      $('#mapChartsLegend_' + this.mapId).remove();
    } else if ($('#chartLegend_' + this.mapId).length > 0) {
      $('#chartLegend_' + this.mapId).remove();
    }
  }
  // 创建图例
  createLegend() {
    let legendConfig = this.legendConfig;
    if ($('#mapChartsLegend_' + this.mapId).length > 0) {
      if ($('#chartLegend_' + this.mapId).length > 0) {
        $('#chartLegend_' + this.mapId).remove();
      }
    } else {
      this.util.createLegendPanel(legendConfig);
    }
    let title = '';
    if (this.modalType === 'bar') {
      title = '柱状图图例';
    } else if (this.modalType === 'pie') {
      title = '饼图图例';
    } else {
      title = '饼环图例';
    }
    let context = `<div id="chartLegend_${this.mapId}" style="font-size:12px;"><div> ${title}:</div>`;
    this.options.legend.forEach((obj) => {
      context +=
        '<div style="height:20px;padding:3px 5px;"><div style="background:' +
        obj.color +
        ';width:20px;height:15px;margin: 0px 5px;position:relative;float:left"></div><div style="position:relative;float:left;">' +
        obj.name +
        '</div></div>';
    });
    context += '</div>';
    $('#legendContext_' + this.mapId).append(context);
  }
}
