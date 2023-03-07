<template>
  <div v-show="shouldShow" class="sh-file-export">
    <general-container
      ref="container"
      :is-show.sync="visible"
      :style-config="cardStyleConfig"
      :title="title ? title : '文件导出'"
      :img-src="imgSrc ? imgSrc : 'file-export'"
      :berth="berth"
      :position="position"
      :theme="theme"
      :theme-style="cardThemeStyle"
      :drag-enable="dragEnable"
      :append-to-body="appendToBody"
      :only-container="onlyContainer"
      @change:isShow="onChangeIsShow"
    >
      <div class="file-export-content">
        <el-form ref="form" label-width="90px" label-position="left">
          <el-form-item label="文件类型">
            <el-select v-model="fileType" size="small">
              <el-option
                v-for="item in fileTypes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="文件名称">
            <el-input v-model="fileName" size="small"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" @click="fileExportEvt"
              >导出
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </general-container>
  </div>
</template>

<script>
import FileExport from './FileExport.js';
import common from 'shinegis-client-23d/src/mixins/common';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import cardDrag from 'shinegis-client-23d/src/directives/card-drag';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import { Message } from 'element-ui';

export default {
  name: 'ShFileExport',
  components: {
    GeneralContainer: GeneralContainer
  },
  directives: { cardDrag },
  mixins: [common, generalCardProps, emitter],
  props: {
    url: {
      type: String
    },
    isToTransformProj: {
      type: Boolean,
      default: false
    },
    imgIconConfig: {
      type: Object
    },
    fileTypes: {
      type: Array,
      default: () => [
        {
          label: '国土资源部标准格式(*.txt)',
          value: 'GTJZD|.txt'
        },
        {
          label: 'Shp文件',
          value: 'SHP|.shp'
        },
        {
          label: 'AutoCAD DXF文件(*.dxf)',
          value: 'DXF|.dxf'
        },
        {
          label: 'AutoCAD DWG文件(*.dwg)',
          value: 'DWG|.dwg'
        },
        {
          label: '浙江省国土资源厅文件(*.txt)',
          value: 'ZJSGTZYT|.txt'
        },
        {
          label: '自定义文件(*.txt)',
          value: 'ZDY|.txt'
        }
      ]
    }
  },
  data() {
    return {
      typeConfig: {
        size: {
          radius: '4px',
          width: '320px',
          height: '80vh'
        }
      },
      isComponentShow: true,
      fileName: '',
      projection: '',
      exportTestIsShow: true,
      projectionSelectIsShow: false,
      fileType: 'GTJZD|.txt',
      text:
        this.imgIconConfig && this.imgIconConfig.text
          ? this.imgIconConfig.text
          : '导出',
      fontSizeValue:
        this.imgIconConfig && this.imgIconConfig.fontSize
          ? this.imgIconConfig.fontSize
          : '14px',
      fontColor:
        this.imgIconConfig && this.imgIconConfig.fontColor
          ? this.imgIconConfig.fontColor
          : '#fff',
      imgIcon:
        this.imgIconConfig && this.imgIconConfig.img
          ? this.imgIconConfig.img
          : '',
      width:
        this.imgIconConfig && this.imgIconConfig.width
          ? this.imgIconConfig.width
          : 16,
      height:
        this.imgIconConfig && this.imgIconConfig.height
          ? this.imgIconConfig.height
          : 16
    };
  },
  computed: {
    shouldShow() {
      if (this.viewMode === '2D') {
        return true;
      } else if (this.viewMode === '3D') {
        return false;
      } else {
        return this.currentView === 'map';
      }
    },
    cardStyleConfig() {
      return {
        ...this.typeConfig,
        ...this.styleConfig
      };
    }
  },
  watch: {
    styleConfig: {
      handler() {
        this.typeConfig = Object.assign(this.typeConfig, this.styleConfig);
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    if (this.$map) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    // 组件逻辑开始入口,如果组件有初始运行逻辑，请在此方法内编写，不要修改此方法名；如果没有可删除此方法。
    begin() {
      this.fileType = this.fileTypes.length > 0 ? this.fileTypes[0].value : '';
    },
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    fileExportEvt() {
      // 文件名不能为空
      if (this.fileName.trim() === '') {
        Message({
          message: '文件名不能为空',
          type: 'warning'
        });
        return false;
      }
      const loading = this.$loading({
        lock: true,
        target: this.$map.getTargetElement(),
        text: '导出中...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      let fileExport = new FileExport({
        map: this.$map,
        url: this.url ? this.url : this.shinegaUrl + '/geofile/export',
        token: this.token,
        exportFileName: this.fileName,
        exportFileTypeAndExt: this.fileType,
        isToTransformProj: this.isToTransformProj
      });

      setTimeout(() => {
        try {
          fileExport
            .exportFile()
            .then((msg) => {
              loading.close();
              Message({
                message: msg,
                type: 'success'
              });
            })
            .catch((error) => {
              loading.close();
              Message.error(error.message ? error.message : error);
            });
        } catch (error) {
          loading.close();
          console.error(error.message);
          Message.error(error.message);
        }
      }, 100);
    }
  }
};
</script>
