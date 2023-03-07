/*
 * @Author: liujh
 * @Date: 2020/8/21 17:21
 * @Description:
 */
/* 7 */
/***/

const DrawStart = 'draw-start'; //开始绘制
const DrawAddPoint = 'draw-add-point'; //绘制过程中增加了点
const DrawRemovePoint = 'draw-remove-lastpoint'; //绘制过程中删除了last点
const DrawMouseMove = 'draw-mouse-move'; //绘制过程中鼠标移动了点
const DrawCreated = 'draw-created'; //创建完成

const EditStart = 'edit-start'; //开始编辑
const EditMovePoint = 'edit-move-point'; //编辑修改了点
const EditRemovePoint = 'edit-remove-point'; //编辑删除了点
const EditStop = 'edit-stop'; //停止编辑

export { DrawStart, DrawAddPoint, DrawRemovePoint, DrawMouseMove, DrawCreated };
export { EditStart, EditMovePoint, EditRemovePoint, EditStop };
