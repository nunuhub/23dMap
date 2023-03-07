/*
 * @Author: yangw
 * @Date: 2022-01-13 09:11:43
 * @LastEditTime: 2022-02-11 13:48:55
 * @LastEditors: Please set LastEditors
 * @Description: 用于绘制、量测、空间分析三个组件工具条的拖拽。
 * @FilePath: \shinegis-client-23d-2.1\src\util\dialogDrag.js
 */
// 使用方法，塞到directives里；同时需要拖拽哪个整体，则v-dialogDrag放在哪个div，其中需要有一个类名为fold的div，用于拖拽启用区。
const dialogDrag = {
  inserted: function (el) {
    const targetDiv = el.querySelector('.fold'); // 在类名为“fold”的div上改变游标并可拖拽。 但，实际拖拽的整体是directives插入处的div。
    const dragDom = el;
    targetDiv.style.cursor = 'move';
    targetDiv.onmousedown = (e) => {
      e.stopPropagation();
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - dragDom.offsetLeft;
      const disY = e.clientY - dragDom.offsetTop;
      // let selectLeft, selectTop, boxLeft, boxTop
      document.onmousemove = (e) => {
        // 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
        let left = e.clientX - disX;
        let top = e.clientY - disY;
        // 移动当前元素
        el.style.left = left + 'px';
        el.style.top = top + 'px';
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    };
  }
};

export default dialogDrag;
