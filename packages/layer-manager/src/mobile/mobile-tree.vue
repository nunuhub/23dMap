<template>
  <div>
    <div
      v-for="(treeItem, i) in treeDatas"
      :key="treeItem.id"
      class="toc-tab"
      :class="{ 'toc-tab_con': treeItem.url }"
    >
      <p
        v-if="!treeItem.url"
        class="tab_title"
        @click.stop="tocProSwitch(showTocNum, i)"
      >
        {{ treeItem.label }}
        <i v-show="showTocNum == i" class="el-icon-caret-bottom"></i>
        <i v-show="showTocNum != i" class="el-icon-caret-right"></i>
        <i
          v-show="treeDatas.length > 6 && showTocNum == i && treeItem.url"
          class="tab_more"
          @click.stop="showMoreTocPro(i)"
          >更多</i
        >
      </p>
      <div
        v-if="treeItem.url"
        class="tab_item"
        @click.stop="selectToc(i, treeItem)"
      >
        <img
          class="tab-item_icon"
          :class="{ active: treeItem.isShow }"
          :style="{
            background: 'url(' + getImageUrl(treeItem) + ')',
            backgroundSize: '100% 100%'
          }"
        />
        <span class="tab-item_text">{{ treeItem.label }}</span>
        <img
          v-if="treeItem.group == '2'"
          class="tab-item-edit_icon"
          :class="{ active: treeItem.editing }"
          @click.stop="openEdit(i, treeItem)"
        />
      </div>
      <mobile-tree
        v-if="treeItem.children && treeItem.children.length > 0"
        v-show="showTocNum == i"
        :key="treeItem.id"
        class="toc-tab_cons"
        :tree-datas="treeItem.children"
      ></mobile-tree>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';

export default {
  name: 'MobileTree',
  mixins: [commom, emitter],
  props: {
    treeDatas: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  data() {
    return {
      is2d: true,
      tocShow: true,
      tocProShow: true,
      showTocNum: 0,
      showTocIndex: 0,
      imageDefault: require('../../../../src/assets/img/layer-manager/street.png')
    };
  },
  methods: {
    tocProSwitch(showToc, index) {
      if (showToc === this.showTocNum) {
        if (this.showTocNum === index) {
          this.showTocNum = -1;
        } else {
          this.showTocNum = index;
        }
      } else {
        if (this.showTocIndex === index) {
          this.showTocIndex = -1;
        } else {
          this.showTocIndex = index;
        }
      }
    },

    getImageUrl(item) {
      return item.imgUrl ? item.imgUrl : this.imageDefault;
    },
    // 显示更多图层
    showMoreToc() {
      this.tocList = this.tocListSub;
    },
    // 隐藏更多图层
    hideMoreTocPro() {
      this.tocProList.forEach((item) => {
        let listCon = item.listConSub.slice(0, 6);
        item.listCon = listCon;
      });
    },
    // 显示更多图层
    showMoreTocPro(index) {
      let item = this.tocProList[index];
      item.listCon = item.listConSub;
      Vue.set(this.tocProList, index, item);
    },
    // 选择单个图层
    selectToc(index, item) {
      item.isShow = !item.isShow;
      Vue.set(this.treeDatas, index, item);
      this.$emit('itemCheckChange', item, item.isShow, () => {
        // 设置编辑后还需要刷新一次
        Vue.set(this.treeDatas, index, item);
      });
    },
    openEdit(index, item) {
      this.$emit('openEdit', item, () => {
        // 设置编辑后还需要刷新一次
        Vue.set(this.treeDatas, index, item);
      });
    }
  }
};
</script>

<style scoped>
.toc-tab_cons > .toc-tab > .tab_title {
  margin: 0;
  width: 100%;
}

.toc-tab {
  width: 100%;
  height: auto;
}

.toc-tab.toc-tab_con {
  display: inline-flex;
  width: 33.33%;
  box-sizing: border-box;
}

.toc-tab_cons > .toc-tab.toc-tab_con {
  padding: 0 10px;
}

.toc-tab_cons > .toc-tab_con:nth-child(3n + 1) {
  padding: 0px 0px 0px 18px;
}
.toc-tab_cons > .toc-tab_con:nth-child(3n) {
  padding: 0px 18px 0px 0px;
}

.tab_title {
  width: 100%;
  height: 32px;
  line-height: 32px;
  padding: 0px 15px 0px 15px;
  box-sizing: border-box;
}

.toc-tab .toc-tab > .tab_title {
  padding-left: 30px;
}

.toc-tab .toc-tab .toc-tab > .tab_title {
  padding-left: 45px;
}

.toc-tab .toc-tab .toc-tab .toc-tab > .tab_title {
  padding-left: 60px;
}

.toc > .toc-tab:first-child > .tab_title {
  margin: 0;
}

.tab_more,
.icon-arrow_right,
.icon-arrow_down,
.el-icon-caret-right,
.el-icon-caret-bottom {
  float: left;
  margin-right: 6px;
}

.icon-arrow_right,
.icon-arrow_down,
.el-icon-caret-right,
.el-icon-caret-bottom {
  height: 32px;
  line-height: 32px;
}

.tab_list_title .tab_more {
  color: #258ec8;
}

.tab_list {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: wrap;
  padding: 10px 20px;
}

.tab_item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  /* width:33.33%; */
  width: 100%;
  padding: 10px 0;
}

.tab_item .tab-item_icon {
  width: 64px;
  height: 64px;
  border-radius: 4px;
}
.tab_item .tab-item-edit_icon {
  position: absolute;
  top: 6px;
  right: -4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  content: url('../../../../src/assets/img/layer-manager/edit_normal.png');
}
.tab_item .tab-item-edit_icon.active {
  content: url('../../../../src/assets/img/layer-manager/edit_selected.png');
}

.tab_item .tab-item_icon {
  background: #ccc no-repeat center;
}

.tab_item .tab-item_text {
  margin-top: 10px;
}

.tab_item .tab-item_icon.active {
  content: url('../../../../src/assets/img/layer-manager/img_select.png');
}
</style>
