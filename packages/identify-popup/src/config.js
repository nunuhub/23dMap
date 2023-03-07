export const bindPosition = {
  type: 'sticky'
};

export const unbindPosition = {
  type: 'absolute',
  top: '20%',
  right: '5%'
};

export const styleConfig = {
  size: {
    radius: '4px',
    width: 'fit-content',
    height: '100%'
  },
  titleBar: {
    miniBtn: false,
    maxBtn: false,
    closeBtn: true,
    fixBtn: true,
    title: true
  }
};

export const themeStyle = {
  light: {
    title: {
      backgroundColor: 'rgba(233, 239, 248, 0.9)',
      backgroundImage: '',
      fontSize: '13px',
      color: 'rgba(51,51,51,1)'
    },
    primaryFont: {
      fontSize: '12px',
      fontColor: '#303133'
    },
    panel: {
      backgroundColor: 'rgba(255,255,255,0.95)',
      border: 'none',
      opacity: ''
    },
    toolButton: {
      color: '#000'
    },
    floatButton: {
      backgroundColor: 'rgba(233, 239, 248, 0.9)',
      backgroundImage: '',
      shadowColor: 'rgba(41, 47, 54, 0.6)',
      opacity: ''
    },
    corner: {
      height: '12px',
      width: '12px',
      border: '2px solid #215aff'
    }
  },
  dark: {
    title: {
      backgroundColor: '#555e67',
      backgroundImage: '',
      color: '#e2e2e2',
      fontSize: '13px'
    },
    primaryFont: {
      fontSize: '12px',
      fontColor: 'rgba(255,255,255,1)'
    },
    panel: {
      backgroundColor: 'rgba(41, 47, 54, 0.6)',
      border: 'none',
      opacity: ''
    },
    toolButton: {
      color: '#fff'
    },
    floatButton: {
      backgroundColor: '#555e67',
      backgroundImage: '',
      shadowColor: 'rgba(250,250,250,0.8)',
      opacity: ''
    },
    corner: {
      height: '12px',
      width: '12px',
      border: '2px solid #215aff'
    }
  }
};

// 默认高亮样式
export const defaultHightLightStyle = {
  strokeWidth: 3,
  fillAlpha: 0.5,
  fill: '#ff0000',
  stroke: '#ff0000'
};
