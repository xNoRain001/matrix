import type { Socket } from 'socket.io-client'

const useBeforeUnmount = (socket: Socket | null) =>
  // 离开时需要手动销毁 socket，才能让它从 matchClients 中移除
  socket && socket.disconnect()

export default useBeforeUnmount
