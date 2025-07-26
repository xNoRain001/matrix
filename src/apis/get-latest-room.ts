import HTTP from './http'

const getLatestRoom = async id => HTTP.request(`/get-latest-room?id=${id}`)

export default getLatestRoom
