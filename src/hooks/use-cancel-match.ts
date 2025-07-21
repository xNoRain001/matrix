import type { Router } from 'vue-router'

const useCancelMatch = (isMatch: boolean, timer: number, router: Router) => {
  if (isMatch) {
    clearTimeout(timer)
  }

  router.push(isMatch ? '/match' : '/room')
}

export default useCancelMatch
