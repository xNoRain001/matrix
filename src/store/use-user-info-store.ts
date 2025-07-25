import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'

import type { userInfo } from '@/types'

const useUserInfoStore = defineStore('userInfoStore', () => {
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
    )
  } catch (error) {
    // 没有 token 或者 token 被篡改
    localStorage.removeItem('token')
    useRouter().push('/login')
  }

  return { userInfo: ref<userInfo>(userInfo) }
})

export default useUserInfoStore
