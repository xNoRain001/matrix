import HTTP from './http'

const clearLatestRoom = async () => HTTP.request(`/clear-latest-room`)

export default clearLatestRoom
