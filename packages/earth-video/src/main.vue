<template>
  <div v-show="shouldShow" class="sh-earth-video">
    <general-container
      ref="container"
      :is-show.sync="visible"
      :style-config="styleConfig"
      :title="title ? title : '监控投影'"
      :img-src="imgSrc ? imgSrc : 'earth-video'"
      :berth="berth"
      :position="position"
      :theme="theme"
      :drag-enable="dragEnable"
      :append-to-body="appendToBody"
      :theme-style="cardThemeStyle"
      :only-container="onlyContainer"
      @change:isShow="onChangeIsShow"
    >
      <div v-show="true" class="spatialAnaContainer">
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
    </general-container>
    <div v-show="videoShow" ref="videoParent" v-drag :style="videoPosition">
      <video
        id="videoContainer"
        ref="videoPlayer"
        autoplay
        crossOrigin="anonymous"
        class="video-js videoContainer vjs-big-play-centered move_header"
      ></video>
    </div>
  </div>
</template>

<script>
import GeneralContainer from 'shinegis-client-23d/packages/general-card';
import generalCardProps from 'shinegis-client-23d/src/mixins/components/general-card-props';
import PageForm from './page-form.vue';
import drag from 'shinegis-client-23d/src/directives/bar-drag';
import Videojs from 'video.js';
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import VideoProjection from 'shinegis-client-23d/src/earth-core/Scene/VideoProjection';
import * as Cesium from 'cesium_shinegis_earth';
import 'video.js/dist/video-js.css';
let videoPlayer, videoProjection;
let lastClick; //'point2point'/'cameraPose' 最后一次点击。用于两套参数的判断。
const fieldList = [
  {
    title: { name: '观察点', showList: true },
    formList: [
      [
        {
          label: '视频地址',
          value: 'videoUrl',
          type: 'input_url',
          disabled: false
        }
      ],
      [
        {
          label: '视频显隐',
          value: 'videoShow',
          type: 'switch',
          className: 'nopadding terrainRow'
        }
      ]
    ]
  },
  {
    title: { name: '参数设置', showList: true },
    formList: [
      [
        {
          label: '监控位置',
          type: 'onlyLabel',
          labelWidth: '175px'
        }
      ],
      [
        {
          label: '',
          value: 'viewPosition_x',
          type: 'input',
          span: 9,
          labelWidth: '0',
          placeholder: '经度',
          className: 'padding_onlyleft'
        },
        {
          label: '',
          value: 'viewPosition_y',
          type: 'input',
          labelWidth: '0',
          span: 9,
          placeholder: '纬度'
        },
        {
          label: '',
          value: 'viewPosition_z',
          type: 'input',
          span: 6,
          labelWidth: '0',
          placeholder: '高程',
          className: 'padding_onlyright'
        }
      ],
      [
        {
          label: '观测点位置',
          type: 'onlyLabel',
          labelWidth: '180px'
        }
      ],
      [
        {
          label: '',
          value: 'viewPositionEnd_x',
          type: 'input',
          span: 9,
          labelWidth: '0',
          placeholder: '经度',
          className: 'padding_onlyleft'
        },
        {
          label: '',
          value: 'viewPositionEnd_y',
          type: 'input',
          span: 9,
          labelWidth: '0',
          placeholder: '纬度'
        },
        {
          label: '',
          value: 'viewPositionEnd_z',
          type: 'input',
          span: 6,
          labelWidth: '0',
          placeholder: '高程',
          className: 'padding_onlyright'
        }
      ],
      [
        {
          label: '方位角(°)',
          value: 'heading',
          type: 'inputNumber',
          className: 'nopadding terrainRow',
          labelWidth: '70px',
          min: -359,
          max: 360
        },
        {
          label: '俯仰角(°)',
          value: 'pitch',
          type: 'inputNumber',
          className: 'nopadding terrainRow',
          labelWidth: '70px',
          min: -90,
          max: 90
        }
      ],
      [
        {
          label: '水平张角',
          value: 'fovx',
          type: 'inputNumber',
          labelWidth: '70px',
          min: 0.1,
          max: 179,
          className: 'nopadding terrainRow'
        },
        {
          label: '竖直张角',
          value: 'fovy',
          type: 'inputNumber',
          labelWidth: '70px',
          min: 0.1,
          max: 179,
          className: 'nopadding terrainRow'
        }
      ],
      [
        {
          label: '宽高比',
          value: 'aspectRatio',
          type: 'inputNumber',
          className: 'nopadding terrainRow',
          labelWidth: '70px',
          min: 0.1
        },
        {
          label: '视线距离',
          value: 'viewDistance',
          type: 'inputNumber',
          className: 'nopadding terrainRow',
          labelWidth: '70px',
          min: 1
        }
      ],
      [
        {
          label: '视锥外轮廓线',
          value: 'showFrustumOutline',
          type: 'switch',
          className: 'nopadding terrainRow',
          labelWidth: '100px'
        },
        {
          label: '投影面草图',
          value: 'showSketch',
          type: 'switch',
          className: 'nopadding terrainRow'
        }
      ]
    ]
  },
  {
    title: { name: '操作', showList: true },
    formList: [
      [
        {
          label: '',
          labelWidth: '43px',
          value: 'btnRow',
          type: 'btnRow',
          span: 24,
          className: 'nopadding',
          list: [
            { name: '定位', value: 'flyto' },
            { name: '执行投影', value: 'execute' },
            { name: '销毁', value: 'destroy' }
          ]
        }
      ]
    ]
  }
];
export default {
  name: 'ShEarthVideo',
  components: { PageForm, GeneralContainer },
  directives: { drag },
  mixins: [common, emitter, generalCardProps],
  props: {
    videoPlayerProps: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      videoPlayerOptions: {
        //autoplay: 'muted', //自动播放
        controls: true, //用户可以与之交互的控件
        loop: true, //视频一结束就重新开始
        muted: false, //默认情况下将使所有音频静音
        resizeManager: true,
        //aspectRatio: '16:9', //显示比率
        fullscreen: {
          options: { navigationUI: 'hide' }
        },
        restoreEl: true,
        // techOrder: ['html5', 'flvjs'], // 兼容顺序
        html5: {
          vhs: {
            withCredentials: true
          }
        },
        sources: [
          {
            /* src: 'http://ivi.bupt.edu.cn/hls/chchd.m3u8' */
          }
        ]
      },
      formInfo: {
        data: {
          videoUrl: null,
          videoShow: true,
          viewPosition_x: 0,
          viewPosition_y: 0,
          viewPosition_z: 0,
          viewPositionEnd_x: undefined,
          viewPositionEnd_y: undefined,
          viewPositionEnd_z: undefined,
          heading: undefined,
          pitch: undefined,
          aspectRatio: undefined,
          viewDistance: undefined,
          fovx: undefined,
          fovy: undefined
        },
        fieldList: fieldList,
        labelWidth: '80px'
      }
    };
  },
  computed: {
    shouldShow() {
      return this.currentView === 'earth';
    },
    videoShow() {
      let show = this.videoPlayerProps?.show;
      show = show === undefined ? true : show;
      return show;
    },
    videoPosition() {
      return (
        this.videoPlayerProps?.position || {
          position: 'absolute',
          bottom: '175px',
          right: '517px',
          width: '320px',
          height: '180px'
        }
      );
    },
    videoDragEnable() {
      return this.videoPlayerProps?.dragEnable;
    }
  },
  watch: {
    videoDragEnable: {
      handler(value) {
        this.$nextTick(() => {
          this.$refs.videoPlayer?.setAttribute('dragEnable', value);
        });
      },
      immediate: true
    }
  },
  mounted() {
    this.copyOfVideoContainer = this.$refs.videoPlayer.cloneNode();
    this.copyOfVideoContainer.onmousedown = this.$refs.videoPlayer.onmousedown;
    if (this.$earth) {
      setTimeout(() => {
        this.begin();
        this.$emit('inited', this);
      }, 0);
    }
  },
  deactivated() {
    if (videoPlayer) {
      videoPlayer.dispose(); // 该方法会重置videojs的内部状态并移除dom
    }
  },
  beforeDestroy() {
    //  组件销毁时，清除播放器
    if (videoPlayer) {
      videoPlayer.dispose(); // 该方法会重置videojs的内部状态并移除dom
    }
  },
  methods: {
    // 组件逻辑开始入口,如果组件有初始运行逻辑，请在此方法内编写，不要修改此方法名；如果没有可删除此方法。
    begin() {
      this.$emit('inited', this);
    },
    onChangeIsShow(value) {
      this.$emit('change:isShow', value);
    },
    handleEvent(key, value) {
      if (key === 'execute') {
        let data = this.formInfo.data;
        let viewPosition = [
          parseFloat(data.viewPosition_x) || 0,
          parseFloat(data.viewPosition_y) || 0,
          parseFloat(data.viewPosition_z) || 0
        ];
        let viewPositionEnd = [
          parseFloat(data.viewPositionEnd_x) || 0,
          parseFloat(data.viewPositionEnd_y) || 0,
          parseFloat(data.viewPositionEnd_z) || 0
        ];
        let options = {
          viewPosition,
          viewPositionEnd,
          viewDistance: data.viewDistance,
          heading: data.heading,
          pitch: data.pitch,
          aspectRatio: data.aspectRatio,
          fovy: data.fovy,
          showFrustumOutline: data.showFrustumOutline,
          showSketch: data.showSketch
        };
        options.url = this.formInfo.data.videoUrl;
        this.execute(options);
        this.setVideoShow(true);
      } else if (key === 'showFrustumOutline' || key === 'showSketch') {
        if (videoProjection) {
          videoProjection.showFrustumOutline =
            this.formInfo.data.showFrustumOutline;
          videoProjection.showSketch = this.formInfo.data.showSketch;
          videoProjection.update();
        }
      } else if (key === 'videoShow') {
        this.setVideoShow(value);
      } else if (key === 'videoUrl') {
        this.setVideoPlayer(value);
      } else if (key === 'destroy') {
        this.destroy();
      } else if (key === 'flyto') {
        let data = this.formInfo.data;
        if (videoProjection?.viewPosition) {
          let wgs84 = Cesium.Cartographic.fromCartesian(
            videoProjection?.viewPosition
          );
          let target = {
            x: Cesium.Math.toDegrees(wgs84.longitude),
            y: Cesium.Math.toDegrees(wgs84.latitude),
            z: wgs84.height,
            heading: videoProjection.viewHeading,
            pitch: videoProjection.viewPitch
          };
          this.$earth.viewer.shine.zoomToLayer({ camera: target });
        } else if (data.viewPosition_x && data.viewPosition_y) {
          let target = {
            x: data.viewPosition_x,
            y: data.viewPosition_y,
            z: data.viewPosition_z,
            heading: data.heading,
            pitch: data.pitch
          };
          this.$earth.viewer.shine.zoomToLayer({ camera: target });
        }
      } else if (
        key === 'aspectRatio' ||
        key === 'viewDistance' ||
        key === 'fovy' ||
        key === 'fovx' ||
        key === 'pitch' ||
        key === 'heading'
      ) {
        lastClick = 'cameraPose';
      } else if (key.includes('viewPositionEnd_')) {
        lastClick = 'point2point';
      }
    },
    /**
     * 执行监控投影，包括创建/更新视频播放器、投影实例。
     */
    execute(options) {
      //先创建投影实例，后创建播放器，播放器canplay里更新投影的输入。
      this.setVideoProjection(options);
      this.setVideoPlayer(options.url);
    },
    getVideoPlayer() {
      return videoPlayer?.player();
    },
    setVideoPlayer(url) {
      if (!url) return;
      if (videoPlayer) {
        videoPlayer.handleSrc_([{ src: url }]);
      } else {
        this.videoPlayerOptions.sources[0] = { src: url };
        let element = this.$refs.videoPlayer;
        if (!element || !element.parentElement) {
          element = this.copyOfVideoContainer.cloneNode();
          element.onmousedown = this.copyOfVideoContainer.onmousedown;
          this.$refs.videoParent.appendChild(element);
        }
        videoPlayer = Videojs(element, this.videoPlayerOptions);
      }
      videoPlayer.on('canplay', () => {
        this.formInfo.data.videoUrl = url;
        if (videoProjection) {
          let videoElement = document.getElementById(
            'videoContainer_html5_api'
          );
          let material = Cesium.Material.fromType('Image');
          material.uniforms.image = videoElement;
          videoProjection.material = material;
          videoProjection.update();
        }
      });
    },
    setVideoProjection(options) {
      let data = this.formInfo.data;
      let viewPosition = Cesium.Cartesian3.fromDegrees.apply(
        this,
        options.viewPosition
      );
      let viewPositionEnd = Cesium.Cartesian3.fromDegrees.apply(
        this,
        options.viewPositionEnd || [0, 0]
      );
      let vertify =
        Cesium.Cartesian3.distance(viewPosition, viewPositionEnd) > 100000;
      if (vertify) {
        //1、当两点过远时，视为取‘点加姿态’的输入方式。
        viewPositionEnd = null;
      }
      let horizontalViewAngle;
      let verticalViewAngle;
      let aspectRatio = //倘若videoPlayer为空，则纹理更加为空
        videoPlayer?.videoWidth() / videoPlayer?.videoHeight() || 1.77777; //1920.0/1080.0;//viewer.camera.frustum.aspectRatio;
      let fovy = options.fovy; //26.2;//38.5;verticalFov
      let fovx = options.fovx;
      horizontalViewAngle = fovx || fovy * aspectRatio;
      verticalViewAngle = fovy || fovx / aspectRatio;
      let videoElement = document.getElementById('videoContainer_html5_api');
      let material = Cesium.Material.fromType('Image');
      material.uniforms.image = videoElement;
      let callback = (that) => {
        let vp = Cesium.Cartographic.fromCartesian(
          that.viewPosition,
          this.$earth.viewer.scene.globe.ellipsoid,
          new Cesium.Cartographic()
        );
        data.viewPosition_x = Cesium.Math.toDegrees(vp.longitude);
        data.viewPosition_y = Cesium.Math.toDegrees(vp.latitude);
        data.viewPosition_z = vp.height;

        if (that.viewPositionEnd) {
          let vpe = Cesium.Cartographic.fromCartesian(
            that.viewPositionEnd,
            this.$earth.viewer.scene.globe.ellipsoid,
            new Cesium.Cartographic()
          );
          data.viewPositionEnd_x = Cesium.Math.toDegrees(vpe.longitude);
          data.viewPositionEnd_y = Cesium.Math.toDegrees(vpe.latitude);
          data.viewPositionEnd_z = vpe.height;
        }
        data.viewDistance = that.viewDistance;
        data.heading = that.viewHeading;
        data.pitch = that.viewPitch;
        data.aspectRatio = that.horizontalViewAngle / that.verticalViewAngle;
        data.fovx = that.horizontalViewAngle;
        data.fovy = that.verticalViewAngle;
      };

      if (videoProjection) {
        videoProjection.clear();
      }
      //2、当两种参数都能生效时，根据最后一次点击的输入框来确定取哪一类参数。
      if (
        lastClick === 'cameraPose' &&
        data.viewDistance &&
        data.heading &&
        data.pitch &&
        data.aspectRatio &&
        data.fovx &&
        data.fovy
      ) {
        viewPositionEnd = undefined;
      }
      videoProjection = new VideoProjection(this.$earth.viewer, {
        viewPosition,
        viewPositionEnd,
        viewDistance: options.viewDistance,
        viewHeading: options.heading,
        viewPitch: options.pitch,
        horizontalViewAngle: horizontalViewAngle,
        verticalViewAngle: verticalViewAngle,
        material: material,
        showFrustumOutline: options.showFrustumOutline,
        showSketch: options.showSketch,
        callback
      });
    },
    setVideoShow(show) {
      this.formInfo.data.videoShow = show;
      // eslint-disable-next-line vue/no-mutating-props
      this.videoPlayerProps.show = show;
      if (!videoPlayer) return;
      if (show) videoPlayer.show();
      else videoPlayer.hide();
    },
    destroy() {
      if (videoPlayer) {
        videoPlayer.dispose();
        videoPlayer = undefined;
        this.formInfo.data.videoShow = false;
      }
      if (videoProjection) {
        videoProjection.clear();
        videoProjection = null;
      }
    }
  }
};
</script>
