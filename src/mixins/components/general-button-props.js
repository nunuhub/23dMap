const generalButtonProps = {
  props: {
    isShow: {
      type: Boolean,
      default: true
    },
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '1px',
        left: '1px'
      })
    },
    isColumn: {
      type: Boolean,
      default: false
    },
    title: {
      type: String
    },
    iconClass: {
      type: String
    },
    // 是否可拖拽移动
    dragEnable: {
      type: Boolean,
      default: false
    },
    showImg: {
      type: Boolean,
      default: true
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    // 组件单独配置优先级最高，主要BI用（还需要一个全局配置，还未添加，后续看怎么配再考虑）
    themeStyle: {
      type: Object,
      default: () => ({
        light: {
          fontSize: '14px',
          fontColor: 'rgba(0,0,0,1)',
          backgroundColor: 'rgba(255,255,255,1)',
          backgroundHoverColor: '#b4c3e3',
          backgroundActiveColor: 'rgb(255, 211, 6)',
          radius: '4px',
          paddingTop: '4px',
          paddingBottom: '4px',
          paddingLeft: '8px',
          paddingRight: '8px'
        },
        dark: {}
      })
    }
  },
  mounted() {
    this.$_mixin_generalButton = this.$children.find(
      (ele) => ele.$options.name === 'ShGeneralButton'
    );
  },
  methods: {
    getPosition() {
      return this.$_mixin_generalButton?.getPosition();
    }
  }
};

export default generalButtonProps;
