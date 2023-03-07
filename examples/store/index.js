import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    dialog: {
      current: '',
      scale: 100
    }
  },
  getters: {
    dialogScale: (state) => {
      return state.dialog.scale;
    },
    currentDialog: (state) => {
      return state.dialog.current;
    }
  },
  mutations: {
    SET_DIALOG_SCALE: (state, payload) => {
      state.dialog.scale = payload.scale;
    },
    SET_DIALOG_CURRENT: (state, payload) => {
      state.dialog.current = payload.current;
    }
  },
  actions: {
    setDialogScale(context, payload) {
      context.commit('SET_DIALOG_SCALE', payload);
    },
    setDialogCurrent(context, payload) {
      context.commit('SET_DIALOG_CURRENT', payload);
    }
  }
});
