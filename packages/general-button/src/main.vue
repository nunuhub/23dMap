<template>
  <button
    ref="button"
    v-btnDrag
    :title="title"
    class="sh-general-button move_btn"
    :class="{
      'general-btn-active': active,
      'content-column': isColumn,
      dragEnable: dragEnable
    }"
    :style="{ ...positionStyle }"
    @click="click"
  >
    <IconSvg
      v-if="showImg"
      width="16px"
      height="16px"
      :icon-class="iconClass"
      theme="light"
    />
    <label
      v-if="showLabel"
      class="general-btn-label"
      :class="[isColumn ? 'label-column' : 'label']"
      >{{ title }}</label
    >
  </button>
</template>

<script>
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import btnDrag from 'shinegis-client-23d/src/directives/btn-drag';

export default {
  name: 'ShGeneralButton',
  components: {
    IconSvg
  },
  directives: { btnDrag },
  model: {
    prop: 'active',
    event: 'change'
  },
  props: {
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
    active: {
      type: Boolean,
      default: false
    },
    title: {
      type: String
    },
    iconClass: {
      type: String
    },
    showImg: {
      type: Boolean,
      default: true
    },
    showLabel: {
      type: Boolean,
      default: true
    },
    // 是否可拖拽移动
    dragEnable: {
      type: Boolean,
      default: false
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
    }
  },
  watch: {
    themeStyle: {
      handler() {
        let light = this.themeStyle.light;
        this.$nextTick(() => {
          for (let key in light) {
            if (light[key]) {
              this.$refs.button.style.setProperty('--' + key, light[key]);
            }
          }
        });
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    click() {
      if (this.$refs.button.getAttribute('isClick') === 'true') {
        this.$emit('change', !this.active);
        this.$emit('click');
      }
    },
    getPositionValue(value) {
      if (value == null) {
        return 'unset';
      } else {
        return value;
      }
    },
    getPosition() {
      let Positon = this.formatStyle(this.$refs.button?.style?.cssText);
      return {
        type: Positon.position,
        top: Positon.top,
        left: Positon.left,
        bottom: Positon.bottom,
        right: Positon.right
      };
    },
    formatStyle(str) {
      if (!str) return;
      const Obj = {};
      const ArrStyle = str.split(';');
      ArrStyle.forEach((sty) => {
        const key = sty.split(':')[0].trim();
        const value =
          typeof sty.split(':')[1] === 'string'
            ? sty.split(':')[1].trim()
            : sty.split(':')[1];
        Obj[key] = value;
      });
      return Obj;
    }
  }
};
</script>
