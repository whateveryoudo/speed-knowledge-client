import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login/index.vue'
import Dashboard from '../views/dashboard/index.vue'
import "unocss"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
    }
  ],
})

router.beforeEach((to, from, next) => {
  console.log(to, from)
  const whiteList = ['/login']
  if (whiteList.includes(to.path)) {
    next()
  } else {
    const access_token = localStorage.getItem('access_token')
    if (!access_token) {
      next({ path: '/login' })
    } else {
      next()
    }
  }
})

export default router
