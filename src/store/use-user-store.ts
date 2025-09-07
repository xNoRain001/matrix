import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Socket } from 'socket.io-client'
import type { userInfo } from '@/types'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'

const useUserStore = defineStore('userStore', () => {
  let userInfo = null

  try {
    userInfo = JSON.parse(
      new TextDecoder().decode(
        new Uint8Array(
          [
            ...atob(
              localStorage
                .getItem('token')
                .split('.')[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/')
            )
          ].map(c => c.charCodeAt(0))
        )
      )
    ).data
  } catch {
    // 没有 token 或者 token 被篡改
    localStorage.removeItem('token')
  }

  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('lg')

  return {
    isMobile,
    globalSocket: ref<Socket | null>(null),
    globalPC: ref<RTCPeerConnection | null>(null),
    userInfo: ref<userInfo | null>(userInfo)
  }
})

export default useUserStore
