import HTTP from './http'

const isExitRoom = async latestId =>
  HTTP.request(`/is-exit-room?latestId=${latestId}`)

export default isExitRoom
