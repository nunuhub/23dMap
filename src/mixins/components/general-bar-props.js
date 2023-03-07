const params = {
  inject: {
    generalBarThemeStyle: {
      default: null
    }
  },
  props: {
    isShow: {
      type: Boolean,
      default: true
    },
    options: {
      type: Array,
      default: function () {
        return [];
      }
    },
    // 暂没实现
    // defaultActiveIndex: {
    //   type: Array,
    //   default: () => []
    // },
    // 模式 horizontal / vertical
    mode: {
      type: String,
      default: 'vertical'
    },
    // 是否可拖拽移动
    dragEnable: {
      type: Boolean,
      default: true
    },
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '355px',
        right: '35px'
      })
    },
    // 组件单独配置优先级最高
    themeStyle: {
      type: Object
    }
  },
  data() {
    return {
      visible: this.isShow,
      theme: 'light'
    };
  },
  watch: {
    currentView: {
      handler(value) {
        if (value === 'earth') {
          this.theme = 'dark';
        } else {
          this.theme = 'light';
        }
      },
      immediate: true
    },
    isShow: function (value) {
      this.visible = value;
    }
  },
  computed: {
    barThemeStyle() {
      return this.themeStyle || this.generalBarThemeStyle || {};
    }
  },
  mounted() {
    this.$_mixin_generalBar = this.$children.find(
      (ele) => ele.$options.name === 'ShGeneralBar'
    );
  },
  methods: {
    changeShow(value) {
      this.$_mixin_generalBar?.changeShow(value);
      if (value === false || (value !== true && this.visible)) {
        this.deactivate?.();
      }
    },
    getPosition() {
      return this.$_mixin_generalBar?.getPosition();
    }
  }
};

export default params;
