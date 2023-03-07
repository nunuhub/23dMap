/**
 * Created by FDD on 2017/5/22.
 * @desc 常用变量
 */
export const FITTING_COUNT = 100;
export const HALF_PI = Math.PI / 2;
export const ZERO_TOLERANCE = 0.0001;
export const TWO_PI = Math.PI * 2;
export const BASE_LAYERNAME = 'ol-plot-vector-layer'; // 矢量图层名，（唯一标识）
export const BASE_HELP_CONTROL_POINT_ID = 'plot-helper-control-point-div'; // 控制点要素的基类id
export const BASE_HELP_HIDDEN = 'plot-helper-hidden-div'; // 父类隐藏容器
export const DEF_TEXT_STYEL = {
  // 默认文本框样式
  borderRadius: '2px',
  fontSize: '18px',
  outline: 0,
  overflow: 'hidden',
  boxSizing: 'border-box',
  border: '1px solid #eeeeee00',
  fontFamily:
    'Helvetica Neue,Helvetica,PingFang SC,Hiragino Sans GB,Microsoft YaHei,Noto Sans CJK SC,WenQuanYi Micro Hei,Arial,sans-serif',
  color: '#ff0000',
  fontWeight: 'bold',
  padding: '3px',
  fontStretch: 'normal',
  lineHeight: 'normal',
  textAlign: 'left',
  marginLeft: 'auto',
  marginRight: 'auto',
  width: 'auto',
  height: 'auto',
  background: 'rgba(255, 255, 255, 0)',
  fontStyle: '',
  fontVariant: ''
};
export const DEF_STYEL = {
  // 默认标绘样式
  type: 'polyline',
  textStroke: 'rgba(0, 0, 0, 0)',
  textWidth: 1,
  textColor: '#4169E1',
  textSize: 18,
  fontFamily: '微软雅黑',
  fontWeight: 'normal',
  rotation: 0,
  shadow: {
    isShow: false,
    color: 'rgba(0, 0, 0, 1)',
    blur: 25
  },
  point: {
    type: 'circile',
    iconSrc: '/images/plot/star.svg',
    src: '/images/plot/star-white.svg',
    originSize: 64,
    opacity: 1,
    size: 24,
    color: '#000',
    rotation: 0
  },
  arrow: {
    triangleArrowSize: 8,
    dottedTriangleArrowSize: 30,
    showArrow: [],
    arrowShowArrow: ['left', 'right']
  },

  fill: '#4169E1',
  radius: 6,
  stroke: '#4169E1',
  strokeWidth: 2,
  width: 4,
  polyStroke: 'rgba(0, 0, 0, 0)',
  circleStroke: 'rgba(237, 8, 8, 1)',
  childStroke: '#4169E1',
  childWidth: 2,
  childOffset: 4,
  dashStroke: '#4169E1',
  roadStroke: '#000',
  roadDashStroke: '#fff',
  dashWidth: 4,
  circleDashWidth: 5,
  dottedArrowWidth: 25,
  dashHeight: 11,
  dottedArrowHeight: 15,
  dashDivide: 7,
  lineDashOffset: 10,
  isGradient: true,
  gradients: [
    {
      offset: 1,
      color: '#87CEFA'
    },
    {
      offset: 0,
      color: '#4169E1'
    }
  ],
  circleGradients: [
    {
      offset: 1,
      color: 'rgba(0, 0, 0, 0)'
    },
    {
      offset: 0,
      color: 'rgba(0, 0, 0, 0)'
    }
  ],
  arrowImg: '',
  zIndex: 1
};
