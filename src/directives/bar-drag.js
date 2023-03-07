const drag = {
  bind(el) {
    const dragHeader = el.querySelector('.move_header');
    dragHeader.style.cssText += ';cursor:move;';

    dragHeader.onmousedown = (e) => {
      const dragDom = el;
      let domOrigin = getPosition(dragDom);
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX;
      const disY = e.clientY;

      const screenWidth = domOrigin.parentW;
      const screenHeight =
        domOrigin.parentH === 0 ? Number.MAX_VALUE : domOrigin.parentH;

      const dragDomWidth = el.offsetWidth;
      let dragDomheight = el.offsetHeight;
      if (!dragDomheight) {
        dragDomheight = el.lastElementChild.offsetHeight;
      }
      const minDragDomLeft = 0;
      const maxDragDomLeft = screenWidth - dragDomWidth;

      const minDragDomTop = 0;
      const maxDragDomTop = screenHeight - dragHeader.offsetHeight;

      let styL = domOrigin.x;
      let styT = domOrigin.y;

      document.onmousemove = function (e) {
        if (dragHeader.getAttribute('dragEnable') === 'false') {
          return;
        }
        const dragDom = el;
        // 通过事件委托，计算移动的距离
        let left = e.clientX - disX;
        let top = e.clientY - disY;

        let trueLeft = left + styL;
        let trueTop = top + styT;

        // 边界处理
        if (trueLeft < minDragDomLeft) {
          return;
        } else if (trueLeft > maxDragDomLeft) {
          return;
        }
        if (trueTop < minDragDomTop) {
          return;
        } else if (trueTop > maxDragDomTop) {
          return;
        }

        const horizontalPosition =
          trueLeft > screenWidth / 2
            ? `right:${screenWidth - dragDomWidth - trueLeft}px;left:unset`
            : `left:${trueLeft}px;right:unset`;
        const verticalPosition =
          trueTop > screenHeight / 2
            ? `bottom:${screenHeight - dragDomheight - trueTop}px;top:unset`
            : `top:${trueTop}px;bottom:unset`;
        // 移动当前元素
        dragDom.style.cssText += `position:absolute;${horizontalPosition};${verticalPosition}`;
      };

      document.onmouseup = function () {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };

    const getPosition = function (el) {
      let _x = 0;
      let _y = 0;
      do {
        _x += el.offsetLeft;
        _y += el.offsetTop;
        el = el.offsetParent;
      } while (
        el !== null &&
        window.getComputedStyle(el).position !== 'relative'
      ); // transform!=none停止 transform影响fixed  && window.getComputedStyle(el).transform === 'none'
      return {
        x: _x,
        y: _y,
        parentW: el ? el.offsetWidth : document.body.clientWidth,
        parentH: el ? el.offsetHeight : document.body.clientHeight
      };
    };
  }
};
export default drag;
