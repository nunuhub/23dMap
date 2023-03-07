import { Tile as TileLayer } from 'ol/layer';
import axios from '../../../utils/request';
import { registerProj } from '../../CustomProjection';
import { get as getProjection } from 'ol/proj';

import { WMTS as WMTSSource } from 'ol/source';
import { LoadXmlText } from '../../../utils/common';
import WMTSCapabilities from 'ol/format/WMTSCapabilities';
import { optionsFromCapabilities } from 'ol/source/WMTS';
import WmtsTileGrid from 'ol/tilegrid/WMTS';

class GDWMTSLayer {
  constructor(map) {
    this.map = map;
    this.proxy = '/gisqBI/api/gis/proxy?';
  }

  generate(data) {
    // if (data.isProxy && process.env.NODE_ENV === 'development') {
    if (data.isProxy) {
      this.proxy = data.proxyPath ? data.proxyPath : '/gisqBI/api/gis/proxy?';
    } else {
      this.proxy = '';
    }
    return new Promise((resolve, reject) => {
      let requestUrl = this.proxy + data.url;
      axios
        .get(requestUrl)
        // axios.get((process.env.NODE_ENV === 'development' ? '' : '') + data.url + '?f=json')
        .then((response) => {
          response = response.headers ? response.data : response;
          let layer = this.createArcGISWMTSLayer(data, response);
          resolve(layer);
        })
        .catch((error) => {
          console.error(error);
          reject(
            new Error(
              '"' + data.label + '"' + '图层无法正常加载，请检查运维端配置项!'
            )
          );
        });
      /* let layer = this.createArcGISWMTSLayer(data, "<Capabilities xmlns=\"http://www.opengis.net/wmts/1.0\" xmlns:ows=\"http://www.opengis.net/ows/1.1\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:gml=\"http://www.opengis.net/gml\" xsi:schemaLocation=\"http://www.opengis.net/wmts/1.0 http://schemas.opengis.net/wmts/1.0/wmtsGetCapabilities_response.xsd\" version=\"1.0.0\"><ows:ServiceIdentification><ows:Title>SDYX_WEIP_2021_M02_FS2K</ows:Title><ows:ServiceType>OGC WMTS</ows:ServiceType><ows:ServiceTypeVersion>1.0.0</ows:ServiceTypeVersion></ows:ServiceIdentification><ows:OperationsMetadata><ows:Operation name=\"GetCapabilities\"><ows:DCP><ows:HTTP><ows:Get xlink:href=\"http://19.200.42.50/NServiceAdapter/WMTS/SDYX_YINGX_FS2K_WMTS/29ee53a70ab326699013e785c29c0c3b/1.0.0/WMTSCapabilities.xml\"><ows:Constraint name=\"GetEncoding\"><ows:AllowedValues><ows:Value>RESTful</ows:Value></ows:AllowedValues></ows:Constraint></ows:Get><ows:Get xlink:href=\"http://19.200.42.50/NServiceAdapter/WMTS/SDYX_YINGX_FS2K_WMTS/29ee53a70ab326699013e785c29c0c3b?\"><ows:Constraint name=\"GetEncoding\"><ows:AllowedValues><ows:Value>KVP</ows:Value></ows:AllowedValues></ows:Constraint></ows:Get></ows:HTTP></ows:DCP></ows:Operation><ows:Operation name=\"GetTile\"><ows:DCP><ows:HTTP><ows:Get xlink:href=\"http://19.200.42.50/NServiceAdapter/WMTS/SDYX_YINGX_FS2K_WMTS/29ee53a70ab326699013e785c29c0c3b/tile/1.0.0/\"><ows:Constraint name=\"GetEncoding\"><ows:AllowedValues><ows:Value>RESTful</ows:Value></ows:AllowedValues></ows:Constraint></ows:Get><ows:Get xlink:href=\"http://19.200.42.50/NServiceAdapter/WMTS/SDYX_YINGX_FS2K_WMTS/29ee53a70ab326699013e785c29c0c3b?\"><ows:Constraint name=\"GetEncoding\"><ows:AllowedValues><ows:Value>KVP</ows:Value></ows:AllowedValues></ows:Constraint></ows:Get></ows:HTTP></ows:DCP></ows:Operation></ows:OperationsMetadata><Contents><Layer><ows:Title>SDYX_WEIP_2021_M02_FS2K</ows:Title><ows:Identifier>SDYX_WEIP_2021_M02_FS2K</ows:Identifier><ows:BoundingBox crs=\"urn:ogc:def:crs:EPSG::0\"><ows:LowerCorner>700385.637 2508679.2526</ows:LowerCorner><ows:UpperCorner>739828.8522 2545752.437</ows:UpperCorner></ows:BoundingBox><ows:WGS84BoundingBox crs=\"urn:ogc:def:crs:OGC:2:84\"><ows:LowerCorner>113.00375259410319 22.67572972380626</ows:LowerCorner><ows:UpperCorner>113.38851671033306 23.010969917637492</ows:UpperCorner></ows:WGS84BoundingBox><Style isDefault=\"true\"><ows:Title>Default Style</ows:Title><ows:Identifier>default</ows:Identifier></Style><Format>image/jpgpng</Format><TileMatrixSetLink><TileMatrixSet>default028mm</TileMatrixSet></TileMatrixSetLink><ResourceURL format=\"image/jpgpng\" resourceType=\"tile\" template=\"http://19.200.42.50/NServiceAdapter/WMTS/SDYX_YINGX_FS2K_WMTS/29ee53a70ab326699013e785c29c0c3b/tile/1.0.0/SDYX_WEIP_2021_M02_FS2K/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}\"/></Layer><TileMatrixSet><ows:Title>TileMatrix using 0.28mm</ows:Title><ows:Abstract>The tile matrix set that has scale values calculated based on the dpi defined by OGC specification (dpi assumes 0.28mm as the physical distance of a pixel).</ows:Abstract><ows:Identifier>default028mm</ows:Identifier><ows:SupportedCRS>urn:ogc:def:crs:EPSG::0</ows:SupportedCRS><TileMatrix><ows:Identifier>0</ows:Identifier><ScaleDenominator>5.590833821867833E8</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>1</MatrixWidth><MatrixHeight>1</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>1</ows:Identifier><ScaleDenominator>2.7954169109339166E8</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>1</MatrixWidth><MatrixHeight>1</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>2</ows:Identifier><ScaleDenominator>1.3977084555142057E8</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>1</MatrixWidth><MatrixHeight>1</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>3</ows:Identifier><ScaleDenominator>6.988542277098557E7</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>2</MatrixWidth><MatrixHeight>2</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>4</ows:Identifier><ScaleDenominator>3.494271138549279E7</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>3</MatrixWidth><MatrixHeight>3</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>5</ows:Identifier><ScaleDenominator>1.7471355697471105E7</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>5</MatrixWidth><MatrixHeight>6</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>6</ows:Identifier><ScaleDenominator>8735677.848735552</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>10</MatrixWidth><MatrixHeight>12</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>7</ows:Identifier><ScaleDenominator>4367838.924367776</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>19</MatrixWidth><MatrixHeight>24</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>8</ows:Identifier><ScaleDenominator>2183919.462183888</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>37</MatrixWidth><MatrixHeight>48</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>9</ows:Identifier><ScaleDenominator>1091959.731091944</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>73</MatrixWidth><MatrixHeight>96</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>10</ows:Identifier><ScaleDenominator>545979.865545972</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>145</MatrixWidth><MatrixHeight>192</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>11</ows:Identifier><ScaleDenominator>272989.92804827413</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>290</MatrixWidth><MatrixHeight>383</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>12</ows:Identifier><ScaleDenominator>136494.96874884889</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>579</MatrixWidth><MatrixHeight>766</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>13</ows:Identifier><ScaleDenominator>68247.47964971262</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>1158</MatrixWidth><MatrixHeight>1532</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>14</ows:Identifier><ScaleDenominator>34123.73982485631</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>2316</MatrixWidth><MatrixHeight>3064</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>15</ows:Identifier><ScaleDenominator>17061.869912428156</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>4631</MatrixWidth><MatrixHeight>6128</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>16</ows:Identifier><ScaleDenominator>8530.939680925909</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>9261</MatrixWidth><MatrixHeight>12255</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>17</ows:Identifier><ScaleDenominator>4265.469840462954</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>18522</MatrixWidth><MatrixHeight>24509</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>18</ows:Identifier><ScaleDenominator>2132.734920231477</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>37044</MatrixWidth><MatrixHeight>49017</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>19</ows:Identifier><ScaleDenominator>1066.3674601157386</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>74088</MatrixWidth><MatrixHeight>98034</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>20</ows:Identifier><ScaleDenominator>533.1837300578693</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>148175</MatrixWidth><MatrixHeight>196068</MatrixHeight></TileMatrix><TileMatrix><ows:Identifier>21</ows:Identifier><ScaleDenominator>266.59186502893465</ScaleDenominator><TopLeftCorner>-4923200.0 1.00021E7</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>296350</MatrixWidth><MatrixHeight>392135</MatrixHeight></TileMatrix></TileMatrixSet></Contents><ServiceMetadataURL xlink:href=\"http://19.200.42.50/NServiceAdapter/WMTS/SDYX_YINGX_FS2K_WMTS/29ee53a70ab326699013e785c29c0c3b/1.0.0/WMTSCapabilities.xml\"/></Capabilities>")
            resolve(layer)*/
    });
  }

  /**
   * 创建ArcGIS动态服务图层
   * @param {*} data
   * @param {*} options
   */
  createArcGISWMTSLayer(data, xml) {
    var parser = new WMTSCapabilities();
    var result = parser.read(xml);
    let tileMatrixSet = result.Contents.TileMatrixSet[0];
    tileMatrixSet.SupportedCRS = 'EPSG:454700';
    let targetSRS = tileMatrixSet.SupportedCRS;
    registerProj(targetSRS);
    var WMTSSourceOptions = optionsFromCapabilities(result, {
      layer: data.visibleLayers[0]
    });
    let _extent = [];
    if (
      WMTSSourceOptions.tileGrid.extent_ &&
      WMTSSourceOptions.tileGrid.extent_.length > 0
    ) {
      _extent = WMTSSourceOptions.tileGrid.extent_;
    } else {
      // 用于获取 xml有问题的wmts服务的 extent
      try {
        let xml = LoadXmlText(xml);
        let lowerCorner = xml
          .getElementsByTagName('ows:LowerCorner')[0]
          .textContent.split(' ');
        let upperCorner = xml
          .getElementsByTagName('ows:UpperCorner')[0]
          .textContent.split(' ');
        _extent = [
          lowerCorner[0] * 1,
          lowerCorner[1] * 1,
          upperCorner[0] * 1,
          upperCorner[1] * 1
        ];
        // eslint-disable-next-line no-empty
      } catch (e) {}
    }

    let targetProject = getProjection(WMTSSourceOptions.projection.code_);
    targetProject.setExtent(_extent);
    WMTSSourceOptions.format = 'image/png';
    WMTSSourceOptions.crossOrigin = 'anonymous';
    let wmtsSource = new WMTSSource({
      urls: WMTSSourceOptions.urls,
      requestEncoding: WMTSSourceOptions.requestEncoding,
      // url:(process.env.NODE_ENV === 'development' ? '' : "") + data.url,
      layer: WMTSSourceOptions.layer,
      tileLoadFunction: function (imageTile, src) {
        if (src.indexOf('jsp?') !== -1) {
          // 存在代理
          if (src.indexOf('token') === -1 && src.indexOf('tk') === -1) {
            // 且没有token
            imageTile.getImage().src = src.replace('&', '?');
          } else {
            imageTile.getImage().src = src;
          }
        } else {
          imageTile.getImage().src = src;
        }
      },
      matrixSet: WMTSSourceOptions.matrixSet,
      format: WMTSSourceOptions.format,
      crossOrigin: WMTSSourceOptions.crossOrigin,
      projection: targetProject,
      tileGrid: new WmtsTileGrid({
        // origin:[WMTSSourceOptions.tileGrid.origins_[0][1],WMTSSourceOptions.tileGrid.origins_[0][0]],
        // resolutions:WMTSSourceOptions.tileGrid.resolutions_,
        // matrixIds:WMTSSourceOptions.tileGrid.matrixIds_,
        origin: data.origin
          ? data.origin
          : WMTSSourceOptions.tileGrid.origins_[0],
        resolutions: data.resolutions
          ? data.resolutions
          : WMTSSourceOptions.tileGrid.resolutions_,
        matrixIds: data.matrixIds
          ? data.matrixIds
          : WMTSSourceOptions.tileGrid.matrixIds_,
        //  extent:WMTSSourceOptions.tileGrid.extent_,
        extent: _extent
      }),
      style: WMTSSourceOptions.style,
      wrapX: true
    });
    var layer = new TileLayer({
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      opacity: data.opacity,
      zIndex: data.mapIndex,
      source: wmtsSource,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      // initExtent:WMTSSourceOptions.tileGrid.extent_
      initExtent: _extent
    });
    layer.projection = targetSRS;
    return layer;
  }
}

export default GDWMTSLayer;
