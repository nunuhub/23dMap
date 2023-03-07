/**
 * @Author han
 * @Date 2021/3/15 9:27
 */
import * as Cesium from 'cesium_shinegis_earth'
import S3MTile from '../S3MTiles/S3MTile'
import S3MLayerScheduler from '../S3MTiles/S3MLayerScheduler'
import S3MLayerCache from '../S3MTiles/S3MLayerCache'

function S3MTilesLayerProvider(options) {
    options = Cesium.defaultValue(options, Cesium.defaultValue.EMPTY_OBJECT)
    Cesium.Check.defined('options.url', options.url)
    Cesium.Check.defined('options.context', options.context)
    this.context = options.context
    this._url = undefined
    this._basePath = undefined
    this._baseResource = undefined
    this.modelMatrix = undefined
    this.fileType = undefined
    this._position = undefined
    this._rectangle = undefined
    this._root = undefined;
    this._rootTiles = []
    this._schuduler = new S3MLayerScheduler()
    this._requestTiles = []
    this._selectedTiles = []
    this._cache = new S3MLayerCache()
    this._maximumMemoryUsage = -1
    this._totalMemoryUsageInBytes = 0
    //this._readyPromise = Cesium.when.defer()
    this._readyPromise = undefined
    this.loadConfig(options.url)

    // ClippingPlaneCollection 附加裁剪平面裁剪场景数据,裁剪面以相对中心点的法线与距离构造
    this._initialClippingPlanesOriginMatrix = Cesium.Matrix4.IDENTITY
    this._clippingPlanesOriginMatrix = undefined
    this._clippingPlanesOriginMatrixDirty = true
    this._clippingPlanes = undefined
    this.clippingPlanes = options.clippingPlanes/*new Cesium.ClippingPlaneCollection({
        planes : [
            new Cesium.ClippingPlane(new Cesium.Cartesian3(0.0, 0.0, -1.0), 10)
        ],
    })*/

    // FlattenPolygonCollection 多边形压平与裁剪，输入为场景内任意多边形
    this._flattenPolygons = undefined
    this.flattenPolygons = options.flattenPolygons/*new Cesium.FlattenPolygonCollection({
        flattenPolygons: [
            new Cesium.FlattenPolygon({
                positions: Cesium.Cartesian3.fromDegreesArray([
                    116.449,
                    39.9123,
                    116.4671,
                    39.9138,
                    116.4677,
                    39.9033,
                    116.448,
                    39.9016,
                ]),
                height: 10.0,
                mode: Cesium.FlattenMode.FLATTEN,
            }),
            new Cesium.FlattenPolygon({
                positions: Cesium.Cartesian3.fromDegreesArray([
                    116.4501,39.9163,
                    116.4595,39.9165,
                    116.4603,39.9149,
                    116.4498,39.9123
                ]),
                mode: Cesium.FlattenMode.CLIPPING,
            }),
        ]
    })*/
}

Object.defineProperties(S3MTilesLayerProvider.prototype, {
    ready: {
        get: function () {
            return this._rootTiles.length > 0
        }
    },
    readyPromise: {
        get: function () {
            return this._readyPromise
        }
    },
    rectangle: {
        get: function () {
            return this._rectangle
        }
    },
    totalMemoryUsageInBytes: {
        get: function () {
            return this._totalMemoryUsageInBytes
        },
        set: function (value) {
            this._totalMemoryUsageInBytes = value
        }
    },
    maximumMemoryUsage: {
        get: function () {
            return this._maximumMemoryUsage
        },
        set: function (value) {
            this._maximumMemoryUsage = value
        }
    },
    /**
     * The {@link Cesium.ClippingPlaneCollection} used to selectively disable rendering the S3MTilesLayerProvider.
     *
     * @memberof S3MTilesLayerProvider.prototype
     *
     * @type {Cesium.ClippingPlaneCollection}
     */
    clippingPlanes: {
        get: function () {
            return this._clippingPlanes;
        },
        set: function (value) {
            Cesium.ClippingPlaneCollection.setOwner(value, this, "_clippingPlanes");
        },
    },
    /**
     * @private
     */
    clippingPlanesOriginMatrix: {
        get: function () {
            if (!Cesium.defined(this._clippingPlanesOriginMatrix)) {
                return Cesium.Matrix4.IDENTITY
            }

            if (this._clippingPlanesOriginMatrixDirty) {
                this._initialClippingPlanesOriginMatrix = Cesium.Matrix4.clone(
                    this.modelMatrix
                )
                this._clippingPlanesOriginMatrix = Cesium.Matrix4.clone(
                    this._initialClippingPlanesOriginMatrix
                )
                this._clippingPlanesOriginMatrixDirty = false
            }

            return this._clippingPlanesOriginMatrix
        },
    },
    /**
     * The {@link Cesium.FlattenPolygonCollection} used to selectively disable rendering the S3MTilesLayerProvider.
     *
     * @memberof S3MTilesLayerProvider.prototype
     *
     * @type {Cesium.FlattenPolygonCollection}
     */
    flattenPolygons: {
        get: function () {
            return this._flattenPolygons;
        },
        set: function (value) {
            Cesium.FlattenPolygonCollection.setOwner(value, this, "_flattenPolygons");
        },
    },
})

/*S3MTilesLayerProvider.prototype.loadConfig_old = function (url) {
    let that = this
    Cesium.when(url)
      .then(function (url) {
          let basePath
          let resource = Cesium.Resource.createIfNeeded(url)
          basePath = resource.getBaseUri(true)
          that._url = resource.url
          that._basePath = basePath
          that._baseResource = resource
          return resource.fetchJson()
      })
      .then(function (config) {
          let extensions = config.extensions
          that.fileType = extensions["s3m:FileType"]
          let lon = config.position.x
          let lat = config.position.y
          let height = config.position.z
          that._position = Cesium.Cartesian3.fromDegrees(lon, lat, height)
          that.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(that._position)
          that._rectangle = Cesium.Rectangle.fromDegrees(config.geoBounds.left, config.geoBounds.bottom, config.geoBounds.right, config.geoBounds.top)

          for (let i = 0, len = config.tiles.length; i < len; i++) {
              let fileName = config.tiles[i].url
              let boundingVolume = {
                  box: config.tiles[i].boundingbox
              }

              let tile = new S3MTile(that, undefined, boundingVolume, fileName)
              that._root = tile
              that._cache.add(tile)
              that._rootTiles.push(tile)
          }

          that._initialClippingPlanesOriginMatrix = Cesium.Matrix4.clone(
            that.modelMatrix
          )
          that._clippingPlanesOriginMatrix = Cesium.Matrix4.clone(
            that._initialClippingPlanesOriginMatrix
          )

          that._readyPromise.resolve(that)
      }).otherwise(function (error) {
        that._readyPromise.reject(error)
    })
}*/

S3MTilesLayerProvider.prototype.loadConfig = function (url) {
    let that = this
    this._readyPromise = Promise.resolve(url)
      .then(function (url) {
          let basePath
          let resource = Cesium.Resource.createIfNeeded(url)
          basePath = resource.getBaseUri(true)
          that._url = resource.url
          that._basePath = basePath
          that._baseResource = resource
          return resource.fetchJson()
      })
      .then(function (config) {
          let extensions = config.extensions
          that.fileType = extensions["s3m:FileType"]
          let lon = config.position.x
          let lat = config.position.y
          let height = config.position.z
          that._position = Cesium.Cartesian3.fromDegrees(lon, lat, height)
          that.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(that._position)
          that._rectangle = Cesium.Rectangle.fromDegrees(config.geoBounds.left, config.geoBounds.bottom, config.geoBounds.right, config.geoBounds.top)

          for (let i = 0, len = config.tiles.length; i < len; i++) {
              let fileName = config.tiles[i].url
              let boundingVolume = {
                  box: config.tiles[i].boundingbox
              }

              let tile = new S3MTile(that, undefined, boundingVolume, fileName)
              that._root = tile
              that._cache.add(tile)
              that._rootTiles.push(tile)
          }

          that._initialClippingPlanesOriginMatrix = Cesium.Matrix4.clone(
            that.modelMatrix
          )
          that._clippingPlanesOriginMatrix = Cesium.Matrix4.clone(
            that._initialClippingPlanesOriginMatrix
          )

         return that
      })
}

function sortRequestByPriority(a, b) {
    return a.priority - b.priority
}

function requestTiles(layer) {
    let requestTiles = layer._requestTiles
    let length = requestTiles.length
    requestTiles.sort(sortRequestByPriority)
    for (let i = 0; i < length; ++i) {
        let tile = requestTiles[i]
        tile.requestContent()
    }
}

function updateTiles(layer, frameState) {
    let selectedTiles = layer._selectedTiles
    let length = selectedTiles.length
    for (let i = 0; i < length; i++) {
        selectedTiles[i].update(frameState,layer)
    }
}

function unloadTile(layer, tile) {
    //tile.free()
}

function freeResource(layer) {
    layer._cache.unloadTiles(layer, unloadTile)
}

S3MTilesLayerProvider.prototype.prePassesUpdate = function (frameState) {
    if (!this.ready) {
        return
    }

    // 裁剪面更新
    var clippingPlanes = this.clippingPlanes
    this._clippingPlanesOriginMatrixDirty = true
    if (Cesium.defined(clippingPlanes) && clippingPlanes.enabled) {
        clippingPlanes.update(frameState)
    }
    // 多边形更新
    var flattenPolygons = this.flattenPolygons
    if (Cesium.defined(flattenPolygons) && flattenPolygons.enabled) {
        flattenPolygons.update(frameState)
    }

    if (frameState.newFrame) {
        this._cache.reset()
    }
}

S3MTilesLayerProvider.prototype.update = function (frameState) {
    if (!this.ready) {
        return
    }

    this._schuduler.scheduler(this, frameState)
    requestTiles(this)
    updateTiles(this, frameState)
    freeResource(this)
}

S3MTilesLayerProvider.prototype.destroy = function () {
    this._clippingPlanes = this._clippingPlanes && this._clippingPlanes.destroy();
    this._flattenPolygons = this._flattenPolygons && this._flattenPolygons.destroy();

    return Cesium.destroyObject(this);
}
export { S3MTilesLayerProvider }
