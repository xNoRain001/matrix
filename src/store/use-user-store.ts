import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Socket } from 'socket.io-client'
import type { userInfo } from '@/types'
import { useBreakpoints, breakpointsTailwind } from '@vueuse/core'
import { useInitLocalStorage } from '@/hooks'

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

  const defaultConfig = {
    version: 0,
    notification: {
      isBeepOpen: true,
      beep: 'beep-1',
      vibration: false,
      messageBanner: false
    },
    theme: {
      sendBtn: false,
      isChatBgOpen: false,
      chatBg: '',
      starsBg: true
    }
  }
  const _config = useInitLocalStorage(
    `config-${userInfo?.id || ''}`,
    defaultConfig
  )
  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('lg')

  return {
    isMobile,
    onlineCount: ref(0),
    globalSocket: ref<Socket | null>(null),
    globalPC: ref<RTCPeerConnection | null>(null),
    userInfo: ref<userInfo | null>(userInfo),
    config: ref<typeof defaultConfig>(_config),
    avatarURL: ref(`${import.meta.env.VITE_OSS_BASE_URL}avatar/${userInfo?.id}`)
  }
})

export default useUserStore
