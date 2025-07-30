import HTTP from './http'

const getLatestRoom = async () => HTTP.request(`/get-latest-room`)

export default getLatestRoom
