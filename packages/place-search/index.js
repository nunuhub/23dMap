// import PlaceSearch from './src/main';
// import withConfigComponent from 'shinegis-client-23d/src/mixins/withConfigComponent';
// /* istanbul ignore next */
// const withHocComponent = withConfigComponent(PlaceSearch, {
//   configName: 'PlaceSearch',
//   transform: (data) => {
//     let aa = data;
//     console.warn(aa);
//   }
// });
// withHocComponent.install = function (Vue) {
//   Vue.component(withHocComponent.name, withHocComponent);
// };

// export default withHocComponent;

import PlaceSearch from './src/main';

/* istanbul ignore next */
PlaceSearch.install = function (Vue) {
  Vue.component(PlaceSearch.name, PlaceSearch);
};

export default PlaceSearch;
