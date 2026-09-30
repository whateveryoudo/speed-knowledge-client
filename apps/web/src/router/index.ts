import { createRouter, createWebHistory } from 'vue-router'
import { ensureTiptap } from '#sk-web/plugins/ensureEditors'
function isTokenExpired(token: string) {
  try {
    const tokenObj = JSON.parse(atob(token.split('.')[1] || ''))
    return tokenObj.exp * 1000 < Date.now()
  } catch {
    return false
  }
}
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
              path: 'collect',
              component: () => import('../views/collect/index.vue'),
            },
            {
              path: 'knowledge',
              component: () => import('../views/dashboard/knowledgeMain/index.vue'),
            },
            { path: 'team', component: () => import('../views/team/index.vue') },
            { path: 'team/:team_slug', component: () => import('../views/team/index.vue') },
          ],
        },
        {
          path: '/:team_slug/knowledge',
          name: 'knowledge',
          component: () => import('../views/knowledge/index.vue'),
          redirect: '/:team_slug/knowledge/',
          beforeEnter: async () => {
            await ensureTiptap()
          },
          meta: {
            guestEntry: true,
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
        {
          path: '/organizations/new',
          name: 'createSpace',
          component: () => import('../views/space/CreateSpace.vue'),
        },
      ],
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/login/index.vue'),
    },
  ],
})
const whiteList = ['/login']

router.beforeEach((to, from, next) => {
  const access_token = localStorage.getItem('access_token')
  if (isTokenExpired(access_token || '')) {
    localStorage.removeItem('access_token')
  }
  const valida_token = localStorage.getItem('access_token')
  if (valida_token) {
    if (to.path === '/login') {
      const redirect = (to.query.redirect as string) || '/dashboard'
      next({ path: redirect })
    } else {
      next()
    }
    return
  }

  if (whiteList.includes(to.path) || to.meta.guestEntry) {
    next()
  } else {
    next({ path: '/login', query: { redirect: window.location.pathname + window.location.search } })
  }
})

export default router
