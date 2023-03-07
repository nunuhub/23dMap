<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import Bubble from './Bubble';

export default {
  name: 'ShBubbleLayer',
  mixins: [commom, emitter],
  props: {
    widgetInfo: Object
  },
  data() {
    this.bubble;
    return {};
  },
  watch: {
    widgetInfo(data) {
      this.bubble && this.bubble.initBubble(data);
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
      this.bubble = new Bubble(this.$map, (regionCode) => {
        this.$emit('onRegionChange', regionCode);
      });
      // 不传参数则展示默认数据
      this.bubble.initBubble(this.widgetInfo);
    }
  },
  render() {
    return null;
  }
};
</script>
