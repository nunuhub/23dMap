import { esriPBuffer } from './FeatureCollection';

export default function EsriPbfParse(featureCollectionBuffer) {
  let decodedObject;
  try {
    decodedObject = esriPBuffer.FeatureCollectionPBuffer.decode(
      new Uint8Array(featureCollectionBuffer)
    );
  } catch (error) {
    throw new Error('arcgis-pbf解析错误');
  }
  const featureResult = decodedObject.queryResult.featureResult;
  const transform = featureResult.transform;
  const geometryType = featureResult.geometryType;
  const objectIdField = featureResult.objectIdFieldName;

  const fields = featureResult.fields;
  for (let index = 0; index < fields.length; index++) {
    const field = fields[index];
    field.keyName = getKeyName(field);
  }

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

  const geometryParser = getGeometryParser(geometryType);

  const featureLen = featureResult.features.length;
  for (let index = 0; index < featureLen; index++) {
    const f = featureResult.features[index];
    out.features.push({
      type: 'Feature',
      id: getFeatureId(fields, f.attributes, objectIdField),
      properties: collectAttributes(fields, f.attributes),
      geometry: geometryParser(f, transform)
    });
  }

  return {
    featureCollection: out,
    exceededTransferLimit: featureResult.exceededTransferLimit
  };
}

function getGeometryParser(featureType) {
  switch (featureType) {
    case 3:
      return createPolygon;
    case 2:
      return createLine;
    case 0:
      return createPoint;
    default:
      return createPolygon;
  }
}

function createPoint(f, transform) {
  return {
    type: 'Point',
    coordinates: transformTuple(f.geometry.coords, transform)
  };
}

function createLine(f, transform) {
  return {
    type: 'LineString',
    coordinates: createLinearRing(
      f.geometry.coords,
      transform,
      0,
      f.geometry.lengths[0] * 2
    )
  };
}

function createPolygon(f, transform) {
  const lengths = f.geometry.lengths.length; // 是否为多pad

  const p = {
    type: 'Polygon',
    coordinates: []
  };

  if (lengths === 1) {
    p.coordinates.push(
      createLinearRing(
        f.geometry.coords,
        transform,
        0,
        f.geometry.lengths[0] * 2
      )
    );
  } else {
    p.type = 'MultiPolygon';

    let startPoint = 0;
    for (let index = 0; index < lengths; index++) {
      const stopPoint = startPoint + f.geometry.lengths[index] * 2;
      const ring = createLinearRing(
        f.geometry.coords,
        transform,
        startPoint,
        stopPoint
      );

      if (ringIsClockwise(ring)) {
        p.coordinates.push([ring]);
      } else if (p.coordinates.length > 0) {
        p.coordinates[p.coordinates.length - 1].push(ring);
      }
      startPoint = stopPoint;
    }
  }

  return p;
}

function ringIsClockwise(ringToTest) {
  let total = 0;
  let i = 0;
  let rLength = ringToTest.length;
  let pt1 = ringToTest[i];
  let pt2;
  for (i; i < rLength - 1; i++) {
    pt2 = ringToTest[i + 1];
    total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1]);
    pt1 = pt2;
  }
  return total >= 0;
}

function createLinearRing(arr, transform, startPoint, stopPoint) {
  const out = [];
  if (arr.length === 0) return out;

  const initialX = arr[startPoint];
  const initialY = arr[startPoint + 1];
  out.push(transformTuple([initialX, initialY], transform));
  let prevX = initialX;
  let prevY = initialY;
  for (let i = startPoint + 2; i < stopPoint; i = i + 2) {
    const x = difference(prevX, arr[i]);
    const y = difference(prevY, arr[i + 1]);
    const transformed = transformTuple([x, y], transform);
    out.push(transformed);
    prevX = x;
    prevY = y;
  }
  return out;
}

function collectAttributes(fields, featureAttributes) {
  const out = {};
  for (let i = 0; i < fields.length; i++) {
    const f = fields[i];
    if (featureAttributes[i][featureAttributes[i].valueType])
      out[f.name] = featureAttributes[i][featureAttributes[i].valueType];
    else out[f.name] = null;
  }
  return out;
}

function getFeatureId(fields, featureAttributes, featureIdField) {
  for (let index = 0; index < fields.length; index++) {
    const field = fields[index];
    if (field.name === featureIdField) {
      return featureAttributes[index][featureAttributes[index].valueType];
    }
  }
  return null;
}

function getKeyName(fields) {
  switch (fields.fieldType) {
    case 1:
      return 'sintValue';
    case 2:
      return 'floatValue';
    case 3:
      return 'doubleValue';
    case 4:
      return 'stringValue';
    case 5:
      return 'sint64Value';
    case 6:
      return 'uintValue';
    default:
      return null;
  }
}

/**
 * 根据arcgis-pbf返回的int变量coords以及transform信息计算世界坐标
 * const xWorld = x * scale.x + translate.x;
 * const yWorld = translate.y - y * scale.y;
 */
function transformTuple(coords, transform) {
  let x = coords[0];
  let y = coords[1];

  let z = coords[2] ? coords[2] : undefined;
  if (transform.scale) {
    x *= transform.scale.xScale;
    y *= -transform.scale.yScale;
    if (undefined !== z) {
      z *= transform.scale.zScale;
    }
  }
  if (transform.translate) {
    x += transform.translate.xTranslate;
    y += transform.translate.yTranslate;
    if (undefined !== z) {
      z += transform.translate.zTranslate;
    }
  }
  const ret = [x, y];
  if (undefined !== z) {
    ret.push(z);
  }
  return ret;
}

function difference(a, b) {
  return a + b;
}
