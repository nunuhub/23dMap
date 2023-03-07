import { RAILLOADCURVE } from '../../Utils/PlotTypes';
import { Stroke, Style } from 'ol/style';
import Curve from './Curve';
import { pushArrowToLine } from '../../../olPlot/Utils/arrowUtils';

class RailLoadCurve extends Curve {
  constructor(coordinates, points, params) {
    super(coordinates, points, params);
    this.type = RAILLOADCURVE;
  }

  setStyle(style) {
    this.style = JSON.parse(JSON.stringify(style));
  }

  getStyle() {
    return feature => {
      let styles = [];
      styles.push(
        new Style({
          zIndex: this.style.zIndex,
          stroke: new Stroke({
            color: this.style.roadStroke,
            width: this.style.width + 1
          })
        })
      );
      styles.push(
        new Style({
          zIndex: this.style.zIndex,
          stroke: new Stroke({
            color: this.style.roadDashStroke,
            width: this.style.dashWidth,
            lineCap: 'butt',
            lineDash: [this.style.dashHeight, this.style.dashDivide],
            lineDashOffset: this.style.dashDivide
          })
        })
      );
      this.style.stroke = this.style.roadStroke;
      var geom = feature.getGeometry();
      this.style.arrow.triangleArrowSize = this.style.width + 2;
      pushArrowToLine(styles, geom, this.style, this.map);

      return styles;
    };
  }
}

export default RailLoadCurve;
