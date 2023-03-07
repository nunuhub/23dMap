import Control from './control';
import clearSVG from '../../img/clear.svg';

/**
 * Control for drawing features.
 * @extends {ole.Control}
 * @alias ole.DrawControl
 */
class ClearControl extends Control {
  /**
   * @param {Object} [options] Tool options.
   * @param {string} [options.type] Geometry type ('Point', 'LineString', 'Polygon',
   *   'MultiPoint', 'MultiLineString', 'MultiPolygon' or 'Circle').
   *   Default is 'Point'.
   * @param {ol.style.Style.StyleLike} [options.style] Style used for the draw interaction.
   */
  constructor(options) {
    const image = clearSVG;

    super(
      Object.assign(
        {
          title: '清除',
          className: 'ole-control-clear',
          image
        },
        options
      )
    );

    this.setMap(options.map);
    this.source = options.source;
    // this.map.setSelectFeatures(selectedFeatures)
  }

  /**
   * Click handler for the control element.
   * @private
   */
  onClick() {
    this.source.clear();
    this.map.setSelectFeatures([]);
  }

  /**
   * @inheritdoc
   */
  /* deactivate(silent) {
    this.map.removeInteraction(this.drawInteraction);
    super.deactivate(silent);
  } */
}

export default ClearControl;
