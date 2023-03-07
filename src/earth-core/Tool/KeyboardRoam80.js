/*
 * @Author: liujh
 * @Date: 2020/8/24 9:02
 * @Description:
 */
/* 80 */
/***/

import * as Cesium from 'cesium_shinegis_earth';
import * as Point from './Point2';

export let speedRatio = 150; //平移步长，值越大步长越小。
export let dirStep = 25; //相机原地旋转步长，值越大步长越小。
export let rotateStep = 1.0; //相机围绕目标点旋转速率，0.3 - 2.0
export let minPitch = 0.1; //最小仰角  0 - 1
export let maxPitch = 0.95; //最大仰角  0 - 1

let KeyboardType = {
  ENLARGE: 0,
  NARROW: 1,
  LEFT_ROTATE: 2,
  RIGHT_ROTATE: 3,
  TOP_ROTATE: 4,
  BOTTOM_ROTATE: 5

  //快捷键，键盘漫游
};

class KeyboardRoam {
  constructor(viewer /* options */) {
    // _classCallCheck(this, KeyboardRoam)

    this.viewer = viewer;

    this.flags = {
      moveForward: false,
      moveBackward: false,
      moveUp: false,
      moveDown: false,
      moveLeft: false,
      moveRight: false
    };

    let canvas = viewer.scene.canvas;
    canvas.setAttribute('tabindex', '0'); // needed to put focus on the canvas
    canvas.onclick = function () {
      canvas.focus();
    };

    let that = this;
    document.addEventListener(
      'keydown',
      function (e) {
        if (!that._enable) return;

        let flagName = that.getFlagForKeyCode(e.keyCode);
        if (typeof flagName !== 'undefined') {
          that.flags[flagName] = true;
        }
      },
      false
    );
    document.addEventListener(
      'keyup',
      function (e) {
        if (!that._enable) return;

        let flagName = that.getFlagForKeyCode(e.keyCode);
        if (typeof flagName !== 'undefined') {
          that.flags[flagName] = false;
        }
      },
      false
    );

    //绑定的事件
    this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    this.handler.setInputAction(function (delta) {
      //在漫游中滚轮滚动可以加速减速
      if (!that._enable) return;

      if (delta > 0) {
        exports.speedRatio = speedRatio = speedRatio * 0.9;
        exports.rotateStep = rotateStep = rotateStep * 1.1;
        exports.dirStep = dirStep = dirStep * 0.9;
      } else {
        exports.speedRatio = speedRatio = speedRatio * 1.1;
        exports.rotateStep = rotateStep = rotateStep * 0.9;
        exports.dirStep = dirStep = dirStep * 1.1;
      }
    }, Cesium.ScreenSpaceEventType.WHEEL);
  }

  bind(opts) {
    if (this._enable) return;
    this._enable = true;

    if (Cesium.defined(opts)) {
      //支持绑定方法内重新赋值参数
      exports.speedRatio = speedRatio = opts.speedRatio || speedRatio;
      exports.dirStep = dirStep = opts.dirStep || dirStep;
      exports.rotateStep = rotateStep = opts.rotateStep || rotateStep;
      exports.minPitch = minPitch = opts.minPitch || minPitch;
      exports.maxPitch = maxPitch = opts.maxPitch || maxPitch;
    }

    this.viewer.clock.onTick.addEventListener(this.cameraFunc, this);
  }

  unbind() {
    if (!this._enable) return;
    this._enable = false;

    this.viewer.clock.onTick.removeEventListener(this.cameraFunc, this);
  }

  destroy() {
    this.unbind();
    this.handler.destroy();
  }

  //相关事件回调方法
  getFlagForKeyCode(keyCode) {
    switch (keyCode) {
      //平移
      case 'W'.charCodeAt(0):
        //向前平移镜头，不改变相机朝向
        return 'moveForward';
      case 'S'.charCodeAt(0):
        //向后平移镜头，不改变相机朝向
        return 'moveBackward';
      case 'D'.charCodeAt(0):
        //向右平移镜头，不改变相机朝向
        return 'moveRight';
      case 'A'.charCodeAt(0):
        //向左平移镜头，不改变相机朝向
        return 'moveLeft';
      case 'Q'.charCodeAt(0):
        //向上平移镜头，不改变相机朝向
        return 'moveUp';
      case 'E'.charCodeAt(0):
        //向下平移镜头，不改变相机朝向
        return 'moveDown';

      //相对于相机本身
      case 38:
        //方向键上键
        this.rotateCamera(KeyboardType.TOP_ROTATE); //相机原地上旋转
        break;
      case 37:
        //方向键左键
        this.rotateCamera(KeyboardType.LEFT_ROTATE); //相机原地左旋转
        break;
      case 39:
        //方向键右键
        this.rotateCamera(KeyboardType.RIGHT_ROTATE); //相机原地右旋转
        break;
      case 40:
        //方向键下键
        this.rotateCamera(KeyboardType.BOTTOM_ROTATE); //相机原地下旋转
        break;

      //相对于屏幕中心点
      case 'I'.charCodeAt(0):
      case 104:
        //数字键盘8
        this.moveCamera(KeyboardType.ENLARGE); //向屏幕中心靠近
        break;
      case 'K'.charCodeAt(0):
      case 101:
        //数字键盘5
        this.moveCamera(KeyboardType.NARROW); //向屏幕中心远离
        break;
      case 'J'.charCodeAt(0):
      case 100:
        //数字键盘4
        this.moveCamera(KeyboardType.LEFT_ROTATE); //围绕屏幕中心左旋转
        break;
      case 'L'.charCodeAt(0):
      case 102:
        //数字键盘6
        this.moveCamera(KeyboardType.RIGHT_ROTATE); //围绕屏幕中心右旋转
        break;
      case 'U'.charCodeAt(0):
      case 103:
        //数字键盘7
        this.moveCamera(KeyboardType.TOP_ROTATE); //围绕屏幕中心上旋转
        break;
      case 'O'.charCodeAt(0):
      case 105:
        //数字键盘9
        this.moveCamera(KeyboardType.BOTTOM_ROTATE); //围绕屏幕中心下旋转
        break;

      default:
        break;
    }
    return undefined;
  }

  //平移
  moveForward(distance) {
    //和模型的相机移动不太一样  不是沿着相机目标方向，而是默认向上方向 和 向右 方向的插值方向
    let camera = this.viewer.camera;
    let direction = camera.direction;
    //获得此位置默认的向上方向
    let up = Cesium.Cartesian3.normalize(
      camera.position,
      new Cesium.Cartesian3()
    );

    // right = direction * up
    let right = Cesium.Cartesian3.cross(direction, up, new Cesium.Cartesian3());

    direction = Cesium.Cartesian3.cross(up, right, new Cesium.Cartesian3());

    direction = Cesium.Cartesian3.normalize(direction, direction);
    direction = Cesium.Cartesian3.multiplyByScalar(
      direction,
      distance,
      direction
    );

    camera.position = Cesium.Cartesian3.add(
      camera.position,
      direction,
      camera.position
    );
  }

  cameraFunc(/* clock */) {
    let camera = this.viewer.camera;

    // Change movement speed based on the distance of the camera to the surface of the ellipsoid.
    let cameraHeight =
      this.viewer.scene.globe.ellipsoid.cartesianToCartographic(
        camera.position
      ).height;
    let moveRate = cameraHeight / speedRatio;

    if (this.flags.moveForward) {
      this.moveForward(moveRate);
    }
    if (this.flags.moveBackward) {
      this.moveForward(-moveRate);
    }
    if (this.flags.moveUp) {
      camera.moveUp(moveRate);
    }
    if (this.flags.moveDown) {
      camera.moveDown(moveRate);
    }
    if (this.flags.moveLeft) {
      camera.moveLeft(moveRate);
    }
    if (this.flags.moveRight) {
      camera.moveRight(moveRate);
    }
  }

  //相对于屏幕或相机
  resetCameraPos(newCamera) {
    if (!newCamera) return;
    this.viewer.scene.camera.position = newCamera.position;
    this.viewer.scene.camera.direction = newCamera.direction;
    this.viewer.scene.camera.right = newCamera.right;
    this.viewer.scene.camera.up = newCamera.up;
  }

  limitAngle(up, position, type) {
    let dotNum = Cesium.Cartesian3.dot(
      up,
      Cesium.Cartesian3.normalize(position, new Cesium.Cartesian3())
    );
    if (type === 'up' && dotNum < minPitch) return false;
    return !(type === 'down' && dotNum > maxPitch);
  }

  computedNewPos(camera, dir, rotate) {
    // let step = rotateStep
    let oldpos = camera.position;
    let winCenter = (0, Point.getCenter)(this.viewer);
    if (!winCenter) return;
    let center = Cesium.Cartesian3.fromDegrees(
      winCenter.x,
      winCenter.y,
      winCenter.z
    );
    if (!center) return;
    let oldDis = Cesium.Cartesian3.distance(center, oldpos);
    let step = oldDis / 100;
    step = rotate ? step * rotateStep : step;
    let newCamera = {};
    let ray = new Cesium.Ray(oldpos, dir);
    newCamera.position = Cesium.Ray.getPoint(ray, step);

    // let cheight = Cesium.Cartographic.fromCartesian(newCamera.position).height
    // if (cheight < 500)   return

    newCamera.direction = camera.direction;
    newCamera.right = camera.right;
    newCamera.up = camera.up;
    if (rotate) {
      let newDir = Cesium.Cartesian3.normalize(
        Cesium.Cartesian3.subtract(
          newCamera.position,
          center,
          new Cesium.Cartesian3()
        ),
        new Cesium.Cartesian3()
      );
      ray = new Cesium.Ray(center, newDir);
      newCamera.position = Cesium.Ray.getPoint(ray, oldDis);
      newCamera.direction = Cesium.Cartesian3.negate(
        newDir,
        new Cesium.Cartesian3()
      );
      // newCamera.up = camera.up
      newCamera.up = Cesium.Cartesian3.normalize(
        newCamera.position,
        new Cesium.Cartesian3()
      );
      newCamera.right = Cesium.Cartesian3.cross(
        newCamera.direction,
        newCamera.up,
        new Cesium.Cartesian3()
      );
    }
    return newCamera;
  }

  moveCamera(type) {
    let camera = this.viewer.scene.camera;
    let newCamera;
    switch (type) {
      case KeyboardType.ENLARGE:
        newCamera = this.computedNewPos(camera, camera.direction);
        break;
      case KeyboardType.NARROW:
        newCamera = this.computedNewPos(
          camera,
          Cesium.Cartesian3.negate(camera.direction, new Cesium.Cartesian3())
        );
        break;
      case KeyboardType.LEFT_ROTATE:
        newCamera = this.computedNewPos(
          camera,
          Cesium.Cartesian3.negate(camera.right, new Cesium.Cartesian3()),
          true
        );
        break;
      case KeyboardType.RIGHT_ROTATE:
        newCamera = this.computedNewPos(camera, camera.right, true);
        break;
      case KeyboardType.TOP_ROTATE: {
        let able = this.limitAngle(
          Cesium.clone(camera.up),
          Cesium.clone(camera.position),
          'up'
        );
        if (!able) return;
        newCamera = this.computedNewPos(camera, Cesium.clone(camera.up), true);
        break;
      }
      case KeyboardType.BOTTOM_ROTATE: {
        let able = this.limitAngle(
          Cesium.clone(camera.up),
          Cesium.clone(camera.position),
          'down'
        );
        if (!able) return;
        newCamera = this.computedNewPos(
          camera,
          Cesium.Cartesian3.negate(camera.up, new Cesium.Cartesian3()),
          true
        );
        break;
      }
    }
    if (!newCamera) return;
    this.resetCameraPos(newCamera);
  }

  rotateCamera(type) {
    let winPos = [0, 0];
    let width = this.viewer.scene.canvas.clientWidth;
    let height = this.viewer.scene.canvas.clientHeight;
    let step = (width + height) / dirStep;
    switch (type) {
      case KeyboardType.LEFT_ROTATE:
        winPos = [(-step * width) / height, 0];
        break;
      case KeyboardType.RIGHT_ROTATE:
        winPos = [(step * width) / height, 0];
        break;
      case KeyboardType.TOP_ROTATE:
        winPos = [0, step];
        break;
      case KeyboardType.BOTTOM_ROTATE:
        winPos = [0, -step];
        break;
      default:
        return;
    }
    let x = winPos[0] / width;
    let y = winPos[1] / height;
    //这计算了，分别向右 和 向上移动的
    let lookFactor = 0.05;
    let camera = this.viewer.camera;
    camera.lookRight(x * lookFactor);
    camera.lookUp(y * lookFactor);

    //获得direction 方向
    let direction = camera.direction;
    //获得此位置默认的向上方向
    let up = Cesium.Cartesian3.normalize(
      camera.position,
      new Cesium.Cartesian3()
    );

    // right = direction * up
    let right = Cesium.Cartesian3.cross(direction, up, new Cesium.Cartesian3());
    // up = right * direction
    up = Cesium.Cartesian3.cross(right, direction, new Cesium.Cartesian3());

    camera.up = up;
    camera.right = right;
  }

  get enable() {
    return this._enable;
  }

  set enable(value) {
    if (value) this.unbind();
    else this.bind();
  }
}

export { KeyboardRoam };
