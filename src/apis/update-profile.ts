import HTTP from './http'

const updateProfile = async (id, userInfo) =>
  HTTP.request('/update-profile', {
    method: 'POST',
    data: { id, userInfo }
  })

export default updateProfile
