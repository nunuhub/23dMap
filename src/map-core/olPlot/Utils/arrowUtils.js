import { Stroke, Fill, RegularShape, Style } from 'ol/style';
import { LineString, Point } from 'ol/geom';

const pushArrowToLine = (styles, geometry, style, map) => {
  pushTriangleArrowToLine(styles, geometry, style, map);
};
const pushTriangleArrowToLine = function(styles, geometry, style, map) {
  const allCoordinates = geometry.getCoordinates();
  if (allCoordinates.length >= 2) {
    const dist =
      style.arrow.triangleArrowSize * Math.cos(((2 * Math.PI) / 360) * 60);

    if (style.arrow.showArrow.indexOf('right') > -1) {
      var end = allCoordinates[allCoordinates.length - 1];
      var start = allCoordinates[allCoordinates.length - 2];
      var dx = end[0] - start[0];
      var dy = end[1] - start[1];
      var rotation = Math.atan2(dy, dx);

      var endPixel = map.getPixelFromCoordinate(end);
      var end1 = map.getCoordinateFromPixel([
        endPixel[0] + Math.cos(rotation) * dist,
        endPixel[1] - Math.sin(rotation) * dist
      ]);
      // arrows
      styles.push(
        new Style({
          zIndex: style.zIndex,
          geometry: new Point(end1),
          image: new RegularShape({
            fill: new Fill({ color: style.stroke }),
            points: 3,
            radius: style.arrow.triangleArrowSize,
            rotation: -rotation,
            angle: Math.PI / 2 // rotate 90°
          })
        })
      );
    }

    if (style.arrow.showArrow.indexOf('left') > -1) {
      end = allCoordinates[0];
      start = allCoordinates[1];
      dx = end[0] - start[0];
      dy = end[1] - start[1];
      rotation = Math.atan2(dy, dx);

      endPixel = map.getPixelFromCoordinate(end);
      end1 = map.getCoordinateFromPixel([
        endPixel[0] + Math.cos(rotation) * dist,
        endPixel[1] - Math.sin(rotation) * dist
      ]);
      // arrows
      styles.push(
        new Style({
          zIndex: style.zIndex,
          geometry: new Point(end1),
          image: new RegularShape({
            fill: new Fill({ color: style.stroke }),
            points: 3,
            radius: style.arrow.triangleArrowSize,
            rotation: -rotation,
            angle: Math.PI / 2 // rotate 90°
          })
        })
      );
    }
  }
};
const pushLineArrowToLine = function(styles, geometry, style, map) {
  const allCoordinates = geometry.getCoordinates();
  if (allCoordinates.length >= 2) {
    const arrowSize = style.arrow.triangleArrowSize;
    if (style.arrow.showArrow.indexOf('right') > -1) {
      var end = allCoordinates[allCoordinates.length - 1];
      var start = allCoordinates[allCoordinates.length - 2];
      var dx = end[0] - start[0];
      var dy = end[1] - start[1];
      var rotation = Math.atan2(dy, dx);

      var endPixel = map.getPixelFromCoordinate(end);
      var end1 = map.getCoordinateFromPixel([
        endPixel[0] - arrowSize,
        endPixel[1] + arrowSize
      ]);
      var end2 = map.getCoordinateFromPixel([
        endPixel[0] - arrowSize,
        endPixel[1] - arrowSize
      ]);
      var lineStr1 = new LineString([end, end1]);
      lineStr1.rotate(rotation, end);
      var lineStr2 = new LineString([end, end2]);
      lineStr2.rotate(rotation, end);

      var stroke = new Stroke({
        color: style.stroke,
        width: style.width
      });

      styles.push(
        new Style({
          geometry: lineStr1,
          stroke: stroke
        })
      );
      styles.push(
        new Style({
          geometry: lineStr2,
          stroke: stroke
        })
      );
    }

    if (style.arrow.showArrow.indexOf('left') > -1) {
      end = allCoordinates[0];
      start = allCoordinates[1];
      dx = end[0] - start[0];
      dy = end[1] - start[1];
      rotation = Math.atan2(dy, dx);
      // arrows
      endPixel = map.getPixelFromCoordinate(end);
      end1 = map.getCoordinateFromPixel([
        endPixel[0] - arrowSize,
        endPixel[1] + arrowSize
      ]);
      end2 = map.getCoordinateFromPixel([
        endPixel[0] - arrowSize,
        endPixel[1] - arrowSize
      ]);
      lineStr1 = new LineString([end, end1]);
      lineStr1.rotate(rotation, end);
      lineStr2 = new LineString([end, end2]);
      lineStr2.rotate(rotation, end);

      stroke = new Stroke({
        color: style.stroke,
        width: style.width
      });

      styles.push(
        new Style({
          zIndex: style.zIndex,
          geometry: lineStr1,
          stroke: stroke
        })
      );
      styles.push(
        new Style({
          zIndex: style.zIndex,
          geometry: lineStr2,
          stroke: stroke
        })
      );
    }
  }
};
export { pushArrowToLine, pushTriangleArrowToLine, pushLineArrowToLine };
