import useClosePC from './use-close-pc'

import type { Ref } from 'vue'

const useDisconnect = (
  pc: RTCPeerConnection,
  leaved: Ref<boolean>,
  isReconnect: Ref<boolean>
) => {
  // 满员的情况下，不会触发 joined，此时 pc 为 null
  useClosePC(pc)

  // connect 回调中判断出如果是重连，会发送 join
  // socket 连接成功时是重连的前提是双方都没有离开
  if (!leaved.value) {
    isReconnect.value = true
  }
}

export default useDisconnect
