<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import MapCharts from './MapCharts';

export default {
  name: 'ShHighchartsLayer',
  mixins: [commom, emitter],
  props: {
    widgetInfo: Object
  },
  data() {
    this.chart = null;
    return {};
  },
  watch: {
    widgetInfo(data) {
      this.chart && this.chart.initMapCharts(data);
    }
  },
  mounted() {
    if (this.$map) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    // 组件逻辑开始入口
    begin() {
      this.chart = new MapCharts(this.$map, (regionCode) => {
        this.$emit('onRegionChange', regionCode);
      });
      // 不传参数则展示默认数据
      this.chart.initMapCharts(this.widgetInfo);
    }
  },
  render() {
    return null;
  }
};
</script>
