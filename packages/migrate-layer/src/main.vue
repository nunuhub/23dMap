<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import Migrate from './Migrate';

export default {
  name: 'ShMigrateLayer',
  mixins: [commom, emitter],
  props: {
    widgetInfo: Object
  },
  data() {
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
      const migrate = new Migrate(this.$map);
      // 不传参数则展示默认数据
      migrate.initMigrate(this.widgetInfo);
    }
  },
  render() {
    return null;
  }
};
</script>
