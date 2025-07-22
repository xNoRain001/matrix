import type { Router } from 'vue-router'

const useCancelMatch = (isMatch: boolean, timer: number, router: Router) => {
  if (isMatch) {
    clearTimeout(timer)
    // 不需要发送 exitmatch，因为会断开连接，服务器中会在断开连接回调中移除
  }

  router.push(isMatch ? '/match' : '/room')
}

export default useCancelMatch
