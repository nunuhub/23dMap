<template>
  <div class="sh-tool-bar">
    <general-bar
      :mode="mode"
      :drag-enable="dragEnable"
      :is-show.sync="visible"
      :position="position"
      :options="optionsValue"
      :active-index="activeIndex"
      :theme-style="toolbarThemeStyle"
      :theme="theme"
      @select="select"
      @unselect="unselect"
      @change:open="changeOpen"
      @change:isShow="onChangeIsShow"
    >
      <icon-svg
        style="vertical-align: middle"
        :fillcolor="theme == 'dark' && open ? '#3CD3FF' : '#fff'"
        :icon-class="open ? 'viewShow-2' : 'viewShow'"
      ></icon-svg>
    </general-bar>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import GeneralBar from 'shinegis-client-23d/packages/general-bar';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import generalBarProps from 'shinegis-client-23d/src/mixins/components/general-bar-props';
import { formatConversion } from 'shinegis-client-23d/src/utils/common';
import { componentTypes } from './config';

export default {
  name: 'ShToolBar',
  components: {
    GeneralBar,
    IconSvg
  },
  mixins: [common, emitter, generalBarProps],
  props: {
    // 模式 horizontal / vertical
    mode: {
      type: String,
      default: 'horizontal'
    },
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '34px',
        right: '100px'
      })
    },
    // 是否可拖拽移动
    dragEnable: {
      type: Boolean,
      default: false
    },
    activeIndex: {
      type: Array,
      default: () => []
    },
    // 是否显示面板类组件(card、bar)的激活状态
    showCardState: {
      type: Boolean,
      default: true
    }
  },
  data() {
    this.componentEvents = [];
    return {
      open: true,
      activeIndexValue: this.activeIndex,
      optionsValue: []
    };
  },
  computed: {
    // 压平的optionsValue，便于快速查找
    flatOptions() {
      const options = [];
      function flat(arr) {
        arr.forEach((ele) => {
          if (ele.children?.length) {
            flat(ele.children);
          }
          options.push(ele);
        });
      }
      flat(this.optionsValue);

      return options;
    },
    toolbarThemeStyle() {
      return {
        light: {
          ...this.barThemeStyle.light,
          background: {
            footer: '#81a4f1',
            ...this.barThemeStyle.light?.background
          },
          space: {
            type: 'dotted',
            ...this.barThemeStyle.light?.space
          }
        },
        dark: {
          ...this.barThemeStyle.dark,
          background: {
            footer: '#3F4348',
            ...this.barThemeStyle.dark?.background
          },
          space: {
            type: 'dotted',
            ...this.barThemeStyle.dark?.space
          }
        }
      };
    }
  },
  watch: {
    options: function (value, oldValue) {
      this.cancelOptionEvents(oldValue);
      this.optionsValue = this.transFormOptions(value);
    }
  },
  mounted() {
    this.optionsValue = this.transFormOptions(this.options);
  },
  methods: {
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    transFormOptions(options) {
      const newOptions = [];
      options.forEach((element) => {
        if (element.children) {
          const item = {
            ...element,
            children: this.transFormOptions(element.children)
          };
          newOptions.push(item);
        } else {
          const component = this.getComponentByKey(element.key);
          const isComponentKey = Object.keys(componentTypes).includes(
            element.key
          );
          let item;
          if (component) {
            this.registerComponentEvent(component);
            const componentName = formatConversion(component.$options.name);
            const defaultConfig = componentTypes[componentName];
            item = { ...defaultConfig, ...element, component };
          } else if (isComponentKey) {
            // key是组件名称但没有引入对应组件时，隐藏该菜单按钮
            item = { ...element, hidden: true };
          } else {
            item = { ...element };
          }
          // 添加默认图标
          if (!item.img && !item.icon) {
            item.icon = 'el-icon-share';
          }
          newOptions.push(item);
        }
      });
      return newOptions;
    },
    getComponentByKey(key) {
      const components = this.$parent.$parent.$children;
      const supportComponentNames = Object.keys(componentTypes);
      if (supportComponentNames.includes(formatConversion(key))) {
        return components.find(
          (ele) => formatConversion(ele.$options.name) === formatConversion(key)
        );
      }
    },
    registerComponentEvent(component) {
      const componentName = formatConversion(component.$options.name);
      const type = componentTypes[componentName].type;
      const realComponent = this.getRealComponent(component);
      // 判断组件是否初始化完成
      if (typeof component.ready === 'boolean' && !component.ready) {
        component.$on('mounted', this.setOriginState);
      } else {
        this.setOriginState(component);
      }
      if (type === 'card' || type === 'bar') {
        if (!this.showCardState) return;
        const changeFunction = this.onStateChange.bind(this, componentName);
        this.componentEvents.push({
          key: `${componentName}-change:isShow`,
          function: changeFunction
        });
        realComponent.$on('change:isShow', changeFunction);
      } else if (type === 'interaction') {
        const changeFunction = this.onStateChange.bind(this, componentName);
        this.componentEvents.push({
          key: `${componentName}-change:active`,
          function: changeFunction
        });
        realComponent.$on('change:active', changeFunction);
      }
      // 行政区导航组件 导航事件注册
      if (componentName === 'sh-navigate') {
        realComponent.$on('navigated', this.onNavigated);
      }
    },
    // 获取组件初始状态
    setOriginState(component) {
      const componentName = formatConversion(component.$options.name);
      const type = componentTypes[componentName].type;
      const realComponent = this.getRealComponent(component);
      if (type === 'card' || type === 'bar') {
        if (this.showCardState && realComponent.visible) {
          if (!this.activeIndexValue.includes(componentName)) {
            this.activeIndexValue.push(componentName);
            this.$emit('update:activeIndex', this.activeIndexValue);
          }
        }
      } else if (type === 'interaction') {
        if (realComponent.active) {
          if (!this.activeIndexValue.includes(componentName)) {
            this.activeIndexValue.push(componentName);
            this.$emit('update:activeIndex', this.activeIndexValue);
          }
        }
      }
    },
    getRealComponent(component) {
      return component.$children?.[0]?.$options?.name ===
        component.$options.name
        ? component.$children[0]
        : component;
    },
    changeOpen(val) {
      this.$emit('change:open', val);
      this.open = val;
    },
    onStateChange(componentName, state) {
      if (state) {
        if (!this.activeIndexValue.includes(componentName)) {
          this.activeIndexValue.push(componentName);
          this.$emit('update:activeIndex', this.activeIndexValue);
        }
      } else {
        const index = this.activeIndexValue.findIndex(
          (ele) => ele === componentName
        );
        if (index > -1) {
          this.activeIndexValue.splice(index, 1);
          this.$emit('update:activeIndex', this.activeIndexValue);
        }
      }
    },
    resetNavigateName(options, name) {
      const newOptions = [];
      options.forEach((element) => {
        if (element.children) {
          const item = {
            ...element,
            children: this.resetNavigateName(element.children, name)
          };
          newOptions.push(item);
        } else {
          const item = { ...element };
          if (item.key === 'sh-navigate') {
            item.name = name || componentTypes['sh-navigate'].name;
          }
          newOptions.push(item);
        }
      });
      return newOptions;
    },
    onNavigated(e) {
      const navigateName = e?.xzqmc;
      this.optionsValue = this.resetNavigateName(
        this.optionsValue,
        navigateName
      );
    },
    select(key) {
      this.$emit('select', key);
      const option = this.flatOptions.find((ele) => ele.key === key);
      if (option.component) {
        const realComponent = this.getRealComponent(option.component);
        if (option.type === 'card' || option.type === 'bar') {
          realComponent.changeShow(this.showCardState ? true : null);
        } else if (option.type === 'interaction') {
          realComponent.activate();
        } else if (option.type === 'action') {
          realComponent.execute();
        }
      }
    },
    unselect(key) {
      this.$emit('unselect', key);
      const option = this.flatOptions.find((ele) => ele.key === key);
      if (option.component) {
        const realComponent = this.getRealComponent(option.component);
        if (option.type === 'card' || option.type === 'bar') {
          realComponent.changeShow(this.showCardState ? false : null);
        } else if (option.type === 'interaction') {
          realComponent.deactivate();
        }
      }
    },
    unRegisterComponentEvent(component) {
      const componentName = formatConversion(component.$options.name);
      const type = componentTypes[componentName].type;
      const realComponent = this.getRealComponent(component);
      component.$off('mounted', this.setOriginState);
      if (type === 'card' || type === 'bar') {
        const changeFunction = this.componentEvents.find(
          (ele) => ele.key === `${componentName}-change:isShow`
        )?.function;
        changeFunction && realComponent.$off('change:isShow', changeFunction);
      } else if (type === 'interaction') {
        const changeFunction = this.componentEvents.find(
          (ele) => ele.key === `${componentName}-change:active`
        )?.function;
        realComponent.$off('change:active', changeFunction);
      }
      // 行政区导航组件 导航事件注销
      if (componentName === 'sh-navigate') {
        realComponent.$off('navigated', this.onNavigated);
      }
    },
    cancelOptionEvents(options) {
      options.forEach((element) => {
        if (element.children) {
          this.cancelOptionEvents(element.children);
        } else {
          const component = this.getComponentByKey(element.key);
          if (component) {
            this.unRegisterComponentEvent(component);
          }
        }
      });
      this.componentEvents = [];
    }
  }
};
</script>
