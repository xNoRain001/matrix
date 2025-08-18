import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      meta: { auth: true },
      component: () => import('@/views/Index.vue'),
      children: [
        {
          path: 'chat',
          meta: { requireRoomId: true },
          component: () => import('@/views/Chat.vue')
        },
        {
          path: 'audio-chat',
          meta: { requireRoomId: true },
          component: () => import('@/views/AudioChat.vue')
        },
        {
          path: 'file-transfer',
          meta: { requireRoomId: true },
          component: () => import('@/views/FileTransfer.vue')
        }
      ]
    },
    {
      path: '/profile',
      meta: { auth: true },
      component: () => import('@/views/Profile/Index.vue'),
      children: [
        // {
        //   path: '',
        //   component: () => import('@/views/Profile/UserInfo.vue')
        // },
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
        }
      ]
    },
    {
      path: '/login',
      meta: { auth: false },
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/reset-password',
      meta: { auth: false },
      component: () => import('@/views/ResetPassword.vue')
    },
    // 404 路由
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

router.beforeEach(({ query, meta }, _, next) => {
  const token = localStorage.getItem('token')
  const { auth, requireRoomId } = meta

  // 未登录状态访问需要 token 的页面，跳转到登录页面
  if (auth === true && !token) {
    return next({ path: '/login' })
  }

  // 登录状态访问登录、重置密码等不需要 token 的页面，禁止访问
  if (auth === false && token) {
    return next({ path: '/' })
  }

  // 没有 roomId 时返回上级路由
  if (requireRoomId && !query.roomId) {
    return next({ path: '/' })
  }

  next()
})

export default router
