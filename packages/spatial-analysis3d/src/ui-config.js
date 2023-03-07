const toolOptions = [
  {
    key: 'visible',
    img: 'visible-analysis',
    name: '通视分析'
  },
  {
    key: 'viewShed',
    img: 'viewShed-analysis',
    name: '视域分析'
  },
  {
    key: 'sun',
    img: 'sun-analysis',
    name: '日照分析'
  },
  {
    key: 'clip',
    img: 'clip-analysis',
    name: '剖面分析'
  },
  {
    key: 'flood',
    img: 'flood-analysis',
    name: '淹没分析'
  },
  {
    key: 'terrain',
    img: 'terrain-analysis',
    name: '地形分析'
  },
  {
    key: 'skyLine',
    img: 'skyLine',
    name: '天际线'
  },
  {
    key: 'controlHeight',
    img: 'control-height-analysis',
    name: '控高分析'
  }
];
const FieldLists = {
  viewShed: [
    {
      title: { name: '观察点', showList: true },
      formList: [
        [
          {
            label: '经纬度(°)',
            value: 'lonAndLat',
            type: 'input'
          }
        ],
        [
          {
            label: '高度(m)',
            value: 'height',
            type: 'input'
          }
        ]
      ]
    },
    {
      title: { name: '参数设置', showList: true },
      formList: [
        [
          {
            label: '附加高度(m)',
            value: 'additionalHeight',
            type: 'inputNumber',
            span: 12,
            min: -1000,
            max: 1000,
            className: 'nopadding terrainRow'
          },
          {
            label: '方向角(°)',
            value: 'direction',
            type: 'inputNumber',
            span: 12,
            className: 'nopadding terrainRow'
          }
        ],
        [
          {
            label: '可视距离(m)',
            value: 'visualRange',
            type: 'inputNumber',
            span: 12,
            // min: 1,
            className: 'nopadding terrainRow'
          },
          {
            label: '俯仰角(°)',
            value: 'pitch',
            type: 'inputNumber',
            span: 12,
            min: -90,
            max: 90,
            className: 'nopadding terrainRow'
          }
        ],
        [
          {
            label: '水平张角(°)',
            value: 'horizontalViewAngle',
            type: 'inputNumber',
            span: 12,
            min: 0,
            max: 179.9,
            stepStrictly: true,
            className: 'nopadding terrainRow'
          },
          {
            label: '竖直张角(°)',
            value: 'verticalViewAngle',
            type: 'inputNumber',
            span: 12,
            min: 0,
            max: 179.9,
            className: 'nopadding terrainRow'
          }
        ]
      ]
    },
    {
      title: { name: '颜色设置', showList: true },
      formList: [
        [
          {
            label: '提示线颜色',
            value: 'cueLineColor',
            type: 'ColorPicker'
          }
        ],
        [
          {
            label: '可见区域',
            value: 'visibleAreaColor',
            type: 'ColorPicker',
            className: 'nopadding',
            span: 19
          },
          {
            label: '',
            value: 'visibleArea',
            type: 'switch',
            labelWidth: '0',
            span: 5
          }
        ],
        [
          {
            label: '不可见区域',
            value: 'invisibleAreaColor',
            type: 'ColorPicker',
            className: 'nopadding',
            span: 19
          },
          {
            label: '',
            value: 'invisibleArea',
            type: 'switch',
            labelWidth: '0',
            span: 5
          }
        ]
      ]
    },
    {
      title: { name: '操作', showList: true },
      formList: [
        [
          {
            label: '',
            value: 'btnRow',
            type: 'btnRow',
            span: 24,
            className: 'nopadding',
            list: [
              { name: '绘制', value: 'execute' },
              { name: '清除', value: 'clear' }
            ]
          }
        ]
      ]
    }
  ],
  controlHeight: [
    {
      title: { name: '高度', showList: true },
      formList: [
        [
          {
            label: '相对高度(m)',
            value: 'relativeHeight',
            type: 'inputNumber',
            span: 24
          }
        ],
        [
          {
            label: '控高海拔',
            value: 'altitude',
            type: 'input'
          }
        ],
        [
          {
            label: '地坪高度',
            value: 'groundHeight',
            type: 'input'
          }
        ]
      ]
    },
    {
      title: { name: '操作', showList: true },
      formList: [
        [
          {
            label: '显示超高',
            value: 'showWarning',
            type: 'switch',
            span: 24
          }
        ],
        [
          {
            label: '',
            value: 'btnRow',
            type: 'btnRow',
            span: 24,
            className: 'nopadding',
            list: [
              { name: '绘制', value: 'execute' },
              { name: '清除', value: 'clear' }
            ]
          }
        ]
      ]
    }
  ],
  sun: [
    {
      title: { name: '时间设定', showList: true },
      formList: [
        [
          {
            label: '开始时间',
            value: 'startTime',
            type: 'time',
            span: 24,
            className: 'nopadding'
          },
          {
            label: '结束时间',
            value: 'endTime',
            type: 'time',
            span: 24,
            className: 'nopadding'
          }
        ],
        [
          {
            label: '节气年份',
            value: 'solarTermYear',
            type: 'inputNumber',
            min: 1,
            max: 9999,
            step: 1,
            stepStrictly: true,
            className: 'nopadding nopadding_jieqi'
          },
          {
            label: '',
            value: 'solarTermName',
            type: 'solarTermBtn',
            className: 'solarTermBtn'
          }
        ]
      ]
    },
    {
      title: { name: '控制', showList: true },
      formList: [
        [
          {
            label: '播放',
            value: 'play',
            type: 'play'
          }
        ],
        [
          {
            label: '当前时间',
            value: 'currentTime',
            type: 'time'
          }
        ],
        [
          {
            label: '当前速率',
            value: 'currentRate',
            type: 'select',
            list: [
              { key: '1级', value: '300' },
              { key: '2级', value: '600' },
              { key: '3级', value: '900' },
              { key: '4级', value: '1200' },
              { key: '5级', value: '2400' }
            ]
          }
        ],
        [
          {
            label: '阴影模式',
            value: 'ShadowMode',
            type: 'switch'
          },
          {
            label: '地形阴影',
            value: 'TerrainShade',
            type: 'switch'
          }
        ]
      ]
    },
    {
      title: { name: '阴影率', showList: true },
      formList: [
        [
          {
            label: '',
            value: 'btnRow',
            type: 'btnRow',
            span: 24,
            className: 'nopadding',
            list: [
              { name: '绘制', value: 'shadowRatio' },
              { name: '清除', value: 'shadowRatio_clear' }
            ]
          }
        ]
      ]
    },
    {
      title: { name: '单点阴影率', showList: false },
      formList: [
        [
          {
            label: '日照率',
            value: 'sunshineRatio',
            type: 'input'
          }
        ],
        [
          {
            label: '经纬度',
            value: 'position_sr',
            type: 'input'
          }
        ],
        [
          {
            label: '海拔',
            value: 'height_sr',
            type: 'input'
          }
        ],
        [
          {
            label: '日照时段',
            value: 'sunshinePeriod',
            className: 'heightAuto1',
            type: 'textarea'
          }
        ]
      ]
    }
  ],
  visible: [
    {
      title: { name: '参数', showList: true },
      formList: [
        [
          {
            label: '观察点海拔',
            value: 'obAltitude',
            type: 'input',
            span: 24
          }
        ],
        [
          {
            label: '视点相对高',
            value: 'obHeight',
            type: 'inputNumber',
            span: 24
          }
        ]
      ]
    },
    {
      title: { name: '操作', showList: true },
      formList: [
        [
          {
            value: 'btnRow',
            type: 'btnRow',
            span: 24,
            labelWidth: '20px',
            className: 'nopadding',
            list: [
              { name: '绘制', value: 'execute' },
              { name: '增加观察点', value: 'addOBpoint' },
              { name: '清除', value: 'clear' }
            ]
          }
        ]
      ]
    }
  ],
  clip: [
    {
      title: { name: '操作', showList: true },
      formList: [
        [
          {
            label: '',
            value: 'btnRow',
            type: 'btnRow',
            span: 24,
            className: 'nopadding',
            list: [
              { name: '绘制', value: 'execute' },
              { name: '清除', value: 'clear' }
            ]
          }
        ],
        [
          {
            label: '',
            value: 'clipRecords',
            type: 'clipDisplay',
            className: 'heightAuto',
            list: [],
            info: {
              longitude: 120,
              latitude: 30,
              height: 551231231236,
              direction: 56,
              pitch: -56
            }
          }
        ]
      ]
    }
  ],
  flood: [
    {
      title: { name: '参数', showList: true },
      formList: [
        [
          {
            label: '颜色',
            value: 'floodColor',
            type: 'ColorPicker'
          }
        ],
        [
          {
            label: '透明度',
            value: 'opacity_flo',
            type: 'slider',
            span: 24,
            min: 0,
            max: 1,
            step: 0.1,
            suffix: '',
            hidden: false
          }
        ],
        [
          {
            label: '水面海拔',
            value: 'floodAltitude',
            span: 18,
            type: 'inputNumber2'
          }
        ]
      ]
    },
    {
      title: { name: '操作', showList: true },
      formList: [
        [
          {
            // label: "操作",
            value: 'btnRow',
            type: 'btnRow',
            span: 24,
            className: 'nopadding',
            list: [
              { name: '绘制', value: 'execute' },
              { name: '清除', value: 'floClear' }
            ]
          }
        ],
        [
          {
            // label: "操作",
            labelWidth: '10px',
            value: 'waterDepth',
            type: 'btnRow',
            span: 4,
            className: 'nopadding',
            list: [{ name: '拾取深度', value: 'waterDepth' }]
          },
          {
            label: '',
            labelWidth: '40px',
            value: 'pick_method',
            type: 'select',
            span: 16,
            list: [
              { key: '地面水深', value: 'ground' },
              { key: '模型水深', value: 'model' },
              { key: '后端查询深度', value: 'serve' }
            ]
          }
        ]
      ]
    }
  ],
  terrain: [
    {
      title: { name: '参数', showList: true },
      formList: [
        [
          {
            label: '等高线',
            value: 'terrain',
            type: 'switch',
            span: 24
          }
        ],
        [
          {
            label: '间距',
            value: 'spacing_ter',
            type: 'slider&inputNumber',
            span: 24,
            min: 0,
            max: 300
          }
        ],
        [
          {
            label: '线宽',
            value: 'width_ter',
            type: 'slider&inputNumber',
            span: 24,
            min: 0,
            max: 10
          }
        ],
        [
          {
            label: '更改颜色',
            value: 'contourColor',
            type: 'ColorPicker',
            className: 'nopadding changeColor',
            span: 17
          },
          {
            label: '',
            value: 'btnRow',
            type: 'btnRow',
            span: 7,
            className: 'terrainRow transfrom115',
            list: [{ name: '随机颜色', value: 'changeColor_ter' }]
          }
        ],
        [
          {
            label: '',
            labelWidth: '0px',
            value: 'terrainSelect',
            className: 'twoRow',
            type: 'radioGroup',
            list: [
              { key: '坡度', value: 'slope' },
              { key: '坡向', value: 'aspect' },
              { key: '高程', value: 'elevation' }
            ]
          }
        ],
        [
          {
            label: '分析模式',
            value: 'analysisMode',
            type: 'select_terrain',
            list: [
              { key: '指定多边形区域', value: 'polygon' },
              { key: '全部区域参与分析', value: 'all_on' },
              { key: '全部区域不参与分析', value: 'all_off' }
            ],
            hidden: false
          }
        ]
      ]
    }
  ],
  skyLine: [
    {
      title: { name: '开关', showList: true },
      formList: [
        [
          {
            label: '开启',
            value: 'skyLine',
            type: 'switch',
            span: 24
          }
        ]
      ]
    }
  ]
};

FieldLists.getTerrainFieldListByType = function (type = 'elevation') {
  let FieldList = [...this['terrain']];
  let FormList = FieldList[0]['formList'];
  let rearPart = [];
  if (type === 'slope') {
    rearPart = [
      [
        {
          label: '坡度起点',
          value: 'slopeS',
          type: 'slider&inputNumber',
          span: 18,
          min: 0,
          max: 89,
          hidden: false,
          className: 'only_nopadding slope_slider',
          suffix: '  '
        },
        {
          label: '',
          value: 'colorS',
          type: 'ColorPicker',
          labelWidth: '5px',
          hidden: false,
          noInput: true,
          span: 6,
          className: 'terrainRow'
        }
      ],
      [
        {
          label: '坡度终点',
          value: 'slopeE',
          type: 'slider&inputNumber',
          hidden: false,
          span: 18,
          min: 1,
          max: 90,
          className: 'only_nopadding slope_slider',
          suffix: '  '
        },
        {
          label: '',
          value: 'colorE',
          className: 'terrainRow',
          noInput: true,
          hidden: false,
          span: 6,
          labelWidth: '5px',
          type: 'ColorPicker'
        }
      ],
      [
        {
          label: '颜色条带',
          value: 'colorRamp',
          className: 'nopadding',
          hidden: false,
          type: 'colorRamp'
        }
      ],
      [
        {
          label: '透明调节',
          value: 'opacity_ter',
          type: 'slider&inputNumber',
          span: 24,
          min: 0,
          max: 1,
          step: 0.1,
          suffix: '',
          hidden: false
        }
      ]
    ];
  } else if (type === 'elevation') {
    rearPart = [
      [
        {
          label: '高程起点',
          value: 'elevationS',
          type: 'inputNumber',
          span: 18,
          min: -414,
          max: 8776,
          hidden: false,
          className: 'only_nopadding elevation_slider',
          suffix: '  '
        },
        {
          label: '',
          value: 'colorS',
          type: 'ColorPicker',
          labelWidth: '5px',
          hidden: false,
          noInput: true,
          span: 6,
          className: 'terrainRow'
        }
      ],
      [
        {
          label: '高程终点',
          value: 'elevationE',
          type: 'inputNumber',
          hidden: false,
          span: 18,
          min: 0,
          max: 8777,
          className: 'only_nopadding elevation_slider',
          suffix: '  '
        },
        {
          label: '',
          value: 'colorE',
          className: 'terrainRow',
          noInput: true,
          hidden: false,
          span: 6,
          labelWidth: '5px',
          type: 'ColorPicker'
        }
      ],
      [
        {
          label: '颜色条带',
          value: 'colorRamp',
          className: 'nopadding',
          hidden: false,
          type: 'colorRamp'
        }
      ],
      [
        {
          label: '透明调节',
          value: 'opacity_ter',
          type: 'slider&inputNumber',
          span: 24,
          min: 0,
          max: 1,
          step: 0.1,
          suffix: '',
          hidden: false
        }
      ]
    ];
  } else if (type === 'aspect') {
    rearPart = [
      [
        {
          label: '坡向',
          value: 'aspect',
          type: 'select_custom',
          className: 'aspect',
          span: 18,
          size: 'mini',
          collapse_tags: true,
          multiple: true,
          hidden: false,
          list: [
            { key: '北', value: '北' },
            { key: '西北', value: '西北' },
            { key: '西', value: '西' },
            { key: '西南', value: '西南' },
            { key: '南', value: '南' },
            { key: '东南', value: '东南' },
            { key: '东', value: '东' },
            { key: '东北', value: '东北' }
          ]
        },
        {
          label: '',
          value: 'aspect_color',
          type: 'ColorPicker',
          labelWidth: '5px',
          hidden: false,
          noInput: true,
          span: 6,
          className: 'terrainRow'
        }
      ],
      [
        {
          label: '透明调节',
          value: 'opacity_ter',
          type: 'slider&inputNumber',
          span: 24,
          min: 0,
          max: 1,
          step: 0.1,
          suffix: '',
          hidden: false
        }
      ]
    ];
  }
  return FormList.concat(rearPart);
};

export { FieldLists, toolOptions };
