export const defaultOptions = {
  cad: true,
  drawPoint: true,
  drawLine: true,
  drawPolygon: true,
  modify: true,
  clear: true,
  rotate: true,
  buffer: true,
  union: true,
  intersection: true,
  difference: true
};

export function getToolOptions(options) {
  return [
    {
      key: 'cad',
      name: '捕捉控制',
      img: 'cad',
      hidden: !options.cad
    },
    {
      key: 'drawPoint',
      name: '绘制点',
      img: 'drawPoint',
      hidden: !options.drawPoint
    },
    {
      key: 'drawLine',
      name: '绘制线',
      img: 'drawLine',
      hidden: !options.drawLine
    },
    {
      key: 'drawPolygon',
      name: '绘制面',
      img: 'drawPolygon',
      hidden: !options.drawPolygon
    },
    {
      key: 'clear',
      name: '清除',
      img: 'clear',
      hidden: !options.clear
    },
    {
      key: 'modify',
      name: '编辑',
      img: 'modify',
      hidden: !options.modify
    },
    {
      key: 'rotate',
      name: '旋转',
      img: 'rotate',
      hidden: !options.rotate
    }
    // {
    //   key: 'topology',
    //   name: '拓扑',
    //   img: 'el-icon-connection',
    //   children: [
    //     {
    //       key: 'buffer',
    //       name: '图形缓冲',
    //       img: 'buffer',
    //       hidden: !options.buffer
    //     },
    //     {
    //       key: 'union',
    //       name: '合并',
    //       img: 'union',
    //       hidden: !options.union
    //     },
    //     {
    //       key: 'intersection',
    //       name: '求交',
    //       img: 'intersection',
    //       hidden: !options.intersection
    //     },
    //     {
    //       key: 'difference',
    //       name: '取差',
    //       img: 'difference',
    //       hidden: !options.difference
    //     }
    //   ]
    // }
  ];
}
