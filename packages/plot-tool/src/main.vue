<template>
  <div>
    <plot-style
      v-if="isShowStyle"
      ref="plotstyle"
      @refreshStyle="refreshStyle"
      @deleteGeo="deleteGeo"
      @translateGeo="translateGeo"
      @zIndexChange="zIndexChange"
    ></plot-style>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import PlotStyle from './PlotStyle';
import OlPlot from 'shinegis-client-23d/src/map-core/olPlot/olPlot.js';
import { getLayerByLayerName } from 'shinegis-client-23d/src/map-core/olPlot/Utils/layerUtils';
import {
  BASE_LAYERNAME,
  DEF_STYEL
} from 'shinegis-client-23d/src/map-core/olPlot/Constants';
import * as PlotTypes from 'shinegis-client-23d/src/map-core/olPlot/Utils/PlotTypes';
import Bus from 'shinegis-client-23d/src/utils/bus';
import PlotTextBox from 'shinegis-client-23d/src/map-core/olPlot/Geometry/Text/PlotTextBox';
import { Style, Fill, Stroke, Circle } from 'ol/style';
import Translate from 'ol/interaction/Translate';
import Modify from 'ol/interaction/Modify';
import Collection from 'ol/Collection';
import Feature from 'ol/Feature';
import { LineString, MultiPoint } from 'ol/geom';
import { includes } from 'ol/array';
import GeometryCollection from 'ol/geom/GeometryCollection';
import CursorManager from 'shinegis-client-23d/src/map-core/CursorManager';
import { rotateGeo } from 'shinegis-client-23d/src/map-core/olPlot/Utils/rotateGeoUtils';

export default {
  name: 'ShPlotTool',
  components: {
    PlotStyle: PlotStyle
  },
  mixins: [common],
  props: {
    isShowStyle: {
      type: Boolean,
      default: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    isStayDraw: {
      type: Boolean,
      default: false
    },
    flashMode: {
      // 绘制结束是否闪烁；0表示不闪烁；1表示闪3次；2表示一直闪烁
      type: Number,
      default: 0
    },
    isSelectDrawEnd: {
      type: Boolean,
      default: true
    },
    drawCursor: {
      type: String,
      default: require('shinegis-client-23d/src/assets/img/plot-tool/cursor_draw.svg')
    }
  },
  data() {
    this.plot = {};
    this.type = undefined;
    this.selectFeature = null;
    this.selectEditFeature = null;
    this.startEditRotate = 0; // 开始编辑时的旋转角度，用于旋转编辑节点
    this.translateInteraction = null;
    this.modifyInteraction = null;
    this.textPlot = {};
    this.isDisableSelect = true;
    this.copyPadding = 10;
    this.copyPlotJson = {};
    return {};
  },
  mounted() {
    this.fixCanvasBug();
    // 应该没用了
    /*if (!this.isShowStyle) {
      Bus.$on('refreshStyle', (style, type) => {
        this.refreshStyle(style, type);
      });
    }*/

    document.onkeydown = (event) => {
      //
      if (event.target.nodeName === 'TEXTAREA') {
        return true;
      }
      // 复制
      if (event.ctrlKey && event.keyCode === 67) {
        // alert('你按下了CTRL+C');
        this.copyPadding = 10;
        this.copyPlotJson = this.copyPlot();
        // 粘贴
      } else if (event.ctrlKey && event.keyCode === 86) {
        event.stopPropagation();
        try {
          this.plot.plotDraw.addPlot(this.copyPlotJson, true);
          this.copyPadding += 10;
          this.copyPlotJson = this.copyPlot();
        } catch (e) {
          console.warn('PlotParseError', e);
        }
      }
    };

    if (this.$map) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    begin() {
      this.initPlotTool();
    },
    initPlotTool() {
      this.plot = new OlPlot(this.$map, {
        zoomToExtent: true
      });
      this.plot.plotDraw.on('drawEnd', (event, data) => {
        // 兼容BI BI中回调参数不一致
        if (data == null) {
          data = event;
        }
        if (this.isSelectDrawEnd) {
          if (data.feature instanceof PlotTextBox) {
            this.textPlot = data.feature;
          } else {
            this.selectFeature = data.feature;
          }
        } else {
          this.deleteFlashFeature();
        }

        this.$emit('drawEnd');
      });
      this.plot.plotDraw.on('changePlotStyle', (event, data) => {
        this.setPlotStyle(data.type, data.style);
      });
      this.plot.plotDraw.on('textPlotSelected', (event, textPlot) => {
        this.type = PlotTypes.TEXTAREA;
        this.textPlot = textPlot;
      });
      this.plot.plotDraw.on('RefreshPlotLegend', (event, plots) => {
        Bus.$emit('RefreshPlotLegend', plots);
      });
      // 选中编辑
      this.$map.on('dblclick', (event) => {
        if (this.isDisableSelect) {
          return;
        }
        this.removeAllInteraction();
        this.deleteFlashFeature();
        if (!this.plot.plotDraw.isDrawing()) {
          event.preventDefault();
          event.stopPropagation();
          // 针对渐变的查询
          let Coordinate = this.$map.getCoordinateFromPixel(event.pixel);
          let layer = getLayerByLayerName(this.$map, BASE_LAYERNAME);
          let feature = layer.getSource().getFeaturesAtCoordinate(Coordinate);
          if (feature && feature.length > 0) {
            this.featureSelected(feature[0]);
            event.preventDefault();
            return;
          }
          // 针对其他查询
          this.$map.forEachFeatureAtPixel(
            event.pixel,
            (feature) => {
              // do something
              this.featureSelected(feature);
              event.preventDefault();
              event.stopPropagation();
            },
            {
              hitTolerance: 10
            }
          );
        }
      });
    },
    activate(type, style) {
      this.selectFeature = null;
      if (!style) {
        style = JSON.parse(JSON.stringify(DEF_STYEL));
        // 修改部分类型的默认值
        if (type === PlotTypes.CIRCLE) {
          style.type = 'dashline';
          style.polyStroke = DEF_STYEL.circleStroke;
          style.gradients = DEF_STYEL.circleGradients;
          style.strokeWidth = DEF_STYEL.circleDashWidth;
        }
      }
      let layer = getLayerByLayerName(this.$map, BASE_LAYERNAME);
      style.zIndex = layer.getSource().getFeatures().length + 1;
      // this.plot.plotEdit.deactivate();
      this.plot.plotDraw.active(type, undefined, {
        cursor: this.drawCursor
      });

      this.plot.plotDraw.setStyle(style);
      if (type === 'TextArea') {
        this.plot.plotDraw.setTextStyle(style);
      }
      this.setPlotStyle(type, style);
      this.plot.plotDraw.setIsStayDraw(this.isStayDraw);
      this.plot.plotDraw.setFlashMode(this.flashMode);
    },
    disActive(isKeepFlash) {
      this.removeAllInteraction();
      if (!isKeepFlash) {
        this.deleteFlashFeature();
      }
      this.plot.plotDraw.disActive(true);
    },
    setDisableSelect(isDisableSelect) {
      this.isDisableSelect = isDisableSelect;
      if (!isDisableSelect) {
        let cursorManager = CursorManager.getInstance(this.$map);
        cursorManager.setTip('双击选中目标要素');
        cursorManager.startOnlyTips();
      }
    },
    changeFeatureType(type) {
      if (this.selectFeature) {
        let points = this.selectFeature.getGeometry().getPoints();
        let newFeature = this.plot.plotDraw.addPlotFeature(type, points);
        this.plot.plotDraw.removeFeature(this.selectFeature);
        this.selectFeature = newFeature;
      }
    },
    setPlotStyle(type, style) {
      this.type = type;
      if (this.isShowStyle) {
        this.$refs.plotstyle.setType(type);
        this.$refs.plotstyle.setStyle(style);
      } else {
        this.$emit('setPlotStyle', type, style);
      }
    },
    setDrawType() {
      try {
        let type = this.selectFeature.getGeometry().getPlotType();
        if (type) {
          this.setPlotStyle(type, this.selectFeature.getGeometry().style);
        } else {
          console.warn('图形类型不支持编辑');
        }
      } catch (e) {
        console.warn('图形类型不支持编辑');
      }
    },

    refreshStyle(style, type) {
      if (type === PlotTypes.TEXTAREA) {
        this.plot.plotDraw.setTextStyle(style);
      } else {
        // this.plot.plotDraw.setStyle(style)
        if (this.selectFeature) {
          let geo = this.selectFeature.getGeometry();
          if (geo.getStyle && geo.setStyle) {
            geo.setStyle(style);
            this.selectFeature.setStyle(geo.getStyle());
          }
          rotateGeo(geo, style.rotation);
          this.rotation = style.rotation;
          if (this.selectEditFeature) {
            rotateGeo(
              this.selectEditFeature.getGeometry(),
              style.rotation - this.startEditRotate
            );
          }
        }
      }
      Bus.$emit('RefreshPlotLegend', this.getPlots());
    },
    zIndexChange(isUp) {
      let layer = getLayerByLayerName(this.$map, BASE_LAYERNAME);
      let features = layer.getSource().getFeatures();
      // 按style.zindex排序
      let compare = function () {
        return function (a, b) {
          let geoA = a.getGeometry();
          let geoB = b.getGeometry();
          const value1 = geoA.style
            ? geoA.style.zIndex
              ? geoA.style.zIndex
              : 0
            : 0;
          const value2 = geoB.style
            ? geoB.style.zIndex
              ? geoB.style.zIndex
              : 0
            : 0;
          return value1 - value2;
        };
      };
      features.sort(compare());
      // 当前选中的位置
      let selectIndex = 0;
      for (let index in features) {
        let feature = features[index];
        if (this.selectFeature.ol_uid === feature.ol_uid) {
          selectIndex = Number(index);
          break;
        }
      }
      // 修改前后3个zindex
      // 前
      if (selectIndex - 1 >= 0 && !isUp) {
        let zIndex = selectIndex + 1;
        this._setFeatureZIndex(features[selectIndex - 1], zIndex);
      }
      // 当前
      this._setFeatureZIndex(
        features[selectIndex],
        isUp ? selectIndex + 2 : selectIndex
      );
      // 后
      if (selectIndex + 1 < features.length && isUp) {
        let zIndex = selectIndex + 1;
        this._setFeatureZIndex(features[selectIndex + 1], zIndex);
      }
    },
    _setFeatureZIndex(feature, zIndex) {
      let geo = feature.getGeometry();
      if (geo.getStyle && geo.setStyle) {
        let style = geo.style;
        style.zIndex = zIndex;
        geo.setStyle(style);
        feature.setStyle(geo.getStyle());
      }
    },
    translateGeo() {
      this.addTranslate(new Collection([this.selectFeature]));
    },
    editGeo() {
      if (this.selectFeature) {
        this.addEdit(new Collection([this.selectFeature]));
      }
    },
    // 取消选中
    deleteFlashFeature() {
      this.plot.plotDraw.deleteFlashFeature();
      if (this.selectFeature) {
        this.selectFeature = null;
      }
    },
    deleteGeo() {
      this.removeAllInteraction();
      if (this.type === PlotTypes.TEXTAREA) {
        this.textPlot.closeCurrentPlotText();
      } else {
        let layer = getLayerByLayerName(this.$map, BASE_LAYERNAME);
        if (this.selectFeature && layer) {
          layer.getSource().removeFeature(this.selectFeature);
          this.plot.plotDraw.deleteFlashFeature();
          if (this.selectEditFeature) {
            this.$map
              .getLayerById('drawLayer')
              .getSource()
              .removeFeature(this.selectEditFeature);
            this.selectEditFeature = null;
          }
        }
      }
      Bus.$emit('RefreshPlotLegend', this.getPlots());
    },

    featureSelected(feature) {
      if (feature.get('isPlot')) {
        this.selectFeature = feature;
        this.plot.plotDraw.flashGeometry(this.selectFeature.getGeometry());
        this.setDrawType();
        setTimeout(() => {
          this.translateGeo();
        }, 100);
        /* setTimeout(() => {
          this.addEdit(new Collection([this.selectFeature]))
        }, 100)*/
      }
    },

    addTranslate(features) {
      this.removeAllInteraction();
      let cursorManager = CursorManager.getInstance(this.$map);
      cursorManager.setTip('移至目标要素，按住移动');
      cursorManager.startOnlyTips();
      let startCoordinates;
      this.translateInteraction = new Translate({
        // 拖拽移动interaction
        features: features
      });
      this.translateInteraction.on('translatestart', (f) => {
        CursorManager.getInstance(this.$map).cancel();
        startCoordinates = f.features
          .getArray()[0]
          .getGeometry()
          .getCoordinates();
      });
      this.translateInteraction.on('translateend', function (f) {
        try {
          let geometry = f.features.getArray()[0].getGeometry();
          let endCoordinates = geometry.getCoordinates();
          let points = geometry.getPoints();
          let dx, dy;
          if (startCoordinates && startCoordinates.length > 0) {
            if (startCoordinates[0] instanceof Array) {
              if (endCoordinates[0][0] instanceof Array) {
                dx = endCoordinates[0][0][0] - startCoordinates[0][0][0];
                dy = endCoordinates[0][0][1] - startCoordinates[0][0][1];
              } else {
                dx = endCoordinates[0][0] - startCoordinates[0][0];
                dy = endCoordinates[0][1] - startCoordinates[0][1];
              }
            } else {
              dx = endCoordinates[0] - startCoordinates[0];
              dy = endCoordinates[1] - startCoordinates[1];
            }
          }
          let newPoints = [];
          for (let point of points) {
            newPoints.push([point[0] + dx, point[1] + dy]);
          }
          geometry.setPoints(newPoints);

          // geometry.setPoints(geometry.getCoordinates())
          // eslint-disable-next-line no-empty
        } catch (e) {}
      });
      this.$map.addInteraction(this.translateInteraction);
    },
    addEdit(features) {
      let feature = features.getArray()[0];
      let isCurve = false;
      let type;
      if (feature.get('isPlot')) {
        type = feature.getGeometry().getPlotType();
        if (
          (type.search('Curve') !== -1 && type !== PlotTypes.CLOSED_CURVE) ||
          type !== PlotTypes.DOUBLE_ARROW ||
          type !== PlotTypes.SQUAD_COMBAT ||
          type !== PlotTypes.FINE_ARROW ||
          type !== PlotTypes.DOTTED_ARROW
        ) {
          isCurve = true;
          feature = new Feature(
            new LineString(feature.getGeometry().getPoints())
          );
          features = new Collection([feature]);
        }
      }
      this.removeAllInteraction();
      this.addEditPoint(features.getArray()[0]);
      let options = {
        features: features
      };
      // 部分类型禁止新增坐标
      if (
        type === PlotTypes.DOUBLE_ARROW ||
        type === PlotTypes.FINE_ARROW ||
        type === PlotTypes.CIRCLE
      ) {
        options.insertVertexCondition = () => {
          return false;
        };
      }
      this.modifyInteraction = new Modify(options);

      if (isCurve) {
        this.modifyInteraction.on('modifyend', (f) => {
          this.selectFeature
            .getGeometry()
            .setPoints(f.features.getArray()[0].getGeometry().getCoordinates());
        });
      }
      this.$map.addInteraction(this.modifyInteraction);
    },
    addEditPoint(feature) {
      let selectModifyStyle = new Style({
        image: new Circle({
          radius: 5,
          fill: new Fill({
            color: '#05A0FF'
          }),
          stroke: new Stroke({
            color: '#05A0FF',
            width: 2
          })
        }),
        stroke: new Stroke({
          color: 'rgba(255,255,255,0)',
          width: 3
        }),
        fill: new Fill({
          color: 'rgba(255,255,255,0)'
        }),
        geometry: (f) => {
          let coordinates = [];
          if (f.getGeometry().getType() === 'Polygon') {
            f.getGeometry()
              .getCoordinates()[0]
              .forEach((coordinate) => {
                coordinates.push(coordinate);
              });
          } else if (f.getGeometry().getType() === 'MultiPolygon') {
            f.getGeometry()
              .getCoordinates()[0]
              .forEach((coordinate) => {
                coordinate.forEach((sc) => {
                  coordinates.push(sc);
                });
                coordinates.push(coordinate);
              });
          } else if (f.getGeometry().getType() === 'LineString') {
            coordinates = f.getGeometry().getCoordinates();
          } else {
            coordinates = [f.getGeometry().getCoordinates()];
          }
          return new GeometryCollection([
            f.getGeometry(),
            new MultiPoint(coordinates)
          ]);
        }
      });
      feature.setStyle(selectModifyStyle);
      this.$map.getLayerById('drawLayer').getSource().addFeature(feature);
      this.selectEditFeature = feature;
      this.startEditRotate = this.rotation ? this.rotation : 0;
    },

    removeAllInteraction() {
      // 取消鼠标样式
      CursorManager.getInstance(this.$map).cancel();
      // 去除编辑节点
      if (this.selectEditFeature) {
        this.$map
          .getLayerById('drawLayer')
          .getSource()
          .removeFeature(this.selectEditFeature);
        this.selectEditFeature = null;
      }
      // 去除编辑监听
      if (this.modifyInteraction) {
        // console.log('remove -- modifyInteraction')
        this.$map.removeInteraction(this.modifyInteraction);
        this.modifyInteraction = undefined;
      }
      // 去除移动监听
      if (this.translateInteraction) {
        // console.log('remove -- translateInteraction')
        this.$map.removeInteraction(this.translateInteraction);
        this.translateInteraction = undefined;
      }
    },
    setPlots(data) {
      this.plot.plotDraw.setPlot(data);
    },
    getPlots() {
      return this.plot.plotDraw.getAllPlot();
    },
    save() {
      this.$emit('savePlot', this.getPlots());
    },
    openTextEvent() {
      let overlays = this.$map.getOverlays();
      if (overlays && overlays.getLength() > 0) {
        let overlayArray = overlays.getArray();
        for (let overlay of overlayArray) {
          if (overlay instanceof PlotTextBox) {
            overlay.openEvent();
          }
        }
      }
    },
    closeTextEvent() {
      let overlays = this.$map.getOverlays();
      if (overlays && overlays.getLength() > 0) {
        let overlayArray = overlays.getArray();
        for (let overlay of overlayArray) {
          if (overlay instanceof PlotTextBox) {
            overlay.closeEvent();
          }
        }
      }
    },
    fixCanvasBug() {
      // 因为map.forEachFeatureAtPixel无法查询到重写了canvas的feature
      // 需要重写Translate.prototype.featuresAtPixel_方法
      Translate.prototype.featuresAtPixel_ = function featuresAtPixel_(
        pixel,
        map
      ) {
        // 针对渐变的查询
        let Coordinate = map.getCoordinateFromPixel(pixel);
        let layer = getLayerByLayerName(map, BASE_LAYERNAME);
        let feature = layer.getSource().getFeaturesAtCoordinate(Coordinate);
        /* let callback = function(feature) {
          if (!this.features_ || includes(this.features_.getArray(), feature)) {
            return feature;
          }
        }.bind(this)*/
        if (feature && feature.length > 0) {
          return feature;
        }

        // 针对其他查询
        return map.forEachFeatureAtPixel(
          pixel,
          function (feature) {
            if (
              !this.features_ ||
              includes(this.features_.getArray(), feature)
            ) {
              return feature;
            }
          }.bind(this),
          {
            layerFilter: this.layerFilter_,
            hitTolerance: this.hitTolerance_
          }
        );
      };
    },
    copyPlot() {
      let geoJson;
      if (this.type === PlotTypes.TEXTAREA) {
        // console.log(plotJson)
        geoJson = {
          type: PlotTypes.TEXTAREA,
          position: this.getPaddingPoint(this.textPlot.getPosition()),
          width: this.textPlot.element.clientWidth,
          height: this.textPlot.element.clientHeight,
          text: this.textPlot.getText(),
          style: this.textPlot.getOriginStyle()
        };
      } else {
        if (this.selectFeature) {
          let geometry = this.selectFeature.getGeometry();
          let type = geometry.getPlotType();
          if (type) {
            let originPoints = geometry.getPoints();
            let paddingPoints = [];
            for (let point of originPoints) {
              paddingPoints.push(this.getPaddingPoint(point));
            }
            geoJson = {
              type: type,
              points: paddingPoints,
              style: geometry.style
            };
          }
        }
      }
      return geoJson;
    },
    getPaddingPoint(point) {
      // console.log('origin:',point)
      let pixel = this.$map.getPixelFromCoordinate(point);
      pixel[0] = pixel[0] + this.copyPadding;
      pixel[1] = pixel[1] + this.copyPadding;
      let after = this.$map.getCoordinateFromPixel(pixel);
      // console.log('changed:', after)
      return after;
    }
  }
};
</script>

<style scoped></style>
