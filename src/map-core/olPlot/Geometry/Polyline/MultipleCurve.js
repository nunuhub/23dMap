/**
 * Created by FDD on 2017/5/22.
 * @desc 标绘曲线算法
 */
import Curve from './Curve';
import { MULTIPLECURVE } from '../../Utils/PlotTypes';
import { intersect } from 'mathjs';
import { LineString } from 'ol/geom';
import { Stroke, Style } from 'ol/style';
import { pushLineArrowToLine } from '../../Utils/arrowUtils';
class MultipleCurve extends Curve {
  constructor(coordinates, points, params) {
    super(coordinates, points, params);
    this.type = MULTIPLECURVE;
  }

  setStyle(style) {
    this.style = JSON.parse(JSON.stringify(style));
  }

  getStyle() {
    return (feature, resolution) => {
      var widths = [
        this.style.childWidth + this.style.childOffset,
        this.style.width + this.style.childOffset,
        this.style.childWidth + this.style.childOffset
      ];
      var stroke = [
        {
          width: this.style.childWidth,
          color: this.style.childStroke
        },
        {
          width: this.style.strokeWidth,
          color: this.style.stroke
        },
        {
          width: this.style.childWidth,
          color: this.style.childStroke
        }
      ];

      var styles = [];
      var totalWidth = 0;
      for (let line = 0; line < widths.length; line++) {
        totalWidth += widths[line];
      }
      var width = 0;
      for (let line = 0; line < widths.length; line++) {
        var dist = (width + widths[line] / 2 - totalWidth / 2) * resolution;
        width += widths[line];
        var geom = feature.getGeometry();
        if (geom.forEachSegment) {
          var coords = [];
          var counter = 0;
          geom.forEachSegment(function(from, to) {
            var angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
            var newFrom = [
              Math.sin(angle) * dist + from[0],
              -Math.cos(angle) * dist + from[1]
            ];
            var newTo = [
              Math.sin(angle) * dist + to[0],
              -Math.cos(angle) * dist + to[1]
            ];
            coords.push(newFrom);
            coords.push(newTo);
            if (coords.length > 2) {
              var intersection = intersect(
                coords[counter],
                coords[counter + 1],
                coords[counter + 2],
                coords[counter + 3]
              );
              coords[counter + 1] = intersection
                ? intersection
                : coords[counter + 1];
              coords[counter + 2] = intersection
                ? intersection
                : coords[counter + 2];
              counter += 2;
            }
          });

          styles.push(
            new Style({
              zIndex: this.style.zIndex,
              geometry: new LineString(coords),
              stroke: new Stroke(stroke[line])
            })
          );
        }
      }

      var geometry = feature.getGeometry();
      this.style.arrow.triangleArrowSize = totalWidth * 0.8;
      pushLineArrowToLine(styles, geometry, this.style, this.map);

      return styles;
    };
  }
}

export default MultipleCurve;
