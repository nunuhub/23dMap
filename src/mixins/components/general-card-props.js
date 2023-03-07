const generalCardProps = {
  inject: {
    generalCardThemeStyle: {
      default: null
    }
  },
  props: {
    styleConfig: {
      type: Object,
      default: () => {}
    },
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '100px',
        right: '135px'
      })
    },
    themeStyle: {
      type: Object
    },
    imgSrc: {
      type: String
    },
    title: {
      type: String
    },
    isShow: {
      type: Boolean,
      default: true
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    dragEnable: {
      type: Boolean,
      default: true
    },
    // 不展示面板
    onlyContainer: {
      type: Boolean,
      default: false
    },
    berth: {
      type: Boolean,
      default: true
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
    cardThemeStyle() {
      return this.themeStyle || this.generalCardThemeStyle || {};
    }
  },
  mounted() {
    this.$_mixin_generalCard = this.$children.find(
      (ele) => ele.$options.name === 'ShGeneralCard'
    );
  },
  methods: {
    changeShow(value) {
      this.$_mixin_generalCard?.changeShow(value);

      if (value === false || (value !== true && this.visible)) {
        this.deactivate?.();
      }
    },
    changeStatus(value) {
      this.$_mixin_generalCard?.changeStatus(value);
    },
    getPosition() {
      return this.$_mixin_generalCard?.getPosition();
    }
  }
};

export default generalCardProps;
