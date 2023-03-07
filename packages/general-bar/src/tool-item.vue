<template>
  <el-submenu
    v-if="!isHidden(item) && item.children && item.children.length > 0"
    ref="submenu"
    :index="item.key"
    :popper-class="popperClass"
    :disabled="item.disabled"
  >
    <template slot="title">
      <i v-if="item.icon" :class="item.icon" />
      <IconSvg
        v-else-if="item.img"
        :icon-class="item.img"
        :fillcolor="fillcolor(item.key)"
        with="16px"
        height="16px"
        :theme="theme"
      />
      <span slot="title">{{ item.name }}</span>
    </template>
    <sh-tool-item
      v-for="child in item.children"
      :key="child.key"
      :item="child"
    />
  </el-submenu>

  <el-menu-item
    v-else-if="!isHidden(item)"
    :index="item.key"
    :disabled="item.disabled"
  >
    <i v-if="item.icon" :class="item.icon" />
    <IconSvg
      v-else-if="item.img"
      :icon-class="item.img"
      :fillcolor="fillcolor(item.key)"
      with="16px"
      height="16px"
      :theme="theme"
    />
    <span slot="title">{{ item.name }}</span>
  </el-menu-item>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import ElMenuItem from './bar/menu-item';

export default {
  name: 'ShToolItem',
  components: {
    IconSvg,
    ElMenuItem
  },
  mixins: [common],
  inject: ['rootMenu', 'reactiveTheme', 'barId'],
  props: {
    item: {
      type: Object,
      required: true,
      default: () => {}
    },
    themeVariables: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    theme() {
      return this.reactiveTheme();
    },
    fillcolor() {
      return function () {
        // const isActive = this.rootMenu.activeIndex.includes(index);
        // if (this.theme === 'light') {
        //   return '#909399';
        // } else {
        //   return '#fff';
        // }
        return this.themeVariables?.['--icon-color'];
      };
    },
    popperClass() {
      const name = `sh-submenu bar-${this.barId}`;
      return this.theme === 'dark' ? name + ' dark' : name;
    }
  },
  watch: {
    theme() {
      this.setThemeVariables();
    },
    themeVariables() {
      this.setThemeVariables();
    }
  },
  updated() {
    if (this.$refs.submenu) {
      this.$refs.submenu.$parent = this.rootMenu;
      this.setThemeVariables();
    }
  },
  mounted() {
    // fixbug https://github.com/ElemeFE/element/issues/21394
    if (this.$refs.submenu) {
      this.$refs.submenu.$parent = this.rootMenu;
    }

    this.setThemeVariables();
  },
  methods: {
    isSubmenu(item) {
      return item.children && item.children.length;
    },
    getSubMenuHidden(item) {
      // 父级节点，如果设置了hidden为false,则返回false,否则判断子节点情况来设置hidden
      if (item.hidden === false) {
        return false;
      } else {
        for (let i = 0; i < item.children.length; i++) {
          let hidden = false;
          if (this.isSubmenu(item.children[i])) {
            hidden = this.getSubMenuHidden(item.children[i]);
          } else {
            hidden = !!item.children[i].hidden;
            if (hidden === false && item.children[i].view != null) {
              hidden = this.currentView !== item.children[i].view;
            }
          }
          // 只要有一个子节点展示，则其父节点必然展示
          if (!hidden) {
            return false;
          }
        }
        return true;
      }
    },
    isHidden(item) {
      if (this.isSubmenu(item)) {
        return this.getSubMenuHidden(item);
      } else {
        let hidden = false;
        if (item.hidden != null) {
          hidden = !!item.hidden;
        }
        if (hidden === false && item.view != null) {
          hidden = this.currentView !== item.view;
        }
        return hidden;
      }
    },
    setThemeVariables() {
      if (this.$refs.submenu) {
        Object.keys(this.themeVariables).forEach((key) => {
          const target =
            document.getElementsByClassName(`bar-${this.barId}`) || [];
          for (let i = 0; i < target.length; i++) {
            target[i].style.setProperty(key, this.themeVariables[key]);
          }
        });
      }
    }
  }
};
</script>
