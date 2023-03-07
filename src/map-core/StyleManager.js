import {
  Circle as CircleStyle,
  Circle,
  Fill,
  Icon,
  Stroke,
  Style,
  Text
} from 'ol/style';
import Color from 'color';

export default class StyleManager {
  constructor(map) {
    this.map = map;
    this.defaultSymbol = {
      type: 'polygon',
      styleOptions: {
        fill: true,
        color: 'rgb(255, 255, 255)',
        opacity: 0.2,
        outline: true,
        outlineColor: 'rgb(1, 191, 255)',
        outlineWidth: 1,
        outlineOpacity: 1
      }
    };
  }

  bindLayer(layer) {
    let self = this;
    // 绑定刷新样式的方法
    layer.setLayerStyle = function (style) {
      if (style) {
        layer.symbol = style;
        let _style = self.getLayerStyle(layer.symbol);
        if (_style) {
          layer.setStyle(_style);
        }
      } else {
        layer.setStyle(
          new Style({
            fill: new Fill({
              color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new Stroke({
              color: 'rgb(1, 191, 255)',
              width: 1
            }),
            image: new CircleStyle({
              radius: 3,
              fill: new Fill({
                color: 'rgb(1, 191, 255)'
              }),
              stroke: new Stroke({
                color: '#FED976',
                width: 1
              })
            })
          })
        );
      }

      //todo 渲染label 需要根据现有的layer绑定另外一个点层 后续完善
    };
    // 绑定获取样式配置的方法
    layer.getLayerStyle = function () {
      return layer.symbol ? layer.symbol : self.defaultSymbol;
    };
    //默认样式
    layer.setLayerStyle();
  }

  getLayerStyle(symbol) {
    let self = this;
    if (symbol) {
      //分段样式
      if (
        symbol.styleStepOptions &&
        Object.keys(symbol.styleStepOptions).length > 0
      ) {
        let minValue = symbol.minValue;
        if (minValue === null) {
          minValue = Number.MIN_VALUE;
        }
        let styleMap = new Map();
        let key = symbol.styleField;
        return function (feature, resolution) {
          let value = feature.getProperties()[key];
          let filedIndex = self.getIndexByValue(
            symbol.styleStepOptions,
            minValue,
            value
          );
          let styleOptions;
          if (filedIndex != null) {
            styleOptions = symbol.styleStepOptions[filedIndex].style;
          }
          if (styleOptions) {
            let trueStyleOptions = {
              ...symbol.styleOptions,
              ...styleOptions
            };
            if (
              !self.isDynamicStyle(trueStyleOptions) &&
              styleMap.get(filedIndex)
            ) {
              return styleMap.get(filedIndex);
            } else {
              let valueStyle = self.getStyle(
                symbol.type,
                trueStyleOptions,
                feature,
                resolution
              );
              styleMap.set(filedIndex, valueStyle);
              return valueStyle;
            }
          }
          return self.getStyle(
            symbol.type,
            symbol.styleOptions,
            feature,
            resolution
          );
        };
      }
      //分值样式
      else if (
        symbol.styleFieldOptions &&
        Object.keys(symbol.styleFieldOptions).length > 0
      ) {
        let styleMap = new Map();
        let key = symbol.styleField;
        let key2 = symbol.styleField2;
        let key3 = symbol.styleField3;
        return function (feature, resolution) {
          let value = feature.getProperties()[key]
            ? feature.getProperties()[key]
            : '';
          if (key2) {
            let value2 = feature.getProperties()[key2]
              ? feature.getProperties()[key2]
              : '';
            value += ', ' + value2;
          }
          if (key3) {
            let value3 = feature.getProperties()[key3]
              ? feature.getProperties()[key3]
              : '';
            value += ', ' + value3;
          }
          let styleOptions = symbol.styleFieldOptions[value];
          if (styleOptions) {
            let trueStyleOptions = {
              ...symbol.styleOptions,
              ...styleOptions
            };
            if (!self.isDynamicStyle(trueStyleOptions) && styleMap.get(value)) {
              return styleMap.get(value);
            } else {
              let valueStyle = self.getStyle(
                symbol.type,
                trueStyleOptions,
                feature,
                resolution
              );
              styleMap.set(value, valueStyle);
              return valueStyle;
            }
          }
          return self.getStyle(
            symbol.type,
            symbol.styleOptions,
            feature,
            resolution
          );
        };
      }
      //简单样式
      else {
        return function (feature, resolution) {
          return self.getStyle(
            symbol.type,
            symbol.styleOptions,
            feature,
            resolution
          );
        };
      }
    } else {
      return this.getStyle('polygon', this.defaultSymbol);
    }
  }

  getIndexByValue(styleFieldOptions, minValue, value) {
    for (let index in styleFieldOptions) {
      let maxValue = styleFieldOptions[index].value;
      if (value >= minValue && value <= maxValue) {
        return index;
      }
      //下一次循环的minValue为上一次的maxValue
      minValue = maxValue;
    }
  }

  getColor(color, opacity) {
    return Color(color)
      .alpha(opacity != null ? opacity : 1)
      .hexa();
  }

  getStyle(type, styleConfig, feature, resolution) {
    switch (type) {
      case 'polygon':
        return this.getPolygonStyle(styleConfig, feature, resolution);
      case 'polyline':
        return this.getPolylineStyle(styleConfig, feature, resolution);
      case 'point':
        return this.getPointStyle(styleConfig, feature, resolution);
      default:
        return this.getPolygonStyle(styleConfig, feature, resolution);
    }
  }

  getPolygonStyle(styleConfig, feature, resolution) {
    return new Style({
      fill: styleConfig.color
        ? new Fill({
            color: this.getColor(styleConfig.color, styleConfig.opacity)
          })
        : null,
      stroke: styleConfig.outlineColor
        ? new Stroke({
            color: this.getColor(
              styleConfig.outlineColor,
              styleConfig.outlineOpacity
            ),
            width: styleConfig.outlineWidth
          })
        : null,
      image: new Circle({
        radius: styleConfig.radius ? styleConfig.radius : 3,
        fill: new Fill({
          color: this.getColor(styleConfig.color, styleConfig.opacity)
        }),
        stroke: styleConfig.outlineColor
          ? new Stroke({
              color: this.getColor(
                styleConfig.outlineColor,
                styleConfig.outlineOpacity
              ),
              width: styleConfig.outlineWidth
            })
          : null
      }),
      text: this.createTextStyle(styleConfig.label, feature, resolution)
    });
  }

  getPolylineStyle(styleConfig, feature, resolution) {
    return new Style({
      stroke: new Stroke({
        color: this.getColor(styleConfig.color, styleConfig.opacity),
        width: styleConfig.width
      }),
      text: this.createTextStyle(styleConfig.label, feature, resolution)
    });
  }

  getPointStyle(styleConfig, feature, resolution) {
    if (styleConfig.image) {
      return new Style({
        image: new Icon({
          src: styleConfig.image,
          scale: styleConfig.scale
        }),
        text: this.createTextStyle(styleConfig.label, feature, resolution)
      });
    } else {
      return new Style({
        image: new Circle({
          radius: styleConfig.radius,
          fill: new Fill({
            color: this.getColor(styleConfig.color, styleConfig.opacity)
          }),
          stroke: styleConfig.outlineColor
            ? new Stroke({
                color: this.getColor(
                  styleConfig.outlineColor,
                  styleConfig.outlineOpacity
                ),
                width: styleConfig.outlineWidth
              })
            : null
        }),
        text: this.createTextStyle(styleConfig.label, feature, resolution)
      });
    }
  }

  createTextStyle(labelStyle, feature, resolution) {
    if (labelStyle) {
      let isShowText = true;
      if (labelStyle.distanceDisplayCondition_far) {
        isShowText = false;
        let minZoom = this.getLevel(labelStyle.distanceDisplayCondition_far);
        let minResolution = this.map.getView().getResolutionForZoom(minZoom);
        if (resolution < minResolution) {
          isShowText = true;
        }
      }
      if (labelStyle.distanceDisplayCondition_near) {
        isShowText = false;
        let maxZoom = this.getLevel(labelStyle.distanceDisplayCondition_near);
        let maxResolution = this.map.getView().getResolutionForZoom(maxZoom);
        if (resolution > maxResolution) {
          isShowText = true;
        }
      }

      let field = labelStyle.field
        ? labelStyle.field
        : labelStyle.text
        ? labelStyle.text.replace('{', '').replace('}', '')
        : '';
      let text = feature.get(field);
      if (isShowText === false) {
        return null;
      } else {
        //let font = labelStyle.font_family;
        let font = '';
        if (labelStyle.font_size) {
          font += labelStyle.font_size + 'px';
        }
        if (labelStyle.font_family) {
          font += ' ' + labelStyle.font_family;
        }
        font += ' sans-serif';
        return new Text({
          text: text,
          font: font,
          offsetX: labelStyle.pixelOffset ? labelStyle.pixelOffset[0] : 0,
          offsetY: labelStyle.pixelOffset ? labelStyle.pixelOffset[1] : 0,
          fill: new Fill({
            color: this.getColor(labelStyle.color, labelStyle.opacity)
          }),
          stroke: labelStyle.border
            ? new Stroke({
                color: this.getColor(
                  labelStyle.border_color,
                  labelStyle.opacity
                )
              })
            : null,
          backgroundFill: labelStyle.background
            ? new Fill({
                color: this.getColor(
                  labelStyle.background_color
                    ? labelStyle.background_color
                    : '#2A2A2A',
                  labelStyle.background_opacity
                )
              })
            : null
        });
      }
    } else {
      return null;
    }
  }

  getLevel(height) {
    return Math.log2(48000000 / height);
  }

  isDynamicStyle(styleOptions) {
    if (
      styleOptions.distanceDisplayCondition_far ||
      styleOptions.distanceDisplayCondition_near
    ) {
      return true;
    }
    if (
      styleOptions.label &&
      (styleOptions.label.distanceDisplayCondition_far ||
        styleOptions.label.distanceDisplayCondition_near)
    ) {
      return true;
    }
    return false;
  }
  // 暂时废弃 图片样式和渐变样式
  /* getStyle(styleConfig) {
    if (!styleConfig.type || styleConfig.type === 'color') {
      return new Style({
        fill: new Fill({
          color: styleConfig.fill
        }),
        stroke: new Stroke({
          color: styleConfig.strokeColor,
          width: styleConfig.strokeWidth
        })
      });
    } else if (styleConfig.type === 'image') {
      const fill = new Fill();
      const stroke = new Stroke({
        color: styleConfig.strokeColor,
        width: styleConfig.strokeWidth
      });
      return new Style({
        renderer: function (pixelCoordinates, state) {
          const context = state.context;
          const geometry = state.geometry.clone();
          geometry.setCoordinates(pixelCoordinates);
          const extent = geometry.getExtent();
          const width = getWidth(extent);
          const height = getHeight(extent);
          let options = styleConfig.image;

          // Stitch out country shape from the blue canvas
          context.save();
          const renderContext = toContext(context, {
            pixelRatio: 1
          });
          renderContext.setFillStrokeStyle(fill, stroke);
          renderContext.drawGeometry(geometry);
          context.clip();

          // Fill transparent country with the flag image
          const bottomLeft = getBottomLeft(extent);
          const left = bottomLeft[0];
          const bottom = bottomLeft[1];
          let image = new Image();
          image.src = options.src;
          context.drawImage(image, left, bottom, width, height);
          context.restore();
        }
      });
    } else {
      return new Style({
        renderer: (_coords, state) => {
          try {
            const ctx = state.context;
            var geom = state.geometry;
            // 计算渐变分辨率

            if (styleConfig.isGradient) {
              // 生成渐变配置
              const extent = geom.getExtent();
              const pixel1 = this.map.getPixelFromCoordinate([
                extent[0],
                extent[1]
              ]);
              const pixel2 = this.map.getPixelFromCoordinate([
                extent[2],
                extent[3]
              ]);
              let grad = ctx.createLinearGradient(
                pixel1[0] * state.pixelRatio,
                0,
                pixel2[0] * state.pixelRatio,
                0
              );
              grad.addColorStop(1, styleConfig.fill);
              grad.addColorStop(0, 'rgba(0,0,0,0)');
              ctx.fillStyle = grad;
            } else {
              ctx.fillStyle = styleConfig.fill;
            }
            ctx.lineDashOffset = 0;
            ctx.setLineDash([]);
            ctx.strokeStyle = styleConfig.strokeColor;
            ctx.lineWidth = styleConfig.strokeWidth;
            // 绘制
            const coordinates = _coords[0];
            const startPoint = coordinates[0];
            ctx.beginPath();
            ctx.moveTo(startPoint[0], startPoint[1]);

            for (var i = 1; i < coordinates.length; i++) {
              const coordinate = coordinates[i];
              ctx.lineTo(coordinate[0], coordinate[1]);
              // console.log(coordinate[0], coordinate[1]);
            }
            ctx.lineTo(startPoint[0], startPoint[1]);
            ctx.fill();
            ctx.stroke();
          } catch (e) {
            console.warn(e);
          }
        }
      });
    }
  }*/
}
