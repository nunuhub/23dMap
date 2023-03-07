import { LineString, Polygon, MultiPolygon } from 'ol/geom';
import { Select } from '../interaction';
import Control from './control';
import bufferSVG from '../../img/buffer.svg';
import { buffer } from '@turf/turf';
import {
  multiPolygon as turfMultiPolygon,
  polygon as turfPolygon,
  lineString as turfLineString
} from '@turf/helpers';
import GeoJSON from 'ol/format/GeoJSON';

/**
 * Control for creating buffers.
 * @extends {ole.Control}
 * @alias ole.BufferControl
 */
class BufferControl extends Control {
  /**
   * @inheritdoc
   * @param {Object} [options] Control options.
   * @param {number} [options.hitTolerance] Select tolerance in pixels
   *   (default is 10)
   * @param {boolean} [options.multi] Allow selection of multiple geometries
   *   (default is false).
   * @param {ol.style.Style.StyleLike} [options.style] Style used when a feature is selected.
   */
  constructor(options) {
    super(
      Object.assign(
        {
          title: '图形缓冲',
          className: 'ole-control-buffer',
          image: bufferSVG,
          buffer: 50
        },
        options
      )
    );

    /**
     * @type {ol.interaction.Select}
     * @private
     */
    this.selectInteraction = new Select({
      layers: this.layerFilter,
      hitTolerance:
        options.hitTolerance === undefined ? 10 : options.hitTolerance,
      multi: typeof options.multi === 'undefined' ? true : options.multi,
      style: options.style
    });
  }

  /**
   * @inheritdoc
   */
  getDialogTemplate() {
    return `
      <label>缓冲距离: &nbsp;
        <input type="text" id="buffer-width"
          value="${this.properties.buffer}"
        />
      </label>
      <input type="button" value="OK" id="buffer-btn" />
    `;
  }

  /**
   * Apply a buffer for seleted features.
   * @param {Number} width Buffer width in map units.
   */
  buffer(width) {
    /* const parser = new jsts.io.OL3Parser();
    parser.inject(
      Point,
      LineString,
      LinearRing,
      Polygon,
      MultiPoint,
      MultiLineString,
      MultiPolygon,
    ); */
    const features = this.selectInteraction.getFeatures().getArray();
    // const features = this.map.getSelectFeatures()
    for (let i = 0; i < features.length; i += 1) {
      const geo = features[i].getGeometry();
      const coord = geo.getCoordinates();
      let py = null;
      if (geo instanceof MultiPolygon) {
        py = turfMultiPolygon(coord);
      } else if (geo instanceof Polygon) {
        py = turfPolygon(coord);
      } else if (geo instanceof LineString) {
        py = turfLineString(coord);
      }
      const result = buffer(py, width, { units: 'degrees' });
      const feature = new GeoJSON().readFeature(result);
      features[i].setGeometry(feature.getGeometry());
    }
  }

  /**
   * @inheritdoc
   */
  activate() {
    this.map.addInteraction(this.selectInteraction);
    super.activate();

    document.getElementById('buffer-width').addEventListener('change', (e) => {
      this.setProperties({
        buffer: e.target.value
      });
    });

    document.getElementById('buffer-btn').addEventListener('click', () => {
      const input = document.getElementById('buffer-width');
      const project = this.map.getView().getProjection();
      const mapUnit = project.getUnits();
      let width = parseInt(input.value, 10);
      if (mapUnit.toString() === 'degrees') {
        width = (width / (2 * Math.PI * 6371004)) * 360;
      }
      if (width) {
        this.buffer(width);
      }
    });
  }

  /**
   * @inheritdoc
   */
  deactivate() {
    this.map.removeInteraction(this.selectInteraction);
    super.deactivate();
  }
}

export default BufferControl;
