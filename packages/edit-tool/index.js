import EditTool from './src/main';

/* istanbul ignore next */
EditTool.install = function (Vue) {
  Vue.component(EditTool.name, EditTool);
};

export default EditTool;
