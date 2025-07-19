import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/audio-chat',
      component: () => import('@/views/AudioChat.vue')
    },
    {
      path: '/file-transfer',
      component: () => import('@/views/FileTransfer.vue')
    },
    {
      path: '/chat',
      component: () => import('@/views/Chat.vue')
    },
    // 404 路由
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

router.beforeEach(({ path }, _, next) => {
  if (path === '/') {
    location.href = '/docs.html'
    next(false)
    return
  }

  next()
})

export default router
