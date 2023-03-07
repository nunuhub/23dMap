<template>
  <div v-show="shouldShow" class="sh-clip-tools">
    <general-container
      :is-show.sync="visible"
      :title="title ? title : '任意裁切面'"
      :img-src="imgSrc ? imgSrc : 'clip-tools'"
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
          <span class="layers_label">裁剪瓦片：</span>
          <el-select
            v-model="select_layers"
            size="mini"
            multiple
            collapse-tags
            placeholder="请选择"
            @change="changeTileset()"
          >
            <el-option
              v-for="item in layer3dtiles"
              :key="item.value"
              :label="item.label"
              :value="item.id"
            >
            </el-option>
          </el-select>
          <icon-svg
            :icon-class="isEntityShow ? 'display' : 'hide'"
            style="cursor: pointer; margin-left: 15px"
            @click.native="handleShow()"
          ></icon-svg>
        </div>
        <div class="clip_type">
          <el-radio-group v-model="clip_type" @change="changeType()">
            <el-radio :label="0">水平面</el-radio>
            <el-radio :label="1">立面</el-radio>
            <el-radio :label="2">盒子</el-radio>
            <el-radio :label="3">凸多边形</el-radio>
          </el-radio-group>
        </div>
        <div v-if="clip_type == 2" class="clip_nw">
          <el-radio-group
            v-model="isOutside"
            size="mini"
            @change="changeUnionClippingRegions()"
          >
            <el-radio-button :label="false">裁切盒内</el-radio-button>
            <el-radio-button :label="true">裁切盒外</el-radio-button>
          </el-radio-group>
        </div>

        <div class="btnBox">
          <div class="btn" @click="startClip()">开始裁剪</div>
          <div class="btn" @click="delPlane()">清除</div>
          <!-- <div class="btn" @click="test()">测试</div> -->
        </div>
      </div>
    </general-container>
  </div>
</template>

<script>
import { Draw } from 'shinegis-client-23d/src/earth-core/Entry57';
import * as DrawEventType from 'shinegis-client-23d/src/earth-core/Draw/EventType7';
import {
  cartesian2lonlat,
  lonlats2cartesians
} from 'shinegis-client-23d/src/earth-core/Tool/Util3';
import { addPositionsHeight } from 'shinegis-client-23d/src/earth-core/Tool/Point2';
import { ClipTools } from 'shinegis-client-23d/src/earth-core/Widget/ClipTools';
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import { Cesium } from 'shinegis-client-23d/src/earth-core/Entry57';
import common from 'shinegis-client-23d/src/mixins/common';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import { Message } from 'element-ui';
let Map3d, drawTool, currPlane, clipTool;
let tilesetArr = [];
let layer3dtilesArr = [];

export default {
  name: 'ShClipTools',
  components: {
    GeneralContainer: GeneralContainer,
    IconSvg: IconSvg
  },
  mixins: [common, generalCardProps, emitter],
  data() {
    return {
      shouldShow: false,
      layer3dtiles: [],
      clip_type: 0,
      select_layers: [],
      isSelected: false,
      isOutside: false, // 裁切盒内
      checkedLayers: null,
      rotation: 0,
      isEntityShow: true // 是否显示绘制的entity
    };
  },
  watch: {
    currentView: {
      handler(val) {
        this.shouldShow = val === 'earth';
      },
      immediate: true
    },
    clip_type: function (val) {
      // console.log("裁剪类型", val);
      if (val === 4) {
        drawTool.hasEdit(false);
      } else {
        drawTool.hasEdit(true);
      }
    },
    checkedLayers: function (newVal) {
      this.layer3dtiles = [];
      // console.log('checkedLayers', newVal);
      layer3dtilesArr = newVal.filter(
        (ele) =>
          ele.type === '3dtiles' || ele.type === 'S3M' || ele.type === 'I3S'
      );
      layer3dtilesArr.map((item) => {
        let obj = {};
        obj.label = item.label;
        obj.id = item.id;
        this.layer3dtiles.push(obj);
      });
      if (layer3dtilesArr.length === 0) {
        this.select_layers = [];
        drawTool.deleteAll();
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
  beforeDestroy() {
    for (let i = 0; i < tilesetArr.length; i++) {
      tilesetArr[i].backFaceCulling = true;
    }
    this.delPlane();
  },
  methods: {
    onChangeIsShow(val) {
      this.$emit('change:isShow', val);
      if (!val) {
        for (let i = 0; i < tilesetArr.length; i++) {
          tilesetArr[i].backFaceCulling = true;
        }
        this.delPlane();
        this.stopDraw();
      }
    },
    begin() {
      Map3d = this.$earth.viewer;
      this.initDraw();
    },
    initDraw() {
      let that = this;
      this.checkedLayers = Map3d.shine.layerManager.checkedLayers;
      let options = {
        // hasEdit: true,
        hasEdit: true,
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
      clipTool = new ClipTools(Map3d, dataSource);

      drawTool.selectHandler.removeInputAction(15);
      drawTool.on(DrawEventType.DrawCreated, function (e) {
        currPlane = e.entity;
        that.toClip();
        that.startEditing(e.entity);
        if (that.clip_type === 2) {
          clipTool.createIndicator(e.entity);
        }
      });
      drawTool.on(DrawEventType.EditStart, function (e) {
        currPlane = e.entity;
        that.startEditing(e.entity);
      });

      // 测试模型
      // let tileset = Map3d.scene.primitives.add(
      //   new Cesium.Cesium3DTileset({
      //     // url: "http://data.mars3d.cn/3dtiles/bim-daxue/tileset.json",
      //     // url: "http://192.168.20.117:8087/static/tongxiang/BIM_DANGANGUAN/tileset.json",
      //     url: "http://192.168.20.117:8087/static/RZ100_3DT/tileset.json"
      //   })
      // );
      // tilesetArr.push(tileset);
      // clipTool.setTilesetArr(tilesetArr);
    },
    test() {
      var boundingSphere = tilesetArr[0].boundingSphere;
      var radius = boundingSphere.radius;
      Map3d.zoomTo(
        tilesetArr[0],
        new Cesium.HeadingPitchRange(0.5, -0.2, radius * 2.0)
      );
    },
    // 绘制
    startDraw() {
      this.delPlane();
      let LevelStyle = {
        // 水平面
        height: 50,
        fill: true,
        color: '#FFFFFF',
        // color: "#FFFFFF",
        opacity: 0.2,
        outline: true,
        outlineWidth: 1,
        outlineColor: '#ffffff',
        // outlineColor: "#ffffff",
        outlineOpacity: 0.9,
        rotation: 0,
        clampToGround: false,
        zIndex: 0,
        isMoveHeightPlane: true
      };
      let facadeStyle = {
        extrudedHeight: 20,
        fill: true,
        color: '#fff',
        opacity: 0.2,
        outline: true,
        outlineWidth: 1,
        outlineColor: '#ffffff',
        outlineOpacity: 0.9,
        clampToGround: false
      };
      let boxStyle = {
        fill: true,
        color: '#fff',
        opacity: 0.2,
        outline: true,
        outlineWidth: 1,
        outlineColor: '#ffffff',
        outlineOpacity: 0.9,
        extrudedHeight: 10,
        perPositionHeight: true,
        zIndex: 0,
        rotation: this.rotation,
        isBoxbelow: true
      };
      let polygonStyle = {
        // color: "#ffff00",
        color: '#fff',
        opacity: 0.2,
        outline: true,
        outlineWidth: 1,
        outlineColor: '#ffffff',
        clampToGround: false,
        zIndex: 0,
        extrudedHeight: 20,
        isDragBelow: true
      };
      switch (this.clip_type) {
        case 0: // 水平面
          drawTool.startDraw({
            type: 'rectangle',
            style: LevelStyle,
            attr: { isClip: true }
          });
          break;
        case 1: {
          // 立面
          let facadeConfig = {
            minPointNum: 2,
            maxPointNum: 2,
            height: true,
            isContour: true,
            isSameHeight: true,
            attr: { isClip: true }
          };
          drawTool.startDraw({
            type: 'wall',
            style: facadeStyle,
            config: facadeConfig
          });
          break;
        }
        case 2: // 盒子
          // drawTool.startDraw({
          //   // type: "polygon",
          //   type: "rectangle",
          //   style: boxStyle,
          //   attr: {isClip: true},
          //   config: {
          //     height: false,
          //     minPointNum: 2,
          //     maxPointNum: 2,
          //     isSameHeight: true,
          //   },
          // });
          drawTool.startDraw({
            type: 'polygon',
            style: boxStyle,
            config: {
              height: false,
              minPointNum: 4,
              maxPointNum: 4,
              isSameHeight: true,
              isBox: true
            },
            attr: { isClip: true }
          });
          break;
        case 3: // 凸多边形
          drawTool.startDraw({
            type: 'polygon',
            style: polygonStyle,
            config: { height: false, isSameHeight: true },
            attr: { isClip: true }
          });
          break;
      }
    },
    // 拖拽裁切
    startEditing() {
      const draggers = currPlane.editing.draggers;
      draggers.forEach((dragger) => {
        dragger.callback = (position, type) => {
          clipTool.updatePlane(position, type);
        };
      });
    },
    startClip() {
      // this.startDraw();
      if (this.select_layers && this.select_layers.length > 0) {
        this.startDraw();
      } else {
        Message.error('请选择裁剪瓦片');
      }
    },
    // 显隐
    handleShow() {
      if (currPlane) {
        this.isEntityShow = !this.isEntityShow;
        let dataSource = drawTool.getDataSource();
        dataSource.show = this.isEntityShow;
      }
    },
    // 选择tileset
    changeTileset() {
      tilesetArr = [];
      for (let i = 0; i < this.select_layers.length; i++) {
        let layer = Map3d.shine.getLayer(this.select_layers[i], 'id');
        if (!layer.model) {
          Message.error('暂时不支持此类服务的裁切！');
          this.select_layers.splice(i, 1);
        } else {
          tilesetArr.push(layer.model);
        }
      }
      clipTool.setTilesetArr(tilesetArr);
    },
    // 更改裁切类型
    changeType() {
      clipTool.setType(this.clip_type);
      drawTool.deleteAll();
    },
    // 切换盒内盒外
    changeUnionClippingRegions() {
      // this.delPlane();
      clipTool.setOutside(this.isOutside);
      this.toClip();
    },
    // 清除裁切
    delPlane() {
      drawTool.deleteAll();
      currPlane = null;
      clipTool.clearClippingPlane();
      this.isEntityShow = true;
    },
    // 裁切
    toClip() {
      // console.log("currPlane", currPlane);
      if (!currPlane) return;
      let points = [];
      let heightPoint;
      switch (this.clip_type) {
        case 0: {
          let p1 = cartesian2lonlat(currPlane.editing._positions_draw[0]);
          let p2 = cartesian2lonlat(currPlane.editing._positions_draw[1]);
          let [x1, x2, y1, y2] = this.computeLonLat(p1, p2);
          let z = p1[2];
          let point1 = [x1, y2, z];
          let point2 = [x2, y2, z];
          let point3 = [x2, y1, z];
          let point4 = [x1, y1, z];
          heightPoint = currPlane.editing.heightDraggers[0].position._value;
          points = lonlats2cartesians([point1, point2, point3, point4]);
          break;
        }
        case 1: {
          let h = currPlane.wall.maximumHeights.getValue();
          points = currPlane.wall.positions.getValue();
          let ph1 = addPositionsHeight(points[0], h[0]);
          let ph2 = addPositionsHeight(points[1], h[1]);
          heightPoint = [ph1, ph2];
          break;
        }
        case 2:
          heightPoint = currPlane.editing.heightDraggers[0].position._value;
          points = currPlane.editing._positions_draw;
          break;
        case 3:
          heightPoint = currPlane.editing.heightDraggers[0].position._value;
          points = currPlane._positions_draw;
          break;
      }
      clipTool.toClip(points, heightPoint);
    },
    // 计算对角坐标 x1 < x2; y1 < y2
    computeLonLat(p1, p2) {
      let x1, x2, y1, y2;
      if (p1[0] < p2[0]) {
        x1 = p1[0];
        x2 = p2[0];
      } else {
        x1 = p2[0];
        x2 = p1[0];
      }
      if (p1[1] < p2[1]) {
        y1 = p1[1];
        y2 = p2[1];
      } else {
        y1 = p2[1];
        y2 = p1[1];
      }
      return [x1, x2, y1, y2];
    },
    stopDraw() {
      drawTool && drawTool.stopDraw();
    }
  }
};
</script>
