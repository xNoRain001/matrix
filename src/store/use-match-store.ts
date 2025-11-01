import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { userInfo } from '@/types'
import useUserStore from './use-user-store'
import { useInitLocalStorage } from '@/hooks'

const useMatchStore = defineStore('matchStore', () => {
  const id = useUserStore().userInfo?.id || ''
  const defaultFilter = {
    version: 0,
    activeTab: 'region',
    regionForm: {
      gender: '',
      // age: '',
      province: '',
      city: ''
    },
    collegeForm: {
      college: '',
      // grade: '',
      gender: ''
    },
    gameForm: {
      game: '',
      // age: '',
      gender: ''
    },
    movieForm: {
      movie: '',
      gender: ''
    },
    zodiacSignForm: {
      zodiacSign: '',
      gender: ''
    }
  }
  const _filter = useInitLocalStorage(`filter-${id}`, defaultFilter)

  return {
    matching: ref(false), // 正在匹配中，值为 true 时匹配 modal 会处于打开状态
    offline: ref(false), // 匹配时断网
    hasMatchRes: ref(false), // 最终有匹配结果时值为 true
    noMatch: ref(false), // 暂时没有匹配结果时值为 true
    filter: ref<typeof defaultFilter>(_filter),
    matchRes: ref<
      | (Omit<userInfo, 'tokenVersion' | 'email'> & {
          type: 'chat' | 'voice-chat'
          online: boolean
        })
      | null
    >(JSON.parse(localStorage.getItem(`matchRes-${id}`)) || null) // 匹配结果
  }
})

export default useMatchStore
