import axios from '../../../utils/request';
import { LoadXmlText } from '../../../utils/common';

export function geoStrParse(data) {
  return new Promise((resolve) => {
    if (data.geoStr) {
      resolve();
    } else {
      switch (data.type) {
        case 'geoserver-wms':
        case 'geoserver-wfs': {
          let param = {
            typeName: data.selectLayer
              ? data.selectLayer
              : data.visibleLayers[0],
            service: 'wfs',
            Request: 'DescribeFeatureType',
            authkey: data.authkey
          };
          axios
            .get(data.url, {
              params: param,
              timeout: 5000,
              headers: {
                'content-type': 'application/xml'
              }
            })
            .then((response) => {
              let xml;
              try {
                xml = LoadXmlText(response.headers ? response.data : response);
                let elementList =
                  xml.getElementsByTagName('xsd:sequence')[0].children;
                for (let element of elementList) {
                  if (element.getAttribute('type')?.indexOf('gml') > -1) {
                    data.geoStr = element.getAttribute('name');
                    break;
                  }
                }
                resolve();
              } catch (e) {
                console.warn(e);
                resolve();
              }
            });
          break;
        }
        default:
          resolve();
          break;
      }
    }
  });
}
