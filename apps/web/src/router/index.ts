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
            {
              path: 'public-area',
              component: () => import('../views/dashboard/publicArea/index.vue'),
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
        {
          path: '/space/manage',
          name: 'spaceManage',
          component: () => import('../views/space/manage/index.vue'),
          redirect: '/space/manage/contacts',
          children: [
            {
              path: 'contacts',
              component: () => import('../views/space/manage/contacts/index.vue'),
            },
            {
              path: 'overview',
              component: () => import('../views/space/manage/components/PlaceholderView.vue'),
              props: { title: '空间总览', description: '空间运行数据概览统计建设中，敬请期待！' },
            },
            {
              path: 'permissions',
              component: () => import('../views/space/manage/components/PlaceholderView.vue'),
              props: { title: '权限设置', description: '全局空间角色组与权限策略配置建设中，敬请期待！' },
            },
            {
              path: 'admins',
              component: () => import('../views/space/manage/components/PlaceholderView.vue'),
              props: { title: '管理员设置', description: '空间超级管理员与分级管理员授权建设中，敬请期待！' },
            },
            {
              path: 'team',
              component: () => import('../views/space/manage/components/PlaceholderView.vue'),
              props: { title: '团队管理', description: '空间内部多团队跨组管理建设中，敬请期待！' },
            },
            {
              path: 'security',
              component: () => import('../views/space/manage/components/PlaceholderView.vue'),
              props: { title: '安全中心', description: '安全审计日志与访问风控策略建设中，敬请期待！' },
            },
            {
              path: 'cost',
              component: () => import('../views/space/manage/components/PlaceholderView.vue'),
              props: { title: '费用中心', description: '企业账单、订购套餐与用量配额建设中，敬请期待！' },
            },
            {
              path: 'settings',
              component: () => import('../views/space/manage/components/PlaceholderView.vue'),
              props: { title: '空间设置', description: '空间基本信息设置与高级删除设置建设中，敬请期待！' },
            },
            {
              path: 'statistics',
              component: () => import('../views/space/manage/components/PlaceholderView.vue'),
              props: { title: '数据统计', description: '旗舰版深度知识图谱与文档阅读转化率分析建设中，敬请期待！' },
            },
            {
              path: 'trash',
              component: () => import('../views/space/manage/components/PlaceholderView.vue'),
              props: { title: '回收站', description: '空间已删资源深度留存与撤销恢复中心建设中，敬请期待！' },
            },
          ],
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
