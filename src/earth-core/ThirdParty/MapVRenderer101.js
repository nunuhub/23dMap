/*
 * @Author: liujh
 * @Date: 2020/12/24 10:08
 * @Description:
 */
/* 101 */
/***/
import * as Cesium from 'cesium_shinegis_earth'
//import mapv

//var baiduMapLayer = mapv ? mapv.baiduMapLayer : null;
//var BaseLayer = baiduMapLayer ? baiduMapLayer.__proto__ : Function;

var backAngle = Cesium.Math.toRadians(80);

class MapVRenderer {}

/*class MapVRenderer extends BaseLayer {
    constructor(
        t, e, i, n
    ) {
        super(t, e, i, n)

        this.map = t,
            this.scene = t.scene,
            this.dataSet = e;
        i = i || {},
            this.init(i),
            this.argCheck(i),
            this.initDevicePixelRatio(),
            this.canvasLayer = n,
            this.stopAniamation = !1,
            this.animation = i.animation,
            this.clickEvent = _this.clickEvent.bind(_this),
            this.mousemoveEvent = _this.mousemoveEvent.bind(_this),
            this.bindEvent();

        return this;
    }

    //========== 方法 ==========
    initDevicePixelRatio() {
        this.devicePixelRatio = window.devicePixelRatio || 1;
    }

    clickEvent(t) {
        var e = t.point;
        super.clickEvent(e, t)
    }

    mousemoveEvent(t) {
        var e = t.point;
        super.mousemoveEvent(e, t)
    }

    addAnimatorEvent() {
    }

    animatorMovestartEvent() {
        var t = this.options.animation;
        this.isEnabledTime() && this.animator && (this.steps.step = t.stepsRange.start);
    }

    animatorMoveendEvent() {
        this.isEnabledTime() && this.animator;
    }

    bindEvent() {
        this.map;
        this.options.methods && (this.options.methods.click, this.options.methods.mousemove);
    }

    unbindEvent() {
        var t = this.map;
        this.options.methods && (this.options.methods.click && t.off("click", this.clickEvent),
        this.options.methods.mousemove && t.off("mousemove", this.mousemoveEvent));
    }

    getContext() {
        return this.canvasLayer.canvas.getContext(this.context);
    }

    init(t) {
        this.options = t;
        this.initDataRange(t);
        this.context = this.options.context || "2d";

        if (this.options.zIndex && this.canvasLayer && this.canvasLayer.setZIndex) this.canvasLayer.setZIndex(this.options.zIndex);

        this.initAnimator();
    }

    _canvasUpdate(t) {
        this.map;
        var e = this.scene;
        if (this.canvasLayer && !this.stopAniamation) {
            var i = this.options.animation,
                n = this.getContext();
            if (this.isEnabledTime()) {
                if (void 0 === t) return void this.clear(n);
                "2d" === this.context && (n.save(),
                    n.globalCompositeOperation = "destination-out",
                    n.fillStyle = "rgba(0, 0, 0, .1)",
                    n.fillRect(0, 0, n.canvas.width, n.canvas.height),
                    n.restore());
            } else this.clear(n);
            if ("2d" === this.context)
                for (var o in this.options) {
                    n[o] = this.options[o];
                } else n.clear(n.COLOR_BUFFER_BIT);
            var a = {
                transferCoordinate: function transferCoordinate(t) {
                    var defVal = [99999, 99999];

                    //坐标转换
                    var position = Cesium.Cartesian3.fromDegrees(t[0], t[1]);
                    if (!position) {
                        return defVal;
                    }
                    var px = e.cartesianToCanvasCoordinates(position);
                    if (!px) {
                        return defVal;
                    }

                    //判断是否在球的背面
                    if (e.mode === Cesium.SceneMode.SCENE3D) {
                        var angle = Cesium.Cartesian3.angleBetween(e.camera.position, position);
                        if (angle > backAngle) return false;
                    }
                    //判断是否在球的背面

                    return [px.x, px.y];
                }
            };
            void 0 !== t && (a.filter = function (e) {
                var n = i.trails || 10;
                return !!(t && e.time > t - n && e.time < t);
            });
            var c = this.dataSet.get(a);
            this.processData(c),
            "m" == this.options.unit && this.options.size,
                this.options._size = this.options.size;
            var h = Cesium.SceneTransforms.wgs84ToWindowCoordinates(e, Cesium.Cartesian3.fromDegrees(0, 0));

            this.drawContext(n, new mapv.DataSet(c), this.options, h),
            this.options.updateCallback && this.options.updateCallback(t);
        }
    }

    updateData(t, e) {
        var i = t;
        i && i.get && (i = i.get()),
        void 0 != i && this.dataSet.set(i),
            super.update({
                options: e
            })
    }

    addData(t, e) {
        var i = t;
        t && t.get && (i = t.get()),
            this.dataSet.add(i),
            this.update({
            options: e
        });
    }

    getData() {
        return this.dataSet;
    }

    removeData(t) {
        if (this.dataSet) {
            var e = this.dataSet.get({
                filter: function filter(e) {
                    return null == t || "function" != typeof t || !t(e);
                }
            });
            this.dataSet.set(e),
                this.update({
                options: null
            });
        }
    }

    clearData() {
        this.dataSet && this.dataSet.clear(),
            this.update({
            options: null
        });
    }

    draw() {
        this.canvasLayer.draw();
    }

    clear(t) {
        t && t.clearRect && t.clearRect(0, 0, t.canvas.width, t.canvas.height);
    }

    destroy() {
        this.unbindEvent();
        this.clear(this.getContext());
        this.clearData();
        this.animator && this.animator.stop();
        this.animator = null;
        this.canvasLayer = null;
    }
}*/

export {MapVRenderer}


