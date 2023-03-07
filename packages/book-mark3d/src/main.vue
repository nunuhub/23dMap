<template>
  <div v-show="shouldShow" class="sh-book-mark3d">
    <general-container
      :is-show.sync="visible"
      :title="title ? title : '场景视廊'"
      :img-src="imgSrc ? imgSrc : 'book-mark3d'"
      :berth="berth"
      :style-config="cardStyleConfig"
      :position="position"
      :theme="theme"
      :drag-enable="dragEnable"
      :append-to-body="appendToBody"
      :theme-style="cardThemeStyle"
      :only-container="onlyContainer"
      @change:isShow="onChangeIsShow"
    >
      <div class="bookMarkL">
        <!-- 目录 -->
        <div class="view_catalogue">
          <div class="catalogue_add" title="添加目录" @click="cataAdd()">
            <span>+</span>
          </div>
          <!-- 1880px -->
          <div
            class="catalogue_list"
            :style="{ width: clientWidth - 40 + 'px' }"
          >
            <div
              v-for="(item, index) in showMulist"
              :key="index"
              :class="{ list_item: true, active: catalogue_sindex === index }"
              onselectstart="return false;"
              @click.stop="selectCatalogue(index)"
              @dblclick.stop="cataEdit(item)"
              @mouseover="cata_hindex = index"
              @mouseleave="cata_hindex = null"
            >
              {{ item.name }}
              <span
                v-if="cata_hindex === index"
                class="catalogue_del"
                @click.stop="cataDel(item)"
                >×</span
              >
            </div>
          </div>
        </div>
        <!-- 场景 -->
        <div class="view_scene">
          <div :class="{ scene_add: true, hasRoam: hasRoam }">
            <div title="添加场景" @click="sceneAdd()">+</div>
            <div v-if="hasRoam" title="添加漫游" @click="roamAdd()">
              <!-- <img src="../../assets/bookmark/icon_fly.png" alt="" /> -->
              <icon-svg icon-class="roam3d"></icon-svg>
            </div>
          </div>
          <div
            class="scene_list"
            :style="{ marginLeft: isMore ? '0px' : '15px' }"
          >
            <div
              v-if="isMore"
              class="prev listBtn"
              onselectstart="return false;"
              @click="move('prev')"
            >
              <span>&lt;</span>
              <!-- <icon-svg icon-class="左"></icon-svg> -->
            </div>
            <!-- 1815px -->
            <div class="list_box" :style="{ width: clientWidth - 105 + 'px' }">
              <div v-if="showSceneList.length === 0" class="none">
                当前无场景!
              </div>
              <div
                v-loading="loading"
                class="list_content"
                :style="{ left: left_index * 130 + 'px' }"
                element-loading-text="拼命加载中"
                element-loading-spinner="el-icon-loading"
                element-loading-background="rgba(0, 0, 0, 0.8)"
              >
                <div
                  v-for="(item, index) in showSceneList"
                  :key="index"
                  :class="{
                    list_item: true,
                    active: scene_sindex === index,
                    hover: scene_hindex === index,
                    first_item: index === 0
                  }"
                  @click="selectScene(index, item)"
                  @mouseover="
                    scene_hindex = index;
                    toolShow = true;
                  "
                  @mouseleave="
                    scene_hindex = index;
                    toolShow = false;
                  "
                >
                  <!-- <img
                    class="scene_img"
                    :src="item.baseMap"
                    alt="图片加载失败"
                  /> -->
                  <el-image class="scene_img" :src="item.baseMap">
                    <div slot="error" class="image-slot">
                      <i
                        class="el-icon-picture-outline"
                        style="font-size: 24px"
                      ></i>
                    </div>
                    <!-- <div slot="placeholder" class="image-slot">
                      加载中<span class="dot">...</span>
                    </div> -->
                  </el-image>
                  <div class="scene_name">{{ item.name }}</div>
                  <div :class="{ scene_tool: true, show: toolShow }">
                    <div
                      class="tool_item"
                      title="编辑"
                      @click.stop="sceneEdit(item)"
                    >
                      <icon-svg icon-class="edit"></icon-svg>
                    </div>
                    <div
                      class="tool_item"
                      title="删除"
                      @click.stop="sceneDel(item)"
                    >
                      <icon-svg icon-class="delete"></icon-svg>
                    </div>
                    <div
                      v-if="item.flyRoam && hasRoam"
                      class="tool_item"
                      title="开始漫游"
                      @click.stop="sceneFly(item.flyRoam)"
                    >
                      <icon-svg icon-class="roam3d"></icon-svg>
                    </div>
                    <div
                      v-if="item.flyRoam && hasRoam"
                      class="tool_item"
                      title="漫游编辑"
                      @click.stop="sceneFlyEdit(item.flyRoam)"
                    >
                      <icon-svg icon-class="draw-tool"></icon-svg>
                    </div>
                    <div
                      v-if="!item.flyRoam && hasRoam"
                      class="tool_item"
                      title="添加漫游"
                      @click.stop="sceneFlyAdd(item)"
                    >
                      <!-- <img src="../../assets/bookmark/icon_fly.png" alt="" /> -->
                      <!-- <icon-svg icon-class="飞行漫游"></icon-svg> -->
                      <span>+</span>
                    </div>
                  </div>
                  <div
                    class="tool_move left"
                    title="前移"
                    :class="{ moveShow: toolShow }"
                    @click.stop="sceneMove(item, index, false)"
                  >
                    &lt;
                  </div>
                  <div
                    class="tool_move right"
                    title="后移"
                    :class="{ moveShow: toolShow }"
                    @click.stop="sceneMove(item, index, true)"
                  >
                    &gt;
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="isMore"
              class="next listBtn"
              onselectstart="return false;"
              @click="move('next')"
            >
              <span>&gt;</span>
            </div>
          </div>
        </div>
      </div>
    </general-container>
    <!-- 操作弹框 -->
    <Dialog
      ref="dialog"
      :config="config"
      @getFormData="submit"
      @setCenteropt="setCenteropt"
    ></Dialog>
  </div>
</template>

<script>
import { Message } from 'element-ui';

let Map3d;
let commonInterface;
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import Dialog from './bookDialog';
import { CommonInterface } from './api.js';
import common from 'shinegis-client-23d/src/mixins/common';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { v4 as getuuid } from 'uuid';
export default {
  name: 'ShBookMark3d',
  components: {
    Dialog: Dialog,
    GeneralContainer: GeneralContainer,
    IconSvg: IconSvg
  },
  mixins: [common, generalCardProps, emitter],
  props: {
    // 是否竖直布局
    isVertical: {
      type: Boolean,
      default: false
    },
    url: {
      type: String
    },
    schemeId: {
      type: String
    },
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        left: '0px',
        bottom: '28px'
      })
    },
    hasRoam: {
      type: Boolean,
      default: true
    },
    isLocal: {
      type: Boolean,
      default: false
    },
    muluList: {
      type: Array,
      default: () => []
    },
    sceneList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      shouldShow: false,
      isShowRoam: false,
      typeConfig: {
        size: {
          radius: '4px',
          width: '1770px',
          height: '175px'
        }
      },
      loading: false,
      // isVertical: false, // 是否竖直布局
      // roamShow: false,
      toolShow: false, // 场景工具栏显隐
      catalogue_list: [],
      scene_list: [],
      catalogue_sindex: -1,
      cata_hindex: null,
      scene_sindex: null,
      scene_hindex: null,
      config: {
        title: '添加目录',
        attrList: []
      },
      dialogStatus: 1, // 目录增改; 2 场景增改;
      left_index: 0,
      click_timer: null,
      centeropt: null,
      sceneId: null,
      sceneName: null,
      clientWidth: 1770,
      // 存放不走接口的数据结果
      localMulu: [],
      localScene: []
    };
  },
  computed: {
    // 当前目录id
    catalogId: function () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.catalogue_sindex =
        this.catalogue_sindex !== -1 ? this.catalogue_sindex : 0;
      return this.showMulist[this.catalogue_sindex]?.id;
    },
    // 当前场景
    currScene: function () {
      return this.scene_list[this.scene_sindex];
    },
    // 场景是否多于显示个数
    isMore: function () {
      let pd =
        Math.floor((this.clientWidth - 100) / 130) + 1 < this.scene_list.length;
      if (!pd) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.left_index = 0;
      }
      return pd;
    },
    cardStyleConfig() {
      return {
        ...this.typeConfig,
        ...this.styleConfig
      };
    },
    // 页面显示的数据
    showMulist() {
      return this.isLocal ? this.localMulu : this.catalogue_list;
    },
    showSceneList() {
      let result = [];
      if (this.isLocal) {
        result = this.localScene.filter(
          (item) => item.catalogId === this.catalogId
        );
      } else {
        result = this.scene_list;
      }
      return result;
    }
  },
  watch: {
    currentView: {
      handler(val) {
        this.shouldShow = val === 'earth';
      },
      immediate: true
    },
    muluList: {
      handler(val) {
        this.localMulu = val;
      },
      immediate: false
    },
    sceneList: {
      handler(val) {
        this.localScene = val;
      },
      immediate: false
    }
  },
  mounted() {
    let parentEl =
      this.$parent?.$el.offsetWidth === 0 ? this.$parent.$parent : this.$parent;
    this.clientWidth =
      parentEl?.$el.offsetWidth - 150 > 200
        ? parentEl.$el.offsetWidth - 150
        : 200;
    this.typeConfig.size = {
      radius: '4px',
      width: this.clientWidth + 'px',
      height: '175px'
    };
    window.addEventListener('resize', () => {
      this.clientWidth =
        parentEl?.$el?.offsetWidth - 150 > 200
          ? parentEl?.$el?.offsetWidth - 150
          : 200;
      this.typeConfig.size = {
        radius: '4px',
        width: this.clientWidth + 'px',
        height: '175px'
      };
    });
    if (this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
    // 场景视廊新增漫游事件
    this.subscribe.$on('roam3d:addFly', (id, name) => {
      this.addFly(id, name);
    });
  },
  methods: {
    onChangeIsShow(val) {
      this.$emit('change:isShow', val);
      if (val) {
        this.getCataList();
      }
    },
    init() {
      commonInterface = new CommonInterface(
        this.url,
        this.token,
        this.fastApplicationId,
        this.schemeId
      );
      this.getCataList();
    },
    begin() {
      Map3d = this.$earth.viewer;
      // this.$nextTick(() => {
      //   this.$refs.Roam.closeView();
      // });
      this.init();
      this.setInit();
    },
    setInit() {
      Map3d.camera.changed.addEventListener(() => {
        this.centeropt = Map3d.shine.getCameraView(true);
        if (!Map3d.shine.isFlyAnimation()) {
          if (this.$refs.dialog) {
            this.$refs.dialog.setOpt(this.centeropt);
          }
        }
      });
      // this.$refs.Roam.setMap(Map3d);
    },
    switchHv() {
      // eslint-disable-next-line vue/no-mutating-props
      this.isVertical = !this.isVertical;
    },
    // 获取目录列表数据
    getCataList(currIndex) {
      const index = currIndex || 0;
      if (this.isLocal) {
        this.catalogue_sindex = this.showMulist.findIndex(
          (ele) => ele.isDefault === true
        );
      } else {
        commonInterface.getCatalogList().then((res) => {
          // console.log('目录列表', res)
          if (res.length > 0) {
            this.catalogue_list = res;
            this.catalogue_sindex = this.showMulist.findIndex(
              (ele) => ele.isDefault === true
            );
            this.getSceneList(this.catalogId, index);
          }
        });
      }
    },
    // 获取场景列表数据
    getSceneList(catalogId) {
      const id = catalogId || this.catalogId;
      this.loading = true;
      commonInterface
        .getScene(id)
        .then((res) => {
          // console.log("场景列表", res);
          this.scene_list = res;
        })
        .finally(() => (this.loading = false));
    },
    selectCatalogue(index) {
      clearTimeout(this.click_timer);
      this.click_timer = setTimeout(() => {
        this.catalogue_sindex = index;
        this.getSceneList();
      }, 300);
    },
    // 点击场景
    selectScene(index, data) {
      this.scene_sindex = index;
      if (!data) {
        return;
      }
      if (this.isLocal) {
        Map3d.shine.centerAt(data, { isWgs84: true, isFly: true });
        this.setConfig(2, '编辑场景');
        this.$refs.dialog.setForm({ ...data, ...this.currScene });
      } else {
        commonInterface.detailScene(data.id).then((res) => {
          // console.log('场景信息', res);
          let centeropt = {
            y: res.y,
            x: res.x,
            z: res.z,
            heading: res.heading,
            pitch: res.pitch,
            roll: res.roll
          };
          Map3d.shine.centerAt(centeropt, { isWgs84: true, isFly: true });
          this.setConfig(2, '编辑场景');
          this.$refs.dialog.setForm({ ...centeropt, ...this.currScene });
        });
      }
    },
    setCenteropt(data) {
      // console.log('参数改变', data)
      Map3d.shine.centerAt(data, { isWgs84: true, isFly: true });
    },
    // 设置弹框内容16：9
    setConfig(type, title) {
      if (type === 1) {
        this.config = {
          title: title,
          attrList: [
            {
              label: '目录名称',
              type: 'input',
              value: 'name'
            },
            {
              label: '是否默认',
              type: 'switch',
              value: 'isDefault'
            },
            {
              label: '描述',
              type: 'textarea',
              value: 'describe'
            }
          ]
        };
      } else {
        this.config = {
          title: title,
          attrList: [
            {
              label: '场景名称',
              type: 'input',
              value: 'name'
            },
            {
              label: 'X(经度)',
              type: 'inputNum',
              value: 'x',
              precision: 6,
              step: 0.000001
            },
            {
              label: 'Y(纬度)',
              type: 'inputNum',
              value: 'y',
              precision: 6,
              step: 0.000001
            },
            {
              label: 'Z(视高)',
              type: 'inputNum',
              value: 'z',
              precision: 2,
              step: 0.01
            },
            {
              label: 'headinig\n(偏航角)',
              type: 'inputNum',
              value: 'heading',
              precision: 0,
              step: 1,
              min: 0,
              max: 360
            },
            {
              label: 'pitch\n(俯视角)',
              type: 'inputNum',
              value: 'pitch',
              precision: 1,
              step: 0.1
            },
            {
              label: 'roll\n(翻滚角)',
              type: 'inputNum',
              value: 'roll',
              precision: 1,
              step: 0.1
            }
          ]
        };
      }
    },
    // 目录操作
    cataAdd() {
      this.setConfig(1, '添加目录');
      this.dialogStatus = 1;
      this.$refs.dialog.open();
    },
    cataEdit(data) {
      clearTimeout(this.click_timer);
      this.dialogStatus = 1;
      this.setConfig(1, '修改目录');
      if (this.isLocal) {
        this.$refs.dialog.open({ ...data });
      } else {
        commonInterface.detailCatalog(data.id).then((res) => {
          this.$refs.dialog.open(res);
        });
      }
    },
    cataDel(data) {
      this.$confirm('确定是否删除目录<' + data.name + '>, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          if (this.isLocal) {
            this.updateLocalMulu(data, '删除');
          } else {
            commonInterface.delCatalog(data.id).then(() => {
              // console.log("删除", res);
              this.getCataList(-1);
              if (data.isDefault && this.catalogue_list.length > 0) {
                this.dialogStatus = 1;
                let data1 = this.catalogue_list[0];
                data1.isDefault = true;
                this.submit(data1);
              }
              this.showTips('success', '删除成功!');
            });
          }
        })
        .catch(() => {
          this.showTips('info', '已取消删除!');
        });
    },
    // 场景操作
    sceneAdd() {
      if (this.showMulist.length === 0) {
        Message.error('暂无目录，请添加目录!');
        return;
      }
      this.scene_sindex = null;
      let centeropt = Map3d.shine.getCameraView(true);
      // console.log("camera", this.camera);
      this.dialogStatus = 2;
      this.setConfig(2, '添加场景');
      this.$refs.dialog.open(centeropt);
    },
    sceneEdit(data) {
      this.dialogStatus = 2;
      this.setConfig(2, '编辑场景');
      if (this.isLocal) {
        this.$refs.dialog.open(data);
      } else {
        commonInterface.detailScene(data.id).then((res) => {
          this.$refs.dialog.open(res);
        });
      }
    },
    sceneDel(data) {
      this.$confirm('确定是否删除场景<' + data.name + '>, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          if (this.isLocal) {
            this.updateLocalScene(data, '删除');
            this.showTips('success', '删除成功!');
          } else {
            commonInterface.delScene(data.id).then(() => {
              // console.log("删除", res);
              this.getSceneList(this.catalogId, -1);
              this.showTips('success', '删除成功!');
            });
          }
        })
        .catch(() => {
          this.showTips('info', '已取消删除!');
        });
    },
    sceneMove(data, index, direction) {
      if (this.isLocal) {
        let localArr = JSON.parse(JSON.stringify(this.localScene));
        let showListLen = this.showSceneList.length;
        let currIndex = localArr.findIndex((item) => item.id == data.id);
        let nextData =
          index === showListLen - 1
            ? this.showSceneList[0]
            : this.showSceneList[index + 1];
        let nextIndex = localArr.findIndex((item) => item.id == nextData.id);
        let prevData =
          index === 0
            ? this.showSceneList[showListLen - 1]
            : this.showSceneList[index - 1];
        let prevIndex = localArr.findIndex((item) => item.id == prevData.id);
        localArr.splice(currIndex, 1);
        if (direction) {
          // 后移
          localArr.splice(nextIndex, 0, data);
        } else {
          // 前移
          if (index === 0) {
            localArr.splice(prevIndex + 1, 0, data);
          } else {
            localArr.splice(prevIndex, 0, data);
          }
        }
        this.localScene = localArr;
        this.$emit('save:localScene', this.localScene);
      } else {
        let arr = JSON.parse(JSON.stringify(this.scene_list));
        let curr = arr[index];
        arr.splice(index, 1);
        if (direction) {
          // 后移
          if (index !== arr.length) {
            arr.splice(index + 1, 0, curr);
          } else {
            arr.unshift(curr);
          }
        } else {
          // 前移
          if (index !== 0) {
            arr.splice(index - 1, 0, curr);
          } else {
            arr.push(curr);
          }
        }
        this.scene_list = arr;
        let id_arr = this.scene_list.map((item) => item.id);
        // const parame = {
        //   // catalogId: this.catalogId,
        //   sceneList: id_arr
        // };
        commonInterface.moveScene(id_arr).then(() => {
          // this.getSceneList();
        });
      }
    },
    async submit(data) {
      // console.log("提交的数据", data);
      if (this.dialogStatus === 1) {
        if (!data.name) {
          Message.error('请输入目录名称');
          return;
        }
        if (this.isLocal) {
          this.updateLocalMulu(data, data.id ? '修改' : '新增');
        } else {
          await commonInterface.editCatalog(data);
          this.getCataList(-1);
        }
      } else {
        this.getImageFile(data);
        // this.submitScene(data)
      }
    },
    // 场景数据保存提交
    submitScene(data) {
      if (!data.name) {
        Message.error('请输入场景名称');
        return;
      }
      if (this.isLocal) {
        this.updateLocalScene(data, data.id ? '修改' : '新增');
      } else {
        if (!data.id) {
          data.sort = this.scene_list.length + 1;
        } else {
          let _index = this.scene_list.findIndex((ele) => ele.id === data.id);
          data.sort = _index + 1;
        }
        commonInterface.editScene(data).then(() => {
          this.showTips('success', '操作成功!');
          const cur = data.id
            ? this.scene_list.findIndex((ele) => ele.id === data.id)
            : this.scene_list.length;
          this.getSceneList(this.catalogId, cur);
        });
      }
    },
    // canvas转换成文件,上传获取url
    getImageFile(data) {
      Map3d.render();
      const canvas = document.querySelector('.cesium-viewer canvas');
      let base64 = canvas.toDataURL('image/png', 0.9);

      let imgBlob = this.base64ToBlob(base64);
      this.imgToMinbase64(imgBlob, (minData) => {
        if (this.isLocal) {
          data.baseMap = minData;
          data.catalogId = this.catalogId;
          this.submitScene(data);
        } else {
          let imgBlobmin = this.base64ToBlob(minData);
          const imgFile = new File([imgBlobmin], data.name + '.png', {
            type: 'image/png'
          });
          let formData = new FormData();
          formData.append('file', imgFile);
          formData.append('id', 1);
          commonInterface.fileUpload(formData).then((res) => {
            // console.log('上传', res);
            data.baseMap = res.url ? res.url : res;
            data.catalogId = this.catalogId;
            this.submitScene(data);
          });
        }
      });
    },
    imgToMinbase64(imgBlob, callback, width, height) {
      const url = URL.createObjectURL(imgBlob);
      const c = document.createElement('canvas');
      c.id = 'bookmarkCanvas';
      c.width = width ? width : 200;
      c.height = height ? height : 112;
      c.style.position = 'absolute';
      c.style.zIndex = '-100';
      const ctx = c.getContext('2d');
      const img = new Image();
      img.src = url;
      img.onload = function () {
        ctx.drawImage(img, 0, 0, c.width, c.height);
        let minData = c.toDataURL('image/png', 0.9);
        callback(minData);
      };
    },
    base64ToBlob(urlData) {
      var bytes = window.atob(urlData.split(',')[1]);
      var ab = new ArrayBuffer(bytes.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
      }
      return new Blob([ab], { type: 'image/png' });
    },
    showTips(type, message) {
      Message({
        message: message,
        type: type
      });
    },
    // 场景列表移动
    move(type) {
      let num = Math.ceil((this.clientWidth - 100) / 130);
      if (type === 'prev' && this.left_index < 0) {
        this.left_index += 1;
      } else if (
        type === 'next' &&
        this.left_index >= num - this.scene_list.length
      ) {
        this.left_index -= 1;
      }
    },
    // 添加漫游&&场景
    roamAdd() {
      this.sceneId = null;
      this.$emit('roamAdd');
    },
    // 添加漫游&&关联已有场景
    sceneFlyAdd(data) {
      this.sceneName = data.name;
      this.sceneId = data.id;
      this.$emit('roamAdd');
    },
    // 绘制完成拿到路线id
    addFly(id, name) {
      let data;
      if (this.sceneId) {
        data = {
          ...this.centeropt,
          flyRoam: id,
          id: this.sceneId,
          name: this.sceneName
        };
      } else {
        data = {
          ...this.centeropt,
          flyRoam: id,
          name: name
        };
      }
      this.getImageFile(data);
    },
    // 漫游飞行
    sceneFly(id) {
      this.$emit('roamFly', id);
    },
    // 漫游编辑
    sceneFlyEdit(id) {
      this.$emit('roamEdit', id);
    },
    changeBookView(state) {
      this.isMin = !state;
    },
    // 外部调用
    getCameraView() {
      return Map3d.shine.getCameraView(true);
    },
    setCameraView(cameraView, options) {
      Map3d.shine.centerAt(cameraView, options);
    },
    getImage(type, width, height, callback) {
      Map3d.render();
      const canvas = document.querySelector('.cesium-viewer canvas');
      let base64 = canvas.toDataURL('image/png', 0.9);
      let imgBlob = this.base64ToBlob(base64);
      switch (type) {
        case 'base64':
          this.imgToMinbase64(
            imgBlob,
            (minData) => {
              callback(minData);
            },
            width,
            height
          );
          break;
        case 'file':
          this.imgToMinbase64(
            imgBlob,
            (minData) => {
              let imgBlobmin = this.base64ToBlob(minData);
              const imgFile = new File([imgBlobmin], '缩略图' + '.png', {
                type: 'image/png'
              });
              callback(imgFile);
            },
            width,
            height
          );
          break;
        case 'url':
          this.imgToMinbase64(
            imgBlob,
            (minData) => {
              let imgBlobmin = this.base64ToBlob(minData);
              const imgFile = new File([imgBlobmin], '缩略图' + '.png', {
                type: 'image/png'
              });
              let formData = new FormData();
              formData.append('file', imgFile);
              formData.append('id', 1);
              commonInterface.fileUpload(formData).then((res) => {
                callback(res);
              });
            },
            width,
            height
          );
          break;
      }
    },
    // 本地目录数据新增/修改/删除
    updateLocalMulu(data, operType) {
      let index = this.localMulu.findIndex((item) => item.id === data.id);
      switch (operType) {
        case '新增':
          var _data = {
            describe: '',
            id: getuuid(),
            ...data
          };
          this.localMulu.push(_data);
          break;
        case '修改':
          this.localMulu.splice(index, 1, data);
          // 最多一个默认
          if (data.isDefault && operType !== '删除') {
            this.localMulu.forEach((element) => {
              if (element.id !== data.id) {
                element.isDefault = false;
              }
            });
          }
          break;
        case '删除':
          if (data.id === this.catalogId) {
            this.catalogue_sindex = 0;
          }
          this.localMulu.splice(index, 1);
          this.localScene = this.localScene.filter(
            (item) => item.catalogId !== data.id
          );
          break;
      }
      this.$emit('save:localMulu', this.localMulu);
    },
    // 本地场景数据新增/修改/删除
    updateLocalScene(data, operType) {
      let index = this.localScene.findIndex((item) => item.id === data.id);
      switch (operType) {
        case '新增':
          var _data = {
            id: getuuid(),
            ...data
          };
          this.localScene.push(_data);
          break;
        case '修改':
          this.localScene.splice(index, 1, data);
          break;
        case '删除':
          this.localScene.splice(index, 1);
          break;
      }
      this.$emit('save:localScene', this.localScene);
    }
  }
};
</script>
