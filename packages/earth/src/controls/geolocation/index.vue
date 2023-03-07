<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { Location } from 'shinegis-client-23d/src/earth-core/Tool/Location83';

const defaultFormat =
  '<div>俯仰角：{pitch}度</div><div>方向：{heading}度（0度为正北）</div><div>视高：{height}米</div><div>纬度：{screenwd})</div><div>相机 (经度：{screenjd}</div>';

export default {
  name: 'ShEarthGeolocation',
  mixins: [commom, emitter],
  props: {
    options: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      crs: this.options?.crs,
      format: this.options?.format || defaultFormat
    };
  },
  mounted() {
    this.location = new Location(this.$earth.viewer, {
      crs: this.crs,
      format: this.format,
      bindEvent: false
    });
    this.$earth.viewer.shine._location = this.location;
    this.location.updaeCamera();
  },
  beforeDestroy() {
    this.location?.destroy();
  },
  render() {
    return null;
  }
};
</script>
