import Vuex from 'vuex';
import { UserStateInterface } from './user/state';
import userModule from './user';
import Vue from 'vue';

export interface StateInterface {
  // Define your own store structure, using submodules if needed
  // example: ExampleStateInterface;
  // Declared as unknown to avoid linting issue. Best to strongly type as per the line above.
  currentUser: UserStateInterface;
}

Vue.use(Vuex);

export default new Vuex.Store<StateInterface>({
  modules: {
    currentUser: userModule,
  },

  // enable strict mode (adds overhead!)
  // for dev mode only
  strict: !!process.env.DEBUGGING,
});
