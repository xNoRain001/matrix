import HTTP from './http'

const clearLatestRoom = async id => HTTP.request(`/clear-latest-room?id=${id}`)

export default clearLatestRoom
