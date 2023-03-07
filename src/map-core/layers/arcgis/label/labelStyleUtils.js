import { Stroke, Fill, Style } from 'ol/style';
import Text from 'ol/style/Text';

const getLabelStyle = (style, text) => {
  const fontSize = style && style.fontSize ? style.fontSize : 18;
  const fontColor = style && style.fontColor ? style.fontColor : '#333';
  const strokeColor = style && style.strokeColor ? style.strokeColor : '#fff';
  const geoStyle = new Style({
    text: new Text({
      font: fontSize + 'px serif',
      text: text,
      fill: new Fill({
        color: fontColor
      }),
      stroke: new Stroke({
        color: strokeColor,
        width: 3
      }),
      offsetY: -(fontSize / 2 + 8)
    })
  });
  return geoStyle;
};
export { getLabelStyle };
