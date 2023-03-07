import Observable from 'ol/Observable';
import Event from 'ol/events/Event.js';
import { Popup } from '../../earth-core/Widget/Identify3d/Popup81';

// 默认高亮样式
const defaultHightLightStyle = {
  strokeWidth: 3,
  fillAlpha: 0.5,
  fill: '#ff0000',
  stroke: '#ff0000'
};

const IdentifyEventType = {
  /**
   * 功能打开关闭时触发
   */
  CHANGEACTIVE: 'change:active',
  /**
   * 查询到结果后触发
   */
  IDEHTIFYED: 'identifyed',
  /**
   * 查询完成后触发
   */
  IDEHTIFYEDALL: 'identifyedAll',
  /**
   * earth单个查询任务完成后触发
   */
  IDEHTIFYED3D: 'identifyed3d',
  /**
   * earth全部查询完成后触发
   */
  IDEHTIFYEDALL3D: 'identifyedAll3d'
};

export class IdentifyActiveEvent extends Event {
  constructor(type, active, identifyType) {
    super(type);
    this.active = active;
    this.identifyType = identifyType;
  }
}

export class IdentifyEvent extends Event {
  constructor(type, result, coordinate, queryId) {
    super(type);
    this.result = result;
    this.coordinate = coordinate;
    this.queryId = queryId;
  }
}

export class Identify3DEvent extends Event {
  constructor(type, result, coordinate, queryId) {
    super(type);
    this.result = result;
    this.coordinate = coordinate;
    this.queryId = queryId;
  }
}

class Identify extends Observable {
  constructor(earth) {
    super();
    this.active = false;
    this.earth = earth;
    this._popup = new Popup(this.earth.viewer);
    this.earthIdentifyed = this.earthIdentifyed.bind(this);
    this.earthIdentifyedAll = this.earthIdentifyedAll.bind(this);
  }

  init(queryMode = 'click') {
    if (this.earth) {
      this.initEarthIdentify();
    }
    this.active = true;
    this.dispatchEvent(
      new IdentifyActiveEvent(
        IdentifyEventType.CHANGEACTIVE,
        this.active,
        queryMode
      )
    );
  }

  /**
   * 三维地图点击查询
   */
  initEarthIdentify() {
    this._popup.pickOpen = true;
    this._popup.popupShow = true;
    this._popup.identifyed.addEventListener(this.earthIdentifyed);
    this._popup.identifyedAll.addEventListener(this.earthIdentifyedAll);
    this._popup.activate();
  }

  earthIdentifyed(result, coordinate, queryId) {
    this.dispatchEvent(
      new Identify3DEvent(
        IdentifyEventType.IDEHTIFYED3D,
        result,
        coordinate,
        queryId
      )
    );
  }

  earthIdentifyedAll(result, coordinate, queryId) {
    this.dispatchEvent(
      new Identify3DEvent(
        IdentifyEventType.IDEHTIFYEDALL3D,
        result,
        coordinate,
        queryId
      )
    );
  }

  clearHighLight() {
    this._popup.removeFeature();
    this._popup.unHighlighPick();
  }

  highLightFeature(result) {
    const highlightStyle = defaultHightLightStyle;
    if (result.identifyField.pickfeaturestyle) {
      const { outlineWidth, opacity, color, outlineColor } =
        result.identifyField.pickfeaturestyle;
      highlightStyle.strokeWidth = outlineWidth;
      highlightStyle.fillAlpha = opacity / 100;
      highlightStyle.fill = color;
      highlightStyle.stroke = outlineColor;
    }
    if (result.geometry) {
      this._popup.showFeature(JSON.parse(result.geometry), highlightStyle);
    } else {
      if (!result.identifyField.pickfeaturestyle) {
        result.identifyField.pickfeaturestyle = {
          outlineWidth: defaultHightLightStyle.strokeWidth,
          opacity: defaultHightLightStyle.fillAlpha * 100,
          color: defaultHightLightStyle.fill,
          outlineColor: defaultHightLightStyle.stroke
        };
      }
      this._popup.highlighPick(result);
    }
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
    if (this.earth) {
      this._popup.identifyed.removeEventListener(this.earthIdentifyed);
      this._popup.identifyedAll.removeEventListener(this.earthIdentifyedAll);
      this._popup.destroy();
    }
    this.active = false;
    this.dispatchEvent(
      new IdentifyActiveEvent(IdentifyEventType.CHANGEACTIVE, this.active)
    );
  }
}

export default Identify;
