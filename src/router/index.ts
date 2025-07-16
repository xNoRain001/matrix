import { createRouter, createWebHistory } from 'vue-router'
import OneToOneAudio from '@/views/AudioChat.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: OneToOneAudio
    },
    {
      path: '/file',
      component: () => import('@/views/File.vue')
    },
    {
      path: '/audio-chat',
      component: () => import('@/views/AudioChat.vue')
    },
    // {
    //   path: '/video-chat',
    //   component: () => import('@/views/VideoChat.vue')
    // },
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

export default router
