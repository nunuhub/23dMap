import { Tile as TileLayer } from 'ol/layer';
import { XYZ } from 'ol/source';
import { addCoordinateTransforms, addProjection, Projection } from 'ol/proj';
import { ll2smerc, smerc2ll, datum } from 'projzh';

class GaodeLayer {
  constructor(map) {
    this.map = map;
  }

  generate(data) {
    return new Promise((resolve) => {
      const gcj02Extent = [
        -20037508.342789244, -20037508.342789244, 20037508.342789244,
        20037508.342789244
      ];
      const gcjMecator = new Projection({
        code: 'GCJ-02',
        extent: gcj02Extent,
        units: 'm'
      });
      addProjection(gcjMecator);
      addCoordinateTransforms(
        'EPSG:4490',
        gcjMecator,
        this.ll2gmerc,
        this.gmerc2ll
      );
      addCoordinateTransforms(
        'EPSG:3857',
        gcjMecator,
        this.smerc2gmerc,
        this.gmerc2smerc
      );

      let layer = new TileLayer({
        id: data.id,
        info: data,
        layerTag: data.layerTag,
        initExtent: gcj02Extent,
        opacity: data.opacity,
        zIndex: data.mapIndex,
        isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
        source: new XYZ({
          crossOrigin: 'anonymous',
          projection: gcjMecator,
          url: data.url
        })
      });
      let extent = layer.getSource().getTileGrid().getExtent();
      layer.set('initExtent', extent);
      resolve(layer);
    });
  }

  ll2gmerc(input, opt_output, opt_dimension) {
    let output = datum.gcj02.fromWGS84(input, opt_output, opt_dimension);
    return ll2smerc(output, output, opt_dimension);
  }
  gmerc2ll(input, opt_output, opt_dimension) {
    let output = smerc2ll(input, input, opt_dimension);
    return datum.gcj02.toWGS84(output, opt_output, opt_dimension);
  }
  smerc2gmerc(input, opt_output, opt_dimension) {
    let output = smerc2ll(input, input, opt_dimension);
    output = datum.gcj02.fromWGS84(output, output, opt_dimension);
    return ll2smerc(output, output, opt_dimension);
  }
  gmerc2smerc(input, opt_output, opt_dimension) {
    let output = smerc2ll(input, input, opt_dimension);
    output = datum.gcj02.toWGS84(output, output, opt_dimension);
    return ll2smerc(output, output, opt_dimension);
  }
}

export default GaodeLayer;
