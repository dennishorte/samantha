import { createRouter, createWebHistory } from 'vue-router'

import Home from '@/components/Home'

import authRoutes from '@/modules/auth/router.js'

import authUtil from '@/modules/auth/util.js'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },

    ...authRoutes,
  ]
})


router.beforeEach((to, from, next) => {
  if (to.matched.every(authUtil.canAccess)) {
    next()
  }
  else {
    next({ name: 'Login' })
  }
})


export default router
