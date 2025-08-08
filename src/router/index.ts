import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/match',
      component: () => import('@/views/Match.vue'),
      meta: { auth: true, tab: 'match' },
      children: [
        {
          path: 'chat',
          meta: { requireRoomId: true, parentPath: '/match' },
          component: () => import('@/views/Chat.vue')
        },
        {
          path: 'audio-chat',
          meta: { requireRoomId: true, parentPath: '/match' },
          component: () => import('@/views/AudioChat.vue')
        },
        {
          path: 'file-transfer',
          meta: { requireRoomId: true, parentPath: '/match' },
          component: () => import('@/views/FileTransfer.vue')
        }
      ]
    },
    {
      path: '/room',
      component: () => import('@/views/Room.vue'),
      meta: { auth: true, tab: 'room' },
      children: [
        {
          path: 'chat',
          meta: { requireRoomId: true, parentPath: '/room' },
          component: () => import('@/views/Chat.vue')
        },
        {
          path: 'audio-chat',
          meta: { requireRoomId: true, parentPath: '/room' },
          component: () => import('@/views/AudioChat.vue')
        },
        {
          path: 'file-transfer',
          meta: { requireRoomId: true, parentPath: '/room' },
          component: () => import('@/views/FileTransfer.vue')
        }
      ]
    },
    {
      path: '/profile',
      meta: { auth: true, tab: 'profile' },
      component: () => import('@/views/Profile.vue')
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

router.beforeEach(({ path, query, meta }, _, next) => {
  const token = localStorage.getItem('token')
  const { auth, requireRoomId, parentPath } = meta

  // 未登录状态访问需要 token 的页面，跳转到登录页面
  if (auth === true && !token) {
    return next({ path: '/login' })
  }

  // 登录状态访问登录、重置密码等不需要 token 的页面，禁止访问
  if (auth === false && token) {
    return next({ path: '/match' })
  }

  if (path === '/') {
    const { redirectTo, token: queryToken } = query

    if (redirectTo && queryToken) {
      // 重定向到指定页面
      return next({ path: `/${redirectTo}`, query: { token: queryToken } })
    } else {
      // vitepress 页面
      location.href = '/docs.html'
      return next(false)
    }
  }

  // 没有 roomId 时返回上级路由
  if (requireRoomId) {
    if (!query.roomId) {
      return next({ path: parentPath as string })
    }
  }

  next()
})

export default router
