/*
 * @Author: liujh
 * @Date: 2020/9/22 9:22
 * @Description:
 */
/* 32 */
/***/
import * as leaflet from './LeafLet20'

export let VERSION
const version = "2.1.4"
VERSION = version

let cors = window.XMLHttpRequest && 'withCredentials' in new window.XMLHttpRequest()
let pointerEvents = document.documentElement.style.pointerEvents === ''

export let Support = {
    cors: cors,
    pointerEvents: pointerEvents
}

export let options = {
    attributionWidthOffset: 55
}

let callbacks = 0

function serialize(params) {
    let data = ''

    params.f = params.f || 'json'

    for (let key in params) {
        if (params.hasOwnProperty(key)) {
            let param = params[key]
            let type = Object.prototype.toString.call(param)
            let value

            if (data.length) {
                data += '&'
            }

            if (type === '[object Array]') {
                value = Object.prototype.toString.call(param[0]) === '[object Object]' ? JSON.stringify(param) : param.join(',')
            } else if (type === '[object Object]') {
                value = JSON.stringify(param)
            } else if (type === '[object Date]') {
                value = param.valueOf()
            } else {
                value = param
            }

            data += encodeURIComponent(key) + '=' + encodeURIComponent(value)
        }
    }

    return data
}

function createRequest(callback, context) {
    let httpRequest = new window.XMLHttpRequest()

    httpRequest.onerror = function (e) {
        httpRequest.onreadystatechange = leaflet.Util.falseFn

        callback.call(context, {
            error: {
                code: 500,
                message: 'XMLHttpRequest error'
            }
        }, null)
    }

    httpRequest.onreadystatechange = function () {
        let response
        let error

        if (httpRequest.readyState === 4) {
            try {
                response = JSON.parse(httpRequest.responseText)
            } catch (e) {
                response = null
                error = {
                    code: 500,
                    message: 'Could not parse response as JSON. This could also be caused by a CORS or XMLHttpRequest error.'
                }
            }

            if (!error && response.error) {
                error = response.error
                response = null
            }

            httpRequest.onerror = leaflet.Util.falseFn

            callback.call(context, error, response)
        }
    }

    httpRequest.ontimeout = function () {
        this.onerror()
    }

    return httpRequest
}

export function xmlHttpPost(url, params, callback, context) {
    let httpRequest = createRequest(callback, context)
    httpRequest.open('POST', url)

    if (typeof context !== 'undefined' && context !== null) {
        if (typeof context.options !== 'undefined') {
            httpRequest.timeout = context.options.timeout
        }
    }
    httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded charset=UTF-8')
    httpRequest.send(serialize(params))

    return httpRequest
}

function xmlHttpGet(url, params, callback, context) {
    let httpRequest = createRequest(callback, context)
    httpRequest.open('GET', url + '?' + serialize(params), true)

    if (typeof context !== 'undefined' && context !== null) {
        if (typeof context.options !== 'undefined') {
            httpRequest.timeout = context.options.timeout
        }
    }
    httpRequest.send(null)

    return httpRequest
}

// AJAX handlers for CORS (modern browsers) or JSONP (older browsers)
export function request(url, params, callback, context) {
    let paramString = serialize(params)
    let httpRequest = createRequest(callback, context)
    let requestLength = (url + '?' + paramString).length

    // ie10/11 require the request be opened before a timeout is applied
    if (requestLength <= 2000 && Support.cors) {
        httpRequest.open('GET', url + '?' + paramString)
    } else if (requestLength > 2000 && Support.cors) {
        httpRequest.open('POST', url)
        httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded charset=UTF-8')
    }

    if (typeof context !== 'undefined' && context !== null) {
        if (typeof context.options !== 'undefined') {
            httpRequest.timeout = context.options.timeout
        }
    }

    // request is less than 2000 characters and the browser supports CORS, make GET request with XMLHttpRequest
    if (requestLength <= 2000 && Support.cors) {
        httpRequest.send(null)

        // request is more than 2000 characters and the browser supports CORS, make POST request with XMLHttpRequest
    } else if (requestLength > 2000 && Support.cors) {
        httpRequest.send(paramString)

        // request is less  than 2000 characters and the browser does not support CORS, make a JSONP request
    } else if (requestLength <= 2000 && !Support.cors) {
        return jsonp(url, params, callback, context)

        // request is longer then 2000 characters and the browser does not support CORS, log a warning
    } else {
        warn('a request to ' + url + ' was longer then 2000 characters and this browser cannot make a cross-domain post request. Please use a proxy http://esri.github.io/esri-leaflet/api-reference/request.html')
        return
    }

    return httpRequest
}

function jsonp(url, params, callback, context) {
    window._EsriLeafletCallbacks = window._EsriLeafletCallbacks || {}
    let callbackId = 'c' + callbacks
    params.callback = 'window._EsriLeafletCallbacks.' + callbackId

    window._EsriLeafletCallbacks[callbackId] = function (response) {
        if (window._EsriLeafletCallbacks[callbackId] !== true) {
            let error
            let responseType = Object.prototype.toString.call(response)

            if (!(responseType === '[object Object]' || responseType === '[object Array]')) {
                error = {
                    error: {
                        code: 500,
                        message: 'Expected array or object as JSONP response'
                    }
                }
                response = null
            }

            if (!error && response.error) {
                error = response
                response = null
            }

            callback.call(context, error, response)
            window._EsriLeafletCallbacks[callbackId] = true
        }
    }

    let script = leaflet.DomUtil.create('script', null, document.body)
    script.type = 'text/javascript'
    script.src = url + '?' + serialize(params)
    script.id = callbackId
    leaflet.DomUtil.addClass(script, 'esri-leaflet-jsonp')

    callbacks++

    return {
        id: callbackId,
        url: script.src,
        abort: function abort() {
            window._EsriLeafletCallbacks._callback[callbackId]({
                code: 0,
                message: 'Request aborted.'
            })
        }
    }
}

export let get = Support.cors ? xmlHttpGet : jsonp
get.CORS = xmlHttpGet
get.JSONP = jsonp

// export the Request object to call the different handlers for debugging
let Request = {
    request: request,
    get: get,
    post: xmlHttpPost
}

/*
* Copyright 2017 Esri
*
* Licensed under the Apache License, Version 2.0 (the "License")
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

// checks if 2 x,y points are equal
function pointsEqual(a, b) {
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false
        }
    }
    return true
}

// checks if the first and last points of a ring are equal and closes the ring
function closeRing(coordinates) {
    if (!pointsEqual(coordinates[0], coordinates[coordinates.length - 1])) {
        coordinates.push(coordinates[0])
    }
    return coordinates
}

// determine if polygon ring coordinates are clockwise. clockwise signifies outer ring, counter-clockwise an inner ring
// or hole. this logic was found at http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-
// points-are-in-clockwise-order
function ringIsClockwise(ringToTest) {
    let total = 0
    let i = 0
    let rLength = ringToTest.length
    let pt1 = ringToTest[i]
    let pt2
    for (i; i < rLength - 1; i++) {
        pt2 = ringToTest[i + 1]
        total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1])
        pt1 = pt2
    }
    return total >= 0
}

// ported from terraformer.js https://github.com/Esri/Terraformer/blob/master/terraformer.js#L504-L519
function vertexIntersectsVertex(a1, a2, b1, b2) {
    let uaT = (b2[0] - b1[0]) * (a1[1] - b1[1]) - (b2[1] - b1[1]) * (a1[0] - b1[0])
    let ubT = (a2[0] - a1[0]) * (a1[1] - b1[1]) - (a2[1] - a1[1]) * (a1[0] - b1[0])
    let uB = (b2[1] - b1[1]) * (a2[0] - a1[0]) - (b2[0] - b1[0]) * (a2[1] - a1[1])

    if (uB !== 0) {
        let ua = uaT / uB
        let ub = ubT / uB

        if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
            return true
        }
    }

    return false
}

// ported from terraformer.js https://github.com/Esri/Terraformer/blob/master/terraformer.js#L521-L531
function arrayIntersectsArray(a, b) {
    for (let i = 0; i < a.length - 1; i++) {
        for (let j = 0; j < b.length - 1; j++) {
            if (vertexIntersectsVertex(a[i], a[i + 1], b[j], b[j + 1])) {
                return true
            }
        }
    }

    return false
}

// ported from terraformer.js https://github.com/Esri/Terraformer/blob/master/terraformer.js#L470-L480
function coordinatesContainPoint(coordinates, point) {
    let contains = false
    for (let i = -1, l = coordinates.length, j = l - 1; ++i < l; j = i) {
        if ((coordinates[i][1] <= point[1] && point[1] < coordinates[j][1] || coordinates[j][1] <= point[1] && point[1] < coordinates[i][1]) && point[0] < (coordinates[j][0] - coordinates[i][0]) * (point[1] - coordinates[i][1]) / (coordinates[j][1] - coordinates[i][1]) + coordinates[i][0]) {
            contains = !contains
        }
    }
    return contains
}

// ported from terraformer-arcgis-parser.js https://github.com/Esri/terraformer-arcgis-parser/blob/master/terraformer-arcgis-parser.js#L106-L113
function coordinatesContainCoordinates(outer, inner) {
    let intersects = arrayIntersectsArray(outer, inner)
    let contains = coordinatesContainPoint(outer, inner[0])
    if (!intersects && contains) {
        return true
    }
    return false
}

// do any polygons in this array contain any other polygons in this array?
// used for checking for holes in arcgis rings
// ported from terraformer-arcgis-parser.js https://github.com/Esri/terraformer-arcgis-parser/blob/master/terraformer-arcgis-parser.js#L117-L172
function convertRingsToGeoJSON(rings) {
    let outerRings = []
    let holes = []
    let x // iterator
    let outerRing // current outer ring being evaluated
    let hole // current hole being evaluated

    // for each ring
    for (let r = 0; r < rings.length; r++) {
        let ring = closeRing(rings[r].slice(0))
        if (ring.length < 4) {
            continue
        }
        // is this ring an outer ring? is it clockwise?
        if (ringIsClockwise(ring)) {
            let polygon = [ ring.slice().reverse() ] // wind outer rings counterclockwise for RFC 7946 compliance
            outerRings.push(polygon) // push to outer rings
        } else {
            holes.push(ring.slice().reverse()) // wind inner rings clockwise for RFC 7946 compliance
        }
    }

    let uncontainedHoles = []

    // while there are holes left...
    while (holes.length) {
        // pop a hole off out stack
        hole = holes.pop()

        // loop over all outer rings and see if they contain our hole.
        let contained = false
        for (x = outerRings.length - 1; x >= 0; x--) {
            outerRing = outerRings[x][0]
            if (coordinatesContainCoordinates(outerRing, hole)) {
                // the hole is contained push it into our polygon
                outerRings[x].push(hole)
                contained = true
                break
            }
        }

        // ring is not contained in any outer ring
        // sometimes this happens https://github.com/Esri/esri-leaflet/issues/320
        if (!contained) {
            uncontainedHoles.push(hole)
        }
    }

    // if we couldn't match any holes using contains we can try intersects...
    while (uncontainedHoles.length) {
        // pop a hole off out stack
        hole = uncontainedHoles.pop()

        // loop over all outer rings and see if any intersect our hole.
        let intersects = false

        for (x = outerRings.length - 1; x >= 0; x--) {
            outerRing = outerRings[x][0]
            if (arrayIntersectsArray(outerRing, hole)) {
                // the hole is contained push it into our polygon
                outerRings[x].push(hole)
                intersects = true
                break
            }
        }

        if (!intersects) {
            outerRings.push([ hole.reverse() ])
        }
    }

    if (outerRings.length === 1) {
        return {
            type: 'Polygon',
            coordinates: outerRings[0]
        }
    } else {
        return {
            type: 'MultiPolygon',
            coordinates: outerRings
        }
    }
}

// This function ensures that rings are oriented in the right directions
// outer rings are clockwise, holes are counterclockwise
// used for converting GeoJSON Polygons to ArcGIS Polygons
function orientRings(poly) {
    let output = []
    let polygon = poly.slice(0)
    let outerRing = closeRing(polygon.shift().slice(0))
    if (outerRing.length >= 4) {
        if (!ringIsClockwise(outerRing)) {
            outerRing.reverse()
        }

        output.push(outerRing)

        for (let i = 0; i < polygon.length; i++) {
            let hole = closeRing(polygon[i].slice(0))
            if (hole.length >= 4) {
                if (ringIsClockwise(hole)) {
                    hole.reverse()
                }
                output.push(hole)
            }
        }
    }

    return output
}

// This function flattens holes in multipolygons to one array of polygons
// used for converting GeoJSON Polygons to ArcGIS Polygons
function flattenMultiPolygonRings(rings) {
    let output = []
    for (let i = 0; i < rings.length; i++) {
        let polygon = orientRings(rings[i])
        for (let x = polygon.length - 1; x >= 0; x--) {
            let ring = polygon[x].slice(0)
            output.push(ring)
        }
    }
    return output
}

// shallow object clone for feature properties and attributes
// from http://jsperf.com/cloning-an-object/2
function shallowClone(obj) {
    let target = {}
    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            target[i] = obj[i]
        }
    }
    return target
}

function getId(attributes, idAttribute) {
    let keys = idAttribute ? [ idAttribute, 'OBJECTID', 'FID' ] : [ 'OBJECTID', 'FID' ]
    for (let i = 0; i < keys.length; i++) {
        let key = keys[i]
        if (key in attributes && (typeof attributes[key] === 'string' || typeof attributes[key] === 'number')) {
            return attributes[key]
        }
    }
    throw Error('No valid id attribute found')
}

function arcgisToGeoJSON(arcgis, idAttribute) {
    let geojson = {}

    if (typeof arcgis.x === 'number' && typeof arcgis.y === 'number') {
        geojson.type = 'Point'
        geojson.coordinates = [ arcgis.x, arcgis.y ]
        if (typeof arcgis.z === 'number') {
            geojson.coordinates.push(arcgis.z)
        }
    }

    if (arcgis.points) {
        geojson.type = 'MultiPoint'
        geojson.coordinates = arcgis.points.slice(0)
    }

    if (arcgis.paths) {
        if (arcgis.paths.length === 1) {
            geojson.type = 'LineString'
            geojson.coordinates = arcgis.paths[0].slice(0)
        } else {
            geojson.type = 'MultiLineString'
            geojson.coordinates = arcgis.paths.slice(0)
        }
    }

    if (arcgis.rings) {
        geojson = convertRingsToGeoJSON(arcgis.rings.slice(0))
    }

    if (arcgis.geometry || arcgis.attributes) {
        geojson.type = 'Feature'
        geojson.geometry = arcgis.geometry ? arcgisToGeoJSON(arcgis.geometry) : null
        geojson.properties = arcgis.attributes ? shallowClone(arcgis.attributes) : null
        if (arcgis.attributes) {
            try {
                geojson.id = getId(arcgis.attributes, idAttribute)
            } catch (err) {
                // don't set an id
            }
        }
    }

    // if no valid geometry was encountered
    if (JSON.stringify(geojson.geometry) === JSON.stringify({})) {
        geojson.geometry = null
    }

    if (arcgis.spatialReference && arcgis.spatialReference.wkid && arcgis.spatialReference.wkid !== 4326) {
        console.warn('Object converted in non-standard crs - ' + JSON.stringify(arcgis.spatialReference))
    }

    return geojson
}

function geojsonToArcGIS(geojson, idAttribute) {
    idAttribute = idAttribute || 'OBJECTID'
    let spatialReference = {
        wkid: 4326
    }
    let result = {}
    let i

    switch (geojson.type) {
        case 'Point':
            result.x = geojson.coordinates[0]
            result.y = geojson.coordinates[1]
            result.spatialReference = spatialReference
            break
        case 'MultiPoint':
            result.points = geojson.coordinates.slice(0)
            result.spatialReference = spatialReference
            break
        case 'LineString':
            result.paths = [ geojson.coordinates.slice(0) ]
            result.spatialReference = spatialReference
            break
        case 'MultiLineString':
            result.paths = geojson.coordinates.slice(0)
            result.spatialReference = spatialReference
            break
        case 'Polygon':
            result.rings = orientRings(geojson.coordinates.slice(0))
            result.spatialReference = spatialReference
            break
        case 'MultiPolygon':
            result.rings = flattenMultiPolygonRings(geojson.coordinates.slice(0))
            result.spatialReference = spatialReference
            break
        case 'Feature':
            if (geojson.geometry) {
                result.geometry = geojsonToArcGIS(geojson.geometry, idAttribute)
            }
            result.attributes = geojson.properties ? shallowClone(geojson.properties) : {}
            if (geojson.id) {
                result.attributes[idAttribute] = geojson.id
            }
            break
        case 'FeatureCollection':
            result = []
            for (i = 0; i < geojson.features.length; i++) {
                result.push(geojsonToArcGIS(geojson.features[i], idAttribute))
            }
            break
        case 'GeometryCollection':
            result = []
            for (i = 0; i < geojson.geometries.length; i++) {
                result.push(geojsonToArcGIS(geojson.geometries[i], idAttribute))
            }
            break
    }

    return result
}

function geojsonToArcGIS$1(geojson, idAttr) {
    return geojsonToArcGIS(geojson, idAttr)
}

function arcgisToGeoJSON$1(arcgis, idAttr) {
    return arcgisToGeoJSON(arcgis, idAttr)
}

// convert an extent (ArcGIS) to LatLngBounds (Leaflet)
function extentToBounds(extent) {
    // "NaN" coordinates from ArcGIS Server indicate a null geometry
    if (extent.xmin !== 'NaN' && extent.ymin !== 'NaN' && extent.xmax !== 'NaN' && extent.ymax !== 'NaN') {
        let sw = leaflet.LatLng(extent.ymin, extent.xmin)
        let ne = leaflet.LatLng(extent.ymax, extent.xmax)
        return leaflet.toLatLngBounds(sw, ne)
    } else {
        return null
    }
}

// convert an LatLngBounds (Leaflet) to extent (ArcGIS)
function boundsToExtent(bounds) {
    bounds = leaflet.toLatLngBounds(bounds)
    return {
        'xmin': bounds.getSouthWest().lng,
        'ymin': bounds.getSouthWest().lat,
        'xmax': bounds.getNorthEast().lng,
        'ymax': bounds.getNorthEast().lat,
        'spatialReference': {
            'wkid': 4326
        }
    }
}

let knownFieldNames = /^(OBJECTID|FID|OID|ID)$/i

// Attempts to find the ID Field from response
function _findIdAttributeFromResponse(response) {
    let result

    if (response.objectIdFieldName) {
        // Find Id Field directly
        result = response.objectIdFieldName
    } else if (response.fields) {
        // Find ID Field based on field type
        for (let j = 0; j <= response.fields.length - 1; j++) {
            if (response.fields[j].type === 'esriFieldTypeOID') {
                result = response.fields[j].name
                break
            }
        }
        if (!result) {
            // If no field was marked as being the esriFieldTypeOID try well known field names
            for (j = 0; j <= response.fields.length - 1; j++) {
                if (response.fields[j].name.match(knownFieldNames)) {
                    result = response.fields[j].name
                    break
                }
            }
        }
    }
    return result
}

// This is the 'last' resort, find the Id field from the specified feature
function _findIdAttributeFromFeature(feature) {
    for (let key in feature.attributes) {
        if (key.match(knownFieldNames)) {
            return key
        }
    }
}

function responseToFeatureCollection(response, idAttribute) {
    let objectIdField
    let features = response.features || response.results
    let count = features.length

    if (idAttribute) {
        objectIdField = idAttribute
    } else {
        objectIdField = _findIdAttributeFromResponse(response)
    }

    let featureCollection = {
        type: 'FeatureCollection',
        features: []
    }

    if (count) {
        for (let i = features.length - 1; i >= 0; i--) {
            let feature = arcgisToGeoJSON$1(features[i], objectIdField || _findIdAttributeFromFeature(features[i]))
            featureCollection.features.push(feature)
        }
    }

    return featureCollection
}

// trim url whitespace and add a trailing slash if needed
function cleanUrl(url) {
    // trim leading and trailing spaces, but not spaces inside the url
    url = leaflet.Util.trim(url)

    // add a trailing slash to the url if the user omitted it
    if (url[url.length - 1] !== '/') {
        url += '/'
    }

    return url
}

/* Extract url params if any and store them in requestParams attribute.
Return the options params updated */
function getUrlParams(options$$1) {
    if (options$$1.url.indexOf('?') !== -1) {
        options$$1.requestParams = options$$1.requestParams || {}
        let queryString = options$$1.url.substring(options$$1.url.indexOf('?') + 1)
        options$$1.url = options$$1.url.split('?')[0]
        options$$1.requestParams = JSON.parse('{"' + decodeURI(queryString).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}')
    }
    options$$1.url = cleanUrl(options$$1.url.split('?')[0])
    return options$$1
}

function isArcgisOnline(url) {
    /* hosted feature services support geojson as an output format
utility.arcgis.com services are proxied from a variety of ArcGIS Server vintages, and may not */
    return (/^(?!.*utility\.arcgis\.com).*\.arcgis\.com.*FeatureServer/i.test(url))
}

function geojsonTypeToArcGIS(geoJsonType) {
    let arcgisGeometryType
    switch (geoJsonType) {
        case 'Point':
            arcgisGeometryType = 'esriGeometryPoint'
            break
        case 'MultiPoint':
            arcgisGeometryType = 'esriGeometryMultipoint'
            break
        case 'LineString':
            arcgisGeometryType = 'esriGeometryPolyline'
            break
        case 'MultiLineString':
            arcgisGeometryType = 'esriGeometryPolyline'
            break
        case 'Polygon':
            arcgisGeometryType = 'esriGeometryPolygon'
            break
        case 'MultiPolygon':
            arcgisGeometryType = 'esriGeometryPolygon'
            break
    }

    return arcgisGeometryType
}

function warn() {
    if (console && console.warn) {
        console.warn.apply(console, arguments)
    }
}

function calcAttributionWidth(map) {
    // either crop at 55px or user defined buffer
    return map.getSize().x - options.attributionWidthOffset + 'px'
}

function setEsriAttribution(map) {
    if (map.attributionControl && !map.attributionControl._esriAttributionAdded) {
        map.attributionControl.setPrefix('<a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> | Powered by <a href="https://www.esri.com">Esri</a>')

        let hoverAttributionStyle = document.createElement('style')
        hoverAttributionStyle.type = 'text/css'
        hoverAttributionStyle.innerHTML = '.esri-truncated-attribution:hover {' + 'white-space: normal' + '}'

        document.getElementsByTagName('head')[0].appendChild(hoverAttributionStyle)
        leaflet.DomUtil.addClass(map.attributionControl._container, 'esri-truncated-attribution:hover')

        // define a new css class in JS to trim attribution into a single line
        let attributionStyle = document.createElement('style')
        attributionStyle.type = 'text/css'
        attributionStyle.innerHTML = '.esri-truncated-attribution {' + 'vertical-align: -3px' + 'white-space: nowrap' + 'overflow: hidden' + 'text-overflow: ellipsis' + 'display: inline-block' + 'transition: 0s white-space' + 'transition-delay: 1s' + 'max-width: ' + calcAttributionWidth(map) + '' + '}'

        document.getElementsByTagName('head')[0].appendChild(attributionStyle)
        leaflet.DomUtil.addClass(map.attributionControl._container, 'esri-truncated-attribution')

        // update the width used to truncate when the map itself is resized
        map.on('resize', function (e) {
            map.attributionControl._container.style.maxWidth = calcAttributionWidth(e.target)
        })

        // remove injected scripts and style tags
        map.on('unload', function () {
            hoverAttributionStyle.parentNode.removeChild(hoverAttributionStyle)
            attributionStyle.parentNode.removeChild(attributionStyle)
            let nodeList = document.querySelectorAll('.esri-leaflet-jsonp')
            for (let i = 0; i < nodeList.length; i++) {
                nodeList.item(i).parentNode.removeChild(nodeList.item(i))
            }
        })

        map.attributionControl._esriAttributionAdded = true
    }
}

function _setGeometry(geometry) {
    let params = {
        geometry: null,
        geometryType: null
    }

    // convert bounds to extent and finish  别名
    if ((geometry instanceof leaflet.toLatLngBounds)||geometry instanceof leaflet.LatLngBounds) {
        // set geometry + geometryType
        params.geometry = boundsToExtent(geometry)
        params.geometryType = 'esriGeometryEnvelope'
        return params
    }

    // convert L.Marker > L.LatLng
    if (geometry.getLatLng) {
        geometry = geometry.getLatLng()
    }

    // convert L.LatLng to a geojson point and continue
    if (geometry instanceof leaflet.LatLng) {
        geometry = {
            type: 'Point',
            coordinates: [ geometry.lng, geometry.lat ]
        }
    }

    // handle L.GeoJSON, pull out the first geometry
    if (geometry instanceof leaflet.GeoJSON) {
        // reassign geometry to the GeoJSON value  (we are assuming that only one feature is present)
        geometry = geometry.getLayers()[0].feature.geometry
        params.geometry = geojsonToArcGIS$1(geometry)
        params.geometryType = geojsonTypeToArcGIS(geometry.type)
    }

    // Handle L.Polyline and L.Polygon
    if (geometry.toGeoJSON) {
        geometry = geometry.toGeoJSON()
    }

    // handle GeoJSON feature by pulling out the geometry
    if (geometry.type === 'Feature') {
        // get the geometry of the geojson feature
        geometry = geometry.geometry
    }

    // confirm that our GeoJSON is a point, line or polygon
    if (geometry.type === 'Point' || geometry.type === 'LineString' || geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
        params.geometry = geojsonToArcGIS$1(geometry)
        params.geometryType = geojsonTypeToArcGIS(geometry.type)
        return params
    }

    // warn the user if we havn't found an appropriate object
    warn('invalid geometry passed to spatial query. Should be L.LatLng, L.LatLngBounds, L.Marker or a GeoJSON Point, Line, Polygon or MultiPolygon object')

    return
}

function _getAttributionData(url, map) {
    jsonp(url, {}, leaflet.Util.bind(function (error, attributions) {
        if (error) {
            return
        }
        map._esriAttributions = []
        for (let c = 0; c < attributions.contributors.length; c++) {
            let contributor = attributions.contributors[c]

            for (let i = 0; i < contributor.coverageAreas.length; i++) {
                let coverageArea = contributor.coverageAreas[i]
                let southWest = leaflet.LatLng(coverageArea.bbox[0], coverageArea.bbox[1])
                let northEast = leaflet.LatLng(coverageArea.bbox[2], coverageArea.bbox[3])
                map._esriAttributions.push({
                    attribution: contributor.attribution,
                    score: coverageArea.score,
                    bounds: leaflet.toLatLngBounds(southWest, northEast),
                    minZoom: coverageArea.zoomMin,
                    maxZoom: coverageArea.zoomMax
                })
            }
        }

        map._esriAttributions.sort(function (a, b) {
            return b.score - a.score
        })

        // pass the same argument as the map's 'moveend' event
        let obj = {
            target: map
        }
        _updateMapAttribution(obj)
    }, this))
}

function _updateMapAttribution(evt) {
    let map = evt.target
    let oldAttributions = map._esriAttributions

    if (map && map.attributionControl && oldAttributions) {
        let newAttributions = ''
        let bounds = map.getBounds()
        let wrappedBounds = leaflet.toLatLngBounds(bounds.getSouthWest().wrap(), bounds.getNorthEast().wrap())
        let zoom = map.getZoom()

        for (let i = 0; i < oldAttributions.length; i++) {
            let attribution = oldAttributions[i]
            let text = attribution.attribution

            if (!newAttributions.match(text) && attribution.bounds.intersects(wrappedBounds) && zoom >= attribution.minZoom && zoom <= attribution.maxZoom) {
                newAttributions += ', ' + text
            }
        }

        newAttributions = newAttributions.substr(2)
        let attributionElement = map.attributionControl._container.querySelector('.esri-dynamic-attribution')

        attributionElement.innerHTML = newAttributions
        attributionElement.style.maxWidth = calcAttributionWidth(map)

        map.fire('attributionupdated', {
            attribution: newAttributions
        })
    }
}

export let EsriUtil = {
    warn: warn,
    cleanUrl: cleanUrl,
    getUrlParams: getUrlParams,
    isArcgisOnline: isArcgisOnline,
    geojsonTypeToArcGIS: geojsonTypeToArcGIS,
    responseToFeatureCollection: responseToFeatureCollection,
    geojsonToArcGIS: geojsonToArcGIS$1,
    arcgisToGeoJSON: arcgisToGeoJSON$1,
    boundsToExtent: boundsToExtent,
    extentToBounds: extentToBounds,
    calcAttributionWidth: calcAttributionWidth,
    setEsriAttribution: setEsriAttribution,
    _setGeometry: _setGeometry,
    _getAttributionData: _getAttributionData,
    _updateMapAttribution: _updateMapAttribution,
    _findIdAttributeFromFeature: _findIdAttributeFromFeature,
    _findIdAttributeFromResponse: _findIdAttributeFromResponse
}

export let Task = leaflet.Class.extend({

    options: {
        proxy: false,
        useCors: cors
    },

    // Generate a method for each methodName:paramName in the setters for this task.
    generateSetter: function generateSetter(param, context) {
        return leaflet.Util.bind(function (value) {
            this.params[param] = value
            return this
        }, context)
    },

    initialize: function initialize(endpoint) {
        // endpoint can be either a url (and options) for an ArcGIS Rest Service or an instance of EsriLeaflet.Service
        if (endpoint.request && endpoint.options) {
            this._service = endpoint
            leaflet.Util.setOptions(this, endpoint.options)
        } else {
            leaflet.Util.setOptions(this, endpoint)
            this.options.url = cleanUrl(endpoint.url)
        }

        // clone default params into this object
        this.params = leaflet.Util.extend({}, this.params || {})

        // generate setter methods based on the setters object implimented a child class
        if (this.setters) {
            for (let setter in this.setters) {
                let param = this.setters[setter]
                this[setter] = this.generateSetter(param, this)
            }
        }
    },

    token: function token(_token) {
        if (this._service) {
            this._service.authenticate(_token)
        } else {
            this.params.token = _token
        }
        return this
    },

    // ArcGIS Server Find/Identify 10.5+
    format: function format(boolean) {
        // use double negative to expose a more intuitive positive method name
        this.params.returnUnformattedValues = !boolean
        return this
    },

    request: function request(callback, context) {
        if (this.options.requestParams) {
            leaflet.Util.extend(this.params, this.options.requestParams)
        }
        if (this._service) {
            return this._service.request(this.path, this.params, callback, context)
        }

        return this._request('request', this.path, this.params, callback, context)
    },

    _request: function _request(method, path, params, callback, context) {
        let url = this.options.proxy ? this.options.proxy + '?' + this.options.url + path : this.options.url + path

        if ((method === 'get' || method === 'request') && !this.options.useCors) {
            return Request.get.JSONP(url, params, callback, context)
        }

        return Request[method](url, params, callback, context)
    }
})

export function task(options) {
    options = getUrlParams(options)
    return new Task(options)
}

export let Query = Task.extend({
    setters: {
        'offset': 'resultOffset',
        'limit': 'resultRecordCount',
        'fields': 'outFields',
        'precision': 'geometryPrecision',
        'featureIds': 'objectIds',
        'returnGeometry': 'returnGeometry',
        'returnM': 'returnM',
        'returnZ': 'returnZ',
        'transform': 'datumTransformation',
        'token': 'token'
    },

    path: 'query',

    params: {
        returnGeometry: true,
        returnZ: true,
        where: '1=1',
        outSR: 4326,
        outFields: '*'
    },

    // Returns a feature if its shape is wholly contained within the search geometry. Valid for all shape type combinations.
    within: function within(geometry) {
        this._setGeometryParams(geometry)
        this.params.spatialRel = 'esriSpatialRelContains' // to the REST api this reads geometry **contains** layer
        return this
    },

    // Returns a feature if any spatial relationship is found. Applies to all shape type combinations.
    intersects: function intersects(geometry) {
        this._setGeometryParams(geometry)
        this.params.spatialRel = 'esriSpatialRelIntersects'
        return this
    },

    // Returns a feature if its shape wholly contains the search geometry. Valid for all shape type combinations.
    contains: function contains(geometry) {
        this._setGeometryParams(geometry)
        this.params.spatialRel = 'esriSpatialRelWithin' // to the REST api this reads geometry **within** layer
        return this
    },

    // Returns a feature if the intersection of the interiors of the two shapes is not empty and has a lower dimension than the maximum dimension of the two shapes. Two lines that share an endpoint in common do not cross. Valid for Line/Line, Line/Area, Multi-point/Area, and Multi-point/Line shape type combinations.
    crosses: function crosses(geometry) {
        this._setGeometryParams(geometry)
        this.params.spatialRel = 'esriSpatialRelCrosses'
        return this
    },

    // Returns a feature if the two shapes share a common boundary. However, the intersection of the interiors of the two shapes must be empty. In the Point/Line case, the point may touch an endpoint only of the line. Applies to all combinations except Point/Point.
    touches: function touches(geometry) {
        this._setGeometryParams(geometry)
        this.params.spatialRel = 'esriSpatialRelTouches'
        return this
    },

    // Returns a feature if the intersection of the two shapes results in an object of the same dimension, but different from both of the shapes. Applies to Area/Area, Line/Line, and Multi-point/Multi-point shape type combinations.
    overlaps: function overlaps(geometry) {
        this._setGeometryParams(geometry)
        this.params.spatialRel = 'esriSpatialRelOverlaps'
        return this
    },

    // Returns a feature if the envelope of the two shapes intersects.
    bboxIntersects: function bboxIntersects(geometry) {
        this._setGeometryParams(geometry)
        this.params.spatialRel = 'esriSpatialRelEnvelopeIntersects'
        return this
    },

    // if someone can help decipher the ArcObjects explanation and translate to plain speak, we should mention this method in the doc
    indexIntersects: function indexIntersects(geometry) {
        this._setGeometryParams(geometry)
        this.params.spatialRel = 'esriSpatialRelIndexIntersects' // Returns a feature if the envelope of the query geometry intersects the index entry for the target geometry
        return this
    },

    // only valid for Feature Services running on ArcGIS Server 10.3+ or ArcGIS Online
    nearby: function nearby(latlng, radius) {
        latlng = leaflet.LatLng(latlng)
        this.params.geometry = [ latlng.lng, latlng.lat ]
        this.params.geometryType = 'esriGeometryPoint'
        this.params.spatialRel = 'esriSpatialRelIntersects'
        this.params.units = 'esriSRUnit_Meter'
        this.params.distance = radius
        this.params.inSR = 4326
        return this
    },

    where: function where(string) {
        // instead of converting double-quotes to single quotes, pass as is, and provide a more informative message if a 400 is encountered
        this.params.where = string
        return this
    },

    between: function between(start, end) {
        this.params.time = [ start.valueOf(), end.valueOf() ]
        return this
    },

    simplify: function simplify(map, factor) {
        let mapWidth = Math.abs(map.getBounds().getWest() - map.getBounds().getEast())
        this.params.maxAllowableOffset = mapWidth / map.getSize().y * factor
        return this
    },

    orderBy: function orderBy(fieldName, order) {
        order = order || 'ASC'
        this.params.orderByFields = this.params.orderByFields ? this.params.orderByFields + ',' : ''
        this.params.orderByFields += [ fieldName, order ].join(' ')
        return this
    },

    run: function run(callback, context) {
        this._cleanParams()

        // services hosted on ArcGIS Online and ArcGIS Server 10.3.1+ support requesting geojson directly
        if (this.options.isModern || isArcgisOnline(this.options.url)) {
            this.params.f = 'geojson'

            return this.request(function (error, response) {
                this._trapSQLerrors(error)
                callback.call(context, error, response, response)
            }, this)

            // otherwise convert it in the callback then pass it on
        } else {
            return this.request(function (error, response) {
                this._trapSQLerrors(error)
                callback.call(context, error, response && responseToFeatureCollection(response), response)
            }, this)
        }
    },

    count: function count(callback, context) {
        this._cleanParams()
        this.params.returnCountOnly = true
        return this.request(function (error, response) {
            callback.call(this, error, response && response.count, response)
        }, context)
    },

    ids: function ids(callback, context) {
        this._cleanParams()
        this.params.returnIdsOnly = true
        return this.request(function (error, response) {
            callback.call(this, error, response && response.objectIds, response)
        }, context)
    },

    // only valid for Feature Services running on ArcGIS Server 10.3+ or ArcGIS Online
    bounds: function bounds(callback, context) {
        this._cleanParams()
        this.params.returnExtentOnly = true
        return this.request(function (error, response) {
            if (response && response.extent && extentToBounds(response.extent)) {
                callback.call(context, error, extentToBounds(response.extent), response)
            } else {
                error = {
                    message: 'Invalid Bounds'
                }
                callback.call(context, error, null, response)
            }
        }, context)
    },

    distinct: function distinct() {
        // geometry must be omitted for queries requesting distinct values
        this.params.returnGeometry = false
        this.params.returnDistinctValues = true
        return this
    },

    // only valid for image services
    pixelSize: function pixelSize(rawPoint) {
        let castPoint = leaflet.Point(rawPoint)
        this.params.pixelSize = [ castPoint.x, castPoint.y ]
        return this
    },

    // only valid for map services
    layer: function layer(_layer) {
        this.path = _layer + '/query'
        return this
    },

    _trapSQLerrors: function _trapSQLerrors(error) {
        if (error) {
            if (error.code === '400') {
                warn('one common syntax error in query requests is encasing string values in double quotes instead of single quotes')
            }
        }
    },

    _cleanParams: function _cleanParams() {
        delete this.params.returnIdsOnly
        delete this.params.returnExtentOnly
        delete this.params.returnCountOnly
    },

    _setGeometryParams: function _setGeometryParams(geometry) {
        this.params.inSR = 4326
        let converted = _setGeometry(geometry)
        this.params.geometry = converted.geometry
        this.params.geometryType = converted.geometryType
    }

})

export function query(options) {
    return new Query(options)
}

export let Find = Task.extend({
    setters: {
        // method name > param name
        'contains': 'contains',
        'text': 'searchText',
        'fields': 'searchFields', // denote an array or single string
        'spatialReference': 'sr',
        'sr': 'sr',
        'layers': 'layers',
        'returnGeometry': 'returnGeometry',
        'maxAllowableOffset': 'maxAllowableOffset',
        'precision': 'geometryPrecision',
        'dynamicLayers': 'dynamicLayers',
        'returnZ': 'returnZ',
        'returnM': 'returnM',
        'gdbVersion': 'gdbVersion',
        // skipped implementing this (for now) because the REST service implementation isnt consistent between operations
        // 'transform': 'datumTransformations',
        'token': 'token'
    },

    path: 'find',

    params: {
        sr: 4326,
        contains: true,
        returnGeometry: true,
        returnZ: true,
        returnM: false
    },

    layerDefs: function layerDefs(id, where) {
        this.params.layerDefs = this.params.layerDefs ? this.params.layerDefs + '' : ''
        this.params.layerDefs += [ id, where ].join(':')
        return this
    },

    simplify: function simplify(map, factor) {
        let mapWidth = Math.abs(map.getBounds().getWest() - map.getBounds().getEast())
        this.params.maxAllowableOffset = mapWidth / map.getSize().y * factor
        return this
    },

    run: function run(callback, context) {
        return this.request(function (error, response) {
            callback.call(context, error, response && responseToFeatureCollection(response), response)
        }, context)
    }
})

export function find(options) {
    return new Find(options)
}

export let Identify = Task.extend({
    path: 'identify',

    between: function between(start, end) {
        this.params.time = [ start.valueOf(), end.valueOf() ]
        return this
    }
})

export function identify(options) {
    return new Identify(options)
}

export const ESRI = {
    VERSION:version,
    Support:Support,
    options:options,
    Util:EsriUtil,
    get:get,
    post:xmlHttpPost,
    request:request,
    Task:Task,
    task:task,
    Query:Query,
    Find:Find,
    find:find,
    Identify:Identify,
    identify:identify,
}

export default {};
