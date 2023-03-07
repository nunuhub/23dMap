const interaction = {
  data() {
    return {
      // 当前地图/地球交互事件(所有交互事件开启状态互斥)
      currentInteraction: ''
    };
  },
  provide() {
    return {
      reactiveInteraction: () => this.currentInteraction
    };
  },
  mounted() {
    this.subscribe.$on('identify-popup:change:active', (type) =>
      this.changeCurrentInteraction('ShIdentifyPopup', type)
    );
    this.subscribe.$on('select-tool:change:active', (type) =>
      this.changeCurrentInteraction('ShSelectTool', type)
    );
    this.subscribe.$on('draw-tool:change:active', (type, tool, activeIndex) => {
      this.changeCurrentInteraction('ShDrawTool', activeIndex.length > 0);
    });
    this.subscribe.$on('map-measure:change:active', (type) =>
      this.changeCurrentInteraction('ShMapMeasure', type)
    );
    this.subscribe.$on('draw-tool3d:change:active', (type) =>
      this.changeCurrentInteraction('ShDrawTool3d', type)
    );
    this.subscribe.$on('map-measure3d:change:active', (type) =>
      this.changeCurrentInteraction('ShMapMeasure3d', type)
    );
    this.subscribe.$on('spatial-analysis3d:change:active', (type) =>
      this.changeCurrentInteraction('ShSpatialAnalysis3d', type)
    );
    this.subscribe.$on('flatten-tools:change:active', (type) =>
      this.changeCurrentInteraction('ShFlattenTools', type)
    );
    this.subscribe.$on('roam3d:change:active', (type) =>
      this.changeCurrentInteraction('ShRoam3d', type)
    );
    this.subscribe.$on('clip-tools:change:active', (type) =>
      this.changeCurrentInteraction('ShClipTools', type)
    );
    this.subscribe.$on('split-tool:change:active', (type) =>
      this.changeCurrentInteraction('ShSplitTool', type)
    );
  },
  methods: {
    changeCurrentInteraction(name, type) {
      if (type) {
        this.currentInteraction = name;
      } else if (this.currentInteraction === name) {
        this.currentInteraction = '';
      }
    }
  }
};

export default interaction;
