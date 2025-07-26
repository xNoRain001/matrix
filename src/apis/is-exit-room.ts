import HTTP from './http'

const isExitRoom = async (id, latestId) =>
  HTTP.request(`/is-exit-room?id=${id}&latestId=${latestId}`)

export default isExitRoom
