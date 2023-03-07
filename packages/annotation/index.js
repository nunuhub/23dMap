import Annotation from './src/main';

/* istanbul ignore next */
Annotation.install = function (Vue) {
  Vue.component(Annotation.name, Annotation);
};

export default Annotation;
