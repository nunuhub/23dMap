import CanvasVectorTileLayerRenderer from 'ol/renderer/canvas/VectorTileLayer';
import { getUid } from 'ol/util.js';
import {
  reset as resetTransform,
  scale as scaleTransform,
  translate as translateTransform
} from 'ol/transform.js';
import ReplayType from 'ol/render/canvas/BuilderType.js';
const IMAGE_REPLAYS = {
  image: [
    ReplayType.POLYGON,
    ReplayType.CIRCLE,
    ReplayType.LINE_STRING,
    ReplayType.IMAGE,
    ReplayType.TEXT
  ],
  hybrid: [ReplayType.POLYGON, ReplayType.LINE_STRING],
  vector: []
};

class ShineCanvasVectorTileLayerRenderer extends CanvasVectorTileLayerRenderer {
  constructor(layer) {
    super(layer);
  }
  renderTileImage_(tile, frameState) {
    const layer = /** @type {import("../../layer/VectorTile.js").default} */ (
      this.getLayer()
    );
    const replayState = tile.getReplayState(layer);
    const revision = layer.getRevision();
    const executorGroups = tile.executorGroups[getUid(layer)];
    replayState.renderedTileRevision = revision;

    const tileCoord = tile.wrappedTileCoord;
    const z = tileCoord[0];
    const source = layer.getSource();
    let pixelRatio = frameState.pixelRatio;
    const viewState = frameState.viewState;
    const projection = viewState.projection;
    const tileGrid = source.getTileGridForProjection(projection);
    const tileResolution = tileGrid.getResolution(tile.tileCoord[0]);
    const renderPixelRatio =
      (frameState.pixelRatio / tile.wantedResolution) * tileResolution;
    const resolution = tileGrid.getResolution(z);
    const context = tile.getContext(layer);

    // Increase tile size when overzooming for low pixel ratio, to avoid blurry tiles
    // edit 去掉了Math.round
    pixelRatio = Math.max(pixelRatio, renderPixelRatio / pixelRatio);
    const size = source.getTilePixelSize(z, pixelRatio, projection);
    context.canvas.width = size[0];
    context.canvas.height = size[1];
    const renderScale = pixelRatio / renderPixelRatio;
    if (renderScale !== 1) {
      const canvasTransform = resetTransform(this.tmpTransform_);
      scaleTransform(canvasTransform, renderScale, renderScale);
      context.setTransform.apply(context, canvasTransform);
    }
    const tileExtent = tileGrid.getTileCoordExtent(tileCoord, this.tmpExtent);
    const pixelScale = renderPixelRatio / resolution;
    const transform = resetTransform(this.tmpTransform_);
    scaleTransform(transform, pixelScale, -pixelScale);
    translateTransform(transform, -tileExtent[0], -tileExtent[3]);
    for (let i = 0, ii = executorGroups.length; i < ii; ++i) {
      const executorGroup = executorGroups[i];
      executorGroup.execute(
        context,
        renderScale,
        transform,
        0,
        true,
        IMAGE_REPLAYS[layer.getRenderMode()]
      );
    }
    replayState.renderedTileResolution = tile.wantedResolution;
  }
}
export default ShineCanvasVectorTileLayerRenderer;
