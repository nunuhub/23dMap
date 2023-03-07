<template>
  <div
    v-if="show"
    class="imagesDiv"
    :style="`height:${height}px;width:${width}px`"
  >
    <div
      v-for="(item, index) in symbolizers"
      :key="index"
      :style="setStyle(item)"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'LegendIcon',
  // eslint-disable-next-line vue/require-prop-types
  props: ['symbolizers', 'width', 'height'],
  data() {
    return {
      show: true
    };
  },
  mounted() {},
  methods: {
    setStyle(item) {
      let key = Object.keys(item)[0];
      let style = '';
      if (key === 'Polygon') {
        style = this.setPolygonStyle(item[key]);
      } else if (key === 'Point') {
        style = this.setPointStyle(item[key]);
      } else if (key === 'Line') {
        style = this.setLineStyle(item[key]);
      } else {
        this.show = false;
      }
      return style;
    },

    setPolygonStyle(item) {
      let width = this.width ? this.width : 50;
      let height = this.height ? this.height : 25;
      let style = '';
      let fill = item.fill;
      let stroke = item.stroke;
      let graphic = item['graphic-fill'];
      let wh = 'height:' + height + 'px;width:' + width + 'px;';
      if (fill) {
        style = 'background-color:' + fill + ';';
      }
      style += wh;
      if (stroke) {
        style += 'border:2px solid' + stroke + ';';
      }
      if (graphic) {
        style += "background-image:url('" + graphic.url + "');";
        style += 'background-size: 100% 100%;';
      }
      return style;
    },

    setPointStyle(item) {
      let style = '';
      let url = item.url;
      let width = this.width ? this.width : 50;
      let height = this.height ? this.height : 50;
      // this.style="width:"+width+"px;height:"+height+"px;"
      if (url) {
        style = 'width:' + width + 'px;height:' + height + 'px;';
        style += 'background-size:' + height + 'px;';
        style += "background-image:url('" + url + "');";
        style += 'background-repeat:no-repeat;';
        style += 'background-position:center';
      }
      return style;
    },

    setLineStyle(item) {
      let color = item.stroke;
      let style = '';
      let width = this.width ? this.width : 50;
      let height = this.height ? this.height : 25;
      // this.style="width:"+width+"px;height:"+height+"px;"
      let strokeWidth = item['stroke-width'];
      let margin = (height - strokeWidth) / 2;
      if (strokeWidth) {
        style = 'width:' + width + 'px;height:2px;margin:' + margin + 'px 0;';
      }
      if (color) {
        style += 'background:' + color + ';';
      }
      return style;
    }
  }
};
</script>
