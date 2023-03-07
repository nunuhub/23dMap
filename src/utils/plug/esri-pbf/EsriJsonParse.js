import EsriJSON from 'ol/format/EsriJSON';
import GeoJSON from 'ol/format/GeoJSON';

export default function EsriJsonParse(featureResult) {
  //const objectIdField = featureResult.objectIdFieldName;

  let crs = 'urn:ogc:def:crs:EPSG::' + featureResult.spatialReference.wkid;
  const out = {
    type: 'FeatureCollection',
    features: [],
    crs: {
      type: 'name',
      properties: {
        name: crs
      }
    }
  };

  if (featureResult.features) {
    const featureLen = featureResult.features.length;
    for (let index = 0; index < featureLen; index++) {
      const f = featureResult.features[index];
      let feature = new EsriJSON().readFeature(f);
      let geojson = new GeoJSON().writeFeature(feature);
      out.features.push(JSON.parse(geojson));
    }
  }

  return {
    featureCollection: out,
    exceededTransferLimit: featureResult.exceededTransferLimit
  };
}
