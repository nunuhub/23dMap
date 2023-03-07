/*
 * @Author: liujh
 * @Date: 2020/10/15 17:20
 * @Description:
 */
/* 98 */
/***/
(function (module, exports, __webpack_require__) {

    "use strict";


    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.FlowEcharts = undefined;

    var _createClass = function () {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }

        return function (Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }(); //参考了开源：https://github.com/sharpzao/EchartsCesium
    //当前版本由火星科技开发 http://marsgis.cn


    // 引入 ECharts 主模块


    var _cesium = __webpack_require__(0);

    var Cesium = _interopRequireWildcard(_cesium);

    var _echarts = __webpack_require__(99);

    var _echarts2 = _interopRequireDefault(_echarts);

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : {
            default: obj
        };
    }

    function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
            return obj;
        } else {
            var newObj = {};
            if (obj != null) {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
                }
            }
            newObj.default = obj;
            return newObj;
        }
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    var backAngle = Cesium.Math.toRadians(80);

    // 类

    var CompositeCoordinateSystem = function () {
        //========== 构造方法 ==========
        function CompositeCoordinateSystem(GLMap, api) {
            _classCallCheck(this, CompositeCoordinateSystem);

            this._GLMap = GLMap;
            this.dimensions = ['lng', 'lat'];
            this._mapOffset = [0, 0];

            this._api = api;
        }

        //========== 对外属性 ==========
        // //裁剪距离
        // get distance() {
        //     return this._distance || 0;
        // }
        // set distance(val) {
        //     this._distance = val;
        // }

        //========== 方法 ==========


        _createClass(CompositeCoordinateSystem, [{
            key: 'setMapOffset',
            value: function setMapOffset(mapOffset) {
                this._mapOffset = mapOffset;
            }
        }, {
            key: 'getBMap',
            value: function getBMap() {
                return this._GLMap;
            }
        }, {
            key: 'dataToPoint',
            value: function dataToPoint(data) {
                var defVal = [99999, 99999];

                var position = Cesium.Cartesian3.fromDegrees(data[0], data[1]);
                if (!position) {
                    return defVal;
                }
                var px = this._GLMap.cartesianToCanvasCoordinates(position);
                if (!px) {
                    return defVal;
                }

                //判断是否在球的背面
                var scene = this._GLMap;
                if (scene.mode === Cesium.SceneMode.SCENE3D) {
                    //this._depthTest
                    //方法1：精确判断，但大数据量时效率很差，页面卡顿
                    // var point = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, position);
                    // var pickRay = scene.camera.getPickRay(point);
                    // var cartesianNew = scene.globe.pick(pickRay, scene);
                    // if (cartesianNew) {
                    //     var len = Cesium.Cartesian3.distance(position, cartesianNew);
                    //     if (len > 1000 * 1000) return false;
                    // }

                    //方法2：简单判断，边缘地区不够精确，但效率高
                    var angle = Cesium.Cartesian3.angleBetween(scene.camera.position, position);
                    if (angle > backAngle) return false;
                }
                //判断是否在球的背面


                return [px.x - this._mapOffset[0], px.y - this._mapOffset[1]];
            }
        }, {
            key: 'pointToData',
            value: function pointToData(pt) {
                var mapOffset = this._mapOffset;
                var pt = this._bmap.project([pt[0] + mapOffset[0], pt[1] + mapOffset[1]]);
                return [pt.lng, pt.lat];
            }
        }, {
            key: 'getViewRect',
            value: function getViewRect() {
                var api = this._api;
                return new _echarts2.default.graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight());
            }
        }, {
            key: 'getRoamTransform',
            value: function getRoamTransform() {
                return _echarts2.default.matrix.create();
            }
        }]);

        return CompositeCoordinateSystem;
    }();

    //用于确定创建列表数据时要使用的维度


    CompositeCoordinateSystem.dimensions = ['lng', 'lat'];
    CompositeCoordinateSystem.create = function (ecModel, api) {
        var coordSys;

        ecModel.eachComponent('GLMap', function (GLMapModel) {
            var painter = api.getZr().painter;
            if (!painter) return;

            var viewportRoot = painter.getViewportRoot();
            var GLMap = _echarts2.default.glMap;
            coordSys = new CompositeCoordinateSystem(GLMap, api);
            coordSys.setMapOffset(GLMapModel.__mapOffset || [0, 0]);
            GLMapModel.coordinateSystem = coordSys;
        });

        ecModel.eachSeries(function (seriesModel) {
            if (seriesModel.get('coordinateSystem') === 'GLMap') {
                seriesModel.coordinateSystem = coordSys;
            }
        });
    };

    /////////扩展echarts///////////
    if (_echarts2.default) {
        _echarts2.default.registerCoordinateSystem('GLMap', CompositeCoordinateSystem);
        _echarts2.default.registerAction({
            type: 'GLMapRoam',
            event: 'GLMapRoam',
            update: 'updateLayout'
        }, function (payload, ecModel) {
        });

        _echarts2.default.extendComponentModel({
            type: 'GLMap',
            getBMap: function getBMap() {
                // __bmap is injected when creating BMapCoordSys
                return this.__GLMap;
            },
            defaultOption: {
                roam: false
            }
        });

        _echarts2.default.extendComponentView({
            type: 'GLMap',
            init: function init(ecModel, api) {
                this.api = api;
                _echarts2.default.glMap.postRender.addEventListener(this.moveHandler, this);
            },
            moveHandler: function moveHandler(type, target) {
                this.api.dispatchAction({
                    type: 'GLMapRoam'
                });
            },
            render: function render(GLMapModel, ecModel, api) {
            },
            dispose: function dispose(target) {
                _echarts2.default.glMap.postRender.removeEventListener(this.moveHandler, this);
            }
        });
    }

    ////////////FlowEcharts///////////////
    var flowEchartsIndex = 999;

    // 类

    var FlowEcharts = exports.FlowEcharts = function () {
        //========== 构造方法 ==========
        function FlowEcharts(_viewer, option) {
            _classCallCheck(this, FlowEcharts);

            this._viewer = _viewer;

            this._overlay = this._createChartOverlay();
            this._overlay.setOption(option);
        }

        //========== 对外属性 ==========
        // //裁剪距离
        // get distance() {
        //     return this._distance || 0;
        // }
        // set distance(val) {
        //     this._distance = val;
        // }

        //========== 方法 ==========


        _createClass(FlowEcharts, [{
            key: '_createChartOverlay',
            value: function _createChartOverlay() {
                var scene = this._viewer.scene;
                scene.canvas.setAttribute('tabIndex', 0);

                var chartContainer = document.createElement('div');
                chartContainer.style.position = 'absolute';
                chartContainer.style.top = '0px';
                chartContainer.style.left = '0px';
                chartContainer.style.width = scene.canvas.clientWidth + 'px';
                chartContainer.style.height = scene.canvas.clientHeight + 'px';
                chartContainer.style.pointerEvents = 'none'; //auto时可以交互，但是没法放大地球， none 没法交互
                chartContainer.style.zIndex = flowEchartsIndex--;

                chartContainer.setAttribute('id', 'echarts');
                chartContainer.setAttribute('class', 'echartMap');
                this._viewer.cesiumWidget.container.appendChild(chartContainer);
                this._echartsContainer = chartContainer;

                _echarts2.default.glMap = scene;
                return _echarts2.default.init(chartContainer);
            }
        }, {
            key: 'dispose',
            value: function dispose() {
                if (this._echartsContainer) {
                    this._viewer.cesiumWidget.container.removeChild(this._echartsContainer);
                    this._echartsContainer = null;
                }
                if (this._overlay) {
                    this._overlay.dispose();
                    this._overlay = null;
                }
            }
        }, {
            key: 'destroy',
            value: function destroy() {
                //兼容不同名称
                this.dispose();
            }
        }, {
            key: 'updateOverlay',
            value: function updateOverlay(option) {
                if (this._overlay) {
                    this._overlay.setOption(option);
                }
            }
        }, {
            key: 'getMap',
            value: function getMap() {
                return this._viewer;
            }
        }, {
            key: 'getOverlay',
            value: function getOverlay() {
                return this._overlay;
            }
        }, {
            key: 'show',
            value: function show() {
                if (this._echartsContainer) this._echartsContainer.style.visibility = "visible";
            }
        }, {
            key: 'hide',
            value: function hide() {
                if (this._echartsContainer) this._echartsContainer.style.visibility = "hidden";
            }
        }]);

        return FlowEcharts;
    }();

    /***/
})
