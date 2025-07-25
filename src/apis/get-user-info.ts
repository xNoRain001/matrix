import HTTP from './http'

const getUserInfo = async () => HTTP.request('/get-user-info?a=b')

export default getUserInfo
