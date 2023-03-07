import { find, findIndex, includes } from 'ol/array';
import { equivalent, get as getProjection, transformExtent } from 'ol/proj';
import { containsExtent } from 'ol/extent';
import { createFromCapabilitiesMatrixSet } from 'ol/tilegrid/WMTS';
import WMTSRequestEncoding from 'ol/source/WMTSRequestEncoding';

function ownOptionsFromCapabilities(map, wmtsCap, config) {
  const WMTSSourceOptions = optionsFromCapabilities(wmtsCap, config);
  if (WMTSSourceOptions.format.indexOf('image') === -1) {
    const layers = wmtsCap.Contents.Layer;
    const l = find(layers, function (elt) {
      return elt.Identifier === config.layer;
    });
    if (l === null) {
      return null;
    }
    const formats = l.Format;
    for (const format of formats) {
      if (format.indexOf('image') > -1) {
        WMTSSourceOptions.format = format;
        break;
      }
    }
  }
  let pixelSize = config.pixelSize
    ? config.pixelSize
    : config.otherPixel
    ? 0.00026458386740859905158332864248486
    : null;
  if (pixelSize) {
    const projection = config.targetSRS
      ? getProjection(config.targetSRS)
      : map.getView().getProjection();
    const mpu = projection.getMetersPerUnit();
    const layers = wmtsCap.Contents.Layer;
    const l = find(layers, function (elt) {
      return elt.Identifier === config.layer;
    });
    if (l === null) {
      return null;
    }
    const tileMatrixSets = wmtsCap.Contents.TileMatrixSet;
    let idx;
    if (l.TileMatrixSetLink.length > 1) {
      if ('projection' in config) {
        idx = findIndex(l.TileMatrixSetLink, function (elt) {
          var tileMatrixSet = find(tileMatrixSets, function (el) {
            return el.Identifier === elt.TileMatrixSet;
          });
          var supportedCRS = tileMatrixSet.SupportedCRS;
          var proj1 =
            getProjection(
              supportedCRS.replace(
                /urn:ogc:def:crs:(\w+):(.*:)?(\w+)$/,
                '$1:$3'
              )
            ) || getProjection(supportedCRS);
          var proj2 = getProjection(config.projection);
          if (proj1 && proj2) {
            return equivalent(proj1, proj2);
          } else {
            return supportedCRS === config.projection;
          }
        });
      } else {
        idx = findIndex(l.TileMatrixSetLink, function (elt) {
          return elt.TileMatrixSet === config.matrixSet;
        });
      }
    } else {
      idx = 0;
    }
    if (idx < 0) {
      idx = 0;
    }
    var matrixSet =
      /** @type {string} */
      (l.TileMatrixSetLink[idx].TileMatrixSet);
    var matrixSetObj = find(tileMatrixSets, function (elt) {
      return elt.Identifier === matrixSet;
    });
    const resolutions = [];
    // let orgins=[]
    for (const matrix of matrixSetObj.TileMatrix) {
      // orgins.push([matrix.TopLeftCorner[0]+0.0006,matrix.TopLeftCorner[1]-0.0001])
      resolutions.push(pixelSize * (matrix.ScaleDenominator / mpu));
    }
    // WMTSSourceOptions.tileGrid.origins_=orgins;

    WMTSSourceOptions.tileGrid.resolutions_ = resolutions;
  }
  return WMTSSourceOptions;
}

export function optionsFromCapabilities(wmtsCap, config) {
  var layers = wmtsCap['Contents']['Layer'];
  var l = find(layers, function (elt) {
    return elt['Identifier'] === config['layer'];
  });
  if (l === null) {
    return null;
  }
  var tileMatrixSets = wmtsCap['Contents']['TileMatrixSet'];
  var idx;
  if (l['TileMatrixSetLink'].length > 1) {
    if ('projection' in config) {
      idx = findIndex(l['TileMatrixSetLink'], function (elt) {
        var tileMatrixSet = find(tileMatrixSets, function (el) {
          return el['Identifier'] === elt['TileMatrixSet'];
        });
        var supportedCRS = tileMatrixSet['SupportedCRS'];
        var proj1 = getProjection(supportedCRS);
        var proj2 = getProjection(config['projection']);
        if (proj1 && proj2) {
          return equivalent(proj1, proj2);
        } else {
          return supportedCRS === config['projection'];
        }
      });
    } else {
      idx = findIndex(l['TileMatrixSetLink'], function (elt) {
        return elt['TileMatrixSet'] === config['matrixSet'];
      });
    }
  } else {
    idx = 0;
  }
  if (idx < 0) {
    idx = 0;
  }
  var matrixSet =
    /** @type {string} */
    (l['TileMatrixSetLink'][idx]['TileMatrixSet']);
  var matrixLimits =
    /** @type {Array<Object>} */
    (l['TileMatrixSetLink'][idx]['TileMatrixSetLimits']);
  var format = /** @type {string} */ (l['Format'][0]);
  if ('format' in config) {
    format = config['format'];
  }
  idx = findIndex(l['Style'], function (elt) {
    if ('style' in config) {
      return elt['Title'] === config['style'];
    } else {
      return elt['isDefault'];
    }
  });
  if (idx < 0) {
    idx = 0;
  }
  var style = /** @type {string} */ (l['Style'][idx]['Identifier']);
  var dimensions = {};
  if ('Dimension' in l) {
    l['Dimension'].forEach(function (elt) {
      var key = elt['Identifier'];
      var value = elt['Default'];
      if (value === undefined) {
        value = elt['Value'][0];
      }
      dimensions[key] = value;
    });
  }
  var matrixSets = wmtsCap['Contents']['TileMatrixSet'];
  var matrixSetObj = find(matrixSets, function (elt) {
    return elt['Identifier'] === matrixSet;
  });
  var projection;
  var code = matrixSetObj['SupportedCRS'];
  if (code) {
    projection = getProjection(code);
  }
  if ('projection' in config) {
    var projConfig = getProjection(config['projection']);
    if (projConfig) {
      if (!projection || equivalent(projConfig, projection)) {
        projection = projConfig;
      }
    }
  }
  var wrapX = false;
  var switchOriginXY = projection.getAxisOrientation().substr(0, 2) === 'ne';
  var matrix = matrixSetObj.TileMatrix[0];
  // create default matrixLimit
  var selectedMatrixLimit = {
    MinTileCol: 0,
    MinTileRow: 0,
    // subtract one to end up at tile top left
    MaxTileCol: matrix.MatrixWidth - 1,
    MaxTileRow: matrix.MatrixHeight - 1
  };
  //in case of matrix limits, use matrix limits to calculate extent
  if (matrixLimits) {
    if (matrixSetObj.WellKnownScaleSet) {
      for (let matrixLimit of matrixLimits) {
        matrixLimit.TileMatrix = matrixLimit.TileMatrix.replace(
          matrixSetObj.WellKnownScaleSet,
          matrixSetObj.Identifier
        );
      }
    }
    selectedMatrixLimit = matrixLimits[matrixLimits.length - 1];
    var m = find(matrixSetObj.TileMatrix, function (tileMatrixValue) {
      return (
        tileMatrixValue.Identifier === selectedMatrixLimit.TileMatrix ||
        matrixSetObj.Identifier + ':' + tileMatrixValue.Identifier ===
          selectedMatrixLimit.TileMatrix
      );
    });
    if (m) {
      matrix = m;
    }
  }
  var resolution =
    (matrix.ScaleDenominator * 0.00028) / projection.getMetersPerUnit(); // WMTS 1.0.0: standardized rendering pixel size
  var origin = switchOriginXY
    ? [matrix.TopLeftCorner[1], matrix.TopLeftCorner[0]]
    : matrix.TopLeftCorner;
  var tileSpanX = matrix.TileWidth * resolution;
  var tileSpanY = matrix.TileHeight * resolution;
  var matrixSetExtent = matrixSetObj['BoundingBox'];
  var extent = [
    origin[0] + tileSpanX * selectedMatrixLimit.MinTileCol,
    // add one to get proper bottom/right coordinate
    origin[1] - tileSpanY * (1 + selectedMatrixLimit.MaxTileRow),
    origin[0] + tileSpanX * (1 + selectedMatrixLimit.MaxTileCol),
    origin[1] - tileSpanY * selectedMatrixLimit.MinTileRow
  ];
  if (
    matrixSetExtent !== undefined &&
    !containsExtent(matrixSetExtent, extent)
  ) {
    var wgs84BoundingBox = l['WGS84BoundingBox'];
    var wgs84ProjectionExtent = getProjection('EPSG:4326').getExtent();
    extent = matrixSetExtent;
    if (wgs84BoundingBox) {
      wrapX =
        wgs84BoundingBox[0] === wgs84ProjectionExtent[0] &&
        wgs84BoundingBox[2] === wgs84ProjectionExtent[2];
    } else {
      var wgs84MatrixSetExtent = transformExtent(
        matrixSetExtent,
        matrixSetObj['SupportedCRS'],
        'EPSG:4326'
      );
      // Ignore slight deviation from the correct x limits
      wrapX =
        wgs84MatrixSetExtent[0] - 1e-10 <= wgs84ProjectionExtent[0] &&
        wgs84MatrixSetExtent[2] + 1e-10 >= wgs84ProjectionExtent[2];
    }
  }
  var tileGrid = createFromCapabilitiesMatrixSet(
    matrixSetObj,
    extent,
    matrixLimits
  );
  /** @type {!Array<string>} */
  var urls = [];
  var requestEncoding = config['requestEncoding'];
  requestEncoding = requestEncoding !== undefined ? requestEncoding : '';
  if (
    'OperationsMetadata' in wmtsCap &&
    'GetTile' in wmtsCap['OperationsMetadata']
  ) {
    var gets = wmtsCap['OperationsMetadata']['GetTile']['DCP']['HTTP']['Get'];
    for (var i = 0, ii = gets.length; i < ii; ++i) {
      if (gets[i]['Constraint']) {
        var constraint = find(gets[i]['Constraint'], function (element) {
          return element['name'] === 'GetEncoding';
        });
        var encodings = constraint['AllowedValues']['Value'];
        if (requestEncoding === '') {
          // requestEncoding not provided, use the first encoding from the list
          requestEncoding = encodings[0];
        }
        if (requestEncoding === WMTSRequestEncoding.KVP) {
          if (includes(encodings, WMTSRequestEncoding.KVP)) {
            urls.push(/** @type {string} */ (gets[i]['href']));
          }
        } else {
          break;
        }
      } else if (gets[i]['href']) {
        requestEncoding = WMTSRequestEncoding.KVP;
        urls.push(/** @type {string} */ (gets[i]['href']));
      }
    }
  }
  if (urls.length === 0) {
    requestEncoding = WMTSRequestEncoding.REST;
    l['ResourceURL'].forEach(function (element) {
      if (element['resourceType'] === 'tile') {
        format = element['format'];
        urls.push(/** @type {string} */ (element['template']));
      }
    });
  }
  return {
    urls: urls,
    layer: config['layer'],
    matrixSet: matrixSet,
    format: format,
    projection: projection,
    requestEncoding: requestEncoding,
    tileGrid: tileGrid,
    style: style,
    dimensions: dimensions,
    wrapX: wrapX,
    crossOrigin: config['crossOrigin']
  };
}

export default ownOptionsFromCapabilities;
