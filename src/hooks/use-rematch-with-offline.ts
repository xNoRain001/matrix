import type { Ref } from 'vue'
import useInitSocketForMatch from './use-init-socket-for-match'

const useRematchWithOffline = (
  initSocket: Function,
  onMatched: Function,
  offline: Ref<boolean>,
  type: 'chat' | 'audio-chat' | 'file-transfer'
) => {
  offline.value = false
  useInitSocketForMatch(initSocket, onMatched, type)
}

export default useRematchWithOffline
