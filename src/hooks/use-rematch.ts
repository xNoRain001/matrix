import type { Ref } from 'vue'
import type { Router } from 'vue-router'
import useInitSocketForMatch from './use-init-socket-for-match'

const useRematch = async (
  exitRoom: Function,
  initSocket: Function,
  onMatched: Function,
  router: Router,
  isMatch: Ref<boolean>,
  type: 'chat' | 'audio-chat' | 'file-transfer'
) => {
  await exitRoom()
  isMatch.value = true
  router.replace(`/match/${type}`)
  useInitSocketForMatch(initSocket, onMatched, type)
}

export default useRematch
