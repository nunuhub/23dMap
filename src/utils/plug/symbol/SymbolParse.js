import getSymbolFromServer from './esri/FeatureSymbolParse';
import { addParamByData, addParamToUrl, appendPath } from '../../uitls';
import getSymbolFromVectorTiledServer from './esri/VectorTiledSymbolParse';

const MODE_OVERWRITE = 0;
const MODE_CREATE = 1;
const MODE_MERGE = 2;
export function symbolParse(data) {
  return new Promise((resolve, reject) => {
    let mode;
    if (data.symbol) {
      mode = data.symbol.merge ? MODE_MERGE : MODE_OVERWRITE;
    } else {
      mode = MODE_CREATE;
    }
    if (mode === MODE_OVERWRITE) {
      resolve();
    } else {
      switch (data.type) {
        case 'feature':
        case 'feature-pbf': {
          //todo 多个子图层的情况没做处理
          let requestUrl = appendPath(
            getProxy(data) + data.url,
            data.visibleLayers[0]
          );
          requestUrl = addParamToUrl(requestUrl, 'f', 'json');
          requestUrl = addParamByData(requestUrl, data);
          getSymbolFromServer(requestUrl)
            .then(({ style, f }) => {
              if (data.type === 'feature-pbf' && !data.supportedQueryFormat) {
                data.supportedQueryFormat = f;
              }
              let serverSymbol = add3dDefaultParam(style);
              data.symbol =
                mode === MODE_MERGE
                  ? { ...serverSymbol, ...data.symbol }
                  : serverSymbol;
              resolve();
            })
            .catch((e) => {
              reject(e);
            });
          break;
        }
        case 'vectorTiled': {
          let defaultStyles = data.defaultStyles
            ? data.defaultStyles
            : 'resources/styles';
          let styleUrl = getProxy(data) + data.url + '/' + defaultStyles;
          styleUrl = addParamByData(styleUrl, data);
          getSymbolFromVectorTiledServer(styleUrl).then((symbol) => {
            let serverSymbol = add3dDefaultParam(symbol);
            data.symbol =
              mode === MODE_MERGE
                ? { ...serverSymbol, ...data.symbol }
                : serverSymbol;
            resolve();
          });
          break;
        }
        default:
          resolve();
          break;
      }
    }
  });
}
function getProxy(data) {
  if (data.isProxy) {
    return data.proxyPath ? data.proxyPath : '/gisqBI/api/gis/proxy?';
  } else {
    return '';
  }
}

function add3dDefaultParam(symbol) {
  if (!symbol.styleOptions) {
    symbol.styleOptions = {};
  }
  symbol.styleOptions.clampToGround = true;
  symbol.styleOptions.classificationType = 2;
  return symbol;
}
