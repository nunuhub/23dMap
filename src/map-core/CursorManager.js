import { off, on } from './olPlot/Utils/domUtils';
import { bindAll } from './olPlot/Utils/utils';
import * as PlotTypes from './olPlot/Utils/PlotTypes';

class CursorManager {
  constructor(map) {
    this.map = map;
    this.tipContent = null;
    this.tipString = '单击开始绘制';
    this.cursorSrc =
      'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjxzdmcgd2lkdGg9IjE4cHgiIGhlaWdodD0iMTdweCIgdmlld0JveD0iMCAwIDE4IDE3IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPg0KICAgIDwhLS0gR2VuZXJhdG9yOiBTa2V0Y2ggNTkgKDg2MTI3KSAtIGh0dHBzOi8vc2tldGNoLmNvbSAtLT4NCiAgICA8dGl0bGU+57uY5Yi2PC90aXRsZT4NCiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4NCiAgICA8ZyBpZD0i6aG16Z2iLTEiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPg0KICAgICAgICA8ZyBpZD0i57uY5Yi2IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgxLjAwMDAwMCwgMC4wMDAwMDApIj4NCiAgICAgICAgICAgIDxwb2x5Z29uIGlkPSLot6/lvoQtOCIgc3Ryb2tlPSIjRUQ5MTA1IiBmaWxsPSIjRkY5MjAwIiBwb2ludHM9IjAgMTYgNiAxNCAxNiA0IDEyIDAgMiAxMCI+PC9wb2x5Z29uPg0KICAgICAgICAgICAgPGxpbmUgeDE9IjIiIHkxPSIxMCIgeDI9IjYiIHkyPSIxNCIgaWQ9Iui3r+W+hC05IiBzdHJva2U9IiNGRkZGRkYiPjwvbGluZT4NCiAgICAgICAgICAgIDxsaW5lIHgxPSIxMCIgeTE9IjIiIHgyPSIxNCIgeTI9IjYiIGlkPSLot6/lvoQtMTAiIHN0cm9rZT0iI0ZGRkZGRiI+PC9saW5lPg0KICAgICAgICA8L2c+DQogICAgPC9nPg0KPC9zdmc+';

    bindAll(['_onMapMouseMove', '_onMapMouseOut'], this);
  }

  static getInstance(map) {
    if (!CursorManager.instanceMap) {
      CursorManager.instanceMap = new Map();
    }
    if (map) {
      const id = map.mapid;
      if (!CursorManager.instanceMap.get(id)) {
        const instance = new CursorManager(map);
        CursorManager.instanceMap.set(id, instance);
      }
      return CursorManager.instanceMap.get(id);
    } else {
      return CursorManager.instanceMap.values().next().value;
    }
  }

  start(cursorSrc) {
    if (cursorSrc) {
      this.cursorSrc = cursorSrc;
    }
    // console.log(cursorUrl)
    this.map.getTargetElement().style.cursor =
      'url(' + this.cursorSrc + ') 0 24,pointer';
    this.startOnlyTips();
  }

  startOnlyTips() {
    const mapElement = this.map.getTargetElement();
    const legendDom = document.getElementsByClassName('legendCommonDiv')[0];
    this._createTip();
    on(mapElement, 'mousemove', this._onMapMouseMove);
    on(mapElement, 'mouseout', this._onMapMouseOut);
    if (legendDom) {
      legendDom.style.cursor = 'default';
      on(legendDom, 'mousemove', this._onMapMouseOut);
    }
  }

  cancel() {
    this.map.getTargetElement().style.cursor = '';
    if (this.tipContent) {
      this.tipContent.style.display = 'none';
    }
    const mapElement = this.map.getTargetElement();
    off(mapElement, 'mousemove', this._onMapMouseMove);
    off(mapElement, 'mouseout', this._onMapMouseOut);

    const legendDom = document.getElementsByClassName('legendCommonDiv')[0];
    if (legendDom) {
      off(legendDom, 'mousemove', this._onMapMouseOut);
    }
  }

  setTipByPlotType(type) {
    let tips = '单击开始绘制';
    switch (type) {
      case PlotTypes.TEXTAREA:
        tips = '单击绘制标注';
        break;
      case PlotTypes.POINT:
        tips = '单击绘制要素';
        break;
      case PlotTypes.PENNANT:
        break;
      case PlotTypes.POLYLINE:
        break;
      case PlotTypes.DASHLINE:
        break;
      case PlotTypes.RAILLOADLINE:
        break;
      case PlotTypes.RAILLOADCURVE:
        break;
      case PlotTypes.ARC:
        break;
      case PlotTypes.CIRCLE:
        tips = '单击确定圆心';
        break;
      case PlotTypes.CURVE:
        break;
      case PlotTypes.DASHCURVE:
        break;
      case PlotTypes.MULTIPLECURVE:
        break;
      case PlotTypes.FREEHANDLINE:
        break;
      case PlotTypes.RECTANGLE:
        break;
      case PlotTypes.ELLIPSE:
        break;
      case PlotTypes.LUNE:
        break;
      case PlotTypes.SECTOR:
        tips = '单击确定圆心';
        break;
      case PlotTypes.CLOSED_CURVE:
        break;
      case PlotTypes.POLYGON:
        break;
      case PlotTypes.ATTACK_ARROW:
        tips = '单击确定起始点1';
        break;
      case PlotTypes.FREE_POLYGON:
        break;
      case PlotTypes.DOUBLE_ARROW:
        tips = '单击确定起始点1';
        break;
      case PlotTypes.STRAIGHT_ARROW:
        break;
      case PlotTypes.FINE_ARROW:
        break;
      case PlotTypes.DOTTED_ARROW:
        break;
      case PlotTypes.ASSAULT_DIRECTION:
        break;
      case PlotTypes.TAILED_ATTACK_ARROW:
        break;
      case PlotTypes.SQUAD_COMBAT:
        break;
      case PlotTypes.TAILED_SQUAD_COMBAT:
        break;
      case PlotTypes.GATHERING_PLACE:
        break;
      case PlotTypes.RECTFLAG:
        break;
      case PlotTypes.TRIANGLEFLAG:
        break;
      case PlotTypes.CURVEFLAG:
        break;
    }
    this.tipString = tips;
  }

  setTip(tip) {
    if (tip) {
      this.tipString = tip;
    }
  }

  setCursorSrc(cursorSrc) {
    this.cursorSrc = cursorSrc;
  }

  _onMapMouseMove(event) {
    var mouse = this._mousePos(event);
    this.tipContent.style.left = mouse.x + 10 + 'px';
    this.tipContent.style.top = mouse.y + 10 + 'px';
    this.tipContent.innerHTML = this.tipString;
    this.tipContent.style.display = '';
  }

  _onMapMouseOut(event) {
    this.tipContent.style.display = 'none';
    if (event.target !== this.map.getTargetElement()) {
      event.stopPropagation();
    }
  }

  _createTip() {
    if (!this.tipContent) {
      const _className = 'ol-plot-tip';
      this.tipContent = document.createElement('div');
      this.tipContent.className = _className;
      document.body.append(this.tipContent);
    }
    return this.tipContent;
  }

  _mousePos(e) {
    e = e || window.event;
    return {
      x:
        e.clientX +
        document.body.scrollLeft +
        document.documentElement.scrollLeft,
      y:
        e.clientY + document.body.scrollTop + document.documentElement.scrollTop
    };
  }
}

export default CursorManager;
