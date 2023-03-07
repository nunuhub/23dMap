import IdentifyParameters from './geoserver/IdentifyParameters';
import IdentifyTask from './geoserver/IdentifyTask';
import EsriIdentify from './esri/Identify';
import { cloneDeep } from 'lodash-es';

/**
 * 判断是否满足地图缩放层级条件
 * @param {*} param0
 * @param {*} identifyZoom 地图层级
 */
export function judgeZoomLimit({ map, viewer }, identifyZoom) {
  if (identifyZoom == null) return true;
  if (map) {
    return map.getView().getZoom() > identifyZoom;
  } else {
    const alti = viewer.camera.positionCartographic.height;
    return viewer.shine.getLevel(alti) > identifyZoom;
  }
}

/**
 *  geoserver服务查询任务
 * @param layerInfo 图层配置信息
 * @param position 查询位置信息 geojson
 * @param options 其他信息
 * @private
 */
export function getGeoServerIdentifyTask(
  layerInfo,
  position,
  { map, viewer },
  options = {}
) {
  const identifyField = layerInfo.identifyField?.filter(
    (ele) => ele.isOpenSearch !== false
  );
  if (
    layerInfo.group === '2' &&
    identifyField?.length > 0 &&
    judgeZoomLimit({ map, viewer }, layerInfo.identifyZoom)
  ) {
    const params = new IdentifyParameters(
      layerInfo,
      position,
      { map, viewer },
      options
    );
    const identifyTask = new IdentifyTask();
    return identifyTask.execute(params);
  }
}

/**
 * arcgis服务查询任务
 * @param layerInfo 图层配置信息
 * @param position 查询位置信息 geojson
 * @param options 其他信息
 * @private
 */
export function getArcgisIdentifyTask(
  layerInfo,
  position,
  { map, viewer },
  options = {}
) {
  const identifyField = layerInfo.identifyField?.filter(
    (ele) => ele.isOpenSearch !== false
  );
  if (
    layerInfo.group === '2' &&
    identifyField?.length > 0 &&
    judgeZoomLimit({ map, viewer }, layerInfo.identifyZoom)
  ) {
    // 配置的所有图层的查询地址数组
    let queryUrlArray = identifyField;
    // 执行查询的URL
    let index = queryUrlArray[0].lyr.lastIndexOf('/');
    let queryURL = queryUrlArray[0].lyr.slice(0, index);
    //查询图层id和identifyField的index做下绑定
    // 要查询的子图层
    let layerIds = 'visible:';
    for (let n = 0, l = queryUrlArray.length; n < l; n++) {
      let layerId = Number(
        queryUrlArray[n].lyr.slice(index + 1, queryUrlArray[n].lyr.length)
      );
      //给identifyField存一个临时layerId,后续绑定结果要用
      queryUrlArray[n].layerId = layerId;
      layerIds += layerId + ',';
    }
    layerIds = layerIds.substring(0, layerIds.length - 1);
    let queryOption = {
      layers: layerIds
    };
    if (layerInfo.layerDefs) {
      queryOption.layerDefs = layerInfo.layerDefs;
    }
    if (layerInfo.authkey) {
      queryOption.authkey = layerInfo.authkey;
    }
    let identifyTask = new EsriIdentify(queryURL, queryOption, layerInfo);

    identifyTask.at(position, { map, viewer }, options);
    return identifyTask.run();
  }
}

// 临时兼容旧版formConfig配置
export function compatibleOldFormConfig(data) {
  const layerInfo = cloneDeep(data);
  if (layerInfo.formConfig && layerInfo.identifyField.length) {
    const filed = layerInfo.formConfig.filed.split(',');
    const mapping = layerInfo.formConfig.mapping.split(',');
    const length = Math.min(filed.length, mapping.length);
    const url = layerInfo.formConfig.formUrl;
    const flag = url.indexOf('?') > -1 ? '&' : '?';
    let ext = '';
    for (let i = 0; i < length; i++) {
      ext += `&${filed[i]}={${mapping[i]}}`;
    }
    ext = ext.substring(1, ext.length);
    const newFormConfig = {
      formUrl: url + flag + ext,
      name: layerInfo.formConfig.name
    };
    layerInfo.identifyField = layerInfo.identifyField.map((ele) => {
      if (!ele.formConfig) {
        return {
          ...ele,
          formConfig: [newFormConfig]
        };
      } else {
        return ele;
      }
    });
    return layerInfo;
  } else {
    return data;
  }
}
