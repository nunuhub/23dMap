import * as Cesium from 'cesium_shinegis_earth'
import S3MCreateVertexJob from '../S3MCreateVertexJob'
import S3MCreateIndexJob from '../S3MCreateIndexJob'

function RenderEntity(options) {
    this.layer = options.layer
    this.vertexPackage = options.vertexPackage
    this.arrIndexPackage = options.arrIndexPackage
    this.vertexBufferToCreate = new Cesium.Queue()
    this.indexBufferToCreate = new Cesium.Queue()
    let i, j
    for (i = 0, j = this.vertexPackage.vertexAttributes.length; i < j; i++) {
        this.vertexBufferToCreate.enqueue(i)
    }

    for (i = 0, j = this.arrIndexPackage.length; i < j; i++) {
        this.indexBufferToCreate.enqueue(i)
    }

    this.boundingVolume = options.boundingVolume
    this.material = options.material
    this.modelMatrix = options.modelMatrix
    this.shaderProgram = undefined
    this.vertexArray = undefined
    this.colorCommand = undefined
    this.ready = false
    this._pickInfo = options.pickInfo;
    this._selectionInfoMap = undefined;
    this._batchTable = undefined;
    this._attributeLocations = undefined;
    this._instanceCount = 0;
}


let _vertexBufferJob = new S3MCreateVertexJob()
let _indexBufferJob = new S3MCreateIndexJob()

function createVertexBuffers(renderEntity, frameState) {
    let context = renderEntity.layer.context
    let queue = renderEntity.vertexBufferToCreate
    while (queue.length) {
        let index = queue.peek()
        _vertexBufferJob.set(context, renderEntity, index)
        if (!frameState.jobScheduler.execute(_vertexBufferJob, Cesium.JobType.BUFFER)) {
            break
        }

        queue.dequeue()
    }
}

function createIndexBuffers(renderEntity, frameState) {
    let context = renderEntity.layer.context
    let queue = renderEntity.indexBufferToCreate
    while (queue.length) {
        let index = queue.peek()
        _indexBufferJob.set(context, renderEntity, index)
        if (!frameState.jobScheduler.execute(_indexBufferJob, Cesium.JobType.BUFFER)) {
            break
        }

        queue.dequeue()
    }
}

RenderEntity.prototype.createBuffers = function (frameState) {
    createVertexBuffers(this, frameState)
    createIndexBuffers(this, frameState)
}
RenderEntity.prototype.createCommand = Cesium.DeveloperError.throwInstantiationError

RenderEntity.prototype.update = Cesium.DeveloperError.throwInstantiationError

RenderEntity.prototype.isDestroyed = Cesium.DeveloperError.throwInstantiationError

RenderEntity.prototype.destroy = Cesium.DeveloperError.throwInstantiationError
export default RenderEntity
