import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login/index.vue'
import 'unocss'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/dashboard/index.vue'),
      redirect: '/dashboard/start',
      children: [
        {
          path: 'start',
          component: () => import('../views/dashboard/start/index'),
        },
      ],
    },
    {
      path: '/knowledge',
      name: 'knowledge',
      component: () => import('../views/knowledge/index.vue'),
      redirect: '/knowledge/',
      children: [
        {
          path: '/knowledge/',
          component: () => import('../views/knowledge/Home.vue'),
        },
        {
          path: '/knowledge/:slug',
          component: () => import('../views/knowledge/Home.vue'),
        },
        {
          path: '/knowledge/:slug/document/:document_slug',
          component: () => import('../views/knowledge/document/index.vue'),
        },
      ],
    },
    {
      path: '/knowledge/:slug/manage',
      component: () => import('../views/knowledge/manage/index.vue'),
      children: [
        {
          path: '/knowledge/:slug/manage/auth',
          component: () => import('../views/knowledge/manage/AuthManage.vue'),
          meta: {
            menuKey: 'auth',
          },
        },
      ],
    },
    // 邀请链接
    {
      path: '/knowledge/:slug/invite',
      component: () => import('../views/knowledge/invite/index.vue'),
    },
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
      const redirectUrl = to.query.redirect as string
      if (redirectUrl) {
        next({ path: redirectUrl })
      } else {
        next()
      }
    }
  }
})

export default router
