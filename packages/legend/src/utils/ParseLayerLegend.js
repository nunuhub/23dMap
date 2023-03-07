import axios from 'shinegis-client-23d/src/utils/request';
import { indexOf } from 'shinegis-client-23d/src/utils/common';
import {
  addParamByData,
  addParamToUrl,
  appendPath
} from 'shinegis-client-23d/src/utils/uitls';

export default function parseLayerLegend(lyrInfo, imgSize) {
  let origin = lyrInfo.serverOrigin;
  if (lyrInfo.symbol && Object.keys(lyrInfo.symbol).length > 0) {
    return parseSymbolLegend(lyrInfo);
  } else {
    if (origin === 'arcgis' && lyrInfo.isShowLegend !== false) {
      if (lyrInfo.type === 'wms' || lyrInfo.type === 'wfs') {
        return axiosGeoLegend(lyrInfo, imgSize);
      } else {
        return axiosArcLegend(lyrInfo);
      }
    } else if (origin === 'geoserver' && lyrInfo.isShowLegend !== false) {
      return axiosGeoLegend(lyrInfo, imgSize);
    }
  }
}
// 解析自定义样式图层的图例
function parseSymbolLegend(info) {
  return new Promise((resolve) => {
    let symbol = info.symbol;
    let layer = {
      legend: []
    };
    //分段样式
    if (symbol.styleStepOptions && symbol.styleStepOptions.length > 0) {
      let minValue = symbol.minValue;
      if (minValue === null) {
        minValue = Number.MIN_VALUE;
      }
      let field = symbol.styleField;
      for (let i = 0; i < symbol.styleStepOptions.length; i++) {
        let styleStepOption = symbol.styleStepOptions[i];
        let legend = {
          ...symbol.styleOptions,
          ...styleStepOption.style
        };
        let minValueOpeare = i === 0 ? '>=' : '>';
        if (info.type.indexOf('wfs') > -1) {
          legend.filter = {
            type: 'and',
            param: [
              {
                type: '<=',
                param: [field, styleStepOption.value]
              },
              {
                type: minValueOpeare,
                param: [field, minValue]
              }
            ]
          };
        } else {
          legend.filter = `${field} <= ${styleStepOption.value} and ${field} ${minValueOpeare} ${minValue}`;
        }
        legend.value = styleStepOption.value;
        legend.label =
          minValue === styleStepOption.value
            ? minValue
            : `${minValue} - ${styleStepOption.value}`;
        minValue = styleStepOption.value;
        layer.legend.push(legend);
      }
      layer.isExistFilter = true;
    }
    //分值样式
    else if (symbol.styleFieldOptions) {
      let valueArray = Object.keys(symbol.styleFieldOptions);
      let field = symbol.styleField;
      if (valueArray.length > 0) {
        for (let i = 0; i < valueArray.length; i++) {
          let value = valueArray[i];
          let legend = {
            ...symbol.styleOptions,
            ...symbol.styleFieldOptions[value]
          };
          if (info.type.indexOf('wfs') > -1) {
            legend.filter = {
              type: '=',
              param: [field, value]
            };
          } else {
            legend.filter = `${field} = '${value}'`;
          }
          legend.value = value;
          legend.label = value;
          layer.legend.push(legend);
        }
        layer.isExistFilter = true;
      }
    }
    //简单样式
    else {
      let legend = JSON.parse(JSON.stringify(symbol.styleOptions));
      legend.label = info.label;
      layer.legend.push(legend);
    }
    let dataObj = {
      isShow: true,
      title: info.label,
      layers: [layer],
      type: 'symbol',
      symbolType: symbol.type,
      info: info,
      id: info.id,
      isShowChildFilter: true
    };
    resolve(dataObj);
  });
}
// 请求arcgis服务图例
function axiosArcLegend(info) {
  return new Promise((resolve, reject) => {
    let url = appendPath(info.url, 'legend');
    url = addParamToUrl(url, 'f', 'json');
    url = addParamByData(url, info);
    axios
      .get(url, {
        headers: {
          'Content-Type': ''
        }
      })
      .then((result) => {
        let data = result.data;
        if (data) {
          let layers = data.layers;
          if (layers && layers.length > 0) {
            let id = info.id;
            //根据图层可见图层以及可视图例 选择显示的图例
            let legendIds =
              info.legendLayers && info.legendLayers.length > 0
                ? info.legendLayers
                : info.visibleLayers;
            if (info.type === 'wmts') {
              legendIds = ['0'];
            }
            let trueLayers = getArcLegendById(legendIds, layers);
            let filterPromiseArray = [];
            for (let layer of trueLayers) {
              if (layer.legend.length > 1) {
                if (
                  info.type === 'dynamic' ||
                  info.type === 'feature' ||
                  info.type === 'feature-pbf'
                ) {
                  layer.isExistFilter = true;
                  filterPromiseArray.push(getArcFilter(layer, info));
                }
              } else {
                layer.isSingleLegend = true;
              }
            }
            let dataObj = {
              isShow: true,
              title: info.label,
              layers: trueLayers,
              type: 'arcgis',
              info: info,
              id: id,
              isShowChildFilter: true
            };
            resolve(dataObj);
            //this.resize();
          } else {
            console.warn(data.error);
            reject('请求成功但是没有图例数据');
          }
        } else {
          reject('请求成功但是没有图例数据');
        }
      })
      .catch(() => {
        reject('图例请求失败');
      });
  });
}
function getArcLegendById(ids, legends) {
  let result = [];
  if (ids?.length > 0 && legends?.length > 0) {
    for (let legend of legends) {
      if (indexOf(ids, legend.layerId) > -1) {
        for (let item of legend.legend) {
          if (!item.label) {
            item.label = legend.layerName;
          }
        }
        result.push(legend);
      }
    }
  }
  return result;
}
function getArcFilter(layer, info) {
  return new Promise((resolve, reject) => {
    let url = appendPath(info.url, layer.layerId + '');
    url = addParamToUrl(url, 'f', 'json');
    url = addParamByData(url, info);
    axios
      .get(url, {
        headers: {
          'Content-Type': ''
        }
      })
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
        if (json.drawingInfo) {
          let renderer = json.drawingInfo.renderer;
          let type = renderer.type;
          if (type === 'uniqueValue') {
            let defaultLabel = renderer.defaultLabel;
            let field1 = renderer.field1;
            let field2 = renderer.field2;
            let field3 = renderer.field3;
            let otherLegendIndex = -1;
            let otherFilterArray = [];
            for (let i = 0; i < layer.legend.length; i++) {
              let legend = layer.legend[i];
              if (
                legend.label === '<all other values>' ||
                legend.label === defaultLabel
              ) {
                legend.label = '其他';
                otherLegendIndex = i;
              } else {
                let values = legend.values;
                if (values) {
                  let labelArray = values[0].split(',');
                  legend.filter = `${field1} = '${labelArray[0]}'`;
                  let otherFilter = `${field1} <> '${labelArray[0]}'`;
                  if (field2 && labelArray.length > 1) {
                    legend.filter += ` and ${field2} = '${labelArray[1]}'`;
                    otherFilter += ` and ${field2} <> '${labelArray[1]}'`;
                  }
                  if (field3 && labelArray.length > 2) {
                    legend.filter += ` and ${field3} = '${labelArray[2]}'`;
                    otherFilter += ` and ${field3} <> '${labelArray[2]}'`;
                  }
                  otherFilterArray.push(otherFilter);
                }
              }
            }
            if (otherLegendIndex > -1 && otherFilterArray.length > 0) {
              layer.legend[otherLegendIndex].filter =
                otherFilterArray.join(' and ');
            }
            resolve();
          } else if (type === 'classBreaks') {
            let minValue = renderer.minValue
              ? renderer.minValue
              : Number.MIN_VALUE;
            let field = renderer.field;
            for (let i = 0; i < layer.legend.length; i++) {
              let legend = layer.legend[i];
              let values = legend.values;
              let minValueOpeare = i === 0 ? '>=' : '>';
              if (values) {
                legend.filter = `${field} <= ${values[0]} and ${field} ${minValueOpeare} ${minValue}`;
                minValue = values[0];
                /*if (field2 && labelArray.length > 1) {
                  legend.filter += ` and ${field2} = '${labelArray[1]}'`;
                }
                if (field3 && labelArray.length > 2) {
                  legend.filter += ` and ${field3} = '${labelArray[2]}'`;
                }*/
              }
            }
            resolve();
          }
        }
      })
      .catch(() => {
        reject('arcgis子图层过滤条件获取失败', info.label);
      });
  });
}

// 请求geoserver服务图例
function axiosGeoLegend(info, imgSize) {
  return new Promise((resolve, reject) => {
    let url = info.url;
    let id = info.id;
    let lyrName = info.visibleLayers[0];
    if (info.legendLayers && info.legendLayers.length > 0) {
      // GetLegendGraphic不支持多个Layer用逗号隔开的写法，暂时这样改。只支持从图层组变成其中1个图层，不支持2,3个图层
      lyrName = info.legendLayers[0];
    }
    let pStr = `service=WMS&version=1.1.0&request=GetLegendGraphic&layer=${lyrName}&format=application/json`;
    if (info.authkey) {
      pStr += '&authkey=' + info.authkey;
    }
    url = url.includes('?') ? url + '&' + pStr : url + '?' + pStr;
    axios
      .get(url)
      .then((data) => {
        if (data.data.Legend) {
          let legend = data.data ? data.data.Legend : null;
          if (legend && legend.length > 0) {
            legend.forEach((lg) => {
              lg.isExistFilter = !!lg.rules[0]?.filter;
              lg.legend = [];
              lg.rules.forEach((rule) => {
                rule.label = rule.title;
                if (!rule.label) {
                  rule.label = lg.title;
                }
                if (!rule.label) {
                  rule.label = lg.name;
                }
                /*if (rule.filter) {
                  rule.filter = rule.filter.replace('[', '').replace(']', '');
                }*/
                lg.legend.push(rule);
              });
            });

            /*let isShowChildFilter = !(
              legend.length > 1 && !legend[0]?.rules[0]?.filter
            );*/

            let dataObj = {
              isShow: true,
              title: info.label,
              layers: legend,
              type: 'geoserver',
              id: id,
              info: info,
              isShowChildFilter: true
            };
            resolve(dataObj);
          } else {
            reject();
          }
        } else {
          let requestSize = imgSize ? imgSize : 25;
          pStr = `service=WMS&version=1.1.0&request=GetLegendGraphic&layer=${lyrName}&width=${requestSize}&height=${requestSize}&format=image/png`;
          if (info.authkey) {
            pStr += '&authkey=' + info.authkey;
          }
          // 服务不支持json图例，改用img格式
          var graphicUrl = info.url.includes('?')
            ? info.url + '&' + pStr
            : info.url + '?' + pStr;
          let imgLegend = [
            {
              layerName: info.visibleLayers[0],
              legend: [
                {
                  src: graphicUrl
                }
              ]
            }
          ];
          let dataObj = {
            isShow: true,
            title: info.label,
            layers: imgLegend,
            type: 'geoserver',
            isLowVersion: true,
            info: info,
            isShowChildFilter: false,
            id: id
          };
          resolve(dataObj);
        }
      })
      .catch((err) => {
        this.loading = false;
        let errStr = err + '';
        if (errStr.includes('NullPointerException')) {
          console.error(info.label + ' 服务不支持json图例');
        }
        reject(errStr);
      });
  });
}
