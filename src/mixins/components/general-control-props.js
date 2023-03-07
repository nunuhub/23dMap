import defaultStyle from './defaultCardStyle';

const generalControlProps = {
  inject: {
    generalCardThemeStyle: {
      default: null
    }
  },
  props: {
    themeStyle: {
      type: Object
    }
  },
  data() {
    return {
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
    }
  },
  computed: {
    // 传入的配置ThemeStyle
    externalThemeStyle() {
      return this.themeStyle || this.generalCardThemeStyle || {};
    },
    // 和默认样式融合后的ThemeStyle
    controlThemeStyle() {
      return {
        light: {
          title: {
            ...defaultStyle.light.title,
            ...this.externalThemeStyle?.light?.title
          },
          primaryFont: {
            ...defaultStyle.light.primaryFont,
            ...this.externalThemeStyle?.light?.primaryFont
          },
          panel: {
            ...defaultStyle.light.panel,
            ...this.externalThemeStyle?.light?.panel
          },
          toolButton: {
            ...defaultStyle.light.toolButton,
            ...this.externalThemeStyle?.light?.toolButton
          },
          floatButton: {
            ...defaultStyle.light.floatButton,
            ...this.externalThemeStyle?.light?.floatButton
          },
          corner: {
            ...defaultStyle.light.corner,
            ...this.externalThemeStyle?.light?.corner
          }
        },
        dark: {
          title: {
            ...defaultStyle.dark.title,
            ...this.externalThemeStyle?.dark?.title
          },
          primaryFont: {
            ...defaultStyle.dark.primaryFont,
            ...this.externalThemeStyle?.dark?.primaryFont
          },
          panel: {
            ...defaultStyle.dark.panel,
            ...this.externalThemeStyle?.dark?.panel
          },
          toolButton: {
            ...defaultStyle.dark.toolButton,
            ...this.externalThemeStyle?.dark?.toolButton
          },
          floatButton: {
            ...defaultStyle.dark.floatButton,
            ...this.externalThemeStyle?.dark?.floatButton
          },
          corner: {
            ...defaultStyle.dark.corner,
            ...this.externalThemeStyle?.dark?.corner
          }
        }
      };
    },
    // 主题CSS变量
    themeVariables() {
      const variables = {
        '--title-background-color':
          this.controlThemeStyle[this.theme].title.backgroundColor,
        '--title-font-color': this.controlThemeStyle[this.theme].title.color,
        '--panel-background-color':
          this.controlThemeStyle[this.theme].panel.backgroundColor,
        '--font-color': this.controlThemeStyle[this.theme].primaryFont.fontColor
      };

      return variables;
    }
  }
};

export default generalControlProps;
