import EsriPbfParse from './EsriPbfParse';
import EsriJsonParse from '../../plug/esri-pbf/EsriJsonParse';

/**
 * 请求arcgis Feature的pbf格式
 * 返回结果returnExceededLimitFeatures为true时,会自动拆分，但是仅拆分一次，后续看需求
 * @param data 图层LayerInfo
 * @param f 请求返回的格式支持pbf,json
 * @param extent 切片范围
 * @param geometry 切片中请求范围 默认与extent一致，但是当返回结果中returnExceededLimitFeatures为true时，
 *                 代表请求中feature数据量过大无法返回，需要拆分extent，此时geometry为拆分后的extent，拆分的越细致，features越全，该方法默认拆9块
 * @param resolution 切片分辨率
 * @param projection 坐标系
 * @param returnExceededLimitFeatures 在feature数据量过大是否返回数据（即使为true也只是返回了在范围内的数据，数据丢失）
 * @returns {Promise}
 */
export function queryFeatureByPbf({
  data,
  visibleLayer,
  f,
  extent,
  geometry,
  resolution,
  projection,
  returnExceededLimitFeatures
}) {
  return new Promise((resolve) => {
    let wkid = projection.getCode().split(':')[1];
    let quantizationParameters =
      f === 'pbf'
        ? {
            mode: 'view',
            originPosition: 'upperLeft',
            tolerance: resolution,
            extent: {
              xmin: extent[0],
              ymin: extent[1],
              xmax: extent[2],
              ymax: extent[3],
              spatialReference: { wkid: wkid }
            }
          }
        : '';
    let params = {
      f: f,
      returnGeometry: true,
      spatialRel: 'esriSpatialRelIntersects',
      where: data.where,
      geometry: {
        xmin: geometry[0],
        ymin: geometry[1],
        xmax: geometry[2],
        ymax: geometry[3],
        spatialReference: { wkid: wkid }
      },
      geometryType: 'esriGeometryEnvelope',
      inSR: wkid,
      outFields: '*',
      returnCentroid: 'false',
      returnExceededLimitFeatures: returnExceededLimitFeatures,
      outSR: wkid,
      resultType: 'tile',
      quantizationParameters: quantizationParameters
    };
    if (data.authkey) {
      params.authkey = data.authkey;
    }
    var url = data.url + '/' + visibleLayer + '/query?';
    for (var param in params) {
      if (typeof params[param] === 'object') {
        params[param] = encodeURIComponent(JSON.stringify(params[param]));
      }
      url = url + param + '=' + params[param] + '&';
    }
    url = url.slice(0, -1);
    var xhr = new XMLHttpRequest();
    xhr.responseType = f === 'pbf' ? 'arraybuffer' : 'json';
    xhr.open('GET', url);
    /* var onError = function() {
            vectorSource.removeLoadedExtent(extent);
          };
          xhr.onerror = onError;*/
    xhr.onload = function () {
      if (xhr.status === 200) {
        // dataProjection will be read from document
        let result =
          f === 'pbf'
            ? EsriPbfParse(xhr.response)
            : EsriJsonParse(xhr.response);
        // result.exceededTransferLimit为true代表需要拆分，returnExceededLimitFeatures为false,代表已有结果无需拆分。
        if (result.exceededTransferLimit && !returnExceededLimitFeatures) {
          let extentArray = splitExtend(extent);
          let promiseArray = [];
          for (let extentChild of extentArray) {
            // exceededTransferLimit为true,仅拆分一次，false可以递归拆分(但是false在层级较低时会造成死循环)
            promiseArray.push(
              queryFeatureByPbf({
                data,
                visibleLayer,
                f,
                extent,
                geometry: extentChild,
                resolution,
                projection,
                returnExceededLimitFeatures: true
              })
            );
          }
          Promise.all(promiseArray).then((resultArray) => {
            let features = [];
            for (let item of resultArray) {
              features.push(item);
            }
            resolve(features);
          });
        } else {
          //var features = new GeoJSON().readFeatures(result.featureCollection);
          resolve(result.featureCollection);
        }
      }
    };
    xhr.send();
  });
}

function splitExtend(extent) {
  let xmin = extent[0];
  let ymin = extent[1];
  let xmax = extent[2];
  let ymax = extent[3];
  let diffX = (xmax - xmin) / 3;
  let diffY = (ymax - ymin) / 3;
  let extentArray = [];
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      let newXMin = xmin + x * diffX;
      let newYMin = ymin + y * diffY;
      let newXMax = xmin + (x + 1) * diffX;
      let newYMax = ymin + (y + 1) * diffY;
      extentArray.push([newXMin, newYMin, newXMax, newYMax]);
    }
  }
  return extentArray;
}
