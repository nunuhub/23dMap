import EarthVideo from './src/main';

/* istanbul ignore next */
EarthVideo.install = function (Vue) {
  Vue.component(EarthVideo.name, EarthVideo);
};

export default EarthVideo;
