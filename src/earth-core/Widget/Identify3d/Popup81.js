/* eslint-disable no-prototype-builtins */
import * as Cesium from 'cesium_shinegis_earth';
import * as L from 'leaflet';
import Jquery from 'jquery';
import * as Point from '../../Tool/Point2';
import * as Util from '../../Tool/Util1';
import { getCenterPosition } from '../../Draw/EntityAttr/AttrAll53';
import * as PolyLine from '../../Draw/EntityAttr/PolylineAttr15';
import * as Polygon from '../../Draw/EntityAttr/PolygonAttr14';
import { v4 as uuidv4 } from 'uuid';
import {
  getArcgisIdentifyTask,
  getGeoServerIdentifyTask,
  compatibleOldFormConfig,
  judgeZoomLimit
} from '../../../utils/tasks/common';
import {
  cartesian2Carto,
  cartesian2lonlat,
  lonlat2cartesian
} from '../../Tool/Util3';

//该类不仅仅是popup处理，是所有一些有关单击事件的统一处理入口（从效率考虑）。
class Popup {
  constructor(viewer, options) {
    this.viewer = viewer;
    this.options = options || {};
    this.handler = undefined;
    this._isOnly = true;
    this._enable = true;
    this.pickOpen = false;
    this._depthTest = true;
    this.viewerid = viewer._container.id;
    this.popupShow = true;
    this.objPopup = {};
    this._pickFeatureProperties = undefined;
    this._pickType = 0; //{ undefined :0 ,entity : 1,3dtile: 2,feature:3,primitive:4}
    this.identifyTasks3d = [];
    this.highlighted = {
      feature: undefined,
      originalColor: new Cesium.Color()
    };
    //this.defaultHighlightedClr = new Cesium.Color.fromCssColorString("#95e40c")
    this.defaultHighlightedClrCss = '#ff0000';
    //兼容历史接口
    this.getPopupForConfig = Util.getPopupForConfig;
    this.getPopup = Util.getPopup;
    this.currentEleId = undefined;
    this.result = undefined;
    this.subLayerResults = undefined;
    this.currentSubLayerResult = undefined;
    //添加弹出框
    let infoDiv = '<div id="' + this.viewerid + 'pupup-all-view" ></div>';
    let infoDivPop = '<div id="' + this.viewerid + 'mypupup-all-view" ></div>';
    Jquery('#' + this.viewerid).append(infoDiv);
    Jquery('#' + this.viewerid).append(infoDivPop);

    //移动事件
    this.viewer.scene.postRender.addEventListener(this.bind2scene, this);
    // 单个查询任务完成后触发
    this._identifyed = new Cesium.Event();
    // 查询任务全部完成后触发
    this._identifyedAll = new Cesium.Event();
  }

  //========== 方法 ==========
  get identifyed() {
    return this._identifyed;
  }

  get identifyedAll() {
    return this._identifyedAll;
  }

  activate() {
    if (!this.handler) {
      this.handler = new Cesium.ScreenSpaceEventHandler(
        this.viewer.scene.canvas
      );
    }
    this.handler.setInputAction((event) => {
      document.getElementById(this.viewer._container.id).style.cursor = 'wait';
      const queryId = uuidv4(); // 本次I查询ID
      const checkedLayers = this.viewer.shine.getCheckedLayers();
      const cartesian = Point.getCurrentMousePosition(
        this.viewer.scene,
        event.position
      );
      // 三维拾取到的objects
      let drillPickedObjects = [];
      try {
        drillPickedObjects = this.viewer.scene.drillPick(event.position);
      } catch (error) {
        console.error(error);
      }

      const identifyTasks = [];

      const pickedObjectsLayerIds = [];
      drillPickedObjects.forEach((pickedObject) => {
        const layerId =
          pickedObject?.tileset?.id ||
          pickedObject?.id?.entityCollection?.owner?.name;
        if (layerId) {
          pickedObjectsLayerIds.push(layerId);
        }
      });
      // 根据drillPickedObjects中的顺序重新排列三维图层的顺序
      const threeLayers = checkedLayers
        .filter(
          (ele) =>
            ele.serverOrigin == '3d_server' ||
            ele.type == 'geoJson' ||
            ele.type == 'feature' ||
            ele.type == 'feature-pbf' ||
            ele.type == 'geoserver-wfs'
        )
        .filter((ele) => pickedObjectsLayerIds.includes(ele.id))
        .sort((a, b) => {
          const indexA = drillPickedObjects.findIndex((ele) => {
            let eleId =
              ele?.tileset?.id || ele?.id?.entityCollection?.owner?.name;
            eleId === a.id;
          });
          const indexB = drillPickedObjects.findIndex((ele) => {
            let eleId =
              ele?.tileset?.id || ele?.id?.entityCollection?.owner?.name;
            eleId === b.id;
          });
          return indexA - indexB;
        });
      for (let i = 0; i < threeLayers.length; i++) {
        const layerInfo = compatibleOldFormConfig(threeLayers[i]);
        const task = this.get3dServerIdentifyTask(
          layerInfo,
          drillPickedObjects,
          event.position
        );
        if (task) {
          identifyTasks.push(task);
        }
      }
      const position = cartesian2lonlat(cartesian);
      const earthResolution = this.getEarthResolution(cartesian);

      for (let i = 0, l = checkedLayers.length; i < l; i++) {
        const layerInfo = compatibleOldFormConfig(checkedLayers[i]);
        if (
          layerInfo.serverOrigin == 'arcgis' &&
          layerInfo.type != 'feature' &&
          layerInfo.type != 'feature-pbf'
        ) {
          const { rectangle, tileWidth, tileHeight } =
            this.getArcgisIdentifyparams(layerInfo.id, cartesian);
          const task = getArcgisIdentifyTask(
            layerInfo,
            position,
            {
              viewer: this.viewer
            },
            {
              cartesian,
              rectangle,
              tileWidth,
              tileHeight
            }
          );
          if (task) {
            identifyTasks.push(task);
          }
        } else if (
          layerInfo.serverOrigin == 'geoserver' &&
          layerInfo.type != 'geoserver-wfs'
        ) {
          const task = getGeoServerIdentifyTask(
            layerInfo,
            position,
            {
              viewer: this.viewer
            },
            {
              cartesian,
              earthResolution
            }
          );
          if (task) {
            identifyTasks.push(task);
          }
        }
      }

      if (identifyTasks.length > 0) {
        this.taskHandle(identifyTasks, queryId, position);
      } else {
        document.getElementById(this.viewer._container.id).style.cursor =
          'auto';
        this._identifyed.raiseEvent([], position, queryId);
        this._identifyedAll.raiseEvent([], position, queryId);
      }
    }, Cesium.defaultValue(this.options.popupEventType, Cesium.ScreenSpaceEventType.LEFT_CLICK));
  }

  /**
   * 执行所有查询任务及结果处理
   * @param {*} identifyTasks
   * @param {*} queryId
   * @param {*} position
   */
  taskHandle(identifyTasks, queryId, position) {
    let finishCount = 0;
    const result = [];
    for (let task of identifyTasks) {
      task.id = queryId;
      task
        .then((element) => {
          document.getElementById(this.viewer._container.id).style.cursor =
            'auto';
          finishCount++;
          if (task.id !== queryId) {
            return;
          }
          this._identifyed.raiseEvent(element, position, queryId);
          // 只保存查询结果不为空的结果
          if (element.results.length) {
            result.push(element);
          }
          if (finishCount === identifyTasks.length) {
            this._identifyedAll.raiseEvent(result, position, queryId);
          }
        })
        .catch((error) => {
          finishCount++;
          if (finishCount === identifyTasks.length) {
            this._identifyedAll.raiseEvent(result, position, queryId);
          }
          document.getElementById(this.viewer._container.id).style.cursor =
            'auto';
          console.error(error);
        });
    }
  }

  /**
   * 获取三维图层查询任务
   * @param {*} layerInfo 图层信息
   * @param {*} drillPickedObjects drillPick对象
   * @param {*} position
   * @returns
   */
  get3dServerIdentifyTask(layerInfo, drillPickedObjects, position) {
    const identifyField = layerInfo.identifyField?.filter(
      (ele) => ele.isOpenSearch !== false
    );
    if (
      layerInfo.group === '2' &&
      identifyField?.length > 0 &&
      judgeZoomLimit({ viewer: this.viewer }, layerInfo.identifyZoom)
    ) {
      let allFeatures = [];
      const currentLayerDrillPickedObjects = [];
      drillPickedObjects.forEach((pickedObject) => {
        const layerId =
          pickedObject?.tileset?.id ||
          pickedObject?.id?.entityCollection?.owner?.name;
        if (layerId === layerInfo.id) {
          currentLayerDrillPickedObjects.push(pickedObject);
        }
      });
      if (currentLayerDrillPickedObjects.length > 0) {
        for (let i = 0; i < identifyField.length; i++) {
          this.currentSubLayerResult = [];
          const features = [];
          let myIdentifyField = identifyField[i];
          if (myIdentifyField.switchIsOpen == true) {
            // currentLayerDrillPickedObjects.reverse()
            for (let i = 0; i < currentLayerDrillPickedObjects.length; i++) {
              let myPickedObject = currentLayerDrillPickedObjects[i];
              if (myPickedObject.tileset.label == myIdentifyField.name) {
                const feature = this.pick3dObjectFeatures(
                  position,
                  myPickedObject,
                  layerInfo,
                  myIdentifyField
                );
                features.push(feature);
              }
            }
          } else {
            const defaultPickedObject = currentLayerDrillPickedObjects[0];
            const feature = this.pick3dObjectFeatures(
              position,
              defaultPickedObject,
              layerInfo,
              myIdentifyField
            );
            features.push(feature);
          }
          allFeatures = allFeatures.concat(features);
        }
      }

      const result = {
        type: layerInfo.serverOrigin,
        layerLabel: layerInfo.label,
        layerId: layerInfo.id,
        isPop: layerInfo.isPop,
        layerTag: layerInfo.layerTag,
        results: allFeatures
      };

      return Promise.resolve(result);
    }
  }

  /**
   * 获取三维查询结果对象
   * @param {*} position
   * @param {*} pickedObject
   * @param {*} queryLayer3d
   * @param {*} myIdentifyField
   * @returns
   */
  pick3dObjectFeatures(position, pickedObject, queryLayer3d, myIdentifyField) {
    //普通entity对象 && viewer.scene.pickPositionSupported
    if (
      Cesium.defined(pickedObject) &&
      Cesium.defined(pickedObject.id) &&
      pickedObject.id instanceof Cesium.Entity
    ) {
      let entity = pickedObject.id;
      let geoJsonData = entity.geojsondata;
      pickedObject._pickType = 1;
      //popup
      const cfg = { ...queryLayer3d, popup: myIdentifyField.popup3d };
      // if (Cesium.defined(entity.popup)) {
      let myCartesian;
      if (entity.billboard || entity.label || entity.point || entity.model) {
        //对点状数据做特殊处理，
        myCartesian = entity.position;
      } else {
        myCartesian = Point.getCurrentMousePosition(
          this.viewer.scene,
          position
        );
      }

      if (!myCartesian) {
        //外部直接传入entity调用show时，可以不传入坐标，自动取值
        myCartesian = getCenterPosition(entity);
      }
      //对点状贴地数据做特殊处理，
      let graphic =
        entity.billboard || entity.label || entity.point || entity.model;
      if (graphic && graphic.heightReference) {
        myCartesian = this.getPositionValue(myCartesian);

        if (
          graphic.heightReference._value ===
          Cesium.HeightReference.CLAMP_TO_GROUND
        ) {
          //贴地点，重新计算高度
          myCartesian = Point.updateHeightForClampToGround(
            this.viewer,
            myCartesian
          );
        } else if (
          graphic.heightReference._value ===
          Cesium.HeightReference.RELATIVE_TO_GROUND
        ) {
          myCartesian = Point.updateHeightForClampToGround(
            this.viewer,
            myCartesian,
            true
          );
        }
      }
      /* let myAttr; */
      let attr = Util.getAttrVal(entity.properties);
      if (Util.isString(attr)) {
        /*   myAttr = attr; */
      } else {
        /* myAttr = */ Util.getPopupForConfig(cfg, attr);
      }
      return {
        attributes: attr,
        identifyField: myIdentifyField,
        pickedObject: pickedObject,
        cartesian: myCartesian,
        position: cartesian2lonlat(myCartesian),
        geometry: JSON.stringify(geoJsonData)
      };
    }
    //单体化3dtiles数据的处理(如：BIM的构件，城市白膜建筑)
    else if (
      Cesium.defined(pickedObject) &&
      Cesium.defined(pickedObject.tileset) &&
      Cesium.defined(pickedObject.getProperty)
    ) {
      //取属性
      pickedObject._pickType = 2;
      let attr = {};
      let names = pickedObject.getPropertyIds();
      for (let i = 0; i < names.length; i++) {
        let name = names[i];
        if (!pickedObject.hasProperty(name)) continue;

        let val = pickedObject.getProperty(name);
        if (val == null) continue;
        attr[name] = val;
      }

      let cfg = pickedObject.tileset._config;
      if (cfg) {
        cfg.popup = myIdentifyField.popup3d;
        if (Cesium.defined(cfg.popup)) {
          let cartesian = Point.getCurrentMousePosition(
            this.viewer.scene,
            position
          );
          /* let item = {
            id: 'popOfType2',
            popup: {
              html: Util.getPopupForConfig(cfg, attr),
              anchor: cfg.popupAnchor || [0, -15]
            }
          }; */

          return {
            attributes: attr,
            identifyField: myIdentifyField,
            cartesian: cartesian,
            pickedObject: pickedObject,
            position: cartesian2lonlat(cartesian)
          };

          // this.currentSubLayerResult.push(queryResult3d)

          // this.showQuery(item, cartesian, position, queryLayer3d)
          // this.currentEleId = this.getPopupId(item)
          // isFindPopup = true
        }

        // this.highlighPick(pickedObject, myIdentifyField.pickfeaturestyle)

        // //加统一的click处理
        // if (cfg.click && typeof cfg.click === 'function') {
        //     cfg.click({
        //         attr: attr,
        //         feature: pickedObject
        //     }, position)
        // }
      }
    }
    //primitive对象
    else if (pickedObject && Cesium.defined(pickedObject.primitive)) {
      let primitive = pickedObject.primitive;
      this._pickType = 3;

      //popup
      if (Cesium.defined(primitive.popup)) {
        /* let cartesian = Point.getCurrentMousePosition(
          this.viewer.scene,
          position
        ); */

        // this.showQuery(primitive, cartesian, position, queryLayer3d)
        this.currentEleId = this.getPopupId(primitive);
        //isFindPopup = true
      }

      //加统一的click处理
      if (primitive.click && typeof primitive.click === 'function') {
        primitive.click(primitive, position);
      }
    }
  }

  getEarthResolution(cartesian) {
    let pixelDistance = 0.1;
    try {
      const viewer = this.viewer;
      const cartographic = cartesian2Carto(cartesian);
      let position = lonlat2cartesian([
        Cesium.Math.toDegrees(cartographic.longitude),
        Cesium.Math.toDegrees(cartographic.latitude),
        0
      ]);
      let scenePosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
        viewer.scene,
        position
      );
      let left = viewer.scene.camera.getPickRay(
        new Cesium.Cartesian2(scenePosition.x, scenePosition.y)
      );
      let right = viewer.scene.camera.getPickRay(
        new Cesium.Cartesian2(scenePosition.x + 1, scenePosition.y)
      );
      const globe = viewer.scene.globe;
      let leftPosition = globe.pick(left, viewer.scene);
      let rightPosition = globe.pick(right, viewer.scene);
      let leftCartographic =
        globe.ellipsoid.cartesianToCartographic(leftPosition);
      let rightCartographic =
        globe.ellipsoid.cartesianToCartographic(rightPosition);
      const geodesic = new Cesium.EllipsoidGeodesic();
      geodesic.setEndPoints(leftCartographic, rightCartographic);
      pixelDistance = geodesic.surfaceDistance;
    } catch (error) {
      console.error(error);
    }
    return pixelDistance;
  }

  getArcgisIdentifyparams(layerId, cartesian) {
    const imageryProvider = this.viewer.shine.getLayer(layerId, 'id').layer
      .imageryProvider;
    let xy = new Cesium.Cartesian2();
    const alti = this.viewer.camera.positionCartographic.height;
    const level = this.viewer.shine.getLevel(alti);
    xy = imageryProvider.tilingScheme.positionToTileXY(
      cartesian2Carto(cartesian),
      level,
      xy
    );
    const rectangle = imageryProvider.tilingScheme.tileXYToNativeRectangle(
      xy.x,
      xy.y,
      level
    );

    return {
      rectangle,
      tileWidth: imageryProvider.tileWidth,
      tileHeight: imageryProvider.tileHeight
    };
  }

  removeFeature() {
    if (this.lastShowFeature == null) return;
    this.viewer.dataSources.remove(this.lastShowFeature);
    this.lastShowFeature = null;
  }

  showFeature(item, options) {
    let that = this;
    this.removeFeature();
    let feature = item;
    if (item.geometryType && item.geometryType.indexOf('esri') !== -1) {
      //arcgis图层时
      if (JSON.stringify(item.geometry).length < 200000) {
        ///临时屏蔽数据范围限制
        //屏蔽大数据，页面卡顿
        //let L = window.shineGE.L || window.L
        if (L.esri) {
          feature = L.esri.Util.arcgisToGeoJSON(item.geometry);
        } else {
          console.warn('需要引入 mars-esri 插件解析arcgis标准的json数据！');
          return;
        }
      } else {
        console.warn('矢量面范围和顶点过多，不显示！');
        return;
      }
    } else if (item.geometry && item.geometry.type) {
      //let L = window.shineGE.L || window.L
      if (L) {
        //处理数据里面的坐标为4326
        let geojson = L.geoJSON(item.geometry, {
          coordsToLatLng: function coordsToLatLng(coords) {
            if (coords[0] > 180 || coords[0] < -180) {
              return L.CRS.EPSG3857.unproject(L.point(coords[0], coords[1]));
            }
            return new L.LatLng(coords[1], coords[0], coords[2]);
          }
        });
        feature = geojson.toGeoJSON();
      }
    }

    if (feature == null) return;

    //options = options || {}
    let mycolor = {};
    if (options.strokeWidth) {
      mycolor = options;
    } else {
      mycolor.strokeWidth = options.outlineWidth;
      mycolor.fillAlpha = options.opacity / 100;
      mycolor.fill = options.color;
      mycolor.stroke = options.outlineColor;
    }
    let dataSource = Cesium.GeoJsonDataSource.load(feature, {
      clampToGround: true,
      stroke: new Cesium.Color.fromCssColorString(
        mycolor.stroke || this.defaultHighlightedClrCss
      ),
      strokeWidth: mycolor.strokeWidth || 3,
      fill: new Cesium.Color.fromCssColorString(
        mycolor.fill || this.defaultHighlightedClrCss
      ).withAlpha(mycolor.fillAlpha || 0.7)
    });
    dataSource
      .then(function (dataSource) {
        const entities = dataSource.entities.values;
        if (mycolor.strokeWidth > 1) {
          entities.forEach((entity) => {
            entity.polygon.outline = false;

            const newopt = {
              color: mycolor.stroke,
              width: mycolor.strokeWidth,
              opacity: options.opacity,
              lineType: 'solid',
              clampToGround: true,
              classificationType: Cesium.ClassificationType.BOTH,
              outline: false
            };
            const polyline = PolyLine.style2Entity(newopt);
            polyline.positions = Polygon.getPositions(entity);
            entity.polyline = polyline;
          });
        }
        that.viewer.dataSources.add(dataSource);
        that.lastShowFeature = dataSource;

        if (Cesium.defined(options.showTime)) {
          //定时自动关闭
          setTimeout(function () {
            that.removeFeature();
          }, options.showTime);
        }
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  unHighlighPick() {
    if (Cesium.defined(this.highlighted.feature)) {
      let entity = this.highlighted.feature.id;
      try {
        if (this.highlighted.feature._pickType === 2) {
          this.highlighted.feature.color = this.highlighted.originalColor;
        } else {
          if (entity.polygon) {
            this.highlighted.feature.id.polygon.material =
              this.highlighted.originalColor;
          } else if (entity.polyline) {
            this.highlighted.feature.id.polyline.material =
              this.highlighted.originalColor;
          } else if (entity.billboard) {
            this.highlighted.feature.id.billboard.color._value =
              this.highlighted.originalColor;
          } else if (entity.label) {
            this.highlighted.feature.id.label.color._value =
              this.highlighted.originalColor;
          } else if (entity.point) {
            this.highlighted.feature.id.point.color._value =
              this.highlighted.originalColor;
          } else if (entity.model) {
            this.highlighted.feature.id.model.color._value =
              this.highlighted.originalColor;
          }
        }
      } catch (error) {
        console.error(error);
      }
      this.highlighted.feature = undefined;
    }
  }

  highlighPick(pickedFeature, color) {
    this.unHighlighPick();
    let pickObj = pickedFeature?.pickedObject;
    let pickObjColor = pickedFeature?.identifyField?.pickfeaturestyle?.color;
    const entity = pickObj.id;
    let tempColor;
    if (entity) {
      const graphic =
        entity.polygon ||
        entity.polyline ||
        entity.billboard ||
        entity.label ||
        entity.point ||
        entity.model;
      tempColor = graphic?.material?.color || graphic.color;
    }
    if (pickObj) {
      if (pickObj._pickType == 1) {
        this.highlighted.feature = pickObj;
        Cesium.Color.clone(tempColor._value, this.highlighted.originalColor);
        if (pickObjColor && typeof pickObjColor === 'string') {
          if (entity.polygon) {
            pickObj.id.polygon.material =
              new Cesium.Color.fromCssColorString(pickObjColor) ||
              new Cesium.Color.fromCssColorString(
                this.defaultHighlightedClrCss
              );
          } else if (entity.polyline) {
            pickObj.id.polyline.material =
              new Cesium.Color.fromCssColorString(pickObjColor) ||
              new Cesium.Color.fromCssColorString(
                this.defaultHighlightedClrCss
              );
          }
        } else if (entity.billboard) {
          pickObj.id.billboard.color =
            new Cesium.Color.fromCssColorString(pickObjColor) ||
            new Cesium.Color.fromCssColorString(this.defaultHighlightedClrCss);
        } else if (entity.label) {
          pickObj.id.label.color =
            new Cesium.Color.fromCssColorString(pickObjColor) ||
            new Cesium.Color.fromCssColorString(this.defaultHighlightedClrCss);
        } else if (entity.point) {
          pickObj.id.point.color =
            new Cesium.Color.fromCssColorString(pickObjColor) ||
            new Cesium.Color.fromCssColorString(this.defaultHighlightedClrCss);
        } else if (entity.model) {
          pickObj.id.model.color =
            new Cesium.Color.fromCssColorString(pickObjColor) ||
            new Cesium.Color.fromCssColorString(this.defaultHighlightedClrCss);
        }
      } else if (pickObj._pickType == 2) {
        this.highlighted.feature = pickObj;
        Cesium.Color.clone(pickObj.color, this.highlighted.originalColor);
        //let newColor = pickedFeature.identifyField.pickfeaturestyle.color
        pickObj.color = new Cesium.Color.fromCssColorString(pickObjColor);
      }
    } else {
      this.highlighted.feature = pickedFeature;
      Cesium.Color.clone(pickedFeature.color, this.highlighted.originalColor);
      if (color) {
        let mycolor = {};
        mycolor.strokeWidth = color.outlineWidth;
        mycolor.fillAlpha = color.opacity / 100;
        mycolor.fill = color.color;
        mycolor.stroke = color.outlineColor;
        if (pickedFeature.id.polygon) {
          pickedFeature.id.polygon.material =
            new Cesium.Color.fromCssColorString(mycolor.fill) ||
            new Cesium.Color.fromCssColorString(this.defaultHighlightedClrCss);
        } else if (pickedFeature.id.polyline) {
          pickedFeature.id.polyline.material =
            new Cesium.Color.fromCssColorString(mycolor.fill) ||
            new Cesium.Color.fromCssColorString(this.defaultHighlightedClrCss);
        } else if (pickedFeature.billboard) {
          pickedFeature.id.billboard.color =
            new Cesium.Color.fromCssColorString(mycolor.fill) ||
            new Cesium.Color.fromCssColorString(this.defaultHighlightedClrCss);
        } else if (pickedFeature.label) {
          pickedFeature.id.label.color =
            new Cesium.Color.fromCssColorString(mycolor.fill) ||
            new Cesium.Color.fromCssColorString(this.defaultHighlightedClrCss);
        } else if (pickedFeature.point) {
          pickedFeature.id.point.color =
            new Cesium.Color.fromCssColorString(mycolor.fill) ||
            new Cesium.Color.fromCssColorString(this.defaultHighlightedClrCss);
        } else if (entity.model) {
          pickedFeature.id.model.color =
            new Cesium.Color.fromCssColorString(mycolor.fill) ||
            new Cesium.Color.fromCssColorString(this.defaultHighlightedClrCss);
        }
      }
    }
  }

  show(entity, cartesian, viewPoint) {
    if (entity == null || entity.popup == null) return;

    if (!cartesian) {
      //外部直接传入entity调用show时，可以不传入坐标，自动取值
      cartesian = getCenterPosition(entity);
    }

    //对点状贴地数据做特殊处理，
    let graphic =
      entity.billboard || entity.label || entity.point || entity.model;
    if (graphic && graphic.heightReference) {
      cartesian = this.getPositionValue(cartesian);

      if (
        graphic.heightReference._value ===
        Cesium.HeightReference.CLAMP_TO_GROUND
      ) {
        //贴地点，重新计算高度
        cartesian = Point.updateHeightForClampToGround(this.viewer, cartesian);
      } else if (
        graphic.heightReference._value ===
        Cesium.HeightReference.RELATIVE_TO_GROUND
      ) {
        cartesian = Point.updateHeightForClampToGround(
          this.viewer,
          cartesian,
          true
        );
      }
    }

    let eleId = this.getPopupId(entity);
    this.close(eleId);

    this.objPopup[eleId] = {
      id: entity.id,
      popup: entity.popup,
      entity: entity,
      cartesian: cartesian,
      viewPoint: viewPoint
    };

    //显示内容
    let inhtml;
    if (typeof entity.popup === 'object') inhtml = entity.popup.html;
    else inhtml = entity.popup;
    if (!inhtml) return;

    let that = this;
    if (typeof inhtml === 'function') {
      //回调方法
      inhtml = inhtml(entity, cartesian, function (inhtml) {
        that._showHtml(inhtml, eleId, entity, cartesian, viewPoint);
      });
    }

    if (!inhtml) return;

    this._showHtml(inhtml, eleId, entity, cartesian, viewPoint);
  }

  showQuery(entity, cartesian, viewPoint, options) {
    if (entity == null || entity.popup == null) return;

    if (!cartesian) {
      //外部直接传入entity调用show时，可以不传入坐标，自动取值
      cartesian = getCenterPosition(entity);
    }
    //对点状贴地数据做特殊处理，
    let graphic =
      entity.billboard || entity.label || entity.point || entity.model;
    if (graphic && graphic.heightReference) {
      cartesian = this.getPositionValue(cartesian);

      if (
        graphic.heightReference._value ===
        Cesium.HeightReference.CLAMP_TO_GROUND
      ) {
        //贴地点，重新计算高度
        cartesian = Point.updateHeightForClampToGround(this.viewer, cartesian);
      } else if (
        graphic.heightReference._value ===
        Cesium.HeightReference.RELATIVE_TO_GROUND
      ) {
        cartesian = Point.updateHeightForClampToGround(
          this.viewer,
          cartesian,
          true
        );
      }
    }

    // let eleId = this.getPopupId(entity)
    let eleId = 'myTestPopup';
    //  this.close(eleId)
    /*        let queryResult3d

                if (result3d) {
                    queryResult3d = {eleId: eleId, item: result3d, cartesian: cartesian}
                } else {
                    queryResult3d = {eleId: eleId, item: entity, cartesian: cartesian}
                }
                this.currentSubLayerResult.push(queryResult3d)*/
    // this.result && this.result.push(queryResult3d)
    if (this.objPopup)
      this.objPopup[eleId] = {
        id: entity.id,
        popup: entity.popup,
        entity: entity,
        cartesian: cartesian,
        viewPoint: viewPoint
      };

    //显示内容
    let inhtml;
    if (typeof entity.popup === 'object') inhtml = entity.popup.html;
    else inhtml = entity.popup;
    if (!inhtml) return;

    // let that = this;
    if (typeof inhtml === 'function') {
      //回调方法
      inhtml = inhtml(entity, cartesian, function (/* inhtml */) {
        //that._showHtmlQuery(inhtml, eleId, entity, cartesian, viewPoint)
      });
    }

    if (!inhtml) return;
    if (options.isPop && options.isPop == true) {
      this._showHtmlQuery(inhtml, eleId, entity, cartesian, viewPoint);
    }
  }

  _showHtml(inhtml, eleId, entity, cartesian, viewPoint) {
    Jquery('#' + this.viewerid + 'pupup-all-view').append(
      '<div id="' +
        eleId +
        '" class="cesium-popup">' +
        '            <a id="' +
        eleId +
        '-popup-close" data-id="' +
        eleId +
        '" class="cesium-popup-close-button cesium-popup-color" >×</a>' +
        '            <div class="cesium-popup-content-wrapper cesium-popup-background">' +
        '                <div class="cesium-popup-content cesium-popup-color">' +
        inhtml +
        '</div>' +
        '            </div>' +
        '            <div class="cesium-popup-tip-container"><div class="cesium-popup-tip cesium-popup-background"></div></div>' +
        '        </div>'
    );

    let that = this;
    Jquery('#' + eleId + '-popup-close').click(function () {
      let eleId = Jquery(this).attr('data-id');
      that.close(eleId, true);
      try {
        entity.entityCollection.remove(entity);
      } catch (e) {
        //yangw sgg里需要点击'x',同时移除地图上的点。
        console.error('');
      }
    });

    //计算显示位置
    let result = this.updateViewPoint(
      eleId,
      cartesian,
      entity.popup,
      viewPoint
    );
    if (!result && this._depthTest) {
      this.close(eleId);
    }
  }

  _showHtmlQuery(inhtml, eleId, entity, cartesian, viewPoint) {
    let myNode = document.getElementById(eleId);
    if (!myNode) {
      Jquery('#' + this.viewerid + 'mypupup-all-view').append(
        `<div id="${eleId}" class="cesium-popup"><a id="${eleId}-popup-close" data-id="${eleId}" style="position: absolute;top: 22px;right: 6px;font-size: 17px;color: #e2e2e2;z-index: 9999"><i class="el-icon-close"></i></a><div class="cesium-popup-tip-container"></div></div>`
      );
      let that = this;

      Jquery('#' + eleId + '-popup-close').click(function () {
        let eleId = Jquery(this).attr('data-id');
        that.closeQuery(eleId, true);
        //yangw sgg里需要点击'x',同时移除地图上的点。
        entity &&
          entity.entityCollection &&
          entity.entityCollection.remove(entity);
      });
    } else {
      Jquery('#' + eleId).show();
    }

    //计算显示位置
    let result = this.updateViewPoint(
      eleId,
      cartesian,
      entity.popup,
      viewPoint
    );
    if (!result && this._depthTest) {
      this.closeQuery(eleId);
    }
  }

  getPositionValue(position) {
    if (!position) return position;

    let _position;
    if (position instanceof Cesium.Cartesian3) {
      _position = position;
    } else if (typeof position.getValue == 'function') {
      _position = position.getValue(this.viewer.clock.currentTime);
    } else if (
      position._value &&
      position._value instanceof Cesium.Cartesian3
    ) {
      _position = position._value;
    }
    return _position;
  }

  getPickType() {
    if (!this._pickType) return this._pickType;
    return this._pickType;
  }

  getPickFeaturePropertiese() {
    if (!this._pickFeatureProperties) return undefined;
    return this._pickFeatureProperties;
  }

  updateViewPoint(eleId, position, popup, point) {
    let _position = this.getPositionValue(position);
    if (!Cesium.defined(_position)) {
      return false;
    }

    let newpoint = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
      this.viewer.scene,
      _position
    );
    if (Cesium.defined(newpoint)) {
      point = newpoint;

      if (this.objPopup[eleId]) this.objPopup[eleId].viewPoint = newpoint;
    }

    if (!Cesium.defined(point)) {
      console.warn('wgs84ToWindowCoordinates无法转换为屏幕坐标');
      return false;
    }

    //判断是否在球的背面
    let scene = this.viewer.scene;
    if (this._depthTest && scene.mode === Cesium.SceneMode.SCENE3D) {
      //三维模式下
      let pickRay = scene.camera.getPickRay(point);
      let cartesianNew = scene.globe.pick(pickRay, scene);

      if (cartesianNew) {
        let len = Cesium.Cartesian3.distance(_position, cartesianNew);
        if (len > 1000 * 1000) return false;
      }
    }
    //判断是否在球的背面

    //更新html ，实时更新
    if (
      (typeof popup === 'undefined' ? 'undefined' : typeof popup) ===
        'object' &&
      popup.timeRender &&
      popup.html &&
      typeof popup.html === 'function'
    ) {
      let inhtml = popup.html(
        this.objPopup[eleId] && this.objPopup[eleId].entity,
        _position
      );
      Jquery('#' + eleId + ' .cesium-popup-content').html(inhtml);
    }

    let $view = Jquery('#' + eleId);
    let x = point.x - $view.width() / 2;
    let y = point.y - $view.height();

    if (
      popup &&
      (typeof popup === 'undefined' ? 'undefined' : typeof popup) ===
        'object' &&
      popup.anchor
    ) {
      x += popup.anchor[0];
      y += popup.anchor[1];
    }
    $view.css('transform', 'translate3d(' + x + 'px,' + y + 'px, 0)');

    return true;
  }

  bind2scene() {
    for (let i in this.objPopup) {
      // console.log('bind2scenebind2scene')
      if (this.objPopup.hasOwnProperty(i)) {
        let item = this.objPopup[i];
        let entityIsOriginal = item.entity instanceof Cesium.Entity;
        if (
          entityIsOriginal &&
          !item.entity.entityCollection.contains(item.entity)
        ) {
          item.entity = null;
          this.closeQuery(i);
          continue;
        }
        let result = this.updateViewPoint(
          i,
          item.cartesian,
          item.popup,
          item.viewPoint
        );
        if (!result && this._depthTest) {
          this.closeQuery(i);
        }
      }
    }
  }

  getPopupId(entity) {
    return (
      this.viewerid +
      'popup_' +
      ((entity.id || '') + '').replace(new RegExp('[^0-9a-zA-Z_]', 'gm'), '_')
    );
  }

  close(eleId, removFea) {
    if (!this._isOnly && eleId) {
      if (
        (typeof eleId === 'undefined' ? 'undefined' : typeof eleId) === 'object'
      )
        //传入参数是eneity对象
        eleId = this.getPopupId(eleId);

      for (let i in this.objPopup) {
        if (this.objPopup.hasOwnProperty(i)) {
          if (eleId === this.objPopup[i].id || eleId === i) {
            Jquery('#' + i).remove();
            delete this.objPopup[i];
            break;
          }
        }
      }
    } else {
      Jquery('#' + this.viewerid + 'pupup-all-view').empty();
      this.objPopup = {};
    }

    if (removFea) {
      this.removeFeature();
      this.unHighlighPick();
    }
  }

  closeQuery(eleId, removFea) {
    if (!this._isOnly && eleId) {
      if (
        (typeof eleId === 'undefined' ? 'undefined' : typeof eleId) === 'object'
      )
        //传入参数是eneity对象
        eleId = this.getPopupId(eleId);

      for (let i in this.objPopup) {
        if (this.objPopup.hasOwnProperty(i)) {
          if (eleId === this.objPopup[i].id || eleId === i) {
            Jquery('#' + i).remove();
            delete this.objPopup[i];
            break;
          }
        }
      }
    } else if (eleId) {
      Jquery('#' + eleId).hide();
    } else {
      //Jquery('#' + this.viewerid + 'pupup-all-view').hide()
      Jquery('#' + this.viewerid + 'pupup-all-view').empty();
      this.objPopup = {};
    }

    if (removFea) {
      this.removeFeature();
      this.unHighlighPick();
    }
  }

  destroy() {
    this.close();
    this.viewer.scene.postRender.removeEventListener(this.bind2scene, this);

    this.handler.destroy();
    this.handler = null;

    Jquery('#' + this.viewerid + 'pupup-all-view').remove();
  }

  get isOnly() {
    return this._isOnly;
  }

  set isOnly(val) {
    this._isOnly = val;
  }

  get enable() {
    return this._enable;
  }

  set enable(value) {
    this._enable = value;
    if (!value) {
      this.close();
    }
  }

  //是否打开深度判断（true时判断是否在球背面）
  get depthTest() {
    return this._depthTest;
  }

  set depthTest(value) {
    this._depthTest = value;
  }
}

export { Popup };
