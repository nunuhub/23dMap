<template>
  <div v-show="shouldShow" class="sh-select-tool">
    <div v-show="isShow">
      <span v-if="$slots.default" @click="() => toggle()">
        <slot></slot>
      </span>
      <general-button
        v-else
        :position="position"
        :active="active"
        :is-column="isColumn"
        :drag-enable="dragEnable"
        :icon-class="iconClass ? iconClass : 'select-tool'"
        :show-img="showImg"
        :show-label="showLabel"
        :theme-style="themeStyle"
        :title="title ? title : '选择'"
        @click="() => toggle()"
      />
    </div>
  </div>
</template>

<script>
import SelectTool from './SelectTool.js';
import GeneralButton from 'shinegis-client-23d/packages/general-button';
import common from 'shinegis-client-23d/src/mixins/common';
import emitter from 'shinegis-client-23d/src/mixins/emitter';
import generalButtonProps from 'shinegis-client-23d/src/mixins/components/general-button-props';

export default {
  name: 'ShSelectTool',
  components: {
    GeneralButton
  },
  mixins: [common, emitter, generalButtonProps],
  props: {
    position: {
      type: Object,
      default: () => ({
        type: 'absolute',
        top: '1px',
        left: '70px'
      })
    },
    returnType: {
      type: String,
      default: 'geojson'
    }
  },
  data() {
    this.selectTool;
    return {
      shouldShow: false,
      active: false
    };
  },
  watch: {
    currentView: {
      handler(val) {
        this.shouldShow = val === 'map';
      },
      immediate: true
    },
    currentInteraction(name) {
      if (name !== this.$options.name) {
        this.active && this.deactivate();
      }
    }
  },
  mounted() {
    if (this.$map) {
      setTimeout(() => {
        this.begin();
      }, 0);
    }
    this.subscribe.$on('identify-popup-buffer-card:changeSelect', (active) => {
      if (active) {
        this.activate();
      } else if (this.active) {
        this.deactivate();
        this.selectTool.handleGraphic(this.$map.getSelectFeatures());
      }
    });
  },
  methods: {
    begin() {
      this.selectTool = new SelectTool(this.$map);
      this.selectTool.on('change:active', (e) => {
        this.active = e.active;
        this.$emit('change:active', e.active);
      });
      this.selectTool.on('selected', (evt) => {
        let result = null;
        if (this.returnType === 'geojson') {
          result = this.$map.transformGeo(evt.selected);
        } else {
          result = evt.selected;
        }
        this.$emit('selected', result);
      });
      this.subscribe.$on('union-tool:change:isStayAdd', (isStayAdd) => {
        this.selectTool.select.setIsStayAdd(isStayAdd);
      });
    },
    activate() {
      this.selectTool.activate();
    },
    deactivate() {
      this.selectTool.deactivate();
    },
    toggle(isOpen) {
      let type;
      if (typeof isOpen === 'boolean') {
        type = isOpen;
      } else {
        type = !this.selectTool.active;
      }
      type ? this.activate() : this.deactivate();
    }
  }
};
</script>
