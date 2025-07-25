import HTTP from './http'

const updateProfile = async (email, userInfo) =>
  HTTP.request('/register', {
    method: 'POST',
    data: { email, userInfo }
  })

export default updateProfile
