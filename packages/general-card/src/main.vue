<template>
  <div v-show="visible" @click="containerClick">
    <!--  竖直的TAG 默认隐藏  -->
    <div
      :id="tagId"
      class="tagV"
      :style="tagStyle"
      style="
        width: 32px;
        text-align: center;
        cursor: default;
        padding: 4px 0;
        display: none;
        z-index: 999;
      "
    >
      <icon-svg
        :icon-class="floatButtonSrc"
        :width="floatImageSize + 'px'"
        :height="floatImageSize + 'px'"
        :theme="theme"
      ></icon-svg>
      <span style="writing-mode: tb-rl; margin-top: 4px; margin-bottom: 4px">{{
        title
      }}</span>
    </div>
    <!--  横排的TAG 默认隐藏  -->
    <div
      :id="tagId"
      class="tagH"
      :style="tagStyle"
      style="
        height: 32px;
        align-items: center;
        text-align: center;
        cursor: default;
        padding: 0 4px;
        display: none;
        z-index: 999;
      "
    >
      <icon-svg
        :icon-class="floatButtonSrc"
        :width="floatImageSize + 'px'"
        :height="floatImageSize + 'px'"
        :theme="theme"
      ></icon-svg>
      <span style="margin-left: 4px">{{ title }}</span>
    </div>
    <!--  主体  -->
    <div
      v-if="!onlyContainer"
      ref="outContainer"
      v-cardDrag
      class="sh-general-card"
      :style="positionStyle + contentStyle"
    >
      <!-- 按钮-->
      <div
        v-show="isShowBtn"
        ref="move_btn"
        class="move_btn"
        :class="{ dragEnable: dragEnableValue }"
        style="pointer-events: all"
      >
        <span v-if="$slots.btn" @click="iconClick(true)">
          <slot name="btn"></slot>
        </span>
        <button
          v-else
          id="BtnVis"
          type="button"
          class="el-button el-button--primary el-button--mini is-circle"
          :style="floatButtonStyle"
          @click="iconClick(true)"
        >
          <icon-svg
            :icon-class="floatButtonSrc"
            :width="floatImageSize + 'px'"
            :height="floatImageSize + 'px'"
            style="border: none"
            :theme="theme"
          />
        </button>
      </div>
      <!-- 容器   -->
      <transition name="panel-fade" @after-leave="afterLeave">
        <div v-show="isShowCard" ref="card" class="card" :style="panelStyle">
          <span
            v-show="configObj.isShowCorner"
            :style="cornerStyle"
            class="corner corner-left-top"
          />
          <span
            v-show="configObj.isShowCorner"
            :style="cornerStyle"
            class="corner corner-right-top"
          />
          <span
            v-show="configObj.isShowCorner"
            :style="cornerStyle"
            class="corner corner-left-bottom"
          />
          <span
            v-show="configObj.isShowCorner"
            :style="cornerStyle"
            class="corner corner-right-bottom"
          />
          <div
            v-if="$slots.header"
            v-show="configObj.isShowTitleBar"
            :style="titleBarStyle"
            class="move_header"
            :class="{ dragEnable: dragEnableValue, fix: isFix }"
          >
            <slot name="header"></slot>
          </div>
          <div
            v-else
            v-show="configObj.isShowTitleBar"
            :style="titleBarStyle"
            class="move_header"
            :class="{ dragEnable: dragEnableValue, fix: isFix }"
          >
            <icon-svg
              v-show="titleBar.icon"
              :icon-class="floatButtonSrc"
              :width="floatImageSize + 'px'"
              :height="floatImageSize + 'px'"
              :style="titleImageStyle"
              :theme="theme"
            ></icon-svg>
            <span
              v-if="$slots.title || title"
              v-show="titleBar.title"
              class="head-title"
              ><slot name="title">{{ title }}</slot></span
            >
            <div class="head-btnBar">
              <slot name="extBtn"></slot>
              <span v-if="dragEnableValue" v-show="titleBar.fixBtn">
                <el-tooltip
                  v-if="isFix"
                  content="取消固定"
                  placement="top"
                  :open-delay="300"
                >
                  <icon-svg
                    :icon-class="unfixSrc"
                    fillcolor="#FF5E67"
                    :width="toolBtnSize + 'px'"
                    :height="toolBtnSize + 'px'"
                    padding="2px"
                    :style="titleRightImgStyle"
                    @click.native="changeMoveStatus()"
                  ></icon-svg>
                </el-tooltip>
                <el-tooltip
                  v-else
                  content="固定"
                  placement="top"
                  :open-delay="300"
                >
                  <icon-svg
                    :icon-class="fixSrc"
                    :fillcolor="btnFill"
                    :width="toolBtnSize + 'px'"
                    :height="toolBtnSize + 'px'"
                    padding="2px"
                    :style="titleRightImgStyle"
                    @click.native="changeMoveStatus()"
                  ></icon-svg>
                </el-tooltip>
              </span>
              <el-tooltip
                v-show="titleBar.miniBtn"
                content="最小化"
                placement="top"
                :open-delay="300"
              >
                <icon-svg
                  :icon-class="minSrc"
                  :fillcolor="btnFill"
                  :width="toolBtnSize + 'px'"
                  :height="toolBtnSize + 'px'"
                  padding="2px"
                  :style="titleRightImgStyle"
                  @click.native="changeStatus(false)"
                ></icon-svg>
              </el-tooltip>
              <el-tooltip
                v-show="titleBar.closeBtn"
                content="关闭"
                placement="top"
                :open-delay="300"
              >
                <icon-svg
                  :icon-class="closeSrc"
                  :fillcolor="btnFill"
                  :width="toolBtnSize + 'px'"
                  :height="toolBtnSize + 'px'"
                  padding="2px"
                  :style="titleRightImgStyle"
                  @click.native="changeShow"
                ></icon-svg
              ></el-tooltip>
            </div>
          </div>
          <div
            v-if="rendered"
            class="general-content"
            :style="{ ...bodyStyle }"
          >
            <span v-if="$slots.default">
              <slot></slot>
            </span>
          </div>
        </div>
      </transition>
      <!-- 附加容器   -->
      <slot name="extContainer"></slot>
    </div>
    <div v-else ref="outContainer" :style="positionStyle + contentStyle">
      <div :style="{ backgroundColor: getStyle().panel.backgroundColor }">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { cardConfig } from './plug/config';
import cardDrag from 'shinegis-client-23d/src/directives/card-drag';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import { getuuid } from 'shinegis-client-23d/src/map-core/olPlot/Utils/utils';
import $ from 'jquery';

export default {
  name: 'ShGeneralCard',
  components: {
    IconSvg: IconSvg
  },
  directives: { cardDrag },
  mixins: [cardConfig],
  props: {
    isShow: {
      type: Boolean,
      default() {
        return true;
      }
    },
    appendToBody: {
      type: Boolean,
      default: false
    },
    destroyOnClose: {
      type: Boolean,
      default: false
    },
    // 是否可拖拽移动
    dragEnable: {
      type: Boolean,
      default: true
    },
    // 只显示内容区域
    onlyContainer: {
      type: Boolean,
      default: false
    },
    beforeClose: {
      type: Function
    }
  },
  data() {
    return {
      visible: this.isShow,
      positionStyle: '',
      contentStyle: '',
      floatButtonSrc: '',
      floatButtonStyle: '',
      floatImageSize: 16,
      toolBtnSize: 16,
      titleBar: {},
      titleBarStyle: '',
      titleImageStyle: '',
      titleRightImgStyle: '',
      panelStyle: '',
      bodyStyle: '',
      tagStyle: '',
      cornerStyle: '',
      isShowBtn: false,
      isShowCard: true,
      isFix: false,
      tagId: '',
      rendered: true,
      dragEnableValue: this.dragEnable
    };
  },
  watch: {
    isShow: function (value) {
      this.visible = value;
    },
    visible: function (val) {
      this.$emit('getShow', val);
      // 使用change:isShow替换原事件名  原事件暂时保留
      this.$emit('change:isShow', val);
      this.$emit('update:isShow', val);
      if (val) {
        this.rendered = true;
      } else {
        if (this.destroyOnClose) {
          this.$nextTick(() => {
            this.rendered = false;
          });
        }
      }
    },
    theme: {
      handler() {
        this.initStyle();
      }
    },
    imgSrc: {
      handler() {
        this.floatButtonSrc = this.imgSrc;
      },
      immediate: true
    },
    position: {
      handler() {
        this.initStyle();
      }
    },
    dragEnable(value) {
      this.dragEnableValue = value;
    },
    configObj() {
      this.initStyle();
    },
    themeStyle() {
      this.initStyle();
    },
    'configObj.isShowBtn': {
      handler() {
        this.isShowBtn = this.configObj.isShowBtn;
        // 为了setStyle属性dragDomHeight
        this.changeStatus(!this.isShowBtn);
      },
      immediate: true
    }
  },
  created() {
    this.isFix = this.configObj.isStartFix;
    this.initStyle();
  },
  mounted() {
    this.$nextTick(() => {
      if (this.appendToBody) {
        document.body.appendChild(this.$el);
      }
    });
    this.tagId = getuuid();
    if (this.isFix) {
      this.changeMoveStatus();
    }
    // 获取项目实际使用时，v-show对应的变量名
    try {
      for (let directive of this.$parent.$vnode.data.directives) {
        if (directive.rawName === 'v-show') {
          this.changeShow(directive.value);
        }
      }
      // eslint-disable-next-line no-empty
    } catch (e) {}
  },
  methods: {
    containerClick() {
      this.$parent.$emit('containerClick');
    },
    changeShow(isShow) {
      let visible;
      if (typeof isShow === 'boolean') {
        visible = isShow;
      } else {
        visible = !this.visible;
      }
      //关闭事件时,执行beforeClose,并可以拦截
      if (this.beforeClose && !visible) {
        if (this.beforeClose() === false) {
          return;
        }
      }
      this.visible = visible;
      if (!this.visible) {
        this.$refs.outContainer.setAttribute('isFix', 'false');
        this.isFix = false;
        this.$emit('afterClose');
      }
    },
    iconClick(isMax) {
      if (this.$refs.move_btn.getAttribute('isClick') === 'true') {
        this.changeStatus(isMax);
      }
    },
    changeMoveStatus() {
      if (this.$refs.outContainer) {
        let oldFix = this.$refs.outContainer.getAttribute('isFix');
        let newIsFix = oldFix === 'true' ? 'false' : 'true';
        this.isFix = newIsFix === 'true';
        if (this.isFix) {
          this.$refs.outContainer.style.transition = '';
          $(this.$refs.outContainer).unbind('mouseenter').unbind('mouseleave');
        }
        this.$refs.outContainer.setAttribute('isFix', newIsFix);
      }
    },
    afterLeave() {
      this.isShowBtn = true;
      this.setDragDomHeight();
    },
    changeStatus(isMax) {
      this.isShowCard = isMax;
      // 完善动画效果 分离card和btn的show 在card动画结束后 才显示btn 隐藏不做限制
      if (this.isShowCard) {
        this.isShowBtn = false;
        this.setDragDomHeight();
      }
    },
    setDragDomHeight() {
      // 拖拽时生成bottom需要
      this.$nextTick(() => {
        if (this.$refs.move_btn && this.$refs.outContainer) {
          let height = this.isShowBtn
            ? this.$refs.move_btn.offsetHeight
            : this.$refs.card.offsetHeight;
          this.$refs.outContainer.style.setProperty(
            '--dragDomHeight',
            height + 'px'
          );
        }
      });
    },
    getPosition() {
      let Positon = this.formatStyle(this.$refs.outContainer?.style?.cssText);
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
    },
    initStyle() {
      this.positionStyle = this.getPositionStyle();
      this.contentStyle = this.getContentSizeStyle();

      this.floatButtonSrc = this.getFloatBtnSrc();
      this.floatButtonStyle = this.getFloatBtnStyle();
      this.floatImageSize = this.getFloatImgSize();
      this.toolBtnSize = this.getToolBtnSize();

      this.titleBar = this.getTitleBar();
      this.titleBarStyle = this.getTitleBarStyle();
      this.titleImageStyle = this.getTitleImageStyle();
      this.titleRightImgStyle = this.getTitleRightImgStyle();

      this.panelStyle = this.getPanelStyle();
      this.bodyStyle = this.getBodyStyle();
      this.tagStyle = this.getTagStyle();
      this.cornerStyle = this.getCornerStyle();
    }
  }
};
</script>
