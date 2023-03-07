const N = null;
let defaultOptions = {
  circle: true,
  curve: true,
  ellipse: true,
  ellipsoid: true,
  extrudedCircle: true,
  extrudedEllipse: true,
  extrudedPolygon: true,
  extrudedRectangle: true,
  billboard: true,
  label: true,
  model: true,
  point: true,
  line: true,
  polygon: true,
  polyline: true,
  rectangle: true,
  rectangleImg: true,
  wall: true
};
function getToolOptions(options) {
  return [
    {
      key: 'planeOf2D',
      img: 'two-dimension-plane',
      name: '二维平面类',
      hidden: !options.planeOf2D,
      children: [
        {
          name: '直线',
          img: 'polyline',
          key: 'polyline',
          hidden: !options.line
        },
        {
          name: '曲线',
          img: 'curve',
          key: 'curve',
          hidden: !options.curve
        },
        {
          name: '面',
          img: 'polygon',
          key: 'polygon',
          hidden: !options.polygon
        },
        {
          name: '矩形',
          img: 'rectangle',
          key: 'rectangle',
          hidden: !options.rectangle
        },
        {
          name: '矩形图片',
          img: 'rectangle-img',
          key: 'rectangleImg',
          hidden: !options.rectangleImg
        },
        {
          name: '圆',
          img: 'circle',
          key: 'circle',
          hidden: !options.circle
        },
        {
          name: '椭圆',
          img: 'ellipse',
          key: 'ellipse',
          hidden: !options.ellipse
        }
      ]
    },
    {
      key: 'volumeOf3D',
      img: 'three-dimension-volume',
      name: '三维立体类',
      hidden: !options.volumeOf3D,
      children: [
        {
          name: '多边立体',
          img: 'extruded-polygon',
          key: 'extrudedPolygon',
          hidden: !options.extrudedPolygon
        },
        {
          name: '拉伸矩形',
          img: 'extruded-rectangle',
          key: 'extrudedRectangle',
          hidden: !options.extrudedRectangle
        },
        {
          name: '圆柱体',
          img: 'cylinder',
          key: 'extrudedCircle',
          hidden: !options.extrudedCircle
        },
        {
          name: '椭圆柱',
          img: 'elliptical-cylinder',
          key: 'extrudedEllipse',
          hidden: !options.extrudedEllipse
        },
        {
          name: '椭球',
          img: 'ellipsoid',
          key: 'ellipsoid',
          hidden: !options.ellipsoid
        },
        {
          name: '墙',
          img: 'wall',
          key: 'wall',
          hidden: !options.wall
        }
      ]
    },
    {
      key: 'point&text',
      img: 'point-and-text',
      name: '点类',
      children: [
        {
          name: '箭头',
          img: 'point',
          key: 'plotting',
          hidden: !options.point
        },
        {
          name: '攻击箭头',
          img: 'point',
          key: 'plotting1',
          hidden: !options.point
        },
        {
          name: '钳击箭头',
          img: 'point',
          key: 'plotting2',
          hidden: !options.point
        },
        {
          name: '闭合曲面',
          img: 'point',
          key: 'plotting3',
          hidden: !options.point
        },
        {
          name: '集结地',
          img: 'point',
          key: 'plotting4',
          hidden: !options.point
        },
        {
          name: '点',
          img: 'point',
          key: 'point',
          hidden: !options.point
        },
        {
          name: '模型',
          img: 'model',
          key: 'model',
          hidden: !options.model
        },
        {
          name: '云朵',
          img: 'cloud',
          key: 'cloud',
          hidden: !options.point
        }
      ]
    },
    {
      key: 'remove', // 删除所有绘制要素
      img: 'delete',
      name: '删除所有'
    },
    {
      key: 'edit', // 编辑的开关
      img: 'edit',
      name: '编辑'
    },
    {
      key: 'load', // 从服务器加载绘制要素
      img: 'load',
      name: '加载'
    },
    {
      key: 'save', // 保存所有绘制要素
      img: 'save',
      name: '保存'
    }
  ];
}
function c(
  label,
  value,
  type,
  labelWidth,
  className,
  span,
  min,
  max,
  disabled,
  list
) {
  //筛选固定的、复用性的记录栏
  if (arguments.length === 1) {
    switch (label) {
      case '图形操作': {
        return c('图形操作', 'btnRow', 'btnRow', N, 'nopadding', 24, N, N, N, [
          { name: '删除', value: 'remove' },
          { name: '定位', value: 'location' }
        ]);
      }
      case '图形备注': {
        return c('图形备注', 'remark', 'textarea', N, 'heightAuto');
      }
      case '图形名称': {
        return c('图形名称', 'name', 'input', N, N, N, N, N, false);
      }
      case '层级顺序': {
        return c('层级顺序', 'zIndex', 'inputNumber', N, N, N, -1000);
      }
      case '填充颜色': {
        return c('填充颜色', 'color', 'ColorPicker');
      }
      case '填充透明': {
        return c('填充透明', 'opacity', 'slider');
      }
    }
  }
  return {
    label,
    value,
    type,
    labelWidth,
    className,
    span,
    min,
    max,
    disabled,
    list
  };
}
const FormLists = {
  polyline: [
    c('图形类型', 'featureType', 'input'),
    c('线条宽度', 'width', 'inputNumber'),
    c('线条类型', 'lineType', 'select', N, N, N, N, N, N, [
      { key: '实线', value: 'solid' },
      { key: '虚线', value: 'dash' },
      { key: '衬色线', value: 'outline' },
      { key: '发光线', value: 'glow' },
      { key: '箭头线', value: 'arrow' },
      { key: '流动线', value: 'animation' },
      { key: '轨迹线', value: 'polylineCityLink' }
    ]),
    c('图形透明', 'opacity', 'slider'),
    c('是否贴地', 'clampToGround', 'switch'),
    c('层级顺序')
  ],
  circle: [
    c('图形类型', 'featureType', 'input'),
    c('半径', 'radius', 'inputNumber'),
    c('是否贴地', 'clampToGround', 'switch'),
    c('是否填充', 'fillJudge', 'switch'),
    c('填充材质', 'fillType', 'select', N, N, N, N, N, N, [
      { key: '纯色', value: 'color' },
      { key: '图片', value: 'image' },
      { key: '网格', value: 'grid' },
      { key: '条纹', value: 'stripe' },
      { key: '棋盘', value: 'checkerboard' },
      { key: '扩散圆', value: 'animationCircle' },
      { key: '波纹圆', value: 'circleWave' },
      { key: '纹理圆', value: 'zoomCircle' }
    ]),
    c('是否边框', 'outlineJudge', 'switch'),
    c('边框宽度', 'outlineWidth', 'inputNumber', N, N, N, 1),
    c('边框颜色', 'outlineColor', 'ColorPicker'),
    c('边框透明', 'outlineOpacity', 'slider'),
    c('层级顺序')
  ],
  extrudedCircle: [
    c('图形类型', 'featureType', 'input'),
    c('半径', 'radius', 'inputNumber'),
    c('高度', 'extrudedHeight', 'inputNumber'),
    c('高程', 'height', 'inputNumber'),
    c('是否填充', 'fillJudge', 'switch'),
    c('填充材质', 'fillType', 'select', N, N, N, N, N, N, [
      { key: '纯色', value: 'color' },
      { key: '图片', value: 'image' },
      { key: '网格', value: 'grid' },
      { key: '条纹', value: 'stripe' },
      { key: '棋盘', value: 'checkerboard' },
      { key: '流动线', value: 'animation' },
      { key: '轨迹线', value: 'polylineCityLink' },
      { key: '渐变呼吸', value: 'breathGradualWall' }
    ]),
    c('是否边框', 'outlineJudge', 'switch'),
    c('边框颜色', 'outlineColor', 'ColorPicker'),
    c('边框透明', 'outlineOpacity', 'slider'),
    c('旋转角度', 'rotation', 'inputNumber', N, N, N, -1080),
    c('层级顺序')
  ],
  extrudedEllipse: [
    c('图形类型', 'featureType', 'input'),
    c('短半径', 'semiMinorAxis', 'inputNumber'),
    c('长半径', 'semiMajorAxis', 'inputNumber'),
    c('高度', 'extrudedHeight', 'inputNumber'),
    c('高程', 'height', 'inputNumber'),
    c('是否填充', 'fillJudge', 'switch'),
    c('填充材质', 'fillType', 'select', N, N, N, N, N, N, [
      { key: '纯色', value: 'color' },
      { key: '图片', value: 'image' },
      { key: '网格', value: 'grid' },
      { key: '条纹', value: 'stripe' },
      { key: '棋盘', value: 'checkerboard' },
      { key: '流动线', value: 'animation' },
      { key: '轨迹线', value: 'polylineCityLink' },
      { key: '渐变呼吸', value: 'breathGradualWall' }
      //{ key: '文本', value: 'fillType_text' },
      /* { key: '水面', value: 'water' },
      { key: '蓝光水面', value: 'blueWater' } */
    ]),
    c('是否边框', 'outlineJudge', 'switch'),
    c('边框颜色', 'outlineColor', 'ColorPicker'),
    c('边框透明', 'outlineOpacity', 'slider'),
    c('旋转角度', 'rotation', 'inputNumber', N, N, N, -1080),
    c('层级顺序')
  ],
  ellipse: [
    c('图形类型', 'featureType', 'input'),
    c('短半径', 'semiMinorAxis', 'inputNumber'),
    c('长半径', 'semiMajorAxis', 'inputNumber'),
    c('是否贴地', 'clampToGround', 'switch'),
    c('是否填充', 'fillJudge', 'switch'),
    c('填充材质', 'fillType', 'select', N, N, N, N, N, N, [
      { key: '纯色', value: 'color' },
      { key: '图片', value: 'image' },
      { key: '网格', value: 'grid' },
      { key: '条纹', value: 'stripe' },
      { key: '棋盘', value: 'checkerboard' },
      { key: '流动线', value: 'animation' },
      { key: '轨迹线', value: 'polylineCityLink' },
      { key: '渐变呼吸', value: 'breathGradualWall' }
    ]),
    c('是否边框', 'outlineJudge', 'switch'),
    c('边框宽度', 'outlineWidth', 'inputNumber', N, N, N, 1),
    c('边框颜色', 'outlineColor', 'ColorPicker'),
    c('边框透明', 'outlineOpacity', 'slider'),
    c('旋转角度', 'rotation', 'inputNumber', N, N, N, -1080),
    c('层级顺序')
  ],
  polygon: [
    c('图形类型', 'featureType', 'input'),
    c('是否贴地', 'clampToGround', 'switch'),
    c('是否填充', 'fillJudge', 'switch'),
    c('填充材质', 'fillType', 'select', N, N, N, N, N, N, [
      { key: '纯色', value: 'color' },
      { key: '图片', value: 'image' },
      { key: '网格', value: 'grid' },
      { key: '条纹', value: 'stripe' },
      { key: '棋盘', value: 'checkerboard' },
      { key: '文本', value: 'text' },
      { key: '流动线', value: 'animation' },
      { key: '轨迹线', value: 'polylineCityLink' },
      { key: '渐变呼吸', value: 'breathGradualWall' },
      { key: '扩散圆', value: 'animationCircle' },
      { key: '波纹圆', value: 'circleWave' }
      //{ key: '文本', value: 'fillType_text' },
      /* { key: '水面', value: 'water' },
      { key: '蓝光水面', value: 'blueWater' } */
    ]),
    c('是否边框', 'outlineJudge', 'switch'),
    c('边框宽度', 'outlineWidth', 'inputNumber', N, N, N, 1),
    c('边框颜色', 'outlineColor', 'ColorPicker'),
    c('边框透明', 'outlineOpacity', 'slider'),
    c('层级顺序')
  ],
  extrudedPolygon: [
    c('图形类型', 'featureType', 'input'),
    c('是否填充', 'fillJudge', 'switch'),
    c('填充材质', 'fillType', 'select', N, N, N, N, N, N, [
      { key: '纯色', value: 'color' },
      { key: '图片', value: 'image' },
      { key: '网格', value: 'grid' },
      { key: '条纹', value: 'stripe' },
      { key: '棋盘', value: 'checkerboard' },
      { key: '流动线', value: 'animation' },
      { key: '轨迹线', value: 'polylineCityLink' },
      { key: '渐变呼吸', value: 'breathGradualWall' }
    ]),
    c('是否边框', 'outlineJudge', 'switch'),
    c('边框颜色', 'outlineColor', 'ColorPicker'),
    c('边框透明', 'outlineOpacity', 'slider'),
    c('高度', 'extrudedHeight', 'inputNumber'),
    c('层级顺序')
  ],
  rectangle: [
    c('图形类型', 'featureType', 'input'),
    c('是否贴地', 'clampToGround', 'switch'),
    c('是否填充', 'fillJudge', 'switch'),
    c('填充材质', 'fillType', 'select', N, N, N, N, N, N, [
      { key: '纯色', value: 'color' },
      { key: '图片', value: 'image' },
      { key: '网格', value: 'grid' },
      { key: '条纹', value: 'stripe' },
      { key: '棋盘', value: 'checkerboard' },
      { key: '流动线', value: 'animation' },
      { key: '轨迹线', value: 'polylineCityLink' },
      { key: '渐变呼吸', value: 'breathGradualWall' }
    ]),
    c('是否边框', 'outlineJudge', 'switch'),
    c('边框宽度', 'outlineWidth', 'inputNumber', N, N, N, 1),
    c('边框颜色', 'outlineColor', 'ColorPicker'),
    c('边框透明', 'outlineOpacity', 'slider'),
    c('旋转角度', 'rotation', 'inputNumber', N, N, N, -1080),
    c('层级顺序')
  ],
  rectangleImg: [
    c('图形类型', 'featureType', 'input'),
    c('图片', 'picUrl', 'input'),
    c('填充透明'),
    c('旋转角度', 'rotation', 'inputNumber', N, N, N, -1080),
    c('纵向重复', 'repeatX', 'inputNumber', N, N, N, 1, 1000),
    c('横向重复', 'repeatY', 'inputNumber', N, N, N, 1, 1000),
    c('层级顺序')
  ],
  extrudedRectangle: [
    c('图形类型', 'featureType', 'input'),
    c('高度', 'extrudedHeight', 'inputNumber'),
    c('高程', 'height', 'inputNumber'),
    c('是否填充', 'fillJudge', 'switch'),
    c('填充材质', 'fillType', 'select', N, N, N, N, N, N, [
      { key: '纯色', value: 'color' },
      { key: '图片', value: 'image' },
      { key: '网格', value: 'grid' },
      { key: '条纹', value: 'stripe' },
      { key: '棋盘', value: 'checkerboard' },
      { key: '流动线', value: 'animation' },
      { key: '轨迹线', value: 'polylineCityLink' },
      { key: '渐变呼吸', value: 'breathGradualWall' }
    ]),
    c('是否边框', 'outlineJudge', 'switch'),
    c('边框颜色', 'outlineColor', 'ColorPicker', N, 'nopadding inMiddle'),
    c('边框透明', 'outlineOpacity', 'slider'),
    c('旋转角度', 'rotation', 'inputNumber', N, N, N, -1080),
    c('层级顺序')
  ],
  wall: [
    c('图形类型', 'featureType', 'input'),
    c('墙高', 'wallHeight', 'inputNumber'),
    c('是否填充', 'fillJudge', 'switch'),
    c('填充材质', 'fillType', 'select', N, N, N, N, N, N, [
      { key: '纯色', value: 'color' },
      { key: '走马灯', value: 'dynamicGradualWall' },
      { key: '图片', value: 'image' },
      { key: '网格', value: 'grid' },
      { key: '条纹', value: 'stripe' },
      { key: '棋盘', value: 'checkerboard' },
      { key: '轨迹线', value: 'polylineCityLink' },
      { key: '渐变呼吸', value: 'breathGradualWall' },
      { key: '扩散圆', value: 'animationCircle' },
      { key: '波纹圆', value: 'circleWave' }
    ]),
    c('是否边框', 'outlineJudge', 'switch'),
    c('边框颜色', 'outlineColor', 'ColorPicker'),
    c('边框透明', 'outlineOpacity', 'slider', '80px')
  ],
  ellipsoid: [
    c('图形类型', 'featureType', 'input'),
    c('长半径', 'extentRadii', 'inputNumber'),
    c('宽半径', 'widthRadii', 'inputNumber'),
    c('高半径', 'heightRadii', 'inputNumber'),
    c('是否填充', 'fillJudge', 'switch'),
    c('填充材质', 'fillType', 'select', N, N, N, N, N, N, [
      { key: '纯色', value: 'color' },
      { key: '图片', value: 'image' },
      { key: '网格', value: 'grid' },
      { key: '条纹', value: 'stripe' },
      { key: '棋盘', value: 'checkerboard' },
      { key: '流动线', value: 'animation' },
      { key: '轨迹线', value: 'polylineCityLink' },
      { key: '渐变呼吸', value: 'breathGradualWall' },
      { key: '扩散圆', value: 'animationCircle' },
      { key: '波纹圆', value: 'circleWave' }
      //{ key: '文本', value: 'fillType_text' },
      /* { key: '水面', value: 'water' },
      { key: '蓝光水面', value: 'blueWater' } */
    ]),
    /* c('填充颜色'),
    c('填充透明'), */
    c('是否边框', 'outlineJudge', 'switch'),
    c('边框颜色', 'outlineColor', 'ColorPicker'),
    c('边框透明', 'outlineOpacity', 'slider', '80px')
  ],
  billboard: [
    c('图形类型', 'featureType', 'select', N, N, N, N, N, N, [
      { key: '图标', value: 'billboard' },
      { key: '文字', value: 'label' },
      { key: '点', value: 'point' }
    ]),
    c('图标库', 'icon', 'imageGallery', N, 'imageColumn'),
    c('填充透明', 'opacity', 'slider'),
    c('大小比例', 'scale', 'inputNumber', N, N, N, 0.01),
    c('旋转角度', 'rotation', 'inputNumber', N, N, N, -1080),
    c('视距缩放', 'scaleByDistance', 'switch'),
    c('上限', 'scaleByDistance_far', 'inputNumber'),
    c('比例值', 'scaleByDistance_farValue', 'inputNumber', N, N, N, 0.01),
    c('下限', 'scaleByDistance_near', 'inputNumber'),
    c('比例值', 'scaleByDistance_nearValue', 'inputNumber'),
    c('视距显示', 'distanceDisplayCondition', 'switch'),
    c('最大距离', 'distanceDisplayCondition_far', 'inputNumber'),
    c('最小距离', 'distanceDisplayCondition_near', 'inputNumber')
  ],
  point: [
    c('图形类型', 'featureType', 'select', N, N, N, N, N, N, [
      { key: '图标', value: 'billboard' },
      { key: '文字', value: 'label' },
      { key: '点', value: 'point' }
    ]),
    c('像素大小', 'pixelSize', 'inputNumber', N, N, N, 1, 99),
    c('填充颜色'),
    c('填充透明', 'opacity', 'slider'),
    c('是否边框', 'outlineJudge', 'switch'),
    c('边框颜色', 'outlineColor', 'ColorPicker'),
    c('边框透明', 'outlineOpacity', 'slider'),
    c('边框宽度', 'outlineWidth', 'inputNumber', N, N, N, 1),
    c('视距缩放', 'scaleByDistance', 'switch'),
    c('上限', 'scaleByDistance_far', 'inputNumber'),
    c('比例值', 'scaleByDistance_farValue', 'inputNumber', N, N, N, 0.01),
    c('下限', 'scaleByDistance_near', 'inputNumber'),
    c('比例值', 'scaleByDistance_nearValue', 'inputNumber'),
    c('视距显示', 'distanceDisplayCondition', 'switch'),
    c('最大距离', 'distanceDisplayCondition_far', 'inputNumber'),
    c('最小距离', 'distanceDisplayCondition_near', 'inputNumber')
  ],
  label: [
    c('图形类型', 'featureType', 'select', N, N, N, N, N, N, [
      { key: '图标', value: 'billboard' },
      { key: '文字', value: 'label' },
      { key: '点', value: 'point' }
    ]),
    c('内容', 'text', 'input', N, N, N, N, N, false),
    c('填充颜色'),
    c('图形透明', 'opacity', 'slider'),
    c('字体', 'font_family', 'select', N, N, N, N, N, N, [
      { key: '微软雅黑', value: '微软雅黑' },
      { key: '宋体', value: '宋体' },
      { key: '楷体', value: '楷体' },
      { key: '隶书', value: '隶书' },
      { key: '黑体', value: '黑体' }
    ]),
    c('字体大小', 'font_size', 'inputNumber', N, N, N, 1, 999),
    c('是否衬色', 'border', 'switch'),
    c('衬色颜色', 'outlineColor', 'ColorPicker'),
    c('衬色宽度', 'outlineWidth', 'inputNumber', N, N, N, 0, 6),
    c('是否背景', 'background', 'switch'),
    c('背景颜色', 'background_color', 'ColorPicker'),
    c('背景透明', 'background_opacity', 'slider', N, N, N, 1, 100),
    c('是否加粗', 'bold', 'switch'),
    c('是否斜体', 'italic', 'switch'),
    c('视距缩放', 'scaleByDistance', 'switch'),
    c('上限', 'scaleByDistance_far', 'inputNumber'),
    c('比例值', 'scaleByDistance_farValue', 'inputNumber', N, N, N, 0.01),
    c('下限', 'scaleByDistance_near', 'inputNumber'),
    c('比例值', 'scaleByDistance_nearValue', 'inputNumber'),
    c('视距显示', 'distanceDisplayCondition', 'switch'),
    c('最大距离', 'distanceDisplayCondition_far', 'inputNumber'),
    c('最小距离', 'distanceDisplayCondition_near', 'inputNumber')
  ],
  cloud: [
    c('图形类型', 'featureType', 'input'),
    c('横向比例', 'scaleX', 'inputNumber'),
    c('纵向比例', 'scaleY', 'inputNumber'),
    c('X轴尺寸', 'maximumSizeX', 'inputNumber'),
    c('Y轴尺寸', 'maximumSizeY', 'inputNumber'),
    c('Z轴尺寸', 'maximumSizeZ', 'inputNumber'),
    c('切片', 'slice', 'inputNumber', N, N, N, 0.01, 1),
    c('亮度', 'brightness', 'inputNumber', N, N, N, 0.01, 1)
  ],
  model: [
    c('图形类型', 'featureType', 'input'),
    c('模型种类', 'modelKind', 'select', N, N, N, N, N, N, [
      { key: '小汽车', value: 'model_car' },
      { key: '飞机', value: 'model_plane' },
      { key: '雷达站', value: 'model_leida' },
      { key: '风力发电机', value: 'model_dynamo' },
      { key: '木楼', value: 'model_mulou' },
      { key: '消防员', value: 'model_fireman' },
      { key: '奔跑的消防员', value: 'model_fireman_run' }
    ]),
    c('模型路径', 'modelUrl', 'input'),
    c('模型比例', 'scale', 'inputNumber', N, N, N, 0.01),
    c('方向角', 'heading', 'inputNumber', N, N, N, -1080),
    c('俯仰角', 'pitch', 'inputNumber', N, N, N, -1080),
    c('翻滚角', 'roll', 'inputNumber', N, N, N, -1080),
    c('图形透明', 'opacity', 'slider'),
    c('是否轮廓', 'silhouette', 'switch'),
    c('轮廓颜色', 'silhouetteColor', 'ColorPicker'),
    c('轮廓宽度', 'silhouetteSize', 'inputNumber'),
    c('轮廓透明', 'silhouetteAlpha', 'slider')
  ]
};
Object.entries(FormLists).forEach(([, value]) => {
  value.push(c('图形名称'), c('图形备注'), c('图形操作'));
});
const materialObjs = {
  color: [c('填充颜色'), c('填充透明')],
  image: [
    c('图片', 'picUrl', 'input'),
    c('填充透明'),
    c('纵向重复', 'repeatX', 'inputNumber', N, N, N, 1, 1000),
    c('横向重复', 'repeatY', 'inputNumber', N, N, N, 1, 1000)
  ],
  grid: [
    c('格线颜色', 'color', 'ColorPicker'),
    c('填充透明'),
    c('格线数量', 'grid_lineCount', 'inputNumber', N, N, N, 2),
    c('格线宽度', 'grid_lineThickness', 'inputNumber', N, N, N, 1, 200)
  ],
  stripe: [
    c('条纹主色', 'color', 'ColorPicker'),
    c('条纹衬色', 'oddColor', 'ColorPicker'),
    c('条纹数量', 'stripe_repeat', 'inputNumber')
  ],
  checkerboard: [
    c('棋盘主色', 'color', 'ColorPicker'),
    c('棋盘衬色', 'oddColor', 'ColorPicker'),
    c('棋格数量', 'checkerboard_repeat', 'inputNumber')
  ],
  breathGradualWall: [
    c('渐变颜色', 'color', 'ColorPicker'),
    c('呼吸速度', 'speed', 'inputNumber', N, N, N, 0, 10)
  ],
  dynamicGradualWall: [
    c('灯光颜色', 'color', 'ColorPicker'),
    c('是否纵向', 'vertical', 'switch'),
    c('灯光速度', 'dynamicGradual_speed', 'inputNumber', N, N, N, 0, 10)
  ],
  animationCircle: [
    c('扩散颜色', 'color', 'ColorPicker'),
    c('扩散透明', 'opacity', 'slider'),
    c('扩散速度', 'speed', 'inputNumber', N, N, N, 0, 10)
  ],
  circleWave: [
    c('波纹颜色', 'color', 'ColorPicker'),
    c('填充透明'),
    c('波纹速度', 'speed', 'inputNumber', N, N, N, 0, 10)
  ],
  solid: [c('填充颜色')],
  outline: [
    c('填充颜色', 'color', 'ColorPicker'),
    c('边缘颜色', 'outline_gapcolor', 'ColorPicker'),
    c('边缘宽度', 'outline_width', 'inputNumber')
  ],
  dash: [
    c('虚线主色', 'color', 'ColorPicker'),
    c('虚线副色', 'dash_oddcolor', 'ColorPicker'),
    c('虚线间隔', 'dash_interval', 'inputNumber')
  ],
  glow: [
    c('光线颜色', 'color', 'ColorPicker'),
    c('光照强度', 'glowPower', 'inputNumber', N, N, N, 0, 10)
  ],
  arrow: [c('填充颜色', 'color', 'ColorPicker')],
  animation: [
    c('填充颜色', 'color', 'ColorPicker'),
    c('流动速度', 'animationSpeed', 'inputNumber', N, N, N, 0, 10)
  ],
  polylineCityLink: [
    c('轨迹颜色', 'color', 'ColorPicker'),
    c('流动速度', 'trailSpeed', 'inputNumber', N, N, N, 0, 10)
  ],
  text: [
    c('文字内容', 'text', 'input', N, N, N, N, N, false),
    c('字体', 'font_family', 'select', N, N, N, N, N, N, [
      { key: '微软雅黑', value: '微软雅黑' },
      { key: '宋体', value: '宋体' },
      { key: '楷体', value: '楷体' },
      { key: '隶书', value: '隶书' },
      { key: '黑体', value: '黑体' }
    ]),
    c('文字颜色', 'color', 'ColorPicker'),
    c('字号', 'font_size_f', 'inputNumber', N, N, N, 1, 1000)
  ]
};

FormLists.getFormListByType = function (type, options = {}) {
  let FormList = [...this[type]];
  //存在结构操作，进行增减。
  if (Object.entries(options).length) {
    if (options.fillJudge === false) {
      //不对模型进行处理
      FormList = removeObjInArr(FormList, '填充颜色', '填充透明', '填充材质');
      options.fillType = undefined;
    }
    if (options.outlineJudge === false) {
      FormList = removeObjInArr(FormList, '边框颜色', '边框透明', '边框宽度');
    }
    //文字和线条  chenSe border都通过这里
    if (options.chenSe === false) {
      FormList = removeObjInArr(FormList, '衬色颜色', '衬色宽度');
    }
    if (options.background === false) {
      FormList = removeObjInArr(FormList, '背景颜色', '背景透明');
    }
    if (options.scaleByDistance === false) {
      FormList = removeObjInArr(FormList, '上限', '下限', '比例值');
    }
    if (options.distanceDisplayCondition === false) {
      FormList = removeObjInArr(FormList, '最大距离', '最小距离');
    }
    if (options.silhouette === false) {
      FormList = removeObjInArr(FormList, '轮廓颜色', '轮廓宽度', '轮廓透明');
    }
    if (materialObjs[options.fillType]) {
      let index = FormList.findIndex((e) => {
        return e.value === 'fillType' || e.value === 'lineType';
      });
      if (index > -1)
        FormList = FormList.slice(0, index + 1)
          .concat(materialObjs[options.fillType])
          .concat(FormList.slice(index + 1));

      //材质类型不同于其他的“是否轮廓”等，材质的是加上结构。
      //按照类型取出结构，插入到“填充材质”栏下。
    }
  }
  return FormList;
};
function removeObjInArr(arr, label1, label2, label3, label4) {
  // 删除数组里特定名称的对象。
  let a = arr.filter((e) => {
    return (
      e.label !== label1 &&
      e.label !== label2 &&
      e.label !== label3 &&
      e.label !== label4
    );
  });
  return a;
}
const Properties = {
  animationSpeed: N,
  border: true,
  bold: false, // 字体 是否粗体
  background: false,
  background_color: '#000',
  background_opacity: 50,
  billboardKind: '图标三',
  breathGradual_opacity: 1,
  brightness: 1,
  chenSe: false, // 是否衬色
  chenSeColor: 'rgb(255, 255, 0)',
  color: 'rgb(255, 255, 0)',
  clampToGround: true,
  checkerboard_repeat: 4,
  desc: '', // 文件描述
  dash_oddcolor: N,
  dash_interval: N,
  distanceDisplayCondition: false,
  distanceDisplayCondition_far: 0,
  distanceDisplayCondition_near: 0,
  dynamicGradual_speed: N,
  extrudedHeight: 0, // 拉伸高·
  extentRadii: 0, // 椭球的长半径
  featureType: '圆', // 要素类型·
  font_family: '',
  font_size: 0,
  font_size_f: 100,
  fillJudge: true,
  grid_color: N,
  grid_lineCount: 8,
  grid_lineThickness: 2,
  color_glow: N,
  intensity_glow: N,
  imageBox: false,
  height: 0, // 高程·
  height_plane: 0,
  heading: 0,
  heightRadii: 0, // 椭球的高半径
  id: '', // *唯一ID
  italic: false, // 字体是否斜体。
  icon: N,
  lineType: 'solid',
  maximumSizeX: 25,
  maximumSizeY: 12,
  maximumSizeZ: 15,
  modelKind: 'model_car',
  name: '名称', // *目录名称
  oddColor: N,
  opacity: 0.6,
  outlineJudge: true,
  outlineColor: 'rgb(255, 255, 0)',
  outlineOpacity: 0,
  outlineWidth: 0,
  outline_color: N,
  outline_gapcolor: N,
  outline_width: N,
  pid: '996', // *父ID
  picUrl: '',
  pixelSize: 0,
  pitch: 0,
  roll: 0,
  radius: 200,
  rotation: 0,
  remark: '备注',
  repeatX: 1,
  repeatY: 1,
  sort: '', // 排序
  speed: 1,
  scale: 0,
  scaleX: 25,
  scaleY: 25,
  semiMinorAxis: 0,
  semiMajorAxis: 0,
  silhouette: false,
  silhouetteAlpha: 0,
  silhouetteColor: '',
  silhouetteSize: 0,
  scaleByDistance: false,
  scaleByDistance_far: 0,
  scaleByDistance_farValue: 0,
  scaleByDistance_near: 0,
  scaleByDistance_nearValue: 0,
  slice: 0.36,
  stripe_repeat: 0,
  style: {},
  trailSpeed: N,
  type: 2, // *目录类型: 1.文件 2.图片 3.音乐 4.视频
  text: '',
  vertical: true,
  width: 4,
  wallHeight: 0,
  widthRadii: 0, // 椭球的宽半径
  zIndex: 1
};
export {
  getToolOptions,
  defaultOptions,
  FormLists,
  c as columnObj,
  Properties
};
