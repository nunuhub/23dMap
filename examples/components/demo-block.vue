<template>
  <div
    class="demo-block"
    :class="[blockClass, { hover: hovering }]"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
  >
    <div class="source">
      <el-button class="demo-block-btn" round @click="dialogVisible = true"
        >点击查看示例</el-button
      >
      <el-dialog
        class="demo-dialog"
        :style="{ '--bottom': 100 - dialogScale + '%' }"
        :visible.sync="dialogVisible"
        :modal="false"
        fullscreen
        append-to-body
      >
        <template #title>
          {{ dialogTitle }}
          <button
            type="button"
            class="el-dialog__headerbtn el-dialog__scale"
            @click="configDialogScale"
          >
            <i :class="['el-icon', dialogScaleIconClass]"></i>
          </button>
        </template>
        <div
          v-if="dialogVisible"
          class="dialog-container"
          :class="blockClass"
          :style="{ height: demoBlockheight + 'px' }"
        >
          <slot name="source"></slot>
        </div>
      </el-dialog>
    </div>
    <div ref="meta" class="meta">
      <div v-if="$slots.default" class="description">
        <slot></slot>
      </div>
      <div class="highlight">
        <slot name="highlight"></slot>
      </div>
    </div>
    <div
      ref="control"
      class="demo-block-control"
      :class="{ 'is-fixed': fixedControl }"
      @click="isExpanded = !isExpanded"
    >
      <transition name="arrow-slide">
        <i :class="[iconClass, { hovering: hovering }]"></i>
      </transition>
      <transition name="text-slide">
        <span v-show="hovering">{{ controlText }}</span>
      </transition>
      <el-tooltip
        effect="dark"
        :content="langConfig['tooltip-text']"
        placement="right"
      >
        <transition name="text-slide">
          <el-button
            v-show="hovering || isExpanded"
            size="small"
            type="text"
            class="control-button"
            @click.stop="goPlayground"
          >
            {{ langConfig['button-text'] }}
          </el-button>
        </transition>
      </el-tooltip>
    </div>
  </div>
</template>

<script type="text/babel">
import { mapGetters, mapActions } from 'vuex';
import compoLang from '../i18n/component.json';
import { stripScript, stripStyle, stripTemplate, utoa } from '../util';

export default {
  props: {
    componentName: {
      type: String
    },
    examplesName: {
      type: String
    }
  },
  data() {
    return {
      demoBlockheight: 500,
      dialogVisible: false,
      sourceCode: '',
      hovering: false,
      isExpanded: false,
      fixedControl: false,
      scrollParent: null
    };
  },

  computed: {
    ...mapGetters(['dialogScale', 'currentDialog']),
    lang() {
      return this.$route.path.split('/')[1];
    },

    langConfig() {
      return compoLang.filter((config) => config.lang === this.lang)[0][
        'demo-block'
      ];
    },

    blockClass() {
      return `demo-${this.lang} demo-${this.$router.currentRoute.path
        .split('/')
        .pop()}`;
    },

    iconClass() {
      return this.isExpanded ? 'el-icon-caret-top' : 'el-icon-caret-bottom';
    },

    controlText() {
      return this.isExpanded
        ? this.langConfig['hide-text']
        : this.langConfig['show-text'];
    },

    codeArea() {
      return this.$el.getElementsByClassName('meta')[0];
    },

    codeAreaHeight() {
      if (this.$el.getElementsByClassName('description').length > 0) {
        return (
          this.$el.getElementsByClassName('description')[0].clientHeight +
          this.$el.getElementsByClassName('highlight')[0].clientHeight +
          20
        );
      }
      return this.$el.getElementsByClassName('highlight')[0].clientHeight;
    },

    dialogTitle() {
      if (this.componentName && this.examplesName) {
        return `${this.componentName}-${this.examplesName}`;
      }

      return '代码示例';
    },

    currentExampleName() {
      return `${this.componentName}-${this.examplesName}`;
    },

    dialogScaleIconClass() {
      return this.dialogScale === 100
        ? 'el-icon-connection'
        : 'el-icon-full-screen';
    }
  },

  watch: {
    isExpanded(val) {
      this.codeArea.style.height = val ? `${this.codeAreaHeight + 1}px` : '0';
      if (!val) {
        this.fixedControl = false;
        this.$refs.control.style.left = '0';
        this.removeScrollHandler();
        return;
      }
      setTimeout(() => {
        this.scrollParent = document.querySelector(
          '.page-component__scroll > .el-scrollbar__wrap'
        );
        this.scrollParent &&
          this.scrollParent.addEventListener('scroll', this.scrollHandler);
        this.scrollHandler();
      }, 200);
    },
    dialogScale(val) {
      this.$nextTick(() => {
        this.demoBlockheight = (document.body.clientHeight * val) / 100 - 54;
      });
    },
    dialogVisible(val) {
      if (val) {
        this.setDialogCurrent({ current: this.currentExampleName });
      }
    },
    currentDialog(val) {
      if (val && val !== this.currentExampleName) {
        this.dialogVisible = false;
      }
    }
  },

  created() {
    const highlight = this.$slots.highlight;
    if (highlight && highlight[0]) {
      let code = '';
      let cur = highlight[0];
      if (cur.tag === 'pre' && cur.children && cur.children[0]) {
        cur = cur.children[0];
        if (cur.tag === 'code') {
          code = cur.children[0].text;
        }
      }
      if (code) {
        const templatename = 'template';
        const scriptName = 'script';
        const styleName = 'style';
        const html = `<${templatename}>
${stripTemplate(code)}
</${templatename}>`;
        const script = `<${scriptName}>
${stripScript(code)}
</${scriptName}>`.replace(
          /import ([,{}\w\s]+) from (['"\w@/]+)/g,
          function (s0, s1, s2) {
            if (s2 === "'@sampleData'") {
              return `const ${s1} = $sampleData`;
            } else {
              return `const ${s1} = require(${s2}).default`;
            }
          }
        );
        const style = `<${styleName}>
${stripStyle(code)}
</${styleName}>`;

        this.sourceCode = `${html}
${script}
${style}`;
      }
    }
  },

  mounted() {
    this.demoBlockheight =
      (document.body.clientHeight * this.dialogScale) / 100 - 54;
    this.$nextTick(() => {
      let highlight = this.$el.getElementsByClassName('highlight')[0];
      if (this.$el.getElementsByClassName('description').length === 0) {
        highlight.style.width = '100%';
        highlight.borderRight = 'none';
      }
    });
    this.$router.afterEach(() => {
      this.dialogVisible = false;
    });
    // 若url参数中存在preview为当前examplesName，则打开此示例的弹窗
    const search = window.location.href.split('?')[1];
    const searchParams = new URLSearchParams(search);
    const preview = searchParams.get('preview');
    if (preview === this.examplesName) {
      this.dialogVisible = true;
    }
  },

  beforeDestroy() {
    this.removeScrollHandler();
  },

  methods: {
    ...mapActions(['setDialogScale', 'setDialogCurrent']),
    goPlayground() {
      const encodedSource = utoa(this.sourceCode);
      const encodedClass = utoa(this.blockClass);
      const link = `${window.location.origin}${window.location.pathname}#/playground/${encodedSource}-${encodedClass}`;
      window.open(link);
    },

    scrollHandler() {
      const { top, bottom, left } = this.$refs.meta.getBoundingClientRect();
      this.fixedControl =
        bottom > document.documentElement.clientHeight &&
        top + 44 <= document.documentElement.clientHeight;
      this.$refs.control.style.left = this.fixedControl ? `${left}px` : '0';
    },

    removeScrollHandler() {
      this.scrollParent &&
        this.scrollParent.removeEventListener('scroll', this.scrollHandler);
    },

    configDialogScale() {
      if (this.dialogScale === 100) {
        this.setDialogScale({ scale: 40 });
      } else {
        this.setDialogScale({ scale: 100 });
      }
    }
  }
};
</script>

<style lang="scss">
.demo-block {
  border: solid 1px #ebebeb;
  border-radius: 3px;
  transition: 0.2s;

  &.hover {
    box-shadow: 0 0 8px 0 rgba(232, 237, 250, 0.6),
      0 2px 4px 0 rgba(232, 237, 250, 0.5);
  }

  code {
    font-family: Menlo, Monaco, Consolas, Courier, monospace;
  }

  .demo-button {
    float: right;
  }

  .source {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 24px;
    height: 200px;
    background-image: url('../assets/images/demo-block.png');
    background-position: center center;

    .demo-block-btn {
      background-color: rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid #409eff;
    }
  }

  .meta {
    background-color: #fafafa;
    border-top: solid 1px #eaeefb;
    overflow: hidden;
    height: 0;
    transition: height 0.2s;
  }

  .description {
    padding: 20px;
    box-sizing: border-box;
    border: solid 1px #ebebeb;
    border-radius: 3px;
    font-size: 14px;
    line-height: 22px;
    color: #666;
    word-break: break-word;
    margin: 10px;
    background-color: #fff;

    p {
      margin: 0;
      line-height: 26px;
    }

    code {
      color: #5e6d82;
      background-color: #e6effb;
      margin: 0 4px;
      display: inline-block;
      padding: 1px 5px;
      font-size: 12px;
      border-radius: 3px;
      height: 18px;
      line-height: 18px;
    }
  }

  .highlight {
    pre {
      margin: 0;
    }

    code.hljs {
      margin: 0;
      border: none;
      max-height: none;
      border-radius: 0;

      &::before {
        content: none;
      }
    }
  }

  .demo-block-control {
    border-top: solid 1px #eaeefb;
    height: 44px;
    box-sizing: border-box;
    background-color: #fff;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    text-align: center;
    margin-top: -1px;
    color: #d3dce6;
    cursor: pointer;
    position: relative;

    &.is-fixed {
      position: fixed;
      bottom: 0;
      width: 868px;
    }

    i {
      font-size: 16px;
      line-height: 44px;
      transition: 0.3s;
      &.hovering {
        transform: translateX(-40px);
      }
    }

    > span {
      position: absolute;
      transform: translateX(-30px);
      font-size: 14px;
      line-height: 44px;
      transition: 0.3s;
      display: inline-block;
    }

    &:hover {
      color: #409eff;
      background-color: #f9fafc;
    }

    & .text-slide-enter,
    & .text-slide-leave-active {
      opacity: 0;
      transform: translateX(10px);
    }

    .control-button {
      line-height: 26px;
      position: absolute;
      top: 0;
      right: 0;
      font-size: 14px;
      padding-left: 5px;
      padding-right: 25px;
    }
  }
}

.demo-dialog {
  bottom: var(--bottom) !important;

  &.el-dialog__wrapper {
    position: absolute;
  }

  .el-dialog__scale {
    margin-right: 30px;
    color: #000;
  }

  .el-dialog__headerbtn .el-dialog__close {
    color: #000;
  }

  .el-dialog__body {
    padding: 0;
  }

  .dialog-container > div {
    height: 100%;
    overflow: hidden;
  }
}
</style>
