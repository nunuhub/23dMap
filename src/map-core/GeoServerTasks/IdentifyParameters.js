class IdentifyParameters {
  constructor(map) {
    this.map = map;
    this.coordinate = undefined;
    this.resolution = this.map ? this.map.getView().getResolution() : undefined;
    this.projection = this.map ? this.map.getView().getProjection() : undefined;
    this.outputFormat = 'application/json';
    this.maxFeatures = 100;
    this.params = {
      INFO_FORMAT: this.outputFormat,
      FEATURE_COUNT: this.maxFeatures
    };
  }
}

export default IdentifyParameters;
