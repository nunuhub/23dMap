<template>
  <div v-show="shouldShow" class="sh-spatial-analysis3d">
    <general-bar
      :mode="mode"
      :drag-enable="dragEnable"
      :is-show.sync="visible"
      :position="position"
      :options="toolOptions"
      :theme="theme"
      :theme-style="barThemeStyle"
      @select="select"
      @change:isShow="onChangeIsShow"
    />
    <div id="charts_sa">
      <div id="echartsView_sa"></div>
      <div class="echartsView-closeBotton" @click="closeEchartsView"></div>
    </div>
    <general-container
      ref="container"
      :is-show="!!openDialog"
      :style-config="panelStyleConfig"
      :title="title"
      :position="panelPosition"
      :img-src="imgSrc"
      :theme="theme"
      @change:isShow="changeCard"
    >
      <div v-show="openDialog" class="spatialAnaContainer">
        <div>
          <!-- 要素编辑窗 -->
          <page-form
            :ref-obj.sync="formInfo.ref"
            :data="formInfo.data"
            :field-list="formInfo.fieldList"
            :rules="formInfo.rules"
            :label-width="formInfo.labelWidth"
            @handleEvent="handleEvent"
          >
          </page-form>
        </div>
      </div>
      <div v-show="formInfo.data.jieqiTableShow" id="jieqiTable">
        <label
          v-for="(item, index) in jieqiQueue"
          :key="index"
          class="jieqiLabel"
          @click="handleEvent('jieqi', $event)"
          >{{ item }}</label
        >
      </div>
    </general-container>
  </div>
</template>

<script>
import commom from 'shinegis-client-23d/src/mixins/common';
import generalBarProps from 'shinegis-client-23d/src/mixins/components/general-bar-props';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import PageForm from './page-form.vue';
import {
  VisibleAnalysis,
  ViewShedAnalysis,
  SunAnalysis,
  ControlHeightAnalysis,
  SkyLineAnalysis,
  TerrainAnalysis,
  FloodAnalysis,
  ClipAnalysis,
  ShadowRatioAnalysis,
  Utils
} from 'shinegis-client-23d/src/earth-core/Widget/SpatialAnalysis/index';
import * as echarts from 'echarts';
import dialogDrag from 'shinegis-client-23d/src/utils/dialogDrag';
import { formatLength } from 'shinegis-client-23d/src/earth-core/Tool/Util1';
import { getDateWithJq } from './jieqi.js';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import { Message } from 'element-ui';
import GeneralBar from 'shinegis-client-23d/packages/general-bar';
import { FieldLists as fieldLists, toolOptions } from './ui-config';

let vsa, cha, sun, cli, vis, sky, flo, ter, sra;
let currentEchartsId;
let SpatialAnalysis = {};
let FromCSS = Utils.getColor('fromCssColorString');
const TerrainString = { 坡度: 'slope', 坡向: 'aspect', 高程: 'elevation' };
class Debouncer {
  // 函数防抖器。
  constructor(step = 50) {
    this.step = step;
    this.timer = null;
    this.callback = () => {
      console.warn('请设置防抖的回调函数');
    };
  }
  active(callback) {
    clearTimeout(this.timer);
    this.callback = callback || this.callback;
    this.timer = setTimeout(() => {
      this.callback();
    }, this.step);
  }
}
let debouncer = new Debouncer();
export default {
  name: 'ShSpatialAnalysis3d',
  components: {
    PageForm,
    GeneralContainer,
    GeneralBar
  },
  directives: { dialogDrag },
  mixins: [commom, generalBarProps, emitter],
  props: {
    panelCardProps: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      defaultLayerName_vis: 'tempVisibleALayer',
      defaultLayerName_sun: 'tempSunALayer',
      defaultLayerName_vsa: 'tempViewShedALayer',
      defaultLayerName_cha: 'tempControlHeightALayer',
      defaultLayerName_cli: 'tempClipALayer',
      defaultLayerName_flo: 'tempFloodALayer',
      defaultLayerName_sky: 'tempSkyLineALayer',
      defaultLayerName_ter: 'tempTerrainALayer',
      defaultLayerName_sra: 'tempShadowRatioALayer',
      title: '',
      imgSrc: '',
      toolOptions: toolOptions,
      jieqiQueue: [
        '小寒',
        '大寒',
        '立春',
        '雨水',
        '惊蛰',
        '春分',
        '清明',
        '谷雨',
        '立夏',
        '小满',
        '芒种',
        '夏至',
        '小暑',
        '大暑',
        '立秋',
        '处暑',
        '白露',
        '秋分',
        '寒露',
        '霜降',
        '立冬',
        '小雪',
        '大雪',
        '冬至'
      ],
      openDialog: false,
      currentVS: {},
      last_analysisMode: null,
      formInfo: {
        data: {
          /* longitude: null,
          latitude: null, */
          lonAndLat: null,
          height: null,
          direction: null,
          visualRange: null,
          pitch: null,
          horizontalViewAngle: null,
          verticalViewAngle: null,
          cueLineColor: '#3388ff',
          visibleArea: true,
          visibleAreaColor: '#008000',
          invisibleArea: true,
          invisibleAreaColor: '#FF0000',
          additionalHeight: 0,
          // 控高
          relativeHeight: 0,
          altitude: null,
          groundHeight: null,
          showWarning: true,
          // 日照分析
          timePass: false,
          solarTermName: '',
          solarTermYear: 2022,
          startTime: new Date(2022, 7, 9, 9, 0),
          endTime: new Date(2022, 7, 9, 15, 0),
          currentTime: new Date(2022, 7, 9, 9, 0),
          currentRate: '1级',
          ShadowMode: null,
          TerrainShade: false,
          jieqiTableShow: false,
          // 通视分析
          obAltitude: null,
          obHeight: 1.7,
          // 淹没分析
          floodColor: '#6A7D7B',
          opacity_flo: 0.8,
          floodAltitude: null,
          // rain: false,
          // rainfall: "中雨",
          waterDepth: false,
          pick_method: 'model',
          // 天际线
          skyLine: false,
          // 地形
          slopeS: 0,
          slopeE: 90,
          elevationS: 0,
          elevationE: 880,
          colorS: '#ff0000',
          colorE: '#0000ff',
          terrain: false,
          spacing_ter: 50,
          width_ter: 2,
          contourColor: '#ff0000',
          terrainSelect: '高程',
          opacity_ter: 0.5,
          aspect: ['北', '西北', '西', '西南', '南', '东南', '东', '东北'],
          aspect_color: null,
          北: '#34AF00',
          西北: '#AAFF14',
          西: '#AEE900',
          西南: '#E9E932',
          南: '#E9E990',
          东南: '#FFAA00',
          东: '#FF780A',
          东北: '#FF320A',
          // using: '全部区域不参与分析', //启用
          analysisMode: 'all_on', // 分析模式
          // 阴影率
          position_sr: '',
          height_sr: null,
          sunshineRatio: null
        },
        fieldList: [],
        labelWidth: '80px'
      }
    };
  },
  computed: {
    shouldShow() {
      return this.currentView === 'earth';
    },
    panelStyleConfig() {
      return (
        this.panelCardProps?.styleConfig || {
          size: { overflow: 'visible' }
        }
      );
    },
    panelPosition() {
      return (
        this.panelCardProps?.position || {
          type: 'absolute',
          top: '100px',
          right: '135px'
        }
      );
    }
  },
  watch: {
    currentInteraction(name) {
      if (name !== this.$options.name) {
        //当视域分析进行时，被关闭，判断inProgress进行destroy
        vsa.drawControl.drawCtrl.polyline.entity?.inProgress && vsa.destroy();
        vsa.drawControl.stopDraw();
        cha.drawControl.stopDraw();
        vis.drawControl.stopDraw();
        flo.drawControl.stopDraw();
        ter.drawControl.stopDraw();
        sra.drawControl.stopDraw();
        let dt = cli.drawControl.draw();
        dt.stopDraw();
        flo.pickWaterDepth(false);
        if (vsa.pyramid) {
          vsa.props.viewer.entities.removeById(vsa.pyramid.id);
          vsa.pyramid = null;
        }
      }
    }
  },
  mounted() {
    if (this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
    // 隐藏剖面分析图表
    document.getElementById('charts_sa').hidden = true;
    window.addEventListener('resize', () => {
      this.myChart && this.myChart.resize();
    });
  },
  methods: {
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    changeCard(val) {
      if (!val) {
        this.closeOfClick();
      }
    },
    begin() {
      let viewer;
      viewer = this.$earth.viewer;
      this.initSpatialAnalysis(viewer);
    },
    initSpatialAnalysis(viewer3d) {
      let props = {
        viewer: viewer3d
      };
      if (SpatialAnalysis.visibleAnalysis) return;
      SpatialAnalysis.visibleAnalysis = new VisibleAnalysis({
        ...props,
        name: this.defaultLayerName_vis
      });
      SpatialAnalysis.viewShedAnalysis = new ViewShedAnalysis({
        ...props,
        name: this.defaultLayerName_vsa
      });
      SpatialAnalysis.controlHeightAnalysis = new ControlHeightAnalysis({
        ...props,
        name: this.defaultLayerName_cha
      });
      SpatialAnalysis.sunAnalysis = new SunAnalysis({
        ...props,
        name: this.defaultLayerName_sun
      });
      SpatialAnalysis.clipAnalysis = new ClipAnalysis({
        ...props,
        name: this.defaultLayerName_cli
      });
      SpatialAnalysis.floodAnalysis = new FloodAnalysis({
        ...props,
        name: this.defaultLayerName_flo
      });
      SpatialAnalysis.skyLineAnalysis = new SkyLineAnalysis({
        ...props,
        name: this.defaultLayerName_sky
      });
      SpatialAnalysis.terrainAnalysis = new TerrainAnalysis({
        ...props,
        name: this.defaultLayerName_ter
      });
      SpatialAnalysis.shadowRatioAnalysis = new ShadowRatioAnalysis({
        ...props,
        name: this.defaultLayerName_sra
      });

      vis = SpatialAnalysis.visibleAnalysis;
      sun = SpatialAnalysis.sunAnalysis;
      vsa = SpatialAnalysis.viewShedAnalysis;
      cha = SpatialAnalysis.controlHeightAnalysis;
      cli = SpatialAnalysis.clipAnalysis;
      flo = SpatialAnalysis.floodAnalysis;
      sky = SpatialAnalysis.skyLineAnalysis;
      ter = SpatialAnalysis.terrainAnalysis;
      sra = SpatialAnalysis.shadowRatioAnalysis;
      /*  wea = new Weather(viewer3d); */
      // 主要是绑定属性框。
      vis.callback = () => {
        this.dialogInition();
      };
      let drawctl = cha.drawControl;
      drawctl.on('draw-created', () => {
        // 绘制完成时初始化面板
        this.dialogInition();
      });
      drawctl.on('edit-move-point', () => {
        this.dialogInition();
      });

      sun.foo = () => {
        this.formInfo.data.currentTime = sun.isoTime;
      };
      // 淹没分析
      flo.drawControl.on('draw-created', () => {
        // 绘制完成时初始化面板
        this.dialogInition();
      });
      // 地形分析设置默认图例。
      ter.setLegend('aspect', ter._terrainLegendSample.aspect);
      ter.setLegend('slope', ter._terrainLegendSample.slope);
      ter.setLegend('elevation', ter._terrainLegendSample.elevation);

      this.setTerrainShadow(1); // 先开启地形阴影。
      let drawctl_cli = cli.drawControl.draw();
      drawctl_cli.on('edit-start', (e) => {
        let lists = this.formInfo.fieldList[0].formList[1][0].list;
        let data = lists.find((a) => {
          return a.id === e.entity.id;
        });
        data && this.setEchartsData(data);
      });
      cli.drawControl.draw().on('delete-feature', (entity) => {
        let entities = drawctl_cli.dataSource.entities;
        entity._totalLable && entities.remove(entity._totalLable);
        if (entity._arrLables && entity._arrLables?.length > 0) {
          for (let index = 0; index < entity._arrLables.length; index++) {
            const element = entity._arrLables[index];
            entities.remove(element);
          }
        }
        let arr = this.formInfo.fieldList[0].formList[1][0].list;
        let exist = arr.findIndex((e) => {
          return e.id === entity._id;
        });
        if (exist > -1) {
          arr.splice(exist, 1);
        }
      });
    },
    select(key) {
      // 终结上一次分析的过程，清除上一次分析的杂项。
      this.clear();
      // 用于阴影率分析暂时注释。
      sun && sun.clear();
      if (key === 'viewShed') {
        // 配置、打开对应空间分析的面板。
        this.formInfo.fieldList = this.clone(fieldLists[key]);
        this.openDialog = key;
      } else if (key === 'controlHeight') {
        this.formInfo.fieldList = this.clone(fieldLists[key]);
        this.openDialog = key;
      } else if (key === 'sun') {
        this.formInfo.fieldList = this.clone(fieldLists[key]);
        this.openDialog = key;
      } else if (key === 'visible') {
        this.formInfo.fieldList = this.clone(fieldLists[key]);
        this.openDialog = key;
      } else if (key === 'clip') {
        this.formInfo.fieldList = this.clone(fieldLists[key]);
        this.openDialog = key;
      } else if (key === 'flood') {
        this.formInfo.fieldList = this.clone(fieldLists[key]);
        this.openDialog = key;
      } else if (key === 'skyLine') {
        this.formInfo.fieldList = this.clone(fieldLists[key]);
        this.openDialog = key;
      } else if (key === 'terrain') {
        this.formInfo.fieldList = this.clone(fieldLists[key]);
        this.openDialog = key;
        this.handleEvent('terrainSelect', '高程');
        ter._terrainLight(true);
      }
      const { name, img } = this.toolOptions.find((e) => {
        return e.key === key;
      });
      this.title = name;
      this.imgSrc = img;
      this.formInfo.data.jieqiTableShow = false;
      this.$refs.container.changeShow(true);
    },
    closeOfClick() {
      if (this.openDialog === 'sun') {
        // 关闭日照分析时，
        sun.setShadowMode(false);
        sun.setTerrainShade(false);
        this.formInfo.data.ShadowMode = false;
        this.formInfo.data.TerrainShade = false;
      }
      this.clear();
      this.openDialog = false;
    },
    execute(type) {
      const temp = this.openDialog;
      this.openDialog = type || this.openDialog;
      switch (this.openDialog) {
        case 'viewShed': {
          // this.clear();
          vsa.clear();
          // 绘制前将'附加高度'重置。
          this.$set(this.formInfo.data, 'additionalHeight', null);
          vsa.drawLine((e) => {
            vsa.clearDraw();
            const positions = e.polyline.positions.getValue();
            const start = positions[0];
            const end = positions[1];
            // 记录下当前视域的原点与中止点。 用于相对高度。
            this.currentVS.originalP = start.clone();
            this.currentVS.end = end.clone();

            vsa.start(start, end);
            this.dialogInition(); // 配置属性窗上数据
          });
          break;
        }
        case 'controlHeight': {
          // this.clear();
          cha.clear();
          cha.start(true);
          break;
        }
        case 'visible': {
          // this.clear();
          vis.clear();
          // vis.drawLine();
          vis.drawLine((e) => {
            const positions = e.polyline.positions.getValue();
            const start = [positions[0]];
            const end = positions[1];
            vis.start(start, end);
          });
          break;
        }
        case 'clip': {
          // 配置剖面分析行为
          // cli.clear();
          let _this = this;
          // let a = cli.drawControl.draw();
          let attrs;
          let tempId;
          cli.drawLine(
            function showSectionResult(param) {
              // 两个回调的参数还不一样。
              if (param.arrHB && param.arrHB.length) {
                param.id = tempId || param.id;
                _this.setEchartsData(param);
                // 往结果栏里塞一条记录。(先检查是否存在该记录)
                let arr = _this.formInfo.fieldList[0].formList[1][0].list;
                let exist = arr.findIndex((e) => {
                  return e.id === tempId;
                });

                attrs = { a: '属性列表' };
                attrs.height =
                  cli.prop.viewer.camera.positionCartographic.height.toFixed(1);
                attrs.direction = _this
                  .toDegrees(cli.prop.viewer.camera.heading)
                  .toFixed(0);
                attrs.pitch = _this
                  .toDegrees(cli.prop.viewer.camera.pitch)
                  .toFixed(0);
                attrs.longitude = _this
                  .toDegrees(
                    cli.prop.viewer.camera.positionCartographic.longitude
                  )
                  .toFixed(4);
                attrs.latitude = _this
                  .toDegrees(
                    cli.prop.viewer.camera.positionCartographic.latitude
                  )
                  .toFixed(4);
                param.attrs = attrs;
                if (exist > -1) {
                  arr.splice(exist, 1, param);
                } else arr.unshift(param);
              }
            },
            function showSectionResult(str, entity) {
              tempId = entity.id;
            }
          );
          break;
        }
        case 'flood': {
          // this.clear();
          flo.clear();
          flo.floodDraw();
          // 当绘制后，“拾取深度”按钮的选中，取消掉。
          this.formInfo.data.waterDepth = false;
          break;
        }
      }
      this.openDialog = temp;
      this.$emit('change:active', true);
    },
    clear(type) {
      const temp = this.openDialog;
      this.openDialog = type || this.openDialog;
      ter.drawControl.clearDraw();
      ter._terrainLight(false);
      switch (this.openDialog) {
        case 'viewShed': {
          // vsa.pitch = 0;
          vsa.destroy();
          break;
        }
        case 'controlHeight': {
          cha.destroy();
          break;
        }
        case 'sun': {
          sun.clear();
          sra.clear();
          let viewer = sun.prop.viewer;
          viewer.shine.ol3d && viewer.shine.ol3d.setBlockCesiumRendering(false);
          // 其实还应考虑这样的用户操作。 即正在进行日照分析，不点关闭直接切换到二维。 那么是否该监听，并做clear。
          break;
        }
        case 'visible': {
          vis.clear();
          // 也清除观察点和被观察点
          vis.obHeight = 1.7;
          vis.viewStart = [];
          break;
        }
        case 'clip': {
          cli.clear();
          this.formInfo.fieldList[0].formList[1][0].list = [];
          // 同时关闭图标窗
          this.closeEchartsView();
          document.getElementById('layui-layer5').hidden = true;
          break;
        }
        case 'flood': {
          flo.clear();
          flo.color = '#6A7D7B';
          this.formInfo.data.waterDepth = false;
          break;
        }
        case 'terrain': {
          ter.regionPolygonsEnabled = false;
          ter.updateMaterial({
            hasContour: false,
            selectedShading: 'none'
          });

          break;
        }
        case 'skyLine': {
          sky.clear();
        }
      }
      // 同时面板清空
      this.dialogInition('CleanUp');
      this.openDialog = temp;
      this.$emit('change:active', false);
    },
    clearAll() {
      this.deactivate();
    },
    deactivate() {
      // 清除地图上所有绘制留存
      vsa.destroy();
      cha.destroy();
      sun.clear();
      sra.clear();
      vis.clear();
      cli.clear();
      this.closeEchartsView();
      flo.clear();
      sky.clear();
      ter.updateMaterial({
        hasContour: false,
        selectedShading: 'none'
      });
      this.$refs.container.changeShow(false);
    },
    dialogInition(flag) {
      // 属性面板初始化 该方法有两种状况，一是清空，二是设值。
      // 观察者信息
      switch (this.openDialog) {
        case 'visible': {
          this.setDialogProps_vis(flag);
          break;
        }
        case 'viewShed': {
          this.setDialogProps_vsa(flag);
          break;
        }
        case 'controlHeight': {
          this.setDialogProps_cha(flag);
          break;
        }
        case 'sun': {
          this.setDialogProps_sun(flag);
          break;
        }
        case 'flood': {
          this.setDialogProps_flo(flag);
          break;
        }
        case 'terrain': {
          this.setDialogProps_ter(flag);
          break;
        }
        case 'skyLine': {
          this.setDialogProps_sky(flag);
          break;
        }
      }
    },
    setDialogProps_vis(flag) {
      if (flag === 'CleanUp') {
        this.formInfo.data.obAltitude = null;
        this.formInfo.data.obHeight = 1.7;
        return;
      }
      let altitude = Number(vis.obAltitude) + (Number(vis.obHeight) || 0);
      altitude = altitude.toFixed(2);
      this.formInfo.data.obAltitude = altitude;
      this.formInfo.data.obHeight = vis.obHeight;
    },
    setDialogProps_vsa(flag) {
      if (flag === 'CleanUp') {
        /* this.formInfo.data.longitude = null;
        this.formInfo.data.latitude = null; */
        this.formInfo.data.lonAndLat = null;
        this.formInfo.data.height = null;
        this.formInfo.data.visibleArea = true;
        this.formInfo.data.invisibleArea = true;
        this.formInfo.data.visibleAreaColor = '#008000';
        this.formInfo.data.invisibleAreaColor = '#ff0000';
        this.formInfo.data.cueLineColor = '#3388ff';
        vsa['visibleAreaColor'] = FromCSS('#008000');
        vsa['invisibleAreaColor'] = FromCSS('#ff0000');
        vsa.cueLineColor = FromCSS('#3388ff');
        // -------------
        this.formInfo.data.additionalHeight = null;
        this.formInfo.data.direction = null;
        this.formInfo.data.visualRange = null;
        this.formInfo.data.pitch = null;
        this.formInfo.data.horizontalViewAngle = null;
        this.formInfo.data.verticalViewAngle = null;
        return;
      }
      let viewPosition = vsa.viewPosition && vsa.viewPosition.clone();
      if (viewPosition) {
        let coordinate = Utils.cartesianToLonLatHeight(viewPosition);
        let numberString =
          coordinate[0].toFixed(5) + ' , ' + coordinate[1].toFixed(5);
        this.formInfo.data.lonAndLat = numberString;
        this.formInfo.data.height = coordinate[2].toFixed(2);
      }

      // 参数设置direction visualRange pitch horizontalViewAngle verticalViewAngle
      // this.formInfo.data.additionalHeight = 0;

      this.formInfo.data.direction = vsa.direction;
      this.formInfo.data.visualRange = vsa.visualRange;
      this.formInfo.data.pitch = vsa.pitch;
      this.formInfo.data.horizontalViewAngle = vsa.horizontalViewAngle;
      this.formInfo.data.verticalViewAngle = vsa.verticalViewAngle;

      // 颜色设置
      this.formInfo.data.cueLineColor = vsa.cueLineColor.toCssHexString();
      this.formInfo.data.visibleAreaColor =
        vsa.visibleAreaColor.toCssHexString();
      this.formInfo.data.invisibleAreaColor =
        vsa.invisibleAreaColor.toCssHexString();
    },
    setDialogProps_cha(flag) {
      if (flag === 'CleanUp') {
        this.formInfo.data.relativeHeight = 30;
        this.formInfo.data.altitude = null;
        this.formInfo.data.groundHeight = null;
        this.formInfo.data.showWarning = true;
        cha.extrudedHeight = 30;
        return;
      }
      let n = cha.height1 - cha.height2;
      this.formInfo.data.relativeHeight = n.toFixed(2);
      this.formInfo.data.altitude = cha.height1;
      this.formInfo.data.groundHeight = cha.height2;
      this.formInfo.data.showWarning = cha.warningShow;
    },
    setDialogProps_sun(flag) {
      if (flag === 'CleanUp') {
        this.formInfo.data.currentTime = null;
        this.formInfo.data.currentRate = '1级';
        sun.setTerrainShade(false);
        sun.setShadowMode(false);
        this.formInfo.data.TerrainShade = false;
        this.formInfo.data.ShadowMode = false;

        this.formInfo.data.sunshineRatio = '';
        this.formInfo.data.position_sr = '';
        this.formInfo.data.height_sr = '';
        this.formInfo.data.sunshinePeriod = '';
        return;
      }
      this.formInfo.data.ShadowMode = sun.prop.viewer.shadows;
      this.formInfo.data.TerrainShade = sun.prop.viewer.scene.globe.shadows;
    },
    setDialogProps_flo(flag) {
      if (flag === 'CleanUp') {
        this.formInfo.data.floodColor = '#6A7D7B';
        this.formInfo.data.floodAltitude = null;
        this.formInfo.data.opacity_flo = 0.8;
        return;
      }
      let c = FromCSS(flo.color);
      c.alpha = 1;
      this.formInfo.data.floodColor = c.toCssHexString();
      this.formInfo.data.floodAltitude = flo.height.toFixed(3);
    },
    setDialogProps_ter(flag) {
      if (flag === 'CleanUp') {
        let data = this.formInfo.data;
        data.terrain = false;
        data.terrainSelect = null;

        data.slopeS = 0;
        data.slopeE = 90;
        data.elevationS = 0;
        data.elevationE = 880;
        data.colorS = '#ff0000';
        data.colorE = '#0000ff';
        data.spacing_ter = 50;
        data.width_ter = 2;
        data.contourColor = '#ff0000';
        data.opacity_ter = 0.5;
        data.aspect = ['北', '西北', '西', '西南', '南', '东南', '东', '东北'];
        data.aspect_color = null;
        data.analysisMode = 'all_on';
        data['北'] = '#34AF00';
        data['西北'] = '#AAFF14';
        data['西'] = '#AEE900';
        data['西南'] = '#E9E932';
        data['南'] = '#E9E990';
        data['东南'] = '#FFAA00';
        data['东'] = '#FF780A';
        data['东北'] = '#FF320A';
        ter.setLegend('aspect', ter._terrainLegendSample.aspect);
        ter.setLegend('slope', ter._terrainLegendSample.slope);
        ter.setLegend('elevation', ter._terrainLegendSample.elevation);
        //重置地形分析的区域
        ter.hierarchys = [ter._smallRegion];
        ter.regionPolygonsEnabled = false;
        return;
      }
    },
    setDialogProps_sky(flag) {
      if (flag === 'CleanUp') {
        this.formInfo.data.skyLine = false;
        return;
      }
    },
    setTerrainShadow(flag) {
      // 地形阴影
      let viewer = vsa.prop.viewer;
      /*  Cesium.ShadowMode = {DISABLED: 0,ENABLED: 1} */
      viewer.scene.globe.shadows = flag ? 1 : 0;
    },
    handleEvent(value, num) {
      switch (value) {
        case 'cueLineColor': {
          // vsa.changePyrdColor(num);
          vsa.cueLineColor = num;
          break;
        }
        case 'invisibleArea':
        case 'visibleArea': {
          let mark =
            value === 'visibleArea' ? 'visibleAreaColor' : 'invisibleAreaColor';
          if (num) {
            let colorChar = vsa[mark].toCssHexString();
            if (colorChar.length === 9) colorChar = colorChar.slice(0, -2);
            this.formInfo.data[mark] = colorChar;

            let color = vsa[mark] && vsa[mark].clone();
            color.alpha = 1;
            vsa[mark] = color;
          } else {
            // this.formInfo.data[mark] = null;
            let color = vsa[mark] && vsa[mark].clone();
            color.alpha = 0;
            vsa[mark] = color;
          }
        }
        // eslint-disable-next-line no-fallthrough
        case 'visibleAreaColor':
        case 'invisibleAreaColor': {
          if (value.includes('isibleAreaColor')) {
            let showStr = value.replace('Color', '');
            let show = this.formInfo.data[showStr];
            let color = FromCSS(num);
            if (show) {
              color.alpha = 1;
            } else {
              color.alpha = 0;
            }
            vsa[value] = color;
            // 当视域分析已绘制时才更新颜色。
            // vsa.pyramid && vsa._updateViewShed();
          }
        }
        // eslint-disable-next-line no-fallthrough
        case 'additionalHeight':
        case 'visualRange':
        case 'horizontalViewAngle':
        case 'direction':
        case 'pitch':
        case 'verticalViewAngle': {
          if (vsa.pyramid) {
            const data = this.formInfo.data;
            let additionalHeight = data.additionalHeight;
            let visualRange = data.visualRange;
            let horizontalViewAngle = data.horizontalViewAngle;
            let verticalViewAngle = data.verticalViewAngle;
            let direction = data.direction;
            let pitch = data.pitch;
            if (
              additionalHeight == null ||
              visualRange == null ||
              horizontalViewAngle == null ||
              verticalViewAngle == null ||
              direction == null ||
              pitch == null
            )
              return;
            debouncer.active(() => {
              let p = vsa.viewPosition.clone();
              p = Utils.upPosition(vsa.prop.viewer, p, additionalHeight);
              vsa.viewPosition = p;
              if (visualRange <= 0) {
                data.visualRange = 1;
              }
              vsa.visualRange = data.visualRange;
              vsa.horizontalViewAngle = horizontalViewAngle;
              vsa.direction = direction;
              vsa.pitch = pitch;
              vsa.verticalViewAngle = verticalViewAngle;
              vsa._updateViewShed();
              p = Utils.upPosition(vsa.prop.viewer, p, -additionalHeight);
              vsa.viewPosition = p;
            });
          }

          break;
        }
        // 控高分析
        case 'relativeHeight': {
          cha.extrudedHeight = num;
          if (cha.curEnt) {
            cha.setHeight(num);
            cha.curEnt.editing.changePositionsToCallback();
            cha.curEnt.editing.updateDraggers();
            this.formInfo.data.altitude = cha.height1;
          }
          break;
        }
        case 'startTime': {
          this.formInfo.data.solarTermName = '';
          let [s, c, e] = [
            this.formInfo.data.startTime,
            this.formInfo.data.currentTime,
            this.formInfo.data.endTime
          ];
          if (s <= e) {
            // 顺带检测并设置下当前时间。
            if (c < s || c > e) {
              // 当前时间在范围之外。
              this.formInfo.data.currentTime = s;
              let JulianDate = Utils.JulianDate;
              sun.prop.viewer.clock.currentTime = JulianDate.fromDate(
                this.formInfo.data.currentTime
              );
            }

            let timeObj = {
              start: this.formInfo.data.startTime,
              end: this.formInfo.data.endTime
            };
            sun.setTime(timeObj);
            sra.setPeriod(
              this.formInfo.data.startTime,
              this.formInfo.data.endTime
            );
          } else {
            Message({
              message: '时间错误，开始应在结束之前',
              type: 'warning'
            });
            this.formInfo.data.startTime = null;
          }
          break;
        }
        case 'endTime': {
          this.formInfo.data.solarTermName = '';
          let [s, c, e] = [
            this.formInfo.data.startTime,
            this.formInfo.data.currentTime,
            this.formInfo.data.endTime
          ];
          if (s <= e) {
            // 顺带检测并设置下当前时间。
            if (c < s || c > e) {
              // 当前时间在范围之外。
              this.formInfo.data.currentTime = s;
              let JulianDate = Utils.JulianDate;
              sun.prop.viewer.clock.currentTime = JulianDate.fromDate(
                this.formInfo.data.currentTime
              );
            }

            let timeObj = {
              start: this.formInfo.data.startTime,
              end: this.formInfo.data.endTime
            };
            sun.setTime(timeObj);
            sra.setPeriod(
              this.formInfo.data.startTime,
              this.formInfo.data.endTime
            );
          } else {
            Message({
              message: '时间错误，开始应在结束之前',
              type: 'warning'
            });
            this.formInfo.data.endTime = null;
          }
          break;
        }
        case 'currentTime': {
          if (num === 'focus') {
            sun.sunStop();
            break;
          }
          // 当前时间如果在起终点外，则替换而扩大区间。
          // ‘当前时间’选好时间后。 以它为起点开始日照分析。
          let [s, c, e] = [
            this.formInfo.data.startTime,
            this.formInfo.data.currentTime,
            this.formInfo.data.endTime
          ];

          this.formInfo.data.startTime = s < c ? s : c;
          this.formInfo.data.endTime = e > c ? e : c;
          let timeObj = {
            start: this.formInfo.data.startTime,
            end: this.formInfo.data.endTime
          };
          sun.setTime(timeObj);
          sra.setPeriod(
            this.formInfo.data.startTime,
            this.formInfo.data.endTime
          );
          sun.start(true);
          let JulianDate = Utils.JulianDate;
          sun.prop.viewer.clock.currentTime = JulianDate.fromDate(
            this.formInfo.data.currentTime
          );
          if (this.formInfo.data.timePass === false) {
            sun.sunStop(true);
          }
          break;
        }

        case 'start': {
          let btn = document.getElementById('playBtn');
          btn.className =
            btn.className === 'btn btn1' ? 'btn btn3' : 'btn btn1';
          let status = btn.className === 'btn btn1' ? 'pause' : 'play';

          if (status === 'play') {
            // 播放，同时打开建筑阴影和地形阴影
            this.formInfo.data.timePass = true;
            sun.setTerrainShade(num);
            sun.setShadowMode(num);
            this.formInfo.data.TerrainShade = true;
            this.formInfo.data.ShadowMode = true;
            let rate = this.formInfo.data.currentRate[0] * 300;
            rate = rate === 1500 ? 2400 : rate;
            sun.setTimeMultiplier(rate, false);
            let timeObj = {
              start: this.formInfo.data.currentTime,
              end: this.formInfo.data.endTime
            };
            sun.setTime(timeObj);
            sra.setPeriod(
              this.formInfo.data.startTime,
              this.formInfo.data.endTime
            );
            sun.start(true);
            sun.prop.viewer.clock.shouldAnimate = true;
            let viewer = sun.prop.viewer;
            viewer.shine.ol3d &&
              viewer.shine.ol3d.setBlockCesiumRendering(true);
          } else {
            // 暂停
            this.formInfo.data.timePass = false;
            sun.prop.viewer.clock.shouldAnimate = false;
          }
          break;
        }
        case 'stop': {
          // 日照分析停止播放。 播放、时间、速率归位。
          let btn = document.getElementById('playBtn');
          btn.className = 'btn btn1';
          sun.clear();
          this.formInfo.data.currentTime = this.formInfo.data.startTime;
          this.formInfo.data.currentRate = '1级';
          sun.prop.viewer.clock.shouldAnimate = false;
          sun.prop.viewer.shine.ol3d &&
            sun.prop.viewer.shine.ol3d.setBlockCesiumRendering(false);
          // 同时关闭阴影  0928
          this.formInfo.data.ShadowMode =
            this.formInfo.data.TerrainShade = false;
          sun.setShadowMode(false);
          sun.setTerrainShade(false);
          break;
        }
        case 'currentRate': {
          /* let rate = num ;
          rate = rate === 1500 ? 2400 : rate; */
          sun.setTimeMultiplier(num, false);
          break;
        }
        case 'ShadowMode': {
          sun.setShadowMode(num);
          break;
        }
        case 'TerrainShade': {
          sun.setTerrainShade(num);
          break;
        }
        case 'jieqi': {
          let mark = num.target.innerText;
          this.formInfo.data.solarTermName = mark;
          this.formInfo.data.jieqiTableShow =
            !this.formInfo.data.jieqiTableShow;
          let year = this.formInfo.data.solarTermYear || 2022;
          let date = getDateWithJq(year, mark);
          let { month, day } = date;
          this.formInfo.data.currentTime = this.formInfo.data.startTime =
            new Date(year, month - 1, day, 9, 0);
          this.formInfo.data.endTime = new Date(year, month - 1, day, 15, 0);

          let timeObj = {
            start: this.formInfo.data.currentTime,
            end: this.formInfo.data.endTime
          };
          sun.setTime(timeObj);
          sra.setPeriod(
            this.formInfo.data.startTime,
            this.formInfo.data.endTime
          );
          break;
        }
        case 'solarTermBtn': {
          // 开关节气小窗
          this.formInfo.data.jieqiTableShow =
            !this.formInfo.data.jieqiTableShow;
          break;
        }
        case 'shadowRatio': {
          sra.clear();
          sra.drawPolygon(this);
          break;
        }
        case 'shadowRatio_rawAlgorithm': {
          sra.clear();
          sra.drawPolygon_rawAlgorithm();
          break;
        }
        case 'shadowRatio_clear': {
          sra.clear();
          break;
        }
        case 'execute': {
          this.execute();
          break;
        }
        case 'addOBpoint': {
          if (vis.viewStart.length === 0) return;
          vis.drawPoint((e) => {
            let p = e.position.getValue();
            vis.viewStart.push(p);
            vis.start();
          });
          break;
        }
        case 'obHeight': {
          // 当没绘制的时候，直接过。
          vis.obHeight = num;
          if (vis.viewStart.length) {
            vis.start();
          }
          break;
        }
        case 'clear': {
          this.clear();
          break;
        }
        case 'showWarning': {
          cha.setWarningShow(num);
          break;
        }
        case 'floClear': {
          flo.clear();
          this.formInfo.data.waterDepth = false;
          break;
        }
        case 'floodColor':
        case 'opacity_flo': {
          let check = flo.prop.waters.length;
          let color = this.formInfo.data.floodColor;
          let opacity = this.formInfo.data.opacity_flo;
          if (check) {
            color = FromCSS(color);
            color.alpha = opacity;
            color = color.toCssHexString();
            flo.setWaterProp({ color });
          }
          break;
        }
        case 'floodAltitude': {
          if (flo.prop.waters.length) {
            flo.setWaterProp({ height: num });
          }
          break;
        }
        case 'waterDepth': {
          let flag = this.formInfo.data.waterDepth;
          this.formInfo.data.waterDepth = !flag;
          flo.pickWaterDepth(!flag);
          break;
        }
        case 'pick_method': {
          flo.pick_method = num;
          break;
        }
        case 'skyLine': {
          sky.start(num);
          break;
        }
        case 'colorS':
        case 'colorE': {
          this.formInfo.data[value] = num;
        }
        // eslint-disable-next-line no-fallthrough
        case 'slopeS':
        case 'slopeE':
        case 'elevationS':
        case 'elevationE':
        case 'opacity_ter': {
          if (!(this.formInfo.data.colorS && this.formInfo.data.colorE)) return;
          let s, e;
          let length = this.formInfo.fieldList[0].formList.length;
          let type = this.formInfo.data.terrainSelect;
          type = TerrainString[type];

          if (type === 'elevation') {
            [s, e] = [
              this.formInfo.data.elevationS,
              this.formInfo.data.elevationE
            ];
            this.formInfo.fieldList[0].formList[length - 4][0].min = s;
            this.formInfo.fieldList[0].formList[length - 5][0].max = e;
          } else if (type === 'slope') {
            [s, e] = [this.formInfo.data.slopeS, this.formInfo.data.slopeE];
            this.formInfo.fieldList[0].formList[length - 4][0].min = s;
            this.formInfo.fieldList[0].formList[length - 5][0].max = e;
          } else if (type === 'aspect') {
            ter._terrainLegend.aspect.opacity = this.formInfo.data.opacity_ter;
            this.handleEvent('terrain');
            break;
          }

          let [m1, m2, m3] = [
            s + ((e - s) * 1) / 4,
            s + ((e - s) * 2) / 4,
            s + ((e - s) * 3) / 4
          ];
          let [s_c, e_c] = [
            this.formInfo.data.colorS,
            this.formInfo.data.colorE
          ];
          let lerp = Utils.getColor('lerp');
          let [c1, c2] = [FromCSS(s_c), FromCSS(e_c)];

          let [m1_c, m2_c, m3_c] = [
            lerp(c1, c2, 1 / 4, c1.clone()),
            lerp(c1, c2, 2 / 4, c1.clone()),
            lerp(c1, c2, 3 / 4, c1.clone())
          ];
          let [cStr1, cStr2, cStr3, cStr4, cStr5] = [
            c1.toCssHexString(),
            m1_c.toCssHexString(),
            m2_c.toCssHexString(),
            m3_c.toCssHexString(),
            c2.toCssHexString()
          ];
          let Ramp0, Ramp1;
          Ramp0 = cStr1;
          Ramp1 = cStr5;
          let unit = type === 'slope' ? '(单位：度)' : '(单位：米)';
          let opacity = this.formInfo.data.opacity_ter;
          let obj = {
            stop: [s, m1, m2, m3, e],
            color: [cStr1, cStr2, cStr3, cStr4, cStr5],
            unit: unit,
            opacity: opacity
          };
          // 设置下色带。
          let c = document.getElementById('colorRamp');
          if (c) {
            let ctx = c.getContext('2d');
            let grd = ctx.createLinearGradient(0, 0, 120, 24);
            grd.addColorStop(0, Ramp0);
            grd.addColorStop(0.25, cStr2);
            grd.addColorStop(0.5, cStr3);
            grd.addColorStop(0.75, cStr4);
            grd.addColorStop(1, Ramp1);

            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 120, 24);
          }

          ter.setLegend(type, obj);
          debouncer.active(() => {
            this.handleEvent('terrain');
          });

          break;
        }
        case 'aspect_color_single': {
          let legend = ter._terrainLegend.aspect;
          let aspect = num.aspect;
          let index;
          index = legend.direction.findIndex((e) => {
            return e === aspect;
          });
          legend.color[index] = num.color;
          this.handleEvent('terrain');
          break;
        }
        case 'terrainSelect': {
          this.formInfo.data.terrainSelect = num;
          this.switchSlopeAndElevation(TerrainString[num]);
          ter.drawControl.clearDraw();
          setTimeout(() => {
            this.handleEvent('opacity_ter');
          }, 50);
          break;
        }
        case 'aspect': {
          if (num.length === 1) {
            // 点坡向，改颜色仅在点第一个时生效。
            let legend = ter._terrainLegend.aspect;
            let direction = legend.direction;
            let index;
            index = direction.findIndex((e) => {
              return e === num[0];
            });
            this.formInfo.data.aspect_color = legend.color[index];
          }
          // 查看少了哪个，就将哪个的颜色透明度设为0,另外的设为1.
          let legend = ter._terrainLegend.aspect;
          let direction = legend.direction;
          direction.forEach((e, index) => {
            let check = num.includes(e);
            let color = legend.color[index];
            color = FromCSS(color);
            if (!check) {
              color.alpha = 0;
            } else {
              color.alpha = 1;
            }
            color = color.toCssHexString();
            legend.color[index] = color;
          });
          this.handleEvent('terrain');
          break;
        }
        case 'aspect_color': {
          let legend = ter._terrainLegend.aspect;
          let directions = this.formInfo.data.aspect;
          for (let d of directions) {
            let index;
            index = legend.direction.findIndex((e) => {
              return e === d;
            });
            legend.color[index] = num;
            this.formInfo.data[d] = num;
          }
          this.handleEvent('terrain');
          break;
        }

        case 'changeColor_ter': {
          // 随机颜色
          let color = Utils.getColor('fromRandom')({ alpha: 1 });
          let colorChar = color.toCssHexString();
          this.formInfo.data.contourColor = colorChar;
        }
        // eslint-disable-next-line no-fallthrough
        case 'contourColor': {
          if (num !== 'click') {
            // rgb需要转化成16位的。
            let color = FromCSS(num).toCssHexString();
            this.formInfo.data.contourColor = color;
          }

          this.formInfo.data.contourColor = this.formInfo.data.contourColor
            ? this.formInfo.data.contourColor
            : 'rgb(255,0,0)';
          num = this.formInfo.data.contourColor;
          let color = FromCSS(num);
          let mark = TerrainString[this.formInfo.data.terrainSelect];
          mark = this.formInfo.data.analysisMode === 'all_off' ? 'none' : mark;
          let options = {
            contourColor: color,
            selectedShading: mark,
            contourSpacing: this.formInfo.data.spacing_ter,
            contourWidth: this.formInfo.data.width_ter,
            hasContour: this.formInfo.data.terrain
          };
          debouncer.active(() => {
            ter.updateMaterial(options);
          });

          break;
        }
        case 'analysisMode': {
          let flag = this.formInfo.data.analysisMode;
          let mark2 = this.formInfo.data.terrainSelect;
          if (flag === 'all_off') {
            ter.drawControl.clearDraw();
            if (mark2 === '坡向') {
              this.formInfo.data.aspect = null;
            }
          } else if (flag === 'all_on') {
            ter.hierarchys = [ter._smallRegion];
            ter.regionPolygonsEnabled = false;
            ter.drawControl.clearDraw();
            if (mark2 === '坡向') {
              this.formInfo.data.aspect = [
                '北',
                '西北',
                '西',
                '西南',
                '南',
                '东南',
                '东',
                '东北'
              ];
              ter.setLegend('aspect', ter._terrainLegendSample.aspect);
            }
          } else if (flag === 'polygon') {
            ter.drawPolygon();
            ter.regionPolygonsEnabled = true;
            ter.hierarchys = [ter._smallRegion];
            if (
              mark2 === '坡向' /* mark === 'aspect' */ &&
              this.last_analysisMode === 'all_off'
            ) {
              this.formInfo.data.aspect = [
                '北',
                '西北',
                '西',
                '西南',
                '南',
                '东南',
                '东',
                '东北'
              ];
            }
          }
          this.last_analysisMode = flag;
        }
        // eslint-disable-next-line no-fallthrough
        case 'spacing_ter':
        case 'width_ter':
        case 'terrain': {
          this.formInfo.data.contourColor = this.formInfo.data.contourColor
            ? this.formInfo.data.contourColor
            : 'rgb(255,0,0)';
          num = this.formInfo.data.contourColor;
          let color = FromCSS(num);
          let mark = TerrainString[this.formInfo.data.terrainSelect];
          mark = this.formInfo.data.analysisMode === 'all_off' ? 'none' : mark;
          let options = {
            contourColor: color,
            selectedShading: mark,
            contourSpacing: this.formInfo.data.spacing_ter,
            contourWidth: this.formInfo.data.width_ter,
            hasContour: this.formInfo.data.terrain
          };
          ter.updateMaterial(options);
          break;
        }
        case 'addPolygon': {
          ter.regionPolygonsEnabled = true;
          ter.drawPolygon();
          break;
        }
        case 'openInfo': {
          // 信息框显示，并且设定好位置。
          let data = this.formInfo.fieldList[0].formList[1][0].list[num].attrs;
          data = data || {
            longitude: 120,
            latitude: 30,
            height: 500,
            direction: 26,
            pitch: -33
          };
          this.formInfo.fieldList[0].formList[1][0].info = data;
          let dom = document.getElementById('layui-layer5');
          dom.style.top = num * 42 + 42 + 'px';
          dom.style.left = '85px';
          dom.hidden = false;
          break;
        }
        case 'deleteMea': {
          let arr = this.formInfo.fieldList[0].formList[1][0].list;
          const id = arr[num].id;
          cli.drawControl.clearMeasureById(id);
          // 如果当前echarts即是删除的记录，则关掉echarts。
          id === currentEchartsId && this.closeEchartsView();
          // 关闭小信息窗。
          document.getElementById('layui-layer5').hidden = true;
          break;
        }
        case 'openEcharts': {
          let data = this.formInfo.fieldList[0].formList[1][0].list[num];
          this.setEchartsData(data);
          let drawTool = cli.drawControl.draw();
          let en = drawTool.dataSource.entities.getById(data.id);
          en && drawTool.startEditing(en);
          break;
        }
      }
    },
    setEchartsData(data) {
      currentEchartsId = data.id;
      document.getElementById('charts_sa').hidden = false;
      if (this.myChart == null) {
        this.myChart = echarts.init(
          document.getElementById('echartsView_sa'),
          'dark'
        );
      }
      var arrPoint = data.arrPoint;

      var option = {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        grid: {
          left: 10,
          right: 10,
          bottom: 10,
          containLabel: true
        },
        dataZoom: [
          {
            type: 'inside',
            throttle: 50
          }
        ],
        tooltip: {
          trigger: 'axis',
          formatter: function (params) {
            var inhtml = '';
            if (params.length === 0) return inhtml;

            // var hbgd = params[0].value; // 海拔高度
            var point = arrPoint[params[0].dataIndex]; // 所在经纬度
            params[0].axisValue = Number(params[0].axisValue);
            params[0].value = Number(params[0].value);
            inhtml +=
              '所在位置&nbsp;' +
              point.x +
              ',' +
              point.y +
              '<br />' +
              '距起点&nbsp;<label>' +
              formatLength(params[0].axisValue) +
              '</label><br />' +
              params[0].seriesName +
              "&nbsp;<label style='color:" +
              params[0].color +
              ";'>" +
              formatLength(params[0].value) +
              '</label><br />';

            return inhtml;
          }
        },
        xAxis: [
          {
            name: '行程',
            type: 'category',
            boundaryGap: false,
            axisLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            data: data.arrLen
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLabel: {
              rotate: 60,
              formatter: '{value} 米'
            }
          }
        ],
        series: [
          {
            name: '高程值',
            type: 'line',
            smooth: true,
            symbol: 'none',
            sampling: 'average',
            itemStyle: {
              normal: {
                color: 'rgb(255, 70, 131)'
              }
            },
            areaStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  {
                    offset: 0,
                    color: 'rgb(255, 158, 68)'
                  },
                  {
                    offset: 1,
                    color: 'rgb(255, 70, 131)'
                  }
                ])
              }
            },
            data: data.arrHB
          }
        ]
      };

      this.myChart.setOption(option);
    },
    closeEchartsView() {
      this.myChart && this.myChart.dispose();
      this.myChart = undefined;
      document.getElementById('charts_sa').hidden = true;
    },
    toDegrees(n) {
      return (n / Math.PI) * 180;
    },
    clone(a) {
      return JSON.parse(JSON.stringify(a));
    },
    switchSlopeAndElevation(type = 'slope') {
      //切换窗体结构，坡度坡向高程
      this.formInfo.fieldList[0].formList =
        fieldLists.getTerrainFieldListByType(type);
    },
    /** 获取空间分析功能实例，比如淹没分析、地形分析 */
    getAnalysisInstance(instance = 'flood') {
      switch (instance) {
        case 'flood':
          return flo;
        case 'visible':
          return vis;
        case 'viewShed':
          return vsa;
        case 'controlHeight':
          return cha;
        case 'sun':
          return sun;
        case 'clip':
          return cli;
        case 'skyLine':
          return sky;
        case 'terrain':
          return ter;
      }
      return;
    }
  }
};
</script>
