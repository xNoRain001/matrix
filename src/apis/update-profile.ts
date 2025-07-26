import HTTP from './http'

const updateProfile = async (email, userInfo) =>
  HTTP.request('/update-profile', {
    method: 'POST',
    data: { email, userInfo }
  })

export default updateProfile
