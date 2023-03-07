<template>
  <div class="sh-export-map">
    <!--  按钮  -->
    <span v-if="$slots.default" @click="execute">
      <slot></slot>
    </span>
    <el-button
      v-else
      size="small"
      type="primary"
      class="export-button"
      @click="execute"
      >制图</el-button
    >
    <div ref="configContent" class="sh-export-map-content">
      <!--  配置界面  -->
      <el-card
        v-show="isDialogShow"
        ref="configCard"
        v-cardDrag
        class="box-card el-card card-base"
        style="width: 330px"
      >
        <div slot="header" class="clearfix">
          <span class="export-map-header">制图</span>
          <el-button
            style="
              float: right;
              border: unset;
              border: unset;
              color: white;
              font-size: 20px;
              background-color: unset;
              padding: unset;
              margin-top: unset;
              line-height: 30px;
            "
            icon="el-icon-close"
            circle
            size="mini"
            @click="closeDialog"
          ></el-button>
        </div>
        <div class="export-body">
          <el-form
            ref="form"
            :model="exportConfig"
            size="small"
            label-width="80px"
          >
            <!-- 制图设置 -->
            <el-form-item label-width="70px">
              <span slot="label" style="color: black">制图设置</span>
            </el-form-item>

            <el-form-item label="制图标题">
              <el-input v-model="exportConfig.title" />
            </el-form-item>

            <el-form-item label="制图作者">
              <el-input v-model="exportConfig.author" />
            </el-form-item>
            <div
              style="height: 0.5px; background: #cccccc; margin-bottom: 8px"
            ></div>

            <!-- 制图信息 -->
            <el-form-item label-width="70px">
              <span slot="label" style="color: black">制图信息</span>
            </el-form-item>

            <el-form-item label="制图模板">
              <el-select
                v-model="exportConfig.type"
                placeholder="请选择"
                @change="templateChange"
              >
                <el-option
                  v-for="item in exportTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="比例尺">
              <el-select
                v-model="exportConfig.scale"
                filterable
                allow-create
                default-first-option
                placeholder="请选择比例尺"
                @change="scaleChanged"
              >
                <el-option
                  v-for="item in scaleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="纸张设置">
              <el-select
                v-model="exportConfig.pageSize"
                type="date"
                placeholder="选择大小"
                style="width: 80px"
                :disabled="!isCanvas && !isCustom"
                @change="getPageLayoutPro"
              >
                <el-option
                  v-for="item in pageSizeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
              <el-select
                v-model="exportConfig.pageMode"
                placeholder="选择方向"
                style="width: 80px; margin-left: 20px"
                :disabled="!isCanvas"
                @change="getPageLayoutPro"
              >
                <el-option
                  v-for="item in pageModeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="格式">
              <el-select
                v-model="exportConfig.format"
                type="date"
                placeholder="选择大小"
                style="width: 80px"
              >
                <el-option
                  v-for="item in formatOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="像素">
              <el-select
                v-model="exportConfig.pixel"
                placeholder="选择方向"
                style="width: 80px"
              >
                <el-option
                  v-for="item in pixelOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <div
              v-show="isCanvas"
              style="height: 0.5px; background: #cccccc; margin-bottom: 8px"
            ></div>
            <!-- 地图整饰 -->
            <el-collapse v-show="isCanvas" v-model="activeNames">
              <el-collapse-item title="地图整饰" name="1">
                <el-form-item label="比例尺:">
                  <el-switch
                    v-model="exportConfig.isShowScale"
                    active-color="rgb(48,73,110)"
                    inactive-color="rgb(220,220,220)"
                  >
                  </el-switch>
                </el-form-item>
              </el-collapse-item>
            </el-collapse>
          </el-form>
        </div>
        <slot name="footer">
          <div style="width: 100%; text-align: center; margin: 12px">
            <el-button
              class="export-btn"
              :disabled="isDisableExport"
              @click="printTaskExecute"
              >制图</el-button
            >
          </div>
        </slot>
      </el-card>

      <!--  预览界面  -->
      <div v-if="isDialogShow" ref="content" class="print-content">
        <div
          ref="printOutFrame"
          class="printOutFrame"
          :style="outFrameStyleObj"
        >
          <div
            id="map"
            ref="innerMap"
            class="printInnerFrame"
            :style="innerFrameStyleObj"
          >
            <!--            <img id="imgBox" v-show="exportConfig.isShowCompass"
                 src="../../assets/img/zhibeizhen.png"
                 style="position: absolute; height: 100px; width: 100px; top: 20px; right: 25px;">-->
          </div>
          <Legend
            v-if="false"
            ref="legend"
            :legend-config="legendConfig"
            class="legendFrame"
            :style="legendStyleObj"
          ></Legend>
          <div class="printTitle" :style="titleStyleObj">
            <label
              style="
                font-size: 28px;
                font-weight: bold;
                color: black;
                font-family: '黑体';
              "
              >{{ exportConfig.title }}</label
            >
          </div>
          <div class="printAuthor" :style="authorStyleObj">
            <label
              style="
                font-size: 22px;
                font-weight: bold;
                color: black;
                font-family: '微弱雅黑';
              "
              >制图作者:{{ exportConfig.author }}</label
            >
          </div>
          <div class="printTime" :style="timeStyleObj">
            <label
              style="
                font-size: 22px;
                font-weight: bold;
                color: black;
                font-family: '微弱雅黑';
              "
              >{{ new Date().toLocaleDateString() }}</label
            >
          </div>
          <div
            v-show="exportConfig.isShowScale"
            class="printScale"
            :style="scaleStyleObj"
          >
            <label
              style="
                font-size: 22px;
                font-weight: bold;
                color: black;
                font-family: '微弱雅黑';
              "
              >比例尺:{{ exportConfig.scale }}</label
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import cardDrag from 'shinegis-client-23d/src/directives/export-card-drag';
import { saveAs } from 'file-saver';
import Legend from 'shinegis-client-23d/packages/legend';
import { Loading, Message } from 'element-ui';
import { colorRgba, getRgbaArray } from 'shinegis-client-23d/src/utils/common';
import { getCentimeter } from 'shinegis-client-23d/src/utils/olUtil';
import html2canvas from 'html2canvas';
import * as jspdf from 'jspdf';
import Api from './api';
import WKT from 'ol/format/WKT';
import Bus from 'shinegis-client-23d/src/utils/bus';
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';

export default {
  name: 'ShExportMap',
  components: {
    Legend: Legend
  },
  directives: { cardDrag },
  mixins: [common, emitter],
  props: {
    map: {
      type: Object
    },
    url: {
      type: String
    },
    scales: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  data() {
    return {
      api: null, // axios封装的请求api
      activeNames: '1',
      isCustom: false,
      isDialogShow: false,
      isDisableExport: false, // 制图时，按钮不可操作
      exportConfig: {
        // 面板配置信息
        title: '',
        author: '',
        type: 'canvas',
        scale: '',
        pageSize: 'A3',
        pageMode: 'Landscape',
        format: 'PDF',
        pixel: '150',
        isShowScale: true,
        isShowCompass: true,
        isShowLegend: true,
        legendHeight: 280
      },
      exportTypeOptions: [
        {
          value: 'canvas',
          label: '所见即所得'
        }
      ],
      scaleOptions: [
        {
          value: 'canvas',
          label: '所见即所得'
        },
        {
          value: 'mxd',
          label: '模板制图'
        }
      ],
      pageModeOptions: [
        {
          value: 'Landscape',
          label: '横向'
        },
        {
          value: 'Portrait',
          label: '纵向'
        }
      ],
      formatOptions: [
        {
          value: 'PDF',
          label: 'PDF'
        },
        {
          value: 'PNG',
          label: 'PNG'
        }
      ],
      pixelOptions: [
        {
          value: '150',
          label: '150'
        },
        {
          value: '300',
          label: '300'
        },
        {
          value: '600',
          label: '600'
        }
      ],
      printMapServiceConfig: [
        // 所见即所得制图模板
        {
          id: '3',
          name: 'A3 Landscape',
          pageLayoutPro: {
            ElementPros: [
              {
                SizeAndPosition: {
                  AnchorPoint: 6.0,
                  ElementName: 'MapTitle',
                  ElementAliasName: '制图标题',
                  PositionX: 20.9995,
                  PositionY: 26.1532,
                  SizeHeight: 1.4112,
                  SizeWidth: 0.7056
                },
                Text: '',
                Type: 'Text',
                FontSize: 20.0
              },
              {
                SizeAndPosition: {
                  AnchorPoint: 6.0,
                  ElementName: 'exportUser',
                  ElementAliasName: '制图作者',
                  PositionX: 6.396,
                  PositionY: 1.1411,
                  SizeHeight: 0.4939,
                  SizeWidth: 0.9878
                },
                Text: '',
                Type: 'Text',
                FontSize: 14.0
              },
              {
                SizeAndPosition: {
                  AnchorPoint: 6.0,
                  ElementName: 'auditor',
                  ElementAliasName: '审核人员',
                  PositionX: 12.2652,
                  PositionY: 1.1411,
                  SizeHeight: 0.4939,
                  SizeWidth: 0.9878
                },
                Text: '',
                Type: 'Text',
                FontSize: 14.0
              }
            ],
            MapFramePro: {
              PageMarginsB: 3.8557,
              PageMarginsL: 2.9556,
              PageMarginsR: 2.7672,
              PageMarginsT: 4.4484,
              SizeAndPosition: {
                AnchorPoint: 6.0,
                ElementName: 'Layers',
                PositionX: 2.9556,
                PositionY: 3.8557,
                SizeHeight: 21.3959,
                SizeWidth: 36.2772
              }
            },
            PagePro: {
              PageHeight: 29.7,
              PageOri: '横向',
              PageSize: 'A3',
              PageWidth: 42.0
            }
          }
        },
        {
          id: '4',
          name: 'A3 Portrait',
          pageLayoutPro: {
            ElementPros: [
              {
                SizeAndPosition: {
                  AnchorPoint: 6.0,
                  ElementName: 'MapTitle',
                  ElementAliasName: '制图标题',
                  PositionX: 14.8506,
                  PositionY: 38.0217,
                  SizeHeight: 1.4112,
                  SizeWidth: 0.7056
                },
                Text: '',
                Type: 'Text',
                FontSize: 20.0
              },
              {
                SizeAndPosition: {
                  AnchorPoint: 6.0,
                  ElementName: 'exportUser',
                  ElementAliasName: '制图作者',
                  PositionX: 4.0896,
                  PositionY: 1.1411,
                  SizeHeight: 0.4939,
                  SizeWidth: 1.4817
                },
                Text: '',
                Type: 'Text',
                FontSize: 14.0
              },
              {
                SizeAndPosition: {
                  AnchorPoint: 6.0,
                  ElementName: 'auditor',
                  ElementAliasName: '审核人员',
                  PositionX: 9.0465,
                  PositionY: 1.4939,
                  SizeHeight: 0.4939,
                  SizeWidth: 1.4816
                },
                Text: '',
                Type: 'Text',
                FontSize: 14.0
              }
            ],
            MapFramePro: {
              PageMarginsB: 4.29,
              PageMarginsL: 2.9064,
              PageMarginsR: 2.7947,
              PageMarginsT: 4.9247,
              SizeAndPosition: {
                AnchorPoint: 6.0,
                ElementName: 'Layers',
                PositionX: 2.9064,
                PositionY: 4.29,
                SizeHeight: 32.7853,
                SizeWidth: 23.9989
              }
            },
            PagePro: {
              PageHeight: 42.0,
              PageOri: '纵向',
              PageSize: 'A3',
              PageWidth: 29.7
            }
          }
        },
        {
          id: '8dc86aa2-7cea-5865-a419-351ea01f538e',
          name: 'A4 Portrait',
          pageLayoutPro: {
            ElementPros: [
              {
                SizeAndPosition: {
                  AnchorPoint: 6.0,
                  ElementName: 'MapTitle',
                  ElementAliasName: '制图标题',
                  PositionX: 10.31,
                  PositionY: 27.0791,
                  SizeHeight: 1.4112,
                  SizeWidth: 0.7056
                },
                Text: '',
                Type: 'Text',
                FontSize: 20.0
              },
              {
                SizeAndPosition: {
                  AnchorPoint: 6.0,
                  ElementName: 'exportUser',
                  ElementAliasName: '制图作者',
                  PositionX: 4.0718,
                  PositionY: 1.8128,
                  SizeHeight: 0.4233,
                  SizeWidth: 1.27
                },
                Text: '',
                Type: 'Text',
                FontSize: 12.0
              },
              {
                SizeAndPosition: {
                  AnchorPoint: 6.0,
                  ElementName: 'auditor',
                  ElementAliasName: '审核人员',
                  PositionX: 8.0849,
                  PositionY: 1.8182,
                  SizeHeight: 0.4233,
                  SizeWidth: 1.27
                },
                Text: '',
                Type: 'Text',
                FontSize: 12.0
              }
            ],
            MapFramePro: {
              PageMarginsB: 4.219,
              PageMarginsL: 2.9064,
              PageMarginsR: 2.8197,
              PageMarginsT: 3.5251,
              SizeAndPosition: {
                AnchorPoint: 6.0,
                ElementName: 'Layers',
                PositionX: 2.9064,
                PositionY: 4.219,
                SizeHeight: 21.9559,
                SizeWidth: 15.2739
              }
            },
            PagePro: {
              PageHeight: 29.7,
              PageOri: '纵向',
              PageSize: 'A4',
              PageWidth: 21.0
            }
          }
        },
        {
          id: '6c2c4f56-07bf-fe7e-61e6-291b2b87fa9d',
          name: 'A4 Landscape',
          pageLayoutPro: {
            ElementPros: [
              {
                SizeAndPosition: {
                  AnchorPoint: 6.0,
                  ElementName: 'MapTitle',
                  ElementAliasName: '制图标题',
                  PositionX: 14.4277,
                  PositionY: 18.3427,
                  SizeHeight: 1.4112,
                  SizeWidth: 0.7056
                },
                Text: '',
                Type: 'Text',
                FontSize: 20.0
              },
              {
                SizeAndPosition: {
                  AnchorPoint: 6.0,
                  ElementName: 'exportUser',
                  ElementAliasName: '制图作者',
                  PositionX: 4.0356,
                  PositionY: 1.1294,
                  SizeHeight: 0.4233,
                  SizeWidth: 1.6933
                },
                Text: '',
                Type: 'Text',
                FontSize: 12.0
              },
              {
                SizeAndPosition: {
                  AnchorPoint: 6.0,
                  ElementName: 'auditor',
                  ElementAliasName: '审核人员',
                  PositionX: 7.7172,
                  PositionY: 1.1307,
                  SizeHeight: 0.4233,
                  SizeWidth: 1.27
                },
                Text: '',
                Type: 'Text',
                FontSize: 12.0
              }
            ],
            MapFramePro: {
              PageMarginsB: 3.8988,
              PageMarginsL: 2.9508,
              PageMarginsR: 3.0053,
              PageMarginsT: 3.6501,
              SizeAndPosition: {
                AnchorPoint: 6.0,
                ElementName: 'Layers',
                PositionX: 2.9508,
                PositionY: 3.8988,
                SizeHeight: 13.4511,
                SizeWidth: 23.7883
              }
            },
            PagePro: {
              PageHeight: 21.0,
              PageOri: '纵向',
              PageSize: 'A4',
              PageWidth: 29.7
            }
          }
        }
      ],
      ExportMapTemplate: [
        {
          id: '8dc86aa2-7cea-5865-a419-351ea01f538e',
          name: 'A4 Portrait',
          pageWidth: 21.0,
          pageHeight: 29.7
        },
        {
          id: '6c2c4f56-07bf-fe7e-61e6-291b2b87fa9d',
          name: 'A4 Landscape',
          pageWidth: 29.7,
          pageHeight: 21.0
        },
        {
          id: '3',
          name: 'A3 Landscape',
          pageWidth: 42.0,
          pageHeight: 29.7
        },
        {
          id: '4',
          name: 'A3 Portrait',
          pageWidth: 29.7,
          pageHeight: 42.0
        },

        {
          id: '9aer6aa2-76cf-5865-a419-351ea01f538e',
          name: 'A2 Portrait',
          pageWidth: 42.0,
          pageHeight: 59.4
        },
        {
          id: 'wd46hf56-07bf-fe7e-61e6-291dsku3fa9d',
          name: 'A2 Landscape',
          pageWidth: 59.4,
          pageHeight: 42.0
        },
        {
          id: '9aer8fe4-76cf-5865-a419-351ea01asht6',
          name: 'A1 Portrait',
          pageWidth: 59.4,
          pageHeight: 84.1
        },
        {
          id: 'wvgue5f56-07bf-fe7e-61e6-1dskfrty29d',
          name: 'A1 Landscape',
          pageWidth: 84.1,
          pageHeight: 59.4
        },
        {
          id: '9aer8fe4-76cf-5865-a419-351ea01asht7',
          name: 'A0 Portrait',
          pageWidth: 84.1,
          pageHeight: 118.9
        },
        {
          id: 'wvgue5f56-07bf-fe7e-61e6-1dskfrty28d',
          name: 'A0 Landscape',
          pageWidth: 118.9,
          pageHeight: 84.1
        }
      ], // 纸张大小
      mxdExportTemplate: {
        // mxd制图模板
        AdditionalImages: [],
        AdditionalTexts: [],
        BaseUrl: '',
        DPI: '96',
        ExportFormat: 'PDF',
        ExportKey: '',
        Labels: [],
        LyrPath: '',
        Lyrs: [],
        MapCenter: '120.21789550781251,29.077023558906724',
        MapDate: '2021/06/3',
        MapName: '02c2fb8e-3229-455d-9910-2d80f08cf1f6',
        MapUnit: 'meter',
        Scale: 2308574,
        Shapes: [],
        TemplateName: '浙江行政区A4横版.mxd',
        TemplatePath: '',
        UseDefaultTemplate: false,
        XZQDM: null,
        pageLayoutPro: null,
        spatialReference: { wkid: 4490 }
      },
      pageLayoutPro: null, // 当前预览界面的模板信息
      oneCentimeterPixel: null, // 1cm对应分辨率
      mapScreenWidth: null, // 未开启制图时，地图的宽度
      mapScreenHeight: null, // 未开启制图时，地图的高度
      // 动态匹配的预览界面样式
      outFrameStyle: {
        width: 0,
        height: 0,
        topPosition: 0,
        leftPosition: 0,
        pageScaling: 1
      },
      innerFrameStyle: {
        width: 0,
        height: 0,
        topPosition: 0,
        leftPosition: 0
      },
      titleStyle: {
        leftPosition: 0,
        bottomPosition: 0
      },
      authorStyle: {
        leftPosition: 0,
        bottomPosition: 0
      },
      timeStyle: {
        leftPosition: 0,
        bottomPosition: 0
      },
      scaleStyle: {
        leftPosition: 0,
        bottomPosition: 0
      }
    };
  },
  computed: {
    isCanvas() {
      return this.exportConfig.type === 'canvas';
    },
    pageSizeOptions() {
      if (this.isCanvas) {
        return [
          {
            value: 'A3',
            label: 'A3'
          },
          {
            value: 'A4',
            label: 'A4'
          }
        ];
      } else {
        return [
          {
            value: 'A0',
            label: 'A0'
          },
          {
            value: 'A1',
            label: 'A1'
          },
          {
            value: 'A2',
            label: 'A2'
          },
          {
            value: 'A3',
            label: 'A3'
          },
          {
            value: 'A4',
            label: 'A4'
          }
        ];
      }
    },
    outFrameStyleObj() {
      return {
        '--width': this.outFrameStyle.width + 'px',
        '--height': this.outFrameStyle.height + 'px',
        '--top': this.outFrameStyle.topPosition + 'px',
        '--left': this.outFrameStyle.leftPosition + 'px',
        '--scale': this.outFrameStyle.pageScaling
      };
    },
    innerFrameStyleObj() {
      return {
        '--width': this.innerFrameStyle.width + 'px',
        '--height': this.innerFrameStyle.height + 'px',
        '--top': this.innerFrameStyle.topPosition + 'px',
        '--left': this.innerFrameStyle.leftPosition + 'px'
      };
    },
    legendStyleObj() {
      let bottom =
        this.outFrameStyle.height -
        this.innerFrameStyle.topPosition -
        this.innerFrameStyle.height;
      let right =
        this.outFrameStyle.width -
        this.innerFrameStyle.leftPosition -
        this.innerFrameStyle.width;
      return {
        '--bottom': bottom + 'px',
        '--right': right + 'px'
      };
    },
    legendConfig() {
      return {
        panelW: 240,
        panelH: this.exportConfig.legendHeight,
        columnNum: 1,
        isShowName: true,
        isShowArrow: false,
        isShowTitle: true,
        titleBackground: 'rgb(48, 73, 110)',
        titleFontColor: '#ffffff',
        fontStyle: {
          fontWeight: 'normal',
          color: '#000000'
        },
        layerFontStyle: {
          fontWeight: 'normal',
          color: '#000000'
        }
      };
    },
    titleStyleObj() {
      return {
        '--left': this.titleStyle.leftPosition + 'px',
        '--bottom': this.titleStyle.bottomPosition + 'px'
      };
    },
    authorStyleObj() {
      return {
        '--left': this.authorStyle.leftPosition + 'px',
        '--bottom': this.authorStyle.bottomPosition + 'px'
      };
    },
    timeStyleObj() {
      return {
        '--left': this.timeStyle.leftPosition + 'px',
        '--bottom': this.timeStyle.bottomPosition + 'px'
      };
    },
    scaleStyleObj() {
      return {
        '--left': this.scaleStyle.leftPosition + 'px',
        '--bottom': this.scaleStyle.bottomPosition + 'px'
      };
    }
  },
  watch: {
    'exportConfig.title': {
      handler() {
        this.computeTextElement();
      }
    }
  },
  mounted() {
    this.initTemplateConfig(this.url);
    this.initScaleArray();
    if (this.$map) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
  },
  methods: {
    begin() {
      this.$map.on('moveend', () => {
        this.exportConfig.scale = '1:' + parseInt(this.$map.getMapScale(), 10);
      });
    },
    initTemplateConfig(url) {
      this.api = new Api(url);
      // 获取模板列表
      this.api
        .getFileList({
          subPath: this.api.mxdPath,
          fileType: 'mxd'
        })
        .then((res) => {
          if (res.status === 200) {
            this.exportTypeOptions = [
              {
                value: 'canvas',
                label: '所见即所得'
              }
            ];
            let data = res.data;
            for (let item of data) {
              let label = item.replace('.mxd', '');
              this.exportTypeOptions.push({
                value: item,
                label: label
              });
            }
          }
        });
    },
    // 统一对外方法名称
    execute() {
      this.openDialog();
    },
    openDialog() {
      // 关闭绘制 I查询等事件
      Bus.$emit('interaction', this.$options._componentTag);
      this.isDialogShow = true;
      this.$nextTick(() => {
        this.$emit('start');
        // 记录地图原始数据
        this.mapScreenWidth = this.$map.getTargetElement().offsetWidth;
        this.mapScreenHeight = this.$map.getTargetElement().offsetHeight;
        this.originMapParent = this.$map.getTargetElement().parentNode;
        this.originMapParent.append(this.$refs.configContent);
        this.$refs.innerMap.prepend(this.$map.getTargetElement());
        // this.$map.getTargetElement().style.display = 'none'
        this.initScaleArray();
        this.getPageLayoutPro();
      });
    },
    closeDialog() {
      this.originMapParent.prepend(this.$map.getTargetElement());
      this.$map.updateSize();
      this.$emit('end');
      this.isDialogShow = false;
    },
    templateChange() {
      if (!this.isCanvas) {
        this.loadingInstance = Loading.service({
          target: this.$refs.configCard.$el,
          lock: true,
          text: '正在获取模板信息...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.2)'
        });
        this.api
          .getPageLayoutPro({
            mxdName: this.exportConfig.type
          })
          .then((res) => {
            this.loadingInstance.close();
            if (res.status === 200 && res.data.code === 200) {
              this.mxdExportTemplate.pageLayoutPro = JSON.parse(res.data.data);
              this.exportConfig.pageSize =
                this.mxdExportTemplate.pageLayoutPro.PagePro.PageSize;
              // 模板制图自定义面板
              if (this.exportConfig.pageSize === '自定义') {
                this.exportConfig.pageSize = 'A4';
                this.isCustom = true;
              } else {
                this.isCustom = false;
              }
              this.exportConfig.pageMode =
                this.mxdExportTemplate.pageLayoutPro.PagePro.PageOri === '横向'
                  ? 'Landscape'
                  : 'Portrait';
              this.mxdExportTemplate.TemplateName = this.exportConfig.type;
              // 其他元素
              let elementPros =
                this.mxdExportTemplate.pageLayoutPro.ElementPros;
              for (let elementPro of elementPros) {
                let elementName = elementPro.SizeAndPosition.ElementName;
                let value = elementPro.Text;
                if (elementName === '制图标题') {
                  this.$set(this.exportConfig, 'title', value);
                } else if (elementName === '制图作者') {
                  this.$set(this.exportConfig, 'author', value);
                }
              }
              this.getPageLayoutPro();
            }
          });
      } else {
        this.isCustom = true;
      }
    },
    initScaleArray() {
      this.scaleOptions = [];
      if (this.scales && this.scales.length > 0) {
        for (let scale of this.scales) {
          this.scaleOptions.push(scale);
        }
      } else {
        let maxResolution = this.$map.getView().getMaxResolution();
        let minZoom = this.$map.getView().getMinZoom();
        let maxZoom = this.$map.getView().getMaxZoom();
        let mpu = this.$map.getView().getProjection().getMetersPerUnit();
        let maxScale = (maxResolution * mpu) / 0.00028;
        let count = 0;
        for (let i = minZoom; i <= maxZoom; i++) {
          let scale = maxScale / Math.pow(2, count);
          let scaleStr = '1:' + parseInt(scale, 10);
          this.scaleOptions.push({
            value: scaleStr,
            label: scaleStr
          });
          count++;
        }
      }
    },
    scaleChanged(scale) {
      let scaleValue = scale.split(':')[1]
        ? scale.split(':')[1]
        : scale.split(':')[0];
      let resolution = this.$map.getResolutionFromScale(scaleValue);
      this.$map.getView().setResolution(resolution);
    },
    getPageLayoutPro() {
      // 获取到所见即所得面板
      if (this.printMapServiceConfig) {
        for (
          var index = 0;
          index < this.printMapServiceConfig.length;
          index++
        ) {
          var element = this.printMapServiceConfig[index];
          if (
            element.name ===
            this.exportConfig.pageSize + ' ' + this.exportConfig.pageMode
          ) {
            this.pageLayoutPro = element.pageLayoutPro;
            // console.log('匹配成功', this.pageLayoutPro)
            this.computeOutFrame();
            this.computeInnerFrame();
            this.computeTextElement();
            break;
          }
          // 当循环到最后一个时，扔没有匹配到，则没有获取到纸张信息
          if (index + 1 === this.printMapServiceConfig.length) {
            // 可自定义
            Message({
              message: '当前模板过大,预览效果与实际出图不一致,不影响出图效果',
              type: 'info',
              showClose: true
            });
          }
        }
      }
    },
    computeOutFrame() {
      this.oneCentimeterPixel = getCentimeter();
      if (this.oneCentimeterPixel) {
        // 模板纸张对应实际屏幕像素长宽
        this.outFrameStyle.width =
          parseFloat(this.pageLayoutPro.PagePro.PageWidth) *
          this.oneCentimeterPixel *
          0.994;
        this.outFrameStyle.height =
          parseFloat(this.pageLayoutPro.PagePro.PageHeight) *
          this.oneCentimeterPixel *
          0.994;
        // 计算纸张缩放比例,减20，是预留纸张与视图边框距离
        this.outFrameStyle.pageScaling = 1;
        var widthScaling =
          (this.mapScreenWidth - 20) / this.outFrameStyle.width;
        var heightScaling =
          (this.mapScreenHeight - 20) / this.outFrameStyle.height;
        // 如果地图长宽大于纸张，则不进行缩放，反之将纸张缩放到最小可视化
        if (widthScaling >= 1 && heightScaling >= 1) {
          this.outFrameStyle.pageScaling = 1;
        } else {
          if (1 - widthScaling > 1 - heightScaling) {
            this.outFrameStyle.pageScaling = widthScaling;
          } else {
            this.outFrameStyle.pageScaling = heightScaling;
          }
        }
        // pageScaling = pageScaling; //将缩放结果再缩小0.01，可以在屏幕中看清全图
        // this.zoomWholePage = this.pageScaling;
        // this.exportTemplateZoomComboBox.set("displayedValue", parseInt(this.pageScaling * 100) + "%");
        // 计算纸张距离左边和上边的停靠位置

        this.calcuPintPosition(this.outFrameStyle.pageScaling);
      }
    },
    /**
     * 绘制自定义制图内图框
     */
    computeInnerFrame: function () {
      var self = this;

      if (this.pageLayoutPro && this.pageLayoutPro.MapFramePro) {
        // 获取一厘米对应像素值
        if (!self.oneCentimeterPixel) {
          self.oneCentimeterPixel = getCentimeter();
        }

        var pMapFramePro = this.pageLayoutPro.MapFramePro;
        // 计算距离外图框的上左像素距离
        this.innerFrameStyle.leftPosition =
          (pMapFramePro.PageMarginsL * self.oneCentimeterPixel) / 2;
        this.innerFrameStyle.topPosition =
          (pMapFramePro.PageMarginsT * self.oneCentimeterPixel) / 2.35;
        // 获取内图框的长宽
        this.innerFrameStyle.width =
          parseFloat(
            this.pageLayoutPro.PagePro.PageWidth -
              pMapFramePro.PageMarginsL -
              pMapFramePro.PageMarginsR
          ) *
            self.oneCentimeterPixel +
          this.innerFrameStyle.leftPosition * 1.6;
        this.innerFrameStyle.height =
          parseFloat(
            this.pageLayoutPro.PagePro.PageHeight -
              pMapFramePro.PageMarginsT -
              pMapFramePro.PageMarginsB
          ) *
            self.oneCentimeterPixel +
          2.3 * this.innerFrameStyle.topPosition;

        this.$nextTick(() => {
          this.$map.updateSize();
        });
      }
    },

    /**
     * 添加模板要素信息
     */
    computeTextElement: function () {
      var self = this;
      if (self.pageLayoutPro && self.pageLayoutPro.ElementPros) {
        // 获取一厘米对应像素值
        if (!self.oneCentimeterPixel) {
          self.oneCentimeterPixel = getCentimeter();
        }
        // 获取的元素的相对位置是纸张的左下角
        // var pElementPros = self.pageLayoutPro.ElementPros;
        var pMapFramePro = self.pageLayoutPro.MapFramePro;
        var paperSize = self.pageLayoutPro.PagePro.PageSize;
        var leftPosition =
          (self.pageLayoutPro.MapFramePro.PageMarginsL *
            self.oneCentimeterPixel) /
          2;
        var outInnerWidth =
          parseFloat(
            self.pageLayoutPro.PagePro.PageWidth -
              pMapFramePro.PageMarginsL -
              pMapFramePro.PageMarginsR
          ) *
            self.oneCentimeterPixel +
          leftPosition * 1.6;
        var ztopPosition =
          (pMapFramePro.PageMarginsT * self.oneCentimeterPixel) / 2.35;
        var outInnerHeight =
          parseFloat(
            self.pageLayoutPro.PagePro.PageHeight -
              pMapFramePro.PageMarginsT -
              pMapFramePro.PageMarginsB
          ) *
            self.oneCentimeterPixel +
          2.3 * ztopPosition;
        // 标题
        var MapTitleLength = self.gblen(self.exportConfig.title) * 14;
        if (paperSize === 'A3') {
          self.titleStyle.bottomPosition = outInnerHeight + ztopPosition * 1.1;
        } else {
          self.titleStyle.bottomPosition = outInnerHeight + ztopPosition * 1.8;
        }
        self.titleStyle.leftPosition =
          leftPosition + outInnerWidth / 2 - MapTitleLength / 2;
        // 作者
        self.authorStyle.leftPosition = leftPosition;
        var authorFontSize = 22;
        self.authorStyle.bottomPosition = ztopPosition / 2 - authorFontSize / 2;
        // 比例尺
        self.scaleStyle.leftPosition = leftPosition + (outInnerWidth / 21) * 8;
        var scaleFontSize = 22;
        self.scaleStyle.bottomPosition = ztopPosition / 2 - scaleFontSize / 2;
        // 时间
        self.timeStyle.leftPosition =
          leftPosition +
          (outInnerWidth / 21) * 20.95 -
          11 * (9 + self.exportConfig.scale.length);
        var timeFontSize = 22;
        self.timeStyle.bottomPosition = ztopPosition / 2 - timeFontSize / 2;
      }
    },
    /**
     * 根据缩放比例，设置位置
     * @param {*} dScale
     */
    calcuPintPosition: function (dScale) {
      var parentWidth = this.mapScreenWidth;
      var scaleWidth = this.outFrameStyle.width * dScale;
      this.outFrameStyle.leftPosition =
        (this.outFrameStyle.width * (dScale - 1)) / 2 + 10;
      this.outFrameStyle.topPosition =
        (this.outFrameStyle.height * (dScale - 1)) / 2 + 10;
      if (scaleWidth + 20 < parentWidth) {
        this.outFrameStyle.leftPosition += (parentWidth - scaleWidth - 20) / 2;
      }
    },
    gblen: function (s) {
      var len = 0;
      for (var i = 0; i < s.length; i++) {
        if (s.charCodeAt(i) > 127 || s.charCodeAt(i) === 94) {
          len += 2;
        } else {
          len++;
        }
      }
      return len;
    },

    /**
     * 打印任务执行
     */
    printTaskExecute() {
      this.isDisableExport = true;
      this.loadingInstance = Loading.service({
        target: this.$refs.content,
        lock: true,
        text: '正在制图...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.5)'
      });
      if (this.isCanvas) {
        this.printByCanvas();
      } else {
        this.printByMxd();
      }
    },
    printByCanvas() {
      var self = this;
      var width;
      var height;
      var pdfWidth, pdfHeight, pdfName, pdfType, obj;
      // 取出每个template的长宽（英寸）,分辨率
      this.ExportMapTemplate.forEach((item) => {
        if (
          item.name ===
          self.exportConfig.pageSize + ' ' + self.exportConfig.pageMode
        ) {
          obj = item.name.split(' ');
          pdfName = obj[0].replace('A', 'a');
          obj[1] === 'Landscape' ? (pdfType = 'l') : (pdfType = 'p');
          pdfWidth = parseFloat(item.pageWidth);
          pdfHeight = parseFloat(item.pageHeight);
          width = parseFloat(item.pageWidth) / 2.54;
          height = parseFloat(item.pageHeight) / 2.54;
        }
      });
      // 算出缩放的比例等打印的参数
      var dpi = parseFloat(self.exportConfig.pixel);

      var format = self.exportConfig.format;
      // 当用户设置96附近的dpi的时候设置差不多的dpi 代替它，不然会造成图例有阴影
      if (dpi > 92 && dpi <= 98) {
        dpi = 92;
      } else if (dpi > 98 && dpi < 104) {
        dpi = 104;
      }
      // 理论上纸张大小对应的px宽高
      var canvasHeight = height * dpi;
      var canvasWidth = width * dpi;
      // var precent = parseFloat(self.exportTemplateZoomComboBox.displayedValue.replace("%", ""));
      var precent = 100;
      var zoom = precent / 100;
      // 实际还需考虑纸张缩放系数
      var scale = parseFloat(dpi / 96) / zoom;
      canvasWidth = canvasWidth / scale;
      canvasHeight = canvasHeight / scale;
      var targetDom = this.$refs.printOutFrame;
      let oldScale = this.outFrameStyle.pageScaling;
      this.outFrameStyle.pageScaling = 1;
      this.$nextTick(() => {
        html2canvas(targetDom, {
          backgroundColor: null,
          width: canvasWidth,
          height: canvasHeight,
          useCORS: true,
          imageTimeout: 0,
          allowTaint: false,
          scrollY: 0,
          scrollX: 0,
          scale: scale
          // onclone: (doc) => {
          //   var nodes;
          //   var mapLegendPanel = doc.getElementById("mapLegendPanel");
          //   mapLegendPanel.style.backgroundColor = "rgba(255,255,255,0.9)";
          //   //隐藏原来的图例标题
          //   var dojoxFloatingPaneTitle = doc.querySelectorAll("#mapLegendPanel  .dojoxFloatingPaneTitle")[0];
          //   dojoxFloatingPaneTitle.style.display = "none";
          //   //创建需要的图例标题
          //   var FloatingPaneTitle = doc.getElementById("FloatingPaneTitle");
          //   if (FloatingPaneTitle === null) {
          //     var FloatingPaneTitle = doc.createElement("div");
          //     FloatingPaneTitle.id = "FloatingPaneTitle";
          //     FloatingPaneTitle.innerHTML = "<span style='FontSize:20px'>图例</span>";
          //     FloatingPaneTitle.style.width = "100%";
          //     FloatingPaneTitle.style.height = "36px";
          //     FloatingPaneTitle.style.display = "flex";
          //     FloatingPaneTitle.style.justifyContent = "center";
          //     FloatingPaneTitle.style.alignItems = "center";
          //     mapLegendPanel.insertBefore(FloatingPaneTitle, mapLegendPanel.childNodes[0]);
          //   }
          //   // doc.getElementById("mapLegendPanel")[0].style.FontSize = "19px";
          //   //去掉图例的收缩
          //   var expandCtrl = doc.querySelectorAll(".expand-Ctrl");
          //   for (let i = 0; i < expandCtrl.length; i++) {
          //     expandCtrl[i].style.display = "none";
          //   }
          //   // var esriLegendServiceLabels = doc.querySelectorAll(".esriLegendServiceLabel");
          //   // for (let i = 0; i < esriLegendServiceLabels.length; i++) {
          //   //     esriLegendServiceLabels[i].className = "esriLegendLabel";
          //   // }
          //
          //   //得到所有的layer图层
          //   var map_layers = doc.querySelector("#map_layers");
          //   //删选出子元素中 opacity不等于1的元素
          //   if (map_layers) {
          //     let childNodes = map_layers.childNodes;
          //     if (childNodes && childNodes.length > 0) {
          //       for (let i = childNodes.length - 1; i >= 0; i--) {
          //         value = childNodes[i].style.getPropertyValue('opacity');
          //         if (value) {
          //           nodes = childNodes[i].childNodes;
          //           //创建一个canvas,修改透明度，然后在导出图片，以此修改透明度
          //           img = nodes[0];
          //           childNodes[i].removeChild(nodes[0]);
          //           var el = map_layers; // canvas的父元素
          //           var canvas = document.createElement('canvas') // 创建canvas元素
          //           el.appendChild(canvas) // 把canvas元素节点添加在el元素下
          //           ctx = canvas.getContext('2d') // 画布
          //           canvas.setAttribute('width', el.offsetWidth) // 将canvas元素设置与父元素同宽
          //           canvas.setAttribute('height', el.offsetHeight) //将canvas元素设置与父元素同高
          //           ctx.globalAlpha = parseFloat(value);
          //           ctx.drawImage(img, 0, 0);
          //           childNodes[i].appendChild(canvas);
          //         }
          //         ;
          //       }
          //     }
          //   }
          // },
        }).then(function (canvas) {
          // domStyle.set(wait, 'display', 'none');
          canvas.toBlob(function (blob) {
            self.outFrameStyle.pageScaling = oldScale;
            // if (self.title.trim() === "") {
            //   var myDate1 = new Date();
            //   var makeTime1 = myDate1.toLocaleDateString(); //获取当前日期
            //   self.title = makeTime1;
            // }
            if (format === 'PDF') {
              var pageData = canvas.toDataURL('image/png', 1.0);
              // eslint-disable-next-line new-cap
              var doc = new jspdf.jsPDF(pdfType, 'cm', pdfName);
              doc.addImage(pageData, 'PNG', 0, 0, pdfWidth, pdfHeight);

              var pdftitle = self.exportConfig.title + '.pdf';
              doc.save(pdftitle);
            } else {
              var imgtitle = self.exportConfig.title + '.png';
              saveAs(blob, imgtitle);
            }
            self.loadingInstance.close();
            self.isDisableExport = false;
          });
        });
      });
    },
    printByMxd() {
      this.mxdExportTemplate.DPI = this.exportConfig.pixel;
      this.mxdExportTemplate.ExportFormat = this.exportConfig.format;
      this.mxdExportTemplate.pageLayoutPro.PagePro.PageSize =
        this.exportConfig.pageSize;
      this.mxdExportTemplate.MapCenter =
        this.$map.getView().getCenter()[0] +
        ',' +
        this.$map.getView().getCenter()[1];
      this.mxdExportTemplate.MapDate = new Date().toLocaleDateString();
      let scaleValue = this.exportConfig.scale.split(':')[1]
        ? this.exportConfig.scale.split(':')[1]
        : this.exportConfig.scale.split(':')[0];
      this.mxdExportTemplate.Scale = scaleValue;
      let projCode = this.$map.getView().getProjection().getCode();
      this.mxdExportTemplate.spatialReference.wkid = projCode.split(':')[1];
      // 获取地块
      this.mxdExportTemplate.Shapes = [];
      let features = this.$map
        .getLayerById('drawLayer')
        .getSource()
        .getFeatures();
      let layerStyle = this.$map.getLayerById('drawLayer').getStyle();
      if (features && features.length > 0) {
        for (let feature of features) {
          let wkt = new WKT().writeFeature(feature);
          let style;
          if (typeof feature.getStyle() === 'function') {
            let result = feature.getStyle()(feature);
            style = result instanceof Array ? result[0] : result;
          } else {
            style = feature.getStyle() ? feature.getStyle() : layerStyle;
          }
          let borderColor = '1,255,0,0';
          let fillColor = '1,255,0,0';
          if (style) {
            let storkeStyleColor = style.getStroke()
              ? style.getStroke().getColor()
              : 'rgba(255,0,0,1)';
            let fillStyleColor = style.getFill()
              ? style.getFill().getColor()
              : 'rgba(255,0,0,1)';
            let storkeRbgaArr = getRgbaArray(colorRgba(storkeStyleColor, 1));
            let fillRbgaArr = getRgbaArray(colorRgba(fillStyleColor, 1));
            if (storkeRbgaArr && storkeRbgaArr.length === 4) {
              borderColor =
                storkeRbgaArr[3] +
                ',' +
                storkeRbgaArr[0] +
                ',' +
                storkeRbgaArr[1] +
                ',' +
                storkeRbgaArr[2];
            }
            if (fillRbgaArr && fillRbgaArr.length === 4) {
              fillColor =
                fillRbgaArr[3] +
                ',' +
                fillRbgaArr[0] +
                ',' +
                fillRbgaArr[1] +
                ',' +
                fillRbgaArr[2];
            }
          }

          let shape = {
            BorderColor: borderColor,
            BorderStyle: '0',
            BorderThinckness: 2,
            FillColor: fillColor,
            ShapeWKT: wkt
          };
          this.mxdExportTemplate.Shapes.push(shape);
        }
      }
      // 获取图层
      this.mxdExportTemplate.lyrUrls = [];
      let layers = this.$map.getLayers().getArray();
      for (let layer of layers) {
        let layerInfo = layer.values_.info;
        if (layerInfo) {
          let type = layerInfo.type.replace('wfs', 'wms');
          if (
            type === 'dynamic' ||
            type === 'geoserver-wms' ||
            type === 'wms'
          ) {
            let lyrUrl = {
              type: type,
              url: layerInfo.url,
              layers: layerInfo.visibleLayers
            };
            this.mxdExportTemplate.lyrUrls.push(lyrUrl);
          }
        }
      }
      // 生成装饰元素
      let elementPros = this.mxdExportTemplate.pageLayoutPro.ElementPros;
      for (let elementPro of elementPros) {
        let elementName = elementPro.SizeAndPosition.ElementName;
        if (elementName === '制图标题') {
          elementPro.Text = this.exportConfig.title;
        } else if (elementName === '制图作者') {
          elementPro.Text = this.exportConfig.author;
        } else if (elementName === '审核人员') {
          elementPro.Text = this.exportConfig.author;
        } else if (elementName === '制作日期') {
          elementPro.Text = new Date().toLocaleDateString();
        }
      }
      let params = {
        json: JSON.stringify([this.mxdExportTemplate])
      };
      this.api
        .print(params)
        .then((res) => {
          if (res.status === 200) {
            let fileName = res.data;
            // let filePath = this.api.filePath + "\\" + res.data.data
            this.api
              .getFile({
                filePath: fileName
              })
              .then((fileRes) => {
                if (fileRes.status === 200) {
                  var file = new Blob([fileRes.data], {
                    type: 'text/plain;charset=utf-8'
                  });
                  saveAs(file, fileName);
                }
                this.loadingInstance.close();
                this.isDisableExport = false;
              });
          } else {
            this.loadingInstance.close();
            this.isDisableExport = false;
            let message = res.data ? res.data.message : '服务连接失败';
            Message({
              message: message,
              type: 'error',
              showClose: true
            });
          }
        })
        .catch(() => {
          this.loadingInstance.close();
          this.isDisableExport = false;
        });
    }
  }
};
</script>
