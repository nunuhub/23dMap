/* eslint-disable no-undef */
export default class Task {
  /**
   * 返回arcgisGeometryType
   * @param {*} geoJsonType
   */
  geojsonTypeToArcGIS(geoJsonType) {
    var arcgisGeometryType;
    switch (geoJsonType) {
      case 'Point':
        arcgisGeometryType = 'esriGeometryPoint';
        break;
      case 'MultiPoint':
        arcgisGeometryType = 'esriGeometryMultipoint';
        break;
      case 'LineString':
        arcgisGeometryType = 'esriGeometryPolyline';
        break;
      case 'MultiLineString':
        arcgisGeometryType = 'esriGeometryPolyline';
        break;
      case 'Polygon':
        arcgisGeometryType = 'esriGeometryPolygon';
        break;
      case 'MultiPolygon':
        arcgisGeometryType = 'esriGeometryPolygon';
        break;
    }

    return arcgisGeometryType;
  }

  isArcgisOnline(url) {
    return /^(?!.*utility\.arcgis\.com).*\.arcgis\.com.*FeatureServer/i.test(
      url
    );
  }

  serialize(params) {
    var data = '';

    params.f = params.f || 'json';

    for (var key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        var param = params[key];
        var type = Object.prototype.toString.call(param);
        var value;

        if (data.length) {
          data += '&';
        }

        if (type === '[object Array]') {
          value =
            Object.prototype.toString.call(param[0]) === '[object Object]'
              ? JSON.stringify(param)
              : param.join(',');
        } else if (type === '[object Object]') {
          value = JSON.stringify(param);
        } else if (type === '[object Date]') {
          value = param.valueOf();
        } else {
          value = param;
        }

        data += encodeURIComponent(key) + '=' + encodeURIComponent(value);
      }
    }

    return data;
  }

  // ArcGIS Server Find/Identify 10.5+
  format(boolean) {
    // use double negative to expose a more intuitive positive method name
    this.params.returnUnformattedValues = !boolean;
    return this;
  }

  createRequest(callback, context) {
    var httpRequest = new window.XMLHttpRequest();

    httpRequest.onerror = function () {
      httpRequest.onreadystatechange = Util.falseFn;

      callback.call(
        context,
        {
          error: {
            code: 500,
            message: 'XMLHttpRequest error'
          }
        },
        null
      );
    };

    httpRequest.onreadystatechange = function () {
      var response;
      var error;

      if (httpRequest.readyState === 4) {
        try {
          response = JSON.parse(httpRequest.responseText);
        } catch (e) {
          response = null;
          error = {
            code: 500,
            message:
              'Could not parse response as JSON. This could also be caused by a CORS or XMLHttpRequest error.'
          };
        }

        if (!error && response.error) {
          error = response.error;
          response = null;
        }

        httpRequest.onerror = () => {
          this.onerror();
        };

        callback.call(context, error, response);
      }
    };

    httpRequest.ontimeout = function () {
      this.onerror();
    };

    return httpRequest;
  }

  jsonp(url, params, callback, context) {
    window._EsriLeafletCallbacks = window._EsriLeafletCallbacks || {};
    var callbackId = 'c' + callbacks;
    params.callback = 'window._EsriLeafletCallbacks.' + callbackId;

    window._EsriLeafletCallbacks[callbackId] = function (response) {
      if (window._EsriLeafletCallbacks[callbackId] !== true) {
        var error;
        var responseType = Object.prototype.toString.call(response);

        if (
          !(
            responseType === '[object Object]' ||
            responseType === '[object Array]'
          )
        ) {
          error = {
            error: {
              code: 500,
              message: 'Expected array or object as JSONP response'
            }
          };
          response = null;
        }

        if (!error && response.error) {
          error = response;
          response = null;
        }

        callback.call(context, error, response);
        window._EsriLeafletCallbacks[callbackId] = true;
      }
    };

    var script = DomUtil.create('script', null, document.body);
    script.type = 'text/javascript';
    script.src = url + '?' + serialize(params);
    script.id = callbackId;
    script.onerror = function (error) {
      if (error && window._EsriLeafletCallbacks[callbackId] !== true) {
        // Can't get true error code: it can be 404, or 401, or 500
        var err = {
          error: {
            code: 500,
            message: 'An unknown error occurred'
          }
        };

        callback.call(context, err);
        window._EsriLeafletCallbacks[callbackId] = true;
      }
    };
    DomUtil.addClass(script, 'esri-leaflet-jsonp');

    callbacks++;

    return {
      id: callbackId,
      url: script.src,
      abort: function () {
        window._EsriLeafletCallbacks._callback[callbackId]({
          code: 0,
          message: 'Request aborted.'
        });
      }
    };
  }

  request(callback, context) {
    // let par=this.serialize(this.params);
    // return post(this.url,par);
    var paramString = this.serialize(this.params);
    var httpRequest = this.createRequest(callback, context);
    var requestLength = (this.url + '?' + paramString).length;

    // ie10/11 require the request be opened before a timeout is applied
    if (requestLength <= 2000) {
      httpRequest.open('GET', this.url + '?' + paramString);
    } else if (requestLength > 2000) {
      httpRequest.open('POST', this.url);
      httpRequest.setRequestHeader(
        'Content-Type',
        'application/x-www-form-urlencoded; charset=UTF-8'
      );
    }

    if (typeof context !== 'undefined' && context !== null) {
      if (typeof context.options !== 'undefined') {
        httpRequest.timeout = context.options.timeout;
      }
    }

    // request is less than 2000 characters and the browser supports CORS, make GET request with XMLHttpRequest
    if (requestLength <= 2000) {
      httpRequest.send(null);

      // request is more than 2000 characters and the browser supports CORS, make POST request with XMLHttpRequest
    } else if (requestLength > 2000) {
      httpRequest.send(paramString);

      // request is less  than 2000 characters and the browser does not support CORS, make a JSONP request
      // eslint-disable-next-line no-dupe-else-if
    } else if (requestLength <= 2000) {
      return this.jsonp(this.url, this.params, callback, context);

      // request is longer then 2000 characters and the browser does not support CORS, log a warning
    } else {
      // warn('a request to ' + url + ' was longer then 2000 characters and this browser cannot make a cross-domain post request. Please use a proxy http://esri.github.io/esri-leaflet/api-reference/request.html');
      return;
    }

    return httpRequest;
  }
}
