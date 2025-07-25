import HTTP from './http'

const getPublicKey = async () => HTTP.request('/get-public-key')

export default getPublicKey
