import { createStore } from 'vuex'

import authStore from '@/modules/auth/store.js'

import axiosWrapper from '@/util/axiosWrapper.js'


const postPlugin = (store) => { store.$post = axiosWrapper.post }

export default createStore({
  modules: {
    auth: authStore,
  },
  plugins: [postPlugin],
})
