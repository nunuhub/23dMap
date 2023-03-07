const common = {
  data() {
    return {
      // 用于触发computed
      isSetMap_common: false
    };
  },
  inject: {
    reactiveConfigInstance: {
      default: function () {
        return () => null;
      }
    },
    // 地图模式 '2D' '3D' '23D'
    reactiveViewMode: {
      default: function () {
        return () => '23D';
      }
    },
    reactiveView: {
      default: function () {
        return () => 'map';
      }
    },
    reactiveMap: {
      default: function () {
        return () => null;
      }
    },
    reactiveEarth: {
      default: function () {
        return () => null;
      }
    },
    reactiveInteraction: {
      default: function () {
        return () => null;
      }
    },
    reactiveShinegaUrl: {
      default: function () {
        return () => null;
      }
    },
    shinegaInitData: {
      default: null
    },
    token: {
      default: null
    },
    emitterId: {
      default: null
    },
    fastApplicationId: {
      default: null
    }
  },
  computed: {
    // configManager对象
    configInstance() {
      return this.reactiveConfigInstance();
    },
    // 获取map对象
    $map() {
      return this.reactiveMap();
    },
    // 获取earth对象
    $earth() {
      return this.reactiveEarth();
    },
    // 获取当前地图模式
    viewMode() {
      return this.reactiveViewMode();
    },
    // 当viewMode是'23D'时，获取当前视窗时'map'还是'earth'
    currentView() {
      return this.reactiveView();
    },
    // 当前地图/地球交互事件(所有交互事件开启状态互斥)
    currentInteraction() {
      return this.reactiveInteraction();
    },
    shinegaUrl() {
      return this.reactiveShinegaUrl();
    }
  }
};

export default common;
