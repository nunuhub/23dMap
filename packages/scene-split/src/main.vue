<template>
  <div class="sh-scene-split">
    <SplitScreenMap
      v-for="item in linkMap"
      v-show="isShow"
      ref="screenMap"
      :key="item.id"
      :main-layer="item.layer"
      :map-id="item.id"
      :layer-data="layerData"
      :is-select="isSelect"
      @click="removeLink"
    ></SplitScreenMap>
  </div>
</template>

<script>
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import SplitScreenMap from './split-screen-map';
import { v4 as uuidv4 } from 'uuid';
import {
  ShineMapEventType,
  MapLinkEvent
} from 'shinegis-client-23d/src/map-core/ShineMap';
import { Message } from 'element-ui';

export default {
  name: 'ShSceneSplit',
  components: { SplitScreenMap },
  mixins: [common, emitter],
  props: {
    layersInfo: {
      type: Array,
      default: () => []
    },
    isSelectLayer: {
      type: Boolean,
      default: false
    },
    //分屏数量
    linkNum: {
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      layerData: [],
      isShow: false,
      linkMap: [],
      linkItem: {},
      isSelect: true,
      jldbArr: []
    };
  },
  mounted() {
    if (this.$map) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
    this.subscribe.$on('roller-blind:blind', (arr) => {
      this.jldbArr = arr;
    });
    this.subscribe.$on('roller-blind:clearLinkMap', (arr) => {
      if (arr.length === 0) {
        this.removeAllLinkMap();
      }
    });
  },
  beforeDestroy() {
    this.subscribe.$off('roller-blind:clearLinkMap');
    this.subscribe.$off('roller-blind:blind');
  },
  methods: {
    begin() {
      this.getLayers();
    },
    getLayers() {
      for (let i = 0; i < this.layersInfo.length; i++) {
        if (this.layersInfo[i].tp === 'layer') {
          this.layerData.push(this.layersInfo[i]);
        }
      }
    },
    getLinkCount(num) {
      if (this.linkMap.length > num) {
        this.linkMap.splice(num - 1, this.linkMap.length - num);
      } else if (this.linkMap.length < num) {
        for (let i = this.linkMap.length; i < num; i++) {
          (this.linkItem = {
            id: uuidv4(),
            layer: {}
          }),
            this.linkMap.push(this.linkItem);
        }
      }
    },
    //添加分屏界面，修改主副窗口大小
    confirmAddLinkMap(data) {
      if (this.jldbArr.length > 0) {
        this._confirm('当前正在执行卷帘功能,是否关闭卷帘?', () => {
          this.jldbArr = [];
          this.$emit('clearBlind', this.jldbArr);
          //调用split-screen中的方法
          this.addLinkMap(data);
        });
      } else {
        this.addLinkMap(data);
      }
      this.$emit('linkMapNum', this.linkMap);
    },
    addLinkMap(layer) {
      if (layer) {
        //添加一个图层为layer的新分屏
        if (this.linkMap.length >= 7) {
          Message('目前支持的最大分屏个数为8个,请删除其他分屏再添加');
          return;
        }
        this.isSelect = this.isSelectLayer;
        let linkLayerItem = {
          id: uuidv4(),
          layer: layer
        };
        this.linkMap.push(linkLayerItem);
      } else {
        //根据linkNum以及layersInfo进行分屏
        this.isSelect = true;
        if (this.linkNum > 7) {
          Message('目前支持的最大分屏个数为8个');
          return;
        }
        //生成newmap数组
        this.getLinkCount(this.linkNum);
      }
      this.$nextTick(() => {
        this.linkReSize(this.linkMap.length);
        this.$map.updateSize();
        this.$refs.screenMap.forEach((item) => {
          item.updateSize();
        });
        this.isShow = true;
        this.$map.dispatchEvent(
          new MapLinkEvent(
            ShineMapEventType.AFTERADDMAPLINK,
            this.$map.getTargetElement()
          )
        );
      });
    },
    _confirm(msg, callback) {
      this.$confirm(msg, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          callback && callback();
        })
        .catch(() => {});
    },
    linkReSize(mapsCount) {
      let mainMap = this.$map.getTargetElement();
      let linkMap = this.$refs.screenMap;
      switch (mapsCount) {
        case 0:
          // 主窗口调整
          mainMap.style.width = '100%';
          mainMap.style.height = '100%';
          mainMap.style.borderRight = '';
          mainMap.style.borderBottom = '';
          break;
        case 1:
          // 两个窗口，高宽比例50% 100%
          // 主窗口调整
          mainMap.style.width = '50%';
          mainMap.style.height = '100%';
          mainMap.style.borderRight = 'solid 1px lightgray';
          mainMap.style.borderBottom = 'solid 1px lightgray';

          linkMap.forEach((item, index) => {
            if (index === 0) {
              item.$refs.linkmap.style.width = '50%';
              item.$refs.linkmap.style.height = '100%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '';
              item.$refs.linkmap.style.right = '0px';
              item.$refs.linkmap.style.top = '0px';
              item.$refs.linkmap.style.left = '';
            }
          });
          break;
        case 2:
          // 主窗口调整
          mainMap.style.width = '50%';
          mainMap.style.height = '100%';
          mainMap.style.borderRight = 'solid 1px lightgray';
          mainMap.style.borderBottom = 'solid 1px lightgray';

          linkMap.forEach((item, index) => {
            // console.warn('childIndex', item);
            if (index === 0) {
              item.$refs.linkmap.style.width = '50%';
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '';
              item.$refs.linkmap.style.right = '0px';
              item.$refs.linkmap.style.top = '0px';
              item.$refs.linkmap.style.left = '';
            } else if (index === 1) {
              item.$refs.linkmap.style.width = '50%';
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '';
              item.$refs.linkmap.style.right = '0px';
              item.$refs.linkmap.style.top = '50%';
              item.$refs.linkmap.style.left = '';
            }
          });
          break;
        case 3:
          // 主窗口调整
          mainMap.style.width = '50%';
          mainMap.style.height = '50%';
          mainMap.style.borderRight = 'solid 1px lightgray';
          mainMap.style.borderBottom = 'solid 1px lightgray';
          linkMap.forEach((item, index) => {
            if (index === 0) {
              item.$refs.linkmap.style.width = '50%';
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '';
              item.$refs.linkmap.style.right = '0px';
              item.$refs.linkmap.style.top = '0px';
              item.$refs.linkmap.style.left = '';
            } else if (index === 1) {
              item.$refs.linkmap.style.width = '50%';
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '';
              item.$refs.linkmap.style.right = '0px';
              item.$refs.linkmap.style.top = '50%';
              item.$refs.linkmap.style.left = '';
            } else if (index === 2) {
              item.$refs.linkmap.style.width = '50%';
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '';
              item.$refs.linkmap.style.right = '';
              item.$refs.linkmap.style.top = '50%';
              item.$refs.linkmap.style.left = '0px';
            }
          });
          break;
        case 4:
          // 主窗口调整
          mainMap.style.width = '50%';
          mainMap.style.height = '66.66%';
          mainMap.style.borderRight = 'solid 1px lightgray';
          mainMap.style.borderBottom = 'solid 1px lightgray';

          linkMap.forEach((item, index) => {
            if (index === 0) {
              item.$refs.linkmap.style.width = '50%';
              item.$refs.linkmap.style.height = '33.33%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '';
              item.$refs.linkmap.style.right = '0px';
              item.$refs.linkmap.style.top = '0px';
              item.$refs.linkmap.style.left = '';
            } else if (index === 1) {
              item.$refs.linkmap.style.width = '50%';
              item.$refs.linkmap.style.height = '33.33%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '33.33%';
              item.$refs.linkmap.style.right = '0px';
              item.$refs.linkmap.style.top = '';
              item.$refs.linkmap.style.left = '';
            } else if (index === 2) {
              item.$refs.linkmap.style.width = '50%';
              item.$refs.linkmap.style.height = '33.33%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '0px';
              item.$refs.linkmap.style.right = '0px';
              item.$refs.linkmap.style.top = '';
              item.$refs.linkmap.style.left = '';
            } else if (index === 3) {
              item.$refs.linkmap.style.width = '50%';
              item.$refs.linkmap.style.height = '33.33%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '0px';
              item.$refs.linkmap.style.right = '';
              item.$refs.linkmap.style.top = '';
              item.$refs.linkmap.style.left = '0px';
            }
          });
          break;
        case 5:
          mainMap.style.width = '50%';
          mainMap.style.height = '66.66%';
          mainMap.style.borderRight = 'solid 1px lightgray';
          mainMap.style.borderBottom = 'solid 1px lightgray';

          linkMap.forEach((item, index) => {
            if (index === 0) {
              item.$refs.linkmap.style.width = '50%';
              item.$refs.linkmap.style.height = '33.33%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '';
              item.$refs.linkmap.style.right = '0px';
              item.$refs.linkmap.style.top = '0px';
              item.$refs.linkmap.style.left = '';
            } else if (index === 1) {
              item.$refs.linkmap.style.width = '50%';
              item.$refs.linkmap.style.height = '33.33%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '33.33%';
              item.$refs.linkmap.style.right = '0px';
              item.$refs.linkmap.style.top = '';
              item.$refs.linkmap.style.left = '';
            } else if (index === 2) {
              item.$refs.linkmap.style.width = '50%';
              item.$refs.linkmap.style.height = '33.33%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '0px';
              item.$refs.linkmap.style.right = '0px';
              item.$refs.linkmap.style.top = '';
              item.$refs.linkmap.style.left = '';
            } else if (index === 3) {
              item.$refs.linkmap.style.width = '25%';
              item.$refs.linkmap.style.height = '33.33%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '0px';
              item.$refs.linkmap.style.right = '';
              item.$refs.linkmap.style.top = '';
              item.$refs.linkmap.style.left = '25%';
            } else if (index === 4) {
              item.$refs.linkmap.style.width = '25%';
              item.$refs.linkmap.style.height = '33.33%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '0px';
              item.$refs.linkmap.style.right = '';
              item.$refs.linkmap.style.top = '';
              item.$refs.linkmap.style.left = '0px';
            }
          });
          break;
        case 6:
          mainMap.style.width = '33.33%';
          mainMap.style.height = '50%';
          mainMap.style.borderRight = 'solid 1px lightgray';
          mainMap.style.borderBottom = 'solid 1px lightgray';
          linkMap.forEach((item, index) => {
            if (index === 0) {
              item.$refs.linkmap.style.width = '25%';
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '0px';
              item.$refs.linkmap.style.right = '';
              item.$refs.linkmap.style.top = '';
              item.$refs.linkmap.style.left = '25%';
            } else if (index === 1) {
              item.$refs.linkmap.style.width = '25%';
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '0px';
              item.$refs.linkmap.style.right = '25%';
              item.$refs.linkmap.style.top = '';
              item.$refs.linkmap.style.left = '';
            } else if (index === 2) {
              item.$refs.linkmap.style.width = '25%';
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '0px';
              item.$refs.linkmap.style.right = '0px';
              item.$refs.linkmap.style.top = '';
              item.$refs.linkmap.style.left = '';
            } else if (index === 3) {
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.width = '33.33%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '';
              item.$refs.linkmap.style.right = '0px';
              item.$refs.linkmap.style.top = '0px';
              item.$refs.linkmap.style.left = '';
            } else if (index === 4) {
              item.$refs.linkmap.style.width = '33.33%';
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '';
              item.$refs.linkmap.style.right = '33.33%';
              item.$refs.linkmap.style.top = '0px';
              item.$refs.linkmap.style.left = '';
            } else if (index === 5) {
              item.$refs.linkmap.style.width = '25%';
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '';
              item.$refs.linkmap.style.right = '';
              item.$refs.linkmap.style.top = '50%';
              item.$refs.linkmap.style.left = '0px';
            }
          });
          break;
        case 7:
          mainMap.style.width = '25%';
          mainMap.style.height = '50%';
          mainMap.style.borderRight = 'solid 1px lightgray';
          mainMap.style.borderBottom = 'solid 1px lightgray';
          linkMap.forEach((item, index) => {
            if (index === 0) {
              item.$refs.linkmap.style.width = '25%';
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '';
              item.$refs.linkmap.style.right = '';
              item.$refs.linkmap.style.top = '0px';
              item.$refs.linkmap.style.left = '25%';
            } else if (index === 1) {
              item.$refs.linkmap.style.width = '25%';
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '';
              item.$refs.linkmap.style.right = '25%';
              item.$refs.linkmap.style.top = '0px';
              item.$refs.linkmap.style.left = '';
            } else if (index === 2) {
              item.$refs.linkmap.style.width = '25%';
              item.$refs.linkmap.style.height = '50';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '';
              item.$refs.linkmap.style.right = '0px';
              item.$refs.linkmap.style.top = '0px';
              item.$refs.linkmap.style.left = '';
            } else if (index === 3) {
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.width = '25%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '0px';
              item.$refs.linkmap.style.right = '0px';
              item.$refs.linkmap.style.top = '';
              item.$refs.linkmap.style.left = '';
            } else if (index === 4) {
              item.$refs.linkmap.style.width = '25%';
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '0px';
              item.$refs.linkmap.style.right = '25%';
              item.$refs.linkmap.style.top = '';
              item.$refs.linkmap.style.left = '';
            } else if (index === 5) {
              item.$refs.linkmap.style.width = '25%';
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '0px';
              item.$refs.linkmap.style.right = '';
              item.$refs.linkmap.style.top = '';
              item.$refs.linkmap.style.left = '25%';
            } else if (index === 6) {
              item.$refs.linkmap.style.width = '25%';
              item.$refs.linkmap.style.height = '50%';
              item.$refs.linkmap.style.borderRight = 'solid 1px lightgray';
              item.$refs.linkmap.style.borderBottom = 'solid 1px lightgray';
              item.$refs.linkmap.style.bottom = '0px';
              item.$refs.linkmap.style.right = '';
              item.$refs.linkmap.style.top = '';
              item.$refs.linkmap.style.left = '0px';
            }
          });
          break;
      }
    },
    removeLink(linkid) {
      this.linkMap.forEach((item, index) => {
        if (item.id === linkid) {
          this.linkMap.splice(index, 1);
        }
      });
      this._refresh();
    },
    removeAllLinkMap() {
      this.linkMap = [];
      this._refresh();
    },
    _refresh() {
      this.$nextTick(() => {
        this.linkReSize(this.linkMap.length);
        this.$map.updateSize();
        this.$refs.screenMap.forEach((item) => {
          item.updateSize();
        });
        this.$map.dispatchEvent(
          new MapLinkEvent(
            ShineMapEventType.AFTERREMOVEMAPLINK,
            this.$map.getTargetElement()
          )
        );
      });
    }
  }
};
</script>
