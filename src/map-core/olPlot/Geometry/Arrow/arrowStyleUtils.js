import { Style } from 'ol/style';
import * as ArrowTypes from '../../../olPlot/Geometry/Arrow/ArrowTypes';

const getArrowStyle = (style, map, arrowType) => {
  return new Style({
    zIndex: style.zIndex,
    renderer: (_coords, state) => {
      try {
        const ctx = state.context;
        var geom = state.geometry;
        // 计算渐变分辨率
        const extent = geom.getExtent();
        const pixel1 = map.getPixelFromCoordinate([extent[0], extent[1]]);
        const pixel2 = map.getPixelFromCoordinate([extent[2], extent[3]]);

        if (style.isGradient) {
          // 生成渐变配置
          var grad;
          if (arrowType === ArrowTypes.LEFT || arrowType === ArrowTypes.RIGHT) {
            grad = ctx.createLinearGradient(
              pixel1[0] * state.pixelRatio,
              0,
              pixel2[0] * state.pixelRatio,
              0
            );
          } else {
            grad = ctx.createLinearGradient(
              0,
              pixel1[1] * state.pixelRatio,
              0,
              pixel2[1] * state.pixelRatio
            );
          }
          if (
            arrowType === ArrowTypes.LEFT ||
            arrowType === ArrowTypes.BOTTOM
          ) {
            for (const gradient of style.gradients) {
              grad.addColorStop(gradient.offset, gradient.color);
            }
          } else {
            for (const gradient of style.gradients) {
              grad.addColorStop(1 - gradient.offset, gradient.color);
            }
          }
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = style.fill;
        }
        ctx.lineDashOffset = 0;
        ctx.setLineDash([]);
        ctx.strokeStyle = style.polyStroke;
        ctx.lineWidth = style.strokeWidth;
        // 绘制
        const coordinates = _coords[0];
        const startPoint = coordinates[0];
        ctx.beginPath();
        ctx.moveTo(startPoint[0], startPoint[1]);

        for (var i = 1; i < coordinates.length; i++) {
          const coordinate = coordinates[i];
          ctx.lineTo(coordinate[0], coordinate[1]);
          // console.log(coordinate[0], coordinate[1]);
        }
        ctx.lineTo(startPoint[0], startPoint[1]);
        ctx.fill();
        ctx.stroke();
      } catch (e) {}
    }
  });
};
export { getArrowStyle };
