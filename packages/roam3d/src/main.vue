<template>
  <div v-show="shouldShow" class="sh-roam3d">
    <general-container
      ref="container"
      :is-show.sync="visible"
      :title="title ? title : '飞行漫游'"
      :img-src="imgSrc ? imgSrc : 'roam3d'"
      :style-config="cardStyleConfig"
      :position="position"
      :berth="berth"
      :theme="theme"
      :drag-enable="dragEnable"
      :theme-style="cardThemeStyle"
      :only-container="onlyContainer"
      :append-to-body="appendToBody"
      @change:isShow="onChangeIsShow"
    >
      <div class="roma_content">
        <div v-if="selectIndex === 0" class="roma_plot">
          <div class="btnBox">
            <div class="bffbtn" @click="draw()">新增路线</div>
            <div class="bffbtn" @click="download()">下载路线</div>
            <div class="bffbtn" @click="delFlyIds()">删除路线</div>
          </div>
          <el-table
            :data="tableData"
            border
            min-height="420"
            :row-class-name="tableRowClassName"
            @row-click="rowClick"
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="55" align="center">
            </el-table-column>
            <el-table-column
              prop="name"
              label="路线名称"
              :show-overflow-tooltip="true"
            >
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              width="60"
              class-name="small-padding fixed-width cell-img"
            >
              <template slot-scope="scope">
                <span title="飞行">
                  <icon-svg
                    icon-class="roam3d"
                    style="cursor: pointer"
                    @click.native.stop="fly(scope.row.id)"
                  ></icon-svg>
                </span>
                <span style="margin-left: 5px" title="编辑">
                  <icon-svg
                    icon-class="edit"
                    style="cursor: pointer"
                    @click.native.stop="editFly(scope.row.id)"
                  ></icon-svg>
                </span>
              </template>
            </el-table-column>
          </el-table>
          <div class="page">
            <el-pagination
              small
              background
              layout="total, prev, pager, next"
              :hide-on-single-page="true"
              :current-page="pageNum"
              :pager-count="5"
              :page-size="pageSize"
              :total="total"
              @current-change="changeList"
            >
            </el-pagination>
          </div>
        </div>
        <div v-if="!isDisable" class="roma_info">
          <div class="roma_title">
            <span class="goback" @click="select(0)">返回</span>
            <span class="curr_name" :title="curr_line"
              >当前路线：{{ curr_line }}</span
            >
          </div>
          <div class="roma_tab">
            <div
              :class="{
                tab_item: true,
                active: selectIndex === 2
              }"
              @click="select(2)"
            >
              属性
            </div>
            <div
              :class="{
                tab_item: true,
                active: selectIndex === 1
              }"
              @click="select(1)"
            >
              点位
            </div>
          </div>

          <div v-if="selectIndex === 1" class="roma_latlng">
            <Page-form
              :ref-obj.sync="formInfo.ref"
              :data="formInfo.data"
              :field-list="formInfo.fieldList"
              :rules="formInfo.rules"
              :label-width="formInfo.labelWidth"
              @handleClick="handleClick"
              @handleEvent="handleEvent"
            >
              <template #form-temslot>
                <div class="temp">
                  <Page-form
                    :point-index="pointIndex"
                    :ref-obj.sync="formInfo.ref"
                    :data="formInfo.temArr"
                    :showdel="true"
                    :field-list="formInfo.addtem"
                    :rules="formInfo.rules"
                    label-width="46px"
                    @handleClick="handleClick"
                    @handleEvent="handleEvent"
                  />
                </div>
              </template>
            </Page-form>
          </div>
          <div v-if="selectIndex === 2" class="roma_attr">
            <Page-form
              :ref-obj.sync="formInfo1.ref"
              :data="formInfo1.data"
              :field-list="formInfo1.fieldList"
              :rules="formInfo1.rules"
              :label-width="formInfo1.labelWidth"
              @handleClick="handleClick"
              @handleEvent="handleEvent"
            >
            </Page-form>
            <div class="btnBox">
              <div class="bffbtn" @click="startFly()">开始漫游</div>
              <div class="bffbtn" @click="delFly(roamId)">删除路线</div>
            </div>
          </div>
        </div>
      </div>
    </general-container>
    <Fly ref="fly" @setRoamView="setRoamView"></Fly>
  </div>
</template>

<script>
import { Message } from 'element-ui';

let latlng_list = [
  {
    label: '批量加高程',
    value: 'batch',
    type: 'inputNumber'
  },
  {
    label: '统一改高程',
    value: 'unified',
    type: 'inputNumber'
  },
  {
    label: '速度 (km/h)',
    value: 'speed',
    type: 'inputNumber'
  }
];
let attr_list = [
  {
    label: '名称',
    value: 'name',
    type: 'input'
  },
  {
    label: '漫游对象',
    value: 'point',
    type: 'select',
    list: [
      {
        label: '无',
        value: '0'
      },
      {
        label: '圆点',
        value: 'point'
      },
      {
        label: '汽车模型',
        value: 'model_car'
      },
      {
        label: '飞机模型',
        value: 'model_air'
      },
      {
        label: '卫星模型',
        value: 'model_weixin'
      }
    ]
  },
  {
    label: '显示注记',
    value: 'showLabel',
    type: 'radioGroup',
    list: [
      {
        key: true,
        value: '是'
      },
      {
        key: false,
        value: '否'
      }
    ]
  },
  {
    label: '显示路线',
    value: 'showLine',
    type: 'radioGroup',
    list: [
      {
        key: true,
        value: '是'
      },
      {
        key: false,
        value: '否'
      }
    ]
  },
  {
    label: '显示投影',
    value: 'showShadow',
    type: 'radioGroup',
    list: [
      {
        key: true,
        value: '是'
      },
      {
        key: false,
        value: '否'
      }
    ]
  },
  // {
  //   label: "离地报警",
  //   value: "showHeightWarn",
  //   type: "radioGroup",
  //   list: [
  //     {
  //       key: true,
  //       value: "是",
  //     },
  //     {
  //       key: false,
  //       value: "否",
  //     },
  //   ],
  // },
  // {
  //   label: "报警高度",
  //   value: "warnHeight",
  //   type: "inputNumber",
  //   className: "bfhide",
  // },
  {
    label: '视角',
    value: 'cameraType',
    type: 'select',
    list: [
      {
        label: '无',
        value: '0'
      },
      {
        label: '自由视角',
        value: 'gs'
      },
      {
        label: '锁定视角',
        value: 'dy'
      },
      {
        label: '上帝视角',
        value: 'sd'
      }
    ]
  },
  {
    label: '锁定距离',
    value: 'followedX',
    type: 'inputNumber',
    className: 'bfshow'
  },
  {
    label: '锁定高度',
    value: 'followedZ',
    type: 'inputNumber',
    className: 'bfshow'
  },
  {
    label: '循环漫游',
    value: 'clockRange',
    type: 'radioGroup',
    list: [
      {
        key: true,
        value: '是'
      },
      {
        key: false,
        value: '否'
      }
    ]
  },
  {
    label: '备注',
    value: 'remark',
    type: 'textarea',
    className: 'textarea'
  }
];
let Map3d, DrawTool, currEntity, commonInterface;
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import PageForm from './page-form';
import Fly from './fly';
import { Draw } from 'shinegis-client-23d/src/earth-core/Entry57';
import * as DrawEventType from 'shinegis-client-23d/src/earth-core/Draw/EventType7';
import {
  cartesians2lonlats,
  lonlats2cartesians
} from 'shinegis-client-23d/src/earth-core/Tool/Util3';
// import { getRoamList, addRoam, editRoam, roamDetail, delRoam } from "./api.js";
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
// import Bus from 'shine-web-gis/src/utils/bus';
// import ConfigManager from "../config-manager";
import common from 'shinegis-client-23d/src/mixins/common';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { CommonInterface } from './api.js';
export default {
  name: 'ShRoam3d',
  components: {
    PageForm: PageForm,
    Fly: Fly,
    GeneralContainer: GeneralContainer,
    IconSvg: IconSvg
  },
  mixins: [common, generalCardProps, emitter],
  props: {
    url: {
      type: String
    },
    schemeId: {
      type: String
    }
  },
  data() {
    return {
      shouldShow: false,
      typeConfig: {
        size: {
          radius: '4px',
          width: '275px',
          height: '568px'
        }
      },
      selectIndex: 0,
      tableData: [],
      total: 0,
      pageSize: 10,
      pageNum: 1,
      // 坐标
      formInfo: {
        ref: null,
        data: {
          batch: 0,
          unified: 0,
          speed: 100
        },
        temArr: {},
        fieldList: [
          {
            title: { name: '批量修改', showList: true },
            formList: latlng_list
          },
          {
            title: { name: '坐标列表', addTemp: true, showList: true },
            slotprop: 'temslot'
          }
        ],
        addtem: [],
        rules: {},
        labelWidth: '70px'
      },
      // 属性
      formInfo1: {
        ref: null,
        data: {
          name: null,
          point: 'point',
          showLabel: false,
          showLine: true,
          showShadow: false,
          // showHeightWarn: false,
          // warnHeight: 500,
          cameraType: 'dy',
          followedX: 300,
          followedZ: 200,
          clockRange: false,
          remark: ''
        },
        fieldList: [
          {
            title: { name: '属性信息', showList: true },
            formList: attr_list
          }
        ],
        rules: {},
        labelWidth: '65px'
      },
      drawStyle: {
        lineType: 'solid', // glow solid
        animationDuration: 2000,
        animationImage: 'img/textures/lineClr.png',
        color: '#ffff00',
        // color: "#f00",
        width: 4,
        clampToGround: false,
        outline: false,
        outlineColor: '#ffffff',
        outlineWidth: 2,
        opacity: 1,
        zIndex: 0
      },
      // drawTool: null,
      flyData: null, // 飞行数据
      // currEntity: null,
      oldBatch: 0,
      isDisable: true, // 坐标和属性面板是否禁用
      isBookmark: false,
      roamId: null, // 当前飞行路线id
      updateSpeed: [],
      pointIndex: null, // 鼠标选中的坐标
      timer: null,
      curr_line: null, // 当前路线
      currId: null,
      isLonLat: false, // 是否为坐标界面
      delData: []
    };
  },
  computed: {
    cardStyleConfig() {
      return {
        ...this.typeConfig,
        ...this.styleConfig
      };
    }
  },
  watch: {
    currentView: {
      handler(val) {
        this.shouldShow = val === 'earth';
        if (val !== 'earth') {
          // this.$refs.Roam.closeView();
          this.$refs.fly?.closeView();
        }
      },
      immediate: true
    }
  },
  created() {},
  mounted() {
    if (this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
    // 场景视廊触发的事件  添加漫游、飞行、编辑路线---------
    this.subscribe.$on('book-mark3d:roamAdd', () => {
      this.draw(true);
    });
    this.subscribe.$on('book-mark3d:roamFly', (id) => {
      this.fly(id);
    });
    this.subscribe.$on('book-mark3d:roamEdit', (id) => {
      this.editFly(id);
      let roamConfig = {
        isShow: true,
        roamId: id,
        selectIndex: 2,
        isDisable: false,
        isRemove: false
      };
      this.setRoamView(roamConfig);
    });
    // 场景视廊触发的事件  添加漫游、飞行、编辑路线---------
  },
  beforeDestroy() {
    DrawTool.deleteAll();
    this.$refs.fly?.closeView();
  },
  methods: {
    init() {
      commonInterface = new CommonInterface(
        this.url,
        this.token,
        this.fastApplicationId,
        this.schemeId
      );
      this.getList();
    },
    onChangeIsShow(val) {
      this.$emit('change:isShow', val);
      if (!val) {
        DrawTool.deleteAll();
        this.$refs.fly.closeView();
        this.stopDraw();
      }
    },
    begin() {
      Map3d = this.$earth.viewer;
      this.initDraw();
      this.init();
    },
    handleSelectionChange(val) {
      this.delData = val;
    },
    getList() {
      let params = {
        current: this.pageNum,
        size: this.pageSize
      };
      commonInterface.getRoamList(params).then((res) => {
        // console.log("漫游列表res", res);
        this.tableData = res.records;
        this.total = res.total;
        if (this.tableData.length === 0 && this.total !== 0) {
          this.pageNum = this.pageNum - 1;
          this.getList();
        }
      });
    },
    setRoamView(roamConfig) {
      // this.currId = null;
      this.currId = roamConfig.roamId;
      this.changeShow(roamConfig.isShow);
      this.roamId = roamConfig.roamId;
      this.selectIndex = roamConfig.selectIndex;
      this.isDisable = roamConfig.isDisable;
      if (roamConfig.isRemove) this.removeAll();
    },
    select(index) {
      if (index !== 0 && this.isDisable) return;
      this.selectIndex = index;
      if (this.selectIndex === 1) {
        this.isLonLat = true;
      }
      if (index === 0 && this.roamId) {
        this.saveData();
        this.isLonLat = false;
        this.isDisable = true;
      }
    },
    initDraw() {
      let options = {
        hasEdit: true,
        horizontalBar: false,
        labelShow: true,
        polygonShow: true,
        polylineShow: true,
        showToolbar: true,
        verticalBar: true
      };
      DrawTool = new Draw(Map3d, options);
      DrawTool.on('change:active', (e) => {
        this.$emit('change:active', e.active);
      });
      // console.log("Draw", DrawTool);
      let that = this;
      DrawTool.on(DrawEventType.DrawCreated, function (e) {
        // console.log('创建完成', e)
        if (
          e.entity._attribute.attr.id === null ||
          e.entity._attribute.attr.id === ''
        ) {
          e.entity._attribute.attr.id = that.getCurrTime();
        }
        currEntity = e.entity;
        that.setTem(e.entity.editing.getPosition(), false);
        that.selectIndex = 2;
        that.isDisable = false;
        that.saveData(true);
        that.startEditing(e.entity);
        that.currId = null;
      });
      DrawTool.on(DrawEventType.EditStart, function (e) {
        currEntity = e.entity;
        that.setTem(e.entity.editing.getPosition(), false);
        that.selectIndex = 2;
        if (that.isLonLat) {
          that.selectIndex = 1;
        }
        that.isDisable = false;
        that.$refs.fly.closeView();
        that.startEditing(e.entity);
      });
      DrawTool.on(DrawEventType.EditMovePoint, function (e) {
        // console.log('移动点', e)
        currEntity = e.entity;
        that.setTem(e.entity.editing.getPosition(), false);
        that.startEditing(e.entity);
      });
      DrawTool.on(DrawEventType.EditRemovePoint, function (e) {
        // console.log('删除点', e);
        currEntity = e.entity;
        that.setTem(e.entity.editing.getPosition(), false);
        that.startEditing(e.entity);
        that.pointIndex = undefined;
      });
      DrawTool.on(DrawEventType.EditStop, function (e) {
        // console.log('停止编辑', e);
        currEntity = e.entity;
        that.selectIndex = 0;
        that.isDisable = true;
        if (that.roamId) {
          that.saveData();
        }
      });
      DrawTool.on('delete-feature', () => {
        // console.log('删除路线', e);
        commonInterface.delRoam(this.currId).then(() => {
          Message({
            message: '已删除当前路线！',
            type: 'success'
          });
          this.currId = null;
          this.roamId = null;
          this.selectIndex = 0;
          this.isDisable = true;
          this.getList();
        });
      });
    },
    changeList(val) {
      this.pageNum = val;
      this.getList();
    },
    draw(isBook) {
      this.removeAll();
      this.roamId = null;
      this.isBookmark = !!isBook;
      this.formInfo1.data = {
        name: null,
        point: 'point',
        showLabel: false,
        showLine: true,
        showShadow: false,
        cameraType: 'dy',
        followedX: 300,
        followedZ: 200,
        clockRange: false,
        remark: ''
      };
      this.formInfo.data = {
        batch: 0,
        unified: 0,
        speed: 100
      };
      this.updateSpeed = [];
      let attribute = this.formInfo1.data;
      attribute.name = this.formInfo1.data.name || '' + this.getCurrTime();
      DrawTool.startDraw({
        attr: attribute,
        type: 'polyline',
        style: this.drawStyle,
        speed: this.formInfo.data.speed
      });
    },
    startEditing(entity) {
      // 获取鼠标点击处的实体
      let that = this;
      const draggers = entity.editing.draggers;
      draggers.forEach((dragger) => {
        if (dragger._pointType === 1) {
          dragger.onDragStart = function (target) {
            // console.log("target", target.index);
            that.pointIndex = target.index;
          };
        }
        dragger.onDragEnd = () => {
          // console.log("dragEnd");
          let _ele = document.getElementById('light' + this.pointIndex);
          if (_ele) _ele.scrollIntoView();
          window.clearTimeout(this.timer);
          this.timer = setTimeout(() => {
            this.pointIndex = null;
          }, 10000);
        };
      });
      DrawTool.startEditing(entity);
    },
    stopDraw() {
      DrawTool && DrawTool.stopDraw();
    },
    removeAll() {
      // console.log('DrawTool', DrawTool)
      DrawTool.deleteAll();
    },
    // isData 是否飞行传入路线
    fly(val, isData) {
      if (!isData) {
        this.currId = val;
        this.removeAll();
        commonInterface.roamDetail(val).then((res) => {
          this.flyData = {
            geometry: JSON.parse(res.geometry),
            name: res.name,
            id: res.id,
            properties: JSON.parse(res.properties),
            type: 'Feature'
          };
          this.curr_line = res.name;
          // console.log("路线详情", this.flyData);
          this.$refs.fly.init(this.flyData, Map3d);
        });
      } else {
        this.$refs.fly.init(val, Map3d);
      }
    },
    // 属性面板开始飞行
    startFly() {
      this.removeAll();
      this.saveData();
      this.$refs.fly.init(this.flyData, Map3d);
      // this.closeView();
      this.$emit('changeBookView', false);
    },
    editFly(id) {
      this.currId = id;
      this.roamId = id;
      this.isDisable = false;
      commonInterface.roamDetail(id).then((res) => {
        // console.log('路线详情', res)
        if (!res) {
          Message.error('当前没有漫游路线数据！');
          return;
        }
        this.flyData = {
          geometry: JSON.parse(res.geometry),
          name: res.name,
          id: res.id,
          properties: JSON.parse(res.properties),
          type: 'Feature'
        };
        this.curr_line = res.name;
        // console.log("flyData", this.flyData);
        currEntity = DrawTool._loadJson(this.flyData, true, true)[0];
        this.updateSpeed = this.flyData.properties.speed;
        this.formInfo.data = {
          batch: 0,
          unified: 0,
          speed: 100
        };
        this.formInfo1.data = this.flyData.properties.attr;
        DrawTool.startEditing(currEntity);
      });
    },
    delFlyIds() {
      if (this.delData.length === 0) {
        Message({
          message: '请勾选删除数据！',
          type: 'warning'
        });
        return;
      }
      this.$confirm('是否确定删除路线?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          let promiseArr = [];
          let delIds = this.delData.map((o) => o.id);
          delIds.forEach((id) => {
            promiseArr.push(commonInterface.delRoam(id));
          });
          Promise.all(promiseArr).then(() => {
            if (delIds.includes(this.currId)) {
              this.currId = null;
              this.$refs.fly.closeView();
            }
            this.roamId = null;
            this.removeAll();
            this.selectIndex = 0;
            this.isDisable = true;
            this.getList();
          });
        })
        .catch(() => {
          Message({
            message: '已取消删除!',
            type: 'info'
          });
        });
    },
    delFly(id) {
      this.$confirm('是否确定删除路线?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          commonInterface.delRoam(id).then(() => {
            if (id === this.currId) {
              this.currId = null;
              this.$refs.fly.closeView();
            }
            this.roamId = null;
            this.removeAll();
            this.selectIndex = 0;
            this.isDisable = true;
            this.getList();
          });
        })
        .catch(() => {
          Message({
            message: '已取消删除!',
            type: 'info'
          });
        });
    },
    handleClick(event, index, formData) {
      // console.log('formData', event, index, formData)
      let data = JSON.parse(JSON.stringify(formData));
      switch (event) {
        case 'addtem': {
          let add = this.objToArray(data);
          // console.log("index", index, add.length);
          let curPoint = add[index];
          let nextPoint, newPx, newPy, newPz;
          if (index + 1 === add.length) {
            // 最后一个点
            nextPoint = add[index - 1];
            newPx = 1.5 * curPoint[0] - nextPoint[0] / 2;
            newPy = 1.5 * curPoint[1] - nextPoint[1] / 2;
            newPz = 1.5 * curPoint[2] - nextPoint[2] / 2;
          } else {
            nextPoint = add[index + 1];
            newPx = (curPoint[0] + nextPoint[0]) / 2;
            newPy = (curPoint[1] + nextPoint[1]) / 2;
            newPz = (curPoint[2] + nextPoint[2]) / 2;
          }
          let newPoint = [
            Number(newPx.toFixed(6)),
            Number(newPy.toFixed(6)),
            Number(newPz.toFixed(2))
          ];
          add.splice(index + 1, 0, newPoint);
          // console.log('增加后的data', add)
          DrawTool.setPositions(lonlats2cartesians(add), currEntity);
          this.setTem(add, true);
          break;
        }
        case 'deltem': {
          let del = this.objToArray(data);
          del.splice(index, 1);
          // console.log("删除后的data",del);
          DrawTool.setPositions(lonlats2cartesians(del), currEntity);
          this.setTem(del, true);
          break;
        }
      }
    },
    // pageForm值改变
    handleEvent(data, event) {
      if (this.selectIndex === 1) {
        let _obj = JSON.parse(JSON.stringify(this.formInfo.temArr));
        switch (event) {
          case 'speed': // 统一修改速度
            if (!data.speed) return;
            this.isLonLat = true;
            this.formInfo.data.speed = data.speed;
            for (let i in _obj) {
              if (i.indexOf('speed') !== -1) {
                _obj[i] = data.speed;
              }
            }
            this.formInfo.temArr = _obj;
            this.updatelatlng(this.formInfo.temArr);
            // this.updateAttr();
            break;
          case 'batch': // 批量加
            if (!data.batch) return;
            this.formInfo.data.batch = data.batch;
            this.formInfo.data.unified = 0;
            for (let i in _obj) {
              if (i.indexOf('z') !== -1) {
                // _obj[i] += data.batch - this.oldBatch;
                _obj[i] += data.batch;
              }
            }
            this.formInfo.temArr = _obj;
            // this.oldBatch = data.batch;
            this.updatelatlng(_obj);
            break;
          case 'unified': // 统一改
            if (!data.unified) return;
            this.formInfo.data.unified = data.unified;
            this.formInfo.data.batch = 0;
            for (let i in _obj) {
              if (i.indexOf('z') !== -1) {
                _obj[i] = data.unified;
              }
            }
            this.formInfo.temArr = _obj;
            this.updatelatlng(_obj);
            break;
          default:
            // 修改坐标
            this.formInfo.temArr = data;
            this.updatelatlng(data);
            break;
        }
      } else if (this.selectIndex === 2) {
        this.formInfo1.data = data;
        this.updateAttr(); // 修改属性
        this.changeShowRoam(data.showHeightWarn, 'warnHeight');
        this.changeShowRoam(data.cameraType === 'dy', 'followedX');
        this.changeShowRoam(
          data.cameraType === 'dy' || data.cameraType === 'sd',
          'followedZ'
        );
      }
    },
    // 修改属性
    updateAttr() {
      let attribute = {
        attr: this.formInfo1.data,
        type: 'polyline',
        style: this.drawStyle,
        speed: this.updateSpeed
      };
      currEntity = DrawTool.updateAttribute(attribute, currEntity);
      // this.saveData();
    },
    // 修改坐标
    updatelatlng(data) {
      let coods = this.objToArray(data);
      this.updateSpeed = this.speedToArray(data);
      this.updateAttr();
      let positions = lonlats2cartesians(coods);
      DrawTool.setPositions(positions, currEntity);
      // this.saveData();
      DrawTool.startEditing(currEntity);
    },
    getCurrTime() {
      var myDate = new Date();
      var month = myDate.getMonth() + 1; // 月
      var day = myDate.getDate(); // 日
      var hour = myDate.getHours(); // 时
      var min = myDate.getMinutes(); // 分
      var seconds = myDate.getSeconds(); // 秒
      var str =
        this.zeroFill(month) +
        '' +
        this.zeroFill(day) +
        '' +
        this.zeroFill(hour) +
        '' +
        this.zeroFill(min) +
        '' +
        this.zeroFill(seconds);
      return str;
    },
    zeroFill(num) {
      return Number(num) < 10 ? '0' + num : num;
    },
    changeShowRoam(bool, value) {
      attr_list.forEach((ele) => {
        if (ele.value === value && bool) {
          ele.className = 'bfshow';
        } else if (ele.value === value && !bool) {
          ele.className = 'bfhide';
        }
      });
    },
    // form数据转为坐标数组
    objToArray(obj) {
      let result = [];
      for (let i in obj) {
        if (i.indexOf('x') !== -1) {
          let num = i.replace('x', '');
          let _arr = [obj[i], obj[`y${num}`], obj[`z${num}`]];
          result.push(_arr);
        }
      }
      return result;
    },
    speedToArray(data) {
      let result = [];
      for (let i in data) {
        // 修改速度
        if (i.indexOf('speed') !== -1) {
          result.push(data[i]);
        }
      }
      return result;
    },
    // 设置坐标列表
    setTem(_coods, isLonLat) {
      let coods = _coods;
      if (!isLonLat) {
        coods = cartesians2lonlats(_coods);
      }
      // console.log('===================', coods);
      class Tem {
        constructor() {
          // eslint-disable-next-line vue/no-mutating-props
          this.title = { name: '', showList: false };
          this.formList = [];
        }
      }
      if (
        this.updateSpeed.length > 0 &&
        this.updateSpeed.length < coods.length
      ) {
        // eslint-disable-next-line no-unused-vars
        for (let i in coods.length - this.updateSpeed.length) {
          this.updateSpeed.push(this.formInfo.data.speed);
        }
      }
      let tem_arr = [];
      let temObj = {};
      coods.forEach((value, index) => {
        if (
          this.formInfo.addtem.length === 0 ||
          this.formInfo.addtem.length !== coods.length
        ) {
          let tem = new Tem();
          tem.title = { name: `第${index + 1}点`, showList: false };
          let obj1 = {
            label: '经度',
            value: `x${index + 1}`,
            type: 'inputNumber',
            required: true,
            step: 0.000001
          };
          let obj2 = {
            label: '纬度',
            value: `y${index + 1}`,
            type: 'inputNumber',
            required: true,
            step: 0.000001
          };
          let obj3 = {
            label: '高程',
            value: `z${index + 1}`,
            type: 'inputNumber',
            required: true,
            step: 0.01
          };
          let obj4 = {
            label: '速度 \n km/h',
            value: `speed${index + 1}`,
            type: 'inputNumber',
            required: true,
            step: 1
          };
          tem.formList.push(obj1, obj2, obj3, obj4);
          tem_arr.push(tem);
        } else {
          tem_arr = this.formInfo.addtem;
        }

        temObj[`x${index + 1}`] = value[0];
        temObj[`y${index + 1}`] = value[1];
        temObj[`z${index + 1}`] = value[2];
        temObj[`speed${index + 1}`] =
          this.updateSpeed.length > 0
            ? this.updateSpeed[index]
            : this.formInfo.data.speed;
      });
      this.formInfo.temArr = temObj;
      this.formInfo.addtem = tem_arr;
      // console.log("temArr", this.formInfo.temArr);
    },
    // 保存数据
    saveData(isAdd) {
      this.flyData = DrawTool.toGeoJSON(currEntity);
      if (!this.flyData.properties.attr.name) {
        this.flyData.properties.attr.name = '' + this.getCurrTime();
      }
      this.flyData.name = this.flyData.properties.attr.name;
      let params = {
        geometry: JSON.stringify(this.flyData.geometry),
        name: this.flyData.name,
        properties: JSON.stringify(this.flyData.properties),
        type: this.flyData.geometry.type
      };
      this.curr_line = this.flyData.name;
      if (isAdd) {
        // 新增
        commonInterface.addRoam(params).then((res) => {
          // console.log("路线新增res", res);
          this.getList();
          this.roamId = res;
          if (this.isBookmark) {
            // this.$emit('addFly', this.roamId, this.flyData.name);
            this.$emit('addFly', this.roamId, this.flyData.name);
            let roamConfig = {
              isShow: true,
              roamId: this.roamId,
              selectIndex: 2,
              isDisable: false,
              isRemove: false
            };
            this.setRoamView(roamConfig);
          }
        });
      } else {
        // 修改
        params.id = this.roamId;
        commonInterface.editRoam(params).then(() => {
          // console.log("路线修改res", res);
          this.getList();
        });
      }
      // this.isShow = true;
      // this.isDisable = false;
    },
    // 下载数据
    download() {
      if (this.flyData === null) {
        Message.error('当前没有漫游路线数据！');
      } else {
        this.funDownload(
          JSON.stringify(this.flyData),
          this.flyData.name + '路线数据.json'
        );
      }
    },
    // 下载文件方法
    funDownload(content, filename) {
      var eleLink = document.createElement('a');
      eleLink.download = filename;
      eleLink.style.display = 'none';
      var blob = new Blob([content]);
      eleLink.href = URL.createObjectURL(blob);
      document.body.appendChild(eleLink);
      eleLink.click();
      document.body.removeChild(eleLink);
    },
    // 关闭窗口
    closeView() {
      this.changeShow(false);
    },
    openView() {
      this.changeShow(this.isShow);
    },
    // 高亮当前行
    tableRowClassName({ row }) {
      if (row.id === this.currId) {
        return 'highlight-row';
      }
      return '';
    },
    // 点击行
    rowClick(row) {
      this.editFly(row.id);
    },
    // 供外部调用得方法----------------------
    start() {
      this.$refs.fly.start();
    },
    suspend() {
      this.$refs.fly.suspend();
    },
    stop() {
      this.$refs.fly.stop();
    },
    backward() {
      this.$refs.fly.backward();
    },
    forward() {
      this.$refs.fly.forward();
    },
    cameraTypeChange(val) {
      this.$refs.fly.cameraTypeChange(val);
    },
    setComponentShow(val) {
      this.$refs.fly.setComponentShow(val);
    }
  }
};
</script>
