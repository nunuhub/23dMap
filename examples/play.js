import Vue from 'vue';
import ShineGisClient23D from 'main/index.js';
import Element from 'element-ui';
import App from './play/index.vue';
import 'packages/theme-chalk/src/index.scss';
import 'element-ui/lib/theme-chalk/index.css';
import './assets/styles/play.css';

Vue.use(ShineGisClient23D);
Vue.use(Element);

new Vue({
  // eslint-disable-line
  render: (h) => h(App)
}).$mount('#app');
