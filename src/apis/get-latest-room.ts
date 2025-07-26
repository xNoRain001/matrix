import HTTP from './http'

const getLatestRoom = async email =>
  HTTP.request(`/get-latest-room?email=${email}`)

export default getLatestRoom
