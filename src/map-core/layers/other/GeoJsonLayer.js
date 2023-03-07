import { Vector as VectorLayer } from 'ol/layer';
import axios from '../../../utils/request';
import { Vector as VectorSource } from 'ol/source';
import GeoJSON from 'ol/format/GeoJSON';
import { Point } from 'ol/geom';
import LayerGroup from 'ol/layer/Group';
import Feature from 'ol/Feature';
import { Fill, Stroke, Icon, Text, Style } from 'ol/style.js';
import Color from 'color';
import { Circle } from 'ol/style';

class GeoJsonLayer {
  constructor(map) {
    this.map = map;
  }

  generate(data) {
    return new Promise((resolve, reject) => {
      axios
        .get(data.url, {
          headers: {
            'content-type': 'application/json'
          }
        })
        .then((response) => {
          let geojson = response.headers ? response.data : response;
          let outCrs = this.map.getView().getProjection().getCode();
          let geojsonOptions = {
            featureProjection: outCrs
          };
          let features = new GeoJSON(geojsonOptions).readFeatures(geojson);
          let labelFeatures = [];

          // 生成labelFeatures
          for (let feature of features) {
            if (feature.getGeometry() instanceof Point) {
              //复制一个点
              let properties = feature.getProperties();
              labelFeatures.push(new Feature(properties));
            } else {
              let coordinates = this.map.getCenter(feature);
              let properties = feature.getProperties();
              properties.geometry = new Point(coordinates);
              labelFeatures.push(new Feature(properties));
            }
          }

          let options = {
            id: data.id,
            info: data,
            layerTag: data.layerTag,
            zIndex: data.mapIndex,
            minResolution: data.minResolution,
            maxResolution: data.maxResolution,
            isFit: typeof data.isFit === 'boolean' ? data.isFit : false
          };

          //分离label和其他图层,用layer.MinZoom MaxZoom分别控制显隐
          let labelVectorSource = new VectorSource();
          const labelLayer = new VectorLayer({
            ...options,
            zIndex: data.mapIndex + 0.1,
            source: labelVectorSource
          });

          let vectorSource = new VectorSource();
          const layer = new VectorLayer({
            ...options,
            source: vectorSource
          });

          let layers = [layer, labelLayer];
          let layerGroup = new LayerGroup({ ...options, layers: layers });

          if (features && features.length > 0) {
            let extent = JSON.parse(
              JSON.stringify(features[0].getGeometry().getExtent())
            );
            for (let feature of features) {
              let geoExtent = feature.getGeometry().getExtent();
              extent[0] = Math.min(extent[0], geoExtent[0]);
              extent[1] = Math.min(extent[1], geoExtent[1]);
              extent[2] = Math.max(extent[2], geoExtent[2]);
              extent[3] = Math.max(extent[3], geoExtent[3]);
            }
            layerGroup.set('initExtent', extent);
          }

          labelVectorSource.addFeatures(labelFeatures);
          vectorSource.addFeatures(features);

          if (data.symbol?.styleOptions?.label?.distanceDisplayCondition) {
            let labelOptions = data.symbol.styleOptions.label;
            let maxZoom = this.getLevel(
              labelOptions.distanceDisplayCondition_near
            );
            let minZoom = this.getLevel(
              labelOptions.distanceDisplayCondition_far
            );
            labelLayer.setMaxZoom(maxZoom);
            labelLayer.setMinZoom(minZoom);
          }
          if (data.symbol?.styleOptions?.distanceDisplayCondition) {
            let styleOptions = data.symbol.styleOptions;
            let maxZoom = this.getLevel(
              styleOptions.distanceDisplayCondition_near
            );
            let minZoom = this.getLevel(
              styleOptions.distanceDisplayCondition_far
            );
            layer.setMaxZoom(maxZoom);
            layer.setMinZoom(minZoom);
          }

          //默认样式
          let defaultStyle = new Style({
            fill: this.getFill('rgba(230,255,0,0.4)'),
            stroke: new Stroke({
              color: 'rgba(255, 255, 0, 1)',
              width: 5
            })
          });
          layer.setStyle(defaultStyle);
          let defaultLabelStyle = new Style({
            image: new Circle({
              fill: this.getFill('#00000000'),
              stroke: new Stroke({
                color: '#00000000'
              })
            })
          });
          labelLayer.setStyle(defaultLabelStyle);
          //设置配置样式
          if (data.symbol?.styleOptions) {
            for (let pointFeature of labelFeatures) {
              let styleOptions = this.getStyle(
                data.symbol,
                pointFeature.getProperties()
              );
              let labelOptions = styleOptions.label;
              if (labelOptions) {
                let field = labelOptions.field
                  ? labelOptions.field
                  : labelOptions.text
                  ? labelOptions.text.replace('{', '').replace('}', '')
                  : '';
                pointFeature.setStyle(
                  new Style({
                    text: new Text({
                      text: pointFeature.getProperties()[field]
                        ? pointFeature.getProperties()[field]
                        : field,
                      font: labelOptions.font_size + 'px sans-serif',
                      offsetX: labelOptions.pixelOffset
                        ? labelOptions.pixelOffset[0]
                        : 0,
                      offsetY: labelOptions.pixelOffset
                        ? labelOptions.pixelOffset[1]
                        : 0,
                      fill: new Fill({
                        color: this.getColor(
                          labelOptions.color,
                          labelOptions.opacity
                        )
                      }),
                      stroke: labelOptions.border
                        ? new Stroke({
                            color: this.getColor(
                              labelOptions.border_color,
                              labelOptions.opacity
                            )
                          })
                        : null,
                      backgroundFill: labelOptions.background
                        ? this.getFill(
                            this.getColor(
                              labelOptions.background_color,
                              labelOptions.background_opacity
                            )
                          )
                        : null
                    }),
                    image: labelOptions.image
                      ? new Icon({
                          src: labelOptions.image
                        })
                      : null
                  })
                );
              }
            }
            for (let feature of features) {
              let style;
              let styleOptions = this.getStyle(
                data.symbol,
                feature.getProperties()
              );
              switch (feature.getGeometry().getType()) {
                case 'Point':
                case 'MultiPoint':
                  style = new Style({
                    image: styleOptions.image
                      ? new Icon({
                          src: styleOptions.image
                        })
                      : null
                  });
                  break;
                case 'LineString':
                case 'MultiLineString':
                  style = new Style({
                    stroke: new Stroke({
                      color: styleOptions.color
                        ? this.getColor(
                            styleOptions.color,
                            styleOptions.opacity
                          )
                        : 'rgba(255, 255, 0, 1)',
                      width: styleOptions.width ? styleOptions.width : 5,
                      lineDash:
                        styleOptions.lineType === 'dash' ? [5, 10] : null
                    })
                  });
                  break;
                case 'Polygon':
                case 'MultiPolygon':
                  style = new Style({
                    stroke: new Stroke({
                      color: styleOptions.outline
                        ? this.getColor(
                            styleOptions.outlineColor,
                            styleOptions.opacity
                          )
                        : 'rgba(255, 255, 0, 1)',
                      width: styleOptions.outlineWidth
                        ? styleOptions.outlineWidth
                        : 5
                    }),
                    fill: new Fill({
                      color: styleOptions.fill
                        ? this.getColor(
                            styleOptions.color,
                            styleOptions.opacity
                          )
                        : 'rgba(255, 255, 0, 0.4)'
                    })
                  });
                  break;
              }
              feature.setStyle(style);
            }
          }
          resolve(layerGroup);
        })
        .catch((error) => {
          console.error(error);
          reject(
            new Error(
              '"' + data.label + '"' + '图层无法正常加载，请检查运维端配置项!'
            )
          );
        });
    });
  }

  getStyle(symbol, properties) {
    if (symbol.styleFieldOptions && symbol.styleField) {
      let value = properties[symbol.styleField];
      if (symbol.styleFieldOptions[value]) {
        let specialStyleOptions = Object.assign(
          JSON.parse(JSON.stringify(symbol.styleOptions)),
          symbol.styleFieldOptions[value]
        );
        specialStyleOptions.label = Object.assign(
          JSON.parse(JSON.stringify(symbol.styleOptions.label)),
          symbol.styleFieldOptions[value].label
        );
        return specialStyleOptions;
      }
    }
    return symbol.styleOptions;
  }
  getFill(color) {
    return new Fill({
      color: color
    });
  }
  getColor(color, opacity) {
    return Color(color)
      .alpha(opacity != null ? opacity : 1)
      .hexa();
  }
  getLevel(height) {
    if (height > 48000000) {
      return 0;
    } else if (height > 24000000) {
      return 1;
    } else if (height > 12000000) {
      return 2;
    } else if (height > 6000000) {
      return 3;
    } else if (height > 3000000) {
      return 4;
    } else if (height > 1500000) {
      return 5;
    } else if (height > 750000) {
      return 6;
    } else if (height > 375000) {
      return 7;
    } else if (height > 187500) {
      return 8;
    } else if (height > 93750) {
      return 9;
    } else if (height > 46875) {
      return 10;
    } else if (height > 23437.5) {
      return 11;
    } else if (height > 11718.75) {
      return 12;
    } else if (height > 5859.38) {
      return 13;
    } else if (height > 2929.69) {
      return 14;
    } else if (height > 1464.84) {
      return 15;
    } else if (height > 732.42) {
      return 16;
    } else if (height > 366.21) {
      return 17;
    } else {
      return 20;
    }
  }
}

export default GeoJsonLayer;
