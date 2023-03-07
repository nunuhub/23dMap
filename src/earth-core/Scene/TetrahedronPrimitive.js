/*
 * @Author: liujh
 * @Date: 2022/6/22 13:15
 * @Description:
 */
import * as Cesium from 'cesium_shinegis_earth';


/**
 * 光锥图元
 */
class TetrahedronPrimitive{
  constructor(options) {
/*    this.Cartesian3 = Cesium.Cartesian3
    this.ComponentDatatype = Cesium.ComponentDatatype
    this.PrimitiveType = Cesium.PrimitiveType
    this.BoundingSphere = Cesium.BoundingSphere
    this.GeometryAttribute = Cesium.GeometryAttribute
    this.GeometryPipeline = Cesium.GeometryPipeline
    this.Geometry = Cesium.Geometry
    this.defined = Cesium.defined
    this.RenderState = Cesium.RenderState
    this.ShaderSource = Cesium.ShaderSource
    this.ShaderProgram = Cesium.ShaderProgram
    this.DrawCommand = Cesium.DrawCommand
    this.Pass = Cesium.Pass
    this.Appearance = Cesium.Appearance
    this.BufferUsage = Cesium.BufferUsage
    this.Color = Cesium.Color
    this.VertexArray = Cesium.VertexArray
    this.buildModuleUrl = Cesium.buildModuleUrl
    this.Matrix4 = Cesium.Matrix4
    this.Matrix3 = Cesium.Matrix3
    this.Texture = Cesium.Texture
    this.Resource = Cesium.Resource
    this.Transforms = Cesium.Transforms
    this.defaultValue = Cesium.defaultValue
    this._viewer1 = viewer;*/
    //----------------------------------------------------------------------
    this.show = true;
    this._command = undefined;
    this._enuMatrix = undefined;
    this._scaleMatrix = undefined;
    this._localPosition = options.position
    this._createCommand = createCommand;
    this._angle = 0;
    this._distance = Cesium.defaultValue(options.distance, 1);
    this._setInterval = undefined;
    this._viewer = options.viewer;
    this._speed = Cesium.defaultValue(options.speed, 1.0);
    //this._color = Cesium.defaultValue(options.color, new Cesium.Color(1.0, 1.0, 0.0, 0.8));
    this._color = Cesium.defaultValue(options.color, Cesium.Color.FUCHSIA);
    this._scale = Cesium.defaultValue(options.scale, new Cesium.Cartesian3(10, 10, 15));
    this._texture = undefined;
    this._imageUrl = Cesium.buildModuleUrl('Assets3D/Textures/fence.png');
    this._modelMatrix = computeModelMatrix(this);
    this._height = computeHeight(this);
    createTexture(this);

  }
/*  tetrahedronPrimitive(options) {
    debugger;
    let show = true;
    let _command = undefined;
    let _enuMatrix = undefined;
    let _scaleMatrix = undefined;
    let _localPosition = options.position
    let _createCommand = createCommand;
    let _angle = 0;
    let _distance = Cesium.defaultValue(options.distance, 1);
    let _setInterval = undefined;
    let _viewer = this._viewer1;
    let _speed = Cesium.defaultValue(options.speed, 1.0);
    let _color = Cesium.defaultValue(options.color, new Cesium.Color(1.0, 1.0, 0.0, 0.8));
    let _scale = Cesium.defaultValue(options.scale, new Cesium.Cartesian3(10, 10, 15));
    let _texture = undefined;
    let _imageUrl = Cesium.buildModuleUrl('ThirdParty/fence.png');
    let _modelMatrix = computeModelMatrix(this);
    let _height = computeHeight(this);
    createTexture(this);
  }*/

  update (frameState) {
    if (!this.show) {
      return;
    }
    if (!Cesium.defined(this._command)) {
      this._command = this._createCommand(frameState.context, this);
      this._command.pickId = 'v_pickColor';
    }
    if (Cesium.defined(this._command)) {
      frameState.commandList.push(this._command);
    }
  }
  isDestroyed () {
    return false;
  }
  destroy () {
    if (Cesium.defined(this._command)) {
      this._command.shaderProgram = this._command.shaderProgram && this._command.shaderProgram.destroy();
    }
    return destroyObject(this);
  }
  //开启动画
  startAnimate () {
    let that = this;
    this._setInterval = setInterval(animateFunc, 5);
    function animateFunc() {
      that._angle = that._angle + 0.01;
      Math.sin(that._angle) > 0 ? that._height = 0.01 : that._height = -0.01;
      let translation = new Cesium.Cartesian3(0, 0, that._height);
      Cesium.Matrix4.multiplyByTranslation(that._modelMatrix, translation, that._modelMatrix)
      let rotationZ = Cesium.Matrix4.fromRotationTranslation(Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(that._speed)));
      Cesium.Matrix4.multiply(that._modelMatrix, rotationZ, that._modelMatrix);
    }
  }
  //关闭动画
  closeAnimate () {
    clearInterval(this._setInterval);
  }

}
export {TetrahedronPrimitive};
//创建command
function createCommand(context, tetrahedronPrimitive) {
  let translucent = false;
  let closed = true;
  let vs = creaateVertexShader();
  let fs = createFragmentShader();
  // 借用一下Appearance.getDefaultRenderState
  let rawRenderState = Cesium.Appearance.getDefaultRenderState(translucent, closed, undefined);
  let renderState = Cesium.RenderState.fromCache(rawRenderState);
  let vertexShaderSource = new Cesium.ShaderSource({
    sources: [vs]
  });
  let fragmentShaderSource = new Cesium.ShaderSource({
    sources: [fs]
  });
  let uniformMap = {
    color: function () {
      return tetrahedronPrimitive._color;
    },
    myImage: function () {
      if (Cesium.defined(tetrahedronPrimitive._texture)) {
        return tetrahedronPrimitive._texture;
      } else {
        return tetrahedronPrimitive._viewer.scene.context.defaultTexture;
      }
    }
  }
  let attributeLocations = {
    position: 0,
    textureCoordinates: 1
  };
  let shaderProgram = Cesium.ShaderProgram.fromCache({
    context: context,
    vertexShaderSource: vertexShaderSource,
    fragmentShaderSource: fragmentShaderSource,
    attributeLocations: attributeLocations
  });
  return new Cesium.DrawCommand({
    vertexArray: createVertexArray(context),
    primitiveType: Cesium.PrimitiveType.TRIANGLES,
    renderState: renderState,
    shaderProgram: shaderProgram,
    uniformMap: uniformMap,
    owner: this,
    pass: Cesium.Pass.TRANSLUCENT,
    modelMatrix: tetrahedronPrimitive._modelMatrix,
  });
}
//创建vertexArray
function createVertexArray(context) {
  let attributeLocations = {
    position: 0,
    textureCoordinates: 1
  };
  let positionsAndIndice = cereatePositionsAndIndice();
  let geometry = new Cesium.Geometry({
    attributes: {
      position: new Cesium.GeometryAttribute({
        // 使用double类型的position进行计算
        // componentDatatype : Cesium.ComponentDatatype.DOUBLE,
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: positionsAndIndice.positions
      }),
      textureCoordinates: new Cesium.GeometryAttribute({
        componentDatatype: Cesium.ComponentDatatype.FLOAT,
        componentsPerAttribute: 2,
        values: positionsAndIndice.sts
      }),
    },
    // Workaround Internet Explorer 11.0.8 lack of TRIANGLE_FAN
    indices: positionsAndIndice.indices,
    primitiveType: Cesium.PrimitiveType.TRIANGLES,
    boundingSphere: Cesium.BoundingSphere.fromVertices(positionsAndIndice.positions)
  });
  //计算geometry的法向量
  let geometryNormal = Cesium.GeometryPipeline.computeNormal(geometry);
  let vertexArray = Cesium.VertexArray.fromGeometry({
    context: context,
    geometry: geometryNormal,
    attributeLocations: attributeLocations,
    bufferUsage: Cesium.BufferUsage.STATIC_DRAW,
  });

  return vertexArray;
}
//创建顶点数组与索引
function cereatePositionsAndIndice() {
  let positions = new Float64Array(5 * 3);
  // position 0
  positions[0] = 0.0;
  positions[1] = 1.0;
  positions[2] = 0.0;

  // position 1
  positions[3] = -1.0;
  positions[4] = 0.0;
  positions[5] = 0.0;

  // position 2
  positions[6] = 0.0;
  positions[7] = -1.0;
  positions[8] = 0.0;

  // position 3
  positions[9] = 1.0;
  positions[10] = 0.0;
  positions[11] = 0.0;

  // position 4
  positions[12] = 0.0;
  positions[13] = 0.0;
  positions[14] = -1.0;
  let indices = new Uint16Array(6 * 3);
  // back triangle
  indices[0] = 4;
  indices[1] = 2;
  indices[2] = 3;

  // left triangle
  indices[3] = 4;
  indices[4] = 3;
  indices[5] = 0;

  // right triangle
  indices[6] = 4;
  indices[7] = 0;
  indices[8] = 1;

  // bottom triangle
  indices[9] = 4;
  indices[10] = 1;
  indices[11] = 2;
  // bottom triangle
  indices[12] = 1;
  indices[13] = 2;
  indices[14] = 3;

  // bottom triangle
  indices[15] = 1;
  indices[16] = 3;
  indices[17] = 0;

  // 1.3 定义纹理数组
  let sts = new Float32Array([
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
    0.0, 1.0, 0.5, 0.5,
  ]);
  return {
    indices: indices,
    positions: positions,
    sts: sts
  }
}
//创建顶点着色器
function creaateVertexShader() {
  let vertexShader =
    `
                        attribute vec3 position;
                        attribute vec3 normal;
                        attribute vec2 st;
                        attribute float batchId;
                        varying vec3 v_positionEC;
                        varying vec3 v_normalEC;
                        varying vec2 v_st;
                        varying vec4 v_pickColor;
                        void main()
                        {
                            v_positionEC = (czm_modelView * vec4(position, 1.0)).xyz;       // position in eye coordinates
                            v_normalEC = czm_normal * normal;                               // normal in eye coordinates
                            v_st = st;
                            //v_pickColor = czm_batchTable_pickColor(batchId);
                            gl_Position = czm_modelViewProjection * vec4(position, 1.0);
                        }
                        `;
  return vertexShader;
}
//创建片源着色器
function createFragmentShader() {
  let fragmentShader =
    `
                        varying vec3 v_positionEC;
                        varying vec3 v_normalEC;
                        varying vec2 v_st;
                        uniform vec4 color;
                        varying vec4 v_pickColor;
                        uniform sampler2D myImage;
                        void main()
                        {
                            vec3 positionToEyeEC = -v_positionEC;
                            vec3 normalEC = normalize(v_normalEC);
                        #ifdef FACE_FORWARD
                            normalEC = faceforward(normalEC, vec3(0.0, 0.0, 1.0), -normalEC);
                        #endif
                            czm_materialInput materialInput;
                            materialInput.normalEC = normalEC;
                            materialInput.positionToEyeEC = positionToEyeEC;
                            materialInput.st = v_st;
                            vec2 st = materialInput.st;
                            czm_material material = czm_getDefaultMaterial(materialInput);
                            float dt_a11 = fract(czm_frameNumber / 100.0) * 3.14159265 * 2.0;
                            float dt_a12 = sin(dt_a11);
                            float vst=smoothstep(0.7, 1.0, dt_a12)+0.4;
                            vec4 colorImage = texture2D(myImage, vec2(fract(st.s- czm_frameNumber*0.003), st.t));
                            material.alpha =mix(0.1,1.0,clamp((1.0-st.t) * color.a,0.0,1.0)) +(1.0-sign(st.t-czm_frameNumber*0.001))*0.2*(1.0-colorImage.r)+0.4 ;
                            material.diffuse =(1.0-colorImage.a)*vec3(1.0,2.0,1.0)+colorImage.rgb*vec3(1.0,2.0,1.0);
                        #ifdef FLAT
                            gl_FragColor = vec4(material.diffuse + material.emission, material.alpha);
                        #else
                            gl_FragColor = czm_phong(normalize(positionToEyeEC), material, czm_lightDirectionEC);
                        #endif
                        }
                        `;
  return fragmentShader;
}
//创建纹理
function createTexture(tetrahedronPrimitive) {

  Cesium.Resource.createIfNeeded(tetrahedronPrimitive._imageUrl).fetchImage().then(function (image) {
    let vTexture;
    let context = tetrahedronPrimitive._viewer.scene.context;
    if (Cesium.defined(image.internalFormat)) {
      vTexture = new Cesium.Texture({
        context: context,
        pixelFormat: image.internalFormat,
        width: image.naturalWidth,
        height: image.naturalHeight,
        source: {
          arrayBufferView: image.bufferView
        }
      });
    } else {
      vTexture = new Cesium.Texture({
        context: context,
        source: image
      });
    }
    tetrahedronPrimitive._texture = vTexture;
  });
}
//计算矩阵
function computeModelMatrix(tetrahedronPrimitive) {
  let enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(tetrahedronPrimitive._localPosition);
  let scaleMatrix = Cesium.Matrix4.fromScale(tetrahedronPrimitive._scale);
  let modelMatrix = Cesium.Matrix4.multiply(enuMatrix, scaleMatrix, new Cesium.Matrix4());
  tetrahedronPrimitive._scaleMatrix = scaleMatrix;
  tetrahedronPrimitive._enuMatrix = enuMatrix;
  return modelMatrix;
}
//计算高度
function computeHeight(tetrahedronPrimitive) {
  let point = Cesium.Cartesian3.fromElements(0, 0, tetrahedronPrimitive._distance, new Cesium.Cartesian3());
  let enuPoint = Cesium.Matrix4.multiplyByPoint(tetrahedronPrimitive._enuMatrix, point, new Cesium.Cartesian3());
  let upPositionEC = Cesium.Matrix4.multiplyByPoint(tetrahedronPrimitive._viewer.scene.camera._viewMatrix, enuPoint, new Cesium.Cartesian3());
  let upPositionPC = Cesium.Matrix4.multiplyByPoint(tetrahedronPrimitive._viewer.scene.camera.frustum.projectionMatrix, upPositionEC, new Cesium.Cartesian3());
  return Cesium.Cartesian3.normalize(upPositionPC, new Cesium.Cartesian3()).z;
}

export function tetrahedronPrimitive(options) {
  return  new TetrahedronPrimitive(options)
}

//Cesium.TetrahedronPrimitive = tetrahedronPrimitive;

