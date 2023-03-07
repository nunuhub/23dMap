/*
 * @Author: liujh
 * @Date: 2020/8/24 9:36
 * @Description:
 */
/* 86 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import { BaseLayer } from './BaseLayer10';

/*class GraticuleLayer_es6 extends BaseLayer {
    constructor(item, viewer) {
        super(item, viewer)

        this.model = null
    }

    add() {
        if (this.model == null) {
            this.initData()
        }
        this.model.setVisible(true)
    }

    //移除
    remove() {
        if (this.model == null) return

        this.model.setVisible(false)
    }

    initData() {
        function GraticuleLayer(description, scene) {

            description = description || {}

            this._tilingScheme = description.tilingScheme || new Cesium.GeographicTilingScheme()

            this._color = description.color || new Cesium.Color(1.0, 1.0, 1.0, 0.4)

            this._tileWidth = description.tileWidth || 256
            this._tileHeight = description.tileHeight || 256

            this._ready = true

            // default to decimal intervals
            this._sexagesimal = description.sexagesimal || false
            this._numLines = description.numLines || 50

            this._scene = scene
            this._labels = new Cesium.LabelCollection()
            scene.primitives.add(this._labels)
            this._polylines = new Cesium.PolylineCollection()
            scene.primitives.add(this._polylines)
            this._ellipsoid = scene.globe.ellipsoid

            let canvas = document.createElement("canvas")
            canvas.width = 256
            canvas.height = 256
            this._canvas = canvas

            let that = this
            scene.camera.moveEnd.addEventListener(function () {
                if (!that._show) return

                that._polylines.removeAll()
                that._labels.removeAll()
                that._currentExtent = null
                that._drawGrid(that._getExtentView())
            })
            scene.imageryLayers.addImageryProvider(this)
        }

        let definePropertyWorks = function () {
            try {
                return "x" in Object.defineProperty({}, "x", {})
            } catch (e) {
                return false
            }
        }()

        /!**
         * Defines properties on an object, using Object.defineProperties if available,
         * otherwise returns the object unchanged.  This function should be used in
         * setup code to prevent errors from completely halting JavaScript execution
         * in legacy browsers.
         *
         * @private
         *
         * @exports defineProperties
         *!/
        let defineProperties = Object.defineProperties
        if (!definePropertyWorks || !defineProperties) {
            defineProperties = function defineProperties(o) {
                return o
            }
        }

        defineProperties(GraticuleLayer.prototype, {
            url: {
                get: function get() {
                    return undefined
                }
            },

            proxy: {
                get: function get() {
                    return undefined
                }
            },

            tileWidth: {
                get: function get() {
                    return this._tileWidth
                }
            },

            tileHeight: {
                get: function get() {
                    return this._tileHeight
                }
            },

            maximumLevel: {
                get: function get() {
                    return 18
                }
            },

            minimumLevel: {
                get: function get() {
                    return 0
                }
            },
            tilingScheme: {
                get: function get() {
                    return this._tilingScheme
                }
            },
            rectangle: {
                get: function get() {
                    return this._tilingScheme.rectangle
                }
            },
            tileDiscardPolicy: {
                get: function get() {
                    return undefined
                }
            },
            errorEvent: {
                get: function get() {
                    return this._errorEvent
                }
            },
            ready: {
                get: function get() {
                    return this._ready
                }
            },
            credit: {
                get: function get() {
                    return this._credit
                }
            },
            hasAlphaChannel: {
                get: function get() {
                    return true
                }
            }
        })

        GraticuleLayer.prototype.makeLabel = function (lng, lat, text, top, color) {
            this._labels.add({
                position: this._ellipsoid.cartographicToCartesian(new Cesium.Cartographic(lng, lat, 10.0)),
                text: text,
                //font: "normal",
                //style: Cesium.LabelStyle.FILL,
                //fillColor: "white",
                //outlineColor: "white",
                font: "normal small-caps normal 16px 楷体",
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                fillColor: Cesium.Color.AZURE,
                outlineColor: Cesium.Color.BLACK,
                outlineWidth: 2,

                pixelOffset: new Cesium.Cartesian2(5, top ? 5 : -5),
                eyeOffset: Cesium.Cartesian3.ZERO,
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: top ? Cesium.VerticalOrigin.BOTTOM : Cesium.VerticalOrigin.TOP,
                scale: 1.0
            })
        }

        GraticuleLayer.prototype._drawGrid = function (extent) {

            if (this._currentExtent && this._currentExtent.equals(extent)) {
                return
            }
            this._currentExtent = extent

            this._polylines.removeAll()
            this._labels.removeAll()

            let minPixel = 0
            let maxPixel = this._canvasSize

            let dLat = 0,
                dLng = 0,
                index
            // get the nearest to the calculated value
            for (index = 0; index < mins.length && dLat < (extent.north - extent.south) / 10; index++) {
                dLat = mins[index]
            }
            for (index = 0; index < mins.length && dLng < (extent.east - extent.west) / 10; index++) {
                dLng = mins[index]
            }

            // round iteration limits to the computed grid interval
            let minLng = (extent.west < 0 ? Math.ceil(extent.west / dLng) : Math.floor(extent.west / dLng)) * dLng
            let minLat = (extent.south < 0 ? Math.ceil(extent.south / dLat) : Math.floor(extent.south / dLat)) * dLat
            let maxLng = (extent.east < 0 ? Math.ceil(extent.east / dLat) : Math.floor(extent.east / dLat)) * dLat
            let maxLat = (extent.north < 0 ? Math.ceil(extent.north / dLng) : Math.floor(extent.north / dLng)) * dLng

            // extend to make sure we cover for non refresh of tiles
            minLng = Math.max(minLng - 2 * dLng, -Math.PI)
            maxLng = Math.min(maxLng + 2 * dLng, Math.PI)
            minLat = Math.max(minLat - 2 * dLat, -Math.PI / 2)
            maxLat = Math.min(maxLat + 2 * dLng, Math.PI / 2)

            let ellipsoid = this._ellipsoid
            let lat,
                lng,
                granularity = Cesium.Math.toRadians(1)

            // labels positions
            let latitudeText = minLat + Math.floor((maxLat - minLat) / dLat / 2) * dLat
            for (lng = minLng; lng < maxLng; lng += dLng) {
                // draw meridian
                let path = []
                for (lat = minLat; lat < maxLat; lat += granularity) {
                    path.push(new Cesium.Cartographic(lng, lat))
                }
                path.push(new Cesium.Cartographic(lng, maxLat))
                this._polylines.add({
                    positions: ellipsoid.cartographicArrayToCartesianArray(path),
                    width: 1
                })
                let degLng = Cesium.Math.toDegrees(lng)
                this.makeLabel(lng, latitudeText, this._sexagesimal ? this._decToSex(degLng) : degLng.toFixed(gridPrecision(dLng)), false)
            }

            // lats
            let longitudeText = minLng + Math.floor((maxLng - minLng) / dLng / 2) * dLng
            for (lat = minLat; lat < maxLat; lat += dLat) {
                // draw parallels
                let path = []
                for (lng = minLng; lng < maxLng; lng += granularity) {
                    path.push(new Cesium.Cartographic(lng, lat))
                }
                path.push(new Cesium.Cartographic(maxLng, lat))
                this._polylines.add({
                    positions: ellipsoid.cartographicArrayToCartesianArray(path),
                    width: 1
                })
                let degLat = Cesium.Math.toDegrees(lat)
                this.makeLabel(longitudeText, lat, this._sexagesimal ? this._decToSex(degLat) : degLat.toFixed(gridPrecision(dLat)), true)
            }
        }

        GraticuleLayer.prototype.requestImage = function (x, y, level) {

            if (this._show) {
                this._drawGrid(this._getExtentView())
            }

            return this._canvas
        }

        GraticuleLayer.prototype.setVisible = function (visible) {
            this._show = visible
            if (!visible) {
                this._polylines.removeAll()
                this._labels.removeAll()
            } else {
                this._currentExtent = null
                this._drawGrid(this._getExtentView())
            }
        }

        GraticuleLayer.prototype.isVisible = function () {
            return this._show
        }

        GraticuleLayer.prototype._decToSex = function (d) {
            let degs = Math.floor(d)
            let mins = ((Math.abs(d) - degs) * 60.0).toFixed(2)
            if (mins === "60.00") {
                degs += 1.0
                mins = "0.00"
            }
            return [ degs, ":", mins ].join('')
        }

        GraticuleLayer.prototype._getExtentView = function () {
            let camera = this._scene.camera
            let canvas = this._scene.canvas
            let corners = [ camera.pickEllipsoid(new Cesium.Cartesian2(0, 0), this._ellipsoid), camera.pickEllipsoid(new Cesium.Cartesian2(canvas.width, 0), this._ellipsoid), camera.pickEllipsoid(new Cesium.Cartesian2(0, canvas.height), this._ellipsoid), camera.pickEllipsoid(new Cesium.Cartesian2(canvas.width, canvas.height), this._ellipsoid) ]
            for (let index = 0; index < 4; index++) {
                if (corners[index] === undefined) {
                    return Cesium.Rectangle.MAX_VALUE
                }
            }
            return Cesium.Rectangle.fromCartographicArray(this._ellipsoid.cartesianArrayToCartographicArray(corners))
        }

        function gridPrecision(dDeg) {
            if (dDeg < 0.01) return 2
            if (dDeg < 0.1) return 1
            if (dDeg < 1) return 0
            return 0
        }

        let mins = [ Cesium.Math.toRadians(0.05), Cesium.Math.toRadians(0.1), Cesium.Math.toRadians(0.2), Cesium.Math.toRadians(0.5), Cesium.Math.toRadians(1.0), Cesium.Math.toRadians(2.0), Cesium.Math.toRadians(5.0), Cesium.Math.toRadians(10.0) ]

        function loggingMessage(message) {
            let logging = document.getElementById("logging")
            logging.innerHTML += message
        }

        this.model = new GraticuleLayer({
            numLines: 10
        }, this.viewer.scene)
    }
}*/

const GraticuleLayer = BaseLayer.extend({
  model: null,
  //添加
  add: function add() {
    if (this.model == null) {
      this.initData();
    }
    this.model.setVisible(true);
  },
  //移除
  remove: function remove() {
    if (this.model == null) return;

    this.model.setVisible(false);
  },

  initData: function initData() {
    function GraticuleLayer(description, scene) {
      description = description || {};

      this._tilingScheme =
        description.tilingScheme || new Cesium.GeographicTilingScheme();

      this._color = description.color || new Cesium.Color(1.0, 1.0, 1.0, 0.4);

      this._tileWidth = description.tileWidth || 256;
      this._tileHeight = description.tileHeight || 256;

      this._ready = true;

      // default to decimal intervals
      this._sexagesimal = description.sexagesimal || false;
      this._numLines = description.numLines || 50;

      this._scene = scene;
      this._labels = new Cesium.LabelCollection();
      scene.primitives.add(this._labels);
      this._polylines = new Cesium.PolylineCollection();
      scene.primitives.add(this._polylines);
      this._ellipsoid = scene.globe.ellipsoid;

      let canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      this._canvas = canvas;

      let that = this;
      scene.camera.moveEnd.addEventListener(function () {
        if (!that._show) return;

        that._polylines.removeAll();
        that._labels.removeAll();
        that._currentExtent = null;
        that._drawGrid(that._getExtentView());
      });
      scene.imageryLayers.addImageryProvider(this);
    }

    let definePropertyWorks = (function () {
      try {
        return 'x' in Object.defineProperty({}, 'x', {});
      } catch (e) {
        return false;
      }
    })();

    /**
     * Defines properties on an object, using Object.defineProperties if available,
     * otherwise returns the object unchanged.  This function should be used in
     * setup code to prevent errors from completely halting JavaScript execution
     * in legacy browsers.
     *
     * @private
     *
     * @exports defineProperties
     */
    let defineProperties = Object.defineProperties;
    if (!definePropertyWorks || !defineProperties) {
      defineProperties = function defineProperties(o) {
        return o;
      };
    }

    defineProperties(GraticuleLayer.prototype, {
      url: {
        get: function get() {
          return undefined;
        }
      },

      proxy: {
        get: function get() {
          return undefined;
        }
      },

      tileWidth: {
        get: function get() {
          return this._tileWidth;
        }
      },

      tileHeight: {
        get: function get() {
          return this._tileHeight;
        }
      },

      maximumLevel: {
        get: function get() {
          return 18;
        }
      },

      minimumLevel: {
        get: function get() {
          return 0;
        }
      },
      tilingScheme: {
        get: function get() {
          return this._tilingScheme;
        }
      },
      rectangle: {
        get: function get() {
          return this._tilingScheme.rectangle;
        }
      },
      tileDiscardPolicy: {
        get: function get() {
          return undefined;
        }
      },
      errorEvent: {
        get: function get() {
          return this._errorEvent;
        }
      },
      ready: {
        get: function get() {
          return this._ready;
        }
      },
      credit: {
        get: function get() {
          return this._credit;
        }
      },
      hasAlphaChannel: {
        get: function get() {
          return true;
        }
      }
    });

    GraticuleLayer.prototype.makeLabel = function (
      lng,
      lat,
      text,
      top /* , color */
    ) {
      this._labels.add({
        position: this._ellipsoid.cartographicToCartesian(
          new Cesium.Cartographic(lng, lat, 10.0)
        ),
        text: text,
        //font: "normal",
        //style: Cesium.LabelStyle.FILL,
        //fillColor: "white",
        //outlineColor: "white",
        font: 'normal small-caps normal 16px 楷体',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        fillColor: Cesium.Color.AZURE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,

        pixelOffset: new Cesium.Cartesian2(5, top ? 5 : -5),
        eyeOffset: Cesium.Cartesian3.ZERO,
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: top
          ? Cesium.VerticalOrigin.BOTTOM
          : Cesium.VerticalOrigin.TOP,
        scale: 1.0
      });
    };

    GraticuleLayer.prototype._drawGrid = function (extent) {
      if (this._currentExtent && this._currentExtent.equals(extent)) {
        return;
      }
      this._currentExtent = extent;

      this._polylines.removeAll();
      this._labels.removeAll();

      /* let minPixel = 0;
      let maxPixel = this._canvasSize; */

      let dLat = 0,
        dLng = 0,
        index;
      // get the nearest to the calculated value
      for (
        index = 0;
        index < mins.length && dLat < (extent.north - extent.south) / 10;
        index++
      ) {
        dLat = mins[index];
      }
      for (
        index = 0;
        index < mins.length && dLng < (extent.east - extent.west) / 10;
        index++
      ) {
        dLng = mins[index];
      }

      // round iteration limits to the computed grid interval
      let minLng =
        (extent.west < 0
          ? Math.ceil(extent.west / dLng)
          : Math.floor(extent.west / dLng)) * dLng;
      let minLat =
        (extent.south < 0
          ? Math.ceil(extent.south / dLat)
          : Math.floor(extent.south / dLat)) * dLat;
      let maxLng =
        (extent.east < 0
          ? Math.ceil(extent.east / dLat)
          : Math.floor(extent.east / dLat)) * dLat;
      let maxLat =
        (extent.north < 0
          ? Math.ceil(extent.north / dLng)
          : Math.floor(extent.north / dLng)) * dLng;

      // extend to make sure we cover for non refresh of tiles
      minLng = Math.max(minLng - 2 * dLng, -Math.PI);
      maxLng = Math.min(maxLng + 2 * dLng, Math.PI);
      minLat = Math.max(minLat - 2 * dLat, -Math.PI / 2);
      maxLat = Math.min(maxLat + 2 * dLng, Math.PI / 2);

      let ellipsoid = this._ellipsoid;
      let lat,
        lng,
        granularity = Cesium.Math.toRadians(1);

      // labels positions
      let latitudeText =
        minLat + Math.floor((maxLat - minLat) / dLat / 2) * dLat;
      for (lng = minLng; lng < maxLng; lng += dLng) {
        // draw meridian
        let path = [];
        for (lat = minLat; lat < maxLat; lat += granularity) {
          path.push(new Cesium.Cartographic(lng, lat));
        }
        path.push(new Cesium.Cartographic(lng, maxLat));
        this._polylines.add({
          positions: ellipsoid.cartographicArrayToCartesianArray(path),
          width: 1
        });
        let degLng = Cesium.Math.toDegrees(lng);
        this.makeLabel(
          lng,
          latitudeText,
          this._sexagesimal
            ? this._decToSex(degLng)
            : degLng.toFixed(gridPrecision(dLng)),
          false
        );
      }

      // lats
      let longitudeText =
        minLng + Math.floor((maxLng - minLng) / dLng / 2) * dLng;
      for (lat = minLat; lat < maxLat; lat += dLat) {
        // draw parallels
        let path = [];
        for (lng = minLng; lng < maxLng; lng += granularity) {
          path.push(new Cesium.Cartographic(lng, lat));
        }
        path.push(new Cesium.Cartographic(maxLng, lat));
        this._polylines.add({
          positions: ellipsoid.cartographicArrayToCartesianArray(path),
          width: 1
        });
        let degLat = Cesium.Math.toDegrees(lat);
        this.makeLabel(
          longitudeText,
          lat,
          this._sexagesimal
            ? this._decToSex(degLat)
            : degLat.toFixed(gridPrecision(dLat)),
          true
        );
      }
    };

    GraticuleLayer.prototype.requestImage = function (/* x, y, level */) {
      if (this._show) {
        this._drawGrid(this._getExtentView());
      }

      return this._canvas;
    };

    GraticuleLayer.prototype.setVisible = function (visible) {
      this._show = visible;
      if (!visible) {
        this._polylines.removeAll();
        this._labels.removeAll();
      } else {
        this._currentExtent = null;
        this._drawGrid(this._getExtentView());
      }
    };

    GraticuleLayer.prototype.isVisible = function () {
      return this._show;
    };

    GraticuleLayer.prototype._decToSex = function (d) {
      let degs = Math.floor(d);
      let mins = ((Math.abs(d) - degs) * 60.0).toFixed(2);
      if (mins === '60.00') {
        degs += 1.0;
        mins = '0.00';
      }
      return [degs, ':', mins].join('');
    };

    GraticuleLayer.prototype._getExtentView = function () {
      let camera = this._scene.camera;
      let canvas = this._scene.canvas;
      let corners = [
        camera.pickEllipsoid(new Cesium.Cartesian2(0, 0), this._ellipsoid),
        camera.pickEllipsoid(
          new Cesium.Cartesian2(canvas.width, 0),
          this._ellipsoid
        ),
        camera.pickEllipsoid(
          new Cesium.Cartesian2(0, canvas.height),
          this._ellipsoid
        ),
        camera.pickEllipsoid(
          new Cesium.Cartesian2(canvas.width, canvas.height),
          this._ellipsoid
        )
      ];
      for (let index = 0; index < 4; index++) {
        if (corners[index] === undefined) {
          return Cesium.Rectangle.MAX_VALUE;
        }
      }
      return Cesium.Rectangle.fromCartographicArray(
        this._ellipsoid.cartesianArrayToCartographicArray(corners)
      );
    };

    function gridPrecision(dDeg) {
      if (dDeg < 0.01) return 2;
      if (dDeg < 0.1) return 1;
      if (dDeg < 1) return 0;
      return 0;
    }

    let mins = [
      Cesium.Math.toRadians(0.05),
      Cesium.Math.toRadians(0.1),
      Cesium.Math.toRadians(0.2),
      Cesium.Math.toRadians(0.5),
      Cesium.Math.toRadians(1.0),
      Cesium.Math.toRadians(2.0),
      Cesium.Math.toRadians(5.0),
      Cesium.Math.toRadians(10.0)
    ];

    /* function loggingMessage(message) {
      let logging = document.getElementById('logging');
      logging.innerHTML += message;
    } */

    this.model = new GraticuleLayer(
      {
        numLines: 10
      },
      this.viewer.scene
    );
  }
});
export { GraticuleLayer };
