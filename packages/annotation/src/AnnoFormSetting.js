import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
export var commonStyle = {
  mixins: [common, emitter],
  data() {
    return {
      isPickOnMap: false,
      currentTheme: {},
      darktheme: {
        fontSize: '10px',
        background: 'rgba(0,0,0,0)',
        color: 'white'
      },
      lighttheme: {
        fontSize: '10px',
        background: 'rgba(255,255,255,0)',
        color: 'black'
      },
      darkselect: {
        background: 'rgba(0,0,0,0.3)',
        color: 'white'
      },
      lightselect: {
        background: 'rgba(255,255,255,1)',
        color: 'black'
      },
      inputClass: undefined
    };
  },
  watch: {
    currentView: {
      handler(view) {
        if (view === 'earth') {
          this.currentTheme = this.darktheme;
          this.selectClass = this.darkselect;
          this.inputClass = 'darkInput';
        } else {
          this.currentTheme = this.lighttheme;
          this.selectClass = this.lightselect;
          this.inputClass = 'lightInput';
        }
      },
      immediate: true
    }
  },
  methods: {
    chooseIcon(item) {
      this.icons.forEach((i) => {
        if (item.id === i.id) {
          document.getElementById(item.id).style.border = '2px solid #409eff';
        } else {
          document.getElementById(i.id).style.border = '1px solid #eee';
        }
      });
    }
  }
};
export var commonMethods = {
  watch: {
    currentView: {
      handler(view) {
        if (view === 'earth') {
          this.currentTheme = this.darktheme;
          this.selectClass = this.darkselect;
          this.inputClass = 'darkInput';
        } else {
          this.currentTheme = this.lighttheme;
          this.selectClass = this.lightselect;
          this.inputClass = 'lightInput';
        }
      },
      immediate: true
    },
    propItem: {
      handler(val) {
        this.currentItem = val;
      },
      immediate: true
    }
  },
  mixins: [common, emitter],
  methods: {
    pickOnMap(val) {
      if (this.currentView !== 'earth') {
        var pointer = document.createElement('div');
        pointer.id = 'tempDraw';
        pointer.style =
          'width:12px;height:12px;background:#409eff;border-radius:50%;position:absolute;';
        if (val) {
          this.$map.getTargetElement().appendChild(pointer);
          document.onmousemove = function (e) {
            pointer.style.left = e.clientX + 'px';
            pointer.style.top = e.clientY + 'px';
          };
          this.$map.on('singleclick', this.mapClick);
        } else {
          document.getElementById('tempDraw').remove();
          this.$map.un('singleclick', this.mapClick);
        }
      }
    },
    mapClick(e) {
      if (e) {
        this.currentItem.position.x = e.coordinate[0].toFixed(6);
        this.currentItem.position.y = e.coordinate[1].toFixed(6);
      }
    },
    getNowItem() {
      return this.currentItem;
    }
  }
};
