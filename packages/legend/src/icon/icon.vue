<template>
  <div id="svg" ref="svgDiv" class="legend-svg" style="height: 20px"></div>
</template>

<script>
export default {
  props: {
    svg: {
      type: String,
      required: true
    },
    fillColor: {
      type: String
    },
    storkeColor: {
      type: String
    }
  },
  watch: {
    svg() {
      this.$refs.svgDiv.innerHTML = this.svg;
    },
    fillColor() {
      this.changeColor();
    },
    storkeColor() {
      this.changeColor();
    }
  },
  mounted() {
    this.$refs.svgDiv.innerHTML = this.svg;
    this.changeColor();
  },
  methods: {
    changeColor() {
      this.$nextTick(() => {
        if (this.$refs.svgDiv) {
          this.$refs.svgDiv.style.setProperty('--fillColor', this.fillColor);
          this.$refs.svgDiv.style.setProperty(
            '--storkeColor',
            this.storkeColor
          );
        }
      });
    }
  }
};
</script>
<style>
.legend-svg {
  width: 16px;
  height: 16px;
}
g {
  fill: var(--fillColor);
  stroke: var(--storkeColor);
}
</style>

<style>
.svg-icon {
  display: inline-block;
  fill: currentColor;
}

.svg-icon.flip-horizontal {
  transform: scale(-1, 1);
}

.svg-icon.flip-vertical {
  transform: scale(1, -1);
}

.svg-icon.spin {
  animation: fa-spin 1s 0s infinite linear;
}

@keyframes fa-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
