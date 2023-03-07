import * as Cesium from 'cesium_shinegis_earth';

const {
  Color,
  Cartesian2,
  Cartesian3,
  Cartesian4,
  Transforms,
  Matrix3,
  Matrix4,
  Camera,
  ShadowMap,
  PostProcessStage,
  Quaternion,
  GeometryInstance,
  FrustumOutlineGeometry,
  ColorGeometryInstanceAttribute,
  ShowGeometryInstanceAttribute,
  Primitive,
  PerInstanceColorAppearance,
  HeadingPitchRoll,
  combine
} = Cesium;
const videoProjectionFS =
  ' #define USE_CUBE_MAP_SHADOW true\n\
 #extension GL_OES_standard_derivatives : enable\n\
 uniform sampler2D colorTexture;\n\
 uniform sampler2D depthTexture;\n\
 varying vec2 v_textureCoordinates;\n\
 uniform mat4 camera_projection_matrix;\n\
 uniform mat4 camera_view_matrix;\n\
 uniform mat4 camera_view_projection_matrix;\n\
 uniform samplerCube shadowMap_textureCube;\n\
 uniform mat4 shadowMap_matrix;\n\
 uniform vec4 shadowMap_lightPositionEC;\n\
 uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;\n\
 uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;\n\
 uniform float helsing_viewDistance;\n\
 uniform vec2 video_tex_size;\n\
 struct zx_shadowParameters\n\
 {\n\
    vec3 texCoords;\n\
    float depthBias;\n\
    float depth;\n\
    float nDotL;\n\
    vec2 texelStepSize;\n\
    float normalShadingSmooth;\n\
    float darkness;\n\
 };\n\
 float czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters)\n\
 {\n\
     float depthBias = shadowParameters.depthBias;\n\
     float depth = shadowParameters.depth;\n\
     float nDotL = shadowParameters.nDotL;\n\
     float normalShadingSmooth = shadowParameters.normalShadingSmooth;\n\
     float darkness = shadowParameters.darkness;\n\
     vec3 uvw = shadowParameters.texCoords;\n\
     depth -= depthBias;\n\
     float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);\n\
     return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);\n\
 }\n\
 vec4 getPositionEC(){\n\
     return czm_windowToEyeCoordinates(gl_FragCoord);\n\
 }\n\
 vec3 getNormalEC(){\n\
     return vec3(1.);\n\
 }\n\
 vec4 toEye(in vec2 uv,in float depth){\n\
     vec2 xy=vec2((uv.x*2.-1.),(uv.y*2.-1.));\n\
     vec4 posInCamera=czm_inverseProjection*vec4(xy,depth,1.);\n\
     posInCamera=posInCamera/posInCamera.w;\n\
     return posInCamera;\n\
 }\n\
 vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point){\n\
     vec3 v01=point-planeOrigin;\n\
     float d=dot(planeNormal,v01);\n\
     return(point-planeNormal*d);\n\
 }\n\
 float getDepth(in vec4 depth){\n\
     float z_window=czm_unpackDepth(depth);\n\
     z_window=czm_reverseLogDepth(z_window);\n\
     float n_range=czm_depthRange.near;\n\
     float f_range=czm_depthRange.far;\n\
     return(2.*z_window-n_range-f_range)/(f_range-n_range);\n\
 }\n\
 float shadow(in vec4 positionEC){\n\
     vec3 normalEC=getNormalEC();\n\
     zx_shadowParameters shadowParameters;\n\
     shadowParameters.texelStepSize=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;\n\
     shadowParameters.depthBias=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;\n\
     shadowParameters.normalShadingSmooth=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;\n\
     shadowParameters.darkness=shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;\n\
     vec3 directionEC=positionEC.xyz-shadowMap_lightPositionEC.xyz;\n\
     float distance=length(directionEC);\n\
     directionEC=normalize(directionEC);\n\
     float radius=shadowMap_lightPositionEC.w;\n\
     if(distance>radius)\n\
     {\n\
         return 2.0;\n\
     }\n\
     vec3 directionWC=czm_inverseViewRotation*directionEC;\n\
     shadowParameters.depth=distance/radius-0.0003;\n\
     shadowParameters.nDotL=clamp(dot(normalEC,-directionEC),0.,1.);\n\
     shadowParameters.texCoords=directionWC;\n\
     float visibility=czm_shadowVisibility(shadowMap_textureCube,shadowParameters);\n\
     return visibility;\n\
 }\n\
 bool visible(in vec4 result)\n\
 {\n\
     //result.x/=result.w;\n\
     //result.y/=result.w;\n\
     //result.z/=result.w;\n\
\n\
     return result.x>=-1.&&result.x<=1.\n\
     &&result.y>=-1.&&result.y<=1.\n\
     &&result.z>=0.&&result.z<=1.;\n\
 }\n\
\n\
 vec4 AntiAlias_None(vec2 uv, vec2 texsize) {\n\
     return texture2D(image_0, uv / texsize, -99999.0);\n\
 }\n\
\n\
 vec4 AntiAliasPointSampleTexture_None(vec2 uv, vec2 texsize) {\n\
 	return texture2D(image_0, (floor(uv+0.5)+0.5) / texsize, -99999.0);\n\
 }\n\
\n\
 vec4 AntiAliasPointSampleTexture_Smoothstep(vec2 uv, vec2 texsize) {\n\
 	vec2 w=fwidth(uv);\n\
 	return texture2D(image_0, (floor(uv)+0.5+smoothstep(0.5-w,0.5+w,fract(uv))) / texsize, -99999.0);\n\
 }\n\
\n\
 vec4 AntiAliasPointSampleTexture_Linear(vec2 uv, vec2 texsize) {\n\
 	vec2 w=fwidth(uv);\n\
 	return texture2D(image_0, (floor(uv)+0.5+clamp((fract(uv)-0.5+w)/w,0.,1.)) / texsize, -99999.0);\n\
 }\n\
\n\
 vec4 AntiAliasPointSampleTexture_ModifiedFractal(vec2 uv, vec2 texsize) {\n\
    uv.xy -= 0.5;\n\
 	vec2 w=fwidth(uv);\n\
 	return texture2D(image_0, (floor(uv)+0.5+min(fract(uv)/min(w,1.0),1.0)) / texsize, -99999.0);\n\
 }\n\
\n\
 vec4 videoColor(in vec4 result)\n\
 {\n\
     //result.x/=result.w;\n\
     //result.y/=result.w;\n\
     //result.z/=result.w;\n\
\n\
     vec2 texCoord;\n\
     texCoord.x = (result.x*0.5+0.5)*video_tex_size.x;\n\
     texCoord.y = (result.y*0.5+0.5)*video_tex_size.y;\n\
\n\
     return AntiAlias_None(texCoord, video_tex_size);\n\
 }\n\
\n\
 void main(){\n\
     // 颜色 = (颜色纹理, 纹理坐标)\n\
     gl_FragColor = texture2D(colorTexture, v_textureCoordinates);\n\
     // 深度 = 获取深度(结构二维(深度纹理, 纹理坐标))\n\
     float depth = getDepth(texture2D(depthTexture, v_textureCoordinates));\n\
     // 视角 = (纹理坐标, 深度)\n\
     vec4 viewPos = toEye(v_textureCoordinates, depth);\n\
     // 世界坐标\n\
     vec4 wordPos = czm_inverseView * viewPos;\n\
     // 虚拟相机中坐标\n\
     vec4 vcPos = camera_view_matrix * wordPos;\n\
     float near = .001 * helsing_viewDistance;\n\
     float dis = length(vcPos.xyz);\n\
     if(dis > near && dis < helsing_viewDistance){\n\
         // 透视投影\n\
         vec2 xy=vec2((v_textureCoordinates.x*2.-1.),(v_textureCoordinates.y*2.-1.));\n\
         vec4 posInEye = camera_view_projection_matrix * vec4(xy,depth,1.);\n\
         posInEye /= posInEye.w;\n\
         if(visible(posInEye)){\n\
             float vis = shadow(viewPos);\n\
             if(vis > 0.3){\n\
                vec4 vColor = videoColor(posInEye);\n\
                float tmp = 0.6;\n\
                float scale = (1.0-clamp(abs(posInEye.x)-tmp,0.0,1.0-tmp)/(1.0-tmp)) * (1.0-clamp(abs(posInEye.y)-tmp,0.0,1.0-tmp)/(1.0-tmp));\n\
                gl_FragColor = mix(gl_FragColor,vColor,scale);\n\
             }\n\
         }\n\
     }\n\
 }\n\
';
var viewProjectionMatrix = new Matrix4();
/**
 * 视频投影。
 *
 * @alias VideoProjection
 * @constructor
 * @param {Viewer} viewer Cesium三维视窗。
 * @param {Object} options 选项。
 * @param {Cartesian3} options.viewPosition 观测点位置。
 * @param {Cartesian3} options.viewPositionEnd 最远观测点位置（如果设置了观测距离，这个属性可以不设置）。
 * @param {Number} options.viewDistance 观测距离（单位`米`，默认值100）。
 * @param {Number} options.viewHeading 航向角（单位`度`，默认值0）。
 * @param {Number} options.viewPitch 俯仰角（单位`度`，默认值0）。
 * @param {Number} options.horizontalViewAngle 视频投影水平夹角（单位`度`，默认值90）。
 * @param {Number} options.verticalViewAngle 视频投影垂直夹角（单位`度`，默认值60）。
 * @param {Material} options.material 视频贴图材质。
 * @param {Boolean} options.showFrustumOutline 显示视锥外轮廓线(默认值false)
 * @param {Boolean} options.showSketch 显示投影面草图(默认值false)
 */
class VideoProjection {
  constructor(viewer, options) {
    this.viewer = viewer;
    this.viewPosition = options.viewPosition;
    this.viewPositionEnd = options.viewPositionEnd;
    this.viewDistance = this.viewPositionEnd
      ? Cartesian3.distance(this.viewPosition, this.viewPositionEnd)
      : options.viewDistance || 100.0;
    this.viewHeading = this.viewPositionEnd
      ? getHeading(this.viewPosition, this.viewPositionEnd)
      : options.viewHeading || 0.0;
    this.viewPitch = this.viewPositionEnd
      ? getPitch(this.viewPosition, this.viewPositionEnd)
      : options.viewPitch || 0.0;
    this.horizontalViewAngle = options.horizontalViewAngle || 90.0;
    this.verticalViewAngle = options.verticalViewAngle || 60.0;
    this.enabled = true;
    this.softShadows = true;
    this.size = 2048;
    this.material = options.material;
    this.showFrustumOutline = options.showFrustumOutline || false;
    this.showSketch = options.showSketch || false;
    if (!this.viewPositionEnd) {
      this.viewPositionEnd = getViewPositionEnd({
        fromPosition: this.viewPosition,
        heading: this.viewHeading,
        pitch: this.viewPitch,
        distance: this.viewDistance
      });
    }

    options.callback && options.callback(this);
    this.update();
  }
  add() {
    this.createLightCamera();
    this.createShadowMap();
    this.createPostStage();
    if (this.showFrustumOutline) {
      this.drawFrustumOutline();
    }
    if (this.showSketch) {
      this.drawSketch();
    }
  }
  update() {
    this.clear();
    this.add();
  }
  clear() {
    this.viewPositionEnd = undefined;
    if (this.sketch) {
      this.viewer.entities.removeById(this.sketch.id);
      this.sketch = null;
    }
    if (this.frustumOutline) {
      this.viewer.scene.primitives.remove(this.frustumOutline);
      this.frustumOutline = null;
    }
    if (this.postStage) {
      this.viewer.scene.postProcessStages.remove(this.postStage);
      this.postStage = null;
    }
  }
  createLightCamera() {
    this.lightCamera = new Camera(this.viewer.scene);
    this.lightCamera.position = this.viewPosition;
    if (this.viewPositionEnd) {
      var direction = Cartesian3.normalize(
        Cartesian3.subtract(
          this.viewPositionEnd,
          this.viewPosition,
          new Cesium.Cartesian3()
        ),
        new Cesium.Cartesian3()
      );
      this.lightCamera.direction = direction; // direction是相机面向的方向
    }
    this.lightCamera.frustum.near = this.viewDistance * 0.001;
    this.lightCamera.frustum.far = this.viewDistance;
    const hr = Cesium.Math.toRadians(this.horizontalViewAngle);
    const vr = Cesium.Math.toRadians(this.verticalViewAngle);
    const aspectRatio = Math.tan(hr / 2) / Math.tan(vr / 2);
    this.lightCamera.frustum.aspectRatio = aspectRatio;
    this.lightCamera.frustum.fov = vr;
    this.lightCamera.frustum.adaptFov = false;
    this.lightCamera.setView({
      destination: this.viewPosition,
      orientation: {
        heading: Cesium.Math.toRadians(this.viewHeading || 0),
        pitch: Cesium.Math.toRadians(this.viewPitch || 0),
        roll: 0
      }
    });
  }
  createShadowMap() {
    this.shadowMap = new ShadowMap({
      context: this.viewer.scene.context,
      lightCamera: this.lightCamera,
      enabled: this.enabled,
      isPointLight: true,
      pointLightRadius: this.viewDistance,
      cascadesEnabled: true,
      size: this.size,
      softShadows: this.softShadows,
      normalOffset: false,
      fromLightSource: false
    });
    this.viewer.scene.shadowMap = this.shadowMap;
  }
  createPostStage() {
    const fs = this.material.shaderSource + videoProjectionFS;
    var that = this;
    var uniformMap = {
      shadowMap_textureCube: function () {
        that.shadowMap.update(that.viewer.scene.frameState);
        return that.shadowMap._shadowMapTexture;
      },
      shadowMap_matrix: function () {
        that.shadowMap.update(that.viewer.scene.frameState);
        return that.shadowMap._shadowMapMatrix;
      },
      shadowMap_lightPositionEC: function () {
        that.shadowMap.update(that.viewer.scene.frameState);
        return that.shadowMap._lightPositionEC;
      },
      shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: function () {
        that.shadowMap.update(that.viewer.scene.frameState);
        const bias = that.shadowMap._pointBias;
        return Cartesian4.fromElements(
          bias.normalOffsetScale,
          that.shadowMap._distance,
          that.shadowMap.maximumDistance,
          0.0,
          new Cartesian4()
        );
      },
      shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: function () {
        that.shadowMap.update(that.viewer.scene.frameState);
        const bias = that.shadowMap._pointBias;
        const scratchTexelStepSize = new Cartesian2();
        const texelStepSize = scratchTexelStepSize;
        texelStepSize.x = 1.0 / that.shadowMap._textureSize.x;
        texelStepSize.y = 1.0 / that.shadowMap._textureSize.y;

        return Cartesian4.fromElements(
          texelStepSize.x,
          texelStepSize.y,
          bias.depthBias,
          bias.normalShadingSmooth,
          new Cartesian4()
        );
      },
      camera_projection_matrix: function () {
        return that.lightCamera.frustum.projectionMatrix;
      },
      camera_view_matrix: function () {
        return that.lightCamera.viewMatrix;
      },
      camera_view_projection_matrix: function () {
        var view = that.lightCamera.viewMatrix;
        var projection = that.lightCamera.frustum.projectionMatrix;
        Matrix4.multiply(projection, view, viewProjectionMatrix);
        Matrix4.multiply(
          viewProjectionMatrix,
          that.viewer.scene.context.uniformState.inverseViewProjection,
          viewProjectionMatrix
        );
        return viewProjectionMatrix;
      },
      helsing_viewDistance: function () {
        return that.viewDistance;
      },
      video_tex_size: function () {
        that.material.update(that.viewer.scene.context);
        var textures = that.material._textures;
        for (var texture in textures) {
          if (textures.hasOwnProperty(texture)) {
            var instance = textures[texture];
            if (instance !== this._defaultTexture) {
              return instance.dimensions;
            }
          }
        }
        return Cartesian2.fromElements(1920, 1080);
      }
    };
    const postStage = new PostProcessStage({
      fragmentShader: fs,
      uniforms: combine(uniformMap, this.material._uniforms)
    });
    this.postStage = this.viewer.scene.postProcessStages.add(postStage);
  }
  drawFrustumOutline() {
    const scratchRight = new Cartesian3();
    const scratchRotation = new Matrix3();
    const scratchOrientation = new Quaternion();
    const position = this.lightCamera.positionWC;
    const direction = this.lightCamera.directionWC;
    const up = this.lightCamera.upWC;
    let right = this.lightCamera.rightWC;
    right = Cartesian3.negate(right, scratchRight);
    let rotation = scratchRotation;
    Matrix3.setColumn(rotation, 0, right, rotation);
    Matrix3.setColumn(rotation, 1, up, rotation);
    Matrix3.setColumn(rotation, 2, direction, rotation);
    let orientation = Quaternion.fromRotationMatrix(
      rotation,
      scratchOrientation
    );

    let instance = new GeometryInstance({
      geometry: new FrustumOutlineGeometry({
        frustum: this.lightCamera.frustum,
        origin: this.viewPosition,
        orientation: orientation
      }),
      id: Math.random().toString(36).substr(2),
      attributes: {
        color: ColorGeometryInstanceAttribute.fromColor(
          Color.YELLOWGREEN //new Cesium.Color(0.0, 1.0, 0.0, 1.0)
        ),
        show: new ShowGeometryInstanceAttribute(true)
      }
    });

    this.frustumOutline = this.viewer.scene.primitives.add(
      new Primitive({
        geometryInstances: [instance],
        appearance: new PerInstanceColorAppearance({
          flat: true,
          translucent: false
        })
      })
    );
  }
  drawSketch() {
    this.sketch = this.viewer.entities.add({
      name: 'sketch',
      position: this.viewPosition,
      orientation: Transforms.headingPitchRollQuaternion(
        this.viewPosition,
        HeadingPitchRoll.fromDegrees(this.viewHeading - 90, this.viewPitch, 0.0)
      ),
      ellipsoid: {
        radii: new Cartesian3(
          this.viewDistance,
          this.viewDistance,
          this.viewDistance
        ),
        // innerRadii: new Cesium.Cartesian3(2.0, 2.0, 2.0),
        minimumClock: Cesium.Math.toRadians(-this.horizontalViewAngle / 2),
        maximumClock: Cesium.Math.toRadians(this.horizontalViewAngle / 2),
        minimumCone: Cesium.Math.toRadians(this.verticalViewAngle + 7.75),
        maximumCone: Cesium.Math.toRadians(180 - this.verticalViewAngle - 7.75),
        fill: false,
        outline: true,
        subdivisions: 256,
        stackPartitions: 64,
        slicePartitions: 64,
        outlineColor: Color.YELLOWGREEN
      }
    });
  }
}

function getHeading(fromPosition, toPosition) {
  var finalPosition = new Cartesian3();
  var matrix4 = Transforms.eastNorthUpToFixedFrame(fromPosition);
  Matrix4.inverse(matrix4, matrix4);
  Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
  Cartesian3.normalize(finalPosition, finalPosition);
  return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y));
}

function getPitch(fromPosition, toPosition) {
  var finalPosition = new Cartesian3();
  var matrix4 = Transforms.eastNorthUpToFixedFrame(fromPosition);
  Matrix4.inverse(matrix4, matrix4);
  Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
  Cartesian3.normalize(finalPosition, finalPosition);
  return Cesium.Math.toDegrees(Math.asin(finalPosition.z));
}
function getViewPositionEnd({ fromPosition, heading, pitch, distance }) {
  heading = Cesium.Math.toRadians(heading);
  pitch = Cesium.Math.toRadians(pitch);
  let ViewPositionEnd = new Cartesian3();
  let matrix4 = Transforms.eastNorthUpToFixedFrame(fromPosition);
  /* Matrix4.inverse(matrix4, matrix4); */
  let horizontalDis = Math.cos(Math.abs(pitch)) * distance;
  let [x, y] = [
    Math.cos(heading) * horizontalDis,
    Math.sin(heading) * horizontalDis
  ];
  let z = Math.sin(pitch) * distance;
  Matrix4.multiplyByPoint(matrix4, new Cartesian3(x, y, z), ViewPositionEnd);
  return ViewPositionEnd;
}

export default VideoProjection;
