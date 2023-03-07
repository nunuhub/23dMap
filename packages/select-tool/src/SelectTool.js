import { DragBox } from 'ol/interaction.js';
import {
  shiftKeyOnly,
  platformModifierKeyOnly,
  altKeyOnly
} from 'ol/events/condition';
import VectorLayer from 'ol/layer/Vector';
import {
  defaultStyles,
  selectStyles
} from 'shinegis-client-23d/src/utils/olUtil';
import Select from './Select';
import IdentifyParameters from 'shinegis-client-23d/src/utils/tasks/geoserver/IdentifyParameters';
import IdentifyTask from 'shinegis-client-23d/src/utils/tasks/geoserver/IdentifyTask';
import EsriIdentify from 'shinegis-client-23d/src/utils/tasks/esri/Identify';
import LayerGroup from 'ol/layer/Group';
import Observable from 'ol/Observable';
import Event from 'ol/events/Event.js';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';

const SelectToolEventType = {
  /**
   * 功能打开关闭时触发
   */
  CHANGEACTIVE: 'change:active',
  /**
   * 选择后触发
   */
  SELECTED: 'selected'
};

export class SelectToolActiveEvent extends Event {
  constructor(type, active) {
    super(type);
    this.active = active;
  }
}

export class SelectToolEvent extends Event {
  constructor(type, selected) {
    super(type);
    this.selected = selected;
  }
}

/**
 * 选择工具：
 * 1、支持wfs，arcgis矢量图层的点选和框选
 * 2、支持wms服务的点选
 *
 */
class SelectTool extends Observable {
  constructor(map) {
    super();
    this.name = 'SelectTool';
    this.active = false;
    this.map = map;
    this.tempLayer = this.map.getLayerById('drawLayer');
    this.addCondition_ = platformModifierKeyOnly;
    this.toggleCondition_ = altKeyOnly;
    this.originStyles = [];
    this.select = null;
    this.dragBox = null;
  }
  init() {
    this.layerManager = this.map.layerManager;
    this.currentEditTargetLayer = this.layerManager.getEditLayer()
      ? this.layerManager.getEditLayer().metadata
      : null;
    let originLayers = this.currentEditTargetLayer
      ? [this.map.getLayerById(this.currentEditTargetLayer.id), this.tempLayer]
      : [this.tempLayer];
    let layers = [];
    for (let layer of originLayers) {
      if (layer instanceof LayerGroup) {
        layers = layers.concat(layer.getLayers().getArray());
      } else {
        layers.push(layer);
      }
    }
    // 对临时图层和当前可编辑图层
    this.select = new Select({
      layers: layers,
      style: false
    });
    this.map.addInteraction(this.select);
    // 添加框选
    this.dragBox = new DragBox({
      condition: shiftKeyOnly
    });
    this.map.addInteraction(this.dragBox);
    this.map.getTargetElement().style.cursor = 'auto';

    // 先遍历图层，获取当前选中的图形,目前选中的图形，都通过map的变量进行获得，
    // 通过获取当前临时图层和当前可编辑图层的isSelected和tempSelected属性来获取要素
    this.selectedFeatures = this.select.getFeatures();
    // 当前选中的图形定义成功
    this.dragBox.on('boxend', () => {
      const currentEditTargetLayer = this.layerManager.getEditLayer()?.metadata;
      const geojsonFormat = new GeoJSON();
      const geojson = geojsonFormat.writeGeometry(this.dragBox.getGeometry());
      let extent = this.dragBox.getGeometry().getExtent();
      let layers = this.map.getLayers().getArray();
      layers.forEach((layer) => {
        // 如果存在目标图层
        if (
          (!!currentEditTargetLayer &&
            layer.get('id') === currentEditTargetLayer.id) ||
          layer.get('id') === 'drawLayer'
        ) {
          // 只遍历矢量图层，矢量图层目前包含geoserve wfs服务图层以及临时绘制的图层
          if (layer instanceof VectorLayer) {
            layer
              .getSource()
              .forEachFeatureIntersectingExtent(extent, (feature) => {
                if (feature.id_) {
                  this.setFeatureSelected(feature);
                } else {
                  feature.setStyle(selectStyles);
                  feature.set('tempSelected', true);
                  this.selectedFeatures.push(feature);
                }
              });
            this.dispatchEvent(
              new SelectToolEvent(
                SelectToolEventType.SELECTED,
                this.map.getSelectFeatures()
              )
            );
          }
        }
      });
      if (
        !!currentEditTargetLayer &&
        (currentEditTargetLayer.type === 'dynamic' ||
          currentEditTargetLayer.type === 'feature' ||
          currentEditTargetLayer.type === 'feature-pbf')
      ) {
        let queryOption = {
          layers: 'visible:' + currentEditTargetLayer.visibleLayers.join(',')
        };
        if (currentEditTargetLayer.filter) {
          queryOption.layerDefs = currentEditTargetLayer.filter;
        }
        if (currentEditTargetLayer.authkey) {
          queryOption.authkey = currentEditTargetLayer.authkey;
        }
        let identifyTask = new EsriIdentify(
          currentEditTargetLayer.url,
          queryOption,
          currentEditTargetLayer
        );
        identifyTask.at(geojson, { map: this.map });
        identifyTask.run().then((response) => {
          response.results.forEach((element) => {
            let feature = new Feature({
              geometry: geojsonFormat.readGeometry(element.geometry)
            });
            this.setFeatureSelected(feature);
            this.selectedFeatures.push(feature);
          });
          this.dispatchEvent(
            new SelectToolEvent(
              SelectToolEventType.SELECTED,
              this.map.getSelectFeatures()
            )
          );
        });
      } else if (
        !!currentEditTargetLayer &&
        (currentEditTargetLayer.type === 'geoserver-wms' ||
          currentEditTargetLayer.type === 'geoserver-wfs')
      ) {
        const params = new IdentifyParameters(currentEditTargetLayer, geojson, {
          map: this.map
        });
        const identifyTask = new IdentifyTask();

        identifyTask.execute(params).then((response) => {
          response.results.forEach((element) => {
            let feature = new Feature({
              geometry: geojsonFormat.readGeometry(element.geometry)
            });
            this.setFeatureSelected(feature);
            this.selectedFeatures.push(feature);
          });
          this.dispatchEvent(
            new SelectToolEvent(
              SelectToolEventType.SELECTED,
              this.map.getSelectFeatures()
            )
          );
        });
      }
    });

    this.select.on('select', (evt) => {
      // 点选开始之前，所有图形选中状态清空
      let add = this.addCondition_(evt.mapBrowserEvent);
      let toggle = this.toggleCondition_(evt.mapBrowserEvent);
      let selectArray = this.map.getSelectFeatures();
      // eslint-disable-next-line no-empty
      if (add || toggle) {
      } else {
        this.handleGraphic(selectArray);
      }
      if (evt.selected.length > 0) {
        let item = evt.selected[0];
        // 处理geoserver-wfs图层选中的图形
        if (item.id_) {
          this.setFeatureSelected(item);
          this.dispatchEvent(
            new SelectToolEvent(SelectToolEventType.SELECTED, item)
          );
        } else {
          if (item.get('tempSelected') === false) {
            item.set('tempSelected', true);
            item.setStyle(selectStyles);
          }
        }
      } else if (!add) {
        this.dispatchEvent(
          new SelectToolEvent(SelectToolEventType.SELECTED, null)
        );
      }
    });
    this.select.on('featureSelected', (evt) => {
      //console.log(evt);
      this.dispatchEvent(
        new SelectToolEvent(SelectToolEventType.SELECTED, evt.feature)
      );
    });
    // 在绘制新框时和单击地图时清除选择
    this.dragBox.on('boxstart', () => {
      let selectArray = this.map.getSelectFeatures();
      this.handleGraphic(selectArray);
    });
  }
  handleGraphic(selectArray) {
    // 分情况处理，地图服务中的图层以及临时绘制的图层
    // 地图服务中的数据直接清除，临时绘制的数据改变样式
    for (let i = 0; i < selectArray.length; i++) {
      let selectedItem = selectArray[i];
      if (selectedItem.get('tempSelected')) {
        selectedItem.set('tempSelected', false);
        if (selectedItem.originalStyle) {
          selectedItem.setStyle(selectedItem.originalStyle);
        } else {
          selectedItem.setStyle(
            this.tempLayer ? this.tempLayer.getStyle() : defaultStyles
          );
        }
      } else if (selectedItem.get('isSelected')) {
        selectArray.splice(i, 1);
        i--;
        this.map
          .getLayerById('drawLayer')
          .getSource()
          .removeFeature(selectedItem);
      }
    }
  }
  setFeatureSelected(feature) {
    feature.setStyle(selectStyles);
    feature.set('isSelected', true);
    this.map.getLayerById('drawLayer').getSource().addFeature(feature);
    //this.map.setSelectFeatures([feature]);
  }
  activate() {
    this.init();
    this.active = true;
    this.dispatchEvent(
      new SelectToolActiveEvent(SelectToolEventType.CHANGEACTIVE, this.active)
    );
  }
  deactivate() {
    //this.map.clearSelectFeatures();
    this.map.removeInteraction(this.select);
    this.map.removeInteraction(this.dragBox);
    this.active = false;
    this.dispatchEvent(
      new SelectToolActiveEvent(SelectToolEventType.CHANGEACTIVE, this.active)
    );
  }
}
export default SelectTool;
