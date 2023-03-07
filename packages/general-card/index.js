import GeneralCard from './src/main';

/* istanbul ignore next */
GeneralCard.install = function (Vue) {
  Vue.component(GeneralCard.name, GeneralCard);
};

export default GeneralCard;
