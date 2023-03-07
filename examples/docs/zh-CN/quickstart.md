## 快速上手

本节将介绍如何在项目中使用 ShineGisClient23d

### 三维配置

使用三维相关组件时需要在 webpack 中添加三维相关配置(如果是使用[Vue CLI](https://cli.vuejs.org/zh/guide/)创建的项目，可配置在项目根目录的 vue.config.js 文件中；其他项目请放在 webpack 相关配置文件中，例如：webpack.conf.js 等)

项目中提供了三维相关 webpack 配置文件导出，可借助 [copy-webpack-plugin](https://github.com/webpack-contrib/copy-webpack-plugin)和 [webpack-merge](https://github.com/survivejs/webpack-merge)来使用

#### webpack5 环境下

```bash
npm install copy-webpack-plugin -D
npm install webpack-merge -D
```

#### webpack4 环境下

```bash
npm install copy-webpack-plugin@5.1.1 -D
npm install webpack-merge@4.2.2 -D
```

#### 使用默认三维配置

```javascript
// vue.config.js
// webpack4环境下使用
const merge = require('webpack-merge');
// webpack5环境下使用
// const { merge } = require("webpack-merge");
const {
  earthWebpackConfig
} = require('shinegis-client-23d/build/earth-webpack-config');

module.exports = {
  configureWebpack: () => {
    // 项目自定义配置，若没有可不使用webpack-merge
    const config = {
      // ...
    };
    return merge(earthWebpackConfig, config);
  }
};
```

#### 使用自定义三维配置

```javascript
// vue.config.js
// webpack4环境下使用
const merge = require('webpack-merge');
// webpack5环境下使用
// const { merge } = require("webpack-merge");
const {
  earthWebpackConfigFunction
} = require('shinegis-client-23d/build/earth-webpack-config');

module.exports = {
  configureWebpack: () => {
    // 项目自定义配置，若没有可不使用webpack-merge
    const config = {
      // ...
    };
    return merge(
      earthWebpackConfigFunction({
        earthSource: '填写自定义配置',
        clientSource: '填写自定义配置',
        earthBaseUrl: '填写自定义配置'
      }),
      config
    );
  }
};
```

### 引入 ShineGisClient23d

你可以引入整个 ShineGisClient23d，或是根据需要仅引入部分组件。我们先介绍如何引入完整的 ShineGisClient23d

#### 完整引入

在 main.js 中写入以下内容(**现版本需同时引入 ElementUI 使用**)：

```javascript
import Vue from 'vue';
import App from './App.vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import ShinegisClient from 'shinegis-client-23d';
import 'shinegis-client-23d/lib/theme-chalk/index.css';
Vue.use(ElementUI);
Vue.use(ShinegisClient);
Vue.config.productionTip = false;

new Vue({
  el: '#app',
  render: (h) => h(App)
});
```

以上代码便完成了 ShineGisClient23d 的引入。需要注意的是，样式文件需要单独引入。

接下来，就可以直接在项目中直接使用所有组件，比如在 App.vue 中可以这样写：

```javascript
<template>
  <div id="app">
    <ShMapEarth>
      <ShLayerSwitcher />
      <ShLayerManager />
    </ShMapEarth>
  </div>
</template>
```

#### 按需引入

在 main.js 中写入以下内容(**现版本需同时引入 ElementUI 使用**)：

```javascript
import Vue from 'vue';
import App from './App.vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);
Vue.config.productionTip = false;

new Vue({
  el: '#app',
  render: (h) => h(App)
});
```

借助 [babel-plugin-component](https://github.com/QingWei-Li/babel-plugin-component)，我们可以只引入需要的组件，以达到减小项目体积的目的。

首先，安装 babel-plugin-component：

```bash
npm install babel-plugin-component -D
```

然后，在 .babelrc 中添加配置：

```json
{
  "plugins": [
    [
      "component",
      {
        "libraryName": "shinegis-client-23d",
        "styleLibraryName": "theme-chalk"
      }
    ]
  ]
}
```

接下来，如果你只希望使用部分组件，比如在 App.vue 中可以这样写：

```javascript
<template>
  <div id="app">
    <MapEarth>
      <LayerSwitcher />
      <LayerManager />
    </MapEarth>
  </div>
</template>

<script>
import { MapEarth, LayerSwitcher, LayerManager } from 'shinegis-client-23d';

export default {
  name: 'App',
  components: {
    MapEarth,
    LayerSwitcher,
    LayerManager
  }
}
</script>
```

### 开始使用

至此，一个基于 Vue 和 ShineGisClient23d 的开发环境已经搭建完毕，现在就可以编写代码了。各个组件的使用方法请参阅它们各自的文档。
