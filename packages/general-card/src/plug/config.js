import defaultStyle from 'shinegis-client-23d/src/mixins/components/defaultCardStyle';

export const cardConfig = {
  props: {
    styleConfig: {
      type: Object,
      default: () => {}
    },
    theme: {
      type: String,
      default: 'light'
    },
    title: {
      type: String,
      default: '标题'
    },
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '100px',
        left: '100px'
      })
    },
    imgSrc: {
      type: String,
      default: 'layer-manager'
    },
    // 组件单独配置优先级最高，主要BI用（还需要一个全局配置，还未添加，后续看怎么配再考虑）
    themeStyle: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      // 默认配置优先级最低
      defaultStyle,
      defaultConfig: {
        isShowBtn: false, // true时展示btn点btn显示面板,false直接显示面板
        isStartFix: false, // 初始化时Fix状态是否启用
        isShowCorner: false,
        isShowTitleBar: true,
        titleBar: {
          miniBtn: true,
          maxBtn: false,
          closeBtn: true,
          fixBtn: true,
          title: true,
          icon: true
        },
        autoVisible: false,
        toolBtnSize: {
          size: '16px',
          margin: '8px'
        },
        btnSize: {
          size: '32px',
          padding: '8px',
          radius: '16px'
        },
        size: {
          radius: '4px',
          width: '275px',
          height: '80vh'
        }
      }
    };
  },
  computed: {
    closeSrc() {
      return 'close';
    },
    minSrc() {
      return 'minimize';
    },
    fixSrc() {
      return 'pin';
    },
    unfixSrc() {
      return 'unpin';
    },
    btnFill() {
      let color;
      if (this.getStyle().toolButton) {
        return this.getStyle().toolButton.color;
      } else {
        color = this.getTheme() === 'dark' ? '#fff' : '#000';
      }
      return color;
    },
    configObj() {
      return {
        ...this.defaultConfig,
        ...this.styleConfig,
        titleBar: {
          ...this.defaultConfig.titleBar,
          ...this.styleConfig?.titleBar
        },
        toolBtnSize: {
          ...this.defaultConfig.toolBtnSize,
          ...this.styleConfig?.toolBtnSize
        },
        btnSize: {
          ...this.defaultConfig.btnSize,
          ...this.styleConfig?.btnSize
        },
        size: {
          ...this.defaultConfig.size,
          ...this.styleConfig?.size
        }
      };
    },
    themeStyleObj() {
      const styleObj = {
        light: {
          title: {
            ...this.defaultStyle.light.title,
            ...this.themeStyle?.light?.title
          },
          primaryFont: {
            ...this.defaultStyle.light.primaryFont,
            ...this.themeStyle?.light?.primaryFont
          },
          panel: {
            ...this.defaultStyle.light.panel,
            ...this.themeStyle?.light?.panel
          },
          toolButton: {
            ...this.defaultStyle.light.toolButton,
            ...this.themeStyle?.light?.toolButton
          },
          floatButton: {
            ...this.defaultStyle.light.floatButton,
            ...this.themeStyle?.light?.floatButton
          },
          corner: {
            ...this.defaultStyle.light.corner,
            ...this.themeStyle?.light?.corner
          }
        },
        dark: {
          title: {
            ...this.defaultStyle.dark.title,
            ...this.themeStyle?.dark?.title
          },
          primaryFont: {
            ...this.defaultStyle.dark.primaryFont,
            ...this.themeStyle?.dark?.primaryFont
          },
          panel: {
            ...this.defaultStyle.dark.panel,
            ...this.themeStyle?.dark?.panel
          },
          toolButton: {
            ...this.defaultStyle.dark.toolButton,
            ...this.themeStyle?.dark?.toolButton
          },
          floatButton: {
            ...this.defaultStyle.dark.floatButton,
            ...this.themeStyle?.dark?.floatButton
          },
          corner: {
            ...this.defaultStyle.dark.corner,
            ...this.themeStyle?.dark?.corner
          }
        }
      };

      return styleObj;
    }
  },
  methods: {
    getTheme() {
      return this.theme;
    },
    getStyle() {
      return this.getTheme()
        ? this.themeStyleObj[this.getTheme()]
        : this.configObj.style;
    },
    getFloatBtnSrc() {
      return this.imgSrc;
    },
    getTagStyle() {
      let floatBtnStyle = this.getStyle().floatButton;
      let title = this.getStyle().title;
      let bodySize = this.configObj.size;
      let shadowColor = floatBtnStyle.shadowColor;
      let sizeStyle = {
        color: title.color,
        fontSize: title.fontSize,
        borderRadius: bodySize.radius,
        boxShadow: '0 0px 10px 0.5px ' + shadowColor
      };
      return Object.assign(sizeStyle, floatBtnStyle);
    },
    getFloatBtnStyle() {
      let floatBtnStyle = this.getStyle().floatButton;
      let btnSize = this.configObj.btnSize;
      let shadowColor = floatBtnStyle.shadowColor;
      let size = Number(btnSize.size.replace('px', ''));
      let sizeStyle = {
        height: size + 'px',
        padding: btnSize.padding,
        borderRadius: btnSize.radius,
        boxShadow: '0 0px 10px 0.5px ' + shadowColor
      };
      return Object.assign(sizeStyle, floatBtnStyle);
    },
    getToolBtnSize() {
      let toolSize = this.configObj.toolBtnSize;
      return toolSize
        ? Number(toolSize.size.replace('px', ''))
        : this.getFloatImgSize();
    },
    getFloatImgSize() {
      let btnSize = this.configObj.btnSize;
      let size = Number(btnSize.size.replace('px', ''));
      let padding = Number(btnSize.padding.replace('px', ''));
      // return (size - padding * 2) + 'px'
      return size - padding * 2;
    },
    getContentSizeStyle() {
      return this.getSize();
    },
    getPositionStyle() {
      let position = this.configObj.position
        ? this.configObj.position
        : this.position;
      let zIndex = position.zIndex ? position.zIndex : 999;

      return (
        'position:' +
        position.type +
        ';' +
        'left:' +
        position.left +
        ';' +
        'right:' +
        position.right +
        ';' +
        'top:' +
        position.top +
        ';' +
        'bottom:' +
        position.bottom +
        ';' +
        ';z-index:' +
        zIndex +
        ';text-align:left;'
      );
    },
    getTitleBar() {
      return this.configObj.titleBar;
    },

    getTitleBarStyle() {
      let btnSize = this.configObj.btnSize;
      let bodySize = this.configObj.size;
      let size = Number(btnSize.size.replace('px', ''));
      let titleStyle = this.getStyle().title;
      let sizeStyle = {
        height: size + 'px',
        lineHeight: size + 'px',
        borderRadius: bodySize.radius + ' ' + bodySize.radius + ' 0px 0px'
      };
      return Object.assign(sizeStyle, titleStyle);
    },
    getTitleImageStyle() {
      let btnSize = this.configObj.btnSize;
      return 'margin:' + btnSize.padding;
    },
    getTitleRightImgStyle() {
      let padding = this.configObj.toolBtnSize
        ? this.configObj.toolBtnSize.margin
        : this.configObj.btnSize.padding;
      return ';margin:' + padding + ';cursor: pointer';
    },
    getSize() {
      const size = this.configObj.size;
      const primaryFont = this.getStyle().primaryFont;
      const title = this.getStyle().title;
      const panel = this.getStyle().panel;
      return (
        'width:' +
        size.width +
        ';--primaryFontSize:' +
        primaryFont.fontSize +
        ';--primaryFontColor:' +
        primaryFont.fontColor +
        ';--title-backgroundColor:' +
        title.backgroundColor +
        ';--title-color:' +
        title.color +
        ';--title-fontSize:' +
        title.fontSize +
        ';--panel-backgroundColor:' +
        panel.backgroundColor +
        ';--panel-opacity:' +
        panel.opacity +
        ';--panel-border:' +
        panel.border
      );
    },
    getPanelStyle() {
      let panelStyle = this.getStyle().panel;
      let bodySize = this.configObj.size;
      let sizeStyle = {
        borderRadius: bodySize.radius
      };
      return Object.assign(sizeStyle, panelStyle);
      // + ';width: 100%'
    },
    getBodyStyle() {
      const bodySize = this.configObj.size;
      const primaryFont = this.themeStyleObj[this.theme].primaryFont;

      return {
        borderRadius: `0px 0px ${bodySize.radius} ${bodySize.radius}`,
        maxHeight: bodySize.height,
        overflow: `${bodySize.overflow || 'auto'}`,
        fontSize: primaryFont.fontSize,
        color: primaryFont.fontColor
      };
    },

    getCornerStyle() {
      let cornerStyle = this.getStyle().corner;
      return cornerStyle;
      // + ';width: 100%'
    },

    _isZero(value) {
      if (value == undefined || value === 0 || value === '0px') {
        return true;
      } else {
        return false;
      }
    },
    _getPosition(x, y, isLeft) {
      let xName = isLeft ? 'left' : 'top';
      let yName = isLeft ? 'right' : 'bottom';

      if (this._isZero(x) && this._isZero(y)) {
        // 2个全为0
        return xName + ':' + '0px';
      } else if (!this._isZero(x) && !this._isZero(y)) {
        // 2个都不为0,只认第一个值
        return xName + ':' + x;
      } else {
        // 一个是0
        x = this._isZero(x) ? 'unset' : x;
        y = this._isZero(y) ? 'unset' : y;
        return xName + ':' + x + ';' + yName + ':' + y;
      }
    }
  }
};
