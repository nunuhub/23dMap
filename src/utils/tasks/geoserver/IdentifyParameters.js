import GeoJSON from 'ol/format/GeoJSON';
import { getPointResolution } from 'ol/proj';
import ProjUnits from 'ol/proj/Units';

const geojsonFormat = new GeoJSON();

class IdentifyParameters {
  constructor(
    layerOption,
    position,
    { map, viewer },
    { cartesian, earthResolution }
  ) {
    this.layerOption = layerOption;
    this.map = map;
    this.viewer = viewer;
    this.cartesian = cartesian;
    this.position = position;
    this.projectionCode = this.map
      ? this.map.getView().getProjection().getCode()
      : undefined;
    this.coordinate = this._getCoordinate();
    this._earthResolution = earthResolution;
    this.resolution = this._getResolution();
    this.outputFormat = 'application/json';
    this.maxFeatures = 100;
    this.tolerance = 3;
    this.layers = this._getLayers();
    this.params = {
      INFO_FORMAT: this.outputFormat,
      FEATURE_COUNT: this.maxFeatures
    };
  }

  _getCoordinate() {
    if (this.map) {
      if (this.position instanceof Array && this.position.length === 2) {
        return this.position;
      } else {
        const geometry = geojsonFormat.readGeometry(this.position);
        if (geometry.getType() === 'Point') {
          return geometry.getCoordinates();
        }
      }
    } else if (this.viewer && this.position) {
      this.projectionCode = 'EPSG:4326';
      return this.position;
    }
  }

  _getResolution() {
    let resolution;
    if (this.map) {
      resolution = getPointResolution(
        this.map.getView().getProjection(),
        this.map.getView().getResolution(),
        this.map.getView().getCenter(),
        ProjUnits.METERS
      );
    } else if (this.viewer) {
      resolution = this._earthResolution;
    }

    return resolution;
  }

  _getLayers() {
    if (this.layerOption.geoLayerIsGroup) {
      return this.layerOption.identifyField.map((item) => item.anotherName);
    } else {
      return this.layerOption.visibleLayers;
    }
  }
}

export default IdentifyParameters;
