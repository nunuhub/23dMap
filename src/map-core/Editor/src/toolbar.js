import Control from 'ol/control/Control';
import '..//style/ole.css';

/**
 * 工具条类
 * The editor's toolbar.
 * @class
 * @alias ole.Toolbar
 */
class Toolbar extends Control {
  /**
   * Constructor.
   * @param {ol.Map} map The map object.
   * @param {ol.Collection.<ol.control.Control>} controls Controls
   * @param {HTMLElement} [options.target] Specify a target if you want
   *   the control to be rendered outside of the map's viewport.
   */
  constructor(map, controls, target, options) {
    const element = document.createElement('div');
    element.setAttribute('id', 'ole-toolbar');
    if (options.width) {
      element.style.width = options.width;
    }
    if (options.background) {
      element.style.background = options.background;
    }

    super({
      element: target || element
    });

    /**
     * @private
     * @type {ol.Collection.<ol.control.Control>}
     */
    this.controls = controls;

    /**
     * @private
     * @type {ol.Map}
     */
    this.map = map;

    // 这里做了添加，实际上如果每个按钮都单独控制，可以不要这个toolbar
    if (!target) {
      this.map.getTargetElement().appendChild(this.element);
    }

    this.load();
    this.controls.on('change:length', this.load.bind(this));
  }

  /**
   * Load the toolbar.
   * @private
   */
  load() {
    for (let i = 0; i < this.controls.getLength(); i += 1) {
      const btn = this.controls.item(i).getElement();
      // 这里加了子控件，
      this.element.appendChild(btn);
    }
  }

  hide() {
    this.element.style.display = 'none';
  }

  /**
   * Destroy the toolbar.
   * @private
   */
  destroy() {
    for (let i = 0; i < this.controls.getLength(); i += 1) {
      // 这里移除子控件
      const btn = this.controls.item(i).getElement();
      this.element.removeChild(btn);
    }
  }
}

export default Toolbar;
