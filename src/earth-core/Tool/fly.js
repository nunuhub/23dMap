/* eslint-disable no-prototype-builtins */
import * as turf from '@turf/turf';
import { Cesium } from '../Entry57';
import { getAngle, isNumber, formatLength } from './Util1';
import { formatPosition, terrainPolyline } from './Point2';
import * as WallAttr from '../Draw/EntityAttr/WallAttr50';
import $ from 'jquery';

class RoamFly {
  constructor(prop) {
    this.prop = prop || {};

    this.firstHpr = null;
    this.timesAtPoint = [];
    this.isPause = false;
    this.isBackWard = '';
    this.flyEntity = null;
    this.isActivate = true;
    this.orientationScratch = new Cesium.Quaternion();
    this.scratch = new Cesium.Matrix4();
    this.positionScratch = new Cesium.Cartesian3();

    this.recoverTime = undefined;
    this.init();
  }

  init() {
    const { route, viewer } = this.prop;

    this.hpr = route.properties.hpr;
    let firstP = route.geometry.coordinates[0]; // 传入的预设路线
    let hFirstP = firstP.slice(0);
    hFirstP[2] += route.properties.attr.followedZ;
    let secondP = route.geometry.coordinates[1];
    let height = route.properties.attr.followedZ;
    this.firstHpr = this.setOrientation(
      Cesium.Cartesian3.fromDegrees(...hFirstP),
      Cesium.Cartesian3.fromDegrees(...secondP)
    );
    this.firstHpr.pitch = -Math.atan2(height, height * 2);
    // console.log('俯仰角', this.firstHpr.pitch)
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(...hFirstP),
      orientation: this.firstHpr
    });
  }

  /**
   * 设置路线
   * @param route
   */
  setRoute(route) {
    this.prop.route = route;
  }

  /**
   * 开始飞行
   * @param route
   */
  start(route) {
    route && this.setRoute(route);
    this.stop();
    this._startFly();
    // this.isPause = false
  }

  /**
   * 停止飞行
   */
  stop() {
    const { viewer } = this.prop;

    viewer.trackedEntity = undefined;
    viewer.scene.preRender.removeEventListener(
      this.preRender_eventHandler,
      this
    );

    if (this.flyEntity) {
      viewer.entities.remove(this.flyEntity);
      this.flyEntity = null;
    }
    if (this.wallEntity) {
      viewer.entities.remove(this.wallEntity);
      this.wallEntity = null;
    }
    this.isBackWard = '';
    this.isStart = false;
  }

  forward() {
    // this.currentView = this.flyEntity.position.getValue(this.timesAtPoint[++this.idxOfTimes]);
    this.isBackWard = false;
  }

  backward() {
    // this.currentView = this.flyEntity.position.getValue(this.timesAtPoint[--this.idxOfTimes]);
    this.isBackWard = true;
  }

  // 界面更新参数
  getAttr() {
    const { route } = this.prop;
    return route.properties.attr;
  }

  updateAttr(params) {
    // console.log('2222222222222', this.flyEntity)
    for (let i in params) {
      if (params.hasOwnProperty(i) && this.flyEntity) {
        this.flyEntity.data.properties.attr[i] = params[i];
      }
    }
  }

  /**
   * 显示当前时间
   * @param position
   */
  realTime(position) {
    // const { viewer } = this.prop;
    const attr = this.flyEntity.data.properties.attr;

    const point = formatPosition(position);

    /* const time =
      (viewer.clock.currentTime.dayNumber - viewer.clock.startTime.dayNumber) *
        24 *
        60 *
        60 +
      viewer.clock.currentTime.secondsOfDay -
      viewer.clock.startTime.secondsOfDay; // 已飞行时间 */

    const flyOk = this.getFlyOkPoints(position);
    // this.updateCharsWidgeFlyOk(flyOk.len)// 更新剖面图
    if (attr.showShadow) {
      // 投影
      this.updateWall(flyOk.positions);
    }
    // console.log('==========position',position)
    /* const timeInfo = {
      time: time,
      len: flyOk.len,
      x: point.x,
      y: point.y,
      z: point.z
    };
    console.log(timeInfo); */

    // 求地面海拔
    var that = this;
    terrainPolyline({
      viewer: that.viewer,
      positions: [position, position],
      calback: function (raisedPositions, noHeight) {
        if (!that.isActivate) return;
        if (
          raisedPositions == null ||
          raisedPositions.length === 0 ||
          noHeight
        ) {
          that.viewWindow.showHeightInfo(null);
          return;
        }

        var hbgd = formatPosition(raisedPositions[0]).z; // 地面高程
        var fxgd = point.z; // 飞行高度
        var ldgd = fxgd - hbgd; // 离地高度

        // var hbgd_str = formatLength(hbgd);
        var fxgd_str = formatLength(fxgd);
        var ldgd_str = formatLength(ldgd);

        var result = '漫游高程：' + fxgd_str;

        // var hasWarn = false;
        if (attr.showHeightWarn && attr.warnHeight) {
          result += '\n离地距离：' + ldgd_str;
          if (ldgd <= attr.warnHeight) {
            // hasWarn = true;
            result += '【低于报警高度】';
          }
        } else {
          result += '\n地面高程：' + hbgd;
        }

        if (that.flyEntity.label) {
          that.flyEntity.label.text = that.flyEntity.data.name + '\n' + result;
        }

        // 界面显示
        /* const res = {
          hbgd_str: hbgd_str,
          ldgd_str: ldgd_str,
          showHeightWarn: attr.showHeightWarn,
          hasWarn: hasWarn
        };
        console.log('------------地面海拔:');
        console.log(res); */
      }
    });
  }

  /**
   * 显示海拔图表
   */
  showHeightChars() {
    if (this.charsCacheData) {
      this.updateCharsWidge(this.charsCacheData);
    } else {
      var that = this;
      this.getTerrainHeight(function (data) {
        that.charsCacheData = data;
        that.updateCharsWidge(data);
      });
    }
  }

  /**
   * 更新图表组件
   * @param data
   */
  updateCharsWidge(/* data */) {
    // console.log(data);
  }

  /**
   * 更新图
   * @param alllen
   */
  updateCharsWidgeFlyOk(alllen) {
    // todo
    // eslint-disable-next-line no-undef
    var roamingJK = mars3d.widget.getClass(this.charsWidgetUri);
    if (roamingJK && roamingJK.isActivate) {
      roamingJK.changeFlyOk(alllen);
    }
  }

  /**
   *获取地形高度
   * @param calback
   */
  getTerrainHeight(calback) {
    const { viewer } = this.prop;
    const positions = this.arrLinePoint;
    const attr = this.flyEntity.data.properties.attr;

    let alllen = 0,
      arrLength = [],
      arrHbgd = [],
      arrFxgd = [],
      arrPoint = [],
      arrBjgd;
    if (attr.showHeightWarn && attr.warnHeight) {
      arrBjgd = [];
    }

    let index = 0;

    function getLineFD() {
      index++;

      const arr = [positions[index - 1], positions[index]];
      terrainPolyline({
        viewer: viewer,
        positions: arr,
        calback: (raisedPositions, noHeight) => {
          if (!this.isActivate) return;

          const h1 = positions[index - 1].lonlat[2];
          const h2 = positions[index].lonlat[2];
          const hstep = (h2 - h1) / raisedPositions.length;

          for (let i = 0; i < raisedPositions.length; i++) {
            // 已飞行长度
            if (i !== 0) {
              alllen += Cesium.Cartesian3.distance(
                raisedPositions[i],
                raisedPositions[i - 1]
              );
            }
            arrLength.push(Number(alllen.toFixed(1)));

            // 坐标
            const point = formatPosition(raisedPositions[i]);
            arrPoint.push(point);

            // 海拔高度
            const hbgd = noHeight ? 0 : point.z;
            arrHbgd.push(hbgd);

            // 飞行高度
            const fxgd = Number((h1 + hstep * i).toFixed(1));
            arrFxgd.push(fxgd);

            // 报警高度
            arrBjgd && arrBjgd.push(hbgd + attr.warnHeight);
          }

          if (index >= positions.length - 1) {
            calback({ arrLength, arrFxgd, arrHbgd, arrPoint, arrBjgd });
          } else {
            getLineFD();
          }
        }
      });
    }

    getLineFD();
  }

  _startFly() {
    const { route, viewer } = this.prop;
    // console.log(111111, this.prop);

    this.isStart = true;
    this.timesAtPoint.length = 0;

    let attr = route.properties.attr;

    //= ====================计算飞行时间及坐标====================
    let property = new Cesium.SampledPositionProperty();
    let startTime = Cesium.JulianDate.fromDate(new Date()); // 飞行开始时间
    let stopTime; // 飞行结束时间

    let lonlats = route.geometry.coordinates;
    if (lonlats.length < 2) {
      console.warn('路线无坐标数据，无法漫游！');
      return;
    }

    let speeds = route.properties.speed;
    let isSpeedArray = !isNumber(speeds);
    if (lonlats.length === 2) {
      // 需要插值，否则穿地
      let centerPt = this.getPointForLineAlong(lonlats[0], lonlats[1], 0, 0.5);
      lonlats.splice(1, 0, centerPt);
      if (speeds && isSpeedArray) {
        speeds.splice(1, 0, speeds[0]);
      }
    }
    let defSpeed = 500; // 无速度值时的 默认速度

    let alltimes = 0; // 总时长,秒
    // let alllen = 0; // 总长度,千米

    let lastPoint;
    let arrLinePoint = [];
    for (let i = 0, length = lonlats.length; i < length; i++) {
      let lonlat = lonlats[i];
      let item = Cesium.Cartesian3.fromDegrees(
        lonlat[0],
        lonlat[1],
        lonlat[2] || 0
      );
      item.lonlat = lonlat;

      if (i === 0) {
        // 起点
        let sTime = Cesium.JulianDate.addSeconds(
          startTime,
          alltimes,
          new Cesium.JulianDate()
        );
        item.time = sTime;
        this.timesAtPoint.push(sTime);
        property.addSample(sTime, item);
        lastPoint = item;
      } else if (i === lonlats.length - 1) {
        let speed = isSpeedArray
          ? speeds
            ? speeds[i - 1]
            : defSpeed
          : speeds || defSpeed;
        let len = Cesium.Cartesian3.distance(item, lastPoint) / 1000;
        let stepTime = (len / speed) * 3600;
        alltimes += stepTime;
        // alllen += len;

        let sTime = Cesium.JulianDate.addSeconds(
          startTime,
          alltimes,
          new Cesium.JulianDate()
        );
        this.timesAtPoint.push(sTime);
        item.time = sTime;
        property.addSample(sTime, item);
      } else {
        // 中间点，计算转弯处弧线
        let speed = isSpeedArray
          ? speeds
            ? speeds[i - 1]
            : defSpeed
          : speeds || defSpeed; // 1千米/时 =  1/3.6 米/秒
        // speed = speed * 0.8//转弯处降速

        let arrBezier = this.getBezierSpline(
          lonlats[i - 1],
          lonlat,
          lonlats[i + 1]
        );
        for (let j = 0; j < arrBezier.length; j++) {
          let itemBezier = arrBezier[j];
          let len = Cesium.Cartesian3.distance(itemBezier, lastPoint) / 1000;
          let stepTime = (len / speed) * 3600;
          alltimes += stepTime;
          // alllen += len;

          let sTime = Cesium.JulianDate.addSeconds(
            startTime,
            alltimes,
            new Cesium.JulianDate()
          );
          j === 0 && this.timesAtPoint.push(sTime);
          item.time = sTime;
          property.addSample(sTime, itemBezier);
          lastPoint = itemBezier;
        }
      }
      arrLinePoint.push(item);
    }

    this.arrLinePoint = arrLinePoint;
    stopTime = Cesium.JulianDate.addSeconds(
      startTime,
      alltimes,
      new Cesium.JulianDate()
    );

    // 显示基本信息，名称、总长、总时间

    /* const allInfo = {
      name: attr.name,
      alllen: alllen * 1000,
      alltime: alltimes
    }; */
    // console.log(allInfo);

    //= ====================绑定clock timeline====================
    viewer.clock.startTime = startTime.clone();
    viewer.clock.stopTime = stopTime.clone();
    viewer.clock.currentTime = startTime.clone();
    viewer.clock.multiplier = 1; // 飞行速度
    viewer.clock.shouldAnimate = true;

    if (attr.clockRange) {
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
    } // 到达终止时间后循环
    else {
      viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
    } // 到达终止时间后停止
    // viewer.clock.clockRange = Cesium.ClockRange.UNBOUNDED //达到终止时间后继续读秒

    if (viewer.timeline) {
      viewer.timeline.zoomTo(startTime, stopTime);
    } else if (this.timeline) {
      this.timeline.zoomTo(startTime, stopTime);
    }
    //= ====================构造飞行对象====================
    let entityAttr = {
      id: route.id,
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start: startTime,
          stop: stopTime
        })
      ]),
      position: property,
      orientation: new Cesium.VelocityOrientationProperty(property), // 基于移动位置自动计算方位
      data: route
    };

    if (attr.showLabel) {
      // 是否显示注记
      entityAttr.label = {
        text: route.name,
        font: '14px Helvetica',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: Cesium.Color.AZURE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        scaleByDistance: new Cesium.NearFarScalar(1000, 1, 500000, 0.5),
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
          0.0,
          500000
        )
      };
    }

    if (attr.showLine) {
      // 是否显示路线
      entityAttr.path = {
        material: new Cesium.Color.fromCssColorString(
          route.properties.style.color
        ).withAlpha(0.4),
        resolution: 1,
        width: 1.5,
        leadTime: 0,
        trailTime: alltimes
      };
    }
    // 漫游对象
    switch (attr.point) {
      case 'point':
        entityAttr.point = {
          color: new Cesium.Color.fromCssColorString(
            route.properties.style.color
          ).withAlpha(0.8),
          pixelSize: 6
        };
        if (entityAttr.label) {
          entityAttr.label.pixelOffset = new Cesium.Cartesian2(10, -30);
        } // 偏移量
        break;
      case 'model_car': // 汽车模型
        entityAttr.model = {
          uri: 'data3d/gltf/qiche.gltf',
          scale: 0.2,
          minimumPixelSize: 50
        };
        if (entityAttr.label) {
          entityAttr.label.pixelOffset = new Cesium.Cartesian2(70, -30);
        } // 偏移量
        break;
      case 'model_air': // 飞机模型
        entityAttr.model = {
          uri: 'data3d/gltf/feiji.glb',
          scale: 0.1,
          minimumPixelSize: 50
        };
        if (entityAttr.label) {
          entityAttr.label.pixelOffset = new Cesium.Cartesian2(60, -30);
        } // 偏移量
        break;
      // case "model_j10"://歼十模型
      //    entityAttr.model = {
      //        uri: 'data/gltf/j10/j10.gltf',
      //        scale: 50,
      //        minimumPixelSize: 50
      //    }
      //    if (entityAttr.label)
      //        entityAttr.label.pixelOffset = new Cesium.Cartesian2(60, -30)//偏移量
      //    break
      case 'model_weixin': // 卫星模型
        entityAttr.model = {
          uri: 'data3d/gltf/weixin.gltf',
          scale: 1,
          minimumPixelSize: 100
        };
        if (entityAttr.label) {
          entityAttr.label.pixelOffset = new Cesium.Cartesian2(60, -30);
        } // 偏移量
        break;
      default: // 必须有对象，否则viewer.trackedEntity无法跟随
        entityAttr.point = {
          color: new Cesium.Color.fromCssColorString('#ffffff').withAlpha(0.01),
          pixelSize: 1
        };
        break;
    }

    this.flyEntity = viewer.entities.add(entityAttr);

    // 插值，使折线边平滑 ,并且长距离下不穿地
    this.flyEntity.position.setInterpolationOptions({
      interpolationDegree: 2,
      interpolationAlgorithm: Cesium.HermitePolynomialApproximation
    });
    viewer.trackedEntity = this.flyEntity;
    // setTimeout(() => {
    //   if(isInit){
    //     console.log(111111111111)
    //     this.stop()
    //   }
    // }, 100);

    this.currentView = this.flyEntity.position.getValue(this.timesAtPoint[0]);
    this.idxOfTimes = 1;

    viewer.scene.preRender.addEventListener(this.preRender_eventHandler, this);
  }

  getFlyOkPoints(position) {
    const { viewer } = this.prop;
    const arrnew = [];
    let alllen = 0;

    const thistime = viewer.clock.currentTime;
    const arr = this.arrLinePoint;
    for (let i = 0, length = arr.length; i < length; i++) {
      var item = arr[i];
      if (
        item.time.dayNumber > thistime.dayNumber ||
        item.time.secondsOfDay > thistime.secondsOfDay
      ) {
        let len = Cesium.Cartesian3.distance(
          position,
          i === 0 ? item : arr[i - 1]
        );
        alllen += len;
        break;
      }
      if (i > 0) {
        let len = Cesium.Cartesian3.distance(item, arr[i - 1]);
        alllen += len;
      }
      arrnew.push(item);
    }
    arrnew.push(position);

    return { positions: arrnew, len: alllen };
  }

  recordPause() {
    const { viewer } = this.prop;
    this.recoverTime = viewer.clock.currentTime;
    // this.isPause = true
    // this.isStart = false
  }

  // 创建时间控制
  createTimeLine() {
    const { viewer } = this.prop;

    const viewerContainer = viewer._element;
    if (!viewer.animation) {
      // Animation
      const animationContainer = document.createElement('div');
      animationContainer.className = 'cesium-viewer-animationContainer';
      viewerContainer.appendChild(animationContainer);
      const animation = new Cesium.Animation(
        animationContainer,
        new Cesium.AnimationViewModel(viewer.clockViewModel)
      );
      this.animation = animation;
    }
    if (!viewer.timeline) {
      // Timeline
      const timelineContainer = document.createElement('div');
      timelineContainer.className = 'cesium-viewer-timelineContainer';
      timelineContainer.style.right = '0px';
      viewerContainer.appendChild(timelineContainer);
      const timeline = new Cesium.Timeline(timelineContainer, viewer.clock);
      timeline.addEventListener('settime', this.onTimelineScrubfunction, false);
      timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime);
      this.timeline = timeline;
    }

    this.locationOldCss = $('#location_mars_jwd').css(['left', 'bottom']);
    $('#location_mars_jwd').css({ left: '170px', bottom: '25px' });

    this.legendOldCss = $('.distance-legend').css(['left', 'bottom']);
    $('.distance-legend').css({ left: '150px', bottom: '25px' });
  }

  removeTimeLine() {
    const { viewer } = this.prop;
    if (this.timeline) {
      this.timeline.removeEventListener(
        'settime',
        this.onTimelineScrubfunction,
        false
      );
    }

    try {
      const viewerContainer = viewer._element;
      if (this.animation) {
        viewerContainer.removeChild(this.animation.container);
        this.animation.destroy();
        this.animation = null;
      }
      if (this.timeline) {
        viewerContainer.removeChild(this.timeline.container);
        this.timeline.destroy();
        this.timeline = null;
      }
      $('#location_mars_jwd').css(this.locationOldCss);
      $('.distance-legend').css(this.legendOldCss);
    } catch (e) {
      console.error(e);
    }
  }

  onTimelineScrubfunction(e) {
    const clock = e.clock;
    clock.currentTime = e.timeJulian;
    clock.shouldAnimate = false;
  }

  // 投影
  updateWall(positions) {
    const { viewer } = this.prop;

    const newposition = [];
    const minimumHeights = [];
    const maximumHeights = [];
    for (let i = 0; i < positions.length; i++) {
      newposition.push(positions[i].clone());
      const carto = Cesium.Cartographic.fromCartesian(positions[i]);
      minimumHeights.push(0);
      maximumHeights.push(carto.height);
    }
    this._wall_positions = newposition;
    this._wall_minimumHeights = minimumHeights;
    this._wall_maximumHeights = maximumHeights;

    if (!this.wallEntity) {
      const wallattr = WallAttr.style2Entity({
        color: '#d7e600',
        outline: false,
        opacity: 0.5
      });
      wallattr.minimumHeights = new Cesium.CallbackProperty(
        () => this._wall_minimumHeights,
        false
      );
      wallattr.maximumHeights = new Cesium.CallbackProperty(
        () => this._wall_maximumHeights,
        false
      );
      wallattr.positions = new Cesium.CallbackProperty(() => {
        const position = Cesium.Property.getValueOrUndefined(
          this.flyEntity.position,
          viewer.clock.currentTime,
          this.positionScratch
        );
        this._wall_positions[this._wall_positions.length - 1] = position;
        return this._wall_positions;
      }, false);

      this.wallEntity = viewer.entities.add({ wall: wallattr });
    }
  }

  setOrientation(p, nextP) {
    const dis = Cesium.Cartesian3.distance(p, nextP);
    const heading = (getAngle(p, nextP) * Math.PI) / 180;
    p = Cesium.Cartographic.fromCartesian(p);
    nextP = Cesium.Cartographic.fromCartesian(nextP);
    let pitch = Math.asin((nextP.height - p.height) / dis);
    if (dis === 0 || nextP.height - p.height === 0) pitch = 0;
    return { heading, pitch, roll: 0 };
  }

  onTimeEnd() {
    this.stop();
    this.prop.timeEnd && this.prop.timeEnd();
    // this.toRoamLine()
    // this.onTimeEnd = undefined
  }

  preRender_eventHandler() {
    const { viewer } = this.prop;
    if (!this.isActivate || this.flyEntity == null) return;

    if (
      Cesium.JulianDate.compare(
        viewer.clock.currentTime,
        viewer.clock.stopTime
      ) >= 0
    )
      return this.onTimeEnd();

    if (this.isPause) {
      viewer.clock.currentTime = this.recoverTime;
    } else {
      if (typeof this.isBackWard == 'boolean') {
        if (this.isBackWard) {
          viewer.clock.currentTime = this.timesAtPoint[this.idxOfTimes - 2];
          this.isBackWard = '';
          // viewer.clock.currentTime.secondsOfDay -= 0.051
        } else {
          viewer.clock.currentTime = this.timesAtPoint[this.idxOfTimes];
          this.isBackWard = '';
        }
      }
    }
    if (!this.currentOrientation) {
      this.currentOrientation = this.firstHpr;
    }
    const attr = this.flyEntity.data.properties.attr;
    // console.log('attr',attr)
    if (
      Cesium.JulianDate.compare(
        viewer.clock.currentTime,
        this.timesAtPoint[this.idxOfTimes]
      ) >= 0
    ) {
      const oldView = this.currentView;
      this.currentView = this.flyEntity.position.getValue(
        this.timesAtPoint[this.idxOfTimes]
      );
      this.currentOrientation = this.setOrientation(oldView, this.currentView);
      // if (this.idxOfTimes<this.timesAtPoint.length-1)
      ++this.idxOfTimes;
    } else if (
      Cesium.JulianDate.compare(
        viewer.clock.currentTime,
        this.timesAtPoint[this.idxOfTimes - 1]
      ) <= 0
    ) {
      //            this.currentView = this.flyEntity.position.getValue(this.timesAtPoint[this.idxOfTimes - 2])
      // if (this.idxOfTimes<this.timesAtPoint.length-1)
      --this.idxOfTimes;
    }

    // const transformX = attr.followedX; // 距离运动点的距离（后方）
    const transformZ = attr.followedZ; // 距离运动点的高度（上方）

    // 视角处理
    switch (attr.cameraType) {
      default: // 无
        break;
      case 'ys': // 预设
      /*             if (viewer.trackedEntity != undefined) { viewer.trackedEntity = undefined }
 
                  if (this.flyEntity.model) { this.flyEntity.model.show = true }
 
                  if (this.changedIndex !== this.idxOfTimes) {
                      viewer.camera.flyTo({
                          destination: this.currentView,
                          orientation: Object.assign(this.hpr[this.idxOfTimes - 1], {
                              roll: 0
                          })
                      })
                      this.changedIndex = this.idxOfTimes
                  }
 
                  // const targetPos = this.flyEntity.position.getValue(viewer.clock.currentTime)
                  const currentView = Cesium.Cartesian3.add(this.currentView, new Cesium.Cartesian3(attr.followedX, attr.followedZ, 0), new Cesium.Cartesian3())
                  /* const vector = Cesium.Cartesian3.subtract(currentView, targetPos, new Cesium.Cartesian3())
              let transfrom = Cesium.Transforms.eastNorthUpToFixedFrame(currentView)
              const vec = Cesium.Matrix4.multiplyByPointAsVector(transfrom, vector, new Cesium.Cartesian3())
              const direction = Cesium.Cartesian3.normalize(vec, new Cesium.Cartesian3()) */
      // const otherDirection=new Cesium.Cartesian3(-direction.x,)
      // viewer.camera.setView({destination:currentView,orientation:{heading:hpr.heading,pitch:hpr.pitch,roll:hpr.roll}})
      /*             viewer.camera.setView({ destination: currentView, orientation: Object.assign({ ...this.hpr[this.idxOfTimes - 1] }, { roll: 0 }) })
                  break */

      // eslint-disable-next-line no-fallthrough
      case 'gs': // 跟随视角
        if (viewer.trackedEntity !== this.flyEntity) {
          viewer.trackedEntity = this.flyEntity;
        }

        if (this.flyEntity.model) {
          this.flyEntity.model.show = true;
        }
        break;
      case 'dy': // 锁定第一视角
        if (viewer.trackedEntity !== this.flyEntity) {
          viewer.trackedEntity = this.flyEntity;
        }

        this.getModelMatrix(
          viewer.trackedEntity,
          viewer.clock.currentTime,
          this.scratch
        );

        viewer.scene.camera.lookAtTransform(
          this.scratch,
          new Cesium.Cartesian3(-attr.followedX, 0, attr.followedZ)
        );

        if (this.flyEntity.model) {
          this.flyEntity.model.show = transformZ !== 0;
        }

        break;
      case 'sd': // 锁定上帝视角
        if (viewer.trackedEntity !== this.flyEntity) {
          viewer.trackedEntity = this.flyEntity;
        }

        this.getModelMatrix(
          viewer.trackedEntity,
          viewer.clock.currentTime,
          this.scratch
        );

        viewer.zoomTo(
          viewer.trackedEntity,
          new Cesium.HeadingPitchRange(
            this.currentOrientation.heading,
            -3.14 * 0.166667,
            transformZ * 2
          )
        );
        //viewer.scene.camera.lookAtTransform(this.scratch, new Cesium.Cartesian3(-1, 0, transformZ))

        if (this.flyEntity.model) {
          this.flyEntity.model.show = true;
        }
        break;
    }

    // 投影
    var position = Cesium.Property.getValueOrUndefined(
      this.flyEntity.position,
      viewer.clock.currentTime,
      this.positionScratch
    );
    const flyOk = this.getFlyOkPoints(position);
    if (attr.showShadow) {
      this.updateWall(flyOk.positions);
    }

    // 当前点
    // var position = Cesium.Property.getValueOrUndefined(this.flyEntity.position,
    // viewer.clock.currentTime, this.positionScratch)
    // if (position) {
    //   //实时监控
    //   this.realTime(position)
    // }

    /* if (JSON.stringify(viewer.clock.currentTime) ==
 JSON.stringify(viewer.clock.stopTime)) {
 this.onTimeEnd()
 //viewer.clock.currentTime = viewer.clock.startTime, this.onTimeEnd()
 } */

    /* if (this.isBackWard && JSON.stringify(viewer.clock.currentTime) <=
     JSON.stringify(viewer.clock.startTime)) {
     this.isBackWard = false, this.onTimeEnd()
     } */
  }

  getModelMatrix(entity, time, result) {
    if (entity == null) return result;

    var position = Cesium.Property.getValueOrUndefined(
      entity.position,
      time,
      this.positionScratch
    );
    if (!Cesium.defined(position)) {
      return undefined;
    }

    var orientation = Cesium.Property.getValueOrUndefined(
      entity.orientation,
      time,
      this.orientationScratch
    );
    if (!Cesium.defined(orientation)) {
      result = Cesium.Transforms.eastNorthUpToFixedFrame(
        position,
        undefined,
        result
      );
    } else {
      result = Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromQuaternion(orientation, this.matrix3Scratch),
        position,
        result
      );
    }
    return result;
  }

  // 求在P1点到P2点的线上，距离P1点len米长度的点
  getPointForLineAlong(p1, p2, len, bl) {
    const point1 = Cesium.Cartesian3.fromDegrees(p1[0], p1[1], p1[2] || 0);
    const point2 = Cesium.Cartesian3.fromDegrees(p2[0], p2[1], p2[2] || 0);

    const alllen = Cesium.Cartesian3.distance(point1, point2); // 米
    if (len === 0 || len >= alllen * bl) len = alllen * bl;

    const line = turf.lineString([p1, p2]);
    const along1 = turf.along(line, len / 1000, { units: 'kilometers' });
    const jd = along1.geometry.coordinates[0];
    const wd = along1.geometry.coordinates[1];

    const h1 = p1[2];
    const h2 = p2[2];
    const height = h1 + ((h2 - h1) * len) / alllen;

    return [jd, wd, height];
  }

  // 计算转弯
  getBezierSpline(pt1, pt2, pt3) {
    const npt1 = this.getPointForLineAlong(pt2, pt1, 300, 0.2);
    const npt2 = this.getPointForLineAlong(pt2, pt1, 200, 0.1);

    const npt3 = this.getPointForLineAlong(pt2, pt3, 200, 0.1);
    const npt4 = this.getPointForLineAlong(pt2, pt3, 300, 0.2);

    const line = turf.lineString([npt1, npt2, pt2, npt3, npt4]);
    const feature = turf.bezierSpline(line, { sharpness: 0.5 });

    const lonlats = [];
    const h2 = pt2[2];
    for (let i = 0; i < feature.geometry.coordinates.length; i++) {
      const item = feature.geometry.coordinates[i];
      lonlats.push(Number(item[0]));
      lonlats.push(Number(item[1]));
      lonlats.push(h2);
    }
    const positions = Cesium.Cartesian3.fromDegreesArrayHeights(lonlats);

    // viewer.entities.add({ polyline: { positions: positions,  width: 5,   } }) //test

    return positions;
  }
}

export { RoamFly };
