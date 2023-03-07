<template>
  <mobile-tree
    class="mobile-card"
    :tree-datas="treeDatas"
    @itemCheckChange="treeNodeCheckChange"
  />
</template>

<script>
import MobileTree from './mobile-tree.vue';
import commom from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';

export default {
  name: 'MobileCard',
  components: {
    MobileTree
  },
  mixins: [commom, emitter],
  props: {
    treeDatas: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  computed: {
    positionStyle() {
      return (
        'position:' +
        this.position.type +
        ';' +
        this._getPosition(this.position.top, this.position.bottom, false) +
        ';' +
        this._getPosition(this.position.left, this.position.right, true) +
        ';z-index:999;text-align:left;'
      );
    }
  },
  mounted() {
    this.subscribe.$on('mobile-tree:itemCheckChange', this.treeNodeCheckChange);
    this.subscribe.$on('mobile-tree:openEdit', this.openEdit);
    // 通过树添加图层
    this.subscribe.$on('map:setLayerChecked', (data, checked) => {
      //目录
      if (typeof data === 'string') {
        this.treeNodeCheckChange(data, checked);
      } else {
        data.isChecked = checked;
        this.treeNodeCheckChange(data, checked);
        this.$emit('treeNodeCheckChange', data, checked);
      }
    });
  },
  methods: {
    // Tree的主动选择
    treeNodeCheckChange(item, isChecked) {
      this.$parent.$parent.treeNodeCheckChange(item, isChecked);
    },
    /**
     * 打开图层编辑状态
     */
    openEdit(data, clickFinish) {
      if (data.group === '2') {
        for (let layerManager of this.$parent.$parent.layerManagerArray) {
          layerManager.setEditLayerById(data);
        }
        if (clickFinish) {
          clickFinish();
        }
      }
    }
  }
};
</script>

<style scoped>
.mobile-card {
  width: 100%;
  font-size: var(--primaryFontSize);
  color: var(--primaryFontColor);
}
</style>
