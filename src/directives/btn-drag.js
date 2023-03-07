const cardDrag = {
  bind(el) {
    bindContent(el, false);
  }
};

function bindContent(el, isSideBar) {
  if (!el) {
    return;
  }

  let startTime = '';
  let lastTime = '';
  el.onmousedown = (e) => {
    // const dragDom = dialogHeaderEl.parentNode.parentNode;
    startTime = new Date().getTime();
    let domOrigin = getPosition(el);
    // 鼠标按下，计算当前元素距离可视区的距离
    const disX = e.clientX;
    const disY = e.clientY;

    const screenWidth = domOrigin.parentW; // body当前宽度
    const screenHeight =
      domOrigin.parentH === 0 ? Number.MAX_VALUE : domOrigin.parentH; // 可见区域高度(应为body高度，可某些环境下无法获取,但是绝对不能为0,获取不到时不进行下停靠)

    const dragDomWidth = el.offsetWidth; // 对话框宽度
    let dragDomHeight = el.offsetHeight; // 对话框高度
    if (!dragDomHeight) {
      dragDomHeight = el.lastElementChild.offsetHeight;
    }

    const minDragBtnLeft = 0;
    const maxDragBtnLeft = screenWidth - el.offsetWidth;

    const minDragBtnTop = 0;
    const maxDragBtnTop = screenHeight - el.offsetHeight;

    // 获取到的值带px 正则匹配替换
    /* let styL = sty(dragDom, 'left');
    let styT = sty(dragDom, 'top');

    // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
    if (styL.includes('%')) {
        styL = +document.body.clientWidth * (+styL.replace(/\%/g, '') / 100);
        styT = +document.body.clientHeight * (+styT.replace(/\%/g, '') / 100);
    } else {
        styL = +styL.replace(/\px/g, '');
        styT = +styT.replace(/\px/g, '');
    }*/

    let styL = domOrigin.x;
    let styT = domOrigin.y;

    document.onmousemove = function (e) {
      if (el.getAttribute('isFix') === 'true') {
        return;
      }
      if (!el.classList.contains('dragEnable')) {
        return;
      }
      // const dragDom = dialogHeaderEl.parentNode.parentNode;
      const dragDom = el;
      // console.log('dragDom', dragDom)
      // 通过事件委托，计算移动的距离
      let left = e.clientX - disX;
      let top = e.clientY - disY;

      let trueLeft = left + styL;
      let trueTop = top + styT;
      if (!isSideBar) {
        if (trueLeft < minDragBtnLeft) {
          return;
          // 右停靠
        } else if (trueLeft > maxDragBtnLeft) {
          return;
        }
        if (trueTop < minDragBtnTop) {
          return;
        } else if (trueTop > maxDragBtnTop) {
          return;
        }
      }
      let horizontalPosition =
        trueLeft > screenWidth / 2
          ? `right:${screenWidth - dragDomWidth - trueLeft}px;left:unset`
          : `left:${trueLeft}px;right:unset`;
      let verticalPosition =
        trueTop > screenHeight / 2
          ? `bottom:${screenHeight - dragDomHeight - trueTop}px;top:unset`
          : `top:${trueTop}px;bottom:unset`;
      // 移动当前元素
      dragDom.style.cssText += `position:absolute;${horizontalPosition};${verticalPosition}`;
    };

    document.onmouseup = function () {
      lastTime = new Date().getTime();
      if (lastTime - startTime > 200) {
        el.setAttribute('isClick', false);
      } else {
        el.setAttribute('isClick', true);
      }
      // console.log(dialogHeaderEl.getAttribute('isClick'))
      document.onmousemove = null;
      document.onmouseup = null;
      window.getSelection
        ? window.getSelection().removeAllRanges()
        : document.selection.empty();
      return false;
    };
  };
}

// 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
/* const sty = (function() {
  if (window.document.currentStyle) {
    return (dom, attr) => dom.currentStyle[attr];
  } else {
    return (dom, attr) => getComputedStyle(dom, false)[attr];
  }
})();*/

const getPosition = function (el) {
  let _x = 0;
  let _y = 0;
  do {
    _x += el.offsetLeft;
    _y += el.offsetTop;
    el = el.offsetParent;
  } while (
    el !== null &&
    window.getComputedStyle(el).position !== 'relative' &&
    window.getComputedStyle(el).position !== 'absolute' &&
    window.getComputedStyle(el).position !== 'fixed'
  ); // transform!=none停止 transform影响fixed  && window.getComputedStyle(el).transform === 'none'
  return {
    x: _x,
    y: _y,
    parentW: el ? el.offsetWidth : document.body.clientWidth,
    parentH: el ? el.offsetHeight : document.body.clientHeight
  };
};

export default cardDrag;
