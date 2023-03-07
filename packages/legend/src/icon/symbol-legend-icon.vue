<template>
  <div
    v-if="show"
    class="imagesDiv"
    :style="`height:${height}px;width:${width}px`"
  >
    <div :style="setStyle()"></div>
  </div>
</template>

<script>
import Color from 'color';

export default {
  name: 'SymbolLegendIcon',
  props: {
    styleObj: { type: Object },
    type: {
      type: String
    },
    width: { type: Number },
    height: { type: Number }
  },
  data() {
    return {
      show: true
    };
  },
  mounted() {},
  methods: {
    setStyle() {
      let style = '';
      if (this.type === 'polygon') {
        style = this.setPolygonStyle(this.styleObj);
      } else if (this.type === 'point') {
        style = this.setPointStyle(this.styleObj);
      } else if (this.type === 'polyline') {
        style = this.setLineStyle(this.styleObj);
      } else {
        style = this.setPolygonStyle(this.styleObj);
      }
      return style;
    },

    setPolygonStyle(item) {
      let width = this.width ? this.width : 50;
      let height = this.height ? this.height : 25;
      let fill = this.getColor(item.color, item.opacity);
      let stroke = this.getColor(item.outlineColor, item.outlineOpacity);
      let style = {
        height: height + 'px',
        width: width + 'px'
      };
      if (fill) {
        style.background = fill;
      }
      if (stroke) {
        style.border = '2px solid ' + stroke;
      }
      return style;
    },

    setPointStyle(item) {
      let image = item.image;
      let width = this.width ? this.width : 50;
      let height = this.height ? this.height : 50;
      let style = {
        height: height + 'px',
        width: width + 'px'
      };
      if (image) {
        style.backgroundSize = height + 'px;';
        style.backgroundImage = "url('" + image + "')";
        style.backgroundRepeat = 'no-repeat';
        style.backgroundPosition = 'center';
        style.backgroundSize = '100% 100%';
      } else {
        let fill = this.getColor(item.color, item.opacity);
        let stroke = this.getColor(item.outlineColor, item.outlineOpacity);
        style.background = fill;
        style.border = '2px solid ' + stroke;
        style.borderRadius = '50%';
      }
      return style;
    },

    setLineStyle(item) {
      let color = this.getColor(item.color, item.opacity);
      let width = this.width ? this.width : 50;
      let height = this.height ? this.height : 25;
      let strokeWidth = item.width;
      let margin = (height - strokeWidth) / 2;
      let style = {
        height: '2px',
        width: width + 'px',
        margin: margin + 'px 0'
      };
      if (color) {
        style.background = color;
      }
      return style;
    },

    getColor(color, opacity) {
      return Color(color)
        .alpha(opacity != null ? opacity : 1)
        .hexa();
    }
  }
};
</script>
