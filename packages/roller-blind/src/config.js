const typeConfig = {
  titleBar: {
    miniBtn: true,
    closeBtn: true,
    fixBtn: true,
    title: true,
    icon: true
  },
  size: {
    width: '300px',
    height: '300px' // 原先300
  }
};
const editTypeConfig = {
  titleBar: {
    miniBtn: false,
    closeBtn: true,
    fixBtn: false,
    title: true,
    icon: false
  },
  size: {
    width: '315px',
    height: '500px' // 原先300
  }
};
const defaultFontStyle = {
  fontWeight: 'normal',
  fontSize: '12px',
  fontFamily: 'PingFang SC'
};

const defaultLayerNameFontStyle = {
  position: 'relative',
  fontWeight: 'normal',
  color: 'rgba(31,111,216,1)',
  fontSize: '13px',
  fontFamily: 'PingFang SC'
};

export {
  typeConfig,
  editTypeConfig,
  defaultFontStyle,
  defaultLayerNameFontStyle
};
