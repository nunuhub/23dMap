import axios from '../../../request';
import Color from 'color';

//todo 完善esriLineType(esri线的样式)
const esriLineType = {
  esriSLSSolid: 'solid'
};

export default function getSymbolFromServer(url) {
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
            reject(new Error('当前用户没权限,请联系管理员'));
            return;
          }
        } else {
          json = response;
        }
        let f =
          json.supportedQueryFormats?.toLowerCase()?.indexOf('pbf') > -1
            ? 'pbf'
            : 'json';
        let geometryType = json.geometryType;
        if (json.drawingInfo) {
          let renderer = json.drawingInfo.renderer;
          let type = renderer.type;
          if (type === 'simple') {
            let symbol = renderer.symbol;
            if (symbol) {
              let style = {
                type: getSymbolType(geometryType)
              };
              style.styleOptions = parseStyle(symbol, geometryType);
              resolve({ style, f });
            }
          } else if (type === 'uniqueValue') {
            let symbol = renderer.defaultSymbol;
            let style = {
              type: getSymbolType(geometryType)
            };
            if (symbol) {
              style.styleOptions = parseStyle(symbol, geometryType);
            }
            style.styleField = getTrueField(json.fields, renderer.field1);
            style.styleField2 = getTrueField(json.fields, renderer.field2);
            style.styleField3 = getTrueField(json.fields, renderer.field3);
            style.styleFieldOptions = {};
            for (let uniqueValueInfo of renderer.uniqueValueInfos) {
              style.styleFieldOptions[uniqueValueInfo.value] = parseStyle(
                uniqueValueInfo.symbol,
                geometryType
              );
            }
            //针对空字符串的配置进行特殊处理,把空字符串设置为默认样式
            if (style.styleFieldOptions['']) {
              style.styleOptions = style.styleFieldOptions[''];
            }
            resolve({ style, f });
          } else if (type === 'classBreaks') {
            let symbol = renderer.defaultSymbol;
            let style = {
              type: getSymbolType(geometryType)
            };
            if (symbol) {
              style.styleOptions = parseStyle(symbol, geometryType);
            }
            style.styleField = renderer.field;
            style.styleStepOptions = [];
            style.minValue = renderer.minValue
              ? renderer.minValue
              : Number.MIN_VALUE;
            for (let classBreakInfo of renderer.classBreakInfos) {
              style.styleStepOptions.push({
                value: classBreakInfo.classMaxValue,
                style: parseStyle(classBreakInfo.symbol, geometryType)
              });
            }
            resolve({ style, f });
          }
        }
      })
      .catch(() => {
        reject(new Error('图层无法获取样式配置，请检查可见图层是否正常!'));
      });
  });
}

function getSymbolType(geometryType) {
  switch (geometryType) {
    case 'esriGeometryPolygon':
      return 'polygon';
    case 'esriGeometryPolyline':
      return 'polyline';
    case 'esriGeometryPoint':
      return 'point';
    default:
      return 'polygon';
  }
}

function parseStyle(symbol, geometryType) {
  switch (geometryType) {
    case 'esriGeometryPolygon':
      return parsePolygonStyle(symbol);
    case 'esriGeometryPolyline':
      return parsePolylineStyle(symbol);
    case 'esriGeometryPoint':
      return parsePointStyle(symbol);
    default:
      return parsePolygonStyle(symbol);
  }
}

function parsePolygonStyle(symbol) {
  if (symbol) {
    let style = {};
    if (symbol.color?.length === 4) {
      style.fill = true;
      style.color = colorToHex(symbol.color);
      style.opacity = symbol.color[3] / 255;
    }
    if (symbol.outline?.color?.length === 4) {
      style.outline = true;
      style.outlineColor = colorToHex(symbol.outline.color);
      style.outlineOpacity = symbol.outline.color[3] / 255;
      style.outlineWidth = symbol.outline.width;
    }
    return style;
  } else {
    return {
      fill: true,
      color: 'rgba(245,245,245)',
      opacity: 0.8,
      outline: true,
      outlineColor: 'rgb(200,200,200)',
      outlineWidth: 1,
      outlineOpacity: 1
    };
  }
}

function parsePolylineStyle(symbol) {
  if (symbol) {
    let style = {};
    if (symbol.color?.length === 4) {
      style.lineType = esriLineType[symbol.style]
        ? esriLineType[symbol.style]
        : 'solid';
      style.width = symbol.width;
      style.color = colorToHex(symbol.color);
      style.opacity = symbol.color[3] / 255;
    }
    return style;
  } else {
    return {
      fill: true,
      color: 'rgba(245,245,245)',
      opacity: 0.8,
      outline: true,
      outlineColor: 'rgb(200,200,200)',
      outlineWidth: 1,
      outlineOpacity: 1
    };
  }
}

function parsePointStyle(symbol) {
  if (symbol) {
    let style = {};
    if (symbol.type === 'esriSMS') {
      //todo esriSMS中只解析了style为esriSMSCircle的类型 还未解析其他类型
      style.width = symbol.width;
      style.radius = symbol.size;
      style.color = colorToHex(symbol.color);
      style.opacity = symbol.color[3] / 255;
      if (symbol.outline?.color?.length === 4) {
        style.outlineColor = colorToHex(symbol.outline.color);
        style.outlineOpacity = symbol.outline.color[3] / 255;
        style.outlineWidth = symbol.outline.width ? symbol.outline.width : 1;
      }
    } else if (symbol.type === 'esriPMS') {
      style.image = 'data:image/jpg;base64,' + symbol.imageData;
      //todo width转化为scale, openlayer的size会裁剪 只能计算scale
      //style.width = symbol.width;
      //style.height = symbol.height;
    }
    //todo 解析其他类型

    //解析注记
    if (symbol.labelingInfo && symbol.labelingInfo.length > 0) {
      let labelingInfo = symbol.labelingInfo[0];
      let labelSymbol = labelingInfo.symbol;
      style.label = {
        text: labelingInfo.labelExpression.replace('[', '{').replace(']', '}'),
        font_size: labelSymbol.font?.size,
        color: colorToHex(labelSymbol.color),
        opacity: labelSymbol.color[3] / 255,
        border: true,
        border_color: '#000000',
        pixelOffset: [labelSymbol.xoffset, labelSymbol.yoffset],
        showBackground: true,
        backgroundColor: '#000000',
        background_opacity: 0.5
      };
      if (labelSymbol.backgroundColor) {
        style.label.showBackground = true;
        style.label.backgroundColor = colorToHex(labelSymbol.backgroundColor);
        style.label.background_opacity = labelSymbol.backgroundColor[3] / 255;
      }
      if (labelSymbol.borderLineColor) {
        style.label.border = true;
        style.label.border_color = colorToHex(labelSymbol.borderLineColor);
        style.label.border_opacity = labelSymbol.borderLineColor[3] / 255;
        style.label.border_width = labelSymbol.borderLineSize;
      }
      //todo 解析minScale和maxScale转化为distanceDisplayCondition
    }
    return style;
  } else {
    return {
      color: '#ffffff',
      pixelSize: 1,
      outlineColor: '#FED976',
      outlineWidth: 1
    };
  }
}
function colorToHex(color) {
  return Color(color).hex();
}

function getTrueField(fields, field) {
  if (field) {
    for (let item of fields) {
      if (item.name === field) {
        return field;
      }
    }
    for (let item of fields) {
      if (item.alias === field) {
        return item.name;
      }
    }
    console.warn('Feature样式解析:没有匹配的字段');
    return field;
  } else {
    return null;
  }
}
