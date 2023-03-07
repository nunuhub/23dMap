const FormLists = {
  weatherControl: [
    [
      {
        label: '',
        labelWidth: '0',
        checkName: '大气轮廓',
        value: 'atmosphericProfile',
        type: 'checkbox'
      },
      {
        label: '',
        labelWidth: '0',
        checkName: '雾',
        value: 'fog',
        type: 'checkbox'
      }
    ],
    [
      {
        label: '',
        labelWidth: '0',
        checkName: '雨',
        value: 'rain',
        type: 'checkbox'
      }
    ],
    [
      {
        label: '', // 雨量
        labelWidth: '0',
        value: 'rainfall',
        type: 'steps',
        className: 'el-form-item-big',
        list: [
          { title: '小雨', svg: 'bs-small-rain', value: 'small_r' },
          { title: '中雨', svg: 'bs-middle-rain', value: 'middle_r' },
          { title: '大雨', svg: 'bs-big-rain', value: 'big_r' },
          { title: '暴雨', svg: 'bs-violent-rain', value: 'violent_r' }
        ]
      }
    ],
    [
      {
        label: '',
        labelWidth: '0',
        checkName: '雪',
        value: 'snow',
        type: 'checkbox'
      }
    ],
    [
      {
        label: '',
        labelWidth: '0',
        value: 'snowfall',
        type: 'steps',
        className: 'el-form-item-big',
        list: [
          { title: '小雪', svg: 'bs-small-snow', value: 'small_s' },
          { title: '中雪', svg: 'bs-middle-snow', value: 'middle_s' },
          { title: '大雪', svg: 'bs-big-snow', value: 'big_s' },
          { title: '暴雪', svg: 'bs-violent-snow', value: 'violent_s' }
        ]
      }
    ],
    [
      {
        label: '',
        labelWidth: '0',
        checkName: '亮度开关',
        value: 'brightness_changer',
        type: 'checkbox'
      }
    ],
    [
      {
        labelWidth: '0',
        value: 'brightness',
        max: 200,
        marks: {
          0: '暗',
          100: '正常',
          /* 200: '亮', */
          200: '亮' //高曝
        },
        className: 'el-form-item-big',
        type: 'slider'
      }
    ]
  ],
  baseControl: [
    [
      {
        label: '',
        labelWidth: '0',
        checkName: '屏幕缩放自适应',
        value: 'screen_adaption',
        type: 'checkbox'
      },
      {
        label: '',
        labelWidth: '0',
        checkName: '深度检测',
        value: 'deep_inspection',
        type: 'checkbox',
        span: 12
      }
    ],
    [
      {
        label: '',
        labelWidth: '0',
        checkName: '抗锯齿优化',
        value: 'anti_aliasing',
        type: 'checkbox'
      },
      {
        label: '',
        labelWidth: '0',
        checkName: '帧率开关',
        value: 'fps_changer',
        type: 'checkbox'
      }
    ],
    [
      {
        label: '',
        labelWidth: '0',
        checkName: '大气渲染',
        value: 'atmospheric_rendering',
        className: 'padding_05010',
        type: 'checkbox'
      },
      {
        label: '',
        labelWidth: '0',
        checkName: '基础光照',
        value: 'base_light',
        className: 'padding_0505',
        type: 'checkbox'
      },
      {
        label: '',
        labelWidth: '0',
        checkName: '地形光照',
        value: 'terrain_light',
        className: 'padding_0500',
        type: 'checkbox'
      }
    ]
  ],
  keyboardControl: [
    [
      {
        label: '向前平移',
        value: 'front_keyboard',
        type: 'keyboardControl',
        text: '设置向前平移为输入键',
        span: 12
      },
      {
        label: '向后平移',
        value: 'back_keyboard',
        type: 'keyboardControl',
        span: 12
      }
    ],
    [
      {
        label: '向左平移',
        value: 'left_keyboard',
        type: 'keyboardControl',
        span: 12
      },
      {
        label: '向右平移',
        value: 'right_keyboard',
        type: 'keyboardControl',
        span: 12
      }
    ],
    [
      {
        label: '向上翻滚',
        value: 'above_keyboard',
        type: 'keyboardControl',
        span: 12
      },
      {
        label: '向下翻滚',
        value: 'below_keyboard',
        type: 'keyboardControl',
        span: 12
      }
    ],
    [
      {
        label: '顺时针转',
        value: 'clockwise_keyboard',
        type: 'keyboardControl',
        span: 12
      },
      {
        label: '逆时针转',
        value: 'anticlockwise_keyboard',
        type: 'keyboardControl',
        span: 12
      }
    ]
  ]
};

export { FormLists };
