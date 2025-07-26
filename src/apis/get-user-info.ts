import HTTP from './http'

const getUserInfo = async () => HTTP.request('/get-user-info')

export default getUserInfo
