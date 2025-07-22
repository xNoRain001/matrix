import type { Router } from 'vue-router'

const useBackPIN = async (exitRoom: Function, router: Router) => {
  await exitRoom()
  router.replace({ query: {} })
}

export default useBackPIN
