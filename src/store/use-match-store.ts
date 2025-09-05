import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { userInfo } from '@/types'

const useMatchStore = defineStore('matchStore', () => ({
  matching: ref(false), // 正在匹配中，值为 true 时匹配 modal 会处于打开状态
  offline: ref(false), // 匹配时断网
  hasMatchRes: ref(false), // 最终有匹配结果时值为 true
  noMatch: ref(false), // 暂时没有匹配结果时值为 true
  matchType: ref(localStorage.getItem('matchType') || ''), // 匹配类型
  matchRes: ref<Omit<userInfo, 'tokenVersion'> | null>(
    JSON.parse(localStorage.getItem('matchRes')) || null
  ) // 匹配结果
}))

export default useMatchStore
