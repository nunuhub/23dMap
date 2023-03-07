<template>
  <el-card v-if="isShow" class="style-select sh-plot-style">
    <div slot="header" class="clearfix">
      <span>标绘样式</span>
      <el-button
        style="float: right"
        icon="el-icon-close"
        circle
        size="mini"
        @click="setShow(false)"
      ></el-button>
    </div>
    <el-form
      ref="form"
      :model="style"
      label-width="80px"
      style="padding-bottom: 20px"
    >
      <color-picker-form-item
        v-if="isShowText"
        v-model="style.textStroke"
        label="描边颜色"
      />
      <el-form-item v-if="isShowText" label="描边宽度">
        <el-input-number
          v-model="style.textWidth"
          :min="1"
          :max="10"
          label="描述文字"
        ></el-input-number>
      </el-form-item>
      <color-picker-form-item
        v-if="isShowText"
        v-model="style.textColor"
        label="文字颜色"
      />
      <el-form-item v-if="isShowText" label="文字大小">
        <el-input-number
          v-model="style.textSize"
          :min="12"
          :max="100"
          label="描述文字"
        ></el-input-number>
      </el-form-item>
      <el-form-item v-if="isShowText" label="是否加粗">
        <el-radio-group v-model="style.fontWeight">
          <el-radio label="bold">是</el-radio>
          <el-radio label="normal">否</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item v-if="isShowImage" label="图片类型">
        <el-image
          style="overflow: initial"
          fit="contain"
          :src="style.point.iconSrc"
          @click="isShowPointImgSelectDialog = true"
        />
      </el-form-item>

      <el-form-item v-if="isShowText" label="字体">
        <el-radio-group v-model="style.fontFamily">
          <el-radio label="宋体">宋体</el-radio>
          <el-radio label="黑体">黑体</el-radio>
          <el-radio label="楷体">楷体</el-radio>
          <el-radio label="隶书">隶书</el-radio>
          <el-radio label="微软雅黑">微软雅黑</el-radio>
        </el-radio-group>
      </el-form-item>

      <color-picker-form-item
        v-else-if="isShowImage"
        v-model="style.point.color"
        label="图片颜色"
        :show-alpha="false"
      ></color-picker-form-item>

      <el-form-item v-if="isShowImage" label="图片大小">
        <el-input-number
          v-model="style.point.size"
          :min="1"
          :max="100"
          label="描述文字"
        ></el-input-number>
      </el-form-item>
      <el-form-item v-if="isShowImage" label="角度">
        <el-input-number
          v-model="style.point.rotation"
          :min="-360"
          :max="360"
          label="描述文字"
        ></el-input-number>
      </el-form-item>
      <el-form-item v-else label="角度">
        <el-input-number
          v-model="style.rotation"
          :min="-360"
          :max="360"
          label="描述文字"
        ></el-input-number>
      </el-form-item>
      <el-form-item v-if="isShowLine || isShowPloyStroke" label="线型">
        <el-radio-group v-model="style.type">
          <el-radio label="polyline">实线</el-radio>
          <el-radio label="dashline">虚线</el-radio>
        </el-radio-group>
      </el-form-item>
      <color-picker-form-item
        v-if="isShowFill"
        v-model="style.fill"
        label="填充颜色"
      />
      <el-form-item v-if="isShowRadius" label="半径">
        <el-input-number
          v-model="style.radius"
          :min="1"
          :max="30"
          label="描述文字"
        ></el-input-number>
      </el-form-item>
      <color-picker-form-item
        v-if="isShowPoly"
        v-model="style.polyStroke"
        label="描边颜色"
      ></color-picker-form-item>
      <color-picker-form-item
        v-else-if="isShowRoad"
        v-model="style.roadStroke"
        label="颜色"
      ></color-picker-form-item>
      <color-picker-form-item
        v-else-if="isShowStroke"
        v-model="style.stroke"
        label="颜色"
      />

      <el-form-item v-if="isShowLine || isShowRoad" label="宽度">
        <el-input-number
          v-model="style.width"
          :min="1"
          :max="30"
          label="描述文字"
        ></el-input-number>
      </el-form-item>
      <el-form-item v-else-if="isShowStroke" label="描边宽度">
        <el-input-number
          v-model="style.strokeWidth"
          :min="1"
          :max="30"
          label="描述文字"
        ></el-input-number>
      </el-form-item>
      <color-picker-form-item
        v-if="isShowChildStroke"
        v-model="style.childStroke"
        label="附属线色"
      />
      <el-form-item v-if="isShowChildStroke" label="附属线宽">
        <el-input-number
          v-model="style.childWidth"
          :min="1"
          :max="30"
          label="描述文字"
        ></el-input-number>
      </el-form-item>
      <color-picker-form-item
        v-if="isShowRoad"
        v-model="style.roadDashStroke"
        label="虚线颜色"
      ></color-picker-form-item>
      <color-picker-form-item
        v-else-if="isShowDash"
        v-model="style.dashStroke"
        label="虚线颜色"
      ></color-picker-form-item>

      <el-form-item v-if="isShowDotted" label="虚线宽度">
        <el-input-number
          v-model="style.dottedArrowWidth"
          :min="1"
          :max="100"
          label="描述文字"
        ></el-input-number>
      </el-form-item>
      <el-form-item v-else-if="isShowDash" label="虚线宽度">
        <el-input-number
          v-model="style.dashWidth"
          :min="1"
          :max="100"
          label="描述文字"
        ></el-input-number>
      </el-form-item>
      <el-form-item v-if="isShowDotted" label="虚线长度">
        <el-input-number
          v-model="style.dottedArrowHeight"
          :min="1"
          :max="100"
          label="描述文字"
        ></el-input-number>
      </el-form-item>
      <el-form-item v-else-if="isShowDashDivide" label="虚线长度">
        <el-input-number
          v-model="style.dashHeight"
          :min="1"
          :max="100"
          label="描述文字"
        ></el-input-number>
      </el-form-item>
      <el-form-item v-if="isShowDashDivide" label="虚线间隔">
        <el-input-number
          v-model="style.dashDivide"
          :min="1"
          :max="100"
          label="描述文字"
        ></el-input-number>
      </el-form-item>
      <el-form-item v-if="isShowGradient" label="渐变配置">
        <el-col class="line" :span="5" style="color: #333">起始</el-col>
        <el-col :span="7">
          <el-color-picker
            v-model="style.gradients[0].color"
            show-alpha
          ></el-color-picker>
        </el-col>
        <el-col class="line" :span="5" style="color: #333">终止</el-col>
        <el-col :span="7">
          <el-color-picker
            v-model="style.gradients[1].color"
            show-alpha
          ></el-color-picker>
        </el-col>
      </el-form-item>

      <el-form-item v-if="isShadow" label="阴影">
        <el-switch v-model="style.shadow.isShow"> </el-switch>
      </el-form-item>
      <color-picker-form-item
        v-if="style.shadow.isShow"
        v-model="style.shadow.color"
        label="阴影颜色"
      />
      <el-form-item v-if="style.shadow.isShow" label="模糊级数">
        <el-input-number
          v-model="style.shadow.blur"
          :min="1"
          :max="100"
          label="描述文字"
        ></el-input-number>
      </el-form-item>
      <!--<div v-if="isShowArrow" style="margin-top:12px">
        <label class="el-form-item__label" style="width: 80px">选择箭头</label>
        <div @click="importFile"
             class="avatar-uploader">
          <img v-if="style.arrowImg&&style.arrowImg!=''" :src="style.arrowImg" class="avatar">
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
          <input ref="fileinput" type="file" name="file[]" class="file" accept="image/*" style="display: none"
                 @change="handleAvatarSuccess($event)">
        </div>
      </div>-->

      <el-form-item v-if="isShowArrowTypeArrow" label="箭头">
        <el-radio v-model="arrowTypeNo" label="arrowTypeNo">无</el-radio>
        <el-checkbox-group
          v-model="style.arrow.arrowShowArrow"
          style="display: inline-block"
          @change="handleArrowCheckedChange"
        >
          <el-checkbox label="left">左</el-checkbox>
          <el-checkbox label="right">右</el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item v-else-if="isShowArrow" label="箭头">
        <el-radio v-model="arrownone" label="arrownone">无</el-radio>
        <el-checkbox-group
          v-model="style.arrow.showArrow"
          style="display: inline-block"
          @change="handleArrowCheckedChange"
        >
          <el-checkbox label="left">左</el-checkbox>
          <el-checkbox label="right">右</el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item v-if="!isShowText" label="层级">
        <el-button
          size="mini"
          icon="el-icon-arrow-down"
          circle
          @click="zIndexChange(false)"
        ></el-button>
        <el-button
          type="primary"
          size="mini"
          icon="el-icon-arrow-up"
          circle
          @click="zIndexChange(true)"
        ></el-button>
      </el-form-item>
      <el-row v-if="isShowOpreate" style="margin-top: 30px">
        <el-col v-if="!isShowText" :span="6" :offset="4">
          <el-button type="primary" class="btn" @click="translateGeo"
            >移动</el-button
          >
        </el-col>
        <el-col :span="6" :offset="4">
          <el-button type="danger" class="btn" @click="deleteGeo"
            >删除</el-button
          >
        </el-col>
      </el-row>
    </el-form>
    <el-dialog
      title="图标类型"
      :modal="false"
      :visible.sync="isShowPointImgSelectDialog"
    >
      <section>
        <div
          v-for="item in pointSelect"
          :key="item.label"
          :title="item.label"
          :class="'imgBox ' + item.value"
          @click="pointChange(item)"
        ></div>
      </section>
    </el-dialog>
  </el-card>
</template>

<script>
import * as PlotTypes from 'shinegis-client-23d/src/map-core/olPlot/Utils/PlotTypes';
import ColorPickerFormItem from './color-picker-form-item';
import * as PngTypes from 'shinegis-client-23d/src/map-core/olPlot/Geometry/point/PngTypes';
import { DEF_STYEL } from 'shinegis-client-23d/src/map-core/olPlot/Constants';
import Bus from 'shinegis-client-23d/src/utils/bus';

export default {
  name: 'PlotStyle',
  components: {
    ColorPickerFormItem: ColorPickerFormItem
  },
  data() {
    return {
      isShow: false,
      pointSelect: [],
      isShowPointImgSelectDialog: false,
      type: undefined,
      style: DEF_STYEL,
      arrowTypeNo: 'arrowTypeNo',
      arrownone: 'arrownone',
      isShowText: false,
      isShowFill: false,
      isShowLine: false,
      isShowPloyStroke: false,
      isShowStroke: false,
      isShowRadius: false,
      isShowImage: false,
      isShowChildStroke: false,
      isShowDash: false,
      isShowDashDivide: false,
      isShowRoad: false,
      isShowPoly: false,
      isShowGradient: false,
      isShadow: false,
      isShowArrowTypeArrow: false,
      isShowArrow: false,
      isShowDotted: false,
      isShowOpreate: false,
      notShowDashColorAndWidth: false
    };
  },
  watch: {
    arrownone() {
      if (this.arrownone === 'arrownone') {
        this.style.arrow.showArrow = [];
      }
    },
    arrowTypeNo() {
      if (this.arrowTypeNo === 'arrowTypeNo') {
        this.style.arrow.arrowShowArrow = [];
      }
    },
    type() {
      this.setShowByType();
    },
    style: {
      handler: function () {
        this.refreshStyle(this.style, this.type);
      },
      deep: true
    },
    'style.point.type': {
      handler: function () {
        if (this.type === PlotTypes.POINT) {
          if (this.style.point.type === 'image') {
            this.setAllShow(false);
            this.isShowImage = true;
          }
        }
      },
      immediate: true
    },
    'style.type': {
      handler: function () {
        this.setSpecialType();
      },
      immediate: true
    }
  },
  mounted() {
    this.setShowByType();
    Bus.$on('changePlotStyle', (type, style) => {
      this.setType(type);
      this.setStyle(style);
    });
    for (let key in PngTypes) {
      this.pointSelect.push(PngTypes[key]);
    }
    Bus.$emit('gisPlotStyleFinish');
  },
  methods: {
    setShow(isShow) {
      this.isShow = isShow;
    },
    setType(type) {
      this.type = type;
      this.setShowByType();
    },
    getType() {
      return this.type;
    },
    setStyle(style) {
      this.style = JSON.parse(JSON.stringify(style));
      try {
        if (this.style.arrow.showArrow.length > 0) {
          this.arrownone = '';
        }
        if (this.style.arrow.arrowShowArrow.length > 0) {
          this.arrowTypeNo = '';
        }
        // eslint-disable-next-line no-empty
      } catch (e) {}
      this.$forceUpdate();
    },
    getStyle() {
      return this.style;
    },
    setAllShow(isShow) {
      this.isShowText = isShow;
      this.isShowFill = isShow;
      this.isShowRadius = isShow;
      this.isShowLine = isShow;
      this.isShowPloyStroke = isShow;
      this.isShowStroke = isShow;
      this.isShowChildStroke = isShow;
      this.isShowDash = isShow;
      this.isShowDashDivide = isShow;
      this.isShowRoad = isShow;
      this.isShowPoly = isShow;
      this.isShowGradient = isShow;
      this.isShadow = isShow;
      this.isShowArrow = isShow;
      this.isShowArrowTypeArrow = isShow;
      this.isShowDotted = isShow;
      this.isShowImage = isShow;
      this.notShowDashColorAndWidth = isShow;
      // 特殊处理
      this.isShowOpreate = true;
    },
    setShowByType() {
      if (!this.type) {
        return;
      }
      this.isShow = true;
      this.setAllShow(false);
      switch (this.type) {
        case PlotTypes.TEXTAREA:
          // return 'TextArea'
          this.isShowText = true;
          this.isShowOpreate = true;
          break;
        case PlotTypes.POINT:
          this.isShowFill = true;
          this.isShowStroke = true;
          this.isShowRadius = true;
          this.isShowPoly = true;
          if (this.style.point.type === 'image') {
            this.setAllShow(false);
            this.isShowImage = true;
          }
          break;
        case PlotTypes.PENNANT:
          break;
        case PlotTypes.POLYLINE:
          this.isShowStroke = true;
          this.isShowArrow = true;
          this.isShowLine = true;
          break;
        case PlotTypes.DASHLINE:
          this.isShowDash = true;
          this.isShowDashDivide = true;
          this.isShowArrow = true;
          this.isShowLine = true;
          break;
        case PlotTypes.RAILLOADLINE:
          this.isShowStroke = true;
          this.isShowArrow = true;
          this.isShowDash = true;
          this.isShowDashDivide = true;
          this.isShowRoad = true;
          break;
        case PlotTypes.RAILLOADCURVE:
          this.isShowStroke = true;
          this.isShowArrow = true;
          this.isShowDash = true;
          this.isShowDashDivide = true;
          this.isShowRoad = true;
          break;
        case PlotTypes.ARC:
          this.isShowStroke = true;
          this.isShowLine = true;
          break;
        case PlotTypes.CIRCLE:
          this.isShowGradient = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          this.isShadow = true;
          this.isShowPloyStroke = true;
          break;
        case PlotTypes.CURVE:
          this.isShowStroke = true;
          this.isShowArrow = true;
          this.isShowLine = true;
          break;
        case PlotTypes.DASHCURVE:
          this.isShowStroke = true;
          this.isShowArrow = true;
          this.isShowLine = true;
          break;
        case PlotTypes.MULTIPLECURVE:
          this.isShowStroke = true;
          this.isShowChildStroke = true;
          // this.isShowArrow = true
          break;
        case PlotTypes.FREEHANDLINE:
          break;
        case PlotTypes.RECTANGLE:
          this.isShowFill = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          this.isShadow = true;
          this.isShowPloyStroke = true;
          break;
        case PlotTypes.ELLIPSE:
          this.isShowFill = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          this.isShadow = true;
          this.isShowPloyStroke = true;
          break;
        case PlotTypes.LUNE:
          this.isShowFill = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          this.isShadow = true;
          this.isShowPloyStroke = true;
          break;
        case PlotTypes.SECTOR:
          this.isShowFill = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          this.isShadow = true;
          this.isShowPloyStroke = true;
          break;
        case PlotTypes.CLOSED_CURVE:
          this.isShowFill = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          this.isShadow = true;
          this.isShowPloyStroke = true;
          break;
        case PlotTypes.POLYGON:
          this.isShowFill = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          this.isShadow = true;
          this.isShowPloyStroke = true;
          break;
        case PlotTypes.ATTACK_ARROW:
          this.isShowGradient = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          break;
        case PlotTypes.FREE_POLYGON:
          this.isShowFill = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          break;
        case PlotTypes.DOUBLE_ARROW:
          this.isShowGradient = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          break;
        case PlotTypes.STRAIGHT_ARROW:
          this.isShowStroke = true;
          break;
        case PlotTypes.FINE_ARROW:
          this.isShowGradient = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          break;
        case PlotTypes.DOTTED_ARROW:
          this.isShowDash = true;
          this.isShowDashDivide = true;
          this.isShowDotted = true;
          this.isShowArrowTypeArrow = true;
          break;
        case PlotTypes.ASSAULT_DIRECTION:
          this.isShowGradient = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          break;
        case PlotTypes.TAILED_ATTACK_ARROW:
          this.isShowGradient = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          break;
        case PlotTypes.SQUAD_COMBAT:
          this.isShowGradient = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          break;
        case PlotTypes.TAILED_SQUAD_COMBAT:
          this.isShowGradient = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          break;
        case PlotTypes.GATHERING_PLACE:
          this.isShowFill = true;
          this.isShowStroke = true;
          this.isShowPoly = true;
          break;
        case PlotTypes.RECTFLAG:
          break;
        case PlotTypes.TRIANGLEFLAG:
          break;
        case PlotTypes.CURVEFLAG:
          break;
      }
      this.setSpecialType();
    },
    setSpecialType() {
      switch (this.style.type) {
        case 'polyline':
          this.isShowDashDivide = false;
          break;
        case 'dashline':
          this.isShowDashDivide = true;
          break;
      }
    },
    handleArrowCheckedChange() {
      if (this.style.arrow.showArrow.length > 0) {
        this.arrownone = '';
      }
      if (this.style.arrow.arrowShowArrow.length > 0) {
        this.arrowTypeNo = '';
      }
    },
    importFile() {
      this.$refs.fileinput.dispatchEvent(new MouseEvent('click'));
    },
    handleAvatarSuccess(event) {
      if (event.target.files[0]) {
        this.style.arrowImg = URL.createObjectURL(event.target.files[0]);
      }
    },
    pointChange(item) {
      this.style.point.src = '/images/plot/' + item.value + '-white.png';
      this.style.point.iconSrc = '/images/plot/' + item.value + '.png';
      this.isShowPointImgSelectDialog = false;
    },
    refreshStyle(style, type) {
      this.$emit('refreshStyle', style, type);
    },
    deleteGeo() {
      // this.$emit('deleteGeo')
      this.$emit('deleteGeo');
    },
    translateGeo() {
      this.$emit('translateGeo');
    },
    zIndexChange(isUp) {
      this.$emit('zIndexChange', isUp);
    }
  }
};
</script>
