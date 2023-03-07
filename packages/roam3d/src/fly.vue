<template>
  <div v-show="flyShow" v-cardDrag class="sh-fly fly_view">
    <div class="fly_content el-card__header" style="pointer-events: all">
      <div class="fly_l">
        <span title="上一节点">
          <icon-svg
            icon-class="left"
            style="cursor: pointer"
            @click.native="backward()"
          ></icon-svg>
        </span>
        <span>
          <icon-svg
            v-if="isPlay"
            icon-class="play"
            style="cursor: pointer"
            @click.native="start()"
          ></icon-svg>
          <icon-svg
            v-else
            icon-class="pause"
            style="cursor: pointer"
            @click.native="suspend()"
          ></icon-svg>
        </span>
        <span title="下一节点">
          <icon-svg
            icon-class="right"
            style="cursor: pointer"
            @click.native="forward()"
          ></icon-svg>
        </span>
        <span title="停止漫游">
          <icon-svg
            icon-class="play2"
            style="cursor: pointer"
            @click.native="stop()"
          ></icon-svg>
        </span>
      </div>
      <div class="fly_r">
        <el-select v-model="cameraType" @change="selectCamera()">
          <el-option
            v-for="(item, index) in cameraTypeList"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <div class="back">
          <span title="返回列表">
            <!-- <icon-svg
              icon-class="更多"
              @click.native="signOut()"
              style="cursor: pointer"
            ></icon-svg> -->
            <icon-svg
              width="14px"
              height="14px"
              icon-class="close"
              style="cursor: pointer"
              @click.native="signOut()"
            ></icon-svg>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import IconSvg from 'shinegis-client-23d/packages/icon-svg';
import { RoamFly } from 'shinegis-client-23d/src/earth-core/Widget/Fly';
import cardDrag from 'shinegis-client-23d/src/directives/export-card-drag';
import { Message } from 'element-ui';
let roamFly;
export default {
  name: 'Fly',
  directives: { cardDrag },
  components: {
    IconSvg: IconSvg
  },
  data() {
    return {
      flyShow: false,
      cameraTypeList: [
        {
          label: '无',
          value: '0'
        },
        {
          label: '自由视角',
          value: 'gs'
        },
        {
          label: '锁定视角',
          value: 'dy'
        },
        {
          label: '上帝视角',
          value: 'sd'
        }
      ],
      cameraType: 'dy',
      flyData: null,
      isPlay: true,
      isStart: true
      // RoamFly: null,
    };
  },
  methods: {
    init(data, map) {
      // console.log("flyData", data);
      if (!data) {
        Message.error('当前没有漫游路线数据！');
        return;
      }
      if (this.flyShow) {
        this.stop();
      }
      this.flyData = data;
      this.flyShow = true;
      roamFly = new RoamFly({
        route: data,
        viewer: map,
        timeEnd: this._timeEnd
      });
      this.cameraType = data.properties.attr.cameraType;
      this.start();
    },
    setComponentShow(val) {
      this.flyShow = val;
    },
    // 改变视角
    cameraTypeChange(val) {
      roamFly.updateAttr({ cameraType: val });
    },
    selectCamera() {
      this.cameraTypeChange(this.cameraType);
    },
    // 开始飞行
    start() {
      this.isPlay = false;
      if (this.isStart) {
        roamFly.start(this.flyData);
      } else {
        this.play();
      }
    },
    play() {
      roamFly.isPause = false;
    },
    // 停止飞行
    stop() {
      roamFly.stop();
      this.isPlay = true;
      this.isStart = true;
      roamFly.isPause = false;
    },
    // 暂停
    suspend() {
      roamFly.recordPause();
      this.isPlay = true;
      this.isStart = false;
      roamFly.isPause = true;
    },
    // 上一个节点
    backward() {
      roamFly.backward();
    },
    // 下一个节点
    forward() {
      roamFly.forward();
    },
    _timeEnd() {
      this.isPlay = true;
      this.isStart = true;
    },
    // 退出漫游
    signOut() {
      this.flyShow = false;
      this.isStart = true;
      let roamConfig = {
        isShow: true,
        isMin: false,
        roamId: null,
        selectIndex: 0,
        isDisable: true,
        isRemove: true
      };
      this.$emit('setRoamView', roamConfig);
      if (roamFly) roamFly.stop();
    },
    closeView() {
      this.flyShow = false;
      this.isStart = true;
      if (roamFly) roamFly.stop();
    }
  }
};
</script>
