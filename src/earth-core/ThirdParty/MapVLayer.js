/*
 * @Author: liujh
 * @Date: 2020/10/16 17:22
 * @Description:
 */
/* 100 */
/***/
(function (module, exports, __webpack_require__) {

    "use strict";


    Object.defineProperty(exports, "__esModule", {
        value: true
    });
    exports.MapVLayer = undefined;

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
    }(); //mapv+cesium融合，by http://marsgis.cn


    var _cesium = __webpack_require__(0);

    var Cesium = _interopRequireWildcard(_cesium);

    var _MapVRenderer = __webpack_require__(101);

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

    var divId = 0;

    /**
     * @class mapVLayer
     * @classdesc MapV 图层。
     * @category Visualization MapV
     * @param {mapv.DataSet} dataSet - MapV 图层数据集。
     * @param {Object} mapVOptions - MapV 图层参数。
     * @param {Object} options - 参数。
     * @param {string} [options.attributionPrefix] - 版权信息前缀。
     * @param {string} [options.attribution='© 2018 百度 MapV'] - 版权信息。
     * @fires mapVLayer#loaded
     */

    var MapVLayer = exports.MapVLayer = function () {
        //========== 构造方法 ==========
        function MapVLayer(t, e, i, n) {
            _classCallCheck(this, MapVLayer);

            this.map = t, this.scene = t.scene, this.mapvBaseLayer = new _MapVRenderer.MapVRenderer(t, e, i, this), this.mapVOptions = i, this.initDevicePixelRatio(), this.canvas = this._createCanvas(), this.render = this.render.bind(this), void 0 != n ? (this.container = n, n.appendChild(this.canvas)) : (this.container = t.container, this.addInnerContainer()), this.bindEvent(), this._reset();
        }

        //========== 方法 ==========


        _createClass(MapVLayer, [{
            key: "initDevicePixelRatio",
            value: function initDevicePixelRatio() {
                this.devicePixelRatio = window.devicePixelRatio || 1;
            }
        }, {
            key: "addInnerContainer",
            value: function addInnerContainer() {
                this.container.appendChild(this.canvas);
            }
        }, {
            key: "bindEvent",
            value: function bindEvent() {
                var _this = this;

                //绑定cesium事件与mapv联动
                this.innerMoveStart = this.moveStartEvent.bind(this), this.innerMoveEnd = this.moveEndEvent.bind(this);

                this.scene.camera.moveStart.addEventListener(this.innerMoveStart, this);
                this.scene.camera.moveEnd.addEventListener(this.innerMoveEnd, this);

                //解决cesium有时 moveStart 后没有触发 moveEnd
                var handler = new Cesium.ScreenSpaceEventHandler(this.canvas);
                handler.setInputAction(function (event) {
                    _this.innerMoveEnd();
                }, Cesium.ScreenSpaceEventType.LEFT_UP);
                handler.setInputAction(function (event) {
                    _this.innerMoveEnd();
                }, Cesium.ScreenSpaceEventType.MIDDLE_UP);

                this.handler = handler;
            }
        }, {
            key: "unbindEvent",
            value: function unbindEvent() {
                this.scene.camera.moveStart.removeEventListener(this.innerMoveStart, this);
                this.scene.camera.moveEnd.removeEventListener(this.innerMoveEnd, this);
                this.scene.postRender.removeEventListener(this._reset, this);

                if (this.handler) {
                    this.handler.destroy();
                    this.handler = null;
                }
            }
        }, {
            key: "moveStartEvent",
            value: function moveStartEvent() {
                this.mapvBaseLayer && this.mapvBaseLayer.animatorMovestartEvent();
                //this._unvisiable()

                this.scene.postRender.addEventListener(this._reset, this);

                console.log('mapv moveStartEvent');
            }
        }, {
            key: "moveEndEvent",
            value: function moveEndEvent() {
                this.scene.postRender.removeEventListener(this._reset, this);

                this.mapvBaseLayer && this.mapvBaseLayer.animatorMoveendEvent();
                this._reset();
                //this._visiable()
                console.log('mapv moveEndEvent');
            }
        }, {
            key: "zoomStartEvent",
            value: function zoomStartEvent() {
                this._unvisiable();
            }
        }, {
            key: "zoomEndEvent",
            value: function zoomEndEvent() {
                this._unvisiable();
            }
        }, {
            key: "addData",
            value: function addData(t, e) {
                void 0 != this.mapvBaseLayer && this.mapvBaseLayer.addData(t, e);
            }
        }, {
            key: "updateData",
            value: function updateData(t, e) {
                void 0 != this.mapvBaseLayer && this.mapvBaseLayer.updateData(t, e);
            }
        }, {
            key: "getData",
            value: function getData() {
                return this.mapvBaseLayer && (this.dataSet = this.mapvBaseLayer.getData()), this.dataSet;
            }
        }, {
            key: "removeData",
            value: function removeData(t) {
                void 0 != this.mapvBaseLayer && this.mapvBaseLayer && this.mapvBaseLayer.removeData(t);
            }
        }, {
            key: "removeAllData",
            value: function removeAllData() {
                void 0 != this.mapvBaseLayer && this.mapvBaseLayer.clearData();
            }
        }, {
            key: "_visiable",
            value: function _visiable() {
                return this.canvas.style.display = "block";
            }
        }, {
            key: "_unvisiable",
            value: function _unvisiable() {
                return this.canvas.style.display = "none";
            }
        }, {
            key: "_createCanvas",
            value: function _createCanvas() {
                var t = document.createElement("canvas");
                t.id = this.mapVOptions.layerid || "mapv" + divId++, t.style.position = "absolute", t.style.top = "0px", t.style.left = "0px", t.style.pointerEvents = "none", //auto时可以交互，但是没法放大地球, none没法交互
                    t.style.zIndex = this.mapVOptions.zIndex || 100, t.width = parseInt(this.map.canvas.width), t.height = parseInt(this.map.canvas.height), t.style.width = this.map.canvas.style.width, t.style.height = this.map.canvas.style.height;

                var e = this.devicePixelRatio;
                return "2d" == this.mapVOptions.context && t.getContext(this.mapVOptions.context).scale(e, e), t;
            }
        }, {
            key: "_reset",
            value: function _reset() {
                this.resizeCanvas(), this.fixPosition(), this.onResize(), this.render();
            }
        }, {
            key: "draw",
            value: function draw() {
                this._reset();
            }
        }, {
            key: "show",
            value: function show() {
                this._visiable();
            }
        }, {
            key: "hide",
            value: function hide() {
                this._unvisiable();
            }
        }, {
            key: "destroy",
            value: function destroy() {
                //释放
                this.unbindEvent();
                this.remove();
            }
        }, {
            key: "remove",
            value: function remove() {
                void 0 != this.mapvBaseLayer && (this.removeAllData(), this.mapvBaseLayer.destroy(), this.mapvBaseLayer = void 0, this.canvas.parentElement.removeChild(this.canvas));
            }
        }, {
            key: "update",
            value: function update(t) {
                void 0 != t && this.updateData(t.data, t.options);
            }
        }, {
            key: "resizeCanvas",
            value: function resizeCanvas() {
                if (void 0 != this.canvas && null != this.canvas) {
                    var t = this.canvas;
                    t.style.position = "absolute", t.style.top = "0px", t.style.left = "0px", t.width = parseInt(this.map.canvas.width), t.height = parseInt(this.map.canvas.height), t.style.width = this.map.canvas.style.width, t.style.height = this.map.canvas.style.height;
                }
            }
        }, {
            key: "fixPosition",
            value: function fixPosition() {
            }
        }, {
            key: "onResize",
            value: function onResize() {
            }
        }, {
            key: "render",
            value: function render() {
                void 0 != this.mapvBaseLayer && this.mapvBaseLayer._canvasUpdate();
            }
        }]);

        return MapVLayer;
    }();

    /***/
})
