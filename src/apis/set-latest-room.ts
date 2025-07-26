import { useUserInfoStore } from '@/store'
import HTTP from './http'

const setLatestRoom = async (path, roomId) =>
  HTTP.request(
    `/set-latest-room?email=${useUserInfoStore().userInfo.email}&path=${path}&roomId=${roomId}`
  )

export default setLatestRoom
