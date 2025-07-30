import HTTP from './http'

const setLatestRoom = async (path, roomId: string, latestId: string) =>
  HTTP.request(
    `/set-latest-room?path=${path}&roomId=${roomId}&latestId=${latestId}`
  )

export default setLatestRoom
