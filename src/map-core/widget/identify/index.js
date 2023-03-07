import Point from 'ol/geom/Point';
import { v4 as uuidv4 } from 'uuid';
import Observable from 'ol/Observable';
import Event from 'ol/events/Event.js';
import { Draw } from 'ol/interaction.js';
import { createBox } from 'ol/interaction/Draw';
import { getCenter } from 'ol/extent';
import { Fill, Stroke, Style } from 'ol/style';
import { asArray } from 'ol/color';
import Feature from 'ol/Feature';
import { getPointResolution } from 'ol/proj';
import ProjUnits from 'ol/proj/Units';
import LayerGroup from 'ol/layer/Group';
import { buffer as turfBuffer, booleanIntersects } from '@turf/turf';
import {
  getArcgisIdentifyTask,
  getGeoServerIdentifyTask,
  compatibleOldFormConfig,
  judgeZoomLimit
} from 'shinegis-client-23d/src/utils/tasks/common';
import GeoJSON from 'ol/format/GeoJSON';

const geojsonFormat = new GeoJSON();

const IdentifyEventType = {
  /**
   * 功能打开关闭时触发
   */
  CHANGEACTIVE: 'change:active',
  /**
   * 查询到结果后触发
   */
  IDEHTIFYED: 'identifyed',
  /**
   * 查询完成后触发
   */
  IDEHTIFYEDALL: 'identifyedAll'
};

export class IdentifyActiveEvent extends Event {
  constructor(type, active, identifyType) {
    super(type);
    this.active = active;
    this.identifyType = identifyType;
  }
}

export class IdentifyEvent extends Event {
  constructor(type, result, coordinate, queryId) {
    super(type);
    this.result = result;
    this.coordinate = coordinate;
    this.queryId = queryId;
  }
}

class Identify extends Observable {
  constructor(map) {
    super();
    this.active = false;
    this.map = map;
    this.allVectorFeatures = {};
    this.mapIdentifyExecute = this.mapIdentifyExecute.bind(this);
  }

  init(queryMode = 'click') {
    if (this.map && !queryMode.startsWith('buffer')) {
      this.initMapIdentify(queryMode);
    }
    this.active = true;
    this.dispatchEvent(
      new IdentifyActiveEvent(
        IdentifyEventType.CHANGEACTIVE,
        this.active,
        queryMode
      )
    );
  }

  /**
   * I查询
   */
  initMapIdentify(queryMode = 'click') {
    if (queryMode === 'click') {
      this.map.on('click', this.mapIdentifyExecute);
    } else {
      //创建绘制交互
      let source = this.map.getLayerById('identifyDrawLayer').getSource();
      let type = '';
      if (queryMode === 'polygon') {
        type = 'Polygon';
      } else if (queryMode === 'line') {
        type = 'LineString';
      } else if (queryMode === 'box') {
        type = 'Circle';
      }
      let params = {
        source: source,
        type: type
      };
      type === 'Circle' && (params.geometryFunction = createBox());
      this.draw = new Draw(params);
      this.draw.on('drawstart', () => {
        source.once('addfeature', () => {
          setTimeout(() => {
            source.clear();
          }, 500);
        });
      });
      this.draw.on('drawend', (evt) => {
        let feature = evt.feature;
        this.identifyLayer(feature);
      });
      this.map.addInteraction(this.draw);
    }
  }

  /**
   * 点击查询
   * @param evt
   */
  mapIdentifyExecute(evt) {
    let feature = new Feature({
      geometry: new Point(evt.coordinate)
    });
    this.identifyLayer(feature);
  }

  /**
   * 根据绘制的图形查询:点,线,面,框选
   */
  identifyLayer(feature) {
    this.map.getViewport().style.cursor = 'wait';
    const center = getCenter(feature.getGeometry().getExtent());
    const queryId = uuidv4(); // 本次I查询ID
    const checkedLayers = this.map.layerManager.getCheckedLayers();
    const geojson = geojsonFormat.writeGeometry(feature.getGeometry());
    const identifyTasks = [];
    // 如果是点查询的话，立即执行一次map的getFeaturesAtPixel，查询所有矢量图层的信息
    this.allVectorFeatures = {};
    if (feature.getGeometry().getType() === 'Point') {
      const pixel = this.map.getPixelFromCoordinate(center);
      this.map.forEachFeatureAtPixel(
        pixel,
        (feature, layer) => {
          const layerId = layer.get('id');
          if (
            Object.keys(this.allVectorFeatures).some((item) => item === layerId)
          ) {
            this.allVectorFeatures[layerId].push(feature);
          } else {
            this.allVectorFeatures[layerId] = [feature];
          }
        },
        {
          layerFilter: (layer) => !!layer.get('id'),
          hitTolerance: 3
        }
      );
    }
    for (let i = 0, l = checkedLayers.length; i < l; i++) {
      const layerInfo = compatibleOldFormConfig(checkedLayers[i]);
      // 矢量类型图层走前端查询
      if (
        layerInfo.type === 'geoserver-wfs' ||
        layerInfo.type === 'arcgis-wfs' ||
        layerInfo.type === 'geoJson' ||
        layerInfo.type === 'feature' ||
        layerInfo.type === 'feature-pbf'
      ) {
        const task = this.getVectorLayerIdentifyTask(layerInfo, feature);
        if (task) {
          identifyTasks.push(task);
        }
      } else if (layerInfo.serverOrigin === 'geoserver') {
        const task = getGeoServerIdentifyTask(layerInfo, geojson, {
          map: this.map
        });
        if (task) {
          identifyTasks.push(task);
        }
      } else if (layerInfo.serverOrigin === 'arcgis') {
        const task = getArcgisIdentifyTask(layerInfo, geojson, {
          map: this.map
        });
        if (task) {
          identifyTasks.push(task);
        }
      }
    }
    if (identifyTasks.length > 0) {
      this.taskHandle(identifyTasks, queryId, center);
    } else {
      this.map.getViewport().style.cursor = 'auto';
      this.dispatchEvent(
        new IdentifyEvent(IdentifyEventType.IDEHTIFYED, [], center, queryId)
      );
      this.dispatchEvent(
        new IdentifyEvent(IdentifyEventType.IDEHTIFYEDALL, [], center, queryId)
      );
    }
  }

  getVectorLayerIdentifyTask(layerInfo, feature) {
    const identifyField = layerInfo.identifyField?.filter(
      (ele) => ele.isOpenSearch !== false
    );
    if (
      layerInfo.group === '2' &&
      identifyField?.length > 0 &&
      judgeZoomLimit({ map: this.map }, layerInfo.identifyZoom)
    ) {
      const { serverOrigin, label, id, isPop, layerTag } = layerInfo;
      let features = [];
      const identifyResult = {
        type: serverOrigin,
        results: [],
        layerLabel: label,
        layerId: id,
        isPop,
        layerTag
      };
      if (feature.getGeometry().getType() === 'Point') {
        features = this.allVectorFeatures[layerInfo.id] || [];
      } else {
        const targetLayerSources = [];
        const targetLayer = this.map.getLayerById(layerInfo.id);
        if (targetLayer instanceof LayerGroup) {
          const layers = targetLayer.getLayers();
          layers.forEach((layer) => {
            targetLayerSources.push(layer.getSource());
          });
        } else {
          targetLayerSources.push(targetLayer.getSource());
        }
        const geometry = feature.getGeometry();
        const projectionCode = this.map.getView().getProjection().getCode();
        const resolution = getPointResolution(
          this.map.getView().getProjection(),
          this.map.getView().getResolution(),
          this.map.getView().getCenter(),
          ProjUnits.METERS
        );
        const buffered = turfBuffer(
          geojsonFormat.writeGeometryObject(
            geometry.transform(projectionCode, 'EPSG:4326')
          ),
          (3 * resolution) / 1000
        );
        const bufferedGeometry = geojsonFormat
          .readFeature(buffered)
          .getGeometry()
          .transform('EPSG:4326', projectionCode);

        targetLayerSources.forEach((targetLayerSource) => {
          targetLayerSource.forEachFeatureIntersectingExtent(
            bufferedGeometry.getExtent(),
            (feature) => {
              const featureGeometry = geojsonFormat.writeGeometryObject(
                feature
                  .clone()
                  .getGeometry()
                  .transform(projectionCode, 'EPSG:4326')
              );
              const identifyGeometry = geojsonFormat.writeGeometryObject(
                bufferedGeometry.clone().transform(projectionCode, 'EPSG:4326')
              );
              if (booleanIntersects(featureGeometry, identifyGeometry)) {
                features.push(feature);
              }
            }
          );
        });
      }
      const task = new Promise((resolve) => {
        features.forEach((feature) => {
          let targetIdentifyField = {};
          let attributes = feature.getProperties();
          delete attributes.geometry;
          if (serverOrigin === 'arcgis') {
            const newAttributes = {};
            const featureTarget = feature.id_.slice(
              0,
              feature.id_.lastIndexOf('.')
            );
            targetIdentifyField = identifyField?.find(
              (item) => item.name === featureTarget
            );
            const fieldAliases = targetIdentifyField.fieldAliases;
            Object.keys(attributes).forEach((key) => {
              newAttributes[fieldAliases[key]] = attributes[key];
            });
            attributes = newAttributes;
          }
          const result = {
            identifyField: targetIdentifyField,
            geometry: geojsonFormat.writeGeometry(feature.getGeometry()),
            attributes
          };
          identifyResult.results.push(result);
        });
        resolve(identifyResult);
      });

      return task;
    }
  }

  /**
   * 查询任务结果处理
   * @param identifyTasks
   * @param queryId
   * @param center
   * @private
   */
  taskHandle(identifyTasks, queryId, center) {
    let finishCount = 0;
    const result = [];
    for (let task of identifyTasks) {
      task.id = queryId;
      task
        .then((element) => {
          this.map.getViewport().style.cursor = 'auto';
          finishCount++;
          if (task.id !== queryId) {
            return;
          }
          this.dispatchEvent(
            new IdentifyEvent(
              IdentifyEventType.IDEHTIFYED,
              element,
              center,
              queryId
            )
          );
          // 只保存查询结果不为空的结果
          if (element.results.length) {
            result.push(element);
          }
          if (finishCount === identifyTasks.length) {
            this.dispatchEvent(
              new IdentifyEvent(
                IdentifyEventType.IDEHTIFYEDALL,
                result,
                center,
                queryId
              )
            );
          }
        })
        .catch((error) => {
          finishCount++;
          if (finishCount === identifyTasks.length) {
            this.dispatchEvent(
              new IdentifyEvent(
                IdentifyEventType.IDEHTIFYEDALL,
                result,
                center,
                queryId
              )
            );
          }
          this.map.getViewport().style.cursor = 'auto';
          console.error(error);
        });
    }
  }

  clearHighLight() {
    if (
      this.map.getLayerById('identifyPopupLayer').getSource().getFeatures()
        .length > 0
    ) {
      this.map.getLayerById('identifyPopupLayer').getSource().clear();
    }
  }

  highLightFeature(result) {
    const { geometry: geojson, identifyField } = result;
    if (!geojson) return;
    const geojsonFormat = new GeoJSON();
    const geometry = geojsonFormat.readGeometry(geojson);

    this.clearHighLight();
    const curFeature = new Feature({
      geometry
    });
    // 高亮地块
    curFeature.setStyle(this.setFeaturesStyle(identifyField));
    this.map
      .getLayerById('identifyPopupLayer')
      .getSource()
      .addFeature(curFeature);
  }

  setFeaturesStyle(identifyField) {
    // 取组件配置
    let fillColor = this.colorConfig ? this.colorConfig.fillColor : '';
    let strokeColor = this.colorConfig ? this.colorConfig.strokeColor : '';
    let outlineWidth = 3;
    // 运维端配置大于组件配置
    if (identifyField && identifyField.pickfeaturestyle) {
      const styleOption = identifyField.pickfeaturestyle;
      if (styleOption.fill && styleOption.color) {
        fillColor = asArray(styleOption.color);
        if (styleOption.opacity) {
          fillColor[3] = styleOption.opacity / 100;
        }
      }
      if (styleOption.outline && styleOption.outlineColor) {
        strokeColor = asArray(styleOption.outlineColor);
        if (styleOption.outlineOpacity) {
          strokeColor[3] = styleOption.outlineOpacity / 100;
        }
      }
      if (styleOption.outline && styleOption.outlineWidth) {
        outlineWidth = styleOption.outlineWidth;
      }
    }
    const queryFill = new Fill({
      color: fillColor ? fillColor : [255, 0, 0, 0.5]
    });
    const queryStroke = new Stroke({
      color: strokeColor ? strokeColor : [255, 0, 0],
      width: outlineWidth
    });
    const queryStyle = new Style({
      fill: queryFill,
      stroke: queryStroke
    });
    return queryStyle;
  }

  setActive(flag, queryMode = 'click') {
    if (flag) {
      this.init(queryMode);
    } else {
      if (this.active) {
        this.cancel();
      }
    }
  }

  cancel() {
    if (this.map) {
      this.map.un('click', this.mapIdentifyExecute);
      this.map.removeInteraction(this.draw);
    }
    this.active = false;
    this.dispatchEvent(
      new IdentifyActiveEvent(IdentifyEventType.CHANGEACTIVE, this.active)
    );
  }
}

export default Identify;
