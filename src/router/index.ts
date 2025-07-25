import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/match',
      component: () => import('@/views/Match.vue'),
      children: [
        {
          path: 'chat',
          component: () => import('@/views/Chat.vue')
        },
        {
          path: 'audio-chat',
          component: () => import('@/views/AudioChat.vue')
        },
        {
          path: 'file-transfer',
          component: () => import('@/views/FileTransfer.vue')
        }
      ]
    },
    {
      path: '/room',
      component: () => import('@/views/Room.vue'),
      children: [
        {
          path: 'chat',
          component: () => import('@/views/Chat.vue')
        },
        {
          path: 'audio-chat',
          component: () => import('@/views/AudioChat.vue')
        },
        {
          path: 'file-transfer',
          component: () => import('@/views/FileTransfer.vue')
        }
      ]
    },
    {
      path: '/message-list',
      component: () => import('@/views/MessageList.vue')
    },
    {
      path: '/profile',
      component: () => import('@/views/Profile.vue')
    },
    {
      path: '/login',
      component: () => import('@/views/Login.vue')
    },
    // 404 路由
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

// TODO: 双重认证机制
router.beforeEach(({ path }, _, next) => {
  if (path === '/') {
    location.href = '/docs.html'
    return next(false)
  }

  if (path === '/login') {
    if (localStorage.getItem('token')) {
      router.push('/match')
      return next(false)
    }
  }

  next()
})

export default router
