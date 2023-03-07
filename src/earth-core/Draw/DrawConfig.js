import { PlottingType } from './DrawPlotting32';
const DRAWCONFIG = {
  label: {
    drawtype: 'label',
    edittype: 'label',
    name: '文字',
    style: {
      text: '文字',
      color: '#ffffff',
      opacity: 1,
      font_family: '黑体',
      font_size: 30,
      border: true,
      border_color: '#000000',
      border_width: 3,
      background: false,
      background_color: '#000000',
      background_opacity: 0.5,
      font_weight: 'normal',
      font_style: 'normal',
      scaleByDistance: false,
      scaleByDistance_far: 1000000,
      scaleByDistance_farValue: 0.1,
      scaleByDistance_near: 1000,
      scaleByDistance_nearValue: 1,
      distanceDisplayCondition: false,
      distanceDisplayCondition_far: 10000,
      distanceDisplayCondition_near: 0,
      clampToGround: false,
      visibleDepth: true
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  point: {
    drawtype: 'point',
    edittype: 'point',
    name: '点标记',
    style: {
      pixelSize: 10,
      color: '#3388ff',
      opacity: 1,
      outline: true,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      outlineWidth: 2,
      scaleByDistance: false,
      scaleByDistance_far: 1000000,
      scaleByDistance_farValue: 0.1,
      scaleByDistance_near: 1000,
      scaleByDistance_nearValue: 1,
      distanceDisplayCondition: false,
      distanceDisplayCondition_far: 10000,
      distanceDisplayCondition_near: 0,
      clampToGround: false,
      visibleDepth: true
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  billboard: {
    edittype: 'billboard',
    name: '图标点标记',
    style: {
      image: 'Assets3D/img/mark3.png',
      opacity: 1,
      scale: 1,
      rotation: 0,
      scaleByDistance: false,
      scaleByDistance_far: 1000000,
      scaleByDistance_farValue: 0.1,
      scaleByDistance_near: 1000,
      scaleByDistance_nearValue: 1,
      distanceDisplayCondition: false,
      distanceDisplayCondition_far: 10000,
      distanceDisplayCondition_near: 0
    },
    attr: { id: '', name: '', remark: '' },
    drawtype: 'billboard'
  },
  model_fireman: {
    edittype: 'model',
    name: '模型',
    style: {
      name: '模型',
      modelKind: 'model_fireman',
      modelUrl: 'Assets3D/model/fireman.glb',
      scale: 3,
      heading: 0,
      pitch: 0,
      roll: 0,
      fill: false,
      color: '#3388ff',
      opacity: 1,
      silhouette: false,
      silhouetteColor: '#ffffff',
      silhouetteSize: 2,
      silhouetteAlpha: 0.8
    },
    attr: { id: '', name: '', remark: '' },
    drawtype: 'model'
  },
  model_fireman_run: {
    edittype: 'model',
    name: '模型',
    style: {
      name: '模型',
      modelKind: 'model_fireman_run',
      modelUrl: 'Assets3D/model/fireman_run.gltf',
      scale: 3,
      heading: 0,
      pitch: 0,
      roll: 0,
      fill: false,
      color: '#3388ff',
      opacity: 1,
      silhouette: false,
      silhouetteColor: '#ffffff',
      silhouetteSize: 2,
      silhouetteAlpha: 0.8
    },
    attr: { id: '', name: '', remark: '' },
    drawtype: 'model'
  },
  model_plane: {
    drawtype: 'model',
    edittype: 'model',
    name: '模型',
    style: {
      name: '模型',
      modelKind: 'model_plane',
      modelUrl: 'Assets3D/model/plane.glb', // ,//yang 修改"SampleData/models/CesiumMilkTruck/CesiummilkTruck.glb",
      scale: 1,
      heading: 0,
      pitch: 0,
      roll: 0,
      fill: false,
      color: '#3388ff',
      opacity: 1,
      silhouette: false,
      silhouetteColor: '#ffffff',
      silhouetteSize: 2,
      silhouetteAlpha: 0.8,
      clampToGround: false
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  model_leida: {
    drawtype: 'model',
    edittype: 'model',
    name: '模型',
    style: {
      name: '模型',
      modelKind: 'model_leida',
      modelUrl: 'Assets3D/model/leida.glb',
      scale: 1,
      heading: 0,
      pitch: 0,
      roll: 0,
      fill: false,
      color: '#3388ff',
      opacity: 1,
      silhouette: false,
      silhouetteColor: '#ffffff',
      silhouetteSize: 2,
      silhouetteAlpha: 0.8,
      clampToGround: false
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  model_dynamo: {
    drawtype: 'model',
    edittype: 'model',
    name: '模型',
    style: {
      name: '模型',
      modelKind: 'model_dynamo',
      modelUrl: 'Assets3D/model/dynamo.gltf',
      scale: 1,
      heading: 0,
      pitch: 0,
      roll: 0,
      fill: false,
      color: '#3388ff',
      opacity: 1,
      silhouette: false,
      silhouetteColor: '#ffffff',
      silhouetteSize: 2,
      silhouetteAlpha: 0.8,
      clampToGround: false
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  model_tower: {
    drawtype: 'model',
    edittype: 'model',
    name: '模型',
    style: {
      name: '模型',
      modelKind: 'model_tower',
      modelUrl: 'Assets3D/model/tower.glb',
      scale: 1,
      heading: 0,
      pitch: 0,
      roll: 0,
      fill: false,
      color: '#3388ff',
      opacity: 1,
      silhouette: false,
      silhouetteColor: '#ffffff',
      silhouetteSize: 2,
      silhouetteAlpha: 0.8,
      clampToGround: false
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  model_mulou: {
    drawtype: 'model',
    edittype: 'model',
    name: '模型',
    style: {
      name: '模型',
      modelKind: 'model_mulou',
      modelUrl: 'Assets3D/model/mulou.gltf',
      scale: 1,
      heading: 0,
      pitch: 0,
      roll: 0,
      fill: false,
      color: '#3388ff',
      opacity: 1,
      silhouette: false,
      silhouetteColor: '#ffffff',
      silhouetteSize: 2,
      silhouetteAlpha: 0.8,
      clampToGround: false
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  model_car: {
    edittype: 'model',
    name: '模型',
    style: {
      name: '模型',
      modelKind: 'model_car',
      modelUrl: 'Assets3D/model/car.gltf',
      scale: 0.5,
      heading: 0,
      pitch: 0,
      roll: 0,
      fill: false,
      color: '#3388ff',
      opacity: 1,
      silhouette: false,
      silhouetteColor: '#ffffff',
      silhouetteSize: 2,
      silhouetteAlpha: 0.8
    },
    attr: { id: '', name: '', remark: '' },
    drawtype: 'model'
  },
  model: {
    edittype: 'model',
    name: '模型',
    style: {
      name: '模型',
      modelKind: 'model_car',
      modelUrl: 'Assets3D/model/car.gltf',
      scale: 0.5,
      heading: 0,
      pitch: 0,
      roll: 0,
      fill: false,
      color: '#3388ff',
      opacity: 1,
      silhouette: false,
      silhouetteColor: '#ffffff',
      silhouetteSize: 2,
      silhouetteAlpha: 0.8
    },
    attr: { id: '', name: '', remark: '' },
    drawtype: 'model'
  },
  polyline: {
    drawtype: 'polyline',
    edittype: 'polyline',
    name: '线',
    config: {
      minPointNum: 2
    },
    style: {
      name: '线',
      lineType: 'solid', //solid dash glow arrow animation polylineCityLink 移除fillType，仅用lineType
      animationDuration: 2000,
      animationImage: 'Assets3D/Textures/lineClr.png',
      color: '#3388ff',
      width: 4,
      clampToGround: !false,
      outline: false,
      outlineColor: '#ffffff',
      outlineWidth: 20,
      opacity: 1,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  curve: {
    edittype: 'polyline',
    name: '曲线',
    config: { minPointNum: 2, height: true },
    style: {
      name: '曲线',
      lineType: 'solid',
      color: '#ffff00',
      animationImage: 'Assets3D/Textures/lineClr.png',
      width: 4,
      clampToGround: !false,
      outline: false,
      outlineColor: '#ffffff',
      outlineWidth: 2,
      opacity: 1,
      zIndex: 0
    },
    attr: { id: '', name: '', remark: '' },
    drawtype: 'curve'
  },
  curve_clampToGround: {
    edittype: 'polyline',
    name: '贴地曲线',
    config: { minPointNum: 2, height: true },
    style: {
      name: '贴地曲线',
      lineType: 'solid',
      color: '#ffff00',
      width: 4,
      clampToGround: true,
      outline: false,
      outlineColor: '#ffffff',
      outlineWidth: 2,
      opacity: 1,
      zIndex: 0
    },
    attr: { id: '', name: '', remark: '' },
    drawtype: 'curve'
  },
  animationLine: {
    drawtype: 'polyline',
    edittype: 'polyline',
    name: '流动线',
    config: {
      minPointNum: 2
    },
    style: {
      name: '流动线',
      lineType: 'animation',
      animationDuration: 2000,
      animationImage: 'img/lineClr2.png',
      width: 10,
      clampToGround: false,
      outline: false,
      outlineColor: '#ffffff',
      outlineWidth: 20,
      opacity: 1,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  polylineVolume: {
    drawtype: 'polyline',
    edittype: 'polylineVolume',
    name: '管道线',
    config: {
      minPointNum: 2
    },
    style: {
      name: '管道线',
      color: '#00FF00',
      radius: 10,
      shape: 'pipeline',
      outline: false,
      outlineColor: '#ffffff',
      opacity: 1
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  corridor: {
    drawtype: 'corridor',
    edittype: 'corridor',
    name: '走廊',
    config: {
      height: false,
      minPointNum: 2
    },
    style: {
      name: '走廊',
      height: 0,
      width: 500,
      cornerType: 'ROUNDED',
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      color: '#3388ff',
      opacity: 0.6,
      clampToGround: false,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  extrudedCorridor: {
    drawtype: 'corridor',
    edittype: 'extrudedCorridor',
    name: '拉伸走廊',
    config: {
      height: false,
      minPointNum: 2
    },
    style: {
      name: '拉伸走廊',
      height: 0,
      extrudedHeight: 40,
      width: 500,
      cornerType: 'ROUNDED',
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      color: '#00FF00',
      opacity: 0.6,
      clampToGround: false,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  polygon: {
    drawtype: 'polygon',
    edittype: 'polygon',
    name: '面',
    style: {
      name: '面',
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#3388ff',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 2,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      clampToGround: !false,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  polygon_clampToGround: {
    drawtype: 'polygon',
    edittype: 'polygon',
    name: '贴地面',
    config: {
      height: false
    },
    style: {
      name: '贴地面',
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#ffff00',
      opacity: 0.6,
      stRotation: 0,
      clampToGround: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  extrudedPolygon: {
    drawtype: 'polygon',
    edittype: 'polygon',
    name: '拉伸面',
    style: {
      name: '拉伸面',
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#00FF00',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      extrudedHeight: 100,
      perPositionHeight: true,
      zIndex: 0,
      clampToGround: false
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  rectangle: {
    drawtype: 'rectangle',
    edittype: 'rectangle',
    name: '矩形',
    config: {
      height: false,
      minPointNum: 2,
      maxPointNum: 2
    },
    style: {
      name: '矩形',
      height: 0,
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#3388ff',
      opacity: 0.6,
      outline: true,
      outlineWidth: 2,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      rotation: 0,
      stRotation: 0,
      clampToGround: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  rectangle_clampToGround: {
    drawtype: 'rectangle',
    edittype: 'rectangle',
    name: '贴地矩形',
    config: {
      height: false,
      minPointNum: 2,
      maxPointNum: 2
    },
    style: {
      name: '贴地矩形',
      height: 0,
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#3388ff',
      opacity: 0.6,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      rotation: 0,
      stRotation: 0,
      clampToGround: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  rectangleImg: {
    drawtype: 'rectangle',
    edittype: 'rectangleImg',
    name: '图片矩形',
    config: {
      height: false,
      minPointNum: 2,
      maxPointNum: 2
    },
    style: {
      name: '图片矩形',
      image: require('../Assets/img/shine.jpg'),
      opacity: 1,
      rotation: 0,
      clampToGround: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  extrudedRectangle: {
    drawtype: 'rectangle',
    edittype: 'extrudedRectangle',
    name: '拉伸矩形',
    config: {
      height: false,
      minPointNum: 2,
      maxPointNum: 2
    },
    style: {
      name: '拉伸矩形',
      extrudedHeight: 40,
      clampToGround: false,
      height: 0,
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#00FF00',
      opacity: 0.6,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      rotation: 0,
      stRotation: 0,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  circle: {
    drawtype: 'circle',
    edittype: 'circle',
    name: '圆',
    config: {
      height: false
    },
    style: {
      name: '圆',
      radius: 200,
      height: 0,
      fill: true,
      fillType: 'color',
      //fillType: 'animationCircle',
      speed: 1,
      animationDuration: 1, //其实是速度
      animationCount: 1,
      animationGradient: 0.1,
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#3388ff',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 2,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      rotation: 0,
      clampToGround: !false,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  circle_clampToGround: {
    drawtype: 'circle',
    edittype: 'circle',
    name: '贴地圆',
    config: {
      height: false
    },
    style: {
      name: '贴地圆',
      radius: 200,
      fillType: 'color',
      animationDuration: 2000,
      animationCount: 1,
      animationGradient: 0.1,
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#ffff00',
      opacity: 0.6,
      stRotation: 0,
      rotation: 0,
      clampToGround: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  extrudedCircle: {
    drawtype: 'circle',
    edittype: 'extrudedCircle',
    name: '圆柱体',
    config: {
      height: false
    },
    style: {
      name: '圆柱体',
      radius: 200,
      extrudedHeight: 200,
      clampToGround: false,
      height: 0,
      fill: true,
      fillType: 'color',
      animationDuration: 2000,
      animationCount: 1,
      animationGradient: 0.1,
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#00FF00',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      rotation: 0,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  ellipse: {
    drawtype: 'ellipse',
    edittype: 'ellipse',
    name: '椭圆',
    config: {
      height: false
    },
    style: {
      name: '椭圆',
      semiMinorAxis: 200,
      semiMajorAxis: 200,
      height: 0,
      fill: true,
      //fillType: 'circleWave',
      fillType: 'color',
      animationDuration: 2000,
      animationCount: 1,
      animationGradient: 0.1,
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#3388ff',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 2,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      rotation: 0,
      clampToGround: !false,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  ellipse_clampToGround: {
    drawtype: 'ellipse',
    edittype: 'ellipse',
    name: '贴地椭圆',
    config: {
      height: false
    },
    style: {
      name: '贴地椭圆',
      semiMinorAxis: 200,
      semiMajorAxis: 200,
      fillType: 'color',
      animationDuration: 2000,
      animationCount: 1,
      animationGradient: 0.1,
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#ffff00',
      opacity: 0.6,
      stRotation: 0,
      rotation: 0,
      clampToGround: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  extrudedEllipse: {
    drawtype: 'ellipse',
    edittype: 'extrudedEllipse',
    name: '椭圆柱体',
    config: {
      height: false
    },
    style: {
      name: '椭圆柱体',
      semiMinorAxis: 200,
      semiMajorAxis: 200,
      extrudedHeight: 200,
      clampToGround: false,
      height: 0,
      fill: true,
      fillType: 'color',
      animationDuration: 2000,
      animationCount: 1,
      animationGradient: 0.1,
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#00FF00',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      rotation: 0,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  ellipsoid: {
    drawtype: 'ellipsoid',
    edittype: 'ellipsoid',
    name: '球体',
    style: {
      name: '球体',
      extentRadii: 200,
      widthRadii: 200,
      heightRadii: 200,
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#00FF00',
      opacity: 0.6,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  wall: {
    drawtype: 'wall',
    edittype: 'wall',
    name: '墙体',
    config: {
      minPointNum: 2
    },
    style: {
      name: '墙体',
      extrudedHeight: 40,
      fill: true,
      // fillType: 'breathGradualWall',
      //fillType: 'dynamicGradualWall',
      fillType: 'color',
      materialImgUrl: 'Assets3D/Textures/jsx2.png',
      freely: 'horrizontal',
      animationDuration: 2000,
      animationImage: 'img/textures/fence.png',
      animationRepeatX: 1,
      animationAxisY: false,
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#00FF00',
      opacity: 0.6,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  //还未测试DrawCylinder74.js
  cylinder: {
    drawtype: 'cylinder',
    edittype: 'cylinder',
    name: 'cylinder 圆锥',
    config: {
      minPointNum: 2, //？？怎么绘制
      maxPointNum: 2,
      name: 'cylinder 圆锥'
    },
    style: {
      name: '拉伸矩形',
      extrudedHeight: 40,
      height: 0,
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#00FF00',
      opacity: 0.6,
      outline: true,
      outlineWidth: 1,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      rotation: 0,
      stRotation: 0,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  },
  plotting: {
    name: '箭头',
    drawtype: 'plotting',
    edittype: 'plotting',
    style: {
      name: '箭头',
      // extrudedHeight: 200,
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#3388ff',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 2,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      clampToGround: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: '',
      isPlotting: true,
      plottingType: PlottingType.FINE_ARROW
    }
  },
  plotting1: {
    name: '箭头',
    drawtype: 'plotting',
    edittype: 'plotting',
    style: {
      name: '箭头',
      // extrudedHeight: 200,
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#3388ff',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 2,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      clampToGround: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: '',
      isPlotting: true,
      plottingType: PlottingType.ATTACK_ARROW_PW
    }
  },
  plotting2: {
    name: '箭头',
    drawtype: 'plotting',
    edittype: 'plotting',
    style: {
      name: '箭头',
      // extrudedHeight: 200,
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#3388ff',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 2,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      clampToGround: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: '',
      isPlotting: true,
      plottingType: PlottingType.DOUBLE_ARROW
    }
  },
  plotting3: {
    name: '箭头',
    drawtype: 'plotting',
    edittype: 'plotting',
    style: {
      name: '箭头',
      // extrudedHeight: 200,
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#3388ff',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 2,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      clampToGround: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: '',
      isPlotting: true,
      plottingType: PlottingType.CLOSED_CURVE
    }
  },
  plotting4: {
    name: '箭头',
    drawtype: 'plotting',
    edittype: 'plotting',
    style: {
      name: '箭头',
      // extrudedHeight: 200,
      fill: true,
      fillType: 'color',
      grid_lineCount: 8,
      grid_lineThickness: 2,
      grid_cellAlpha: 0.1,
      stripe_oddcolor: '#ffffff',
      stripe_repeat: 6,
      checkerboard_oddcolor: '#ffffff',
      checkerboard_repeat: 4,
      color: '#3388ff',
      opacity: 0.6,
      stRotation: 0,
      outline: true,
      outlineWidth: 2,
      outlineColor: '#ffffff',
      outlineOpacity: 0.6,
      clampToGround: true,
      zIndex: 0
    },
    attr: {
      id: '',
      name: '',
      remark: '',
      isPlotting: true,
      plottingType: PlottingType.GATHERING_PLACE
    }
  },
  cloud: {
    drawtype: 'cloud',
    edittype: 'cloud',
    name: '云朵',
    style: {
      name: '云朵'
    },
    attr: {
      id: '',
      name: '',
      remark: ''
    }
  }
};

export default DRAWCONFIG;
