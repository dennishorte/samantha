import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
//import store from '@/store'

//import authUtil from '@/modules/auth/util.js'
//authUtil.initialize()

// Global Styles
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'

const app = createApp(App)
app.use(router)
//app.use(store)

app.config.compilerOptions.whitespace = 'preserve'
app.config.unwrapInjectedRef = true

// Global function imports
import axiosWrapper from './util/axiosWrapper.js'
app.config.globalProperties.$post = axiosWrapper.post

//import modalWrapper from './util/modal.js'
//app.config.globalProperties.$modal = modalWrapper.getModal


app.mount('#app')
