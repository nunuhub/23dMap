import { FlattenTools } from '../earth-core/Widget/FlattenTools';
import {
  getFeaturesFromGeoJson,
  getGeoJsonFromFeatures
} from '../utils/format';
export default class FlattenTool {
  constructor(earth) {
    this.flattenTools = new FlattenTools(earth.viewer);
  }
  // 开挖tilesets
  clipTilesetByGeojson(GeoJSON, opts) {
    let positions = this.getGeoJsonPositions(GeoJSON);
    this.flattenTools.toClip(opts.tilesets, positions, 'clipping');
  }
  // 压平tilesets
  flattenTilesetByGeojson(GeoJSON, opts) {
    let positions = this.getGeoJsonPositions(GeoJSON);
    this.flattenTools.toClip(opts.tilesets, positions, 'flatten', opts.height);
  }
  // 开挖地形
  clipTerrainByGeojson(GeoJSON) {
    let positions = this.getGeoJsonPositions(GeoJSON);
    this.flattenTools.terrainClip(positions, 'clipping');
  }
  // 压平地形
  flattenTerrainByGeojson(GeoJSON, opts) {
    let positions = this.getGeoJsonPositions(GeoJSON);
    this.flattenTools.terrainClip(positions, 'flatten', opts.height);
  }
  activateTileset(tilesets, positions, type) {
    this.flattenTools.toClip(tilesets, positions, type);
  }
  deleteTilesetPolygon(tilesets, index) {
    if (!index) {
      this.flattenTools.deleteAll(tilesets);
    } else {
      this.flattenTools.deleteFlattenPolygon(tilesets, index);
    }
  }
  activateTerrain(positions, type) {
    this.flattenTools.terrainClip(positions, type);
  }
  deleteTerrainPolygon(index) {
    if (!index) {
      this.flattenTools.deleteAllTerrain();
    } else {
      this.flattenTools.deleteIndexTerrain(index);
    }
  }
  getGeoJsonPositions(GeoJSON) {
    let jsonFeatures = getFeaturesFromGeoJson(GeoJSON, {
      featureProjection: 'EPSG:4326'
    });
    let _jsonFeatures = getGeoJsonFromFeatures(jsonFeatures);
    let jsonFeature = JSON.parse(_jsonFeatures).features[0];
    if (jsonFeature.geometry.type !== 'Polygon') {
      console.error('请确认json文件类型为Polygon');
    }
    let positions = jsonFeature.geometry.coordinates[0];
    return positions;
  }
}
