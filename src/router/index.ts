import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      meta: { auth: true },
      component: () => import('@/views/Index/Index.vue'),
      children: [
        {
          path: 'match-to-chat',
          meta: { requireRoomId: true },
          component: () => import('@/views/Index/MatchToChat.vue')
        },
        {
          path: 'match-to-talk',
          meta: { requireRoomId: true },
          component: () => import('@/views/Index/MatchToTalk.vue')
        }
      ]
    },
    {
      path: '/profile',
      meta: { auth: true },
      component: () => import('@/views/Profile/Index.vue'),
      children: [
        {
          path: 'space',
          component: () => import('@/views/Profile/Space.vue')
        },
        {
          path: 'user-info',
          component: () => import('@/views/Profile/UserInfo.vue')
        },
        {
          path: 'update-password',
          component: () => import('@/views/Profile/UpdatePassword.vue')
        },
        {
          path: 'notifications',
          component: () => import('@/views/Profile/Notifications.vue')
        },
        {
          path: 'data-manager',
          component: () => import('@/views/Profile/DataManager.vue')
        },
        {
          path: 'logoff',
          component: () => import('@/views/Profile/Logoff.vue')
        },
        {
          path: 'theme',
          component: () => import('@/views/Profile/Theme.vue')
        }
      ]
    },
    {
      path: '/messages',
      meta: { auth: true },
      component: () => import('@/views/Messages.vue')
    },
    {
      path: '/contacts',
      meta: { auth: true },
      component: () => import('@/views/Contacts.vue')
    },
    {
      path: '/login',
      meta: { auth: false },
      component: () => import('@/views/Visitor.vue')
    },
    {
      path: '/reset-password',
      meta: { auth: false },
      component: () => import('@/views/ResetPassword.vue')
    },
    {
      path: '/playground',
      meta: { auth: true },
      component: () => import('@/views/Playground.vue')
    },
    // {
    //   path: '/ys',
    //   meta: { auth: true },
    //   component: () => import('@/views/YS.vue')
    // },
    {
      path: '/report',
      meta: { auth: true },
      component: () => import('@/views/Report.vue')
    },
    {
      path: '/feedback',
      meta: { auth: true },
      component: () => import('@/views/Feedback.vue')
    },
    // 404 路由
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

router.beforeEach(({ meta: { auth } }, _, next) => {
  const token = localStorage.getItem('token')

  // 未登录状态访问需要 token 的页面，跳转到登录页面
  if (auth === true && !token) {
    return next({ path: '/login' })
  }

  // 登录状态访问登录、重置密码等不需要 token 的页面，禁止访问
  if (auth === false && token) {
    return next({ path: '/' })
  }

  next()
})

export default router
