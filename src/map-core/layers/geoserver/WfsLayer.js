import { Vector as VectorLayer } from 'ol/layer';
import axios from '../../../utils/request';
import { Vector as VectorSource } from 'ol/source';
import { addParamToUrl } from '../../../utils/uitls';
import { LoadXmlText } from '../../../utils/common';
import WFS from 'ol/format/WFS';
import GeoJSON from 'ol/format/GeoJSON';
import StyleManager from '../../StyleManager';
import { bbox } from 'ol/loadingstrategy';
import * as Filter from 'ol/format/filter';
import CQL from 'shinegis-client-23d/src/utils/format/CQL';

class WfsLayer {
  constructor(map) {
    this.map = map;
    this.styleManager = new StyleManager(this.map);
  }

  generate(data) {
    return new Promise((resolve, reject) => {
      let _this = this;
      let requestUrl = data.url + '?service=WFS&request=getCapabilities';
      if (data.authkey) {
        // requestUrl = requestUrl + '&authkey=' + data.authkey
        requestUrl = addParamToUrl(requestUrl, 'authkey', data.authkey);
      }
      axios
        .get(requestUrl, {
          headers: {
            'content-type': 'application/xml'
          }
        })
        .then((response) => {
          let xml;
          try {
            xml = LoadXmlText(response.headers ? response.data : response);
          } catch (e) {
            reject(new Error('当前用户没权限,请联系管理员'));
            return;
          }
          let layers = xml.getElementsByTagName('FeatureTypeList')[0].children;
          let targetLayer;
          for (let i = 0, l = layers.length; i < l; i++) {
            for (let j = 0, ll = layers[i].children.length; j < ll; j++) {
              if (layers[i].children[j].nodeName === 'Name') {
                if (
                  this.isEqual(
                    layers[i].children[j].innerHTML.toString(),
                    data.visibleLayers[0].toString()
                  )
                ) {
                  targetLayer = layers[i];
                  break;
                }
              }
            }
            if (targetLayer) {
              break;
            }
          }
          let initExtent = [];
          for (let i = 0, l = targetLayer.children.length; i < l; i++) {
            if (targetLayer.children[i].nodeName === 'ows:WGS84BoundingBox') {
              let lowercorner =
                targetLayer.children[i].children[0].innerHTML.split(' ');
              let uppercorner =
                targetLayer.children[i].children[1].innerHTML.split(' ');
              initExtent = [
                Number(lowercorner[0]),
                Number(lowercorner[1]),
                Number(uppercorner[0]),
                Number(uppercorner[1])
              ];
              break;
            }
          }
          let options = {
            initExtent: initExtent
          };
          let layer = _this.createGeoServerWFSLayer(data, options);
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
    });
  }

  isEqual(layer, visibleLayer) {
    if (layer === visibleLayer) {
      return true;
    } else {
      let layerArr = layer.split(':');
      let visibleLayerArr = visibleLayer.split(':');
      let tureLayer = layerArr[layerArr.length - 1];
      let tureVisibleLayer = visibleLayerArr[visibleLayerArr.length - 1];
      if (tureLayer === tureVisibleLayer) {
        return true;
      }
    }
    return false;
  }

  /**
   * 创建GeoServer的WFS图层
   * @param {*} data
   * @param {*} options
   */
  createGeoServerWFSLayer(data, options) {
    const vectorSource = new VectorSource({
      format: new GeoJSON(),
      loader: (extent, resolution, projection, success, failure) => {
        let filter = vectorSource.filter
          ? vectorSource.filter
          : data.filter
          ? data.filter
          : null;
        let writeOptions = {
          srsName: projection.getCode(),
          // featureNS: data.url,    //命名空间
          // featurePrefix: 'zbtr',               //工作区域
          featureTypes: data.visibleLayers, // 图层名
          bbox: extent,
          geometryName: data.geoStr || 'the_geom',
          outputFormat: 'application/json'
        };
        // let filter = "{\"type\":\"and\",\"param\":[{\"type\":\"=\",\"param\":[\"dlmc\",\"防护绿地\"]},{\"type\":\">\",\"param\":[\"shape_area\",\"5000\"]}]}"
        if (filter) {
          if (typeof filter === 'string') {
            writeOptions.filter = new CQL().read(filter);
          } else {
            writeOptions.filter = this.parseFilter(filter);
          }
        }

        var featureRequest = new WFS().writeGetFeature(writeOptions);

        let requestUrl = data.url;
        if (data.authkey) {
          requestUrl = requestUrl + '?authkey=' + data.authkey;
        }

        fetch(requestUrl, {
          method: 'POST',
          body: new XMLSerializer().serializeToString(featureRequest)
        })
          .then((response) => {
            return response.json();
          })
          .then((json) => {
            let trueWhere = vectorSource.filter
              ? vectorSource.filter
              : data.filter
              ? data.filter
              : null;
            //请求where与实际where不同说明是过滤前的数据,不进行解析
            if (filter !== trueWhere) {
              return;
            }
            const features = new GeoJSON().readFeatures(json);
            vectorSource.addFeatures(features);
            success(features);
          })
          .catch(() => {
            vectorSource.removeLoadedExtent(extent);
            failure();
          });
      },
      strategy: bbox
    });

    vectorSource.updateParams = function (filter) {
      this.filter = filter.CQL_FILTER;
      this.refresh();
    };

    const layer = new VectorLayer({
      id: data.id,
      info: data,
      layerTag: data.layerTag,
      opacity: data.opacity,
      zIndex: data.mapIndex,
      initExtent: options.initExtent,
      minZoom: data.minZoom,
      maxZoom: data.maxZoom,
      minResolution: data.minResolution,
      maxResolution: data.maxResolution,
      isFit: typeof data.isFit === 'boolean' ? data.isFit : false,
      source: vectorSource
    });

    //图层绑定样式getLayerStyle setLayerStyle方法
    this.styleManager.bindLayer(layer);

    // 初始样式
    if (data.symbol) {
      layer.setLayerStyle(data.symbol);
    } else {
      //图层样式
    }
    return layer;
  }

  parseFilter(filter) {
    if (!filter.type) {
      console.warn('type字段不存在');
      return;
    }
    if (!filter.param) {
      console.warn('param字段不存在');
      return;
    }
    let filterConditions = [];
    switch (filter.type.toLowerCase()) {
      case 'and':
        for (let i = 0; i < filter.param.length; i++) {
          let filterChild = this.parseFilter(filter.param[i]);
          filterConditions.push(filterChild);
        }
        return Filter.and.apply(null, filterConditions);
      case 'or':
        for (let i = 0; i < filter.param.length; i++) {
          let filterChild = this.parseFilter(filter.param[i]);
          filterConditions.push(filterChild);
        }
        return Filter.or.apply(null, filterConditions);
      case 'not':
        for (let i = 0; i < filter.param.length; i++) {
          let filterChild = this.parseFilter(filter.param[i]);
          filterConditions.push(filterChild);
        }
        return Filter.not.apply(null, filterConditions);
      case '=':
        return Filter.equalTo(filter.param[0], filter.param[1]);
      case '!==':
        return Filter.notEqualTo(filter.param[0], filter.param[1]);
      case '>':
        return Filter.greaterThan(filter.param[0], filter.param[1]);
      case '<':
        return Filter.lessThan(filter.param[0], filter.param[1]);
      case '>=':
        return Filter.greaterThanOrEqualTo(filter.param[0], filter.param[1]);
      case '<=':
        return Filter.lessThanOrEqualTo(filter.param[0], filter.param[1]);
      case 'between':
        return Filter.between(
          filter.param[0],
          filter.param[1],
          filter.param[2]
        );
    }
  }
}

export default WfsLayer;
