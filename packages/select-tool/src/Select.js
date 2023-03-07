/* eslint-disable no-prototype-builtins */
var __extends =
  (this && this.__extends) ||
  (function () {
    var extendStatics = function (d, b) {
      extendStatics =
        Object.setPrototypeOf ||
        ({
          __proto__: []
        } instanceof Array &&
          function (d, b) {
            d.__proto__ = b;
          }) ||
        function (d, b) {
          for (var p in b) {
            if (b.hasOwnProperty(p)) d[p] = b[p];
          }
        };
      return extendStatics(d, b);
    };
    return function (d, b) {
      extendStatics(d, b);

      function __() {
        this.constructor = d;
      }

      d.prototype =
        b === null
          ? Object.create(b)
          : ((__.prototype = b.prototype), new __());
    };
  })();
/**
 * @module ol/interaction/Select
 */
import { getUid } from 'ol/util.js';
import CollectionEventType from 'ol/CollectionEventType.js';
import { extend, includes } from 'ol/array.js';
import Event from 'ol/events/Event.js';
import {
  altKeyOnly,
  platformModifierKeyOnly,
  singleClick,
  never
} from 'ol/events/condition.js';
import { TRUE } from 'ol/functions.js';
import GeometryType from 'ol/geom/GeometryType.js';
import Interaction from 'ol/interaction/Interaction.js';
import { clear } from 'ol/obj.js';
import { createEditingStyle } from 'ol/style/Style.js';
import Collection from 'ol/Collection.js';
import GeoJSON from 'ol/format/GeoJSON';
import Point from 'ol/geom/Point';
import IdentifyParameters from 'shinegis-client-23d/src/utils/tasks/geoserver/IdentifyParameters';
import IdentifyTask from 'shinegis-client-23d/src/utils/tasks/geoserver/IdentifyTask';
import EsriIdentify from 'shinegis-client-23d/src/utils/tasks/esri/Identify';
import { getGeom } from '@turf/invariant';
import booleanEqual from '@turf/boolean-equal';
import Feature from 'ol/Feature';
import { selectStyles } from 'shinegis-client-23d/src/utils/olUtil';

/**
 * @enum {string}
 */
var SelectEventType = {
  /**
   * Triggered when feature(s) has been (de)selected.
   * @event SelectEvent#select
   * @api
   */
  SELECT: 'select'
};
/**
 * A function that takes an {@link module:ol/Feature} or
 * {@link module:ol/render/Feature} and an
 * {@link module:ol/layer/Layer} and returns `true` if the feature may be
 * selected or `false` otherwise.
 * @typedef {function(import("../Feature.js").FeatureLike, import("../layer/Layer.js").default):boolean} FilterFunction
 */
/**
 * @typedef {Object} Options
 * @property {import("../events/condition.js").Condition} [addCondition] A function
 * that takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a
 * boolean to indicate whether that event should be handled.
 * By default, this is {@link module:ol/events/condition~never}. Use this if you
 * want to use different events for add and remove instead of `toggle`.
 * @property {import("../events/condition.js").Condition} [condition] A function that
 * takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a
 * boolean to indicate whether that event should be handled. This is the event
 * for the selected features as a whole. By default, this is
 * {@link module:ol/events/condition~singleClick}. Clicking on a feature selects that
 * feature and removes any that were in the selection. Clicking outside any
 * feature removes all from the selection.
 * See `toggle`, `add`, `remove` options for adding/removing extra features to/
 * from the selection.
 * @property {Array<import("../layer/Layer.js").default>|function(import("../layer/Layer.js").default): boolean} [layers]
 * A list of layers from which features should be selected. Alternatively, a
 * filter function can be provided. The function will be called for each layer
 * in the map and should return `true` for layers that you want to be
 * selectable. If the option is absent, all visible layers will be considered
 * selectable.
 * @property {import("../style/Style.js").StyleLike} [style]
 * Style for the selected features. By default the default edit style is used
 * (see {@link module:ol/style}).
 * If set to `false` the selected feature's style will not change.
 * @property {import("../events/condition.js").Condition} [removeCondition] A function
 * that takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a
 * boolean to indicate whether that event should be handled.
 * By default, this is {@link module:ol/events/condition~never}. Use this if you
 * want to use different events for add and remove instead of `toggle`.
 * @property {import("../events/condition.js").Condition} [toggleCondition] A function
 * that takes an {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a
 * boolean to indicate whether that event should be handled. This is in addition
 * to the `condition` event. By default,
 * {@link module:ol/events/condition~shiftKeyOnly}, i.e. pressing `shift` as
 * well as the `condition` event, adds that feature to the current selection if
 * it is not currently selected, and removes it if it is. See `add` and `remove`
 * if you want to use different events instead of a toggle.
 * @property {boolean} [multi=false] A boolean that determines if the default
 * behaviour should select only single features or all (overlapping) features at
 * the clicked map position. The default of `false` means single select.
 * @property {import("../Collection.js").default<import("../Feature.js").default>} [features]
 * Collection where the interaction will place selected features. Optional. If
 * not set the interaction will create a collection. In any case the collection
 * used by the interaction is returned by
 * {@link module:ol/interaction/Select~Select#getFeatures}.
 * @property {FilterFunction} [filter] A function
 * that takes an {@link module:ol/Feature} and an
 * {@link module:ol/layer/Layer} and returns `true` if the feature may be
 * selected or `false` otherwise.
 * @property {number} [hitTolerance=0] Hit-detection tolerance. Pixels inside
 * the radius around the given position will be checked for features.
 */
/**
 * @classdesc
 * Events emitted by {@link module:ol/interaction/Select~Select} instances are instances of
 * this type.
 */
var SelectEvent = /** @class */ (function (_super) {
  __extends(SelectEvent, _super);

  /**
   * @param {SelectEventType} type The event type.
   * @param {Array<import("../Feature.js").default>} selected Selected features.
   * @param {Array<import("../Feature.js").default>} deselected Deselected features.
   * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Associated
   *     {@link module:ol/MapBrowserEvent}.
   */
  function SelectEvent(type, selected, deselected, mapBrowserEvent) {
    var _this = _super.call(this, type) || this;
    /**
     * Selected features array.
     * @type {Array<import("../Feature.js").default>}
     * @api
     */
    _this.selected = selected;
    /**
     * Deselected features array.
     * @type {Array<import("../Feature.js").default>}
     * @api
     */
    _this.deselected = deselected;
    /**
     * Associated {@link module:ol/MapBrowserEvent}.
     * @type {import("../MapBrowserEvent.js").default}
     * @api
     */
    _this.mapBrowserEvent = mapBrowserEvent;
    return _this;
  }

  return SelectEvent;
})(Event);

var SelectedEvent = /** @class */ (function (_super) {
  __extends(SelectedEvent, _super);

  function SelectedEvent(type, feature) {
    var _this = _super.call(this, type) || this;
    _this.feature = feature;
    return _this;
  }

  return SelectedEvent;
})(Event);
/**
 * @classdesc
 * Interaction for selecting vector features. By default, selected features are
 * styled differently, so this interaction can be used for visual highlighting,
 * as well as selecting features for other actions, such as modification or
 * output. There are three ways of controlling which features are selected:
 * using the browser event as defined by the `condition` and optionally the
 * `toggle`, `add`/`remove`, and `multi` options; a `layers` filter; and a
 * further feature filter using the `filter` option.
 *
 * Selected features are added to an internal unmanaged layer.
 *
 * @fires SelectEvent
 * @api
 */
var Select = /** @class */ (function (_super) {
  __extends(Select, _super);

  /**
   * @param {Options=} opt_options Options.
   */
  function Select(opt_options) {
    var _this =
      _super.call(this, {
        handleEvent: handleEvent
      }) || this;
    var options = opt_options ? opt_options : {};
    /**
     * @private
     * @type {import("../events/condition.js").Condition}
     */
    _this.condition_ = options.condition ? options.condition : singleClick;
    /**
     * @private
     * @type {import("../events/condition.js").Condition}
     */
    _this.addCondition_ = options.addCondition
      ? options.addCondition
      : platformModifierKeyOnly;
    /**
     * @private
     * @type {import("../events/condition.js").Condition}
     */
    _this.removeCondition_ = options.removeCondition
      ? options.removeCondition
      : never;
    /**
     * @private
     * @type {import("../events/condition.js").Condition}
     */
    _this.toggleCondition_ = options.toggleCondition
      ? options.toggleCondition
      : altKeyOnly;
    /**
     * @private
     * @type {boolean}
     */
    _this.multi_ = options.multi ? options.multi : false;
    /**
     * @private
     * @type {FilterFunction}
     */
    _this.filter_ = options.filter ? options.filter : TRUE;
    /**
     * @private
     * @type {number}
     */
    _this.hitTolerance_ = options.hitTolerance ? options.hitTolerance : 0;
    /**
     * @private
     * @type {import("../style/Style.js").default|Array.<import("../style/Style.js").default>|import("../style/Style.js").StyleFunction|null}
     */
    _this.style_ =
      options.style != null ? options.style : getDefaultStyleFunction();
    /**
     * An association between selected feature (key)
     * and original style (value)
     * @private
     * @type {Object.<number, import("../style/Style.js").default|Array.<import("../style/Style.js").default>|import("../style/Style.js").StyleFunction>}
     */
    _this.featureStyleAssociation_ = {};
    /**
     * @private
     * @type {import("../Collection.js").default}
     */
    _this.features_ = options.features || new Collection();
    /** @type {function(import("../layer/Layer.js").default): boolean} */
    var layerFilter;
    if (options.layers) {
      if (typeof options.layers === 'function') {
        layerFilter = options.layers;
      } else {
        var layers_1 = options.layers;
        layerFilter = function (layer) {
          return includes(layers_1, layer);
        };
      }
    } else {
      layerFilter = TRUE;
    }
    /**
     * @private
     * @type {function(import("../layer/Layer.js").default): boolean}
     */
    _this.layerFilter_ = layerFilter;
    /**
     * An association between selected feature (key)
     * and layer (value)
     * @private
     * @type {Object<string, import("../layer/Layer.js").default>}
     */
    _this.featureLayerAssociation_ = {};
    var features = _this.getFeatures();
    features.addEventListener(
      CollectionEventType.ADD,
      _this.addFeature_.bind(_this)
    );
    features.addEventListener(
      CollectionEventType.REMOVE,
      _this.removeFeature_.bind(_this)
    );
    return _this;
  }

  /**
   * @param {import("../Feature.js").FeatureLike} feature Feature.
   * @param {import("../layer/Layer.js").default} layer Layer.
   * @private
   */
  Select.prototype.addFeatureLayerAssociation_ = function (feature, layer) {
    this.featureLayerAssociation_[getUid(feature)] = layer;
  };
  /**
   * Get the selected features.
   * @return {import("../Collection.js").default<import("../Feature.js").default>} Features collection.
   * @api
   */
  Select.prototype.getFeatures = function () {
    return this.features_;
  };
  /**
   * Returns the Hit-detection tolerance.
   * @returns {number} Hit tolerance in pixels.
   * @api
   */
  Select.prototype.getHitTolerance = function () {
    return this.hitTolerance_;
  };
  /**
   * Returns the associated {@link module:ol/layer/Vector~Vector vectorlayer} of
   * the (last) selected feature. Note that this will not work with any
   * programmatic method like pushing features to
   * {@link module:ol/interaction/Select~Select#getFeatures collection}.
   * @param {import("../Feature.js").FeatureLike} feature Feature
   * @return {import('../layer/Vector.js').default} Layer.
   * @api
   */
  Select.prototype.getLayer = function (feature) {
    return (
      /** @type {import('../layer/Vector.js').default} */
      (this.featureLayerAssociation_[getUid(feature)])
    );
  };
  /**
   * Hit-detection tolerance. Pixels inside the radius around the given position
   * will be checked for features.
   * @param {number} hitTolerance Hit tolerance in pixels.
   * @api
   */
  Select.prototype.setHitTolerance = function (hitTolerance) {
    this.hitTolerance_ = hitTolerance;
  };
  /**
   * Remove the interaction from its current map, if any,  and attach it to a new
   * map, if any. Pass `null` to just remove the interaction from the current map.
   * @param {import("../PluggableMap.js").default} map Map.
   * @override
   * @api
   */
  Select.prototype.setMap = function (map) {
    // var currentMap = this.getMap();
    if (map) {
      this.layerManager = map.layerManager;
    }
    if (map && this.style_) {
      this.features_.forEach(this.removeSelectedStyle_.bind(this));
    }
    _super.prototype.setMap.call(this, map);
    if (map && this.style_) {
      this.features_.forEach(this.giveSelectedStyle_.bind(this));
    }
  };
  /**
   * @param {import("../Collection.js").CollectionEvent} evt Event.
   * @private
   */
  Select.prototype.addFeature_ = function (evt) {
    var feature = evt.element;
    if (this.style_) {
      this.giveSelectedStyle_(feature);
    }
  };
  /**
   * @param {import("../Collection.js").CollectionEvent} evt Event.
   * @private
   */
  Select.prototype.removeFeature_ = function (evt) {
    var feature = evt.element;
    if (this.style_) {
      this.removeSelectedStyle_(feature);
    }
  };
  /**
   * @param {import("../Feature.js").default} feature Feature
   * @private
   */
  Select.prototype.giveSelectedStyle_ = function (feature) {
    var key = getUid(feature);
    this.featureStyleAssociation_[key] = feature.getStyle();
    feature.setStyle(this.style_);
  };
  /**
   * @param {import("../Feature.js").default} feature Feature
   * @private
   */
  Select.prototype.removeSelectedStyle_ = function (feature) {
    var key = getUid(feature);
    feature.setStyle(this.featureStyleAssociation_[key]);
    delete this.featureStyleAssociation_[key];
  };
  /**
   * @param {import("../Feature.js").FeatureLike} feature Feature.
   * @private
   */
  Select.prototype.removeFeatureLayerAssociation_ = function (feature) {
    delete this.featureLayerAssociation_[getUid(feature)];
  };
  Select.prototype.setIsStayAdd = function (isStayAdd) {
    this.isStayAddValue = isStayAdd;
  };
  Select.prototype.isStayAdd = function () {
    return this.isStayAddValue;
  };
  return Select;
})(Interaction);

/**
 * Handles the {@link module:ol/MapBrowserEvent map browser event} and may change the
 * selected state of features.
 * @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Map browser event.
 * @return {boolean} `false` to stop event propagation.
 * @this {Select}
 */
function handleEvent(mapBrowserEvent) {
  if (!this.condition_(mapBrowserEvent)) {
    return true;
  }
  var add;
  if (this.isStayAdd()) {
    add = this.add = true;
  } else {
    // var add = this.add = false;
    add = this.add = this.addCondition_(mapBrowserEvent);
  }
  var remove = (this.remove = this.removeCondition_(mapBrowserEvent));
  var toggle = (this.toggle = this.toggleCondition_(mapBrowserEvent));
  var set = !add && !remove && !toggle;
  var map = (this.map = mapBrowserEvent.map);
  this.features = this.getFeatures(); //历史选中
  this.deselected = [];
  this.selected = []; //本次选中
  const geojsonFormat = new GeoJSON();
  const point = new Point(map.getCoordinateFromPixel(mapBrowserEvent.pixel));
  const geojson = geojsonFormat.writeGeometry(point);
  if (set) {
    // Replace the currently selected feature(s) with the feature(s) at the
    // pixel, or clear the selected feature(s) if there is no feature at
    // the pixel.
    clear(this.featureLayerAssociation_);
    map.forEachFeatureAtPixel(
      mapBrowserEvent.pixel,
      /**
       * @param {import("../Feature.js").FeatureLike} feature Feature.
       * @param {import("../layer/Layer.js").default} layer Layer.
       * @return {boolean|undefined} Continue to iterate over the features.
       */
      function (feature, layer) {
        if (this.filter_(feature, layer)) {
          this.selected.push(feature);
          this.addFeatureLayerAssociation_(feature, layer);
          if (layer.values_.id === 'drawLayer') {
            feature.set('layerTag', 'temp');
            feature.set('tempSelected', true);
            this.dispatchEvent(new SelectedEvent('featureSelected', feature));
            //this.map.setSelectFeatures(this.selected);
          }
          return !this.multi_;
        }
      }.bind(this),
      {
        layerFilter: this.layerFilter_,
        hitTolerance: this.hitTolerance_
      }
    );
    for (var i = this.features.getLength() - 1; i >= 0; --i) {
      var feature = this.features.item(i);
      var index = this.selected.indexOf(feature);
      if (index > -1) {
        // feature is already selected
        this.selected.splice(index, 1);
      } else {
        this.features.remove(feature);
        this.deselected.push(feature);
      }
    }
    if (this.selected.length !== 0) {
      this.features.extend(this.selected);
    }
    this.currentEditTargetLayer = this.layerManager.getEditLayer()
      ? this.layerManager.getEditLayer().metadata
      : null;

    if (this.currentEditTargetLayer != null) {
      if (
        this.currentEditTargetLayer.type === 'dynamic' ||
        this.currentEditTargetLayer.type === 'feature' ||
        this.currentEditTargetLayer.type === 'feature-pbf'
      ) {
        let visible = this.currentEditTargetLayer.selectLayer
          ? this.currentEditTargetLayer.selectLayer
          : this.currentEditTargetLayer.visibleLayers.join(',');
        let queryOption = {
          layers: 'visible:' + visible
        };
        if (this.currentEditTargetLayer.filter) {
          queryOption.layerDefs = this.currentEditTargetLayer.filter;
        }
        if (this.currentEditTargetLayer.authkey) {
          queryOption.authkey = this.currentEditTargetLayer.authkey;
        }
        let identifyTask = new EsriIdentify(
          this.currentEditTargetLayer.url,
          queryOption,
          this.currentEditTargetLayer
        );
        identifyTask.at(geojson, { map });
        identifyTask.run().then((response) => {
          if (response.results.length) {
            const feature = new Feature({
              geometry: geojsonFormat.readGeometry(response.results[0].geometry)
            });
            setFeatureAttr(response.results[0], feature);
            setFeature(this, feature);
          }
        });
      } else if (
        this.currentEditTargetLayer.type === 'geoserver-wms' ||
        this.currentEditTargetLayer.type === 'geoserver-wfs'
      ) {
        const params = new IdentifyParameters(
          this.currentEditTargetLayer,
          geojson,
          { map }
        );
        const identifyTask = new IdentifyTask();

        identifyTask.execute(params).then((response) => {
          if (response.results.length) {
            const feature = new Feature({
              geometry: geojsonFormat.readGeometry(response.results[0].geometry)
            });
            setFeatureAttr(response.results[0], feature);
            setFeature(this, feature);
          }
        });
      }
    }
  } else {
    // Modify the currently selected feature(s).
    map.forEachFeatureAtPixel(
      mapBrowserEvent.pixel,
      /**
       * @param {import("../Feature.js").FeatureLike} feature Feature.
       * @param {import("../layer/Layer.js").default} layer Layer.
       * @return {boolean|undefined} Continue to iterate over the features.
       */
      function (feature, layer) {
        if (this.filter_(feature, layer)) {
          /*if ((add || toggle) && !includes(this.features.getArray(), feature)) {
            this.selected.push(feature);
            this.addFeatureLayerAssociation_(feature, layer);
          } else if (
            (remove || toggle) &&
            includes(this.features.getArray(), feature)
          ) {
            this.deselected.push(feature);
            this.removeFeatureLayerAssociation_(feature);
          }*/
          if (layer.values_.id === 'drawLayer') {
            feature.set('layerTag', 'temp');
            //feature.set('tempSelected', true);
            this.selected.push(feature);
            this.dispatchEvent(new SelectedEvent('featureSelected', feature));
            //this.map.setSelectFeatures(this.selected);
          }
          return !this.multi_;
        }
      }.bind(this),
      {
        layerFilter: this.layerFilter_,
        hitTolerance: this.hitTolerance_
      }
    );
    for (var j = this.deselected.length - 1; j >= 0; --j) {
      this.features.remove(this.deselected[j]);
    }
    this.features.extend(this.selected);
    this.currentEditTargetLayer = this.layerManager.getEditLayer()
      ? this.layerManager.getEditLayer().metadata
      : null;
    if (this.currentEditTargetLayer != null) {
      if (
        this.currentEditTargetLayer.type === 'dynamic' ||
        this.currentEditTargetLayer.type === 'feature' ||
        this.currentEditTargetLayer.type === 'feature-pbf'
      ) {
        let queryOption = {
          layers:
            'visible:' + this.currentEditTargetLayer.visibleLayers.join(',')
        };
        if (this.currentEditTargetLayer.filter) {
          queryOption.layerDefs = this.currentEditTargetLayer.filter;
        }
        if (this.currentEditTargetLayer.authkey) {
          queryOption.authkey = this.currentEditTargetLayer.authkey;
        }
        let identifyTask = new EsriIdentify(
          this.currentEditTargetLayer.url,
          queryOption,
          this.currentEditTargetLayer
        );
        identifyTask.at(geojson, { map });
        identifyTask.run().then((response) => {
          if (response.results.length) {
            const feature = new Feature({
              geometry: geojsonFormat.readGeometry(response.results[0].geometry)
            });
            setFeatureAttr(response.results[0], feature);
            addFeature(this, feature);
          }
        });
      } else if (
        this.currentEditTargetLayer.type === 'geoserver-wms' ||
        this.currentEditTargetLayer.type === 'geoserver-wfs'
      ) {
        const params = new IdentifyParameters(
          this.currentEditTargetLayer,
          geojson,
          { map }
        );
        const identifyTask = new IdentifyTask();

        identifyTask.execute(params).then((response) => {
          if (response.results.length) {
            const feature = new Feature({
              geometry: geojsonFormat.readGeometry(response.results[0].geometry)
            });
            setFeatureAttr(response.results[0], feature);
            addFeature(this, feature);
          }
        });
      }
    }
  }

  /*if (this.selected.length > 0 || this.deselected.length > 0) {
    this.dispatchEvent(
      new SelectEvent(
        SelectEventType.SELECT,
        this.selected,
        this.deselected,
        mapBrowserEvent
      )
    );
  }*/
  // 可以点空白处取消选中
  this.dispatchEvent(
    new SelectEvent(
      SelectEventType.SELECT,
      this.selected,
      this.deselected,
      mapBrowserEvent
    )
  );
  return true;
}
function setFeatureAttr(resultItem, feature) {
  for (let key in resultItem.attributes) {
    feature.set(key?.toLowerCase(), resultItem.attributes[key]);
  }
}
function setFeature(self, element) {
  element.set('layerTag', self.currentEditTargetLayer.layerTag);
  self.dispatchEvent(new SelectedEvent('featureSelected', element));
  // 在每次选择时，先清空其他图层选择的状态，防止图层样式重复渲染
  var selectArray = self.map.getSelectFeatures();
  for (let i = 0; i < selectArray.length; i++) {
    var selectedItem = selectArray[i];
    if (selectedItem.get('isSelected')) {
      selectArray.splice(i, 1);
      i--;
      self.map
        .getLayerById('drawLayer')
        .getSource()
        .removeFeature(selectedItem);
    }
  }
  // 图层样式重复渲染结束
  element.set('isSelected', true);
  element.setStyle(selectStyles);
  self.map.getLayerById('drawLayer').getSource().addFeature(element);
  self.selected.push(element);
  //self.map.setSelectFeatures(self.selected);
  self.addFeatureLayerAssociation_(
    element,
    self.map.getLayerById(self.currentEditTargetLayer.id)
  );
  for (let i = self.features.getLength() - 1; i >= 0; --i) {
    var feature = self.features.item(i);
    var index = self.selected.indexOf(feature);
    if (index > -1) {
      // feature is already selected
      self.selected.splice(index, 1);
    } else {
      self.features.remove(feature);
      self.deselected.push(feature);
    }
  }
  if (self.selected.length !== 0) {
    self.features.extend(self.selected);
  }
}

function addFeature(self, element) {
  self.dispatchEvent(new SelectedEvent('featureSelected', element));
  let feature = element;
  feature.set('isSelected', true);

  self.selected.push(feature);
  if (
    (self.add || self.toggle) &&
    !includesFeature(self.features.getArray(), feature)
  ) {
    feature.setStyle(selectStyles);
    self.map.getLayerById('drawLayer').getSource().addFeature(feature);
    self.selected.push(feature);
    self.addFeatureLayerAssociation_(
      feature,
      self.map.getLayerById(self.currentEditTargetLayer.id)
    );
  } else if (
    (self.remove || self.toggle) &&
    includesFeature(self.features.getArray(), feature)
  ) {
    self.deselected.push(feature);
    self.removeFeatureLayerAssociation_(feature);
  }

  for (var j = self.deselected.length - 1; j >= 0; --j) {
    self.features.remove(self.deselected[j]);
  }
  self.features.extend(self.selected);
}
/**
 * @return {import("../style/Style.js").StyleFunction} Styles.
 */
function getDefaultStyleFunction() {
  var styles = createEditingStyle();
  extend(styles[GeometryType.POLYGON], styles[GeometryType.LINE_STRING]);
  extend(
    styles[GeometryType.GEOMETRY_COLLECTION],
    styles[GeometryType.LINE_STRING]
  );
  return function (feature) {
    if (!feature.getGeometry()) {
      return null;
    }
    return styles[feature.getGeometry().getType()];
  };
}

function includesFeature(featuresArray, feature) {
  for (let i = 0; i < featuresArray.length; i++) {
    let old = getGeom(new GeoJSON().writeFeatureObject(featuresArray[i]));
    let now = getGeom(new GeoJSON().writeFeatureObject(feature));
    if (booleanEqual(old, now)) {
      return true;
    }
  }
  return false;
}

export default Select;
// # sourceMappingURL=Select.js.map
