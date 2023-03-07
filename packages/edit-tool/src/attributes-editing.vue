<template>
  <div id="AttributesEditingCard">
    <el-table
      ref="singleTable"
      :data="filterTableData"
      max-height="400"
      border
      highlight-current-row
      :row-style="{ height: '40px' }"
      :cell-style="cellStyle"
      style="width: 100%; font-size: 14px"
    >
      <el-table-column align="center" prop="key" label="属性">
      </el-table-column>
      <el-table-column align="center" prop="value" label="数值">
        <template slot-scope="scope">
          <span v-if="scope.row.isEditing">
            <el-input v-model="scope.row.value" @blur="closeEdit(scope.$index)">
            </el-input>
          </span>

          <span
            v-else
            style="width: 100%; display: block; height: 23px"
            @click="editAttribute(scope.$index)"
            >{{ scope.row.value }}</span
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'ShAttributesEditing',
  data() {
    return {
      map: null,
      tableData: []
    };
  },
  computed: {
    filterTableData() {
      return this.tableData.filter((item) => {
        if (item.key === 'ISSELECTED') {
          return false;
        } else {
          //item.value = item.value === null ? '' : item.value;
          return !item.value || typeof item.value !== 'object';
        }
      });
    }
  },
  mounted() {
    //Bus.$on('startFeatureEditing', (select, modify) => {});
  },
  methods: {
    setMap(map) {
      this.map = map;
    },
    editAttribute(target) {
      this.filterTableData.forEach((element, index) => {
        if (index === target && element.canEdit) {
          element.isEditing = true;
        } else {
          element.isEditing = false;
        }
      });
    },
    closeEdit(index) {
      this.filterTableData[index].isEditing = false;
    },
    startEdit(selectedFeatures, initData) {
      let fieldArray = [];
      let valueArray = [];
      if (initData && initData.keyfield && initData.keyvalue) {
        fieldArray = initData.keyfield.toUpperCase().split(',');
        valueArray = initData.keyvalue.split(',');
      }
      this.tableData = [];
      if (selectedFeatures.getLength() > 0) {
        let feature = selectedFeatures.getArray()[0];
        for (let key in feature.getProperties()) {
          if (key !== feature.getGeometryName()) {
            let index = fieldArray.indexOf(key.toUpperCase());
            let value = feature.getProperties()[key];
            if (index > -1) {
              value = valueArray[index];
            }
            this.tableData.push({
              key: key?.toUpperCase(),
              value: value,
              isEditing: false,
              canEdit: index > -1 ? false : true
            });
          }
        }
      }
      selectedFeatures.on('remove', () => {
        this.tableData = [];
      });
    },
    getTableData() {
      return this.tableData;
    },
    cellStyle(row) {
      if (row.column.label === '属性') {
        return 'font-weight:bolder; padding:0;';
      } else {
        return 'padding:0';
      }
    }
  }
};
</script>

<style></style>
