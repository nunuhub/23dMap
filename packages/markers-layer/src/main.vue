<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import Marker from './Mark';

export default {
  name: 'ShMarkersLayer',
  mixins: [commom, emitter],
  props: {
    widgetInfo: Object
  },
  data() {
    this.marker;
    return {};
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
      this.marker = new Marker(this.$map, (regionCode) => {
        this.$emit('onRegionChange', regionCode);
      });
      // 不传参数则展示默认数据
      this.marker.initMark(this.widgetInfo);
    }
  },
  render() {
    return null;
  }
};
</script>
