import HTTP from './http'

const clearLatestRoom = async email =>
  HTTP.request(`/clear-latest-room?email=${email}`)

export default clearLatestRoom
