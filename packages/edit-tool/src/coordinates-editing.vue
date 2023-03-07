<template>
  <div id="CoordinatesEditingCard" class="sh-edit-tool-coordinates">
    <el-table
      ref="singleTable"
      :data="tableData"
      max-height="400"
      border
      highlight-current-row
      :row-style="{ height: '40px' }"
      :cell-style="{ padding: '0px' }"
      style="width: 100%; font-size: 14px"
      @row-click="clickRow"
    >
      <el-table-column align="center" label="X坐标">
        <template slot-scope="scope">
          <span v-if="scope.row.isSave">{{ scope.row.X }}</span>
          <span v-else>
            <!-- <el-input v-model=scope.row.X @blur="resetFeature"></el-input> -->
            <el-input v-model="scope.row.X" type="number"></el-input>
          </span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="Y" label="Y坐标">
        <template slot-scope="scope">
          <span v-if="scope.row.isSave">{{ scope.row.Y }}</span>
          <span v-else>
            <el-input v-model="scope.row.Y" type="number"></el-input>
          </span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.isSave"
            type="primary"
            size="mini"
            icon="el-icon-edit"
            title="编辑"
            circle
            @click="editPointCoords(scope.$index)"
          ></el-button>
          <el-button
            v-else
            type="success"
            size="mini"
            icon="el-icon-check"
            title="保存"
            circle
            @click="savePointCoords(scope.$index, scope.row)"
          ></el-button>
          <el-button
            type="danger"
            size="mini"
            icon="el-icon-delete"
            title="删除"
            circle
            @click="removePointCoords(scope.$index)"
          ></el-button>
          <el-button
            type="success"
            size="mini"
            icon="el-icon-plus"
            title="新增"
            circle
            @click="addPointCoords(scope.$index)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import $ from 'jquery';
import Bus from 'shinegis-client-23d/src/utils/bus';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { Message } from 'element-ui';
//import FeatureSave from '../Save/Save.js'

export default {
  name: 'ShCoordinatesEditing',
  mixins: [common, emitter],
  data() {
    return {
      selectFeature: undefined,
      tableData: [],
      initEditCoord: [],
      prevStepDisabled: true, // 上一步按钮禁用状态
      nextStrpDisabled: true, // 下一步按钮禁用状态
      firstReset: true, // 是否第一次重置，用来设置上下一步禁用状态
      saveDisabled: false, // 保存按钮禁用状态
      removeOperation: false,
      addOperation: false
    };
  },
  watch: {
    tableData(newValue, oldValue) {
      if (this.removeOperation) {
        this.removeOperation = false;
      } else if (this.addOperation) {
        this.addOperation = false;
      } else {
        this.previousData = oldValue;
      }
    },
    prevStepDisabled(newValue) {
      this.$emit('update:prevStepDisabledCopy', newValue);
    },
    nextStrpDisabled(newValue) {
      this.$emit('update:nextStrpDisabledCopy', newValue);
    }
  },
  mounted() {
    Bus.$on('startFeatureEditing', (options) => {
      // let selectedFeatures = select.getFeatures()
      // console.log(selectedFeatures)
      // if (selectedFeatures.getLength() > 0) {
      //   // 因为编辑中的 select功能只能单选，所以当有选中时即为开始编辑，删除时即结束当前编辑
      //   //e.element.layerTag = this.$map.getCurrentEditLayer().layerTag
      //   //每次切换
      //   this.tableData = []
      //   this.selectFeature = selectedFeatures.getArray()[0]
      //   this.initEditCoord = this.selectFeature.getGeometry().getCoordinates()
      //   let coordinates = this.getCoordinates(this.selectFeature)
      //   coordinates.forEach(coordinate => {
      //     this.tableData.push({
      //       X: coordinate[0].toFixed(6),
      //       Y: coordinate[1].toFixed(6),
      //       isSave: true
      //     })
      //   })
      //   // 设置当前编辑feature选中，保存时使用
      //   this.$map.setSelectFeatures(selectedFeatures)
      // }
      if (options.type === 'edit') {
        this.select = options.select;
        this.modify = options.modify;
        this.selectedFeatures = this.select.getFeatures();
        this.modify.on('modifyend', (e) => {
          let feature = e.features.getArray()[0];
          let coordinates = this.getCoordinates(feature);
          this.tableData = [];
          coordinates.forEach((coordinate) => {
            this.tableData.push({
              X: coordinate[0].toFixed(6),
              Y: coordinate[1].toFixed(6),
              isSave: true
            });
          });
          let editingCoordinate = e.mapBrowserEvent.coordinate;
          let selectedIndex;
          $.each(this.tableData, (index, coord) => {
            if (
              coord.X === editingCoordinate[0].toFixed(6) &&
              coord.Y === editingCoordinate[1].toFixed(6)
            ) {
              selectedIndex = index;
              return false;
            }
          });
          // 设置目标行选中
          this.setCurrent(selectedIndex);
          this.prevStepDisabled = false;
          this.nextStrpDisabled = true;
        });
      }
    });
  },
  methods: {
    /**
     * 重新初始化所有数据
     */
    resetData() {
      this.selectedFeatures = undefined;
      this.tableData = [];
      this.prevStepDisabled = true;
      this.nextStrpDisabled = true;
      this.saveDisabled = true;
      this.removeOperation = false;
      this.addOperation = false;
    },
    /**
     * 获取feature的坐标数组
     */
    getCoordinates(feature) {
      let coordinates = [];
      let geom = feature.getGeometry();
      let type = geom.getType();
      if (type.toUpperCase() === 'MULTIPOLYGON') {
        coordinates = feature.getGeometry().getCoordinates()[0][0];
        if (
          coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
          coordinates[0][1] === coordinates[coordinates.length - 1][1]
        ) {
          coordinates.splice(coordinates.length - 1, 1);
        }
      } else if (type.toUpperCase() === 'POLYGON') {
        coordinates = feature.getGeometry().getCoordinates()[0];
        if (
          coordinates[0][0] === coordinates[coordinates.length - 1][0] &&
          coordinates[0][1] === coordinates[coordinates.length - 1][1]
        ) {
          coordinates.splice(coordinates.length - 1, 1);
        }
      } else if (type.toUpperCase() === 'LINESTRING') {
        coordinates = feature.getGeometry().getCoordinates();
      } else if (type.toUpperCase() === 'MULTILINESTRING') {
        coordinates = feature.getGeometry().getCoordinates()[0];
      } else if (type.toUpperCase() === 'POINT') {
        coordinates = [feature.getGeometry().getCoordinates()];
      }
      return coordinates;
    },
    /**
     * 选中表格中目标行
     * @method clone
     */
    setCurrent(index) {
      this.$refs.singleTable.setCurrentRow(this.tableData[index]);
    },
    /**
     * 复制数组
     * @method clone
     */
    clone() {
      let arr = [];
      this.tableData.forEach((item) => {
        arr.push({
          X: item.X,
          Y: item.Y,
          isSave: item.isSave
        });
      });
      return arr;
    },
    /**
     * 点击上一步、下一步按钮触发此方法
     * 此处的中心思想是监听tableData的变化，将上一次的数据记录下来(删除节点单独处理)
     * 通过控制上一步或下一步的禁用状态，实现数据的交替赋值
     * @method clickStep
     */
    clickStep() {
      if (this.prevStepDisabled) {
        this.prevStepDisabled = false;
        this.nextStrpDisabled = true;
      } else {
        this.prevStepDisabled = true;
        this.nextStrpDisabled = false;
      }
      this.tableData = this.previousData;
      this.resetFeature();
    },
    editPointCoords(index) {
      this.previousData = this.clone();
      this.tableData[index].isSave = false;
      this.saveDisabled = true;
    },
    addPointCoords(index) {
      this.addOperation = true;
      this.previousData = this.clone();
      this.tableData.splice(index + 1, 0, {
        X: '',
        Y: '',
        isSave: false
      });
    },
    savePointCoords(index, value) {
      if (value.X.trim() === '') {
        Message({
          type: 'warning',
          message: '输入的X坐标不能为空'
        });
        return;
      }
      if (value.Y.trim() === '') {
        Message({
          type: 'warning',
          message: '输入的Y坐标不能为空'
        });
        return;
      }
      this.tableData[index].isSave = true;
      this.prevStepDisabled = false;
      this.nextStrpDisabled = true;
      this.saveDisabled = false;
      this.resetFeature();
    },
    resetFeature() {
      let curFeature = this.selectFeature;
      let geometryType = curFeature.getGeometry().getType();
      let coordinates = [];
      this.tableData.forEach((row) => {
        if (row.X && row.Y) {
          coordinates.push([Number(row.X), Number(row.Y)]);
        }
      });
      coordinates.push(coordinates[0]);
      if (geometryType.toUpperCase() === 'MULTIPOLYGON') {
        curFeature.getGeometry().setCoordinates([[coordinates]]);
      } else if (geometryType.toUpperCase() === 'POLYGON') {
        curFeature.getGeometry().setCoordinates([coordinates]);
      } else if (geometryType.toUpperCase() === 'LINESTRING') {
        curFeature.getGeometry().setCoordinates(coordinates);
      } else if (geometryType.toUpperCase() === 'POINT') {
        curFeature.getGeometry().setCoordinates(coordinates[0]);
      }
      this.$map.refresh();
    },
    removePointCoords(index) {
      this.$confirm('是否确定删除该节点？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        closeOnPressEscape: false
      })
        .then(() => {
          this.removeOperation = true;
          this.previousData = this.clone();
          this.tableData.splice(index, 1);
          this.prevStepDisabled = false;
          this.nextStrpDisabled = true;
          this.saveDisabled = false;
          this.resetFeature();
        })
        .catch((error) => {
          console.error(error);
        });
    },
    /**
     * 保存
     */
    saveFeature() {
      /* let saveWidget = new FeatureSave(this.shinemap.map)
         saveWidget.init()*/
    },
    /**
     * 点击编辑面板
     * 对应的节点闪烁
     * @method clickRow
     */
    clickRow(row) {
      let tempLayer = this.$map.getLayerById('drawLayer');
      let targetCoord = $(this.tableData).filter((index, data) => {
        return data.X === row.X && data.Y === row.Y;
      });
      if (targetCoord.length > 0) {
        // 添加闪烁效果
        let i = 0;
        let newFeature = new Feature();
        let shinePoint = new Point([targetCoord[0].X, targetCoord[0].Y]);
        newFeature.setGeometry(shinePoint);
        let add = () => {
          tempLayer.getSource().addFeature(newFeature);
          setTimeout(remove, 300);
        };
        let remove = () => {
          tempLayer.getSource().removeFeature(newFeature);
          i++;
          if (i < 2) {
            setTimeout(add, 300);
          }
        };
        add();
      }
    },

    startEdit(selectedFeatures) {
      if (selectedFeatures.getLength() > 0) {
        // 因为编辑中的 select功能只能单选，所以当有选中时即为开始编辑，删除时即结束当前编辑
        //e.element.layerTag = this.$map.getCurrentEditLayer().layerTag
        //每次切换
        this.tableData = [];
        this.selectFeature = selectedFeatures.getArray()[0];
        this.initEditCoord = this.selectFeature
          .getGeometry()
          .getCoordinates()
          .slice();
        let coordinates = this.getCoordinates(this.selectFeature);
        coordinates.forEach((coordinate) => {
          this.tableData.push({
            X: coordinate[0].toFixed(6),
            Y: coordinate[1].toFixed(6),
            isSave: true
          });
        });
        // 设置当前编辑feature选中，保存时使用
        this.$map.setSelectFeatures(selectedFeatures.getArray());
      }
    },

    getState() {
      let isSave = true;
      for (let item of this.tableData) {
        if (item.isSave === false) {
          isSave = false;
          break;
        }
      }
      return isSave;
    }
  }
};
</script>
