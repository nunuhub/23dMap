<template>
  <div class="sh-layer-manager" :class="{ dark: theme === 'dark' }">
    <general-container
      ref="container"
      :is-show.sync="visible"
      :style-config="styleConfig"
      :theme-style="cardThemeStyle"
      :title="title ? title : '图层目录'"
      :position="position"
      :img-src="imgSrc ? imgSrc : 'layer-manager'"
      :berth="berth"
      :theme="theme"
      class="sh-layer-manager"
      :class="{ dark: theme === 'dark' }"
      :append-to-body="appendToBody"
      :drag-enable="dragEnable"
      :only-container="onlyContainer"
      @change:isShow="onChangeIsShow"
    >
      <mobile-card v-if="mobile" :tree-datas="treeData" />
      <div v-else class="layer-tree">
        <el-input
          v-if="isSearch"
          v-model="filterText"
          class="search-input"
          placeholder="搜索图层..."
          size="small"
          prefix-icon="el-icon-search"
        ></el-input>
        <el-tree
          ref="tree"
          :data="treeData"
          show-checkbox
          node-key="id"
          :default-expanded-keys="expandedKeys"
          :props="defaultProps"
          :render-after-expand="false"
          :filter-node-method="filterNode"
          @check-change="treeNodeCheckChange"
        >
          <span
            slot-scope="{ node, data }"
            class="custom-tree-node"
            @mouseover="getNodeLayerInfo(data)"
            @dblclick="zoomToLayer(data)"
          >
            <span v-if="!!data.group && data.group === '2'">
              <IconSvg
                :id="data.id"
                height="var(--primaryFontSize)"
                width="var(--primaryFontSize)"
                fillcolor="#3385ff"
                :icon-class="
                  currentEditLayerId === data.id
                    ? 'layer-manager-edit'
                    : 'layer-manager-layer'
                "
                @click.native="
                  currentEditLayerId === data.id
                    ? closeEdit(data)
                    : openEdit(data)
                "
              />
            </span>
            <span v-if="!!data.group && data.group === '1'">
              <IconSvg
                height="var(--primaryFontSize)"
                width="var(--primaryFontSize)"
                fillcolor="var(--primaryFontColor)"
                icon-class="layer-manager-layer"
              />
            </span>
            <span v-if="data.dirType === 'multiLayer'">
              <IconSvg
                height="var(--primaryFontSize)"
                width="var(--primaryFontSize)"
                fillcolor="#F9AB00"
                icon-class="layer-manager-layer"
              />
            </span>
            <el-tooltip
              :content="node.label"
              placement="top"
              :open-delay="1000"
            >
              <span class="layerlabel">{{ node.label }}</span>
            </el-tooltip>
            <span
              v-if="!!data.group || data.dirType === 'multiLayer'"
              class="layerMenuIconGroup"
            >
              <el-dropdown
                ref="dropdown"
                size="small"
                placement="bottom"
                trigger="hover"
                style="margin-left: 5px; border: 0"
              >
                <el-button class="search-btn" size="mini"> ··· </el-button>
                <el-dropdown-menu slot="dropdown" style="width: 120px">
                  <el-dropdown-item @click.native="zoomToLayer(data)">
                    <div style="display: inline">
                      <img
                        src="../../../src/assets/img/layer-manager/zoom.png"
                        style="margin-right: 5px"
                        width="16px"
                        height="16px"
                        alt="缩放"
                      />
                      <label style="width: 40px">定位</label>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="mapLinkVisiable && data.dirType !== 'multiLayer'"
                    @click.native="mapLink(data)"
                  >
                    <div style="display: inline">
                      <img
                        src="../../../src/assets/img/layer-manager/split.png"
                        style="margin-right: 5px"
                        width="16px"
                        height="16px"
                        alt="分屏"
                      />
                      <label style="width: 40px">分屏</label>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item
                    v-if="data.dirType !== 'multiLayer'"
                    @click.native="setLayerTop(data)"
                  >
                    <div style="display: inline">
                      <img
                        src="../../../src/assets/svg/topping.svg"
                        style="margin-right: 5px"
                        width="16px"
                        height="16px"
                        alt="缩放"
                      />
                      <label style="width: 40px">置顶</label>
                    </div>
                  </el-dropdown-item>
                  <!--卷帘-->
                  <!-- <el-dropdown-item v-if="data.dirType !== 'multiLayer'">
                    <roller-bulind
                      ref="rbRef"
                      :jldb-arr="jldbArr"
                      :jldb-ids="jldbIds"
                      :layer-checked-keys="checkedKeys"
                      :layer-data="data"
                      @jldb-arr-change="jldbArrChange"
                    ></roller-bulind>
                  </el-dropdown-item> -->

                  <el-dropdown-item
                    v-if="
                      false &&
                      $refs.layerStyle.isSupportedLayerStyle(data) &&
                      data.dirType !== 'multiLayer'
                    "
                    @click.native="changeLayerStyle(data)"
                  >
                    <div style="display: inline">
                      <img
                        src="../../../src/assets/svg/edit.svg"
                        style="margin-right: 5px"
                        width="16px"
                        height="16px"
                        alt="编辑"
                      />
                      <label style="width: 40px">编辑</label>
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item v-if="data.dirType !== 'multiLayer'">
                    <span>
                      <el-slider
                        v-if="!!data.group"
                        v-model="data.opacity"
                        :max="1"
                        :step="0.01"
                        :format-tooltip="_formatOpacity"
                        width="70px"
                        @change="changeLayerOpacity(data)"
                      ></el-slider>
                    </span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </span>
          </span>
          <el-divider></el-divider>
        </el-tree>
      </div>
    </general-container>
    <!-- <ExecuteView></ExecuteView> -->
    <layer-style
      ref="layerStyle"
      :is-show.sync="isShowLayerStyle"
      :theme="theme"
      :theme-style="cardThemeStyle"
      :position="layerStylePosition"
      :layer-info="changeStyleLayer"
    />
    <SceneSplit ref="sceneSplit" :is-select-layer="false"></SceneSplit>
  </div>
</template>

<script>
import cardDrag from 'shinegis-client-23d/src/directives/card-drag';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import LayerStyle from 'shinegis-client-23d/packages/layer-style';
import MobileCard from './mobile/index.vue';
import commom from 'shinegis-client-23d/src/mixins/common';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { Message } from 'element-ui';
import SceneSplit from 'shinegis-client-23d/packages/scene-split';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import { preParse } from 'shinegis-client-23d/src/utils/plug/PreParse';

export default {
  name: 'ShLayerManager',
  directives: { cardDrag },
  components: {
    GeneralContainer,
    MobileCard,
    LayerStyle,
    SceneSplit,
    IconSvg
  },
  mixins: [commom, generalCardProps, emitter],
  props: {
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '70px',
        left: '50px'
      })
    },
    hidePileNum: {
      type: Number,
      default: 0
    },
    isSearch: {
      type: Boolean,
      default: true
    },
    defaultExpandedKeys: {
      type: Array,
      default: () => []
    },
    expandRank: {
      type: Number,
      default: 0
    },
    // 图层信息：格式同运维端配置的图层信息
    layersInfo: {
      type: Array,
      default: function () {
        return [];
      }
    },
    // 新加载图层是否自动置顶（为false时，根据配置的层级关系加载）
    isAutoTop: {
      type: Boolean,
      default: false
    },
    // 最多允许同时展现到地图上的图层数量
    maxLayerLimit: {
      type: Number,
      default: 100
    },
    mobile: {
      type: Boolean,
      default: false
    },
    // 初始加载定位 是否启用默认加载图层的isFit属性  默认启用
    initLoadLocation: {
      type: Boolean,
      default: true
    },
    // 是否启用分屏功能
    mapLinkEnable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    this.mapLayerManager = null;
    this.earthLayerManager = null;
    this.isLinking = false;
    return {
      multiLayer: {},
      treeData: [],
      filterText: '',
      defaultCheck: [],
      initCheckItems: [],
      isScheme: false, // 是否过滤
      schemeLayerArr: [], // 方案的图层数组
      defaultProps: {
        children: 'children',
        label: 'label'
      },
      expandedKeys: [],
      currentEditLayerId: null, // 当前编辑图层ID
      // jldbIds: [], // 卷帘对比选中的图层id
      // jldbArr: [],
      layerStylePosition: {
        type: 'absolute',
        top: '30%',
        left: '40%'
      },
      isShowLayerStyle: false, // 是否显示图层编辑属性框
      changeStyleLayer: null,
      ExecuteViewStyle: '',
      confirmMsg: ''
    };
  },
  computed: {
    // 纯三维模式下不展示分屏按钮
    mapLinkVisiable() {
      return this.mapLinkEnable && !!this.$map;
    },
    checkedKeys() {
      let checked = this.$refs.tree.getCheckedKeys();
      return checked;
    },
    initCheckedIds() {
      return this.initCheckItems.map((ele) => ele.id);
    },
    layerManager() {
      return this.currentView === 'map'
        ? this.mapLayerManager
        : this.earthLayerManager;
    }
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
    },
    layersInfo(value) {
      this.clear();
      setTimeout(() => {
        this.initTreeData(value);
      }, 500);
    }
  },
  mounted() {
    this.firstTag = true;
    if (this.$map || this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
    // 方案图层组件选择事件
    this.subscribe.$on('scheme-layer:selected', (val) => {
      if (val.length > 0) {
        this.initSchemeByLayerIds(val);
      } else {
        this.offScheme();
      }
    });
    // 通过树添加图层
    this.subscribe.$on('map:setLayerChecked', (data, checked) => {
      //目录
      if (typeof data === 'string') {
        this.$refs.tree?.setChecked(data, checked, true); // isFit字段不能修改
      } else {
        data.isChecked = checked;
        this.$refs.tree?.setChecked(data.id, checked, false); // isFit字段不能修改
        this.$emit('treeNodeCheckChange', data, checked);
      }
    });
  },
  beforeDestroy() {
    let checkedNodes = this.$refs.tree.getCheckedNodes(true);
    checkedNodes.forEach((node) => {
      this.removeLayer(node);
    });
  },
  methods: {
    // 组件逻辑开始入口
    begin() {
      this.initLayerManager();
      this.initTreeData(this.layersInfo);
      this.expandedKeys = this.defaultExpandedKeys;
    },
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    folderCheckChange(checked, item) {
      let id = '';
      if (item.target) {
        id = item.target.labels[0].id;
      } else {
        id = item.key;
      }
      let targetNode = this.$refs.tree.getNode(id);
      this.$set(targetNode.data, 'isChecked', checked);
      if (targetNode.childNodes.length > 0) {
        targetNode.childNodes.forEach((cnode) => {
          this.folderCheckChange(checked, cnode);
        });
      }
      this.$refs.tree.setChecked(id, checked);
    },
    clear() {
      // 全部移除
      let checkedNodes = this.$refs.tree.getCheckedNodes(true);
      checkedNodes.forEach((node) => {
        this.$refs.tree.setChecked(node.id, false);
      });
    },
    // 参数为完整的toc参数（带目录） 暂未测试
    initScheme(scheme) {
      let checkedNodes = this.$refs.tree.getCheckedNodes(true);
      checkedNodes.forEach((node) => {
        this.$refs.tree.setChecked(node.id, false);
      });
      setTimeout(() => {
        let newTreeToc = [];
        this.layersInfo.forEach((treeTocItem) => {
          let find = scheme.select.find((selectItem) => {
            return selectItem === treeTocItem.id;
          });
          if (find) {
            let checkFind = scheme.checked.find((checkItem) => {
              return checkItem === treeTocItem.id;
            });
            treeTocItem.initChecked = !!checkFind;
            newTreeToc.push(treeTocItem);
          }
        });
        this.initTreeData(newTreeToc);
      }, 500);
    },
    // 参数为图层的数组（不带目录）
    initSchemeByLayerIds(layerArr) {
      this.isScheme = true;
      this.schemeLayerArr = layerArr;
      this.initTocByScheme();
    },
    offScheme() {
      this.isScheme = false;
      this.schemeLayerArr = [];
      this.initTocByScheme();
    },
    /*
     * 根据schemeLayerArr重构树
     * */
    initTocByScheme() {
      // 全部移除
      let checkedNodes = this.$refs.tree.getCheckedNodes(true);
      checkedNodes.forEach((node) => {
        this.$refs.tree.setChecked(node.id, false);
      });
      // 重构树
      this.$nextTick(() => {
        setTimeout(() => {
          this.initTreeData(this.layersInfo);
        }, 0);
      });
    },
    initTreeData(data) {
      this.treeData = this.treeDataTransform(data);
      this._afterInit();
    },
    /**
     * 初始化图层管理器
     */
    initLayerManager() {
      this.mapLayerManager = this.$map?.layerManager;
      this.queryManager = this.$map?.queryManager;
      this.earthLayerManager = this.$earth?.viewer.shine.layerManager;
    },
    _afterInit() {
      // 初始化图层加载
      setTimeout(() => {
        // 把图层配置数据传递给图层管理器
        this.layerManager.setTocData(this.treeData);
        // 把图层配置数据传递给查询管理器
        if (this.queryManager) {
          this.queryManager.setTocData(this.treeData);
        }

        // 图层加载完毕后，发布toc加载完毕事件
        if (this.firstTag) {
          this.$emit('tocLoaded');
          this.$emit('treeLoaded');
          this.firstTag = false;
        }

        // 配置项加载
        for (let i = 0; i < this.initCheckItems.length; i++) {
          this.initCheckItems[i].checked = true;
          this.$refs.tree.setChecked(this.initCheckItems[i].id, true, false);
          this.$emit('treeNodeCheckChange', this.initCheckItems[i], true);
          // if (this.initCheckItems[i].parent) {
          //   let parentNodes = this.treeData.filter((item) => {
          //     return item.id === this.initCheckItems[i].parent;
          //   });
          // }
        }
        if (!this.treeData) {
          return;
        }
      }, 0);
    },

    treeDataTransform(data) {
      data = JSON.parse(JSON.stringify(data));
      this.startExpendIds = []; // 第一个目录
      data.sort(function (a, b) {
        if (a.sort == null) {
          a.sort = 0;
        }
        if (b.sort == null) {
          b.sort = 0;
        }
        return a.sort - b.sort;
      });
      this.defaultCheck = [];
      this.initCheckItems = [];
      let allFolderInfos = [];
      let folderInfos = new Map();
      let folderInfoIds = [];
      this.reBuildZIndex(data);
      // 通过父节点追溯，剔除空目录节点
      // 生成目录ID数组
      // 生成所有目录数组
      data.forEach((item) => {
        item.parent = item.parent || item.parentId;
        if (item.url) {
          // 触发了过滤，且图层不存在于schemeLayerArr，就跳过
          if (this.isScheme) {
            let find = this.schemeLayerArr.find((selectItem) => {
              return selectItem.id === item.id;
            });
            if (!find) {
              item.isSchemeDelete = true;
              return;
            } else {
              item.initChecked = find.initChecked;
            }
          }
          // 生成目录
          if (folderInfoIds.indexOf(item.parent) === -1) {
            if (this.startExpendIds.length < 1) {
              this.startExpendIds.push(item.parent);
            }
            folderInfoIds.push(item.parent);
          }
        } else {
          item.children = [];
          item.kids = [];
          allFolderInfos.push(item);
        }
      });
      // 生成目录Map，创建child空数组
      data.forEach((item) => {
        if (folderInfoIds.indexOf(item.id) >= 0) {
          if (item.dirType === 'multiLayer') {
            item.kids = [];
          } else {
            item.children = [];
          }
          if (!item.label) {
            item.label = item.directoryName;
          }
          folderInfos.set(item.id, item);
        }
      });
      // 给所有文件夹建立层级关系
      allFolderInfos.forEach((folderInfo) => {
        let parentId = folderInfo.parent;
        if (parentId && parentId !== '') {
          let folderObj = folderInfos.get(folderInfo.id)
            ? folderInfos.get(folderInfo.id)
            : folderInfo;
          allFolderInfos.forEach((folder) => {
            if (folder.id === parentId) {
              // 当内层循环的ID== 外层循环的parendId时，（说明有children），需要往该内层id里建个children并push对应的数组；
              let fObj = folderInfos.get(folder.id)
                ? folderInfos.get(folder.id)
                : folder;
              if (fObj.dirType === 'multiLayer') {
                if (!fObj.kids) {
                  fObj.kids = [];
                }
                fObj.kids.push(folderObj);
              } else {
                if (!fObj.children) {
                  fObj.children = [];
                }
                fObj.children.push(folderObj);
              }
            }
          });
        }
      });

      // 给文件夹增加图层
      data.forEach((item) => {
        if (folderInfoIds.indexOf(item.parent) >= 0) {
          let folder = folderInfos.get(item.parent);
          if (
            folder &&
            item.url &&
            item.url !== '' &&
            item.isSchemeDelete !== true
          ) {
            if (
              (this.viewMode === '3D' && item.sceneFlag === '2D') ||
              (this.viewMode === '2D' && item.sceneFlag === '3D')
            ) {
              return;
            } else {
              if (item.initChecked && JSON.parse(item.initChecked) === true) {
                this.defaultCheck.push(item.guid);
                folder.indeterminate = true;
                this.initCheckItems.push(item);
              }
              if (item.opacity) {
                item.opacity = Number(item.opacity);
              } else {
                item.opacity = 1;
              }
              if (folder.dirType === 'multiLayer') {
                folder.kids.push(item);
                folder.kids = this.reOrder(folder.kids);
                item.isMulti = true;
              } else {
                folder.children.push(item);
                folder.children = this.reOrder(folder.children);
              }
            }
          }
        }
      });

      //把复合图层的所以图层放到一起
      allFolderInfos.forEach((item) => {
        if (item.dirType === 'multiLayer') {
          this.selectMultiLayer(item);
        }
      });

      allFolderInfos = allFolderInfos.filter((ele) => !ele.parent); // 这一步是过滤，按树展开，将多余的数组剔除；

      // 去掉前面hidePileNum层的文件夹
      let n = this.hidePileNum;
      while (n > 0) {
        let newAllFolderInfos = [];
        allFolderInfos.forEach((item) => {
          if (item.children && item.children.length > 0) {
            newAllFolderInfos = newAllFolderInfos.concat(item.children);
          } else {
            newAllFolderInfos.push(item);
          }
        });
        allFolderInfos = newAllFolderInfos;
        n--;
      }
      // 计算文件夹的图层数
      allFolderInfos.forEach((item) => {
        if (item.dirType === 'multiLayer') {
          return;
        }
        if (item.children && item.children.length > 0) {
          this.computeTreeLength(item);
        } else {
          if (item.children || !item.url) {
            item.label = item.label + '(0)';
          }
          item.chilrenLength = 0;
        }
      });

      // 在isScheme为true时删除chilrenLength为0的目录
      if (this.isScheme) {
        allFolderInfos = allFolderInfos.filter((item) => {
          return item.chilrenLength > 0;
        });
        allFolderInfos.forEach((item) => {
          if (item.children && item.children.length > 0) {
            this.deleteEmptyFolder(item);
          }
        });
      }
      if (this.expandRank > 0) {
        this.expandedKeys = [];
        this.getDefaultCheckedKeysByRank(allFolderInfos, this.expandRank);
      }
      // 转换完的数据
      return allFolderInfos;
    },
    reOrder(arr) {
      for (let i = 0; i < arr.length - 1; i++) {
        for (let j = 0; j < arr.length - i - 1; j++) {
          if (arr[j].sort > arr[j + 1].sort) {
            var hand = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = hand;
          }
        }
      }
      return arr;
    },
    selectMultiLayer(item) {
      // 添加复合图层里的图层
      if (item.dirType === 'multiLayer') {
        this.multiLayer[item.id] = [];
        let length = item.kids.length;
        for (let i = 0; i < length; i++) {
          //判断kids里的是图层还是目录
          let koc = item.kids[i].children;
          if (koc?.length > 0) {
            item.kids[i].isMc = true;
            item.kids[i].gid = item.id;
            this.selectMultiLayer(item.kids[i]);
          } else {
            this.multiLayer[item.id].push(item.kids[i]);
          }
        }
      }

      if (item.isMc) {
        let length = item.children.length;
        for (let i = 0; i < length; i++) {
          //判断children里的是图层还是目录
          let coc = item.children[i].children;
          if (coc?.length > 0) {
            item.children[i].isMc = true;
            item.children[i].gid = item.gid;
            this.selectMultiLayer(item.children[i]);
          } else {
            item.children[i].isMulti = true;
            this.multiLayer[item.gid].push(item.children[i]);
          }
        }
      }
    },
    reBuildZIndex(layerList) {
      let baseCount = 100; // 默认底图个数（可以设置偏大）
      let baseMapLayers = [];
      let projectLayers = [];
      for (let item of layerList) {
        if (item.url) {
          if (item.group === '1') {
            baseMapLayers.push(item);
          } else {
            projectLayers.push(item);
          }
        }
      }

      baseMapLayers.sort(this.mapIndexSort);
      projectLayers.sort(this.mapIndexSort);
      for (let i in baseMapLayers) {
        let item = baseMapLayers[i];
        // eslint-disable-next-line radix
        item.mapIndex = parseInt(i) + 1 + baseCount;
      }

      for (let i in projectLayers) {
        let item = projectLayers[i];
        // eslint-disable-next-line radix
        item.mapIndex = parseInt(i) + 2 + baseMapLayers.length + baseCount;
      }
    },
    computeTreeLength(tree) {
      let length = 0;
      for (let treeChildItem of tree.children) {
        if (treeChildItem.children && treeChildItem.children.length > 0) {
          // 目录
          length = length + this.computeTreeLength(treeChildItem);
        } else if (
          !treeChildItem.url &&
          treeChildItem.dirType !== 'multiLayer'
        ) {
          // 空的目录
          treeChildItem.label = treeChildItem.label + '(0)';
          treeChildItem.chilrenLength = 0;
        } else {
          // 图层
          length++;
        }
      }
      if (tree.dirType !== 'multiLayer') {
        tree.label = tree.label + '(' + length + ')';
        tree.chilrenLength = length;
        return length;
      }
    },

    deleteEmptyFolder(tree) {
      var index = tree.children.length;
      while (index--) {
        let treeChildItem = tree.children[index];
        if (!treeChildItem.url) {
          if (treeChildItem.chilrenLength === 0) {
            tree.children.splice(index, 1);
          } else {
            this.deleteEmptyFolder(treeChildItem);
          }
        }
      }
    },

    getDefaultCheckedKeysByRank(allFolderInfos, rank) {
      if (rank > 0) {
        for (let floder of allFolderInfos) {
          if (floder.children && floder.children.length > 0) {
            this.expandedKeys.push(floder.id);
            this.getDefaultCheckedKeysByRank(floder.children, rank - 1);
          }
        }
      }
    },
    mapIndexSort(a, b) {
      if (a.mapIndex === undefined) {
        a.mapIndex = 0;
      }
      if (b.mapIndex === undefined) {
        b.mapIndex = 0;
      }
      return a.mapIndex - b.mapIndex;
    },
    // 树节点过滤
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    add2dLayer(item) {
      this.mapLayerManager
        .addCheckedLayers(item)
        .then(() => {
          if (this.isAutoTop) {
            this.mapLayerManager.setLayerTop(item.id);
          }
          if (this.checkedKeys.includes(item.id) || item.isMulti) {
            this.openEdit(item);
          } else {
            console.warn('图层已经去除');
            this.mapLayerManager.removeCheckedLayers(item);
          }
        })
        .catch((error) => {
          console.error(error);
          this.$refs.tree?.setChecked(item.id, false, false);
        });
    },
    addLayer(item) {
      // 添加图层
      preParse(item)
        .then(() => {
          this._addLayer(item);
        })
        .catch((e) => {
          console.warn(e);
          this._addLayer(item);
        });
    },
    _addLayer(item) {
      if (this.viewMode === '2D') {
        this.add2dLayer(item);
      } else if (this.viewMode === '23D') {
        if (item.serverOrigin === '3d_server') {
          item.sceneFlag !== '2D' &&
            this.earthLayerManager.addCheckedLayers(item);
        } else {
          item.sceneFlag !== '3D' && this.add2dLayer(item);
          item.sceneFlag !== '2D' &&
            this.earthLayerManager.addCheckedLayers(
              JSON.parse(JSON.stringify(item))
            );
        }
      } else if (this.viewMode === '3D') {
        this.earthLayerManager.addCheckedLayers(item);
      }
    },
    removeLayer(item) {
      if (this.viewMode === '2D') {
        this.mapLayerManager.removeCheckedLayers(item);
        this.closeEdit(item);
      } else if (this.viewMode === '23D') {
        if (item.serverOrigin === '3d_server') {
          this.earthLayerManager.removeCheckedLayers(item);
        } else {
          this.mapLayerManager.removeCheckedLayers(item);
          this.closeEdit(item);
          this.earthLayerManager.removeCheckedLayers(item);
        }
      } else if (this.viewMode === '3D') {
        this.earthLayerManager.removeCheckedLayers(item);
      }
    },
    // Tree的主动选择
    treeNodeCheckChange(element, isChecked) {
      const item = { ...element };
      // 添加图层
      if (item.dirType === 'multiLayer') {
        let koc = this.multiLayer[item.id];
        for (let i = 0; i < koc.length; i++) {
          if (isChecked) {
            // 添加图层
            this.addLayer(koc[i]);
          } else {
            // 移除图层
            this.removeLayer(koc[i]);
          }
        }
      }
      if (item.url && item.url !== '') {
        // 加载图层时 根据条件过滤
        if (isChecked) {
          // 可见图层>0
          if (
            (!item.visibleLayers || item.visibleLayers.length === 0) &&
            item.serverOrigin !== '3d_server' &&
            item.serverOrigin !== 'netServer' &&
            item.type.toLowerCase() !== 'geojson' &&
            item.type.toLowerCase() !== 'vectorTiled' &&
            item.type.toLowerCase() !== 'xyz'
          ) {
            Message({
              message: '图层' + item.label + '不存在可见图层',
              type: 'error'
            });
            this.$nextTick(() => {
              this.$refs.tree?.setChecked(item.id, false, false);
            });
            return;
          }
          // 最大可加载数量
          if (
            this.$refs.tree?.getCheckedKeys(true).length > this.maxLayerLimit
          ) {
            Message({
              message: '图层加载数量不能超过' + this.maxLayerLimit + '个',
              type: 'error'
            });
            this.$nextTick(() => {
              this.$refs.tree?.setChecked(item.id, false, false);
            });
            return;
          }
        }
        // 判断该次图层加载是否是默认初始加载
        const index = this.initCheckedIds.findIndex((ele) => ele === item.id);
        if (index > -1) {
          item.isFit = this.initLoadLocation ? item.isFit : false;
          this.initCheckedIds.splice(index, 1);
        }
        this.$emit('treeNodeCheckChange', item, isChecked);
        // this.$refs.tree?.setChecked(item.id, isChecked, false);
        if (isChecked) {
          // 添加图层
          this.addLayer(item);
        } else {
          // 移除图层
          this.removeLayer(item);
        }
      }
    },
    getNodeLayerInfo(data) {
      if (this.layerManager.getLayerOpacity(data.id) >= 0) {
        data.opacity = this.layerManager.getLayerOpacity(data.id);
      }
    },
    changeLayerOpacity(data) {
      if (this.viewMode === '2D') {
        this.mapLayerManager.setLayerOpacity(data.id, data.opacity * 100);
      } else if (this.viewMode === '23D') {
        this.mapLayerManager.setLayerOpacity(data.id, data.opacity * 100);
        let tempL = this.earthLayerManager.getLayer(data.id, 'id');
        tempL.setOpacity(data.opacity);
      } else if (this.viewMode === '3D') {
        let tempL = this.earthLayerManager.getLayer(data.id, 'id');
        tempL.setOpacity(data.opacity);
      }
    },
    changeLayerStyle(data) {
      this.changeStyleLayer = data;
      this.isShowLayerStyle = true;
    },
    _formatOpacity(val) {
      return Math.round(val * 100);
    },
    /**
     * 缩放到图层
     */
    zoomToLayer(data) {
      //复合图层定位
      if (data.dirType === 'multiLayer') {
        let koc = this.multiLayer[data.id];
        let layers2d = [];
        let layers3d = [];
        //构造三维layers和二维layers
        for (let layer of koc) {
          if (layer.sceneFlag !== '3D' && layer.serverOrigin !== '3d_server') {
            layers2d.push(layer);
          }
          if (layer.sceneFlag !== '2D') {
            layers3d.push(layer);
          }
        }
        //定位
        if (this.viewMode === '2D') {
          this.mapLayerManager.zoomToLayers(layers2d);
        } else if (this.viewMode === '23D') {
          if (this.currentView === 'map') {
            this.mapLayerManager.zoomToLayers(layers2d);
          } else {
            this.earthLayerManager.zoomToLayer(layers3d[0]);
          }
        } else if (this.viewMode === '3D') {
          this.earthLayerManager.zoomToLayer(layers3d[0]);
        }
        //普通图层定位
      } else {
        if (this.viewMode === '2D') {
          this.mapLayerManager.zoomToLayer(data.id);
        } else if (this.viewMode === '23D') {
          if (data.serverOrigin === '3d_server') {
            this.earthLayerManager.zoomToLayer(data);
          } else {
            if (data.sceneFlag === '3D') {
              this.earthLayerManager.zoomToLayer(data);
            } else {
              this.mapLayerManager.zoomToLayer(data.id);
            }
          }
        } else if (this.viewMode === '3D') {
          this.earthLayerManager.zoomToLayer(data);
        }
      }
    },

    setLayerTop(data) {
      let id = data.id ? data.id : data;
      if (this.viewMode === '2D') {
        this.mapLayerManager.setLayerTop(id);
      } else if (this.viewMode === '23D') {
        if (data.serverOrigin === '3d_server') {
          this.earthLayerManager.setLayerTop(id);
        } else {
          this.mapLayerManager.setLayerTop(id);
          this.earthLayerManager.setLayerTop(id);
        }
      } else if (this.viewMode === '3D') {
        this.earthLayerManager.setLayerTop(id);
      }
    },
    mapLink(data) {
      this.$refs.sceneSplit.confirmAddLinkMap(data);
    },
    // 根据方案对应的id,过滤出需要的toc节点
    solutionTocFilter(solutionIDs) {
      const solutionToc = this.layersInfo.filter(
        (ele) => solutionIDs.indexOf(ele.id) !== -1
      );
      return solutionToc;
    },
    /**
     * 打开图层编辑状态
     */
    openEdit(data) {
      if (this.checkedKeys.includes(data.id)) {
        if (data.group === '2') {
          let success = this.mapLayerManager?.setEditLayerById(data);
          if (success) {
            this.currentEditLayerId = data.id;
            this.$emit('change:editLayer', data);
          } else {
            Message({
              type: 'info',
              message: '该图层还未加载'
            });
          }
        }
      }
    },
    /**
     * 关闭图层编辑状态
     */
    closeEdit(data) {
      if (data.group === '2') {
        if (this.currentEditLayerId === data.id) {
          this.currentEditLayerId = null;
          this.mapLayerManager?.setEditLayer(null);
        }
      }
    }
  }
};
</script>
