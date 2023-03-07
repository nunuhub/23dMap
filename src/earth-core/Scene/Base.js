/*
 * @Author: liujh
 * @Date: 2022/6/15 14:56
 * @Description:
 */
/**
 * 基础模块
 * @param {*} viewer
 */
import * as Cesium from 'cesium_shinegis_earth'

  // 天空盒
export function setOneSkyBox () {
    return new Cesium.SkyBox({
      sources: {
        positiveX: 'Assets3D/SkyBox/00h+00.jpg',
        negativeX: 'Assets3D/SkyBox/12h+00.jpg',
        positiveY: 'Assets3D/SkyBox/06h+00.jpg',
        negativeY: 'Assets3D/SkyBox/18h+00.jpg',
        positiveZ: 'Assets3D/SkyBox/06h+90.jpg',
        negativeZ: 'Assets3D/SkyBox/06h-90.jpg'
      }
    })
  }
  // 天空盒2
export function setTwoSkyBox () {
    return new Cesium.SkyBox({
      sources: {
        positiveX: 'Assets3D/SkyBox/Version2_dark_px.jpg',
        negativeX: 'Assets3D/SkyBox/Version2_dark_mx.jpg',
        positiveY: 'Assets3D/SkyBox/Version2_dark_py.jpg',
        negativeY: 'Assets3D/SkyBox/Version2_dark_my.jpg',
        positiveZ: 'Assets3D/SkyBox/Version2_dark_pz.jpg',
        negativeZ: 'Assets3D/SkyBox/Version2_dark_mz.jpg'
      }
    })
  }
  // 天空盒3
export function setThreeSkyBox () {
    return new Cesium.SkyBox({
      sources: {
        positiveX: 'Assets3D/SkyBox/tycho2t3_80_pxs.jpg',
        negativeX: 'Assets3D/SkyBox/tycho2t3_80_mxs.jpg',
        positiveY: 'Assets3D/SkyBox/tycho2t3_80_pys.jpg',
        negativeY: 'Assets3D/SkyBox/tycho2t3_80_mys.jpg',
        positiveZ: 'Assets3D/SkyBox/tycho2t3_80_pzs.jpg',
        negativeZ: 'Assets3D/SkyBox/tycho2t3_80_mzs.jpg'
      }
    })
  }
  //近景天空盒
/*export function setOneGroundSkyBox () {
    return new Cesium.GroundSkyBox({
      sources: {
        positiveX: 'Assets3D/SkyBox/rightav9.jpg',
        negativeX: 'Assets3D/SkyBox/leftav9.jpg',
        positiveY: 'Assets3D/SkyBox/frontav9.jpg',
        negativeY: 'Assets3D/SkyBox/backav9.jpg',
        positiveZ: 'Assets3D/SkyBox/topav9.jpg',
        negativeZ: 'Assets3D/SkyBox/bottomav9.jpg'
      }
    });
  }
  //近景天空盒 2
export function  setTwoGroundSkyBox () {
    return new Cesium.GroundSkyBox({
      sources: {
        positiveX: 'Assets3D/SkyBox/SunSetRight.png',
        negativeX: 'Assets3D/SkyBox/SunSetLeft.png',
        positiveY: 'Assets3D/SkyBox/SunSetFront.png',
        negativeY: 'Assets3D/SkyBox/SunSetBack.png',
        positiveZ: 'Assets3D/SkyBox/SunSetUp.png',
        negativeZ: 'Assets3D/SkyBox/SunSetDown.png'
      }
    });
  }
  //近景天空盒 3
export function setThreeGroundSkyBox () {
    return new Cesium.GroundSkyBox({
      sources: {
        positiveX: 'Assets3D/SkyBox/Right.jpg',
        negativeX: 'Assets3D/SkyBox/Left.jpg',
        positiveY: 'Assets3D/SkyBox/Front.jpg',
        negativeY: 'Assets3D/SkyBox/Back.jpg',
        positiveZ: 'Assets3D/SkyBox/Up.jpg',
        negativeZ: 'Assets3D/SkyBox/Down.jpg'
      }
    });
  }
//近景天空盒 4
export function  setFourGroundSkyBox () {
  return new Cesium.GroundSkyBox({
    sources: {
      positiveX: 'Assets3D/SkyBox/mySkybox/right.jpg',
      negativeX: 'Assets3D/SkyBox/mySkybox/left.jpg',
      positiveY: 'Assets3D/SkyBox/mySkybox/front.jpg',
      negativeY: 'Assets3D/SkyBox/mySkybox/back.jpg',
      positiveZ: 'Assets3D/SkyBox/mySkybox/up.jpg',
      negativeZ: 'Assets3D/SkyBox/mySkybox/down.jpg'
    }
  });
}*/
  //黑夜特效
export function  setDarkEffect (options) {
    options = options || {}
    let fs =
      'uniform sampler2D colorTexture;\n' +
      'varying vec2 v_textureCoordinates;\n' +
      'uniform float scale;\n' +
      'uniform vec3 offset;\n' +
      'void main() {\n' +
      ' // vec4 color = texture2D(colorTexture, v_textureCoordinates);\n' +
      ' vec4 color = texture2D(colorTexture, v_textureCoordinates);\n' +
      ' // float gray = 0.2989*color.r+0.5870*color.g+0.1140*color.b;\n' +
      ' // gl_FragColor = vec4(gray,gray,2.0*(gray+1.0), 1.0);\n' +
      ' gl_FragColor = vec4(color.r*0.2,color.g * 0.4,color.b*0.6, 1.0);\n' +
      '}\n';
    return this._viewer.scene.postProcessStages.add(new Cesium.PostProcessStage({
      name: 'darkEffect',
      fragmentShader: fs,
      uniforms: {
        scale: 1.0,
        offset: function () {
          return options.offset || new Cesium.Cartesian3(0.1, 0.2, 0.3);
        }
      }
    }));
  }
  // 场景蓝光
export function  setBlurBloom (options) {

    if (this._viewer && options) {

      let fs = 'uniform float height;\n' +
        'uniform float width;\n' +
        'uniform sampler2D colorTexture1;\n' +
        '\n' +
        'varying vec2 v_textureCoordinates;\n' +
        '\n' +
        'const int SAMPLES = 9;\n' +
        'void main()\n' +
        '{\n' +
        'vec2 st = v_textureCoordinates;\n' +
        'float wr = float(1.0 / width);\n' +
        'float hr = float(1.0 / height);\n' +
        'vec4 result = vec4(0.0);\n' +
        'int count = 0;\n' +
        'for(int i = -SAMPLES; i <= SAMPLES; ++i){\n' +
        'for(int j = -SAMPLES; j <= SAMPLES; ++j){\n' +
        'vec2 offset = vec2(float(i) * wr, float(j) * hr);\n' +
        'result += texture2D(colorTexture1, st + offset);\n' +
        '}\n' +
        '}\n' +
        'result = result / float(count);\n' +
        'gl_FragColor = result;\n' +
        '}\n';

      return this._viewer.scene.postProcessStages.add(new Cesium.PostProcessStage({
        name: 'blur_x_direction',
        fragmentShader: fs,
        uniforms: {
          width: options.width,
          height: options.height,
          colorTexture1: "Bright"
        }
      }));
    }
  }
  //雨天特效
export function setRainEffect () {

    if (this._viewer) {
      let fs = "uniform sampler2D colorTexture;\n\
                varying vec2 v_textureCoordinates;\n\
                \n\
                float hash(float x){\n\
                return fract(sin(x*23.3)*13.13);\n\
                }\n\
                \n\
                void main(){\n\
                    float time = czm_frameNumber / 60.0;\n\
                    vec2 resolution = czm_viewport.zw;\n\
                    vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
                    vec3 c=vec3(.6,.7,.8);\n\
                    float a=-.4;\n\
                    float si=sin(a),co=cos(a);\n\
                    uv*=mat2(co,-si,si,co);\n\
                    uv*=length(uv+vec2(0,4.9))*.3+1.;\n\
                    float v=1.-sin(hash(floor(uv.x*100.))*2.);\n\
                    float b=clamp(abs(sin(20.*time*v+uv.y*(5./(2.+v))))-.95,0.,1.)*20.;\n\
                    c*=v*b;\n\
                    gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(c, 1), 0.2);\n\
                }\n\
                ";
      return this._viewer.scene.postProcessStages.add(new Cesium.PostProcessStage({
        name: 'rainEffect',
        fragmentShader: fs
      }));
    }

  }
  //雪天特效
export function  setSnowEffect () {

    if (this._viewer) {
      let fs = "uniform sampler2D colorTexture;\n\
                    varying vec2 v_textureCoordinates;\n\
                    \n\
                    float snow(vec2 uv,float scale){\n\
                        float time = czm_frameNumber / 60.0;\n\
                        float w=smoothstep(1.,0.,-uv.y*(scale/10.));\n\
                        if(w<.1)return 0.;\n\
                        uv+=time/scale;\n\
                        uv.y+=time*2./scale;\n\
                        uv.x+=sin(uv.y+time*.5)/scale;\n\
                        uv*=scale;\n\
                        vec2 s=floor(uv),f=fract(uv),p;\n\
                        float k=3.,d;\n\
                        p=.5+.35*sin(11.*fract(sin((s+p+scale)*mat2(7,3,6,5))*5.))-f;\n\
                        d=length(p);\n\
                        k=min(d,k);\n\
                        k=smoothstep(0.,k,sin(f.x+f.y)*0.01);\n\
                        return k*w;\n\
                    }\n\
                    \n\
                    void main(){\n\
                        vec2 resolution = czm_viewport.zw;\n\
                        vec2 uv=(gl_FragCoord.xy*2.-resolution.xy)/min(resolution.x,resolution.y);\n\
                        vec3 finalColor=vec3(0);\n\
                        float c = 0.0;\n\
                        c+=snow(uv,30.)*.0;\n\
                        c+=snow(uv,20.)*.0;\n\
                        c+=snow(uv,15.)*.0;\n\
                        c+=snow(uv,10.);\n\
                        c+=snow(uv,8.);\n\
                        c+=snow(uv,6.);\n\
                        c+=snow(uv,5.);\n\
                        finalColor=(vec3(c));\n\
                        gl_FragColor = mix(texture2D(colorTexture, v_textureCoordinates), vec4(finalColor,1), 0.3);\n\
                        \n\
                    }\n\
                    ";
      return this._viewer.scene.postProcessStages.add(new Cesium.PostProcessStage({
        name: 'snowEffect',
        fragmentShader: fs
      }));
    }
  }
  // 雾天
export function  setFogEffect () {
    if (this._viewer) {

      let fs =
        "float getDistance(sampler2D depthTexture, vec2 texCoords) \n" +
        "{ \n" +
        "    float depth = czm_unpackDepth(texture2D(depthTexture, texCoords)); \n" +
        "    if (depth == 0.0) { \n" +
        "        return czm_infinity; \n" +
        "    } \n" +
        "    vec4 eyeCoordinate = czm_windowToEyeCoordinates(gl_FragCoord.xy, depth); \n" +
        "    return -eyeCoordinate.z / eyeCoordinate.w; \n" +
        "} \n" +
        "float interpolateByDistance(vec4 nearFarScalar, float distance) \n" +
        "{ \n" +
        "    float startDistance = nearFarScalar.x; \n" +
        "    float startValue = nearFarScalar.y; \n" +
        "    float endDistance = nearFarScalar.z; \n" +
        "    float endValue = nearFarScalar.w; \n" +
        "    float t = clamp((distance - startDistance) / (endDistance - startDistance), 0.0, 1.0); \n" +
        "    return mix(startValue, endValue, t); \n" +
        "} \n" +
        "vec4 alphaBlend(vec4 sourceColor, vec4 destinationColor) \n" +
        "{ \n" +
        "    return sourceColor * vec4(sourceColor.aaa, 1.0) + destinationColor * (1.0 - sourceColor.a); \n" +
        "} \n" +
        "uniform sampler2D colorTexture; \n" +
        "uniform sampler2D depthTexture; \n" +
        "uniform vec4 fogByDistance; \n" +
        "uniform vec4 fogColor; \n" +
        "varying vec2 v_textureCoordinates; \n" +
        "void main(void) \n" +
        "{ \n" +
        "    float distance = getDistance(depthTexture, v_textureCoordinates); \n" +
        "    vec4 sceneColor = texture2D(colorTexture, v_textureCoordinates); \n" +
        "    float blendAmount = interpolateByDistance(fogByDistance, distance); \n" +
        "    vec4 finalFogColor = vec4(fogColor.rgb, fogColor.a * blendAmount); \n" +
        "    gl_FragColor = alphaBlend(finalFogColor, sceneColor); \n" +
        "} \n";

      return this._viewer.scene.postProcessStages.add(
        new Cesium.PostProcessStage({
          fragmentShader: fs,
          uniforms: {
            fogByDistance: new Cesium.Cartesian4(10, 0.0, 200, 1.0),
            fogColor: Cesium.Color.BLACK,
          },
        })
      );
    }
  }
  /**
   * 默认场景配置
   */
  export function  setDefSceneConfig () {
    if (this._viewer) {
      this._viewer.scene.sun.show = false;
      this._viewer.scene.moon.show = false;
      this._viewer.scene.fxaa = true;
      this._viewer.scene.globe.depthTestAgainstTerrain = true;
      this._viewer.scene.undergroundMode = false;
      this._viewer.scene.terrainProvider.isCreateSkirt = false;
      this._viewer.scene.skyAtmosphere.show = false;
      this._viewer.scene.globe.showGroundAtmosphere = false
      this._viewer.scene.globe.enableLighting = true
      this._viewer.scene.fog.enabled = false
      this._viewer.cesiumWidget.creditContainer.style.display = "none";
    }
  }
  /**
   * 场景泛光
   */
  export function setBloomLightScenen () {

    if (this._viewer) {
      this._viewer.scene.postProcessStages.bloom.enabled = true
      this._viewer.scene.postProcessStages.bloom.uniforms.contrast = 119
      this._viewer.scene.postProcessStages.bloom.uniforms.brightness = -0.4
      this._viewer.scene.postProcessStages.bloom.uniforms.glowOnly = false
      this._viewer.scene.postProcessStages.bloom.uniforms.delta = 0.9
      this._viewer.scene.postProcessStages.bloom.uniforms.sigma = 3.78
      this._viewer.scene.postProcessStages.bloom.uniforms.stepSize = 5
      this._viewer.scene.postProcessStages.bloom.uniforms.isSelected = false
    }
  }
//相机定位
export function setView (viewer,options) {

  if (viewer && options && options.position) {

    if (options.distance) { //距离

      let pos1 = new Cesium.Cartesian3(0, options.distance, opt.distance);
      options.position = Cesium.Cartesian3.add(options.position, pos1, new Cesium.Cartesian3());
    }
    viewer.scene.camera.setView({
      destination: options.position,
      orientation: options.orientation || {
        heading: Cesium.Math.toRadians(90.0),
        pitch: Cesium.Math.toRadians(90.0),
        roll: Cesium.Math.toRadians(0.0)
      },
    });
  }
}
//相机飞行
export function flyTo (viewer,options) {

  if (viewer && options && options.position) {
    if (options.distance) { //距离
      let pos1 = new Cesium.Cartesian3(0, options.distance, options.distance);
      options.position = Cesium.Cartesian3.add(options.position, pos1, new Cesium.Cartesian3());
    }
    viewer.scene.camera.flyTo({
      destination: options.position,
      orientation: options.orientation || {
        heading: Cesium.Math.toRadians(90.0),
        pitch: Cesium.Math.toRadians(90.0),
        roll: Cesium.Math.toRadians(0.0)
      },
      // pitchAdjustHeight: 500,
      easingFunction: options.easingFunction || Cesium.EasingFunction.LINEAR_NONE,
      duration: options.duration || 3,
      complete: options.callback
    })
  }
}
//坐标转换 笛卡尔转84
export function transformCartesianToWGS84 (cartesian) {
  if (cartesian) {
    let ellipsoid = Cesium.Ellipsoid.WGS84
    let cartographic = ellipsoid.cartesianToCartographic(cartesian)
    return {
      lng: Cesium.Math.toDegrees(cartographic.longitude),
      lat: Cesium.Math.toDegrees(cartographic.latitude),
      alt: cartographic.height
    }
  }
}
//坐标数组转换 笛卡尔转84
export function transformWGS84ArrayToCartesianArray (WSG84Arr, alt) {
  if (WSG84Arr) {
    let $this = this
    return WSG84Arr
      ? WSG84Arr.map(function (item) { return transformWGS84ToCartesian(item, alt) })
      : []
  }
}
//坐标转换 84转笛卡尔
export function transformWGS84ToCartesian (position, alt) {
  return position
    ? Cesium.Cartesian3.fromDegrees(
      position.lng || position.lon,
      position.lat,
      position.alt = alt || position.alt,
      Cesium.Ellipsoid.WGS84
    )
    : Cesium.Cartesian3.ZERO
}
//坐标数组转换 84转笛卡尔
export function transformCartesianArrayToWGS84Array (cartesianArr) {
  let $this = this
  return cartesianArr
    ? cartesianArr.map(function (item) { return $this.transformCartesianToWGS84(item) })
    : []
}
/**
 * 相机绕点旋转
 * @param viewer
 *  let options = {
                    lng: 117.1423291616,
                    lat: 39.0645831633,
                    height: 15.8,
                    heading: 0.0,
                    pitch: 0.0,
                    roll: 0.0
                };
 viewer.clock.stopTime = viewer.clock.startTime
 */
export function setCameraEotateHeading(viewer,options) {
  if (options) {
    let position = Cesium.Cartesian3.fromDegrees(options.lng, options.lat, options.height);
    // 相机看点的角度，如果大于0那么则是从地底往上看，所以要为负值，这里取-30度
    let pitch = Cesium.Math.toRadians(-30);
    // 给定飞行一周所需时间，比如10s, 那么每秒转动度数
    let angle = 360 / 30;
    // 给定相机距离点多少距离飞行，这里取值为5000m
    let distance = 5000;
    let startTime = Cesium.JulianDate.fromDate(new Date());
    viewer.clock.startTime = startTime.clone();  // 开始时间
    viewer.clock.currentTime = startTime.clone(); // 当前时间
    viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式
    viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
    //相机的当前heading
    let initialHeading = viewer.camera.heading;
    let Exection = function TimeExecution() {
      // 当前已经过去的时间，单位s
      let delTime = Cesium.JulianDate.secondsDifference(viewer.clock.currentTime, viewer.clock.startTime);
      let heading = Cesium.Math.toRadians(delTime * angle) + initialHeading;
      viewer.scene.camera.setView({
        destination: position, // 点的坐标
        orientation: {
          heading: heading,
          pitch: pitch,

        }
      });
      viewer.scene.camera.moveBackward(distance);

      if (Cesium.JulianDate.compare(viewer.clock.currentTime, viewer.clock.stopTime) >= 0) {
        viewer.clock.onTick.removeEventListener(Exection);
      }
    };
    viewer.clock.onTick.addEventListener(Exection);
  }
}
/**
 *
 * @param {*} position
 * 84坐标转制图坐标
 */
export function transformWGS84ToCartographic (position) {
  return position
    ? Cesium.Cartographic.fromDegrees(
      position.lng || position.lon,
      position.lat,
      position.alt
    )
    : Cesium.Cartographic.ZERO
}
// 拾取位置点
export function getCatesian3FromPX (viewer,px) {

  if (viewer && px) {

    // let picks = this._viewer.scene.drillPick(px); // 3dtilset
    // for (let i = 0; i < picks.length; i++) {
    //     if (picks[i] instanceof Cesium.Cesium3DTileFeature) { //模型上拾取
    //         isOn3dtiles = true;
    //     }
    // }
    let picks = viewer.scene.pick(px)
    let cartesian = null;
    let isOn3dtiles = false, isOnTerrain = false;
    if (picks instanceof Cesium.Cesium3DTileFeature) { //模型上拾取
      isOn3dtiles = true;
    }
    // 3dtilset
    if (isOn3dtiles) {
      cartesian = viewer.scene.pickPosition(px);
      if (cartesian) {
        let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        if (cartographic.height < 0) cartographic.height = 0;
        let lon = Cesium.Math.toDegrees(cartographic.longitude)
          , lat = Cesium.Math.toDegrees(cartographic.latitude)
          , height = cartographic.height;//模型高度
        cartesian = this.transformWGS84ToCartesian({ lng: lon, lat: lat, alt: height })
      }
    }
    // 地形
    if (!picks && !viewer.terrainProvide instanceof Cesium.EllipsoidTerrainProvider) {
      let ray = viewer.scene.camera.getPickRay(px);
      if (!ray) return null;
      cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      isOnTerrain = true
    }
    // 地球
    if (!isOn3dtiles && !isOnTerrain) {

      cartesian = viewer.scene.camera.pickEllipsoid(px, viewer.scene.globe.ellipsoid);
    }
    if (cartesian) {
      let position = this.transformCartesianToWGS84(cartesian)
      if (position.alt < 0) {
        cartesian = this.transformWGS84ToCartesian(position, 0.1)
      }
      return cartesian;
    }
    return false;
  }

}
//获取相机位置
export function getCameraPosition (viewer) {
  if (viewer) {

    let result = viewer.scene.camera.pickEllipsoid(new Cesium.Cartesian2(viewer.canvas.clientWidth / 2, viewer.canvas
      .clientHeight / 2));
    if (result) {

      let curPosition = Cesium.Ellipsoid.WGS84.cartesianToCartographic(result),
        lon = curPosition.longitude * 180 / Math.PI
        , lat = curPosition.latitude * 180 / Math.PI;

      let direction = viewer.camera._direction,
        x = Cesium.Math.toDegrees(direction.x),
        y = Cesium.Math.toDegrees(direction.y),
        z = Cesium.Math.toDegrees(direction.z),
        height = viewer.camera.positionCartographic.height,
        heading = Cesium.Math.toDegrees(viewer.camera.heading),
        pitch = Cesium.Math.toDegrees(viewer.camera.pitch),
        roll = Cesium.Math.toDegrees(viewer.camera.roll);

      let rectangle = viewer.camera.computeViewRectangle(),
        west = rectangle.west / Math.PI * 180,
        north = rectangle.north / Math.PI * 180,
        east = rectangle.east / Math.PI * 180,
        south = rectangle.south / Math.PI * 180,
        centerx = (west + east) / 2,
        cnetery = (north + south) / 2;

      return {
        lon: lon,
        lat: lat,
        height: height,
        heading: heading,
        pitch: pitch,
        roll: roll,
        position: viewer.camera.position,
        center: { x: centerx, y: cnetery },
        direction: new Cesium.Cartesian3(x, y, z)
      };
    }
  }
}
//修改相机状态
export function updateCameraState (viewer,flag) {

  viewer.scene._screenSpaceCameraController.enableRotate = flag;
  viewer.scene._screenSpaceCameraController.enableTranslate = flag;
  viewer.scene._screenSpaceCameraController.enableZoom = flag;
  viewer.scene._screenSpaceCameraController.enableTilt = flag;
  viewer.scene._screenSpaceCameraController.enableLook = flag;
}
//鼠标事件注册
function bindHandelEvent (viewer,_mouseClickHandler, _mouseMoveHandler, _mouseDbClickHandler) {

  if (viewer) {
    let _handlers = new Cesium.ScreenSpaceEventHandler(viewer.canvas)
    _handlers.setInputAction(function (movement) {
      _mouseClickHandler && _mouseClickHandler(movement, _handlers)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    _handlers.setInputAction(function (movement) {
      _mouseMoveHandler && _mouseMoveHandler(movement, _handlers)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    _handlers.setInputAction(function (movement) {
      _mouseDbClickHandler && _mouseDbClickHandler(movement, _handlers)
    }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK)
  }
}
//获取鼠标信息
export function getHandelPosition (viewer,callback) {

  if (viewer) {
    let _handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas),
      $this = this;
    _handler.setInputAction(function (movement) {

      let cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);

      if (typeof callback === 'function') {
        callback($this.transformCartesianToWGS84(cartesian), _handler);
      }

    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  }
}
//保存当前场景png
export function saveSceneImages (viewer) {

  if (viewer) {

    function dataURLtoBlob(dataurl) {
      let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    }

    let canvas = viewer.scene.canvas;
    let image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    let link = document.createElement("a");
    let strDataURI = image.substr(22, image.length);
    let blob = dataURLtoBlob(image);
    let objurl = URL.createObjectURL(blob);
    link.download = "scene.png";
    link.href = objurl;
    link.click();
  }
}


/*export function _installBaiduImageryProvider() {

  let TEMP_MAP_URL =
    'http://api{s}.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&customid={style}'

  function BaiduImageryProvider(options) {

    TEMP_MAP_URL = options.temp_url || TEMP_MAP_URL

    this._url = TEMP_MAP_URL
    this._tileWidth = 256
    this._tileHeight = 256
    this._maximumLevel = 18
    this._minimumLevel = 1
    this._tilingScheme = new Cesium.WebMercatorTilingScheme({
      rectangleSouthwestInMeters: new Cesium.Cartesian2(-33554054, -33746824),
      rectangleNortheastInMeters: new Cesium.Cartesian2(33554054, 33746824)
    })
    this._rectangle = this._tilingScheme.rectangle
    this._credit = undefined
    this._style = options.style || 'normal'
  }

  Object.defineProperties(BaiduImageryProvider.prototype, {
    url: {
      get: function () {
        return this._url;
      }
    },
    token: {
      get: function () {
        return this._token;
      }
    },
    tileWidth: {
      get: function () {
        if (!this.ready) {
          throw new Cesium.DeveloperError(
            'tileWidth must not be called before the imagery provider is ready.'
          )
        }
        return this._tileWidth
      }
    },
    tileHeight: {
      get: function () {
        if (!this.ready) {
          throw new Cesium.DeveloperError(
            'tileHeight must not be called before the imagery provider is ready.'
          )
        }
        return this._tileHeight
      }
    },
    maximumLevel: {
      get: function () {
        if (!this.ready) {
          throw new Cesium.DeveloperError(
            'tileHeight must not be called before the imagery provider is ready.'
          )
        }
        return this._tileHeight
      }
    },
    minimumLevel: {
      get: function () {
        if (!this.ready) {
          throw new Cesium.DeveloperError(
            'minimumLevel must not be called before the imagery provider is ready.'
          )
        }
        return 0
      }
    },
    tilingScheme: {
      get: function () {
        if (!this.ready) {
          throw new Cesium.DeveloperError(
            'tilingScheme must not be called before the imagery provider is ready.'
          )
        }
        return this._tilingScheme
      }
    },

    rectangle: {
      get: function () {
        if (!this.ready) {
          throw new Cesium.DeveloperError(
            'rectangle must not be called before the imagery provider is ready.'
          )
        }
        return this._rectangle
      }
    },

    ready: {
      get: function () {
        return !!this._url
      }
    },

    credit: {
      get: function () {
        return this._credit
      }
    }
  });

  BaiduImageryProvider.prototype.getTileCredits = function (x, y, level) { }

  BaiduImageryProvider.prototype.requestImage = function (x, y, level) {
    if (!this.ready) {
      throw new Cesium.DeveloperError(
        'requestImage must not be called before the imagery provider is ready.'
      )
    }
    let xTiles = this._tilingScheme.getNumberOfXTilesAtLevel(level)
    let yTiles = this._tilingScheme.getNumberOfYTilesAtLevel(level)
    let url = this._url
      .replace('{x}', x - xTiles / 2)
      .replace('{y}', yTiles / 2 - y - 1)
      .replace('{z}', level)
      .replace('{s}', 1)
      .replace('{style}', this._style)
    return Cesium.ImageryProvider.loadImage(this, url)
  }

  Cesium.BaiduImageryProvider = BaiduImageryProvider
}*/
