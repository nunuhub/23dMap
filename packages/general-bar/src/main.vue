<template>
  <div
    v-show="visible"
    ref="bar"
    v-drag
    class="sh-general-bar"
    :class="[
      {
        dark: theme === 'dark',
        'collapse-title': mode === 'vertical' && mainTagType === 'title'
      },
      mode
    ]"
    :style="{ ...positionStyle, ...themeVariables }"
  >
    <transition name="fade">
      <el-menu
        v-show="open"
        :mode="mode"
        :collapse="mode === 'vertical'"
        :default-active="activeIndex"
        @select="select"
        @unselect="unselect"
      >
        <tool-item
          v-for="item in options"
          :key="item.key"
          :item="item"
          :theme-variables="themeVariables"
        />
      </el-menu>
    </transition>
    <div
      ref="footer"
      class="move_header"
      :class="{ btn: !open }"
      onselectstart="return false;"
      @click="click"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMuseUp"
    >
      <slot v-if="$slots.default"></slot>
      <i v-else-if="mode === 'vertical'" class="el-icon-arrow-down icon" />
      <i v-else class="el-icon-arrow-right icon" />
    </div>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { v4 as uuidv4 } from 'uuid';
import drag from 'shinegis-client-23d/src/directives/bar-drag';
import ElMenu from './bar/menu.vue';
import ToolItem from './tool-item.vue';
import { styleConfig } from './plug/styleConfig';

export default {
  name: 'ShGeneralBar',
  directives: { drag },
  components: {
    ElMenu,
    ToolItem
  },
  mixins: [common, emitter, styleConfig],
  provide() {
    return {
      reactiveTheme: () => this.toolTheme,
      barId: uuidv4(),
      mainTagType: this.mainTagType
    };
  },
  props: {
    isShow: {
      type: Boolean,
      default() {
        return true;
      }
    },
    theme: {
      type: String,
      default: 'light'
    },
    options: {
      type: Array,
      default: () => []
    },
    activeIndex: {
      type: Array,
      default: () => []
    },
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
    // vertical模式工具条主体展示类型 (icon/title)
    mainTagType: {
      type: String,
      default: 'icon'
    }
  },
  data() {
    return {
      visible: this.isShow,
      open: true,
      isMouseDown: false,
      isClick: true,
      toolTheme: this.theme
    };
  },
  watch: {
    open: {
      handler(value) {
        this.$emit('change:open', value);
      },
      immediate: true
    },
    visible: function (value) {
      this.$emit('change:isShow', value);
      this.$emit('update:isShow', value);
    },
    dragEnable: {
      handler(value) {
        this.$nextTick(() => {
          this.$refs.footer?.setAttribute('dragEnable', value);
        });
      },
      immediate: true
    },
    theme: function (value) {
      this.toolTheme = value;
    },
    isShow: function (value) {
      this.visible = value;
    }
  },
  methods: {
    changeShow(isShow) {
      if (typeof isShow === 'boolean') {
        this.visible = isShow;
      } else {
        this.visible = !this.isShow;
      }
    },
    getPositionValue(value) {
      if (value == null) {
        return 'unset';
      } else {
        return value;
      }
    },
    click() {
      if (this.isClick) {
        this.open = !this.open;
      }
      this.isClick = true;
    },
    onMouseDown() {
      this.isMouseDown = true;
    },
    onMouseMove() {
      if (this.isMouseDown) {
        this.isClick = false;
      }
    },
    onMuseUp() {
      this.isMouseDown = false;
    },
    select(index) {
      this.$emit('select', index);
    },
    unselect(index) {
      this.$emit('unselect', index);
    },
    getPosition() {
      let Positon = this.formatStyle(this.$refs.bar?.style?.cssText);
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
