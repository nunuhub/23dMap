import axios from '../../../request';
import Color from 'color';

export default function getSymbolFromVectorTiledServer(url) {
  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        response = response.headers ? response.data : response;
        let json = '';
        if ((typeof response).toLowerCase() === 'string') {
          try {
            json = JSON.parse(response);
          } catch (e) {
            reject('当前用户没权限,请联系管理员');
            return;
          }
        } else {
          json = response;
        }
        if (json.layers) {
          if (json.layers.length === 1) {
            let paint = json.layers[0].paint;
            let symbol = {
              styleOptions: parsePaint(paint)
            };
            resolve(symbol);
          } else if (json.layers.length > 1) {
            // arcgis中filter应该可以针对不同字段做限制，这边就取了第一个filter的字段,默认值也为第一个paint, filter[0]也全当成==处理了,其他格式暂时未处理
            let symbol = {
              styleField: json.layers[0].filter[1],
              styleFieldOptions: {},
              styleOptions: parsePaint(json.layers[0].paint)
            };
            for (let layer of json.layers) {
              let paint = layer.paint;
              //字段一致才处理
              if (layer.filter[1] === symbol.styleField) {
                symbol.styleFieldOptions[layer.filter[2]] = parsePaint(paint);
              }
            }
            resolve(symbol);
          }
        }
      })
      .catch(() => {
        reject('图层无法获取样式配置，请检查可见图层是否正常!');
      });
  });
}

function parsePaint(paint) {
  return {
    color: colorToHex(paint['fill-color']),
    opacity: getAlphaByColor(paint['fill-color']),
    outlineColor: colorToHex(paint['fill-outline-color']),
    outlineWidth: 1,
    outlineOpacity: getAlphaByColor(paint['fill-outline-color'])
  };
}

function colorToHex(color) {
  return Color(color).hex();
}
function getAlphaByColor(color) {
  return Color(color).alpha();
}
