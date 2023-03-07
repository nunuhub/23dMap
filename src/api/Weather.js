import { Weather as WeatherCore } from '../earth-core/Widget/SpatialAnalysis/index';

class Weather {
  constructor(earth) {
    this.weather = new WeatherCore(earth.viewer);
  }
  /**
   *下雨
   * @param {*} num 雨量:0，1,2,3,4;0为关
   */
  rain(num) {
    num = Number(num);
    if (num === 0) this.weather.removeRainStage();
    else {
      this.weather.rainfall(num);
    }
  }
  /**
   *下雪
   * @param {*} num 雪量:0,1,2,3,4;0为关
   */
  snow(num) {
    num = Number(num);
    if (num === 0) this.weather.removeSnowStage();
    else {
      this.weather.snowfall(num);
    }
  }
  /**
   * 清除天气
   */
  removeAll() {
    this.weather.removeStage();
  }
}

export default Weather;
