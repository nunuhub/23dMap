import * as Cesium from 'cesium_shinegis_earth';
import { message } from '../Tool/ToolTip4';

//拖拽点控制类
const PixelSize = 12; //编辑点的像素大小

//拖拽点分类
const PointType = {
  Control: 1, //位置控制
  AddMidPoint: 2, //辅助增加新点
  MoveHeight: 3, //上下移动高度
  EditAttr: 4, //辅助修改属性（如半径）
  EditRotation: 5, //旋转角度修改
  MoveAbout: 6, // 左右移动
  MoveAround: 7, // 前后移动
  MoveLevel: 8

  //拖拽点分类
};
const PointColor = {
  Control: new Cesium.Color.fromCssColorString('#1c197d'), //位置控制拖拽点
  MoveHeight: new Cesium.Color.fromCssColorString('#9500eb'), //上下移动高度的拖拽点
  EditAttr: new Cesium.Color.fromCssColorString('#f73163'), //辅助修改属性（如半径）的拖拽点
  AddMidPoint: new Cesium.Color.fromCssColorString('#04c2c9').withAlpha(0.3) //增加新点，辅助拖拽点
};

const getAttrForType = (type, attr) => {
  switch (type) {
    case PointType.AddMidPoint:
      attr.color = PointColor.AddMidPoint;
      attr.outlineColor = new Cesium.Color.fromCssColorString(
        '#ffffff'
      ).withAlpha(0.4);
      break;
    case PointType.MoveHeight:
      attr.color = PointColor.MoveHeight;
      break;
    case PointType.EditAttr:
      attr.color = PointColor.EditAttr;
      break;
    case PointType.Control:
    default:
      attr.color = PointColor.Control;
      break;
  }
  return attr;
};

/** 创建Dragger拖动点的公共方法 */
const createDragger = (dataSource, options) => {
  let dragger;
  if (options.dragger) {
    dragger = options.dragger;
  } else {
    let attr = {
      scale: 1,
      pixelSize: PixelSize,
      outlineColor: new Cesium.Color.fromCssColorString('#ffffff').withAlpha(
        0.5
      ),
      outlineWidth: 2,
      scaleByDistance: new Cesium.NearFarScalar(1000, 1, 1000000, 0.5),
      disableDepthTestDistance: Number.POSITIVE_INFINITY //一直显示，不被地形等遮挡
    };
    attr = getAttrForType(options.type, attr);

    dragger = dataSource.entities.add({
      position: Cesium.defaultValue(options.position, Cesium.Cartesian3.ZERO),
      point: attr,
      draw_tooltip: options.tooltip || message.dragger.def
    });
  }

  dragger._isDragger = true;
  dragger._noMousePosition = true; //不被getCurrentMousePosition拾取
  dragger._pointType = options.type || PointType.Control; //默认是位置控制拖拽点

  dragger.onDragStart = Cesium.defaultValue(options.onDragStart, null);
  dragger.onDrag = Cesium.defaultValue(options.onDrag, null);
  dragger.onDragEnd = Cesium.defaultValue(options.onDragEnd, null);
  dragger.onRightDown = Cesium.defaultValue(options.onRightDown, null);
  dragger.onRightUp = Cesium.defaultValue(options.onRightUp, null);

  return dragger;
};

export { PixelSize, PointType, PointColor, getAttrForType, createDragger };
