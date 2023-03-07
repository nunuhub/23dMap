/*
 * @Author: liujh
 * @Date: 2020/10/16 17:22
 * @Description:
 */
/* 100 */
/***/


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

//var divId = 0;
import * as Cesium from 'cesium_shinegis_earth'
import {MapVRenderer} from './MapVRenderer101'

class MapVLayer {
    constructor(
        t, e, i, n
    ) {
        this.map = t,
            this.scene = t.scene,
            this.mapvBaseLayer = new MapVRenderer(t, e, i, this),
            this.mapVOptions = i,
            this.initDevicePixelRatio(),
            this.canvas = this._createCanvas(),
            this.render = this.render.bind(this),
            void 0 != n ? (this.container = n, n.appendChild(this.canvas)) : (this.container = t.container,
                this.addInnerContainer()),
            this.bindEvent(),
            this._reset();
    }
    //========== 方法 ==========

    initDevicePixelRatio() {
        this.devicePixelRatio = window.devicePixelRatio || 1;
    }

    addInnerContainer() {
        this.container.appendChild(this.canvas);
    }

    bindEvent() {
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

    unbindEvent() {
        this.scene.camera.moveStart.removeEventListener(this.innerMoveStart, this);
        this.scene.camera.moveEnd.removeEventListener(this.innerMoveEnd, this);
        this.scene.postRender.removeEventListener(this._reset, this);

        if (this.handler) {
            this.handler.destroy();
            this.handler = null;
        }
    }

    moveStartEvent() {
        this.mapvBaseLayer && this.mapvBaseLayer.animatorMovestartEvent();
        //this._unvisiable()

        this.scene.postRender.addEventListener(this._reset, this);

        console.log('mapv moveStartEvent');
    }

    moveEndEvent() {
        this.scene.postRender.removeEventListener(this._reset, this);

        this.mapvBaseLayer && this.mapvBaseLayer.animatorMoveendEvent();
        this._reset();
        //this._visiable()
        console.log('mapv moveEndEvent');
    }

    zoomStartEvent() {
        this._unvisiable();
    }

    zoomEndEvent() {
        this._unvisiable();
    }

    addData(t, e) {
        void 0 != this.mapvBaseLayer && this.mapvBaseLayer.addData(t, e);
    }

    updateData(t, e) {
        void 0 != this.mapvBaseLayer && this.mapvBaseLayer.updateData(t, e);
    }

    getData() {
        return this.mapvBaseLayer && (this.dataSet = this.mapvBaseLayer.getData()), this.dataSet;
    }

    removeData(t) {
        void 0 != this.mapvBaseLayer && this.mapvBaseLayer && this.mapvBaseLayer.removeData(t);
    }

    removeAllData() {
        void 0 != this.mapvBaseLayer && this.mapvBaseLayer.clearData();
    }

    _visiable() {
        return this.canvas.style.display = "block";
    }

    _unvisiable() {
        return this.canvas.style.display = "none";
    }

    _createCanvas() {
        var t = document.createElement("canvas");
        t.id = this.mapVOptions.layerid || "mapv" + divId++, t.style.position = "absolute", t.style.top = "0px", t.style.left = "0px", t.style.pointerEvents = "none", //auto时可以交互，但是没法放大地球, none没法交互
            t.style.zIndex = this.mapVOptions.zIndex || 100, t.width = parseInt(this.map.canvas.width), t.height = parseInt(this.map.canvas.height), t.style.width = this.map.canvas.style.width, t.style.height = this.map.canvas.style.height;

        var e = this.devicePixelRatio;
        return "2d" == this.mapVOptions.context && t.getContext(this.mapVOptions.context).scale(e, e), t;
    }

    _reset() {
        this.resizeCanvas(), this.fixPosition(), this.onResize(), this.render();
    }

    draw() {
        this._reset();
    }

    show() {
        this._visiable();
    }

    hide() {
        this._unvisiable();
    }

    destroy() {
        //释放
        this.unbindEvent();
        this.remove();
    }

    remove() {
        void 0 != this.mapvBaseLayer && (this.removeAllData(), this.mapvBaseLayer.destroy(), this.mapvBaseLayer = void 0, this.canvas.parentElement.removeChild(this.canvas));
    }

    update(t) {
        void 0 != t && this.updateData(t.data, t.options);
    }

    resizeCanvas() {
        if (void 0 != this.canvas && null != this.canvas) {
            var t = this.canvas;
            t.style.position = "absolute", t.style.top = "0px", t.style.left = "0px", t.width = parseInt(this.map.canvas.width), t.height = parseInt(this.map.canvas.height), t.style.width = this.map.canvas.style.width, t.style.height = this.map.canvas.style.height;
        }
    }

    fixPosition() {
    }

    onResize() {
    }

    render() {
        void 0 != this.mapvBaseLayer && this.mapvBaseLayer._canvasUpdate();
    }
}

export {MapVLayer}
