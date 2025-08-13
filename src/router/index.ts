import { createRouter, createWebHistory } from 'vue-router'

// 全局导航栏组件，应该直接静态导入避免加载延迟
import Hall from '@/views/Hall.vue'
import Profile from '@/views/Profile.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/hall',
      meta: { auth: true, tab: 'hall' },
      component: Hall,
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
      meta: { auth: true, tab: 'profile' },
      component: Profile
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
  const { auth, requireRoomId } = meta

  // 未登录状态访问需要 token 的页面，跳转到登录页面
  if (auth === true && !token) {
    return next({ path: '/login' })
  }

  // 登录状态访问登录、重置密码等不需要 token 的页面，禁止访问
  if (auth === false && token) {
    return next({ path: '/hall' })
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
      return next({ path: '/hall' })
    }
  }

  next()
})

export default router
