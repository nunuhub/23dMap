export const styleConfig = {
  props: {
    theme: {
      type: String,
      default: 'light'
    },
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '50%',
        left: '50%'
      })
    },
    // 组件单独配置优先级最高，主要BI用
    themeStyle: {
      type: Object,
      default: function () {
        return {};
      }
    }
  },
  data() {
    return {
      // 默认配置优先级最低
      defaultStyle: {
        light: {
          background: {
            base: '#ffffff',
            hover: '#ecf5ff',
            active: '#3385ff',
            footer: '#ffffff'
          },
          text: {
            base: '#303133',
            hover: '#303133',
            active: '#fff'
          },
          icon: {
            color: '#909399'
          },
          space: {
            type: 'solid', // solid dotted double dashed
            width: '1px',
            color: '#c0c4cc'
          },
          border: {
            width: '0px',
            style: 'solid',
            color: '#000'
          }
        },
        dark: {
          background: {
            base: '#555E67',
            hover: '#F0884A',
            active: '#FF6105',
            footer: '#3d454c'
          },
          text: {
            base: '#fff',
            hover: '#fff',
            active: '#fff'
          },
          icon: {
            color: '#fff'
          },
          space: {
            type: 'solid', // solid dotted double dashed
            width: '1px',
            color: '#c0c4cc'
          },
          border: {
            width: '0px',
            style: 'solid',
            color: '#fff'
          }
        }
      }
    };
  },
  computed: {
    positionStyle() {
      return {
        position: this.position.type,
        top: this.getPositionValue(this.position.top),
        left: this.getPositionValue(this.position.left),
        bottom: this.getPositionValue(this.position.bottom),
        right: this.getPositionValue(this.position.right),
        zIndex: 999
      };
    },
    themeVariables() {
      const mergeTheme = {
        light: {
          background: {
            ...this.defaultStyle.light.background,
            ...this.themeStyle.light?.background
          },
          text: {
            ...this.defaultStyle.light.text,
            ...this.themeStyle.light?.text
          },
          icon: {
            ...this.defaultStyle.light.icon,
            ...this.themeStyle.light?.icon
          },
          space: {
            ...this.defaultStyle.light.space,
            ...this.themeStyle.light?.space
          },
          border: {
            ...this.defaultStyle.light.border,
            ...this.themeStyle.light?.border
          }
        },
        dark: {
          background: {
            ...this.defaultStyle.dark.background,
            ...this.themeStyle.dark?.background
          },
          text: {
            ...this.defaultStyle.dark.text,
            ...this.themeStyle.dark?.text
          },
          icon: {
            ...this.defaultStyle.dark.icon,
            ...this.themeStyle.dark?.icon
          },
          space: {
            ...this.defaultStyle.dark.space,
            ...this.themeStyle.dark?.space
          },
          border: {
            ...this.defaultStyle.dark.border,
            ...this.themeStyle.dark?.border
          }
        }
      };

      const variables = {
        '--background-base': mergeTheme[this.theme].background.base,
        '--background-hover': mergeTheme[this.theme].background.hover,
        '--background-active': mergeTheme[this.theme].background.active,
        '--background-footer': mergeTheme[this.theme].background.footer,
        '--text-base': mergeTheme[this.theme].text.base,
        '--text-hover': mergeTheme[this.theme].text.hover,
        '--text-active': mergeTheme[this.theme].text.active,
        '--icon-color': mergeTheme[this.theme].icon.color,
        '--space-type': mergeTheme[this.theme].space.type,
        '--space-width': mergeTheme[this.theme].space.width,
        '--space-color': mergeTheme[this.theme].space.color,
        '--border-width': mergeTheme[this.theme].border.width,
        '--border-style': mergeTheme[this.theme].border.style,
        '--border-color': mergeTheme[this.theme].border.color
      };

      return variables;
    }
  }
};
