import * as Cesium from 'cesium_shinegis_earth'
import S3MTilesVS from '../Shaders/S3MTilesVS'
import S3MTilesFS from '../Shaders/S3MTilesFS'
import RenderEntity from './RenderEntity'


function S3MCacheFileRenderEntity(options) {
    RenderEntity.call(this, options)

    this._clippingPlanes = undefined;
    this.clippingPlanes = options.clippingPlanes;
    this._clippingPlanesEnable = false;
    this._clippingPlanesMatrix = Cesium.Matrix4.clone(Cesium.Matrix4.IDENTITY);
    this.referenceMatrix = undefined;
    this._defaultTexture = undefined;
    this._flattenPolygons = undefined;
    this.flattenPolygons = options.flattenPolygons;
    this._flattenPolygonsClippingReady = false;
    this._flattenPolygonsFlattenReady = false;
}

Object.defineProperties(S3MCacheFileRenderEntity.prototype, {
    /**
     * The {@link Cesium.ClippingPlaneCollection} used to selectively disable rendering the S3MCacheFileRenderEntity.
     *
     * @memberof S3MCacheFileRenderEntity.prototype
     *
     * @type {Cesium.ClippingPlaneCollection}
     */
    clippingPlanes: {
        get: function () {
            return this._clippingPlanes;
        },
        set: function (value) {
            if (value === this._clippingPlanes) {
                return;
            }
            Cesium.ClippingPlaneCollection.setOwner(value, this, "_clippingPlanes");
        },
    },
    /**
     * The {@link Cesium.FlattenPolygonCollection} used to selectively disable rendering the S3MCacheFileRenderEntity.
     *
     * @memberof S3MCacheFileRenderEntity.prototype
     *
     * @type {Cesium.FlattenPolygonCollection}
     */
    flattenPolygons: {
        get: function () {
            return this._flattenPolygons;
        },
        set: function (value) {
            if (value === this._flattenPolygons) {
                return;
            }
            Cesium.FlattenPolygonCollection.setOwner(value, this, "_flattenPolygons");
        },
    },
})

S3MCacheFileRenderEntity.prototype = Object.create(RenderEntity.prototype)

S3MCacheFileRenderEntity.prototype.constructor = RenderEntity

function createShaderProgram(context, attributeLocations, material, vertexPackage) {
    let vp = new Cesium.ShaderSource({
        sources: [ S3MTilesVS ]
    })

    let fp = new Cesium.ShaderSource({
        sources: [ S3MTilesFS ]
    })

    if (Cesium.defined(attributeLocations['aNormal'])) {
        vp.defines.push('VertexNormal')
        fp.defines.push('VertexNormal')
    }

    if (material.textures.length > 0) {
        vp.defines.push('TexCoord')
        fp.defines.push('TexCoord')
    }

    if (material.textures.length == 2) {
        vp.defines.push('TexCoord2')
        fp.defines.push('TexCoord2')
    }

    if(vertexPackage.instanceIndex > -1 && vertexPackage.instanceMode === 17){
        vp.defines.push('Instance');
    }

    return Cesium.ShaderProgram.fromCache({
        context: context,
        vertexShaderSource: vp,
        fragmentShaderSource: fp,
        attributeLocations: attributeLocations
    })

}

function getOpaqueRenderState() {
    return Cesium.RenderState.fromCache({
        cull: {
            enabled: true
        },
        depthTest: {
            enabled: true,
            func: Cesium.DepthFunction.LESS_OR_EQUAL
        }
    })
}

function getTransparentRenderState() {
    return Cesium.RenderState.fromCache({
        cull: {
            enabled: true
        },
        depthTest: {
            enabled: true,
            func: Cesium.DepthFunction.LESS_OR_EQUAL
        },
        blending: Cesium.BlendingState.ALPHA_BLEND
    })
}
var textureResolutionScratch = new Cesium.Cartesian2();
var scratchClippingPlanesMatrix = new Cesium.Matrix4
function getUniformMap(material,layer,ro) {
    return {
        uTexture: function () {
            if (!Cesium.defined(material.textures[0])) {
                return layer.context.defaultTexture;
            }
            return material.textures[0];
        },
        uTextureWidth: function () {
            if (!Cesium.defined(material.textures[0])) {
                return 1.0;
            }
            return material.textures[0]._width;
        },
        uTexture2: function () {
            return material.textures[1];
        },
        uTexture2Width: function () {
            return material.textures[1]._width;
        },
        uDiffuseColor: function () {
            return material.diffuseColor;
        },
        uAmbientColor: function () {
            return material.ambientColor;
        },
        uTexture0Width: function () {
            if (!Cesium.defined(material.textures[0])) {
                return 1.0;
            }
            return material.textures[0]._width;
        },
        uTexture1Width: function () {
            if (!Cesium.defined(material.textures[1])) {
                return 1.0;
            }
            return material.textures[1]._width;
        },

        // clippingPlanes存储纹理
        s3m_clippingPlanes: function () {
            var clippingPlanes = ro.clippingPlanes
            return !Cesium.defined(clippingPlanes) || !clippingPlanes.enabled
                ? ro._defaultTexture
                : clippingPlanes.texture
        },
        // clippingPlanes边缘类型
        s3m_clippingPlanesEdgeStyle: function () {
            var clippingPlanes = ro.clippingPlanes
            if (!Cesium.defined(clippingPlanes)) {
                return Cesium.Color.WHITE.withAlpha(0.0)
            }

            var style = Cesium.Color.clone(clippingPlanes.edgeColor)
            style.alpha = clippingPlanes.edgeWidth
            return style
        },
        // clippingPlanes变换矩阵
        s3m_clippingPlanesMatrix: function () {
            var clippingPlanes = ro.clippingPlanes
            var clippingPlanesMatrix = scratchClippingPlanesMatrix
            if (Cesium.defined(clippingPlanes) && clippingPlanes.enabled) {
                var referenceMatrix = Cesium.defaultValue(ro.referenceMatrix, ro.modelMatrix)
                clippingPlanesMatrix = Cesium.Matrix4.multiply(
                    layer.context.uniformState.view3D,
                    referenceMatrix,
                    clippingPlanesMatrix
                )
                clippingPlanesMatrix = Cesium.Matrix4.multiply(
                    clippingPlanesMatrix,
                    clippingPlanes.modelMatrix,
                    clippingPlanesMatrix
                )
                this._clippingPlanesMatrix = Cesium.Matrix4.inverseTranspose(
                    clippingPlanesMatrix,
                    ro._clippingPlanesMatrix
                )
            }
            return ro._clippingPlanesMatrix
        },
        // clippingPlanes存储纹理宽
        s3m_width: function () {
            var clippingPlanes = ro.clippingPlanes
            return !Cesium.defined(clippingPlanes) || !clippingPlanes.enabled
                ? 1
                : Cesium.ClippingPlaneCollection.getTextureResolution(clippingPlanes, layer.context, textureResolutionScratch).x
        },
        // clippingPlanes存储纹理高
        s3m_height: function () {
            var clippingPlanes = ro.clippingPlanes
            return !Cesium.defined(clippingPlanes) || !clippingPlanes.enabled
                ? 1
                : Cesium.ClippingPlaneCollection.getTextureResolution(clippingPlanes, layer.context, textureResolutionScratch).y
        },
        // clippingPlanes个数
        s3m_clippingPlanesLength: function () {
            var clippingPlanes = ro.clippingPlanes
            return !Cesium.defined(clippingPlanes) || !clippingPlanes.enabled
                ? 0
                : ro.clippingPlanes.length
        },

        // flattenPolygons投影纹理
        s3m_flattenPolygonsTexture: function () {
            var flattenPlanes = ro.flattenPolygons;
            return !Cesium.defined(flattenPlanes) || !flattenPlanes.enabled
                ? ro._defaultTexture
                : flattenPlanes.flattenPolygonsTexture;
        },
        // 顶点转换至flattenPolygons投影纹理uv坐标的矩阵
        s3m_flattenPolygonsViewProjectionMatrix: function () {
            var flattenPlanes = ro.flattenPolygons;
            var mat4 = new Cesium.Matrix4;
            if (Cesium.defined(flattenPlanes) && flattenPlanes.enabled) {
                Cesium.Matrix4.clone(flattenPlanes.flattenPolygonsCamera.getViewProjection(), mat4);
                Cesium.Matrix4.multiply(mat4, layer.context.uniformState.model, mat4);
            }
            return mat4;
        },
        // flattenPolygons投影纹理uv坐标加修改后depth值转换至当前投影的矩阵
        s3m_flattenPolygonsInverseViewProjectionMatrix: function () {
            var flattenPlanes = ro.flattenPolygons;
            var mat4 = new Cesium.Matrix4;
            if (Cesium.defined(flattenPlanes) && flattenPlanes.enabled) {
                Cesium.Matrix4.clone(flattenPlanes.flattenPolygonsCamera.getInverseViewProjection(), mat4);
                Cesium.Matrix4.multiply(layer.context.uniformState.view3D, mat4, mat4);
            }
            return mat4;
        },

        // clippingPolygons投影纹理
        s3m_clippingPolygonsTexture: function () {
            var flattenPlanes = ro.flattenPolygons;
            return !Cesium.defined(flattenPlanes) || !flattenPlanes.enabled
                ? ro._defaultTexture
                : flattenPlanes.clippingPolygonsTexture;
        },
        // 投影至clippingPolygons投影纹理的矩阵
        s3m_toClippingPolygonsTexture: function () {
            var flattenPlanes = ro.flattenPolygons;
            var mat4 = new Cesium.Matrix4;
            if (Cesium.defined(flattenPlanes) && flattenPlanes.enabled) {
                Cesium.Matrix4.clone(flattenPlanes.clippingPolygonsCamera.getViewProjection(), mat4);
            }
            return mat4;
        },
    }
}

S3MCacheFileRenderEntity.prototype.createCommand = function () {
    if (Cesium.defined(this.colorCommand)) {
        return
    }

    let layer = this.layer
    let context = layer.context
    let vertexPackage = this.vertexPackage
    this._attributeLocations = vertexPackage.attrLocation;
    this._instanceCount = vertexPackage.instanceCount;
    let arrIndexPackage = this.arrIndexPackage
    let attributes = vertexPackage.vertexAttributes
    let attributeLocations = vertexPackage.attrLocation
    if (arrIndexPackage.length < 1) {
        return
    }

    let indexPackage = arrIndexPackage[0]
    let material = this.material

    this.shaderProgram = createShaderProgram(context, attributeLocations, material,vertexPackage)

    this.vertexArray = new Cesium.VertexArray({
        context: context,
        attributes: attributes,
        indexBuffer: indexPackage.indexBuffer
    })

    this.colorCommand = new Cesium.DrawCommand({
        primitiveType : indexPackage.primitiveType,
        modelMatrix : this.modelMatrix,
        boundingVolume : Cesium.BoundingSphere.clone(this.boundingVolume),
        pickId : 'vSecondColor',
        vertexArray : this.vertexArray,
        shaderProgram : this.shaderProgram,
        pass : material.bTransparentSorting ? Cesium.Pass.TRANSLUCENT : Cesium.Pass.CESIUM_3D_TILE,
        renderState : material.bTransparentSorting ? getTransparentRenderState() : getOpaqueRenderState(),
        instanceCount : vertexPackage.instanceCount
    });

    this.colorCommand.uniformMap = getUniformMap(material,layer,this)
    this.vertexPackage = null
    this.arrIndexPackage = null
    this.ready = true
}

function createSelectionMap(ro){
    let pickInfo = ro._pickInfo;
    if(!Cesium.defined(pickInfo) ){
        return;
    }
    ro._selectionInfoMap = new Cesium.AssociativeArray();
    for(let id in pickInfo){
        if(!pickInfo.hasOwnProperty(id)){
            continue;
        }

        ro._selectionInfoMap.set(id, pickInfo[id]);
    }
}

let scratchPntCenter = new Cesium.Cartesian3();
function createBoundingBoxForInstance(ro){
    let vertexPackage = ro.vertexPackage;
    if(!Cesium.defined(vertexPackage) || vertexPackage.instanceIndex === -1 || !Cesium.defined(vertexPackage.instanceBounds)){
        return;
    }
    let instanceBounds = vertexPackage.instanceBounds;
    let pntLU = new Cesium.Cartesian3(instanceBounds[0], instanceBounds[1], instanceBounds[2]);
    let pntRD = new Cesium.Cartesian3(instanceBounds[3], instanceBounds[4], instanceBounds[5]);
    let pntCenter = Cesium.Cartesian3.lerp(pntLU, pntRD, 0.5, scratchPntCenter);
    let dRadius = Cesium.Cartesian3.distance(pntCenter, pntLU);
    let vecCenter = new Cesium.Cartesian3();
    Cesium.Matrix4.multiplyByPoint(ro.modelMatrix, pntCenter, vecCenter);
    ro.boundingVolume.center = vecCenter;
    ro.boundingVolume.radius = dRadius > ro.boundingVolume.radius ? dRadius : ro.boundingVolume.radius;
    vertexPackage.instanceBounds = undefined;
}

function createBatchTable(context, ro){
    let attributes = [];
    attributes.push({
        functionName : 'batchTable_pickColor',
        componentDatatype : Cesium.ComponentDatatype.UNSIGNED_BYTE,
        componentsPerAttribute : 4,
        normalize : true
    })
    let pickInfo = ro._pickInfo;
    let pickIds = Object.keys(pickInfo);
    let numberOfInstances = ro._instanceCount > 0 ? ro._instanceCount : pickIds.length;
    let batchTable = new Cesium.BatchTable(context,attributes,numberOfInstances);
    ro._batchTable = batchTable;
}

var cartesian4Scratch = new Cesium.Cartesian4();
function setPickIdValues(context, ro, layer){
    let batchTable = ro._batchTable;
    let selectionInfoMap = ro._selectionInfoMap;
    let hash = selectionInfoMap._hash;
    for(let id in hash){
        if(hash.hasOwnProperty(id)){
            let selInfo = selectionInfoMap.get(id);
            let pickId;
            if(!Cesium.defined(pickId)){
                pickId = context.createPickId({
                    primitive:layer,
                    id : id
                })
            }
            let pickColor = pickId.color;
            cartesian4Scratch.x = Cesium.Color.floatToByte(pickColor.red);
            cartesian4Scratch.y = Cesium.Color.floatToByte(pickColor.green);
            cartesian4Scratch.z = Cesium.Color.floatToByte(pickColor.blue);
            cartesian4Scratch.w = Cesium.Color.floatToByte(pickColor.alpha);
            let instanceIds = selInfo.instanceIds;
            if(ro._instanceCount > 0){
                instanceIds.map(function(instanceId){
                    batchTable.setBatchedAttribute(instanceId, 0, cartesian4Scratch);
                });
            }else{
                let batchId = selInfo[0].batchId;
                batchTable.setBatchedAttribute(batchId,0,cartesian4Scratch);
            }
        }
    }
}
/**
 * ClippingPlane是否启用
 * @param {S3MCacheFileRenderEntity} ro 渲染实例
 * @returns {bool}
 */
function isClippingEnabled(ro) {
    var clippingPlanes = ro.clippingPlanes;
    return (
        Cesium.defined(clippingPlanes) &&
        clippingPlanes.enabled &&
        clippingPlanes.length !== 0
    )
}
/**
 * FlattenPolygons是否启用
 * @param {S3MCacheFileRenderEntity} ro 渲染实例
 * @returns {bool}
 */
function isFlattenEnabled(ro) {
    var flattenPolygons = ro.flattenPolygons;
    return (
        Cesium.defined(flattenPolygons) &&
        flattenPolygons.enabled &&
        flattenPolygons.length !== 0
    )
}

function updateShaderProgram(context, ro){
    let vp = ro.shaderProgram.vertexShaderSource;
    let fp = ro.shaderProgram.fragmentShaderSource;
    let vs = vp.sources[0];
    let attributeLocations = ro._attributeLocations;

    vs = ro._batchTable.getVertexShaderCallback()(vs);
    vp = new Cesium.ShaderSource({
        defines : vp.defines,
        sources : [vs]
    });

    if(vp.defines.indexOf('BatchTable') === -1){
        vp.defines.push('BatchTable');
    }

    ro.shaderProgram = ro.shaderProgram && ro.shaderProgram.destroy();
    ro.shaderProgram = Cesium.ShaderProgram.fromCache({
        context : context,
        vertexShaderSource : vp,
        fragmentShaderSource : fp,
        attributeLocations : attributeLocations
    });
    ro.colorCommand.shaderProgram = ro.shaderProgram;
}

/**
 * 为ClippingPlaneCollection更新ShaderProgram
 *
 * @param {S3MCacheFileRenderEntity} ro 渲染实例
 * @param {Cesium.Context} context
 */
function updateShaderProgramClipping(context, ro){
    let vp = ro.shaderProgram.vertexShaderSource;
    let fp = ro.shaderProgram.fragmentShaderSource;
    let vs = vp.sources[0];
    let attributeLocations = ro._attributeLocations;

    var addClippingPlaneCode = isClippingEnabled(ro)
    if (addClippingPlaneCode) {
        if(fp.defines.indexOf('clippingPlane') === -1){
            fp.defines.push('clippingPlane')
        }
        if (Cesium.ClippingPlaneCollection.useFloatTexture(context)) {
            if(fp.defines.indexOf('clippingPlanesUsingFloatTexture') === -1) {
                fp.defines.push('clippingPlanesUsingFloatTexture')
            }
        }
        else {
            var index0 = fp.defines.indexOf('clippingPlanesUsingFloatTexture')
            if(index0 !== -1) {
                fp.defines.splice(index0,1)
            }
        }
        if (ro.clippingPlanes.unionClippingRegions) {
            if(fp.defines.indexOf('unionClippingRegions') === -1){
                fp.defines.push('unionClippingRegions')
            }
        }
        else {
            var index1 = fp.defines.indexOf('unionClippingRegions')
            if(index1 !== -1) {
                fp.defines.splice(index1,1)
            }
        }
    }
    else {
        var index2 = fp.defines.indexOf('clippingPlane')
        if(index2 !== -1) {
            fp.defines.splice(index2,1)
        }
    }

    ro.shaderProgram = ro.shaderProgram && ro.shaderProgram.destroy();
    ro.shaderProgram = Cesium.ShaderProgram.fromCache({
        context : context,
        vertexShaderSource : vp,
        fragmentShaderSource : fp,
        attributeLocations : attributeLocations
    });
    ro.colorCommand.shaderProgram = ro.shaderProgram;
}
/**
 * 为FlattenPolygonCollection更新ShaderProgram
 *
 * @param {S3MCacheFileRenderEntity} ro 渲染实例
 * @param {Cesium.Context} context
 */
function updateShaderProgramFlatten(context, ro){
    let vp = ro.shaderProgram.vertexShaderSource;
    let fp = ro.shaderProgram.fragmentShaderSource;
    let vs = vp.sources[0];
    let attributeLocations = ro._attributeLocations;

    var addFlattenPolygonCode = isFlattenEnabled(ro)
    if (addFlattenPolygonCode && ro.flattenPolygons.clippingPolygonsReady) {
        if(fp.defines.indexOf('clippingPolygon') === -1){
            fp.defines.push('clippingPolygon')
        }
    }
    else {
        var index0 = fp.defines.indexOf('clippingPolygon')
        if(index0 !== -1) {
            fp.defines.splice(index0,1)
        }
    }
    if (addFlattenPolygonCode && ro.flattenPolygons.flattenPolygonsReady) {
        if(vp.defines.indexOf('flattenPolygon') === -1){
            vp.defines.push('flattenPolygon')
        }
    }
    else {
        var index1 = fp.defines.indexOf('flattenPolygon')
        if(index1 !== -1) {
            vp.defines.splice(index1,1)
        }
    }

    ro.shaderProgram = ro.shaderProgram && ro.shaderProgram.destroy();
    ro.shaderProgram = Cesium.ShaderProgram.fromCache({
        context : context,
        vertexShaderSource : vp,
        fragmentShaderSource : fp,
        attributeLocations : attributeLocations
    });
    ro.colorCommand.shaderProgram = ro.shaderProgram;
}

function combineUniforms(ro){
    let batchTable = ro._batchTable;
    let command = ro.colorCommand;
    command.uniformMap = batchTable.getUniformMapCallback()(ro.colorCommand.uniformMap);
}

S3MCacheFileRenderEntity.prototype.update = function(frameState, layer) {
    if(!this.ready) {
        createSelectionMap(this);
        createBoundingBoxForInstance(this);
        this.createBuffers(frameState);
        this.createCommand(frameState);
        return ;
    }
    if(!Cesium.defined(this._batchTable)){
        createBatchTable(frameState.context, this);
        updateShaderProgram(frameState.context, this);
        combineUniforms(this);
        setPickIdValues(frameState.context, this, layer);
    }

    var context = frameState.context
    this._defaultTexture = context.defaultTexture
    // clippingPlanes状态发生变化时更新shaderProgram
    var clippingPlanes = this.clippingPlanes
    var clippingPlanesEnable = Cesium.defined(clippingPlanes) && clippingPlanes.enabled;
    if (this._clippingPlanesEnable != clippingPlanesEnable) {
        this._clippingPlanesState = clippingPlanesEnable
        updateShaderProgramClipping(frameState.context, this)
    }
    // flattenPolygonsClipping状态发生变化时更新shaderProgram
    var flattenPolygons = this.flattenPolygons
    var flattenPolygonsClippingReady = Cesium.defined(flattenPolygons) && flattenPolygons.enabled && flattenPolygons.clippingPolygonsReady;
    if (this._flattenPolygonsClippingReady != flattenPolygonsClippingReady) {
        this._flattenPolygonsClippingReady = flattenPolygonsClippingReady
        updateShaderProgramFlatten(frameState.context, this)
    }
    // flattenPolygonsFlatten状态发生变化时更新shaderProgram
    var flattenPolygonsFlattenReady = Cesium.defined(flattenPolygons) && flattenPolygons.enabled && flattenPolygons.flattenPolygonsReady;
    if (this._flattenPolygonsFlattenReady != flattenPolygonsFlattenReady) {
        this._flattenPolygonsFlattenReady = flattenPolygonsFlattenReady
        updateShaderProgramFlatten(frameState.context, this)
    }

    frameState.commandList.push(this.colorCommand)
    this._batchTable.update(frameState)
};

S3MCacheFileRenderEntity.prototype.isDestroyed = function () {
    return false
}

S3MCacheFileRenderEntity.prototype.destroy = function () {
    this.shaderProgram = this.shaderProgram && !this.shaderProgram.isDestroyed() && this.shaderProgram.destroy()
    this.vertexArray = this.vertexArray && !this.vertexArray.isDestroyed() && this.vertexArray.destroy()
    this.colorCommand = undefined
    this.vertexPackage = null
    this.arrIndexPackage = null
    return Cesium.destroyObject(this)
}

export default S3MCacheFileRenderEntity
