/* eslint-disable no-prototype-builtins */
/*
 * @Author: liujh
 * @Date: 2020/8/21 17:11
 * @Description:
 */
/* 35 */
/***/
import * as Cesium from 'cesium_shinegis_earth';
import Jquery from 'jquery';
/* import { Draw } from './Draw/DrawAll21'; */
import { LayerManager } from './LayerManager';
import { KeyboardRoam } from './Tool/KeyboardRoam80';
// import { Popup } from './Widget/Identify3d/Popup81';
import { Tooltip } from './Tool/ToolTip1';
import { Location } from './Tool/Location83';
import { MouseZoomStyle } from './Tool/MouseZoomStyle84';
import * as Util from './Tool/Util1';
import * as Point from './Tool/Point2';
import * as PointConvert from './Tool/PointConvert25';
//import { Layer } from './Layer26';
//import CesiumNavigation from './ThirdParty/navigation'
//下面引用私包模式     "sge-navigation": "^1.1.7"
import CesiumNavigation from 'sge-navigation';
import OLCesium from './ThirdParty/shinegis-olcesium/OLCesium';
import { lonlats2cartesians } from './Tool/Util3';

class ViewerEx {
  constructor(viewer, config) {
    //一些默认值的修改【by 木遥】
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
      89.5,
      20.4,
      110.4,
      61.2
    ); //更改默认视域
    //Viewer扩展
    //_classCallCheck(this, ViewerEx)

    this.viewer = viewer;
    this.config = Cesium.defaultValue(config, {});
    //Cesium.BingMapsApi.defaultKey = config.defaultKey.www_bing //，默认 key

    this.viewer.shine = this; //要记录下，内部用

    /*        this._isFlyAnimation = false
                this.crs = Cesium.defaultValue(this.config.crs, '3857') //坐标系*/

    this._isFlyAnimation = false;
    this.crs = Cesium.defaultValue(this.config.crs, '3857'); //坐标系
    //存放业务图层
    //this.arrOperationallayers = [];
    //存放底图图层
    //this.arrBasemaps = [];
    //初始化用
    //this.baseLayers = [];
    //---------------------------------------------------------------------------------------------
    // Bi中为了和toc2d部分功能保持一致，后续分离
    //this.map = map
    //this.mapid = map.mapid
    // 矢量切片中取feature的一个唯一属性作为标识符
    this.idProp = undefined;
    // 可视化图层
    //this.visualizationLayer = undefined;
    // 切片图层(只能存在一个坐标系下的切片图层)
    this.tildLayer = [];
    // 选中图层，layerController.vue使用
    //this.checkedLayers = [];
    //所有图层配置数据
    //this.tocData = [];
    //当前编辑层
    this.editLayer = undefined;
    this._drawControl = null;
    //图层渲染上下文
    this.layerContexts = [];
    //--------------------------------------------------------------------------------------
    //优化viewer默认参数相关的
    this._optimization();
    //根据参数进行设置相关的
    this._initForOpts();
    //绑定添加相关控件
    this._addControls();

    if (this.config.is2d === 1) {
      this.ol3d = new OLCesium({
        map: this.config.map2d,
        scene_c: this.viewer.scene,
        isBaseMap: true
      });
    }
    //处理图层
    // this._initLayers();
    this.layerManager = new LayerManager(this);
    this.centerAt(this.config.center, {
      duration: 0
    });
  }

  //========== 方法 ==========

  //优化viewer默认参数相关的
  _optimization() {
    //let that = this;
    //let viewer = this.viewer;

    //二三维切换不用动画
    if (this.viewer.sceneModePicker)
      this.viewer.sceneModePicker.viewModel.duration = 0.0;
    if (this.viewer.clockViewModel)
      this.viewer.myClock = this.viewer.clockViewModel.clock;
    //解决Cesium显示画面模糊的问题 https://zhuanlan.zhihu.com/p/41794242 【1.63已修复】
    if (Cesium.VERSION < 1.63) {
      this.viewer._cesiumWidget._supportsImageRenderingPixelated =
        Cesium.FeatureDetection.supportsImageRenderingPixelated();
      this.viewer._cesiumWidget._forceResize = true;
      if (Cesium.FeatureDetection.supportsImageRenderingPixelated()) {
        let _dpr = window.devicePixelRatio;
        // 适度降低分辨率
        while (_dpr >= 2.0) {
          _dpr /= 2.0;
        }
        this.viewer.resolutionScale = _dpr;
      }
    }

    //解决限定相机进入地下 https://github.com/AnalyticalGraphicsInc/cesium/issues/5837
    /*        this.viewer.camera.changed.addEventListener(function () {
                    if (viewer.camera._suspendTerrainAdjustment && viewer.scene.mode === Cesium.SceneMode.SCENE3D) {
                        viewer.camera._suspendTerrainAdjustment = false
                        viewer.camera._adjustHeightForTerrain()
                    }

                    if (viewer.scene.camera.positionCartographic.height < -100) {
                        // console.log(viewer.scene.camera.positionCartographic.height)
                        let position = Point.setPositionsHeight(viewer.camera.positionWC, 0)
                        viewer.scene.camera.setView({
                            destination: position,
                            orientation: {
                                heading: viewer.camera.heading,
                                pitch: viewer.camera.pitch
                            }
                        })
                    }
                })*/
  }

  _initForOpts() {
    let that = this;
    this.viewer.cesiumWidget.creditContainer.style.display = 'none'; //去cesium logo

    //默认定位地点相关设置，默认home键和初始化镜头视角
    if (this.viewer.homeButton) {
      this.viewer.homeButton.viewModel.command.beforeExecute.addEventListener(
        function (commandInfo) {
          that.centerAt();
          commandInfo.cancel = true;
        }
      );
    }

    //地球一些属性设置
    let scene = this.viewer.scene;
    scene.globe.baseColor = new Cesium.Color.fromCssColorString(
      this.config.baseColor || '#546a53'
    ); //地表背景色

    if (this.config.backgroundColor)
      scene.backgroundColor = new Cesium.Color.fromCssColorString(
        this.config.backgroundColor
      ); //空间背景色

    if (this.config.style) {
      //帧率
      scene.debugShowFramesPerSecond =
        this.config.style.debugShowFramesPerSecond;
      //屏幕缩放自适应
      let resolutionScale = this.config.style.resolutionScale
        ? window.devicePixelRatio
        : 1;
      this.viewer.resolutionScale = resolutionScale;

      //深度监测
      scene.globe.depthTestAgainstTerrain = this.config.style.testTerrain;

      //光照渲染（阳光照射区域高亮）
      scene.globe.enableLighting = this.config.style.lighting;

      //大气渲染
      scene.skyAtmosphere.show = this.config.style.atmosphere;
      scene.globe.showGroundAtmosphere = this.config.style.atmosphere;

      //雾化效果
      scene.fog.enabled = this.config.style.fog;

      //设置无地球模式 （单模型是可以设置为false）
      scene.globe.show = Cesium.defaultValue(this.config.style.globe, true);
      scene.moon.show = Cesium.defaultValue(
        this.config.style.moon,
        scene.globe.show
      );
      scene.sun.show = Cesium.defaultValue(
        this.config.style.sun,
        scene.globe.show
      );
      scene.skyBox.show = Cesium.defaultValue(
        this.config.style.skyBox,
        scene.globe.show
      );
    }

    //限制缩放级别
    scene.screenSpaceCameraController.maximumZoomDistance = Cesium.defaultValue(
      this.config.maxzoom,
      20000000
    ); //变焦时相机位置的最大值（以米为单位）
    scene.screenSpaceCameraController.minimumZoomDistance = Cesium.defaultValue(
      this.config.minzoom,
      1
    ); //变焦时相机位置的最小量级（以米为单位）。默认为1.0。
    scene.screenSpaceCameraController.enableCollisionDetection = true; //默认禁止进入地下

    scene.screenSpaceCameraController._zoomFactor = 2; //鼠标滚轮放大的步长参数
    scene.screenSpaceCameraController.minimumCollisionTerrainHeight = 15000000; //低于此高度时绕鼠标键绕圈，大于时绕视图中心点绕圈。
  }

  //绑定添加相关控件

  _addControls() {
    //let that = this;

    //绑定popup
    // this._popup = new Popup(this.viewer, {
    //   popupEventType: this.config.popupEventType
    //   // onLeftClick: function (event) {
    //   // }
    // });
    //绑定tooltip
    this._tooltip = new Tooltip(this.viewer, {
      onMouseMove: function onMouseMove() {
        //纪舒敏 注释鼠标移动更新坐标
        // if (that._location) {
        //     that._location.updateData(event)
        // }
      }
    });
    //绑定键盘漫游
    this._keyboardRoam = new KeyboardRoam(this.viewer);

    //导航工具栏控件
    // if (this.config.navigation) {
    //   this._addNavigationWidget(this.config.navigation);
    // }

    //鼠标提示控件
    if (this.config.location) {
      this.config.location.bindEvent = false;
      this._location = new Location(this.viewer, this.config.location);
    }

    if (!Util.isPCBroswer()) {
      this.viewer.targetFrameRate = 20; //限制帧率
      this.viewer.requestRenderMode = true; //取消实时渲染
      this.viewer.scene.fog.enable = false;
      this.viewer.scene.skyAtmosphere.show = false;
      this.viewer.scene.fxaa = false;
    }
    //鼠标滚轮缩放美化样式
    if (this.config.mouseZoom && Util.isPCBroswer()) {
      this._mouseZoomStyle = new MouseZoomStyle(
        this.viewer,
        this.config.mouseZoom
      );
    }
  }

  //处理图层

  addLayer(data) {
    this.layerManager.addLayer(data);
  }
  /**
   * 根据过滤条件对图层进行过滤
   * @param {*} id 图层id
   * @param {*} where 过滤条件
   */

  filterLayer(id, where) {
    this.layerManager.filterLayer(id, where);
  }

  getConfig() {
    return Util.clone(this.config, 5);
  }

  //point的方法兼容到viewer.mars直接用
  getCenter(isToWgs) {
    return Point.getCenter(this.viewer, isToWgs);
  }

  getExtent(isToWgs) {
    return Point.getExtent(this.viewer, isToWgs);
  }

  getCameraView(isToWgs) {
    return Point.getCameraView(this.viewer, isToWgs);
  }

  getHeight(position, relativeHeight) {
    return Point.updateHeightForClampToGround(
      this.viewer,
      position,
      relativeHeight
    );
  }

  //键盘漫游，兼容历史方法

  keyboard(isbind, speedRatio) {
    if (isbind) this._keyboardRoam.bind(speedRatio);
    else this._keyboardRoam.unbind();
  }

  keyboardAuto() {
    return (this._keyboardRoam.enable = !this._keyboardRoam.enable);
  }

  //获取指定图层 keyname默认为名称

  getLayer(key, keyname) {
    return this.layerManager.getLayer(key, keyname);
  }

  //瓦片层级
  getLevel(height) {
    if (height > 48000000) {
      return 0;
    } else if (height > 24000000) {
      return 1;
    } else if (height > 12000000) {
      return 2;
    } else if (height > 6000000) {
      return 3;
    } else if (height > 3000000) {
      return 4;
    } else if (height > 1500000) {
      return 5;
    } else if (height > 750000) {
      return 6;
    } else if (height > 375000) {
      return 7;
    } else if (height > 187500) {
      return 8;
    } else if (height > 93750) {
      return 9;
    } else if (height > 46875) {
      return 10;
    } else if (height > 23437.5) {
      return 11;
    } else if (height > 11718.75) {
      return 12;
    } else if (height > 5859.38) {
      return 13;
    } else if (height > 2929.69) {
      return 14;
    } else if (height > 1464.84) {
      return 15;
    } else if (height > 732.42) {
      return 16;
    } else if (height > 366.21) {
      return 17;
    } else {
      return 18;
    }
  }

  levelToHeight(level) {
    return 48000000 / Math.pow(2, level - 1);
  }

  removeLayer(data) {
    this.layerManager.removeLayer(data);
  }

  //根据config配置的id或name属性，更新显示指定的地图底图
  /*  changeBasemap(idorname) {
    let layersCfg = this.arrBasemaps;
    if (layersCfg.length === 0) {
      console.warn(
        'baseLayerPicker为true时，无法changeBasemap外部切换底图，请关闭baseLayerPicker。'
      );
      return;
    }

    for (let i = 0; i < layersCfg.length; i++) {
      let item = layersCfg[i];
      if (item.config.type === 'group' && item.config._layers == null) continue;

      if (idorname === item.config.name || idorname === item.config.id)
        item.setVisible(true);
      else item.setVisible(false);
    }
  }*/

  //是否有地形数据
  hasTerrain() {
    if (this.terrainProvider == null) return false;
    return Util.hasTerrain(this.viewer);
  }

  //更新地形，参数传入是否显示地形
  updateTerrainProvider(isStkTerrain) {
    if (isStkTerrain) {
      if (this.terrainProvider == null) {
        let cfg = this.config.terrain;
        if (cfg.url) {
          if (this.config.serverURL) {
            cfg.url = cfg.url.replace('$serverURL$', this.config.serverURL);
          }
          cfg.url = cfg.url
            .replace('$hostname$', location.hostname)
            .replace('$host$', location.host);
        }
        this.terrainProvider = Util.getTerrainProvider(cfg);
      }
      this.viewer.terrainProvider = this.terrainProvider;
    } else {
      this.viewer.terrainProvider = Util.getEllipsoidTerrain();
    }
  }

  //获取当前地图坐标系，值为gcj时表示是国测局偏移坐标
  getCrs() {
    return this.crs;
  }

  //在不同坐标系情况下，转换“目标坐标值”至“地图坐标系”一致的坐标
  point2map(point) {
    if (this.crs === 'gcj') {
      let point_clone = Util.clone(point);

      let newpoint = PointConvert.wgs2gcj([point_clone.x, point_clone.y]);
      point_clone.x = newpoint[0];
      point_clone.y = newpoint[1];
      return point_clone;
    } else if (this.crs === 'baidu') {
      let point_clone = Util.clone(point);

      let newpoint = PointConvert.wgs2bd([point_clone.x, point_clone.y]);
      point_clone.x = newpoint[0];
      point_clone.y = newpoint[1];
      return point_clone;
    } else {
      return point;
    }
  }

  //在不同坐标系情况下 ，获取地图上的坐标后，转为wgs标准坐标系坐标值
  point2wgs(point) {
    if (this.crs === 'gcj') {
      let point_clone = Util.clone(point);
      let newpoint = PointConvert.gcj2wgs([point_clone.x, point_clone.y]);
      point_clone.x = newpoint[0];
      point_clone.y = newpoint[1];
      return point_clone;
    } else if (this.crs === 'baidu') {
      let point_clone = Util.clone(point);
      let newpoint = PointConvert.bd2gcj([point_clone.x, point_clone.y]);
      point_clone.x = newpoint[0];
      point_clone.y = newpoint[1];
      return point_clone;
    } else {
      return point;
    }
  }

  //定位到 多个区域  顺序播放
  centerAtArr(arr, enfun) {
    this.cancelCenterAt();

    this.arrCenterTemp = arr;
    this._isCenterAtArr = true;
    this._centerAtArrItem(0, enfun);
  }

  _centerAtArrItem(i, enfun) {
    let that = this;
    if (!this._isCenterAtArr || i < 0 || i >= this.arrCenterTemp.length) {
      this._isCenterAtArr = false;
      //console.log('centerAtArr视角切换全部结束')
      if (enfun) enfun();
      return;
    }
    let centeropt = this.arrCenterTemp[i];

    //console.log('centerAtArr开始视角切换，第' + i + '点')
    if (centeropt.onStart) centeropt.onStart();

    this.centerAt(centeropt, {
      duration: centeropt.duration,
      complete: function complete() {
        if (centeropt.onEnd) centeropt.onEnd();

        let stopTime = Cesium.defaultValue(centeropt.stop, 1);
        //console.log('centerAtArr第' + i + '点切换结束，将在此停留' + stopTime + '秒')

        setTimeout(function () {
          that._centerAtArrItem(++i, enfun);
        }, stopTime * 1000);
      },
      cancle: function cancle() {
        this._isCenterAtArr = false;
        if (enfun) enfun();
      }
    });
  }

  cancelCenterAt() {
    this._isCenterAtArr = false;

    this.viewer.camera.cancelFlight(); //取消飞行

    // this.viewer.camera.flyTo({
    //     destination: this.viewer.camera.position,
    //     orientation: {
    //         heading: this.viewer.camera.heading,
    //         pitch: this.viewer.camera.pitch,
    //         roll: this.viewer.camera.roll,
    //     },
    //     duration: 0,
    // })
  }

  //地球定位至指定区域 ，options支持viewer.camera.flyTo所有参数
  centerAt(centeropt, options) {
    if (options == null) options = {};
    else if (Util.isNumber(options))
      options = {
        duration: options
      }; //兼容旧版本

    if (centeropt == null) {
      //让镜头飞行（动画）到配置默认区域
      options.isWgs84 = true;
      centeropt = this.config.extent ||
        this.config.center || {
          y: 17.196575,
          x: 114.184276,
          z: 9377198,
          heading: 0,
          pitch: -80,
          roll: 0
        };
    }

    let optsClone = {};
    for (let key in options) {
      optsClone[key] = options[key];
    }

    if (centeropt.xmin && centeropt.xmax && centeropt.ymin && centeropt.ymax) {
      //使用extent配置，相机可视范围
      let xmin = centeropt.xmin;
      let xmax = centeropt.xmax;
      let ymin = centeropt.ymin;
      let ymax = centeropt.ymax;

      if (optsClone.isWgs84) {
        //坐标转换为wgs
        let pt1 = this.point2map({
          x: xmin,
          y: ymin
        });
        xmin = pt1.x;
        ymin = pt1.y;

        let pt2 = this.point2map({
          x: xmax,
          y: ymax
        });
        xmax = pt2.x;
        ymax = pt2.y;
      }

      //绑定范围
      optsClone.rectangle = Cesium.Rectangle.fromDegrees(
        xmin,
        ymin,
        xmax,
        ymax
      );
      // this.viewer.camera.flyTo(optsClone);
      this.viewer.camera.flyTo({
        ...optsClone,
        destination: optsClone.rectangle
      });
    } else {
      //存在hpr，为相机定位的方式
      if (optsClone.isWgs84) centeropt = this.point2map(centeropt);

      let height = Cesium.defaultValue(optsClone.minz, 2500);
      if (this.viewer.camera.positionCartographic.height < height)
        height = this.viewer.camera.positionCartographic.height;
      if (centeropt.z != null && centeropt.z !== 0) height = centeropt.z;

      optsClone.destination = Cesium.Cartesian3.fromDegrees(
        centeropt.x,
        centeropt.y,
        height
      ); //经度、纬度、高度
      optsClone.orientation = {
        heading: Cesium.Math.toRadians(
          Cesium.defaultValue(centeropt.heading, 0)
        ), //绕垂直于地心的轴旋转
        pitch: Cesium.Math.toRadians(Cesium.defaultValue(centeropt.pitch, -90)), //绕纬度线旋转
        roll: Cesium.Math.toRadians(Cesium.defaultValue(centeropt.roll, 0)) //绕经度线旋转
      };
      if (optsClone.isFly) {
        // console.log('optsClone', optsClone)
        let that = this;
        that._isFlyAnimation = true;
        this.viewer.camera.flyTo({
          ...optsClone,
          complete: function complete() {
            // console.log('飞行完成')
            that._isFlyAnimation = false;
            that._location?.updaeCamera(); // 底部控件更新
          }
        });
      } else {
        //this.viewer.camera.setView(optsClone)
        this.viewer.camera.flyTo(optsClone);
      }
    }
  }

  // 获取最小矩形范围， positions数组  笛卡尔 || 经纬度
  getGraphicExtent(positions) {
    let _positions = positions[0].x ? positions : lonlats2cartesians(positions);
    let rectangle = Cesium.Rectangle.fromCartesianArray(_positions);
    let extent = {
      xmin: Cesium.Math.toDegrees(rectangle.west),
      ymin: Cesium.Math.toDegrees(rectangle.south),
      xmax: Cesium.Math.toDegrees(rectangle.east),
      ymax: Cesium.Math.toDegrees(rectangle.north)
    };
    return extent;
  }

  //定位至目标点， options支持viewer.camera.flyToBoundingSphere所有参数
  centerPoint(centeropt, options) {
    if (options == null) options = {};

    let optsClone = {};
    for (let key in options) {
      optsClone[key] = options[key];
    }

    //目标点位置
    if (optsClone.isWgs84) centeropt = this.point2map(centeropt);

    let position;
    if (centeropt instanceof Cesium.Cartesian3) position = centeropt;
    else
      position = Cesium.Cartesian3.fromDegrees(
        centeropt.x,
        centeropt.y,
        Cesium.defaultValue(centeropt.z, 0)
      ); //经度、纬度、高度
    let radius = Cesium.defaultValue(options.radius, 5000);

    optsClone.offset = {
      heading: Cesium.Math.toRadians(Cesium.defaultValue(options.heading, 0)), //绕垂直于地心的轴旋转
      pitch: Cesium.Math.toRadians(Cesium.defaultValue(options.pitch, -60)), //绕纬度线旋
      range: Cesium.defaultValue(options.range, 0)
    };
    this.viewer.camera.flyToBoundingSphere(
      new Cesium.BoundingSphere(position, radius),
      optsClone
    );
  }

  //是否在调用了openFlyAnimation正在进行飞行动画
  isFlyAnimation() {
    return this._isFlyAnimation;
  }

  //开场动画，动画播放地球飞行定位指指定区域（默认为config.josn中配置的视域）
  openFlyAnimation(endfun, centeropt) {
    let that = this;
    let viewer = this.viewer;
    let view = centeropt || Point.getCameraView(viewer); //默认为原始视角

    this._isFlyAnimation = true;
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(-85.16, 13.71, 23000000.0)
    });
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(view.x, view.y, 23000000.0),
      duration: 2,
      easingFunction: Cesium.EasingFunction.LINEAR_NONE,
      complete: function complete() {
        let z = Cesium.defaultValue(view.z, 90000);
        if (z < 200000 && view.pitch !== -90) {
          z = z * 1.2 + 8000;
          viewer.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(view.x, view.y, z),
            complete: function complete() {
              that.centerAt(view, {
                duration: 2,
                complete: function complete() {
                  that._isFlyAnimation = false;
                  if (endfun) endfun();
                }
              });
            }
          });
        } else {
          that.centerAt(view, {
            complete: function complete() {
              that._isFlyAnimation = false;
              if (endfun) endfun();
            }
          });
        }
      }
    });
  }

  //旋转地球
  rotateAnimation(endfun, duration) {
    let viewer = this.viewer;

    let first = Point.getCameraView(viewer); //默认为原始视角
    let duration3 = duration / 3;

    //动画 1/3
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        first.x + 120,
        first.y,
        first.z
      ),
      orientation: {
        heading: Cesium.Math.toRadians(first.heading),
        pitch: Cesium.Math.toRadians(first.pitch),
        roll: Cesium.Math.toRadians(first.roll)
      },
      duration: duration3,
      easingFunction: Cesium.EasingFunction.LINEAR_NONE,
      complete: function complete() {
        //动画 2/3
        viewer.camera.flyTo({
          destination: Cesium.Cartesian3.fromDegrees(
            first.x + 240,
            first.y,
            first.z
          ),
          orientation: {
            heading: Cesium.Math.toRadians(first.heading),
            pitch: Cesium.Math.toRadians(first.pitch),
            roll: Cesium.Math.toRadians(first.roll)
          },
          duration: duration3,
          easingFunction: Cesium.EasingFunction.LINEAR_NONE,
          complete: function complete() {
            //动画 3/3
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(
                first.x,
                first.y,
                first.z
              ),
              orientation: {
                heading: Cesium.Math.toRadians(first.heading),
                pitch: Cesium.Math.toRadians(first.pitch),
                roll: Cesium.Math.toRadians(first.roll)
              },
              duration: duration3,
              easingFunction: Cesium.EasingFunction.LINEAR_NONE,
              complete: function complete() {
                if (endfun) endfun();
              }
            });
            //动画3/3 end
          }
        });
        //动画2/3 end
      }
    });
    //动画1/3 end
  }

  //添加“导航”控件
  _addNavigationWidget(item) {
    /*  let options = {}
         // 用于在使用重置导航重置地图视图时设置默认视图控制。接受的值是Cesium.Cartographic 和 Cesium.Rectangle.
         options.defaultResetView = Rectangle.fromDegrees(80, 22, 130, 50)
         // 用于启用或禁用罗盘。true是启用罗盘，false是禁用罗盘。默认值为true。如果将选项设置为false，则罗盘将不会添加到地图中。
         options.enableCompass = true
         // 用于启用或禁用缩放控件。true是启用，false是禁用。默认值为true。如果将选项设置为false，则缩放控件将不会添加到地图中。
         options.enableZoomControls = true
         // 用于启用或禁用距离图例。true是启用，false是禁用。默认值为true。如果将选项设置为false，距离图例将不会添加到地图中。
         options.enableDistanceLegend = true
         // 用于启用或禁用指南针外环。true是启用，false是禁用。默认值为true。如果将选项设置为false，则该环将可见但无效。
         options.enableCompassOuterRing = true */

    this.viewer.extend(CesiumNavigation, {
      defaultResetView: Cesium.Rectangle.fromDegrees(110, 20, 120, 30),
      enableZoomControls: true //仅作为示例，默认是开启的
    });

    /* navugation css 预制配置样式
        "navigation": {
            "legend": {
              "bottom": "0px",
              "left": "40px",
              "border": "0px",
              "background": "rgba(1, 0, 0, 0)"
            },
            "compass": {
              "right": "12px",
              "top": "0px"
            },
            "zoom": {
              "left": "5px",
              "bottom": "30px",
              "top": "auto"
          }
          } */

    //比例尺
    if (item.legend) Jquery('.distance-legend').css(item.legend);
    else Jquery('.distance-legend').remove();

    //导航球
    if (item.compass) Jquery('.compass').css(item.compass);
    else Jquery('.compass').remove();

    //ZOOM 放大缩小
    if (item.zoom) Jquery('.navigation-controls').css(item.zoom);
    else Jquery('.navigation-controls').remove();
  }

  //销毁资源
  destroy() {
    this._tooltip.destroy();
    // this._popup.destroy();

    if (this._keyboardRoam) {
      this._keyboardRoam.destroy();
      this._keyboardRoam = null;
    }

    if (this._location) {
      this._location.destroy();
      this._location = null;
    }
    if (this._mouseZoomStyle) {
      this._mouseZoomStyle.destroy();
      this._mouseZoomStyle = null;
    }
  }

  // Getter
  // get popup() {
  //   return this._popup;
  // }

  // Getter
  get tooltip() {
    return this._tooltip;
  }

  // Getter
  get draw() {
    /* if (this._drawControl == null) {
      this._drawControl = new Draw(this.viewer, {
        hasEdit: false
      });
    } */
    return this._drawControl;
  }
  setDraw(val) {
    this._drawControl = val;
  }

  //------------------------------------------------------------------
  //Bi中为了和toc2d部分功能保持一致，后续分离

  /**
   * 图层配置信息
   * @param {图层配置信息数据} tocConfigData
   */

  setTocData(tocConfigData) {
    this.layerManager.setTocData(tocConfigData);
  }

  getLayerDataById(id) {
    return this.layerManager.getLayerDataById(id);
  }

  /*  getLayerById(id) {
    return this.layerManager.getLayerById(id);
  }*/

  queryTocData(tree, filed, value) {
    this.layerManager.queryTocData(tree, filed, value);
  }

  addCheckedLayers(data) {
    this.layerManager.addCheckedLayers(data);
  }

  getCheckedLayers() {
    return this.layerManager.getCheckedLayers();
  }

  removeCheckedLayers(data) {
    this.layerManager.removeCheckedLayers(data);
  }

  //获取图层透明度 结果0-100
  getLayerOpacity(/* id */) {
    return;
    /*   let layer = this.getLayer(id, 'id');
    if (layer) {
      return layer.getOpacity() * 100;
    } else {
      return 100;
    } */
  }

  //设置图层透明度 参数0-100

  setLayerOpacity(id, opacity) {
    this.layerManager.setLayerOpacity(id, opacity);
  }

  zoomToLayer(opts) {
    this.layerManager.zoomToLayer(opts);
  }

  // 设置图层置顶
  setLayerTop(id) {
    this.layerManager.setLayerTop(id);
  }

  //-----------------------------------------------------------------------
  groundUnder(opt) {
    if (opt.isUnderGround === false) {
      this.viewer.scene.screenSpaceCameraController.enableCollisionDetection = false;
    } else {
      this.viewer.scene.screenSpaceCameraController.enableCollisionDetection = true;
    }
  }

  groundTranslucency(opt) {
    let alpha;
    if (opt.isTranslucency === true) {
      this.viewer.scene.globe.translucency.enabled = true;
    } else if (opt.isTranslucency === false) {
      this.viewer.scene.globe.translucency.enabled = false;
    }
    this.viewer.scene.globe.translucency.frontFaceAlphaByDistance =
      new Cesium.NearFarScalar(400.0, 0.0, 1800.0, 1.0);
    if (opt.alpha) {
      alpha = opt.alpha;
    } else {
      alpha = 0.5;
    }
    this.viewer.scene.globe.translucency.frontFaceAlphaByDistance.nearValue =
      alpha;
    this.viewer.scene.globe.translucency.frontFaceAlphaByDistance.farValue =
      opt.fadeByDistance ? 1 : alpha;
  }

  useTranslucencyRectangle(rings) {
    let globe = this.viewer.scene.globe;
    globe.translucency.enabled = true;
    globe.undergroundColor = undefined;
    globe.translucency.frontFaceAlpha = 0.25;
    if (rings) {
      globe.translucency.rectangle = Cesium.Rectangle.fromDegrees(rings);
    } else {
      globe.translucency.rectangle = Cesium.Rectangle.fromDegrees(
        120.0,
        30.0,
        120.5,
        30.5
      );
    }
  }

  useTranslucencyMask() {
    let globe = this.viewer.scene.globe;
    var baseLayer = this.viewer.scene.imageryLayers.get(0);
    globe.showGroundAtmosphere = false;
    globe.baseColor = Cesium.Color.TRANSPARENT;
    globe.translucency.enabled = true;
    globe.undergroundColor = undefined;

    // Set oceans on Bing base layer to transparent
    baseLayer.colorToAlpha = new Cesium.Color(0.0, 0.016, 0.059);
    baseLayer.colorToAlphaThreshold = 0.2;
  }
  //-----------------------------------------------------------------------
  add3DMask(geoJson, style) {
    let holes = [];
    let mPolygons = geoJson.coordinates;
    for (let i = 0; i < mPolygons.length; i++) {
      let hole = [];

      let tPolygon1 = mPolygons[i];
      for (let j = 0; j < tPolygon1.length; j++) {
        let tPolygon2 = tPolygon1[j];
        for (let k = 0; k < tPolygon2.length; k++) {
          hole.push(tPolygon2[k][0], tPolygon2[k][1]);
        }
        let myhole = {
          positions: Cesium.Cartesian3.fromDegreesArray(hole)
        };
        holes.push(myhole);
      }
    }

    let maskStyle = style
      ? new Cesium.Color(
          style.r,
          style.g,
          style.b,
          style.alpha ? style.alpha : 1
        )
      : Cesium.Color.WHITE.withAlpha(0.5);
    this.viewer.entities.add({
      id: 'my3dMask',
      name: '3dMask',
      polygon: {
        hierarchy: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            50, 0, 160, 0, 160, 70, 50, 70
          ]),
          holes: holes
        },
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        material: maskStyle,
        //height: 0,
        outline: true // height is required for outline to display
      }
    });
  }
  remove3DMask() {
    let tempMask = this.viewer.entities.getById('my3dMask');
    if (tempMask) {
      this.viewer.entities.removeById('my3dMask');
    }
  }
}

export { ViewerEx };
