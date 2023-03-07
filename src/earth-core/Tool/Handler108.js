/**
 * @Author han
 * @Date 2021/1/8 15:09
 */

import * as Cesium from 'cesium_shinegis_earth';

/* const POT = {
  getObjType: (obj) => {
    // 判断对象的类型，包括四种：[entity,primitive,tile,vctor]
    if (obj && Cesium.defined(obj.primitive)) return 'primitive';
    else if (Cesium.defined(obj)) {
      if (Cesium.defined(obj.id) && obj.id instanceof Cesium.Entity)
        return 'entity';
      else if (Cesium.defined(obj.tileset) && Cesium.defined(obj.getProperty))
        return 'tile';
    }
  },
  getClass: (obj) => {
    // 获取构造类名
    if (obj && obj.constructor && obj.constructor.toString()) {
      if (obj.constructor.name) return obj.constructor.name;
      let str = obj.constructor.toString(),
        arr = '';
      if (str.charAt(0) === '[') arr = str.match(/\[\w+\s*(\w+)]/);
      else arr = str.match(/function\s*(\w+)/);
      if (arr && arr.length === 2) return arr[1];
    }
    return undefined;
  }
}; */
let viewer;

/**
 * 取消监听 //todo
 */
export function quitQuery() {
  /*  console.log(viewer);
  console.log(Cesium.defined(viewer)); */
}

/**
 * 事件处理
 */
export function handle() {
  // todo 鼠标左键
  /*  const eventType = ['rightClick', 'rightDown'];
  const objType = ['entity', 'primitive', 'tile', 'vector']; */
}

/**
 * 初始化查询，创建监听事件
 */
export function initQuery(_viewer) {
  viewer = _viewer;
  let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  //单击事件  剔除内部事件，由外部控制，陈利军
  handler.setInputAction(function (event) {
    let pickedObject = viewer.scene.pick(event.position);
    // console.log(pickedObject);
    if (pickedObject && pickedObject.content) {
      //   console.log(pickedObject.content);
      //   console.log(POT.getClass(pickedObject.content));
    }
  }, Cesium.defaultValue(
    this.popupEventType,
    Cesium.ScreenSpaceEventType.MIDDLE_CLICK
  ));
}
