/**
 * @Author han
 * @Date 2020/11/19 11:05
 */

import { Cesium } from 'lib/Cesium';

/** 编辑3dTile */
export const Edit3DTile = function (prop) {
  const { viewer, tilesetModel } = prop || {};
  const that = this;
  tilesetModel.readyPromise
    .then(function (currentModel) {
      let scene = viewer.scene;
      let globe = scene.globe;
      //开启地下可视化
      scene.screenSpaceCameraController.enableCollisionDetection = false;
      globe.translucency.frontFaceAlphaByDistance = new Cesium.NearFarScalar(
        1000.0,
        0.0,
        2000.0,
        1.0
      );
      globe.translucency.enabled = true;
      window.tileModel = currentModel;
      scene.globe.depthTestAgainstTerrain = true;
      viewer.zoomTo(
        currentModel,
        new Cesium.HeadingPitchRange(-0.5, -0.5, 800)
      );
      let boundingSphere = currentModel.boundingSphere;
      let cartographic = Cesium.Cartographic.fromCartesian(
        boundingSphere.center
      );
      //获取模型中心点经纬度坐标
      that.tileModelTool.longitude = (cartographic.longitude / Math.PI) * 180;
      that.tileModelTool.latitude = (cartographic.latitude / Math.PI) * 180;
      that.tileModelTool.height = cartographic.height;

      //修改3dtiles位置，input，range组件的change事件绑定此函数
      that.update3dtilesMaxtrix();

      //模型点击事件
      //   attachTileset(viewer, currentModel);
      that.tileModelToolVisiable = true; //显示3dtiles调整工具
    })
    .catch((err) => new Error(err));
};

/** 3DTile的高度更改 */
export const updateHeight = function (tileset, newHeight) {
  /* console.log(tileset);
  console.log(newHeight); */
  if (isNaN(newHeight) || !tileset) return;
  let cartographic = Cesium.Cartographic.fromCartesian(
    tileset.boundingSphere.center
  );
  let surface = Cesium.Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude,
    0.0
  );
  let offset = Cesium.Cartesian3.fromRadians(
    cartographic.longitude,
    cartographic.latitude,
    newHeight
  );
  let translation = Cesium.Cartesian3.subtract(
    offset,
    surface,
    new Cesium.Cartesian3()
  );
  tileset.modelMatrix = Cesium.Matrix4.fromTranslation(translation);
};

/** 3dTileset的编辑类 */
export class WorkModel {
  constructor(prop) {
    const { viewer, tileset, location = {} } = prop || {};
    this.viewer = viewer;
    this.tileset = tileset;
    this.location = location;
    this.editor = null;
    this.init(viewer);
  }

  init(viewer) {
    this.viewer = viewer;
    this.editor = Cesium.modelEditor({
      viewer: viewer,
      onPosition: (pos) => {
        this.tileset._root.transform = this.editor.modelMatrix();
        let wpos = Cesium.Cartographic.fromCartesian(pos);
        this.location.x = Cesium.Math.toDegrees(wpos.longitude);
        this.location.y = Cesium.Math.toDegrees(wpos.latitude);
        this.location.z = wpos.height;
        this.toView();
      },
      onHeading: (heading) => {
        this.tileset._root.transform = this.editor.modelMatrix();
        this.location.heading = Cesium.Math.toDegrees(heading);
        this.toView();
      }
    });
  }

  /**
   * 展示tileset
   * @param _url tileset的路径
   */
  showModel(_url) {
    if (this.tileset != null) {
      this.viewer.scene.primitives.remove(this.tileset);
      this.tileset = null;
    }

    this.tileset = new Cesium.Cesium3DTileset({
      url: _url,
      maximumScreenSpaceError: 1
    });
    this.viewer.scene.primitives.add(this.tileset);

    this.tileset.readyPromise
      .then((tileset) => {
        if (tileset._root && tileset._root.transform) {
          this.orginMatrixInverse = Cesium.Matrix4.inverse(
            Cesium.Matrix4.fromArray(tileset._root.transform),
            new Cesium.Matrix4()
          );
        }

        //取模型中心点信息
        this.location = this.getModelInfo(tileset);
        this.toView();

        this.editor.setPosition({
          position: Cesium.Cartesian3.fromDegrees(
            this.location.x,
            this.location.y,
            this.location.z
          ),
          heading: Cesium.Math.toRadians(this.location.heading),
          range: tileset.boundingSphere.radius * 0.9,
          scale: 1
        });
        //this.tileset._root.transform = this.editor.modelMatrix();

        this.locate();
      })
      .catch(function (error) {
        throw error;
      });
  }

  getModelInfo(tileset) {
    let result = {};

    //记录模型原始的中心点
    let boundingSphere = tileset.boundingSphere;
    let position = boundingSphere.center;
    let catographic = Cesium.Cartographic.fromCartesian(position);

    let height = Number(catographic.height.toFixed(2));
    let longitude = Number(
      Cesium.Math.toDegrees(catographic.longitude).toFixed(6)
    );
    let latitude = Number(
      Cesium.Math.toDegrees(catographic.latitude).toFixed(6)
    );
    result = { x: longitude, y: latitude, z: height, heading: 0 };

    // console.log('模型内部原始位置:' + JSON.stringify(result));

    //tileset._root.transform = Cesium.Matrix4.multiplyTransformation(tileset._root.transform, Cesium.Axis.Z_UP_TO_Y_UP, tileset._root.transform);//z轴变换

    //如果tileset自带世界矩阵矩阵，那么计算放置的经纬度和heading
    let mat = Cesium.Matrix4.fromArray(tileset._root.transform);
    let pos = Cesium.Matrix4.getTranslation(mat, new Cesium.Cartesian3());
    let wpos = Cesium.Cartographic.fromCartesian(pos);
    if (wpos) {
      result.x = Number(Cesium.Math.toDegrees(wpos.longitude).toFixed(6));
      result.y = Number(Cesium.Math.toDegrees(wpos.latitude).toFixed(6));
      result.z = Number(wpos.height.toFixed(2));

      //取旋转矩阵
      let rotmat = Cesium.Matrix4.getRotation(mat, new Cesium.Matrix3());
      //默认的旋转矩阵
      let defrotmat = Cesium.Matrix4.getRotation(
        Cesium.Transforms.eastNorthUpToFixedFrame(pos),
        new Cesium.Matrix3()
      );

      //计算rotmat 的x轴，在defrotmat 上 旋转
      let xaxis = Cesium.Matrix3.getColumn(
        defrotmat,
        0,
        new Cesium.Cartesian3()
      );
      let yaxis = Cesium.Matrix3.getColumn(
        defrotmat,
        1,
        new Cesium.Cartesian3()
      );
      let zaxis = Cesium.Matrix3.getColumn(
        defrotmat,
        2,
        new Cesium.Cartesian3()
      );

      let dir = Cesium.Matrix3.getColumn(rotmat, 0, new Cesium.Cartesian3());

      dir = Cesium.Cartesian3.cross(dir, zaxis, dir);
      dir = Cesium.Cartesian3.cross(zaxis, dir, dir);
      dir = Cesium.Cartesian3.normalize(dir, dir);

      let heading = Cesium.Cartesian3.angleBetween(xaxis, dir);

      let ay = Cesium.Cartesian3.angleBetween(yaxis, dir);

      if (ay > Math.PI * 0.5) {
        heading = 2 * Math.PI - heading;
      }
      result.heading = Number(Cesium.Math.toDegrees(heading).toFixed(1));

      // console.log('模型内部世界矩阵:' + JSON.stringify(result));
    }
    return result;
  }

  /**
   * 输出定位
   */
  toView() {
    /*  const location = {
      x: this.location.x.toFixed(6),
      y: this.location.y.toFixed(6),
      z: this.location.z.toFixed(1),
      heading: this.location.heading.toFixed(1),
      scale: this.location.scale || 1
    };
    console.log(location); */
  }

  /**
   * 定位到tileset
   */
  locate() {
    if (this.tileset.boundingSphere) {
      this.viewer.camera.flyToBoundingSphere(this.tileset.boundingSphere);
    } else {
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(
          this.location.x,
          this.location.y,
          this.location.z + 1000
        )
      });
    }
  }

  /**
   * 设置位置
   * @param location
   * {x,y,z} 经纬度;
   * {heading} 方向;
   * {scale} 缩放;
   */
  setPosition(location) {
    const { x, y, z, heading, scale = 1 } = location || {};
    this.location = location;

    this.editor.setPosition({
      position: Cesium.Cartesian3.fromDegrees(x, y, z),
      heading: Cesium.Math.toRadians(heading),
      range: this.tileset.boundingSphere.radius * 0.9,
      scale
    });

    this.tileset._root.transform = this.editor.modelMatrix();
  }

  /**
   * 重置样式
   */
  reset() {
    this.tileset.style = undefined;
  }
}

export class EditGLTF {
  constructor(prop) {
    const { viewer, tileset, location = {} } = prop || {};
    this.viewer = viewer;
    this.tileset = tileset;
    this.location = location;
    this.editor = null;

    // const url = 'my-gltf-model.gltf';
    this.init(viewer);
  }

  init(viewer) {
    this.viewer = viewer;
  }

  addModel() {
    const center = Cesium.Cartesian3.fromDegrees(110, 40);
    const matrix = Cesium.Transforms.eastNorthUpToFixedFrame(center);
    this.model = this.viewer.scene.primitives.add(
      Cesium.Model.fromGltf({
        url: 'static/Wood_Tower.gltf',
        modelMatrix: matrix
      })
    );
  }

  scale() {
    const scale = Cesium.Matrix4.fromScale(
      new Cesium.Cartesian3(2, 3, 4),
      new Cesium.Matrix4()
    );
    Cesium.Matrix4.multiply(
      this.model.modelMatrix,
      scale,
      this.model.modelMatrix
    );
  }
}
