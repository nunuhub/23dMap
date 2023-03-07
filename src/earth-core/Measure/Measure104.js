/**
 * @Author han
 * @Date 2020/11/16 10:28
 */

import * as Cesium from 'cesium_shinegis_earth';
import * as DrawEventType from '../Draw/EventType7';
import * as LabelAttr from '../Draw/EntityAttr/LabelAttr9';
import * as util from '../Tool/Util1';

import { Draw } from '../Draw/DrawAll21';
import { terrainPolyline, formatPosition, centerOfMass } from '../Tool/Point2';
import { getRotateCenterPoint } from '../Tool/Matrix56';
import { PointPopup } from './PointPopup';
import * as polygonAttr from '../Draw/EntityAttr/PolygonAttr14';

//提供测量长度、面积等 [绘制基于draw]
const Measure = function Measure(opts) {
  let viewer = opts.viewer;

  const _popup = new PointPopup(viewer);
  //显示测量结果文本的字体
  let _labelAttr = {
    color: '#ffffff',
    font_family: '楷体',
    font_size: 20,
    border: true,
    border_color: '#000000',
    border_width: 3,
    background: true,
    background_color: '#000000',
    background_opacity: 0.5,
    scaleByDistance: true,
    scaleByDistance_far: 800000,
    scaleByDistance_farValue: 0.5,
    scaleByDistance_near: 1000,
    scaleByDistance_nearValue: 1,
    pixelOffset: [0, -15],
    disableDepthTestDistance: Number.POSITIVE_INFINITY //一直显示，不被地形等遮挡
  };
  if (Cesium.defined(opts.label)) {
    for (let key in opts.label) {
      if (Object.hasOwnProperty.call(opts.label, key)) {
        _labelAttr[key] = opts.label[key];
      }
    }
  }

  let thisType = ''; //当前正在绘制的类别
  let drawControl = new Draw(viewer, {
    name: opts.name || 'measure',
    hasEdit: true,
    removeScreenSpaceEvent: opts.removeScreenSpaceEvent
  });

  let entity;

  //事件监听

  drawControl.on(DrawEventType.DrawAddPoint, function (e) {
    entity = e.entity;
    thisType = e.entity.attribute.attr.thisType;
    switch (thisType) {
      case 'length':
      case 'section':
        workLength.showAddPointLength(entity);
        break;
      case 'area':
        workArea.showAddPointLength(entity);
        break;
      case 'volume':
        workVolume.showAddPointLength(entity);
        break;
      case 'height':
        workHeight.showAddPointLength(entity);
        break;
      case 'super_height':
        workSuperHeight.showAddPointLength(entity);
        break;
      case 'angle':
        workAngle.showAddPointLength(entity);
        break;
    }
  });
  drawControl.on(DrawEventType.DrawRemovePoint, function (e) {
    thisType = e.entity.attribute.attr.thisType;
    switch (thisType) {
      case 'length':
      case 'section':
        workLength.showRemoveLastPointLength(e);
        break;
      case 'area':
        workArea.showRemoveLastPointLength(e);
        break;
      case 'volume':
        workVolume.showRemoveLastPointLength(e);
        break;
      case 'height':
        workHeight.showRemoveLastPointLength(e);
        break;
      case 'super_height':
        workSuperHeight.showRemoveLastPointLength(e);
        break;
      case 'angle':
        workAngle.showRemoveLastPointLength(e);
        break;
    }
  });
  drawControl.on(DrawEventType.DrawMouseMove, function (e) {
    entity = e.entity;
    thisType = e.entity.attribute.attr.thisType;
    switch (thisType) {
      case 'length':
      case 'section':
        workLength.showMoveDrawing(entity);
        break;
      case 'area':
        workArea.showMoveDrawing(entity);
        break;
      case 'volume':
        workVolume.showMoveDrawing(entity);
        break;
      case 'height':
        workHeight.showMoveDrawing(entity);
        break;
      case 'super_height':
        workSuperHeight.showMoveDrawing(entity); ///陈利军,注释辅助线段绘制，终点拾取bug，容易拾取在线上导致出错；bug已解除，已恢复；
        break;
      case 'angle':
        workAngle.showMoveDrawing(entity);
        break;
    }
  });

  drawControl.on(DrawEventType.DrawCreated, function (e) {
    entity = e.entity;
    thisType = e.entity.attribute.attr.thisType;
    switch (thisType) {
      case 'length':
      case 'section':
        workLength.showDrawEnd(entity);
        break;
      case 'area':
        workArea.showDrawEnd(entity);
        break;
      case 'volume':
        workVolume.showDrawEnd(entity);
        break;
      case 'height':
        workHeight.showDrawEnd(entity);
        break;
      case 'super_height':
        workSuperHeight.showDrawEnd(entity);
        break;
      case 'angle':
        workAngle.showDrawEnd(entity);
        break;
      case 'point':
        workPoint.showDrawEnd(entity);
        break;
    }
    entity = null;
  });
  //纪舒敏 添加量算可编辑事件
  // EditStart: "edit-start"
  // EditMovePoint: "edit-move-point"
  // EditRemovePoint: "edit-remove-point"
  // EditStop: "edit-stop"
  drawControl.on(DrawEventType.EditMovePoint, function (e) {
    entity = e.entity;
    thisType = e.entity.attribute.attr.thisType;
    switch (thisType) {
      case 'length':
      case 'section':
        workLength.EditPoint(entity);
        break;
      case 'area':
        workArea.EditPoint(entity);
        break;
      case 'height':
        workHeight.EditPoint(entity);
        break;
      case 'point':
        workPoint.showDrawEnd(entity);
        break;
    }
    entity = null;
  });
  drawControl.on(DrawEventType.EditRemovePoint, function (e) {
    entity = e.entity;
    thisType = e.entity.attribute.attr.thisType;
    switch (thisType) {
      case 'length':
      case 'section':
        workLength.EditPoint(entity);
        break;
      case 'area':
        workArea.EditPoint(entity);
        break;
      case 'height':
        workHeight.EditPoint(entity);
        break;

      case 'point':
        workPoint.showDrawEnd(entity);
        break;
    }
    entity = null;
  });
  //end

  let dataSource = drawControl.getDataSource();

  /*长度测量*/
  function measureLength(options) {
    endLastDraw();

    thisType = 'length';
    options = options || {};
    options.type = thisType;
    if (!Object.hasOwnProperty.call(options, 'terrain')) options.terrain = true;

    workLength.start(options);
  }

  //纪舒敏 增加paid绘制单击结束调用事件
  function paidStop() {
    drawControl.endDraw();
  }

  /*剖面分析*/
  function measureSection(options) {
    endLastDraw();

    thisType = 'section';
    options = options || {};
    options.type = thisType;
    options.terrain = true;
    options.splitNum = Cesium.defaultValue(options.splitNum, 6);

    workLength.start(options);
  }

  /*面积测量*/
  function measureArea(options) {
    endLastDraw();

    thisType = 'area';
    options = options || {};
    options.type = thisType;

    workArea.start(options);
  }

  /*体积测量*/
  function measureVolume(options) {
    endLastDraw();

    thisType = 'volume';
    options = options || {};
    options.type = thisType;

    workVolume.start(options);
  }

  /*高度测量*/
  function measureHeight(options) {
    endLastDraw();

    options = options || {};

    if (Object.hasOwnProperty.call(options, 'isSuper') && !options.isSuper) {
      thisType = 'height';
      options.type = thisType;
      workHeight.start(options);
    } else {
      thisType = 'super_height';
      options.type = thisType;
      workSuperHeight.start(options);
    }
  }

  /*角度测量*/
  function measureAngle(options) {
    endLastDraw();

    thisType = 'angle';
    options = options || {};
    options.type = thisType;

    workAngle.start(options);
  }

  /*坐标测量*/
  function measurePoint(options) {
    endLastDraw();

    thisType = 'point';
    options = options || {};
    options.type = thisType;

    workPoint.start(options);
  }

  //如果上次未完成绘制就单击了新的，清除之前未完成的。
  function endLastDraw() {
    workLength.clearLastNoEnd();
    workArea.clearLastNoEnd();
    workVolume.clearLastNoEnd();
    workHeight.clearLastNoEnd();
    workSuperHeight.clearLastNoEnd();
    workAngle.clearLastNoEnd();
    workPoint.clearLastNoEnd();
    drawControl.stopDraw();
  }

  //外部控制，完成绘制，比如手机端无法双击结束
  function endDraw() {
    if (entity == null) return;

    switch (thisType) {
      case 'length':
      case 'section':
        workLength.showMoveDrawing(entity);
        break;
      case 'area':
        workArea.showMoveDrawing(entity);
        break;
      case 'height':
        workHeight.showMoveDrawing(entity);
        break;
      case 'super_height':
        workSuperHeight.showMoveDrawing(entity);
        break;
      case 'angle':
        workAngle.showMoveDrawing(entity);
        break;
    }

    drawControl.endDraw();
    entity = null;
  }

  /*清除测量*/
  function clearMeasure() {
    thisType = '';
    endLastDraw();

    //dataSource.entities.removeAll()
    drawControl.deleteAll();
  }
  /*根据id清除测量*/
  function clearMeasureById(id) {
    endLastDraw();
    let entity = dataSource.entities.getById(id);
    entity && drawControl.deleteEntity(entity);
  }

  /** 更新量测结果的单位  */
  function updateUnit(thisType, unit) {
    let arr = dataSource.entities.values;
    if (thisType === 'area') {
      //目的是：修改单位后，编辑feature，显示的单位为修改后的值。
      workArea.options.unit = unit;
    } else {
      workLength.options.unit = unit;
    }
    for (let i in arr) {
      let entity = arr[i];

      if (
        entity.label &&
        entity.isMarsMeasureLabel &&
        entity.attribute &&
        entity.attribute.value
      ) {
        if (entity.attribute.type !== thisType) continue;
        if (thisType === 'area') {
          entity.label.text._value =
            (entity.attribute.textEx || '') +
            util.formatArea(entity.attribute.value, unit);
        } else {
          entity._label.text._value =
            (entity.attribute.textEx || '') +
            util.formatLength(entity.attribute.value, unit);
        }
      }
    }
  }

  let workLength = {
    options: null,
    arrLables: [], //各线段label
    totalLable: null, //总长label
    disTerrainScale: 1.2, //贴地时的概略比例
    //清除未完成的数据
    clearLastNoEnd: function clearLastNoEnd() {
      if (Cesium.defined(this.totalLable))
        dataSource.entities.remove(this.totalLable);
      if (Cesium.defined(this.arrLables) && this.arrLables.length > 0) {
        let arrLables = this.arrLables;
        if (arrLables && arrLables.length > 0) {
          for (let i in arrLables) {
            if (Object.hasOwnProperty.call(arrLables, i)) {
              dataSource.entities.remove(arrLables[i]);
            }
          }
        }
      }
      this.totalLable = null;
      this.arrLables = [];
    },
    //开始绘制
    start: function start(options) {
      this.options = options;
      let edittype = this.options.terrain ? 'ctgDis' : 'spatialDis';
      this.en = drawControl.startDraw({
        type: 'polyline',
        kzedit: false,
        config: {
          addHeight: options.addHeight
        },
        attr: {
          //为了编辑时确定编辑目标的thisType。
          thisType: this.options.type
        },
        edittype: edittype,
        //纪舒敏 修改绘制线样式
        style: options.style || {
          //"lineType": "glow",
          color: '#FFFF00',
          width: 3,
          // "glowPower": 0.1,
          clampToGround:
            this.options.type === 'section' || this.options.terrain, //是否贴地
          depthFailMaterial: new Cesium.Color.fromCssColorString(
            '#FFFF00'
          ).withAlpha(0.4)
        }
        //end
      });

      //总长label
      let entityattr = LabelAttr.style2Entity(_labelAttr, {
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 50000), //纪舒敏 标签显示超过设定距离不显示
        show: false
      });

      this.totalLable = dataSource.entities.add({
        id: this.en.id + 'label',
        mark311: drawControl.id,
        label: entityattr,
        isMarsMeasureLabel: true,
        _noMousePosition: true,
        attribute: {
          unit: this.options.unit,
          type: this.options.type
        }
      });
      this.arrLables = [];
    },
    //绘制增加一个点后，显示该分段的长度
    showAddPointLength: function showAddPointLength(entity) {
      let positions = drawControl.getPositions(entity);

      let entityattr = LabelAttr.style2Entity(_labelAttr, {
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 50000), //纪舒敏 标签显示超过设定距离不显示
        show: true
      });

      let tempSingleLabel = dataSource.entities.add({
        id: this.en.id + positions.length + 'label',
        mark311: drawControl.id,
        position: positions[positions.length - 1],
        label: entityattr,
        isMarsMeasureLabel: true,
        _noMousePosition: true,
        attribute: {
          unit: this.options.unit,
          type: this.options.type
        }
      });

      if (positions.length === 1) {
        tempSingleLabel.label.text = '起点';
        //tempSingleLabel.attribute.value = 0
      } else {
        let distance = util.getLength(positions);
        let distancestr = util.formatLength(distance, this.options.unit);

        tempSingleLabel.label.text = distancestr;
        tempSingleLabel.attribute.value = distance;

        //屏蔽比较小的数值
        if (
          util.getLength([
            positions[positions.length - 2],
            positions[positions.length - 1]
          ]) < 5
        )
          tempSingleLabel.show = false;
      }
      this.arrLables.push(tempSingleLabel);
    },
    showRemoveLastPointLength: function showRemoveLastPointLength(e) {
      let label = this.arrLables.pop();
      dataSource.entities.remove(label);

      this.showMoveDrawing(e.entity);
      this.totalLable.position = e.position;
    },
    //绘制过程移动中，动态显示长度信息
    showMoveDrawing: function showMoveDrawing(entity) {
      let positions = drawControl.getPositions(entity);
      if (positions.length < 2) {
        this.totalLable.label.show = false;
        return;
      }

      let distance = util.getLength(positions);
      let distancestr = util.formatLength(distance, this.options.unit);
      //纪舒敏 平板模式长度测量，标签显示跟随结束前一点，平板模式打开此时电脑操作双击结束会出现标签位置不对应问题
      if (viewer.paid) {
        this.totalLable.position = positions[positions.length - 2];
      } else {
        this.totalLable.position = positions[positions.length - 1];
      }
      //end
      this.totalLable.label.text = '总长:' + distancestr;
      this.totalLable.label.show = true;

      this.totalLable.attribute.value = distance;
      this.totalLable.attribute.textEx = '总长:';

      if (this.options.calback) this.options.calback(distancestr, distance);
    },
    //绘制完成后
    showDrawEnd: function showDrawEnd(entity) {
      let positions = drawControl.getPositions(entity);
      let count = this.arrLables.length - positions.length;
      if (count >= 0) {
        for (
          let i = this.arrLables.length - 1;
          i >= positions.length - 1;
          i--
        ) {
          dataSource.entities.remove(this.arrLables[i]);
        }
        this.arrLables.splice(positions.length - 1, count + 1);
      }
      entity._totalLable = this.totalLable;
      entity._arrLables = this.arrLables;

      this.totalLable = null;
      this.arrLables = [];

      if (entity.polyline == null) return;

      if (this.options.type === 'section') this.updateSectionForTerrain(entity);
      else if (this.options.terrain) this.updateLengthForTerrain(entity);
      else {
        this.EditPoint(entity);
      } //因贴地‘updateLengthForTerrain()’里将节点上显示距离修改为两节点间距，而‘不贴地’仍是从起点起算距离，故加该句。
      //纪舒敏  返回测量距离
      let distance = entity._totalLable.attribute.value;
      let distancestr = util.formatLength(distance, this.options.unit);
      if (this.options.calbackresult)
        this.options.calbackresult(distancestr, entity);

      //end
    },

    //纪舒敏 添加编辑绘制结点事件
    EditPoint: function EditPoint(entity) {
      let positions = drawControl.getPositions(entity);
      let distance = util.getLength(positions);
      let distancestr = util.formatLength(distance, this.options.unit);

      entity._totalLable.show = false;

      for (let i = 0; i < entity._positions_draw.length; i++) {
        if (entity._arrLables[i]) {
          entity._arrLables[i].show = false;
        }
        let entityattr = LabelAttr.style2Entity(_labelAttr, {
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            0,
            50000
          ),
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          show: true
        });
        let tempSingleLabel = dataSource.entities.add({
          id: this.en.id + Cesium.createGuid() + 'label',
          mark311: drawControl.id,
          position: positions[i],
          label: entityattr,
          isMarsMeasureLabel: true,
          _noMousePosition: true,
          attribute: {
            unit: this.options.unit,
            type: this.options.type
          }
        });
        let editpos = [];
        if (i === 0) {
          tempSingleLabel.label.text = '起点';
          this.arrLables.push(tempSingleLabel);
        } else if (i === entity._positions_draw.length - 1) {
          tempSingleLabel.label.text = '总长:' + distancestr;
          let distance = util.getLength(positions);
          tempSingleLabel.attribute.value = distance;
          this.totalLable = tempSingleLabel;
        } else {
          editpos.push(positions[i - 1]);
          editpos.push(positions[i]);
          let newdis = util.getLength(editpos);
          tempSingleLabel.attribute.value = newdis;
          tempSingleLabel.label.text = util.formatLength(
            newdis,
            this.options.unit
          );
          this.arrLables.push(tempSingleLabel);
        }
      }
      entity._totalLable = this.totalLable;
      entity._arrLables = this.arrLables;
      this.totalLable = null;
      this.arrLables = [];

      if (this.options.type === 'section') this.updateSectionForTerrain(entity);
      else if (this.options.terrain) this.updateLengthForTerrain(entity);
      if (this.options.calback) this.options.calback(distancestr, distance);
      if (this.options.calbackresult)
        this.options.calbackresult(distancestr, entity);
    },
    //end

    //计算贴地线
    updateLengthForTerrain: function updateLengthForTerrain(entity) {
      let that = this;
      let positions = entity.polyline.positions.getValue(
        viewer.clock.currentTime
      );
      let arrLables = entity._arrLables;
      let totalLable = entity._totalLable;
      let unit =
        totalLable && totalLable.attribute && totalLable.attribute.unit;

      if (this.options.onStart) this.options.onStart();

      let index = 0;
      let all_distance = 0;

      function getLineFD() {
        index++;
        if (index >= positions.length && totalLable) {
          let distancestr = util.formatLength(all_distance, unit);

          totalLable.label.text = '总长:' + distancestr;
          totalLable.attribute.value = all_distance;

          if (that.options.calback)
            that.options.calback(distancestr, all_distance);
          if (that.options.calbackresult)
            that.options.calbackresult(distancestr, entity);

          if (that.options.onStop) that.options.onStop();
          return;
        }

        let arr = [positions[index - 1], positions[index]];
        terrainPolyline({
          viewer: viewer,
          positions: arr,
          splitNum: that.options.splitNum,
          calback: function calback(raisedPositions, noHeight) {
            let distance = util.getLength(raisedPositions);
            if (noHeight) {
              distance = distance * that.disTerrainScale; //求高度失败，概略估算值
            }

            let thisLabel = arrLables[index];
            if (thisLabel) {
              let distancestr = util.formatLength(distance, unit);

              thisLabel.label.text = distancestr;
              thisLabel.attribute.value = distance;
            }

            all_distance += distance;
            getLineFD();
          }
        });
      }

      getLineFD();
    },

    //计算剖面
    updateSectionForTerrain: function updateSectionForTerrain(entity) {
      let positions = entity.polyline.positions.getValue(
        viewer.clock.currentTime
      );
      if (positions.length < 2) return;

      let arrLables = entity._arrLables;
      let totalLable = entity._totalLable;
      let unit =
        totalLable && totalLable.attribute && totalLable.attribute.unit;

      let index = 0;
      let positionsNew = [];

      let alllen = 0;
      let arrLen = [];
      let arrHB = [];
      let arrLX = [];
      let arrPoint = [];

      if (this.options.onStart) this.options.onStart();

      let that = this;

      function getLineFD() {
        index++;

        let arr = [positions[index - 1], positions[index]];
        terrainPolyline({
          viewer: viewer,
          positions: arr,
          splitNum: that.options.splitNum,
          calback: function calback(raisedPositions, noHeight) {
            if (noHeight) {
              if (index === 1) positionsNew = positionsNew.concat(arr);
              else positionsNew = positionsNew.concat([positions[index]]);
            } else {
              positionsNew = positionsNew.concat(raisedPositions);
            }

            let h1 = Cesium.Cartographic.fromCartesian(
              positions[index - 1]
            ).height;
            let h2 = Cesium.Cartographic.fromCartesian(positions[index]).height;
            let hstep = (h2 - h1) / raisedPositions.length;

            for (let i = 0; i < raisedPositions.length; i++) {
              //长度
              if (i !== 0) {
                alllen += Cesium.Cartesian3.distance(
                  raisedPositions[i],
                  raisedPositions[i - 1]
                );
              }
              arrLen.push(Number(alllen.toFixed(1)));

              //海拔高度
              let point = formatPosition(raisedPositions[i]);
              arrHB.push(point.z);
              arrPoint.push(point);

              //路线高度
              let fxgd = Number((h1 + hstep * i).toFixed(1));
              arrLX.push(fxgd);
            }

            if (index >= positions.length - 1) {
              let distance = util.getLength(positionsNew);
              let distancestr = util.formatLength(distance, unit);
              if (totalLable) {
                totalLable.label.text = '总长:' + distancestr;
                totalLable.attribute.value = distance;
              }
              if (that.options.calback)
                that.options.calback({
                  distancestr: distancestr,
                  distance: distance,
                  arrLen: arrLen,
                  arrLX: arrLX,
                  arrHB: arrHB,
                  arrPoint: arrPoint,
                  id: entity?.id
                });
              if (that.options.onStop) that.options.onStop();
            } else {
              let distance = util.getLength(raisedPositions);
              let distancestr = util.formatLength(distance, unit);

              let thisLabel = arrLables[index];
              thisLabel.label.text = distancestr;
              thisLabel.attribute.value = distance;

              getLineFD();
            }
          }
        });
      }

      getLineFD();
    }
  };

  let workArea = {
    options: null,
    totalLable: null, //面积label
    //清除未完成的数据
    clearLastNoEnd: function clearLastNoEnd() {
      if (this.totalLable != null) dataSource.entities.remove(this.totalLable);
      this.totalLable = null;
    },
    //开始绘制
    start: function start(options) {
      this.options = options;

      this.en = drawControl.startDraw({
        type: 'polygon',
        kzedit: false,
        edittype: 'measureArea',
        attr: {
          thisType: this.options.type
        },
        style: options.style || {
          color: '#00fff2',
          outline: true,
          outlineColor: '#fafa5a',
          outlineWidth: 1,
          opacity: 0.4,
          clampToGround: true //贴地
        }
      });
      let entityattr = LabelAttr.style2Entity(_labelAttr, {
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 50000), //纪舒敏 标签显示超过设定距离不显示
        show: false
      });

      this.totalLable = dataSource.entities.add({
        id: this.en.id + 'label',
        mark311: drawControl.id,
        label: entityattr,
        isMarsMeasureLabel: true,
        _noMousePosition: true,
        attribute: {
          unit: this.options.unit,
          type: this.options.type
        }
      });
    },
    //绘制增加一个点后，显示该分段的长度
    showAddPointLength: function showAddPointLength(entity) {
      this.showMoveDrawing(entity); //兼容手机端
    },
    //绘制中删除了最后一个点
    showRemoveLastPointLength: function showRemoveLastPointLength(e) {
      let positions = drawControl.getPositions(e.entity);
      if (positions.length < 3) {
        this.totalLable.label.show = false;
      }
    },
    //绘制过程移动中，动态显示面积信息
    showMoveDrawing: function showMoveDrawing(entity) {
      let positions = drawControl.getPositions(entity);
      if (positions.length < 3) {
        this.totalLable.label.show = false;
        return;
      }

      let area = util.getArea(positions);
      let areastr = util.formatArea(area, this.options.unit);

      //求中心点
      let ptcenter = centerOfMass(positions);

      this.totalLable.position = ptcenter;
      this.totalLable.label.text = '面积:' + areastr;
      this.totalLable.label.show = true;

      this.totalLable.attribute.value = area;
      this.totalLable.attribute.textEx = '面积:';
      if (this.options.calback) this.options.calback(areastr, area);
    },
    //绘制完成后
    showDrawEnd: function showDrawEnd(entity) {
      if (entity.polygon == null) return;

      entity._totalLable = this.totalLable;
      this.totalLable = null;
      //纪舒敏 返回测量面积
      let area = entity._totalLable.attribute.value;
      let areastr = util.formatArea(area, this.options.unit);
      if (this.options.calbackresult)
        this.options.calbackresult(areastr, entity);
      //end
    },
    //纪舒敏 添加编辑绘制结点事件
    EditPoint: function EditPoint(entity) {
      let positions = drawControl.getPositions(entity);
      let area = util.getArea(positions);
      let areastr = util.formatArea(area, this.options.unit);

      //求中心点
      let ptcenter = centerOfMass(positions);

      entity._totalLable.position._value = ptcenter;
      entity._totalLable.label.text = '面积:' + areastr;
      entity._totalLable.label.show = true;

      entity._totalLable.attribute.value = area;
      entity._totalLable.attribute.textEx = '面积:';

      if (this.options.calback) this.options.calback(areastr, area);
      if (this.options.calbackresult)
        this.options.calbackresult(areastr, entity);
    }

    //end
  };

  let workVolume = {
    options: null,
    totalLable: null, //体积label
    prevEntity: null, //立体边界
    //清除未完成的数据
    clearLastNoEnd: function clearLastNoEnd() {
      if (this.totalLable != null) dataSource.entities.remove(this.totalLable);
      this.totalLable = null;

      if (this.prevEntity != null) dataSource.entities.remove(this.prevEntity);
      this.prevEntity = null;
    },
    //开始绘制
    start: function start(options) {
      this.options = options;

      let entityattr = LabelAttr.style2Entity(_labelAttr, {
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        show: false
      });

      this.totalLable = dataSource.entities.add({
        label: entityattr,
        mark311: drawControl.id,
        isMarsMeasureLabel: true,
        _noMousePosition: true,
        attribute: {
          unit: this.options.unit,
          type: this.options.type
        }
      });

      drawControl.startDraw({
        type: 'polygon',
        kzedit: false,
        style: options.style || {
          color: '#00fff2',
          outline: true,
          outlineColor: '#fafa5a',
          outlineWidth: 1,
          opacity: 0.4,
          clampToGround: true //贴地
        }
      });
    },
    //绘制增加一个点后，显示该分段的长度
    showAddPointLength: function showAddPointLength() {},
    //绘制中删除了最后一个点
    showRemoveLastPointLength: function showRemoveLastPointLength() {},
    //绘制过程移动中，动态显示长度信息
    showMoveDrawing: function showMoveDrawing() {},
    //绘制完成后
    showDrawEnd: function showDrawEnd(entity) {
      if (entity.polygon == null) return;

      let positions = polygonAttr.getPositions(entity);
      let result = this.computeCutVolume(positions);

      let maxHeight = result.maxHeight;
      let totalCutVolume = result.totalCutVolume;

      let totalCutVolumestr = totalCutVolume.toFixed(2) + '立方米'; ///formatArea(totalCutVolume, this.options.unit)

      //求中心点
      let ptcenter = centerOfMass(positions, maxHeight + 10);

      this.totalLable.position = ptcenter;
      this.totalLable.label.text = '挖方体积:' + totalCutVolumestr;
      this.totalLable.label.show = true;

      this.totalLable.attribute.value = totalCutVolume;
      this.totalLable.attribute.textEx = '挖方体积:';
      let areastr = '';
      if (this.options.calback) this.options.calback(areastr, totalCutVolume);

      dataSource.entities.remove(entity);
      //显示立体边界
      entity = dataSource.entities.add({
        mark311: drawControl.id,
        polygon: {
          hierarchy: {
            positions: positions
          },
          extrudedHeight: maxHeight,
          closeTop: false,
          closeBottom: false,
          material: new Cesium.Color.fromCssColorString('#00fff2').withAlpha(
            0.5
          ),
          outline: true,
          outlineColor: new Cesium.Color.fromCssColorString(
            '#fafa5a'
          ).withAlpha(0.4),
          outlineWidth: 1
        }
      });

      entity._totalLable = this.totalLable;
      this.totalLable = null;
    },
    computeCutVolume: function computeCutVolume(positions) {
      let minHeight = 15000;
      for (let i = 0; i < positions.length; i++) {
        let cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
        let height = viewer.scene.globe.getHeight(cartographic);
        if (minHeight > height) minHeight = height;
      }

      let granularity = Math.PI / Math.pow(2, 11);
      granularity = granularity / 64;

      let polygonGeometry = new Cesium.PolygonGeometry.fromPositions({
        positions: positions,
        vertexFormat: Cesium.PerInstanceColorAppearance.FLAT_VERTEX_FORMAT,
        granularity: granularity
      });
      //polygon subdivision
      let geom = new Cesium.PolygonGeometry.createGeometry(polygonGeometry);

      let totalCutVolume = 0;
      let maxHeight = 0;

      let i0, i1, i2;
      let height1, height2, height3;
      let p1, /*  p2, */ p3;
      let cartesian;
      let cartographic;
      let bottomArea;

      for (let i = 0; i < geom.indices.length; i += 3) {
        i0 = geom.indices[i];
        i1 = geom.indices[i + 1];
        i2 = geom.indices[i + 2];

        cartesian = new Cesium.Cartesian3(
          geom.attributes.position.values[i0 * 3],
          geom.attributes.position.values[i0 * 3 + 1],
          geom.attributes.position.values[i0 * 3 + 2]
        );

        cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        height1 = viewer.scene.globe.getHeight(cartographic);
        p1 = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          0 /*height1 + 1000*/
        );

        if (maxHeight < height1) maxHeight = height1;

        cartesian = new Cesium.Cartesian3(
          geom.attributes.position.values[i1 * 3],
          geom.attributes.position.values[i1 * 3 + 1],
          geom.attributes.position.values[i1 * 3 + 2]
        );

        cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        height2 = viewer.scene.globe.getHeight(cartographic);

        let p2 = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          0 /*height2 + 1000*/
        );

        if (maxHeight < height2) maxHeight = height2;

        cartesian = new Cesium.Cartesian3(
          geom.attributes.position.values[i2 * 3],
          geom.attributes.position.values[i2 * 3 + 1],
          geom.attributes.position.values[i2 * 3 + 2]
        );

        cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        height3 = viewer.scene.globe.getHeight(cartographic);
        p3 = Cesium.Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          0 /*height3 + 1000*/
        );

        if (maxHeight < height3) maxHeight = height3;

        bottomArea = this.computeAreaOfTriangle(p1, p2, p3);
        totalCutVolume =
          totalCutVolume +
          (bottomArea *
            (height1 - minHeight + height2 - minHeight + height3 - minHeight)) /
            3;
      }

      return {
        maxHeight: maxHeight,
        totalCutVolume: totalCutVolume
      };
    },
    computeAreaOfTriangle: function computeAreaOfTriangle(pos1, pos2, pos3) {
      let a = Cesium.Cartesian3.distance(pos1, pos2);
      let b = Cesium.Cartesian3.distance(pos2, pos3);
      let c = Cesium.Cartesian3.distance(pos3, pos1);
      let S = (a + b + c) / 2;
      return Math.sqrt(S * (S - a) * (S - b) * (S - c));
    }
  };

  let workHeight = {
    options: null,
    totalLable: null, //高度label
    //清除未完成的数据
    clearLastNoEnd: function clearLastNoEnd() {
      if (this.totalLable != null) dataSource.entities.remove(this.totalLable);
      this.totalLable = null;
    },
    //开始绘制
    start: function start(options) {
      this.options = options;
      this.en = drawControl.startDraw({
        type: 'polyline',
        kzedit: false, //控制可编辑，true为不可编辑，false为可编辑
        config: {
          maxPointNum: 2
        },
        edittype: 'measureHeight',
        attr: {
          thisType: this.options.type
        },
        style: options.style || {
          //"lineType": "glow",
          color: '#FFFF00',
          width: 3,
          //"glowPower": 0.1,
          depthFailMaterial: new Cesium.Color.fromCssColorString(
            '#FFFF00'
          ).withAlpha(0.4)
        }
      });

      let entityattr = LabelAttr.style2Entity(_labelAttr, {
        horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 50000), //纪舒敏 标签显示超过设定距离不显示
        show: false
      });

      this.totalLable = dataSource.entities.add({
        id: this.en.id + 'label',
        mark311: drawControl.id,
        label: entityattr,
        isMarsMeasureLabel: true,
        _noMousePosition: true,
        attribute: {
          unit: this.options.unit,
          type: this.options.type
        }
      });
    },
    //绘制增加一个点后，显示该分段的长度
    showAddPointLength: function showAddPointLength(entity) {
      this.showMoveDrawing(entity); //兼容手机端
    },
    //绘制中删除了最后一个点
    showRemoveLastPointLength: function showRemoveLastPointLength() {
      if (this.totalLable) this.totalLable.label.show = false;
    },
    //绘制过程移动中，动态显示长度信息
    showMoveDrawing: function showMoveDrawing(entity) {
      let positions = drawControl.getPositions(entity);
      if (positions.length < 2) {
        this.totalLable.label.show = false;
        return;
      }

      let cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
      let cartographic1 = Cesium.Cartographic.fromCartesian(positions[1]);
      let height = Math.abs(cartographic1.height - cartographic.height);
      let heightstr = util.formatLength(height, this.options.unit);

      this.totalLable.position = Cesium.Cartesian3.midpoint(
        positions[0],
        positions[1],
        new Cesium.Cartesian3()
      );
      this.totalLable.label.text = '高度差:' + heightstr;
      this.totalLable.label.show = true;

      this.totalLable.attribute.value = height;
      this.totalLable.attribute.textEx = '高度差:';

      if (this.options.calback) this.options.calback(heightstr, height);
    },
    //绘制完成后
    showDrawEnd: function showDrawEnd(entity) {
      entity._totalLable = this.totalLable;
      this.totalLable = null;
      //纪舒敏 返回测量高度
      let height = Math.abs(entity._totalLable.attribute.value);
      let heightstr = util.formatLength(height, this.options.unit);
      if (this.options.calbackresult)
        this.options.calbackresult(heightstr, entity);
      //end
    },
    //纪舒敏 添加编辑绘制结点事件
    EditPoint: function EditPoint(entity) {
      let positions = drawControl.getPositions(entity);
      let cartographic = Cesium.Cartographic.fromCartesian(positions[0]);
      let cartographic1 = Cesium.Cartographic.fromCartesian(positions[1]);
      let height = Math.abs(cartographic1.height - cartographic.height);
      let heightstr = util.formatLength(height, this.options.unit);

      entity._totalLable._position._value = Cesium.Cartesian3.midpoint(
        positions[0],
        positions[1],
        new Cesium.Cartesian3()
      );
      entity._totalLable.label.text = '高度差:' + heightstr;
      entity._totalLable.label.show = true;

      entity._totalLable.attribute.value = height;
      entity._totalLable.attribute.textEx = '高度差:';

      if (this.options.calback) this.options.calback(heightstr, height);
      if (this.options.calbackresult)
        this.options.calbackresult(heightstr, entity);
    }
  };

  let workSuperHeight = {
    options: null,
    totalLable: null, //高度差label
    xLable: null, //水平距离label
    hLable: null, //水平距离label
    //清除未完成的数据
    clearLastNoEnd: function clearLastNoEnd() {
      if (this.totalLable != null) dataSource.entities.remove(this.totalLable);
      if (this.xLable != null) dataSource.entities.remove(this.xLable);
      if (this.hLable != null) dataSource.entities.remove(this.hLable);

      this.totalLable = null;
      this.xLable = null;
      this.hLable = null;
    },
    //开始绘制
    start: function start(options) {
      this.options = options;

      this.en = drawControl.startDraw({
        type: 'polyline',
        kzedit: true,
        //minMaxPoints: { min: 2, max: 2, isSuper: true },
        config: {
          maxPointNum: 2
        },
        edittype: 'superHeight',
        attr: {
          thisType: this.options.type
        },
        style: options.style || {
          //"lineType": "glow",
          color: '#FFFF00',
          width: 3,
          //"glowPower": 0.1,
          depthFailMaterial: new Cesium.Color.fromCssColorString(
            '#FFFF00'
          ).withAlpha(0.4)
        }
      });

      let entityattr = LabelAttr.style2Entity(_labelAttr, {
        horizontalOrigin: Cesium.HorizontalOrigin.RIGHT,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 50000), //纪舒敏 标签显示超过设定距离不显示
        show: false
      });
      this.totalLable = dataSource.entities.add({
        id: this.en.id + 'total_label',
        mark311: drawControl.id,
        label: entityattr,
        isMarsMeasureLabel: true,
        _noMousePosition: true,
        attribute: {
          unit: this.options.unit,
          type: this.options.type
        }
      });

      let entityattr2 = LabelAttr.style2Entity(_labelAttr, {
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 50000), //纪舒敏 标签显示超过设定距离不显示
        show: false
      });
      entityattr2.pixelOffset = new Cesium.Cartesian2(0, 0);
      this.xLable = dataSource.entities.add({
        id: this.en.id + 'x_label',
        mark311: drawControl.id,
        label: entityattr2,
        isMarsMeasureLabel: true,
        _noMousePosition: true,
        attribute: {
          unit: this.options.unit,
          type: this.options.type
        }
      });

      this.hLable = dataSource.entities.add({
        id: this.en.id + 'h_label',
        mark311: drawControl.id,
        label: entityattr2,
        isMarsMeasureLabel: true,
        _noMousePosition: true,
        attribute: {
          unit: this.options.unit,
          type: this.options.type
        }
      });
      //纪舒敏 使用三角测量时关闭可编辑
      drawControl._hasEdit = false;
      //end
    },
    //绘制增加一个点后，显示该分段的长度
    showAddPointLength: function showAddPointLength(entity) {
      let lonlats = drawControl.getPositions(entity);
      if (lonlats.length === 4) {
        let mouseEndPosition = lonlats[3].clone();
        lonlats.pop();
        lonlats.pop();
        lonlats.pop();
        lonlats.push(mouseEndPosition);
      }

      if (lonlats.length === 2) {
        let zCartesian = this.getZHeightPosition(lonlats[0], lonlats[1]);
        let hDistance = this.getHDistance(lonlats[0], lonlats[1]);
        if (hDistance > 3.0) {
          lonlats.push(zCartesian);
          lonlats.push(lonlats[0]);
        }
      }

      this.showSuperHeight(lonlats);
    },
    //绘制中删除了最后一个点
    showRemoveLastPointLength: function showRemoveLastPointLength(e) {
      let lonlats = drawControl.getPositions(e.entity);
      if (lonlats.length === 2) {
        lonlats.pop();
        lonlats.pop();

        this.totalLable.label.show = false;
        this.hLable.label.show = false;
        this.xLable.label.show = false;
      }
    },
    //绘制过程移动中，动态显示长度信息
    showMoveDrawing: function showMoveDrawing(entity) {
      let lonlats = drawControl.getPositions(entity);
      if (lonlats.length === 4) {
        let mouseEndPosition = lonlats[3].clone();
        lonlats.pop();
        lonlats.pop();
        lonlats.pop();
        lonlats.push(mouseEndPosition);
      }

      if (lonlats.length === 2) {
        let zCartesian = this.getZHeightPosition(lonlats[0], lonlats[1]);
        let hDistance = this.getHDistance(lonlats[0], lonlats[1]);
        if (hDistance > 3.0) {
          lonlats.push(zCartesian);
          lonlats.push(lonlats[0]);
        }
      }
      this.showSuperHeight(lonlats);
    },
    //绘制完成后
    showDrawEnd: function showDrawEnd(entity) {
      entity._arrLables = [this.totalLable, this.hLable, this.xLable];

      this.totalLable = null;
      this.hLable = null;
      this.xLable = null;
      //纪舒敏 三角测量绘制结束的结果值
      let tstr = util.formatLength(
        entity._arrLables[0].attribute.value,
        this.options.unit
      );
      // let hstr = util.formatLength(entity._arrLables[1].attribute.value, this.options.unit)
      // let xstr = util.formatLength(entity._arrLables[2].attribute.value, this.options.unit)
      // let heightstr = tstr + "\n" + hstr + "\n" + xstr
      if (this.options.calbackresult) this.options.calbackresult(tstr, entity);
      //打开可编辑
      drawControl._hasEdit = true;
      //end
    },

    /**
     * 超级 高程测量
     * 由4个点形成的三角形（首尾点相同），计算该三角形三条线段的长度
     * @param {Array} positions 4个点形成的点数组
     */
    showSuperHeight: function showSuperHeight(positions) {
      let vLength; //垂直距离
      let hLength; //水平距离
      let lLength; //长度
      let height;
      if (positions.length === 4) {
        let midLPoint = Cesium.Cartesian3.midpoint(
          positions[0],
          positions[1],
          new Cesium.Cartesian3()
        );
        let midXPoint, midHPoint;
        let cartographic0 = Cesium.Cartographic.fromCartesian(positions[0]);
        let cartographic1 = Cesium.Cartographic.fromCartesian(positions[1]);
        let cartographic2 = Cesium.Cartographic.fromCartesian(positions[2]);
        let tempHeight = cartographic1.height - cartographic2.height;
        height = cartographic1.height - cartographic0.height;
        lLength = Cesium.Cartesian3.distance(positions[0], positions[1]);
        if (height > -1 && height < 1) {
          midHPoint = positions[1];
          this.updateSuperHeightLabel(
            this.totalLable,
            midHPoint,
            '高度差:',
            height
          );
          this.updateSuperHeightLabel(this.hLable, midLPoint, '', lLength);
          vLength = height; //纪舒敏 高度差显示
        } else {
          if (tempHeight > -0.1 && tempHeight < 0.1) {
            midXPoint = Cesium.Cartesian3.midpoint(
              positions[2],
              positions[1],
              new Cesium.Cartesian3()
            );
            midHPoint = Cesium.Cartesian3.midpoint(
              positions[2],
              positions[3],
              new Cesium.Cartesian3()
            );
            hLength = Cesium.Cartesian3.distance(positions[1], positions[2]);
            vLength = Cesium.Cartesian3.distance(positions[3], positions[2]);
          } else {
            midHPoint = Cesium.Cartesian3.midpoint(
              positions[2],
              positions[1],
              new Cesium.Cartesian3()
            );
            midXPoint = Cesium.Cartesian3.midpoint(
              positions[2],
              positions[3],
              new Cesium.Cartesian3()
            );
            hLength = Cesium.Cartesian3.distance(positions[3], positions[2]);
            vLength = Cesium.Cartesian3.distance(positions[1], positions[2]);
          }
          this.updateSuperHeightLabel(
            this.totalLable,
            midHPoint,
            '高度差:',
            vLength
          );
          this.updateSuperHeightLabel(this.xLable, midXPoint, '', hLength);
          this.updateSuperHeightLabel(this.hLable, midLPoint, '', lLength);
        }
      } else if (positions.length === 2) {
        vLength = Cesium.Cartesian3.distance(positions[1], positions[0]);
        let midHPoint = Cesium.Cartesian3.midpoint(
          positions[0],
          positions[1],
          new Cesium.Cartesian3()
        );
        if (this.xLable) {
          if (this.xLable.label.show) {
            this.xLable.label.show = false;
            this.hLable.label.show = false;
          }
        }
        this.updateSuperHeightLabel(
          this.totalLable,
          midHPoint,
          '高度差:',
          vLength
        );
      }

      let heightstr = util.formatLength(vLength, this.options.unit);
      if (this.options.calback) this.options.calback(heightstr, vLength);
    },
    /**
     * 超级 高程测量 显示标签
     * @param {Cesium.Label} currentLabel 显示标签
     * @param {Cesium.Cartesian3} postion 坐标位置
     * @param {String} type 类型("高度差"，"水平距离"，"长度")
     * @param {Object} value 值
     */
    updateSuperHeightLabel: function updateSuperHeightLabel(
      currentLabel,
      postion,
      type,
      value
    ) {
      if (currentLabel == null) return;

      currentLabel.position = postion;
      currentLabel.label.text =
        type + util.formatLength(value, this.options.unit);
      currentLabel.label.show = true;

      currentLabel.attribute.value = value;
      currentLabel.attribute.textEx = type;
    },

    /**
     * 带有高度差的两点，判断其直角点
     */
    getZHeightPosition: function getZHeightPosition(cartesian1, cartesian2) {
      let carto1 = Cesium.Cartographic.fromCartesian(cartesian1);
      let lng1 = Number(Cesium.Math.toDegrees(carto1.longitude));
      let lat1 = Number(Cesium.Math.toDegrees(carto1.latitude));
      let height1 = Number(carto1.height.toFixed(2));

      let carto2 = Cesium.Cartographic.fromCartesian(cartesian2);
      let lng2 = Number(Cesium.Math.toDegrees(carto2.longitude));
      let lat2 = Number(Cesium.Math.toDegrees(carto2.latitude));
      let height2 = Number(carto2.height.toFixed(2));

      if (height1 > height2)
        return Cesium.Cartesian3.fromDegrees(lng2, lat2, height1);
      else return Cesium.Cartesian3.fromDegrees(lng1, lat1, height2);
    },

    /**
     * 带有高度差的两点，计算两点间的水平距离
     */
    getHDistance: function getHDistance(cartesian1, cartesian2) {
      let zCartesian = this.getZHeightPosition(cartesian1, cartesian2);

      let carto1 = Cesium.Cartographic.fromCartesian(cartesian2);
      let cartoZ = Cesium.Cartographic.fromCartesian(zCartesian);

      let hDistance = Cesium.Cartesian3.distance(cartesian1, zCartesian);

      if (Math.abs(Number(cartoZ.height) - Number(carto1.height)) < 0.01) {
        hDistance = Cesium.Cartesian3.distance(cartesian2, zCartesian);
      }

      return hDistance;
    }
  };

  let workAngle = {
    options: null,
    totalLable: null, //角度label
    exLine: null, //辅助线
    //清除未完成的数据
    clearLastNoEnd: function clearLastNoEnd() {
      if (this.totalLable != null) dataSource.entities.remove(this.totalLable);
      this.totalLable = null;

      if (this.exLine != null) dataSource.entities.remove(this.exLine);
      this.exLine = null;
    },
    //开始绘制
    start: function start(options) {
      this.options = options;

      this.en = drawControl.startDraw({
        type: 'polyline',
        kzedit: true,
        config: {
          maxPointNum: 2
        },
        edittype: 'measureAngle',
        attr: {
          thisType: this.options.type
        },
        style: options.style || {
          lineType: 'arrow',
          color: '#FFFF00',
          width: 9,
          clampToGround: true,
          depthFailMaterial: new Cesium.Color.fromCssColorString(
            '#FFFF00'
          ).withAlpha(0.4)
        }
      });

      let entityattr = LabelAttr.style2Entity(_labelAttr, {
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 50000), //纪舒敏 标签显示超过设定距离不显示
        show: false
      });

      this.totalLable = dataSource.entities.add({
        id: this.en.id + 'label',
        mark311: drawControl.id,
        label: entityattr,
        isMarsMeasureLabel: true,
        _noMousePosition: true,
        attribute: {
          unit: this.options.unit,
          type: this.options.type
        }
      });
      //纪舒敏 使用角度测量时关闭可编辑
      drawControl._hasEdit = false;
      //end
    },
    //绘制增加一个点后，显示该分段的长度
    showAddPointLength: function showAddPointLength(entity) {
      this.showMoveDrawing(entity); //兼容手机端
    },
    //绘制中删除了最后一个点
    showRemoveLastPointLength: function showRemoveLastPointLength() {
      if (this.exLine) {
        this.exLine.polyline.show = false;
      }
      if (this.totalLable) this.totalLable.label.show = false;
    },
    //绘制过程移动中，动态显示长度信息
    showMoveDrawing: function showMoveDrawing(entity) {
      let positions = drawControl.getPositions(entity);
      if (positions.length < 2) {
        this.totalLable.label.show = false;
        return;
      }

      //求长度
      let len = Cesium.Cartesian3.distance(positions[0], positions[1]);

      //求方位角
      let bearing = util.getAngle(positions[0], positions[1]);

      //求参考点
      let new_position = getRotateCenterPoint(
        positions[0],
        positions[1],
        -bearing
      );
      this.updateExLine([positions[0], new_position]); //参考线

      //纪舒敏，角度测量，增加显示方位
      let direction_angle;
      if (0 < bearing && bearing < 45) {
        direction_angle = '正北偏东' + bearing + '°';
      } else if (45 < bearing && bearing < 90) {
        direction_angle = '正东偏北' + (90 - bearing) + '°';
      } else if (90 < bearing && bearing < 135) {
        direction_angle = '正东偏南' + (bearing - 90) + '°';
      } else if (135 < bearing && bearing < 180) {
        direction_angle = '正南偏东' + (180 - bearing) + '°';
      } else if (-180 < bearing && bearing < -135) {
        direction_angle = '正南偏西' + (bearing + 180) + '°';
      } else if (-135 < bearing && bearing < -90) {
        direction_angle = '正西偏南' + (-bearing - 90) + '°';
      } else if (-90 < bearing && bearing < -45) {
        direction_angle = '正西偏北' + (90 + bearing) + '°';
      } else if (-45 < bearing && bearing < 0) {
        direction_angle = '正北偏西' + -bearing + '°';
      } else {
        switch (bearing) {
          case 0:
            direction_angle = '正北';
            break;
          case 45:
            direction_angle = '正东北';
            break;
          case 90:
            direction_angle = '正东';
            break;
          case 135:
            direction_angle = '正东西';
            break;
          case 180:
            direction_angle = '正南';
            break;
          case -180:
            direction_angle = '正南';
            break;
          case -135:
            direction_angle = '正西南';
            break;
          case -90:
            direction_angle = '正西';
            break;
          case -45:
            direction_angle = '正西北';
            break;
        }
      }

      this.totalLable.position = positions[1];
      this.totalLable.label.text =
        '方位：' +
        direction_angle +
        '\n角度：' +
        bearing +
        '°\n距离：' +
        util.formatLength(len);
      //end

      this.totalLable.label.show = true;
      this.totalLable.attribute.value = direction_angle;
      this.totalLable.attribute.textEx = '角度:';
      if (this.options.calback) this.options.calback(bearing + '°', bearing);
    },
    updateExLine: function updateExLine(positions) {
      if (this.exLine) {
        this.exLine.polyline.show = true;
        this.exLine.polyline.positions.setValue(positions);
      } else {
        this.exLine = dataSource.entities.add({
          id: this.en.id + 'exLine',
          mark311: drawControl.id,
          polyline: {
            positions: positions,
            width: 3,
            clampToGround: true,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.RED
            })
          }
        });
      }
    },
    //绘制完成后
    showDrawEnd: function showDrawEnd(entity) {
      entity._totalLable = this.totalLable;
      entity._exline = this.exLine;
      this.totalLable = null;
      this.exLine = null;
      //纪舒敏 角度结果
      let direction_angle = entity._totalLable.attribute.value;
      if (this.options.calbackresult)
        this.options.calbackresult(direction_angle, entity);
      //打开可编辑
      drawControl._hasEdit = true;
      //end
    }
  };

  let workPoint = {
    options: null,
    totalLable: null, //角度label
    //清除未完成的数据
    clearLastNoEnd: function clearLastNoEnd() {
      // viewer.mars.popup.close()
      //应sgg要求， 坐标测量需要同时显示多个点。 所以不必close()
      /*  _popup.close()
             console.log("TODO close all popup") */
    },
    //开始绘制
    start: function start(options) {
      this.options = options;
      // _popup._isOnly = false
      let defaultStyle = Object.assign(
        {
          pixelSize: 10,
          color: '#3388ff',
          opacity: 1,
          outline: true,
          outlineColor: '#ffffff',
          outlineOpacity: 0.6,
          outlineWidth: 2,
          scaleByDistance: false,
          scaleByDistance_far: 1000000,
          scaleByDistance_farValue: 0.1,
          scaleByDistance_near: 1000,
          scaleByDistance_nearValue: 1,
          distanceDisplayCondition: false,
          distanceDisplayCondition_far: 10000,
          distanceDisplayCondition_near: 0,
          clampToGround: false,
          visibleDepth: true
        },
        options.style
      );
      drawControl.startDraw({
        type: 'point',
        edittype: 'measurePoint',
        attr: {
          thisType: this.options.type
        },
        style: defaultStyle
      });
    },
    //绘制完成后
    showDrawEnd: function showDrawEnd(entity) {
      let positions = drawControl.getPositions(entity)[0];
      let point = formatPosition(positions);
      let x2 = util.formatDegree(point.x);
      let y2 = util.formatDegree(point.y);

      // let html = '<div class="mars-popup-titile">\u5750\u6807\u6D4B\u91CF</div>\n                        <div class="mars-popup-content">\n                            <div><label>\u7ECF\u5EA6</label>' + point.x + ',&nbsp&nbsp' + x2 + '</div>\n                            <div><label>\u7EAC\u5EA6</label>' + point.y + ',&nbsp&nbsp&nbsp&nbsp' + y2 + '</div>\n                            <div><label>\u6D77\u62D4</label>' + point.z + '\u7C73</div>\n                        </div>'
      const html = `<div class="mars-popup-titile">\u5750\u6807\u6D4B\u91CF</div>
                <div class="mars-popup-content">
                    <div><label>\u7ECF\u5EA6</label>${x2}</div>
                    <div><label>\u7EAC\u5EA6</label>${y2}</div>
                    <div><label>\u6D77\u62D4</label>${point.z}\u7C73</div>
                </div>`;

      entity.popup = {
        html: html,
        anchor: [0, -15]
      };
      //杨伟 坐标测量更改为可多个点同时显示。
      _popup._isOnly = false;
      _popup.show(entity);

      entity.movepoint = true; //纪舒敏 增加属性用于判断该点为坐标选点，便于删除
      // this.options.calbackresult && this.options.calbackresult('<label>\u6D77\u62D4</label>' + point.z + '\u7C73', entity)
      this.options.calbackresult &&
        this.options.calbackresult(
          `<label>\u6D77\u62D4</label>${point.z}\u7C73`,
          entity
        );
    }
  };

  return {
    _popup: _popup, //杨伟 用于结束时删除popup
    dataSource: dataSource, //杨伟 暴露出，便于外面管理。
    clearMeasureById: clearMeasureById, //根据id删除要素
    measureLength: measureLength,
    measureHeight: measureHeight,
    measureArea: measureArea,
    measureAngle: measureAngle,
    paidStop: paidStop, //纪舒敏 增加paid绘制结束事件
    measureVolume: measureVolume,
    measureSection: measureSection,
    measurePoint: measurePoint,

    updateUnit: updateUnit,
    clearMeasure: clearMeasure,

    formatArea: util.formatArea,
    formatLength: util.formatLength,

    draw: function draw() {
      return drawControl;
    },
    endDraw: endDraw //外部控制，完成绘制，比如手机端无法双击结束
  };
};

export { Measure };
