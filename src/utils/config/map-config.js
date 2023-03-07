import { Vector as VectorLayer } from 'ol/layer.js';
import { Vector as VectorSource } from 'ol/source.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';

// 地图初始加载图层
export const mapDefaultLayers = [
  // 绘制图层
  new VectorLayer({
    id: 'drawLayer',
    zIndex: 999999,
    source: new VectorSource(),
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new Stroke({
        color: 'rgba(0, 191, 255, 2)',
        width: 2
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#ffcc33'
        })
      })
    })
  }),
  // 定位图层
  new VectorLayer({
    id: 'locateLayer',
    zIndex: 999999,
    source: new VectorSource(),
    style: new Style({
      fill: new Fill({
        color: 'rgba(255, 255, 255, 0.2)'
      }),
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2
      }),
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: '#ffcc33'
        })
      })
    })
  }),
  new VectorLayer({
    id: 'identifyDrawLayer',
    zIndex: 999999,
    source: new VectorSource()
  }),
  new VectorLayer({
    id: 'identifyPopupLayer',
    zIndex: 999999,
    source: new VectorSource()
  })
];
