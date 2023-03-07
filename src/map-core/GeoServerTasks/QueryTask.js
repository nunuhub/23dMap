import axios from 'axios';
import qs from 'qs';

class QueryTask {
  constructor(layerOption) {
    this.layerOption = layerOption;
  }

  execute(queryParameters) {
    const urlSplits = this.layerOption.url.split('/');
    let namespace = '';
    const geoIndex = urlSplits.indexOf('geoserver');
    const isWmts = urlSplits.indexOf('wmts') > -1;
    let baseUrl = this.layerOption.url.replace('/wms', '').replace('/WMS', '');
    if (geoIndex > -1) {
      if (!isWmts) {
        namespace = urlSplits[geoIndex + 1];
      } else if (
        this.layerOption.visibleLayers[0] &&
        this.layerOption.visibleLayers[0].split(':').length === 2
      ) {
        namespace = this.layerOption.visibleLayers[0].split(':')[0];
      }
      baseUrl = '';
      for (let i = 0; i <= geoIndex; i++) {
        baseUrl += urlSplits[i] + '/';
      }
    }

    let typeName = this.layerOption.selectLayer;
    if (queryParameters.tableName) {
      typeName = queryParameters.tableName;
    }
    if (this.layerOption.selectLayer) {
      if (namespace && this.layerOption.selectLayer.indexOf(':') === -1) {
        typeName = namespace + ':' + this.layerOption.selectLayer;
      } else if (this.layerOption.selectLayer.indexOf(':') > -1) {
        typeName = this.layerOption.selectLayer;
      }
    }
    const params = {
      service: 'wfs',
      version: '1.1.0',
      request: 'GetFeature',
      typeName: typeName,
      outputFormat: queryParameters.outputFormat,
      propertyName: queryParameters.propertyName
    };

    if (queryParameters.where) {
      params.CQL_FILTER = queryParameters.where;
    }
    if (queryParameters.srsName) {
      params.srsName = queryParameters.srsName;
    }
    if (queryParameters.startIndex) {
      params.startIndex = queryParameters.startIndex;
    }
    if (queryParameters.maxFeatures) {
      params.maxFeatures = queryParameters.maxFeatures;
    }
    if (queryParameters.resultType) {
      params.resultType = queryParameters.resultType;
    }

    return new Promise((resolve, reject) => {
      const queryString = qs.stringify(params);
      let url;
      if (isWmts) {
        url = baseUrl + '/wfs?' + queryString;
      } else {
        namespace = namespace || '';
        url = baseUrl + '/' + namespace + '/wfs?' + queryString;
      }
      const requestConfig = {
        timeout: 300 * 1000
      };
      if (queryParameters.token) {
        requestConfig.headers = {
          token: queryParameters.token
        };
      }
      axios
        .get(url, requestConfig)
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }
}

export default QueryTask;
