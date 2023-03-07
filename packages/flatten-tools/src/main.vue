<template>
  <div v-show="shouldShow" class="sh-flatten-tools">
    <general-container
      :is-show.sync="visible"
      :title="title ? title : '开挖压平'"
      :img-src="imgSrc ? imgSrc : 'flatten-tools'"
      :berth="berth"
      :style-config="styleConfig"
      :position="position"
      :theme="theme"
      :drag-enable="dragEnable"
      :append-to-body="appendToBody"
      :theme-style="cardThemeStyle"
      :only-container="onlyContainer"
      @change:isShow="onChangeIsShow"
    >
      <div class="clip_content">
        <div class="clip_layers" :class="{ more: select_layers.length == 1 }">
          <span class="layers_label">关联图层:</span>
          <el-select
            v-model="selectLayers"
            popper-class="bff"
            size="mini"
            multiple
            collapse-tags
            placeholder="请选择关联图层"
            @change="changeTileset()"
          >
            <el-option
              v-for="item in layerArr"
              :key="item.value"
              :label="item.label"
              :value="item.id"
              :disabled="item.disabled"
            >
            </el-option>
          </el-select>
        </div>
        <div class="clip_list" onselectstart="return false;">
          <el-table
            :data="tableData"
            border
            :max-height="564"
            :row-class-name="tableRowClassName"
            @row-click="rowClick"
          >
            <el-table-column
              label="高度(m)"
              align="center"
              prop="height"
              min-width="60"
              :show-overflow-tooltip="true"
            >
              <template slot-scope="scope">
                {{
                  !scope.row.flattenType || scope.row.terrainType === 'flatten'
                    ? scope.row.height
                    : 0
                }}
              </template>
            </el-table-column>
            <el-table-column
              prop="flattenType"
              label="类型"
              width="78"
              align="center"
            >
              <template slot-scope="scope">
                <el-switch
                  v-model="scope.row.flattenType"
                  :disabled="JSON.parse(scope.row.layers).length == 0"
                  :active-text="
                    JSON.parse(scope.row.layers).length == 0 ? '禁用' : '开挖'
                  "
                  :inactive-text="
                    JSON.parse(scope.row.layers).length == 0 ? '禁用' : '压平'
                  "
                  :active-color="
                    JSON.parse(scope.row.layers).length == 0
                      ? '#848484'
                      : '#13ce66'
                  "
                  :inactive-color="
                    JSON.parse(scope.row.layers).length == 0
                      ? '#848484'
                      : '#ff4949'
                  "
                  :width="55"
                  @change="changeType(scope.row)"
                >
                </el-switch>
              </template>
            </el-table-column>
            <el-table-column
              prop="flattenType"
              label="地形"
              width="78"
              align="center"
            >
              <template slot-scope="scope">
                <el-select
                  v-model="scope.row.terrainType"
                  popper-class="bff"
                  :class="{
                    flatten: scope.row.terrainType === 'flatten',
                    disable: scope.row.terrainType === 'disable'
                  }"
                  size="mini"
                  @change="changeTerrainType(scope.row)"
                >
                  <el-option
                    v-for="(item, index) in terrainTypeArr"
                    :key="index"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              align="center"
              width="50"
              class-name="small-padding fixed-width cell-img"
            >
              <template slot-scope="scope">
                <div>
                  <span :title="scope.row.isShow ? '显示' : '隐藏'">
                    <icon-svg
                      :icon-class="scope.row.isShow ? 'display' : 'hide'"
                      style="cursor: pointer"
                      @click.native.stop="handleShow(scope.row)"
                    ></icon-svg>
                  </span>
                  <span title="定位">
                    <icon-svg
                      icon-class="coordinate-location"
                      style="cursor: pointer"
                      @click.native.stop="handleLocation(scope.row)"
                    ></icon-svg>
                  </span>
                </div>
                <div style="margin-left: 5px">
                  <span title="编辑">
                    <icon-svg
                      icon-class="edit"
                      style="cursor: pointer"
                      :fillcolor="scope.row.enabled ? '#00FFFF' : '#fff'"
                      @click.native.stop="handleEdit(scope.row)"
                    ></icon-svg>
                  </span>
                  <span title="删除">
                    <icon-svg
                      icon-class="delete"
                      style="cursor: pointer"
                      @click.native.stop="
                        handleDelete(scope.row, scope.row.flattenType)
                      "
                    ></icon-svg>
                  </span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="btnBox">
          <div class="btn" @click="startClip()">新增</div>
          <div class="btn" @click="save()">保存</div>
          <div class="btn" @click="delPlane()">清空</div>
        </div>
      </div>
    </general-container>
  </div>
</template>

<script>
import { Draw } from 'shinegis-client-23d/src/earth-core/Entry57';
import * as DrawEventType from 'shinegis-client-23d/src/earth-core/Draw/EventType7';
import { FlattenTools } from 'shinegis-client-23d/src/earth-core/Widget/FlattenTools';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import { cartesian2lonlat } from 'shinegis-client-23d/src/earth-core/Tool/Util3';
import { CommonInterface } from './api.js';
import common from 'shinegis-client-23d/src/mixins/common';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import { Message } from 'element-ui';

let Map3d, currPlane, flattenTools, drawTool;
let layer3dtilesArr = [];
let attribute = {
  type: 'polygon',
  style: {
    color: '#ffffff',
    opacity: 0.2,
    outline: true,
    outlineWidth: 5,
    outlineColor: '#FF0000',
    clampToGround: false,
    zIndex: 0
  },
  config: { height: false, isSameHeight: false, isFlatten: true },
  attr: { isClip: true, id: '' }
};
let commonInterface;

export default {
  name: 'ShFlattenTools',
  components: {
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
    },
    isCustom: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      shouldShow: false,
      layer3dtiles: [],
      selectLayers: [],
      selecLayerIds: [],
      checkedLayers: [],
      lastChecked: [],
      tableData: [
        // {
        //   enabled: false,
        //   flattenType: true,
        //   height: 0,
        //   id: '15a3ac2c2905eeab5f3ca360140f136e',
        //   isShow: true,
        //   positions:
        //     '[{"x":-2790621.0279647154,"y":4730989.968724392,"z":3231180.0630312534},{"x":-2790657.2274267715,"y":4731180.988119198,"z":3230870.9915452804},{"x":-2790850.116181375,"y":4731088.89746368,"z":3230836.8699614345},{"x":-2791079.435191602,"y":4730907.732661543,"z":3230923.7834731145},{"x":-2790955.2723017866,"y":4730907.936227367,"z":3231060.140582985},{"x":-2790780.361411082,"y":4730911.540502249,"z":3231189.9052080843}]',
        //   terrainType: 'clipping', // clipping(开挖)、flatten(压平)、disable(禁用)
        //   layers:
        //     '[{"id":"e8fd1af1-776f-ffb5-5a62-a17bc9844921","label":"3D建筑tiles"},{"id":"ccdc5e71-d8d7-eb6f-49d2-217c104af1eb","label":"桐乡控规tiles"}]'
        // }
      ],
      terrainTypeArr: [
        {
          label: '开挖',
          value: 'clipping'
        },
        {
          label: '压平',
          value: 'flatten'
        },
        {
          label: '禁用',
          value: 'disable'
        }
      ],
      allData: [],
      pageSize: 100,
      pageNum: 1,
      hasTerrain: false,
      currRowId: null,
      itemLayers: [],
      editId: '',
      edited: false
    };
  },
  computed: {
    layerArr() {
      let arr = [...this.itemLayers, ...this.layer3dtiles];
      let obj = {};
      let uniqueArr = arr.reduce((item, next) => {
        obj[next.id] ? '' : (obj[next.id] = true && item.push(next));
        return item;
      }, []);
      let checkedIds = this.layer3dtiles.map((o) => o.id);
      uniqueArr.forEach((item) => {
        if (!checkedIds.includes(item.id)) {
          item.disabled = true;
        } else {
          item.disabled = false;
        }
      });
      return uniqueArr;
    },
    select_layers: {
      get() {
        let selectIds = this.selecLayerIds;
        let arr = [];
        this.layerArr.forEach((item) => {
          if (selectIds.includes(item.id) && !item.disabled) {
            arr.push(item.id);
          }
        });
        return arr;
      },
      set() {}
    }
  },
  watch: {
    currentView: {
      handler(val) {
        this.shouldShow = val === 'earth';
      },
      immediate: true
    },
    checkedLayers: {
      handler(newVal) {
        if (newVal !== this.lastChecked && !this.isCustom) {
          let changeItem;
          let newIds = newVal.map((o) => o.id);
          let lastIds = this.lastChecked.map((e) => e.id);
          if (this.lastChecked.length > newVal.length) {
            changeItem = this.lastChecked.filter(
              (item) => !newIds.includes(item.id)
            );
          } else {
            changeItem = newVal.filter((item) => !lastIds.includes(item.id));
          }
          let types = changeItem.map((t) => t.type);
          if (!types.includes('3dtiles') && !types.includes('I3S')) return;
          let arr = [];
          layer3dtilesArr = newVal.filter(
            (ele) => ele.type === '3dtiles' || ele.type === 'I3S'
          );
          layer3dtilesArr.map((item) => {
            let obj = {};
            obj.label = item.label;
            obj.id = item.id;
            arr.push(obj);
          });
          this.layer3dtiles = arr;
        }
        this.lastChecked = JSON.parse(JSON.stringify(newVal));
      },
      deep: true
    },
    select_layers: function (newVal) {
      this.selectLayers = newVal;
    },
    selectLayers: function (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (flattenTools && this.visible) flattenTools.clipArr(this.tableData);
      }
    }
  },
  mounted() {
    if (this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    onChangeIsShow(val) {
      this.$emit('change:isShow', val);
      if (!val) {
        if (this.edited) {
          this.$confirm('是否保存开挖压平最新修改？', '提示', {
            confirmButtonText: '保存',
            cancelButtonText: '不保存',
            type: 'warning'
          })
            .then(() => {
              this.save('已保存开挖压平最新修改');
            })
            .catch(() => {});
        }
        drawTool.deleteAll();
        currPlane = null;
        this.stopDraw();
        flattenTools.clipArr([]);
      } else {
        if (!this.isCustom) {
          this.initData();
        }
      }
    },
    begin() {
      Map3d = this.$earth.viewer;
      this.initDraw();
      // 初始化加载数据
      if (!this.isCustom && this.isShow) {
        this.initData();
      }
      // this.initData();
    },
    initDraw() {
      let that = this;
      this.checkedLayers = Map3d.shine.layerManager.checkedLayers;
      let options = {
        // hasEdit: true,
        hasEdit: false,
        horizontalBar: false,
        labelShow: true,
        polygonShow: true,
        polylineShow: true,
        showToolbar: true,
        verticalBar: true
      };
      drawTool = new Draw(Map3d, options);
      drawTool.on('change:active', (e) => {
        this.$emit('change:active', e.active);
      });

      let dataSource = drawTool.getDataSource();
      flattenTools = new FlattenTools(Map3d, dataSource);

      drawTool.on(DrawEventType.DrawCreated, function (e) {
        currPlane = e.entity;
        let rowLayers = [];
        let allLayers = JSON.parse(JSON.stringify(that.layerArr));
        allLayers.forEach((ele) => {
          if (that.selectLayers.includes(ele.id)) {
            let obj = {
              id: ele.id,
              label: ele.label
            };
            rowLayers.push(obj);
          }
        });
        let obj = {
          flattenType: true,
          isShow: true,
          enabled: false,
          height: cartesian2lonlat(currPlane._positions_draw[0])[2],
          positions: JSON.stringify(currPlane._positions_draw),
          schemaId: that.schemeId,
          terrainType: 'clipping',
          id: currPlane.id,
          layers: JSON.stringify(rowLayers)
        };
        that.tableData.push(obj);
        let newAttr = {
          type: 'polygon',
          style: attribute.style,
          config: attribute.config,
          attr: { isClip: true, id: currPlane.id }
        };
        drawTool.updateAttribute(newAttr, currPlane);
        // console.log('obj', that.tableData);
        that.toClip();
        commonInterface.saveFlatten(obj).then(() => {
          Message({
            message: '新增成功',
            type: 'success'
          });
        });
      });
      // 开始编辑
      drawTool.on(DrawEventType.EditStart, function (e) {
        currPlane = e.entity;
        that.startEditing();
      });
      // 编辑
      drawTool.on(DrawEventType.EditMovePoint, function (e) {
        currPlane = e.entity;
        that.startEditing();
      });
      // 删除
      drawTool.on(DrawEventType.EditRemovePoint, function (e) {
        currPlane = e.entity;
        that.startEditing();
        let position = currPlane._positions_draw;
        flattenTools.updateFlattenPolygon(position, currPlane);
      });
    },
    // 初始化加载数据
    initData() {
      commonInterface = new CommonInterface(
        this.url,
        this.token,
        this.fastApplicationId,
        this.schemeId
      );
      this.initList();
    },
    // 初始化数据
    initList() {
      let data = {
        schemaId: this.schemeId,
        current: this.pageNum,
        size: this.pageSize
      };
      commonInterface.getFlattenList(data).then((res) => {
        let arr = res.records;
        arr.forEach((ele) => {
          let dataOptions = {
            type: 'polygon',
            style: attribute.style,
            config: attribute.config,
            attr: { isClip: true, id: ele.id }
          };
          let entity = drawTool.attributeToEntity(
            dataOptions,
            JSON.parse(ele.positions)
          );
          entity.show = ele.isShow;
        });
        this.tableData = arr.reverse();
        this.toClip();
      });
    },
    // 保存列表
    save(str) {
      commonInterface.saveList(this.tableData).then(() => {
        Message({
          message: str || '保存成功!',
          type: 'success'
        });
      });
    },
    // 绘制
    startDraw() {
      drawTool.startDraw(attribute);
    },
    // 拖拽
    startEditing() {
      //if (!currPlane.editing) return;
      //const draggers = currPlane.editing.draggers;
      let func = () => {
        let index = this.tableData.findIndex((item) => item.id === this.editId);
        let entity = drawTool.getEntityById(this.editId);
        let currRow = { ...this.tableData[index] };
        currRow.positions = JSON.stringify(entity._positions_draw);
        this.tableData.splice(index, 1, currRow);
        flattenTools.clipArr(this.tableData);
      };
      func.id = 'flatten';
      //防止重复添加
      let exist = drawTool._events['drag-end']?.find(
        (e) => e.fn.id === 'flatten'
      );
      !exist && drawTool.on('drag-end', func);
    },
    startClip() {
      this.startDraw();
    },
    // 选择tileset
    changeTileset() {
      if (!this.currRowId) return;
      let index = this.tableData.findIndex(
        (item) => item.id === this.currRowId
      );
      if (index === -1) return;
      let currRow = { ...this.tableData[index] };
      let rowLayers = [];
      let allLayers = JSON.parse(JSON.stringify(this.layerArr));
      allLayers.forEach((ele) => {
        if (this.selectLayers.includes(ele.id)) {
          let obj = {
            id: ele.id,
            label: ele.label
          };
          rowLayers.push(obj);
        }
      });
      currRow.layers = JSON.stringify(rowLayers);
      this.tableData.splice(index, 1, currRow);
      // console.log('currRow', currRow);
    },
    // 裁切
    toClip() {
      // if (!currPlane) return;
      flattenTools.clipArr(this.tableData);
    },
    changeTerrainType(row) {
      this.edited = true;
      flattenTools.clipArr(this.tableData);
      this.disableEdit(row);
    },
    changeType(row) {
      this.edited = true;
      flattenTools.clipArr(this.tableData);
      this.disableEdit(row);
    },
    // 显隐
    handleShow(row) {
      row.isShow = !row.isShow;
      let entity = drawTool.getEntityById(row.id);
      entity.show = !entity.show;
      this.disableEdit(row);
    },
    // 编辑
    handleEdit(row) {
      this.edited = true;
      let entity = drawTool.getEntityById(row.id);
      this.editId = row.id;
      if (!entity.editing._enabled) {
        let editIndex = this.tableData.findIndex((ele) => ele.enabled === true);
        // 禁用已存在编辑状态
        if (editIndex > -1) {
          let editData = this.tableData[editIndex];
          let editEntity = drawTool.getEntityById(editData.id);
          editEntity.editing.disable();
          this.removeHeightDraggers(editEntity);
          editData.enabled = false;
          this.tableData.splice(editIndex, 1, editData);
        }
        // 进入编辑状态
        entity.editing.activate();
        row.enabled = true;
        // 压平 创建高度拖拽点
        if (!row.flattenType || row.terrainType === 'flatten') {
          flattenTools.createHeightDragger(entity, row.height);
          const draggers = entity.editing.newHeightDraggers;
          draggers.forEach((dragger) => {
            dragger.onDragEnd = (dragger, position) => {
              let index = this.tableData.findIndex(
                (item) => item.id === this.editId
              );
              let currRow = { ...this.tableData[index] };
              currRow.height = cartesian2lonlat(position)[2];
              currRow.positions = JSON.stringify(entity._positions_draw);
              this.tableData.splice(index, 1, currRow);
              flattenTools.clipArr(this.tableData);
            };
          });
          this.startEditing();
        }
      } else {
        this.disableEdit(row);
      }
    },
    // 取消编辑状态
    disableEdit(row) {
      let entity = drawTool.getEntityById(row.id);
      entity.editing.disable();
      row.enabled = false;
      this.removeHeightDraggers(entity);
    },
    // 删除
    handleDelete(row, type) {
      this.$confirm(
        '确认删除该' + (type ? '开挖' : '压平') + '多边形？',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        commonInterface.deleteFlatten(row.id).then(() => {
          let entity = drawTool.getEntityById(row.id);
          this.removeHeightDraggers(entity);
          drawTool.deleteEntity(entity);
          let index = this.tableData.findIndex((item) => item.id === row.id);
          this.tableData.splice(index, 1);
          Message({
            message: '删除成功!',
            type: 'success'
          });
          flattenTools.clipArr(this.tableData);
        });
      });
    },
    // 清除
    delPlane() {
      this.$confirm('确认删除全部？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        let ids = this.tableData.map((o) => o.id);
        commonInterface.removeList(ids).then(() => {
          drawTool.deleteAll();
          currPlane = null;
          this.tableData = [];
          Message({
            message: '清空成功!',
            type: 'success'
          });
          flattenTools.clipArr(this.tableData);
        });
      });
    },
    // 定位
    handleLocation(row) {
      let positions = JSON.parse(row.positions);
      let extent = Map3d.shine.getGraphicExtent(positions);
      Map3d.shine.centerAt(extent);
    },
    // 去除高度拖拽点
    removeHeightDraggers(entity) {
      let dataSource = drawTool.getDataSource();
      let heightDraggers = entity.editing.newHeightDraggers || [];
      for (let n = 0, len = heightDraggers.length; n < len; n++) {
        dataSource.entities.remove(heightDraggers[n]);
      }
      entity.editing.newHeightDraggers = [];
    },
    stopDraw() {
      drawTool && drawTool.stopDraw();
    },
    // 高亮当前行
    tableRowClassName({ row }) {
      if (row.id === this.currRowId) {
        return 'highlight-row';
      }
      return '';
    },
    // 点击行
    rowClick(row) {
      this.currRowId = row.id;
      this.itemLayers = JSON.parse(row.layers);
      this.selecLayerIds = this.itemLayers.map((item) => item.id);
    },
    // 供外部调用的方法-------
    // Cesium3DTileset
    activateTileset(tilesets, positions, type) {
      flattenTools.toClip(tilesets, positions, type);
    },
    deleteTilesetPolygon(tilesets, index) {
      if (!index) {
        flattenTools.deleteAll(tilesets);
      } else {
        flattenTools.deleteFlattenPolygon(tilesets, index);
      }
    },
    activateTerrain(positions, type) {
      flattenTools.terrainClip(positions, type);
    },
    deleteTerrainPolygon(index) {
      if (!index) {
        flattenTools.deleteAllTerrain();
      } else {
        flattenTools.deleteIndexTerrain(index);
      }
    },
    locatePolygon(positions) {
      flattenTools.centerAt(positions);
    },
    clipTilesetByGeojson(GeoJSON, opts) {
      flattenTools.toClip(opts.tilesets, GeoJSON, 'clipping', true);
    },
    flattenTilesetByGeojson(GeoJSON, opts) {
      flattenTools.toClip(opts.tilesets, GeoJSON, 'flatten', true, opts.height);
    },
    clipTerrainByGeojson(GeoJSON) {
      flattenTools.terrainClip(GeoJSON, 'clipping', true);
    },
    flattenTerrainByGeojson(GeoJSON, opts) {
      flattenTools.terrainClip(GeoJSON, 'flatten', true, opts.height);
    }
  }
};
</script>
