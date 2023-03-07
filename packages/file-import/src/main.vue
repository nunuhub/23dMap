<template>
  <div v-show="isComponentShow" id="importBtn" class="sh-file-import">
    <div v-show="isShow" style="width: 100%; height: 100%">
      <span v-if="$slots.default" @click="execute">
        <slot></slot>
      </span>
      <general-button
        v-else
        :position="position"
        :icon-class="iconClass ? iconClass : 'file-import'"
        :is-column="isColumn"
        :show-img="showImg"
        :drag-enable="dragEnable"
        :show-label="showLabel"
        :theme-style="themeStyle"
        :title="title ? title : '导入'"
        @click="execute"
      />
    </div>
    <input
      id="btn_file"
      ref="btn_file"
      :accept="acceptType"
      multiple="multiple"
      style="display: none"
      type="file"
      @change="readyUpload()"
    />
    <general-container
      v-if="showTips"
      ref="tipDialog"
      :append-to-body="true"
      :img-src="imgSrc ? imgSrc : 'file-import'"
      :position="panelPosition"
      :style-config="cardStyleConfig"
      :theme="theme"
      :title="titleStr"
    >
      <div>
        <div style="text-align: center; font-size: 12px">
          请选择文件
          <strong
            style="
              color: #007aff;
              font-size: 12px;
              white-space: nowrap;
              text-overflow: ellipsis;
            "
            >{{ importFiles[0].name }}&nbsp;</strong
          >具体的<strong style="color: #007aff; font-size: 12px"
            >&nbsp;文件类型</strong
          >
        </div>
        <div class="typelist">
          <div v-for="item in fileTypes" :key="item.value" class="items">
            <label :for="item.label" class="radioGroup">
              <input
                :id="item.label"
                v-model="fileType"
                :value="item.value"
                class="inpt"
                name="file"
                type="radio"
                @change="fileTypeChange()"
              />
              <span>{{ item.label }}</span>
            </label>
            <br />
          </div>
        </div>
        <div class="btns">
          <el-button size="small" type="primary" @click="makeSureSubmit()"
            >导入
          </el-button>
          <el-button size="small" type="warning" @click="closeWindow()"
            >取消
          </el-button>
        </div>
      </div>
    </general-container>
    <general-container
      v-if="showProj"
      ref="selectProj"
      :append-to-body="true"
      :img-src="imgSrc ? imgSrc : 'file-import'"
      :position="panelPosition"
      :style-config="cardStyleConfig"
      :theme="theme"
      :title="titleStr"
    >
      <div>
        <div style="text-align: center; font-size: 12px">
          请选择文件
          <strong
            style="
              color: #007aff;
              font-size: 12px;
              white-space: nowrap;
              text-overflow: ellipsis;
            "
            >{{ importFiles[0].name }}&nbsp;</strong
          >具体的<strong style="color: #007aff; font-size: 12px"
            >&nbsp;坐标系</strong
          >
        </div>
        <div class="typelist">
          <div v-for="item in prjOptions" :key="item.value" class="items">
            <label :for="item.label" class="radioGroup">
              <input
                :id="item.label"
                v-model="projCode"
                :value="item.value"
                class="inpt"
                name="file"
                type="radio"
              />
              <span>{{ item.label }}</span>
            </label>
            <br />
          </div>
        </div>
        <div class="btns">
          <el-button
            v-if="isDwg"
            size="small"
            type="primary"
            @click="makeSureSubmit()"
            >导入
          </el-button>
          <el-button v-else size="small" type="primary" @click="parseshp()"
            >导入
          </el-button>
          <el-button size="small" type="warning" @click="closeWindow()"
            >取消
          </el-button>
        </div>
      </div>
    </general-container>
    <general-container
      v-show="showError"
      ref="unSupport"
      :append-to-body="true"
      :img-src="imgSrc ? imgSrc : 'file-import'"
      :position="panelPosition"
      :style-config="cardStyleConfig"
      :theme="theme"
      :title="titleStr"
    >
      <div>
        <div>
          暂时不支持扩展名为<strong style="color: red">{{
            ' .' + suffix + ' '
          }}</strong
          >的文件
        </div>
        <div style="margin-bottom: 10px; margin-left: 20px; cursor: pointer">
          <a @click="seeStand()">点击查看数据标准</a>
        </div>
        <div class="btns">
          <el-button size="small" type="warning" @click="closeWindow()"
            >关闭
          </el-button>
        </div>
      </div>
    </general-container>
    <general-container
      v-show="showGdb"
      ref="gdbDialog"
      :append-to-body="true"
      :img-src="imgSrc ? imgSrc : 'file-import'"
      :position="panelPosition"
      :style-config="cardStyleConfig"
      :theme="theme"
      :title="titleStr"
    >
      <div class="file-import-gdb">
        <el-form ref="form" label-width="90px" label-position="left">
          <el-form-item label="导入图层">
            <el-select v-model="gdbLayerName" size="small">
              <el-option
                v-for="item in gdbLayerNameList"
                :key="item.name"
                :label="item.alias"
                :value="item.name"
              />
            </el-select>
          </el-form-item>
        </el-form>
        <div class="btns">
          <el-button
            size="small"
            type="primary"
            @click="importGdbLayer(gdbLayerName)"
            >导入
          </el-button>
          <el-button size="small" type="warning" @click="closeWindow"
            >取消
          </el-button>
        </div>
      </div>
    </general-container>
    <general-container
      v-show="fileRecords"
      :config="recordConfig"
      :img-src="imgSrc ? imgSrc : 'file-import'"
      :position="panelPosition"
      :theme="theme"
      title="导入记录"
    >
      <div>
        <div v-for="(item, index) in records" :key="index" class="records">
          <div>{{ index + 1 }}.</div>
          <div
            :title="item.name"
            style="
              width: 180px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            "
          >
            {{ item.name }}
          </div>
          <div>{{ item.time }}</div>
        </div>
        <div class="btns">
          <el-button size="mini" type="warning" @click="fileRecords = false"
            >关闭
          </el-button>
        </div>
      </div>
    </general-container>
  </div>
</template>

<script>
import FileImport from './FileImport.js';
import cardDrag from 'shinegis-client-23d/src/directives/card-drag';
import common from 'shinegis-client-23d/src/mixins/common';
import { selectStyles } from 'shinegis-client-23d/src/utils/olUtil';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import GeneralButton from 'shinegis-client-23d/packages/general-button';
import generalButtonProps from 'shinegis-client-23d/src/mixins/components/general-button-props';
const JSZip = require('@zip.js/zip.js/index.cjs');
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { length } from '@turf/turf';
import Feature from 'ol/Feature';
import { getNowTime, locationGeometry } from './common.js';
import { GeoJSON } from 'ol/format';
import { Message } from 'element-ui';
import * as GeographicLib from 'geographiclib-geodesic';
import { MultiPolygon, Polygon } from 'ol/geom';
import GDBParser from 'shinegis-client-23d/packages/file-import/src/Parser/GDBParser';
import { setAreaByGa } from 'shinegis-client-23d/packages/file-import/src/serverApi';

var shapefile = require('shapefile');

export default {
  name: 'ShFileImport',
  directives: { cardDrag },
  components: {
    GeneralContainer: GeneralContainer,
    GeneralButton
  },
  mixins: [common, generalCardProps, emitter, generalButtonProps],
  props: {
    url: {
      type: String
    },
    returnType: {
      type: String,
      default: 'geojson'
    },
    standUrl: {
      type: String
    },
    gdbUrl: {
      type: String
    },
    fileTypes: {
      type: Array,
      default: () => [
        { label: '自然资源部标准格式(*.txt)', value: 'GTJZD|.txt' }
      ]
    },
    prjOptions: {
      type: Array,
      default: () => [
        {
          value: 'EPSG:4490',
          label: '国家2000 经纬度'
        },
        {
          value: 'EPSG:4528',
          label: '国家2000 三度分带 40带 坐标含分带'
        },
        {
          value: 'EPSG:4549',
          label: '国家2000 三度分带 中央经线120 坐标不含分带'
        },
        {
          value: 'EPSG:4527',
          label: '国家2000 三度分带 39带 坐标含分带'
        }
      ]
    },
    showRecords: {
      type: Boolean,
      default: false
    },
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '1px',
        left: '140px'
      })
    },
    panelPosition: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '35%',
        left: '35%',
        bottom: '0px',
        right: '0px',
        zIndex: 9999
      })
    },
    //自定义导入,
    customImport: {
      type: Object
    },
    //每次导入是否清楚上一次地块,single为清除, multi不清除
    mode: {
      type: String,
      default: 'single'
    }
  },

  data() {
    return {
      text: '导入',
      isComponentShow: false,
      acceptType:
        '.shp,.dwg,.dxf,.txt,.zip,.rar,.7z,.dbf,.prj,.shx,.sbn,.xml,.wp,.wl,.mdb',
      showTipStr: 'haha',
      importFiles: [],
      importUrl: '',
      dwgCount: 0,
      showTxtTypes: false,
      showTips: false,
      showProj: false,
      isDwg: false,
      showGdb: false,
      gdbLayerName: '',
      gdbLayerNameList: [],
      records: [],
      fileRecords: false,
      fileType: '',
      projCode: '',
      suffix: '',
      showError: false,
      titleStr: '导入提示',
      typeConfig: {
        isShowBtn: false, // true时展示btn点btn显示面板,false直接显示面板
        titleBar: {
          miniBtn: false,
          maxBtn: false,
          closeBtn: false,
          title: true
        },
        autoVisible: false,
        size: {
          radius: '4px',
          width: '320px',
          height: '600px' // 原先300
        }
      },
      recordConfig: {
        isShowBtn: false, // true时展示btn点btn显示面板,false直接显示面板
        titleBar: {
          miniBtn: false,
          maxBtn: false,
          closeBtn: false,
          title: true
        },
        autoVisible: false,
        size: {
          radius: '4px',
          width: '320px',
          height: '600px' // 原先300
        }
      }
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
        this.isComponentShow = val === 'map';
      },
      immediate: true
    }
  },
  mounted() {
    this.$emit('mounted');
  },
  beforeDestroy() {
    // v-show不生效 使用style.display方式隐藏
    if (this.$refs.tipDialog) this.$refs.tipDialog.$el.style.display = 'none';
    if (this.$refs.selectProj) this.$refs.selectProj.$el.style.display = 'none';
    this.$refs.unSupport.$el.style.display = 'none';
    this.$refs.gdbDialog.$el.style.display = 'none';
  },
  methods: {
    parseshp() {
      this.parseSingleShp(this.projCode, this.importFiles[0].raw);
    },

    // 统一对外方法名称
    execute() {
      this.openWindow();
    },
    openWindow() {
      this.showError = false;
      this.showTips = false;
      this.showProj = false;
      this.showGdb = false;
      this.isDwg = false;
      document.getElementById('btn_file').click();
    },
    /**
     * 暴露方法
     * @param options {importFiles 导入文件数组(element-upload格式),fileType:例:GTJZD|.txt}
     * @param callback
     */
    uploadFiles(options, callback) {
      if (options.importFiles) {
        this.importFiles = options.importFiles;
      }
      // loading加载
      const loading = this.$loading({
        lock: true,
        text: '导入中...',
        target: this.$map.getTargetElement(),
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      if (!this.importUrl) {
        this.importUrl = this.url
          ? this.url
          : this.shinegaUrl + '/geofile/import';
      }
      if (!this.importFiles || this.importFiles.length === 0) {
        Message({
          message: '请选择一个文件',
          type: 'error'
        });
        loading.close();
        return;
      }

      if (this.fileType === 'DWG|.dwg') {
        this.dwgCount++;
      }

      // 初始化导入操作类
      let fileImport = new FileImport({
        map: this.$map,
        url: this.importUrl,
        token: this.token,
        importFileTypeAndExt: options.fileType,
        importFiles: this.importFiles,
        dwgCount: this.dwgCount
      });
      setTimeout(() => {
        // loading.close()
        this.$refs.btn_file.value = null;
        try {
          fileImport
            .importFile()
            .then((feature) => {
              loading.close();
              if (callback) {
                callback(feature);
              }
            })
            .catch((error) => {
              loading.close();
              Message.error(error.message);
            });
        } catch (error) {
          loading.close();
          Message.error(error.message);
        }
      }, 100);
    },
    typeSelected(fileType) {
      if (fileType) {
        this.fileType = fileType.value;
        this.fileTypeChange(this.fileType);
      } else {
        this.fileType = '';
      }
    },
    seeStand() {
      if (this.standUrl) {
        window.open(this.standUrl, '_blank');
      } else {
        this.$message.error('缺少说明文档地址');
      }
    },
    // 当文件类型改变的时候触发
    fileTypeChange() {
      let valueArray = this.fileType.split('|');
      if (valueArray.length === 3) {
        this.showTipStr = valueArray[2];
      }
    },
    makeSureSubmit() {
      this.submitUpload();
    },
    async getZIPFileNames(file) {
      let reader = new JSZip.ZipReader(new JSZip.BlobReader(file));
      const entries = await reader.getEntries();
      reader.close();
      for (let entry of entries) {
        if (entry.filename.toLowerCase().indexOf('.shp')) {
          return 'zip'; //zip为shp, shp为单独shp
        } else if (entry.filename.toLowerCase().indexOf('.gdb')) {
          return 'gdb';
        }
      }
      return 'zip';
    },
    readyUpload() {
      if (this.mode === 'single') {
        let source = this.$map.getLayerById('drawLayer').getSource();
        let importFeatures = [];
        source.getFeatures().forEach((item) => {
          if (item.get('isImport')) {
            importFeatures.push(item);
          }
        });
        for (let feature of importFeatures) {
          source.removeFeature(feature);
        }
      }
      var fileList = document.getElementById('btn_file').files;
      // 由于elementui提供的上传跟js原生不同，是经过封装的，所以在这里封装成el的标准格式
      // uid暂时先用mathrandom代替
      //允许用户上传shp的配置文件，如shx，prj，dbf等
      for (let i = 0; i < fileList.length; i++) {
        var fileObj = {
          name: fileList[i].name,
          percentage: 0,
          raw: fileList[i],
          size: fileList[i].size,
          status: 'ready',
          uid: (Math.random() * 1000000).toFixed(0)
        };
        this.importFiles.push(fileObj);
      }
      this.suffix = fileList[0].name.split('.')[1];
      //解压判断真实的后缀是shp还是gdb
      if (this.suffix?.toUpperCase() === 'ZIP') {
        this.getZIPFileNames(fileList[0]).then((ext) => {
          if (ext) {
            this.suffix = ext;
            this._toImport(fileList);
          } else {
            Message('ZIP文件内不存在SHP或者GDB文件');
          }
        });
      } else {
        this._toImport(fileList);
      }
    },
    _toImport(fileList) {
      //根据后缀自定义导入
      if (this.customImport && this.customImport.key === 'suffix') {
        if (this.suffix?.toLowerCase() === this.customImport.value) {
          this.customImport.handle(fileList, this.suffix);
          return;
        }
      }

      if (this.fileTypes.length === 1 && this.suffix?.toUpperCase() === 'TXT') {
        this.fileType = this.fileTypes[0].value;
        this.submitUpload();
      } else if (
        this.suffix?.toUpperCase() === 'TXT' &&
        this.fileTypes.length > 1
      ) {
        this.showTips = true;
        this.showProj = false;
        this.typeSelected(this.fileTypes[0]);
      } else if (
        this.suffix?.toUpperCase() === 'DWG' ||
        this.suffix?.toUpperCase() === 'DXF' ||
        this.suffix?.toUpperCase() === 'WP' ||
        this.suffix?.toUpperCase() === 'WL'
      ) {
        this.fileType = 'DWG|.dwg';
        this.showProj = true;
        this.isDwg = true;
      } else if (this.suffix === 'shp' || this.suffix === 'SHP') {
        this.showProj = true;
        this.isDwg = false;
      } else if (
        this.suffix?.toUpperCase() === 'SHP' ||
        this.suffix?.toUpperCase() === 'ZIP' ||
        this.suffix?.toUpperCase() === '7Z' ||
        this.suffix?.toUpperCase() === 'RAR' ||
        this.suffix?.toUpperCase() === 'DBF' ||
        this.suffix?.toUpperCase() === 'SHX' ||
        this.suffix?.toUpperCase() === 'PRJ' ||
        this.suffix?.toUpperCase() === 'XML' ||
        this.suffix?.toUpperCase() === 'SBN' ||
        this.suffix?.toUpperCase() === 'SBX'
      ) {
        this.fileType = 'SHP|.shp';
        this.submitUpload();
      } else if (
        this.suffix?.toUpperCase() === 'GDB' ||
        this.suffix?.toUpperCase() === 'MDB'
      ) {
        this.showGdbLayerSelect(fileList, this.suffix);
      } else {
        this.showError = true;
        return;
      }
      this.clearSelect();
    },
    submitUpload() {
      // loading加载
      const loading = this.$loading({
        lock: true,
        text: '导入中...',
        target: this.$map.getTargetElement(),
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });

      if (!this.importUrl) {
        this.importUrl = this.url
          ? this.url
          : this.shinegaUrl + '/geofile/import';
      }
      if (this.importFiles.length < 1) {
        Message({
          message: '请选择一个文件',
          type: 'error'
        });
        loading.close();
        return;
      }

      if (this.fileType === 'DWG|.dwg') {
        this.dwgCount++;
      }
      // 初始化导入操作类
      let fileImport = new FileImport({
        map: this.$map,
        url: this.importUrl,
        token: this.token,
        importFileTypeAndExt: this.fileType,
        importFiles: this.importFiles,
        dwgCount: this.dwgCount,
        importProj: this.projCode
      });
      setTimeout(() => {
        // loading.close()
        this.$refs.btn_file.value = null;
        try {
          fileImport
            .importFile()
            .then((feature) => {
              loading.close();
              // 清空导入面板文件列表
              if (this.showRecords) {
                this.fileRecords = true;
                this.importFiles.forEach((e) => {
                  e.time = getNowTime();
                  this.records.push(e);
                });
              }
              this.importSuccess(feature);
              this.importFiles = [];
              Message({
                message: '导入成功',
                type: 'success'
              });
              this.showTips = false;
              this.showProj = false;
            })
            .catch((error) => {
              loading.close();
              Message.error(error.message);
              //如果发生导入错误应当置空当前files，防止下次导入时连带
              this.importFiles = [];
              this.showTips = false;
              this.showProj = false;
            });
        } catch (error) {
          loading.close();
          Message.error(error.message);
        }
      }, 100);
    },
    closeWindow() {
      this.showError = false;
      this.showTips = false;
      this.showProj = false;
      this.showGdb = false;
      this.isDwg = false;
      this.importFiles = [];
      this.fileType = '';
      this.projCode = '';
      // 防止再次选择同名文件时不触发选择框的bug
      document.getElementById('btn_file').value = '';
    },
    /**
     * 二维数据变为一维数组
     * 单个Feature也变为一维数组
     * @param features
     * @returns {*[]|Array}
     */
    generateArray(features) {
      if (
        features &&
        features instanceof Array &&
        features[0] instanceof Array
      ) {
        let newFeature = [];
        for (let i in features) {
          if (features[i] instanceof Array || features[i] instanceof Feature) {
            newFeature = newFeature.concat(features[i]);
          }
        }
        return newFeature;
      } else if (features && features instanceof Array) {
        return features;
      } else {
        //单feature
        return [features];
      }
    },
    importSuccess(data) {
      let importFile = this.importFiles[0];
      let features = this.generateArray(data);
      setAreaByGa({
        url: this.shinegaUrl,
        features: features,
        token: this.token,
        projection: this.$map.getView().getProjection().getCode()
      }).then(() => {
        if (features instanceof Array) {
          for (let item of features) {
            if (features.length < 50) {
              item.set('tempSelected', true);
              item.set('isImport', true);
              item.setStyle(selectStyles);
            }
            this.setNecessaryAttr(item);
          }
        }
        let result =
          this.returnType === 'geojson'
            ? this.$map.transformGeo(features)
            : features;
        this.$emit('importSuccess', result, importFile);
      });
    },
    setNecessaryAttr(feature) {
      if (!feature.get('area')) {
        feature.set('area', this.getArea(feature));
      }
      if (!feature.get('length')) {
        feature.set('length', this.getLength(feature));
      }
    },
    getArea(feature) {
      /*let geojson = JSON.parse(this.$map.transformGeo(feature));
      let dkmj = area(geojson);*/
      let geojson84 = this.$map.transformGeo(
        feature,
        this.$map.getView().getProjection().getCode(),
        'EPSG:4326'
      );
      let feature84 = new GeoJSON().readFeature(geojson84);
      let geomotry84 = feature84.getGeometry();
      let dkmj = 0;
      if (geomotry84 instanceof Polygon) {
        dkmj = this.polygonArea([geomotry84.getCoordinates()]);
      } else if (geomotry84 instanceof MultiPolygon) {
        dkmj = this.polygonArea(geomotry84.getCoordinates());
      }
      return dkmj;
    },
    //MultiPolygon的coords: number[][][][] ,Polygon需要套一层[]
    polygonArea(coords) {
      let total = 0;
      if (coords && coords.length > 0) {
        for (let i = 0; i < coords.length; i++) {
          const area = this.geographicLibArea(coords[i][0]);
          total += area;
        }
      }
      return total;
    },
    geographicLibArea(coordinates) {
      const geod = GeographicLib.Geodesic.WGS84;
      let poly = geod.Polygon(false);
      for (let i = 0; i < coordinates.length; ++i) {
        poly.AddPoint(coordinates[i][1], coordinates[i][0]);
      }
      poly = poly.Compute(false, true);
      return Math.abs(poly.area.toFixed(4));
    },
    getLength(feature) {
      let geojson = JSON.parse(this.$map.transformGeo(feature));
      return length(geojson);
    },
    //清空选择的文件，方便下次触发监听
    clearSelect() {
      this.$refs.btn_file.value = '';
    },
    addFeatures(features) {
      if (features) {
        let geometrys = [];
        for (let feature of features) {
          geometrys.push(feature.getGeometry());
        }
        // 添加所有feature到临时图层
        this.$map.getLayerById('drawLayer').getSource().addFeatures(features);
        locationGeometry(this.$map, geometrys);
      }
    },
    parseSingleShp(wkid, files) {
      // 获取下拉框选中的值
      var checkedPrj = wkid;
      // 获取当前地图的坐标系
      var currMapPrj = this.$map.getView().getProjection().getCode();
      var self = this;
      //获取shp文件
      let shpFile = files
        ? files
        : document.getElementById('btn_file').files[0];
      if (shpFile instanceof Array) {
        shpFile = shpFile[0];
      }
      var readShp = new FileReader();

      //以二进制的形式读取文件的内容
      readShp.readAsArrayBuffer(shpFile, 'UTF-8');
      readShp.onload = function () {
        //清空选择的文件，方便下次触发监听
        self.clearSelect();
        // 读取的结果存储在this.result中
        var shpData = this.result;
        let allFeature = [];
        shapefile.open(shpData, null, { encoding: 'utf-8' }).then((source) =>
          source.read().then(function parse(result) {
            try {
              if (result.done) {
                // 将features添加到临时图层drawLayer上
                self.addFeatures(allFeature);
                self.importSuccess(allFeature);
                return;
              }
              var options = {
                dataProjection: checkedPrj,
                featureProjection: currMapPrj
              };
              // geometry为geojson格式
              var geometry = result.value.geometry;
              // 将坐标转和坐标系换成openlayers格式
              var features = new GeoJSON(options).readFeatures(geometry);
              allFeature = allFeature.concat(features);
              return source.read().then(parse);
            } catch (e) {
              console.warn(e);
              Message.error('坐标系选择错误,请检查shp坐标系');
            }
          })
        );
      };
      this.closeWindow();
    },
    showGdbLayerSelect(importFiles, type) {
      this.showGdb = false;
      this.gdbLayerNameList = [];
      this.gdbLayerName = '';
      this.getGdbLayerName(importFiles, type).then((layerNameList) => {
        if (layerNameList && layerNameList.length > 0) {
          this.showGdb = true;
          this.gdbLayerNameList = layerNameList;
          this.gdbLayerName = this.gdbLayerNameList[0].name;
        }
      });
    },
    getGdbLayerName(importFiles, type) {
      return new Promise((resolve, reject) => {
        const loading = this.$loading({
          lock: true,
          text: '正在解析上传文件...',
          target: this.$map.getTargetElement(),
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        this.gdbParse = new GDBParser({
          map: this.$map,
          url: this.gdbUrl,
          token: this.token
        });
        this.gdbParse
          .getLayerName(importFiles, type)
          .then((layerNameList) => {
            loading.close();
            resolve(layerNameList);
          })
          .catch((message) => {
            loading.close();
            Message({
              type: 'error',
              message: message
            });
            reject(message);
          });
      });
    },
    importGdbLayer(layerName) {
      if (this.gdbParse && layerName) {
        const loading = this.$loading({
          lock: true,
          text: '正在解析图形数据...',
          target: this.$map.getTargetElement(),
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });
        this.gdbParse
          .importGdbLayer(layerName)
          .then((features) => {
            loading.close();
            Message({
              message: '导入成功',
              type: 'success'
            });
            this.gdbLayerNameList = [];
            this.showGdb = false;
            this.importSuccess(features);
          })
          .catch((message) => {
            loading.close();
            Message({
              type: 'error',
              message: message
            });
          });
      } else {
        Message({
          type: 'error',
          message: '请先解析GDB/MDB文件并选择导入图层'
        });
      }
    }
  }
};
</script>

<style scoped>
.texSelect {
  width: 400px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: saturate(180%) blur(20px);
  box-shadow: 3px 4px 5px rgba(87, 86, 86, 0.7);
  position: fixed;
  z-index: 8888;
  top: 300px;
  left: 800px;
  border-radius: 8px;
}

.unSupport {
  width: 400px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: saturate(180%) blur(20px);
  box-shadow: 3px 4px 5px rgba(87, 86, 86, 0.7);
  position: fixed;
  z-index: 8888;
  top: 300px;
  left: 800px;
  border-radius: 8px;
}

.header {
  width: 90%;
  height: 30px;
  margin-left: 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}

.typelist {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  width: 96%;
  margin-left: 2%;
  margin-top: 10px;
}

.items {
  width: 280px;
  height: 30px;
  margin-bottom: 5px;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.radioGroup {
  width: 100%;
  cursor: pointer;
  background: transparent;
}

.inpt {
  cursor: pointer;
}

.btns {
  width: 90%;
  margin-top: 10px;
  margin-left: 5%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

input:checked + span {
  color: #007aff;
}

.records {
  display: flex;
  justify-content: space-around;
  font-size: 12px;
  margin-top: 2px;
  align-items: center;
}
</style>
