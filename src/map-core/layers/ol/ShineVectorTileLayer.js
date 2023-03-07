import VectorTileLayer from 'ol/layer/VectorTile.js';
import ShineCanvasVectorTileLayerRenderer from './canvas/ShineCanvasVectorTileLayerRenderer';

class ShineVectorTileLayer extends VectorTileLayer {
  constructor(opt_options) {
    const options = opt_options ? opt_options : {};
    super(options);
  }
  createRenderer() {
    return new ShineCanvasVectorTileLayerRenderer(this);
  }
}
export default ShineVectorTileLayer;
