import { Style } from 'ol/style';

const getPolygonStyle = style => {
  /* let strokeStyle
    if (style.type == 'polyline'){
        strokeStyle = {
            color: style.polyStroke,
            width: style.strokeWidth
        }
    } else {
        strokeStyle = {
            color: style.polyStroke,
            width: style.strokeWidth,
            lineCap: 'butt',
            lineDash: [style.dashHeight, style.dashDivide],
            lineDashOffset: style.dashDivide
        }
    }
    return new Style({
        fill: new Fill({
            color: style.fill,
        }),
        stroke: new Stroke(strokeStyle)
    })*/

  return new Style({
    zIndex: style.zIndex,
    renderer: (_coords, state) => {
      try {
        const ctx = state.context;
        // 面填充色
        ctx.fillStyle = style.fill;
        // 描边色
        if (style.type === 'polyline') {
          ctx.lineDashOffset = 0;
          ctx.setLineDash([]);
        } else {
          ctx.lineDashOffset = style.dashDivide;
          ctx.setLineDash([style.dashHeight, style.dashDivide]);
        }
        ctx.strokeStyle = style.polyStroke;
        ctx.lineWidth = style.strokeWidth;
        // 阴影
        if (style.shadow && style.shadow.isShow) {
          ctx.shadowBlur = style.shadow.blur;
          ctx.shadowColor = style.shadow.color;
        } else {
          ctx.shadowBlur = 0;
          ctx.shadowColor = 'rbga(0, 0, 0, 0)';
        }
        // 绘制
        let coordinates = _coords[0];
        if (coordinates) {
          let startPoint = coordinates[0];
          ctx.beginPath();
          ctx.moveTo(startPoint[0], startPoint[1]);

          for (var i = 1; i < coordinates.length; i++) {
            let coordinate = coordinates[i];
            ctx.lineTo(coordinate[0], coordinate[1]);
          }
          ctx.lineTo(startPoint[0], startPoint[1]);
          ctx.fill();
          ctx.stroke();
        }
        // 还原canvas
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'rbga(0, 0, 0, 0)';
      } catch (e) {}
    }
  });
};
export { getPolygonStyle };
