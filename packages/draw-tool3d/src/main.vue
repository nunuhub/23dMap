<template>
  <div v-show="shouldShow" class="sh-draw-tool3d">
    <general-bar
      :mode="mode"
      :is-show.sync="visible"
      :position="position"
      :options="toolOptions"
      :active-index="activeIndex"
      :theme="theme"
      :drag-enable="dragEnable"
      :theme-style="barThemeStyle"
      @select="select"
      @unselect="unselect"
      @change:isShow="onChangeIsShow"
    />
    <div v-show="appear_CEF">
      <general-container
        ref="container"
        :title="panelTitle ? panelTitle : '图上标绘'"
        :position="panelPosition"
        :style-config="panelStyleConfig"
        :img-src="panelImgSrc ? panelImgSrc : 'draw-tool'"
        :theme="theme"
        @change:isShow="changeCard"
      >
        <div v-if="appear_CEF" class="editorContainer">
          <div class="editorContainer_c">
            <page-form
              :ref-obj.sync="formInfo.ref"
              :data="formInfo.data"
              :field-list="formInfo.fieldList"
              :rules="formInfo.rules"
              :label-width="formInfo.labelWidth"
              @handleClick="handleClick"
              @handleEvent="handleEvent"
            >
              <template #form-temslot>
                <!-- background: #5d646b; -->
                <div
                  class="coordLists"
                  style="
                    padding: 10px;
                    height: 100%;
                    max-height: 450px;
                    overflow-y: auto;
                  "
                >
                  <page-form
                    :ref-obj.sync="formInfo.ref"
                    :data="formInfo.temArr"
                    :showdel="true"
                    :field-list="formInfo.addtem"
                    :rules="formInfo.rules"
                    :label-width="formInfo.labelWidth"
                    @handleClick="handleClick"
                    @handleEvent="handleEvent"
                  />
                </div>
              </template>
            </page-form>
          </div>
        </div>
      </general-container>
    </div>
  </div>
</template>

<script>
/* eslint-disable radix */
/*  eslint-disable no-prototype-builtins */
import DRAWCONFIG from 'shinegis-client-23d/src/earth-core/Draw/DrawConfig';
import DrawTool from 'shinegis-js-api/DrawTool3d';
import {
  getToolOptions,
  FormLists,
  defaultOptions,
  Properties
} from './ui-config';
import {
  cartesians2lonlats,
  lonlats2cartesians
} from 'shinegis-client-23d/src/earth-core/Tool/Util3';
import PageForm from './page-form.vue';
import { Utils } from 'shinegis-client-23d/src/earth-core/Widget/SpatialAnalysis/index';
import { getMaxHeight } from 'shinegis-client-23d/src/earth-core/Tool/Point2';
import commom from 'shinegis-client-23d/src/mixins/common';
import generalBarProps from 'shinegis-client-23d/src/mixins/components/general-bar-props';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import dialogDrag from 'shinegis-client-23d/src/utils/dialogDrag';
import GeneralBar from 'shinegis-client-23d/packages/general-bar';
import { Message } from 'element-ui';
import { CommonInterface } from './api';

let draw3d, drawTool, currEditFeature;
const fromCSS = Utils.getColor('fromCssColorString');

export default {
  name: 'ShDrawTool3d',
  components: {
    PageForm,
    GeneralBar,
    GeneralContainer
  },
  directives: { dialogDrag },
  mixins: [commom, generalBarProps, emitter],
  props: {
    panelCardProps: {
      type: Object,
      default: () => {}
    },
    // 工具条配置
    options: {
      type: Object,
      default: function () {
        return defaultOptions;
      }
    },
    url: {
      type: String
    },
    schemeId: { type: String },
    //绘制后开启编辑
    eidtAfterDraw: {
      type: Boolean,
      default: true
    },
    //预加载，启用则加载上次保存的图形场景
    preLoad: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      defaultLayerName: 'tempDrawLayer',
      shouldShow: false,
      toolOptions: getToolOptions({ ...defaultOptions, ...this.options }),
      activeIndex: [],
      appear_CEF: false,
      style: {},
      formInfo: {
        ref: null,
        data: Properties,
        temArr: {
          coord1x: null,
          coord1y: null,
          coord1z: null,
          coord2x: null,
          coord2y: null,
          coord2z: null,
          coord3x: null,
          coord3y: null,
          coord3z: null,
          coord4x: null,
          coord4y: null,
          coord4z: null,
          coord5x: null,
          coord5y: null,
          coord5z: null,
          coord6x: null,
          coord6y: null,
          coord6z: null,
          coord7x: null,
          coord7y: null,
          coord7z: null,
          coord8x: null,
          coord8y: null,
          coord8z: null,
          coord9x: null,
          coord9y: null,
          coord9z: null,
          coord10x: null,
          coord10y: null,
          coord10z: null,
          id: '',
          top: ''
        },
        fieldList: [
          {
            title: { name: '图形', showList: true },
            formList: FormLists['circle']
          },
          {
            title: { name: '坐标列表', addTemp: true, showList: false },
            slotprop: 'temslot'
          }
        ],
        addtem: [
          {
            title: { name: '  名字', showList: true },
            canAdd: true,
            formList: [
              { label: 'input', value: 'id', type: 'input' },
              { label: 'select', value: 'top', type: 'select' }
            ]
          }
        ],
        rules: {},
        labelWidth: '70px'
      }
    };
  },
  computed: {
    panelStyleConfig() {
      return this.panelCardProps?.styleConfig;
    },
    panelPosition() {
      return (
        this.panelCardProps?.position || {
          type: 'absolute',
          top: '180px',
          left: '260px'
        }
      );
    },
    panelImgSrc() {
      return this.panelCardProps?.imgSrc;
    },
    panelTitle() {
      return this.panelCardProps?.title;
    }
  },
  watch: {
    currentView: {
      handler(val) {
        this.shouldShow = val === 'earth';
      },
      immediate: true
    },
    currentInteraction(name) {
      if (name !== this.$options.name && name !== '') {
        this.deactivate();
      }
    },
    appear_CEF: {
      handler(newValue, oldValue) {
        // 更新信息窗。
        this.updateInfoFormhandler(newValue, oldValue);
      },
      deep: false
    }
  },
  beforeDestroy() {
    this.removeAll();
  },
  mounted() {
    if (this.$earth) {
      setTimeout(() => {
        this.begin();
      }, 0);
      this.activeIndex = [];
    }
  },
  methods: {
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    changeCard(val) {
      if (!val) {
        this.appear_CEF = false;
        currEditFeature = null;
        draw3d.stopEditing();
      }
    },
    begin() {
      this.initDraw(this.$earth.viewer, { name: this.defaultLayerName });
      // 关闭地形半透明
      this.$earth.viewer.shine.groundTranslucency({ isTranslucency: false });
      this.api = new CommonInterface(
        this.url,
        this.token,
        this.fastApplicationId,
        this.schemeId
      );
      if (this.preLoad) {
        this.select('load');
      }
    },
    initDraw(viewer, options) {
      drawTool = new DrawTool(viewer, options);
      draw3d = drawTool._drawTool;
      draw3d.hasEdit(false);
      this.$emit('inited', drawTool);

      let _this = this;
      draw3d.on('change:active', (e) => {
        if (e.active) {
          !this.activeIndex.includes(e.drawtype) &&
            this.activeIndex.push(e.drawtype);
        } else {
          this.activeIndex = [];
        }
        this.$emit('change:active', e.active);
      });
      draw3d.startEditing = function startEditing(entity) {
        this.stopEditing();
        if (entity === undefined || !this._hasEdit) return;

        if (entity.editing && entity.editing.activate) {
          entity.editing.activate();
        }

        this.currEditFeature = entity;
        currEditFeature = entity;
        _this.appear_CEF = true;
        _this.updateInfoFormhandler(entity);
        _this.$refs.container.changeShow(true);
      };
      draw3d.stopEditing = function stopEditing() {
        if (this.currEditFeature?.editing?.disable) {
          this.currEditFeature.editing.disable();
        }
        this.currEditFeature = null;
        currEditFeature = null;
        _this.appear_CEF = false;
      };
      draw3d.on('edit-move-point', function (e) {
        //仅需要更新坐标，和椭圆轴径长度之类；不更改窗体结构
        _this.updateInfoFormhandler(e.entity);
      });
      draw3d.on('edit-remove-point', function (e) {
        currEditFeature = null;
        currEditFeature = e.entity;
        _this.updateInfoFormhandler(e.entity);
      });
      draw3d.on('draw-created', function (e) {
        let result = draw3d.toGeoJSON(e.entity);
        _this.eidtAfterDraw ? _this.select('edit') : _this.unselect('edit'); //绘制完成开启编辑并进入编辑
        this.startEditing(e.entity);
        _this.$emit('drawend', result);
      });
    },
    select(type) {
      if (type === 'remove') {
        this.removeAll();
      } else if (type === 'load') {
        // 从后台加载绘制要素。
        //需有方案id才可加载和保存
        this.api
          .getGeoJson()
          .then((result) => {
            if (result) {
              const geojson = JSON.parse(result);
              const a = draw3d.loadJson(geojson);
              if (a instanceof Array && a.length >= 1) {
                Message({
                  message: '绘制要素加载成功',
                  type: 'success'
                });
              }
            } else {
              Message({
                message: '未查询到绘制要素',
                type: 'warning'
              });
            }
          })
          .catch((e) => {
            console.error(e);
            Message({
              message: '加载失败,请检查url和schemeId',
              type: 'error'
            });
          });
      } else if (type === 'save') {
        // 保存到后台
        let geojson = draw3d.toGeoJSON();
        geojson &&
          this.api
            .saveGeoJson(geojson)
            .then(() => {
              Message({
                message: '绘制要素保存成功',
                type: 'success'
              });
            })
            .catch(() => {
              Message({
                message: '保存失败,请检查url和schemeId',
                type: 'error'
              });
            });
      } else if (type === 'edit') {
        draw3d.hasEdit(true);
        this.activeIndex.push('edit');
      } else {
        this.activate(type);
      }
    },
    unselect(type) {
      if (type === 'edit') {
        draw3d.hasEdit(false);
        for (var i = 0; i < this.activeIndex.length; i++) {
          if (this.activeIndex[i] === 'edit') {
            this.activeIndex.splice(i, 1);
            break;
          }
        }
      } else {
        this.activeIndex = [];
        draw3d.stopDraw();
      }
    },
    handleClick(event, index) {
      // deal with add/delete coordinate.
      switch (event) {
        case 'addtemplate': {
          let coords = currEditFeature.editing._positions_draw;
          let p1 = coords[index];
          let p2 = coords[index + 1] || coords[0];
          let addP = {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2,
            z: (p1.z + p2.z) / 2
          };
          coords.splice(index + 1, 0, addP);
          currEditFeature.editing.setPositions(coords, currEditFeature);
          this.setCoord(currEditFeature);
          currEditFeature.editing.updateDraggers();
          break;
        }
        case 'deltem': {
          // 不能乱减，得大于等于最小点数。
          let coords = currEditFeature.editing._positions_draw;
          let min = currEditFeature.editing._minPointNum;
          if (coords.length >= min + 1) {
            coords.splice(index, 1);
            currEditFeature.editing.setPositions(coords, currEditFeature);
            this.setCoord(currEditFeature);
            currEditFeature.editing.updateDraggers();
          }
          break;
        }
      }
    },
    handleEvent(value, num) {
      if (num === undefined) return;
      let data = this.formInfo.data;
      let style = currEditFeature.attribute.style;
      data[value] = num; // 子组件修改父组件值
      let featureType = currEditFeature.attribute.type;
      featureType = featureType === 'circle' ? 'ellipse' : featureType;
      featureType = featureType === 'curve' ? 'polyline' : featureType;
      featureType = featureType === 'plotting' ? 'polygon' : featureType;
      let graphic = currEditFeature[featureType];
      if (value.includes('coord')) {
        let char, a;
        char = a = value.charAt(6);
        a = a === 'x' ? 0 : a;
        a = a === 'y' ? 1 : a;
        a = a === 'z' ? 2 : a;
        if (a === 2 && featureType === 'polygon') {
          data.height_plane = undefined;
        }
        let index = value.replace(/[^0-9]/gi, '') - 1;
        let coords = currEditFeature.editing.getPosition?.();
        coords = coords ? coords : [currEditFeature.position.getValue()];
        coords = coords instanceof Array ? coords : [coords];

        coords = cartesians2lonlats(coords);
        coords[index][a] = num;
        this.formInfo.temArr[`coord${index + 1}${char}`] = num;
        let arr = lonlats2cartesians(coords);
        arr.length === 1 ? (arr = arr[0]) : 0;
        if (currEditFeature.editing.setPositions) {
          currEditFeature.editing.setPositions(arr);
        } else {
          currEditFeature.position.setValue(arr);
        }
        currEditFeature.editing.updateDraggers();
        return;
      }
      switch (value) {
        case 'radius': {
          style[value] = num;
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          this.setCoord(currEditFeature);
          break;
        }
        case 'semiMajorAxis':
        case 'semiMinorAxis': {
          // 判断，短半轴必须小于等于长半轴。
          style[value] = num;
          if (style['semiMinorAxis'] >= style['semiMajorAxis']) {
            let anotherAxis =
              value === 'semiMajorAxis' ? 'semiMinorAxis' : 'semiMajorAxis';
            let v = graphic[anotherAxis].getValue();
            style[value] = v;
            data[value] = v;
            num = v;
          }
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        }
        case 'color':
        case 'heightRadii':
        case 'widthRadii':
        case 'extentRadii':
        case 'text':
        case 'font_family':
        case 'font_size':
        case 'width':
        case 'checkerboard_repeat':
        case 'stripe_repeat':
        case 'pixelSize':
        case 'scaleByDistance_farValue':
        case 'scaleByDistance_nearValue':
        case 'silhouetteSize':
        case 'silhouetteColor':
        case 'repeatX':
        case 'repeatY':
        case 'background_color':
        case 'rotation':
        case 'zIndex':
        case 'grid_lineThickness':
        case 'grid_lineCount':
        case 'glowPower':
        case 'oddColor':
        case 'speed':
        case 'animationSpeed':
        case 'scale':
        case 'scaleX':
        case 'scaleY':
        case 'maximumSizeX':
        case 'maximumSizeY':
        case 'maximumSizeZ':
        case 'slice':
        case 'brightness':
        case 'trailSpeed': {
          style[value] = num;
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        }
        case 'image': {
          this.formInfo.data.imageBox = false;
          data.icon = num;
          style[value] = num;
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        }
        case 'iconLibrary':
          this.formInfo.data.imageBox = !this.formInfo.data.imageBox;
          break;
        case 'featureType': {
          currEditFeature[featureType] = null;
          currEditFeature.attribute.type = currEditFeature.attribute.edittype =
            num;
          currEditFeature.attribute.style = DRAWCONFIG[num].style;
          currEditFeature[num] = currEditFeature[num] || { show: true };
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          this.updateInfoFormhandler(true);
          break;
        }
        case 'vertical':
          style['freely'] = num ? 'vertical' : 'horizontal';
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        case 'height_plane': {
          style.height = num;
          // polygon的height可由两个方面设定，一是在其坐标中的高度，二是其height属性。 但因为关联着dragger，所以通过前者实现。
          let positions = draw3d.getPositions(currEditFeature);
          let viewer = draw3d.viewer;
          positions = positions.map((e) => {
            e = Utils.setPositionHeight(viewer, e, num);
            return e;
          });
          currEditFeature.polygon.height = num;
          draw3d.setPositions(positions, currEditFeature);
          currEditFeature.editing.updateDraggers();
          this.setCoord(currEditFeature);
          break;
        }
        case 'height': {
          style.height = num;
          graphic.height = num;
          if (
            graphic.perPositionHeight &&
            graphic.perPositionHeight.getValue()
          ) {
            graphic.perPositionHeight.setValue(false);
          }
          let extrudedHeight = style.extrudedHeight;
          if (/* featureType === "rectangle" && */ extrudedHeight) {
            // 同时修改拉伸高
            graphic.extrudedHeight.setValue(num + extrudedHeight);
          }
          currEditFeature.editing.updateDraggers();
          this.setCoord(currEditFeature);
          break;
        }
        case 'border': {
          //updateAttribute无效
          style.border = num;
          this.updateInfoFormStructure();
          if (num) {
            // 打开
            this.handleEvent('outlineColor', data.outlineColor);
            this.handleEvent('outlineWidth', data.outlineWidth);
          } else {
            // 折叠
            let temp = data.outlineWidth;
            this.handleEvent('outlineWidth', 0);
            data.outlineWidth = style.border_width = temp;
          }
          break;
        }
        case 'wallHeight': {
          style.extrudedHeight = num;
          let minimumArr = graphic.minimumHeights.getValue();
          let arr = graphic.maximumHeights.getValue();
          for (let [index] of arr.entries()) {
            arr[index] = minimumArr[index] + num;
          }
          currEditFeature.editing.updateDraggers();
          break;
        }
        case 'extrudedHeight': {
          style.extrudedHeight = num;
          let height = style.height || 0;
          graphic.extrudedHeight = num + height;
          break;
        }
        case 'opacity':
        case 'background_opacity':
        case 'silhouetteAlpha':
        case 'animationCircle_opacity': {
          style[value] = num / 100;
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        }
        case 'scaleByDistance':
        case 'distanceDisplayCondition':
        case 'silhouette':
        case 'background': {
          style[value] = num;
          this.updateInfoFormStructure();
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        }
        case 'scaleByDistance_far':
        case 'scaleByDistance_near': {
          style[value] = num;
          if (style.scaleByDistance_far <= style.scaleByDistance_near)
            Message({
              message: '上限应大于下限',
              type: 'error'
            });
          else
            draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        }
        case 'distanceDisplayCondition_near':
        case 'distanceDisplayCondition_far': {
          style[value] = num;
          if (
            style.distanceDisplayCondition_far <=
            style.distanceDisplayCondition_near
          )
            Message({
              message: '上限应大于下限',
              type: 'error'
            });
          else
            draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        }
        case 'modelKind': {
          style['modelKind'] = num;
          let uri = DRAWCONFIG[num].style.modelUrl;
          style['modelUrl'] = uri;
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        }
        case 'heading':
        case 'pitch':
        case 'roll': {
          style[value] = num;
          draw3d.drawCtrl['model'].updateOrientation(
            { heading: data.heading, pitch: data.pitch, roll: data.roll },
            currEditFeature
          );
          //模型动态旋转浮动用法示例----------------------------------
          /*        draw3d.drawCtrl['model'].setGraphicsRotate(
            {
              heading: data.heading,
              pitch: data.pitch,
              roll: data.roll,
              rotateAmount: 10,
              maxHeiht: 200
            },
            currEditFeature
          );*/
          /*        draw3d.drawCtrl['model'].setGraphicsFloat(
            {
              heading: data.heading,
              pitch: data.pitch,
              roll: data.roll,
              speed: 4,
              maxHeiht: 200
            },
            currEditFeature
          );*/
          break;
        }
        case 'outlineJudge': {
          style['outline'] = num;
          this.updateInfoFormStructure();
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        }
        case 'fillJudge': {
          style['fill'] = num;
          this.updateInfoFormStructure();
          //updateAttribute无效
          if (currEditFeature['polyline']) {
            graphic.show = num;
          } else graphic.fill = num;
          break;
        }
        case 'outlineColor': {
          //处理面的边框和label的衬色
          style[value] = num;
          //polygon的outline由bindOutline增添，updateAttribute无效
          let color = fromCSS(num);
          color.alpha = this.getValue(graphic.outlineColor)?.alpha;
          if (currEditFeature.polyline) {
            currEditFeature.polyline.material = color;
          }
          graphic['outlineColor'] = color;
          break;
        }
        case 'outlineOpacity': {
          //处理面的边框和label的衬色
          style[value] = num / 100;
          let color = this.getValue(graphic.outlineColor);
          color.alpha = num / 100;
          if (currEditFeature.polyline) {
            currEditFeature.polyline.material = color;
          }
          graphic.outlineColor = color;
          break;
        }
        case 'outlineWidth': {
          if (featureType === 'label') {
            style.border_width = num;
          } else {
            style[value] = num;
          }
          graphic.outlineWidth = num;
          if (currEditFeature.polyline) {
            currEditFeature.polyline.width = num;
          }
          break;
        }
        case 'bold': {
          style.font_weight = num ? 'bold' : 'normal';
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        }
        case 'italic':
          style.font_style = num ? 'italic' : 'normal';
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        case 'name':
        case 'remark': {
          currEditFeature.attribute.attr[value] = num;
          break;
        }
        case 'lineType':
        case 'fillType': {
          style[value] = num;
          this.updateInfoFormStructure();
          this.readFormData();
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        }
        case 'clampToGround': {
          style.clampToGround = num;
          graphic.clampToGround?.setValue?.(num);
          if (
            featureType === 'polygon' ||
            featureType === 'rectangle' ||
            featureType === 'ellipse'
          ) {
            let viewer = draw3d.viewer;
            draw3d.deleteEntity(); // 有效
            viewer.render();
            let attribute = currEditFeature.attribute;
            attribute.config = { height: !num };
            let positions = draw3d.getPositions(currEditFeature);
            positions = currEditFeature.editing.getPosition?.() || positions; //发现从editing 里取出来的更准确
            if (num) {
              if (featureType === 'polygon') {
                // 当初次贴地时，面的高程以第一点的高程值作记录。
                delete attribute.style.height;
                let firstHeight = Utils.cartesianToLonLatHeight(
                  positions[0]
                )[2];
                attribute.style.height_plane =
                  data.height_plane || firstHeight.toFixed(2);
              } else {
                // 因为设定为贴地后生成的entity里height属性被剔除，所以转存到height_plane。
                attribute.style.height_plane = data.height;
              }
            } else {
              let h = attribute.style.height_plane;
              h = parseFloat(h) || getMaxHeight(positions);
              positions = positions.map((e) => {
                e = Utils.setPositionHeight(viewer, e, h);
                return e;
              });
              if (featureType === 'ellipse') {
                attribute.style.height =
                  attribute.style.height_plane || attribute.style.height;
              }
            }
            positions = positions.length === 1 ? positions[0] : positions;
            positions = featureType === 'ellipse' ? positions[0] : positions;
            attribute.type = attribute.edittype || attribute.type;
            draw3d.currEditFeature = currEditFeature = draw3d.attributeToEntity(
              attribute,
              positions
            );
            currEditFeature.editing._positions_draw = positions;
            draw3d.startEditing(currEditFeature);
          }
          break;
        }
        case 'dash_oddcolor':
        case 'dash_interval':
          style['outlineColor'] = data.dash_oddcolor;
          style['outlineWidth'] = data.dash_interval;
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        case 'outline_gapcolor':
        case 'outline_width':
          style['outlineColor'] = data.outline_gapcolor;
          style['outlineWidth'] = data.outline_width;
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        case 'font_size_f':
          style['font_size'] = data.font_size_f;
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        case 'dynamicGradual_speed':
          style['duration'] = data['dynamicGradual_speed'];
          draw3d.updateAttribute(currEditFeature.attribute, currEditFeature);
          break;
        case 'location':
          this.flyTo(currEditFeature);
          break;
        case 'remove':
          this.removeSelect();
          return;
      }
      currEditFeature.editing.updateDraggers();
    },
    /**
     * 改变信息窗表格结构————属性栏的删除或添加
     * 发生在切换（是否衬色 是否按视距缩放 是否按视距显示 是否轮廓 是否填充 是否边框 是否背景）栏的值时，
     * 属性栏里增加或移除一些栏。
     * @param {key} String 属性栏的label，比如"是否衬色"
     * @param {addOrDelete} Boolean true 即增加，false即移除。
     */
    updateInfoFormStructure() {
      let featureType =
        currEditFeature.attribute.edittype || currEditFeature.attribute.type; //edittype即其编辑时的名称，拉伸面、矩形图片……
      let style = currEditFeature?.attribute.style;
      let data = this.formInfo.data;
      let chenSe = featureType === 'polyline' ? data.chenSe : data.border;
      let fillJudge =
        featureType === 'model' ? data.fillJudge_model : data.fillJudge;
      let fillType =
        featureType === 'polyline' ? style.lineType : style.fillType;
      featureType = featureType === 'plotting' ? 'polygon' : featureType;
      this.formInfo.fieldList[0].formList = FormLists.getFormListByType(
        featureType,
        {
          fillJudge,
          fillType,
          chenSe,
          outlineJudge: data.outlineJudge,
          background: data.background,
          silhouette: data.silhouette,
          distanceDisplayCondition: data.distanceDisplayCondition,
          scaleByDistance: data.scaleByDistance
        }
      );
      return;
    },
    //更新信息窗显示。 当开启要素的编辑后，获取各样式值并更新窗体显示。
    //窗体结构的变更，和列表记录值的更改杂糅在一个方法；将对其分离。
    updateInfoFormhandler(newValue) {
      if (!newValue) return; // 点的坐标。
      this.updateInfoFormStructure();
      this.setCoord(currEditFeature);
      this.readFormData();
    },
    /**
     * 读取信息窗记录的值，即formInfo.data的各属性值
     */
    readFormData() {
      let entity = currEditFeature;
      let data = this.formInfo.data;
      let style = entity.attribute.style;
      data.featureType = style.name || entity.attribute.type;
      let type = entity.attribute.type; // 类型
      type = type === 'curve' ? 'polyline' : type;
      type = type === 'plotting' ? 'polygon' : type;

      if (type === 'wall' && style.extrudedHeight) {
        data.wallHeight = style.extrudedHeight;
      } else if (style.extrudedHeight) {
        data.extrudedHeight = style.extrudedHeight;
      }

      let clampToGround = style.clampToGround;
      switch (type) {
        case 'ellipsoid': {
          let radii = entity[type].radii.getValue();
          data.extentRadii = radii.x;
          data.widthRadii = radii.y;
          data.heightRadii = radii.z;
        }
        // eslint-disable-next-line no-fallthrough
        case 'circle': {
          let check = style.extrudedHeight;
          data.extrudedHeight = check;
        }
        // eslint-disable-next-line no-fallthrough
        case 'ellipse': {
          let check = style.extrudedHeight;
          data.extrudedHeight = check;
        }
        // eslint-disable-next-line no-fallthrough
        default:
        case 'polyline': {
          // 贴地与否又是个区分
          let extru = style.extrudedHeight;
          if (
            clampToGround &&
            type !== 'wall' &&
            !extru &&
            type !== 'polygon' &&
            type !== 'rectangle' &&
            type !== 'ellipse' &&
            type !== 'circle'
          ) {
            // 贴地的没有高程、没有边框选择(wall例外)//贴地就没有height
            let arr = this.formInfo.fieldList[0].formList;
            arr = this.removeObjInArr(arr, '高程');
            arr = this.removeObjInArr(arr, '是否填充');
            arr = this.removeObjInArr(arr, '是否边框');
            arr = this.removeObjInArr(arr, '边框颜色');
            arr = this.removeObjInArr(arr, '边框透明');
            arr = this.removeObjInArr(arr, '边框宽度'); // 矩形是有边框宽度的。
            this.formInfo.fieldList[0].formList = arr;
          }

          data.radius = style.radius;
          data.semiMinorAxis = style.semiMinorAxis;
          data.semiMajorAxis = style.semiMajorAxis;
          data.fillJudge = style.fill;
          data.fillJudge_model = style.fill;
          data.color = fromCSS(style.color || '#fff')
            .withAlpha(1)
            .toCssHexString();
          data.opacity = style.opacity * 100;
          data.outlineJudge = style.outline;
          data.border = style.border;
          data.outlineColor = fromCSS(
            style.outlineColor || style.border_color || '#fff'
          )
            .withAlpha(1)
            .toCssHexString();
          data.outlineOpacity = style.outlineOpacity * 100;
          data.rotation = style.rotation;
          data.zIndex = style.zIndex;

          data.height = style.height;
          data.height_plane = style.height || style.height_plane;

          data.name = entity.attribute.attr?.name;
          data.remark = entity.attribute.attr?.remark;
          data.featureType = style.name || entity.attribute.type;
          // hdr
          data.heading = style.heading;
          data.pitch = style.pitch;
          data.roll = style.roll;
          data.modelKind = style.modelKind || data.modelKind;
          data.icon = style.image;

          data.modelUrl = style.modelUrl;
          // silhouette
          data.silhouette = style.silhouette;
          data.silhouetteAlpha = style.silhouetteAlpha * 100;
          data.silhouetteColor = style.silhouetteColor;
          data.silhouetteSize = style.silhouetteSize;

          data.width = style.width;
          data.lineType = style.lineType;
          data.chenSe = style.outline; // 衬色
          data.chenSeWidth = style.outlineWidth;
          data.outlineWidth = style.outlineWidth || style.border_width;
          data.clampToGround = style.clampToGround;
          data.font_family = style.font_family || '黑体';
          data.font_size = style.font_size;
          data.background = style.background;

          data.background_color = style.background_color;
          data.background_opacity = style.background_opacity * 100;
          data.bold = style.font_weight === 'bold';
          data.italic = style.font_style === 'italic';

          data.wallHeight = style.extrudedHeight;

          data.text = style.text ?? '文字';

          data.pixelSize = style.pixelSize;

          data.image = style.image;
          data.scale = style.scale;
          data.rotation = style.rotation;

          data.scaleByDistance = style.scaleByDistance;
          data.scaleByDistance_far = style.scaleByDistance_far || 0.1;
          data.scaleByDistance_farValue = style.scaleByDistance_farValue;
          data.scaleByDistance_near = style.scaleByDistance_near;
          data.scaleByDistance_nearValue = style.scaleByDistance_nearValue;

          data.distanceDisplayCondition = style.distanceDisplayCondition;
          data.distanceDisplayCondition_far =
            style.distanceDisplayCondition_far;
          data.distanceDisplayCondition_near =
            style.distanceDisplayCondition_near;
          data.fillType = style.fillType;
          data.speed = style.speed || 1;
          //image
          data.picUrl = style.image || 'Assets3D/img/mark4.png';
          data.repeatX = style.repeatX || 1;
          data.repeatY = style.repeatY || 1;
          //grid
          data.grid_lineCount = style.grid_lineCount || 8;
          data.grid_lineThickness = style.grid_lineThickness || 2;
          //stripe
          data.oddColor = style.oddColor || '#ffffff';
          data.stripe_repeat = style.stripe_repeat || 6;
          //checkerboard
          data.checkerboard_repeat = style.checkerboard_repeat || 4;
          //breathGradual
          data.breathGradual_speed = style.speed || 3;
          //dynamicGradual
          data.dynamicGradual_speed = style.duration || 1;
          //走马灯
          data.vertical = style.freely !== 'horizontal';
          //outline 衬色线
          data.outline_gapcolor = style.outlineColor;
          data.outline_width = style.outlineWidth;
          //dash
          data.dash_oddcolor = style.outlineColor;
          data.dash_interval = style.outlineWidth;
          //glow
          data.glowPower = style.glowPower || 1;
          //animation
          data.animationSpeed = style.animationSpeed || 1;
          //trail
          data.trailSpeed = style.trailSpeed || 5;
          //text
          data.font_size_f = style.font_size || 100;
          //cloud
          data.scaleX = style.scaleX || 25;
          data.scaleY = style.scaleY || 25;
          data.maximumSizeX = style.maximumSizeX || 25;
          data.maximumSizeY = style.maximumSizeY || 12;
          data.maximumSizeZ = style.maximumSizeZ || 15;
          data.slice = style.slice || 0.36;
          data.brightness = style.brightness || 1;

          let eidtType = entity.attribute.edittype || entity.attribute.type;
          if (
            eidtType === 'polygon' ||
            eidtType === 'rectangle' ||
            eidtType === 'ellipse' ||
            eidtType === 'circle'
          ) {
            if (data.clampToGround === true) {
              let arr = this.formInfo.fieldList[0].formList;
              arr = this.removeObjInArr(arr, '统一高程');
              this.formInfo.fieldList[0].formList = arr;
            } else if (data.clampToGround !== true) {
              let arr = this.formInfo.fieldList[0].formList;
              let index = arr.findIndex((e) => {
                return e.label === '是否贴地';
              });
              let hh = 'height';
              hh = type === 'polygon' ? 'height_plane' : hh;
              arr.splice(index + 1, 0, {
                label: '统一高程',
                value: hh,
                type: 'inputNumber'
              });
              this.formInfo.fieldList[0].formList = arr;
            }
          }
        }
      }
    },
    activate(drawType) {
      this.$refs.container.changeShow(true);
      return drawTool.activate(drawType);
    },
    deactivate() {
      drawTool.deactivate();
    },
    removeSelect() {
      draw3d.deleteEntity();
      currEditFeature = null;
      this.appear_CEF = false;
    },
    flyTo(entity) {
      drawTool.flyTo(entity);
    },
    remove(entity) {
      if (Array.isArray(entity)) {
        drawTool.removeFeatures(entity);
      } else drawTool.removeFeature(entity);
    },
    createDrawLayer({ id, name, layerTag } = {}) {
      return draw3d.createDrawLayer({ id, name, layerTag });
    },
    removeAll(id) {
      if (id !== undefined) {
        draw3d.removeCollection(id);
      } else {
        drawTool.removeAll();
      }
      currEditFeature = null;
      this.appear_CEF = false;
    },
    removeObjInArr(arr, label) {
      // 删除数组里特定名称的对象。
      let a = arr.filter((e) => {
        return e.label !== label;
      });
      return a;
    },
    setCoord(newValue) {
      // 创建编辑窗的坐标模板，并设定其值。
      let coods = newValue.editing.getPosition?.();
      coods = coods ? this.getValue(coods) : [newValue.position.getValue()];
      coods = coods instanceof Array ? coods : [coods];
      coods = cartesians2lonlats(coods);
      class Tem {
        constructor() {
          this.title = { name: '', showList: false };
          this.formList = [];
        }
      }

      let skip = false;
      let l1, l2;
      l1 =
        (newValue.editing._positions_draw &&
          newValue.editing._positions_draw.length) ||
        1;
      l2 = this.formInfo.addtem.length;
      if (
        newValue.id != null &&
        newValue.id === this.lastEntityId &&
        l1 === l2
      ) {
        // 特殊情況，primitive沒有id
        skip = true;
      } else {
        this.formInfo.addtem = [];
      }
      let onlyShowLonLat =
        newValue.attribute.type === 'rectangle' ||
        newValue.attribute.type === 'circle' ||
        newValue.attribute.type === 'ellipse';
      let onlyOnePoint =
        newValue.attribute.type === 'circle' ||
        newValue.attribute.type === 'ellipse';
      if (onlyOnePoint) coods.length = 1;
      for (let [index, value] of coods.entries()) {
        this.formInfo.temArr[`coord${index + 1}x`] = Number(value[0]); //为什么要设置成字符串
        this.formInfo.temArr[`coord${index + 1}y`] = Number(value[1]);
        this.formInfo.temArr[`coord${index + 1}z`] = Number(value[2]);
        if (skip) {
          continue;
        }

        let tem = new Tem();
        tem.canAdd = true;
        if (coods.length === 1 || onlyShowLonLat) tem.canAdd = false;
        tem.title.name = `第${index + 1}点`;

        let obj1 = {
          label: '经度',
          value: `coord${index + 1}x`,
          type: 'inputNumber',
          step: 0.00001
        };
        let obj2 = {
          label: '纬度',
          value: `coord${index + 1}y`,
          type: 'inputNumber',
          step: 0.00001
        };
        let obj3 = {
          label: '高程',
          value: `coord${index + 1}z`,
          type: 'inputNumber',
          min: -99999
        };
        tem.formList.push(obj1, obj2, obj3);
        onlyShowLonLat && tem.formList.pop();
        this.formInfo.addtem.push(tem);
      }
      this.lastEntityId = newValue.id;
    },
    loadGeoJson(
      GeoJSON,
      { isClear, isFly, isFlash, layerId, style, type } = {}
    ) {
      return drawTool.loadGeoJson(GeoJSON, {
        isClear,
        isFly,
        isFlash,
        layerId,
        style,
        type
      });
    },
    /**
     * 加载GeoJSON地理数据上图
     *
     * @param {GeoJSON}
     * @param {}清除、定位、图层id、图层样式
     * @returns {Array.<Entity> } 图形数据的对象数组
     */
    loadJson(GeoJSON, { isClear, isFly, layerId, style } = {}) {
      return draw3d.loadJson(GeoJSON, { isClear, isFly, layerId, style });
    },
    getValue(property) {
      // 兼容primitive和entity的属性获取。 primitive里的属性为非回调属性，无property.getValue方法。
      return property?.getValue ? property.getValue() : property;
    }
  }
};
</script>
