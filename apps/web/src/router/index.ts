import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/login/index.vue'
import BasicLayout from '../layouts/BasicLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'basic',
      redirect: '/dashboard',
      component: () => import('../layouts/BasicLayout.vue'),
      children: [

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
            {
              path: 'knowledge',
              component: () => import('../views/dashboard/knowledgeMain/index.vue'),
            },
            { path: 'team/:team_slug', component: () => import('../views/team/index.vue') },
          ],
        },
        {
          path: '/:team_slug/knowledge',
          name: 'knowledge',
          component: () => import('../views/knowledge/index.vue'),
          redirect: '/:team_slug/knowledge/',
          meta: {
            guestEntry: true
          },
          children: [
            {
              path: '/:team_slug/knowledge/',
              component: () => import('../views/knowledge/Home.vue'),
            },
            {
              path: '/:team_slug/knowledge/:knowledge_slug',
              component: () => import('../views/knowledge/Home.vue'),
            },
            {
              path: '/:team_slug/knowledge/:knowledge_slug/document/:document_slug',
              component: () => import('../views/knowledge/document/index.vue'),
            },

          ],
        },
        {
          path: '/:team_slug/knowledge/:knowledge_slug/manage',
          component: () => import('../views/knowledge/manage/index.vue'),
          children: [
            {
              path: '/:team_slug/knowledge/:knowledge_slug/manage/auth',
              component: () => import('../views/knowledge/manage/AuthManage.vue'),
              meta: {
                menuKey: 'auth',
              },
            },
          ],
        },
        // 邀请链接-知识库
        {
          path: '/:team_slug/:resource_type/:knowledge_slug/invite',
          component: () => import('../views/invite/KnowledgeInvite.vue'),
        },
        // 邀请链接-文档
        {
          path: '/:team_slug/:resource_type/:knowledge_slug/:document_slug/invite',
          component: () => import('../views/invite/DocumentInvite.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
  ],
})

router.beforeEach((to, from, next) => {
  console.log(to, from)
  const whiteList = ['/login']
  // 部分页面支持公开页，在页面内部去做权限判断这里不拦截
  if (whiteList.includes(to.path) || to.meta.guestEntry) {
    next()
  } else {
    const access_token = localStorage.getItem('access_token')
    if (!access_token) {
      next({ path: '/login', query: { redirect: window.location.pathname + window.location.search } })
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
