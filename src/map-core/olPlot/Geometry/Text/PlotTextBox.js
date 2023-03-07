import { Map, Overlay } from 'ol';
import { DragPan as $DragPan } from 'ol/interaction';
import autosize from '../../Utils/autosize';
import { DEF_TEXT_STYEL } from '../../Constants';
import { merge, bindAll } from '../../Utils/utils';
import { unByKey } from 'ol/Observable';
import { on, off, setStyle, getStyle } from '../../Utils/domUtils';

class PlotTextBox extends Overlay {
  constructor(options = {}) {
    const [
      id,
      element,
      offset,
      stopEvent,
      positioning,
      insertFirst,
      autoPan,
      autoPanAnimation,
      autoPanMargin,
      className
    ] = [
      options['id'],
      options['element'],
      options['offset'],
      options['stopEvent'],
      options['positioning'],
      options['insertFirst'],
      options['autoPan'],
      options['autoPanAnimation'],
      options['autoPanMargin'],
      options['className'] ? options['className'] : 'ol-plot-text-editor'
    ];
    super({
      id,
      element,
      stopEvent,
      insertFirst,
      autoPan,
      autoPanAnimation,
      autoPanMargin,
      className
    });
    this.setOffset(offset !== undefined ? offset : [0, 0]);
    this.setPositioning(
      positioning !== undefined ? positioning : 'center-center'
    );
    // this.stopEvent = false
    /**
     * 地图交互
     * @type {undefined}
     */
    this.mapDragPan = undefined;

    this.selectListener = undefined;

    this.rotateSpan = undefined;

    /**
     * is click
     * @type {boolean}
     * @private
     */
    this.isClick_ = false;

    /**
     * 是否处于拖拽状态
     * @type {boolean}
     * @private
     */
    this.dragging_ = false;
    /**
     * 是否处于旋转状态
     * @type {boolean}
     * @private
     */
    this.rotating_ = false;

    this.originStyle = {};

    /**
     * 当前气泡是否获取焦点
     * @type {boolean}
     * @private
     */
    this.isFocus_ = false;

    /**
     * 当前配置信息
     * @type {{}}
     * @private
     */
    this.options_ = options;

    /**
     * 当前气泡位置
     * @type {Array}
     * @private
     */
    this._position =
      options['position'] && options['position'].length > 0
        ? options['position']
        : [];

    /**
     * 防抖延时
     * @type {null}
     * @private
     */
    this.handleTimer_ = null;

    /**
     * 每次鼠标按下的位置
     * @type {Array}
     * @private
     */
    this.currentPixel_ = [];

    bindAll(
      [
        'handleFocus_',
        'handleBlur_',
        'handleClick_',
        'handleMouseOver_',
        'handleMouseOut_',
        'handleDoubleClick_',
        'handleDragStart_',
        'handleDragEnd_',
        'handleDragDrag_',
        'handleRotateStart_',
        'handleRotateEnd_',
        'handleRotateDrag_',
        'closeCurrentPlotText',
        'handleResizeMouseDown_',
        'handleResizeMouseMove_',
        'handleResizeMouseUp_',
        'resizeButtonMoveHandler_'
      ],
      this
    );

    /**
     * 创建text content
     */
    this.createTextContent(options);
  }

  /**
   * 创建文本框父容器
   * @param options
   */
  createTextContent(options) {
    const _className = options.className || 'ol-plot-text-editor';
    const content = document.createElement('div');
    content.spellcheck = false;
    content.className = _className;
    content.contentEditable = true;
    content.style.width = options['width'] + 'px';
    /* content.onpaste = function () {
            return false;
        };*/
    content.style.height = options['height'] + 'px';
    content.style.minHeight = options['minHeight'] + 'px';
    content.style.backgroundColor = '#0000';
    content.style.borderColor = '#0000';
    content.style.overflow = 'hidden';
    content.style.resize = 'none';
    content.setAttribute('id', options['id']);
    // content.setAttribute('autofocus', true)
    autosize(content);

    this.set('isPlotText', true);
    this.setElement(content);
    // this.createCloseButton(options)
    this.openEvent(content);
    // this.createResizeButton(options)
    this.setPosition(this._position);
    this.dispatchEvent('textBoxDrawEnd', {
      overlay: this,
      element: content,
      uuid: options['id']
    });
  }

  openEvent(el) {
    let content = el ? el : this.getElement();
    on(content, 'focus', this.handleFocus_);
    on(content, 'blur', this.handleBlur_);
    on(content, 'click', this.handleClick_);
    on(content, 'mouseover', this.handleMouseOver_);
    on(content, 'mouseout', this.handleMouseOut_);
    on(content, 'dblclick', this.handleDoubleClick_);
    on(content, 'mousedown', this.handleDragStart_);
    on(window, 'mouseup', this.handleDragEnd_);

    // on(this.rotateSpan, 'mousedown', this.handleRotateStart_)
    on(window, 'mouseup', this.handleRotateEnd_);
  }

  closeEvent() {
    let content = this.getElement();
    off(content, 'focus', this.handleFocus_);
    off(content, 'blur', this.handleBlur_);
    off(content, 'click', this.handleClick_);
    off(content, 'mouseover', this.handleMouseOver_);
    off(content, 'mouseout', this.handleMouseOut_);
    off(content, 'dblclick', this.handleDoubleClick_);
    off(content, 'mousedown', this.handleDragStart_);
    off(window, 'mouseup', this.handleDragEnd_);

    // off(this.rotateSpan, 'mousedown', this.handleRotateStart_)
    off(window, 'mouseup', this.handleRotateEnd_);
  }

  /**
   * 获取文本框
   * @returns {string}
   * @private
   */
  getTextAreaFromContent_() {
    let _node = '';
    const childrens_ = Array.prototype.slice.call(
      this.element && this.element.children,
      0
    );
    if (childrens_.length > 0) {
      childrens_.every(ele => {
        if (ele.nodeType === 1) {
          _node = ele;
          return false;
        } else {
          return true;
        }
      });
    }
    return _node;
  }

  /**
   * 创建关闭按钮
   * @param options
   */
  createCloseButton(options) {
    this.rotateSpan = document.createElement('span');
    this.rotateSpan.className = 'ol-plot-text-editor-rotate';
    this.rotateSpan.setAttribute('data-id', options['id']);
    // off(_closeSpan, 'click', this.closeCurrentPlotText)
    // on(_closeSpan, 'click', this.closeCurrentPlotText)

    this.element.appendChild(this.rotateSpan);
  }

  /**
   * 创建文本框大小调整按钮
   * @param options
   */
  createResizeButton(options) {
    const _resizeSpan = document.createElement('span');
    _resizeSpan.className = 'ol-plot-text-editor-resize';
    _resizeSpan.setAttribute('data-id', options['id']);
    off(_resizeSpan, 'mousedown', this.handleResizeMouseDown_);
    off(_resizeSpan, 'mousemove', this.handleResizeMouseMove_);
    on(_resizeSpan, 'mousedown', this.handleResizeMouseDown_);
    on(_resizeSpan, 'mousemove', this.handleResizeMouseMove_);
    this.element.appendChild(_resizeSpan);
  }

  /**
   * 调整大小
   * @param event
   * @private
   */
  resizeButtonMoveHandler_(event) {
    const pixel_ = event.pixel;
    const element_ = this.getTextAreaFromContent_();
    if (pixel_.length < 1 || this.currentPixel_.length < 1 || !element_) return;
    const _offset = [
      pixel_[0] - this.currentPixel_[0],
      pixel_[1] - this.currentPixel_[1]
    ];
    const _size = [element_.offsetWidth, element_.offsetHeight];
    const _width = _size[0] + _offset[0] * 2;
    const _height = _size[1] + _offset[1] * 2;
    setStyle(element_, 'width', _width + 'px');
    setStyle(element_, 'height', _height + 'px');
    this.currentPixel_ = pixel_;
    this.getMap().render();
  }

  /**
   * 处理移动事件
   * @param event
   * @private
   */
  handleResizeMouseMove_(event) {
    event.stopImmediatePropagation();
  }

  /**
   * 处理鼠标按下事件
   * @param event
   * @private
   */
  handleResizeMouseDown_(event) {
    if (!this.getMap()) return;
    this.currentPixel_ = [event.x, event.y];
    this.getMap().on('pointermove', this.resizeButtonMoveHandler_);
    on(this.getMap().getViewport(), 'mouseup', this.handleResizeMouseUp_);
  }

  /**
   * 处理鼠标抬起事件，移除所有事件监听
   * @param event
   * @private
   */
  handleResizeMouseUp_(event) {
    if (!this.getMap()) return;
    this.getMap().un('pointermove', this.resizeButtonMoveHandler_);
    off(this.getMap().getViewport(), 'mouseup', this.handleResizeMouseUp_);
    this.currentPixel_ = [];
  }

  /**
   * 处理关闭事件
   * @param event
   */
  closeCurrentPlotText() {
    if (!this.getMap()) return;
    if (this.listenKey) {
      unByKey(this.listenKey);
    }
    const _overlay = this.getMap().getOverlayById(this.id);
    if (_overlay) {
      this.getMap().removeOverlay(_overlay);
    }
  }

  /**
   * 处理获取焦点事件
   * @private
   */
  handleFocus_() {
    this.isFocus_ = true;
    if (this.getMap()) {
      this.getMap().set('activeTextArea', this);
      this.getMap().dispatchEvent('activeTextArea');
    }
  }

  /**
   * 处理失去焦点事件
   * @private
   */
  handleBlur_() {
    setStyle(this.getTextAreaFromContent_(), 'outline', 'none');
    this.isFocus_ = false;
    if (this.getMap()) {
      this.getMap().set('activeTextArea', null);
      this.getMap().set('disActiveTextArea', this);
      this.getMap().dispatchEvent('disActiveTextArea');
    }
  }

  /**
   * 处理拖拽开始
   * @private
   */
  handleDragStart_(event) {
    setStyle(this.getTextAreaFromContent_(), 'outline', 'red solid 2px');

    if (!this.getMap()) return;
    if (!this.dragging_ && this.isMoveModel()) {
      this.handleTimer_ = window.setTimeout(() => {
        window.clearTimeout(this.handleTimer_);
        this.handleTimer_ = null;
        this.dragging_ = true;
        this.disableMapDragPan();
        this.preCursor_ = this.element.style.cursor;
        on(this.getMap().getViewport(), 'mousemove', this.handleDragDrag_);
        on(this.element, 'mouseup', this.handleDragEnd_);
      }, 300);
    }
  }

  /**
   * 处理拖拽
   * @param event
   * @private
   */
  handleDragDrag_(event) {
    if (this.dragging_) {
      this.element.style.cursor = 'move';
      let offset = this._offset(this.getMap().getViewport());
      let offsetX = offset.left;
      let offsetY = offset.top;
      this._position = this.getMap().getCoordinateFromPixel([
        event.clientX - offsetX,
        event.clientY - offsetY
      ]);
      this.setPosition(this._position);
    }
  }

  /**
   * 处理拖拽
   * @private
   */
  handleDragEnd_(event) {
    this.isClick_ = false;
    window.clearTimeout(this.handleTimer_);
    this.handleTimer_ = null;
    if (this.dragging_ && this.isFocus_) {
      this.dragging_ = false;
      this.enableMapDragPan();
      this.element.style.cursor = this.preCursor_;
      off(this.getMap().getViewport(), 'mousemove', this.handleDragDrag_);
      off(this.element, 'mouseup', this.handleDragEnd_);
    }
  }

  /**
   * 处理旋转开始
   * @private
   */
  handleRotateStart_(event) {
    if (!this.getMap()) return;
    if (!this.rotating_ && this.isMoveModel()) {
      this.handleTimer_ = window.setTimeout(() => {
        window.clearTimeout(this.handleTimer_);
        this.handleTimer_ = null;
        this.rotating_ = true;
        this.disableMapDragPan();
        const element = this.rotateSpan;
        let content = document.getElementsByClassName('gridbackground')[0]
          ? document.getElementsByClassName('gridbackground')[0]
          : document.getElementsByClassName('kszt-map')[0];
        let offsetX = content ? content.offsetLeft + 20 : 20;
        let offsetY = content ? content.offsetTop + 20 : 20;

        element.dataset.centerX =
          offsetX + this.element.offsetLeft + this.element.clientWidth / 2;
        element.dataset.centerY =
          offsetY + this.element.offsetTop + this.element.clientHeight / 2;
        // element.dataset.centerX = event.clientX
        // element.dataset.centerY = event.clientY
        element.dataset.angle = this.getDragAngle(event, true);

        // this.preCursor_ = this.element.style.cursor
        on(this.getMap().getViewport(), 'mousemove', this.handleRotateDrag_);
        on(this.element, 'mouseup', this.handleRotateEnd_);
      }, 300);
    }
  }

  /**
   * 处理拖拽
   * @param event
   * @private
   */
  handleRotateDrag_(event) {
    if (this.rotating_) {
      this.element.style.cursor = 'move';
      var angle = this.getDragAngle(event);
      this.element.style.transform = 'rotate(' + angle + 'rad)';
      this.originStyle.rotation = angle;
    }
  }

  /**
   * 处理拖拽
   * @private
   */
  handleRotateEnd_(event) {
    window.clearTimeout(this.handleTimer_);
    this.handleTimer_ = null;
    if (this.rotating_) {
      this.rotating_ = false;
      this.enableMapDragPan();
      // this.element.style.cursor = this.preCursor_
      off(this.getMap().getViewport(), 'mousemove', this.handleRotateDrag_);
      off(this.element, 'mouseup', this.handleRotateEnd_);
    }
  }

  getDragAngle(event, isStart) {
    var element = this.rotateSpan;
    var startAngle = !isStart ? parseFloat(element.dataset.angle) || 0 : 0;
    var center = {
      x: parseFloat(element.dataset.centerX) || 0,
      y: parseFloat(element.dataset.centerY) || 0
    };
    var angle = Math.atan2(center.y - event.clientY, center.x - event.clientX);
    return angle - startAngle;
  }

  /**
   * 处理点击事件
   * @param event
   * @private
   */
  handleClick_(event) {
    if (this.selectListener) {
      this.selectListener(this);
    }
    // event.target.select()
    if (event.target === this.element) {
      this.isClick_ = true;
    } else {
      this.isClick_ = false;
    }
  }

  handleMouseOver_(event) {
    const _element = this.getTextAreaFromContent_();
    _element.style.cursor = 'grab';
    // console.log('handleMouseOver_', event)
  }

  handleMouseOut_(event) {
    const _element = this.getTextAreaFromContent_();
    _element.style.cursor = 'default';
    // console.log('handleMouseOut_', event)
  }

  handleDoubleClick_(event) {
    this.getTextAreaFromContent_().focus();
    event.preventDefault();
  }

  _offset(node) {
    var offest = {
      top: 0,
      left: 0
    };
    // 当前为IE11以下, 直接返回{top: 0, left: 0}
    if (!node.getClientRects().length) {
      return offest;
    }
    // 当前DOM节点的 display === 'node' 时, 直接返回{top: 0, left: 0}
    if (window.getComputedStyle(node)['display'] === 'none') {
      return offest;
    }
    // Element.getBoundingClientRect()方法返回元素的大小及其相对于视口的位置。
    // 返回值包含了一组用于描述边框的只读属性——left、top、right和bottom，单位为像素。除了 width 和 height 外的属性都是相对于视口的左上角位置而言的。
    // 返回如{top: 8, right: 1432, bottom: 548, left: 8, width: 1424…}
    offest = node.getBoundingClientRect();
    var docElement = node.ownerDocument.documentElement;
    return {
      top: offest.top + window.pageYOffset - docElement.clientTop,
      left: offest.left + window.pageXOffset - docElement.clientLeft
    };
  }

  setText(text) {
    this.getTextAreaFromContent_().innerHTML = text;
  }

  getText() {
    return this.getTextAreaFromContent_().innerHTML;
  }

  setSelectListener(selectListener) {
    this.selectListener = selectListener;
  }

  /**
   * 是否处于选择模式
   * @returns {boolean}
   */
  isMoveModel() {
    var sel = window.getSelection && window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      return range.collapsed;
    }
  }

  setOriginStyle(originStyle) {
    this.originStyle = JSON.parse(JSON.stringify(originStyle));
  }

  getOriginStyle() {
    return this.originStyle;
  }

  /**
   * 设置样式
   * @param style
   */
  setStyle(style = {}) {
    const _element = this.getTextAreaFromContent_();
    if (_element) {
      for (let key in style) {
        if (style[key]) {
          setStyle(_element, key, style[key]);
        }
      }
      autosize.update(_element);
    }
  }

  /**
   * 获取当前样式
   * @returns {CSSStyleDeclaration}
   */
  getStyle() {
    const _style = {};
    const _element = this.getTextAreaFromContent_();
    if (_element) {
      for (let key in DEF_TEXT_STYEL) {
        _style[key] = getStyle(_element, key);
      }
    }
    return _style;
  }

  /**
   * set value
   * @param value
   */
  setValue(value) {
    const _element = this.getTextAreaFromContent_();
    if (_element) {
      _element.innerHTML = value;
      if (value) {
        autosize.update(_element);
      }
      this.getMap().render();
    }
  }

  /**
   * get value
   * @returns {*}
   */
  getValue() {
    const _element = this.getTextAreaFromContent_();
    if (_element) {
      return _element.innerHTML;
    } else {
      return '';
    }
  }

  /**
   * 获取宽度
   * @returns {number}
   */
  getWidth() {
    const element_ = this.getTextAreaFromContent_();
    if (element_ && element_.offsetWidth) {
      return element_.offsetWidth;
    } else {
      return 0;
    }
  }

  /**
   * 获取高度
   * @returns {number}
   */
  getHeight() {
    const element_ = this.getTextAreaFromContent_();
    if (element_ && element_.offsetHeight) {
      return element_.offsetHeight;
    } else {
      return 0;
    }
  }

  updateSize() {
    autosize.update(this.getTextAreaFromContent_());
  }

  /**
   * 激活地图的拖拽平移
   */
  enableMapDragPan() {
    const _map = this.getMap();
    if (!_map) return;
    if (this.mapDragPan && this.mapDragPan instanceof $DragPan) {
      _map.addInteraction(this.mapDragPan);
      delete this.mapDragPan;
    }
  }

  /**
   * 禁止地图的拖拽平移
   */
  disableMapDragPan() {
    const _map = this.getMap();
    if (!_map) return;
    let interactions = _map.getInteractions().getArray();
    interactions.every(item => {
      if (item instanceof $DragPan) {
        this.mapDragPan = item;
        _map.removeInteraction(item);
        return false;
      } else {
        return true;
      }
    });
  }

  /**
   * set map
   * @param map
   */
  setMap(map) {
    super.setMap(map);
    if (map && map instanceof Map) {
      this.setStyle(merge(DEF_TEXT_STYEL, this.options_['style']));
      this.setValue(this.options_['value']);
      this.listenKey = this.getMap().on('click', () => {
        this.getTextAreaFromContent_().blur();
        setStyle(this.getTextAreaFromContent_(), 'outline', 'none');
      });
    }
  }
}

export default PlotTextBox;
