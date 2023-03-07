<template>
  <div class="sh-icon-svg">
    <img
      v-if="isImg && imgSrc"
      :src="imgSrc"
      :style="{
        width,
        height,
        display: 'block'
      }"
    />
    <div
      v-show="!isImg"
      ref="svgIcon"
      class="svgDiv"
      :style="{
        width,
        height,
        lineHeight: 'normal'
      }"
    ></div>
  </div>
</template>

<script>
import emitter from 'shinegis-client-23d/src/mixins/emitter';

export default {
  name: 'ShIconSvg',
  mixins: [emitter],
  props: {
    // 主题 dark/light
    theme: {
      type: String,
      // default: 'light'
      default: 'dark'
    },
    // 自定义图标宽
    width: {
      type: String
    },
    // 自定义图标高
    height: {
      type: String
    },
    padding: {
      type: String
    },
    // 填充色
    fillcolor: {
      type: String
    },
    // 填充透明度
    fillop: {
      type: Number
    },
    // 图标名
    iconClass: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isImg: false,
      imgSrc: ''
    };
  },
  computed: {
    iconName() {
      return `#icon-${this.iconClass}`;
    }
  },
  watch: {
    width: {
      handler() {
        if (this.width) {
          this.$nextTick(() => {
            this.$refs.svgIcon &&
              this.$refs.svgIcon.style.setProperty('--svgWidth', this.width);
          });
        }
      },
      immediate: true
    },
    height: {
      handler() {
        if (this.height) {
          this.$nextTick(() => {
            this.$refs.svgIcon &&
              this.$refs.svgIcon.style.setProperty('--svgHeight', this.height);
          });
        }
      },
      immediate: true
    },
    Padding: {
      handler() {
        if (this.padding) {
          this.$nextTick(() => {
            this.$refs.svgIcon &&
              this.$refs.svgIcon.style.setProperty(
                '--svgPadding',
                this.padding
              );
          });
        }
      },
      immediate: true
    },
    iconClass: {
      handler() {
        this.$nextTick(() => {
          // let svgUrl = '!raw-loader!../assets/svg/' + this.iconClass + '.svg';
          try {
            var context = require.context(
              '!raw-loader!../../../src/assets/svg/',
              true,
              /.svg$/
            );
            // 第一个参数：文件的路径，搜索目录下所有的文件
            // 第二个参数：是否搜索子目录
            // 第三个参数：正则表达式， “svg文件”
            let svgData = context('./' + this.iconClass + '.svg');
            if (svgData && svgData.default) {
              this.isImg = false;
              this.$nextTick(() => {
                if (this.$refs.svgIcon) {
                  this.$refs.svgIcon.innerHTML = svgData.default;
                }
              });
            } else {
              this.isImg = true;
              this.imgSrc = this.iconClass;
            }
          } catch (e) {
            this.isImg = true;
            this.imgSrc = this.iconClass;
          }
        });
      },
      immediate: true
    },
    theme: {
      handler: function (val) {
        let fl2Color, fl1Color;
        if (val === 'light') {
          fl1Color = this.fillcolor ? this.fillcolor : '#467CF3';
          fl2Color = '#1DB28E';
        } else {
          fl1Color = this.fillcolor ? this.fillcolor : '#FFFFFF';
          fl2Color = '#00FFFF';
        }
        this.$nextTick(() => {
          if (this.$refs.svgIcon) {
            this.$refs.svgIcon.style.setProperty('--fl1Color', fl1Color);
            this.$refs.svgIcon.style.setProperty('--fl2Color', fl2Color);
          }
        });
      },
      immediate: true
    },
    fillcolor: {
      handler: function (val) {
        if (val) {
          let fl1Color = val;

          this.$nextTick(() => {
            this.$refs.svgIcon &&
              this.$refs.svgIcon.style.setProperty('--fl1Color', fl1Color);
          });
        }
      },
      immediate: true
    }
  },
  mounted() {},
  methods: {
    handle(event) {
      this.$emit('handle', event);
    },
    handleClick(event) {
      this.$emit('handleClick', event);
    }
  }
};
</script>
