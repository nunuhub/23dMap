<template>
  <div
    class="code-viewer"
    :style="{ '--height': height + 'px' }"
    :class="className"
  >
    <nav class="nav">
      <h1>
        <div class="title">
          <span>ShineGisClient23D Playground</span>
          <el-tag class="tag" size="small">{{ version }}</el-tag>
        </div>
      </h1>
    </nav>
    <code-viewer
      :source="source"
      :show-code="true"
      layout="right"
    ></code-viewer>
  </div>
</template>

<script>
import Client from 'main/index.js';
import { atou } from '../util';

const { version } = Client;

export default {
  name: 'App',
  data() {
    return {
      version,
      source: '',
      className: '',
      height: 500
    };
  },
  created() {
    const hashstring = window.location.hash.replace('#/playground', '');
    let encodeString = '';
    if (hashstring.length) {
      encodeString = hashstring.slice(1);
    }
    const encodeSource = encodeString.split('-')[0];
    const encodeClass = encodeString.split('-')[1];
    this.source = atou(encodeSource);
    this.className = atou(encodeClass);
  },
  mounted() {
    this.height = document.body.clientHeight - 50;
  }
};
</script>

<style lang="scss">
.code-viewer {
  overflow: hidden;
  height: 100%;

  .nav {
    background: #fff;
    height: 50px;
    padding-left: 1rem;
    padding-right: 1rem;
    position: relative;
    z-index: 999;
    box-sizing: border-box;
    box-shadow: 0 0 6px #409eff;

    h1 {
      line-height: 50px;
      margin: 0;
      display: inline-block;
      font-weight: 500;
    }

    .title {
      font-size: 20px;
      display: inline-flex;
      align-items: center;
    }

    .tag {
      margin: 0 7px;
      height: 20px;
    }
  }

  .vue-repl {
    height: calc(100% - 50px);

    .result-box {
      height: var(--height);
    }
  }
}
</style>
