import Vue from 'vue';
import entry from './app';
import VueRouter from 'vue-router';
import ShineGisClient23D from 'main/index.js';
import Element from 'element-ui';
import hljs from 'highlight.js';
import 'highlight.js/styles/color-brewer.css';
import CodeView from 'vue-code-view';
import routes from './route.config';
import store from './store';
import demoBlock from './components/demo-block';
import MainFooter from './components/footer';
import MainHeader from './components/header';
import SideNav from './components/side-nav';
import FooterNav from './components/footer-nav';
import title from './i18n/title';

import 'packages/theme-chalk/src/index.scss';
import 'element-ui/lib/theme-chalk/index.css';
import './demo-styles/index.scss';
import './assets/styles/common.css';
import './assets/styles/fonts/style.css';
import icon from './icon.json';
import * as sampleData from './assets/data/index';

Vue.use(ShineGisClient23D);
Vue.use(Element);
Vue.use(VueRouter);
Vue.use(CodeView);
Vue.component('DemoBlock', demoBlock);
Vue.component('MainFooter', MainFooter);
Vue.component('MainHeader', MainHeader);
Vue.component('SideNav', SideNav);
Vue.component('FooterNav', FooterNav);

window.$sampleData = sampleData;

Vue.prototype.$icon = icon; // Icon 列表页用

const router = new VueRouter({
  mode: 'hash',
  base: __dirname,
  routes
});

router.afterEach((route) => {
  // https://github.com/highlightjs/highlight.js/issues/909#issuecomment-131686186
  Vue.nextTick(() => {
    const blocks = document.querySelectorAll('pre code:not(.hljs)');
    Array.prototype.forEach.call(blocks, hljs.highlightBlock);
  });
  const data = title[route.meta.lang];
  for (let val in data) {
    if (new RegExp('^' + val, 'g').test(route.name)) {
      document.title = data[val];
      return;
    }
  }
  document.title = 'ShineGisClient23D';
});

new Vue({
  ...entry,
  store,
  router
}).$mount('#app');
