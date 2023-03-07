import Observable from 'ol/Observable';
import Event from 'ol/events/Event.js';

const IdentifyEventType = {
  /**
   * 功能打开关闭时触发
   */
  CHANGEACTIVE: 'change:active'
};

export class IdentifyActiveEvent extends Event {
  constructor(type, active) {
    super(type);
    this.active = active;
  }
}

class Identify extends Observable {
  constructor(map, earth) {
    super();
    this.active = false;
    this.map = map;
    this.earth = earth;
    if (this.map) {
      import('./map/Identify').then(({ default: MapIdentify }) => {
        this.mapIdentify = new MapIdentify(this.map);
        this.mapIdentify.on('identifyed', (e) => {
          this.dispatchEvent(e);
        });
        this.mapIdentify.on('identifyedAll', (e) => {
          this.dispatchEvent(e);
        });
      });
    }
    if (this.earth) {
      import('./earth/Identify').then(({ default: EarthIdentify }) => {
        this.earthIdentify = new EarthIdentify(this.earth);
        this.earthIdentify.on('identifyed3d', (e) => {
          this.dispatchEvent(e);
        });
        this.earthIdentify.on('identifyedAll3d', (e) => {
          this.dispatchEvent(e);
        });
      });
    }
  }

  init(queryMode = 'click') {
    this.map && this.mapIdentify.init(queryMode);
    this.earth && this.earthIdentify.init(queryMode);
    this.active = true;
    this.dispatchEvent(
      new IdentifyActiveEvent(
        IdentifyEventType.CHANGEACTIVE,
        this.active,
        queryMode
      )
    );
  }

  clearHighLight() {
    const currentView = this.getCurrentView();
    currentView === 'map' && this.mapIdentify.clearHighLight();
    currentView === 'earth' && this.earthIdentify.clearHighLight();
  }

  highLightFeature(result) {
    const currentView = this.getCurrentView();
    currentView === 'map' && this.mapIdentify.highLightFeature(result);
    currentView === 'earth' && this.earthIdentify.highLightFeature(result);
  }

  setActive(flag, queryMode = 'click') {
    if (flag) {
      this.init(queryMode);
    } else {
      if (this.active) {
        this.cancel();
      }
    }
  }

  cancel() {
    this.map && this.mapIdentify.cancel();
    this.earth && this.earthIdentify.cancel();
    this.active = false;
    this.dispatchEvent(
      new IdentifyActiveEvent(IdentifyEventType.CHANGEACTIVE, this.active)
    );
  }

  getCurrentView() {
    if (!this.map) {
      return 'earth';
    } else if (!this.earth) {
      return 'map';
    } else {
      const mapIsShow = this.map.getViewport().style.display !== 'none';

      return mapIsShow ? 'map' : 'earth';
    }
  }
}

export default Identify;
